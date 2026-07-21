"""Shared theme catalog loader for Flask APIs and preview validation."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List


PROJECT_ROOT = Path(__file__).resolve().parents[2]
THEME_MANIFEST_PATH = PROJECT_ROOT / "theme" / "theme-manifest.json"
THEME_CONTRACTS_ROOT = PROJECT_ROOT / "app" / "themes"
THEME_META_FILENAME = "theme.json"
THEME_REQUIRED_FILES = (
    "shell.tsx",
    "pages.ts",
    "sections/index.tsx",
    "recipes/index.ts",
    "tokens.ts",
    # Shared theme-contract additions (all 14 themes conform as of the
    # standardization; see docs/theme-contract.md + tools/check-theme-contract.mjs).
    # A theme missing any of these is dropped from the catalog, so keep this in
    # lockstep with the conformance checker — only add a file here once every
    # shipped theme actually has it.
    "context/BrandStyles.tsx",
    "styles/color-policy.css",
    "lib/contact.ts",
)

FALLBACK_CATALOG: Dict[str, Any] = {
    "version": 1,
    "defaultTheme": "classic-dealer",
    "themes": [
        {
            "id": "classic-dealer",
            "name": "Classic Dealer",
            "description": "Current production-compatible theme.",
            "status": "stable",
        }
    ],
}


def _normalize_theme_entry(item: Any, *, fallback_id: str = "") -> Dict[str, Any]:
    if not isinstance(item, dict):
        item = {}

    theme_id = str(item.get("id") or fallback_id).strip().lower()
    if not theme_id:
        return {}

    return {
        "id": theme_id,
        "name": str(item.get("name") or theme_id),
        "description": str(item.get("description") or ""),
        "status": str(item.get("status") or "stable"),
        # Operator-controlled flag (admin toggles via /templates page). Persisted
        # in each theme's `theme.json` so it survives `theme:sync` regenerations.
        # When True the theme is hidden from the /create picker and any new
        # brand creation, but existing brands continue to render against it.
        "disabled": bool(item.get("disabled")),
    }


def _normalize_catalog(raw: Any) -> Dict[str, Any]:
    if not isinstance(raw, dict):
        return dict(FALLBACK_CATALOG)

    themes_raw = raw.get("themes")
    themes: List[Dict[str, Any]] = []
    if isinstance(themes_raw, list):
        for item in themes_raw:
            normalized = _normalize_theme_entry(item)
            if normalized:
                themes.append(normalized)

    deduped_themes: List[Dict[str, Any]] = []
    seen_ids = set()
    for theme in themes:
        theme_id = theme.get("id")
        if theme_id in seen_ids:
            continue
        seen_ids.add(theme_id)
        deduped_themes.append(theme)
    themes = deduped_themes

    if not themes:
        themes = list(FALLBACK_CATALOG["themes"])

    default_theme = str(raw.get("defaultTheme") or "").strip().lower()
    valid_ids = {theme["id"] for theme in themes}
    if default_theme not in valid_ids:
        default_theme = next(iter(valid_ids))

    version = raw.get("version")
    if not isinstance(version, int):
        version = FALLBACK_CATALOG["version"]

    return {
        "version": version,
        "defaultTheme": default_theme,
        "themes": themes,
    }


def _discover_theme_contract_catalog() -> Dict[str, Any] | None:
    if not THEME_CONTRACTS_ROOT.exists():
        return None

    themes: List[Dict[str, Any]] = []
    default_candidates: List[str] = []

    for entry in sorted(THEME_CONTRACTS_ROOT.iterdir(), key=lambda item: item.name.lower()):
        if not entry.is_dir():
            continue

        directory_name = entry.name.lower()
        if directory_name in {"generated", "__pycache__"} or directory_name.startswith("."):
            continue

        meta_path = entry / THEME_META_FILENAME
        if not meta_path.exists():
            continue

        missing = [path for path in THEME_REQUIRED_FILES if not (entry / path).exists()]
        if missing:
            continue

        try:
            raw_meta = json.loads(meta_path.read_text(encoding="utf-8"))
        except Exception:
            continue

        normalized = _normalize_theme_entry(raw_meta, fallback_id=directory_name)
        if not normalized:
            continue

        # Theme id must map 1:1 with folder name for deterministic routing/imports.
        if normalized["id"] != directory_name:
            continue

        themes.append(normalized)

        if bool(raw_meta.get("isDefault")):
            default_candidates.append(normalized["id"])

    if not themes:
        return None

    valid_ids = {theme["id"] for theme in themes}
    default_theme = ""
    for candidate in default_candidates:
        if candidate in valid_ids:
            default_theme = candidate
            break

    if not default_theme:
        default_theme = "classic-dealer" if "classic-dealer" in valid_ids else themes[0]["id"]

    return {
        "version": 1,
        "defaultTheme": default_theme,
        "themes": themes,
    }


def load_theme_catalog() -> Dict[str, Any]:
    discovered_catalog = _discover_theme_contract_catalog()
    if discovered_catalog:
        return _normalize_catalog(discovered_catalog)

    try:
        payload = json.loads(THEME_MANIFEST_PATH.read_text(encoding="utf-8"))
    except Exception:
        payload = dict(FALLBACK_CATALOG)
    return _normalize_catalog(payload)


def get_theme_catalog() -> Dict[str, Any]:
    """Return the normalized theme catalog including disabled themes.

    Use this for admin-facing surfaces (e.g. the /templates management page).
    For surfaces that should only show pickable themes (e.g. /create), use
    `get_active_theme_catalog()` instead.
    """
    return dict(load_theme_catalog())


def get_active_theme_catalog() -> Dict[str, Any]:
    """Return the catalog with disabled themes filtered out.

    Used by `/api/themes` (the picker the /create page consumes) and by any
    brand-creation flow that needs to reject disabled themes.
    """
    catalog = dict(load_theme_catalog())
    themes = [theme for theme in catalog.get("themes", []) if not theme.get("disabled")]
    if not themes:
        # Safety net: if every theme is disabled we still need *something* the
        # default-resolver can fall back to. Yield the FALLBACK_CATALOG.
        themes = list(FALLBACK_CATALOG["themes"])

    valid_ids = {theme["id"] for theme in themes}
    default_theme = str(catalog.get("defaultTheme") or "").strip().lower()
    if default_theme not in valid_ids:
        default_theme = next(iter(valid_ids))

    return {
        "version": catalog.get("version", FALLBACK_CATALOG["version"]),
        "defaultTheme": default_theme,
        "themes": themes,
    }


def list_theme_ids(*, include_disabled: bool = True) -> List[str]:
    catalog = load_theme_catalog()
    themes = catalog.get("themes", [])
    if not include_disabled:
        themes = [theme for theme in themes if not theme.get("disabled")]
    return [theme["id"] for theme in themes]


def get_default_theme_id() -> str:
    catalog = load_theme_catalog()
    default_theme = str(catalog.get("defaultTheme") or "").strip().lower()
    if default_theme:
        return default_theme
    theme_ids = list_theme_ids()
    return theme_ids[0] if theme_ids else "classic-dealer"


def resolve_theme_id(raw_theme_id: Any, *, fallback_to_default: bool = True) -> str:
    """Resolve a requested theme id against the catalog.

    Includes disabled themes so existing brands that target a now-disabled
    theme keep rendering. Brand *creation* paths should additionally check
    `is_theme_disabled()` and reject the assignment if true.
    """
    candidate = str(raw_theme_id or "").strip().lower()
    valid_ids = set(list_theme_ids())
    if candidate and candidate in valid_ids:
        return candidate
    if fallback_to_default:
        return get_default_theme_id()
    return ""


def is_theme_disabled(theme_id: Any) -> bool:
    """Return True if the named theme exists and is flagged disabled."""
    candidate = str(theme_id or "").strip().lower()
    if not candidate:
        return False
    for theme in load_theme_catalog().get("themes", []):
        if theme.get("id") == candidate:
            return bool(theme.get("disabled"))
    return False
