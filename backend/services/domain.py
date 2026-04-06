"""Utilities for domain/host normalization."""

import os
from urllib.parse import urlparse


def normalize_domain(domain: str) -> str:
    """Ensure domains always include http:// or https:// for persistence."""
    if not isinstance(domain, str):
        return ''
    domain = domain.strip()
    if domain and not domain.startswith('http://') and not domain.startswith('https://'):
        return f'http://{domain}'
    return domain


def extract_hostname(value: str) -> str:
    value = (value or '').strip()
    if not value:
        return ''
    try:
        parsed = urlparse(value if '://' in value else f'https://{value}')
        host = (parsed.hostname or '').strip().lower()
        return host
    except Exception:
        return ''


def strip_www(host: str) -> str:
    host = (host or '').strip().lower()
    return host[4:] if host.startswith('www.') else host


def split_host_port(host: str) -> tuple[str, str]:
    host = (host or '').strip().lower()
    if not host:
        return ('', '')

    if host.startswith('[') and ']' in host:
        end = host.find(']')
        ipv6 = host[1:end]
        rest = host[end + 1:]
        if rest.startswith(':'):
            return (ipv6, f'{ipv6}{rest}')
        return (ipv6, ipv6)

    if ':' in host:
        no_port = host.split(':', 1)[0]
        return (no_port, host)

    return (host, host)


def normalize_host_or_url(value: str) -> str:
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


def is_dev_request_host(host: str) -> bool:
    host = (host or '').strip().lower()
    if not host:
        return True
    host = host.split(':', 1)[0]
    return host in ('localhost', '127.0.0.1') or host.endswith('.local')


def is_dev_environment() -> bool:
    env = str(
        os.environ.get('FLASK_ENV')
        or os.environ.get('APP_ENV')
        or os.environ.get('ENV')
        or ''
    ).strip().lower()
    return env in ('dev', 'development', 'local')
