#!/usr/bin/env node
/**
 * check-theme-uniqueness.mjs
 *
 * Phase 10d distinctiveness gate. Reads `tools/.theme-fingerprints.json`
 * and asserts the new theme's fingerprint doesn't collide with any
 * existing entry on the high-signal axes that make themes feel "samey":
 *
 *   - archetype + signatureMove        (hard collision)
 *   - archetype + heroPattern          (hard collision)
 *   - homepageSections (Jaccard ≥ 0.65 vs any same-archetype peer)
 *   - inventoryListPattern + vehicleDetailPattern + archetype
 *   - fontHeading + fontBody pair (within same archetype)
 *
 * Each collision is reported with the colliding sibling so the operator
 * can adjust their pick. Soft collisions (Jaccard near threshold) are
 * surfaced as advisories. Exit 1 if any hard collision; exit 0 otherwise.
 *
 * Usage:
 *   node tools/check-theme-uniqueness.mjs --id <theme-id>
 *   node tools/check-theme-uniqueness.mjs --id <theme-id> --concept tools/.theme-concepts/<slug>.json
 *   node tools/check-theme-uniqueness.mjs --id <theme-id> --json
 *
 * The concept JSON is the fingerprint Phase A2e writes for the new theme.
 * If --concept isn't passed, the tool looks for tools/.theme-concepts/<theme-id>.json
 * by default.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')
const REGISTRY_PATH = path.join(TOOLS_DIR, '.theme-fingerprints.json')
const DEFAULT_CONCEPT_DIR = path.join(TOOLS_DIR, '.theme-concepts')
const SECTION_JACCARD_THRESHOLD = 0.65

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

async function readJson(p) {
  const raw = await fs.readFile(p, 'utf8')
  return JSON.parse(raw)
}

async function fileExists(p) {
  try { await fs.access(p); return true } catch { return false }
}

function jaccard(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 1
  let intersect = 0
  for (const x of setA) if (setB.has(x)) intersect++
  const union = setA.size + setB.size - intersect
  return union === 0 ? 0 : intersect / union
}

function sectionsSet(arr) {
  return new Set((arr || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean))
}

function fmtList(arr) {
  return Array.isArray(arr) ? arr.join(', ') : String(arr)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.id) {
    console.error('Usage: node tools/check-theme-uniqueness.mjs --id <theme-id> [--concept <path>] [--json]')
    process.exit(2)
  }
  const themeId = String(args.id).toLowerCase()
  const conceptPath = args.concept
    ? path.resolve(args.concept)
    : path.join(DEFAULT_CONCEPT_DIR, `${themeId}.json`)

  if (!await fileExists(conceptPath)) {
    console.error(`Concept file not found: ${conceptPath}`)
    console.error('Phase A2e must write the fingerprint to tools/.theme-concepts/<theme-id>.json before this check runs.')
    process.exit(2)
  }
  if (!await fileExists(REGISTRY_PATH)) {
    console.error(`Fingerprint registry not found: ${REGISTRY_PATH}`)
    process.exit(2)
  }

  const concept = await readJson(conceptPath)
  const registry = await readJson(REGISTRY_PATH)
  const peers = (registry.themes || []).filter((t) => t.themeId !== themeId)

  // Required fields on the concept payload — fail loudly if missing.
  const required = ['archetype', 'signatureConcept', 'signatureMove', 'heroPattern', 'headerStructure', 'homepageSections', 'inventoryListPattern', 'vehicleDetailPattern']
  const missing = required.filter((k) => !concept[k] || (Array.isArray(concept[k]) && concept[k].length === 0))
  if (missing.length > 0) {
    console.error(`Concept JSON missing required fields: ${missing.join(', ')}`)
    console.error(`Open ${conceptPath} and fill them in per the menu in SKILL.md §"Distinctiveness contract" before re-running.`)
    process.exit(2)
  }

  const collisions = []
  const advisories = []

  const sameArchetype = peers.filter((p) => p.archetype === concept.archetype)
  const newSections = sectionsSet(concept.homepageSections)

  for (const peer of peers) {
    // Hard: archetype + signatureMove
    if (peer.archetype === concept.archetype && peer.signatureMove === concept.signatureMove) {
      collisions.push({
        rule: 'archetype+signatureMove',
        peer: peer.themeId,
        detail: `Same archetype (${concept.archetype}) and signatureMove (${concept.signatureMove}) as ${peer.themeId}`,
      })
    }
    // Hard: archetype + heroPattern
    if (peer.archetype === concept.archetype && peer.heroPattern === concept.heroPattern) {
      collisions.push({
        rule: 'archetype+heroPattern',
        peer: peer.themeId,
        detail: `Same archetype (${concept.archetype}) and heroPattern (${concept.heroPattern}) as ${peer.themeId}`,
      })
    }
    // Hard: archetype + listPattern + detailPattern (inventory)
    if (
      peer.archetype === concept.archetype &&
      peer.inventoryListPattern === concept.inventoryListPattern &&
      peer.vehicleDetailPattern === concept.vehicleDetailPattern
    ) {
      collisions.push({
        rule: 'archetype+inventoryPair',
        peer: peer.themeId,
        detail: `Same archetype (${concept.archetype}) AND same inventory list pattern (${concept.inventoryListPattern}) AND same detail pattern (${concept.vehicleDetailPattern}) as ${peer.themeId}`,
      })
    }
  }

  // Section composition Jaccard — same-archetype peers only.
  for (const peer of sameArchetype) {
    const peerSections = sectionsSet(peer.homepageSections)
    const score = jaccard(newSections, peerSections)
    if (score >= SECTION_JACCARD_THRESHOLD) {
      collisions.push({
        rule: 'homepageSections-jaccard',
        peer: peer.themeId,
        detail: `Homepage section composition is ${score.toFixed(2)} similar to ${peer.themeId} (threshold ${SECTION_JACCARD_THRESHOLD}). Add at least two sections not present in ${peer.themeId}, or drop sections from yours, to differentiate.`,
        score: Number(score.toFixed(3)),
      })
    } else if (score >= 0.5) {
      advisories.push({
        rule: 'homepageSections-jaccard',
        peer: peer.themeId,
        detail: `Homepage section composition is ${score.toFixed(2)} similar to ${peer.themeId} — under the block threshold but consider adding one distinctive section.`,
        score: Number(score.toFixed(3)),
      })
    }
  }

  // Soft: font pair within same archetype (advisory).
  for (const peer of sameArchetype) {
    if (peer.fontHeading && peer.fontBody && peer.fontHeading === concept.fontHeading && peer.fontBody === concept.fontBody) {
      advisories.push({
        rule: 'archetype+fontPair',
        peer: peer.themeId,
        detail: `Same font pair (${concept.fontHeading} + ${concept.fontBody}) as ${peer.themeId} within the ${concept.archetype} archetype. Consider an alternate pairing from the SKILL §A4 menu.`,
      })
    }
  }

  if (args.json) {
    process.stdout.write(JSON.stringify({ themeId, archetype: concept.archetype, sameArchetypePeerCount: sameArchetype.length, collisions, advisories }, null, 2) + '\n')
  } else {
    const reset = '\x1b[0m'
    const green = '\x1b[32m'
    const red = '\x1b[31m'
    const yellow = '\x1b[33m'
    const bold = '\x1b[1m'
    console.log(`Uniqueness check: ${bold}${themeId}${reset}  (archetype: ${concept.archetype}; ${sameArchetype.length} same-archetype peer(s) in registry)`)
    console.log(`  signatureConcept: ${concept.signatureConcept}`)
    console.log(`  signatureMove:    ${concept.signatureMove}`)
    console.log(`  heroPattern:      ${concept.heroPattern}`)
    console.log(`  headerStructure:  ${concept.headerStructure}`)
    console.log(`  sections (${(concept.homepageSections || []).length}): ${fmtList(concept.homepageSections)}`)
    console.log(`  inventory:        list=${concept.inventoryListPattern}  detail=${concept.vehicleDetailPattern}`)
    console.log('')

    if (collisions.length === 0) {
      console.log(`  ${green}OK${reset}: no fingerprint collisions vs ${peers.length} registered theme(s).`)
    } else {
      console.log(`  ${red}BLOCKED${reset}: ${collisions.length} hard collision(s):`)
      for (const c of collisions) {
        console.log(`    ${red}✗${reset} [${c.rule}] ${c.detail}`)
      }
      console.log('')
      console.log(`  Open tools/.theme-concepts/${themeId}.json and adjust the colliding axis,`)
      console.log(`  then re-run. The Distinctiveness contract is non-negotiable — pick a different`)
      console.log(`  signatureMove / heroPattern / section composition before shipping.`)
    }
    if (advisories.length > 0) {
      console.log('')
      console.log(`  ${yellow}Advisories${reset} (not blocking, but worth a look):`)
      for (const a of advisories) {
        console.log(`    ${yellow}!${reset} [${a.rule}] ${a.detail}`)
      }
    }
  }

  if (collisions.length > 0) process.exit(1)
  process.exit(0)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(2)
})
