#!/usr/bin/env node
/**
 * check-theme-contract.mjs
 *
 * Conformance checker for the shared theme contract (docs/theme-contract.md).
 * Asserts every theme has the required files, emits the canonical --color-*
 * token set (via the shared buildThemeTokens emitter), mounts the shared
 * widget stack rather than per-theme forks, and uses the shared ThemeChrome +
 * canonical KNOWN_ROUTES rather than a hand-rolled route literal.
 *
 * Usage:
 *   node tools/check-theme-contract.mjs               # all themes, summary
 *   node tools/check-theme-contract.mjs --id fbm-motors
 *   node tools/check-theme-contract.mjs --json
 *   node tools/check-theme-contract.mjs --list        # every finding
 *
 * Exit: 0 all pass, 1 any fail, 2 bad input. (Matches check-color-contract.mjs.)
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const THEMES_DIR = path.join(ROOT, 'app', 'themes')
const STUBS = new Set(['fbm', 'generated', 'lib', 'components'])

const REQUIRED_FILES = [
  'shell.tsx',
  'pages.ts',
  'sections/index.tsx',
  'recipes/index.ts',
  'tokens.ts',
  'theme.json',
  'context/BrandStyles.tsx',
  'styles/color-policy.css',
  'lib/contact.ts',
]

const CORE_COLOR_TOKENS = [
  '--color-primary', '--color-secondary', '--color-accent', '--color-bg',
  '--color-surface', '--color-text', '--color-muted', '--color-border',
]

// Widget-fork filename markers that must NOT exist inside a theme.
const FORK_PATTERNS = [
  { re: /CookieBanner\.tsx$/i, rule: 'contract-fork-cookie', msg: 'per-theme CookieBanner fork — use shared @/app/widgets/CookieBanner via ThemeChrome' },
  { re: /AosProvider\.tsx$/i, rule: 'contract-fork-aos', msg: 'per-theme AosProvider fork — use shared @/app/widgets/AnimateOnScroll' },
  { re: /(WhatsAppFab|SupportWidget|WhatsAppEnquiry)\.tsx$/i, rule: 'contract-fork-whatsapp', msg: 'per-theme WhatsApp fork — use shared @/app/widgets/CarousWhatsAppWidget' },
  { re: /(^|[\\/])PreviewBanner\.tsx$/i, rule: 'contract-fork-preview', msg: 'per-theme PreviewBanner fork — use shared @/app/widgets/PreviewBanner' },
]

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

async function exists(p) {
  try { await fs.access(p); return true } catch { return false }
}

async function read(p) {
  try { return await fs.readFile(p, 'utf8') } catch { return '' }
}

async function walk(dir) {
  const out = []
  let entries
  try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...await walk(p))
    else out.push(p)
  }
  return out
}

async function checkTheme(id) {
  const dir = path.join(THEMES_DIR, id)
  const findings = []

  // 1. Required files
  for (const rel of REQUIRED_FILES) {
    if (!(await exists(path.join(dir, rel)))) {
      findings.push({ rule: 'contract-missing-file', msg: `missing required file: ${rel}` })
    }
  }

  // 2. Token emission — prefer the shared emitter; else the raw core-8 must be present.
  const brandStyles = await read(path.join(dir, 'context', 'BrandStyles.tsx'))
  if (brandStyles) {
    const usesEmitter = /from ['"][^'"]*theme-tokens['"]/.test(brandStyles) && /buildThemeTokens/.test(brandStyles)
    if (!usesEmitter) {
      const missing = CORE_COLOR_TOKENS.filter((t) => !brandStyles.includes(t))
      if (missing.length) {
        findings.push({ rule: 'contract-no-color-tokens', msg: `BrandStyles neither imports buildThemeTokens nor emits ${missing.join(', ')}` })
      } else {
        findings.push({ rule: 'contract-hand-rolled-tokens', msg: 'BrandStyles emits --color-* by hand — migrate to buildThemeTokens (@/app/themes/lib/theme-tokens)' })
      }
    }
  }

  // 3. No widget forks
  const files = await walk(dir)
  for (const f of files) {
    for (const { re, rule, msg } of FORK_PATTERNS) {
      if (re.test(f)) findings.push({ rule, msg: `${msg} (${path.relative(dir, f)})` })
    }
  }

  // 4. Shell shape — renders ThemeChrome, no hand-rolled KNOWN_ROUTES literal.
  const shellFiles = files.filter((f) => /(^|[\\/])(shell\.tsx|Shell\.tsx|ConditionalShell\.tsx)$/.test(f))
  const shellText = (await Promise.all(shellFiles.map(read))).join('\n')
  if (shellText) {
    if (!/ThemeChrome/.test(shellText)) {
      findings.push({ rule: 'contract-shell-shape', msg: 'shell does not use the shared <ThemeChrome> (@/app/themes/lib/ThemeChrome)' })
    }
    if (/(const|let)\s+KNOWN_ROUTES\s*=/.test(shellText)) {
      findings.push({ rule: 'contract-known-routes-copy', msg: 'shell hand-rolls a KNOWN_ROUTES literal — import from @/app/themes/lib/known-routes' })
    }
  }

  return findings
}

const args = parseArgs(process.argv.slice(2))
let themeIds
if (args.id) {
  themeIds = [args.id]
} else {
  const entries = await fs.readdir(THEMES_DIR, { withFileTypes: true })
  themeIds = entries.filter((e) => e.isDirectory() && !STUBS.has(e.name)).map((e) => e.name)
}

const results = {}
let failed = 0
for (const id of themeIds) {
  const findings = await checkTheme(id)
  results[id] = findings
  if (findings.length) failed++
}

if (args.json) {
  console.log(JSON.stringify(results, null, 2))
} else {
  for (const id of themeIds) {
    const findings = results[id]
    if (!findings.length) {
      console.log(`${id}: PASS`)
    } else {
      console.log(`${id}: FAIL (${findings.length})`)
      if (args.id || args.list) {
        for (const f of findings) console.log(`  [${f.rule}] ${f.msg}`)
      }
    }
  }
  console.log(`\n${themeIds.length - failed}/${themeIds.length} themes conform`)
}

process.exit(failed > 0 ? 1 : 0)
