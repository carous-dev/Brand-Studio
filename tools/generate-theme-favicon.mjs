#!/usr/bin/env node
/**
 * generate-theme-favicon.mjs
 *
 * Emits a modern, archetype-aware SVG favicon for a brandstudio theme.
 * Output: public/themes/<theme-id>/favicon.svg
 *
 * Resolution order for inputs (first match wins):
 *   --primary <hex>       → DNA notes.colorsExtractor / colors.primary
 *   --archetype <id>      → DNA notes.archetype
 *   --glyph <single-char> → first letter of theme.json `name`
 *
 * The /new-theme skill calls this in Phase 7.5 (right after fetch-theme-images)
 * with all four args derived from the DNA JSON. Manual runs can pass any
 * subset; missing inputs are resolved from theme.json + DNA on disk.
 *
 * Usage:
 *   node tools/generate-theme-favicon.mjs --theme-id <id> [--primary #hex]
 *        [--accent #hex] [--archetype classic|modern|rugged|luxury|prestige]
 *        [--glyph X] [--dna <path>]
 */

import { promises as fs } from 'node:fs'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')

const ARCHETYPES = new Set(['classic', 'modern', 'rugged', 'luxury', 'prestige'])

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

function normalizeHex(hex) {
  if (typeof hex !== 'string') return null
  let h = hex.trim()
  if (!h) return null
  if (!h.startsWith('#')) h = `#${h}`
  if (!/^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(h)) return null
  // expand #abc → #aabbcc
  if (h.length === 4) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
  }
  return h.toLowerCase()
}

function darken(hex, ratio) {
  const h = normalizeHex(hex)
  if (!h) return hex
  const r = parseInt(h.slice(1, 3), 16)
  const g = parseInt(h.slice(3, 5), 16)
  const b = parseInt(h.slice(5, 7), 16)
  const mix = (c) => Math.max(0, Math.min(255, Math.round(c * (1 - ratio))))
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

function lighten(hex, ratio) {
  const h = normalizeHex(hex)
  if (!h) return hex
  const r = parseInt(h.slice(1, 3), 16)
  const g = parseInt(h.slice(3, 5), 16)
  const b = parseInt(h.slice(5, 7), 16)
  const mix = (c) => Math.max(0, Math.min(255, Math.round(c + (255 - c) * ratio)))
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

async function readJsonSafe(p) {
  try {
    const raw = await fs.readFile(p, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function discoverDnaPath(themeId, explicit) {
  if (explicit) {
    if (existsSync(explicit)) return explicit
    return null
  }
  // Try common DNA filenames derived from theme id
  const candidates = [
    themeId,
    themeId.replace(/-bespoke$/, ''),
    themeId.replace(/-classic$/, ''),
    themeId.replace(/-(bespoke|classic|drive|dealer)$/, ''),
  ]
  for (const stem of candidates) {
    const p = path.join(PROJECT_ROOT, 'tools', '.theme-dna', `${stem}.json`)
    if (existsSync(p)) return p
  }
  return null
}

function pickGlyph(rawName, themeId) {
  const candidate = (rawName || themeId || 'T').trim()
  // Find the first alphanumeric character, prefer letters
  const match = candidate.match(/[A-Za-z]/)
  return (match ? match[0] : candidate[0] || 'T').toUpperCase()
}

// -----------------------------------------------------------------------------
// SVG templates — one per archetype. All 32×32 viewBox so they scale cleanly
// from the 16×16 tab favicon up to 512×512 app icon. All use brand primary
// as the dominant fill and white glyph for max contrast.
// -----------------------------------------------------------------------------

function svgClassic({ primary, accent, glyph }) {
  // Rounded square + serif-flavoured letterform. Trustworthy, family-run.
  const dark = darken(primary, 0.18)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="${escapeAttr(glyph)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="7" fill="url(#g)"/>
  <text x="16" y="22.5" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-weight="700" font-size="18" fill="#ffffff" letter-spacing="-0.5">${escapeXml(glyph)}</text>
</svg>
`
}

function svgModern({ primary, accent, glyph }) {
  // Sharp square + geometric sans + thin accent underline. Tech-forward.
  // The accent stripe needs to be VISIBLE on the primary background — always
  // derive it from a lightened primary unless an explicit --accent override
  // was passed. (DNA `accent` is the design-policy interaction color, often
  // dark/muted and wrong for this surface.)
  const dark = darken(primary, 0.25)
  const accentColor = lighten(primary, 0.55)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="${escapeAttr(glyph)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="3" fill="url(#g)"/>
  <text x="16" y="21" text-anchor="middle"
        font-family="'Helvetica Neue', Arial, sans-serif"
        font-weight="800" font-size="18" fill="#ffffff" letter-spacing="-0.5">${escapeXml(glyph)}</text>
  <rect x="9" y="24.5" width="14" height="1.6" rx="0.8" fill="${accentColor}" opacity="0.9"/>
</svg>
`
}

function svgRugged({ primary, accent, glyph }) {
  // Asymmetric cornered shape + heavy condensed glyph + diagonal speed-lines.
  // Inspired by dealer-signage / fleet-vehicle wordmarks.
  const dark = darken(primary, 0.28)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="${escapeAttr(glyph)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}"/>
      <stop offset="100%" stop-color="${dark}"/>
    </linearGradient>
  </defs>
  <path d="M 2 5 L 28 3 L 30 27 L 4 29 Z" fill="url(#g)"/>
  <text x="17" y="22.5" text-anchor="middle"
        font-family="'Oswald', 'Arial Narrow', sans-serif"
        font-weight="900" font-size="20" fill="#ffffff" letter-spacing="-0.5"
        transform="skewX(-6)">${escapeXml(glyph)}</text>
  <line x1="4" y1="7" x2="10" y2="6.5" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/>
  <line x1="4" y1="10" x2="8" y2="9.7" stroke="#ffffff" stroke-width="1" stroke-linecap="round" opacity="0.55"/>
</svg>
`
}

function svgLuxury({ primary, accent, glyph }) {
  // Deep charcoal disk + thin metallic border + elegant italic serif.
  // Magazine-editorial / prestige feel.
  const ring = primary
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="${escapeAttr(glyph)}">
  <circle cx="16" cy="16" r="15" fill="#0f1115"/>
  <circle cx="16" cy="16" r="14" fill="none" stroke="${ring}" stroke-width="1.2"/>
  <circle cx="16" cy="16" r="11.5" fill="none" stroke="${ring}" stroke-width="0.5" opacity="0.45"/>
  <text x="16" y="21" text-anchor="middle"
        font-family="'Playfair Display', 'Didot', Georgia, serif"
        font-style="italic" font-weight="600" font-size="17" fill="${ring}">${escapeXml(glyph)}</text>
</svg>
`
}

function svgPrestige({ primary, accent, glyph }) {
  // Hexagon + mixed-script glyph + thin top rule. Supercar-magazine feel.
  // Glyph + rule render in a metallic-feel lightened primary, never the DNA
  // accent (which is design-policy darker and would disappear on the dark hex).
  const dark = darken(primary, 0.35)
  const metallic = lighten(primary, 0.35)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="${escapeAttr(glyph)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${dark}"/>
      <stop offset="100%" stop-color="#0a0c10"/>
    </linearGradient>
  </defs>
  <polygon points="16,2 28,8 28,24 16,30 4,24 4,8" fill="url(#g)" stroke="${primary}" stroke-width="0.8"/>
  <line x1="10" y1="9" x2="22" y2="9" stroke="${metallic}" stroke-width="0.6" opacity="0.8"/>
  <text x="16" y="22" text-anchor="middle"
        font-family="'Playfair Display', Georgia, serif"
        font-weight="700" font-size="15" fill="${metallic}">${escapeXml(glyph)}</text>
</svg>
`
}

const ARCHETYPE_RENDERERS = {
  classic: svgClassic,
  modern: svgModern,
  rugged: svgRugged,
  luxury: svgLuxury,
  prestige: svgPrestige,
}

function escapeXml(value) {
  return String(value || '').replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  }[c]))
}

function escapeAttr(value) {
  return escapeXml(value)
}

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true })
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const themeId = args['theme-id']

  if (!themeId || typeof themeId !== 'string') {
    console.error('Missing required --theme-id <id>')
    console.error('Usage: node tools/generate-theme-favicon.mjs --theme-id <id> [--primary #hex] [--accent #hex] [--archetype <id>] [--glyph X] [--dna <path>]')
    process.exit(1)
  }

  const themeDir = path.join(PROJECT_ROOT, 'app', 'themes', themeId)
  if (!existsSync(themeDir)) {
    console.error(`Theme folder not found: ${themeDir}`)
    process.exit(1)
  }

  const themeMeta = await readJsonSafe(path.join(themeDir, 'theme.json')) || {}
  const dnaPath = await discoverDnaPath(themeId, args.dna && typeof args.dna === 'string' ? args.dna : null)
  const dna = dnaPath ? await readJsonSafe(dnaPath) : null

  // Resolve primary color
  let primary = normalizeHex(args.primary)
  if (!primary && dna?.colors?.primary) primary = normalizeHex(dna.colors.primary)
  if (!primary) {
    console.error('Could not resolve primary color. Pass --primary #hex or place a DNA JSON at tools/.theme-dna/.')
    process.exit(1)
  }

  // Resolve accent
  let accent = normalizeHex(args.accent) || (dna?.colors?.accent ? normalizeHex(dna.colors.accent) : null)

  // Resolve archetype
  let archetype = typeof args.archetype === 'string' ? args.archetype.toLowerCase() : null
  if (!archetype && dna?.notes?.archetype) archetype = String(dna.notes.archetype).toLowerCase()
  if (!archetype || !ARCHETYPES.has(archetype)) archetype = 'classic'

  // Resolve glyph
  let glyph = typeof args.glyph === 'string' && args.glyph ? args.glyph[0].toUpperCase() : null
  if (!glyph) glyph = pickGlyph(themeMeta.name, themeId)

  // Render
  const renderer = ARCHETYPE_RENDERERS[archetype] || svgClassic
  const svg = renderer({ primary, accent, glyph })

  // Write
  const outDir = path.join(PROJECT_ROOT, 'public', 'themes', themeId)
  await ensureDir(outDir)
  const outPath = path.join(outDir, 'favicon.svg')
  await fs.writeFile(outPath, svg, 'utf8')

  console.log(`Favicon generated: ${path.relative(PROJECT_ROOT, outPath)}`)
  console.log(`  theme-id:  ${themeId}`)
  console.log(`  archetype: ${archetype}`)
  console.log(`  primary:   ${primary}`)
  console.log(`  accent:    ${accent || '(none)'}`)
  console.log(`  glyph:     ${glyph}`)
  if (dnaPath) console.log(`  dna:       ${path.relative(PROJECT_ROOT, dnaPath)}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
