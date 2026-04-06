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
    "faq": [ { "question": "", "answer": "" }, { "question": "", "answer": "" } ]
  }
}
""".strip()


def generate_brand(
    context: str = "",
    website: str = "",
    scopes: Optional[List[str]] = None,
    preferred_theme_id: str = "",
) -> Dict[str, Any]:
    """
    Generate structured brand data via OpenAI Chat Completions (JSON mode).

    Args:
        context: Freeform text describing the brand.
        website: Optional website URL to hint the model.
        scopes: Optional list of scopes (basic/contact/seo/theme/pages/why/services/testimonials/faq).
                Currently used only to mention focus in prompt; the full structure is always returned.

    Returns:
        dict containing the full brand payload.
    """
    api_key = _get_api_key()
    model = _get_model()
    prompt = _base_prompt(context, website, preferred_theme_id=preferred_theme_id)
    scope_hint = ""
    if scopes:
        scope_hint = "\nFocus especially on: " + ", ".join(scopes)

    user_content = (
        prompt
        + "\n\nJSON STRUCTURE (do not rename keys):\n"
        + _response_structure(scopes or [])
        + "\n\nRules:\n"
        "- Respond with JSON only.\n"
        "- Fill every field with realistic values; no placeholders like TBD.\n"
        "- Domains should be kebab-case and UK-oriented.\n"
        "- Keep brand.themeId and brand.theme.id aligned.\n"
        "- keywords must be a JSON array of strings.\n"
        "- Hex colors must be valid 6-digit hex codes.\n"
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
