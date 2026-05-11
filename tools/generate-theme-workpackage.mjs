#!/usr/bin/env node
/**
 * generate-theme-workpackage.mjs
 *
 * Phase 7.5c work-package generator. After the skeleton is scaffolded but
 * before Phase 8 (design surfaces) starts, this tool emits a checklist of
 * every file/component Phase 8 must redesign. Claude reads the JSON into
 * TodoWrite so Phase 8 has a definition of done.
 *
 * Inputs come from three sources:
 *   1. The scaffolder's STUB_FILES — pages and shell components that ship
 *      as type-safe placeholders and need fresh designs.
 *   2. The scaffolder's KEEP_PATTERNS — files kept from the springalls-classic
 *      baseline (mostly inventory data-layer logic) whose presentation
 *      layer still must be redesigned per archetype.
 *   3. The archetype spec from docs/theme-archetype-specs.md — the
 *      "Components Phase 8 must redesign" list for the theme's archetype.
 *   4. The detail-page contract from docs/inventory-design-library.md —
 *      sections every vehicle detail page must include.
 *   5. Always-required Quality Bar items (PreviewBanner mount, Carous
 *      credit, Home link in nav, per-theme CookieBanner, etc.).
 *
 * Output: tools/.theme-work/<id>.json (a flat array of items, each with
 * an id, kind, title, file path, description, and references).
 *
 * Usage:
 *   node tools/generate-theme-workpackage.mjs --id <theme-id> --dna <dna.json>
 *   node tools/generate-theme-workpackage.mjs --id <theme-id> --dna <dna.json> --out <path>
 *
 * Exit codes:
 *   0  work package written
 *   1  invalid input / theme missing
 *   2  unrecognized archetype
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')
const THEMES_ROOT = path.join(PROJECT_ROOT, 'app', 'themes')
const WORKPKG_DIR = path.join(TOOLS_DIR, '.theme-work')

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

// Mirrors scaffold-theme-skeleton.mjs::STUB_FILES (kept in sync by hand —
// the list is stable). Each stub is a file that ships as a typed placeholder
// and needs Phase 8 design work.
const STUB_ITEMS = [
  { path: 'components/Shell.tsx', title: 'Shell layout — mount sequence', notes: 'Must mount PreviewBanner ABOVE Header (brandstudio-global widget @/app/widgets/PreviewBanner). Per-theme CookieBanner if not using the global widget. WhatsAppFab. AOS init.' },
  { path: 'components/Header.tsx', title: 'Header — nav, top-bar, mobile overlay', notes: 'Top contact bar (PreviewBanner above; location chip + live-stock pulsing chip + social icons from brand.socialLinks + phone CTA). NAV_ITEMS[0] = { label: "Home", href: "/" }. Header background visible (no transparent default). Mobile overlay nav surfaces social icons + phone.' },
  { path: 'components/Footer.tsx', title: 'Footer — primary nav + Carous credit', notes: 'Include Home in the primary nav. Must mention Carous (e.g. "Powered by Carous" with optional link to https://carous.co.uk).' },
  { path: 'styles/base.css', title: 'Base CSS — global resets + design tokens', notes: 'NO blanket :where(a) { color: ... } rules — that paints brand wordmarks wrong. Include [hidden] { display: none !important } so modals close cleanly. Scope every class rule under :where(body[data-theme-id="<id>"]).' },
  { path: 'pages/home/page.tsx', title: 'Homepage — section composition for archetype', notes: 'Single <h1> for the hero. At least one data-mfx-scroll attribute for parallax. ≥4 data-aos entries (homepage) for marquee moments. Section composition per archetype-spec.' },
  { path: 'pages/about/page.tsx', title: 'About page — story / team / location', notes: 'Single <h1>. Use brand.address, brand.foundedYear, brand.fleetSize if available. PageHero with var(--brand-image-about).' },
  { path: 'pages/contact/page.tsx', title: 'Contact page — form + locations + hours', notes: 'Single <h1>. Use brand.phone + brand.email + brand.address + brand.hours. WhatsApp link if brand.whatsapp.' },
  { path: 'pages/services/page.tsx', title: 'Services page — service grid + CTAs', notes: 'Single <h1>. List brand.services. Each card has clear CTA.' },
  { path: 'pages/sell-your-car/page.tsx', title: 'Sell-your-car page (route /sell-my-car)', notes: 'NOTE the route is /sell-my-car not /sell-your-car despite the page label. All internal links use href="/sell-my-car".' },
  { path: 'pages/finance/page.tsx', title: 'Finance page — calculator + apply form', notes: 'Single <h1>. PageHero with var(--brand-image-finance). Finance disclaimer text (regulated by FCA).' },
  { path: 'pages/part-exchange/page.tsx', title: 'Part-exchange page — valuation form', notes: 'Single <h1>. PageHero with var(--brand-image-part-exchange).' },
  { path: 'pages/compare/page.tsx', title: 'Compare page — vehicle comparison UI', notes: 'Garage context consumer; renders selected vehicles side-by-side.' },
  { path: 'pages/wishlist/page.tsx', title: 'Wishlist page — saved vehicles', notes: 'Garage context consumer; empty state with browse CTA.' },
  { path: 'pages/privacy-policy/page.tsx', title: 'Privacy policy page', notes: 'UK GDPR boilerplate; dealer name/address from brand.' },
  { path: 'pages/cookie-policy/page.tsx', title: 'Cookie policy page', notes: 'Lists cookie categories; links to consent settings.' },
]

// Mirrors scaffold-theme-skeleton.mjs::KEEP_PATTERNS — data layer kept, but
// presentation must be redesigned per archetype. SKILL.md Pitfall row 30:
// "kept" does NOT mean "don't touch" — it means data fetch / state / URL
// handling stays verbatim; JSX render + CSS module are rewritten.
const KEEP_ITEMS = [
  { path: 'pages/used-cars/page.tsx', title: 'Inventory list — JSX render + CSS rewrite', notes: 'KEEP the data layer (state, URL params, fetch via getBrandSlugFromRequest + /api/inventory?brand=<slug>). REDESIGN the JSX layout per chosen inventory list pattern (1–7 from docs/inventory-design-library.md). Append your theme to the rotation table.' },
  { path: 'pages/used-cars/page.module.css', title: 'Inventory list CSS — rewrite from scratch', notes: 'Brand-token-driven. Mobile-first (no max-width queries). Scope every class under [data-theme-id="<id>"].' },
  { path: 'pages/used-cars/UsedCarsClient.tsx', title: 'Inventory list client island — verify interaction surface', notes: 'Filter controls, sort, pagination — keep handlers; redesign visual chrome to match your inventory pattern.' },
  { path: 'pages/used-cars/[slug]/page.tsx', title: 'Vehicle detail — JSX render + required sections', notes: 'KEEP the data layer. REDESIGN per chosen detail pattern (A–H). REQUIRED sections after specs: (1) Similar vehicles strip /api/inventory?brand=<slug>&make=<thismake>&limit=4. (2) SEO makes-list panel ("Browse by make" / "Popular makes") sourced from /api/inventory meta.available.makes. (3) Use <EnquiryModal /> from @/app/widgets/EnquiryModal — NOT an inline form. (4) Official WhatsApp glyph from @/app/widgets/WhatsAppFab.' },
  { path: 'pages/used-cars/[slug]/page.module.css', title: 'Vehicle detail CSS — rewrite from scratch', notes: 'Same scoping + token discipline as the list CSS.' },
  { path: 'pages/recently-sold/page.tsx', title: 'Recently-sold list — JSX redesign', notes: 'Distinctive treatment vs the live inventory list (grayscale-to-color hover, SOLD diagonal banner for rugged, etc.). Don\'t mirror used-cars styling.' },
]

// Per-archetype required components (parsed from docs/theme-archetype-specs.md's
// "Components Phase 8 must redesign" sections + the new components each
// archetype calls for). Kept in this tool rather than parsed at runtime so the
// generator stays self-contained and the work-package shape is stable.
const ARCHETYPE_ITEMS = {
  classic: [],
  modern: [
    { path: 'components/Hero.tsx', title: 'Hero — split-screen layout (modern)', notes: '50/50 desktop, stacked mobile. Left: display headline + lead + primary CTA + secondary link, left-aligned. Right: full-bleed photo NO overlay. Search bar OUT of hero into a SearchStrip below.' },
    { path: 'components/Header.tsx', title: 'Header — thin sticky-transparent (modern)', notes: 'Thin 60px. Sticky transparent at top, solid white on scroll. Logo left, nav right. Mobile: full-screen overlay (not side drawer).' },
    { path: 'components/SearchStrip.tsx', title: 'NEW: SearchStrip — standalone search row', notes: 'Background var(--color-surface), border-block 1px solid var(--color-border), 16px vertical padding.' },
    { path: 'components/LatestArrivalsSection.tsx', title: 'LatestArrivals — 3-up grid (NOT carousel)', notes: 'grid-template-columns: repeat(3, 1fr) desktop. 6:4 image aspect.' },
    { path: 'components/ServiceHighlightsSection.tsx', title: 'ServiceHighlights — 4-column icon grid', notes: 'Minimal cards, no shadow, border-only.' },
  ],
  rugged: [
    { path: 'components/Hero.tsx', title: 'Hero — dark-mode full-bleed (rugged)', notes: 'Dark mode for hero section only (--color-bg swapped to text). 80vh desktop / 60vh mobile. Condensed-bold uppercase headline clamp(2.8rem, 6vw, 5.5rem), letter-spacing 0.02em. Two pill CTAs side-by-side.' },
    { path: 'components/Header.tsx', title: 'Header — dark-by-default, light-on-scroll (rugged)', notes: 'Charcoal bg, white logo+nav at top. Flips to light when scrolled past hero. Sharp 4px buttons (NOT pill). Status pills next to logo: "Quality assured · Finance available · Nationwide delivery".' },
    { path: 'components/SpecsBar.tsx', title: 'NEW: SpecsBar — 4 stat cards', notes: 'Years in business · Vehicles in stock · Postcodes covered · Rating.' },
    { path: 'components/LatestArrivalsSection.tsx', title: 'LatestArrivals — 4-up grid, sharp corners, monochrome', notes: 'Squared 4–6px corners. 2px border-strong. Image-zoom on hover. Price > title size. Spec line in monospace.' },
    { path: 'components/RecentlySold.tsx', title: 'NEW: RecentlySold preview — 3 cards with diagonal SOLD banner', notes: '.rugged-sold-banner CSS: rotate(35deg), --color-primary bg, 0.1em letter-spacing.' },
    { path: 'components/ServicesSection.tsx', title: 'Services — dark band, white text', notes: 'Inverts the section surface for visual rhythm.' },
  ],
  luxury: [
    { path: 'components/Hero.tsx', title: 'Hero — full-bleed photo, corner-aligned serif display (luxury)', notes: '100vh. Display headline serif italic in lower-left corner (NOT centered). Subtle vignette. Search hidden behind "Browse the collection" CTA — luxury visitors browse, not filter.' },
    { path: 'components/Header.tsx', title: 'Header — tall, transparent-to-white (luxury)', notes: '96–120px height. Transparent at top with white text/logo, flips to white-bg with serif wordmark on scroll. Centered logo, symmetrical nav (3 left / 3 right).' },
    { path: 'components/EditorialIntro.tsx', title: 'NEW: Editorial intro — 1-column centered serif copy', notes: 'Max-width ~640px. Serif body type. Generous line-height.' },
    { path: 'components/FeaturedCollection.tsx', title: 'NEW: FeaturedCollection — 2-up alternating large vehicle cards', notes: 'Alternating left/right image position per card.' },
    { path: 'components/ConciergeServices.tsx', title: 'NEW: ConciergeServices — 3-column with serif headings', notes: 'Restrained palette. Generous whitespace.' },
    { path: 'components/TestimonialPullquote.tsx', title: 'NEW: TestimonialPullquote — full-width serif italic', notes: 'No surrounding card chrome. Centered, large type.' },
  ],
  prestige: [
    { path: 'components/Hero.tsx', title: 'Hero — mixed-media 60/40 split (prestige)', notes: '60% photo, 40% asymmetric text block. Display-serif number ("Established 1987") + tagline + thin horizontal rule + 2 minimal text links. Background can be video loop or still.' },
    { path: 'components/Header.tsx', title: 'Header — two-tier (action strip + editorial nav)', notes: 'Top strip: logo + 3 actions. Editorial nav: 8–10 categories (Coupes, Convertibles, Track Cars, Investment Pieces). Mobile collapses both into a sidebar.' },
    { path: 'components/EditionStrip.tsx', title: 'NEW: EditionStrip — "Volume 23, Spring 2026"', notes: 'Serif small-caps, letter-spacing 0.18em, 12px vertical padding, border-block 1px solid var(--color-border).' },
    { path: 'components/EditorialGrid.tsx', title: 'NEW: EditorialGrid — magazine 3-column with lead story', notes: 'Lead story large photo, 2 supporting stories smaller photos. grid-template-columns: 2fr 1fr.' },
    { path: 'components/FeaturedVehicleEditorial.tsx', title: 'NEW: FeaturedVehicleEditorial — multi-image gallery + spec sidebar', notes: 'Single full-width section. Image-bleed to edges. Caption small-caps serif italic.' },
    { path: 'components/AcquisitionsRow.tsx', title: 'NEW: AcquisitionsRow — horizontal-scrolling 5-card row', notes: 'overflow-x: auto; scroll-snap-type: x mandatory.' },
    { path: 'components/PullQuote.tsx', title: 'NEW: PullQuote — Playfair italic, max-width 880px', notes: 'Centered, clamp(1.5rem, 3vw, 2.4rem) font-size, line-height 1.4.' },
  ],
}

// Always-required Quality Bar items that don't fit a single file — these
// are cross-cutting checks Phase 8 must verify before declaring done.
const ALWAYS_REQUIRED = [
  { id: 'cookie-banner-per-theme', title: 'Per-theme CookieBanner mounted from Shell', notes: 'Build components/<Pascal>CookieBanner.tsx whose surface matches the archetype (rugged: full-width charcoal dock; luxury: centered card; etc.). Mount from Shell. If genuinely using the global widget, add // audit-ignore-file: lib-missing-cookie-banner — using global at the top of Shell.tsx.' },
  { id: 'brand-image-vars-consumed', title: 'Every Hero/PageHero/CtaBanner consumes var(--brand-image-*)', notes: 'Hardcoded image paths silently drop dashboard uploads. Pattern: backgroundImage: "var(--brand-image-hero, url(\'/themes/<id>/images/hero.jpg\'))".' },
  { id: 'hero-title-fit-2-lines', title: 'Hero title clamp() max ≤ 3.6rem + max-width: 14ch', notes: 'A clumpsy 4-line hero is the failure mode. Two-clause titles can use max-width: 18ch.' },
  { id: 'mobile-simplification', title: 'Mobile views drop columns/decor/CTAs — simplify, don\'t shrink', notes: 'Single column ≤640px. Hide decorative layers. One primary CTA. Sticky bottom CTA bar on detail pages. Full-screen nav overlay. One field per row in forms. Full-screen sheet modals. DevTools test at 390×844.' },
  { id: 'restraint-budget', title: 'Restraint check: ≤5 font sizes, ≤2 gradient surfaces, brand color ≤25%', notes: 'Maximalism is the failure mode for prospect previews. Inner pages typically have 0 decorative layers.' },
  { id: 'motion-budget', title: 'Motion budget: 2–3 AOS staggered entries per page, 1 mfx-shimmer on dominant CTA, 1 mfx-pulse-dot per viewport, ≥1 data-mfx-scroll on homepage', notes: 'Quality > quantity. Honor prefers-reduced-motion.' },
  { id: 'phase-10-audit-clean', title: 'Run npm run theme:sync + tsc + audit-theme — 0 blockers', notes: 'Address every blocker. Advisories require either fix or audit-ignore: directive with prose explanation.' },
]

async function loadDna(dnaPath) {
  const raw = await fs.readFile(path.resolve(dnaPath), 'utf8')
  return JSON.parse(raw)
}

async function fileExists(p) {
  try { await fs.access(p); return true } catch { return false }
}

function buildItems(themeId, archetype) {
  const items = []
  for (const stub of STUB_ITEMS) {
    items.push({
      id: `stub-${stub.path.replace(/[/.]/g, '-')}`,
      kind: 'stub-implementation',
      path: stub.path,
      title: stub.title,
      description: stub.notes,
      references: ['SKILL.md §Quality Bar', `docs/theme-archetype-specs.md §${archetype}`],
      priority: 'high',
    })
  }
  for (const keep of KEEP_ITEMS) {
    items.push({
      id: `keep-${keep.path.replace(/[/.]/g, '-')}`,
      kind: 'kept-redesign',
      path: keep.path,
      title: keep.title,
      description: keep.notes,
      references: ['SKILL.md §Phase 8', 'docs/inventory-design-library.md'],
      priority: 'high',
    })
  }
  const archItems = ARCHETYPE_ITEMS[archetype] || []
  for (const item of archItems) {
    items.push({
      id: `archetype-${archetype}-${item.path.replace(/[/.]/g, '-')}`,
      kind: 'archetype-required',
      path: item.path,
      title: item.title,
      description: item.notes,
      references: [`docs/theme-archetype-specs.md §${archetype}`],
      priority: 'high',
    })
  }
  for (const req of ALWAYS_REQUIRED) {
    items.push({
      id: `always-${req.id}`,
      kind: 'quality-bar',
      path: null,
      title: req.title,
      description: req.notes,
      references: ['SKILL.md §Quality Bar'],
      priority: 'medium',
    })
  }
  return items
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.id || !args.dna) {
    console.error('Usage: node tools/generate-theme-workpackage.mjs --id <theme-id> --dna <dna.json> [--out <path>]')
    process.exit(1)
  }
  const themeId = String(args.id).toLowerCase()
  const themeDir = path.join(THEMES_ROOT, themeId)
  if (!await fileExists(themeDir)) {
    console.error(`Theme folder not found: ${themeDir}`)
    process.exit(1)
  }
  let dna
  try {
    dna = await loadDna(args.dna)
  } catch (err) {
    console.error(`Failed to read DNA: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }
  const archetype = String(dna?.notes?.archetype || 'classic').toLowerCase()
  if (!ARCHETYPE_ITEMS[archetype]) {
    console.error(`Unrecognized archetype "${archetype}". Expected one of: ${Object.keys(ARCHETYPE_ITEMS).join(', ')}`)
    process.exit(2)
  }
  const items = buildItems(themeId, archetype)
  const summary = {
    stubs: items.filter((i) => i.kind === 'stub-implementation').length,
    kept: items.filter((i) => i.kind === 'kept-redesign').length,
    archetypeRequired: items.filter((i) => i.kind === 'archetype-required').length,
    qualityBar: items.filter((i) => i.kind === 'quality-bar').length,
    total: items.length,
  }
  const out = {
    themeId,
    archetype,
    generatedAt: new Date().toISOString(),
    summary,
    items,
  }
  const outPath = (args.out && typeof args.out === 'string')
    ? path.resolve(args.out)
    : path.join(WORKPKG_DIR, `${themeId}.json`)
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8')
  console.log(`Work package for ${themeId} (archetype: ${archetype})`)
  console.log(`  ${summary.total} items — ${summary.stubs} stubs + ${summary.kept} kept-redesigns + ${summary.archetypeRequired} archetype-required + ${summary.qualityBar} quality-bar`)
  console.log(`  written to ${path.relative(PROJECT_ROOT, outPath)}`)
  console.log('')
  console.log('Phase 8 entry: read this JSON into TodoWrite and work through items in order.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(1)
})
