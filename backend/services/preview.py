"""Preview persistence helpers and validation logic."""

import json
import logging
import re
from datetime import datetime
from typing import Any, Dict, Iterable, List, Optional, Tuple

from backend.services.theme_catalog import get_theme_name, resolve_theme_id
from preview_store import PreviewStore

logger = logging.getLogger(__name__)

preview_store = PreviewStore()


def parse_bool_flag(value: Any) -> bool:
    """Normalize mixed checkbox/json values to a strict boolean."""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value == 1
    if isinstance(value, str):
        return value.strip().lower() in ('1', 'true', 'yes', 'on')
    return False


def init_db() -> None:
    """Ensure preview storage is ready to accept rows."""
    preview_store.init_schema()


def normalize_brand_colors(config: Dict[str, Any], *, overwrite_theme_with_root: bool) -> Dict[str, Any]:
    """Keep theme.colors as the single source of color truth."""
    if not isinstance(config, dict):
        return {}

    root_color_keys = (
        'primaryColor',
        'secondaryColor',
        'accentColor',
        'backgroundColor',
        'textColor',
    )
    theme = config.get('theme') if isinstance(config.get('theme'), dict) else {}
    theme = dict(theme)
    colors = theme.get('colors') if isinstance(theme.get('colors'), dict) else {}
    colors = dict(colors)

    for key in root_color_keys:
        root_val = config.get(key)
        if isinstance(root_val, str) and root_val.strip():
            if overwrite_theme_with_root:
                colors[key] = root_val.strip()
            else:
                colors.setdefault(key, root_val.strip())

    if colors:
        theme['colors'] = colors
        config['theme'] = theme

    for key in root_color_keys:
        config.pop(key, None)

    return config


def normalize_brand_services(config: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize legacy and current services structures."""
    if not isinstance(config, dict):
        return {}

    pages = config.get('pages') if isinstance(config.get('pages'), dict) else {}
    pages_services = pages.get('services') if isinstance(pages.get('services'), dict) else {}
    services_title_fallback = (
        config.get('servicesTitle')
        or (pages_services.get('hero', {}).get('title') if isinstance(pages_services.get('hero'), dict) else None)
        or 'Our Services'
    )

    services = config.get('services')
    if isinstance(services, list):
        services = {'title': services_title_fallback, 'items': services}

    if isinstance(services, dict):
        title = services.get('title') or services_title_fallback
        items = services.get('items') if isinstance(services.get('items'), list) else []

        deduped: List[Dict[str, str]] = []
        seen: set[Tuple[str, str]] = set()
        for item in items:
            if not isinstance(item, dict):
                continue
            t = (item.get('title') or '').strip()
            d = (item.get('description') or '').strip()
            if not t and not d:
                continue
            key = (t.lower(), d.lower())
            if key in seen:
                continue
            seen.add(key)
            deduped.append({'title': t, 'description': d})

        config['services'] = {'title': title, 'items': deduped}

        if isinstance(pages_services, dict):
            pages_services.setdefault('hero', {})
            if isinstance(pages_services.get('hero'), dict) and title:
                pages_services['hero'].setdefault('title', title)
            pages_services['services'] = deduped
            pages['services'] = pages_services
            config['pages'] = pages

    config.pop('servicesTitle', None)
    return config


def normalize_theme_selection(config: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize theme selection to theme.id (with legacy root compatibility)."""
    if not isinstance(config, dict):
        return {}

    theme = config.get('theme') if isinstance(config.get('theme'), dict) else {}
    theme = dict(theme)

    raw_theme_id = (
        config.get('themeId')
        or config.get('theme_id')
        or theme.get('id')
        or theme.get('themeId')
    )
    resolved_theme_id = resolve_theme_id(raw_theme_id, fallback_to_default=True)

    theme['id'] = resolved_theme_id
    theme['themeId'] = resolved_theme_id
    config['theme'] = theme
    config['themeId'] = resolved_theme_id

    config.pop('theme_id', None)
    return config


def normalize_brand_flags(config: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize simple boolean flags stored at root-level."""
    if not isinstance(config, dict):
        return {}

    if 'aaApprovedDealer' in config or 'aa_approved_dealer' in config:
        raw = config.get('aaApprovedDealer', config.get('aa_approved_dealer'))
        config['aaApprovedDealer'] = parse_bool_flag(raw)
        config.pop('aa_approved_dealer', None)

    return config


def extract_preview_payload(data: Any) -> Any:
    """Unwrap {preview: {...}} payloads."""
    if isinstance(data, dict) and isinstance(data.get('preview'), dict):
        return data['preview']
    return data


_PRESERVED_INTERNAL_KEYS = ('_automation',)


def strip_internal_fields(config: Any) -> Dict[str, Any]:
    """Drop transient internal metadata (_-prefixed) before persisting.

    Exception: `_automation` is preserved so the provisioning-lifecycle status
    survives brand updates (otherwise every dashboard edit would wipe the
    status badge). Read-side keys like `_created_at` / `_updated_at` are still
    stripped because they're re-derived from the row's columns on the next read.
    """
    if not isinstance(config, dict):
        return {}
    return {
        key: value
        for key, value in config.items()
        if not (
            isinstance(key, str)
            and key.startswith('_')
            and key not in _PRESERVED_INTERNAL_KEYS
        )
    }


def deep_merge(base: Any, override: Any) -> Any:
    """Recursively merge dicts, replacing scalars/lists with the override."""
    if isinstance(base, dict) and isinstance(override, dict):
        merged = dict(base)
        for key, value in override.items():
            merged[key] = deep_merge(merged.get(key), value) if key in merged else value
        return merged
    return override


def serialize_preview_row(row: Dict[str, Any]) -> Dict[str, Any]:
    """Serialize preview rows from the store with computed metadata."""
    config = json.loads(row['config'])
    config = normalize_brand_colors(config, overwrite_theme_with_root=False)
    config = normalize_brand_services(config)
    config = normalize_theme_selection(config)
    config = normalize_brand_flags(config)
    config.setdefault('slug', row['slug'])
    config.setdefault('name', row['name'])
    config['_created_at'] = row['created_at']
    config['_updated_at'] = row['updated_at']
    config['_theme_name'] = get_theme_name(config.get('themeId'))
    return config


def list_previews() -> List[Dict[str, Any]]:
    rows = preview_store.list_rows()
    return [serialize_preview_row(row) for row in rows]


def list_previews_paginated(*, page: int, per_page: int, search: str = '') -> Dict[str, Any]:
    page = max(int(page or 1), 1)
    per_page = max(min(int(per_page or 8), 100), 1)
    offset = (page - 1) * per_page

    total, rows = preview_store.list_paginated_rows(
        limit=per_page,
        offset=offset,
        search=(search or '').strip() or None,
    )
    previews = [serialize_preview_row(row) for row in rows]

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


def load_preview(slug: str) -> Optional[Dict[str, Any]]:
    row = preview_store.load_row(slug)
    if not row:
        return None
    return serialize_preview_row(row)


def preview_exists(slug: str) -> bool:
    return preview_store.exists(slug)


def upsert_preview(slug: str, config: Dict[str, Any]) -> None:
    config = dict(config) if isinstance(config, dict) else {}
    config = normalize_brand_colors(config, overwrite_theme_with_root=True)
    config = normalize_brand_services(config)
    config = normalize_theme_selection(config)
    config = normalize_brand_flags(config)
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


def delete_preview_record(slug: str) -> None:
    preview_store.delete_row(slug)


def get_existing_previews() -> List[str]:
    return [preview['slug'] for preview in list_previews()]


def preview_store_location() -> str:
    return preview_store.location()


def normalize_slug(raw: str) -> str:
    """Normalize to a consistent, hyphen-free slug for domains."""

    raw = (raw or '').lower()
    # Strip everything that isn't alphanumeric, remove whitespace/hyphens entirely
    raw = re.sub(r'[^a-z0-9]', '', raw)
    return raw


def looks_like_brand_config(payload: Any) -> bool:
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


def validate_brand(data: Dict[str, Any]) -> List[str]:
    errors: List[str] = []

    def safe_strip(val: Any) -> Any:
        return val.strip() if isinstance(val, str) else val

    if not safe_strip(data.get('name', '')):
        errors.append('Brand name is required')
    if not safe_strip(data.get('slug', '')):
        errors.append('Brand slug is required')
    if not safe_strip(data.get('tagline', '')):
        errors.append('Tagline is required')
    if not safe_strip(data.get('domain', '')):
        errors.append('Domain is required')

    location = data.get('location', {})
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

    seo = data.get('seo', {})
    if not safe_strip(data.get('seoTitle', '') or seo.get('title', '')):
        errors.append('SEO title is required')
    if not safe_strip(data.get('seoDesc', '') or seo.get('description', '')):
        errors.append('SEO description is required')

    keywords = data.get('keywords', None)
    if keywords is None and 'seo' in data:
        keywords = data['seo'].get('keywords', '')

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

    if not keywords or len(keywords) == 0:
        errors.append('At least one keyword is required')

    theme = data.get('theme') if isinstance(data.get('theme'), dict) else {}
    colors = theme.get('colors', {}) if isinstance(theme.get('colors'), dict) else {}
    accent_color = data.get('accentColor', '') or colors.get('accentColor', '')
    if not accent_color:
        errors.append('Accent color is required')
    elif not re.match(r'^#[0-9A-Fa-f]{6}$', accent_color):
        errors.append('Accent color must be a valid hex color (e.g., #d4af37)')

    resolved_theme_id = resolve_theme_id(
        data.get('themeId') or theme.get('id') or theme.get('themeId'),
        fallback_to_default=False,
    )
    if data.get('themeId') or theme.get('id') or theme.get('themeId'):
        if not resolved_theme_id:
            errors.append('Theme id is invalid or unsupported')

    normalized = normalize_theme_selection(data)
    data.update(normalized)
    data['aaApprovedDealer'] = parse_bool_flag(
        data.get('aaApprovedDealer', data.get('aa_approved_dealer'))
    )
    data.pop('aa_approved_dealer', None)

    return errors
