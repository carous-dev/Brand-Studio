"""DNS helpers (nslookup, dig propagation validation).

`nslookup_resolves` and `dig_resolves` ARE used by app.py. `validate_dns_after_automation`
is also defined here but is shadowed by a copy in app.py (see app.py:522). The app.py
copy is the one that runs. See docs/FEATURE_LOG.md (2026-05-07 audit) for the
consolidation plan.
"""

import re
import socket
import subprocess
import time
import os
from typing import List, Tuple

from backend.services.domain import extract_hostname


def nslookup_resolves(hostname: str) -> Tuple[bool, List[str], str]:
    hostname = (hostname or '').strip().lower()
    if not hostname:
        return (False, [], '')

    if not re.fullmatch(r'[a-z0-9.-]+', hostname):
        return (False, [], '')

    try:
        result = subprocess.run(
            ['nslookup', hostname],
            capture_output=True,
            text=True,
            timeout=6,
            check=False,
        )
        out = (result.stdout or '') + '\n' + (result.stderr or '')
        out_l = out.lower()
        if any(token in out_l for token in ('non-existent domain', "can't find", 'nxdomain', 'server failed', 'timed out')):
            return (False, [], out)

        addresses: List[str] = []
        for line in out.splitlines():
            s = line.strip()
            if not s.lower().startswith('address'):
                continue
            parts = s.split(':', 1)
            if len(parts) != 2:
                continue
            candidate = parts[1].strip()
            if candidate:
                addresses.append(candidate)

        ok = len(addresses) > 0 or ('name:' in out_l and 'address' in out_l)
        return (ok, addresses, out)
    except FileNotFoundError:
        try:
            ip = socket.gethostbyname(hostname)
            return (bool(ip), [ip] if ip else [], '')
        except Exception:
            return (False, [], '')
    except Exception as exc:
        return (False, [], str(exc))


def dig_resolves(hostname: str) -> Tuple[bool, List[str], str]:
    """Attempt resolution via dig against Cloudflare (1.1.1.1) to avoid local cache issues."""
    try:
        result = subprocess.run(
            ['dig', '+short', '@1.1.1.1', hostname],
            capture_output=True,
            text=True,
            timeout=6,
            check=False,
        )
        out = (result.stdout or '') + '\n' + (result.stderr or '')
        lines = [l.strip() for l in result.stdout.splitlines() if l.strip()]
        addresses = [l for l in lines if re.match(r'^([0-9]{1,3}\.){3}[0-9]{1,3}$', l) or ':' in l]
        ok = len(addresses) > 0
        return (ok, addresses, out)
    except Exception as exc:
        return (False, [], str(exc))


def validate_dns_after_automation(brand: dict, timeout_seconds: int = 30) -> Tuple[bool, str]:
    try:
        domain_value = brand.get('domain') or ''
        hostname = extract_hostname(domain_value)
        if not hostname:
            return (False, 'Missing domain for DNS validation')

        max_wait = int(os.environ.get('DNS_VALIDATE_TIMEOUT', timeout_seconds) or timeout_seconds)
        for attempt in range(max_wait):
            ok, addresses, raw = nslookup_resolves(hostname)
            if not ok:
                ok, addresses, raw = dig_resolves(hostname)

            if ok:
                return (True, f'DNS resolved successfully for {hostname} -> {addresses}')

            if attempt < max_wait - 1:
                time.sleep(1)

        return (False, f'DNS not resolved for {hostname} after {max_wait} seconds')
    except Exception as exc:
        return (False, f'DNS validation failed: {str(exc)}')
