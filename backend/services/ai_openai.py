"""
LLM wrapper for structured brand generation.

Provider selection:
  * **Groq** (preferred when `GROQ_API_KEY` is set) — OpenAI-compatible
    chat-completions API at `GROQ_BASE_URL` (default
    `https://api.groq.com/openai/v1`). Fast, JSON mode supported. No
    browsing — the new Playwright-based extractor already feeds clean
    structured context, so the model just formats.
  * **OpenAI** (fallback when only `OPENAI_API_KEY` is set) — keeps the
    historical browsing path (`web_search_preview` on the Responses API)
    available for callers that genuinely have no pre-scraped context, but
    `/api/ai/brand` now auto-scrapes via the extractor so browsing is rarely
    needed.

`generate_brand()` is the public API. It picks the provider, tries the
provider's primary path, and falls back to a plain chat-completions call on
error so the endpoint always returns a draft instead of a 502.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

import requests

# Provider config + secrets live in scraper_settings (dashboard-editable JSON
# at app/data/scraper-settings.json). Env vars are still honoured as a
# fallback. Operators on production can paste the Groq key in
# Settings → Advanced → Scraper without touching the VPS .env.
from ..scraper_settings import (
    get_llm_provider as _settings_provider,
    get_provider_api_key as _settings_api_key,
    get_provider_model as _settings_model,
)


class OpenAIError(RuntimeError):
    """Backwards-compatible name — covers Groq + OpenAI failures."""


# ── Provider selection ────────────────────────────────────────────────────────

def _provider() -> str:
    """Returns 'groq' or 'openai'. Resolves via dashboard settings first,
    then env vars (LLM_PROVIDER / GROQ_API_KEY presence), falling back to
    'openai' for backwards compatibility."""
    return _settings_provider()


def _get_api_key() -> str:
    prov = _provider()
    key = _settings_api_key(prov)
    if not key:
        env_name = "GROQ_API_KEY" if prov == "groq" else "OPENAI_API_KEY"
        raise OpenAIError(
            f"No API key configured for provider '{prov}'. "
            f"Paste it in Settings → Advanced → Scraper, or set {env_name} env."
        )
    return key


def _get_base_url() -> str:
    if _provider() == "groq":
        return (os.environ.get("GROQ_BASE_URL") or "https://api.groq.com/openai/v1").rstrip("/")
    return (os.environ.get("OPENAI_BASE_URL") or "https://api.openai.com/v1").rstrip("/")


def _get_model() -> str:
    return _settings_model(_provider())


def _get_browsing_model() -> str:
    """Model used for the Responses API + web_search_preview path. OpenAI only —
    Groq doesn't ship a browsing tool. Override via OPENAI_BROWSING_MODEL."""
    explicit = (os.environ.get("OPENAI_BROWSING_MODEL") or "").strip()
    return explicit or _get_model()


def _supports_browsing() -> bool:
    """Browsing requires the OpenAI Responses API + web_search_preview tool.
    Groq's OpenAI-compatible endpoint doesn't implement it."""
    return _provider() == "openai"


def _headers(api_key: str) -> Dict[str, str]:
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def _base_prompt(context: str, website: str, preferred_theme_id: str = "") -> str:
    seed_lines = [
        "- Business Type: Used car dealership",
        "- Market: UK",
        "- Industry: Automotive retail",
    ]
    if website:
        seed_lines.append(f"- Website: {website}")
    if preferred_theme_id:
        seed_lines.append(f"- Preferred Theme ID: {preferred_theme_id}")

    extra = f"\nAdditional context:\n{context.strip()}" if context else ""

    return (
        "BRAND SEED\n"
        + "\n".join(seed_lines)
        + "\n\nTASK\n"
        "Generate complete brand data for this dealership. "
        "Return VALID JSON ONLY using the exact structure and fields below. "
        "Keep tone professional, trustworthy, modern."
        + extra
    )


def _response_structure(scopes: List[str]) -> str:
    """
    Return the minimal JSON skeleton we expect. This stays close to the prior shape
    used by the UI to simplify mapping/merging on the frontend.
    """
    # Keep full structure; frontend can pick tabs.
    return """
{
  "brand": {
    "name": "",
    "tagline": "",
    "description": "",
    "domain": "",
    "slug": "",
    "themeId": "classic-dealer",
    "location": {
      "fullAddress": "",
      "address": { "city": "", "postcode": "" },
      "phone": "",
      "email": ""
    },
    "openingHours": {
      "monday": "", "tuesday": "", "wednesday": "", "thursday": "", "friday": "", "saturday": "", "sunday": ""
    },
    "seo": {
      "title": "", "description": "", "keywords": [], "twitterHandle": "", "country": "GB"
    },
    "theme": {
      "id": "classic-dealer",
      "themeId": "classic-dealer",
      "colors": {
        "primaryColor": "#2563eb", "secondaryColor": "#64748b", "accentColor": "#f59e0b",
        "backgroundColor": "#ffffff"
      },
      "fonts": { "ui": "Inter, system-ui, sans-serif", "brand": "Lora, serif", "mono": "JetBrains Mono, monospace" }
    },
    "pages": {
      "home": { "hero": { "title": "", "description": "" } },
      "about": { "hero": { "title": "", "description": "" }, "story": { "paragraphs": [] } },
      "services": { "hero": { "title": "", "description": "" } }
    },
    "whyChooseUs": { "title": "", "features": [ { "title": "", "description": "" }, { "title": "", "description": "" }, { "title": "", "description": "" } ] },
    "services": { "title": "", "items": [ { "title": "", "description": "" }, { "title": "", "description": "" } ] },
    "testimonials": [ { "name": "", "rating": 5, "review": "" }, { "name": "", "rating": 5, "review": "" } ],
    "faq": [ { "question": "", "answer": "" }, { "question": "", "answer": "" } ],
    "text": {}
  }
}
""".strip()


def _text_recipe_prompt_block(text_recipe: Optional[Dict[str, Any]]) -> str:
    """
    Build the prompt fragment that tells the AI what per-component copy fields
    to populate for the selected theme. Returns empty string if no recipe.

    The recipe is the canonical contract: every key listed must appear in
    `brand.text` in the response, with the AI choosing dealer-specific copy
    that fits the field's `aiHint` and stays under `maxLength` characters. The
    AI must NOT include token placeholders (`{brandName}`, `{city}`, etc.) in
    its output — the runtime interpolates those AFTER the AI writes the copy.
    """
    if not text_recipe or not isinstance(text_recipe, dict):
        return ""
    sections = text_recipe.get("sections") or []
    if not sections:
        return ""

    lines: List[str] = []
    lines.append("\n\nTHEME TEXT RECIPE")
    lines.append(
        "The selected theme defines a recipe of per-component copy strings the dealer's "
        "preview will render. Every key below MUST appear in `brand.text` in your response "
        "with a fully-written string (no TBD, no placeholders, no JSX). The runtime later "
        "substitutes tokens like {brandName}, {city}, {streetLine}, {year} — DO NOT write "
        "{tokens} into your output unless you want them rendered literally; instead use the "
        "real dealer-specific values you've decided on. Keep each value within the stated "
        "maxLength character limit. Match the section's tone (editorial / disclaimer / "
        "magazine) from the field's aiHint."
    )
    for section in sections:
        if not isinstance(section, dict):
            continue
        section_label = section.get("label") or section.get("id") or "(section)"
        lines.append(f"\n[{section_label}]")
        for field in section.get("fields") or []:
            if not isinstance(field, dict):
                continue
            key = field.get("key")
            if not key:
                continue
            label = field.get("label") or key
            max_len = field.get("maxLength")
            field_type = field.get("type") or "short"
            hint = field.get("aiHint") or ""
            default = field.get("default") or ""
            limit_str = f" · max {max_len} chars" if isinstance(max_len, int) else ""
            hint_str = f" · {hint}" if hint else ""
            example_str = f" · default: {default}" if default else ""
            lines.append(f"  - {key} ({field_type}{limit_str}) — {label}{hint_str}{example_str}")
    return "\n".join(lines)


def _build_user_prompt(
    context: str,
    website: str,
    scopes: Optional[List[str]],
    preferred_theme_id: str,
    text_recipe: Optional[Dict[str, Any]],
    *,
    with_browsing_instructions: bool,
) -> str:
    """Compose the user prompt. When browsing is on, prepend instructions telling
    the model to fetch the website FIRST before writing the brand record."""
    prompt = _base_prompt(context, website, preferred_theme_id=preferred_theme_id)
    scope_hint = ""
    if scopes:
        scope_hint = "\nFocus especially on: " + ", ".join(scopes)

    recipe_block = _text_recipe_prompt_block(text_recipe)
    recipe_rule = (
        "\n- `brand.text` MUST be an object whose keys exactly match the recipe field keys "
        "listed above; values are short strings under each field's maxLength. Omit no required key."
        if recipe_block
        else ""
    )

    browsing_block = ""
    if with_browsing_instructions and website:
        browsing_block = (
            "\n\nBROWSING INSTRUCTIONS\n"
            f"Before writing the JSON, use the web_search tool to fetch and read the dealer's "
            f"website at {website}. Pull at minimum: trading name, tagline / hero headline, town "
            "and county, postcode, phone, email, opening hours, named services, and any "
            "established-since / years-in-business signal. ALSO try the /about and /contact "
            "pages if the homepage is thin. Ground factual fields (name, address, phone, "
            "opening hours, services that exist) in what you actually read — do not invent "
            "factual claims.\n\n"
            "EXCEPTIONS — these fields MUST be populated even when the site does not publish "
            "them (the operator needs a submittable draft, not a half-empty form):\n"
            "  * `tagline` — write a concise 4–8 word brand promise that fits the dealer's "
            "    tone and stock mix. Never leave empty.\n"
            "  * `location.email` — if no email is published on the site, default to "
            "    `info@<best-guess-domain>` derived from the dealer's domain or trading name. "
            "    Never leave empty.\n"
            "  * `testimonials`, `faq`, `whyChooseUs.features`, `services.items` — if the "
            "    site has none, write realistic UK-dealer examples that match the brand voice. "
            "    Mark testimonial reviewer names as common UK first-name + last-initial pairs.\n\n"
            "When the site is unreachable (404, 5xx, blocked), still produce a valid draft "
            "from the seed context and add a one-line note about the gap to "
            "`brand.description`.\n"
        )

    return (
        browsing_block
        + prompt
        + "\n\nJSON STRUCTURE (do not rename keys):\n"
        + _response_structure(scopes or [])
        + recipe_block
        + "\n\nRules:\n"
        "- Respond with JSON only.\n"
        "- Fill every field with realistic values; no placeholders like TBD.\n"
        "- Domains should be kebab-case and UK-oriented.\n"
        "- Keep brand.themeId and brand.theme.id aligned.\n"
        "- keywords must be a JSON array of strings.\n"
        "- Hex colors must be valid 6-digit hex codes.\n"
        "- Colors: choose ONLY the 4 brand colors (primaryColor, secondaryColor, "
        "accentColor, backgroundColor) — text/surface/border/muted are derived "
        "automatically by contrast rules, do not include them. Prefer a light "
        "backgroundColor unless the dealer's site is clearly dark-themed, and pick a "
        "primaryColor with at least 3:1 contrast against it.\n"
        + recipe_rule
        + scope_hint
    )


SYSTEM_PROMPT = (
    "You are a brand content generator. Reply with JSON only that matches the provided "
    "schema. When given browsing instructions and a dealer URL, fetch the site first and "
    "ground every field in the actual content you read."
)


# ---------------------------------------------------------------------------
# Browsing path (Responses API + web_search_preview tool)
# ---------------------------------------------------------------------------

def _extract_response_text(payload: Dict[str, Any]) -> str:
    """
    Pull the assistant text out of the Responses API payload. The Responses API
    returns `output: [<items>]` where items can be `message`, `web_search_call`,
    `reasoning`, etc. The message item has `content: [{type:"output_text", text}]`.

    Also handles the convenience `output_text` field that newer SDK versions
    surface as a flat string.
    """
    # Newer convenience field
    flat = payload.get("output_text")
    if isinstance(flat, str) and flat.strip():
        return flat

    pieces: List[str] = []
    for item in payload.get("output") or []:
        if not isinstance(item, dict):
            continue
        if item.get("type") != "message":
            continue
        for content in item.get("content") or []:
            if not isinstance(content, dict):
                continue
            ctype = content.get("type")
            if ctype in ("output_text", "text"):
                text = content.get("text")
                if isinstance(text, str):
                    pieces.append(text)
                elif isinstance(text, dict):
                    # Some schemas wrap text in {value: "..."}
                    val = text.get("value")
                    if isinstance(val, str):
                        pieces.append(val)
    return "\n".join(pieces).strip()


def _parse_json_from_text(text: str) -> Dict[str, Any]:
    """
    Parse JSON from a model response. The browsing model sometimes wraps the
    JSON in ```json fences or prepends a sentence; strip both before parsing.
    """
    if not isinstance(text, str) or not text.strip():
        raise OpenAIError("Empty model response")

    raw = text.strip()
    # Strip markdown fences if present
    fence = re.match(r"^```(?:json)?\s*([\s\S]*?)\s*```\s*$", raw)
    if fence:
        raw = fence.group(1).strip()

    # First try whole-string parse
    try:
        return json.loads(raw)
    except Exception:
        pass

    # Fall back to the first {...} block
    match = re.search(r"\{[\s\S]*\}", raw)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception as exc:
            raise OpenAIError(f"Failed to parse JSON from model: {exc}") from exc

    raise OpenAIError("Model response contained no JSON object")


def _generate_with_browsing(
    api_key: str,
    user_content: str,
) -> Dict[str, Any]:
    """Call the Responses API with the web_search_preview tool enabled."""
    model = _get_browsing_model()
    body = {
        "model": model,
        "instructions": SYSTEM_PROMPT,
        "input": user_content,
        "tools": [{"type": "web_search_preview"}],
        "tool_choice": "auto",
        "temperature": 0.4,
        # No response_format here — web_search + structured outputs together
        # is brittle on current models. We instruct JSON-only in the prompt
        # and parse defensively.
    }

    # Browsing path is OpenAI-only; the base URL is hard-coded to OpenAI
    # because Groq's compat endpoint doesn't implement Responses + web_search.
    try:
        resp = requests.post(
            "https://api.openai.com/v1/responses",
            headers=_headers(api_key),
            json=body,
            timeout=90,  # Browsing adds latency (one or two fetches + reasoning)
        )
    except Exception as exc:  # pragma: no cover - network failure path
        raise OpenAIError(f"Failed to reach OpenAI (browsing): {exc}") from exc

    if not resp.ok:
        try:
            detail = resp.json()
        except Exception:
            detail = resp.text
        raise OpenAIError(f"OpenAI browsing error {resp.status_code}: {detail}")

    data = resp.json()
    text = _extract_response_text(data)
    parsed = _parse_json_from_text(text)

    if "brand" not in parsed:
        raise OpenAIError("Browsing response missing 'brand' key")

    return parsed


# ---------------------------------------------------------------------------
# No-browse path (Chat Completions + JSON mode) — the original implementation
# ---------------------------------------------------------------------------

def _generate_without_browsing(
    api_key: str,
    user_content: str,
) -> Dict[str, Any]:
    """Chat Completions path — provider-agnostic. Hits whichever base URL
    `_get_base_url()` returns (Groq or OpenAI). JSON mode is supported by
    both. With the new Playwright-based scraper feeding clean context, this
    is the primary path."""
    provider = _provider()
    model = _get_model()
    base_url = _get_base_url()
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_content},
        ],
        "temperature": 0.5,
        "response_format": {"type": "json_object"},
    }

    try:
        resp = requests.post(
            f"{base_url}/chat/completions",
            headers=_headers(api_key),
            json=body,
            timeout=60,
        )
    except Exception as exc:  # pragma: no cover - network failure path
        raise OpenAIError(f"Failed to reach {provider}: {exc}") from exc

    if not resp.ok:
        try:
            detail = resp.json()
        except Exception:
            detail = resp.text
        raise OpenAIError(f"{provider} error {resp.status_code}: {detail}")

    data = resp.json()
    try:
        content = data["choices"][0]["message"]["content"]
    except Exception:
        raise OpenAIError("Malformed OpenAI response")

    if not isinstance(content, str):
        raise OpenAIError("OpenAI response content missing")

    parsed = _parse_json_from_text(content)
    if "brand" not in parsed:
        raise OpenAIError("Model response missing 'brand' key")

    return parsed


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_brand(
    context: str = "",
    website: str = "",
    scopes: Optional[List[str]] = None,
    preferred_theme_id: str = "",
    text_recipe: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Generate structured brand data via OpenAI.

    When `website` is non-empty, the **browsing path** runs first (Responses API
    + `web_search_preview` tool) so the model reads the dealer's site and
    grounds the output in real content. On any failure it falls back to the
    **no-browse path** (Chat Completions + JSON mode) so the endpoint always
    returns a draft instead of a 502.

    Disable browsing entirely by setting `OPENAI_DISABLE_BROWSING=1`.

    Args:
        context: Freeform text describing the brand.
        website: Optional website URL — when supplied, triggers the browsing path.
        scopes: Optional list of scopes; mentioned in the prompt focus hint only.
        preferred_theme_id: Theme id; mentioned in seed + used by the caller to
            load `text_recipe`.
        text_recipe: Per-component text recipe loaded from
            `app/themes/<id>/recipes/text-recipe.json`. When provided, the AI
            must populate `brand.text` with values for every recipe key.

    Returns:
        dict containing the full brand payload (always has a `brand` key).
    """
    api_key = _get_api_key()

    # Caller can hard-disable the browsing path via env var, useful when
    # OpenAI is rate-limiting search or in offline test environments.
    browsing_disabled = (os.environ.get("OPENAI_DISABLE_BROWSING") or "").strip() in {
        "1",
        "true",
        "yes",
    }

    # If the caller already supplied a structured context (typically built by
    # POST /api/extract-website, which now extracts JSON-LD + visible text +
    # site-specific dealer fields cleanly), prefer that over the browsing path.
    # Browsing was originally a workaround for the old scraper that produced
    # SVG-contaminated garbage; now redundant and 3× more expensive / slower.
    # Set OPENAI_FORCE_BROWSING=1 to override and always browse.
    force_browsing = (os.environ.get("OPENAI_FORCE_BROWSING") or "").strip() in {
        "1",
        "true",
        "yes",
    }
    has_useful_context = bool(context) and len(context.strip()) > 200

    use_browsing = (
        bool(website)
        and not browsing_disabled
        and (force_browsing or not has_useful_context)
        and _supports_browsing()  # Groq's compat endpoint doesn't ship web_search
    )

    browsing_prompt = _build_user_prompt(
        context, website, scopes, preferred_theme_id, text_recipe,
        with_browsing_instructions=True,
    )
    no_browse_prompt = _build_user_prompt(
        context, website, scopes, preferred_theme_id, text_recipe,
        with_browsing_instructions=False,
    )

    last_error: Optional[OpenAIError] = None

    if use_browsing:
        try:
            return _generate_with_browsing(api_key, browsing_prompt)
        except OpenAIError as exc:
            # Capture and fall through — operator gets a draft from the
            # no-browse path even when browsing fails (search quota, model
            # 429, parse failure, etc.).
            last_error = exc

    try:
        return _generate_without_browsing(api_key, no_browse_prompt)
    except OpenAIError as exc:
        # Surface the no-browse error if the browsing path also failed — it
        # carries more useful detail than the browsing failure (since the
        # browsing tool can fail for many opaque reasons).
        if last_error is not None:
            raise OpenAIError(
                f"Both paths failed. Browsing: {last_error}. Fallback: {exc}"
            ) from exc
        raise
