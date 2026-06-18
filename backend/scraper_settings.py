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
    # Scraper
    "proxy_url": "",
    "use_browser": True,
    # AI provider (added 2026-06-12 so operators can paste the Groq key in
    # the dashboard without SSHing to the VPS). Empty values fall back to
    # env vars (GROQ_API_KEY / OPENAI_API_KEY / LLM_PROVIDER / GROQ_MODEL /
    # OPENAI_MODEL) so the change is backwards-compatible.
    "llm_provider": "",          # "groq" | "openai" | "" (auto: groq if key present)
    "groq_api_key": "",
    "groq_model": "",            # e.g. llama-3.3-70b-versatile
    "openai_api_key": "",
    "openai_model": "",          # e.g. gpt-4.1-mini
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


def get_llm_provider() -> str:
    """Effective LLM provider — dashboard explicit setting, then env var, then
    auto-detect (groq if its key is present, otherwise openai)."""
    s = load_scraper_settings()
    explicit = (s.get("llm_provider") or "").strip().lower()
    if explicit in {"groq", "openai"}:
        return explicit
    env_forced = (os.environ.get("LLM_PROVIDER") or "").strip().lower()
    if env_forced in {"groq", "openai"}:
        return env_forced
    if (s.get("groq_api_key") or os.environ.get("GROQ_API_KEY") or "").strip():
        return "groq"
    return "openai"


def get_provider_api_key(provider: str) -> str:
    """Read the API key for the given provider — dashboard first, then env."""
    s = load_scraper_settings()
    if provider == "groq":
        saved = (s.get("groq_api_key") or "").strip()
        return saved or (os.environ.get("GROQ_API_KEY") or "").strip()
    saved = (s.get("openai_api_key") or "").strip()
    return saved or (os.environ.get("OPENAI_API_KEY") or "").strip()


def get_provider_model(provider: str) -> str:
    """Read the model id — dashboard first, then env, then provider default."""
    s = load_scraper_settings()
    if provider == "groq":
        return (
            (s.get("groq_model") or "").strip()
            or (os.environ.get("GROQ_MODEL") or "").strip()
            or "llama-3.3-70b-versatile"
        )
    return (
        (s.get("openai_model") or "").strip()
        or (os.environ.get("OPENAI_MODEL") or "").strip()
        or "gpt-4.1-mini"
    )


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


def _mask_secret(raw: str) -> str:
    """Show the first 8 chars then ••••, so the operator can tell which key
    is saved without re-pasting it."""
    raw = (raw or "").strip()
    if not raw:
        return ""
    head = raw[:8]
    return f"{head}••••"


def load_scraper_settings_redacted() -> dict[str, Any]:
    """Same as `load_scraper_settings` but with secrets masked, plus
    convenience flags so the UI can show "configured / not configured"
    without re-pasting any credential."""
    s = load_scraper_settings()
    return {
        # Scraper
        "proxy_url_display": redact_proxy(s["proxy_url"]),
        "proxy_configured": bool(s["proxy_url"]),
        "use_browser": s["use_browser"],
        # AI provider
        "llm_provider": s.get("llm_provider") or "",
        "effective_provider": get_llm_provider(),
        "groq_api_key_display": _mask_secret(s.get("groq_api_key") or ""),
        "groq_api_key_configured": bool((s.get("groq_api_key") or "").strip()),
        "groq_model": s.get("groq_model") or "",
        "openai_api_key_display": _mask_secret(s.get("openai_api_key") or ""),
        "openai_api_key_configured": bool((s.get("openai_api_key") or "").strip()),
        "openai_model": s.get("openai_model") or "",
        # Audit
        "updated_at": s["updated_at"],
    }
