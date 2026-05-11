#!/usr/bin/env node
/**
 * audit-theme.mjs
 *
 * Static-analysis quality gate for a brandstudio theme. Checks the rules
 * the team cares about for prospect-facing previews:
 *
 *   ACCESSIBILITY (blocker)
 *     a11y-img-no-alt          — <img>/<Image> without alt attribute
 *     a11y-h1-multiple         — more than one <h1> per page
 *     a11y-div-as-button       — <div onClick=> or <div role="button">
 *     a11y-form-field-faded-border — input/select border faded via
 *                                color-mix(... var(--*-border) <70%, transparent)
 *                                drops below visibility against card surfaces.
 *
 *   STANDARDS (blocker)
 *     std-anchor-empty         — <a> with no text content and no aria-label
 *     std-link-color-blanket   — :where(a)/:is(a) { color: ... } in base.css —
 *                                paints brand wordmarks wrapped in <Link> with
 *                                the wrong color.
 *
 *   STANDARDS (advisory)
 *     std-css-unscoped-global-rule — class selector in a global stylesheet
 *                                without a [data-theme-id] scope wrapper —
 *                                bleeds across themes bundled in the same
 *                                preview (see FEATURE_LOG 2026-05-08).
 *
 *   DATA FETCHING (blocker)
 *     data-useeffect-fetch     — useEffect that calls fetch() for initial data
 *
 *   DATA FETCHING (advisory)
 *     data-fetch-no-brand-param — fetch() / apiUrl() to a brand-scoped
 *                                endpoint (/api/inventory, /api/featured-
 *                                vehicles, etc.) without ?brand=<slug>;
 *                                falls back to default inventory.json.
 *
 *   TURBOPACK / FRAMEWORK (blocker)
 *     tp-use-client-on-page    — 'use client' on a page wrapper —
 *                                Turbopack chunk-item collision across
 *                                parallel themes. Extract interactivity
 *                                into a co-located components/<Name>.tsx
 *                                client island.
 *     tp-cross-folder-css-module — CSS module imported via parent-relative
 *                                path; always co-locate.
 *
 *   LIBRARY DEPENDENCIES (advisory)
 *     lib-hero-no-svg-fallback — Hero/PageHero uses var(--brand-image-*)
 *                                but doesn't render <HeroBackdrop> safety net.
 *
 *   MOBILE-FIRST RESPONSIVE (advisory)
 *     mobile-max-width-query   — CSS file uses @media (max-width:...) — prefer min-width
 *
 *   PERFORMANCE (advisory)
 *     perf-raw-img             — raw <img> instead of next/image
 *     perf-img-no-dimensions   — <img>/<Image> without width AND height
 *
 *   BRAND TOKENS (advisory)
 *     brand-hardcoded-color    — hex color outside allowed files (tokens.ts,
 *                                BrandStyles.tsx, color-policy.css)
 *
 * Exit codes:
 *   0  no blockers
 *   1  one or more blocker findings
 *   2  invalid input / file errors
 *
 * Usage:
 *   node tools/audit-theme.mjs --id <theme-id>          # audit one theme
 *   node tools/audit-theme.mjs --id <theme-id> --json   # machine output
 *   node tools/audit-theme.mjs --id <theme-id> --strict # advisory => blocker
 */

import { promises as fs } from 'node:fs'
import * as fsSync from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THIS_FILE = fileURLToPath(import.meta.url)
const TOOLS_DIR = path.dirname(THIS_FILE)
const PROJECT_ROOT = path.resolve(TOOLS_DIR, '..')
const THEMES_ROOT = path.join(PROJECT_ROOT, 'app', 'themes')

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

// --- finding helpers --------------------------------------------------------

function lineColumnFromIndex(content, index) {
  let line = 1
  let col = 1
  for (let i = 0; i < index; i++) {
    if (content.charCodeAt(i) === 10) {
      line++
      col = 1
    } else {
      col++
    }
  }
  return { line, col }
}

function findAllMatches(content, regex) {
  const out = []
  let m
  const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g')
  while ((m = re.exec(content)) !== null) {
    out.push({ index: m.index, match: m[0], groups: m })
    if (m.index === re.lastIndex) re.lastIndex++ // safety on zero-width
  }
  return out
}

function newFinding(rule, severity, file, content, index, message) {
  const { line, col } = lineColumnFromIndex(content, index)
  return { rule, severity, file: path.relative(PROJECT_ROOT, file), line, col, message }
}

// --- individual check rules -------------------------------------------------

function checkA11yImgAlt(file, content) {
  const findings = []
  // Both raw <img> and Next <Image>. Component name detection by tag.
  const tagRegex = /<(img|Image)\b([^>]*?)\/?>/gi
  for (const { match, index, groups } of findAllMatches(content, tagRegex)) {
    const attrs = groups[2] || ''
    if (!/\balt\s*=/i.test(attrs)) {
      findings.push(newFinding(
        'a11y-img-no-alt',
        'blocker',
        file,
        content,
        index,
        `<${groups[1]}> tag without alt attribute (use alt="" for decorative images)`,
      ))
    }
  }
  return findings
}

function checkA11yH1Multiple(file, content) {
  // Only meaningful on .tsx page files
  if (!file.endsWith('.tsx')) return []
  // Heuristic: count <h1 occurrences (not perfect — components composing pages
  // could still produce multiple at runtime, but this catches the obvious
  // template-level mistakes).
  const matches = findAllMatches(content, /<h1\b/gi)
  if (matches.length <= 1) return []
  return matches.slice(1).map((m) => newFinding(
    'a11y-h1-multiple',
    'blocker',
    file,
    content,
    m.index,
    `multiple <h1> tags in one file (${matches.length} total) — pages should have a single primary heading`,
  ))
}

function checkA11yDivAsButton(file, content) {
  const findings = []
  const re = /<div\b[^>]*\b(onClick|role="button")\b[^>]*>/gi
  for (const { index, match, groups } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'a11y-div-as-button',
      'blocker',
      file,
      content,
      index,
      `<div> used as a button (${groups[1]}) — use <button type="button"> for keyboard + screen-reader support`,
    ))
  }
  return findings
}

function checkStdAnchorEmpty(file, content) {
  const findings = []
  // Match <a ...>...</a> spanning lines; flag when the inner contents are
  // pure whitespace AND the tag has no aria-label.
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi
  for (const { index, groups } of findAllMatches(content, re)) {
    const attrs = groups[1] || ''
    const inner = groups[2] || ''
    const innerStripped = inner.replace(/\{[^}]*\}/g, 'X').replace(/<[^>]+>/g, 'X').trim()
    const hasAriaLabel = /\baria-label\s*=/i.test(attrs)
    if (!innerStripped && !hasAriaLabel) {
      findings.push(newFinding(
        'std-anchor-empty',
        'blocker',
        file,
        content,
        index,
        '<a> with no text content and no aria-label — screen readers cannot describe it',
      ))
    }
  }
  return findings
}

function checkDataUseEffectFetch(file, content) {
  if (!/\.tsx?$/.test(file)) return []
  // Matches useEffect(() => { ...fetch(... } ...). Multiline-aware.
  const re = /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[\s\S]{0,400}?\bfetch\s*\(/gi
  const findings = []
  for (const { index } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'data-useeffect-fetch',
      'blocker',
      file,
      content,
      index,
      'useEffect calling fetch() for initial data — prefer a Server Component or Route Handler so data lands at request time',
    ))
  }
  return findings
}

function checkMobileMaxWidthQuery(file, content) {
  if (!/\.css$/.test(file) && !/\.module\.css$/.test(file)) return []
  const re = /@media\s*\([^)]*max-width\s*:\s*(\d+(?:\.\d+)?)(px|em|rem)\b/gi
  const findings = []
  for (const { index, groups } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'mobile-max-width-query',
      'advisory',
      file,
      content,
      index,
      `@media max-width: ${groups[1]}${groups[2]} — prefer mobile-first (min-width) media queries; design for narrow first then progressively enhance`,
    ))
  }
  return findings
}

function checkPerfRawImg(file, content) {
  if (!/\.tsx$/.test(file)) return []
  // Only flag in .tsx files where next/image is conventionally available.
  const re = /<img\b/gi
  const findings = []
  for (const { index } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'perf-raw-img',
      'advisory',
      file,
      content,
      index,
      'raw <img> tag — use next/image for automatic optimization (srcset, lazy loading, dimensions, format negotiation). Allow the remote host in next.config.js if needed.',
    ))
  }
  return findings
}

function checkPerfImgNoDimensions(file, content) {
  if (!/\.tsx$/.test(file)) return []
  // Both raw <img> and next/image.
  const re = /<(img|Image)\b([^>]*?)\/?>/gi
  const findings = []
  for (const { index, groups, match } of findAllMatches(content, re)) {
    const attrs = groups[2] || ''
    const hasFill = /\bfill\b/.test(attrs)
    if (hasFill) continue // next/image with fill skips width/height
    const hasWidth = /\bwidth\s*=/.test(attrs)
    const hasHeight = /\bheight\s*=/.test(attrs)
    if (!hasWidth || !hasHeight) {
      findings.push(newFinding(
        'perf-img-no-dimensions',
        'advisory',
        file,
        content,
        index,
        `<${groups[1]}> missing width and/or height — causes layout shift (CLS); set explicit dimensions or use the fill prop on next/image`,
      ))
    }
  }
  return findings
}

function checkStdLinkColorBlanket(file, content) {
  // Flag blanket :where(a) { color: ... } (or :is(a)) rules in base.css.
  // These paint every anchor descendant of the theme — including <Link>
  // wrappers around brand wordmarks — with one color regardless of context,
  // breaking header/footer designs that intend a contextual color (e.g.
  // white wordmark on a dark header). Style links per-component instead.
  if (!/\.css$/.test(file)) return []
  const findings = []
  const re = /:(?:where|is)\s*\(\s*a\s*\)\s*\{[^}]*\bcolor\s*:/gi
  for (const { index } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'std-link-color-blanket',
      'blocker',
      file,
      content,
      index,
      ':where(a) / :is(a) blanket color rule — paints every anchor descendant including header/footer brand <Link>s. Style links per-component instead.',
    ))
  }
  return findings
}

function checkA11yFormFieldFadedBorder(file, content) {
  // Form inputs/selects need a visible border for affordance. A
  // `border: 1px solid color-mix(... var(--t-border) <50%, transparent)`
  // pattern fades an already-soft token border below visibility against
  // var(--t-card) / var(--color-surface). Floor: solid `var(--*-border)`.
  if (!/\.css$/.test(file)) return []
  const findings = []
  // Match: border[-...]: <width> <style> color-mix(in srgb, var(--*-border|--*-border-*) <pct>%, transparent)
  // …where pct is 5–55 (low/mid). Solid usage like `color-mix(... border 90%, white)`
  // doesn't trigger because the second slot is a real color, not transparent.
  const re = /border(?:-[a-z]+)?\s*:\s*[^;]*color-mix\s*\(\s*in\s+srgb\s*,\s*var\(\s*(--[a-zA-Z0-9-]*border[a-zA-Z0-9-]*)\s*\)\s+(\d{1,2})%\s*,\s*transparent\s*\)/gi
  for (const { index, groups } of findAllMatches(content, re)) {
    const pct = parseInt(groups[2], 10)
    if (pct >= 70) continue // 70–99 stays visible enough for most surfaces
    findings.push(newFinding(
      'a11y-form-field-faded-border',
      'blocker',
      file,
      content,
      index,
      `border uses color-mix(${groups[1]} ${pct}%, transparent) — token borders are already low-opacity, fading below 70% drops them below visibility. Use 'border: 1px solid var(${groups[1]})' for form fields/cards.`,
    ))
  }
  return findings
}

function checkBrandHardcodedColor(file, content) {
  // Allow these files to contain hex (they're the defining color sources).
  const allowAllHex = /tokens\.ts$/.test(file)
                     || /BrandStyles\.tsx$/.test(file)
                     || /color-policy\.css$/.test(file)
                     || /brandProps\.ts$/.test(file)
  if (allowAllHex) return []
  // Don't audit non-style files for hex content (test data, profiles, etc).
  if (!/\.(tsx?|css)$/.test(file)) return []

  const findings = []
  // 6-digit hex codes (allow 3-digit). Skip strict-grey (#000, #fff, #111111
  // black/white near-extremes are conventionally safe even outside tokens).
  const re = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g
  for (const { index, match } of findAllMatches(content, re)) {
    const hex = match.replace('#', '').toLowerCase()
    // Skip safe greyscale (R==G==B): black, white, common neutrals.
    const r = hex.length === 3 ? hex[0]+hex[0] : hex.slice(0, 2)
    const g = hex.length === 3 ? hex[1]+hex[1] : hex.slice(2, 4)
    const b = hex.length === 3 ? hex[2]+hex[2] : hex.slice(4, 6)
    if (r === g && g === b) continue
    findings.push(newFinding(
      'brand-hardcoded-color',
      'advisory',
      file,
      content,
      index,
      `hardcoded color ${match} outside the brand-token system — use var(--color-...) so brands can override`,
    ))
  }
  return findings
}

// === Turbopack-collision prevention rules =================================
// Lessons baked in from the columbus-vehicles-bespoke build (FEATURE_LOG
// 2026-05-10). Both rules block: the failure mode is a runtime parse error
// surfaced as "Code generation for chunk item errored / Expected export to
// be in eval context X, exports has Y" — Turbopack's parsed-exports record
// for a 'use client' chunk-item ends up shared between two themes whose
// page paths are parallel.

function checkTpUseClientOnPage(file, content) {
  // Page wrappers under pages/**/page.tsx must be Server Components.
  // Interactive logic lives in co-located client islands at components/<Name>.tsx.
  const norm = file.replace(/\\/g, '/')
  const isPageWrapper = /\/pages\/[^/]+\/page\.tsx$/.test(norm)
                     || /\/pages\/[^/]+\/\[[^\]]+\]\/page\.tsx$/.test(norm)
  if (!isPageWrapper) return []
  // Allow leading line/block comments before the directive check.
  const m = /^\s*(?:\/\*[\s\S]*?\*\/\s*|\/\/[^\n]*\n\s*)*['"]use client['"]/.exec(content)
  if (!m) return []
  return [newFinding(
    'tp-use-client-on-page',
    'blocker',
    file,
    content,
    m.index || 0,
    `'use client' directive on a page wrapper. Pages must be Server Components — extract interactivity into co-located components/<Name>.tsx client islands. See FEATURE_LOG 2026-05-10 for the Turbopack chunk-item collision rationale.`,
  )]
}

function checkTpCrossFolderCssModule(file, content) {
  if (!/\.tsx?$/.test(file)) return []
  const findings = []
  // Flag CSS-module imports that traverse out of the current folder
  // (`'../foo/page.module.css'`). Co-locate the CSS module beside the
  // file that consumes it instead.
  const re = /import\s+\w+\s+from\s+['"]((?:\.\.\/)+[^'"]+\.module\.css)['"]/g
  for (const { index, groups } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'tp-cross-folder-css-module',
      'blocker',
      file,
      content,
      index,
      `CSS module imported via a parent-relative path (${groups[1]}). Co-locate per page/component — cross-folder imports trip Turbopack's 'use client' chunk-item export tracking when the file's also marked use-client.`,
    ))
  }
  return findings
}

// === Foundation / library-dependency rules ================================

function checkStdCssUnscopedGlobalRule(file, content) {
  // Global stylesheets (base.css and friends — NOT *.module.css) must scope
  // every class-rule under :where(body[data-theme-id='<id>']) or
  // [data-theme-id='<id>']. Without that, a class rule in one theme will
  // bleed into any other theme bundled into the same preview, and source
  // order decides which wins. Past damage: gilded-drive's
  // `.contact-item svg { stroke: none }` blanked classic-dealer's contact
  // icons because both rules sat at (0,2,0) specificity and gilded-drive's
  // bundle loaded second.
  // Heuristic, advisory: in a global .css, flag class selectors at column 0
  // when the file contains no `data-theme-id` reference at all (cheap
  // approximation — full parsing would be more accurate but more brittle).
  if (!/\.css$/.test(file) || /\.module\.css$/.test(file)) return []
  if (/color-policy\.css$/i.test(file)) return [] // defines :root vars, not classes
  if (/data-theme-id/.test(content)) return [] // file is at least theme-aware
  const findings = []
  const re = /^[ \t]*(\.[A-Za-z][\w-]*(?:\s*[,:>+~][^{]*?)?)\s*\{/gm
  for (const { index, groups } of findAllMatches(content, re)) {
    findings.push(newFinding(
      'std-css-unscoped-global-rule',
      'advisory',
      file,
      content,
      index,
      `unscoped global rule "${groups[1].trim()}" — wrap in :where(body[data-theme-id='<theme-id>']) so this theme's CSS can't bleed into other themes loaded in the same preview.`,
    ))
  }
  return findings
}

function checkDataFetchNoBrandParam(file, content) {
  // Brand-scoped server fetches (e.g. /api/inventory) must thread the brand
  // slug as `?brand=<slug>` (or `&brand=<slug>`). Without it, server-to-server
  // requests resolve to 127.0.0.1 with no host or x-brand context and the API
  // falls back to the default inventory.json. Past damage: every uploaded
  // dealer inventory persisted on disk but never appeared in Latest Arrivals
  // / Directory / /used-cars because the fetches dropped the brand.
  if (!/\.tsx?$/.test(file)) return []
  if (!/[\\/](components|pages)[\\/]/.test(file)) return []
  const findings = []
  // Match fetch('/api/<endpoint>...') or apiUrl('/api/<endpoint>...') for the
  // brand-scoped endpoints, flagging when ?brand= / &brand= is missing.
  const re = /\b(?:fetch|apiUrl)\s*\(\s*[`'"](?:[^`'"]*?)\/(api\/(?:inventory|featured-vehicles|recently-sold|vehicle-images|advert-analytics)[^`'"]*)/g
  for (const { index, groups, match } of findAllMatches(content, re)) {
    if (/\bbrand=/.test(match)) continue
    findings.push(newFinding(
      'data-fetch-no-brand-param',
      'advisory',
      file,
      content,
      index,
      `fetch to /${groups[1]} without brand param — server fetches resolve to 127.0.0.1 and fall back to default inventory.json. Append \`&brand=\${slug}\` (use getBrandSlugFromRequest() server-side or useBrand().slug client-side).`,
    ))
  }
  return findings
}

function checkLibHeroNoSvgFallback(file, content) {
  // Hero/PageHero components that paint a brand image as background should
  // also render <HeroBackdrop> (the decorative SVG safety-net) so an unset
  // or 404'd brand image doesn't leave the section as flat charcoal.
  const norm = file.replace(/\\/g, '/')
  if (!/\/components\/[^/]*Hero[^/]*\.tsx$/i.test(norm)) return []
  if (!/var\(\s*--brand-image-/i.test(content)) return []
  if (/HeroBackdrop/.test(content)) return []
  return [newFinding(
    'lib-hero-no-svg-fallback',
    'advisory',
    file,
    content,
    0,
    `Hero component uses var(--brand-image-*) but does not render <HeroBackdrop>. Add the SVG fallback so unbranded previews don't render as flat color when the image is unset or 404s.`,
  )]
}

function checkLibNoAosOnHomepage(file, content) {
  // The homepage is the single most-visible page in any theme. If its
  // page.tsx body has zero `data-aos="..."` attributes, the page renders
  // statically with no scroll-reveal — feels dead. Advisory rather than
  // blocker: an editorial archetype might be intentionally still, but the
  // default is "homepage should breathe".
  const norm = file.replace(/\\/g, '/')
  if (!/\/pages\/home\/page\.tsx$/.test(norm)) return []
  if (/data-aos\s*=/.test(content)) return []
  return [newFinding(
    'lib-no-aos-on-homepage',
    'advisory',
    file,
    content,
    0,
    `Homepage has no data-aos="..." attributes. Mount <AnimateOnScroll /> from app/widgets/AnimateOnScroll in Shell, then sprinkle data-aos="fade-up" / "zoom-in" etc. on at least the marquee sections so the page feels lively.`,
  )]
}

function checkMotionAosMinCount(file, content) {
  // Every page (home + inner pages) should have at least 2 data-aos entries
  // at the page level — section components mounted by the page typically carry
  // their own internal data-aos attrs, so 2 page-level entries is the bar
  // that ensures the page composes "with intent" rather than dropping in
  // sections statically. The home page gets a higher bar (4) since it's
  // the showpiece. Kept inventory pages are skipped.
  const norm = file.replace(/\\/g, '/')
  if (!/\/pages\/[^/]+\/page\.tsx$/.test(norm)) return []
  if (/\/pages\/used-cars\/page\.tsx$/.test(norm)) return []
  if (/\/pages\/used-cars\/\[slug\]\/page\.tsx$/.test(norm)) return []
  const isHome = /\/pages\/home\/page\.tsx$/.test(norm)
  const minCount = isHome ? 4 : 2
  const matches = content.match(/data-aos\s*=/g) || []
  if (matches.length >= minCount) return []
  return [newFinding(
    'motion-aos-min-count',
    'advisory',
    file,
    content,
    0,
    `Page has only ${matches.length} data-aos attribute(s) — Quality Bar requires at least ${minCount} staggered entry animations per ${isHome ? 'homepage' : 'page'}. Vary the variants (fade-up / zoom-in / slide-up / flip-up / blur-in etc) and stagger via data-aos-delay so the page feels lively rather than mechanical.`,
  )]
}

function checkMotionNoAnimatedGlow(file, content) {
  // Theme-wide check anchored to base.css. Looks at base.css + every sibling
  // .tsx/.css under the theme directory for any of:
  //   - mfx-glow-pulse / mfx-glow-orbit / mfx-pulse-dot / mfx-shimmer /
  //     mfx-scan / mfx-text-glow / mfx-border-glow / mfx-float / mfx-tilt
  //     (the MotionFX utility classes)
  //   - @keyframes definitions (per-theme custom animations)
  //   - data-mfx-scroll attributes (scroll-tied effects)
  // If none found anywhere in the theme, surface the advisory once on the
  // base.css file. Themes without motion feel lifeless on real devices.
  const norm = file.replace(/\\/g, '/')
  if (!/\/styles\/base\.css$/.test(norm)) return []
  const themeDir = norm.replace(/\/styles\/base\.css$/, '')
  let hasMotion = false
  try {
    const walk = (dir) => {
      let entries
      try { entries = fsSync.readdirSync(dir, { withFileTypes: true }) } catch { return }
      for (const entry of entries) {
        if (hasMotion) return
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(full)
        } else if (/\.(tsx?|css)$/.test(entry.name)) {
          let text
          try { text = fsSync.readFileSync(full, 'utf8') } catch { continue }
          if (
            /mfx-(glow|pulse-dot|shimmer|scan|float|tilt|border-glow|text-glow|rotate-slow|grid-drift|fade-loop)/.test(text) ||
            /data-mfx-scroll\s*=/.test(text) ||
            /@keyframes\s+\w+/i.test(text)
          ) {
            hasMotion = true
            return
          }
        }
      }
    }
    walk(themeDir.split('/').join(path.sep))
  } catch {
    // If filesystem walk fails for any reason, default to "no motion" so
    // the advisory still fires — better to nag than to silently pass.
  }
  if (hasMotion) return []
  return [newFinding(
    'motion-no-animated-glow',
    'advisory',
    file,
    content,
    0,
    `Theme has no animated glow / motion primitives anywhere. Add at least one of: <span className="mfx-glow-pulse" />, <div className="mfx-glow-orbit" />, .mfx-pulse-dot on a status chip, .mfx-shimmer on the primary CTA, .mfx-text-glow on the hero highlight phrase, data-mfx-scroll on the hero, OR a per-theme @keyframes definition. Static radial-gradient backdrops feel lifeless on real devices.`,
  )]
}

function checkMotionNoScrollTied(file, content) {
  // Every homepage should have at least one `data-mfx-scroll="..."`
  // attribute to drive a parallax / sticky-fade / blur-on-exit effect.
  // The companion <ScrollProgress /> widget sets `--mfx-progress` on
  // these elements; without any, the homepage has zero scroll-tied motion
  // and the parallax driver runs for nothing. Advisory.
  const norm = file.replace(/\\/g, '/')
  if (!/\/pages\/home\/page\.tsx$/.test(norm)) return []
  if (/data-mfx-scroll\s*=/.test(content)) return []
  return [newFinding(
    'motion-no-scroll-tied',
    'advisory',
    file,
    content,
    0,
    `Homepage has no data-mfx-scroll="..." attributes. Wire at least one scroll-tied effect (parallax-slow / parallax-medium / fade-out-on-exit / zoom-on-enter) so the user feels page depth as they scroll. See @/app/widgets/ScrollProgress.`,
  )]
}

const RULES = [
  checkA11yImgAlt,
  checkA11yH1Multiple,
  checkA11yDivAsButton,
  checkA11yFormFieldFadedBorder,
  checkStdAnchorEmpty,
  checkStdLinkColorBlanket,
  checkDataUseEffectFetch,
  checkMobileMaxWidthQuery,
  checkPerfRawImg,
  checkPerfImgNoDimensions,
  checkBrandHardcodedColor,
  checkTpUseClientOnPage,
  checkTpCrossFolderCssModule,
  checkStdCssUnscopedGlobalRule,
  checkDataFetchNoBrandParam,
  checkLibHeroNoSvgFallback,
  checkLibNoAosOnHomepage,
  checkMotionAosMinCount,
  checkMotionNoAnimatedGlow,
  checkMotionNoScrollTied,
]

// --- ignore directives ------------------------------------------------------
// Inline:  // audit-ignore: rule1,rule2          (same line OR line above the finding)
// File:    // audit-ignore-file: rule1,rule2     (anywhere in the file; applies whole file)

// Replace JS/TS/JSX comments with spaces (keeping line breaks and string
// length intact) so subsequent regex-based rule matchers see the same
// line/column positions as the original content but without comment text
// triggering code-shape rules. Handles `// ...`, `/* ... */`, and JSX
// `{/* ... */}`.
function stripCommentsPreservingLines(content) {
  const len = content.length
  const out = new Array(len)
  let i = 0
  let inLine = false
  let inBlock = false
  let inString = null // string delimiter when inside a string literal
  while (i < len) {
    const ch = content[i]
    const next = content[i + 1]
    if (inLine) {
      if (ch === '\n') { inLine = false; out[i] = '\n' } else { out[i] = ' ' }
      i++; continue
    }
    if (inBlock) {
      if (ch === '*' && next === '/') {
        out[i] = ' '; out[i + 1] = ' '; i += 2; inBlock = false; continue
      }
      out[i] = ch === '\n' ? '\n' : ' '
      i++; continue
    }
    if (inString) {
      out[i] = ch
      if (ch === '\\' && next !== undefined) { out[i + 1] = next; i += 2; continue }
      if (ch === inString) inString = null
      i++; continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch; out[i] = ch; i++; continue
    }
    if (ch === '/' && next === '/') { inLine = true; out[i] = ' '; out[i + 1] = ' '; i += 2; continue }
    if (ch === '/' && next === '*') { inBlock = true; out[i] = ' '; out[i + 1] = ' '; i += 2; continue }
    out[i] = ch
    i++
  }
  return out.join('')
}

function parseRuleList(raw) {
  // Extract valid rule-name tokens only (kebab-case identifiers).
  // This lets ignore directives carry trailing prose:
  //   audit-ignore: a11y-div-as-button — backdrop, dialog handles keyboard
  // …and still parse the rule name correctly.
  const matches = String(raw || '').match(/[a-z][a-z0-9-]+/g) || []
  // Filter to only known rule names by accepting anything that starts with
  // a category prefix we use (a11y, std, data, mobile, perf, brand).
  const knownPrefixes = /^(a11y|std|data|mobile|perf|brand|tp|lib)-/
  return new Set(matches.filter((token) => knownPrefixes.test(token)))
}

function parseFileIgnores(content) {
  const ignores = new Set()
  const re = /\/\/\s*audit-ignore-file:\s*([^\n]+)|\/\*\s*audit-ignore-file:\s*([^*]+?)\s*\*\//g
  let m
  while ((m = re.exec(content)) !== null) {
    for (const r of parseRuleList(m[1] || m[2])) ignores.add(r)
  }
  return ignores
}

function parseLineIgnores(content) {
  const byLine = new Map()
  const lines = content.split(/\r?\n/)
  const re = /\/\/\s*audit-ignore:\s*([^\n]+)|\/\*\s*audit-ignore:\s*([^*]+?)\s*\*\//
  for (let i = 0; i < lines.length; i++) {
    const m = re.exec(lines[i])
    if (m) byLine.set(i + 1, parseRuleList(m[1] || m[2]))
  }
  return byLine
}

// --- output formatting ------------------------------------------------------

const SEV_COLOR = {
  blocker: '\x1b[31m',  // red
  advisory: '\x1b[33m', // yellow
}
const RESET = '\x1b[0m'

function formatFindings(findings) {
  const byFile = new Map()
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, [])
    byFile.get(f.file).push(f)
  }

  let out = ''
  const sortedFiles = Array.from(byFile.keys()).sort()
  for (const file of sortedFiles) {
    out += `\n${file}\n`
    const list = byFile.get(file).sort((a, b) => a.line - b.line || a.col - b.col)
    for (const f of list) {
      const sev = `${SEV_COLOR[f.severity] || ''}${f.severity.padEnd(8)}${RESET}`
      out += `  ${f.line}:${f.col}  ${sev}  ${f.rule}\n`
      out += `         ${f.message}\n`
    }
  }
  return out
}

// --- main -------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.id) {
    console.error('Missing --id <theme-id>')
    process.exit(2)
  }

  const themeDir = path.join(THEMES_ROOT, args.id)
  try {
    await fs.access(themeDir)
  } catch {
    console.error(`Theme folder not found: ${themeDir}`)
    process.exit(2)
  }

  const allFiles = await walk(themeDir)
  const auditFiles = allFiles.filter((f) => /\.(tsx?|css)$/.test(f))

  const findings = []
  for (const file of auditFiles) {
    const rawContent = await fs.readFile(file, 'utf8')
    const fileIgnores = parseFileIgnores(rawContent)
    const lineIgnores = parseLineIgnores(rawContent)
    // Strip comments before matching code-shape rules so JSDoc / JSX
    // comments that reference forbidden patterns ("don't use <div onClick=>")
    // don't trip false positives. Line numbers are preserved by replacing
    // comment characters with spaces.
    const content = stripCommentsPreservingLines(rawContent)

    for (const rule of RULES) {
      try {
        const ruleFindings = rule(file, content)
        for (const f of ruleFindings) {
          if (fileIgnores.has(f.rule)) continue
          // Allow ignore directive on the same line OR the line above the finding.
          const sameLine = lineIgnores.get(f.line)
          const aboveLine = lineIgnores.get(f.line - 1)
          if ((sameLine && sameLine.has(f.rule)) || (aboveLine && aboveLine.has(f.rule))) continue
          findings.push(f)
        }
      } catch (err) {
        console.error(`rule ${rule.name} threw on ${file}: ${err.message}`)
      }
    }
  }

  // === Cross-file post-pass rules ==========================================
  // `lib-missing-color-policy`: kept inventory CSS modules reference role
  // tokens (var(--t-border), var(--t-card), etc.) defined in
  // styles/color-policy.css. The skeleton scaffolder used to prune that
  // file — without it, every form-field border rendered washed-out (Columbus
  // pre-fix). This post-pass fires once per theme if the gap is detected.
  const usesRoleTokens = []
  let hasColorPolicy = false
  for (const filePath of auditFiles) {
    const norm = filePath.replace(/\\/g, '/')
    if (/\/styles\/color-policy\.css$/.test(norm)) hasColorPolicy = true
    if (/\.(css|tsx?|module\.css)$/.test(filePath)) {
      const raw = await fs.readFile(filePath, 'utf8').catch(() => '')
      if (/var\(\s*--t-[a-z]/i.test(raw)) usesRoleTokens.push(filePath)
    }
  }
  if (usesRoleTokens.length > 0 && !hasColorPolicy) {
    const exemplar = usesRoleTokens[0]
    findings.push({
      rule: 'lib-missing-color-policy',
      severity: 'blocker',
      file: path.relative(PROJECT_ROOT, exemplar),
      line: 1,
      col: 1,
      message:
        `Theme references --t-* role tokens in ${usesRoleTokens.length} file(s) but is missing styles/color-policy.css. ` +
        `The role tokens won't resolve, leaving form-field borders + card surfaces effectively invisible. ` +
        `Add styles/color-policy.css mapping each --t-* used to its --color-* brand-token equivalent (see columbus-vehicles-bespoke for the minimum 7-token mapping).`,
    })
  }

  // `lib-missing-cookie-banner`: every dealer site needs a GDPR consent
  // banner. Fires if the theme's Shell.tsx exists but doesn't mount one.
  // Acceptable mounts: <CookieBanner …/> from @/app/widgets/CookieBanner
  // (preferred — the brandstudio global widget) OR a per-theme component
  // imported via './CookieBanner' (legacy springalls-classic pattern).
  // Advisory rather than blocker because some preview contexts (embedded
  // admin views, intranet) legitimately don't need consent.
  let shellPath = null
  let shellMountsCookieBanner = false
  for (const filePath of auditFiles) {
    const norm = filePath.replace(/\\/g, '/')
    if (/\/components\/Shell\.tsx$/.test(norm)) {
      shellPath = filePath
      const raw = await fs.readFile(filePath, 'utf8').catch(() => '')
      // Any <CookieBanner ... /> JSX mount counts. Also accept a default-import
      // alias under a different name as long as the import path mentions
      // CookieBanner (catches `import Banner from '..../CookieBanner'`).
      if (/<CookieBanner\b/.test(raw) || /CookieBanner\b[^'"]*['"]/.test(raw)) {
        shellMountsCookieBanner = true
      }
    }
  }
  if (shellPath && !shellMountsCookieBanner) {
    findings.push({
      rule: 'lib-missing-cookie-banner',
      severity: 'advisory',
      file: path.relative(PROJECT_ROOT, shellPath),
      line: 1,
      col: 1,
      message:
        `Shell does not mount a CookieBanner. UK dealer sites need GDPR consent — prefer the brandstudio global widget at @/app/widgets/CookieBanner over re-rolling per theme.`,
    })
  }

  const blockers = findings.filter((f) => f.severity === 'blocker')
  const advisories = findings.filter((f) => f.severity === 'advisory')

  if (args.json) {
    process.stdout.write(JSON.stringify({
      themeId: args.id,
      filesAudited: auditFiles.length,
      blockerCount: blockers.length,
      advisoryCount: advisories.length,
      findings,
    }, null, 2) + '\n')
  } else {
    console.log(`Theme audit: ${args.id}`)
    console.log(`Files scanned: ${auditFiles.length} (.tsx/.ts/.css)`)

    if (findings.length === 0) {
      console.log(`\n  ${SEV_COLOR.blocker.replace('31', '32')}OK${RESET}: no findings`)
    } else {
      process.stdout.write(formatFindings(findings))
      console.log('')
      const summary = `Summary: ${blockers.length} blocker(s), ${advisories.length} advisory finding(s)`
      const tag = blockers.length > 0
        ? `${SEV_COLOR.blocker}BLOCKED${RESET}`
        : `${SEV_COLOR.blocker.replace('31', '32')}OK${RESET}`
      console.log(`  ${tag}: ${summary}`)
    }
  }

  if (blockers.length > 0) process.exit(1)
  if (args.strict && advisories.length > 0) process.exit(1)
  process.exit(0)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error))
  process.exit(2)
})
