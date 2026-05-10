#!/usr/bin/env node
/**
 * check-theme-contrast.mjs
 *
 * WCAG AA contrast validator for a theme's color combinations. Reads a
 * DNA JSON (the same shape consumed by scaffold-theme.mjs) and checks the
 * combinations that actually render in the dealer preview:
 *
 *   - text-on-bg              (body copy)
 *   - text-on-surface         (body copy on cards)
 *   - white-on-primary        (primary button label)
 *   - primary-on-bg           (link / outline button)
 *   - accent-on-bg            (hover / decorative)
 *   - white-on-accent         (accent button label)
 *   - muted-on-bg             (caption / helper text)
 *
 * For each combination, reports the contrast ratio and a pass/fail against:
 *   - AA normal text (4.5:1)
 *   - AA large text  (3.0:1)
 *
 * Exit codes:
 *   0  all critical combos pass AA normal
 *   1  one or more critical combos fail
 *   2  invalid input / file errors
 *
 * For combos that fail, the tool suggests a darkened/lightened variant
 * that would pass.
 *
 * Usage:
 *   node tools/check-theme-contrast.mjs --dna <path-to-dna.json>
 *   node tools/check-theme-contrast.mjs --primary "#004080" --bg "#ffffff" --text "#0f1623"
 *   node tools/check-theme-contrast.mjs --dna <dna> --json   # machine-readable output
 *   node tools/check-theme-contrast.mjs --dna <dna> --strict # exit 1 on any AA-large fail too
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'

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

// --- color math --------------------------------------------------------------

function hexToRgb(hex) {
  const v = String(hex || '').replace('#', '').trim()
  if (v.length === 3) {
    return [parseInt(v[0] + v[0], 16), parseInt(v[1] + v[1], 16), parseInt(v[2] + v[2], 16)]
  }
  if (v.length === 6) {
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
  }
  if (v.length === 8) {
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
  }
  throw new Error(`Invalid hex color: ${hex}`)
}

function rgbToHex([r, g, b]) {
  const h = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

// sRGB → relative luminance per WCAG 2.1
function relativeLuminance([r, g, b]) {
  const ch = (c) => {
    const cs = c / 255
    return cs <= 0.03928 ? cs / 12.92 : Math.pow((cs + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

function contrastRatio(rgb1, rgb2) {
  const L1 = relativeLuminance(rgb1)
  const L2 = relativeLuminance(rgb2)
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  return (lighter + 0.05) / (darker + 0.05)
}

function darken(rgb, factor) {
  return [rgb[0] * (1 - factor), rgb[1] * (1 - factor), rgb[2] * (1 - factor)]
}

function lighten(rgb, factor) {
  return [
    rgb[0] + (255 - rgb[0]) * factor,
    rgb[1] + (255 - rgb[1]) * factor,
    rgb[2] + (255 - rgb[2]) * factor,
  ]
}

// Find the smallest darken/lighten amount that pushes contrast above target.
// Direction: "darken" if rgb is lighter than other; "lighten" otherwise.
function suggestAdjustment(rgb, against, targetRatio) {
  const lumOriginal = relativeLuminance(rgb)
  const lumOther = relativeLuminance(against)
  const direction = lumOriginal > lumOther ? 'darken' : 'lighten'
  const transform = direction === 'darken' ? darken : lighten

  for (let pct = 5; pct <= 95; pct += 5) {
    const adjusted = transform(rgb, pct / 100)
    if (contrastRatio(adjusted, against) >= targetRatio) {
      return {
        direction,
        amountPct: pct,
        suggestedHex: rgbToHex(adjusted),
        ratio: contrastRatio(adjusted, against).toFixed(2),
      }
    }
  }
  return null
}

// --- pairs to check ----------------------------------------------------------

function buildPairs(dna) {
  const c = dna.colors || {}
  const primary = c.primary
  const accent = c.accent || c.primary
  const bg = c.bg || '#ffffff'
  const surface = c.surface || bg
  const text = c.text || '#0f1623'
  const muted = c.muted || '#6b7280'

  // Each pair: { name, fg, bg, target, severity }
  // severity: 'critical' (button labels, body copy) or 'advisory' (decorative)
  return [
    { name: 'body text on page bg', fg: text, bg, target: 4.5, severity: 'critical' },
    { name: 'body text on card surface', fg: text, bg: surface, target: 4.5, severity: 'critical' },
    { name: 'white on primary (button)', fg: '#ffffff', bg: primary, target: 4.5, severity: 'critical' },
    { name: 'primary on bg (link/outline)', fg: primary, bg, target: 4.5, severity: 'critical' },
    { name: 'muted text on bg', fg: muted, bg, target: 4.5, severity: 'advisory' },
    { name: 'accent on bg', fg: accent, bg, target: 3.0, severity: 'advisory' },
    { name: 'white on accent', fg: '#ffffff', bg: accent, target: 4.5, severity: 'advisory' },
  ]
}

function checkPair(pair) {
  let fgRgb, bgRgb
  try {
    fgRgb = hexToRgb(pair.fg)
    bgRgb = hexToRgb(pair.bg)
  } catch (err) {
    return { ...pair, ratio: null, status: 'invalid', error: err.message }
  }

  const ratio = contrastRatio(fgRgb, bgRgb)
  const passesAA = ratio >= pair.target
  const passesAALarge = ratio >= 3.0
  const passesAAA = ratio >= 7.0

  let status = 'fail'
  if (passesAAA) status = 'AAA'
  else if (passesAA) status = 'AA'
  else if (passesAALarge) status = 'AA-large-only'

  let suggestion = null
  if (!passesAA) {
    suggestion = suggestAdjustment(fgRgb, bgRgb, pair.target)
  }

  return {
    name: pair.name,
    fg: pair.fg,
    bg: pair.bg,
    target: pair.target,
    severity: pair.severity,
    ratio: Number(ratio.toFixed(2)),
    status,
    passesAA,
    suggestion,
  }
}

// --- main --------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2))
  let dna

  if (args.dna && typeof args.dna === 'string') {
    const raw = await fs.readFile(path.resolve(args.dna), 'utf8')
    dna = JSON.parse(raw)
  } else if (args.primary && args.bg && args.text) {
    dna = {
      colors: {
        primary: args.primary,
        accent: args.accent || args.primary,
        bg: args.bg,
        surface: args.surface || args.bg,
        text: args.text,
        muted: args.muted || '#6b7280',
      },
    }
  } else {
    console.error('Need either --dna <path> or --primary/--bg/--text inline')
    process.exit(2)
  }

  const pairs = buildPairs(dna)
  const results = pairs.map(checkPair)

  if (args.json) {
    process.stdout.write(JSON.stringify(results, null, 2) + '\n')
  } else {
    const reset = '\x1b[0m'
    const green = '\x1b[32m'
    const yellow = '\x1b[33m'
    const red = '\x1b[31m'

    console.log('WCAG contrast check:')
    for (const r of results) {
      const tag = r.passesAA
        ? `${green}${r.status.padEnd(13)}${reset}`
        : r.severity === 'critical'
          ? `${red}FAIL (crit)  ${reset}`
          : `${yellow}fail (advisory)${reset}`
      console.log(`  ${tag}  ${r.ratio.toFixed(2).padStart(5)}:1   ${r.name}`)
      console.log(`                  ${r.fg} on ${r.bg}  (target ${r.target}:1)`)
      if (r.suggestion) {
        console.log(`                  → try ${r.suggestion.suggestedHex} (${r.suggestion.direction} ${r.suggestion.amountPct}% → ${r.suggestion.ratio}:1)`)
      }
    }
    const failedCritical = results.filter((r) => !r.passesAA && r.severity === 'critical')
    const failedAdvisory = results.filter((r) => !r.passesAA && r.severity === 'advisory')
    console.log('')
    console.log(`  ${failedCritical.length === 0 ? green + 'OK' + reset : red + 'BLOCKED' + reset}: ${failedCritical.length} critical fails, ${failedAdvisory.length} advisory fails`)
  }

  const failedCritical = results.some((r) => !r.passesAA && r.severity === 'critical')
  const failedAny = results.some((r) => !r.passesAA)

  if (failedCritical) process.exit(1)
  if (args.strict && failedAny) process.exit(1)
  process.exit(0)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(2)
})
