#!/usr/bin/env node
/**
 * scaffold-theme.mjs
 *
 * Deterministic copier-and-rewriter that creates a new brandstudio theme by:
 *   1. Cloning a template theme folder (default: springalls-classic).
 *   2. Replacing identifier prefixes throughout (Springalls -> NewName etc).
 *   3. Rewriting theme.json metadata.
 *   4. Rewriting tokens.ts from a DNA JSON file.
 *   5. Rewriting context/BrandStyles.tsx fallback colors from DNA.
 *   6. Replacing the Google Fonts stylesheet at the top of styles/base.css.
 *
 * The scaffolder does NOT run npm run theme:sync — the caller (Skill / human)
 * does that after any post-scaffold adaptation work. This keeps the tool a
 * pure file generator.
 *
 * Usage:
 *   node tools/scaffold-theme.mjs \
 *     --id <new-theme-id> \
 *     --name "<Display Name>" \
 *     --description "<one-line desc>" \
 *     --dna <path-to-dna.json> \
 *     [--template <existing-theme-id>]   # default: springalls-classic
 *     [--status stable|experimental]     # default: stable
 *
 * Fails (exit 1) if the target folder already exists.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')
const THEMES_ROOT = path.join(PROJECT_ROOT, 'app', 'themes')
const DEFAULT_TEMPLATE = 'springalls-classic'

// --- arg parsing ------------------------------------------------------------

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i]
    if (!flag.startsWith('--')) continue
    const key = flag.slice(2)
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      args[key] = true
    } else {
      args[key] = next
      i++
    }
  }
  return args
}

// --- naming -----------------------------------------------------------------

function validateId(id) {
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(id)) {
    throw new Error(
      `Theme id "${id}" must be kebab-case with at least two segments (e.g. "huntsmotors-cobalt").`
    )
  }
}

function namesFor(id) {
  const segments = id.split('-')
  const cap = (s) => s[0].toUpperCase() + s.slice(1)
  return {
    id, // "huntsmotors-cobalt"
    pascalShort: cap(segments[0]), // "Huntsmotors"
    camelShort: segments[0].toLowerCase(), // "huntsmotors"
    pascalFull: segments.map(cap).join(''), // "HuntsmotorsCobalt"
    camelFull: segments[0] + segments.slice(1).map(cap).join(''), // "huntsmotorsCobalt"
    upperShort: segments[0].toUpperCase(), // "HUNTSMOTORS"
    upperFull: segments.map((s) => s.toUpperCase()).join('_'), // "HUNTSMOTORS_COBALT"
  }
}

// Template names — these are what we replace FROM. Derived via the same
// namesFor() rules so the schemes stay symmetric.
const TEMPLATE_NAMES = {
  'springalls-classic': namesFor('springalls-classic'),
  'classic-dealer': namesFor('classic-dealer'),
  'gilded-drive': namesFor('gilded-drive'),
  // Future archetype templates — uncomment when each ships:
  // 'archetype-modern': namesFor('archetype-modern'),
  // 'archetype-rugged': namesFor('archetype-rugged'),
  // 'archetype-luxury': namesFor('archetype-luxury'),
  // 'archetype-prestige': namesFor('archetype-prestige'),
}

// Archetype → template mapping. The /new-theme skill picks an archetype based
// on logo character (Phase A2b → `luxury-serif` ⇒ luxury, `condensed-bold` ⇒
// rugged, etc.) and the scaffolder picks the corresponding template. Until
// dedicated archetype templates ship, all archetypes fall back to
// `springalls-classic` so the pipeline never blocks on missing templates.
const ARCHETYPE_TO_TEMPLATE = {
  classic: 'springalls-classic',
  modern: 'springalls-classic',   // TODO: switch to archetype-modern when shipped
  rugged: 'springalls-classic',   // TODO: switch to archetype-rugged when shipped
  luxury: 'springalls-classic',   // TODO: switch to archetype-luxury when shipped
  prestige: 'springalls-classic', // TODO: switch to archetype-prestige when shipped
}

// --- file traversal & replacement ------------------------------------------

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.css', '.scss', '.module.css', '.json', '.md', '.txt', '.html', '.svg',
])

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return TEXT_EXTENSIONS.has(ext)
}

async function walk(dir) {
  const out = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...(await walk(full)))
    } else if (entry.isFile()) {
      out.push(full)
    }
  }
  return out
}

function replaceIdentifiers(content, fromNames, toNames) {
  // Order matters: longest forms first to avoid double-replacement.
  // 1. UPPER_FULL   (e.g. "SPRINGALLS_CLASSIC")
  // 2. PascalFull   (e.g. "SpringallsClassic")
  // 3. camelFull    (e.g. "springallsClassic")
  // 4. kebab id     (e.g. "springalls-classic")
  // 5. UPPER_SHORT  (e.g. "SPRINGALLS")
  // 6. PascalShort  (e.g. "Springalls")
  // 7. camelShort   (e.g. "springalls")
  return content
    .split(fromNames.upperFull).join(toNames.upperFull)
    .split(fromNames.pascalFull).join(toNames.pascalFull)
    .split(fromNames.camelFull).join(toNames.camelFull)
    .split(fromNames.id).join(toNames.id)
    .split(fromNames.upperShort).join(toNames.upperShort)
    .split(fromNames.pascalShort).join(toNames.pascalShort)
    .split(fromNames.camelShort).join(toNames.camelShort)
}

// --- token / brand-styles rewriters ----------------------------------------

function buildTokensFile(dna) {
  const t = JSON.stringify
  return `import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  radii: {
    pill: ${t(dna.radii.pill)},
    card: ${t(dna.radii.card)},
    input: ${t(dna.radii.input)},
    button: ${t(dna.radii.button)},
  },
  spacing: {
    sectionInset: ${t(dna.spacing.sectionInset)},
    sectionGap: ${t(dna.spacing.sectionGap)},
    containerMax: ${t(dna.spacing.containerMax)},
    headerMax: ${t(dna.spacing.headerMax)},
  },
  typography: {
    headingFamily: ${t(dna.fonts.heading)},
    bodyFamily: ${t(dna.fonts.body)},
    headingWeight: ${dna.fonts.headingWeight ?? 700},
    bodyWeight: ${dna.fonts.bodyWeight ?? 400},
  },
  hero: {
    minHeight: ${t(dna.hero.minHeight)},
    minHeightLg: ${t(dna.hero.minHeightLg)},
    minHeightSm: ${t(dna.hero.minHeightSm)},
    overlayStart: ${t(dna.hero.overlayStart)},
    overlayEnd: ${t(dna.hero.overlayEnd)},
    searchRadius: ${t(dna.hero.searchRadius)},
  },
  reviewStar: '#facc15',
  borders: {
    soft: 'rgba(15, 23, 42, 0.08)',
    softer: 'rgba(17, 24, 39, 0.12)',
  },
  shadows: {
    card: ${t(dna.shadows.card)},
    floating: ${t(dna.shadows.floating)},
    button: ${t(dna.shadows.button)},
  },
}
`
}

function rewriteBrandStylesColors(content, dna) {
  // BrandStyles.tsx contains fallback hex values like '#067a74' for the source
  // theme's signature primary color. Swap those out for DNA-derived colors so
  // unbranded previews of the new theme adopt the source app's palette.
  const replacements = [
    [/'#067a74'/g, JSON.stringify(dna.colors.primary)],          // primary
    [/'#08a49d'/g, JSON.stringify(dna.colors.primaryDark || dna.colors.primary)], // secondary
    [/'#16b3a8'/g, JSON.stringify(dna.colors.accent || dna.colors.primary)],     // accent
    [/'#f7f7f9'/g, JSON.stringify(dna.colors.bg)],                // background
    [/'#ffffff'/g, JSON.stringify(dna.colors.bg === '#ffffff' ? '#ffffff' : (dna.colors.surface || '#ffffff'))], // surface fallback
    [/'#111827'/g, JSON.stringify(dna.colors.text)],              // text
    [/'#4b5563'/g, JSON.stringify(dna.colors.muted)],             // muted
    [/'#d3d7dc'/g, JSON.stringify(dna.colors.border)],            // border
  ]
  let out = content
  for (const [pattern, value] of replacements) {
    out = out.replace(pattern, value)
  }
  return out
}

function rewriteBaseCssFonts(content, dna) {
  if (!dna.fonts.stylesheets || dna.fonts.stylesheets.length === 0) return content
  // Replace the leading @import url('https://fonts.googleapis.com/css2?...')
  // with the first DNA stylesheet (the source app's primary Google Fonts URL).
  const newImports = dna.fonts.stylesheets
    .map((url) => `@import url('${url}');`)
    .join('\n')
  if (/@import url\('https:\/\/fonts\.googleapis\.com[^']+'\);?/.test(content)) {
    return content.replace(
      /@import url\('https:\/\/fonts\.googleapis\.com[^']+'\);?\s*\n?/,
      newImports + '\n'
    )
  }
  return newImports + '\n' + content
}

// --- main -------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (!args.id || !args.name || !args.dna) {
    console.error('Missing required args.')
    console.error('Usage: node tools/scaffold-theme.mjs --id <new-id> --name "<Name>" --description "..." --dna <dna.json> [--template <existing-id>]')
    process.exit(1)
  }

  const newId = String(args.id).toLowerCase()
  validateId(newId)

  // Resolve template: explicit --template wins; otherwise --archetype maps
  // to one; otherwise the default (`springalls-classic`).
  let templateId
  if (args.template && typeof args.template === 'string') {
    templateId = args.template.toLowerCase()
  } else if (args.archetype && typeof args.archetype === 'string') {
    const archetype = args.archetype.toLowerCase()
    templateId = ARCHETYPE_TO_TEMPLATE[archetype]
    if (!templateId) {
      console.error(`Unknown --archetype "${archetype}". Known: ${Object.keys(ARCHETYPE_TO_TEMPLATE).join(', ')}`)
      process.exit(1)
    }
    if (templateId === DEFAULT_TEMPLATE && archetype !== 'classic') {
      console.log(`note: archetype "${archetype}" not yet implemented — falling back to ${DEFAULT_TEMPLATE} template`)
    }
  } else {
    templateId = DEFAULT_TEMPLATE
  }
  const fromNames = TEMPLATE_NAMES[templateId]
  if (!fromNames) {
    console.error(`Unknown template "${templateId}". Known: ${Object.keys(TEMPLATE_NAMES).join(', ')}`)
    process.exit(1)
  }

  const templateDir = path.join(THEMES_ROOT, templateId)
  const targetDir = path.join(THEMES_ROOT, newId)

  try {
    await fs.access(templateDir)
  } catch {
    console.error(`Template theme not found: ${templateDir}`)
    process.exit(1)
  }

  try {
    await fs.access(targetDir)
    console.error(`Target theme folder already exists: ${targetDir}`)
    console.error('Refusing to overwrite. Choose a different --id or remove the folder first.')
    process.exit(1)
  } catch { /* good — does not exist */ }

  // Load DNA
  const dnaRaw = await fs.readFile(path.resolve(args.dna), 'utf8')
  const dna = JSON.parse(dnaRaw)

  // Step 1: copy template -> target
  await fs.cp(templateDir, targetDir, { recursive: true })

  const toNames = namesFor(newId)
  console.log(`Cloned ${templateId} -> ${newId}`)

  // Step 2: walk and apply identifier replacements to text files
  const allFiles = await walk(targetDir)
  let rewriteCount = 0
  for (const filePath of allFiles) {
    if (!isTextFile(filePath)) continue
    const content = await fs.readFile(filePath, 'utf8')
    const next = replaceIdentifiers(content, fromNames, toNames)
    if (next !== content) {
      await fs.writeFile(filePath, next, 'utf8')
      rewriteCount++
    }
  }
  console.log(`Identifier rewrite: ${rewriteCount}/${allFiles.length} text files updated`)

  // Step 3: rewrite theme.json
  const themeJsonPath = path.join(targetDir, 'theme.json')
  const themeJson = {
    id: newId,
    name: String(args.name),
    description: String(args.description || `${args.name} theme ported from carous-platform/${dna.sourceApp || 'unknown'}.`),
    status: String(args.status || 'stable'),
    isDefault: false,
  }
  await fs.writeFile(themeJsonPath, JSON.stringify(themeJson, null, 2) + '\n', 'utf8')
  console.log(`Wrote theme.json (id=${newId}, status=${themeJson.status})`)

  // Step 4: rewrite tokens.ts from DNA
  const tokensPath = path.join(targetDir, 'tokens.ts')
  await fs.writeFile(tokensPath, buildTokensFile(dna), 'utf8')
  console.log('Wrote tokens.ts from DNA')

  // Step 5: rewrite BrandStyles.tsx fallback colors
  const brandStylesPath = path.join(targetDir, 'context', 'BrandStyles.tsx')
  if (await fileExists(brandStylesPath)) {
    const original = await fs.readFile(brandStylesPath, 'utf8')
    const rewritten = rewriteBrandStylesColors(original, dna)
    if (rewritten !== original) {
      await fs.writeFile(brandStylesPath, rewritten, 'utf8')
      console.log('Updated BrandStyles.tsx fallback colors from DNA')
    }
  }

  // Step 6: replace Google Fonts import in styles/base.css
  const baseCssPath = path.join(targetDir, 'styles', 'base.css')
  if (await fileExists(baseCssPath)) {
    const original = await fs.readFile(baseCssPath, 'utf8')
    const rewritten = rewriteBaseCssFonts(original, dna)
    if (rewritten !== original) {
      await fs.writeFile(baseCssPath, rewritten, 'utf8')
      console.log('Updated styles/base.css Google Fonts import from DNA')
    }
  }

  // Step 7: download hero image if DNA has one, save to public/themes/<id>/hero.jpg,
  // and pin it as the BrandStyles.tsx fallback so unbranded previews aren't blank.
  const heroSourceUrl = dna.heroImage || dna?.notes?.heroImageUrl || null
  let heroLocalPath = null
  if (heroSourceUrl && /^https?:\/\//i.test(heroSourceUrl)) {
    try {
      heroLocalPath = await downloadHero(heroSourceUrl, newId)
      if (heroLocalPath && await fileExists(brandStylesPath)) {
        const original = await fs.readFile(brandStylesPath, 'utf8')
        const rewritten = original.replace(
          /'\/images\/hero-placeholder\.jpg'/g,
          JSON.stringify(heroLocalPath),
        )
        if (rewritten !== original) {
          await fs.writeFile(brandStylesPath, rewritten, 'utf8')
          console.log(`Pinned hero image fallback to ${heroLocalPath}`)
        }
      }
    } catch (err) {
      console.log(`Hero download skipped: ${err instanceof Error ? err.message : String(err)}`)
    }
  } else if (heroSourceUrl) {
    console.log(`Hero source is not a URL (${heroSourceUrl}) — skipped self-hosting`)
  }

  console.log('')
  console.log(`Theme "${newId}" scaffolded at app/themes/${newId}/`)
  console.log('Next steps (caller responsibility):')
  console.log('  1. Adapt Hero/Header/Footer/page.tsx character to match the source app.')
  console.log('  2. Run: npm run theme:sync')
  console.log('  3. Run: npx tsc --noEmit  (or npm run build)')
}

async function downloadHero(url, themeId) {
  const sharp = (await import('sharp')).default
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; brandstudio-scaffold/1.0)' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())

  const publicDir = path.join(PROJECT_ROOT, 'public', 'themes', themeId)
  await fs.mkdir(publicDir, { recursive: true })
  const targetPath = path.join(publicDir, 'hero.jpg')

  await sharp(buf)
    .resize(1920, 1080, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(targetPath)

  // Return the URL path Next will serve from /public
  return `/themes/${themeId}/hero.jpg`
}

async function fileExists(p) {
  try { await fs.access(p); return true } catch { return false }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(1)
})
