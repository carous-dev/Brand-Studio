#!/usr/bin/env node
/**
 * check-theme-similarity.mjs
 *
 * Phase 10d cross-theme similarity check. Two passes:
 *
 *   Baseline pass — new theme vs springalls-classic skeleton (threshold 0.85).
 *     Catches the "another theme, same palette" regression where Phase 8
 *     renamed identifiers without redesigning JSX.
 *
 *   Peer pass — new theme vs the 3 most recent same-archetype peers
 *     (threshold 0.55). Catches the "two themes feel the same" regression
 *     that the baseline pass misses: two new "modern" themes can each
 *     score 0.4 against the skeleton but 0.85 against each other.
 *
 * The peer pass reads `tools/.theme-concepts/<theme-id>.json` (written by
 * Phase A2e) to discover the new theme's archetype, then looks up recent
 * same-archetype themes from `tools/.theme-fingerprints.json`. If the
 * concept file is missing the peer pass is skipped with a warning.
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
const PEER_THRESHOLD = 0.55
const PEER_LIMIT = 3
const REGISTRY_PATH = path.join(TOOLS_DIR, '.theme-fingerprints.json')
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

async function loadRegistry() {
  try {
    const raw = await fs.readFile(REGISTRY_PATH, 'utf8')
    return JSON.parse(raw)
  } catch { return null }
}

async function pickArchetypePeers(themeId) {
  // Read the new theme's fingerprint (if any) and find the most recent
  // same-archetype peers in the registry. Returns up to PEER_LIMIT peer
  // theme ids whose folders exist on disk.
  const conceptPath = path.join(TOOLS_DIR, '.theme-concepts', `${themeId}.json`)
  let archetype = null
  try {
    const concept = JSON.parse(await fs.readFile(conceptPath, 'utf8'))
    archetype = concept?.archetype || null
  } catch { /* no concept file — skip peer mode */ }
  if (!archetype) return { archetype: null, peers: [] }

  const registry = await loadRegistry()
  if (!registry?.themes) return { archetype, peers: [] }
  const candidates = registry.themes
    .filter((t) => t.themeId !== themeId && t.archetype === archetype)
    .sort((a, b) => String(b.addedAt || '').localeCompare(String(a.addedAt || '')))
    .slice(0, PEER_LIMIT)
  const onDisk = []
  for (const c of candidates) {
    if (await fileExists(path.join(THEMES_ROOT, c.themeId))) onDisk.push(c.themeId)
  }
  return { archetype, peers: onDisk }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.id) {
    console.error('Usage: node tools/check-theme-similarity.mjs --id <theme-id> [--baseline <other-theme-id>] [--threshold 0.85] [--peer-threshold 0.55] [--no-peers] [--json]')
    process.exit(2)
  }
  const themeId = String(args.id).toLowerCase()
  const baselineId = String(args.baseline || DEFAULT_BASELINE).toLowerCase()
  const threshold = args.threshold ? Number(args.threshold) : DEFAULT_THRESHOLD
  const peerThreshold = args['peer-threshold'] ? Number(args['peer-threshold']) : PEER_THRESHOLD
  const peerMode = !args['no-peers']
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

  // Baseline pass (vs skeleton) — threshold 0.85, mostly a sanity check
  const baselineResults = []
  for (const rel of FILES_TO_CHECK) {
    baselineResults.push(await similarityForFile(themeId, baselineId, rel))
  }
  const baselineFlagged = baselineResults.filter((r) => r.status === 'ok' && r.score >= threshold)

  // Peer pass (vs recent same-archetype themes) — threshold 0.55, catches
  // "two modern themes look like twins" which the baseline pass misses.
  let peerInfo = { archetype: null, peers: [] }
  const peerResults = []
  let peerFlagged = []
  if (peerMode) {
    peerInfo = await pickArchetypePeers(themeId)
    for (const peerId of peerInfo.peers) {
      for (const rel of FILES_TO_CHECK) {
        const r = await similarityForFile(themeId, peerId, rel)
        peerResults.push({ ...r, peerId })
      }
    }
    peerFlagged = peerResults.filter((r) => r.status === 'ok' && r.score >= peerThreshold)
  }

  if (args.json) {
    process.stdout.write(JSON.stringify({
      themeId, baselineId, threshold, peerThreshold,
      baseline: { results: baselineResults, flagged: baselineFlagged },
      peers: { archetype: peerInfo.archetype, comparedAgainst: peerInfo.peers, results: peerResults, flagged: peerFlagged },
    }, null, 2) + '\n')
  } else {
    const reset = '\x1b[0m'
    const green = '\x1b[32m'
    const red = '\x1b[31m'
    const yellow = '\x1b[33m'
    const bold = '\x1b[1m'
    console.log(`${bold}Baseline pass${reset}: ${themeId} vs ${baselineId}  (threshold ${threshold})`)
    for (const r of baselineResults) {
      if (r.status === 'skipped') {
        console.log(`  ${yellow}skip${reset}      —  ${r.relPath}  (${r.reason})`)
        continue
      }
      const flag = r.score >= threshold ? `${red}HIGH${reset}` : `${green}ok${reset}  `
      console.log(`  ${flag}      ${r.score.toFixed(3)}  ${r.relPath}`)
    }
    if (baselineFlagged.length === 0) {
      console.log(`  ${green}OK${reset}: no file at/above ${threshold} — render layer is genuinely fresh vs ${baselineId}.`)
    } else {
      console.log(`  ${red}FLAGGED${reset}: ${baselineFlagged.length} file(s) look like clones of ${baselineId}.`)
      console.log(`  Phase 8 likely renamed identifiers without redesigning JSX. Redesign each flagged file.`)
    }

    if (peerMode) {
      console.log('')
      if (!peerInfo.archetype) {
        console.log(`${yellow}Peer pass skipped${reset} — no tools/.theme-concepts/${themeId}.json found (Phase A2e should have written it). Run /new-theme Phase A2e or pass --no-peers to silence.`)
      } else if (peerInfo.peers.length === 0) {
        console.log(`${bold}Peer pass${reset}: ${themeId} archetype=${peerInfo.archetype} — no same-archetype peers in registry yet, skipping.`)
      } else {
        console.log(`${bold}Peer pass${reset}: ${themeId} vs ${peerInfo.peers.length} recent ${peerInfo.archetype} peer(s) (threshold ${peerThreshold})`)
        const grouped = new Map()
        for (const r of peerResults) {
          if (!grouped.has(r.peerId)) grouped.set(r.peerId, [])
          grouped.get(r.peerId).push(r)
        }
        for (const [peerId, results] of grouped) {
          console.log(`  vs ${peerId}:`)
          for (const r of results) {
            if (r.status === 'skipped') {
              console.log(`    ${yellow}skip${reset}      —  ${r.relPath}`)
              continue
            }
            const flag = r.score >= peerThreshold ? `${red}HIGH${reset}` : `${green}ok${reset}  `
            console.log(`    ${flag}      ${r.score.toFixed(3)}  ${r.relPath}`)
          }
        }
        if (peerFlagged.length === 0) {
          console.log(`  ${green}OK${reset}: all peer scores under ${peerThreshold} — theme is materially different from its archetype siblings.`)
        } else {
          console.log(`  ${red}FLAGGED${reset}: ${peerFlagged.length} file(s) too similar to a same-archetype peer.`)
          console.log(`  This is the "two themes feel the same" regression. Redesign the flagged file's JSX away from the peer's structure.`)
        }
      }
    }
  }

  const anyFlagged = baselineFlagged.length > 0 || peerFlagged.length > 0
  if (anyFlagged) process.exit(1)
  process.exit(0)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(2)
})
