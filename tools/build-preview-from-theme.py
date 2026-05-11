#!/usr/bin/env python3
"""
Build a preview brand from a scaffolded theme.

The /new-theme skill calls this at Phase 13 when the operator opts in to the
E2E build path. The skill builds the theme code (Phases 7-12), then asks the
operator "Build a preview from this theme now?" — yes runs this script.

What it does:
  1. Reads the theme's DNA JSON + theme.json + tokens.ts for colors + name.
  2. Constructs a minimal BrandConfig (slug, name, domain, theme.colors, theme.fonts).
  3. Calls backend.services.preview.upsert_preview to persist the brand record.
  4. Optionally triggers maybe_start_linux_brand_automation (DNS + vhost + cert)
     when --automation is passed and we're on Linux production.

What it does NOT do:
  - Run the AI brand generator (use the dashboard's /create page for that — this
    helper is a fast-path that ships a brand record with sensible defaults).
  - Upload inventory (operators upload via /update/<slug>).
  - Override an existing brand (errors out if --slug already exists, unless
    --overwrite is set).

Usage:
  python tools/build-preview-from-theme.py \\
      --theme-id auto-wow-uk-bespoke \\
      --brand-name "Auto Wow UK Ltd" \\
      [--slug autowowukltd] \\
      [--domain autowowukltd.lvh.me] \\
      [--dna tools/.theme-dna/auto-wow-uk.json] \\
      [--automation] \\
      [--overwrite]

Exit codes:
  0 success — preview URL written to stdout last line
  1 invalid input / missing files
  2 brand slug collision (use --overwrite or pick a new slug)
  3 persistence failed
"""
from __future__ import annotations

import sys

# Pitfall #11 — Windows console can't encode emoji output that app.py emits
# during startup. Configure stdout to be lenient before importing anything
# that pulls in app.py's surrounding code.
try:
    sys.stdout.reconfigure(errors='replace')  # type: ignore[attr-defined]
    sys.stderr.reconfigure(errors='replace')  # type: ignore[attr-defined]
except AttributeError:
    pass

import argparse
import json
import os
import re
from pathlib import Path
from typing import Any, Dict, Optional


REPO_ROOT = Path(__file__).resolve().parent.parent


def _slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return re.sub(r"-+", "-", s) or "preview"


def read_theme_json(theme_id: str) -> Dict[str, Any]:
    path = REPO_ROOT / "app" / "themes" / theme_id / "theme.json"
    if not path.exists():
        raise FileNotFoundError(f"theme.json not found for theme '{theme_id}': {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def read_dna(dna_path: Optional[str], theme_id: str) -> Dict[str, Any]:
    """Find the DNA JSON. Caller may pass --dna explicitly; otherwise try
    tools/.theme-dna/<dealer-slug>.json where dealer-slug strips the
    `-bespoke` suffix from the theme id."""
    if dna_path:
        path = Path(dna_path)
        if not path.is_absolute():
            path = REPO_ROOT / path
        if path.exists():
            return json.loads(path.read_text(encoding="utf-8"))
        raise FileNotFoundError(f"DNA file not found: {path}")

    dealer_slug = theme_id.removesuffix("-bespoke")
    candidate = REPO_ROOT / "tools" / ".theme-dna" / f"{dealer_slug}.json"
    if candidate.exists():
        return json.loads(candidate.read_text(encoding="utf-8"))

    return {}


def build_brand_config(
    *,
    theme_id: str,
    brand_name: str,
    slug: str,
    domain: str,
    theme_json: Dict[str, Any],
    dna: Dict[str, Any],
) -> Dict[str, Any]:
    """Compose a minimal BrandConfig. Mirrors the shape produced by the dashboard's
    /create page so the existing automation accepts it without modification."""
    colors = dna.get("colors", {}) if isinstance(dna.get("colors"), dict) else {}
    fonts = dna.get("fonts", {}) if isinstance(dna.get("fonts"), dict) else {}

    def color(name: str, fallback: str) -> str:
        value = colors.get(name)
        if isinstance(value, str) and value.strip():
            return value.strip()
        return fallback

    theme_block: Dict[str, Any] = {
        "id": theme_id,
        "themeId": theme_id,
        "colors": {
            "primaryColor": color("primary", "#0f1623"),
            "secondaryColor": color("primaryDark", color("primary", "#0f1623")),
            "accentColor": color("accent", color("primary", "#0f1623")),
            "backgroundColor": color("bg", "#ffffff"),
            "textColor": color("text", "#0f1623"),
            "surfaceColor": color("surface", "#f7f9fc"),
            "mutedColor": color("muted", "#6b7280"),
            "borderColor": color("border", "#e5e7eb"),
        },
        "fonts": {
            "heading": fonts.get("heading") or "'Inter', sans-serif",
            "body": fonts.get("body") or "'Inter', sans-serif",
            "stylesheets": fonts.get("stylesheets") or [],
        },
    }

    config: Dict[str, Any] = {
        "name": brand_name,
        "slug": slug,
        "domain": domain,
        "themeId": theme_id,
        "theme": theme_block,
        "location": {
            "address": {},
            "phone": "",
            "email": "",
        },
        "services": [],
        "features": [],
        "testimonials": [],
        "faq": [],
        "openingHours": {},
        "logo": "",
        "heroImage": "",
        "description": theme_json.get("description") or "",
        "createdBy": "new-theme-skill",
    }
    return config


def persist_brand(slug: str, config: Dict[str, Any], *, overwrite: bool) -> None:
    """Insert/update the brand record. Imports from backend.services so we
    don't pull app.py (Flask startup emoji prints on Windows — Pitfall #11)."""
    sys.path.insert(0, str(REPO_ROOT))
    from backend.services.preview import preview_exists, upsert_preview  # noqa: E402

    if preview_exists(slug) and not overwrite:
        raise SystemExit(
            f"[error] brand slug '{slug}' already exists. Pass --overwrite to replace,"
            " or pick a different --slug."
        )
    upsert_preview(slug, config)


def maybe_run_automation(config: Dict[str, Any]) -> Optional[str]:
    """Trigger DNS / vhost / cert provisioning on Linux/production. Returns
    a one-line status string. Skips silently when not available."""
    try:
        sys.path.insert(0, str(REPO_ROOT))
        # The automation lives at module-top in app.py — importing pulls
        # the whole Flask app. Guard with the encoding patch above.
        from app import maybe_start_linux_brand_automation  # noqa: E402
    except Exception as exc:  # pragma: no cover - defensive
        return f"automation skipped: {type(exc).__name__}: {exc}"

    try:
        maybe_start_linux_brand_automation(config)
        return "automation triggered (DNS + vhost + cert running in background)"
    except Exception as exc:
        return f"automation call failed: {type(exc).__name__}: {exc}"


def preview_url(domain: str) -> str:
    domain = (domain or "").strip()
    if not domain:
        return ""
    if domain.startswith(("http://", "https://")):
        return domain
    return f"https://{domain}"


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Register a preview brand for an existing theme.")
    parser.add_argument("--theme-id", required=True, help="Theme folder under app/themes/")
    parser.add_argument("--brand-name", required=True, help="Display name (e.g. 'Auto Wow UK Ltd')")
    parser.add_argument("--slug", help="Brand slug (default: derived from --brand-name)")
    parser.add_argument("--domain", help="Brand domain (default: <slug>.lvh.me for local preview)")
    parser.add_argument("--dna", help="Path to the theme's DNA JSON (default: tools/.theme-dna/<dealer-slug>.json)")
    parser.add_argument("--automation", action="store_true", help="Trigger DNS/vhost/cert automation after persistence")
    parser.add_argument("--overwrite", action="store_true", help="Replace existing brand record with the same slug")
    args = parser.parse_args(argv)

    slug = args.slug or _slugify(args.brand_name)
    domain = args.domain or f"{slug}.lvh.me"

    try:
        theme_json = read_theme_json(args.theme_id)
        dna = read_dna(args.dna, args.theme_id)
    except FileNotFoundError as exc:
        print(f"[error] {exc}")
        return 1

    config = build_brand_config(
        theme_id=args.theme_id,
        brand_name=args.brand_name,
        slug=slug,
        domain=domain,
        theme_json=theme_json,
        dna=dna,
    )

    try:
        persist_brand(slug, config, overwrite=args.overwrite)
    except SystemExit as exc:
        print(str(exc))
        return 2
    except Exception as exc:
        print(f"[error] persistence failed: {type(exc).__name__}: {exc}")
        return 3

    status = "automation skipped (use --automation to trigger)"
    if args.automation:
        status = maybe_run_automation(config) or "automation triggered"

    url = preview_url(domain)
    print(f"[ok] brand registered: slug={slug} name={args.brand_name!r}")
    print(f"[ok] theme: {args.theme_id}")
    print(f"[ok] {status}")
    if url:
        print(f"[ok] preview: {url}")
    else:
        print("[ok] preview: (no domain configured)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
