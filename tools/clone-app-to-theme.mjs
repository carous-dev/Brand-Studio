#!/usr/bin/env node
/**
 * clone-app-to-theme.mjs
 *
 * Page-for-page clone of a carous-platform app into a brandstudio theme.
 * Replaces the older "Mode B port" path which only extracted DNA and ran the
 * skeleton scaffolder (stripping the visual layer). This tool keeps the
 * source app's pages + components + styles intact and rewires them into the
 * brandstudio theme contract — then tokenizes colors / fonts / image URLs
 * so brand records can override them at runtime.
 *
 * Usage:
 *   node tools/clone-app-to-theme.mjs \
 *     --source <app-folder>           # required, folder name under apps/
 *     --target <theme-id>             # optional, defaults to <source>-clone
 *     [--apps <abs-path>]             # optional, override apps/ resolution
 *     [--name "<Display Name>"]       # optional, theme.json display name
 *     [--description "<one-liner>"]   # optional, theme.json description
 *     [--no-tokenize]                 # skip color/font/image tokenization pass
 *     [--dry-run]                     # report only, write nothing
 *
 * Resolution order for apps/ (first match wins):
 *   1. --apps CLI arg
 *   2. CAROUS_PLATFORM_APPS env var
 *   3. ../carous-platform/apps (sibling of brandstudio)
 *   4. ../../carous-platform/apps
 *
 * Exit codes:
 *   0 — success (theme scaffolded)
 *   1 — bad args / source missing / target exists / write failure
 *   2 — tokenization failure (theme was scaffolded but tokens not applied)
 */

import { promises as fs } from 'node:fs'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')
const THEMES_ROOT = path.join(PROJECT_ROOT, 'app', 'themes')
const DNA_DIR = path.join(TOOLS_DIR, '.theme-dna')

// ─────────────────────────────────────────────────────────────────────────────
// arg parsing
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// apps/ resolver — mirrors extract-theme-dna.mjs so behaviour is consistent
// ─────────────────────────────────────────────────────────────────────────────

function resolveAppsRoot(cliArg) {
  const candidates = []
  if (cliArg) candidates.push(cliArg)
  if (process.env.CAROUS_PLATFORM_APPS) candidates.push(process.env.CAROUS_PLATFORM_APPS)
  candidates.push(path.resolve(PROJECT_ROOT, '..', 'carous-platform', 'apps'))
  candidates.push(path.resolve(PROJECT_ROOT, '..', '..', 'carous-platform', 'apps'))
  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) return candidate
  }
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// theme id helpers
// ─────────────────────────────────────────────────────────────────────────────

function validateId(id) {
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(id)) {
    throw new Error(
      `Theme id "${id}" must be kebab-case with at least two segments (e.g. "lancashirecarsalesltd-clone").`,
    )
  }
}

function defaultThemeId(source) {
  return `${source.toLowerCase()}-clone`
}

function namesFor(id) {
  const segments = id.split('-')
  const cap = (s) => s[0].toUpperCase() + s.slice(1)
  return {
    id,
    pascalShort: cap(segments[0]),
    pascalFull: segments.map(cap).join(''),
    camelShort: segments[0].toLowerCase(),
    camelFull: segments[0] + segments.slice(1).map(cap).join(''),
    upperShort: segments[0].toUpperCase(),
    upperFull: segments.map((s) => s.toUpperCase()).join('_'),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// route + component discovery
// ─────────────────────────────────────────────────────────────────────────────

// Folders under apps/<src>/app/ that the theme contract never carries.
// Themes are presentation layers; data, auth, dashboards, internal hooks live
// elsewhere in brandstudio.
const SKIP_APP_DIRS = new Set([
  'api',
  'dashboard',
  'login',
  'data',
  'hooks',
  'search', // brandstudio uses a global search experience, not per-theme
  'in',     // OAuth callback (next-auth signIn redirect target)
  'out',    // OAuth signOut redirect target
  '__tests__',
])

// Routes the brandstudio theme contract recognises (matches pages.ts in
// recent bespoke themes). We map source routes onto these where the slug
// matches; extra source routes get copied as-is and added to pages.ts.
const KNOWN_ROUTES = new Set([
  'home',
  'about',
  'contact',
  'cookie-policy',
  'privacy-policy',
  'finance',
  'services',
  'sell-your-car',
  'sell-my-car',
  'part-exchange',
  'used-cars',
  'recently-sold',
  'reviews',
  'warranty',
  'compare',
  'wishlist',
])

async function walk(dir, opts = {}) {
  const out = []
  let entries
  try {
    entries = await fs.readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (opts.skipDirs && opts.skipDirs.has(entry.name)) continue
      out.push(...(await walk(full, opts)))
    } else if (entry.isFile()) {
      out.push(full)
    }
  }
  return out
}

// Find every routed page in the source app's app/ tree, normalising to
// { route, abs }. Excludes api/dashboard/login/etc. Handles route groups
// like (content)/<route>/page.tsx by stripping the parenthesised segment.
async function discoverRoutes(appDir) {
  const allFiles = await walk(appDir, { skipDirs: SKIP_APP_DIRS })
  const routes = []
  for (const abs of allFiles) {
    const rel = path.relative(appDir, abs).replace(/\\/g, '/')
    // EXACT match on the basename — `endsWith('page.tsx')` was matching
    // helper files like `lib/vehicle-detail-page.tsx` and mis-classifying
    // them as routes.
    const base = path.basename(rel)
    if (base !== 'page.tsx' && base !== 'page.ts') continue
    // Drop any (group) segments — they're routing-only.
    const parts = rel.split('/').filter((p) => !/^\(.+\)$/.test(p))
    parts.pop() // remove page.tsx
    const route = parts.length === 0 ? 'home' : parts.join('/')
    routes.push({ route, abs, rel })
  }
  return routes
}

// ─────────────────────────────────────────────────────────────────────────────
// import-path rewriter
// ─────────────────────────────────────────────────────────────────────────────

// Rewrites import specifiers in a source-app file so they resolve once the
// file is copied to the theme. The transform pipeline:
//   "@/app/lib/api"            → "<themeRoot>/lib/api"   (strip "app/")
//   "@/components/Foo"         → "<themeRoot>/components/Foo"
//   "@/lib/api"                → "<themeRoot>/lib/api"
//   "./components/Foo"         → "<themeRoot>/components/Foo"   (page-style)
//   "./styles/X.module.css"    → "<themeRoot>/styles/X.module.css"
//
// `relFromTheme` is the file's path *relative to the new theme root*, so we
// can compute the correct number of "../" hops for each target.
//
// The plain "./<themeFolder>/..." rewrite is only applied to non-component
// files because components live inside `components/` and an internal
// `./Sibling` import is still valid in-place.
function rewriteImports(content, relFromTheme) {
  const fileDir = path.dirname(relFromTheme)
  const hopsToThemeRoot = fileDir === '' || fileDir === '.' ? '.' : fileDir.split('/').map(() => '..').join('/')
  const themeRoot = hopsToThemeRoot === '.' ? '.' : hopsToThemeRoot

  // 1. "@/app/<seg>/..." OR "@/<seg>/..." — strip the optional "app/" prefix
  //    (themes have no "app/" folder) and resolve to <themeRoot>/<seg>/...
  let out = content.replace(
    /(['"`])@\/(app\/)?([a-zA-Z0-9_\-/.]+)\1/g,
    (_match, quote, _appPrefix, restPath) => `${quote}${themeRoot}/${restPath}${quote}`,
  )

  // 2. Source apps' homepages sit at app/page.tsx, so they reach siblings via
  //    "./components/Foo" / "./styles/foo.css" / "./lib/bar" / "./data/baz".
  //    Once we move the homepage to pages/home/page.tsx, those siblings
  //    are no longer siblings — they live at the theme root. Rewrite.
  const isInsideComponents = relFromTheme.startsWith('components/')
  if (!isInsideComponents) {
    out = out.replace(
      /(['"`])\.\/(components|styles|lib|data|context|hooks)\/([a-zA-Z0-9_\-/.]+)\1/g,
      (_match, quote, seg, rest) => `${quote}${themeRoot}/${seg}/${rest}${quote}`,
    )
  }

  // 3. Pages at depth 2 (`pages/<route>/X.tsx`) inherited `../<seg>/...`
  //    imports from the source app's `app/<route>/page.tsx`. In the theme
  //    those paths now need TWO `../` hops to reach the theme root, not
  //    one. Rewrite when the file lives two levels deep AND the prefix
  //    has fewer hops than required. Handles both single-segment (depth 2)
  //    and dynamic-route (depth 3) page locations.
  const depth = relFromTheme.split('/').length - 1
  if (depth >= 2) {
    out = out.replace(
      /(['"`])((?:\.\.\/)+)(components|styles|lib|data|context|hooks)\/([a-zA-Z0-9_\-/.]+)\1/g,
      (match, quote, dots, seg, rest) => {
        const currentHops = dots.match(/\.\.\//g).length
        if (currentHops >= depth) return match
        const correctDots = '../'.repeat(depth)
        return `${quote}${correctDots}${seg}/${rest}${quote}`
      },
    )
  }

  return out
}

// ─────────────────────────────────────────────────────────────────────────────
// tokenization
// ─────────────────────────────────────────────────────────────────────────────

// Parse CSS custom property declarations from a stylesheet's :root block.
// Returns Map<varName, value> where value is the rhs of the declaration
// (which may itself be a var() reference — caller should resolve transitively
// if needed). Captures every --foo: <value>; declaration, not just :root —
// brandstudio source apps sometimes declare brand vars under [data-theme]
// selectors too.
function parseCssVars(css) {
  const vars = new Map()
  if (!css) return vars
  const re = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g
  let m
  while ((m = re.exec(css))) {
    const name = m[1].trim()
    const value = m[2].trim()
    if (!vars.has(name)) vars.set(name, value) // first declaration wins
  }
  return vars
}

// Resolve a CSS color expression to a concrete hex literal if possible.
// Handles direct hex, three-channel rgb()/rgba() with numeric values, and
// var(--name) references that bottom out at a hex via the cssVars map.
function resolveToHex(value, cssVars, depth = 0) {
  if (!value || depth > 6) return null
  const v = value.trim()
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v.toLowerCase()
  const varMatch = v.match(/^var\(\s*--([a-zA-Z0-9_-]+)\s*(?:,\s*([^)]+))?\)\s*$/)
  if (varMatch) {
    const next = cssVars.get(varMatch[1].trim())
    if (next) return resolveToHex(next, cssVars, depth + 1)
    if (varMatch[2]) return resolveToHex(varMatch[2].trim(), cssVars, depth + 1)
    return null
  }
  const rgbMatch = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
  if (rgbMatch) {
    const toHex = (n) => Number(n).toString(16).padStart(2, '0')
    return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`
  }
  return null
}

// Build a hex→token replacement map from the DNA palette. The DNA file (from
// extract-theme-dna.mjs) sometimes contains `var(--name)` references where
// the source app stored its colors as CSS custom properties — so we resolve
// each reference through the source's globals.css to get the real hex.
function buildHexTokenMap(dna, cssVars) {
  if (!dna) return new Map()
  const map = new Map()
  const colors = dna.colors || {}
  const vars = cssVars || new Map()
  const add = (raw, token) => {
    if (!raw || typeof raw !== 'string') return
    const hex = resolveToHex(raw, vars)
    if (!hex) return
    const norm = hex.toLowerCase()
    if (!/^#[0-9a-f]{3,8}$/.test(norm)) return
    map.set(norm, token)
    if (norm.length === 4) {
      const expanded = `#${norm[1]}${norm[1]}${norm[2]}${norm[2]}${norm[3]}${norm[3]}`
      map.set(expanded, token)
    }
  }
  // Accept both the extract-theme-dna keys (primary/accent/bg/surface/text/muted)
  // and our internal contract (surfaceMuted/textMuted/heroOverlay).
  add(colors.primary, 'var(--color-primary)')
  add(colors.primaryDark, 'var(--color-primary)')
  add(colors.accent, 'var(--color-accent)')
  add(colors.bg, 'var(--color-surface)')
  add(colors.surface, 'var(--color-surface)')
  add(colors.surfaceMuted, 'var(--color-surface-muted)')
  add(colors.text, 'var(--color-text)')
  add(colors.muted, 'var(--color-text-muted)')
  add(colors.textMuted, 'var(--color-text-muted)')
  add(colors.heroOverlay, 'var(--color-hero-overlay)')
  return map
}

function tokenizeHex(content, hexMap) {
  if (hexMap.size === 0) return { content, replacements: 0 }
  let replacements = 0
  let out = content
  for (const [hex, token] of hexMap) {
    // Replace hex literal as a whole word so "#ff0000aa" doesn't get partially matched.
    const escaped = hex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`${escaped}\\b`, 'gi')
    out = out.replace(regex, () => {
      replacements++
      return token
    })
  }
  return { content: out, replacements }
}

// Wrap any hardcoded font-family declaration in a brand-token fallback.
// Conservative: only touches the "font-family:" property — never the whole
// stylesheet — and leaves declarations that already reference a var() alone.
function tokenizeFonts(content, dna) {
  if (!dna || !dna.fonts) return { content, replacements: 0 }
  const heading = dna.fonts.heading
  const body = dna.fonts.body
  if (!heading && !body) return { content, replacements: 0 }
  let replacements = 0
  const out = content.replace(
    /font-family\s*:\s*([^;{}]+);/g,
    (match, value) => {
      const trimmed = value.trim()
      if (trimmed.includes('var(--font-brand-')) return match
      // Heuristic: if the first family in the stack matches the DNA heading
      // family, wrap it with the heading override; else use body.
      const firstFamily = trimmed.split(',')[0].replace(/['"]/g, '').trim()
      const role = firstFamily === heading ? 'heading' : 'body'
      const token =
        role === 'heading'
          ? `var(--font-brand-family-override, ${trimmed})`
          : `var(--font-brand-body-override, ${trimmed})`
      replacements++
      return `font-family: ${token};`
    },
  )
  return { content: out, replacements }
}

// Rewrite background-image: url(/images/...) declarations to the layered
// brand-token pattern. Source apps hardcode their hero image paths; themes
// must layer the brand override on top of a theme-default fallback so brand
// records can swap the imagery.
function tokenizeImageUrls(content, themeId) {
  let replacements = 0
  const out = content.replace(
    /background-image\s*:\s*url\((['"]?)(\/[^'"\)]+\.(?:jpg|jpeg|png|webp|svg))\1\)\s*;/gi,
    (_m, _q, urlPath) => {
      // Infer slot from filename. Falls back to 'hero' if no hint.
      const filename = path.basename(urlPath).toLowerCase()
      const slot = filename.includes('about')
        ? 'about'
        : filename.includes('service')
          ? 'services'
          : filename.includes('finance')
            ? 'finance'
            : filename.includes('part')
              ? 'partExchange'
              : filename.includes('sell')
                ? 'sellYourCar'
                : filename.includes('sold')
                  ? 'recentlySold'
                  : 'hero'
      replacements++
      // Multi-layer: brand override first, theme default second.
      return (
        `background-image:\n` +
        `    var(--brand-image-${slot}, none),\n` +
        `    url('/themes/${themeId}/images/${slot}.jpg');`
      )
    },
  )
  return { content: out, replacements }
}

// ─────────────────────────────────────────────────────────────────────────────
// theme contract emitters — produce the files brandstudio expects
// alongside the cloned pages/components. Kept compact; the skill's Phase 8
// can flesh these out per dealer if needed.
// ─────────────────────────────────────────────────────────────────────────────

function emitThemeJson(id, displayName, description, dna) {
  // Resolve var() refs back to hex before serializing — JSON consumers
  // (dashboard previewers, registries) can't dereference CSS variables.
  const c = dna?.colors || {}
  const colors = {
    primary: pickHex(c.primary, '#0f6beb'),
    primaryDark: pickHex(c.primaryDark, null) || null,
    accent: pickHex(c.accent, pickHex(c.primary, '#0f6beb')),
    bg: pickHex(c.bg, '#ffffff'),
    surface: pickHex(c.surface, '#f8f9fa'),
    text: pickHex(c.text, '#0f1623'),
    muted: pickHex(c.muted || c.textMuted, '#6b7280'),
    border: pickHex(c.border, '#e5e7eb'),
  }
  return JSON.stringify(
    {
      id,
      name: displayName,
      description,
      status: 'experimental',
      mode: 'app-clone',
      source: {
        app: dna?.source || null,
        clonedAt: new Date().toISOString().slice(0, 10),
      },
      fonts: dna?.fonts || null,
      colors,
    },
    null,
    2,
  ) + '\n'
}

// Map source-app kebab route slugs to brandstudio's ThemePageId enum.
// brandstudio's router can only route enum-keyed pages — any source route
// without a mapped enum slot is kept on disk but NOT registered (the
// resulting orphan won't render, but it also won't break the build).
//
// Special pseudo-mappings:
//  - `used-cars/[id]` and `used-cars/[slug]` → `vehicleDetail`
const SOURCE_ROUTE_TO_ENUM = {
  home: 'home',
  about: 'about',
  contact: 'contact',
  services: 'services',
  'sell-your-car': 'sellYourCar',
  'sell-my-car': 'sellYourCar',
  finance: 'finance',
  'part-exchange': 'partExchange',
  'used-cars': 'usedCars',
  'recently-sold': 'recentlySold',
  compare: 'compare',
  wishlist: 'wishlist',
  'privacy-policy': 'privacyPolicy',
  privacy: 'privacyPolicy',
  'cookie-policy': 'cookiePolicy',
  cookies: 'cookiePolicy',
}

function routeToEnumKey(route) {
  if (route === 'home') return 'home'
  if (route === 'used-cars/[id]' || route === 'used-cars/[slug]') return 'vehicleDetail'
  return SOURCE_ROUTE_TO_ENUM[route] || null
}

function emitPagesTs(routes) {
  // Imports for each route → entry in the pages map. Routes without a
  // brandstudio enum key are deliberately skipped (they stay on disk
  // unregistered; Phase 8 may decide to map or remove them).
  const lines = []
  lines.push(`// Auto-generated by clone-app-to-theme.mjs.`)
  lines.push(`// Source routes mapped to brandstudio's ThemePageRegistry enum (see types.ts).`)
  lines.push(`// Routes without an enum slot are kept on disk but NOT registered — Phase 8`)
  lines.push(`// may map them via the enum or remove the orphan files.`)
  lines.push(`import type { ThemePageRegistry } from '../types'`)
  lines.push(``)

  const mapped = []
  const skipped = []
  for (const r of routes) {
    const enumKey = routeToEnumKey(r.route)
    if (!enumKey) {
      skipped.push(r.route)
      continue
    }
    const exportName = r.route === 'home' ? 'HomePage' : routeToPascal(r.route) + 'Page'
    const importPath = `./pages/${r.route}/page`
    mapped.push({ ...r, enumKey, exportName, importPath })
  }

  for (const r of mapped) {
    lines.push(`import ${r.exportName} from '${r.importPath}'`)
  }
  lines.push(``)
  lines.push(`export const themePages: ThemePageRegistry = {`)
  for (const r of mapped) {
    lines.push(`  ${r.enumKey}: ${r.exportName} as any,`)
  }
  lines.push(`}`)
  lines.push(``)
  if (skipped.length) {
    lines.push(`// Orphan source routes (no brandstudio enum slot): ${skipped.join(', ')}`)
  }
  lines.push(`export default themePages`)
  return lines.join('\n') + '\n'
}

function routeToPascal(route) {
  return route
    .split(/[\/\-]/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join('')
}

function emitShellTsx(id, names) {
  return `'use client'

import AnimateOnScroll from '@/app/widgets/AnimateOnScroll/AnimateOnScroll'
import MotionFX from '@/app/widgets/MotionFX/MotionFX'
import ScrollProgress from '@/app/widgets/ScrollProgress/ScrollProgress'
import PreviewBanner from '@/app/widgets/PreviewBanner/PreviewBanner'
import CookieBanner from '@/app/widgets/CookieBanner/CookieBanner'
import WhatsAppFab from '@/app/widgets/WhatsAppFab/WhatsAppFab'
import type { ThemeShellComponent } from '../types'
import { useBrand } from './context/BrandClientWrapper'
import './styles/base.css'

/**
 * ${names.pascalFull} theme shell. The context registry mounts BrandClientWrapper /
 * BrandStyles / AuthProvider / DynamicFavicon ABOVE this shell — so here we
 * just mount the global widgets and any source-app Header/Footer wiring
 * Phase 8 chooses to add. Renders {children} verbatim.
 */
export const themeShell: ThemeShellComponent = ({ children }) => {
  const brand = useBrand() as any
  return (
    <>
      <PreviewBanner brand={brand} />
      <AnimateOnScroll />
      <MotionFX />
      <ScrollProgress />
      {children}
      <WhatsAppFab brand={brand} />
      <CookieBanner />
    </>
  )
}

export default themeShell
`
}

// Resolve a "color" value from DNA to a literal hex. The DNA tokenizer
// sometimes preserves `var(--name)` refs (when the source CSS used custom
// properties for its palette); those don't resolve outside CSS, so default
// to the supplied fallback for theme.json / tokens.ts / BrandStyles emission.
function pickHex(value, fallback) {
  if (typeof value !== 'string' || !value.trim()) return fallback
  if (/^#[0-9a-fA-F]{3,8}$/.test(value.trim())) return value.trim()
  return fallback
}

function emitTokensTs(id, dna) {
  const c = dna?.colors || {}
  const f = dna?.fonts || {}
  const primary = pickHex(c.primary, '#0f6beb')
  const accent = pickHex(c.accent, primary)
  const surface = pickHex(c.surface, '#ffffff')
  const text = pickHex(c.text, '#0f1623')
  return `// Auto-generated by clone-app-to-theme.mjs from the source app's DNA.
// These are FALLBACK tokens used when no brand record overrides them.
// Brand records may override the brand-triad tokens (primary / accent / hero);
// the neutral surface/text tiers are fixed contracts the theme honours.
import type { ThemeTokenMap } from '../types'

export const themeTokens: ThemeTokenMap = {
  colors: {
    primary: ${JSON.stringify(primary)},
    accent: ${JSON.stringify(accent)},
    surface: ${JSON.stringify(surface)},
    surfaceMuted: ${JSON.stringify(pickHex(c.surfaceMuted, '#f5f5f5'))},
    text: ${JSON.stringify(text)},
    textMuted: ${JSON.stringify(pickHex(c.textMuted, '#6b7280'))},
    heroOverlay: ${JSON.stringify(c.heroOverlay || 'rgba(8,11,28,0.72)')},
  },
  fonts: {
    heading: ${JSON.stringify(f.heading || 'system-ui, sans-serif')},
    body: ${JSON.stringify(f.body || 'system-ui, sans-serif')},
    googleFontsUrl: ${JSON.stringify(f.googleFontsUrl || null)},
  },
}

export default themeTokens
`
}

function emitBrandClientWrapper(id, names) {
  return `'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { BrandConfig } from '@/brands/types'

const ${names.pascalShort}BrandContext = createContext<BrandConfig | null>(null)

export function BrandClientWrapper({ brand, children }: { brand: BrandConfig; children: ReactNode }) {
  return (
    <${names.pascalShort}BrandContext.Provider value={brand}>
      {children}
    </${names.pascalShort}BrandContext.Provider>
  )
}

export function useBrand(): BrandConfig {
  const brand = useContext(${names.pascalShort}BrandContext)
  if (!brand) {
    throw new Error(
      'useBrand must be used within a BrandClientWrapper. The theme context registry ' +
        'mounts the wrapper above the shell.',
    )
  }
  return brand
}
`
}

function emitBrandStyles(id, names, dna) {
  const c = dna?.colors || {}
  const primary = pickHex(c.primary, '#0f6beb')
  const accent = pickHex(c.accent, primary)
  return `'use client'

import type { ReactNode } from 'react'

type Brand = {
  primaryColor?: string
  accentColor?: string
  images?: { hero?: string; about?: string; services?: string; finance?: string; partExchange?: string; sellYourCar?: string; recentlySold?: string }
  heroImage?: string
  [key: string]: unknown
}

const fallback = {
  primary: ${JSON.stringify(primary)},
  accent: ${JSON.stringify(accent)},
}

function pickString(...candidates: Array<string | undefined>): string | undefined {
  for (const c of candidates) if (typeof c === 'string' && c.trim()) return c
  return undefined
}

/**
 * Emits the brand-overridable CSS variables for the ${names.pascalFull} theme.
 * Brand records may override colors + per-slot images; the rest of the token
 * system stays a fixed contract.
 */
export function BrandStyles({ brand }: { brand: Brand }): ReactNode {
  const primary = pickString(brand?.primaryColor, fallback.primary)
  const accent = pickString(brand?.accentColor, fallback.accent)

  const heroImage = pickString(brand?.heroImage, brand?.images?.hero)
  const aboutImage = pickString(brand?.images?.about)
  const servicesImage = pickString(brand?.images?.services)
  const financeImage = pickString(brand?.images?.finance)
  const partExchangeImage = pickString(brand?.images?.partExchange)
  const sellYourCarImage = pickString(brand?.images?.sellYourCar)
  const recentlySoldImage = pickString(brand?.images?.recentlySold)

  const toUrl = (img?: string) => (img ? \`url("\${img}")\` : 'none')

  const style = \`
    [data-theme-id="${id}"] {
      --color-primary: \${primary};
      --color-accent: \${accent};
      --brand-image-hero: \${toUrl(heroImage)};
      --brand-image-about: \${toUrl(aboutImage)};
      --brand-image-services: \${toUrl(servicesImage)};
      --brand-image-finance: \${toUrl(financeImage)};
      --brand-image-partExchange: \${toUrl(partExchangeImage)};
      --brand-image-sellYourCar: \${toUrl(sellYourCarImage)};
      --brand-image-recentlySold: \${toUrl(recentlySoldImage)};
    }
  \`

  return <style dangerouslySetInnerHTML={{ __html: style }} />
}
`
}

// Source apps often use `/sell-your-car`, but brandstudio's canonical
// router slug is `/sell-my-car` (see SKILL.md §"Canonical inner-page
// routes"). Rewrite href / Link / fetch / window.location references so
// the cloned theme's navigation actually resolves. Also fix the common
// trailing-slash hrefs the source apps ship (`/used-cars/` → `/used-cars`)
// which break Next-router matching for the theme's registered routes.
function tokenizeRoutes(content) {
  let out = content
  let count = 0
  // /sell-your-car → /sell-my-car (any quoting, with or without trailing /)
  const sellRe = /(['"`])\/sell-your-car(\/)?(['"`])/g
  out = out.replace(sellRe, (m, q1, slash, q2) => {
    count++
    return `${q1}/sell-my-car${q2}`
  })
  // Trailing-slash hrefs for top-level nav slugs that brandstudio routes
  // without the slash. Only strip when followed by closing quote.
  const TOP_LEVEL_SLUGS = [
    'about',
    'contact',
    'services',
    'finance',
    'part-exchange',
    'used-cars',
    'recently-sold',
    'compare',
    'wishlist',
    'privacy-policy',
    'cookie-policy',
  ]
  for (const slug of TOP_LEVEL_SLUGS) {
    const re = new RegExp(`(['"\`])\\/${slug}\\/(['"\`])`, 'g')
    out = out.replace(re, (m, q1, q2) => {
      count++
      return `${q1}/${slug}${q2}`
    })
  }
  return { content: out, replacements: count }
}

function emitSectionsIndex() {
  return `// Empty section registry — app-clone themes render through Next page
// components (per-page composition), not through the dashboard's section
// recipe system. The contract requires this file to exist; the dashboard's
// recipe tab for this theme will simply show no editable sections.
import type { ThemeSectionRegistry } from '../../types'

export const themeSections: ThemeSectionRegistry = {}

export default themeSections
`
}

function emitRecipesIndex() {
  return `// Empty recipe registry — app-clone themes don't use the section/recipe
// system. The contract requires this file to exist; an empty registry is
// the explicit "no recipes" signal.
import type { ThemeRecipeRegistry } from '../../types'

export const themeRecipes: ThemeRecipeRegistry = {}

export default themeRecipes
`
}

function emitAuthContext() {
  return `'use client';

// Stub AuthProvider for app-clone themes — auth pages live outside theme
// boundaries; this stub satisfies the theme context-registry contract.
import { createContext, useContext, type ReactNode } from 'react';

interface User {
  id: number | string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (u: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: AuthContextType = {
    user: null,
    loading: false,
    login: () => {},
    logout: () => {},
    isAuthenticated: false,
    isAdmin: false,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
`
}

function emitDynamicFavicon() {
  return `'use client'

import { useEffect } from 'react'
import { useBrand } from './BrandClientWrapper'

/**
 * Mounts <link rel="icon"> tags pointing at the right favicon for the
 * current brand. Resolution order:
 *   1. brand.favicon              — operator-set override per brand
 *   2. /themes/<theme-id>/favicon.svg — per-theme SVG mark (if shipped)
 *   3. brand.logo                 — fallback to the dealer's full logo
 *   4. /favicon.ico               — root brandstudio default
 */
export const DynamicFavicon: React.FC = () => {
  const brand = useBrand()

  useEffect(() => {
    const themeId =
      (brand as any)?.themeId ||
      (brand as any)?.theme?.themeId ||
      (brand as any)?.theme?.id ||
      ''
    const themeFavicon = themeId ? \`/themes/\${themeId}/favicon.svg\` : ''
    const faviconUrl =
      (brand as any)?.favicon ||
      themeFavicon ||
      (brand as any)?.logo ||
      '/favicon.ico'
    const timestamp = Date.now()
    const urlWithTimestamp = String(faviconUrl).includes('?')
      ? \`\${faviconUrl}&t=\${timestamp}\`
      : \`\${faviconUrl}?t=\${timestamp}\`

    const faviconElements = [
      ...document.querySelectorAll("link[rel='icon']"),
      ...document.querySelectorAll("link[rel='shortcut icon']"),
      ...document.querySelectorAll("link[rel='apple-touch-icon']"),
    ]

    if (faviconElements.length === 0) {
      const createLink = (rel: string) => {
        const link = document.createElement('link')
        link.rel = rel
        link.href = urlWithTimestamp
        if (urlWithTimestamp.includes('/favicon.svg')) link.type = 'image/svg+xml'
        document.head.appendChild(link)
      }
      createLink('icon')
      createLink('shortcut icon')
      createLink('apple-touch-icon')
    } else {
      faviconElements.forEach((el) => {
        el.setAttribute('href', urlWithTimestamp)
        if (urlWithTimestamp.includes('/favicon.svg')) el.setAttribute('type', 'image/svg+xml')
      })
    }
  }, [(brand as any)?.favicon, (brand as any)?.logo, (brand as any)?.themeId, (brand as any)?.theme?.themeId, (brand as any)?.theme?.id])

  return null
}

export default DynamicFavicon
`
}

// ─────────────────────────────────────────────────────────────────────────────
// follow-ups detector — scan cloned files for things the tool can't auto-fix
// ─────────────────────────────────────────────────────────────────────────────

const WORKSPACE_IMPORT_REGEX = /from\s+['"]@carous\/([a-z0-9\-]+)['"]/g
const HOOK_IMPORT_REGEX = /from\s+['"](\.\.\/)+hooks\//g
const DATA_IMPORT_REGEX = /from\s+['"](\.\.\/)+data\//g
const API_FETCH_REGEX = /fetch\(\s*['"`]\/api\//g

function scanForFollowups(files) {
  const followups = {
    workspacePackages: new Set(),
    hookImports: [],
    dataImports: [],
    apiFetches: [],
  }
  for (const { content, rel } of files) {
    let m
    WORKSPACE_IMPORT_REGEX.lastIndex = 0
    while ((m = WORKSPACE_IMPORT_REGEX.exec(content))) {
      followups.workspacePackages.add(m[1])
    }
    HOOK_IMPORT_REGEX.lastIndex = 0
    if (HOOK_IMPORT_REGEX.test(content)) followups.hookImports.push(rel)
    DATA_IMPORT_REGEX.lastIndex = 0
    if (DATA_IMPORT_REGEX.test(content)) followups.dataImports.push(rel)
    API_FETCH_REGEX.lastIndex = 0
    if (API_FETCH_REGEX.test(content)) followups.apiFetches.push(rel)
  }
  return followups
}

function emitFollowupChecklist(id, source, followups, routes, componentCount) {
  const lines = []
  lines.push(`# Clone follow-ups — ${id}`)
  lines.push(``)
  lines.push(`Cloned from \`apps/${source}\`.`)
  lines.push(``)
  lines.push(`- Pages copied: ${routes.length}`)
  lines.push(`- Components copied: ${componentCount}`)
  lines.push(``)
  lines.push(`## What still needs Phase 8 attention`)
  lines.push(``)
  if (followups.workspacePackages.size > 0) {
    lines.push(`### Workspace package imports`)
    lines.push(``)
    lines.push(`The cloned files import from these \`@carous/*\` workspace packages:`)
    lines.push(``)
    for (const pkg of [...followups.workspacePackages].sort()) {
      lines.push(`- \`@carous/${pkg}\``)
    }
    lines.push(``)
    lines.push(`Brandstudio doesn't carry these packages by default. For each:`)
    lines.push(`(a) replace with an in-tree brandstudio equivalent if one exists`)
    lines.push(`(b) inline the needed code into \`lib/\` or a co-located component`)
    lines.push(`(c) add the package to brandstudio's dependencies if it's published.`)
    lines.push(``)
  }
  if (followups.hookImports.length > 0) {
    lines.push(`### Hook imports (source app's \`hooks/\` was not copied)`)
    lines.push(``)
    lines.push(`The following cloned files import from \`hooks/\` — that folder isn't part`)
    lines.push(`of the theme contract. Either inline the hook into the component or move`)
    lines.push(`it to \`lib/\`:`)
    lines.push(``)
    for (const f of followups.hookImports) lines.push(`- \`${f}\``)
    lines.push(``)
  }
  if (followups.dataImports.length > 0) {
    lines.push(`### Hardcoded dealer profile imports (\`data/\`)`)
    lines.push(``)
    lines.push(`The source app stored its dealer-specific config (name, address, phone,`)
    lines.push(`opening hours, services blurbs) under \`data/\` and components imported it`)
    lines.push(`directly. The cloner copied \`data/\` verbatim so the theme COMPILES, but`)
    lines.push(`to make the theme "highly configurable like the usual preview themes"`)
    lines.push(`each \`data/<file>\` reference should be replaced with a read from the`)
    lines.push(`brand record (\`useBrand()\` client-side, \`brand\` prop server-side):`)
    lines.push(``)
    lines.push(`- \`brand.name\`, \`brand.tagline\``)
    lines.push(`- \`brand.location.address\`, \`brand.location.phone\``)
    lines.push(`- \`brand.openingHours\``)
    lines.push(`- \`brand.services\`, \`brand.heroImage\`, etc.`)
    lines.push(``)
    lines.push(`Files to rewire:`)
    lines.push(``)
    for (const f of followups.dataImports) lines.push(`- \`${f}\``)
    lines.push(``)
  }
  if (followups.apiFetches.length > 0) {
    lines.push(`### Direct \`fetch('/api/...')\` calls`)
    lines.push(``)
    lines.push(`Source-app data fetches resolve to its own \`api/\` routes — those don't`)
    lines.push(`exist in brandstudio. Rewire each to brandstudio's shared API surface`)
    lines.push(`(\`apiUrl(\`/inventory?brand=\${brand.slug}\`)\` etc.) or to a server-side`)
    lines.push(`equivalent. Files to update:`)
    lines.push(``)
    for (const f of followups.apiFetches) lines.push(`- \`${f}\``)
    lines.push(``)
  }
  lines.push(`## Phase-8 polish targets`)
  lines.push(``)
  lines.push(`- Verify the cloned hero / footer / CTA respect the queensbury-era`)
  lines.push(`  lessons (Pitfalls catalogue rows 40 / 41 / 42): no \`flex-wrap: wrap\``)
  lines.push(`  on marquee reduced-motion fallbacks, primary CTAs are full-bleed + centered,`)
  lines.push(`  card rails never use \`repeat(N, 1fr)\` where N may be exceeded.`)
  lines.push(`- Run \`npm run theme:sync\` then \`npx tsc --noEmit | grep themes/${id}\` —`)
  lines.push(`  resolve type errors before Phase 10.`)
  lines.push(`- Run \`node tools/audit-theme.mjs --id ${id}\` and address blockers.`)
  lines.push(`- Decide whether to opt this theme out of the cross-theme similarity check`)
  lines.push(`  — clones are intentionally similar to their source app, so the peer pass`)
  lines.push(`  should ignore themes whose \`theme.json.mode === 'app-clone'\`.`)
  lines.push(``)
  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// extract DNA — delegates to extract-theme-dna.mjs so we share its parser
// ─────────────────────────────────────────────────────────────────────────────

async function extractDnaFor(source, appsRoot) {
  const dnaPath = path.join(DNA_DIR, `${source}.json`)
  await fs.mkdir(DNA_DIR, { recursive: true })
  const result = spawnSync(
    process.execPath,
    [path.join(TOOLS_DIR, 'extract-theme-dna.mjs'), '--source', source, '--apps', appsRoot, '--out', dnaPath],
    { encoding: 'utf8' },
  )
  if (result.status !== 0) {
    console.warn(`! extract-theme-dna.mjs exited ${result.status}; tokenization will use empty DNA`)
    console.warn(result.stderr || result.stdout || '(no output)')
    return null
  }
  try {
    const raw = await fs.readFile(dnaPath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// main
// ─────────────────────────────────────────────────────────────────────────────

const TEXT_EXT = new Set(['.tsx', '.ts', '.jsx', '.js', '.css', '.module.css', '.json', '.md', '.svg'])
function isText(filePath) {
  return TEXT_EXT.has(path.extname(filePath).toLowerCase())
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const source = args.source
  if (!source || source === true) {
    console.error('Missing --source <app-folder>. Example: --source lancashirecarsalesltd')
    process.exit(1)
  }
  const themeId = args.target && args.target !== true ? String(args.target) : defaultThemeId(source)
  validateId(themeId)
  const displayName = args.name && args.name !== true ? String(args.name) : `${routeToPascal(source)} (clone)`
  const description = args.description && args.description !== true
    ? String(args.description)
    : `Page-for-page clone of carous-platform app \`${source}\`, tokenized for brand overrides.`
  const tokenize = args['no-tokenize'] !== true
  const dryRun = args['dry-run'] === true

  const appsRoot = resolveAppsRoot(args.apps === true ? null : args.apps)
  if (!appsRoot) {
    console.error('Could not locate carous-platform/apps. Tried:')
    console.error('  --apps CLI arg, $CAROUS_PLATFORM_APPS, ../carous-platform/apps, ../../carous-platform/apps')
    process.exit(1)
  }
  const sourceApp = path.join(appsRoot, source, 'app')
  if (!existsSync(sourceApp)) {
    console.error(`Source app not found: ${sourceApp}`)
    process.exit(1)
  }
  const targetTheme = path.join(THEMES_ROOT, themeId)
  if (existsSync(targetTheme) && !dryRun) {
    console.error(`Target theme folder already exists: ${targetTheme}`)
    console.error('Delete it first or pick a different --target.')
    process.exit(1)
  }

  const names = namesFor(themeId)
  const dna = tokenize ? await extractDnaFor(source, appsRoot) : null
  // Source apps store their brand palette as CSS custom properties; the DNA
  // file may carry var(--name) references rather than direct hex. Pre-parse
  // globals.css so the hex map can resolve them.
  let cssVars = new Map()
  const globalsForVars = path.join(sourceApp, 'globals.css')
  if (existsSync(globalsForVars)) {
    try {
      const css = await fs.readFile(globalsForVars, 'utf8')
      cssVars = parseCssVars(css)
    } catch {
      /* fall through with empty vars */
    }
  }
  const hexMap = buildHexTokenMap(dna, cssVars)

  // Discover what to clone.
  const routes = await discoverRoutes(sourceApp)
  if (routes.length === 0) {
    console.error(`No routed pages found under ${sourceApp}. Aborting.`)
    process.exit(1)
  }

  const componentDir = path.join(sourceApp, 'components')
  const componentFiles = existsSync(componentDir) ? await walk(componentDir) : []
  const stylesDir = path.join(sourceApp, 'styles')
  const styleFiles = existsSync(stylesDir) ? await walk(stylesDir) : []
  const libDir = path.join(sourceApp, 'lib')
  const libFiles = existsSync(libDir) ? await walk(libDir) : []
  // Source apps store their hardcoded dealer profile under app/data/ (e.g.
  // data/profile.ts → companyProfile). We copy it verbatim so the cloned
  // theme compiles, and flag it for Phase 8 to rewire to the brand record.
  const dataDir = path.join(sourceApp, 'data')
  const dataFiles = existsSync(dataDir) ? await walk(dataDir) : []
  // Source apps' hooks/ aren't part of the theme contract, but pages and
  // page-sibling clients reference them. Copy verbatim so imports resolve;
  // Phase 8 may inline / rewire to brandstudio's @/app/hooks/.
  const hooksDir = path.join(sourceApp, 'hooks')
  const hookFiles = existsSync(hooksDir) ? await walk(hooksDir) : []
  // Same story for context/<other>Context.tsx. We need WishlistContext,
  // CompareContext, etc. on disk so wrappers compile. The Brand* + Auth +
  // DynamicFavicon stubs are emitted separately.
  const contextDir = path.join(sourceApp, 'context')
  const contextFiles = existsSync(contextDir) ? await walk(contextDir) : []

  // Plan the writes — build (sourceAbs, themeRel) pairs.
  const plan = []
  for (const r of routes) {
    plan.push({ src: r.abs, themeRel: `pages/${r.route}/page.tsx`, kind: 'page' })
    // Pull in co-located client components AND module.css next to the source
    // page. Source apps like cnhcars place UsedCarsPageClient.tsx /
    // WishlistPageClient.tsx beside page.tsx — those must come along or the
    // page imports break.
    const srcDir = path.dirname(r.abs)
    const coLocated = (await fs.readdir(srcDir)).filter(
      (n) =>
        n.endsWith('.module.css') ||
        n.endsWith('Island.tsx') ||
        n.endsWith('Mount.tsx') ||
        n.endsWith('Client.tsx'),
    )
    for (const co of coLocated) {
      plan.push({ src: path.join(srcDir, co), themeRel: `pages/${r.route}/${co}`, kind: 'page-asset' })
    }
  }
  for (const abs of componentFiles) {
    const rel = path.relative(componentDir, abs).replace(/\\/g, '/')
    plan.push({ src: abs, themeRel: `components/${rel}`, kind: 'component' })
  }
  for (const abs of styleFiles) {
    const rel = path.relative(stylesDir, abs).replace(/\\/g, '/')
    plan.push({ src: abs, themeRel: `styles/${rel}`, kind: 'style' })
  }
  for (const abs of libFiles) {
    const rel = path.relative(libDir, abs).replace(/\\/g, '/')
    plan.push({ src: abs, themeRel: `lib/${rel}`, kind: 'lib' })
  }
  for (const abs of dataFiles) {
    const rel = path.relative(dataDir, abs).replace(/\\/g, '/')
    plan.push({ src: abs, themeRel: `data/${rel}`, kind: 'data' })
  }
  for (const abs of hookFiles) {
    const rel = path.relative(hooksDir, abs).replace(/\\/g, '/')
    plan.push({ src: abs, themeRel: `hooks/${rel}`, kind: 'hook' })
  }
  // Source-app context files MINUS the ones we generate stubs for
  // (BrandClientWrapper, BrandStyles, AuthContext, DynamicFavicon).
  const STUBBED_CONTEXT = new Set([
    'BrandClientWrapper.tsx',
    'BrandStyles.tsx',
    'AuthContext.tsx',
    'DynamicFavicon.tsx',
  ])
  for (const abs of contextFiles) {
    const rel = path.relative(contextDir, abs).replace(/\\/g, '/')
    if (STUBBED_CONTEXT.has(path.basename(rel))) continue
    plan.push({ src: abs, themeRel: `context/${rel}`, kind: 'context' })
  }

  // Pull globals.css → styles/base.css (themes use base.css convention).
  const globalsCss = path.join(sourceApp, 'globals.css')
  if (existsSync(globalsCss)) {
    plan.push({ src: globalsCss, themeRel: 'styles/base.css', kind: 'globals' })
  }

  console.log(`Cloning ${source} → themes/${themeId}`)
  console.log(`  source app:    ${sourceApp}`)
  console.log(`  target theme:  ${targetTheme}`)
  console.log(`  routes:        ${routes.length} (${routes.map((r) => r.route).join(', ')})`)
  console.log(`  components:    ${componentFiles.length}`)
  console.log(`  styles:        ${styleFiles.length}`)
  console.log(`  lib helpers:   ${libFiles.length}`)
  console.log(`  data files:    ${dataFiles.length} (hardcoded dealer info — Phase 8 should rewire to brand record)`)
  console.log(`  tokenize:      ${tokenize ? 'yes' : 'no'} (hex map: ${hexMap.size} entries)`)
  if (dryRun) {
    console.log(`  DRY RUN — nothing will be written.`)
    process.exit(0)
  }

  // Write the cloned + transformed files.
  const writtenFiles = []
  let totalHexReplacements = 0
  let totalFontReplacements = 0
  let totalImageReplacements = 0
  let totalRouteReplacements = 0

  for (const step of plan) {
    let content
    try {
      content = await fs.readFile(step.src, 'utf8')
    } catch (err) {
      console.warn(`  ! skip (read failed): ${step.src} — ${err.message}`)
      continue
    }
    if (isText(step.src)) {
      content = rewriteImports(content, step.themeRel)
      if (tokenize) {
        const ext = path.extname(step.themeRel).toLowerCase()
        if (ext === '.css' || ext === '.module.css' || step.themeRel.endsWith('.module.css')) {
          const hex = tokenizeHex(content, hexMap)
          content = hex.content
          totalHexReplacements += hex.replacements
          const fonts = tokenizeFonts(content, dna)
          content = fonts.content
          totalFontReplacements += fonts.replacements
          const imgs = tokenizeImageUrls(content, themeId)
          content = imgs.content
          totalImageReplacements += imgs.replacements
        }
        if (ext === '.tsx' || ext === '.ts' || ext === '.jsx' || ext === '.js') {
          // Rewrite source-app route hrefs to brandstudio canonical slugs
          // (most importantly /sell-your-car → /sell-my-car).
          const rt = tokenizeRoutes(content)
          content = rt.content
          totalRouteReplacements += rt.replacements
        }
      }
    }
    const outAbs = path.join(targetTheme, step.themeRel)
    await fs.mkdir(path.dirname(outAbs), { recursive: true })
    await fs.writeFile(outAbs, content)
    writtenFiles.push({ rel: step.themeRel, content })
  }

  // Emit the theme contract files.
  const contracts = [
    { rel: 'theme.json', content: emitThemeJson(themeId, displayName, description, { ...dna, source }) },
    { rel: 'pages.ts', content: emitPagesTs(routes) },
    { rel: 'shell.tsx', content: emitShellTsx(themeId, names) },
    { rel: 'tokens.ts', content: emitTokensTs(themeId, dna) },
    { rel: 'context/BrandClientWrapper.tsx', content: emitBrandClientWrapper(themeId, names) },
    { rel: 'context/BrandStyles.tsx', content: emitBrandStyles(themeId, names, dna) },
    { rel: 'context/AuthContext.tsx', content: emitAuthContext() },
    { rel: 'context/DynamicFavicon.tsx', content: emitDynamicFavicon() },
    { rel: 'sections/index.tsx', content: emitSectionsIndex() },
    { rel: 'recipes/index.ts', content: emitRecipesIndex() },
  ]
  for (const c of contracts) {
    const outAbs = path.join(targetTheme, c.rel)
    await fs.mkdir(path.dirname(outAbs), { recursive: true })
    await fs.writeFile(outAbs, c.content)
    writtenFiles.push({ rel: c.rel, content: c.content })
  }

  // Emit the follow-up checklist.
  const followups = scanForFollowups(writtenFiles.filter((f) => isText(f.rel)))
  const checklist = emitFollowupChecklist(themeId, source, followups, routes, componentFiles.length)
  const checklistAbs = path.join(targetTheme, `CLONE_FOLLOWUPS.md`)
  await fs.writeFile(checklistAbs, checklist)

  console.log(``)
  console.log(`✓ Theme scaffolded at app/themes/${themeId}`)
  console.log(`  hex tokens applied:   ${totalHexReplacements}`)
  console.log(`  font tokens applied:  ${totalFontReplacements}`)
  console.log(`  image tokens applied: ${totalImageReplacements}`)
  console.log(`  route slugs rewritten:${totalRouteReplacements}`)
  console.log(`  follow-ups checklist: app/themes/${themeId}/CLONE_FOLLOWUPS.md`)
  console.log(``)
  console.log(`Next steps:`)
  console.log(`  1. npm run theme:sync                         # register the new theme`)
  console.log(`  2. npx tsc --noEmit 2>&1 | grep themes/${themeId}  # fix any type errors`)
  console.log(`  3. node tools/audit-theme.mjs --id ${themeId}      # resolve audit blockers`)
  console.log(`  4. Read CLONE_FOLLOWUPS.md and resolve the listed items.`)
}

main().catch((err) => {
  console.error(err.stack || err.message || String(err))
  process.exit(1)
})
