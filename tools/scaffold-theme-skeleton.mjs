#!/usr/bin/env node
/**
 * scaffold-theme-skeleton.mjs
 *
 * Skeleton-first scaffolder. Produces a new theme containing **only the
 * mandatory plumbing** brandstudio's runtime requires:
 *
 *   - Contract files (theme.json, tokens.ts, recipes/, sections/, shell.tsx,
 *     pages.ts) — typed exports the runtime auto-discovers.
 *   - Context bundle (BrandClientWrapper, BrandStyles with the 7 image-slot
 *     CSS vars, AuthProvider, DynamicFavicon, GarageContext) — auto-registered
 *     by `theme:sync`.
 *   - Mandatory libs (contact, api, vehicle-links, seo, uk-phone,
 *     brand-slug.server, inventory) — same shape used everywhere.
 *   - 14 page route stubs — Claude designs the bodies in Phase 8.
 *   - Minimal Shell + Header + Footer + base.css — placeholder layouts that
 *     Claude REPLACES wholesale with fresh designs.
 *
 * What the SKELETON SCAFFOLDER deliberately does NOT include:
 *   - Springalls's Hero, section components (TrustSignals, LatestArrivals,
 *     ServiceHighlights, Services, Reviews, CTA, Directory) — Claude picks
 *     which sections each archetype needs and designs them fresh.
 *   - Springalls's CSS files (other than minimal base.css) — Claude writes
 *     fresh CSS per component using brand tokens.
 *   - Springalls's HeroBackdrop / BrandedPlaceholder / CookieBanner /
 *     PreviewBanner / WhatsAppEnquiry — Claude decides whether each archetype
 *     wants these and designs them fresh if so.
 *
 * The scaffold-theme.mjs (the original) is still the right tool for Mode B
 * "port from a sibling app" workflows where you genuinely want to inherit a
 * working theme's structure. Mode A "bespoke from logo + URL" should use
 * THIS tool.
 *
 * Usage:
 *   node tools/scaffold-theme-skeleton.mjs \
 *     --id <new-id> \
 *     --name "<Display Name>" \
 *     --description "..." \
 *     --dna <dna.json> \
 *     [--archetype <classic|modern|rugged|luxury|prestige>] \
 *     [--status stable|experimental]
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
const PLUMBING_TEMPLATE = 'springalls-classic'

// File patterns to KEEP from the plumbing template (everything else is
// stripped out). Anything matching one of these path tails after cloning is
// retained as-is (after identifier rewrite).
const KEEP_PATTERNS = [
  /^context\//,
  /^lib\//,
  /^pages\/used-cars\/page\.tsx$/,        // inventory list — substantial logic
  /^pages\/used-cars\/UsedCarsClient\.tsx$/,
  /^pages\/used-cars\/page\.module\.css$/,
  /^pages\/used-cars\/\[slug\]\/page\.tsx$/, // vehicle detail — heavy detail logic
  /^pages\/used-cars\/\[slug\]\/page\.module\.css$/,
  /^pages\/recently-sold\/page\.tsx$/,    // already a thin component, keep
  /^components\/HeroBackdrop\.tsx$/,      // dependency of used-cars pages — kept
  // Role-token system — used by the kept inventory CSS modules. Without it
  // their `var(--t-border)` / `var(--t-card)` references resolve undefined
  // and form-field borders render washed out (caught the hard way in
  // columbus-vehicles-bespoke). The scaffolder's identifier rewrite
  // automatically reskins the [data-theme-id='springalls-classic'] scope to
  // the new theme's id, so the kept file just works for the new theme.
  /^styles\/color-policy\.css$/,
]

// Files to REPLACE with minimal stubs (these names exist in the template but
// we want fresh content). For each, we provide a stub generator below.
const STUB_FILES = {
  'theme.json': null,                  // generated from args
  'tokens.ts': null,                   // generated from DNA
  'recipes/index.ts': 'recipes',
  'sections/index.tsx': 'sections',
  'shell.tsx': 'shell',
  'pages.ts': 'pages',
  'components/Shell.tsx': 'componentShell',
  'components/Header.tsx': 'componentHeader',
  'components/Footer.tsx': 'componentFooter',
  'styles/base.css': 'baseCss',
  // Page stubs — minimal routable components Claude designs in Phase 8.
  'pages/home/page.tsx': 'pageHome',
  'pages/about/page.tsx': 'pageAbout',
  'pages/contact/page.tsx': 'pageContact',
  'pages/services/page.tsx': 'pageServices',
  'pages/sell-your-car/page.tsx': 'pageSellYourCar',
  'pages/finance/page.tsx': 'pageFinance',
  'pages/part-exchange/page.tsx': 'pagePartExchange',
  'pages/compare/page.tsx': 'pageCompare',
  'pages/wishlist/page.tsx': 'pageWishlist',
  'pages/privacy-policy/page.tsx': 'pagePrivacy',
  'pages/cookie-policy/page.tsx': 'pageCookie',
  // Note: pages/used-cars/* and pages/recently-sold/* kept from template.
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

function validateId(id) {
  if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/.test(id)) {
    throw new Error(
      `Theme id "${id}" must be kebab-case with at least two segments (e.g. "huntsmotors-cobalt").`,
    )
  }
}

function namesFor(id) {
  const segments = id.split('-')
  const cap = (s) => s[0].toUpperCase() + s.slice(1)
  return {
    id,
    pascalShort: cap(segments[0]),
    camelShort: segments[0].toLowerCase(),
    pascalFull: segments.map(cap).join(''),
    camelFull: segments[0] + segments.slice(1).map(cap).join(''),
    upperShort: segments[0].toUpperCase(),
    upperFull: segments.map((s) => s.toUpperCase()).join('_'),
  }
}

const TEMPLATE_NAMES = namesFor(PLUMBING_TEMPLATE)

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
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else if (entry.isFile()) out.push(full)
  }
  return out
}

function replaceIdentifiers(content, fromNames, toNames) {
  return content
    .split(fromNames.upperFull).join(toNames.upperFull)
    .split(fromNames.pascalFull).join(toNames.pascalFull)
    .split(fromNames.camelFull).join(toNames.camelFull)
    .split(fromNames.id).join(toNames.id)
    .split(fromNames.upperShort).join(toNames.upperShort)
    .split(fromNames.pascalShort).join(toNames.pascalShort)
    .split(fromNames.camelShort).join(toNames.camelShort)
}

// --- stub generators --------------------------------------------------------
//
// Each stub produces a minimal but TYPE-SAFE placeholder. The skeleton must
// pass tsc and theme:sync; design freshness comes from Claude in Phase 8.

const STUB_GENERATORS = {
  recipes() {
    return `import type { ThemeRecipeRegistry } from '../../types'

// Phase 8 design responsibility: define recipes (named composition presets)
// the dashboard uses to surface section/recipe options. Empty for now —
// designs ship without preset recipes by default.
export const themeRecipes: ThemeRecipeRegistry = {}
`
  },

  sections({ toNames }) {
    return `import type { ThemeSectionRegistry } from '../../types'

// Phase 8 design responsibility: register the section components the
// dashboard exposes for theme customization. The runtime can render a brand
// without any registered sections — keeping this empty is fine for an
// initial scaffold.
function HeroSection() {
  return null
}

export const themeSections: ThemeSectionRegistry = {
  hero: HeroSection,
}
`
  },

  shell({ toNames }) {
    return `'use client'

import ${toNames.pascalShort}Shell from './components/Shell'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => {
  return <${toNames.pascalShort}Shell>{children}</${toNames.pascalShort}Shell>
}
`
  },

  pages({ toNames }) {
    const ids = [
      ['home', 'HomePage'],
      ['about', 'AboutPage'],
      ['contact', 'ContactPage'],
      ['services', 'ServicesPage'],
      ['sellYourCar', 'SellYourCarPage', 'sell-your-car'],
      ['finance', 'FinancePage'],
      ['partExchange', 'PartExchangePage', 'part-exchange'],
      ['usedCars', 'UsedCarsPage', 'used-cars'],
      ['vehicleDetail', 'VehicleDetailPage', 'used-cars/[slug]'],
      ['recentlySold', 'RecentlySoldPage', 'recently-sold'],
      ['compare', 'ComparePage'],
      ['wishlist', 'WishlistPage'],
      ['privacyPolicy', 'PrivacyPolicyPage', 'privacy-policy'],
      ['cookiePolicy', 'CookiePolicyPage', 'cookie-policy'],
    ]
    const imports = ids.map(([id, comp, slug]) => {
      const dir = slug || id
      return `import { ${toNames.pascalShort}${comp} } from './pages/${dir}/page'`
    }).join('\n')
    const map = ids.map(([id, comp]) => `  ${id}: ${toNames.pascalShort}${comp},`).join('\n')

    return `import type { ThemePageRegistry } from '../types'
${imports}

export const themePages: ThemePageRegistry = {
${map}
}

export const ${toNames.camelFull}Pages = themePages
`
  },

  componentShell({ toNames }) {
    return `'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
// Brandstudio global widgets — same implementation across every theme.
// Don't re-roll AOS / cookie consent / motion FX per theme; mount the
// widgets and pass brand-aware props.
import AnimateOnScroll from '@/app/widgets/AnimateOnScroll'
import { MotionFX } from '@/app/widgets/MotionFX'
import ScrollProgress from '@/app/widgets/ScrollProgress'
import CookieBanner from '@/app/widgets/CookieBanner'
import WhatsAppFab from '@/app/widgets/WhatsAppFab'

import '../styles/base.css'
import '../styles/color-policy.css'

const KNOWN_ROUTES = new Set([
  '/', '/about', '/about-us', '/contact', '/contact-us',
  '/cookie-policy', '/privacy-policy', '/services',
  '/sell-your-car', '/sell-my-car', '/finance', '/part-exchange',
  '/used-cars', '/recently-sold', '/wishlist', '/compare',
])

/**
 * SKELETON Shell — Phase 8 redesigns this per the chosen archetype.
 *
 * What this stub already wires up (don't remove unless you have a strong
 * archetype-specific reason):
 *  - GarageProvider for wishlist/compare state.
 *  - Skip-to-content link for keyboard users.
 *  - <AnimateOnScroll /> — global widget mounting the scroll-reveal observer.
 *    Use data-aos="<variant>" on any element (18 variants supported — fade,
 *    fade-up/down/left/right, fade-up-right/up-left/down-right/down-left,
 *    zoom-in/out, zoom-in-up, zoom-out-down, flip-up/down/left/right,
 *    slide-up/down, blur-in). Optional: data-aos-delay / -duration / -easing.
 *  - <MotionFX /> — CSS-only injector for animated neon/light primitives:
 *    .mfx-glow-pulse, .mfx-glow-orbit, .mfx-pulse-dot, .mfx-shimmer,
 *    .mfx-text-glow, .mfx-border-glow, .mfx-scan, .mfx-float, .mfx-tilt,
 *    .mfx-grid-drift. All brand-token-driven, all reduced-motion safe.
 *  - <ScrollProgress /> — rAF-throttled scroll-tied progress driver. Add
 *    data-mfx-scroll="parallax-slow|parallax-medium|parallax-fast|
 *    fade-out-on-exit|blur-on-exit|zoom-on-enter" to any container — its
 *    children get the effect for free. Themes can also consume
 *    var(--mfx-progress) (0 → 1) directly in their own CSS modules.
 *  - <CookieBanner /> — UK GDPR consent. Replace with a per-theme bespoke
 *    banner under \`components/<Theme>CookieBanner.tsx\` during Phase 8
 *    (the shared widget is a fallback / starter, not the default for
 *    bespoke themes — see SKILL Quality Bar §"Cookie banners must NOT
 *    be one-size-fits-all").
 *  - <WhatsAppFab /> — floating WhatsApp CTA with online/offline status
 *    derived from \`brand.openingHours\`. Theme-agnostic, brand-token-driven.
 *
 * Phase 8 typically does NOT add: per-theme AOS reimplementations,
 * ad-hoc preview banners, hand-rolled WhatsApp widgets. Use the global
 * widgets and add archetype-specific decoration (Header/Footer styling,
 * hero patterns, section composition) on top.
 */
export function ${toNames.pascalShort}Shell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  const pathname = usePathname() || ''
  const isKnownRoute =
    KNOWN_ROUTES.has(pathname) ||
    pathname.startsWith('/used-cars/') ||
    pathname.startsWith('/dashboard') ||
    pathname === '/login'
  const isSpecialArea = pathname.startsWith('/dashboard') || pathname === '/login' || !isKnownRoute

  if (isSpecialArea) {
    return (
      <main id="content" role="main" className="${toNames.camelShort}-main main-dashboard">
        {children}
      </main>
    )
  }

  return (
    <GarageProvider brandSlug={brand?.slug || 'default'}>
      <a href="#content" className="${toNames.camelShort}-skip-link">Skip to content</a>
      <AnimateOnScroll />
      <MotionFX />
      <ScrollProgress />
      <Header />
      <main id="content" role="main" className="${toNames.camelShort}-main">
        {children}
      </main>
      <Footer />
      <WhatsAppFab brand={brand} />
      <CookieBanner brandSlug={brand?.slug} cookiePolicyHref="/cookie-policy" />
    </GarageProvider>
  )
}

export default ${toNames.pascalShort}Shell
`
  },

  componentHeader({ toNames }) {
    return `'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'

/**
 * SKELETON Header — replace wholesale during Phase 8 design work using the
 * archetype's header pattern (see docs/theme-archetype-specs.md). This stub
 * exists only to make the theme renderable while the design is in progress.
 *
 * Quality bar reminders for the redesign (per .claude/skills/new-theme/SKILL.md):
 *  - Use <nav aria-label="Primary"> with real <a> elements
 *  - Mobile hamburger as <button aria-expanded=>, NOT <div onClick=>
 *  - Touch targets ≥ 44×44px
 *  - Mobile-first responsive (min-width media queries)
 */
export default function Header() {
  const brand = useBrand()
  const brandName = brand?.name || '${toNames.pascalShort}'

  return (
    <header className="${toNames.camelShort}-header">
      <div className="${toNames.camelShort}-header-inner">
        <Link href="/" className="${toNames.camelShort}-header-brand" aria-label={brandName}>
          {brandName}
        </Link>
        <nav aria-label="Primary" className="${toNames.camelShort}-header-nav">
          <Link href="/used-cars">Stock</Link>
          <Link href="/finance">Finance</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  )
}
`
  },

  componentFooter({ toNames }) {
    return `'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'

/**
 * SKELETON Footer — replace during Phase 8 with archetype-specific footer.
 * Use <footer> + <address> + <dl> for opening hours per the Quality Bar.
 */
export default function Footer() {
  const brand = useBrand()
  const brandName = brand?.name || '${toNames.pascalShort}'
  const year = new Date().getFullYear()

  return (
    <footer className="${toNames.camelShort}-footer">
      <div className="${toNames.camelShort}-footer-inner">
        <span>© {year} {brandName}</span>
        <nav aria-label="Footer">
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/cookie-policy">Cookies</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
        </nav>
      </div>
    </footer>
  )
}
`
  },

  baseCss({ toNames }) {
    return `/* =============================================================================
 * BASE STYLES — ${toNames.id}
 * =============================================================================
 *
 * Skeleton baseline. Phase 8 design work should add per-component CSS in
 * separate files (e.g. styles/hero.css, components/Header.module.css) and
 * import them from the Shell. Keep brand-token discipline:
 *   - Use var(--color-*) and var(--brand-image-*) — NEVER hardcoded hex.
 *   - Mobile-first media queries (min-width).
 *   - Scope every rule under [data-theme-id='${toNames.id}'].
 * ============================================================================= */

[data-theme-id='${toNames.id}'] {
  color-scheme: light;
  font-family: var(--font-ui-family-override, 'Inter', 'Segoe UI', sans-serif);
  background: var(--color-bg);
  color: var(--color-text);
  margin: 0;
}

[data-theme-id='${toNames.id}'] *,
[data-theme-id='${toNames.id}'] *::before,
[data-theme-id='${toNames.id}'] *::after {
  box-sizing: border-box;
}

[data-theme-id='${toNames.id}'] h1,
[data-theme-id='${toNames.id}'] h2,
[data-theme-id='${toNames.id}'] h3,
[data-theme-id='${toNames.id}'] h4 {
  font-family: var(--font-brand-family-override, var(--font-ui-family-override, sans-serif));
  letter-spacing: 0.01em;
  margin: 0;
}

[data-theme-id='${toNames.id}'] :where(a) {
  color: var(--color-primary);
}

[data-theme-id='${toNames.id}'] .${toNames.camelShort}-skip-link {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
[data-theme-id='${toNames.id}'] .${toNames.camelShort}-skip-link:focus {
  left: 12px;
  top: 12px;
  width: auto;
  height: auto;
  padding: 12px 16px;
  background: var(--color-bg);
  color: var(--color-primary);
  z-index: 1000;
}

[data-theme-id='${toNames.id}'] .${toNames.camelShort}-main {
  display: block;
  min-height: calc(100vh - 200px);
}

[data-theme-id='${toNames.id}'] .${toNames.camelShort}-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

[data-theme-id='${toNames.id}'] .${toNames.camelShort}-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px clamp(16px, 3vw, 32px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

[data-theme-id='${toNames.id}'] .${toNames.camelShort}-header-brand {
  font-weight: 700;
  text-decoration: none;
  color: var(--color-text);
  font-size: 1.1rem;
}

[data-theme-id='${toNames.id}'] .${toNames.camelShort}-header-nav {
  display: flex;
  gap: clamp(16px, 2vw, 28px);
}

[data-theme-id='${toNames.id}'] .${toNames.camelShort}-header-nav a {
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 4px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

[data-theme-id='${toNames.id}'] .${toNames.camelShort}-footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: clamp(24px, 4vw, 48px) clamp(16px, 3vw, 32px);
  margin-top: clamp(48px, 8vw, 96px);
}

[data-theme-id='${toNames.id}'] .${toNames.camelShort}-footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  color: var(--color-muted);
}

[data-theme-id='${toNames.id}'] .${toNames.camelShort}-footer-inner nav {
  display: flex;
  gap: 16px;
}
[data-theme-id='${toNames.id}'] .${toNames.camelShort}-footer-inner nav a {
  color: var(--color-muted);
  text-decoration: none;
}
[data-theme-id='${toNames.id}'] .${toNames.camelShort}-footer-inner nav a:hover {
  color: var(--color-primary);
}
`
  },

  // --- page stubs ---
  // Each stub renders a TYPE-SAFE placeholder so theme:sync + tsc pass while
  // Claude designs the body in Phase 8. The export name follows the
  // theme-prefix convention (`${PascalShort}HomePage`, etc.) so pages.ts can
  // import it consistently.
  _pageStub({ toNames, exportName, headline, hint }) {
    return `import type { ThemePageProps } from '../../../types'

/**
 * SKELETON page — Phase 8 design responsibility.
 * ${hint}
 */
export function ${toNames.pascalShort}${exportName}({ brand }: ThemePageProps) {
  const brandName = brand?.name || '${toNames.pascalShort}'
  return (
    <main className="${toNames.camelShort}-page-stub" style={{ padding: '64px 24px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <h1>${headline}</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 16 }}>
        Page under construction — designed fresh for {brandName} in Phase 8.
      </p>
    </main>
  )
}

export default ${toNames.pascalShort}${exportName}
`
  },

  pageHome({ toNames }) {
    return STUB_GENERATORS._pageStub({
      toNames,
      exportName: 'HomePage',
      headline: 'Home',
      hint: 'Compose the homepage from archetype-appropriate sections (see archetype spec).',
    })
  },
  pageAbout({ toNames }) {
    return STUB_GENERATORS._pageStub({
      toNames,
      exportName: 'AboutPage',
      headline: 'About us',
      hint: "Tell the dealer's story — pull from brand.aboutUs and brand voice.",
    })
  },
  pageContact({ toNames }) {
    return STUB_GENERATORS._pageStub({
      toNames,
      exportName: 'ContactPage',
      headline: 'Contact',
      hint: 'Showroom address + phone + email + opening hours + lead form.',
    })
  },
  pageServices({ toNames }) {
    return STUB_GENERATORS._pageStub({
      toNames,
      exportName: 'ServicesPage',
      headline: 'Services',
      hint: 'Detailed services per brand.services. Use --brand-image-services.',
    })
  },
  pageSellYourCar({ toNames }) {
    return STUB_GENERATORS._pageStub({
      toNames,
      exportName: 'SellYourCarPage',
      headline: 'Sell your car',
      hint: 'Valuation form + dealer pitch. Wire useLeadsForm with leadType "sell-my-car".',
    })
  },
  pageFinance({ toNames }) {
    return STUB_GENERATORS._pageStub({
      toNames,
      exportName: 'FinancePage',
      headline: 'Finance',
      hint: 'Finance proposition + calculator (if archetype calls for one).',
    })
  },
  pagePartExchange({ toNames }) {
    return STUB_GENERATORS._pageStub({
      toNames,
      exportName: 'PartExchangePage',
      headline: 'Part exchange',
      hint: 'Part-exchange valuation form. useLeadsForm leadType "part-exchange".',
    })
  },
  pageCompare({ toNames }) {
    return STUB_GENERATORS._pageStub({
      toNames,
      exportName: 'ComparePage',
      headline: 'Compare vehicles',
      hint: 'Side-by-side comparison from useGarage().compareList.',
    })
  },
  pageWishlist({ toNames }) {
    return STUB_GENERATORS._pageStub({
      toNames,
      exportName: 'WishlistPage',
      headline: 'Your wishlist',
      hint: 'Saved vehicles from useGarage().wishlist.',
    })
  },
  pagePrivacy({ toNames }) {
    return STUB_GENERATORS._pageStub({
      toNames,
      exportName: 'PrivacyPolicyPage',
      headline: 'Privacy policy',
      hint: 'Standard UK GDPR privacy policy — pull from brand.legal if available.',
    })
  },
  pageCookie({ toNames }) {
    return STUB_GENERATORS._pageStub({
      toNames,
      exportName: 'CookiePolicyPage',
      headline: 'Cookie policy',
      hint: 'Standard cookie policy — list categories + consent management.',
    })
  },
}

// --- token + theme-json builders (same as scaffold-theme.mjs) --------------

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

// --- main -------------------------------------------------------------------

function shouldKeep(relativePath) {
  return KEEP_PATTERNS.some((pat) => pat.test(relativePath))
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.id || !args.name || !args.dna) {
    console.error('Missing required args.')
    console.error('Usage: node tools/scaffold-theme-skeleton.mjs --id <new-id> --name "<Name>" --description "..." --dna <dna.json> [--archetype <id>]')
    process.exit(1)
  }
  const newId = String(args.id).toLowerCase()
  validateId(newId)

  const templateDir = path.join(THEMES_ROOT, PLUMBING_TEMPLATE)
  const targetDir = path.join(THEMES_ROOT, newId)

  try { await fs.access(templateDir) } catch {
    console.error(`Plumbing template not found: ${templateDir}`)
    process.exit(1)
  }
  try {
    await fs.access(targetDir)
    console.error(`Target theme folder already exists: ${targetDir}`)
    console.error('Refusing to overwrite. Choose a different --id or remove the folder first.')
    process.exit(1)
  } catch { /* good */ }

  const dnaRaw = await fs.readFile(path.resolve(args.dna), 'utf8')
  const dna = JSON.parse(dnaRaw)
  const toNames = namesFor(newId)

  // Step 1: clone the template (we'll prune after).
  await fs.cp(templateDir, targetDir, { recursive: true })
  console.log(`Cloned ${PLUMBING_TEMPLATE} -> ${newId}`)

  // Step 2: walk and apply identifier replacements.
  const allFiles = await walk(targetDir)
  let rewriteCount = 0
  for (const filePath of allFiles) {
    if (!isTextFile(filePath)) continue
    const content = await fs.readFile(filePath, 'utf8')
    const next = replaceIdentifiers(content, TEMPLATE_NAMES, toNames)
    if (next !== content) {
      await fs.writeFile(filePath, next, 'utf8')
      rewriteCount++
    }
  }
  console.log(`Identifier rewrite: ${rewriteCount}/${allFiles.length} text files updated`)

  // Step 3: PRUNE — delete every file under the target that's NOT in KEEP_PATTERNS
  // and not a stub-target. Stub-targets get rewritten in Step 4.
  const stubTargetSet = new Set(Object.keys(STUB_FILES).map((p) => path.normalize(p)))
  let pruneCount = 0
  for (const filePath of allFiles) {
    const rel = path.relative(targetDir, filePath).replace(/\\/g, '/')
    if (rel === 'theme.json' || rel === 'tokens.ts') continue // rewritten below
    if (shouldKeep(rel)) continue
    if (stubTargetSet.has(path.normalize(rel))) continue // will be replaced
    // delete this file — it's a visual component or page body Claude designs fresh
    try {
      await fs.unlink(filePath)
      pruneCount++
    } catch { /* tolerate missing */ }
  }
  console.log(`Pruned ${pruneCount} visual files (Hero, sections, page bodies, archetype-irrelevant CSS)`)

  // Step 4: write stub generators for the files Claude designs in Phase 8.
  const ctx = { toNames, dna, args }
  for (const [relativePath, generatorKey] of Object.entries(STUB_FILES)) {
    if (!generatorKey) continue
    const targetPath = path.join(targetDir, relativePath)
    const gen = STUB_GENERATORS[generatorKey]
    if (!gen) {
      console.error(`Missing stub generator for ${relativePath}`)
      continue
    }
    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    await fs.writeFile(targetPath, gen(ctx), 'utf8')
  }
  console.log(`Wrote ${Object.values(STUB_FILES).filter(Boolean).length} stub files`)

  // Step 5: theme.json + tokens.ts from args/DNA
  const themeJson = {
    id: newId,
    name: String(args.name),
    description: String(args.description || `${args.name} theme — Phase 8 design pending.`),
    status: String(args.status || 'experimental'),
    isDefault: false,
  }
  await fs.writeFile(path.join(targetDir, 'theme.json'), JSON.stringify(themeJson, null, 2) + '\n', 'utf8')
  console.log(`Wrote theme.json (id=${newId}, status=${themeJson.status})`)

  await fs.writeFile(path.join(targetDir, 'tokens.ts'), buildTokensFile(dna), 'utf8')
  console.log('Wrote tokens.ts from DNA')

  // Step 6: prune empty directories left behind by pruning.
  await pruneEmptyDirs(targetDir)

  console.log('')
  console.log(`Theme "${newId}" SKELETON scaffolded at app/themes/${newId}/`)
  console.log('Phase 8 design responsibility:')
  console.log('  - DESIGN Hero, Header, Footer + section components fresh per archetype spec')
  console.log('    (see docs/theme-archetype-specs.md → ' + (args.archetype || 'classic') + ')')
  console.log('  - DESIGN page bodies for the 14 stubs in pages/')
  console.log('  - Use brand tokens (var(--color-*), var(--brand-image-*)) — never hardcode hex')
  console.log('  - Then: npm run theme:sync; npx tsc --noEmit; node tools/audit-theme.mjs --id ' + newId)
}

async function pruneEmptyDirs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const sub = path.join(dir, entry.name)
      await pruneEmptyDirs(sub)
      const remaining = await fs.readdir(sub).catch(() => [])
      if (remaining.length === 0) {
        await fs.rmdir(sub).catch(() => {})
      }
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(1)
})
