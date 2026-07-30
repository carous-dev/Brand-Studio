#!/usr/bin/env node
/**
 * theme-shots.mjs — screenshot a locally-running theme at multiple widths.
 *
 * The visual-verification primitive for the /theme-builder pipeline.
 * Requires the Next dev/prod server to ALREADY be running (this script never
 * starts or stops servers) and, for brand-bound rendering, a base URL whose
 * hostname resolves the brand (e.g. http://<slug>.lvh.me:3000, or any host
 * combined with --resolve to map it to 127.0.0.1 inside Chrome).
 *
 *   node tools/theme-shots.mjs --base http://my-theme-qa.lvh.me:3000 \
 *     --routes /,/used-cars --widths 505,768,1024,1440 \
 *     --out C:/tmp/shots --tag header-1
 *
 * Flags:
 *   --base <url>        required. Server root incl. port.
 *   --routes <list>     comma-separated paths (default "/").
 *   --widths <list>     comma-separated px (default 505,768,1024,1440).
 *                       NOTE: headless Chrome clamps window width to ~500px —
 *                       anything below 505 is rejected (it would silently
 *                       render ~500px and fake mobile overflow).
 *   --height <px>       window height per shot (default 3200).
 *   --out <dir>         output dir (default <os tmp>/theme-shots).
 *   --tag <label>       filename prefix (e.g. "<component>-<iteration>").
 *   --resolve <host>    add --host-resolver-rules "MAP <host> 127.0.0.1".
 *   --chrome <path>     Chrome binary (else CHROME_PATH env, else standard
 *                       install locations).
 *   --budget <ms>       --virtual-time-budget per shot (default 12000).
 *
 * Prints one "[shot] <path>" line per capture; exits 1 if any capture failed
 * or the server is unreachable.
 */

import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, statSync, mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

const MIN_WIDTH = 505 // headless Chrome clamps ~500px; 505 still matches ≤767 MQs

// Git Bash (MSYS) rewrites a bare "/" argument into its install root
// (e.g. "C:/Program Files/Git"). Recover the intended route.
function unmangleRoute(route) {
  if (/^[A-Za-z]:[\\/]/.test(route)) {
    const tail = route.replace(/^[A-Za-z]:[\\/](Program Files( \(x86\))?[\\/]Git[\\/]?)?/i, "")
    return "/" + tail.replace(/\\/g, "/").replace(/^\/+/, "")
  }
  return route.startsWith("/") ? route : `/${route}`
}

// Real small-device presets for CDP emulation (--device mode). True sub-500px
// viewports + retina + touch + mobile UA — unreachable by the window-size path
// (which Chrome clamps at ~500px). Names are case-insensitive.
const DEVICES = {
  iphone13: {
    label: "iphone13", width: 390, height: 844, dsf: 2,
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  },
  androids: {
    label: "androidS", width: 360, height: 800, dsf: 3,
    ua: "Mozilla/5.0 (Linux; Android 13; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  },
}

function parseArgs(argv) {
  const args = {
    routes: ["/"],
    widths: [505, 768, 1024, 1440],
    height: 3200,
    out: path.join(tmpdir(), "theme-shots"),
    tag: "",
    budget: 12000,
    devices: [],
    reducedMotion: false,
  }
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i]
    const val = argv[i + 1]
    switch (key) {
      case "--base": args.base = val; i++; break
      case "--routes": args.routes = val.split(",").map((r) => unmangleRoute(r.trim())).filter(Boolean); i++; break
      case "--widths": args.widths = val.split(",").map((w) => parseInt(w.trim(), 10)).filter((w) => !Number.isNaN(w)); i++; break
      case "--height": args.height = parseInt(val, 10); i++; break
      case "--out": args.out = val; i++; break
      case "--tag": args.tag = val; i++; break
      case "--resolve": args.resolve = val; i++; break
      case "--chrome": args.chrome = val; i++; break
      case "--budget": args.budget = parseInt(val, 10); i++; break
      case "--device": args.devices = val.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean); i++; break
      case "--reduced-motion": args.reducedMotion = true; break
      default:
        console.error(`[theme-shots] unknown flag: ${key}`)
        process.exit(2)
    }
  }
  if (!args.base) {
    console.error("[theme-shots] --base <url> is required (e.g. http://<slug>.lvh.me:3000)")
    process.exit(2)
  }
  const badDev = args.devices.filter((d) => !DEVICES[d])
  if (badDev.length) {
    console.error(`[theme-shots] unknown --device: ${badDev.join(", ")}. Known: ${Object.keys(DEVICES).join(", ")}`)
    process.exit(2)
  }
  // Width floor only applies to the window-size path (not CDP device emulation).
  if (args.devices.length) return args
  const bad = args.widths.filter((w) => w < MIN_WIDTH)
  if (bad.length) {
    console.error(
      `[theme-shots] width(s) ${bad.join(", ")} rejected: headless Chrome clamps window width to ~500px, ` +
        `so narrower requests silently render ~500px and fake mobile overflow. Use ${MIN_WIDTH}+ (505 = mobile check).`
    )
    process.exit(2)
  }
  return args
}

function findChrome(explicit) {
  const candidates = [
    explicit,
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe") : null,
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean)
  for (const c of candidates) {
    if (existsSync(c)) return c
  }
  console.error("[theme-shots] Chrome not found. Pass --chrome <path> or set CHROME_PATH.")
  process.exit(2)
}

async function checkServer(base) {
  const url = new URL(base)
  const probes = [base]
  // With --resolve, the hostname only resolves inside Chrome — probe loopback too.
  probes.push(`http://127.0.0.1:${url.port || "80"}/`)
  for (let attempt = 0; attempt < 2; attempt++) {
    for (const probe of probes) {
      try {
        // Any HTTP response (even 500) proves a server is listening.
        await fetch(probe, { redirect: "manual", signal: AbortSignal.timeout(15000) })
        return true
      } catch {
        /* try next probe */
      }
    }
  }
  return false
}

function routeSlug(route) {
  const cleaned = route.replace(/^\/+|\/+$/g, "")
  return cleaned === "" ? "home" : cleaned.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
}

const args = parseArgs(process.argv)
const chrome = findChrome(args.chrome)

if (!(await checkServer(args.base))) {
  console.error(
    `[theme-shots] no server responding at ${args.base}.\n` +
      `Boot it first (one instance owns .next/dev/lock):\n` +
      `  1. kill stray next processes + remove stale .next/dev/lock\n` +
      `  2. ensure the Flask previews API is up on :5000\n` +
      `  3. npm run dev   (brand resolves per-request from the hostname)`
  )
  process.exit(1)
}

mkdirSync(args.out, { recursive: true })

// --- CDP device-emulation path (true small-device / retina / touch / reduced-motion) ---
if (args.devices.length) {
  const results = []
  let puppeteer
  try {
    puppeteer = (await import("puppeteer-core")).default
  } catch {
    console.error("[theme-shots] --device needs puppeteer-core (already a repo dep). Run from the repo so node_modules resolves.")
    process.exit(2)
  }
  const launchArgs = ["--no-sandbox", "--hide-scrollbars"]
  if (args.resolve) launchArgs.push(`--host-resolver-rules=MAP ${args.resolve} 127.0.0.1`)
  const browser = await puppeteer.launch({ executablePath: chrome, headless: "new", args: launchArgs })
  try {
    for (const route of args.routes) {
      const url = new URL(route, args.base).toString()
      for (const devKey of args.devices) {
        const d = DEVICES[devKey]
        const page = await browser.newPage()
        try {
          await page.setUserAgent(d.ua)
          await page.setViewport({
            width: d.width, height: d.height, deviceScaleFactor: d.dsf,
            isMobile: true, hasTouch: true,
          })
          // Headless Chrome defaults to reduced-motion, which would freeze all
          // furnishing (canvas/ken-burns/mfx) — so explicitly emulate the rich
          // state by default and only reduce when asked. This is what lets the
          // device shots show the FURNISHED render, and makes --reduced-motion a
          // meaningful contrast.
          await page.emulateMediaFeatures([
            { name: "prefers-reduced-motion", value: args.reducedMotion ? "reduce" : "no-preference" },
          ])
          const rm = args.reducedMotion ? "-rm" : ""
          const name = [args.tag, routeSlug(route), d.label + rm].filter(Boolean).join("-") + ".png"
          const outFile = path.resolve(args.out, name)
          await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 })
          await new Promise((r) => setTimeout(r, 1400)) // settle AOS/canvas
          // Also measure horizontal overflow — the #1 small-device bug.
          const overflow = await page.evaluate(
            () => Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
          )
          await page.screenshot({ path: outFile, fullPage: true })
          const ok = existsSync(outFile) && statSync(outFile).size > 1_000
          results.push({ outFile, ok })
          if (ok) {
            console.log(`[shot] ${outFile}${overflow > 1 ? `  [WARN x-overflow ${overflow}px]` : ""}`)
          } else {
            console.error(`[FAIL] ${url} @ ${d.label}`)
          }
        } finally {
          await page.close()
        }
      }
    }
  } finally {
    await browser.close()
  }
  const failed = results.filter((r) => !r.ok)
  console.log(`[theme-shots] ${results.length - failed.length}/${results.length} captured (device emulation)`)
  process.exit(failed.length ? 1 : 0)
}

// --- window-size path (505/768/1024/1440 desktop; the fast default) ---
// Isolated profile so a user's open Chrome doesn't hijack the run.
const profileDir = mkdtempSync(path.join(tmpdir(), "theme-shots-profile-"))

const results = []
try {
  for (const route of args.routes) {
    // Probe the route so a 404/500 page can't masquerade as a valid shot.
    // With --resolve the host only resolves inside Chrome — skip the probe then.
    if (!args.resolve) {
      try {
        const probe = await fetch(new URL(route, args.base), { signal: AbortSignal.timeout(15000) })
        if (probe.status >= 400) {
          console.error(`[warn] ${route} answered HTTP ${probe.status} — screenshot will show an error page`)
        }
      } catch {
        console.error(`[warn] ${route} probe failed — screenshot may show an error page`)
      }
    }
    for (const width of args.widths) {
      const name = [args.tag, routeSlug(route), `w${width}`].filter(Boolean).join("-") + ".png"
      const outFile = path.resolve(args.out, name)
      const url = new URL(route, args.base).toString()
      const chromeArgs = [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--no-first-run",
        "--disable-extensions",
        `--user-data-dir=${profileDir}`,
        `--window-size=${width},${args.height}`,
        `--virtual-time-budget=${args.budget}`,
        `--screenshot=${outFile}`,
      ]
      if (args.resolve) {
        chromeArgs.push(`--host-resolver-rules=MAP ${args.resolve} 127.0.0.1`)
      }
      chromeArgs.push(url)

      const run = spawnSync(chrome, chromeArgs, { timeout: 90_000, stdio: "pipe" })
      const ok = existsSync(outFile) && statSync(outFile).size > 1_000
      results.push({ outFile, ok, url, width })
      if (ok) {
        console.log(`[shot] ${outFile}`)
      } else {
        const stderr = (run.stderr || "").toString().split("\n").slice(-4).join(" ").trim()
        console.error(`[FAIL] ${url} @ ${width}px → ${outFile}${stderr ? ` (${stderr})` : ""}`)
      }
    }
  }
} finally {
  try {
    rmSync(profileDir, { recursive: true, force: true })
  } catch {
    /* profile cleanup is best-effort */
  }
}

const failed = results.filter((r) => !r.ok)
console.log(`[theme-shots] ${results.length - failed.length}/${results.length} captured`)
process.exit(failed.length ? 1 : 0)
