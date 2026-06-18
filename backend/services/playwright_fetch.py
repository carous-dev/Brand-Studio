"""
Playwright-based fetcher for sites that block plain HTTP scrapers.

Opens a real Chromium tab, navigates as a human would (UK locale + timezone,
realistic viewport, randomised idle delay), waits for the page to settle,
returns the rendered HTML, then closes the browser. The page lifecycle is
strictly per-request — no leaked contexts between calls.

Why a real browser:
  - Cloudflare/Akamai/PerimeterX challenges that plain `requests` can't pass
  - JS-rendered content (AutoTrader hydrates dealer/stock from XHR + React)
  - Cookie-gated SPAs (one-time consent banners that gate document body)

Optional dependency. The function checks for Playwright availability lazily
so the main Flask app still imports cleanly when Playwright isn't installed —
the caller can then fall back to `requests` or surface a setup hint.

Setup on the host:
  pip install playwright
  python -m playwright install chromium       # downloads ~150MB browser
  python -m playwright install-deps chromium  # apt deps on Linux only
"""

from __future__ import annotations

import base64
import logging
import random
import time
from typing import Optional, Tuple
from urllib.parse import urlparse

LOG = logging.getLogger(__name__)


class PlaywrightUnavailable(RuntimeError):
    """Raised when Playwright isn't installed or chromium isn't available."""


def _parse_proxy(proxy_url: str) -> Optional[dict]:
    """Convert a proxy URL (or iProyal-style `host:port:user:pass`) into the
    dict shape Playwright expects: {server, username, password}."""
    if not proxy_url:
        return None

    raw = proxy_url.strip()
    if not raw:
        return None

    # iProyal / Smartproxy dashboard format: host:port:user:pass
    if "://" not in raw and raw.count(":") >= 3:
        parts = raw.split(":")
        host, port, user, pwd = parts[0], parts[1], parts[2], ":".join(parts[3:])
        return {
            "server": f"http://{host}:{port}",
            "username": user,
            "password": pwd,
        }

    # Standard URL form
    parsed = urlparse(raw)
    if not parsed.hostname:
        return None
    port = f":{parsed.port}" if parsed.port else ""
    server = f"{parsed.scheme or 'http'}://{parsed.hostname}{port}"
    cfg: dict = {"server": server}
    if parsed.username:
        cfg["username"] = parsed.username
    if parsed.password:
        cfg["password"] = parsed.password
    return cfg


def fetch_rendered_html(
    url: str,
    proxy_url: Optional[str] = None,
    timeout_ms: int = 30000,
    user_agent: Optional[str] = None,
    wait_selector: Optional[str] = None,
) -> Tuple[str, dict]:
    """Open `url` in a headless Chromium tab, return the rendered HTML.

    Args:
        url: Page to load.
        proxy_url: Optional proxy URL or iProyal-style `host:port:user:pass`.
        timeout_ms: Per-action timeout (navigation + waits).
        user_agent: Optional UA override. Defaults to a realistic Chrome UA.
        wait_selector: Optional CSS selector to wait for before reading content
            (useful for SPAs where the page shell loads fast but the data
            arrives via XHR).

    Returns:
        (rendered_html, meta) where meta contains {final_url, status,
        title, content_type}.

    Raises:
        PlaywrightUnavailable: Playwright isn't importable or chromium isn't
            installed. Caller should fall back to requests.
        RuntimeError: Navigation failed (timeout, network error, etc.).
    """
    try:
        from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
    except ImportError as exc:
        raise PlaywrightUnavailable(
            "Playwright not installed. Run: pip install playwright && "
            "python -m playwright install chromium"
        ) from exc

    proxy_cfg = _parse_proxy(proxy_url) if proxy_url else None

    ua = user_agent or (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )

    started = time.time()
    LOG.info("[playwright] launching chromium for %s (proxy=%s)", url, "yes" if proxy_cfg else "no")

    with sync_playwright() as p:
        # Pass the proxy server to chromium but DROP the auth fields — the
        # chromium-headless-shell that Playwright 1.50+ downloads by default
        # fails with `ERR_PROXY_AUTH_UNSUPPORTED` when the `username` /
        # `password` proxy fields are set (Chromium's headless build doesn't
        # surface the auth challenge to Playwright). Instead we hook a CDP
        # `Fetch.authRequired` handler below and supply the credentials there.
        launch_kwargs: dict = {"headless": True}
        proxy_auth: dict | None = None
        if proxy_cfg:
            launch_kwargs["proxy"] = {"server": proxy_cfg["server"]}
            if proxy_cfg.get("username") and proxy_cfg.get("password"):
                proxy_auth = {
                    "username": proxy_cfg["username"],
                    "password": proxy_cfg["password"],
                }
        try:
            browser = p.chromium.launch(**launch_kwargs)
        except Exception as exc:
            msg = str(exc)
            if "Executable doesn't exist" in msg or "chromium-" in msg:
                raise PlaywrightUnavailable(
                    "Chromium not installed for Playwright. Run: "
                    "python -m playwright install chromium"
                ) from exc
            raise RuntimeError(f"Failed to launch browser: {exc}") from exc

        try:
            context = browser.new_context(
                user_agent=ua,
                viewport={"width": 1366, "height": 768},
                locale="en-GB",
                timezone_id="Europe/London",
                # Block heavy resources we don't need for text extraction —
                # images / fonts / media. Saves bandwidth + latency, especially
                # behind a metered residential proxy.
                java_script_enabled=True,
            )
            # Block obviously expensive resources to keep per-request cost
            # tolerable on metered residential proxies.
            context.route(
                "**/*",
                lambda route: route.abort()
                if route.request.resource_type in {"image", "media", "font"}
                else route.continue_(),
            )

            page = context.new_page()
            page.set_default_timeout(timeout_ms)

            # Wire CDP proxy-auth handler. Without this, headless-shell errors
            # out with ERR_PROXY_AUTH_UNSUPPORTED on every authed proxy.
            if proxy_auth:
                cdp = context.new_cdp_session(page)
                cdp.send("Fetch.enable", {"handleAuthRequests": True})

                def _on_request_paused(event: dict) -> None:
                    try:
                        cdp.send("Fetch.continueRequest", {"requestId": event["requestId"]})
                    except Exception:
                        pass

                def _on_auth_required(event: dict) -> None:
                    try:
                        cdp.send("Fetch.continueWithAuth", {
                            "requestId": event["requestId"],
                            "authChallengeResponse": {
                                "response": "ProvideCredentials",
                                "username": proxy_auth["username"],
                                "password": proxy_auth["password"],
                            },
                        })
                    except Exception:
                        pass

                cdp.on("Fetch.requestPaused", _on_request_paused)
                cdp.on("Fetch.authRequired", _on_auth_required)

            try:
                response = page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
            except Exception as goto_exc:
                msg = str(goto_exc)
                if "ERR_PROXY_AUTH_UNSUPPORTED" in msg:
                    raise RuntimeError(
                        "Chromium headless-shell can't authenticate to this proxy "
                        "(known limitation in the lightweight build Playwright "
                        "downloads by default). Install the full Chromium browser: "
                        "python -m playwright install chromium --no-shell"
                    ) from goto_exc
                if "ERR_TUNNEL_CONNECTION_FAILED" in msg:
                    raise RuntimeError(
                        "Proxy refused the tunnel (often: account out of bandwidth, "
                        "wrong username modifier for your iProyal product, or IP not "
                        "whitelisted). Check your proxy dashboard."
                    ) from goto_exc
                raise
            status = response.status if response else 0
            final_url = response.url if response else url
            content_type = (
                response.header_value("content-type") if response else ""
            ) or ""

            if status and status >= 400:
                raise RuntimeError(
                    f"Navigation returned {status}. "
                    f"For Cloudflare-gated sites set a UK residential proxy in "
                    f"Settings → Advanced → Scraper proxy."
                )

            if wait_selector:
                try:
                    page.wait_for_selector(wait_selector, timeout=timeout_ms)
                except PWTimeout:
                    LOG.warning("[playwright] wait_selector %r timed out — continuing", wait_selector)

            # Settle: wait for network idle (≤500ms with ≤2 pending), but cap
            # so SPAs with long-poll connections don't block us forever.
            try:
                page.wait_for_load_state("networkidle", timeout=min(timeout_ms, 10000))
            except PWTimeout:
                pass  # not fatal — most pages are usable at DOMContentLoaded

            # Tiny humanised pause before reading content (some anti-bot scripts
            # gate on instant-read timing).
            time.sleep(random.uniform(0.4, 0.9))

            rendered = page.content()
            title = page.title()

            LOG.info(
                "[playwright] %s -> %d in %.2fs (%d chars)",
                final_url, status, time.time() - started, len(rendered),
            )

            return rendered, {
                "final_url": final_url,
                "status": status,
                "title": title,
                "content_type": content_type,
            }
        finally:
            try:
                context.close()
            except Exception:
                pass
            try:
                browser.close()
            except Exception:
                pass
