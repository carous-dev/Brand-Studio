#!/usr/bin/env python3
"""register_preview_brand.py — register a dealer preview brand in brandstudio.

Creates (or updates) a row in the previews MySQL table and (by default) fires
the existing `maybe_start_linux_brand_automation` flow used by /api/brands.
That automation:
  - Short-circuits cleanly for any `<slug>.lvh.me` (or other wildcard-DNS
    base) — the browser resolves it to 127.0.0.1 via public DNS, Next routes
    by host header, no Apache/Cloudflare/PM2 needed.
  - For real production domains (e.g. `dealer.carous.co.uk`): provisions
    Cloudflare DNS, writes Apache vhost from `vhost_template.conf`, reloads
    apache2, and (optionally) restarts pm2.

Skips Flask auth (calls into the upsert directly) so it can run from CI /
scripts without needing a session.

Usage (minimal):
    python tools/register_preview_brand.py \\
        --slug <slug> \\
        --name "<Display Name>" \\
        --domain <slug>.preview.brandstudio.local \\
        --theme-id <theme-id> \\
        --primary "#RRGGBB" \\
        --logo /uploads/<file>.png

All other fields have sensible placeholder defaults (the dashboard's
`/update/<slug>` page can refine them later). Reads MYSQL_* from the .env
file at the brandstudio root.

Output: a one-line JSON summary on stdout (success path) or non-zero exit
with an error JSON on failure. Designed to be parsed by the SKILL.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import re
from datetime import datetime, timezone

# Make sibling preview_store importable
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(THIS_DIR)
sys.path.insert(0, PROJECT_ROOT)


def _load_dotenv() -> None:
    """Load MYSQL_* variables from .env at the project root if not in env yet."""
    dotenv_path = os.path.join(PROJECT_ROOT, '.env')
    if not os.path.isfile(dotenv_path):
        return
    try:
        with open(dotenv_path, 'r', encoding='utf-8') as f:
            for raw in f:
                line = raw.strip()
                if not line or line.startswith('#') or '=' not in line:
                    continue
                key, _, value = line.partition('=')
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if not key.startswith('MYSQL_'):
                    continue
                os.environ.setdefault(key, value)
    except OSError as exc:
        print(json.dumps({'ok': False, 'error': f'failed to read .env: {exc}'}), file=sys.stderr)


def _hex_to_rgb(hex_color: str) -> str:
    """'#004080' → '0, 64, 128'. Matches the helper in app.py for consistency."""
    h = (hex_color or '').lstrip('#').strip()
    if len(h) == 3:
        h = ''.join(c + c for c in h)
    if len(h) != 6:
        return '0, 0, 0'
    try:
        return f'{int(h[0:2], 16)}, {int(h[2:4], 16)}, {int(h[4:6], 16)}'
    except ValueError:
        return '0, 0, 0'


def _normalize_slug(value: str) -> str:
    s = (value or '').strip().lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = s.strip('-')
    return s


def _undo_msys_path(value):
    """Defensive fix for git-bash on Windows mangling leading-slash paths.
    Git-bash converts a CLI arg like "/themes/foo.jpg" into
    "C:/Program Files/Git/themes/foo.jpg" before the script ever sees it.
    For brand asset paths we want the Next-relative URL preserved.
    """
    if not isinstance(value, str):
        return value
    msys_prefixes = (
        'C:/Program Files/Git',
        'C:\\Program Files\\Git',
        'C:/Program Files (x86)/Git',
        'C:\\Program Files (x86)\\Git',
    )
    for prefix in msys_prefixes:
        if value.startswith(prefix):
            stripped = value[len(prefix):]
            # Normalize backslashes and ensure single leading slash
            stripped = stripped.replace('\\', '/')
            if not stripped.startswith('/'):
                stripped = '/' + stripped
            return stripped
    return value


def build_brand_config(args: argparse.Namespace) -> dict:
    """Compose a BrandConfig dict matching brands/types.ts."""
    slug = _normalize_slug(args.slug)
    if not slug:
        raise ValueError('slug is required and must be non-empty after normalization')

    # Defensively undo MSYS path mangling on path-like args. Git-bash will
    # have already mutated these by the time argparse sees them, so this is
    # the catch-all fix.
    args.logo = _undo_msys_path(args.logo)
    args.hero = _undo_msys_path(args.hero)

    primary = args.primary or '#0f172a'
    primary_dark = args.primary_dark or primary
    accent = args.accent or primary
    bg = args.bg or '#ffffff'
    text = args.text or '#0f1623'

    # Default to a wildcard-DNS local-preview host (`<slug>.lvh.me`).
    # lvh.me is a public DNS service that resolves all subdomains to 127.0.0.1
    # — no hosts-file edit, no Apache, no admin needed. brandstudio's
    # `getBrandFromHost` already extracts the first subdomain as the brand
    # slug, and `maybe_start_linux_brand_automation` short-circuits cleanly
    # for any host in `LOCAL_PREVIEW_BASE_DOMAINS` (lvh.me, localtest.me, etc).
    # For real production previews, pass `--domain dealer.carous.co.uk` (or
    # any non-local-preview-base host) and the automation will provision DNS
    # + Apache vhost + cert via the standard flow.
    config: dict = {
        'slug': slug,
        'name': args.name or slug.replace('-', ' ').title(),
        'domain': args.domain or f'{slug}.lvh.me',
        'themeId': args.theme_id,
        'logo': args.logo or '/images/placeholder-logo.png',
        'tagline': args.tagline or '',
        'aaApprovedDealer': bool(args.aa_approved),

        'theme': {
            'colors': {
                'primaryColor': primary,
                'primaryColorRgb': _hex_to_rgb(primary),
                'secondaryColor': primary_dark,
                'accentColor': accent,
                'backgroundColor': bg,
                'textColor': text,
                'mutedColor': '#6b7280',
                'borderColor': '#e5e7eb',
                'surfaceColor': '#ffffff',
            },
            'fonts': {
                'ui': args.font_body or "'Inter', 'Segoe UI', sans-serif",
                'brand': args.font_heading or args.font_body or "'Inter', 'Segoe UI', sans-serif",
            },
            'id': args.theme_id,
        },

        'location': {
            'phone': args.phone or '',
            'email': args.email or '',
            'fullAddress': ', '.join(filter(None, [
                args.address_line1, args.city, args.county, args.postcode,
            ])),
            'address': {
                'line1': args.address_line1 or '',
                'line2': args.address_line2 or '',
                'city': args.city or '',
                'county': args.county or '',
                'postcode': args.postcode or '',
            },
        },

        'seo': {
            'title': args.seo_title or f"{args.name or slug.replace('-', ' ').title()} — used cars",
            'description': args.seo_description or args.tagline or f"Used cars at {args.name or slug}",
            'keywords': [k.strip() for k in (args.keywords or '').split(',') if k.strip()],
        },

        'aboutUs': {
            'description': args.about or args.tagline or '',
        },

        'openingHours': {
            'Monday': '09:00 - 18:00',
            'Tuesday': '09:00 - 18:00',
            'Wednesday': '09:00 - 18:00',
            'Thursday': '09:00 - 18:00',
            'Friday': '09:00 - 18:00',
            'Saturday': '10:00 - 17:00',
            'Sunday': 'Closed',
        },
    }

    if args.hero:
        config['heroImage'] = args.hero

    # Per-page image slots from --images <json-path>. The JSON is the manifest
    # output by tools/fetch-theme-images.mjs (`{themeId, archetype, images: {hero: {localPath}, ...}}`).
    # We pull each slot's localPath and write it as brand.images.<slot>.
    if args.images:
        images_path = _undo_msys_path(args.images)
        try:
            with open(images_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
        except (OSError, json.JSONDecodeError) as exc:
            raise ValueError(f'Failed to read --images manifest at {images_path}: {exc}')

        manifest_images = manifest.get('images') if isinstance(manifest, dict) else None
        if isinstance(manifest_images, dict):
            slot_paths: dict = {}
            for slot, info in manifest_images.items():
                if isinstance(info, dict) and isinstance(info.get('localPath'), str):
                    slot_paths[slot] = info['localPath']
            if slot_paths:
                config['images'] = slot_paths

    return config


def upsert(config: dict) -> dict:
    """Upsert the brand row using the existing preview_store helper."""
    from preview_store import PreviewStore  # type: ignore

    store = PreviewStore()
    slug = config['slug']
    now = datetime.now(timezone.utc).isoformat()
    payload = json.dumps(config, indent=2, ensure_ascii=False)

    existed = store.exists(slug)
    store.upsert_row(
        slug=slug,
        name=config['name'],
        created_at=now,
        updated_at=now,
        config_json=payload,
    )

    return {
        'ok': True,
        'slug': slug,
        'name': config['name'],
        'themeId': config.get('themeId'),
        'domain': config.get('domain'),
        'action': 'updated' if existed else 'created',
        'storage': store.location(),
    }


def fire_automation(config: dict) -> dict:
    """Invoke brandstudio's existing `maybe_start_linux_brand_automation`.

    On a local-preview base host (lvh.me etc.), this short-circuits and just
    sets the automation state to `provisioned` with a clickable preview URL.
    On a real production domain, it runs the full Cloudflare DNS + Apache
    vhost + reload flow (or, in dev mode on Windows, logs the steps and
    writes the vhost to `dev-vhosts/` for inspection).

    Returns a small summary dict; errors are caught and surfaced in `error`.
    """
    # app.py prints a startup banner with emoji on import (and the automation
    # function itself logs progress with emoji). On Windows the default
    # console codec is cp1252 which can't encode those characters and would
    # crash the script. `reconfigure(errors='replace')` is non-destructive —
    # it mutates the existing TextIOWrapper without closing the underlying
    # buffer — so JSON output after fire_automation still works.
    if hasattr(sys.stdout, 'reconfigure'):
        try:
            sys.stdout.reconfigure(encoding='utf-8', errors='replace')
            sys.stderr.reconfigure(encoding='utf-8', errors='replace')
        except (AttributeError, ValueError):
            pass
    try:
        from app import maybe_start_linux_brand_automation  # type: ignore
    except Exception as exc:  # noqa: BLE001
        return {'invoked': False, 'error': f'failed to import automation: {exc}'}

    try:
        maybe_start_linux_brand_automation(config)
        return {'invoked': True, 'domain': config.get('domain')}
    except Exception as exc:  # noqa: BLE001 — surface anything for the caller
        return {'invoked': True, 'error': f'{type(exc).__name__}: {exc}'}


def derive_preview_url(config: dict) -> str:
    """Best-effort URL the user can click to see the preview.

    For local-preview-base hosts (e.g. `<slug>.lvh.me`), append the dev port.
    For real domains, use https.
    """
    domain = (config.get('domain') or '').strip()
    if not domain:
        return ''
    # Heuristic: any of the wildcard-DNS local bases means port 3000 dev.
    local_bases = ('.lvh.me', '.localtest.me', '.localhost.test', '.sslip.io', '.nip.io')
    lower = domain.lower()
    if any(lower.endswith(b) for b in local_bases) or lower.startswith('localhost'):
        # Don't double-up on a port if one was supplied explicitly.
        if ':' in domain:
            return f'http://{domain}/'
        return f'http://{domain}:3000/'
    return f'https://{domain}/'


def main() -> int:
    _load_dotenv()

    parser = argparse.ArgumentParser(description='Register a brandstudio preview brand pointing at a theme.')
    parser.add_argument('--slug', required=True)
    parser.add_argument('--name', required=True)
    parser.add_argument('--theme-id', required=True)
    parser.add_argument('--domain', help='Defaults to <slug>.preview.brandstudio.local')
    parser.add_argument('--primary', help='Primary color hex (e.g. #004080)')
    parser.add_argument('--primary-dark')
    parser.add_argument('--accent')
    parser.add_argument('--bg', help='Page background (default #ffffff)')
    parser.add_argument('--text', help='Body text color (default #0f1623)')
    parser.add_argument('--logo')
    parser.add_argument('--hero', help='Hero image URL or path (e.g. /themes/<id>/hero.jpg)')
    parser.add_argument('--phone')
    parser.add_argument('--email')
    parser.add_argument('--address-line1')
    parser.add_argument('--address-line2')
    parser.add_argument('--city')
    parser.add_argument('--county')
    parser.add_argument('--postcode')
    parser.add_argument('--tagline')
    parser.add_argument('--about', help='1-paragraph aboutUs.description')
    parser.add_argument('--seo-title')
    parser.add_argument('--seo-description')
    parser.add_argument('--keywords', help='Comma-separated keywords')
    parser.add_argument('--font-heading')
    parser.add_argument('--font-body')
    parser.add_argument('--aa-approved', action='store_true')
    parser.add_argument('--no-automation', action='store_true',
                        help='Skip maybe_start_linux_brand_automation. Useful for tests / dry runs.')
    parser.add_argument('--images',
                        help='Path to a fetch-theme-images.mjs manifest JSON. Slot localPaths get written to brand.images.<slot>.')

    args = parser.parse_args()

    try:
        config = build_brand_config(args)
        result = upsert(config)
    except Exception as exc:  # noqa: BLE001 — we want to surface any failure
        print(json.dumps({'ok': False, 'error': str(exc), 'errorType': type(exc).__name__}), file=sys.stderr)
        return 1

    if not args.no_automation:
        result['automation'] = fire_automation(config)
    else:
        result['automation'] = {'invoked': False, 'reason': '--no-automation'}

    result['previewUrl'] = derive_preview_url(config)

    print(json.dumps(result, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())
