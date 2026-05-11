#!/usr/bin/env node
/**
 * check-palette-policy.mjs
 *
 * Color palette policy validator + token emitter for /new-theme.
 *
 * The policy (see SKILL §"Color palette policy — paired surface + foreground tokens"):
 *
 *   Two FIXED neutral tiers (theme-locked, NOT brand-overridable):
 *     Light tier:
 *       --surface-bg-light       #ffffff
 *       --surface-card-light     #f6f7fb
 *       --text-on-light-strong   #0f1623
 *       --text-on-light-muted    #5b6573
 *       --border-on-light        #e3e6ee
 *     Dark tier:
 *       --surface-bg-dark        #0a0e14
 *       --surface-card-dark      #14181f
 *       --text-on-dark-strong    #ffffff
 *       --text-on-dark-muted     rgba(255,255,255,0.78)
 *       --border-on-dark         rgba(255,255,255,0.12)
 *
 *   One brand triad (derived from user's --primary):
 *       --brand-primary          <input, post-AA-validation>
 *       --brand-primary-strong   darken(primary, ~12%) for hover/pressed
 *       --brand-on-primary       #ffffff if AA passes on primary, else #0a0e14
 *
 *   Rule: every CSS rule that paints `background:` from a surface token
 *   MUST set `color:` from the paired foreground token in the same rule
 *   or enclosing scope. Brand records can ONLY override the brand triad.
 *
 * This tool:
 *   1. Takes a user-supplied primary hex.
 *   2. Auto-darkens it until AA white-on-primary passes (or reports if
 *      darkening to AA would render the color near-black; in that case
 *      flips --brand-on-primary to dark instead).
 *   3. Walks the full surface×foreground contrast matrix.
 *   4. Errors (exit 1) if ANY paired combination fails AA.
 *   5. Writes the full token JSON to `--out` (default
 *      tools/.palette/<slug>.json).
 *
 * Usage:
 *   node tools/check-palette-policy.mjs --primary "#be0e11"
 *   node tools/check-palette-policy.mjs --primary "#be0e11" --slug auto-wow-uk
 *   node tools/check-palette-policy.mjs --primary "#fd1317" --json
 *   node tools/check-palette-policy.mjs --primary "#xx" --max-darken 60
 *
 * Exit codes:
 *   0  policy passes; token JSON written
 *   1  AA pair failure; partial diagnostic emitted
 *   2  invalid input
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')

const FIXED_NEUTRALS = {
  light: {
    surfaceBg: '#ffffff',
    surfaceCard: '#f6f7fb',
    textStrong: '#0f1623',
    textMuted: '#5b6573',
    border: '#e3e6ee',
  },
  dark: {
    surfaceBg: '#0a0e14',
    surfaceCard: '#14181f',
    textStrong: '#ffffff',
    textMuted: 'rgba(255,255,255,0.78)',
    border: 'rgba(255,255,255,0.12)',
  },
}

const AA_TARGET_BODY = 4.5
const AA_TARGET_LARGE = 3.0

// --------------- argv parsing ---------------

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      out[key] = true
    } else {
      out[key] = next
      i++
    }
  }
  return out
}

// --------------- color math ---------------

function normalizeHex(input) {
  const raw = String(input || '').trim().toLowerCase()
  if (!raw) return null
  const m = raw.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/)
  if (!m) return null
  let hex = m[1]
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  return `#${hex}`
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function rgbToHex({ r, g, b }) {
  const c = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

function srgbToLinear(c) {
  const x = c / 255
  return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex)
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [bright, dim] = la >= lb ? [la, lb] : [lb, la]
  return (bright + 0.05) / (dim + 0.05)
}

function darken(hex, amount) {
  // amount ∈ [0..1]; 0 = unchanged, 1 = black.
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex({ r: r * (1 - amount), g: g * (1 - amount), b: b * (1 - amount) })
}

// --------------- policy logic ---------------

function findAACompliantPrimary(input, maxDarken) {
  // Walk darken steps until white-on-primary passes AA body (4.5:1) OR
  // we've gone past `maxDarken`. If we never reach AA before maxDarken,
  // return the deepest variant and flag `onPrimaryDark` true so the
  // caller can flip --brand-on-primary to dark text.
  const step = 0.02
  const cap = maxDarken == null ? 0.6 : maxDarken
  for (let amount = 0; amount <= cap + 1e-9; amount += step) {
    const candidate = darken(input, amount)
    const ratio = contrastRatio('#ffffff', candidate)
    if (ratio >= AA_TARGET_BODY) {
      return { hex: candidate, darkenAmount: amount, ratio, onPrimary: '#ffffff' }
    }
  }
  // No AA-passing darken found within cap; check if dark text on the
  // ORIGINAL primary works (some warm yellows / lime greens pass with dark
  // text). If so, use input as-is and flip on-primary to dark.
  const darkText = '#0a0e14'
  const ratioDark = contrastRatio(darkText, input)
  if (ratioDark >= AA_TARGET_BODY) {
    return { hex: input, darkenAmount: 0, ratio: ratioDark, onPrimary: darkText }
  }
  // Last resort: darken to maxDarken regardless and use whichever foreground wins
  const deepest = darken(input, cap)
  const wOnDeep = contrastRatio('#ffffff', deepest)
  const dOnDeep = contrastRatio(darkText, deepest)
  if (wOnDeep >= dOnDeep) {
    return { hex: deepest, darkenAmount: cap, ratio: wOnDeep, onPrimary: '#ffffff', warning: 'capped' }
  }
  return { hex: deepest, darkenAmount: cap, ratio: dOnDeep, onPrimary: darkText, warning: 'capped' }
}

function checkPair(fgRgbaOrHex, bgHex, label, target) {
  // For rgba foregrounds (e.g. textMuted on dark), approximate by
  // compositing with the background to get an effective hex.
  let fgEffective = fgRgbaOrHex
  if (fgRgbaOrHex.startsWith('rgba')) {
    const m = fgRgbaOrHex.match(/rgba\(([^)]+)\)/i)
    if (!m) return { label, ratio: 0, target, pass: false, error: 'invalid rgba' }
    const parts = m[1].split(',').map((s) => s.trim())
    const [r, g, b, a] = [Number(parts[0]), Number(parts[1]), Number(parts[2]), Number(parts[3])]
    const bg = hexToRgb(bgHex)
    const composited = {
      r: r * a + bg.r * (1 - a),
      g: g * a + bg.g * (1 - a),
      b: b * a + bg.b * (1 - a),
    }
    fgEffective = rgbToHex(composited)
  }
  const ratio = contrastRatio(fgEffective, bgHex)
  return { label, fg: fgRgbaOrHex, bg: bgHex, ratio: Number(ratio.toFixed(2)), target, pass: ratio >= target }
}

function buildMatrix(brand) {
  const L = FIXED_NEUTRALS.light
  const D = FIXED_NEUTRALS.dark
  return [
    // Light tier — body & muted on both light surfaces
    checkPair(L.textStrong, L.surfaceBg, 'text-strong on surface-bg-light', AA_TARGET_BODY),
    checkPair(L.textStrong, L.surfaceCard, 'text-strong on surface-card-light', AA_TARGET_BODY),
    checkPair(L.textMuted, L.surfaceBg, 'text-muted on surface-bg-light', AA_TARGET_BODY),
    checkPair(L.textMuted, L.surfaceCard, 'text-muted on surface-card-light', AA_TARGET_BODY),
    // Dark tier — body & muted on both dark surfaces
    checkPair(D.textStrong, D.surfaceBg, 'text-strong on surface-bg-dark', AA_TARGET_BODY),
    checkPair(D.textStrong, D.surfaceCard, 'text-strong on surface-card-dark', AA_TARGET_BODY),
    checkPair(D.textMuted, D.surfaceBg, 'text-muted on surface-bg-dark', AA_TARGET_BODY),
    checkPair(D.textMuted, D.surfaceCard, 'text-muted on surface-card-dark', AA_TARGET_BODY),
    // Brand triad
    checkPair(brand.onPrimary, brand.primary, 'on-primary on brand-primary (button)', AA_TARGET_BODY),
    checkPair(brand.primary, L.surfaceBg, 'brand-primary on surface-bg-light (link)', AA_TARGET_BODY),
    checkPair(brand.onPrimary, brand.primaryStrong, 'on-primary on brand-primary-strong (hover)', AA_TARGET_BODY),
  ]
}

function emitTokens(brand, slug) {
  const L = FIXED_NEUTRALS.light
  const D = FIXED_NEUTRALS.dark
  return {
    slug: slug || null,
    generatedAt: new Date().toISOString(),
    brand: {
      primary: brand.primary,
      primaryStrong: brand.primaryStrong,
      onPrimary: brand.onPrimary,
      darkenAppliedToInput: Number(brand.darkenAmount.toFixed(3)),
      inputPrimary: brand.inputPrimary,
    },
    neutralsLight: {
      surfaceBg: L.surfaceBg,
      surfaceCard: L.surfaceCard,
      textStrong: L.textStrong,
      textMuted: L.textMuted,
      border: L.border,
    },
    neutralsDark: {
      surfaceBg: D.surfaceBg,
      surfaceCard: D.surfaceCard,
      textStrong: D.textStrong,
      textMuted: D.textMuted,
      border: D.border,
    },
    cssVariables: {
      '--surface-bg-light': L.surfaceBg,
      '--surface-card-light': L.surfaceCard,
      '--text-on-light-strong': L.textStrong,
      '--text-on-light-muted': L.textMuted,
      '--border-on-light': L.border,
      '--surface-bg-dark': D.surfaceBg,
      '--surface-card-dark': D.surfaceCard,
      '--text-on-dark-strong': D.textStrong,
      '--text-on-dark-muted': D.textMuted,
      '--border-on-dark': D.border,
      '--brand-primary': brand.primary,
      '--brand-primary-strong': brand.primaryStrong,
      '--brand-on-primary': brand.onPrimary,
    },
  }
}

// --------------- main ---------------

const COLOR_OK = '\x1b[32m'
const COLOR_FAIL = '\x1b[31m'
const COLOR_RESET = '\x1b[0m'

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.primary) {
    console.error('Usage: node tools/check-palette-policy.mjs --primary "#hex" [--slug <slug>] [--out <path>] [--json] [--max-darken 0.6]')
    process.exit(2)
  }
  const input = normalizeHex(args.primary)
  if (!input) {
    console.error(`Invalid --primary: ${args.primary}`)
    process.exit(2)
  }

  const maxDarken = args['max-darken'] ? Number(args['max-darken']) : 0.6
  const slug = args.slug || null

  const adjusted = findAACompliantPrimary(input, maxDarken)
  const brand = {
    inputPrimary: input,
    primary: adjusted.hex,
    primaryStrong: darken(adjusted.hex, 0.12),
    onPrimary: adjusted.onPrimary,
    darkenAmount: adjusted.darkenAmount,
  }

  const matrix = buildMatrix(brand)
  const failures = matrix.filter((r) => !r.pass)

  const tokens = emitTokens(brand, slug)

  if (args.json) {
    process.stdout.write(JSON.stringify({ tokens, matrix, failures }, null, 2) + '\n')
  } else {
    console.log(`Palette policy check: primary ${input}${adjusted.darkenAmount > 0 ? ` → darkened to ${adjusted.hex} (${(adjusted.darkenAmount * 100).toFixed(0)}% darker)` : ''}`)
    console.log('')
    for (const r of matrix) {
      const tag = r.pass ? `${COLOR_OK}PASS${COLOR_RESET}` : `${COLOR_FAIL}FAIL${COLOR_RESET}`
      console.log(`  ${tag}  ${String(r.ratio).padStart(5)}:1  (target ${r.target})  ${r.label}`)
    }
    console.log('')
    if (failures.length === 0) {
      console.log(`  ${COLOR_OK}OK${COLOR_RESET}: all ${matrix.length} surface/foreground pairs pass WCAG AA.`)
    } else {
      console.log(`  ${COLOR_FAIL}BLOCKED${COLOR_RESET}: ${failures.length} pair(s) failed AA.`)
      for (const f of failures) {
        console.log(`    - ${f.label}: ${f.ratio}:1 < ${f.target}:1`)
      }
    }
    if (adjusted.warning === 'capped') {
      console.log(`  WARN: darkening capped at ${(maxDarken * 100).toFixed(0)}% — primary may need manual review.`)
    }
  }

  if (args.out || slug) {
    const outPath = args.out
      ? path.resolve(process.cwd(), args.out)
      : path.join(PROJECT_ROOT, 'tools', '.palette', `${slug}.json`)
    await fs.mkdir(path.dirname(outPath), { recursive: true })
    await fs.writeFile(outPath, JSON.stringify(tokens, null, 2) + '\n', 'utf8')
    if (!args.json) {
      console.log(`  tokens written: ${path.relative(PROJECT_ROOT, outPath)}`)
    }
  }

  if (failures.length > 0) process.exit(1)
  process.exit(0)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(2)
})
