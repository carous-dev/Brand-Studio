#!/usr/bin/env node
/**
 * extract-theme-dna.mjs
 *
 * Reads a carous-platform app folder (apps/<name>) and emits a "visual DNA"
 * JSON file describing the things a brandstudio theme cares about:
 *  - signature colors  (primary / accent / surfaces / text — used as fallbacks
 *                       in the theme's BrandStyles.tsx so unbranded previews
 *                       still feel like the source app)
 *  - typography        (heading + body family, Google Fonts URL)
 *  - radii / shadows   (button & card shape personality)
 *  - hero metrics      (min-heights + overlay tint)
 *  - profile snippet   (1-line description for theme.json)
 *
 * Usage:
 *   node tools/extract-theme-dna.mjs --source <app-folder> [--apps <abs-path>] [--out <path>]
 *
 *   --source   Folder name under apps/  (e.g. "huntsmotors")           [required]
 *   --apps     Path to carous-platform/apps                            [optional]
 *              Resolution order (first match wins):
 *                1. --apps CLI argument
 *                2. CAROUS_PLATFORM_APPS env var (e.g. "/home/u/carous-platform/apps")
 *                3. ../carous-platform/apps (sibling of the brandstudio repo)
 *                4. ../../carous-platform/apps (grandparent fallback)
 *              Cross-platform: works on Windows / macOS / Linux without code edits.
 *   --out      Where to write the DNA JSON                             [optional]
 *              Defaults to tools/.theme-dna/<source>.json
 */

import { promises as fs } from 'node:fs'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')
const DEFAULT_OUT_DIR = path.join(TOOLS_DIR, '.theme-dna')

// Resolve carous-platform/apps in a portable way. Mode B is internal-only,
// so when we can't find it we error with a clear message — never silently
// fall back to a nonexistent path.
function resolveAppsRoot(cliArg) {
  const candidates = []
  if (cliArg) candidates.push(cliArg)
  if (process.env.CAROUS_PLATFORM_APPS) candidates.push(process.env.CAROUS_PLATFORM_APPS)
  candidates.push(path.resolve(PROJECT_ROOT, '..', 'carous-platform', 'apps'))
  candidates.push(path.resolve(PROJECT_ROOT, '..', '..', 'carous-platform', 'apps'))
  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) return candidate
  }
  return null
}

// --- arg parsing ------------------------------------------------------------

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i]
    if (!flag.startsWith('--')) continue
    const key = flag.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      i++
    }
  }
  return args
}

// --- file helpers -----------------------------------------------------------

async function readText(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    return null
  }
}

async function exists(p) {
  try { await fs.access(p); return true } catch { return false }
}

// --- extractors -------------------------------------------------------------

const HEX = /#([0-9a-fA-F]{3,8})\b/g
const CSS_VAR_DECL = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g
const GOOGLE_FONTS = /https:\/\/fonts\.googleapis\.com\/css2\?[^"'`)]+/g
const NEXT_FONT_IMPORT = /import\s*\{\s*([A-Z][A-Za-z0-9_]+(?:\s*,\s*[A-Z][A-Za-z0-9_]+)*)\s*\}\s*from\s*['"]next\/font\/google['"]/

function extractCssVariables(css) {
  const map = {}
  if (!css) return map
  let match
  CSS_VAR_DECL.lastIndex = 0
  while ((match = CSS_VAR_DECL.exec(css)) !== null) {
    const name = match[1].trim()
    const value = match[2].trim()
    if (!(name in map)) map[name] = value
  }
  return map
}

function pickFirst(map, keys) {
  for (const k of keys) {
    if (map[k] && !/var\(/.test(map[k])) return map[k]
    if (map[k]) return map[k]
  }
  return null
}

function extractColors(globalsCss, themeStyleJson) {
  // theme-style.json wins when present (e.g. visionprestige)
  if (themeStyleJson?.cssVariables) {
    const v = themeStyleJson.cssVariables
    return {
      primary: pickFirst(v, ['color-brand-500', 'color-brand-600', 'primary-red', 'color-primary']) || '#0f172a',
      primaryDark: pickFirst(v, ['color-brand-700', 'primary-red-dark']) || null,
      accent: pickFirst(v, ['color-brand-400', 'color-accent']) || null,
      bg: pickFirst(v, ['color-surface-base', 'color-bg', 'white']) || '#ffffff',
      surface: pickFirst(v, ['color-surface-muted', 'color-surface-subtle', 'panel']) || '#f8fafc',
      text: pickFirst(v, ['color-text-primary', 'dark-gray', 'color-text']) || '#111827',
      muted: pickFirst(v, ['color-text-muted', 'color-text-secondary']) || '#6b7280',
      border: pickFirst(v, ['color-border-default', 'border-gray']) || '#e5e7eb',
    }
  }
  const v = extractCssVariables(globalsCss || '')
  return {
    primary: pickFirst(v, ['primary', 'accent', 'brand-primary', 'color-primary']) || '#0f172a',
    primaryDark: pickFirst(v, ['primary-dark', 'accent-dark']) || null,
    accent: pickFirst(v, ['accent-2', 'accent', 'brand-accent']) || null,
    bg: pickFirst(v, ['bg', 'background', 'color-bg', 'white']) || '#ffffff',
    surface: pickFirst(v, ['surface-light', 'panel', 'card', 'surface']) || '#f7f9fc',
    text: pickFirst(v, ['text', 'text-dark', 'dark-gray', 'color-text']) || '#0f1623',
    muted: pickFirst(v, ['muted', 'medium-gray', 'color-text-muted']) || '#6b7280',
    border: pickFirst(v, ['border', 'border-gray', 'color-border']) || '#e5e7eb',
  }
}

function extractRadii(globalsCss, themeStyleJson) {
  if (themeStyleJson?.cssVariables) {
    const v = themeStyleJson.cssVariables
    return {
      card: v['border-radius-lg'] || v['border-radius-md'] || '14px',
      button: v['border-radius-full'] || v['border-radius-lg'] || '999px',
      input: v['border-radius-full'] || v['border-radius-md'] || '999px',
      pill: v['border-radius-full'] || '999px',
    }
  }
  const v = extractCssVariables(globalsCss || '')
  const radius = v['radius'] || '12px'
  return {
    card: radius,
    button: radius === '0' || radius === '0px' ? '4px' : '999px',
    input: '999px',
    pill: '999px',
  }
}

function extractShadows(globalsCss, themeStyleJson) {
  if (themeStyleJson?.cssVariables) {
    const v = themeStyleJson.cssVariables
    return {
      card: v['shadow-md'] || '0 18px 40px rgba(15, 23, 42, 0.18)',
      floating: v['shadow-lg'] || '0 22px 48px rgba(0, 0, 0, 0.3)',
      button: v['shadow-sm'] || '0 8px 22px rgba(15, 23, 42, 0.20)',
    }
  }
  return {
    card: '0 18px 40px rgba(15, 23, 42, 0.18)',
    floating: '0 22px 48px rgba(0, 0, 0, 0.3)',
    button: '0 8px 22px rgba(15, 23, 42, 0.20)',
  }
}

function extractFonts(layoutTsx, baseCss, themeStyleJson) {
  const stylesheets = []
  const headingCandidates = []
  const bodyCandidates = []

  if (themeStyleJson?.fontStylesheets?.length) {
    stylesheets.push(...themeStyleJson.fontStylesheets)
  }
  if (themeStyleJson?.cssVariables) {
    const v = themeStyleJson.cssVariables
    if (v['font-family-heading']) headingCandidates.push(v['font-family-heading'])
    if (v['font-family-body']) bodyCandidates.push(v['font-family-body'])
    if (v['font-family-sans']) bodyCandidates.push(v['font-family-sans'])
  }

  // Scan layout.tsx for next/font/google imports — DM_Sans, Inter, etc.
  if (layoutTsx) {
    const importMatch = layoutTsx.match(NEXT_FONT_IMPORT)
    if (importMatch) {
      const families = importMatch[1].split(',').map((s) => s.trim().replace(/_/g, ' '))
      for (const fam of families) {
        bodyCandidates.push(`'${fam}', 'Segoe UI', sans-serif`)
      }
    }
    let m
    GOOGLE_FONTS.lastIndex = 0
    while ((m = GOOGLE_FONTS.exec(layoutTsx)) !== null) stylesheets.push(m[0])
  }

  if (baseCss) {
    let m
    GOOGLE_FONTS.lastIndex = 0
    while ((m = GOOGLE_FONTS.exec(baseCss)) !== null) stylesheets.push(m[0])
  }

  // Sensible fallbacks if nothing detected
  const heading =
    headingCandidates[0] || bodyCandidates[0] || "'Inter', 'Segoe UI', sans-serif"
  const body =
    bodyCandidates[0] || "'Inter', 'Segoe UI', sans-serif"

  // If no @import URL was found, synthesize one from the heading + body
  // family names so the theme's base.css can actually load the font.
  // (Apps using next/font/google don't have @import URLs in their CSS.)
  let finalStylesheets = Array.from(new Set(stylesheets))
  if (finalStylesheets.length === 0) {
    const synth = synthesizeGoogleFontsUrl([heading, body])
    if (synth) finalStylesheets = [synth]
  }

  return {
    heading,
    body,
    stylesheets: finalStylesheets,
    headingWeight: 700,
    bodyWeight: 400,
  }
}

const KNOWN_GOOGLE_FONTS = new Set([
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat',
  'Oswald', 'Raleway', 'Nunito', 'Source Sans 3', 'Source Sans Pro',
  'Playfair Display', 'Merriweather', 'PT Sans', 'Work Sans', 'Ubuntu',
  'Mukta', 'DM Sans', 'DM Serif Display', 'Manrope', 'Plus Jakarta Sans',
  'Karla', 'Cabin', 'Quicksand', 'Bitter', 'Crimson Pro', 'Lora',
  'Public Sans', 'Space Grotesk', 'Outfit', 'Sora',
])

function extractFirstFamily(stack) {
  if (!stack) return null
  const m = String(stack).match(/['"]([^'"]+)['"]/)
  if (m) return m[1].trim()
  const first = String(stack).split(',')[0].trim().replace(/['"]/g, '')
  return first || null
}

function synthesizeGoogleFontsUrl(stacks) {
  const families = []
  for (const s of stacks) {
    const fam = extractFirstFamily(s)
    if (fam && KNOWN_GOOGLE_FONTS.has(fam) && !families.includes(fam)) {
      families.push(fam)
    }
  }
  if (families.length === 0) return null
  const params = families
    .map((fam) => `family=${fam.replace(/\s+/g, '+')}:wght@400;500;600;700`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}

function extractHeroMetrics(globalsCss) {
  // Most apps don't expose hero metrics as variables; use sane defaults
  // tuned to dealer-site conventions and let the skill operator refine.
  return {
    minHeight: '560px',
    minHeightLg: '620px',
    minHeightSm: '460px',
    overlayStart: 'rgba(6, 10, 16, 0.30)',
    overlayEnd: 'rgba(6, 10, 16, 0.65)',
    searchRadius: '999px',
  }
}

function deriveProfileSnippet(profileTxt, sourceName) {
  if (!profileTxt) return null
  // Take first non-empty paragraph, truncate to ~220 chars.
  const lines = profileTxt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const firstParagraph = lines.slice(0, 6).join(' ').replace(/\s+/g, ' ').trim()
  if (!firstParagraph) return null
  return firstParagraph.length > 220
    ? firstParagraph.slice(0, 217).trimEnd() + '...'
    : firstParagraph
}

// --- main -------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.source) {
    console.error('Missing required --source <app-folder>')
    console.error('Usage: node tools/extract-theme-dna.mjs --source <app-folder> [--apps <path>] [--out <path>]')
    process.exit(1)
  }

  const cliApps = args.apps && typeof args.apps === 'string' ? args.apps : null
  const appsRoot = resolveAppsRoot(cliApps)

  if (!appsRoot) {
    console.error('Could not locate carous-platform/apps. Tried:')
    if (cliApps) console.error(`  --apps ${cliApps}`)
    console.error(`  $CAROUS_PLATFORM_APPS = ${process.env.CAROUS_PLATFORM_APPS || '(unset)'}`)
    console.error(`  ${path.resolve(PROJECT_ROOT, '..', 'carous-platform', 'apps')} (sibling of brandstudio)`)
    console.error(`  ${path.resolve(PROJECT_ROOT, '..', '..', 'carous-platform', 'apps')} (grandparent fallback)`)
    console.error('Pass --apps <path> or set CAROUS_PLATFORM_APPS env var to your carous-platform/apps directory.')
    process.exit(1)
  }

  const sourceDir = path.join(appsRoot, args.source)

  if (!(await exists(sourceDir))) {
    console.error(`Source app folder not found: ${sourceDir}`)
    process.exit(1)
  }

  const [globalsCss, baseCss, layoutTsx, themeStyleRaw, profileTxt] = await Promise.all([
    readText(path.join(sourceDir, 'app', 'globals.css')),
    readText(path.join(sourceDir, 'app', 'styles', 'base.css')),
    readText(path.join(sourceDir, 'app', 'layout.tsx')),
    readText(path.join(sourceDir, 'theme-style.json')),
    readText(path.join(sourceDir, 'profile.txt')),
  ])

  let themeStyleJson = null
  if (themeStyleRaw) {
    try {
      const parsed = JSON.parse(themeStyleRaw)
      // Normalize cssVariable keys: strip leading "--" so pickFirst() lookups
      // match the same key shape used for keys parsed out of globals.css.
      if (parsed?.cssVariables && typeof parsed.cssVariables === 'object') {
        const normalized = {}
        for (const [k, v] of Object.entries(parsed.cssVariables)) {
          normalized[k.replace(/^--/, '')] = v
        }
        parsed.cssVariables = normalized
      }
      themeStyleJson = parsed
    } catch { /* tolerate bad JSON */ }
  }

  const dna = {
    sourceApp: args.source,
    capturedAt: new Date().toISOString(),
    profile: deriveProfileSnippet(profileTxt, args.source),
    colors: extractColors(globalsCss, themeStyleJson),
    fonts: extractFonts(layoutTsx, baseCss, themeStyleJson),
    radii: extractRadii(globalsCss, themeStyleJson),
    shadows: extractShadows(globalsCss, themeStyleJson),
    hero: extractHeroMetrics(globalsCss),
    spacing: {
      sectionInset: '20px',
      sectionGap: '64px',
      containerMax: '1200px',
      headerMax: '1400px',
    },
    notes: {
      hasGlobalsCss: !!globalsCss,
      hasBaseCss: !!baseCss,
      hasLayoutTsx: !!layoutTsx,
      hasThemeStyleJson: !!themeStyleJson,
      hasProfileTxt: !!profileTxt,
    },
  }

  const outPath = args.out && typeof args.out === 'string'
    ? path.resolve(args.out)
    : path.join(DEFAULT_OUT_DIR, `${args.source}.json`)

  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, JSON.stringify(dna, null, 2) + '\n', 'utf8')

  console.log(`DNA extracted from ${args.source} -> ${path.relative(PROJECT_ROOT, outPath)}`)
  console.log(`  primary: ${dna.colors.primary}`)
  console.log(`  surface: ${dna.colors.surface}`)
  console.log(`  heading: ${dna.fonts.heading}`)
  console.log(`  body:    ${dna.fonts.body}`)
  console.log(`  radius:  ${dna.radii.card} card / ${dna.radii.button} button`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(1)
})
