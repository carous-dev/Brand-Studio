#!/usr/bin/env node
/**
 * check-text-contract.mjs
 *
 * The copy analog of check-image-contract.mjs. Enforces that a theme's visible
 * component copy is DYNAMIC — routed through `resolveText(brand, key)` against
 * `recipes/text-recipe.json` — not baked into TSX. This is what makes "every
 * static string is editable / LLM-fillable" actually true.
 *
 * BLOCKER findings (only for themes that ship a recipes/text-recipe.json):
 *   - a multi-word JSX TEXT node   →  <h2>Why choose us</h2>
 *   - a multi-word copy ATTRIBUTE  →  placeholder="Search our stock" / aria-label / title / alt
 *   that is a literal string (not a {resolveText(...)} / {expression}).
 *   → move the string into text-recipe.json and render via resolveText.
 *
 * Conservative by design (multi-word literals only) to avoid flagging class
 * names, hrefs, data expressions, icons, punctuation, or single-token labels.
 *
 * EXEMPT (never flagged):
 *   - lib/, context/, styles/, tokens.ts, theme.json, recipes/, *.json, *.md
 *   - a line (or the line above) annotated `/* text-static-ok *​/`
 *   - text that is an expression `{…}`, a URL, an email, or symbols/entities only
 *
 * Themes WITHOUT a text-recipe.json are SKIPPED (advisory; adopt to opt in).
 *
 * Usage:
 *   node tools/check-text-contract.mjs                 # all themes with a recipe
 *   node tools/check-text-contract.mjs --id pmg-used-cars
 *   node tools/check-text-contract.mjs --id <id> --list
 *
 * Exit codes: 0 clean, 1 findings present, 2 bad input.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const THEMES_DIR = path.join(ROOT, 'app', 'themes')

const SKIP_FILE = [
  /[\\/]lib[\\/]/,
  /context[\\/]/,
  /styles[\\/]/,
  /tokens\.ts$/,
  /recipes[\\/]/,
  /\.json$/,
  /\.md$/,
]

const STATIC_OK = /text-static-ok/
// A JSX text node: >  Some visible copy  < with no tags/braces inside.
const JSX_TEXT = />([^<>{}]+)</g
// Copy-bearing string attributes with a literal value.
const COPY_ATTR = /\b(placeholder|aria-label|title|alt)\s*=\s*"([^"{}]+)"/g
// Something that looks like real prose: has whitespace (≥2 words) OR is long.
const LETTERS = /[A-Za-z]/
const NON_COPY = /[@]|:\/\/|=>|\.(tsx?|css|jpe?g|png|webp|svg|mp4|webm)\b/
// Text that's only symbols / entities / separators — never copy.
const SYMBOLIC_ONLY = /^(?:[\s·•|/\-–—→←%×#*.,:;!?()\[\]]|&[a-z]+;|&#\d+;)+$/i

function looksLikeCopy(raw) {
  const s = raw.replace(/\s+/g, ' ').trim()
  if (!s || SYMBOLIC_ONLY.test(s)) return false
  if (NON_COPY.test(s)) return false
  if (!LETTERS.test(s)) return false
  const words = s.split(' ').filter((w) => LETTERS.test(w))
  // ≥2 real words, or one long word (≥16 chars) — cuts single-token labels.
  return words.length >= 2 || s.length >= 16
}

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
    else if (/\.tsx$/.test(e.name)) out.push(p)
  }
  return out
}

async function hasTextRecipe(themeId) {
  try {
    await fs.access(path.join(THEMES_DIR, themeId, 'recipes', 'text-recipe.json'))
    return true
  } catch {
    return false
  }
}

function scanContent(file, content) {
  const findings = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const prev = i > 0 ? lines[i - 1] : ''
    if (STATIC_OK.test(line) || STATIC_OK.test(prev)) continue

    for (const m of line.matchAll(JSX_TEXT)) {
      const text = m[1]
      if (!looksLikeCopy(text)) continue
      findings.push({
        file, line: i + 1, match: text.trim().slice(0, 60),
        why: 'hardcoded JSX copy — move to text-recipe.json and render via resolveText(brand, key)',
        text: line.trim().slice(0, 160),
      })
    }
    for (const m of line.matchAll(COPY_ATTR)) {
      const text = m[2]
      if (!looksLikeCopy(text)) continue
      findings.push({
        file, line: i + 1, match: `${m[1]}="${text.trim().slice(0, 48)}"`,
        why: `hardcoded ${m[1]} copy — source from text-recipe.json via resolveText`,
        text: line.trim().slice(0, 160),
      })
    }
  }
  return findings
}

async function scanTheme(themeId) {
  if (!(await hasTextRecipe(themeId))) return { skipped: true, findings: [] }
  const files = await walk(path.join(THEMES_DIR, themeId))
  const findings = []
  for (const file of files) {
    const rel = path.relative(ROOT, file)
    if (SKIP_FILE.some((re) => re.test(rel))) continue
    const content = await fs.readFile(file, 'utf8')
    findings.push(...scanContent(rel, content))
  }
  return { skipped: false, findings }
}

const args = parseArgs(process.argv.slice(2))
const themeIds = args.id
  ? [args.id]
  : (await fs.readdir(THEMES_DIR, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name)

let total = 0
for (const id of themeIds) {
  const { skipped, findings } = await scanTheme(id)
  if (skipped) {
    if (args.id || args.list) console.log(`${id}: no text-recipe.json (advisory) — skipped`)
    continue
  }
  total += findings.length
  const byFile = {}
  for (const f of findings) byFile[f.file] = (byFile[f.file] || 0) + 1
  console.log(`${id}: ${findings.length} violation(s) in ${Object.keys(byFile).length} file(s)`)
  if (args.id || args.list) {
    for (const f of findings) console.log(`  ${f.file}:${f.line}  ${f.match}\n      ${f.why}\n      | ${f.text}`)
  }
}
console.log(`\nTOTAL: ${total}`)
process.exit(total > 0 ? 1 : 0)
