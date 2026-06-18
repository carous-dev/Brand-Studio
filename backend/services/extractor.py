"""
Structured website extractor for AI seeding.

Two-phase pipeline:
  1. Pre-extract clean structured data from JSON-LD (LocalBusiness / AutoDealer
     / Organization) and site-specific JSON blobs (e.g. AutoTrader's
     `__NEXT_DATA__`). These give us the dealer name / address / phone /
     opening hours / sameAs links cleanly.
  2. Strip noise tags (svg / script / style / iframe / noscript / comments)
     BEFORE any visible-text or phone-number extraction. The previous
     implementation regex-matched phones against raw HTML, which caught SVG
     `d="..."` path coordinates as "phones" (see Difatha's 2026-06-11 bug
     report — `Phones: 3388370153, 0796-1346-4, 55.8995311, ...`).

Returns a small structured dict the LLM can format directly without having to
parse garbage. Phone regex is restricted to UK landline + mobile shapes so
SVG path tokens like "6.5972 11.5897" can't pass.

Proxy support:
  - Pass `proxy_url` argument explicitly, OR
  - Set `BRAND_SCRAPE_PROXY_URL` env var (server-wide default), OR
  - Set `HTTP_PROXY` / `HTTPS_PROXY` env vars (picked up by `requests`).
  Useful for sites that block VPS IPs (e.g. AutoTrader behind Cloudflare).

  Accepts BOTH a normal URL and iProyal/Smartproxy "host:port:user:pass"
  colon format (the shape their dashboards copy):
    geo.iproyal.com:12321:iproyalUSER:PASS        # iProyal dashboard paste
    http://iproyalUSER:PASS@geo.iproyal.com:12321 # equivalent URL
    http://scraperapi:KEY@proxy-server.scraperapi.com:8001
    http://session-xyz:KEY@brd.superproxy.io:22225  # Bright Data

  iProyal username can carry routing modifiers — append for UK exits when
  scraping AutoTrader / DVLA / other geo-restricted UK sites:
    BASE_USER_country-gb                         # any UK exit
    BASE_USER_country-gb_session-abc_lifetime-10m  # sticky session
"""

from __future__ import annotations

import html
import json
import logging
import os
import re
import textwrap
from html.parser import HTMLParser
from typing import Any
from urllib.parse import urlparse

import requests

from .playwright_fetch import (
    PlaywrightUnavailable,
    fetch_rendered_html,
)

LOG = logging.getLogger(__name__)


# ───────────────────────────────── Constants ──────────────────────────────────

DEFAULT_TIMEOUT = 15
MAX_KEY_TEXT_CHARS = 2500   # was 8000 — keep the AI prompt small + cheap
MAX_HEADINGS = 20

USER_AGENTS = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/122.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 "
    "(KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36",
)

# UK landline + mobile + +44 international ONLY. Strict enough to reject
# SVG path coordinates like "6.5972 11.5897 6.7782 11.4407" because those
# have decimal points without the right separator structure.
UK_PHONE_RE = re.compile(
    r"""(?x)
    (?<!\d)
    (?:
        (?:\+44|0044)\s?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}
      |
        \(?0\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}
    )
    (?!\d)
    """
)

# UK postcode shape (full or partial outward code).
UK_POSTCODE_RE = re.compile(
    r"\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b", re.I
)

# Tags whose CONTENT must never bleed into text/phone extraction.
NOISE_TAGS = ("script", "style", "svg", "noscript", "iframe", "template")

# Lines containing any of these are dropped from the "Key Text" blob.
BOILERPLATE_TOKENS = (
    "cookie", "privacy", "newsletter", "subscribe", "javascript",
    "enable cookies", "accept cookies", "terms", "copyright",
    "follow us", "accept all", "gdpr", "consent", "skip to content",
    "skip to footer",
)

# Schema.org types we treat as "the business".
BUSINESS_LD_TYPES = {
    "AutoDealer", "AutomotiveBusiness", "CarDealer", "MotorVehicleDealer",
    "LocalBusiness", "Organization", "Corporation",
}


# ────────────────────────────── HTML preprocessing ─────────────────────────────

def _strip_noise_blocks(raw: str) -> str:
    """Remove <script>, <style>, <svg>, <noscript>, <iframe>, <template>, and
    HTML comments — including their contents — so downstream text/phone
    extraction never sees them."""
    raw = re.sub(r"<!--.*?-->", " ", raw, flags=re.S)
    for tag in NOISE_TAGS:
        raw = re.sub(
            rf"<{tag}\b[^>]*>.*?</{tag}\s*>",
            " ", raw, flags=re.I | re.S,
        )
        # Self-closing or unclosed
        raw = re.sub(rf"<{tag}\b[^>]*/?>", " ", raw, flags=re.I)
    return raw


def _find_meta(raw: str, name: str, attr: str = "name") -> str:
    """Find <meta name="X" content="Y"> or property="X"."""
    pat = (
        rf'<meta[^>]+{attr}=["\']{re.escape(name)}["\'][^>]+content=["\']([^"\']+)["\']'
    )
    m = re.search(pat, raw, flags=re.I)
    if m:
        return html.unescape(m.group(1)).strip()
    # Same attrs but reversed order
    pat = (
        rf'<meta[^>]+content=["\']([^"\']+)["\'][^>]+{attr}=["\']{re.escape(name)}["\']'
    )
    m = re.search(pat, raw, flags=re.I)
    return html.unescape(m.group(1)).strip() if m else ""


def _extract_meta(raw: str) -> dict[str, str]:
    """Pull <title>, description, keywords, OpenGraph/Twitter equivalents."""
    out: dict[str, str] = {}
    m = re.search(r"<title[^>]*>(.*?)</title>", raw, flags=re.I | re.S)
    if m:
        out["title"] = html.unescape(re.sub(r"\s+", " ", m.group(1))).strip()

    desc = (
        _find_meta(raw, "description")
        or _find_meta(raw, "og:description", "property")
        or _find_meta(raw, "twitter:description")
    )
    if desc:
        out["description"] = desc

    kw = _find_meta(raw, "keywords")
    if kw:
        out["keywords"] = kw

    og_title = _find_meta(raw, "og:title", "property")
    if og_title and og_title != out.get("title"):
        out["og_title"] = og_title

    site_name = _find_meta(raw, "og:site_name", "property")
    if site_name:
        out["site_name"] = site_name

    return out


# ───────────────────────────── JSON-LD parser ─────────────────────────────────

def _extract_json_ld(raw: str) -> dict[str, Any]:
    """Walk every <script type="application/ld+json"> block, find the first
    LocalBusiness / AutoDealer / Organization, and pull clean fields."""
    out: dict[str, Any] = {}
    blocks = re.findall(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        raw, flags=re.I | re.S,
    )
    for block in blocks:
        text = block.strip()
        if not text:
            continue
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            # Some sites embed multiple JSON objects back-to-back. Try a soft
            # recovery: wrap in [] and join with commas.
            try:
                data = json.loads("[" + re.sub(r"}\s*{", "},{", text) + "]")
            except json.JSONDecodeError:
                continue

        nodes: list[Any] = data if isinstance(data, list) else [data]
        # Flatten @graph
        flat: list[Any] = []
        for node in nodes:
            if isinstance(node, dict) and isinstance(node.get("@graph"), list):
                flat.extend(node["@graph"])
            else:
                flat.append(node)

        for node in flat:
            if not isinstance(node, dict):
                continue
            node_type = node.get("@type")
            types = {node_type} if isinstance(node_type, str) else set(node_type or [])
            if not types & BUSINESS_LD_TYPES:
                continue

            for key in ("name", "legalName", "description", "telephone",
                        "email", "url", "image", "logo"):
                val = node.get(key)
                if val and key not in out:
                    out[key] = val if isinstance(val, str) else str(val)

            addr = node.get("address")
            if addr and "address" not in out:
                if isinstance(addr, dict):
                    parts = [
                        str(addr.get(k, "")).strip()
                        for k in ("streetAddress", "addressLocality",
                                  "addressRegion", "postalCode", "addressCountry")
                        if addr.get(k)
                    ]
                    out["address"] = ", ".join(p for p in parts if p)
                else:
                    out["address"] = str(addr).strip()

            hours = node.get("openingHoursSpecification")
            if hours and "opening_hours" not in out:
                out["opening_hours"] = _normalise_opening_hours(hours)

            same_as = node.get("sameAs")
            if same_as and "social_links" not in out:
                out["social_links"] = (
                    same_as if isinstance(same_as, list) else [str(same_as)]
                )

            rating = node.get("aggregateRating")
            if isinstance(rating, dict) and "rating" not in out:
                out["rating"] = {
                    "value": rating.get("ratingValue"),
                    "count": rating.get("reviewCount") or rating.get("ratingCount"),
                }

            if "name" in out:
                return out  # one good match is enough
    return out


def _normalise_opening_hours(spec: Any) -> list[str]:
    items = spec if isinstance(spec, list) else [spec]
    out: list[str] = []
    for item in items:
        if not isinstance(item, dict):
            continue
        days = item.get("dayOfWeek")
        if isinstance(days, list):
            day_str = ", ".join(str(d).split("/")[-1] for d in days)
        else:
            day_str = str(days or "").split("/")[-1]
        opens = item.get("opens", "")
        closes = item.get("closes", "")
        if day_str and (opens or closes):
            out.append(f"{day_str}: {opens}–{closes}".strip(" -–"))
    return out


# ─────────────────────────── Visible-text collector ────────────────────────────

class _TextCollector(HTMLParser):
    """Collect visible text grouped by tag. Fed AFTER noise tags are stripped,
    so SVG / script bodies never reach us."""

    SKIP = set(NOISE_TAGS) | {"head", "meta", "link", "title", "option"}

    def __init__(self) -> None:
        super().__init__()
        self.stack: list[str] = []
        self.chunks: list[tuple[str, str]] = []

    def handle_starttag(self, tag, attrs):  # type: ignore[override]
        self.stack.append(tag.lower())

    def handle_endtag(self, tag):  # type: ignore[override]
        lower = tag.lower()
        # Tolerate malformed nesting — pop back to the closing tag if we find it
        if lower in self.stack:
            while self.stack and self.stack[-1] != lower:
                self.stack.pop()
            self.stack.pop()

    def handle_data(self, data):  # type: ignore[override]
        if not self.stack:
            return
        if any(t in self.SKIP for t in self.stack):
            return
        txt = " ".join(data.split())
        if txt:
            self.chunks.append((self.stack[-1], txt))


# ─────────────────────── Phone extraction (strict, visible) ────────────────────

def _extract_phones_from_text(text: str) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for m in UK_PHONE_RE.finditer(text):
        raw = m.group(0).strip()
        digits = re.sub(r"\D", "", raw)
        if len(digits) < 10 or len(digits) > 13:
            continue
        normalised = re.sub(r"\s+", " ", raw)
        key = digits
        if key in seen:
            continue
        seen.add(key)
        out.append(normalised)
    return out


# ───────────────────── Body text filtering + dedupe ────────────────────────────

def _filter_body_text(chunks: list[tuple[str, str]]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for tag, txt in chunks:
        norm = txt.strip()
        if len(norm) < 8:
            continue
        lower = norm.lower()
        if any(b in lower for b in BOILERPLATE_TOKENS):
            continue
        # Reject lines that are mostly numeric / punctuation (catches any SVG
        # / script residue that slipped past the strip pass).
        alpha = sum(1 for c in norm if c.isalpha())
        if alpha < len(norm) * 0.4:
            continue
        if lower in seen:
            continue
        seen.add(lower)
        out.append(norm)
    return out


# ─────────────────────────── Site-specific extras ──────────────────────────────

def _site_extras(url: str, raw_with_scripts: str) -> dict[str, Any]:
    """Site-specific shortcuts. Receives the ORIGINAL HTML (before script
    stripping) so we can mine embedded JSON blobs."""
    host = urlparse(url).netloc.lower().lstrip(".")
    host = host[4:] if host.startswith("www.") else host
    if host.endswith("autotrader.co.uk"):
        return _extract_autotrader(raw_with_scripts)
    return {}


def _extract_autotrader(raw: str) -> dict[str, Any]:
    """AutoTrader dealer pages embed dealer + stock data in __NEXT_DATA__."""
    out: dict[str, Any] = {}
    m = re.search(
        r'<script[^>]+id=["\']__NEXT_DATA__["\'][^>]*>(.*?)</script>',
        raw, flags=re.I | re.S,
    )
    if m:
        try:
            data = json.loads(m.group(1))
            dealer = (
                data.get("props", {})
                .get("pageProps", {})
                .get("dealer")
                or data.get("props", {}).get("pageProps", {}).get("retailer")
            )
            if isinstance(dealer, dict):
                if dealer.get("name"):
                    out["name"] = dealer["name"]
                if dealer.get("phoneNumber") or dealer.get("phone"):
                    out["phone"] = dealer.get("phoneNumber") or dealer.get("phone")
                addr = dealer.get("address") or dealer.get("location")
                if isinstance(addr, dict):
                    parts = [
                        str(addr.get(k, "")).strip()
                        for k in ("addressLine1", "addressLine2", "town",
                                  "county", "postcode")
                        if addr.get(k)
                    ]
                    if parts:
                        out["address"] = ", ".join(parts)
                if dealer.get("services"):
                    out["services"] = dealer["services"]
        except (json.JSONDecodeError, AttributeError, TypeError):
            pass

    # Vehicle headings — AutoTrader retailer pages list cars as h3s under
    # "Used cars" / "Featured stock". The sidebar + FAQ accordion + footer
    # also use h3s for things like "Address", "Opening hours", "Website",
    # "Products & services" — filter them out.
    nav_h3_blacklist = {
        "main site menu", "vehicle types", "address", "opening hours",
        "website", "phone number", "about us", "featured stock",
        "get in touch", "contact us", "need to reach us quickly?",
        "frequently asked questions", "autotrader group",
        "products & services", "buying advice", "quick search",
        "autotrader for dealers", "follow autotrader", "great dealership",
    }
    cars: list[str] = []
    for m in re.finditer(r"<h3[^>]*>(.*?)</h3>", raw, flags=re.I | re.S):
        clean = re.sub(r"<[^>]+>", " ", m.group(1))
        clean = " ".join(html.unescape(clean).split())
        if not clean or not any(c.isalpha() for c in clean):
            continue
        # AutoTrader FAQ accordion items leak through as "add Question…"
        # because the expand button has aria-label "add".
        if clean.lower().startswith("add "):
            clean = clean[4:].strip()
        if clean.lower() in nav_h3_blacklist:
            continue
        # FAQ question h3s end with "?"; never a vehicle.
        if clean.endswith("?"):
            continue
        # Real vehicle h3s either carry a year in parens, a mileage hint, or
        # at least 2 words (so "Audi A1" stays in, "Address" gets dropped).
        looks_like_vehicle = (
            "reg)" in clean.lower()
            or "miles" in clean.lower()
            or len(clean.split()) >= 2
        )
        if not looks_like_vehicle:
            continue
        if clean not in cars:
            cars.append(clean)
    if cars:
        out["vehicles"] = cars[:25]
    return out


# ────────────────────────── Fetch + main entry point ───────────────────────────

def _do_fetch(url: str, headers: dict[str, str], proxies: dict[str, str] | None):
    """Single request attempt — kept small so the retry loop stays clear."""
    return requests.get(
        url,
        headers=headers,
        proxies=proxies,
        timeout=DEFAULT_TIMEOUT,
        allow_redirects=True,
    )


def _normalise_proxy_url_for_requests(raw: str | None) -> str | None:
    """Accept iProyal-style `host:port:user:pass` AND standard URLs. Returns a
    URL `requests` / urllib3 can parse. Returns None for empty input."""
    if not raw:
        return None
    raw = raw.strip()
    if not raw:
        return None
    if "://" in raw:
        return raw
    # iProyal / Smartproxy dashboard paste
    if raw.count(":") >= 3:
        parts = raw.split(":")
        if len(parts) >= 4:
            from urllib.parse import quote
            host, port, user = parts[0], parts[1], parts[2]
            password = ":".join(parts[3:])  # passwords may contain colons
            return (
                f"http://{quote(user, safe='')}:"
                f"{quote(password, safe='')}@{host}:{port}"
            )
    # `host:port` plain (no auth)
    if raw.count(":") == 1:
        return f"http://{raw}"
    return raw


def _fetch_via_requests(url: str, proxy_url: str | None) -> str:
    """Plain HTTP path — used as a fallback when Playwright is unavailable or
    fails on the chosen URL. Same UA rotation + proxy support as before."""
    normalised = _normalise_proxy_url_for_requests(proxy_url)
    proxies = {"http": normalised, "https": normalised} if normalised else None
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
    }

    resp = None
    last_err: Exception | None = None
    for attempt, ua in enumerate(USER_AGENTS):
        try:
            headers["User-Agent"] = ua
            resp = _do_fetch(url, headers, proxies)
            if resp.status_code == 200:
                break
            if resp.status_code in (403, 429) and attempt < len(USER_AGENTS) - 1:
                continue
            break
        except requests.RequestException as exc:
            last_err = exc
            if attempt < len(USER_AGENTS) - 1:
                continue
            raise

    if resp is None:
        raise RuntimeError(f"Failed to fetch URL ({last_err})")
    if resp.status_code >= 400:
        raise RuntimeError(
            f"Fetch failed with status {resp.status_code}. "
            f"Configure a UK residential proxy under Settings → Advanced → Scraper "
            f"to bypass Cloudflare-style IP blocks on sites like AutoTrader."
        )

    content_type = resp.headers.get("Content-Type", "")
    if "html" not in content_type.lower():
        raise RuntimeError(
            f"URL did not return HTML content (got {content_type or 'unknown'})"
        )
    return resp.text or ""


def fetch_structured_text(
    url: str,
    proxy_url: str | None = None,
    use_browser: bool = True,
) -> dict[str, Any]:
    """Fetch `url` and extract structured content.

    Args:
        url: The page to fetch.
        proxy_url: Optional HTTP/HTTPS proxy URL — accepts both standard URL
            form and iProyal-style `host:port:user:pass`. Falls back to the
            `BRAND_SCRAPE_PROXY_URL` env var.
        use_browser: When True (default), try Playwright first (real Chromium
            tab — passes Cloudflare challenges, executes JS, loads SPA data).
            Falls back to plain `requests` on any Playwright error. Set False
            to skip the browser entirely.

    Returns:
        A dict with backward-compatible keys (`title`, `description`,
        `keywords`, `headings`, `text`) plus enriched fields (`name`,
        `phones`, `address`, `email`, `opening_hours`, `social_links`,
        `vehicles`, `site_name`, `rating`).
    """
    proxy_url = (
        (proxy_url or os.environ.get("BRAND_SCRAPE_PROXY_URL", "")).strip()
        or None
    )

    raw_original = ""
    fetch_source = "requests"

    if use_browser:
        try:
            raw_original, _ = fetch_rendered_html(url, proxy_url=proxy_url)
            fetch_source = "playwright"
        except PlaywrightUnavailable as exc:
            LOG.info("[extractor] Playwright unavailable, using requests: %s", exc)
        except Exception as exc:
            LOG.warning("[extractor] Playwright fetch failed (%s), falling back to requests", exc)

    if not raw_original:
        raw_original = _fetch_via_requests(url, proxy_url)
        fetch_source = "requests"

    # 1. Mine the inline JSON blobs BEFORE we strip <script> tags.
    ld = _extract_json_ld(raw_original)
    extras = _site_extras(url, raw_original)

    # 2. Strip noise; everything downstream sees ONLY visible content.
    raw_clean = _strip_noise_blocks(raw_original)

    # 3. Meta tags (title / description / og:*).
    metas = _extract_meta(raw_clean)

    # 4. Visible text.
    parser = _TextCollector()
    try:
        parser.feed(raw_clean)
    except Exception:
        # Even if parsing errors midway, keep what we've collected.
        pass
    chunks = parser.chunks
    visible_text = " ".join(t for _, t in chunks)

    # 5. Phones — visible text only, strict UK format.
    phones = _extract_phones_from_text(visible_text)
    # Trust JSON-LD / site-extras telephone over regex.
    for source in (ld.get("telephone"), extras.get("phone")):
        if not source:
            continue
        canonical = re.sub(r"\s+", " ", str(source).strip())
        if canonical and canonical not in phones:
            phones.insert(0, canonical)

    # 6. Headings.
    headings: list[str] = []
    for tag, txt in chunks:
        if tag in {"h1", "h2", "h3"} and txt not in headings:
            headings.append(txt)
            if len(headings) >= MAX_HEADINGS:
                break

    # 7. Filtered + capped key text.
    filtered = _filter_body_text(chunks)
    body_text = " ".join(filtered)
    body_text = re.sub(r"\s+", " ", body_text).strip()[:MAX_KEY_TEXT_CHARS]

    # 8. Resolve canonical fields — JSON-LD wins, fall back to meta / extras.
    name = (
        ld.get("name")
        or extras.get("name")
        or metas.get("og_title")
        or metas.get("title", "")
    )
    description = ld.get("description") or metas.get("description", "")
    address = ld.get("address") or extras.get("address", "")

    # If we still don't have an address but JSON-LD has none, try to find a UK
    # postcode in the visible text and grab the line around it as a hint.
    if not address:
        m = UK_POSTCODE_RE.search(visible_text)
        if m:
            postcode = m.group(0).upper()
            # Find the surrounding line (up to 80 chars left of the postcode)
            start = max(0, m.start() - 80)
            snippet = visible_text[start:m.end()].split(".")[-1].strip()
            address = snippet if postcode in snippet else postcode

    # 9. Build the slim AI-facing blob.
    blob_lines: list[str] = []
    if name:
        blob_lines.append(f"Name: {name}")
    if description:
        blob_lines.append(f"Description: {description}")
    if address:
        blob_lines.append(f"Address: {address}")
    if phones:
        blob_lines.append("Phones: " + ", ".join(phones[:3]))
    if ld.get("email"):
        blob_lines.append(f"Email: {ld['email']}")
    if ld.get("opening_hours"):
        blob_lines.append("Opening hours: " + "; ".join(ld["opening_hours"]))
    if ld.get("social_links"):
        blob_lines.append("Social: " + ", ".join(ld["social_links"][:6]))
    if ld.get("rating"):
        r = ld["rating"]
        if r.get("value"):
            blob_lines.append(
                f"Rating: {r['value']}" + (f" ({r['count']} reviews)" if r.get("count") else "")
            )
    if extras.get("vehicles"):
        blob_lines.append("In-stock vehicles:")
        for v in extras["vehicles"][:10]:
            blob_lines.append(f"  - {v}")
    if headings:
        blob_lines.append("Headings:")
        for h in headings[:12]:
            blob_lines.append(f"  - {h}")
    if body_text:
        wrapped = textwrap.fill(body_text, width=110)
        blob_lines.append("\nKey Text:\n" + wrapped)

    blob = "\n".join(blob_lines).strip()

    return {
        # Backward-compatible keys consumed by /api/extract-website + the AI
        # prompt builder. Existing callers keep working.
        "title": name,
        "description": description,
        "keywords": metas.get("keywords", ""),
        "headings": headings,
        "text": blob,
        # Enriched structured fields. Newer consumers can read these directly
        # and skip the text blob entirely.
        "name": name,
        "phones": phones,
        "address": address,
        "email": ld.get("email", ""),
        "opening_hours": ld.get("opening_hours", []),
        "social_links": ld.get("social_links", []),
        "vehicles": extras.get("vehicles", []),
        "services": extras.get("services", []),
        "site_name": metas.get("site_name", ""),
        "rating": ld.get("rating", {}),
        "logo": ld.get("logo", "") or ld.get("image", ""),
        # Operator-visible diagnostic — was this fetched by Playwright
        # (real browser) or plain requests? Surfaced in the dashboard.
        "fetch_source": fetch_source,
    }
