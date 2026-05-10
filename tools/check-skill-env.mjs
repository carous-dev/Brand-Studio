#!/usr/bin/env node
/**
 * check-skill-env.mjs — pre-flight environment check for /new-theme.
 *
 * Runs as Phase 0.5 (after planning, before any inputs are gathered) so any
 * environmental issue surfaces in seconds rather than at Phase 9.
 *
 * Scoped to THEME BUILDING ONLY (clarified 2026-05-10). The skill no
 * longer touches Flask, MySQL, lvh.me, or any preview-creation flow —
 * those checks were removed from this script too. The dashboard's
 * /create page handles preview creation and has its own deps.
 *
 * Gates (each prints OK/FAIL):
 *   1. tools-present     — every script the skill calls exists at expected path
 *   2. node-deps         — `sharp` available for image processing
 *   3. theme-sync-clean  — `npm run theme:sync` succeeds without errors
 *
 * Usage:
 *   node tools/check-skill-env.mjs
 *   node tools/check-skill-env.mjs --json   # machine output
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')

function parseArgs(argv) {
  const out = {}
  for (const a of argv) {
    if (a.startsWith('--')) out[a.slice(2)] = true
  }
  return out
}

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

const REQUIRED_TOOLS = [
  'tools/extract-logo-colors.mjs',
  'tools/check-theme-contrast.mjs',
  'tools/audit-theme.mjs',
  'tools/scaffold-theme-skeleton.mjs',
  'tools/scaffold-theme.mjs',
  'tools/sync-theme-contracts.mjs',
  'tools/fetch-theme-images.mjs',
  'tools/extract-theme-dna.mjs',
]

async function fileExists(p) {
  try { await fs.access(p); return true } catch { return false }
}

async function gateToolsPresent() {
  const missing = []
  for (const rel of REQUIRED_TOOLS) {
    const full = path.join(PROJECT_ROOT, rel)
    if (!(await fileExists(full))) missing.push(rel)
  }
  if (missing.length === 0) {
    return { name: 'tools-present', ok: true, msg: `${REQUIRED_TOOLS.length} tools accounted for` }
  }
  return { name: 'tools-present', ok: false, msg: `missing: ${missing.join(', ')}` }
}

async function gateNodeDeps() {
  // sharp powers image extraction + the fetch-theme-images resize pass.
  const r = spawnSync('node', ['-e', "require('sharp'); console.log('ok')"], {
    cwd: PROJECT_ROOT, encoding: 'utf8',
  })
  if (r.status === 0) {
    return { name: 'node-deps', ok: true, msg: 'sharp available' }
  }
  return { name: 'node-deps', ok: false, msg: 'sharp missing — run `npm install`' }
}

async function gateThemeSyncClean() {
  // theme:sync regenerates the 4 runtime registries + theme-manifest.json
  // from the on-disk theme folders. If an existing theme has a broken
  // contract file, sync errors here and we want to know before scaffolding
  // a new theme on top of a broken baseline.
  const r = spawnSync('npm', ['run', 'theme:sync'], {
    cwd: PROJECT_ROOT, encoding: 'utf8', shell: true, timeout: 60000,
  })
  if (r.status === 0) {
    const m = (r.stdout || '').match(/(\d+)\s+theme\(s\)\s+discovered/)
    return { name: 'theme-sync-clean', ok: true, msg: m ? `${m[1]} theme(s) registered cleanly` : 'sync ok' }
  }
  return { name: 'theme-sync-clean', ok: false, msg: (r.stderr || r.stdout || '').trim().slice(0, 240) }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const gates = [
    await gateToolsPresent(),
    await gateNodeDeps(),
    await gateThemeSyncClean(),
  ]

  if (args.json) {
    console.log(JSON.stringify({ ok: gates.every((g) => g.ok), gates }, null, 2))
  } else {
    console.log('Pre-flight environment check for /new-theme:')
    for (const g of gates) {
      const tag = g.ok ? `${GREEN}OK  ${RESET}` : `${RED}FAIL${RESET}`
      console.log(`  ${tag}  ${g.name.padEnd(20)}  ${g.msg}`)
    }
    const failed = gates.filter((g) => !g.ok)
    console.log('')
    if (failed.length === 0) {
      console.log(`  ${GREEN}OK${RESET}: environment ready.`)
    } else {
      console.log(`  ${RED}BLOCKED${RESET}: ${failed.length} gate(s) failed; fix before scaffolding.`)
    }
  }
  process.exit(gates.every((g) => g.ok) ? 0 : 1)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.stack || e.message : String(e))
  process.exit(2)
})
