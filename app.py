"""
Brand Dashboard - Python Flask Application
Standalone tool for creating and managing dealership brands
"""

from pathlib import Path
import os
import shutil
from typing import Any, Dict, List, Optional
from datetime import datetime
import time

from flask import Flask, render_template, request, jsonify, redirect, url_for, send_from_directory, session, g
from flask import Response, stream_with_context, jsonify
import json
import threading
from queue import Queue, Empty
import subprocess
try:
    import fcntl  # POSIX-only
except ImportError:
    fcntl = None
import sys
import argparse
import re
import logging
import platform
import pymysql
from urllib.parse import urlparse

from auth import init_auth, auth_manager
from auth_routes import auth_bp
from backend.config import ensure_storage_dirs, PUBLIC_IMAGES_DIR, INVENTORIES_DIR
# NOTE: maybe_start_linux_brand_automation, maybe_restart_pm2_next_linux and
# validate_dns_after_automation each used to be imported from backend/services/*
# but the active implementations live in this file (search for `def ...` below)
# and shadow the imports. Importing them only confused readers. The legacy
# copies in backend/services/automation.py and backend/services/dns.py remain on
# disk for reference but are NOT what the request flow uses.
from backend.services.db import get_db_connection
from backend.services.domain import (
    extract_hostname,
    is_dev_environment,
    is_dev_request_host,
    normalize_domain,
    normalize_host_or_url,
    split_host_port,
    strip_www,
)
from backend.services.dns import nslookup_resolves, dig_resolves
from lib.cloudflare_dns import create_dns_record, upsert_dns_record
from lib.sse_log_handler import SSELogHandler
from backend.services.preview import (
    deep_merge,
    extract_preview_payload,
    get_existing_previews,
    init_db,
    list_previews,
    list_previews_paginated,
    load_preview,
    looks_like_brand_config,
    normalize_brand_colors,
    normalize_brand_services,
    normalize_slug,
    preview_exists,
    preview_store_location,
    strip_internal_fields,
    upsert_preview,
    validate_brand,
    delete_preview_record,
)
from backend.services.theme_catalog import (
    get_theme_catalog,
    get_active_theme_catalog,
    is_theme_disabled,
    resolve_theme_id,
)
from backend.services.extractor import fetch_structured_text

# Simple in-process lock to prevent concurrent AI generations per user/session
_ai_lock_map: dict[str, bool] = {}
_ai_lock_guard = threading.Lock()


def _ai_lock_key() -> str:
    try:
        user = getattr(g, 'user', None)
        if user and isinstance(user, dict) and user.get('email'):
            return f"user:{user['email']}"
    except Exception:
        pass
    return f"ip:{request.remote_addr or 'unknown'}"


def _get_wayback_url(url: str) -> str:
    """Generate Wayback Machine URL for the given website."""
    from datetime import datetime, timedelta
    import random
    
    # Try to get a recent snapshot (within last 6 months)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)
    
    # For simplicity, use a timestamp from about 3 months ago
    target_date = end_date - timedelta(days=random.randint(30, 180))
    timestamp = target_date.strftime("%Y%m%d%H%M%S")
    
    return f"https://web.archive.org/web/{timestamp}/{url}"


def _fetch_from_wayback(url: str) -> dict:
    """Fetch and extract content from Wayback Machine."""
    wayback_url = _get_wayback_url(url)
    print(f"[WAYBACK] Attempting to fetch from: {wayback_url}")
    
    try:
        result = fetch_structured_text(wayback_url)
        print(f"[WAYBACK] Successfully extracted content from archive")
        return result
    except Exception as exc:
        print(f"[WAYBACK] Failed to extract from archive: {exc}")
        raise RuntimeError(f"Wayback Machine extraction failed: {exc}")


def _generate_dealership_seo(brand: dict, url: str = "") -> dict:
    """Generate optimized SEO data specifically for car dealerships."""
    import re
    
    # Extract key information from brand data
    dealer_name = brand.get('name', 'Car Dealership')
    description = brand.get('description', '')
    location = brand.get('location', {})
    services = brand.get('services', {})
    why_choose = brand.get('whyChooseUs', {})
    
    # Extract location for local SEO
    city = ""
    postcode = ""
    if isinstance(location, dict):
        if location.get('address') and isinstance(location['address'], dict):
            city = location['address'].get('city', '')
            postcode = location['address'].get('postcode', '')
        elif location.get('fullAddress'):
            # Extract city and postcode from full address
            addr_match = re.search(r'([A-Z][a-z]+(?: [A-Z][a-z]+)*)', location['fullAddress'])
            if addr_match:
                city = addr_match.group(1)
            postcode_match = re.search(r'([A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2})', location['fullAddress'])
            if postcode_match:
                postcode = postcode_match.group(1)
    
    # Generate comprehensive keywords for car dealerships
    base_keywords = [
        "car dealership", "used cars", "new cars", "car sales", "automotive",
        "car finance", "car financing", "car loan", "car warranty"
    ]
    
    # Add location-based keywords
    location_keywords = []
    if city:
        location_keywords.extend([
            f"cars {city}", f"car dealership {city}", f"used cars {city}",
            f"car sales {city}", f"car finance {city}"
        ])
    if postcode:
        location_keywords.append(f"cars near {postcode}")
    
    # Extract service-specific keywords
    service_keywords = []
    if isinstance(services, dict) and services.get('items'):
        for service in services['items'][:5]:
            if isinstance(service, dict) and service.get('title'):
                title = service['title'].lower()
                if 'finance' in title or 'financing' in title:
                    service_keywords.extend(["car finance", "car financing", "auto finance"])
                elif 'service' in title or 'servicing' in title:
                    service_keywords.extend(["car service", "car servicing", "car repair", "MOT"])
                elif 'warranty' in title:
                    service_keywords.extend(["car warranty", "used car warranty"])
                elif 'parts' in title:
                    service_keywords.extend(["car parts", "auto parts", "genuine parts"])
                elif 'delivery' in title:
                    service_keywords.extend(["car delivery", "home delivery"])
    
    # Extract brand/type specific keywords from description
    brand_keywords = []
    description_lower = description.lower()
    
    # Car brands commonly found in UK dealerships
    car_brands = [
        "bmw", "mercedes", "audi", "volkswagen", "vw", "ford", "vauxhall", "toyota",
        "honda", "nissan", "hyundai", "kia", "mazda", "citroen", "peugeot", "renault",
        "mini", "land rover", "jaguar", "volvo", "skoda", "seat", "mitsubishi",
        "suzuki", "subaru", "lexus", "infiniti", "acura", "porsche", "ferrari",
        "lamborghini", "maserati", "bentley", "rolls royce", "aston martin"
    ]
    
    for brand_name in car_brands:
        if brand_name in description_lower:
            brand_keywords.extend([
                f"{brand_name} dealership", f"used {brand_name}", f"{brand_name} service",
                f"{brand_name} finance", f"{brand_name} warranty"
            ])
    
    # Extract vehicle type keywords
    vehicle_types = {
        "suv": ["suv", "4x4", "4wd"],
        "electric": ["electric", "ev", "hybrid", "plugin"],
        "luxury": ["luxury", "premium", "prestige", "executive"],
        "sports": ["sports", "performance", "coupe", "convertible"],
        "family": ["family", "estate", "mpv", "people carrier"],
        "commercial": ["van", "pickup", "commercial", "business"]
    }
    
    type_keywords = []
    for type_name, keywords in vehicle_types.items():
        if any(keyword in description_lower for keyword in keywords):
            type_keywords.extend([
                f"{type_name} cars", f"used {type_name}", f"{type_name} dealership"
            ])
    
    # Combine all keywords and remove duplicates
    all_keywords = base_keywords + location_keywords + service_keywords + brand_keywords + type_keywords
    unique_keywords = list(dict.fromkeys([kw.strip() for kw in all_keywords if kw.strip()]))
    
    # Generate SEO title
    if city:
        seo_title = f"{dealer_name} | Used Cars & Car Finance in {city}"
    else:
        seo_title = f"{dealer_name} | Quality Used Cars & Car Finance"
    
    # Generate SEO description
    if city:
        seo_description = f"Visit {dealer_name} in {city} for quality used cars, competitive car finance, and professional servicing. Wide selection of vehicles with warranty options."
    else:
        seo_description = f"{dealer_name} offers quality used cars with competitive finance options, professional servicing, and comprehensive warranties. Find your perfect car today."
    
    # Generate additional meta tags
    h1_tag = f"Used Cars in {city}" if city else f"Quality Used Cars at {dealer_name}"
    
    return {
        "title": seo_title[:60],  # Keep under 60 chars for SEO
        "description": seo_description[:160],  # Keep under 160 chars
        "keywords": unique_keywords[:20],  # Top 20 keywords
        "h1": h1_tag,
        "canonical": url if url else "",
        "robots": "index, follow",
        "author": dealer_name,
        "geo_region": "GB",
        "geo_placename": city,
        "geo_position": f"{city}, UK" if city else "United Kingdom",
        "category": "Automotive, Car Dealership",
        "language": "en-GB"
    }


def _acquire_ai_lock() -> bool:
    key = _ai_lock_key()
    with _ai_lock_guard:
        if _ai_lock_map.get(key):
            return False
        _ai_lock_map[key] = True
        return True


def _release_ai_lock():
    key = _ai_lock_key()
    with _ai_lock_guard:
        _ai_lock_map.pop(key, None)
from backend.services.ai_openai import (
    generate_brand as generate_brand_via_openai,
    OpenAIError,
)
from backend.services.storage import (
    allowed_file,
    allowed_inventory_file,
    get_brand_inventory_path,
    save_image_file,
    save_inventory_file,
)
from lib.cloudflare_dns import create_dns_record

# Load environment variables from .env if present (useful for local dev).
try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    pass

# Import authentication system
from auth import init_auth, auth_manager
from auth_routes import auth_bp
from preview_store import PreviewStore
from lib.cloudflare_dns import create_dns_record
from lib.sse_log_manager import sse_log_manager

# Import online checker service
try:
    from services.online_checker_flask import init_flask_app
    ONLINE_CHECKER_AVAILABLE = True
except ImportError:
    ONLINE_CHECKER_AVAILABLE = False
    print("Warning: Online checker service not available. Install requests and pymysql packages.")

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['JSON_SORT_KEYS'] = False
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Disable Flask's built-in caching
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

# Prevent caching for API routes
@app.after_request
def add_cache_control(response):
    """Add cache control headers to prevent caching of API responses"""
    # Only apply to API routes
    if request.path.startswith('/api/'):
        # Aggressive cache control headers
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = 'Thu, 01 Jan 1970 00:00:00 GMT'
        response.headers['Last-Modified'] = datetime.utcnow().strftime('%a, %d %b %Y %H:%M:%S GMT')
        response.headers['ETag'] = f'"{int(time.time())}"'
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Cache-Control, Content-Type, If-Modified-Since, If-None-Match'
        response.headers['Access-Control-Expose-Headers'] = 'Cache-Control, Content-Type, Last-Modified, ETag'
    return response

# Initialize online checker service if available
if ONLINE_CHECKER_AVAILABLE:
    # Set auto-start configuration BEFORE initializing the service
    auto_start_env = os.environ.get('ONLINE_CHECKER_AUTO_START', 'false')
    app.config['ONLINE_CHECKER_AUTO_START'] = auto_start_env.lower() == 'true'
    app = init_flask_app(app)

# Bridge Flask/werkzeug logs into the SSE stream so they show in the Backend Activity modal
def _install_sse_logging():
    handler = SSELogHandler()
    handler.setLevel(logging.INFO)
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s"))

    def _already(logger):
        return any(isinstance(h, SSELogHandler) for h in logger.handlers)

    if not _already(app.logger):
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.INFO)

    werk = logging.getLogger('werkzeug')
    if not _already(werk):
        werk.addHandler(handler)

    root = logging.getLogger()
    if not _already(root):
        root.addHandler(handler)

_install_sse_logging()


# Helpers
def _slugify_name(name: str) -> str:
    """Convert a name to a consistent, hyphen-free slug."""
    if not isinstance(name, str):
        return ''
    cleaned = name.strip().lower()
    # Remove any character that isn't alphanumeric; drop spaces/hyphens
    cleaned = re.sub(r'[^a-z0-9]', '', cleaned)
    return cleaned


def _extract_hostname(value: str) -> str:
    """Proxy to shared extractor to preserve legacy call sites."""
    try:
        return extract_hostname(value)
    except Exception:
        return ''


# Initialize authentication system
init_auth(app)

# Register authentication routes
app.register_blueprint(auth_bp)

# Public images directory - where Next.js serves images from
PUBLIC_IMAGES_DIR = Path(__file__).parent / 'public' / 'images'
PUBLIC_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# App data directory - where inventory files are stored per brand
APP_DATA_DIR = Path(__file__).parent / 'app' / 'data'
APP_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Brand inventories directory - individual JSON files per brand
INVENTORIES_DIR = APP_DATA_DIR / 'inventories'
INVENTORIES_DIR.mkdir(parents=True, exist_ok=True)

preview_store = PreviewStore()

@app.route('/api/dns/check', methods=['GET', 'POST'])
@auth_manager.login_required
def dns_check():
    """
    Check whether a brand hostname resolves via nslookup.
    If not found in production, attempt to create the DNS record automatically.
    Intended for production pre-flight checks.
    """
    payload = request.get_json(silent=True) if request.is_json else {}
    domain = (request.args.get('domain') if request.method == 'GET' else None) or (payload.get('domain') if isinstance(payload, dict) else None)
    domain = (domain or '').strip()

    hostname = _extract_hostname(domain)
    if not hostname:
        return jsonify({'ok': False, 'error': 'Missing/invalid domain', 'domain': domain}), 400

    active_domain_bases = list_active_managed_domain_bases()
    allowed_bases = set(active_domain_bases or [])
    # Backward-compatible default if managed domains are not configured yet.
    allowed_bases.add('carous.co.uk')

    # Safety gate: hostname must be exactly an allowed base or a subdomain of one.
    if not any(hostname == base or hostname.endswith(f'.{base}') for base in allowed_bases):
        return jsonify({
            'ok': False,
            'error': 'Domain must be under an active managed domain',
            'hostname': hostname,
            'allowed_bases': sorted(allowed_bases),
        }), 400

    ok, addresses, raw = nslookup_resolves(hostname)
    
    # If DNS doesn't resolve and we're in production, try to create it
    if not ok:
        is_dev = is_dev_environment() or is_dev_request_host(request.host)
        if not is_dev:
            # Only auto-create for carous zone hostnames; other managed domains are customer-managed.
            if hostname.endswith('.carous.co.uk'):
                print(f"[DNS_CHECK] DNS not found for {hostname}, attempting to create Cloudflare DNS record...")
                dns_created = create_dns_record(hostname)
            else:
                dns_created = False
                print(f"[DNS_CHECK] DNS not found for {hostname}; skipping auto-create (non-carous managed domain).")
            if dns_created:
                # Wait longer for DNS to propagate with multiple attempts
                import time
                max_wait_time = 30  # Wait up to 30 seconds
                check_interval = 5   # Check every 5 seconds
                elapsed = 0
                
                print(f"[DNS_CHECK] Waiting for DNS propagation (up to {max_wait_time}s)...")
                while elapsed < max_wait_time:
                    time.sleep(check_interval)
                    elapsed += check_interval
                    print(f"[DNS_CHECK] Checking DNS resolution... (attempt {elapsed//check_interval + 1})")
                    ok, addresses, raw = nslookup_resolves(hostname)
                    if ok:
                        print(f"[DNS_CHECK] DNS record created and verified for {hostname}")
                        break
                    else:
                        print(f"[DNS_CHECK] DNS not yet propagated after {elapsed}s, waiting...")
                
                if not ok:
                    print(f"[DNS_CHECK] DNS record created but not yet propagated for {hostname} after {max_wait_time}s")
            else:
                # Treat duplicate or deferred creation as non-fatal; return best-effort info
                print(f"[DNS_CHECK] DNS creation skipped/duplicate for {hostname}; returning best-effort status")

    return jsonify({
        'ok': ok,
        'hostname': hostname,
        'addresses': addresses,
        'raw': raw[:2000],
    }), (200 if ok else 404)


def _strip_www(host: str) -> str:
    host = (host or '').strip().lower()
    return host[4:] if host.startswith('www.') else host


def _split_host_port(host: str) -> tuple[str, str]:
    """
    Returns (host_without_port, host_with_port_normalized).

    Note: This is intentionally simple; it covers common host:port and [ipv6]:port.
    """
    host = (host or '').strip().lower()
    if not host:
        return ('', '')

    # IPv6: [::1]:3000
    if host.startswith('[') and ']' in host:
        end = host.find(']')
        ipv6 = host[1:end]
        rest = host[end + 1 :]
        if rest.startswith(':'):
            return (ipv6, f'{ipv6}{rest}')
        return (ipv6, ipv6)

    if ':' in host:
        no_port = host.split(':', 1)[0]
        return (no_port, host)

    return (host, host)


def normalize_host_or_url(value: str) -> str:
    """
    Normalize a host or URL into a host[:port] string.
    - Accepts "example.com", "example.com:3000", "https://example.com/path"
    - Returns "example.com" or "example.com:3000"
    """
    if not isinstance(value, str):
        return ''
    raw = value.strip()
    if not raw:
        return ''

    try:
        parsed = urlparse(raw)
        if parsed.scheme and parsed.netloc:
            raw = parsed.netloc
    except Exception:
        pass

    raw = raw.strip().lower().split('/')[0]
    if '@' in raw:
        raw = raw.split('@', 1)[1]
    return raw


def validate_dns_after_automation(brand: dict, timeout_seconds: int = 30) -> tuple[bool, str]:
    """
    Validate DNS resolution after automation has run.
    
    Args:
        brand: The brand configuration with domain
        timeout_seconds: How long to wait for DNS to propagate
    
    Returns:
        tuple[bool, str]: (success, message)
    """
    try:
        domain_value = brand.get('domain') or ''
        hostname = _extract_hostname(domain_value)
        if not hostname:
            return (False, 'Missing domain for DNS validation')
        
        # Single log at start; suppress per-attempt noise
        print(f"[DNS_VALIDATION] Checking DNS resolution for {hostname} (timeout: {timeout_seconds}s)...")
        
        # Wait for DNS to propagate with multiple attempts
        import time
        for attempt in range(timeout_seconds):
            ok, addresses, raw = nslookup_resolves(hostname)
            if ok:
                print(f"[DNS_VALIDATION] OK: DNS resolved for {hostname} -> {addresses}")
                return (True, f'DNS resolved successfully for {hostname}')
            
            if attempt < timeout_seconds - 1:
                time.sleep(1)
        
        print(f"[DNS_VALIDATION] ERROR: DNS failed to resolve for {hostname} after {timeout_seconds} seconds")
        return (False, f'DNS not resolved for {hostname} after {timeout_seconds} seconds')
        
    except Exception as e:
        print(f"[DNS_VALIDATION] ERROR: DNS validation failed: {e}")
        return (False, f'DNS validation failed: {str(e)}')


def ensure_dns_ready_or_fail(brand: dict, slug: str) -> tuple[bool, str]:
    """
    Ensure the brand domain resolves (or is created) before we declare creation success.
    Returns (ok, message). In dev/local we skip DNS enforcement.
    """
    try:
        host = extract_hostname(brand.get('domain') or '')
        if not host:
            return (False, 'Missing domain for DNS setup')

        if is_dev_environment() or is_dev_request_host(request.host):
            return (True, 'Dev environment - DNS check skipped')

        ok, addresses, _ = nslookup_resolves(host)
        if ok:
            return (True, f'DNS already resolves for {host}')

        # Attempt to create the DNS record (non-fatal if it already exists or creation is delayed)
        created = create_dns_record(host)
        if not created:
            return (True, f'DNS record may already exist or creation deferred for {host}; continuing')

        # Skip propagation wait; DNS may take minutes—allow automation to proceed.
        return (True, f'DNS record created for {host}; propagation may take a few minutes')
    except Exception as exc:
        return (False, f'DNS setup failed: {exc}')


# Brand automation "dev mode" — Windows local-testing path.
# ----------------------------------------------------------
# On Linux production hosts the create / update / delete pipeline runs real
# `a2ensite`, `apache2ctl configtest`, `systemctl reload apache2`, `pm2 restart`
# subprocesses against a real Apache + PM2 stack. None of those tools exist
# (or behave the same) on Windows, so before the 2026-05-07 dev-mode pass the
# automation thread simply bailed via `if platform.system() == 'Windows': return`.
# That meant operators couldn't exercise the orchestration code path at all
# locally — dashboard status badge, lifecycle state machine, vhost template
# rendering, Cloudflare upserts.
#
# Dev mode now lets all of that run end-to-end:
#   - Vhost configs are written to `./dev-vhosts/<subdomain>.conf` (or whatever
#     `DEV_VHOSTS_DIR` points to) so an operator can inspect the rendered output.
#   - Apache / PM2 / systemctl subprocess calls are short-circuited to no-ops
#     that log "[DEV-MODE] would run: ..." with the full command for visibility.
#   - Cloudflare DNS upserts run as normal (the `requests` library is platform-
#     agnostic). To skip them set `CLOUDFLARE_DISABLED=1`, same as production.
#   - The `_automation` lifecycle state still updates so the dashboard polling
#     badge works exactly the same as production.
#
# Dev mode is automatically on when `platform.system() == 'Windows'`. To force
# it on Linux/macOS (e.g. for CI smoke-tests) set `BRAND_AUTOMATION_DEV_MODE=1`.

def _is_brand_automation_dev_mode() -> bool:
    if platform.system() == 'Windows':
        return True
    return str(os.environ.get('BRAND_AUTOMATION_DEV_MODE', '')).strip().lower() in ('1', 'true', 'yes', 'on')


def _resolve_apache_sites_dir() -> str:
    """Where to write the rendered vhost. In production (Linux, no dev override)
    this is `APACHE_SITES_AVAILABLE_DIR` (default /etc/apache2/sites-available).
    In dev mode we redirect to a project-relative `dev-vhosts/` so the operator
    can inspect what would have been deployed without needing root."""
    if _is_brand_automation_dev_mode():
        d = Path(os.environ.get('DEV_VHOSTS_DIR', '').strip() or 'dev-vhosts').expanduser()
        if not d.is_absolute():
            d = (Path(os.getcwd()) / d).resolve()
        try:
            d.mkdir(parents=True, exist_ok=True)
        except Exception as exc:
            print(f"[DEV-MODE] WARN: failed to create dev-vhosts dir {d}: {exc}")
        return str(d)
    return os.environ.get('APACHE_SITES_AVAILABLE_DIR', '/etc/apache2/sites-available')


# Cross-thread lock for the apache+pm2 critical section. Prevents two concurrent
# brand-creates from racing `apache2 reload` / `pm2 restart` and confusing each
# other's configtest output. NOTE: this is per-process — multi-worker gunicorn
# setups still need a file lock (planned follow-up).
import threading as _threading

_automation_critical_lock = _threading.Lock()

# Separate lock for automation-state read-modify-write so a fast-firing series
# of state ticks from the automation thread don't lose updates to each other.
_automation_state_lock = _threading.Lock()


def _cleanup_old_domain_resources(old_host: str, *, slug: str | None = None) -> None:
    """Spawn a daemon thread that removes Apache vhost + Cloudflare DNS for a
    domain that's been replaced by another. Does NOT touch the preview row.

    Used by the update path when an operator changes a brand's domain — we want
    the OLD domain's vhost taken down so it doesn't keep proxying for a name
    the brand no longer claims, and the OLD DNS record removed so Cloudflare
    doesn't keep routing it. The new domain's vhost + DNS are provisioned by
    the regular `maybe_start_linux_brand_automation` call.
    """
    if not old_host:
        return
    is_dev_mode = _is_brand_automation_dev_mode()
    if is_dev_mode:
        # Dev mode: skip the Apache disable + Cloudflare delete subprocess work
        # but log it so operators see the orchestration ran. Returning early
        # is the right call here — there's nothing to "log instead of run"
        # that's useful for the operator (no a2dissite output to inspect).
        print(f"[OLD-DOMAIN-CLEANUP] DEV-MODE: would delete CF DNS + a2dissite for {old_host} (slug={slug}); skipping")
        return

    candidates: list[str] = []
    seen: set[str] = set()

    def _add(value: str) -> None:
        site = (value or '').strip().lower()
        if not site:
            return
        site, _ = split_host_port(site)
        site = site.rstrip('.')
        site = re.sub(r'[^a-z0-9.-]', '', site)
        if site and site not in seen:
            seen.add(site)
            candidates.append(site)

    _add(old_host)
    _add(strip_www(old_host))
    if old_host and '.' in old_host:
        labels = old_host.split('.')
        sanitized_left = labels[0].replace('-', '')
        if sanitized_left and sanitized_left != labels[0]:
            _add('.'.join([sanitized_left] + labels[1:]))

    def _do_cleanup():
        try:
            print(f"[OLD-DOMAIN-CLEANUP] start for {old_host} (slug={slug})")
            try:
                from lib.cloudflare_dns import delete_dns_record
                if not delete_dns_record(old_host):
                    print(f"[OLD-DOMAIN-CLEANUP] WARN: DNS delete returned false for {old_host}")
            except Exception as exc:
                print(f"[OLD-DOMAIN-CLEANUP] ERROR: DNS delete raised: {exc}")

            with _automation_critical_lock:
                apache_sites_available_dir = Path(
                    os.environ.get('APACHE_SITES_AVAILABLE_DIR', '/etc/apache2/sites-available')
                ).expanduser()
                apache_sites_enabled_dir = Path(
                    os.environ.get('APACHE_SITES_ENABLED_DIR', '/etc/apache2/sites-enabled')
                ).expanduser()
                apache_changed = False

                for site in candidates:
                    try:
                        disable_result = subprocess.run(
                            ['a2dissite', f'{site}.conf'],
                            capture_output=True, text=True, timeout=10,
                        )
                        out_l = (
                            f"{disable_result.stdout or ''}\n{disable_result.stderr or ''}"
                        ).lower()
                        if disable_result.returncode == 0:
                            apache_changed = True
                            print(f"[OLD-DOMAIN-CLEANUP] a2dissite OK for {site}")
                        elif any(t in out_l for t in ('already disabled', 'does not exist', 'not found')):
                            pass
                        else:
                            print(
                                f"[OLD-DOMAIN-CLEANUP] WARN: a2dissite {site}: "
                                f"{(disable_result.stderr or disable_result.stdout or '').strip()}"
                            )
                    except Exception as exc:
                        print(f"[OLD-DOMAIN-CLEANUP] WARN: a2dissite {site} raised: {exc}")

                    for config_path in (
                        apache_sites_available_dir / f'{site}.conf',
                        apache_sites_enabled_dir / f'{site}.conf',
                    ):
                        try:
                            if config_path.exists() or config_path.is_symlink():
                                config_path.unlink()
                                apache_changed = True
                                print(f"[OLD-DOMAIN-CLEANUP] removed {config_path}")
                        except Exception as exc:
                            print(f"[OLD-DOMAIN-CLEANUP] WARN: failed to remove {config_path}: {exc}")

                if apache_changed:
                    reload_result = subprocess.run(
                        ['systemctl', 'reload', 'apache2'],
                        capture_output=True, text=True, timeout=10,
                    )
                    if reload_result.returncode != 0:
                        print(f"[OLD-DOMAIN-CLEANUP] WARN: apache reload failed: {reload_result.stderr}")
            print(f"[OLD-DOMAIN-CLEANUP] DONE for {old_host}")
        except Exception as exc:
            print(f"[OLD-DOMAIN-CLEANUP] FATAL: {exc}")
            import traceback
            print(traceback.format_exc())

    threading.Thread(target=_do_cleanup, daemon=True).start()


def _set_automation_state(slug: str, **fields) -> None:
    """Merge fields into the `_automation` block of a preview's config and persist.

    Status updates are intentionally written directly via preview_store (NOT via
    upsert_preview) so they don't re-run normalize_brand_colors / services /
    theme on every state tick. Thread-safe via _automation_state_lock; idempotent;
    silently no-ops if the preview was deleted between read and write — automation
    threads must never raise out of a status update.
    """
    if not slug:
        return
    with _automation_state_lock:
        try:
            row = preview_store.load_row(slug)
            if not row:
                return
            try:
                config = json.loads(row.get('config') or '{}')
            except Exception:
                config = {}
            current = config.get('_automation') if isinstance(config, dict) else None
            if not isinstance(current, dict):
                current = {}
            now_iso = datetime.utcnow().isoformat() + 'Z'
            # Anchor `started_at` the first time we move into pending/provisioning.
            incoming_status = fields.get('status')
            if (
                'started_at' not in current
                and (incoming_status in ('pending', 'provisioning') or current.get('status') in ('pending', 'provisioning'))
            ):
                current['started_at'] = now_iso
            current.update(fields)
            current['updated_at'] = now_iso
            if isinstance(config, dict):
                config['_automation'] = current
            else:
                config = {'_automation': current}
            preview_store.upsert_row(
                slug=slug,
                name=row.get('name') or (config.get('name') if isinstance(config, dict) else slug) or slug,
                created_at=row.get('created_at') or now_iso,
                updated_at=now_iso,
                config_json=json.dumps(config, indent=2, ensure_ascii=False),
            )
        except Exception as exc:
            # Status updates must never break the automation thread.
            print(f"[AUTOMATION_STATE] WARN: failed to update {slug}: {exc}")


def _get_automation_state(slug: str) -> dict:
    """Return the `_automation` block for a preview, or {} if not set."""
    if not slug:
        return {}
    try:
        row = preview_store.load_row(slug)
        if not row:
            return {}
        config = json.loads(row.get('config') or '{}')
        state = config.get('_automation') if isinstance(config, dict) else None
        return state if isinstance(state, dict) else {}
    except Exception:
        return {}


def _pm2_wait_until_online(app_name: str, timeout: int = 30, interval: float = 1.5) -> bool:
    """Poll `pm2 jlist` until the named app reports `online` or the timeout elapses.

    Returns True if the app reaches `online`, False on timeout or any parse error.
    """
    deadline = time.time() + max(1, int(timeout))
    while time.time() < deadline:
        try:
            result = subprocess.run(
                ['pm2', 'jlist'],
                capture_output=True,
                text=True,
                timeout=8,
                check=False,
            )
            if result.returncode == 0 and (result.stdout or '').strip():
                apps = json.loads(result.stdout)
                for app_entry in apps:
                    if not isinstance(app_entry, dict):
                        continue
                    if app_entry.get('name') == app_name:
                        env = app_entry.get('pm2_env') or {}
                        status = env.get('status', '') if isinstance(env, dict) else ''
                        if status == 'online':
                            return True
        except Exception:
            pass
        time.sleep(max(0.25, float(interval)))
    return False


def maybe_start_linux_brand_automation(brand: dict) -> None:
    """
    Linux-only provisioning automation for new previews.

    Intentionally does NOT run `npm run build` anymore. New/updated previews are
    served dynamically via the Flask API at runtime.

    What it may do (best-effort, background thread):
    - certbot certificate generation (optional)
    - write Apache vhost config and enable it
    - reload apache2
    - restart Next.js process via pm2 (optional)

    Disable by setting BRAND_AUTOMATION_DISABLED=1
    """
    import uuid
    import time
    request_id = str(uuid.uuid4())[:8]
    
    # Prevent duplicate automation calls for the same domain within 60 seconds
    domain = brand.get('domain', '').strip()
    if domain:
        current_time = time.time()
        if hasattr(maybe_start_linux_brand_automation, '_recent_calls'):
            if domain in maybe_start_linux_brand_automation._recent_calls:
                last_call = maybe_start_linux_brand_automation._recent_calls[domain]
                if current_time - last_call < 60:
                    print(f"[AUTOMATION] DEBUG: [{request_id}] Skipping duplicate call for domain '{domain}' (last called {current_time - last_call:.1f}s ago)")
                    return
        else:
            maybe_start_linux_brand_automation._recent_calls = {}
        
        maybe_start_linux_brand_automation._recent_calls[domain] = current_time
    
    slug_for_state = (brand.get('slug') or '').strip() if isinstance(brand, dict) else ''
    try:
        print(f"[AUTOMATION] DEBUG: [{request_id}] Starting automation check, platform={platform.system()}")
        print(f"[AUTOMATION] DEBUG: [{request_id}] Brand object received: {brand}")
        print(f"[AUTOMATION] DEBUG: [{request_id}] Brand domain: '{brand.get('domain', 'NO_DOMAIN')}'")
        print(f"[AUTOMATION] DEBUG: [{request_id}] Brand slug: '{brand.get('slug', 'NO_SLUG')}'")

        # Dev mode (Windows or BRAND_AUTOMATION_DEV_MODE=1): the orchestration
        # still runs end-to-end so operators can test the dashboard's status
        # badge, the lifecycle state machine, and the vhost rendering — but
        # the Apache / PM2 / systemctl subprocess calls are short-circuited
        # to no-ops with a "[DEV-MODE] would run: …" log line. Vhost configs
        # are written to ./dev-vhosts/ for inspection rather than
        # /etc/apache2/sites-available. See _is_brand_automation_dev_mode().
        is_dev_mode = _is_brand_automation_dev_mode()
        if is_dev_mode:
            print(f"[AUTOMATION] [{request_id}] DEV MODE — Apache/PM2 calls will be logged not executed; vhost goes to {os.environ.get('DEV_VHOSTS_DIR', './dev-vhosts')}/")

        if str(os.environ.get('BRAND_AUTOMATION_DISABLED', '')).strip().lower() in ('1', 'true', 'yes'):
            print(f"[AUTOMATION] DEBUG: [{request_id}] Skipping - BRAND_AUTOMATION_DISABLED is set")
            _set_automation_state(slug_for_state, status='skipped', step='disabled', message='BRAND_AUTOMATION_DISABLED is set', request_id=request_id)
            return

        if not isinstance(brand, dict):
            print(f"[AUTOMATION] DEBUG: [{request_id}] Skipping - brand is not dict: {type(brand)}")
            return

        domain_value = brand.get('domain') or ''
        print(f"[AUTOMATION] DEBUG: domain_value='{domain_value}'")

        # Preserve user-submitted hostname verbatim; only strip scheme/port for Apache compatibility.
        host_raw = (domain_value or '').strip()
        if '://' in host_raw:
            try:
                parsed = urlparse(host_raw)
                host_raw = (parsed.netloc or parsed.path or host_raw).strip('/')
            except Exception:
                host_raw = host_raw.split('://', 1)[-1]
        host_without_port, _ = _split_host_port(host_raw)
        print(f"[AUTOMATION] DEBUG: normalized host='{host_without_port}'")

        if not host_without_port:
            print("[AUTOMATION] DEBUG: Skipping - no host extracted")
            _set_automation_state(slug_for_state, status='skipped', step='no-host', message='No host extracted from domain field', request_id=request_id)
            return

        # Require a dotted hostname (skip slugs like "fair-deal-motors-uk")
        if not host_without_port or '.' not in host_without_port:
            print("[AUTOMATION] DEBUG: Skipping - invalid hostname (needs a dot)")
            _set_automation_state(slug_for_state, status='skipped', step='invalid-host', message=f'Hostname needs a dot: {host_without_port}', request_id=request_id)
            return

        # Enforce hyphen-free carous subdomains for consistency
        if host_without_port.endswith('.carous.co.uk'):
            left, _, rest = host_without_port.partition('.carous.co.uk')
            sanitized_left = left.replace('-', '')
            if sanitized_left != left:
                print(f"[AUTOMATION] DEBUG: removing hyphens from subdomain '{left}' -> '{sanitized_left}'")
            subdomain = f"{sanitized_left}.carous.co.uk"
        else:
            subdomain = host_without_port

        print(f"[AUTOMATION] DEBUG: FINAL SUBDOMAIN = '{subdomain}' (this should be the only domain processed)")

        # Local-dev base domain short-circuit: if `<slug>.lvh.me` (or any wildcard
        # DNS base in LOCAL_PREVIEW_BASE_DOMAINS), we don't need Apache, Cloudflare,
        # or PM2 — the browser resolves the host to 127.0.0.1 via public DNS, and
        # the Next.js dev server already routes by host header via proxy.ts.
        # Mark the brand provisioned with the preview URL and exit cleanly.
        if _is_local_preview_host(subdomain):
            preview_url = _local_preview_url_for_host(subdomain)
            print(f"[AUTOMATION] [{request_id}] LOCAL-DEV BASE: skipping Apache/CF/PM2 — preview at {preview_url}")
            _set_automation_state(
                slug_for_state,
                status='provisioned',
                step='local-dev-base',
                subdomain=subdomain,
                preview_url=preview_url,
                request_id=request_id,
                message=f'Local preview ready at {preview_url}',
            )
            return

        # Vhost output dir routes to dev-vhosts/ in dev mode, /etc/apache2/sites-available in prod.
        apache_sites_dir = _resolve_apache_sites_dir()
        next_internal_port = int(os.environ.get('NEXT_INTERNAL_PORT', '4013'))
        ws_internal_port = int(os.environ.get('SUPPORT_WS_PORT', '4001'))
        pm2_app_name = os.environ.get('PM2_NEXT_APP_NAME', 'app-brandstudio')

        def run_cmd(cmd: str) -> int:
            """Execute a shell command; in dev mode log it instead and return 0
            (success-equivalent). Used for apache2ctl / a2ensite / a2dissite /
            systemctl reload apache2 / pm2 restart — all of which need a real
            Linux apache+pm2 stack."""
            if is_dev_mode:
                print(f"[DEV-MODE] [{request_id}] would run: {cmd}")
                return 0
            return subprocess.call(cmd, shell=True)

        def render_vhost(subdomain: str, next_port: int, ws_port: int) -> str:
            tpl = resolve_vhost_template_for_hostname(subdomain)
            print(f"[AUTOMATION] DEBUG: using vhost template '{tpl}' for host '{subdomain}'")
            content = tpl.read_text(encoding='utf-8')
            ssl_cert_file, ssl_key_file = resolve_cloudflare_ssl_paths(subdomain)
            print(
                f"[AUTOMATION] DEBUG: using SSL cert='{ssl_cert_file}' key='{ssl_key_file}' for host '{subdomain}'"
            )
            replacements = {
                '{{DOMAIN}}': subdomain,
                '{{DOMAIN_UNDERSCORE}}': subdomain.replace('.', '_'),
                '{{NEXT_PORT}}': str(next_port),
                '{{WS_PORT}}': str(ws_port),
                '{{SSL_CERT_FILE}}': ssl_cert_file,
                '{{SSL_CERT_KEY_FILE}}': ssl_key_file,
            }
            for k, v in replacements.items():
                content = content.replace(k, v)
            # Backward compatibility for templates generated before SSL placeholders existed.
            content = content.replace('/etc/ssl/cloudflare/cloudflare-cert.pem', ssl_cert_file)
            content = content.replace('/etc/ssl/cloudflare/cloudflare-key.pem', ssl_key_file)
            return content

        # `render_vhost_http_only` was removed in the 2026-05-07 audit refactor.
        # It existed to support certbot HTTP-01 challenges (which need port 80 to
        # reach the origin directly, not via Cloudflare proxy). Certbot is no
        # longer used — we serve through Cloudflare origin certs — so the
        # HTTP-only intermediate vhost is dead. The HTTPS vhost rendered by
        # `render_vhost` already includes a port-80 → port-443 redirect block,
        # which is all we need.

        def automate():
            """Provision a brand on Linux: write Apache vhost, upsert DNS (proxied),
            restart PM2 with health verification.

            Sequence (post-2026-05-07 audit refactor):
              1. Apache vhost (HTTPS direct, with shared Cloudflare origin cert).
                 Done first because it's local and fast — DNS pointing at an origin
                 that doesn't yet handle the hostname would 404 from the default vhost.
                 Held under the apache+pm2 critical-section lock.
              2. Cloudflare DNS upsert with proxied=True. Single call (the previous
                 proxy-OFF → wait-for-DNS → proxy-ON dance existed only for
                 certbot HTTP-01 challenges, which are no longer used). One retry
                 on transient failures; final failure logged but doesn't abort —
                 vhost is in place so the operator can fix DNS manually.
              3. PM2 restart with `pm2 jlist` health poll.
            """
            try:
                print(f"[AUTOMATION] [{request_id}] Starting for {subdomain}")
                _set_automation_state(slug_for_state, status='provisioning', step='starting', subdomain=subdomain, request_id=request_id, message='Automation thread started')
                cloudflare_disabled = str(os.environ.get('CLOUDFLARE_DISABLED', '')).strip().lower() in ('1', 'true', 'yes')
                pm2_disabled = str(os.environ.get('PM2_RESTART_DISABLED', '')).strip().lower() in ('1', 'true', 'yes')
                expected_ip = os.environ.get('CLOUDFLARE_IP_ADDRESS', '46.202.140.63')
                vhost_path = os.path.join(apache_sites_dir, f'{subdomain}.conf')

                # STEP 1: Apache vhost (under critical-section lock to prevent
                # concurrent provisions from racing apache2 reload).
                _set_automation_state(slug_for_state, step='apache:awaiting-lock', message='Waiting for apache critical-section lock')
                with _automation_critical_lock:
                    _set_automation_state(slug_for_state, step='apache:rendering-vhost')
                    print(f"[APACHE] [{request_id}] Writing HTTPS vhost for {subdomain}")
                    try:
                        vhost_conf = render_vhost(subdomain, next_internal_port, ws_internal_port)
                    except Exception as render_exc:
                        print(f"[APACHE] [{request_id}] ERROR: vhost render failed: {render_exc}")
                        _set_automation_state(slug_for_state, status='failed', step='apache:render-failed', error=str(render_exc))
                        return

                    try:
                        with open(vhost_path, 'w', encoding='utf-8') as f:
                            f.write(vhost_conf)
                    except Exception as write_exc:
                        print(f"[APACHE] [{request_id}] ERROR: failed to write {vhost_path}: {write_exc}")
                        _set_automation_state(slug_for_state, status='failed', step='apache:write-failed', error=str(write_exc))
                        return
                    print(f"[APACHE] [{request_id}] vhost written: {vhost_path}")

                    run_cmd(f'a2ensite {subdomain}.conf')

                    _set_automation_state(slug_for_state, step='apache:configtest')
                    if run_cmd('apache2ctl configtest') != 0:
                        print(f"[APACHE] [{request_id}] ERROR: configtest failed for {subdomain}; rolling back.")
                        run_cmd(f'a2dissite {subdomain}.conf')
                        try:
                            os.remove(vhost_path)
                        except Exception:
                            pass
                        _set_automation_state(slug_for_state, status='failed', step='apache:configtest-failed', error='apache2ctl configtest failed; vhost rolled back')
                        return

                    _set_automation_state(slug_for_state, step='apache:reload')
                    if run_cmd('systemctl reload apache2') != 0:
                        print(f"[APACHE] [{request_id}] WARN: reload failed; attempting restart")
                        if run_cmd('systemctl restart apache2') != 0:
                            print(f"[APACHE] [{request_id}] ERROR: restart also failed; aborting")
                            _set_automation_state(slug_for_state, status='failed', step='apache:reload-failed', error='systemctl reload + restart both failed')
                            return
                    print(f"[APACHE] [{request_id}] OK: vhost enabled for {subdomain}")
                    _set_automation_state(slug_for_state, step='apache:ok')

                # STEP 2: Cloudflare DNS upsert (proxied). One retry on transient.
                if not cloudflare_disabled:
                    print(f"[CLOUDFLARE] [{request_id}] Upserting DNS for {subdomain} -> {expected_ip} (proxied)")
                    _set_automation_state(slug_for_state, step='dns:upserting')
                    dns_ok = False
                    for attempt in range(2):
                        if upsert_dns_record(subdomain, expected_ip, proxied=True):
                            dns_ok = True
                            break
                        if attempt == 0:
                            print(f"[CLOUDFLARE] [{request_id}] WARN: upsert failed, retrying in 5s")
                            time.sleep(5)
                    if not dns_ok:
                        print(
                            f"[CLOUDFLARE] [{request_id}] ERROR: DNS upsert failed after retry. "
                            f"Apache vhost is in place; brand will not be reachable until "
                            f"Cloudflare record is created manually."
                        )
                        _set_automation_state(slug_for_state, step='dns:failed', dns_status='failed', message='Cloudflare upsert failed twice; vhost is in place but DNS needs manual fix')
                        # Don't abort — operator can fix DNS without losing the vhost.
                    else:
                        _set_automation_state(slug_for_state, step='dns:ok', dns_status='ok')
                else:
                    print(f"[CLOUDFLARE] [{request_id}] Skipping DNS (CLOUDFLARE_DISABLED)")
                    _set_automation_state(slug_for_state, step='dns:skipped', dns_status='skipped')

                # STEP 3: PM2 restart with health verification (also under the lock
                # so concurrent provisions don't pile restarts on top of each other).
                if not pm2_disabled:
                    _set_automation_state(slug_for_state, step='pm2:awaiting-lock')
                    with _automation_critical_lock:
                        _set_automation_state(slug_for_state, step='pm2:restarting')
                        print(f"[PM2] [{request_id}] Restarting Next.js app: {pm2_app_name}")
                        run_cmd(f'pm2 restart {pm2_app_name}')
                        if is_dev_mode:
                            # `pm2 jlist` doesn't exist on Windows, and the
                            # `pm2 restart` call above was already a logged
                            # no-op. Treat as immediately online for the
                            # state machine so the dashboard reaches `live`.
                            print(f"[PM2] [{request_id}] DEV-MODE: skipping pm2 jlist health-check")
                            _set_automation_state(slug_for_state, step='pm2:online', pm2_status='dev-mode')
                        elif _pm2_wait_until_online(pm2_app_name, timeout=int(os.environ.get('PM2_HEALTH_TIMEOUT', '30'))):
                            print(f"[PM2] [{request_id}] OK: {pm2_app_name} is online")
                            _set_automation_state(slug_for_state, step='pm2:online', pm2_status='online')
                        else:
                            print(
                                f"[PM2] [{request_id}] WARN: {pm2_app_name} did not report 'online' "
                                f"within timeout. Check `pm2 logs {pm2_app_name}`."
                            )
                            _set_automation_state(slug_for_state, step='pm2:not-online', pm2_status='timeout', message=f"PM2 app {pm2_app_name} did not return online within timeout")
                else:
                    _set_automation_state(slug_for_state, step='pm2:skipped', pm2_status='skipped')

                print(f"[AUTOMATION] [{request_id}] DONE for {subdomain}")
                _set_automation_state(slug_for_state, status='live', step='complete', message='Provisioning complete')
            except Exception as e:
                print(f"[AUTOMATION] [{request_id}] ERROR: automation failed: {e}")
                import traceback
                print(f"[AUTOMATION] [{request_id}] Traceback: {traceback.format_exc()}")
                _set_automation_state(slug_for_state, status='failed', step='exception', error=str(e))

        _set_automation_state(slug_for_state, status='pending', step='queued', subdomain=subdomain, request_id=request_id)
        thread = threading.Thread(target=automate, daemon=True)
        thread.start()
        print("[AUTOMATION] OK: Linux SSL/Apache/PM2 automation started (no rebuild).")
    except Exception as e:
        print(f"[AUTOMATION] ERROR: Failed to start automation: {e}")
        import traceback
        print(f"[AUTOMATION] ERROR: Traceback: {traceback.format_exc()}")
        _set_automation_state(slug_for_state, status='failed', step='bootstrap-error', error=str(e))
        # Never fail a request because automation setup failed.
        return


def maybe_restart_pm2_next_linux(*, reason: str, slug: str | None = None) -> None:
    """
    Linux: restart the Next.js process via pm2 (no rebuild).

    This is useful when you deploy behind pm2 and want to ensure the running
    process reloads any process-level state after a brand update.

    Dev mode (Windows or BRAND_AUTOMATION_DEV_MODE=1): logs what would have
    been run instead of executing — pm2 isn't installed on Windows and we
    want operators to see the call site fired even if it can't actually
    restart anything.

    Disable entirely by setting PM2_RESTART_DISABLED=1.
    """
    try:
        if str(os.environ.get('PM2_RESTART_DISABLED', '')).strip().lower() in ('1', 'true', 'yes'):
            return

        if _is_brand_automation_dev_mode():
            pm2_app_name = os.environ.get('PM2_NEXT_APP_NAME', 'app-brandstudio')
            detail = f" slug={slug}" if slug else ''
            print(f"[PM2] DEV-MODE: would restart {pm2_app_name} (reason={reason}{detail})")
            return

        pm2_app_name = os.environ.get('PM2_NEXT_APP_NAME', 'app-brandstudio')

        def run():
            try:
                detail = f" slug={slug}" if slug else ""
                print(f"[PM2] Restarting {pm2_app_name} (reason={reason}{detail})")
                subprocess.call(f'pm2 restart {pm2_app_name}', shell=True)
            except Exception as e:
                print(f"[PM2] WARN: restart failed: {e}")

        threading.Thread(target=run, daemon=True).start()
    except Exception:
        return


def _acquire_certbot_lock(timeout: int = 120, path: str = "/tmp/certbot.lock"):
    """
    Best-effort file lock to serialize certbot invocations.
    Returns file descriptor if acquired, else None.
    """
    if fcntl is None:
        # Non-POSIX (e.g., Windows dev); skip locking.
        return None
    try:
        fd = os.open(path, os.O_CREAT | os.O_RDWR, 0o600)
    except Exception:
        return None
    start = time.time()
    while True:
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            return fd
        except BlockingIOError:
            if time.time() - start >= timeout:
                os.close(fd)
                return None
            time.sleep(1)


def _release_certbot_lock(fd):
    try:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)
    except Exception:
        pass


def normalize_slug(raw: str) -> str:
    raw = (raw or '').lower().replace(' ', '')
    raw = re.sub(r'[^a-z0-9-]', '', raw).strip()
    return raw


def parse_bool_flag(value: Any) -> bool:
    """Normalize mixed checkbox/json values to a strict boolean."""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value == 1
    if isinstance(value, str):
        return value.strip().lower() in ('1', 'true', 'yes', 'on')
    return False


def looks_like_brand_config(payload) -> bool:
    if not isinstance(payload, dict):
        return False
    nested_markers = (
        'location',
        'seo',
        'theme',
        'pages',
        'email',
        'api',
        'openingHours',
        'socialLinks',
        'services',
        'whyChooseUs',
        'aaApprovedDealer',
    )
    return any(key in payload for key in nested_markers)


def serialize_preview_row(row):
    """Deserialize a preview row returned from the configured preview store."""
    config = json.loads(row['config'])
    config = normalize_brand_colors(config, overwrite_theme_with_root=False)
    config = normalize_brand_services(config)
    config.setdefault('slug', row['slug'])
    config.setdefault('name', row['name'])
    config['_created_at'] = row['created_at']
    config['_updated_at'] = row['updated_at']

    # Add status column if available
    if 'status' in row:
        config['status'] = row['status']
    else:
        config['status'] = 'offline'  # Default status if not present

    # Local-dev preview URL: when the brand's domain resolves under a wildcard
    # base (lvh.me etc.), expose a directly-clickable URL so the dashboard can
    # link straight to the running Next.js dev server without DNS / hosts edits.
    raw_domain = (config.get('domain') or '').strip()
    if raw_domain:
        host = extract_hostname(raw_domain) or raw_domain.split('/', 1)[0]
        host = strip_www(host).rstrip('.').lower()
        if host and _is_local_preview_host(host):
            config['preview_url'] = _local_preview_url_for_host(host)
            config['preview_url_kind'] = 'local-dev'

    return config


def list_previews():
    """Return all stored preview configs."""
    rows = preview_store.list_rows()
    return [serialize_preview_row(row) for row in rows]

def list_previews_paginated(*, page: int, per_page: int, search: str = ''):
    """Return stored preview configs with pagination."""
    page = max(int(page or 1), 1)
    per_page = max(min(int(per_page or 8), 100), 1)
    offset = (page - 1) * per_page
    total, rows = preview_store.list_paginated_rows(
        limit=per_page,
        offset=offset,
        search=(search or '').strip() or None,
    )
    previews = [serialize_preview_row(row) for row in rows]

    # Debug: Show the order of records being returned
    if rows:
        print(f"🔧 Latest records order (newest created first):")
        for i, row in enumerate(rows[:3]):  # Show first 3 records
            created = row.get('created_at', 'N/A')
            updated = row.get('updated_at', 'N/A')
            print(f"  {i+1}. {row['slug']} - Created: {created}, Updated: {updated}")

    total_pages = max(1, (total + per_page - 1) // per_page)
    if page > total_pages:
        page = total_pages

    return {
        'previews': previews,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': total_pages,
    }


def load_preview(slug):
    """Load a single preview by slug."""
    row = preview_store.load_row(slug)
    if not row:
        return None
    return serialize_preview_row(row)


def preview_exists(slug):
    """Check whether a preview slug exists."""
    return preview_store.exists(slug)


def upsert_preview(slug, config):
    """Insert or update a preview configuration."""
    config = dict(config) if isinstance(config, dict) else {}
    config = normalize_brand_colors(config, overwrite_theme_with_root=True)
    config = normalize_brand_services(config)
    config.setdefault('slug', slug)
    config.setdefault('name', slug.replace('-', ' ').title())
    now = datetime.utcnow().isoformat()
    payload = json.dumps(config, indent=2, ensure_ascii=False)
    preview_store.upsert_row(
        slug=slug,
        name=config['name'],
        created_at=now,
        updated_at=now,
        config_json=payload,
    )


def delete_preview_record(slug):
    """Remove a preview record from the database."""
    preview_store.delete_row(slug)


init_db()

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp'}
ALLOWED_MIME_TYPES = {
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/webp',
}
ALLOWED_INVENTORY_EXTENSIONS = {'json'}


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def allowed_inventory_file(filename: str) -> bool:
    """Check if file is a valid inventory JSON file"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_INVENTORY_EXTENSIONS


def save_image_file(file, slug: str, image_type: str) -> str:
    """
    Save uploaded image file to public/images and return relative path
    image_type: 'logo', 'favicon', or 'heroImage'
    Returns: relative path like '/images/citi-motors-logo.png'
    """
    if not file or not file.filename:
        raise ValueError(f"No file provided for {image_type}")
    
    if not allowed_file(file.filename):
        raise ValueError(f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Get file extension
    original_filename = file.filename
    ext = original_filename.rsplit('.', 1)[1].lower()
    
    # Create filename: {slug}-{type}.{ext}
    if image_type == 'heroImage':
        filename = f"{slug}-hero.{ext}"
    else:
        filename = f"{slug}-{image_type}.{ext}"
    file_path = PUBLIC_IMAGES_DIR / filename
    
    # Ensure directory exists
    PUBLIC_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save file with new name
    file.save(str(file_path))
    
    # Verify file was saved
    if not file_path.exists():
        raise ValueError(f"Failed to save {image_type} file to {file_path}")
    
    # Return relative path for the brand config
    return f"/images/{filename}"



def save_inventory_file(file, slug: str) -> str:
    """
    Save uploaded inventory JSON file for a specific brand
    Returns: relative path like 'inventories/brand-slug-inventory.json'
    """
    if not file or not file.filename:
        raise ValueError("No file provided for inventory")
    
    if not allowed_inventory_file(file.filename):
        raise ValueError(f"File type not allowed. Only JSON files are accepted.")
    
    # Validate JSON format
    try:
        file.seek(0)
        inventory_data = json.load(file)
        if not isinstance(inventory_data, list):
            raise ValueError("Inventory must be a JSON array of vehicles")
        file.seek(0)  # Reset file pointer after reading
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON format: {str(e)}")
    
    # Create filename: {slug}-inventory.json
    filename = f"{slug}-inventory.json"
    file_path = INVENTORIES_DIR / filename
    
    # Ensure directory exists
    INVENTORIES_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save file with new name
    file.save(str(file_path))
    
    # Verify file was saved
    if not file_path.exists():
        raise ValueError(f"Failed to save inventory file to {file_path}")
    
    # Return relative path
    return f"inventories/{filename}"


def get_brand_inventory_path(slug: str) -> Path:
    """Get the path to a brand's inventory file"""
    return INVENTORIES_DIR / f"{slug}-inventory.json"


def brand_has_inventory(slug: str) -> bool:
    """Check if a brand has an inventory file"""
    return get_brand_inventory_path(slug).exists()


def get_existing_previews():
    """Return the list of stored preview slugs."""
    return [preview['slug'] for preview in list_previews()]


def validate_brand(data):
    """Validate brand data"""
    errors = []

    def safe_strip(val):
        return val.strip() if isinstance(val, str) else val

    # Basic identity fields
    if not safe_strip(data.get('name', '')):
        errors.append('Brand name is required')
    if not safe_strip(data.get('slug', '')):
        errors.append('Brand slug is required')
    if not safe_strip(data.get('tagline', '')):
        errors.append('Tagline is required')
    if not safe_strip(data.get('domain', '')):
        errors.append('Domain is required')

    # Check location fields - handle both flat and nested structure
    location = data.get('location', {})
    
    # Accept city and postcode from location.address if not present elsewhere
    address = location.get('address', {}) if isinstance(location, dict) else {}
    city = safe_strip(data.get('city', '') or location.get('city', '') or address.get('city', ''))
    postcode = safe_strip(data.get('postcode', '') or location.get('postcode', '') or address.get('postcode', ''))
    if not city:
        errors.append('City is required')
    if not postcode:
        errors.append('Postcode is required')
    if not safe_strip(data.get('phone', '') or location.get('phone', '')):
        errors.append('Phone is required')
    if not safe_strip(data.get('email', '') or location.get('email', '')):
        errors.append('Email is required')

    # Check SEO fields - handle both flat and nested structure
    seo = data.get('seo', {})
    if not safe_strip(data.get('seoTitle', '') or seo.get('title', '')):
        errors.append('SEO title is required')
    if not safe_strip(data.get('seoDesc', '') or seo.get('description', '')):
        errors.append('SEO description is required')
    
    # Handle keywords - they may be at root or in seo
    keywords = data.get('keywords', None)
    if keywords is None and 'seo' in data:
        keywords = data['seo'].get('keywords', '')
    # Convert 'NOT_FOUND' or empty string to empty list
    if isinstance(keywords, str):
        if keywords.strip().upper() == 'NOT_FOUND' or not keywords.strip():
            keywords = []
        else:
            keywords = [k.strip() for k in keywords.split(',') if k.strip()]
        if 'seo' in data:
            data['seo']['keywords'] = keywords
        else:
            data['keywords'] = keywords
    elif not isinstance(keywords, list):
        keywords = []
        if 'seo' in data:
            data['seo']['keywords'] = keywords
        else:
            data['keywords'] = keywords
    # Now validate
    if not keywords or len(keywords) == 0:
        errors.append('At least one keyword is required')

    # Check theme colors - handle both flat and nested structure
    theme = data.get('theme') if isinstance(data.get('theme'), dict) else {}
    colors = theme.get('colors', {}) if isinstance(theme.get('colors'), dict) else {}
    accent_color = data.get('accentColor', '') or colors.get('accentColor', '')
    if not accent_color:
        errors.append('Accent color is required')
    elif not re.match(r'^#[0-9A-Fa-f]{6}$', accent_color):
        errors.append('Accent color must be a valid hex color (e.g., #d4af37)')

    requested_theme_id = data.get('themeId') or theme.get('id') or theme.get('themeId')
    if requested_theme_id and not resolve_theme_id(requested_theme_id, fallback_to_default=False):
        errors.append('Theme id is invalid or unsupported')

    resolved_theme_id = resolve_theme_id(requested_theme_id, fallback_to_default=True)
    if not isinstance(theme, dict):
        theme = {}
    theme = dict(theme)
    theme['id'] = resolved_theme_id
    theme['themeId'] = resolved_theme_id
    data['theme'] = theme
    data['themeId'] = resolved_theme_id
    data['aaApprovedDealer'] = parse_bool_flag(
        data.get('aaApprovedDealer', data.get('aa_approved_dealer'))
    )
    data.pop('aa_approved_dealer', None)

    return errors



@app.route('/')
def index():
    """Render main dashboard - redirect to login if not authenticated"""
    return redirect(url_for('auth.login'))


@app.route('/dashboard')
# @auth_manager.login_required  # Temporarily disabled to fix redirect loop
def dashboard():
    """Render dashboard page"""
    previews = get_existing_previews()
    return render_template('dashboard.html', preview_count=len(previews))


@app.route('/templates')
# @auth_manager.login_required  # Temporarily disabled to fix redirect loop
def templates():
    """Render templates page"""
    previews = get_existing_previews()
    return render_template('templates.html', preview_count=len(previews))


@app.route('/settings')
@auth_manager.login_required
def settings():
    """Render settings page"""
    previews = get_existing_previews()
    return render_template('settings.html', preview_count=len(previews))


MANAGED_DOMAIN_PATTERN = re.compile(
    r"^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$"
)
MANAGED_DOMAIN_STATUSES = {'active', 'inactive'}

# Public wildcard-DNS services that always resolve `*.<base>` to 127.0.0.1.
# Operators can preview brands at `<slug>.lvh.me:3000` without touching their
# hosts file or running Apache/PM2 — Next.js dev server already handles host
# routing via proxy.ts. Override with `LOCAL_PREVIEW_BASE_DOMAIN` env to pin
# a different base (e.g. nip.io, sslip.io variants).
LOCAL_PREVIEW_BASE_DOMAINS = (
    'lvh.me',
    'localtest.me',
    'localhost.test',
    '127.0.0.1.sslip.io',
    'nip.io',
    'sslip.io',
)


def _local_preview_base_host() -> str:
    """The default local-dev base domain shown in the UI / used for new brands.
    Defaults to `lvh.me`; override via `LOCAL_PREVIEW_BASE_DOMAIN` env."""
    return (os.environ.get('LOCAL_PREVIEW_BASE_DOMAIN', '').strip().lower() or 'lvh.me')


def _is_local_preview_base_domain(domain: str) -> bool:
    """Is `domain` itself a local-dev wildcard-DNS base (e.g. `lvh.me`)?"""
    d = (domain or '').strip().lower().rstrip('.')
    if not d:
        return False
    if d == _local_preview_base_host():
        return True
    return d in LOCAL_PREVIEW_BASE_DOMAINS


def _is_local_preview_host(host: str) -> bool:
    """Is `host` a brand-style hostname under a local-dev base (e.g. `fairfield.lvh.me`)?"""
    h = (host or '').strip().lower().rstrip('.')
    if not h:
        return False
    for base in (_local_preview_base_host(),) + LOCAL_PREVIEW_BASE_DOMAINS:
        if h == base or h.endswith('.' + base):
            return True
    return False


def _local_preview_url_for_host(host: str) -> str:
    """Return `http://<host>:<NEXT_INTERNAL_PORT>` if `host` is a local-dev preview
    hostname; empty string otherwise. Used by brand serialization + dashboard."""
    if not _is_local_preview_host(host):
        return ''
    port = (os.environ.get('NEXT_INTERNAL_PORT', '') or os.environ.get('PORT', '') or '3000').strip()
    return f"http://{host.strip().lower().rstrip('.')}:{port}"


def _normalize_managed_domain(raw_value: Any) -> str:
    raw = str(raw_value or '').strip()
    host = extract_hostname(raw)
    host = strip_www(host).rstrip('.').lower()
    return host


def _is_valid_managed_domain(domain: str) -> bool:
    return bool(MANAGED_DOMAIN_PATTERN.match(domain or ''))


def _serialize_managed_domain_row(row: dict[str, Any]) -> dict[str, Any]:
    def _to_iso(value: Any) -> str:
        if isinstance(value, datetime):
            return value.isoformat()
        if value is None:
            return ''
        return str(value)

    normalized_domain = _normalize_managed_domain(row.get('domain'))
    template_path = _managed_domain_template_path(normalized_domain) if normalized_domain else None

    return {
        'id': row.get('id'),
        'domain': normalized_domain or '',
        'description': row.get('description') or '',
        'status': (row.get('status') or 'active').lower(),
        'created_at': _to_iso(row.get('created_at')),
        'updated_at': _to_iso(row.get('updated_at')),
        'vhost_template_file': template_path.name if template_path else '',
        'vhost_template_ready': bool(template_path and template_path.exists()),
        'is_local_preview_base': _is_local_preview_base_domain(normalized_domain),
    }


def _resolve_project_path(path_value: str, fallback_relative: str = '') -> Path:
    raw = str(path_value or '').strip()
    if not raw and fallback_relative:
        raw = fallback_relative
    candidate = Path(raw).expanduser() if raw else Path(__file__).parent
    if not candidate.is_absolute():
        candidate = Path(__file__).parent / candidate
    return candidate


def _managed_vhost_template_dir() -> Path:
    # Optional override for where per-domain template artifacts are stored.
    configured = os.environ.get('MANAGED_VHOST_TEMPLATE_DIR', '').strip()
    return _resolve_project_path(configured, 'managed_vhost_templates')


def _managed_domain_template_filename(domain: str) -> str:
    normalized = _normalize_managed_domain(domain)
    safe = re.sub(r'[^a-z0-9.-]', '', normalized).strip('.')
    safe = safe.replace('.', '_')
    return f'{safe or "managed_domain"}.vhost_template.conf'


def _managed_domain_template_path(domain: str) -> Path:
    return _managed_vhost_template_dir() / _managed_domain_template_filename(domain)


def _vhost_template_source_candidates() -> list[Path]:
    candidates: list[Path] = []
    raw_values = [
        os.environ.get('APACHE_VHOST_TEMPLATE_SOURCE', ''),
        os.environ.get('APACHE_VHOST_TEMPLATE', ''),
        'vhost_template.conf',
    ]
    seen: set[str] = set()
    for raw in raw_values:
        raw = str(raw or '').strip()
        if not raw:
            continue
        path = _resolve_project_path(raw)
        key = str(path)
        if key in seen:
            continue
        seen.add(key)
        candidates.append(path)
    return candidates


def _default_vhost_template_path() -> Path:
    candidates = _vhost_template_source_candidates()
    for path in candidates:
        if path.exists():
            return path
    # Return the first expected path so callers can raise a clear missing-file error.
    if candidates:
        return candidates[0]
    return Path(__file__).parent / 'vhost_template.conf'


def generate_managed_domain_vhost_template(domain: str, *, overwrite: bool = True) -> Path:
    """Create/update a domain-specific Apache vhost template artifact."""
    normalized = _normalize_managed_domain(domain)
    if not _is_valid_managed_domain(normalized):
        raise ValueError(f'Invalid managed domain: {domain!r}')

    source_path = _default_vhost_template_path()
    if not source_path.exists():
        searched = ', '.join(str(path) for path in _vhost_template_source_candidates())
        raise FileNotFoundError(f'Base vhost template not found. Looked for: {searched}')

    target_dir = _managed_vhost_template_dir()
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = _managed_domain_template_path(normalized)

    if target_path.exists() and not overwrite:
        return target_path

    content = source_path.read_text(encoding='utf-8')
    generated_header = (
        f"# Managed base domain: {normalized}\n"
        f"# Generated by settings automation at {datetime.utcnow().isoformat()}Z\n\n"
    )
    target_path.write_text(generated_header + content, encoding='utf-8')
    app.logger.info("Managed vhost template generated for %s at %s", normalized, target_path)
    return target_path


def delete_managed_domain_vhost_template(domain: str) -> bool:
    normalized = _normalize_managed_domain(domain)
    if not normalized:
        return False
    path = _managed_domain_template_path(normalized)
    if not path.exists():
        return False
    path.unlink()
    return True


def list_managed_domain_bases(*, status: str | None = None) -> list[str]:
    """Return normalized managed domain bases ordered by newest first."""
    try:
        ensure_managed_domains_table()
        connection = get_db_connection()
        if not connection:
            return []

        try:
            with connection.cursor() as cursor:
                where_clause = ''
                params: list[Any] = []
                normalized_status = (status or '').strip().lower()
                if normalized_status in MANAGED_DOMAIN_STATUSES:
                    where_clause = 'WHERE status = %s'
                    params.append(normalized_status)
                cursor.execute(
                    f"""
                    SELECT domain
                    FROM managed_domains
                    {where_clause}
                    ORDER BY created_at DESC, id DESC
                    """,
                    params,
                )
                rows = cursor.fetchall() or []
        finally:
            connection.close()

        bases: list[str] = []
        seen: set[str] = set()
        for row in rows:
            base = _normalize_managed_domain((row or {}).get('domain'))
            if not base or base in seen:
                continue
            seen.add(base)
            bases.append(base)
        return bases
    except Exception:
        return []


def list_active_managed_domain_bases() -> list[str]:
    """Return normalized active managed domain bases ordered by newest first."""
    return list_managed_domain_bases(status='active')


def _extract_managed_base_from_hostname(hostname: str) -> str:
    normalized_host = _normalize_managed_domain(hostname)
    if not normalized_host:
        return ''
    candidates = list_managed_domain_bases()
    matches = [
        base for base in candidates
        if normalized_host == base or normalized_host.endswith(f'.{base}')
    ]
    if not matches:
        return ''
    matches.sort(key=len, reverse=True)
    return matches[0]


def _cloudflare_origin_name_for_hostname(hostname: str) -> str:
    normalized_host = _normalize_managed_domain(hostname)
    if not normalized_host:
        return ''

    managed_base = _extract_managed_base_from_hostname(normalized_host)
    if managed_base:
        return managed_base.split('.', 1)[0]

    labels = [label for label in normalized_host.split('.') if label]
    if len(labels) >= 3 and labels[-1] == 'uk' and labels[-2] in {'co', 'org', 'gov', 'ac', 'ltd', 'plc', 'net', 'sch'}:
        return labels[-3]
    if len(labels) >= 2:
        return labels[-2]
    return labels[0] if labels else ''


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

    # Allow combined PEM (cert+key in same file): if the dedicated key file is
    # missing but the cert file exists, point key at the cert path too.
    if cert_path and not os.path.exists(key_path) and os.path.exists(cert_path):
        key_path = cert_path

    # If the per-origin cert doesn't exist on disk, fall back to the shared
    # default cert. Otherwise apache2ctl configtest fails every time on a
    # brand-new origin and the automation aborts. The default cert is a
    # Cloudflare origin cert valid for *.<base-domain> in our setup.
    if cert_path and not os.path.exists(cert_path) and default_cert and os.path.exists(default_cert):
        cert_path = default_cert
        if not os.path.exists(key_path) and os.path.exists(default_key):
            key_path = default_key

    return cert_path or default_cert, key_path or default_key


def resolve_vhost_template_for_hostname(hostname: str) -> Path:
    """
    Resolve vhost template for a preview hostname.
    Priority:
    1) Managed-domain-specific generated template.
    2) Default global vhost template.
    """
    normalized_host = _normalize_managed_domain(hostname)
    if not normalized_host:
        raise ValueError('Hostname is required to resolve vhost template')

    managed_base = _extract_managed_base_from_hostname(normalized_host)
    if managed_base:
        per_domain_path = _managed_domain_template_path(managed_base)
        if not per_domain_path.exists():
            try:
                per_domain_path = generate_managed_domain_vhost_template(managed_base, overwrite=False)
            except Exception as exc:
                app.logger.warning(
                    "Failed to lazily generate managed vhost template for %s: %s",
                    managed_base,
                    exc,
                )
        if per_domain_path.exists():
            return per_domain_path

    fallback_path = _default_vhost_template_path()
    if fallback_path.exists():
        return fallback_path

    searched = ', '.join(str(path) for path in _vhost_template_source_candidates())
    raise FileNotFoundError(f'Vhost template not found for host {normalized_host}. Looked for: {searched}')


def ensure_managed_domains_table() -> None:
    connection = get_db_connection()
    if not connection:
        raise RuntimeError('Database connection failed')

    try:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS managed_domains (
                    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    domain VARCHAR(255) NOT NULL,
                    description TEXT NULL,
                    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
                    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY uniq_managed_domains_domain (domain)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
                """
            )
            cursor.execute("SHOW COLUMNS FROM managed_domains LIKE 'updated_at'")
            if not cursor.fetchone():
                cursor.execute(
                    """
                    ALTER TABLE managed_domains
                    ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    """
                )

            cursor.execute("SHOW INDEX FROM managed_domains WHERE Key_name = 'idx_managed_domains_status'")
            if not cursor.fetchone():
                cursor.execute("CREATE INDEX idx_managed_domains_status ON managed_domains (status)")

            cursor.execute("SHOW INDEX FROM managed_domains WHERE Key_name = 'idx_managed_domains_created_at'")
            if not cursor.fetchone():
                cursor.execute("CREATE INDEX idx_managed_domains_created_at ON managed_domains (created_at)")
        connection.commit()
    finally:
        connection.close()


@app.route('/api/settings/domains', methods=['GET'])
@auth_manager.login_required
def list_managed_domains():
    """List all domains configured in Settings > Domains."""
    try:
        ensure_managed_domains_table()
        status_filter = (request.args.get('status') or '').strip().lower()
        limit_param = request.args.get('limit', type=int)
        limit = None
        if isinstance(limit_param, int):
            limit = max(1, min(limit_param, 500))

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        try:
            with connection.cursor() as cursor:
                where_clause = ""
                params = []
                if status_filter in MANAGED_DOMAIN_STATUSES:
                    where_clause = "WHERE status = %s"
                    params.append(status_filter)

                sql = (
                    "SELECT id, domain, description, status, created_at, updated_at "
                    f"FROM managed_domains {where_clause} "
                    "ORDER BY created_at DESC, id DESC"
                )
                if limit is not None:
                    sql += " LIMIT %s"
                    params.append(limit)

                cursor.execute(sql, params)
                rows = cursor.fetchall() or []
        finally:
            connection.close()

        domains = [_serialize_managed_domain_row(row) for row in rows]

        local_base = _local_preview_base_host()
        port = (os.environ.get('NEXT_INTERNAL_PORT', '') or os.environ.get('PORT', '') or '3000').strip()
        return jsonify({
            'domains': domains,
            'count': len(domains),
            'local_preview': {
                'base_domain': local_base,
                'next_port': port,
                'url_pattern': f'http://<slug>.{local_base}:{port}',
                'is_dev_mode': _is_brand_automation_dev_mode(),
            },
        }), 200
    except Exception as e:
        app.logger.exception("Failed to list managed domains")
        return jsonify({'error': 'Failed to list managed domains', 'details': str(e)}), 500


@app.route('/api/settings/domains', methods=['POST'])
@auth_manager.login_required
def create_managed_domain():
    """Create a managed domain record."""
    payload = request.get_json(silent=True) if request.is_json else request.form.to_dict()
    payload = payload if isinstance(payload, dict) else {}

    domain = _normalize_managed_domain(payload.get('domain') or payload.get('domainName'))
    if not _is_valid_managed_domain(domain):
        return jsonify({'error': 'Please enter a valid domain name'}), 400

    description = str(payload.get('description') or payload.get('domainDescription') or '').strip()
    if len(description) > 1000:
        return jsonify({'error': 'Description must be 1000 characters or less'}), 400

    status = str(payload.get('status') or 'active').strip().lower()
    if status not in MANAGED_DOMAIN_STATUSES:
        return jsonify({'error': 'Invalid status value'}), 400

    generated_template_path: Path | None = None
    row: dict[str, Any] | None = None
    try:
        ensure_managed_domains_table()
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id FROM managed_domains WHERE LOWER(domain) = LOWER(%s) LIMIT 1",
                    (domain,),
                )
                if cursor.fetchone():
                    return jsonify({'error': 'This domain already exists'}), 409

                # If setting this domain to active, deactivate all others first
                if status == 'active':
                    cursor.execute("UPDATE managed_domains SET status = 'inactive' WHERE status = 'active'")

                cursor.execute(
                    """
                    INSERT INTO managed_domains (domain, description, status, created_at, updated_at)
                    VALUES (%s, %s, %s, NOW(), NOW())
                    """,
                    (domain, description or None, status),
                )
                domain_id = cursor.lastrowid

                cursor.execute(
                    """
                    SELECT id, domain, description, status, created_at, updated_at
                    FROM managed_domains
                    WHERE id = %s
                    """,
                    (domain_id,),
                )
                row = cursor.fetchone()
                generated_template_path = generate_managed_domain_vhost_template(domain, overwrite=True)
                connection.commit()
        finally:
            connection.close()

        return jsonify({
            'success': True,
            'message': 'Domain added successfully',
            'domain': _serialize_managed_domain_row(row or {}),
            'vhost_template': {
                'file': generated_template_path.name if generated_template_path else '',
                'generated': bool(generated_template_path),
            },
        }), 201
    except Exception as e:
        app.logger.exception("Failed to create managed domain")
        return jsonify({'error': 'Failed to create managed domain', 'details': str(e)}), 500


@app.route('/api/settings/domains/<int:domain_id>', methods=['PUT'])
@auth_manager.login_required
def update_managed_domain(domain_id: int):
    """Update a managed domain record."""
    payload = request.get_json(silent=True) if request.is_json else request.form.to_dict()
    payload = payload if isinstance(payload, dict) else {}

    domain_input = payload.get('domain') if 'domain' in payload else payload.get('domainName') if 'domainName' in payload else None
    description_input = payload.get('description') if 'description' in payload else payload.get('domainDescription') if 'domainDescription' in payload else None
    status_input = payload.get('status') if 'status' in payload else None

    if domain_input is None and description_input is None and status_input is None:
        return jsonify({'error': 'No fields provided to update'}), 400

    normalized_domain = None
    if domain_input is not None:
        normalized_domain = _normalize_managed_domain(domain_input)
        if not _is_valid_managed_domain(normalized_domain):
            return jsonify({'error': 'Please enter a valid domain name'}), 400

    normalized_description = None
    if description_input is not None:
        normalized_description = str(description_input or '').strip()
        if len(normalized_description) > 1000:
            return jsonify({'error': 'Description must be 1000 characters or less'}), 400

    normalized_status = None
    if status_input is not None:
        normalized_status = str(status_input or '').strip().lower()
        if normalized_status not in MANAGED_DOMAIN_STATUSES:
            return jsonify({'error': 'Invalid status value'}), 400

    previous_domain = ''
    next_domain = ''
    generated_template_path: Path | None = None
    updated_row: dict[str, Any] | None = None
    try:
        ensure_managed_domains_table()
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    SELECT id, domain, description, status, created_at, updated_at
                    FROM managed_domains
                    WHERE id = %s
                    """,
                    (domain_id,),
                )
                existing = cursor.fetchone()
                if not existing:
                    return jsonify({'error': 'Domain not found'}), 404

                previous_domain = _normalize_managed_domain(existing.get('domain'))
                next_domain = normalized_domain if normalized_domain is not None else existing.get('domain')
                next_description = normalized_description if description_input is not None else (existing.get('description') or '')
                next_status = normalized_status if normalized_status is not None else (existing.get('status') or 'active')

                cursor.execute(
                    """
                    SELECT id FROM managed_domains
                    WHERE LOWER(domain) = LOWER(%s) AND id <> %s
                    LIMIT 1
                    """,
                    (next_domain, domain_id),
                )
                if cursor.fetchone():
                    return jsonify({'error': 'This domain already exists'}), 409

                # If setting this domain to active, deactivate all others first
                if next_status == 'active' and existing.get('status') != 'active':
                    cursor.execute("UPDATE managed_domains SET status = 'inactive' WHERE status = 'active' AND id <> %s", (domain_id,))

                cursor.execute(
                    """
                    UPDATE managed_domains
                    SET domain = %s, description = %s, status = %s, updated_at = NOW()
                    WHERE id = %s
                    """,
                    (next_domain, next_description or None, next_status, domain_id),
                )

                cursor.execute(
                    """
                    SELECT id, domain, description, status, created_at, updated_at
                    FROM managed_domains
                    WHERE id = %s
                    """,
                    (domain_id,),
                )
                updated_row = cursor.fetchone()
                generated_template_path = generate_managed_domain_vhost_template(next_domain, overwrite=True)
                connection.commit()
        finally:
            connection.close()

        old_template_removed = False
        if previous_domain and previous_domain != _normalize_managed_domain(next_domain):
            try:
                old_template_removed = delete_managed_domain_vhost_template(previous_domain)
            except Exception as cleanup_exc:
                app.logger.warning(
                    "Managed domain updated but old template cleanup failed for %s: %s",
                    previous_domain,
                    cleanup_exc,
                )

        return jsonify({
            'success': True,
            'message': 'Domain updated successfully',
            'domain': _serialize_managed_domain_row(updated_row or {}),
            'vhost_template': {
                'file': generated_template_path.name if generated_template_path else '',
                'generated': bool(generated_template_path),
            },
            'old_template_removed': old_template_removed,
        }), 200
    except Exception as e:
        app.logger.exception("Failed to update managed domain")
        return jsonify({'error': 'Failed to update managed domain', 'details': str(e)}), 500


@app.route('/api/settings/domains/<int:domain_id>', methods=['DELETE'])
@auth_manager.login_required
def delete_managed_domain(domain_id: int):
    """Delete a managed domain record."""
    existing: dict[str, Any] | None = None
    try:
        ensure_managed_domains_table()
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT id, domain FROM managed_domains WHERE id = %s",
                    (domain_id,),
                )
                existing = cursor.fetchone()
                if not existing:
                    return jsonify({'error': 'Domain not found'}), 404

                cursor.execute("DELETE FROM managed_domains WHERE id = %s", (domain_id,))
                connection.commit()
        finally:
            connection.close()

        removed_template = False
        try:
            removed_template = delete_managed_domain_vhost_template(existing.get('domain') if existing else '')
        except Exception as cleanup_exc:
            app.logger.warning(
                "Managed domain deleted but template cleanup failed for %s: %s",
                (existing or {}).get('domain'),
                cleanup_exc,
            )

        return jsonify({
            'success': True,
            'message': 'Domain removed successfully',
            'deleted': {'id': domain_id, 'domain': existing.get('domain')},
            'vhost_template_removed': removed_template,
        }), 200
    except Exception as e:
        app.logger.exception("Failed to delete managed domain")
        return jsonify({'error': 'Failed to delete managed domain', 'details': str(e)}), 500


@app.route('/help')
@auth_manager.login_required
def help():
    """Render help page"""
    previews = get_existing_previews()
    return render_template('help.html', preview_count=len(previews))


@app.route('/docs/themes')
@auth_manager.login_required
def theme_documentation():
    """Render theme contract documentation page"""
    previews = get_existing_previews()
    return render_template('theme-docs.html', preview_count=len(previews))


@app.route('/create')
@auth_manager.login_required
def create():
    """Render brand creation page"""
    previews = get_existing_previews()
    # Pass a truthy empty-ish object so the update-style form renders in create mode.
    theme_catalog = get_theme_catalog()
    brand_data = {
        'slug': '',
        'name': '',
        'domain': '',
        'themeId': theme_catalog.get('defaultTheme', 'classic-dealer'),
    }
    return render_template(
        'index.html',
        preview_count=len(previews),
        brand_data=brand_data,
        create_mode=True,
        theme_catalog=theme_catalog,
    )


@app.route('/api/ai/brand', methods=['POST'])
@auth_manager.login_required
def generate_brand_via_ai():
    """Generate structured brand data via OpenAI."""
    if not _acquire_ai_lock():
        return jsonify({'error': 'AI generation already in progress'}), 429

    payload = request.get_json(silent=True) or {}
    context = (payload.get('context') or '').strip()
    website = (payload.get('website') or '').strip()
    reuse_existing = payload.get('reuse_existing', False)  # Allow reusing existing AI data
    preferred_theme_id = resolve_theme_id(
        payload.get('themeId') or payload.get('theme_id') or payload.get('preferredThemeId'),
        fallback_to_default=True,
    )

    scopes_raw = payload.get('scopes')
    scopes: list[str] = []
    if isinstance(scopes_raw, str):
        scopes = [s.strip().lower() for s in scopes_raw.split(',') if s.strip()]
    elif isinstance(scopes_raw, list):
        scopes = [str(s).strip().lower() for s in scopes_raw if str(s).strip()]

    if not context and not website:
        return jsonify({'error': 'Provide brand context or website'}), 400

    try:
        result = generate_brand_via_openai(
            context=context,
            website=website,
            scopes=scopes,
            preferred_theme_id=preferred_theme_id,
        )
        brand = result.get('brand', {}) if isinstance(result, dict) else {}

        if not isinstance(brand, dict):
            return jsonify({'error': 'Unexpected brand payload from model'}), 502

        # Normalize slug and keywords
        if not brand.get('slug'):
            brand['slug'] = _slugify_name(brand.get('name', ''))

        # Generate optimized SEO data specifically for car dealerships
        auto_seo = _generate_dealership_seo(brand, website)
        
        # Merge AI-generated SEO with our optimized dealership SEO
        existing_seo = brand.get('seo', {}) if isinstance(brand.get('seo'), dict) else {}
        
        # Use our auto-generated SEO as primary, but preserve any specific AI insights
        merged_seo = {
            'title': auto_seo['title'],
            'description': auto_seo['description'],
            'keywords': auto_seo['keywords'],
            'twitterHandle': existing_seo.get('twitterHandle', ''),
            'country': 'GB',
            # Additional SEO meta tags
            'h1': auto_seo['h1'],
            'canonical': auto_seo['canonical'],
            'robots': auto_seo['robots'],
            'author': auto_seo['author'],
            'geo_region': auto_seo['geo_region'],
            'geo_placename': auto_seo['geo_placename'],
            'geo_position': auto_seo['geo_position'],
            'category': auto_seo['category'],
            'language': auto_seo['language']
        }
        
        brand['seo'] = merged_seo

        # Preserve existing keyword normalization logic
        if isinstance(existing_seo.get('keywords'), str):
            keywords_raw = existing_seo['keywords']
            additional_keywords = [k.strip() for k in re.split(r'[,\n]+', keywords_raw) if k.strip()]
            # Merge with our auto-generated keywords, avoiding duplicates
            all_keywords = list(dict.fromkeys(merged_seo['keywords'] + additional_keywords))
            brand['seo']['keywords'] = all_keywords[:25]  # Keep top 25 keywords

        theme = brand.get('theme') if isinstance(brand.get('theme'), dict) else {}
        model_theme_id = theme.get('id') or theme.get('themeId')
        resolved_theme_id = resolve_theme_id(
            preferred_theme_id or model_theme_id,
            fallback_to_default=True,
        )
        theme['id'] = resolved_theme_id
        theme['themeId'] = resolved_theme_id
        brand['theme'] = theme
        brand['themeId'] = resolved_theme_id

        colors = theme.get('colors') if isinstance(theme.get('colors'), dict) else {}
        accent = colors.get('accentColor')
        if accent:
            brand.setdefault('accentColor', accent)

        # Run validation
        errors = validate_brand(deep_merge({}, brand))
        return jsonify({
            'brand': brand, 
            'warnings': errors or [],
            'seo_optimized': True,
            'seo_keywords_count': len(brand['seo']['keywords']),
            'seo_location_targeting': bool(auto_seo['geo_placename'])
        })
    except OpenAIError as exc:
        return jsonify({'error': str(exc)}), 502
    except Exception as exc:  # pragma: no cover - unexpected errors
        return jsonify({'error': f'AI generation failed: {exc}'}), 502
    finally:
        _release_ai_lock()


def _load_theme_manifest():
    """Read theme/theme-manifest.json and return the list of theme entries."""
    manifest_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'theme', 'theme-manifest.json')
    try:
        with open(manifest_path, 'r', encoding='utf-8') as fh:
            data = json.load(fh) or {}
        themes = data.get('themes') or []
        if not isinstance(themes, list):
            themes = []
        return [t for t in themes if isinstance(t, dict) and t.get('id')]
    except Exception as exc:
        print(f'[THEME_MANIFEST] failed to load: {exc}')
        return [{'id': 'classic-dealer', 'name': 'Classic Dealer'}]


@app.route('/update/<slug>')
@auth_manager.login_required
def update_preview_page(slug):
    """Render preview update page with stored configuration"""
    previews = get_existing_previews()
    preview_data = load_preview(slug)
    if not preview_data:
        return render_template('404.html', message=f'Preview {slug} not found'), 404

    preview_data.setdefault('edit_mode', True)
    return render_template(
        'update.html',
        preview_data=preview_data,
        brand_data=preview_data,
        available_themes=_load_theme_manifest(),
    )


@app.route('/api/extract-website', methods=['POST'])
@auth_manager.login_required
def extract_website_content():
    """Extract structured text from a website URL for AI seeding."""
    payload = request.get_json(silent=True) or {}
    url = (payload.get('url') or '').strip()

    if not url:
        return jsonify({'error': 'Website URL is required'}), 400
    if not (url.startswith('http://') or url.startswith('https://')):
        return jsonify({'error': 'Invalid URL format. URL must start with http:// or https://'}), 400

    try:
        result = fetch_structured_text(url)
        return jsonify({
            'content': result.get('text', ''),
            'meta': {
                'title': result.get('title', ''),
                'description': result.get('description', ''),
                'keywords': result.get('keywords', ''),
                'headings': result.get('headings', []),
            },
            'source': 'website'
        })
    except Exception as exc:
        # Fallback to Wayback Machine when website extraction fails
        print(f"[WEBSITE_EXTRACTION] Failed to extract from {url}: {exc}")
        print(f"[WEBSITE_EXTRACTION] Falling back to Wayback Machine")
        
        try:
            # Try to fetch from Wayback Machine
            wayback_result = _fetch_from_wayback(url)
            
            return jsonify({
                'content': wayback_result.get('text', ''),
                'meta': {
                    'title': wayback_result.get('title', ''),
                    'description': wayback_result.get('description', ''),
                    'keywords': wayback_result.get('keywords', ''),
                    'headings': wayback_result.get('headings', []),
                },
                'source': 'wayback_machine',
                'fallback_reason': f"Direct website extraction failed: {str(exc)}"
            })
            
        except Exception as wayback_exc:
            print(f"[WEBSITE_EXTRACTION] Wayback Machine fallback also failed: {wayback_exc}")
            return jsonify({
                'error': f'Website extraction failed and Wayback Machine unavailable: {str(exc)}',
                'fallback_error': str(wayback_exc)
            }), 502


@app.route('/api/previews', methods=['GET'])
@auth_manager.login_required
def get_previews():
    """Return stored preview configs."""
    page_param = request.args.get('page')
    per_page_param = request.args.get('per_page')
    search_param = request.args.get('q') or request.args.get('search') or ''
    
    # Current timestamp for when data was fetched
    current_timestamp = datetime.utcnow().isoformat() + 'Z'
    current_unix_timestamp = int(time.time())

    if page_param or per_page_param or search_param:
        payload = list_previews_paginated(
            page=int(page_param or 1),
            per_page=int(per_page_param or 8),
            search=search_param,
        )
        return jsonify({
            'previews': payload['previews'],
            'count': len(payload['previews']),
            'total': payload['total'],
            'page': payload['page'],
            'per_page': payload['per_page'],
            'total_pages': payload['total_pages'],
            'location': preview_store.location(),
            'timestamp': current_timestamp,
            'unix_timestamp': current_unix_timestamp,
            'fetched_at': current_timestamp,
        })

    previews = list_previews()
    return jsonify({
        'previews': previews,
        'count': len(previews),
        'total': len(previews),
        'page': 1,
        'per_page': len(previews),
        'total_pages': 1,
        'location': preview_store.location(),
        'timestamp': current_timestamp,
        'unix_timestamp': current_unix_timestamp,
        'fetched_at': current_timestamp,
    })


@app.route('/api/previews/resolve', methods=['GET'])
def resolve_preview_by_domain():
    """
    Resolve a preview by request host/domain.

    This enables dynamic multi-tenant lookups in production without rebuilds.
    Public endpoint: Next.js runtime must call this without dashboard auth cookies.
    Pass either:
      - ?host=example.com:3000
      - ?domain=https://example.com
    """
    host_param = request.args.get('host') or request.args.get('domain') or ''
    request_host = normalize_host_or_url(host_param)
    if not request_host:
        return jsonify({'error': 'Missing host/domain query param'}), 400

    req_no_www = _strip_www(request_host)
    req_no_port, req_host_port = _split_host_port(req_no_www)
    candidates = {req_no_www, req_no_port, req_host_port, _strip_www(req_no_port)}
    candidates = {c for c in candidates if c}

    # Small dataset: scan configs and match against stored brand.domain.
    for preview in list_previews():
        domain_value = preview.get('domain') or ''
        domain_host = normalize_host_or_url(domain_value)
        if not domain_host:
            continue

        dom_no_www = _strip_www(domain_host)
        dom_no_port, dom_host_port = _split_host_port(dom_no_www)
        dom_candidates = {dom_no_www, dom_no_port, dom_host_port, _strip_www(dom_no_port)}
        dom_candidates = {c for c in dom_candidates if c}

        if candidates.intersection(dom_candidates):
            return jsonify({'preview': preview}), 200

    return jsonify({'error': f'No preview configured for "{request_host}"'}), 404


@app.route('/api/themes', methods=['GET'])
@auth_manager.login_required
def get_themes():
    """Return ACTIVE preview themes (disabled themes filtered out).

    Used by the /create page's theme picker. Admin surfaces that need the full
    catalog (including disabled themes) should hit `/api/themes/admin`.
    """
    catalog = get_active_theme_catalog()
    return jsonify({
        'themes': catalog.get('themes', []),
        'defaultTheme': catalog.get('defaultTheme'),
        'version': catalog.get('version'),
    }), 200


# -----------------------------------------------------------------------------
# Theme administration (/templates page backend)
# -----------------------------------------------------------------------------

# Default theme is structurally important — brand-creation falls back to it,
# every catalog method relies on it resolving. Don't allow disabling/deleting.
_PROTECTED_THEME_IDS = {'classic-dealer'}


def _themes_root() -> str:
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app', 'themes')


def _public_themes_root() -> str:
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'themes')


def _theme_meta_path(theme_id: str) -> str:
    return os.path.join(_themes_root(), theme_id, 'theme.json')


def _theme_folder_path(theme_id: str) -> str:
    return os.path.join(_themes_root(), theme_id)


def _public_theme_path(theme_id: str) -> str:
    return os.path.join(_public_themes_root(), theme_id)


def _validate_theme_id(raw: str) -> Optional[str]:
    """Constrain to safe slug characters before any filesystem access."""
    candidate = str(raw or '').strip().lower()
    if not candidate or not re.match(r'^[a-z0-9][a-z0-9-]{0,62}$', candidate):
        return None
    return candidate


def _read_theme_meta(theme_id: str) -> Optional[Dict[str, Any]]:
    path = _theme_meta_path(theme_id)
    if not os.path.exists(path):
        return None
    try:
        with open(path, 'r', encoding='utf-8') as fh:
            return json.load(fh) or {}
    except Exception as exc:
        print(f'[THEME_ADMIN] failed reading {path}: {exc}')
        return None


def _write_theme_meta(theme_id: str, meta: Dict[str, Any]) -> bool:
    path = _theme_meta_path(theme_id)
    try:
        with open(path, 'w', encoding='utf-8') as fh:
            json.dump(meta, fh, indent=2, ensure_ascii=False)
            fh.write('\n')
        return True
    except Exception as exc:
        print(f'[THEME_ADMIN] failed writing {path}: {exc}')
        return False


def _run_theme_sync() -> bool:
    """Regenerate manifest + 4 contract registries from disk.

    Called after disable/enable/delete so `theme/theme-manifest.json` matches
    each theme.json's current intent. Catalog discovery reads theme.json
    directly so /api/themes is correct even without this; manifest is kept in
    lockstep for CI/git consistency.
    """
    try:
        result = subprocess.run(
            ['npm', 'run', 'theme:sync'],
            cwd=os.path.dirname(os.path.abspath(__file__)),
            capture_output=True,
            text=True,
            timeout=60,
            shell=(os.name == 'nt'),
        )
        if result.returncode != 0:
            print(f'[THEME_ADMIN] theme:sync failed rc={result.returncode}: {result.stderr}')
            return False
        return True
    except Exception as exc:
        print(f'[THEME_ADMIN] theme:sync raised: {exc}')
        return False


def _brands_using_theme(theme_id: str) -> List[Dict[str, str]]:
    """Return a list of brands currently configured to use this theme.

    Each entry has at least 'slug' and 'name'. Used both for the admin panel
    usage badge and as the delete guard rail.
    """
    matches: List[Dict[str, str]] = []
    try:
        for preview in list_previews():
            preview_theme = (
                preview.get('themeId')
                or preview.get('theme_id')
                or (preview.get('theme') or {}).get('themeId')
                or (preview.get('theme') or {}).get('id')
                or ''
            )
            if str(preview_theme).strip().lower() == theme_id:
                matches.append({
                    'slug': preview.get('slug', ''),
                    'name': preview.get('name') or preview.get('slug') or '',
                })
    except Exception as exc:
        print(f'[THEME_ADMIN] _brands_using_theme failed: {exc}')
    return matches


@app.route('/api/themes/admin', methods=['GET'])
@auth_manager.login_required
def get_themes_admin():
    """Return the FULL theme catalog (active + disabled) with usage counts.

    Used by the /templates management page. Each entry is augmented with:
      - usageCount: number of brands targeting the theme
      - usageBrands: lightweight list of {slug, name} of those brands
      - heroImage: relative URL to the theme's hero JPG if it exists
      - protected: True for themes the operator cannot disable/delete
    """
    catalog = get_theme_catalog()
    themes_out: List[Dict[str, Any]] = []

    # Pre-compute brand -> theme mapping once so we don't iterate previews N times.
    brand_index: Dict[str, List[Dict[str, str]]] = {}
    try:
        for preview in list_previews():
            preview_theme = str(
                preview.get('themeId')
                or preview.get('theme_id')
                or (preview.get('theme') or {}).get('themeId')
                or (preview.get('theme') or {}).get('id')
                or ''
            ).strip().lower()
            if not preview_theme:
                continue
            brand_index.setdefault(preview_theme, []).append({
                'slug': preview.get('slug', ''),
                'name': preview.get('name') or preview.get('slug') or '',
            })
    except Exception as exc:
        print(f'[THEME_ADMIN] brand index failed: {exc}')

    for theme in catalog.get('themes', []):
        theme_id = theme.get('id', '')
        brands = brand_index.get(theme_id, [])
        hero_relpath = f'/themes/{theme_id}/images/hero.jpg'
        hero_absolute = os.path.join(_public_themes_root(), theme_id, 'images', 'hero.jpg')
        themes_out.append({
            **theme,
            'usageCount': len(brands),
            'usageBrands': brands[:8],   # cap the inline list to keep payload small
            'heroImage': hero_relpath if os.path.exists(hero_absolute) else None,
            'protected': theme_id in _PROTECTED_THEME_IDS,
        })

    return jsonify({
        'themes': themes_out,
        'defaultTheme': catalog.get('defaultTheme'),
        'version': catalog.get('version'),
    }), 200


@app.route('/api/themes/<theme_id>/usage', methods=['GET'])
@auth_manager.login_required
def get_theme_usage(theme_id):
    """Return the list of brands using this theme. Used by the delete confirmation."""
    safe = _validate_theme_id(theme_id)
    if not safe:
        return jsonify({'error': 'Invalid theme id'}), 400
    if not os.path.exists(_theme_folder_path(safe)):
        return jsonify({'error': f'Theme {safe} not found'}), 404
    brands = _brands_using_theme(safe)
    return jsonify({'themeId': safe, 'count': len(brands), 'brands': brands}), 200


@app.route('/api/themes/<theme_id>/disable', methods=['POST'])
@auth_manager.login_required
def disable_theme(theme_id):
    """Mark a theme disabled so it disappears from the /create picker.

    Existing brands targeting it keep rendering. Re-enable via /enable.
    """
    safe = _validate_theme_id(theme_id)
    if not safe:
        return jsonify({'error': 'Invalid theme id'}), 400
    if safe in _PROTECTED_THEME_IDS:
        return jsonify({'error': f'{safe} is the default theme and cannot be disabled'}), 409
    meta = _read_theme_meta(safe)
    if meta is None:
        return jsonify({'error': f'Theme {safe} not found'}), 404
    if meta.get('disabled'):
        return jsonify({'ok': True, 'themeId': safe, 'disabled': True, 'noop': True}), 200
    meta['disabled'] = True
    if not _write_theme_meta(safe, meta):
        return jsonify({'error': 'Failed to write theme.json'}), 500
    _run_theme_sync()
    sse_log_manager.info(f'Theme disabled: {safe}', source='theme-admin', metadata={'themeId': safe})
    return jsonify({'ok': True, 'themeId': safe, 'disabled': True}), 200


@app.route('/api/themes/<theme_id>/enable', methods=['POST'])
@auth_manager.login_required
def enable_theme(theme_id):
    """Reverse a disable — clears the `disabled` flag on theme.json."""
    safe = _validate_theme_id(theme_id)
    if not safe:
        return jsonify({'error': 'Invalid theme id'}), 400
    meta = _read_theme_meta(safe)
    if meta is None:
        return jsonify({'error': f'Theme {safe} not found'}), 404
    if not meta.get('disabled'):
        return jsonify({'ok': True, 'themeId': safe, 'disabled': False, 'noop': True}), 200
    meta['disabled'] = False
    # Remove the falsy flag rather than leaving "disabled": false in the file —
    # keeps theme.json diff-free for themes that have never been disabled.
    if meta.get('disabled') is False:
        meta.pop('disabled', None)
    if not _write_theme_meta(safe, meta):
        return jsonify({'error': 'Failed to write theme.json'}), 500
    _run_theme_sync()
    sse_log_manager.info(f'Theme enabled: {safe}', source='theme-admin', metadata={'themeId': safe})
    return jsonify({'ok': True, 'themeId': safe, 'disabled': False}), 200


@app.route('/api/themes/<theme_id>', methods=['DELETE'])
@auth_manager.login_required
def delete_theme(theme_id):
    """Totally remove a theme from the system.

    Deletes:
      - app/themes/<id>/ (the theme contract code)
      - public/themes/<id>/ (the per-theme imagery)
    Then re-runs `theme:sync` to drop the manifest entry.

    Refuses to delete:
      - The default theme (classic-dealer) — too structurally important.
      - Any theme with brands targeting it, UNLESS ?force=true is passed.
        Force-deletion leaves those brands broken; the operator should
        re-theme them via /update/<slug> first.
    """
    safe = _validate_theme_id(theme_id)
    if not safe:
        return jsonify({'error': 'Invalid theme id'}), 400
    if safe in _PROTECTED_THEME_IDS:
        return jsonify({'error': f'{safe} is the default theme and cannot be deleted'}), 409

    theme_dir = _theme_folder_path(safe)
    if not os.path.isdir(theme_dir):
        return jsonify({'error': f'Theme {safe} not found'}), 404

    force = request.args.get('force', '').strip().lower() in ('1', 'true', 'yes')
    brands = _brands_using_theme(safe)
    if brands and not force:
        return jsonify({
            'error': 'theme-in-use',
            'message': f'Theme {safe} is in use by {len(brands)} brand(s). Re-theme them first or pass ?force=true to delete anyway.',
            'count': len(brands),
            'brands': brands,
        }), 409

    # Reversible-blast-radius warning: we delete folders below. The sse_log
    # captures intent so a recovery can trace what was removed if needed.
    sse_log_manager.info(
        f'Deleting theme: {safe}',
        source='theme-admin',
        metadata={'themeId': safe, 'force': force, 'brandsAffected': len(brands)},
    )

    try:
        shutil.rmtree(theme_dir)
    except Exception as exc:
        return jsonify({'error': f'Failed to remove theme folder: {exc}'}), 500

    public_dir = _public_theme_path(safe)
    if os.path.isdir(public_dir):
        try:
            shutil.rmtree(public_dir)
        except Exception as exc:
            # Theme code is already gone — log but don't error so the manifest
            # still gets regenerated. The operator can clean stray images by hand.
            print(f'[THEME_ADMIN] public images cleanup failed for {safe}: {exc}')

    _run_theme_sync()
    return jsonify({
        'ok': True,
        'themeId': safe,
        'deleted': True,
        'forced': force,
        'brandsAffected': len(brands),
    }), 200


@app.route('/api/brands', methods=['GET'])
@auth_manager.login_required
def get_brands():
    """Legacy brand route mapped to previews."""
    response = get_previews()
    
    # Add additional cache-busting for brands specifically
    if hasattr(response, 'headers'):
        response.headers['X-Cache-Buster'] = str(int(time.time()))
        response.headers['Vary'] = 'Accept-Encoding, User-Agent'
    
    return response


@app.route('/api/brands', methods=['POST'])
@auth_manager.login_required
def create_brand():
    """Create a new brand"""
    try:
        # Handle both JSON and form-data requests
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
            dns_confirmed = str(data.get('dnsConfirmed') or '').strip().lower() in ('1', 'true', 'yes')
            is_dev = is_dev_environment() or is_dev_request_host(request.host)
            if is_dev:
                # Local/dev: require manual confirmation (UI gate).
                if not dns_confirmed:
                    return jsonify({'error': 'DNS confirmation required. Please confirm DNS is configured before creating this brand.'}), 400
            else:
                # Production: skip DNS validation here - it will be done after automation
                pass
            # Parse JSON list fields when coming from multipart/form-data (repeaters)
            def _parse_json_list(field_name: str):
                raw = data.get(field_name)
                if raw is None:
                    return None
                if isinstance(raw, list):
                    return raw
                if isinstance(raw, str):
                    raw = raw.strip()
                    if not raw:
                        return []
                    try:
                        parsed = json.loads(raw)
                        return parsed if isinstance(parsed, list) else []
                    except Exception:
                        return []
                return []

            for field in ('features', 'services', 'testimonials', 'faq'):
                parsed = _parse_json_list(field)
                if parsed is not None:
                    data[field] = parsed
        
        # If the client sends a full BrandConfig JSON (already nested), persist it as-is.
        if request.is_json:
            data = extract_preview_payload(data)
            if looks_like_brand_config(data):
                brand = strip_internal_fields(data)
                incoming_name = (brand.get('name') or '').strip()
                incoming_slug = normalize_slug(incoming_name)
                if not incoming_slug:
                    return jsonify({'error': 'Brand name is required'}), 400
                brand['name'] = incoming_name
                brand['slug'] = incoming_slug
                # Require an explicit domain; do not auto-generate to avoid mismatches
                if 'domain' not in brand or not brand['domain']:
                    return jsonify({'error': 'Domain is required for brand creation'}), 400
                # Production: DNS validation will be done after automation runs
                pass
                errors = validate_brand(brand)
                if errors:
                    return jsonify({'error': 'Validation failed', 'details': errors}), 400
                upsert_preview(incoming_slug, brand)

                # Skip DNS creation here - automation will handle it to avoid duplicate DNS records
                # dns_ok, dns_msg = ensure_dns_ready_or_fail(brand, incoming_slug)
                # if not dns_ok:
                #     # Roll back preview record so we don't keep half-configured previews
                #     delete_preview_record(incoming_slug)
                #     return jsonify({'error': dns_msg or 'DNS setup failed'}), 500

                import uuid
                request_id = str(uuid.uuid4())[:8]
                print(f"[API] DEBUG: [{request_id}] CREATE endpoint - calling automation for brand: {brand.get('domain', 'NO_DOMAIN')}")
                print(f"[API] DEBUG: [{request_id}] CREATE endpoint - brand slug: {incoming_slug}")
                maybe_start_linux_brand_automation(brand)
                
                # Note: DNS validation now happens inside the automation thread
                # No immediate validation here since automation runs in background
                
                return jsonify({
                    'success': True,
                    'message': f"Preview '{brand.get('name', incoming_slug)}' saved successfully",
                    'preview': brand,
                }), 201
         
        # Parse form data (keep hyphens; consistent with normalize_slug used elsewhere)
        slug = normalize_slug(data.get('name') or '')
        if not slug:
            return jsonify({'error': 'Brand name is required'}), 400
        aa_approved_dealer = parse_bool_flag(
            data.get('aaApprovedDealer', data.get('aa_approved_dealer'))
        )

        # Debug: Check keywords before processing
        # Accept either legacy `keywords` (multiline) or the update-form `seoKeywords` field.
        keywords_raw = data.get('seoKeywords') or data.get('keywords', '')
        # Patch: If keywords is 'NOT_FOUND' or empty string, treat as empty list
        if isinstance(keywords_raw, str):
            if keywords_raw.strip().upper() == 'NOT_FOUND' or not keywords_raw.strip():
                keywords = []
            else:
                keywords = [k.strip() for k in re.split(r'[,\n]+', keywords_raw) if k.strip()]
        elif isinstance(keywords_raw, list):
            keywords = [str(k).strip() for k in keywords_raw if str(k).strip()]
        else:
            keywords = []

        # Helper function to convert hex to RGB
        def hex_to_rgb(hex_color):
            if not hex_color or not hex_color.startswith('#'):
                return '0, 0, 0'
            try:
                hex_color = hex_color.lstrip('#')
                return f"{int(hex_color[0:2], 16)}, {int(hex_color[2:4], 16)}, {int(hex_color[4:6], 16)}"
            except:
                return '0, 0, 0'

        # Get actual user-selected colors from form data
        user_primary_color = data.get('primaryColor', '#d4af37')
        user_secondary_color = data.get('secondaryColor', '#c41e3a')
        user_accent_color = data.get('accentColor', '#e74c3c')
        user_background_color = data.get('backgroundColor', '#ffffff')
        user_text_color = data.get('textColor', '#1f2933')
        
        # Calculate RGB values from actual user colors
        user_primary_rgb = hex_to_rgb(user_primary_color)
        user_secondary_rgb = hex_to_rgb(user_secondary_color)
        user_accent_rgb = hex_to_rgb(user_accent_color)
        user_background_rgb = hex_to_rgb(user_background_color)
        user_text_rgb = hex_to_rgb(user_text_color)
        
        # Handle image uploads
        logo_path = f'/images/{slug}-logo.png'  # Default path
        favicon_path = f'/images/{slug}-favicon.png'  # Default path
        hero_image_path = f'/images/hero-bg.png'  # Default path

        # Save uploaded logo if provided
        if 'logoFile' in request.files:
            logo_file = request.files['logoFile']
            if logo_file and logo_file.filename and allowed_file(logo_file.filename):
                try:
                    logo_path = save_image_file(logo_file, slug, 'logo')
                except Exception as e:
                    app.logger.exception("Failed to save logo for brand slug=%s", slug)
                    return jsonify({'error': 'Failed to save logo', 'details': str(e)}), 400

        # Save uploaded favicon if provided
        if 'faviconFile' in request.files:
            favicon_file = request.files['faviconFile']
            if favicon_file and favicon_file.filename and allowed_file(favicon_file.filename):
                try:
                    favicon_path = save_image_file(favicon_file, slug, 'favicon')
                except Exception as e:
                    app.logger.exception("Failed to save favicon for brand slug=%s", slug)
                    return jsonify({'error': 'Failed to save favicon', 'details': str(e)}), 400

        # Save uploaded hero image if provided
        if 'heroImageFile' in request.files:
            hero_image_file = request.files['heroImageFile']
            if hero_image_file and hero_image_file.filename and allowed_file(hero_image_file.filename):
                try:
                    hero_image_path = save_image_file(hero_image_file, slug, 'heroImage')
                except Exception as e:
                    app.logger.exception("Failed to save hero image for brand slug=%s", slug)
                    return jsonify({'error': 'Failed to save hero image', 'details': str(e)}), 400

        # Save uploaded inventory if provided
        inventory_path = ''
        if 'inventoryFile' in request.files:
            inventory_file = request.files['inventoryFile']
            if inventory_file and inventory_file.filename:
                try:
                    inventory_path = save_inventory_file(inventory_file, slug)
                except Exception as e:
                    app.logger.exception("Failed to save inventory for brand slug=%s", slug)
                    return jsonify({'error': 'Failed to save inventory', 'details': str(e)}), 400

        # Save uploaded per-page image overrides (about, services, finance,
        # partExchange, sellYourCar, recentlySold). Each is optional; uploads
        # land at /public/images/<slug>-<slot>.<ext> and the resulting path
        # populates brand.images[<slot>].
        PAGE_IMAGE_SLOTS = (
            'about', 'services', 'finance',
            'partExchange', 'sellYourCar', 'recentlySold',
        )
        uploaded_page_image_paths = {}
        for slot in PAGE_IMAGE_SLOTS:
            field_name = f'{slot}ImageFile'
            if field_name not in request.files:
                continue
            slot_file = request.files[field_name]
            if not (slot_file and slot_file.filename and allowed_file(slot_file.filename)):
                continue
            try:
                uploaded_page_image_paths[slot] = save_image_file(slot_file, slug, slot)
            except Exception as e:
                app.logger.exception(
                    "Failed to save %s image for brand slug=%s", slot, slug
                )
                return jsonify({
                    'error': f'Failed to save {slot} image', 'details': str(e),
                }), 400

        # Import FormHandler to use the createBrandConfig method
        import sys
        sys.path.append(os.path.join(os.path.dirname(__file__), 'static', 'modules'))
        
        # Import the Python wrapper for FormHandler
        try:
            from form_handler import FormHandler
            
            # Use FormHandler to create the complete brand config
            brand = FormHandler.createBrandConfig(data, slug, keywords)
            brand['aaApprovedDealer'] = parse_bool_flag(
                brand.get('aaApprovedDealer', aa_approved_dealer)
            )
            
            # Update paths for uploaded files
            if 'logoFile' in request.files and logo_path:
                brand['logo'] = logo_path
            if 'faviconFile' in request.files and favicon_path:
                brand['favicon'] = favicon_path
            if 'heroImageFile' in request.files and hero_image_path:
                brand['heroImage'] = hero_image_path
            if inventory_path:
                brand['inventory'] = inventory_path

            # Per-page image overrides: start from any preserved existing
            # brand.images (when recreating an existing slug), layer text-field
            # URL overrides from data (image<Slot>Url), then layer uploaded file
            # paths (uploads win).
            prior_images = {}
            prior_brand = load_preview(slug) or {}
            if isinstance(prior_brand.get('images'), dict):
                prior_images = dict(prior_brand['images'])
            images_dict = dict(prior_images)
            if brand.get('heroImage'):
                images_dict['hero'] = brand['heroImage']
            for slot in PAGE_IMAGE_SLOTS:
                url_field = f'image{slot[0].upper()}{slot[1:]}Url'
                url_val = data.get(url_field)
                if isinstance(url_val, str) and url_val.strip():
                    images_dict[slot] = url_val.strip()
                if slot in uploaded_page_image_paths:
                    images_dict[slot] = uploaded_page_image_paths[slot]
            brand['images'] = images_dict

        except ImportError as e:
            app.logger.exception("Could not import FormHandler; falling back to manual construction (slug=%s)", slug)
            # Fallback to manual construction (current behavior)
            # Require domain from form data; do not auto-generate
            domain = data.get('domain', '')
            if not domain:
                return jsonify({'error': 'Domain is required for brand creation'}), 400
            brand = {
                'name': data.get('name', ''),
                'slug': slug,
                'tagline': data.get('tagline', ''),
                'domain': domain,
                'aaApprovedDealer': aa_approved_dealer,
                'logo': logo_path,
                'heroImage': hero_image_path,
                'favicon': favicon_path,
                'inventory': inventory_path,
                'keywords': keywords,  # Use the safely processed keywords
                'location': {
                    'address': {
                        'line1': data.get('address1', ''),
                        'line2': data.get('address2', ''),
                        'city': data.get('city', ''),
                        'county': data.get('county', ''),
                        'postcode': data.get('postcode', ''),
                    },
                    'city': data.get('city', ''),
                    'postcode': data.get('postcode', ''),
                    'phone': data.get('phone', ''),
                    'email': data.get('email', ''),
                    'fullAddress': f"{data.get('address1')}{',' + data.get('address2', '') if data.get('address2') else ''}, {data.get('city', '')}, {data.get('county', '')} {data.get('postcode', '')}",
                },
                'seo': {
                    'title': data.get('seoTitle', ''),
                    'description': data.get('seoDesc', ''),
                    'keywords': keywords,  # Use the safely processed keywords
                    'twitterHandle': data.get('twitter', f"@{slug}"),
                    'country': data.get('country', 'GB'),
                },
                'theme': {
                    'colors': {
                        # Core 5 Colors (from Dashboard) - NEW SYSTEM
                        'primaryColor': user_primary_color,
                        'secondaryColor': user_secondary_color,
                        'accentColor': user_accent_color,
                        'backgroundColor': user_background_color,
                        'textColor': user_text_color,

                        # Background System - LEGACY (derived from 5-color system)
                        'bgPrimary': user_background_color,
                        'bgSecondary': '#faf9f7',
                        'bgTertiary': '#f3f2ee',
                        'bgElevated': user_background_color,
                        'bgGlass': 'rgba(255, 255, 255, 0.92)',

                        # Typography - LEGACY (derived from 5-color system)
                        'textPrimary': user_text_color,
                        'textSecondary': '#374151',
                        'textMuted': '#6b7280',
                        'textInverse': '#ffffff',

                        # Brand Accents - LEGACY (derived from 5-color system)
                        'accentPrimary': user_primary_color,
                        'accentPrimaryRgb': user_primary_rgb,
                        'accentHover': user_secondary_color,
                        'accentActive': user_accent_color,
                        'accentSoft': user_primary_color,
                        'accentChrome': f'rgba({user_primary_rgb}, 0.15)',
                        'accentIvory': f'rgba({user_primary_rgb}, 0.08)',
                        'accentLine': user_primary_color,

                        # Status - LEGACY
                        'success': '#10b981',
                        'warning': '#f59e0b',
                        'danger': '#ef4444',
                        'info': '#3b82f6',

                        # Borders - LEGACY (derived from 5-color system)
                        'borderSubtle': '#f3f4f6',
                        'borderDefault': '#d1d5db',
                        'borderStrong': '#9ca3af',
                        'borderAccent': user_primary_color,

                        # Forms - LEGACY (derived from 5-color system)
                        'fieldBg': user_background_color,
                        'fieldBorder': '#d1d5db',
                        'fieldText': user_text_color,
                    }
                }
            }

        # Validate preview data

        # Preserve existing config fields not represented in the update payload (especially pages/*).
        existing = strip_internal_fields(load_preview(slug) or {})
        if existing:
            merged = deep_merge(brand, existing)
            overwrite_keys = (
                'slug',
                'name',
                'tagline',
                'domain',
                'logo',
                'favicon',
                'heroImage',
                'images',
                'location',
                'socialLinks',
                'openingHours',
                'aboutUs',
                'whyChooseUs',
                'services',
                'testimonials',
                'faq',
                'seo',
                'email',
                'api',
                'theme',
                'themeId',
                'aaApprovedDealer',
            )
            for key in overwrite_keys:
                if key in brand:
                    merged[key] = brand[key]

            existing_pages = existing.get('pages') if isinstance(existing.get('pages'), dict) else None
            if existing_pages is None:
                merged['pages'] = brand.get('pages', {})
            else:
                merged['pages'] = existing_pages

            merged.setdefault('pages', {})

            # Keep services list/faqs in sync, then let per-page hero overrides
            # run after so a dealer-supplied servicesHeroTitle wins.
            merged['pages'].setdefault('services', {})
            if isinstance(merged['pages'].get('services'), dict):
                merged['pages']['services']['services'] = brand.get('services', {}).get('items', [])
                merged['pages']['services']['faqs'] = brand.get('faq', [])
                merged['pages']['services'].setdefault('hero', {})
                merged['pages']['services']['hero']['title'] = brand.get('services', {}).get('title', merged['pages']['services']['hero'].get('title'))

            # Per-page hero overrides. Map from form-field prefix → pages key.
            PAGE_HERO_FIELD_MAP = {
                'home': 'home',
                'about': 'about',
                'services': 'services',
                'contact': 'contact',
                'usedCars': 'used-cars',
                'finance': 'finance',
                'sellYourCar': 'sell-your-car',
                'recentlySold': 'recently-sold',
                'partExchange': 'part-exchange',
            }
            for field_prefix, pages_key in PAGE_HERO_FIELD_MAP.items():
                merged['pages'].setdefault(pages_key, {})
                page = merged['pages'][pages_key]
                if not isinstance(page, dict):
                    continue
                page.setdefault('hero', {})
                title_val = data.get(f'{field_prefix}HeroTitle')
                desc_val = data.get(f'{field_prefix}HeroDescription')
                subtitle_val = data.get(f'{field_prefix}HeroSubtitle')
                if isinstance(title_val, str) and title_val.strip():
                    page['hero']['title'] = title_val.strip()
                if isinstance(desc_val, str) and desc_val.strip():
                    page['hero']['description'] = desc_val.strip()
                if isinstance(subtitle_val, str) and subtitle_val.strip():
                    page['hero']['subtitle'] = subtitle_val.strip()

            brand = merged

        errors = validate_brand(brand)
        if errors:
            return jsonify({'error': 'Validation failed', 'details': errors}), 400

        upsert_preview(slug, brand)

        # Skip DNS creation here - automation will handle it to avoid duplicate DNS records
        # dns_ok, dns_msg = ensure_dns_ready_or_fail(brand, slug)
        # if not dns_ok:
        #     delete_preview_record(slug)
        #     return jsonify({'error': dns_msg or 'DNS setup failed'}), 500

        import uuid
        request_id = str(uuid.uuid4())[:8]
        print(f"[API] DEBUG: [{request_id}] UPDATE endpoint - calling automation for brand: {brand.get('domain', 'NO_DOMAIN')}")
        print(f"[API] DEBUG: [{request_id}] UPDATE endpoint - brand slug: {slug}")
        maybe_start_linux_brand_automation(brand)
        
        # Note: DNS validation now happens inside the automation thread
        # No immediate validation here since automation runs in background
        
        return jsonify({
            'success': True,
            'message': f"Preview '{brand['name']}' saved successfully",
            'preview': brand,
        }), 201
    except Exception as e:
        app.logger.exception("Create brand failed")
        return jsonify({
            'error': 'Request processing failed',
            'details': str(e),
        }), 500


@app.route('/api/previews', methods=['POST'])
def create_preview():
    """Legacy preview creation endpoint."""
    return create_brand()


@app.route('/api/previews/<slug>', methods=['GET'])
def get_preview(slug):
    """Return the stored preview configuration."""
    debug_preview_logs = str(os.environ.get('PREVIEW_DEBUG_LOGS', '')).strip().lower() in ('1', 'true', 'yes')
    if debug_preview_logs:
        print(f"[GET_PREVIEW] Looking for preview: {slug}")
    preview_data = load_preview(slug)
    if not preview_data:
        if debug_preview_logs:
            print(f"[GET_PREVIEW] Preview {slug} not found")
        return jsonify({'error': f'Preview {slug} not found'}), 404
    
    # Add timestamps
    current_timestamp = datetime.utcnow().isoformat() + 'Z'
    current_unix_timestamp = int(time.time())
    
    return jsonify({
        'preview': preview_data,
        'timestamp': current_timestamp,
        'unix_timestamp': current_unix_timestamp,
        'fetched_at': current_timestamp,
    })


@app.route('/api/previews/<slug>/automation-status', methods=['GET'])
def get_automation_status(slug):
    """Return the live automation lifecycle state for a preview.

    Shape:
        {
          "slug": "...",
          "automation": {
            "status": "pending" | "provisioning" | "live" | "failed" | "skipped",
            "step":   "apache:rendering-vhost" | "dns:upserting" | ...,
            "subdomain": "...",
            "request_id": "...",
            "started_at": "...",
            "updated_at": "...",
            "message": "...",
            "error": "..."
          }
        }

    `automation` is an empty object when the preview hasn't been provisioned by
    this Flask process (e.g. legacy previews). Designed to be polled every 1–3 s
    by the dashboard while the operator watches a brand-create complete.
    """
    if not slug or not re.match(r'^[a-z0-9-]+$', slug):
        return jsonify({'error': 'Invalid preview slug'}), 400
    if not preview_exists(slug):
        return jsonify({'error': f'Preview {slug} not found'}), 404
    state = _get_automation_state(slug)
    return jsonify({
        'slug': slug,
        'automation': state or {},
        'fetched_at': datetime.utcnow().isoformat() + 'Z',
    })


@app.route('/api/brands/<slug>', methods=['GET'])
def get_brand(slug):
    """Legacy brand route for backward compatibility."""
    return get_preview(slug)


@app.route('/api/brands/<slug>', methods=['PUT'])
def update_brand_put(slug):
    """Update an existing brand"""
    try:
        # Handle both JSON and form-data requests
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
            # Extract services field separately since it's JSON
            services_field = request.form.get('services')
            if services_field:
                try:
                    import json
                    data['services'] = json.loads(services_field)
                except (json.JSONDecodeError, TypeError):
                    data['services'] = []
        
        # Debug: Log the entire received data structure
        print(f"\n[UPDATE BRAND] Received data type: {'JSON' if request.is_json else 'Form'}")
        print(f"[UPDATE BRAND] Raw data: {data}")
        print(f"[UPDATE BRAND] Data keys: {list(data.keys())}")
        
        # Debug: Log specific field values
        if request.is_json:
            print(f"[UPDATE BRAND] Name: {data.get('name', 'MISSING')}")
            print(f"[UPDATE BRAND] Slug: {data.get('slug', 'MISSING')}")
            print(f"[UPDATE BRAND] Tagline: {data.get('tagline', 'MISSING')}")
            print(f"[UPDATE BRAND] Colors received:")
            print(f"  - primaryColor: {data.get('primaryColor', 'MISSING')}")
            print(f"  - secondaryColor: {data.get('secondaryColor', 'MISSING')}")
            print(f"  - accentColor: {data.get('accentColor', 'MISSING')}")
            print(f"  - backgroundColor: {data.get('backgroundColor', 'MISSING')}")
            print(f"  - textColor: {data.get('textColor', 'MISSING')}")
        else:
            print(f"[UPDATE BRAND] Name (form): {data.get('name', 'MISSING')}")
            print(f"[UPDATE BRAND] Slug (form): {data.get('slug', 'MISSING')}")
            print(f"[UPDATE BRAND] Tagline (form): {data.get('tagline', 'MISSING')}")
            print(f"[UPDATE BRAND] Colors received (form):")
            print(f"  - primaryColor: {data.get('primaryColor', 'MISSING')}")
            print(f"  - secondaryColor: {data.get('secondaryColor', 'MISSING')}")
            print(f"  - accentColor: {data.get('accentColor', 'MISSING')}")
            print(f"  - backgroundColor: {data.get('backgroundColor', 'MISSING')}")
            print(f"  - textColor: {data.get('textColor', 'MISSING')}")

        # Validate slug matches the URL parameter (allow missing slug in payload)
        payload_slug = data.get('slug')
        if payload_slug and slug != payload_slug:
            return jsonify({'error': 'Slug mismatch between URL and payload'}), 400
        data['slug'] = slug

        # If the client sends a full BrandConfig JSON (already nested), merge & persist it.
        if request.is_json:
            payload = extract_preview_payload(data)
            if looks_like_brand_config(payload):
                brand_patch = strip_internal_fields(payload)
                if brand_patch.get('slug') and normalize_slug(brand_patch.get('slug')) != normalize_slug(slug):
                    return jsonify({'error': 'Slug mismatch between URL and payload'}), 400
                brand_patch['slug'] = slug
                brand_patch['domain'] = normalize_domain(brand_patch.get('domain', ''))

                # Snapshot the OLD domain BEFORE strip/merge so we can detect a change
                # and re-provision properly (audit finding C — domain changes were silently
                # dropped, leaving brand 404'ing on the new hostname).
                old_existing_full = load_preview(slug) or {}
                old_host_for_change = extract_hostname(old_existing_full.get('domain') or '')

                existing = strip_internal_fields(old_existing_full)
                merged = deep_merge(existing, brand_patch) if existing else brand_patch

                errors = validate_brand(merged)
                if errors:
                    print(f"[VALIDATION] Errors found: {errors}")
                    return jsonify({'error': 'Validation failed', 'details': errors}), 400

                upsert_preview(slug, merged)
                print(f"[UPDATE] OK: Preview {slug} updated successfully (full config)")

                new_host_for_change = extract_hostname(merged.get('domain') or '')
                domain_changed = bool(
                    old_host_for_change
                    and new_host_for_change
                    and old_host_for_change != new_host_for_change
                )
                if domain_changed:
                    print(f"[UPDATE] Domain changed for {slug}: {old_host_for_change} -> {new_host_for_change}")
                    _set_automation_state(
                        slug,
                        status='pending',
                        step='domain-change',
                        message=f'Re-provisioning for {new_host_for_change}; old vhost {old_host_for_change} will be cleaned up',
                        old_host=old_host_for_change,
                        new_host=new_host_for_change,
                    )
                    _cleanup_old_domain_resources(old_host_for_change, slug=slug)
                    maybe_start_linux_brand_automation(merged)
                else:
                    maybe_restart_pm2_next_linux(reason='update_brand_put_full_json', slug=slug)

                return jsonify({
                    'success': True,
                    'message': f"Preview '{merged.get('name', slug)}' updated successfully",
                    'preview': merged,
                    'domain_changed': domain_changed,
                }), 200

        # Debug: Check keywords before processing
        keywords_raw = data.get('keywords', '')
        print(f"[KEYWORDS PROCESSING] Keywords raw type: {type(keywords_raw)}")
        print(f"[KEYWORDS PROCESSING] Keywords raw value: {keywords_raw}")
        # Patch: If keywords is 'NOT_FOUND' or empty string, treat as empty list
        if isinstance(keywords_raw, str):
            if keywords_raw.strip().upper() == 'NOT_FOUND' or not keywords_raw.strip():
                keywords = []
            else:
                keywords = [k.strip() for k in keywords_raw.split('\n') if k.strip()]
        elif isinstance(keywords_raw, list):
            keywords = [str(k).strip() for k in keywords_raw if str(k).strip()]
        else:
            print(f"[KEYWORDS PROCESSING] Unexpected keywords type: {type(keywords_raw)}")
            keywords = []
        aa_approved_dealer = parse_bool_flag(
            data.get('aaApprovedDealer', data.get('aa_approved_dealer'))
        )

        # Helper function to convert hex to RGB
        def hex_to_rgb(hex_color):
            if not hex_color or not hex_color.startswith('#'):
                return '0, 0, 0'
            try:
                hex_color = hex_color.lstrip('#')
                return f"{int(hex_color[0:2], 16)}, {int(hex_color[2:4], 16)}, {int(hex_color[4:6], 16)}"
            except:
                return '0, 0, 0'

        # Get actual user-selected colors from form data
        user_primary_color = data.get('primaryColor', '#d4af37')
        user_secondary_color = data.get('secondaryColor', '#c41e3a')
        user_accent_color = data.get('accentColor', '#e74c3c')
        user_background_color = data.get('backgroundColor', '#ffffff')
        user_text_color = data.get('textColor', '#1f2933')
        
        # Calculate RGB values from actual user colors
        user_primary_rgb = hex_to_rgb(user_primary_color)
        user_secondary_rgb = hex_to_rgb(user_secondary_color)
        user_accent_rgb = hex_to_rgb(user_accent_color)
        user_background_rgb = hex_to_rgb(user_background_color)
        user_text_rgb = hex_to_rgb(user_text_color)
        
        print(f"[UPDATE BRAND] Calculated RGB values:")
        print(f"  - primaryColor RGB: {user_primary_rgb}")
        print(f"  - secondaryColor RGB: {user_secondary_rgb}")
        print(f"  - accentColor RGB: {user_accent_rgb}")

        # Handle image uploads
        logo_path = f'/images/{slug}-logo.png'  # Default path
        favicon_path = f'/images/{slug}-favicon.png'  # Default path
        hero_image_path = f'/images/hero-bg.png'  # Default path

        print(f"\n[UPDATE BRAND] Processing brand: {slug}")
        print(f"  Files in request: {list(request.files.keys())}")

        # Save uploaded logo if provided
        if 'logoFile' in request.files:
            logo_file = request.files['logoFile']
            print(f"  Logo file found: {logo_file.filename}")
            if logo_file and logo_file.filename and allowed_file(logo_file.filename):
                try:
                    logo_path = save_image_file(logo_file, slug, 'logo')
                    print(f"  OK: Logo path set to: {logo_path}")
                except Exception as e:
                    print(f"  ERROR saving logo: {e}")
                    return jsonify({'error': 'Failed to save logo', 'details': str(e)}), 400
        else:
            print(f"  No logoFile in request")

        # Save uploaded favicon if provided
        if 'faviconFile' in request.files:
            favicon_file = request.files['faviconFile']
            print(f"  Favicon file found: {favicon_file.filename}")
            if favicon_file and favicon_file.filename and allowed_file(favicon_file.filename):
                try:
                    favicon_path = save_image_file(favicon_file, slug, 'favicon')
                    print(f"  OK: Favicon path set to: {favicon_path}")
                except Exception as e:
                    print(f"  ERROR saving favicon: {e}")
                    return jsonify({'error': 'Failed to save favicon', 'details': str(e)}), 400
        else:
            print(f"  No faviconFile in request")

        # Save uploaded hero image if provided
        if 'heroImageFile' in request.files:
            hero_image_file = request.files['heroImageFile']
            print(f"  Hero image file found: {hero_image_file.filename}")
            if hero_image_file and hero_image_file.filename and allowed_file(hero_image_file.filename):
                try:
                    hero_image_path = save_image_file(hero_image_file, slug, 'heroImage')
                    print(f"  OK: Hero image path set to: {hero_image_path}")
                except Exception as e:
                    print(f"  ERROR saving hero image: {e}")
                    return jsonify({'error': 'Failed to save hero image', 'details': str(e)}), 400
        else:
            print(f"  No heroImageFile in request")

        # Save uploaded inventory if provided
        if 'inventoryFile' in request.files:
            inventory_file = request.files['inventoryFile']
            print(f"  Inventory file found: {inventory_file.filename}")
            if inventory_file and inventory_file.filename:
                try:
                    inventory_path = save_inventory_file(inventory_file, slug)
                    print(f"  OK: Inventory path set to: {inventory_path}")
                except Exception as e:
                    print(f"  ERROR saving inventory: {e}")
                    return jsonify({'error': 'Failed to save inventory', 'details': str(e)}), 400
        else:
            print(f"  No inventoryFile in request")

        # Import FormHandler to use the createBrandConfig method
        import sys
        sys.path.append(os.path.join(os.path.dirname(__file__), 'static', 'modules'))
        
        # Import the Python wrapper for FormHandler
        try:
            from form_handler import FormHandler
            
            # Use FormHandler to create the complete brand config
            brand = FormHandler.createBrandConfig(data, slug, keywords)
            brand['aaApprovedDealer'] = parse_bool_flag(
                brand.get('aaApprovedDealer', aa_approved_dealer)
            )
            
            # Update paths for uploaded files
            if 'logoFile' in request.files and logo_path:
                brand['logo'] = logo_path
            if 'faviconFile' in request.files and favicon_path:
                brand['favicon'] = favicon_path
            if 'heroImageFile' in request.files and hero_image_path:
                brand['heroImage'] = hero_image_path
            if 'inventoryFile' in request.files and inventory_path:
                brand['inventory'] = inventory_path
            
            print("[UPDATE BRAND] OK: Used FormHandler to create complete brand config")
            print(f"  - Features: {len(brand.get('whyChooseUs', {}).get('features', []))}")
            print(f"  - Services: {len(brand.get('services', {}).get('items', []))}")
            print(f"  - Testimonials: {len(brand.get('testimonials', []))}")
            print(f"  - FAQs: {len(brand.get('faq', []))}")
            
        except ImportError as e:
            print(f"Warning: Could not import FormHandler: {e}")
            print("  Falling back to manual brand construction")
            # Fallback to manual construction
            brand = {
                'name': data.get('name', ''),
                'slug': slug,
                'tagline': data.get('tagline', ''),
                'domain': data.get('domain', ''),
                'aaApprovedDealer': aa_approved_dealer,
                'logo': logo_path,
                'heroImage': hero_image_path,
                'favicon': favicon_path,
                'inventory': inventory_path if inventory_path else '',
                'keywords': keywords,
                'location': {
                    'address': {
                        'line1': data.get('address1', ''),
                        'line2': data.get('address2', ''),
                        'city': data.get('city', ''),
                        'county': data.get('county', ''),
                        'postcode': data.get('postcode', ''),
                    },
                    'city': data.get('city', ''),
                    'postcode': data.get('postcode', ''),
                    'phone': data.get('phone', ''),
                    'email': data.get('email', ''),
                    'fullAddress': f"{data.get('address1')}{',' + data.get('address2', '') if data.get('address2') else ''}, {data.get('city', '')}, {data.get('county', '')} {data.get('postcode', '')}",
                },
                'seo': {
                    'title': data.get('seoTitle', ''),
                    'description': data.get('seoDesc', ''),
                    'keywords': keywords,
                    'twitterHandle': data.get('twitter', f"@{slug}"),
                    'country': data.get('country', 'GB'),
                },
                'theme': {
                    'colors': {
                        # Core 5 Colors (from Dashboard) - NEW SYSTEM
                        'primaryColor': user_primary_color,
                        'secondaryColor': user_secondary_color,
                        'accentColor': user_accent_color,
                        'backgroundColor': user_background_color,
                        'textColor': user_text_color,
                    }
                }
            }

        errors = validate_brand(brand)
        if errors:
            print(f"[VALIDATION] Errors found: {errors}")
            return jsonify({
                'error': 'Validation failed',
                'details': errors
            }), 400

        upsert_preview(slug, brand)
        print(f"[CREATE] OK: Preview {slug} saved successfully")

        return jsonify({
            'success': True,
            'message': f"Preview '{brand['name']}' saved successfully",
            'preview': brand,
        }), 201
    except Exception as e:
        return jsonify({
            'error': 'Request processing failed',
            'details': str(e),
        }), 500


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file uploads and return saved path"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if not file or not file.filename:
            return jsonify({'error': 'No file selected'}), 400

        # Get slug from request
        slug = request.form.get('slug', 'temp')
        image_type = request.form.get('type', 'logo')  # 'logo' or 'favicon'

        if not allowed_file(file.filename):
            return jsonify({
                'error': 'File type not allowed',
                'allowed': list(ALLOWED_EXTENSIONS)
            }), 400

        try:
            file_path = save_image_file(file, slug, image_type)
            return jsonify({
                'success': True,
                'path': file_path,
                'message': f"File saved to {file_path}"
            }), 200
        except Exception as e:
            return jsonify({
                'error': 'Failed to save file',
                'details': str(e)
            }), 500

    except Exception as e:
        return jsonify({
            'error': 'Upload failed',
            'details': str(e)
        }), 500


@app.route('/api/brands/<slug>/update', methods=['POST'])
def update_brand(slug):
    """Update an existing brand"""
    try:
        # Handle both JSON and form-data requests
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()

        data = extract_preview_payload(data)
        if not isinstance(data, dict):
            data = {}

        # Parse JSON list fields when coming from multipart/form-data
        def _parse_json_list(field_name: str):
            raw = data.get(field_name)
            if raw is None:
                return None
            if isinstance(raw, list):
                return raw
            if isinstance(raw, str):
                raw = raw.strip()
                if not raw:
                    return []
                try:
                    parsed = json.loads(raw)
                    return parsed if isinstance(parsed, list) else [parsed]
                except json.JSONDecodeError:
                    return [raw]
            return []
        
        preview = load_preview(slug)
        if not preview:
            sse_log_manager.warning(f"Brand not found for deletion: {slug}", source="delete", metadata={"slug": slug})
            return jsonify({'error': 'Preview not found'}), 404

        # Snapshot the OLD domain BEFORE strip/merge for domain-change detection.
        old_full_for_change = load_preview(slug) or {}
        old_host_for_change = extract_hostname(old_full_for_change.get('domain') or '')

        existing = strip_internal_fields(old_full_for_change)
        existing_name = existing.get('name') if isinstance(existing.get('name'), str) else ''

        # If the client sends a full BrandConfig JSON (already nested), merge & persist it.
        if request.is_json and looks_like_brand_config(data):
            brand_patch = strip_internal_fields(data)
            if brand_patch.get('slug') and normalize_slug(brand_patch.get('slug')) != normalize_slug(slug):
                return jsonify({'error': 'Slug mismatch between URL and payload'}), 400
            brand_patch['slug'] = slug
            brand_patch['domain'] = normalize_domain(brand_patch.get('domain', ''))
            if existing_name:
                brand_patch['name'] = existing_name

            brand = deep_merge(existing, brand_patch)
            if existing_name:
                brand['name'] = existing_name
            errors = validate_brand(brand)
            if errors:
                print(f"[UPDATE] Validation failed for {slug} (full config): {errors}")
                return jsonify({'error': 'Validation failed', 'details': errors}), 400

            upsert_preview(slug, brand)
            print(f"[UPDATE] OK: Preview {slug} updated successfully (full config)")

            new_host_for_change = extract_hostname(brand.get('domain') or '')
            domain_changed = bool(
                old_host_for_change
                and new_host_for_change
                and old_host_for_change != new_host_for_change
            )
            if domain_changed:
                print(f"[UPDATE] Domain changed for {slug}: {old_host_for_change} -> {new_host_for_change}")
                _set_automation_state(
                    slug, status='pending', step='domain-change',
                    message=f'Re-provisioning for {new_host_for_change}; old vhost {old_host_for_change} will be cleaned up',
                    old_host=old_host_for_change, new_host=new_host_for_change,
                )
                _cleanup_old_domain_resources(old_host_for_change, slug=slug)
                maybe_start_linux_brand_automation(brand)
            else:
                maybe_restart_pm2_next_linux(reason='update_brand_update_full_json', slug=slug)

            return jsonify({
                'success': True,
                'message': f"Preview '{brand.get('name', slug)}' updated successfully",
                'preview': brand,
                'domain_changed': domain_changed,
            }), 200

        # Flat update payload (from templates/update.html): build a complete config, but preserve
        # existing fields not represented in the update form (especially pages/*).
        prepared = data
        payload_slug = prepared.get('slug')
        if payload_slug and normalize_slug(payload_slug) != normalize_slug(slug):
            return jsonify({'error': 'Slug mismatch between URL and payload'}), 400

        prepared = dict(prepared)
        prepared['slug'] = slug
        prepared['domain'] = normalize_domain(prepared.get('domain', ''))
        if existing_name:
            prepared['name'] = existing_name

        # Map update.html field names to FormHandler expectations
        if 'address1' not in prepared and 'address' in prepared:
            prepared['address1'] = prepared.get('address', '')
        if 'seoDesc' not in prepared and 'seoDescription' in prepared:
            prepared['seoDesc'] = prepared.get('seoDescription', '')
        if 'twitter' not in prepared and 'twitterHandle' in prepared:
            prepared['twitter'] = prepared.get('twitterHandle', '')
        if 'whyChooseUsFeatures' not in prepared and 'features' in prepared:
            prepared['whyChooseUsFeatures'] = prepared.get('features', [])
        if 'faqs' not in prepared and 'faq' in prepared:
            prepared['faqs'] = prepared.get('faq', [])

        keywords_raw = prepared.get('seoKeywords') or prepared.get('keywords') or ''
        if isinstance(keywords_raw, list):
            keywords = [str(k).strip() for k in keywords_raw if str(k).strip()]
        elif isinstance(keywords_raw, str):
            keywords = [k.strip() for k in keywords_raw.split(',') if k.strip()]
        else:
            keywords = []
        aa_approved_dealer = parse_bool_flag(
            prepared.get('aaApprovedDealer', prepared.get('aa_approved_dealer'))
        )

        # Handle file uploads (same logic as create route)
        logo_path = f'/images/{slug}-logo.png'  # Default path
        favicon_path = f'/images/{slug}-favicon.png'  # Default path
        hero_image_path = f'/images/hero-bg.png'  # Default path
        inventory_path = ''

        # Save uploaded logo if provided
        if 'logoFile' in request.files:
            logo_file = request.files['logoFile']
            if logo_file and logo_file.filename and allowed_file(logo_file.filename):
                try:
                    logo_path = save_image_file(logo_file, slug, 'logo')
                except Exception as e:
                    app.logger.exception("Failed to save logo for brand slug=%s", slug)
                    return jsonify({'error': 'Failed to save logo', 'details': str(e)}), 400

        # Save uploaded favicon if provided
        if 'faviconFile' in request.files:
            favicon_file = request.files['faviconFile']
            if favicon_file and favicon_file.filename and allowed_file(favicon_file.filename):
                try:
                    favicon_path = save_image_file(favicon_file, slug, 'favicon')
                except Exception as e:
                    app.logger.exception("Failed to save favicon for brand slug=%s", slug)
                    return jsonify({'error': 'Failed to save favicon', 'details': str(e)}), 400

        # Save uploaded hero image if provided
        if 'heroImageFile' in request.files:
            hero_image_file = request.files['heroImageFile']
            if hero_image_file and hero_image_file.filename and allowed_file(hero_image_file.filename):
                try:
                    hero_image_path = save_image_file(hero_image_file, slug, 'heroImage')
                except Exception as e:
                    app.logger.exception("Failed to save hero image for brand slug=%s", slug)
                    return jsonify({'error': 'Failed to save hero image', 'details': str(e)}), 400

        # Save uploaded inventory if provided
        if 'inventoryFile' in request.files:
            inventory_file = request.files['inventoryFile']
            if inventory_file and inventory_file.filename:
                try:
                    inventory_path = save_inventory_file(inventory_file, slug)
                except Exception as e:
                    app.logger.exception("Failed to save inventory for brand slug=%s", slug)
                    return jsonify({'error': 'Failed to save inventory', 'details': str(e)}), 400

        # Save uploaded per-page image overrides (about, services, finance,
        # partExchange, sellYourCar, recentlySold). Each is optional; uploads
        # land at /public/images/<slug>-<slot>.<ext> and the resulting path
        # populates brand.images[<slot>].
        PAGE_IMAGE_SLOTS = (
            'about', 'services', 'finance',
            'partExchange', 'sellYourCar', 'recentlySold',
        )
        uploaded_page_image_paths = {}
        for slot in PAGE_IMAGE_SLOTS:
            field_name = f'{slot}ImageFile'
            if field_name not in request.files:
                continue
            slot_file = request.files[field_name]
            if not (slot_file and slot_file.filename and allowed_file(slot_file.filename)):
                continue
            try:
                uploaded_page_image_paths[slot] = save_image_file(slot_file, slug, slot)
            except Exception as e:
                app.logger.exception(
                    "Failed to save %s image for brand slug=%s", slot, slug
                )
                return jsonify({
                    'error': f'Failed to save {slot} image', 'details': str(e),
                }), 400

        # Build config from the shared FormHandler logic (keeps services/testimonials/faq/etc).
        import sys
        sys.path.append(os.path.join(os.path.dirname(__file__), 'static', 'modules'))
        try:
            from form_handler import FormHandler
            brand_from_form = FormHandler.createBrandConfig(prepared, slug, keywords)
            brand_from_form['aaApprovedDealer'] = parse_bool_flag(
                brand_from_form.get('aaApprovedDealer', aa_approved_dealer)
            )
            
            # Update paths for uploaded files
            if 'logoFile' in request.files and logo_path:
                brand_from_form['logo'] = logo_path
            if 'faviconFile' in request.files and favicon_path:
                brand_from_form['favicon'] = favicon_path
            if 'heroImageFile' in request.files and hero_image_path:
                brand_from_form['heroImage'] = hero_image_path
            if inventory_path:
                brand_from_form['inventory'] = inventory_path

            # Per-page image overrides: start from existing brand.images, layer
            # any text-field URL overrides from `prepared` (image<Slot>Url), then
            # layer uploaded file paths (uploads win).
            existing_images = existing.get('images') if isinstance(existing.get('images'), dict) else {}
            images_dict = dict(existing_images)
            # Top-level heroImage doubles as images.hero for theme components
            # that read brand.images.hero (Columbus, ELE) — keep them in sync.
            if brand_from_form.get('heroImage'):
                images_dict['hero'] = brand_from_form['heroImage']
            for slot in PAGE_IMAGE_SLOTS:
                url_field = f'image{slot[0].upper()}{slot[1:]}Url'
                url_val = (prepared.get(url_field) or '').strip() if isinstance(prepared.get(url_field), str) else None
                if url_val:
                    images_dict[slot] = url_val
                if slot in uploaded_page_image_paths:
                    images_dict[slot] = uploaded_page_image_paths[slot]
            brand_from_form['images'] = images_dict
                
        except Exception as e:
            print(f"Warning: Could not use FormHandler: {e}")
            brand_from_form = {
                'slug': slug,
                'name': prepared.get('name', existing.get('name', '')),
                'tagline': prepared.get('tagline', existing.get('tagline', '')),
                'domain': prepared.get('domain', existing.get('domain', '')),
                'aaApprovedDealer': aa_approved_dealer,
                'logo': logo_path if 'logoFile' in request.files else prepared.get('logo', existing.get('logo', f'/images/{slug}-logo.png')),
                'favicon': favicon_path if 'faviconFile' in request.files else prepared.get('favicon', existing.get('favicon', f'/images/{slug}-favicon.png')),
                'heroImage': hero_image_path if 'heroImageFile' in request.files else prepared.get('heroImage', existing.get('heroImage', '/images/hero-bg.png')),
                'inventory': inventory_path if inventory_path else existing.get('inventory', ''),
                'location': existing.get('location', {}),
                'socialLinks': existing.get('socialLinks', {}),
                'openingHours': existing.get('openingHours', {}),
                'aboutUs': existing.get('aboutUs', {}),
                'whyChooseUs': existing.get('whyChooseUs', {}),
                'services': existing.get('services', {}),
                'testimonials': existing.get('testimonials', []),
                'faq': existing.get('faq', []),
                'seo': existing.get('seo', {}),
                'email': existing.get('email', {}),
                'api': existing.get('api', {}),
                'theme': existing.get('theme', {}),
            }

        # Preserve explicit asset paths from the payload (if present).
        for asset_key in ('logo', 'favicon', 'heroImage'):
            if prepared.get(asset_key):
                brand_from_form[asset_key] = prepared.get(asset_key)

        # Start from existing (to preserve unknown/custom fields), then overwrite the
        # sections we explicitly manage via the update form.
        merged = deep_merge(brand_from_form, existing)
        overwrite_keys = (
            'slug',
            'tagline',
            'domain',
            'logo',
            'favicon',
            'heroImage',
            'images',
            'location',
            'socialLinks',
            'openingHours',
            'aboutUs',
            'whyChooseUs',
            'services',
            'testimonials',
            'faq',
            'seo',
            'email',
            'api',
            'theme',
            'themeId',
            'aaApprovedDealer',
        )
        for key in overwrite_keys:
            if key in brand_from_form:
                merged[key] = brand_from_form[key]

        # Patch only the page fields that the update form actually edits.
        existing_pages = existing.get('pages') if isinstance(existing.get('pages'), dict) else None
        if existing_pages is None:
            merged['pages'] = brand_from_form.get('pages', {})
        else:
            merged['pages'] = existing_pages

        merged.setdefault('pages', {})

        # Keep services/contact/about page content from existing, but keep services lists in sync.
        merged['pages'].setdefault('services', {})
        if isinstance(merged['pages'].get('services'), dict):
            merged['pages']['services'].setdefault('hero', {})
            merged['pages']['services']['hero'].setdefault('title', brand_from_form.get('services', {}).get('title', 'Our Services'))
            merged['pages']['services']['hero']['title'] = brand_from_form.get('services', {}).get('title', merged['pages']['services']['hero'].get('title'))
            merged['pages']['services']['services'] = brand_from_form.get('services', {}).get('items', [])
            merged['pages']['services']['faqs'] = brand_from_form.get('faq', [])

        # Per-page hero overrides. Map from form-field prefix → pages key.
        # Form posts e.g. aboutHeroTitle / aboutHeroDescription; we route them
        # onto pages.<key>.hero.{title,description}. Fields are only applied
        # when the user sent a non-empty value, so existing copy stays put for
        # any field the dealer didn't touch. Runs AFTER the legacy services
        # block so an explicit servicesHeroTitle wins over the services-section
        # title fallback.
        PAGE_HERO_FIELD_MAP = {
            'home': 'home',
            'about': 'about',
            'services': 'services',
            'contact': 'contact',
            'usedCars': 'used-cars',
            'finance': 'finance',
            'sellYourCar': 'sell-your-car',
            'recentlySold': 'recently-sold',
            'partExchange': 'part-exchange',
        }
        for field_prefix, pages_key in PAGE_HERO_FIELD_MAP.items():
            merged['pages'].setdefault(pages_key, {})
            page = merged['pages'][pages_key]
            if not isinstance(page, dict):
                continue
            page.setdefault('hero', {})
            title_val = prepared.get(f'{field_prefix}HeroTitle')
            desc_val = prepared.get(f'{field_prefix}HeroDescription')
            subtitle_val = prepared.get(f'{field_prefix}HeroSubtitle')
            if isinstance(title_val, str) and title_val.strip():
                page['hero']['title'] = title_val.strip()
            if isinstance(desc_val, str) and desc_val.strip():
                page['hero']['description'] = desc_val.strip()
            if isinstance(subtitle_val, str) and subtitle_val.strip():
                page['hero']['subtitle'] = subtitle_val.strip()

        brand = merged
        
        # Validate the brand data
        errors = validate_brand(brand)
        if errors:
            print(f"[UPDATE] Validation failed for {slug} (form): {errors}")
            return jsonify({
                'error': 'Validation failed',
                'details': errors
            }), 400

        upsert_preview(slug, brand)
        print(f"[UPDATE] OK: Preview {slug} updated successfully")

        new_host_for_change = extract_hostname(brand.get('domain') or '')
        domain_changed_form = bool(
            old_host_for_change
            and new_host_for_change
            and old_host_for_change != new_host_for_change
        )
        if domain_changed_form:
            print(f"[UPDATE] Domain changed for {slug}: {old_host_for_change} -> {new_host_for_change}")
            _set_automation_state(
                slug, status='pending', step='domain-change',
                message=f'Re-provisioning for {new_host_for_change}; old vhost {old_host_for_change} will be cleaned up',
                old_host=old_host_for_change, new_host=new_host_for_change,
            )
            _cleanup_old_domain_resources(old_host_for_change, slug=slug)
            maybe_start_linux_brand_automation(brand)
        else:
            maybe_restart_pm2_next_linux(reason='update_brand_update_form', slug=slug)

        return jsonify({
            'success': True,
            'message': f"Preview '{brand['name']}' updated successfully",
            'preview': brand,
            'domain_changed': domain_changed_form,
        }), 200
        
    except Exception as e:
        print(f"[UPDATE] Error updating preview {slug}: {e}")
        return jsonify({
            'error': 'Failed to update preview',
            'details': str(e),
        }), 500


@app.route('/api/previews/<slug>', methods=['PUT'])
def update_preview_put(slug):
    """Legacy preview update endpoint."""
    return update_brand_put(slug)


@app.route('/api/inventory/<slug>', methods=['POST'])
def upload_inventory(slug):
    """Upload inventory JSON file for a specific brand"""
    try:
        print(f"\n[UPLOAD INVENTORY] Processing upload for brand: {slug}")
        
        # Validate slug
        if not slug or not re.match(r'^[a-z0-9-]+$', slug):
            return jsonify({'error': 'Invalid brand slug'}), 400
        
        # Check if preview exists
        if not preview_exists(slug):
            return jsonify({'error': f'Preview "{slug}" not found'}), 404
        
        # Validate request has inventory file
        if 'inventory' not in request.files:
            return jsonify({'error': 'No inventory file provided'}), 400
        
        file = request.files['inventory']
        if not file or not file.filename:
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_inventory_file(file.filename):
            file_ext = file.filename.rsplit('.', 1)[-1] if '.' in file.filename else 'unknown'
            return jsonify({
                'error': f'Invalid file type: .{file_ext}. Only JSON files (.json) are allowed.',
                'allowed': 'json',
                'received': file_ext
            }), 400
        
        try:
            inventory_path = save_inventory_file(file, slug)
            
            # Get file info
            file_path = get_brand_inventory_path(slug)
            file_size = file_path.stat().st_size
            
            # Count vehicles in inventory
            with open(file_path, 'r', encoding='utf-8') as f:
                inventory_data = json.load(f)
            vehicle_count = len(inventory_data) if isinstance(inventory_data, list) else 0
            
            print("  OK: Inventory uploaded successfully")
            print(f"  - File size: {file_size:,} bytes")
            print(f"  - Vehicle count: {vehicle_count}")
            
            return jsonify({
                'success': True,
                'message': f'Inventory for brand "{slug}" uploaded successfully',
                'brand': slug,
                'path': inventory_path,
                'file_size': file_size,
                'vehicle_count': vehicle_count
            }), 201
            
        except Exception as e:
            print(f"  ERROR saving inventory: {e}")
            return jsonify({
                'error': 'Failed to save inventory',
                'details': str(e)
            }), 500
    
    except Exception as e:
        print(f"  ERROR processing inventory upload: {e}")
        return jsonify({
            'error': 'Upload failed',
            'details': str(e)
        }), 500


@app.route('/api/inventory/<slug>', methods=['GET'])
def get_inventory(slug):
    """Get inventory for a specific brand"""
    try:
        # Validate slug
        if not slug or not re.match(r'^[a-z0-9-]+$', slug):
            return jsonify({'error': 'Invalid brand slug'}), 400
        
        # Check if inventory exists
        inventory_file = get_brand_inventory_path(slug)
        if not inventory_file.exists():
            return jsonify({
                'brand': slug,
                'exists': False,
                'message': f'No inventory found for brand "{slug}"'
            }), 404
        
        # Read and return inventory
        with open(inventory_file, 'r', encoding='utf-8') as f:
            inventory_data = json.load(f)
        
        vehicle_count = len(inventory_data) if isinstance(inventory_data, list) else 0
        
        return jsonify({
            'brand': slug,
            'exists': True,
            'vehicle_count': vehicle_count,
            'inventory': inventory_data
        }), 200
        
    except json.JSONDecodeError as e:
        return jsonify({
            'error': 'Invalid inventory file format',
            'details': str(e)
        }), 500
    except Exception as e:
        return jsonify({
            'error': 'Failed to retrieve inventory',
            'details': str(e)
        }), 500


@app.route('/api/inventory/<slug>', methods=['DELETE'])
def delete_inventory(slug):
    """Delete inventory for a specific brand"""
    try:
        print(f"\n[DELETE INVENTORY] Processing deletion for brand: {slug}")
        
        # Validate slug
        if not slug or not re.match(r'^[a-z0-9-]+$', slug):
            return jsonify({'error': 'Invalid brand slug'}), 400
        
        # Check if inventory exists
        inventory_file = get_brand_inventory_path(slug)
        if not inventory_file.exists():
            return jsonify({'error': f'No inventory found for brand "{slug}"'}), 404
        
        try:
            inventory_file.unlink()
            print(f"  OK: Deleted inventory: {inventory_file}")
            
            return jsonify({
                'success': True,
                'message': f'Inventory for brand "{slug}" deleted successfully',
                'brand': slug
            }), 200
        except Exception as e:
            print(f"  ERROR deleting inventory: {e}")
            return jsonify({
                'error': 'Failed to delete inventory',
                'details': str(e)
            }), 500
    
    except Exception as e:
        print(f"  ERROR processing inventory deletion: {e}")
        return jsonify({
            'error': 'Deletion failed',
            'details': str(e)
        }), 500


@app.route('/api/inventory/<slug>/info', methods=['GET'])
def get_inventory_info(slug):
    """Get info about a brand's inventory without loading all data"""
    try:
        # Validate slug
        if not slug or not re.match(r'^[a-z0-9-]+$', slug):
            return jsonify({'error': 'Invalid brand slug'}), 400
        
        # Check if inventory exists
        inventory_file = get_brand_inventory_path(slug)
        
        if not inventory_file.exists():
            return jsonify({
                'brand': slug,
                'exists': False,
                'vehicle_count': 0
            }), 200
        
        # Get file info
        file_stat = inventory_file.stat()
        
        # Count vehicles
        with open(inventory_file, 'r', encoding='utf-8') as f:
            inventory_data = json.load(f)
        
        vehicle_count = len(inventory_data) if isinstance(inventory_data, list) else 0
        
        return jsonify({
            'brand': slug,
            'exists': True,
            'vehicle_count': vehicle_count,
            'file_size': file_stat.st_size,
            'last_modified': file_stat.st_mtime
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to retrieve inventory info',
            'details': str(e)
        }), 500


@app.route('/api/brands/<slug>', methods=['DELETE'])
def delete_brand(slug):
    """Delete a preview configuration and reverse all creation tasks.

    Sequence (post-2026-05-07 audit refactor):
      1. SYNC: validate, snapshot domain info, delete the DB record + local files.
         The brand vanishes from the dashboard immediately.
      2. ASYNC (daemon thread, holds `_automation_critical_lock` for the apache+pm2
         section): Cloudflare DNS delete, Apache vhost disable + remove, apache2
         reload, PM2 restart with health verification.
    """
    try:
        sse_log_manager.info(f"Starting deletion of brand: {slug}", source="delete", metadata={"slug": slug})
        print(f"\n[DELETE PREVIEW] Processing deletion of: {slug}")

        if not slug or not re.match(r'^[a-z0-9-]+$', slug):
            return jsonify({'error': 'Invalid preview slug'}), 400

        if not preview_exists(slug):
            return jsonify({'error': f'Preview {slug} not found'}), 404

        # Snapshot domain info before we delete the DB row.
        preview_data = load_preview(slug)
        domain_host = ''
        host = ''
        if preview_data:
            raw_domain = preview_data.get('domain', '') or ''
            domain_host = normalize_host_or_url(raw_domain)
            if domain_host:
                host_no_port, _ = split_host_port(domain_host)
                host = strip_www(host_no_port).rstrip('.')

        def _add_site_candidate(candidates: list[str], value: str) -> None:
            site = (value or '').strip().lower()
            if not site:
                return
            site, _ = split_host_port(site)
            site = site.rstrip('.')
            site = re.sub(r'[^a-z0-9.-]', '', site)
            if site and site not in candidates:
                candidates.append(site)

        apache_site_candidates: list[str] = []
        # Note: we no longer add the bare slug as a candidate (the audit found it
        # always logs warnings because real vhost names are dotted hostnames).
        _add_site_candidate(apache_site_candidates, domain_host)
        _add_site_candidate(apache_site_candidates, host)
        if domain_host:
            stripped_host = strip_www(domain_host)
            _add_site_candidate(apache_site_candidates, stripped_host)
            stripped_no_port, _ = split_host_port(stripped_host)
            _add_site_candidate(apache_site_candidates, stripped_no_port)

        # Legacy compatibility: earlier provisioning removed hyphens in the first
        # label for some domains; clean both spellings up just in case.
        if host and '.' in host:
            labels = host.split('.')
            sanitized_left = labels[0].replace('-', '')
            if sanitized_left and sanitized_left != labels[0]:
                _add_site_candidate(apache_site_candidates, '.'.join([sanitized_left] + labels[1:]))

        # SYNC: delete local files + DB record so the dashboard reflects the
        # deletion immediately. Apache + DNS + PM2 cleanup runs in background.
        deleted_files: list[str] = []
        try:
            image_extensions = ('png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico')
            for ext in image_extensions:
                for image_type in ('logo', 'favicon', 'heroImage'):
                    image_file = PUBLIC_IMAGES_DIR / f'{slug}-{image_type}.{ext}'
                    if image_file.exists():
                        try:
                            image_file.unlink()
                            deleted_files.append(str(image_file))
                        except Exception as exc:
                            print(f"[DELETE] WARN: failed to remove {image_file}: {exc}")

            inventory_file = get_brand_inventory_path(slug)
            if inventory_file.exists():
                try:
                    inventory_file.unlink()
                    deleted_files.append(str(inventory_file))
                except Exception as exc:
                    print(f"[DELETE] WARN: failed to remove {inventory_file}: {exc}")
        except Exception as exc:
            print(f"[DELETE] WARN: local file cleanup failed: {exc}")

        delete_preview_record(slug)
        print(f"[DELETE] DB record removed for {slug}")

        # ASYNC: spawn cleanup thread. Captures the snapshot vars by closure.
        def _async_cleanup():
            try:
                is_dev_mode = _is_brand_automation_dev_mode()

                # 1. Delete Cloudflare DNS record (idempotent — treats missing as success).
                # CF API call works on Windows; only Apache + PM2 need dev-mode fallbacks.
                if host:
                    if is_dev_mode and str(os.environ.get('CLOUDFLARE_DISABLED', '')).strip().lower() in ('1', 'true', 'yes'):
                        print(f"[DELETE/ASYNC] DEV-MODE: would delete CF DNS for {host} (CLOUDFLARE_DISABLED)")
                    else:
                        print(f"[DELETE/ASYNC] DNS delete for {host}")
                        try:
                            from lib.cloudflare_dns import delete_dns_record
                            if not delete_dns_record(host):
                                print(f"[DELETE/ASYNC] WARN: DNS delete returned false for {host}")
                        except Exception as exc:
                            print(f"[DELETE/ASYNC] ERROR: DNS delete raised: {exc}")

                # 2. Apache vhost cleanup (skipped on dev mode — no Apache to talk to).
                if is_dev_mode:
                    dev_dir = _resolve_apache_sites_dir()
                    print(f"[DELETE/ASYNC] DEV-MODE: would a2dissite + remove vhost for {apache_site_candidates}")
                    # Best-effort: remove any matching files from the dev-vhosts dir
                    # so re-creating the brand starts fresh.
                    for site in apache_site_candidates:
                        for d in (dev_dir,):
                            try:
                                p = Path(d) / f'{site}.conf'
                                if p.exists():
                                    p.unlink()
                                    print(f"[DELETE/ASYNC] DEV-MODE: removed {p}")
                            except Exception as exc:
                                print(f"[DELETE/ASYNC] DEV-MODE: failed to remove dev vhost: {exc}")
                    # Skip the systemctl section entirely in dev mode.
                    if str(os.environ.get('PM2_RESTART_DISABLED', '')).strip().lower() not in ('1', 'true', 'yes'):
                        pm2_app = os.environ.get('PM2_NEXT_APP_NAME', 'app-brandstudio')
                        print(f"[DELETE/ASYNC] DEV-MODE: would pm2 restart {pm2_app}")
                    print(f"[DELETE/ASYNC] DONE for {slug} (dev-mode)")
                    return

                # 2. Apache vhost cleanup (under critical-section lock so we don't
                # race a concurrent create's reload).
                with _automation_critical_lock:
                    apache_sites_available_dir = Path(
                        os.environ.get('APACHE_SITES_AVAILABLE_DIR', '/etc/apache2/sites-available')
                    ).expanduser()
                    apache_sites_enabled_dir = Path(
                        os.environ.get('APACHE_SITES_ENABLED_DIR', '/etc/apache2/sites-enabled')
                    ).expanduser()
                    apache_changed = False

                    for site in apache_site_candidates:
                        try:
                            disable_result = subprocess.run(
                                ['a2dissite', f'{site}.conf'],
                                capture_output=True,
                                text=True,
                                timeout=10,
                            )
                            out_l = (
                                f"{disable_result.stdout or ''}\n{disable_result.stderr or ''}"
                            ).lower()
                            if disable_result.returncode == 0:
                                apache_changed = True
                                print(f"[DELETE/ASYNC] a2dissite OK for {site}")
                            elif any(token in out_l for token in ('already disabled', 'does not exist', 'not found')):
                                pass  # quiet — site already gone
                            else:
                                print(
                                    f"[DELETE/ASYNC] WARN: a2dissite {site}: "
                                    f"{(disable_result.stderr or disable_result.stdout or '').strip()}"
                                )
                        except Exception as exc:
                            print(f"[DELETE/ASYNC] WARN: a2dissite {site} raised: {exc}")

                        for config_path in (
                            apache_sites_available_dir / f'{site}.conf',
                            apache_sites_enabled_dir / f'{site}.conf',
                        ):
                            try:
                                if config_path.exists() or config_path.is_symlink():
                                    config_path.unlink()
                                    apache_changed = True
                                    print(f"[DELETE/ASYNC] removed {config_path}")
                            except Exception as exc:
                                print(f"[DELETE/ASYNC] WARN: failed to remove {config_path}: {exc}")

                    if apache_changed:
                        reload_result = subprocess.run(
                            ['systemctl', 'reload', 'apache2'],
                            capture_output=True, text=True, timeout=10,
                        )
                        if reload_result.returncode != 0:
                            print(f"[DELETE/ASYNC] WARN: apache reload failed: {reload_result.stderr}")
                            restart_result = subprocess.run(
                                ['systemctl', 'restart', 'apache2'],
                                capture_output=True, text=True, timeout=15,
                            )
                            if restart_result.returncode != 0:
                                print(f"[DELETE/ASYNC] ERROR: apache restart also failed: {restart_result.stderr}")

                # 3. PM2 restart with health check (also under the lock).
                if str(os.environ.get('PM2_RESTART_DISABLED', '')).strip().lower() not in ('1', 'true', 'yes'):
                    with _automation_critical_lock:
                        pm2_app = os.environ.get('PM2_NEXT_APP_NAME', 'app-brandstudio')
                        try:
                            subprocess.run(
                                f"pm2 restart {pm2_app}",
                                shell=True, capture_output=True, text=True, timeout=20,
                            )
                            if _pm2_wait_until_online(pm2_app, timeout=int(os.environ.get('PM2_HEALTH_TIMEOUT', '30'))):
                                print(f"[DELETE/ASYNC] PM2 OK: {pm2_app} online")
                            else:
                                print(f"[DELETE/ASYNC] WARN: PM2 app {pm2_app} did not return online in time")
                        except Exception as exc:
                            print(f"[DELETE/ASYNC] ERROR: pm2 restart raised: {exc}")

                print(f"[DELETE/ASYNC] DONE for {slug}")
            except Exception as exc:
                print(f"[DELETE/ASYNC] FATAL: {exc}")
                import traceback
                print(traceback.format_exc())

        threading.Thread(target=_async_cleanup, daemon=True).start()

        return jsonify({
            'success': True,
            'message': f"Preview '{slug}' deleted; DNS / Apache / PM2 cleanup running in background",
            'deleted_files': deleted_files,
        }), 200

    except Exception as e:
        print(f"[DELETE] ERROR: {e}")
        import traceback
        print(traceback.format_exc())
        return jsonify({'error': 'Failed to delete preview', 'details': str(e)}), 500


@app.route('/api/previews/<slug>', methods=['DELETE'])
def delete_preview(slug):
    """Legacy preview deletion endpoint."""
    return delete_brand(slug)


@app.route('/api/previews/<slug>/download', methods=['GET'])
def download_preview(slug):
    """Download preview configuration as JSON file."""
    config_code = request.args.get('config')
    if not config_code:
        preview_data = load_preview(slug)
        if not preview_data:
            return jsonify({'error': f'Preview {slug} not found'}), 404
        config_code = json.dumps(preview_data, indent=2, ensure_ascii=False)

    file_bytes = BytesIO(config_code.encode('utf-8'))
    file_bytes.seek(0)

    return send_file(
        file_bytes,
        mimetype='application/json',
        as_attachment=True,
        download_name=f'{slug}.json'
    )


# Database connection helper
def get_db_connection():
    """Get database connection using environment variables"""
    try:
        connection = pymysql.connect(
            host=os.environ.get('MYSQL_HOST', 'localhost'),
            user=os.environ.get('MYSQL_USER', 'root'),
            password=os.environ.get('MYSQL_PASSWORD', ''),
            database=os.environ.get('MYSQL_DATABASE', 'dealers_previews'),
            port=int(os.environ.get('MYSQL_PORT', 3306)),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        return connection
    except Exception as e:
        print(f"[DB] Connection error: {e}")
        return None

# API endpoint for creating new user
@app.route('/api/users', methods=['POST'])
@auth_manager.admin_required
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        # Validate required fields
        required_fields = ['name', 'email', 'password', 'role']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required'}), 400
        
        name = data['name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        role = data['role']
        
        # Validate role
        valid_roles = ['admin', 'manager', 'editor', 'viewer']
        if role not in valid_roles:
            return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400
        
        # Validate email format
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        with connection.cursor() as cursor:
            # Check if email already exists
            cursor.execute("SELECT id FROM auth_users WHERE email = %s", (email,))
            if cursor.fetchone():
                connection.close()
                return jsonify({'error': 'Email already exists'}), 400
            
            # Hash password
            import hashlib
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # Create user
            cursor.execute(
                """INSERT INTO auth_users (name, email, password_hash, role, is_active, created_at) 
                   VALUES (%s, %s, %s, %s, 1, NOW())""",
                (name, email, password_hash, role)
            )
            
            connection.commit()
        
        connection.close()
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'user': {
                'name': name,
                'email': email,
                'role': role,
                'is_active': True
            }
        }), 201
        
    except Exception as e:
        print(f"[API CREATE USER] Error: {e}")
        return jsonify({'error': 'Failed to create user', 'details': str(e)}), 500

# API endpoint for listing users
@app.route('/api/users', methods=['GET'])
@auth_manager.admin_required
def list_users():
    """Get list of all users with their roles"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        with connection.cursor() as cursor:
            # Get query parameters
            page = int(request.args.get('page', 1))
            limit = int(request.args.get('limit', 20))
            search = request.args.get('search', '').strip()
            role_filter = request.args.get('role', '').strip()
            
            offset = (page - 1) * limit
            
            # Build WHERE clause
            where_conditions = []
            params = []
            
            if search:
                where_conditions.append("(email LIKE %s OR name LIKE %s)")
                search_param = f"%{search}%"
                params.extend([search_param, search_param])
            
            if role_filter:
                where_conditions.append("role = %s")
                params.append(role_filter)
            
            where_clause = " WHERE " + " AND ".join(where_conditions) if where_conditions else ""
            
            # Get total count
            count_query = f"SELECT COUNT(*) as total FROM auth_users{where_clause}"
            cursor.execute(count_query, params)
            total = cursor.fetchone()['total']
            
            # Get users with pagination
            query = f"""
                SELECT id, email, name, role, is_active, 
                       last_login, created_at, password_hash
                FROM auth_users{where_clause}
                ORDER BY created_at DESC
                LIMIT %s OFFSET %s
            """
            cursor.execute(query, params + [limit, offset])
            users = cursor.fetchall()
        
        connection.close()
        
        return jsonify({
            'users': users,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            }
        }), 200
        
    except Exception as e:
        print(f"[API USERS] Error: {e}")
        return jsonify({'error': 'Failed to retrieve users', 'details': str(e)}), 500

# API endpoint for updating user role
@app.route('/api/users/<int:user_id>/role', methods=['PUT'])
@auth_manager.admin_required
def update_user_role(user_id):
    """Update user role"""
    try:
        data = request.get_json()
        if not data or 'role' not in data:
            return jsonify({'error': 'Role is required'}), 400
        
        new_role = data['role']
        valid_roles = ['admin', 'manager', 'editor', 'viewer']
        
        if new_role not in valid_roles:
            return jsonify({'error': f'Invalid role. Must be one of: {", ".join(valid_roles)}'}), 400
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        with connection.cursor() as cursor:
            # Check if user exists
            cursor.execute("SELECT id, email, role FROM auth_users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                connection.close()
                return jsonify({'error': 'User not found'}), 404
            
            # Prevent admin from removing their own admin role
            if session.get('user_id') == user_id and new_role != 'admin':
                connection.close()
                return jsonify({'error': 'Cannot remove your own admin role'}), 400
            
            # Update user role. Some deployments may not have an `updated_at` column;
            # if the column is missing, fall back to updating only the role.
            try:
                cursor.execute(
                    "UPDATE auth_users SET role = %s, updated_at = NOW() WHERE id = %s",
                    (new_role, user_id)
                )
            except Exception as ie:
                # Some MySQL drivers raise different exception types; check args for error number 1054
                err_no = None
                if hasattr(ie, 'args') and len(ie.args) > 0:
                    try:
                        err_no = int(ie.args[0])
                    except Exception:
                        err_no = None

                if err_no == 1054:
                    cursor.execute(
                        "UPDATE auth_users SET role = %s WHERE id = %s",
                        (new_role, user_id)
                    )
                else:
                    raise
            
            connection.commit()
        
        connection.close()
        
        return jsonify({
            'success': True,
            'message': f'User role updated successfully',
            'user_id': user_id,
            'old_role': user['role'],
            'new_role': new_role
        }), 200
        
    except Exception as e:
        print(f"[API USER ROLE] Error: {e}")
        return jsonify({'error': 'Failed to update user role', 'details': str(e)}), 500


# API endpoint for updating user password
@app.route('/api/users/<int:user_id>/password', methods=['PUT'])
@auth_manager.admin_required
def update_user_password(user_id):
    """Update a user's password"""
    try:
        data = request.get_json()
        if not data or 'password' not in data:
            return jsonify({'error': 'Password is required'}), 400

        new_password = data.get('password') or ''
        if not isinstance(new_password, str) or len(new_password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400

        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500

        import hashlib
        password_hash = hashlib.sha256(new_password.encode()).hexdigest()
        
        print(f"[PASSWORD UPDATE] User ID: {user_id}")
        print(f"[PASSWORD UPDATE] New password hash: {password_hash}")
        print(f"[PASSWORD UPDATE] Password length: {len(new_password)}")

        with connection.cursor() as cursor:
            # Ensure user exists
            cursor.execute("SELECT id, email FROM auth_users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            if not user:
                connection.close()
                return jsonify({'error': 'User not found'}), 404

            # Update user password
            result = cursor.execute(
                "UPDATE auth_users SET password_hash = %s WHERE id = %s",
                (password_hash, user_id)
            )
            print(f"[PASSWORD UPDATE] SQL Update result: {result}")
            print(f"[PASSWORD UPDATE] Rows affected: {cursor.rowcount}")
            
            if cursor.rowcount == 0:
                print(f"[PASSWORD UPDATE] WARNING: No rows affected. User ID: {user_id} may not exist.")
                # Let's check if the user actually exists
                cursor.execute("SELECT id, email FROM auth_users WHERE id = %s", (user_id,))
                user_check = cursor.fetchone()
                if user_check:
                    print(f"[PASSWORD UPDATE] User exists: {user_check}")
                    print(f"[PASSWORD UPDATE] This suggests a database permission or constraint issue.")
                else:
                    print(f"[PASSWORD UPDATE] User does not exist in database.")

            connection.commit()
            print(f"[PASSWORD UPDATE] Transaction committed")
            
            # Close current cursor and create new one for verification
            cursor.close()
            
            # Verify the update by querying the user back with a fresh cursor
            with connection.cursor() as verify_cursor:
                verify_cursor.execute("SELECT password_hash FROM auth_users WHERE id = %s", (user_id,))
                updated_user = verify_cursor.fetchone()
                if updated_user:
                    print(f"[PASSWORD UPDATE] Verification - New hash in DB: {updated_user['password_hash']}")
                    print(f"[PASSWORD UPDATE] Verification - Hashes match: {updated_user['password_hash'] == password_hash}")
                else:
                    print(f"[PASSWORD UPDATE] ERROR - Could not find user after update")

        connection.close()

        return jsonify({'success': True, 'message': 'Password updated successfully', 'user_id': user_id}), 200

    except Exception as e:
        print(f"[API USER PASSWORD] Error: {e}")
        return jsonify({'error': 'Failed to update password', 'details': str(e)}), 500

# API endpoint for toggling user active status
@app.route('/api/users/<int:user_id>/toggle-status', methods=['PUT'])
@auth_manager.admin_required
def toggle_user_status(user_id):
    """Toggle user active/inactive status"""
    try:
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        with connection.cursor() as cursor:
            # Check if user exists
            cursor.execute("SELECT id, email, is_active FROM auth_users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
            
            if not user:
                connection.close()
                return jsonify({'error': 'User not found'}), 404
            
            # Prevent admin from deactivating themselves
            if session.get('user_id') == user_id:
                connection.close()
                return jsonify({'error': 'Cannot deactivate your own account'}), 400
            
            # Toggle status. Gracefully handle missing `updated_at` column.
            new_status = 0 if user['is_active'] else 1
            try:
                cursor.execute(
                    "UPDATE auth_users SET is_active = %s, updated_at = NOW() WHERE id = %s",
                    (new_status, user_id)
                )
            except Exception as ie:
                err_no = None
                if hasattr(ie, 'args') and len(ie.args) > 0:
                    try:
                        err_no = int(ie.args[0])
                    except Exception:
                        err_no = None

                if err_no == 1054:
                    cursor.execute(
                        "UPDATE auth_users SET is_active = %s WHERE id = %s",
                        (new_status, user_id)
                    )
                else:
                    raise
            
            connection.commit()
        
        connection.close()
        
        return jsonify({
            'success': True,
            'message': f'User {"activated" if new_status else "deactivated"} successfully',
            'user_id': user_id,
            'is_active': bool(new_status)
        }), 200
        
    except Exception as e:
        print(f"[API USER STATUS] Error: {e}")
        return jsonify({'error': 'Failed to update user status', 'details': str(e)}), 500

# Admin user/role management (placeholder view)
@app.route('/admin/users', methods=['GET'])
@auth_manager.admin_required
def admin_users():
    """Render a simple users and roles management page.

    This is a placeholder view. Implement user listing and role management
    functionality in this endpoint or a blueprint as needed.
    """
    try:
        return render_template('users.html')
    except Exception as e:
        print(f"[ADMIN USERS] Render error: {e}")
        return "Users management page not available", 500


@app.route('/api/brands/<slug>/download', methods=['GET'])
def download_brand(slug):
    """Legacy download endpoint."""
    return download_preview(slug)


@app.route('/api/logs/stream', methods=['GET'])
def stream_logs():
    """SSE endpoint for real-time log streaming"""
    def generate():
        client_id = f"client_{request.remote_addr}_{int(time.time())}"
        
        try:
            # Log connection
            sse_log_manager.info(f"Client connected to log stream: {client_id}", source="sse")
            
            # Send immediate test log
            sse_log_manager.info("SSE stream is active and ready", source="sse")
            
            # Stream events
            for event in sse_log_manager.generate_events(client_id):
                yield event
                
        except GeneratorExit:
            # Client disconnected
            sse_log_manager.info(f"Client disconnected from log stream: {client_id}", source="sse")
        except Exception as e:
            # Error occurred
            sse_log_manager.error(f"Error in log stream for {client_id}: {str(e)}", source="sse")
    
    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        }
    )


@app.route('/api/logs', methods=['GET'])
@auth_manager.login_required
def get_logs():
    """Get recent log entries"""
    try:
        count = request.args.get('count', 100, type=int)
        level = request.args.get('level')
        
        logs = sse_log_manager.get_recent_logs(count)
        
        # Filter by level if specified
        if level:
            logs = [log for log in logs if log.get('level') == level]
        
        return jsonify({
            'logs': logs,
            'total': len(logs),
            'subscribers': sse_log_manager.get_subscriber_count()
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to get logs', 'details': str(e)}), 500


@app.route('/api/logs', methods=['POST'])
@auth_manager.login_required
def create_log():
    """Create a new log entry (for testing or manual logging)"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        level = data.get('level', 'info')
        message = data['message']
        source = data.get('source', 'manual')
        metadata = data.get('metadata', {})
        
        # Map level string to LogLevel enum
        from lib.sse_log_manager import LogLevel
        level_map = {
            'debug': LogLevel.DEBUG,
            'info': LogLevel.INFO,
            'warning': LogLevel.WARNING,
            'error': LogLevel.ERROR,
            'critical': LogLevel.CRITICAL
        }
        
        log_level = level_map.get(level.lower(), LogLevel.INFO)
        sse_log_manager.log(log_level, message, source, metadata)
        
        return jsonify({'success': True, 'message': 'Log entry created'})
        
    except Exception as e:
        return jsonify({'error': 'Failed to create log', 'details': str(e)}), 500


@app.route('/api/logs/clear', methods=['DELETE'])
@auth_manager.admin_required
def clear_logs():
    """Clear all log history"""
    try:
        sse_log_manager.clear_logs()
        sse_log_manager.info("Log history cleared by admin", source="sse")
        return jsonify({'success': True, 'message': 'Log history cleared'})
        
    except Exception as e:
        return jsonify({'error': 'Failed to clear logs', 'details': str(e)}), 500


@app.route('/logs-demo')
@auth_manager.login_required
def logs_demo():
    """Render log streaming demo page"""
    return render_template('logs-demo.html', preview_count=len(previews))


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'app': 'Brand Dashboard'}), 200


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Brand Dashboard (Flask)")
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=5000)
    parser.add_argument("--debug", action="store_true", default=True)
    parser.add_argument(
        "--init-previews-db",
        action="store_true",
        help="Create the previews table in the configured database and exit.",
    )

    # (local admin CLI options removed)

    args = parser.parse_args()

    if args.init_previews_db:
        init_db()
        print(f"[DB] previews ready: {preview_store.location()}")
        sys.exit(0)

    # Local admin creation via CLI has been removed.

    print(f"Brand Dashboard running at http://{args.host}:{args.port}")
    print("Visit http://localhost:5000 to get started")
    app.run(debug=args.debug, host=args.host, port=args.port)
