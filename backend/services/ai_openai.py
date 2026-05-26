"""
OpenAI wrapper for structured brand generation.

Two execution paths:

  * **Browsing path** — Responses API + `web_search_preview` tool. Used when a
    `website` URL is supplied so the model actually reads the dealer's page
    and grounds the output in real content (real brand voice, services,
    address, opening hours). Removes the need for a server-side scrape, which
    avoids Cloudflare blocks on the brandstudio host.
  * **No-browse path** — Chat Completions with JSON mode. Used when no
    website is supplied OR the browsing path errors. The model invents
    plausible content from the seed context only.

`generate_brand()` is the public API. It tries browsing first when possible
and falls back to no-browse on any failure so the endpoint always returns a
draft instead of a 502.
"""

from __future__ import annotations

import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

import requests


class OpenAIError(RuntimeError):
    """Simple wrapper for OpenAI-related failures."""


def _get_api_key() -> str:
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        raise OpenAIError("OPENAI_API_KEY is not set")
    return key


def _get_model() -> str:
    return (os.environ.get("OPENAI_MODEL") or "gpt-4.1-mini").strip()


def _get_browsing_model() -> str:
    """Model used for the Responses API + web_search_preview path. Override via
    OPENAI_BROWSING_MODEL. Defaults to OPENAI_MODEL so a single env var can
    drive both paths unless you explicitly want different models."""
    explicit = (os.environ.get("OPENAI_BROWSING_MODEL") or "").strip()
    return explicit or _get_model()


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
        "backgroundColor": "#ffffff", "textColor": "#1f2937"
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
            "pages if the homepage is thin. Ground every field of `brand` in what you actually "
            "read — do not invent. If a specific field genuinely is not present on the site, "
            "leave it as a sensible empty string rather than making something up. When the "
            "site is unreachable (404, 5xx, blocked), still produce a valid draft from the "
            "seed context and mark `brand.description` with a one-line note about the gap.\n"
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
    """Original Chat Completions path. No tool use, model invents content from
    the seed context only. Always reachable as a fallback."""
    model = _get_model()
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
            "https://api.openai.com/v1/chat/completions",
            headers=_headers(api_key),
            json=body,
            timeout=30,
        )
    except Exception as exc:  # pragma: no cover - network failure path
        raise OpenAIError(f"Failed to reach OpenAI: {exc}") from exc

    if not resp.ok:
        try:
            detail = resp.json()
        except Exception:
            detail = resp.text
        raise OpenAIError(f"OpenAI error {resp.status_code}: {detail}")

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

    use_browsing = bool(website) and not browsing_disabled

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
