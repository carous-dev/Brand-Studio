#!/usr/bin/env node
/**
 * audit-theme.mjs
 *
 * Static-analysis quality gate for a brandstudio theme. Checks the rules
 * the team cares about for prospect-facing previews:
 *
 *   ACCESSIBILITY (blocker)
 *     a11y-img-no-alt          — <img>/<Image> without alt attribute
 *     a11y-h1-multiple         — more than one <h1> per page
 *     a11y-div-as-button       — <div onClick=> or <div role="button">
 *     a11y-form-field-faded-border — input/select border faded via
 *                                color-mix(... var(--*-border) <70%, transparent)
 *                                drops below visibility against card surfaces.
 *
 *   STANDARDS (blocker)
 *     std-anchor-empty         — <a> with no text content and no aria-label
 *     std-link-color-blanket   — :where(a)/:is(a) { color: ... } in base.css —
 *                                paints brand wordmarks wrapped in <Link> with
 *                                the wrong color.
 *
 *   DATA FETCHING (blocker)
 *     data-useeffect-fetch     — useEffect that calls fetch() for initial data
 *
 *   MOBILE-FIRST RESPONSIVE (advisory)
 *     mobile-max-width-query   — CSS file uses @media (max-width:...) — prefer min-width
 *
 *   PERFORMANCE (advisory)
 *     perf-raw-img             — raw <img> instead of next/image
 *     perf-img-no-dimensions   — <img>/<Image> without width AND height
 *
 *   BRAND TOKENS (advisory)
 *     brand-hardcoded-color    — hex color outside allowed files (tokens.ts,
 *                                BrandStyles.tsx, color-policy.css)
 *
 * Exit codes:
 *   0  no blockers
 *   1  one or more blocker findings
 *   2  invalid input / file errors
 *
 * Usage:
 *   node tools/audit-theme.mjs --id <theme-id>          # audit one theme
 *   node tools/audit-theme.mjs --id <theme-id> --json   # machine output
 *   node tools/audit-theme.mjs --id <theme-id> --strict # advisory => blocker
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')
const THEMES_ROOT = path.join(PROJECT_ROOT, 'app', 'themes')

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

async function walk(dir) {
  const out = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else if (entry.isFile()) out.push(full)
  }
  return out
}

// --- finding helpers --------------------------------------------------------

function lineColumnFromIndex(content, index) {
  let line = 1
  let col = 1
  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10) {
      line++
      col = 1
    } else {
      col++
    }
  }
  return { line, col }
}

function findAllMatches(content, regex) {
  const out = []
  let m
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g')
  while ((m = re.exec(content)) !== null) {
    out.push({ index: m.index, match: m[0], groups: m })
    if (m.index === re.lastIndex) re.lastIndex++ // safety on zero-width
  }
  return out
}

function newFinding(rule, severity, file, content, index, message) {
  const { line, col } = lineColumnFromIndex(content, index)
  return { rule, severity, file: path.relative(PROJECT_ROOT, file), line, col, message }
}

// --- individual check rules -------------------------------------------------

function checkA11yImgAlt(file, content) {
  const findings = []
  // Both raw <img> and Next <Image>. Component name detection by tag.
  const tagRegex = /<(img|Image)\b([^>]*?)\/?>/gi
  for (const { match, index, groups } of findAllMatches(content, tagRegex)) {
    const attrs = groups[2] || ''
    if (!/\balt\s*=/i.test(attrs)) {
      findings.push(newFinding(
        'a11y-img-no-alt',
        'blocker',
        file,
        content,
        index,
        `<${groups[1]}> tag without alt attribute (use alt="" for decorative images)`,
      ))
    }
  }
  return findings
}

function checkA11yH1Multiple(file, content) {
  // Only meaningful on .tsx page files
  if (!file.endsWith('.tsx')) return []
  // Heuristic: count <h1 occurrences (not perfect — components composing pages
  // could still produce multiple at runtime, but this catches the obvious
  // template-level mistakes).
  const matches = findAllMatches(content, /<h1\b/gi)
  if (matches.length <= 1) return []
  return matches.slice(1).map((m) => newFinding(
    'a11y-h1-multiple',
    'blocker',
    file,
    content,
    m.index,
    `multiple <h1> tags in one file (${matches.length} total) — pages should have a single primary heading`,
  ))
}

function checkA11yDivAsButton(file, content) {
  const findings = []
  const re = /<div\b[^>]*\b(onClick|role="button")\b[^>]*>/gi
  for (const { index, match, groups } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'a11y-div-as-button',
      'blocker',
      file,
      content,
      index,
      `<div> used as a button (${groups[1]}) — use <button type="button"> for keyboard + screen-reader support`,
    ))
  }
  return findings
}

function checkStdAnchorEmpty(file, content) {
  const findings = []
  // Match <a ...>...</a> spanning lines; flag when the inner contents are
  // pure whitespace AND the tag has no aria-label.
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  for (const { index, groups } of findAllMatches(content, re)) {
    const attrs = groups[1] || ''
    const inner = groups[2] || ''
    const innerStripped = inner.replace(/\{[^}]*\}/g, 'X').replace(/<[^>]+>/g, 'X').trim()
    const hasAriaLabel = /\baria-label\s*=/i.test(attrs)
    if (!innerStripped && !hasAriaLabel) {
      findings.push(newFinding(
        'std-anchor-empty',
        'blocker',
        file,
        content,
        index,
        '<a> with no text content and no aria-label — screen readers cannot describe it',
      ))
    }
  }
  return findings
}

function checkDataUseEffectFetch(file, content) {
  if (!/\.tsx?$/.test(file)) return []
  // Matches useEffect(() => { ...fetch(... } ...). Multiline-aware.
  const re = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]{0,400}?\bfetch\s*\(/gi
  const findings = []
  for (const { index } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'data-useeffect-fetch',
      'blocker',
      file,
      content,
      index,
      'useEffect calling fetch() for initial data — prefer a Server Component or Route Handler so data lands at request time',
    ))
  }
  return findings
}

function checkMobileMaxWidthQuery(file, content) {
  if (!/\.css$/.test(file) && !/\.module\.css$/.test(file)) return []
  const re = /@media\s*\([^)]*max-width\s*:\s*(\d+(?:\.\d+)?)(px|em|rem)\b/gi
  const findings = []
  for (const { index, groups } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'mobile-max-width-query',
      'advisory',
      file,
      content,
      index,
      `@media max-width: ${groups[1]}${groups[2]} — prefer mobile-first (min-width) media queries; design for narrow first then progressively enhance`,
    ))
  }
  return findings
}

function checkPerfRawImg(file, content) {
  if (!/\.tsx$/.test(file)) return []
  // Only flag in .tsx files where next/image is conventionally available.
  const re = /<img\b/gi
  const findings = []
  for (const { index } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'perf-raw-img',
      'advisory',
      file,
      content,
      index,
      'raw <img> tag — use next/image for automatic optimization (srcset, lazy loading, dimensions, format negotiation). Allow the remote host in next.config.js if needed.',
    ))
  }
  return findings
}

function checkPerfImgNoDimensions(file, content) {
  if (!/\.tsx$/.test(file)) return []
  // Both raw <img> and next/image.
  const re = /<(img|Image)\b([^>]*?)\/?>/gi
  const findings = []
  for (const { index, groups, match } of findAllMatches(content, re)) {
    const attrs = groups[2] || ''
    const hasFill = /\bfill\b/.test(attrs)
    if (hasFill) continue // next/image with fill skips width/height
    const hasWidth = /\bwidth\s*=/.test(attrs)
    const hasHeight = /\bheight\s*=/.test(attrs)
    if (!hasWidth || !hasHeight) {
      findings.push(newFinding(
        'perf-img-no-dimensions',
        'advisory',
        file,
        content,
        index,
        `<${groups[1]}> missing width and/or height — causes layout shift (CLS); set explicit dimensions or use the fill prop on next/image`,
      ))
    }
  }
  return findings
}

function checkStdLinkColorBlanket(file, content) {
  // Flag blanket :where(a) { color: ... } (or :is(a)) rules in base.css.
  // These paint every anchor descendant of the theme — including <Link>
  // wrappers around brand wordmarks — with one color regardless of context,
  // breaking header/footer designs that intend a contextual color (e.g.
  // white wordmark on a dark header). Style links per-component instead.
  if (!/\.css$/.test(file)) return []
  const findings = []
  const re = /:(?:where|is)\s*\(\s*a\s*\)\s*\{[^}]*\bcolor\s*:/gi
  for (const { index } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'std-link-color-blanket',
      'blocker',
      file,
      content,
      index,
      ':where(a) / :is(a) blanket color rule — paints every anchor descendant including header/footer brand <Link>s. Style links per-component instead.',
    ))
  }
  return findings
}

function checkA11yFormFieldFadedBorder(file, content) {
  // Form inputs/selects need a visible border for affordance. A
  // `border: 1px solid color-mix(... var(--t-border) <50%, transparent)`
  // pattern fades an already-soft token border below visibility against
  // var(--t-card) / var(--color-surface). Floor: solid `var(--*-border)`.
  if (!/\.css$/.test(file)) return []
  const findings = []
  // Match: border[-...]: <width> <style> color-mix(in srgb, var(--*-border|--*-border-*) <pct>%, transparent)
  // …where pct is 5–55 (low/mid). Solid usage like `color-mix(... border 90%, white)`
  // doesn't trigger because the second slot is a real color, not transparent.
  const re = /border(?:-[a-z]+)?\s*:\s*[^;]*color-mix\s*\(\s*in\s+srgb\s*,\s*var\(\s*(--[a-zA-Z0-9-]*border[a-zA-Z0-9-]*)\s*\)\s+(\d{1,2})%\s*,\s*transparent\s*\)/gi
  for (const { index, groups } of findAllMatches(content, re)) {
    const pct = parseInt(groups[2], 10)
    if (pct >= 70) continue // 70–99 stays visible enough for most surfaces
    findings.push(newFinding(
      'a11y-form-field-faded-border',
      'blocker',
      file,
      content,
      index,
      `border uses color-mix(${groups[1]} ${pct}%, transparent) — token borders are already low-opacity, fading below 70% drops them below visibility. Use 'border: 1px solid var(${groups[1]})' for form fields/cards.`,
    ))
  }
  return findings
}

function checkBrandHardcodedColor(file, content) {
  // Allow these files to contain hex (they're the defining color sources).
  const allowAllHex = /tokens\.ts$/.test(file)
                     || /BrandStyles\.tsx$/.test(file)
                     || /color-policy\.css$/.test(file)
                     || /brandProps\.ts$/.test(file)
  if (allowAllHex) return []
  // Don't audit non-style files for hex content (test data, profiles, etc).
  if (!/\.(tsx?|css)$/.test(file)) return []

  const findings = []
  // 6-digit hex codes (allow 3-digit). Skip strict-grey (#000, #fff, #111111
  // black/white near-extremes are conventionally safe even outside tokens).
  const re = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g
  for (const { index, match } of findAllMatches(content, re)) {
    const hex = match.replace('#', '').toLowerCase()
    // Skip safe greyscale (R==G==B): black, white, common neutrals.
    const r = hex.length === 3 ? hex[0]+hex[0] : hex.slice(0, 2)
    const g = hex.length === 3 ? hex[1]+hex[1] : hex.slice(2, 4)
    const b = hex.length === 3 ? hex[2]+hex[2] : hex.slice(4, 6)
    if (r === g && g === b) continue
    findings.push(newFinding(
      'brand-hardcoded-color',
      'advisory',
      file,
      content,
      index,
      `hardcoded color ${match} outside the brand-token system — use var(--color-...) so brands can override`,
    ))
  }
  return findings
}

const RULES = [
  checkA11yImgAlt,
  checkA11yH1Multiple,
  checkA11yDivAsButton,
  checkA11yFormFieldFadedBorder,
  checkStdAnchorEmpty,
  checkStdLinkColorBlanket,
  checkDataUseEffectFetch,
  checkMobileMaxWidthQuery,
  checkPerfRawImg,
  checkPerfImgNoDimensions,
  checkBrandHardcodedColor,
]

// --- ignore directives ------------------------------------------------------
// Inline:  // audit-ignore: rule1,rule2          (same line OR line above the finding)
// File:    // audit-ignore-file: rule1,rule2     (anywhere in the file; applies whole file)

// Replace JS/TS/JSX comments with spaces (keeping line breaks and string
// length intact) so subsequent regex-based rule matchers see the same
// line/column positions as the original content but without comment text
// triggering code-shape rules. Handles `// ...`, `/* ... */`, and JSX
// `{/* ... */}`.
function stripCommentsPreservingLines(content) {
  const len = content.length
  const out = new Array(len)
  let i = 0
  let inLine = false
  let inBlock = false
  let inString = null // string delimiter when inside a string literal
  while (i < len) {
    const ch = content[i]
    const next = content[i + 1]
    if (inLine) {
      if (ch === '\n') { inLine = false; out[i] = '\n' } else { out[i] = ' ' }
      i++; continue
    }
    if (inBlock) {
      if (ch === '*' && next === '/') {
        out[i] = ' '; out[i + 1] = ' '; i += 2; inBlock = false; continue
      }
      out[i] = ch === '\n' ? '\n' : ' '
      i++; continue
    }
    if (inString) {
      out[i] = ch
      if (ch === '\\' && next !== undefined) { out[i + 1] = next; i += 2; continue }
      if (ch === inString) inString = null
      i++; continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch; out[i] = ch; i++; continue
    }
    if (ch === '/' && next === '/') { inLine = true; out[i] = ' '; out[i + 1] = ' '; i += 2; continue }
    if (ch === '/' && next === '*') { inBlock = true; out[i] = ' '; out[i + 1] = ' '; i += 2; continue }
    out[i] = ch
    i++
  }
  return out.join('')
}

function parseRuleList(raw) {
  // Extract valid rule-name tokens only (kebab-case identifiers).
  // This lets ignore directives carry trailing prose:
  //   audit-ignore: a11y-div-as-button — backdrop, dialog handles keyboard
  // …and still parse the rule name correctly.
  const matches = String(raw || '').match(/[a-z][a-z0-9-]+/g) || []
  // Filter to only known rule names by accepting anything that starts with
  // a category prefix we use (a11y, std, data, mobile, perf, brand).
  const knownPrefixes = /^(a11y|std|data|mobile|perf|brand)-/
  return new Set(matches.filter((token) => knownPrefixes.test(token)))
}

function parseFileIgnores(content) {
  const ignores = new Set()
  const re = /\/\/\s*audit-ignore-file:\s*([^\n]+)|\/\*\s*audit-ignore-file:\s*([^*]+?)\s*\*\//g
  let m
  while ((m = re.exec(content)) !== null) {
    for (const r of parseRuleList(m[1] || m[2])) ignores.add(r)
  }
  return ignores
}

function parseLineIgnores(content) {
  const byLine = new Map()
  const lines = content.split(/\r?\n/)
  const re = /\/\/\s*audit-ignore:\s*([^\n]+)|\/\*\s*audit-ignore:\s*([^*]+?)\s*\*\//
  for (let i = 0; i < lines.length; i++) {
    const m = re.exec(lines[i])
    if (m) byLine.set(i + 1, parseRuleList(m[1] || m[2]))
  }
  return byLine
}

// --- output formatting ------------------------------------------------------

const SEV_COLOR = {
  blocker: '\x1b[31m',  // red
  advisory: '\x1b[33m', // yellow
}
const RESET = '\x1b[0m'

function formatFindings(findings) {
  const byFile = new Map()
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, [])
    byFile.get(f.file).push(f)
  }

  let out = ''
  const sortedFiles = Array.from(byFile.keys()).sort()
  for (const file of sortedFiles) {
    out += `\n${file}\n`
    const list = byFile.get(file).sort((a, b) => a.line - b.line || a.col - b.col)
    for (const f of list) {
      const sev = `${SEV_COLOR[f.severity] || ''}${f.severity.padEnd(8)}${RESET}`
      out += `  ${f.line}:${f.col}  ${sev}  ${f.rule}\n`
      out += `         ${f.message}\n`
    }
  }
  return out
}

// --- main -------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.id) {
    console.error('Missing --id <theme-id>')
    process.exit(2)
  }

  const themeDir = path.join(THEMES_ROOT, args.id)
  try {
    await fs.access(themeDir)
  } catch {
    console.error(`Theme folder not found: ${themeDir}`)
    process.exit(2)
  }

  const allFiles = await walk(themeDir)
  const auditFiles = allFiles.filter((f) => /\.(tsx?|css)$/.test(f))

  const findings = []
  for (const file of auditFiles) {
    const rawContent = await fs.readFile(file, 'utf8')
    const fileIgnores = parseFileIgnores(rawContent)
    const lineIgnores = parseLineIgnores(rawContent)
    // Strip comments before matching code-shape rules so JSDoc / JSX
    // comments that reference forbidden patterns ("don't use <div onClick=>")
    // don't trip false positives. Line numbers are preserved by replacing
    // comment characters with spaces.
    const content = stripCommentsPreservingLines(rawContent)

    for (const rule of RULES) {
      try {
        const ruleFindings = rule(file, content)
        for (const f of ruleFindings) {
          if (fileIgnores.has(f.rule)) continue
          // Allow ignore directive on the same line OR the line above the finding.
          const sameLine = lineIgnores.get(f.line)
          const aboveLine = lineIgnores.get(f.line - 1)
          if ((sameLine && sameLine.has(f.rule)) || (aboveLine && aboveLine.has(f.rule))) continue
          findings.push(f)
        }
      } catch (err) {
        console.error(`rule ${rule.name} threw on ${file}: ${err.message}`)
      }
    }
  }

  const blockers = findings.filter((f) => f.severity === 'blocker')
  const advisories = findings.filter((f) => f.severity === 'advisory')

  if (args.json) {
    process.stdout.write(JSON.stringify({
      themeId: args.id,
      filesAudited: auditFiles.length,
      blockerCount: blockers.length,
      advisoryCount: advisories.length,
      findings,
    }, null, 2) + '\n')
  } else {
    console.log(`Theme audit: ${args.id}`)
    console.log(`Files scanned: ${auditFiles.length} (.tsx/.ts/.css)`)

    if (findings.length === 0) {
      console.log(`\n  ${SEV_COLOR.blocker.replace('31', '32')}OK${RESET}: no findings`)
    } else {
      process.stdout.write(formatFindings(findings))
      console.log('')
      const summary = `Summary: ${blockers.length} blocker(s), ${advisories.length} advisory finding(s)`
      const tag = blockers.length > 0
        ? `${SEV_COLOR.blocker}BLOCKED${RESET}`
        : `${SEV_COLOR.blocker.replace('31', '32')}OK${RESET}`
      console.log(`  ${tag}: ${summary}`)
    }
  }

  if (blockers.length > 0) process.exit(1)
  if (args.strict && advisories.length > 0) process.exit(1)
  process.exit(0)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(2)
})
