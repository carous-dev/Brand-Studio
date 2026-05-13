#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * tools/create-preview.mjs — remotely create a Brand Studio preview.
 *
 * Designed to be invoked by the `/new-theme` skill (or manually) after a theme
 * has been pushed and deployed. Posts a JSON brand payload to the production
 * API and prints the resulting preview URL.
 *
 * Usage:
 *   node tools/create-preview.mjs \
 *     --slug kain-motors \
 *     --theme kain-motors-bespoke \
 *     --name "Kain Motors" \
 *     --domain kainmotors.co.uk \
 *     --hex "#86744e" \
 *     --logo "https://kainmotors.co.uk/logo.png" \
 *     --phone "+44 161 399 0508" \
 *     --email "info@kainmotors.co.uk" \
 *     --address-line1 "Midlands Street" \
 *     --city Manchester \
 *     --postcode "M12 6LB" \
 *     --ai \
 *     --context "Manchester appointment-only used-car and van dealer..." \
 *     --website "https://kainmotors.co.uk"
 *
 * Required env vars:
 *   BRANDSTUDIO_API_URL  e.g. "https://brandstudio.carous.co.uk"
 *   BRANDSTUDIO_API_KEY  long random string, must match server config
 *
 * Optional env vars:
 *   PREVIEW_BASE_DOMAIN  the server uses this to compose URLs if no domain
 *                        is provided (e.g. "carouspreviews.co.uk")
 *
 * Retry policy:
 *   The endpoint returns 404 + code:"theme_not_deployed" when the theme code
 *   hasn't reached production yet. This script retries every 30s up to 10
 *   times by default (override with --retries / --retry-delay).
 */

import { parseArgs } from 'node:util'
import { readFileSync } from 'node:fs'

const ARG_SPEC = {
  // Required
  slug:           { type: 'string' },
  theme:          { type: 'string' },   // theme id (slug)
  name:           { type: 'string' },
  // Common
  domain:         { type: 'string' },
  tagline:        { type: 'string' },
  hex:            { type: 'string' },   // brand-primary hex
  logo:           { type: 'string' },
  favicon:        { type: 'string' },
  hero:           { type: 'string' },   // hero image URL
  phone:          { type: 'string' },
  email:          { type: 'string' },
  // Address parts
  'address-line1':{ type: 'string' },
  'address-line2':{ type: 'string' },
  city:           { type: 'string' },
  county:         { type: 'string' },
  postcode:       { type: 'string' },
  // AI
  ai:             { type: 'boolean' },
  context:        { type: 'string' },
  website:        { type: 'string' },
  // Behavior
  force:          { type: 'boolean' },  // overwrite existing slug
  'brand-json':   { type: 'string' },   // path to a pre-built brand JSON to send as-is
  retries:        { type: 'string' },   // default 10
  'retry-delay':  { type: 'string' },   // seconds, default 30
  // Plumbing
  'api-url':      { type: 'string' },
  'api-key':      { type: 'string' },
  help:           { type: 'boolean', short: 'h' },
}

function printHelp() {
  console.log(`
Usage: node tools/create-preview.mjs [options]

Required:
  --slug <slug>          Preview slug (lowercase, hyphens). Auto-derived from --name if omitted.
  --theme <id>           Theme id (must be deployed). e.g. "kain-motors-bespoke"
  --name <name>          Brand display name.

Contact + content:
  --domain <url>         Production domain (kainmotors.co.uk).
  --tagline <text>       Short brand tagline.
  --hex <#hex>           Brand-primary colour. Required for accurate token colouring.
  --logo <url|path>      Logo URL (or local path — server will store a relative path).
  --favicon <url|path>   Favicon URL.
  --hero <url|path>      Hero image URL.
  --phone <tel>          Phone number (UK format ok).
  --email <addr>         Contact email.

Address (use whichever parts are known):
  --address-line1 <text>
  --address-line2 <text>
  --city <text>
  --county <text>
  --postcode <text>

AI auto-fill (optional but recommended):
  --ai                   Enable OpenAI auto-fill for brand.text from theme recipe.
  --context <text>       Free-text description of the dealer for the AI.
  --website <url>        Dealer site URL — the AI uses it as a context hint.

Behavior:
  --force                Overwrite an existing preview with the same slug.
  --brand-json <path>    Send a pre-built brand JSON instead of building from flags.
                         If provided, all the --name/--domain/etc flags are ignored
                         (use to round-trip a manually-edited brand record).
  --retries <n>          Max retries when theme not yet deployed (default 10).
  --retry-delay <s>      Seconds between retries (default 30).

Plumbing:
  --api-url <url>        Override BRANDSTUDIO_API_URL env var.
  --api-key <key>        Override BRANDSTUDIO_API_KEY env var.
  -h, --help             Show this message.
`)
}

function parseColor(hex) {
  if (typeof hex !== 'string') return null
  const normalized = hex.trim().toLowerCase()
  if (!/^#[0-9a-f]{6}$/.test(normalized)) return null
  return normalized
}

function buildBrandPayload(flags) {
  const slug = (flags.slug || '').trim().toLowerCase() ||
    String(flags.name || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!slug) throw new Error('--slug or --name is required to derive a slug.')

  const addressParts = {
    line1:    flags['address-line1'] || '',
    line2:    flags['address-line2'] || '',
    city:     flags.city || '',
    county:   flags.county || '',
    postcode: flags.postcode || '',
  }
  const compactAddress = Object.fromEntries(
    Object.entries(addressParts).filter(([, v]) => typeof v === 'string' && v.trim().length > 0),
  )

  const primary = parseColor(flags.hex)
  const themeColors = primary ? { primaryColor: primary, accentColor: primary } : undefined

  const brand = {
    name: flags.name || '',
    slug,
    tagline: flags.tagline || '',
    domain: flags.domain || '',
    logo: flags.logo || '',
    favicon: flags.favicon || '',
    heroImage: flags.hero || '',
    location: {
      phone: flags.phone || '',
      email: flags.email || '',
      address: compactAddress,
      city: compactAddress.city || '',
      postcode: compactAddress.postcode || '',
    },
    socialLinks: {},
    theme: themeColors ? { colors: themeColors } : {},
    images: {},
    text: {},
  }
  return brand
}

function loadBrandJson(path) {
  const raw = readFileSync(path, 'utf8')
  const parsed = JSON.parse(raw)
  if (parsed && typeof parsed === 'object' && parsed.brand) return parsed.brand
  return parsed
}

async function postPreviewOnce(apiUrl, apiKey, body, force) {
  const qs = force ? '?force=true' : ''
  const res = await fetch(`${apiUrl.replace(/\/+$/, '')}/api/v1/preview/create${qs}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  })
  let json = null
  try { json = await res.json() } catch (_) { /* leave null */ }
  return { status: res.status, ok: res.ok, body: json }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  const { values: flags } = parseArgs({ options: ARG_SPEC, allowPositionals: false })
  if (flags.help) { printHelp(); return 0 }

  const apiUrl = (flags['api-url'] || process.env.BRANDSTUDIO_API_URL || '').trim()
  const apiKey = (flags['api-key'] || process.env.BRANDSTUDIO_API_KEY || '').trim()
  if (!apiUrl) { console.error('ERR: BRANDSTUDIO_API_URL is not set (or --api-url not provided).'); return 2 }
  if (!apiKey) { console.error('ERR: BRANDSTUDIO_API_KEY is not set (or --api-key not provided).'); return 2 }
  if (!flags.theme) { console.error('ERR: --theme <id> is required.'); return 2 }

  let brand
  if (flags['brand-json']) {
    brand = loadBrandJson(flags['brand-json'])
    if (!brand?.slug && flags.slug) brand.slug = flags.slug
  } else {
    brand = buildBrandPayload(flags)
  }

  const body = {
    themeId: flags.theme,
    brand,
    ai: flags.ai
      ? { enabled: true, context: flags.context || '', website: flags.website || '' }
      : { enabled: false },
  }

  const maxRetries = Math.max(0, parseInt(flags.retries || '10', 10) || 0)
  const retryDelay = Math.max(1, parseInt(flags['retry-delay'] || '30', 10) || 30)

  console.log(`→ POST ${apiUrl}/api/v1/preview/create  (slug=${brand.slug}, theme=${flags.theme}, ai=${!!flags.ai})`)

  let attempt = 0
  while (true) {
    attempt += 1
    const result = await postPreviewOnce(apiUrl, apiKey, body, !!flags.force)

    if (result.ok && result.body?.ok) {
      console.log('✔ Preview created successfully.')
      console.log(`  Slug:        ${result.body.slug}`)
      console.log(`  Theme:       ${result.body.themeId}`)
      console.log(`  URL:         ${result.body.url || '(URL pending — check dashboard)'}`)
      console.log(`  Overwrote:   ${result.body.overwritten ? 'yes' : 'no'}`)
      console.log(`  AI filled:   ${result.body.aiPopulated ? 'yes' : 'no'}`)
      if (result.body.aiError) console.log(`  AI error:    ${result.body.aiError}`)
      return 0
    }

    const code = result.body?.code
    const msg = result.body?.error || `HTTP ${result.status}`

    // Theme not yet deployed → retry with backoff
    if (result.status === 404 && code === 'theme_not_deployed' && attempt <= maxRetries) {
      console.log(`… Theme not deployed yet (attempt ${attempt}/${maxRetries}). Retrying in ${retryDelay}s…`)
      await sleep(retryDelay * 1000)
      continue
    }

    // Slug conflict → tell the operator to retry with --force
    if (result.status === 409) {
      console.error(`✘ ${msg}`)
      console.error('  Pass --force to overwrite the existing preview.')
      return 3
    }

    // Auth failure
    if (result.status === 401 || result.status === 503) {
      console.error(`✘ ${msg}`)
      console.error('  Check BRANDSTUDIO_API_KEY matches the server config and the endpoint is enabled.')
      return 4
    }

    console.error(`✘ Preview creation failed (HTTP ${result.status}): ${msg}`)
    if (result.body && typeof result.body === 'object') {
      console.error('  Server payload:', JSON.stringify(result.body, null, 2))
    }
    return 5
  }
}

main().then(
  (code) => process.exit(typeof code === 'number' ? code : 0),
  (err) => { console.error('UNCAUGHT:', err?.stack || err); process.exit(99) },
)
