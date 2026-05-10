#!/usr/bin/env node
/**
 * rollback-theme.mjs — clean up a partially-scaffolded theme.
 *
 * When a /new-theme run fails between Phase 7 (scaffold) and Phase 12
 * (report), the system can be left in inconsistent states:
 *   - app/themes/<theme-id>/ exists but is incomplete
 *   - public/themes/<theme-id>/ has downloaded images
 *   - tools/.theme-dna/<theme-id>.json or .theme-images/<theme-id>.json
 *   - theme-manifest.json + 4 generated registry files reference the theme
 *
 * This tool removes those artifacts and re-runs theme:sync so the
 * registries don't reference a non-existent theme. Safe to run multiple
 * times (idempotent — every step tolerates "already gone").
 *
 * Scope (clarified 2026-05-10): the skill no longer creates brand
 * records, so this tool no longer deletes MySQL rows. If you need to
 * remove a brand record, use the dashboard's delete flow at /update/<slug>
 * — that's the canonical path for brand cleanup.
 *
 * Usage:
 *   node tools/rollback-theme.mjs --theme-id <theme-id>
 *   node tools/rollback-theme.mjs --theme-id <id> --dry-run  # show what would be removed
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const k = a.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) { out[k] = true } else { out[k] = next; i++ }
  }
  return out
}

async function pathExists(p) {
  try { await fs.access(p); return true } catch { return false }
}

async function removeIfExists(label, p, dry) {
  const exists = await pathExists(p)
  if (!exists) return { label, action: 'skip', msg: `not present: ${p}` }
  if (dry) return { label, action: 'would-remove', msg: p }
  try {
    await fs.rm(p, { recursive: true, force: true })
    return { label, action: 'removed', msg: p }
  } catch (e) {
    return { label, action: 'fail', msg: `${p} (${e.message})` }
  }
}

async function runThemeSync(dry) {
  if (dry) return { label: 'theme-sync', action: 'would-run', msg: 'npm run theme:sync' }
  const r = spawnSync('npm', ['run', 'theme:sync'], {
    cwd: PROJECT_ROOT, encoding: 'utf8', shell: true, timeout: 30000,
  })
  if (r.status !== 0) {
    return { label: 'theme-sync', action: 'fail', msg: r.stderr.trim() || r.stdout.trim() }
  }
  const themeCount = (r.stdout.match(/(\d+)\s+theme\(s\)\s+discovered/) || [])[1]
  return { label: 'theme-sync', action: 'done', msg: themeCount ? `${themeCount} theme(s) registered` : 'sync ok' }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args['theme-id']) {
    console.error('Usage: node tools/rollback-theme.mjs --theme-id <id> [--dry-run]')
    process.exit(2)
  }
  const themeId = args['theme-id']
  const dry = !!args['dry-run']

  const targets = [
    { label: 'theme-folder', p: path.join(PROJECT_ROOT, 'app', 'themes', themeId) },
    { label: 'public-images', p: path.join(PROJECT_ROOT, 'public', 'themes', themeId) },
    { label: 'dna-json', p: path.join(PROJECT_ROOT, 'tools', '.theme-dna', `${themeId}.json`) },
    { label: 'images-manifest', p: path.join(PROJECT_ROOT, 'tools', '.theme-images', `${themeId}.json`) },
    { label: 'logo-colors', p: path.join(PROJECT_ROOT, 'tools', '.logo-colors', `${themeId}.json`) },
  ]

  const results = []
  for (const t of targets) {
    results.push(await removeIfExists(t.label, t.p, dry))
  }

  // theme:sync rebuilds the manifest + 4 generated registries from whatever
  // theme folders remain on disk. Without this step the registries would
  // still reference the now-deleted theme and the dev server would error.
  results.push(await runThemeSync(dry))

  console.log(`Rollback for theme="${themeId}"${dry ? ' (DRY RUN)' : ''}:`)
  for (const r of results) {
    let tag
    if (r.action === 'removed' || r.action === 'done') tag = `${GREEN}${r.action.padEnd(11)}${RESET}`
    else if (r.action === 'skip') tag = `${YELLOW}${r.action.padEnd(11)}${RESET}`
    else if (r.action === 'fail') tag = `${RED}${r.action.padEnd(11)}${RESET}`
    else tag = r.action.padEnd(11) // would-remove / would-run
    console.log(`  ${tag}  ${r.label.padEnd(16)}  ${r.msg}`)
  }
  const failed = results.filter((r) => r.action === 'fail')
  console.log('')
  if (failed.length === 0) {
    console.log(`  ${GREEN}OK${RESET}: rollback ${dry ? 'plan' : 'complete'}.`)
  } else {
    console.log(`  ${RED}PARTIAL${RESET}: ${failed.length} step(s) failed; investigate manually.`)
  }
  process.exit(failed.length > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.stack || e.message : String(e))
  process.exit(2)
})
