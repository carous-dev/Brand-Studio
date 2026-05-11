#!/usr/bin/env node
/**
 * extract-logo-colors.mjs
 *
 * Deterministic dominant-color extractor for dealer logos. Uses `sharp`
 * (already in brandstudio's deps) — no new dependency required.
 *
 * Approach:
 *   1. Read the logo, resize to 128x128 for speed.
 *   2. Convert to raw RGBA pixels.
 *   3. Reject pixels that are transparent, near-white (>240 on all channels),
 *      or near-black (<24 on all channels) — these are typically logo
 *      ground / outline artifacts, not brand colors.
 *   4. Quantize remaining pixels into a coarse 4-bit-per-channel histogram
 *      (4096 buckets) and rank buckets by count.
 *   5. Take the top N buckets, compute centroid color per bucket, and
 *      report them.
 *
 * Outputs JSON to stdout (or --out file) of shape:
 *   {
 *     logoPath: "<input>",
 *     totalPixels: <int>,
 *     usablePixels: <int>,           // post-filter
 *     dominant: [
 *       { hex: "#004080", rgb: [0,64,128], share: 0.42, sample: 5400 },
 *       { hex: "#3d63e8", rgb: [61,99,232], share: 0.18, sample: 2300 },
 *       ...
 *     ],
 *     suggested: {
 *       primary: "#004080",
 *       primaryDark: "#00305f",      // primary darkened ~25%
 *       accent: "#3d63e8",           // 2nd dominant if distinct enough
 *       text: "#0f1623",             // primary darkened ~85% (or default)
 *     },
 *     logoCharacter: "<vision-derived character>",   // optional, set via --character
 *     warnings: [...]
 *   }
 *
 * Usage:
 *   node tools/extract-logo-colors.mjs --logo <path-or-url> [--top 5] [--out <json>]
 *     [--character <free-form character string from Phase A2b vision pass>]
 *
 * `--character` lets Phase A2 persist the vision-derived typography/shape
 * description (e.g. "condensed-bold", "luxury-serif", "geometric-sans") into
 * the artifact so downstream phases don't have to remember it across calls.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

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

async function loadLogoBuffer(input) {
  if (/^https?:\/\//i.test(input)) {
    const res = await fetch(input)
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${input}`)
    return Buffer.from(await res.arrayBuffer())
  }
  return fs.readFile(path.resolve(input))
}

function rgbToHex([r, g, b]) {
  const h = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

function darken([r, g, b], factor) {
  // factor 0..1; 0.25 = darken by 25% toward black
  return [
    Math.round(r * (1 - factor)),
    Math.round(g * (1 - factor)),
    Math.round(b * (1 - factor)),
  ]
}

// Distance in RGB cube — fine for "are these two colors distinct enough" heuristics.
function rgbDistance(a, b) {
  const dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2]
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

async function extractColors(logoPath, topN = 5) {
  const buf = await loadLogoBuffer(logoPath)
  const image = sharp(buf, { failOn: 'none' }).resize(128, 128, {
    fit: 'inside',
    withoutEnlargement: false,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const channels = info.channels // 4 (RGBA)
  const totalPixels = info.width * info.height

  const buckets = new Map() // key = quantized 4-bit RGB index, value = { count, rSum, gSum, bSum }

  let usablePixels = 0

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (a < 200) continue // skip transparent
    // Skip pure white / pure black backgrounds
    if (r > 250 && g > 250 && b > 250) continue
    if (r < 12 && g < 12 && b < 12) continue
    // Skip low-saturation greys (max-min < 18). Brand colors generally have
    // chroma; logo grounds, off-whites, drop shadows do not. Without this,
    // tinted off-whites (#e9e9e9, #fafce9) drown out the actual brand hue.
    const maxC = Math.max(r, g, b)
    const minC = Math.min(r, g, b)
    if (maxC - minC < 18) continue

    usablePixels++

    // Quantize each channel to 4 bits (16 levels)
    const qr = r >> 4
    const qg = g >> 4
    const qb = b >> 4
    const key = (qr << 8) | (qg << 4) | qb

    let bucket = buckets.get(key)
    if (!bucket) {
      bucket = { count: 0, rSum: 0, gSum: 0, bSum: 0 }
      buckets.set(key, bucket)
    }
    bucket.count++
    bucket.rSum += r
    bucket.gSum += g
    bucket.bSum += b
  }

  if (usablePixels === 0) {
    return {
      logoPath,
      totalPixels,
      usablePixels: 0,
      dominant: [],
      suggested: null,
      warnings: ['no usable pixels — logo is fully transparent, all white, or all black'],
    }
  }

  const ranked = Array.from(buckets.values())
    .map((bucket) => {
      const rgb = [
        Math.round(bucket.rSum / bucket.count),
        Math.round(bucket.gSum / bucket.count),
        Math.round(bucket.bSum / bucket.count),
      ]
      return {
        hex: rgbToHex(rgb),
        rgb,
        share: bucket.count / usablePixels,
        sample: bucket.count,
      }
    })
    .sort((a, b) => b.sample - a.sample)

  // Merge near-duplicate buckets (within 30 RGB units of an already-kept color)
  const distinct = []
  for (const c of ranked) {
    const tooClose = distinct.find((kept) => rgbDistance(kept.rgb, c.rgb) < 30)
    if (!tooClose) distinct.push(c)
    if (distinct.length >= topN) break
  }

  const primary = distinct[0]
  const accent = distinct[1] && rgbDistance(distinct[1].rgb, primary.rgb) > 80 ? distinct[1] : null

  const suggested = {
    primary: primary?.hex || '#0f172a',
    primaryDark: primary ? rgbToHex(darken(primary.rgb, 0.25)) : '#0a121a',
    accent: accent?.hex || null,
    text: '#0f1623',
  }

  const warnings = []
  if (distinct.length < 2) warnings.push('only one distinct dominant color found — accent will be null')
  if (primary.share < 0.10) warnings.push(`primary color is weak (only ${(primary.share * 100).toFixed(1)}% of usable pixels) — logo may not have a strong brand color`)

  return {
    logoPath,
    totalPixels,
    usablePixels,
    dominant: distinct,
    suggested,
    warnings,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.logo) {
    console.error('Missing --logo <path-or-url>')
    process.exit(1)
  }
  const topN = args.top ? Number(args.top) : 5

  const result = await extractColors(args.logo, topN)
  if (args.character && typeof args.character === 'string') {
    result.logoCharacter = args.character.trim()
  }
  const json = JSON.stringify(result, null, 2)

  if (args.out && typeof args.out === 'string') {
    await fs.mkdir(path.dirname(path.resolve(args.out)), { recursive: true })
    await fs.writeFile(path.resolve(args.out), json + '\n', 'utf8')
    console.log(`Colors extracted from ${args.logo}`)
    console.log(`  primary:    ${result.suggested?.primary || 'n/a'}`)
    console.log(`  primaryDark: ${result.suggested?.primaryDark || 'n/a'}`)
    console.log(`  accent:     ${result.suggested?.accent || '(none)'}`)
    console.log(`  usable px:  ${result.usablePixels}/${result.totalPixels}`)
    if (result.warnings.length) {
      console.log('  warnings:')
      for (const w of result.warnings) console.log(`    - ${w}`)
    }
  } else {
    process.stdout.write(json + '\n')
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(1)
})
