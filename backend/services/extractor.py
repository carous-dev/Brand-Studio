"""
Lightweight website extractor for AI seeding.
 - Fetches the URL with browser-like headers.
 - Extracts title, meta description/keywords, headings, and visible text.
 - Returns a structured dict and a condensed text blob suitable for prompting.
"""

from __future__ import annotations

import html
import re
import textwrap
from html.parser import HTMLParser
from typing import Dict, List, Tuple

import requests


class _TextCollector(HTMLParser):
    """
    Collect text from all visible tags (header/footer included) with lightweight filtering.
    """

    def __init__(self) -> None:
        super().__init__()
        self.stack: List[str] = []
        self.chunks: List[Tuple[str, str]] = []  # (tag, text)

    def handle_starttag(self, tag, attrs):
        self.stack.append(tag.lower())

    def handle_endtag(self, tag):
        if self.stack and self.stack[-1] == tag.lower():
            self.stack.pop()

    def handle_data(self, data):
        if not self.stack:
            return
        tag = self.stack[-1]
        txt = data.strip()
        if txt:
            self.chunks.append((tag, txt))


def _sanitize_html(raw: str) -> str:
    # Remove scripts/styles quickly
    raw = re.sub(r"<script[^>]*>.*?</script>", " ", raw, flags=re.I | re.S)
    raw = re.sub(r"<style[^>]*>.*?</style>", " ", raw, flags=re.I | re.S)
    return raw


def _extract_meta(raw: str) -> Dict[str, str]:
    metas = {}
    patterns = {
        "title": r"<title[^>]*>(.*?)</title>",
        "description": r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',
        "keywords": r'<meta[^>]+name=["\']keywords["\'][^>]+content=["\'](.*?)["\']',
    }
    for key, pat in patterns.items():
        m = re.search(pat, raw, flags=re.I | re.S)
        if m:
            metas[key] = html.unescape(m.group(1).strip())
    return metas


def _extract_phones(raw: str) -> List[str]:
    # Grab visible phone-like strings from the raw HTML
    candidates = re.findall(r'\+?\d[\d\s().-]{8,}', raw)
    phones: List[str] = []
    seen = set()
    for c in candidates:
        digits = re.sub(r'\D', '', c)
        if len(digits) < 9:
            continue
        norm = re.sub(r'\s+', ' ', c).strip()
        if norm in seen:
            continue
        seen.add(norm)
        phones.append(norm)
    return phones


def _score_and_filter(chunks: List[Tuple[str, str]]) -> List[str]:
    """Keep meaningful sentences; drop common boilerplate."""
    out: List[str] = []
    seen = set()
    bad_tokens = (
        "cookie",
        "privacy",
        "newsletter",
        "subscribe",
        "javascript",
        "enable cookies",
        "accept cookies",
        "terms",
        "copyright",
        "follow us",
        "accept all",
        "gdpr",
    )
    for tag, txt in chunks:
        norm = txt.strip()
        if len(norm) < 8:
            continue
        lower = norm.lower()
        if any(b in lower for b in bad_tokens):
            continue
        if lower in seen:
            continue
        seen.add(lower)
        out.append(norm)
    return out


def _build_blob(metas: Dict[str, str], chunks: List[Tuple[str, str]]) -> str:
    lines: List[str] = []
    if "title" in metas:
        lines.append(f"Title: {metas['title']}")
    if "description" in metas:
        lines.append(f"Description: {metas['description']}")
    if "keywords" in metas:
        lines.append(f"Keywords: {metas['keywords']}")
    if "phones" in metas and metas["phones"]:
        lines.append("Phones: " + ", ".join(metas["phones"]))

    headings = [txt for tag, txt in chunks if tag in {"h1", "h2", "h3", "h4"}]
    if headings:
        lines.append("Headings:")
        for h in headings[:15]:
            lines.append(f" - {h}")

    important = _score_and_filter(chunks)
    if important:
        merged = " ".join(important)
        merged = re.sub(r"\s+", " ", merged).strip()
        merged = merged[:8000]
        wrapped = textwrap.fill(merged, width=100)
        lines.append("\nKey Text:\n" + wrapped)

    return "\n".join(lines).strip()


def fetch_structured_text(url: str) -> Dict[str, str]:
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    resp = None
    for attempt, ua in enumerate(
        [headers["User-Agent"], "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120 Safari/537.36"]
    ):
        try:
            headers["User-Agent"] = ua
            resp = requests.get(url, headers=headers, timeout=12, allow_redirects=True)
            if resp.status_code == 403 and attempt == 0:
                continue  # retry with alt UA
            break
        except Exception:
            if attempt == 1:
                raise

    if resp is None:
        raise RuntimeError("Failed to fetch URL")
    if resp.status_code >= 400:
        raise RuntimeError(f"Fetch failed with status {resp.status_code}")

    content_type = resp.headers.get("Content-Type", "")
    if "text/html" not in content_type.lower():
        raise RuntimeError("URL did not return HTML content")

    raw_html = resp.text or ""
    metas = _extract_meta(raw_html)
    metas["phones"] = _extract_phones(raw_html)
    raw_html = _sanitize_html(raw_html)

    parser = _TextCollector()
    try:
        parser.feed(raw_html)
    except Exception:
        # even if parsing fails partway, keep collected chunks
        pass

    blob = _build_blob(metas, parser.chunks)
    return {
        "title": metas.get("title", ""),
        "description": metas.get("description", ""),
        "keywords": metas.get("keywords", ""),
        "headings": [txt for tag, txt in parser.chunks if tag in {"h1", "h2", "h3"}],
        "text": blob,
    }
