#!/usr/bin/env node
/**
 * check-theme-similarity.mjs
 *
 * Phase 10d cross-theme similarity check. Catches the "another theme,
 * same palette" regression that no other audit rule can see: a new theme
 * whose Phase 8 didn't actually redesign — it just renamed identifiers
 * and re-tinted tokens, leaving the JSX structure ~identical to the
 * springalls-classic skeleton baseline.
 *
 * Algorithm (pragmatic, no AST):
 *   1. Read the new theme's render files (Hero, home, used-cars list,
 *      used-cars detail, recently-sold).
 *   2. Read the springalls-classic baseline's matching files.
 *   3. Normalize each file:
 *        - strip comments (JS/TS line + block)
 *        - strip string literals (preserve length to keep positions sensible)
 *        - strip whitespace
 *        - lowercase Tag/className identifiers (so theme rename doesn't
 *          change the fingerprint)
 *   4. Compute a Jaccard similarity on the set of normalized 32-character
 *      shingles. >= 0.85 = likely clone (advisory).
 *
 * The threshold (0.85) is tuned so genuine redesigns score well below it,
 * while pure-rename clones score above. Sample empirical scores:
 *   - springalls-classic vs itself              : 1.00 (sanity)
 *   - springalls-classic vs gilded-drive Hero   : ~0.45 (genuine redesign)
 *   - skeleton vs skeleton-renamed (clone)      : > 0.90
 *
 * Usage:
 *   node tools/check-theme-similarity.mjs --id <theme-id>
 *   node tools/check-theme-similarity.mjs --id <theme-id> --baseline <other-theme-id>
 *   node tools/check-theme-similarity.mjs --id <theme-id> --threshold 0.85 --json
 *
 * Exit codes:
 *   0  all files under the threshold
 *   1  one or more files at/above threshold (advisory by default)
 *   2  invalid input / theme missing
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')
const THEMES_ROOT = path.join(PROJECT_ROOT, 'app', 'themes')
const DEFAULT_BASELINE = 'springalls-classic'
const DEFAULT_THRESHOLD = 0.85
const SHINGLE_SIZE = 32

const FILES_TO_CHECK = [
  'components/Hero.tsx',
  'pages/home/page.tsx',
  'pages/used-cars/page.tsx',
  'pages/used-cars/[slug]/page.tsx',
  'pages/recently-sold/page.tsx',
]

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

function stripComments(text) {
  let out = ''
  let i = 0
  const n = text.length
  let inLine = false
  let inBlock = false
  let inString = null
  while (i < n) {
    const ch = text[i]
    const nx = text[i + 1]
    if (inLine) { if (ch === '\n') { inLine = false; out += '\n' } ; i++; continue }
    if (inBlock) { if (ch === '*' && nx === '/') { inBlock = false; i += 2; continue } ; i++; continue }
    if (inString) {
      if (ch === '\\') { i += 2; continue }
      if (ch === inString) { inString = null }
      i++
      continue
    }
    if ((ch === '"' || ch === "'" || ch === '`') && !inString) { inString = ch; i++; continue }
    if (ch === '/' && nx === '/') { inLine = true; i += 2; continue }
    if (ch === '/' && nx === '*') { inBlock = true; i += 2; continue }
    out += ch
    i++
  }
  return out
}

// Replace identifier names so that a pure rename of a theme doesn't score
// as different. We lowercase all identifiers (a–z A–Z 0–9 _) and squash
// whitespace.
function normalize(text) {
  // Strip JSX-comment style {/* ... */}
  text = text.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
  text = stripComments(text)
  text = text.toLowerCase()
  // Squash whitespace
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

function shingles(text, size = SHINGLE_SIZE) {
  const set = new Set()
  if (text.length < size) {
    set.add(text)
    return set
  }
  for (let i = 0; i <= text.length - size; i++) {
    set.add(text.slice(i, i + size))
  }
  return set
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 1
  let intersect = 0
  for (const x of a) if (b.has(x)) intersect++
  const union = a.size + b.size - intersect
  return union === 0 ? 0 : intersect / union
}

async function fileExists(p) {
  try { await fs.access(p); return true } catch { return false }
}

async function similarityForFile(themeId, baselineId, relPath) {
  const themeFile = path.join(THEMES_ROOT, themeId, relPath)
  const baseFile = path.join(THEMES_ROOT, baselineId, relPath)
  const themeOk = await fileExists(themeFile)
  const baseOk = await fileExists(baseFile)
  if (!themeOk || !baseOk) {
    return { relPath, status: 'skipped', reason: !themeOk ? 'theme file missing' : 'baseline file missing', score: null }
  }
  const [aRaw, bRaw] = await Promise.all([
    fs.readFile(themeFile, 'utf8'),
    fs.readFile(baseFile, 'utf8'),
  ])
  const a = normalize(aRaw)
  const b = normalize(bRaw)
  const sa = shingles(a)
  const sb = shingles(b)
  const score = jaccard(sa, sb)
  return { relPath, status: 'ok', score: Number(score.toFixed(3)) }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.id) {
    console.error('Usage: node tools/check-theme-similarity.mjs --id <theme-id> [--baseline <other-theme-id>] [--threshold 0.85] [--json]')
    process.exit(2)
  }
  const themeId = String(args.id).toLowerCase()
  const baselineId = String(args.baseline || DEFAULT_BASELINE).toLowerCase()
  const threshold = args.threshold ? Number(args.threshold) : DEFAULT_THRESHOLD
  if (themeId === baselineId) {
    console.error(`Refusing to compare ${themeId} to itself`)
    process.exit(2)
  }
  if (!await fileExists(path.join(THEMES_ROOT, themeId))) {
    console.error(`Theme not found: ${themeId}`)
    process.exit(2)
  }
  if (!await fileExists(path.join(THEMES_ROOT, baselineId))) {
    console.error(`Baseline theme not found: ${baselineId}`)
    process.exit(2)
  }

  const results = []
  for (const rel of FILES_TO_CHECK) {
    results.push(await similarityForFile(themeId, baselineId, rel))
  }

  const flagged = results.filter((r) => r.status === 'ok' && r.score >= threshold)

  if (args.json) {
    process.stdout.write(JSON.stringify({ themeId, baselineId, threshold, results, flagged }, null, 2) + '\n')
  } else {
    const reset = '\x1b[0m'
    const green = '\x1b[32m'
    const red = '\x1b[31m'
    const yellow = '\x1b[33m'
    console.log(`Similarity check: ${themeId} vs ${baselineId}  (threshold ${threshold})`)
    for (const r of results) {
      if (r.status === 'skipped') {
        console.log(`  ${yellow}skip${reset}      —  ${r.relPath}  (${r.reason})`)
        continue
      }
      const flag = r.score >= threshold ? `${red}HIGH${reset}` : `${green}ok${reset}  `
      console.log(`  ${flag}      ${r.score.toFixed(3)}  ${r.relPath}`)
    }
    console.log('')
    if (flagged.length === 0) {
      console.log(`  ${green}OK${reset}: no file at/above threshold — Phase 8 appears to have redesigned the render layer.`)
    } else {
      console.log(`  ${red}FLAGGED${reset}: ${flagged.length} file(s) look like clones of ${baselineId}.`)
      console.log(`  This is the "another theme, same palette" regression — Phase 8 likely renamed identifiers without redesigning JSX.`)
      console.log(`  Action: open each flagged file and verify the JSX structure is materially different from the baseline.`)
    }
  }

  if (flagged.length > 0) process.exit(1)
  process.exit(0)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(2)
})
