"""Background automation helpers (Linux-only provisioning)."""

import logging
import os
import platform
import subprocess
import threading
import time

from backend.services.dns import validate_dns_after_automation, nslookup_resolves
from backend.services.domain import (
    normalize_host_or_url,
    strip_www,
    split_host_port,
    is_dev_environment,
    extract_hostname,
)
from lib.cloudflare_dns import create_dns_record, upsert_dns_record

logger = logging.getLogger(__name__)


def _cloudflare_origin_name_for_hostname(hostname: str) -> str:
    normalized_host = strip_www((hostname or '').strip().lower()).strip('.')
    labels = [label for label in normalized_host.split('.') if label]
    if not labels:
        return ''

    if len(labels) >= 3 and labels[-1] == 'uk' and labels[-2] in {'co', 'org', 'gov', 'ac', 'ltd', 'plc', 'net', 'sch'}:
        return labels[-3]
    if len(labels) >= 2:
        return labels[-2]
    return labels[0]


def resolve_cloudflare_ssl_paths(hostname: str) -> tuple[str, str]:
    origin_name = _cloudflare_origin_name_for_hostname(hostname)
    default_cert = str(os.environ.get('CLOUDFLARE_DEFAULT_CERT_FILE', '/etc/ssl/cloudflare/cloudflare-cert.pem')).strip()
    default_key = str(os.environ.get('CLOUDFLARE_DEFAULT_KEY_FILE', '/etc/ssl/cloudflare/cloudflare-key.pem')).strip()

    if not origin_name:
        return default_cert, default_key

    cert_template = str(os.environ.get('CLOUDFLARE_ORIGIN_CERT_TEMPLATE', '/etc/ssl/cloudflare/{origin}-origin.pem')).strip()
    key_template = str(os.environ.get('CLOUDFLARE_ORIGIN_KEY_TEMPLATE', '/etc/ssl/cloudflare/{origin}-origin.key')).strip()
    cert_path = cert_template.replace('{origin}', origin_name) if cert_template else default_cert
    key_path = key_template.replace('{origin}', origin_name) if key_template else default_key

    # Allow single combined PEM files by falling back to cert path when a dedicated key file is absent.
    if cert_path and not os.path.exists(key_path) and os.path.exists(cert_path):
        key_path = cert_path

    return cert_path or default_cert, key_path or default_key


def maybe_start_linux_brand_automation(brand: dict) -> None:
    """Linux-only automation for preview provisioning (DNS, SSL, Apache, PM2)."""
    try:
        if platform.system() == 'Windows':
            return

        if str(os.environ.get('BRAND_AUTOMATION_DISABLED', '')).strip().lower() in ('1', 'true', 'yes'):
            return

        if not isinstance(brand, dict):
            return

        host = (brand.get('domain') or '').strip()
        if '://' in host:
            try:
                parsed = urlparse(host)
                host = (parsed.netloc or parsed.path or host).strip('/')
            except Exception:
                host = host.split('://', 1)[-1]

        # Preserve the submitted host (including www/hyphens); only strip port.
        host_without_port, _ = split_host_port(host)
        if not host_without_port or '.' not in host_without_port:
            return

        subdomain = host_without_port
        apache_sites_dir = os.environ.get('APACHE_SITES_AVAILABLE_DIR', '/etc/apache2/sites-available')
        next_internal_port = int(os.environ.get('NEXT_INTERNAL_PORT', '4013'))
        ws_internal_port = int(os.environ.get('SUPPORT_WS_PORT', '4001'))
        pm2_app_name = os.environ.get('PM2_NEXT_APP_NAME', 'app-brandstudio')

        def run_cmd(cmd: str) -> int:
            return subprocess.call(cmd, shell=True)

        def automate() -> None:
            try:
                cloudflare_disabled = str(os.environ.get('CLOUDFLARE_DISABLED', '')).strip().lower() in ('1', 'true', 'yes')
                if not cloudflare_disabled:
                    expected_ip = os.environ.get('CLOUDFLARE_IP_ADDRESS', '46.202.140.63')
                    logger.info("Creating Cloudflare DNS record for %s", subdomain)

                    if extract_hostname(f'https://{subdomain}'):
                        ok, addresses, _ = nslookup_resolves(subdomain)
                        if ok:
                            dns_success = upsert_dns_record(subdomain, expected_ip, proxied=True)
                        else:
                            dns_success = upsert_dns_record(subdomain, expected_ip, proxied=True)
                            if not dns_success:
                                logger.warning("Failed to create DNS record for %s; continuing without blocking", subdomain)
                    else:
                        dns_success = False

                    # Do not block on propagation; allow downstream steps to proceed.
                else:
                    logger.info("Cloudflare automation disabled")

                # Skip certbot; rely on managed Cloudflare origin certificates
                logger.info("Skipping certbot; using Cloudflare origin certificate for %s", subdomain)

                vhost_conf = f"""
# HTTP redirect
<VirtualHost *:80>
    ServerName {subdomain}
    ServerAlias www.{subdomain}
    RewriteEngine On
    RewriteRule ^(.*)$ https://%{{HTTP_HOST}}%{{REQUEST_URI}} [L,R=301]
</VirtualHost>

""".lstrip()

                ssl_cert, ssl_key = resolve_cloudflare_ssl_paths(subdomain)

                if os.path.exists(ssl_cert) and os.path.exists(ssl_key):
                    vhost_conf += f"""
<VirtualHost *:443>
    ServerName {subdomain}
    ServerAlias www.{subdomain}
    SSLEngine on
    SSLCertificateFile {ssl_cert}
    SSLCertificateKeyFile {ssl_key}
    Include /etc/letsencrypt/options-ssl-apache.conf
    ProxyPreserveHost On
    ProxyRequests Off
    <Proxy *>
        Require all granted
    </Proxy>
    ProxyPass / http://127.0.0.1:{next_internal_port}/
    ProxyPassReverse / http://127.0.0.1:{next_internal_port}/
    RewriteEngine On
    RewriteCond %{{HTTP:Upgrade}} =websocket [NC]
    RewriteRule /(.*) ws://127.0.0.1:{ws_internal_port}/$1 [P,L]
    ErrorLog ${{APACHE_LOG_DIR}}/{subdomain.replace('.', '_')}_error.log
    CustomLog ${{APACHE_LOG_DIR}}/{subdomain.replace('.', '_')}_access.log combined
</VirtualHost>
""".lstrip()
                else:
                    logger.warning(
                        "Skipping HTTPS vhost for %s; certificate files not found (cert=%s key=%s)",
                        subdomain,
                        ssl_cert,
                        ssl_key,
                    )

                vhost_path = os.path.join(apache_sites_dir, f'{subdomain}.conf')
                with open(vhost_path, 'w', encoding='utf-8') as fd:
                    fd.write(vhost_conf)

                run_cmd(f'a2ensite {subdomain}.conf')
                reload_rc = run_cmd('systemctl reload apache2')
                if reload_rc != 0:
                    logger.warning("apache2 reload failed (rc=%s); attempting restart", reload_rc)
                    restart_rc = run_cmd('systemctl restart apache2')
                    if restart_rc != 0:
                        logger.warning("apache2 restart also failed (rc=%s)", restart_rc)
                    else:
                        logger.info("apache2 restarted after reload failure for %s", subdomain)
                else:
                    logger.info("apache2 reloaded for %s", subdomain)
                logger.info("Apache vhost configured for %s", subdomain)

                pm2_disabled = str(os.environ.get('PM2_RESTART_DISABLED', '')).strip().lower() in ('1', 'true', 'yes')
                if not pm2_disabled:
                    logger.info("Restarting PM2 app: %s", pm2_app_name)
                    run_cmd(f'pm2 restart {pm2_app_name}')
            except Exception as exc:
                logger.warning("Linux automation failed: %s", exc)

        threading.Thread(target=automate, daemon=True).start()
        logger.info("Started Linux automation thread for %s", subdomain)
    except Exception as exc:
        logger.warning("Automation bootstrap failed: %s", exc)


def maybe_restart_pm2_next_linux(*, reason: str, slug: str | None = None) -> None:
    """Restart the Next.js PM2 process after brand updates (Linux)."""
    try:
        if platform.system() == 'Windows':
            return

        if str(os.environ.get('PM2_RESTART_DISABLED', '')).strip().lower() in ('1', 'true', 'yes'):
            return

        pm2_app_name = os.environ.get('PM2_NEXT_APP_NAME', 'app-brandstudio')

        def background_restart() -> None:
            try:
                detail = f" slug={slug}" if slug else ''
                logger.info("[PM2] Restarting %s (%s%s)", pm2_app_name, reason, detail)
                subprocess.call(f'pm2 restart {pm2_app_name}', shell=True)
            except Exception as exc:
                logger.warning("PM2 restart failed: %s", exc)

        threading.Thread(target=background_restart, daemon=True).start()
    except Exception:
        return
