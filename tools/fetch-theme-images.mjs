#!/usr/bin/env node
/**
 * fetch-theme-images.mjs
 *
 * Sources 7 page-level images for a new theme/brand and saves them locally
 * under `public/themes/<theme-id>/images/<slot>.jpg`. Two modes:
 *
 *   - Curated fallback (default, no API key needed). Looks up a hand-picked
 *     Unsplash URL per (archetype × slot) combo from `theme-image-catalogue.json`.
 *     Each URL is a direct CDN link — no API call, no auth.
 *   - Live Unsplash API mode (when `UNSPLASH_ACCESS_KEY` is set). Searches
 *     for terms tailored to (archetype × slot) and picks the top result.
 *     Higher variety but rate-limited.
 *
 * Slots: hero, about, services, finance, partExchange, sellYourCar, recentlySold.
 *
 * Output JSON shape (written to stdout AND saved at
 *  `tools/.theme-images/<theme-id>.json`):
 *  {
 *    themeId, archetype, mode: "curated"|"unsplash-api",
 *    images: {
 *      hero:        { source, localPath, attribution },
 *      about:       { source, localPath, attribution },
 *      ...
 *    }
 *  }
 *
 * Usage:
 *   node tools/fetch-theme-images.mjs --theme-id <id> --archetype <classic|modern|rugged|luxury|prestige>
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')
const CATALOGUE_PATH = path.join(TOOLS_DIR, 'theme-image-catalogue.json')
const OUT_DIR = path.join(TOOLS_DIR, '.theme-images')

// Legacy default slot list. When a theme ships recipes/image-recipe.json the
// slot list (+ per-slot unsplashHint) is read from there instead, so a new slot
// declared in a theme's manifest is auto-sourced for prospect previews.
const SLOTS = ['hero', 'about', 'services', 'finance', 'partExchange', 'sellYourCar', 'recentlySold']

/** Read {slots, hints} from a theme's image-recipe.json, or null (legacy). */
async function manifestSlots(themeId) {
  try {
    const p = path.join(PROJECT_ROOT, 'app', 'themes', themeId, 'recipes', 'image-recipe.json')
    const recipe = JSON.parse(await fs.readFile(p, 'utf8'))
    const list = Array.isArray(recipe.slots) ? recipe.slots : []
    const slots = list.map((s) => s.key).filter(Boolean)
    if (!slots.length) return null
    const hints = {}
    for (const s of list) if (s.key && s.unsplashHint) hints[s.key] = s.unsplashHint
    return { slots, hints }
  } catch {
    return null
  }
}

// Default search terms per (archetype × slot). Used when the live Unsplash
// API mode is enabled. Tailored toward UK-car-dealer aesthetics.
const SEARCH_TERMS = {
  classic: {
    hero: 'classic car dealership uk lot',
    about: 'family car dealer team',
    services: 'mechanic vehicle inspection',
    finance: 'car finance handshake',
    partExchange: 'car keys exchange',
    sellYourCar: 'car valuation',
    recentlySold: 'car key handover sold',
  },
  modern: {
    hero: 'modern car dealership showroom minimal',
    about: 'modern car dealer team office',
    services: 'modern car service lift',
    finance: 'modern finance contract signing',
    partExchange: 'car buying modern',
    sellYourCar: 'modern car appraisal',
    recentlySold: 'sold sign modern dealership',
  },
  rugged: {
    hero: '4x4 off road rugged vehicle landscape',
    about: 'jeep wrangler dealer team',
    services: 'land rover service',
    finance: '4x4 finance offroad',
    partExchange: 'jeep part exchange',
    sellYourCar: 'sell 4x4 jeep',
    recentlySold: 'sold jeep wrangler',
  },
  luxury: {
    hero: 'luxury car showroom prestige',
    about: 'luxury car dealer concierge',
    services: 'luxury car detailing',
    finance: 'luxury car finance leather',
    partExchange: 'prestige car exchange',
    sellYourCar: 'luxury car appraisal',
    recentlySold: 'luxury car sold prestige',
  },
  prestige: {
    hero: 'prestige supercar showroom magazine',
    about: 'prestige car curator',
    services: 'prestige car workshop',
    finance: 'prestige car finance bespoke',
    partExchange: 'supercar trade in',
    sellYourCar: 'supercar consignment',
    recentlySold: 'supercar sold delivered',
  },
}

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

async function readJson(p, fallback) {
  try {
    return JSON.parse(await fs.readFile(p, 'utf8'))
  } catch {
    return fallback
  }
}

async function downloadAndSave(url, targetPath) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; brandstudio-image-fetcher/1.0)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.mkdir(path.dirname(targetPath), { recursive: true })
  // Resize uniformly to 1600x900 cover, JPEG q82 — keeps files small for prospect previews.
  await sharp(buf)
    .resize(1600, 900, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(targetPath)
  return targetPath
}

async function fetchViaUnsplashApi(archetype, slot, accessKey) {
  const query = (SEARCH_TERMS[archetype] && SEARCH_TERMS[archetype][slot]) || `${archetype} car ${slot}`
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${accessKey}` } })
  if (!res.ok) throw new Error(`Unsplash API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return {
    sourceUrl: data.urls?.regular || data.urls?.full,
    attribution: {
      photographer: data.user?.name,
      photographerUrl: data.user?.links?.html,
      sourceUrl: data.links?.html,
      service: 'Unsplash',
    },
  }
}

function curatedLookup(catalogue, archetype, slot) {
  // Try requested archetype first.
  const arch = catalogue[archetype]
  if (arch && arch[slot] && typeof arch[slot] === 'object' && arch[slot].url) {
    return { ...arch[slot], _via: archetype }
  }
  // Fall back to `classic` so a partially-curated catalogue still produces
  // something for every slot. The classic archetype is the most filled-in
  // and its photos are conventional dealership-themed — safe defaults.
  if (archetype !== 'classic') {
    const classicArch = catalogue.classic
    if (classicArch && classicArch[slot] && typeof classicArch[slot] === 'object' && classicArch[slot].url) {
      return { ...classicArch[slot], _via: 'classic-fallback' }
    }
  }
  return null
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args['theme-id']) {
    console.error('Missing --theme-id <id>')
    process.exit(2)
  }
  const themeId = args['theme-id']
  const archetype = (args.archetype || 'classic').toLowerCase()
  if (!SEARCH_TERMS[archetype]) {
    console.error(`Unknown --archetype "${archetype}". Known: ${Object.keys(SEARCH_TERMS).join(', ')}`)
    process.exit(2)
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  const useApi = !!accessKey && !args['no-api']
  const catalogue = await readJson(CATALOGUE_PATH, {})

  const publicImagesRoot = path.join(PROJECT_ROOT, 'public', 'themes', themeId, 'images')
  // Manifest-driven slot list when the theme ships recipes/image-recipe.json,
  // else the legacy 7-slot default — so a slot added to a theme's manifest is
  // auto-sourced here without editing this tool.
  const manifest = await manifestSlots(themeId)
  const slotList = manifest ? manifest.slots : SLOTS
  const slotHints = manifest ? manifest.hints : {}
  const result = {
    themeId,
    archetype,
    mode: useApi ? 'unsplash-api' : 'curated',
    images: {},
    warnings: [],
  }

  for (const slot of slotList) {
    let sourceUrl = null
    let attribution = null
    try {
      if (useApi) {
        const fromApi = await fetchViaUnsplashApi(archetype, slot, accessKey)
        sourceUrl = fromApi.sourceUrl
        attribution = fromApi.attribution
      } else {
        const curated = curatedLookup(catalogue, archetype, slot)
        if (curated) {
          sourceUrl = curated.url
          attribution = curated.attribution || null
          if (curated._via && curated._via !== archetype) {
            result.warnings.push(`${slot}: used classic-fallback (no ${archetype}/${slot} curated yet)`)
          }
        }
      }

      if (!sourceUrl) {
        result.warnings.push(`no source for ${archetype}/${slot} — skipped`)
        continue
      }

      const localPath = path.join(publicImagesRoot, `${slot}.jpg`)
      await downloadAndSave(sourceUrl, localPath)
      const publicUrl = `/themes/${themeId}/images/${slot}.jpg`
      result.images[slot] = {
        source: sourceUrl,
        localPath: publicUrl,
        attribution,
      }
    } catch (err) {
      result.warnings.push(`${slot}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  await fs.mkdir(OUT_DIR, { recursive: true })
  const outPath = path.join(OUT_DIR, `${themeId}.json`)
  await fs.writeFile(outPath, JSON.stringify(result, null, 2) + '\n', 'utf8')

  console.log(`Theme images fetched for ${themeId} (archetype=${archetype}, mode=${result.mode})`)
  for (const [slot, info] of Object.entries(result.images)) {
    console.log(`  ${slot.padEnd(14)} -> ${info.localPath}`)
  }
  if (result.warnings.length) {
    console.log('  warnings:')
    for (const w of result.warnings) console.log(`    - ${w}`)
  }
  console.log(`  manifest: ${path.relative(PROJECT_ROOT, outPath)}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(1)
})
