"""
Dashboard-editable scraper settings (proxy URL, browser toggle).

Stored as a JSON file under `app/data/scraper-settings.json` — same dir as
inventories so a single backup snapshot covers both. Read/write helpers are
small and synchronous; this is a single-tenant config file with rare writes.

NEVER returned to clients with the proxy password intact — callers should use
`load_scraper_settings_redacted()` for any UI/API exposure.
"""

from __future__ import annotations

import json
import os
import threading
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlparse, urlunparse

# Single global lock — writes are rare (manual save from the Settings page),
# but two concurrent dashboard saves shouldn't corrupt the file.
_LOCK = threading.Lock()

_SETTINGS_PATH: Path | None = None


def _path() -> Path:
    """Resolve once; allow tests to override via BRANDSTUDIO_SCRAPER_SETTINGS env."""
    global _SETTINGS_PATH
    if _SETTINGS_PATH is None:
        override = os.environ.get("BRANDSTUDIO_SCRAPER_SETTINGS", "").strip()
        if override:
            _SETTINGS_PATH = Path(override)
        else:
            here = Path(__file__).resolve().parent.parent  # repo root
            _SETTINGS_PATH = here / "app" / "data" / "scraper-settings.json"
        _SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)
    return _SETTINGS_PATH


DEFAULTS: dict[str, Any] = {
    "proxy_url": "",
    "use_browser": True,
    "updated_at": None,
}


def load_scraper_settings() -> dict[str, Any]:
    """Return the raw stored settings (with proxy password intact). Caller
    must keep this off the wire — use `load_scraper_settings_redacted` for any
    response that goes to the browser."""
    path = _path()
    if not path.exists():
        return dict(DEFAULTS)
    try:
        with path.open("r", encoding="utf-8") as fh:
            data = json.load(fh) or {}
        merged = dict(DEFAULTS)
        merged.update({k: v for k, v in data.items() if k in DEFAULTS})
        return merged
    except (OSError, json.JSONDecodeError):
        return dict(DEFAULTS)


def save_scraper_settings(payload: dict[str, Any]) -> dict[str, Any]:
    """Persist a partial update. Unknown keys are ignored."""
    from datetime import datetime, timezone

    current = load_scraper_settings()
    for key in DEFAULTS:
        if key in payload:
            current[key] = payload[key]
    current["updated_at"] = datetime.now(timezone.utc).isoformat()

    path = _path()
    with _LOCK:
        tmp = path.with_suffix(".json.tmp")
        with tmp.open("w", encoding="utf-8") as fh:
            json.dump(current, fh, indent=2, sort_keys=True)
        tmp.replace(path)
    return current


def get_proxy_url() -> str:
    """Effective proxy URL — dashboard setting first, env var fallback."""
    saved = (load_scraper_settings().get("proxy_url") or "").strip()
    if saved:
        return saved
    return (os.environ.get("BRAND_SCRAPE_PROXY_URL") or "").strip()


def get_use_browser() -> bool:
    """Whether to attempt Playwright fetch first."""
    return bool(load_scraper_settings().get("use_browser", True))


def redact_proxy(raw: str) -> str:
    """Return a display-safe copy with the password masked."""
    raw = (raw or "").strip()
    if not raw:
        return ""
    # iProyal colon form: host:port:user:pass
    if "://" not in raw and raw.count(":") >= 3:
        parts = raw.split(":")
        if len(parts) >= 4:
            return f"{parts[0]}:{parts[1]}:{parts[2]}:••••"
        return raw
    try:
        parsed = urlparse(raw)
        if parsed.password:
            user = parsed.username or ""
            host = parsed.hostname or ""
            port = f":{parsed.port}" if parsed.port else ""
            return f"{parsed.scheme}://{quote(user, safe='')}:••••@{host}{port}{parsed.path or ''}"
        return raw
    except Exception:
        return raw


def load_scraper_settings_redacted() -> dict[str, Any]:
    """Same as `load_scraper_settings` but with the proxy password masked,
    plus a convenience flag indicating whether a proxy is configured."""
    s = load_scraper_settings()
    return {
        "proxy_url_display": redact_proxy(s["proxy_url"]),
        "proxy_configured": bool(s["proxy_url"]),
        "use_browser": s["use_browser"],
        "updated_at": s["updated_at"],
    }
