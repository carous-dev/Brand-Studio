"""
OpenAI wrapper for structured brand generation.

Uses the Chat Completions API with JSON mode to return a BrandConfig payload.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional

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


def generate_brand(
    context: str = "",
    website: str = "",
    scopes: Optional[List[str]] = None,
    preferred_theme_id: str = "",
    text_recipe: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Generate structured brand data via OpenAI Chat Completions (JSON mode).

    Args:
        context: Freeform text describing the brand.
        website: Optional website URL to hint the model.
        scopes: Optional list of scopes (basic/contact/seo/theme/pages/why/services/testimonials/faq).
                Currently used only to mention focus in prompt; the full structure is always returned.
        preferred_theme_id: Theme id that determines which text recipe to load.
        text_recipe: Per-component text recipe loaded from `app/themes/<id>/recipes/text-recipe.json`.
            When provided, the AI must populate `brand.text` with values for every recipe key
            (component copy is the most-customised surface per preview and the recipe is the
            single source of truth for what each theme needs).

    Returns:
        dict containing the full brand payload.
    """
    api_key = _get_api_key()
    model = _get_model()
    prompt = _base_prompt(context, website, preferred_theme_id=preferred_theme_id)
    scope_hint = ""
    if scopes:
        scope_hint = "\nFocus especially on: " + ", ".join(scopes)

    recipe_block = _text_recipe_prompt_block(text_recipe)
    recipe_rule = "\n- `brand.text` MUST be an object whose keys exactly match the recipe field keys listed above; values are short strings under each field's maxLength. Omit no required key." if recipe_block else ""

    user_content = (
        prompt
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

    body = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a brand content generator. Reply with JSON only that matches the provided schema.",
            },
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

    try:
        parsed = json.loads(content)
    except Exception as exc:
        raise OpenAIError(f"Failed to parse JSON from model: {exc}") from exc

    if "brand" not in parsed:
        raise OpenAIError("Model response missing 'brand' key")

    return parsed
