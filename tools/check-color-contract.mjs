#!/usr/bin/env node
/**
 * check-color-contract.mjs
 *
 * Enforces the 8-token color contract across theme styles: every color painted
 * between header and footer must come from the dashboard tokens
 * (var(--color-*)) or be derived from them (color-mix over vars, --t-* /
 * theme-namespace aliases defined in BrandStyles/color-policy).
 *
 * BLOCKER findings — raw color literals in theme CSS/TSX:
 *   - hex literals (#fff, #0a0e14, ...)
 *   - rgb()/rgba()/hsl()/hsla() literals
 *
 * ALLOWED (skipped):
 *   - context/BrandStyles.tsx and lib/tokens.ts (they DEFINE the token
 *     fallbacks) and recipes/, seed data, *.json
 *   - box-shadow / text-shadow / drop-shadow values (shadows are effects, not
 *     surfaces; rgba blacks there don't fight the palette)
 *   - declarations on a line annotated `/* photo-scrim-ok *​/` — reserved for
 *     overlays/scrims painted over imagery (SKILL.md allowed exception).
 *     The annotation must sit on the same line or the line above.
 *   - status literals on --t-success / --t-error definitions
 *   - `transparent`, `currentColor`, `inherit`, `none`
 *
 * Usage:
 *   node tools/check-color-contract.mjs                  # all themes, summary
 *   node tools/check-color-contract.mjs --id fbm-motors  # one theme, detail
 *   node tools/check-color-contract.mjs --list           # print every finding
 *
 * Exit codes: 0 clean, 1 findings present, 2 bad input.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const THEMES_DIR = path.join(ROOT, 'app', 'themes')

const SKIP_FILE = [
  /context[\\/]BrandStyles\.tsx$/,
  /lib[\\/]tokens\.ts$/,
  /app[\\/]themes[\\/]lib[\\/]theme-tokens\.ts$/,
  /\.json$/,
  /recipes[\\/]/,
  /\.md$/,
]

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g
const SCRIM_OK = /photo-scrim-ok/
const SHADOW_PROP = /(?:box-shadow|text-shadow|filter|drop-shadow|-webkit-box-shadow)\s*:/
const STATUS_PROP = /--t-(?:success|error|warning|info)\s*:/

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) out[key] = true
    else { out[key] = next; i++ }
  }
  return out
}

async function walk(dir) {
  const out = []
  let entries
  try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...await walk(p))
    else if (/\.(css|tsx|ts)$/.test(e.name)) out.push(p)
  }
  return out
}

function scanContent(file, content) {
  const findings = []
  const lines = content.split('\n')
  const isCss = file.endsWith('.css')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const prev = i > 0 ? lines[i - 1] : ''
    if (SCRIM_OK.test(line) || SCRIM_OK.test(prev)) continue
    if (SHADOW_PROP.test(line)) continue
    if (STATUS_PROP.test(line)) continue
    // In TS/TSX only scan lines that look like style values, not arbitrary
    // strings (ids, hashes, urls).
    if (!isCss && !/(?:color|background|border|fill|stroke|shadow|gradient|style)/i.test(line)) continue
    const matches = line.match(COLOR_LITERAL)
    if (!matches) continue
    for (const m of matches) {
      // ignore var() fallback-free non-colors that slip the regex
      if (/^rgba?\(\s*var\(/.test(m) || /^hsla?\(\s*var\(/.test(m)) continue
      findings.push({ file, line: i + 1, match: m, text: line.trim().slice(0, 160) })
    }
  }
  return findings
}

async function scanTheme(themeId) {
  const dir = path.join(THEMES_DIR, themeId)
  const files = await walk(dir)
  const findings = []
  for (const file of files) {
    const rel = path.relative(ROOT, file)
    if (SKIP_FILE.some((re) => re.test(rel))) continue
    const content = await fs.readFile(file, 'utf8')
    findings.push(...scanContent(rel, content))
  }
  return findings
}

const args = parseArgs(process.argv.slice(2))
const themeIds = args.id
  ? [args.id]
  : (await fs.readdir(THEMES_DIR, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)

let total = 0
for (const id of themeIds) {
  const findings = await scanTheme(id)
  total += findings.length
  const byFile = {}
  for (const f of findings) byFile[f.file] = (byFile[f.file] || 0) + 1
  console.log(`${id}: ${findings.length} literal(s) in ${Object.keys(byFile).length} file(s)`)
  if (args.id || args.list) {
    for (const f of findings) console.log(`  ${f.file}:${f.line}  ${f.match}  | ${f.text}`)
  } else {
    const top = Object.entries(byFile).sort((a, b) => b[1] - a[1]).slice(0, 5)
    for (const [file, n] of top) console.log(`    ${n}\t${file}`)
  }
}
console.log(`\nTOTAL: ${total}`)
process.exit(total > 0 ? 1 : 0)
