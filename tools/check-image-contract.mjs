#!/usr/bin/env node
/**
 * check-image-contract.mjs
 *
 * Enforces the image contract: every theme image is DECLARED in
 * `recipes/image-recipe.json` and consumed via the sanctioned resolvers
 * (themeImageCss / themeImageUrl / resolveImage / buildImageVars). Nothing
 * static — no hardcoded theme image paths, no undeclared image slots.
 *
 * BLOCKER findings (only for themes that ship an image-recipe.json):
 *   - a literal theme image path (`/themes/<id>/…`, `/images/…` + image ext, or
 *     any rooted `url("/…jpg")`) that is NOT one of the manifest `default`s
 *     → declare it as a slot default and consume via themeImageCss/Url
 *   - `brand.images.<key>` / `brand.images['<key>']` / `--brand-image-<key>`
 *     for a <key> not declared in the manifest (kebab-compared)
 *
 * EXEMPT (never flagged):
 *   - context/BrandStyles.tsx, lib/tokens.ts, theme-tokens.ts, theme-images.ts,
 *     recipes/, *.json, *.md
 *   - the manifest's own `default` paths
 *   - the sanctioned resolver calls (themeImageCss/themeImageUrl/resolveImage/
 *     buildImageVars/findSlot) — their string args are slot keys, not paths
 *   - dynamic feed images (no literal path: <img src={v.image}> etc.), brand.logo/
 *     brand.favicon, marque logos (simple-icons / jsdelivr), /_next/image, data:
 *   - a line (or the line above) annotated `/* image-static-ok *​/`
 *
 * Themes WITHOUT an image-recipe.json are SKIPPED (legacy shim; advisory only).
 *
 * Usage:
 *   node tools/check-image-contract.mjs                        # all manifest themes
 *   node tools/check-image-contract.mjs --id redgate-lodge-bespoke
 *   node tools/check-image-contract.mjs --list
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
  /app[\\/]themes[\\/]lib[\\/]theme-images\.ts$/,
  /\.json$/,
  /recipes[\\/]/,
  /\.md$/,
]

const IMG_EXT = 'png|jpe?g|webp|gif|avif|svg'
const VIDEO_EXT = 'mp4|webm|mov|m4v|ogv'
const MEDIA_EXT = `${IMG_EXT}|${VIDEO_EXT}`
// A rooted literal media path: "/themes/…jpg", "/images/…png", "/…mp4".
const LITERAL_PATH = new RegExp(`["'\`(]\\s*(\\/(?:themes|images)\\/[^"'\`)\\s]*?\\.(?:${MEDIA_EXT}))(?:[?#][^"'\`)\\s]*)?`, 'gi')
const STATIC_OK = /image-static-ok|media-static-ok/
const RESOLVER_CALL = /themeImage(?:Css|Url)\s*\(|resolveImage(?:Url|Css)?\s*\(|resolveMedia\s*\(|buildImageVars\s*\(|findSlot\s*\(|<BrandMedia\b/
const EXEMPT_HOST = /simple-icons|jsdelivr|_next\/image|data:/i
const LOGO_CTX = /logo|favicon|marque|brandLogo/i

// brand.images.<key> | brand.images['<key>'] | brand.media.<key> | var(--brand-image-<key>)
const IMAGES_DOT = /brand\??\.(?:images|media)\??\.\s*([a-zA-Z][\w]*)/g
const IMAGES_BRACKET = /brand\??\.(?:images|media)\??\s*\[\s*['"]([\w-]+)['"]\s*\]/g
const BRAND_IMAGE_VAR = /--brand-image-([a-z0-9-]+)/g

function kebab(k) {
  return k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[_\s]+/g, '-').toLowerCase()
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
    else if (/\.(css|tsx|ts)$/.test(e.name)) out.push(p)
  }
  return out
}

async function readRecipe(themeId) {
  // media-recipe.json (image + video slots) wins; image-recipe.json is the
  // legacy fallback so themes not yet renamed keep validating.
  for (const name of ['media-recipe.json', 'image-recipe.json']) {
    try {
      return JSON.parse(await fs.readFile(path.join(THEMES_DIR, themeId, 'recipes', name), 'utf8'))
    } catch {
      /* try next */
    }
  }
  return null
}

async function loadManifest(themeId) {
  const recipe = await readRecipe(themeId)
  if (!recipe) return null // no manifest → legacy, skip
  const slots = Array.isArray(recipe.slots) ? recipe.slots : []
  const keys = new Set(slots.map((s) => kebab(String(s.key || ''))).filter(Boolean))
  const defaults = new Set()
  const structural = []
  for (const s of slots) {
    if (s.default) defaults.add(String(s.default))
    if (s.posterDefault) defaults.add(String(s.posterDefault))
    if (typeof s.poster === 'string' && s.poster.startsWith('/')) defaults.add(s.poster)
    // A video slot must be able to show a still, or <BrandMedia> renders blank.
    if (s.type === 'video' && !s.poster && !s.posterDefault) {
      structural.push({
        file: `app/themes/${themeId}/recipes/media-recipe.json`,
        line: 1,
        match: String(s.key || '(video slot)'),
        why: 'video slot has no `poster` (slot key or path) nor `posterDefault` — it can render blank',
        text: `"${s.key}": { "type": "video", … }`,
      })
    }
  }
  return { keys, defaults, structural }
}

function scanContent(file, content, manifest) {
  const findings = []
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const prev = i > 0 ? lines[i - 1] : ''
    if (STATIC_OK.test(line) || STATIC_OK.test(prev)) continue

    // (A) literal theme image paths not in the manifest defaults
    for (const m of line.matchAll(LITERAL_PATH)) {
      const p = m[1]
      if (manifest.defaults.has(p)) continue
      if (EXEMPT_HOST.test(line) || LOGO_CTX.test(line)) continue
      findings.push({
        file, line: i + 1, match: p,
        why: 'literal image path — declare a slot default in image-recipe.json and consume via themeImageCss/Url',
        text: line.trim().slice(0, 160),
      })
    }

    // (B) undeclared slot references. Skip lines that are sanctioned resolver
    // calls (their string args are declared slot keys, not literals).
    if (RESOLVER_CALL.test(line)) continue
    const refs = []
    for (const m of line.matchAll(IMAGES_DOT)) refs.push(m[1])
    for (const m of line.matchAll(IMAGES_BRACKET)) refs.push(m[1])
    for (const m of line.matchAll(BRAND_IMAGE_VAR)) refs.push(m[1])
    for (const raw of refs) {
      const key = kebab(raw)
      if (!key || key === 'hero') continue // hero tier resolved via brand.heroImage everywhere
      if (manifest.keys.has(key)) continue
      findings.push({
        file, line: i + 1, match: raw,
        why: `undeclared image slot '${raw}' — add it to recipes/image-recipe.json`,
        text: line.trim().slice(0, 160),
      })
    }
  }
  return findings
}

async function scanTheme(themeId) {
  const manifest = await loadManifest(themeId)
  if (!manifest) return { skipped: true, findings: [] }
  const files = await walk(path.join(THEMES_DIR, themeId))
  const findings = [...(manifest.structural || [])]
  for (const file of files) {
    const rel = path.relative(ROOT, file)
    if (SKIP_FILE.some((re) => re.test(rel))) continue
    const content = await fs.readFile(file, 'utf8')
    findings.push(...scanContent(rel, content, manifest))
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
    if (args.id || args.list) console.log(`${id}: no image-recipe.json (legacy) — skipped`)
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
