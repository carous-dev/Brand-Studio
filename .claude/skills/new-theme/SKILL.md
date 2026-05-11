---
name: new-theme
description: Generate a fully bespoke brandstudio theme for a real dealer from their logo and website URL — vision-extracts dominant colors and typography character from the logo, scrapes the dealer site for brand context (name, services, location, hours), picks a paired Google Font, scaffolds the entire theme contract, adapts hero/header/footer to the dealer's content, and ships a previewable theme. Also supports an advanced "port from carous-platform sibling app" mode for internal use. Designed for prospect-customer preview generation with two user inputs (logo + URL) and zero further interaction.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite, WebFetch, AskUserQuestion
---

# `/new-theme` — automated brandstudio theme generator

Creates a fully working theme under `app/themes/<theme-id>/` for any dealer.
Two modes:

- **Mode A — Bespoke from logo + URL** (default).
  User provides a logo file and the dealer's website URL. The skill
  vision-extracts colors and typography character from the logo, scrapes
  the dealer site for content (brand name, services, address, hours, hero
  imagery), picks a Google Font that pairs with the logo's character, and
  ships a custom theme adapted to the dealer's brand.
- **Mode B — Port from a carous-platform sibling** (advanced).
  Caller passes `--from <app-folder>`. DNA gets extracted from the named
  carous-platform app's `globals.css` / `layout.tsx` / `theme-style.json`.
  Useful for internal porting between sibling dealer apps; not the prospect
  preview path.

## Invocation

```
/new-theme                            # Mode A — skill prompts for logo + URL
/new-theme <theme-id>                 # Mode A with caller-supplied id
/new-theme --from <app>               # Mode B — carous-platform port
/new-theme <id> --from <app>          # Mode B with explicit id
```

Examples:

- `/new-theme` → skill asks for logo + URL, builds a bespoke theme for that
  dealer.
- `/new-theme huntsmotors-cobalt --from huntsmotors` → ports the
  huntsmotors carous-platform app into a new theme.

## Prerequisites checklist

Before doing anything else, confirm:

1. Working directory is the **brandstudio repo root** — the folder
   containing `package.json`, `app/`, and `tools/`. Path varies per
   machine (Windows / macOS / Linux); the skill never assumes a
   specific drive letter. If you're not at the repo root, `cd` there
   first.
2. `tools/scaffold-theme-skeleton.mjs` exists for Mode A and
   `tools/scaffold-theme.mjs` exists for Mode B. (Mode A doesn't need
   `extract-theme-dna.mjs`; Mode B does.)
3. **For Mode B only**: a `carous-platform` checkout is reachable.
   Resolution order: `--apps <path>` CLI arg → `CAROUS_PLATFORM_APPS`
   env var → `../carous-platform/apps` (sibling of brandstudio) →
   `../../carous-platform/apps`. `extract-theme-dna.mjs` errors with
   a clear "could not locate" message if none of those resolve.

## Quality Bar — every theme must clear this

Prospect previews go to dealers. A broken-looking preview costs us trust
and a sale. These are the non-negotiables every generated theme must hit.
The audit tool (`tools/audit-theme.mjs`) enforces the mechanical ones in
Phase 10c; the principles below cover what the tool can't reliably check.

**Web standards (must-have):**
- Semantic HTML — `<main>`, `<nav>`, `<header>`, `<footer>`, `<article>`,
  `<section>` over generic `<div>`. Single `<h1>` per page (paired
  conditional h1s in mutually-exclusive branches are OK if annotated).
- Real interactive elements — `<button type="button">` for click handlers,
  not `<div onClick=>`. `<a href>` for navigation, not script-only divs.
- Form labels — every `<input>` has an associated `<label>` (wrapping or
  via `htmlFor`/`id`). Required fields marked with `aria-required`.
- Focus states — never `outline: none` without a custom replacement that
  meets 3:1 contrast. Tab order matches visual order.
- Lang attribute — set on the root html (already handled by Next layout).
- Dialogs/modals — `role="dialog" aria-modal="true"` + Escape-to-close +
  focus trap. Backdrop click can be a convenience, not the only way out.

**UI/UX (must-have):**
- Touch targets ≥ 44×44px on mobile. Buttons, links, form fields.
- Loading states — skeletons or spinners while data resolves; never blank
  panels. Suspense boundaries around server components that fetch.
- Error states — every form, every fetch, every async path has a visible
  failure message users can act on.
- Reduced motion — respect `@media (prefers-reduced-motion: reduce)` on
  any animation longer than ~200ms.
- No color-only signals — pair color with icon/text (e.g. error = red +
  warning icon, not red alone). Older buyers and color-blind users matter.
- Skip-to-content link in the shell. The skeleton scaffolder's Shell stub
  ships with this; preserve it through Phase 8 design.

**Mobile-first responsive (must-have):**

> **Core principle:** Mobile is **NOT** a shrunken desktop — it's a
> simplified, focused experience. Carous dealer sites get 60%+ mobile
> traffic, mostly older buyers on a single hand, in a hurry. Every section
> on mobile should answer one question: "what is this for and what do I
> tap?" Desktop can be rich, layered, and exploratory; mobile must be
> calm, linear, and obvious. Design the mobile view _first_, then add
> desktop complexity at `min-width` breakpoints — never the other way
> around.

_Mechanical rules:_
- Base styles target the smallest viewport (~360–375px wide). Larger
  breakpoints _add_ via `@media (min-width: ...)`, never `max-width`. The
  audit warns on any `max-width` media query.
- Tailwind classes (where used) scale up: `text-base md:text-lg lg:text-xl`,
  not the other way around.
- Container widths use `clamp()` or `max-width` constraints, not fixed
  pixel widths above mobile sizes.
- Hero text uses fluid typography (`clamp()`) so it scales across viewports
  without a stack of breakpoint overrides.
- Header collapses to a hamburger on narrow viewports. Footer columns stack
  on mobile, grid on tablet+.
- Test mentally at 360px, 768px, 1024px, 1440px. If a layout depends on
  one viewport size to look right, redo it.

_Simplification rules (what mobile drops, hides, or collapses):_
- **One column by default below 640px.** Multi-column grids (cards-in-3,
  features-in-4, footer-in-5) stack to a single column. Two-column on
  mobile is allowed only for genuinely paired items (e.g. icon + label
  rows, label/value pairs in a spec table) — never for cards or sections.
- **Hide decorative layers ≤ 640px.** `mfx-glow-pulse`, `mfx-grid-drift`,
  `.scanline`, corner reticles, parallax, geometric SVG overlays, blur
  blobs, gradient meshes — `display: none` or `opacity: 0` on narrow
  viewports. Restate: zero or one decorative layer in the first mobile
  viewport, max. (See also "Mobile strip" in the Pitfalls catalogue.)
- **Demote secondary CTAs.** If desktop shows 3 CTAs in the hero
  (Browse / Sell / Finance), mobile shows ONE primary CTA full-width
  + at most one ghost-button below. Tertiary CTAs live in the nav or
  further down the page — never compete in the hero on mobile.
- **Trim chips and badges.** Trust badges, feature chips, stat
  counters, "X years in business / Y cars sold / Z reviews" rows — pick
  the strongest one or two for mobile. A horizontal scroll rail of chips
  is allowed; a wrapping cluster of 8+ chips is not.
- **Single-image hero on mobile.** Desktop split-screens, image collages,
  before/after pairs, and stacked-card hero layouts collapse to ONE
  hero image (or a solid brand-color/gradient panel) with the title +
  one CTA. Save the layered visuals for ≥ 768px.
- **Hide the redundant.** If a stat appears in the hero AND a stat band
  below, hide one on mobile. If the sidebar repeats the price three
  times on detail pages, show it once + sticky bottom bar (see Pitfalls
  §"Hide the desktop sidebar's redundant info on mobile").
- **Bottom-anchor sticky CTAs.** Long pages (vehicle detail, services,
  finance) get a `position: fixed; bottom: 0` action bar on mobile with
  the primary action (Enquire / Call / Apply). Desktop relies on sticky
  sidebars; mobile relies on this bar.
- **Vertical rhythm tightens, but breathes.** Section padding on mobile
  should be ~60–70% of desktop (`clamp(2.5rem, 6vw, 5rem)` not a flat
  `5rem`). Don't cram — but don't waste the half-screen either. Vertical
  scrolling is cheap on mobile; horizontal density is not.
- **Touch-rail any "row of N" that can't reasonably stack.** Logo
  strips, brand-trust rails, similar-vehicles, image galleries — convert
  to a horizontal swipeable rail (`overflow-x: auto; scroll-snap-type: x mandatory`)
  on mobile, grid on tablet+. Never force-shrink a 6-up grid into a
  6-up cramped row.
- **Nav overlay is full-screen, list-style, large-tap.** No multi-column
  mega-menus on mobile. Vertical list, each item ≥ 56px tall, with the
  Home link first (see Quality Bar §"Always include a Home link in nav").
  Include phone, WhatsApp, and social icons inside the overlay (see
  feedback memory §"Top contact bar essentials").
- **Forms: one field per row.** Even if desktop pairs first-name /
  last-name on a row, mobile stacks them. Labels above inputs (not
  side-by-side). Submit buttons full-width.
- **Modals: full-screen sheets on mobile, centered cards on desktop.**
  Don't render a centered 600px modal inside a 360px viewport with 90%
  width — make it a full-height bottom sheet or a true full-screen
  takeover with a clear close affordance in the top-right.
- **Font sizes step down, but not into illegibility.** Body text ≥ 16px
  on mobile (`text-base`). Hero titles use `clamp()` so they never
  exceed 2 lines (see Quality Bar §"Hero title fit"). Captions / meta
  ≥ 13px. Never use `text-xs` (12px) for anything a buyer needs to read.

_Test discipline:_
- Open Chrome DevTools in iPhone-13 mode (390×844) for the homepage and
  the vehicle detail page during Phase 8. If you can see >2 decorative
  layers, >1 multi-column grid, or any horizontal-scroll bleed at first
  paint, it's not done.
- A finished mobile view should let a first-time buyer reach the
  primary CTA (Browse stock / Call / Enquire) within one thumb-swipe.
  If they have to scroll past three decorative bands first, the
  hierarchy is wrong.

**Data fetching (must-have):**
- Server Components by default. Reach for `'use client'` only when the
  component genuinely needs interactivity (forms, hover states, modals,
  client-side state). Brand context (`useBrand`) is client-side; that's
  fine where it's used.
- Data that can be fetched at request time should be fetched at request
  time on the server — no `useEffect` + `fetch` for initial data. Auth
  state and live WebSocket reactions are legitimate exceptions.
- Inventory and brand data flow through Next App Router fetch with
  appropriate `next: { revalidate: <seconds> }` (seconds for vehicle
  inventory, longer for static brand info).
- Images: `next/image` with explicit `width`/`height` (or `fill` in a
  sized container). Lazy-load below the fold (next/image does this by
  default). For inventory thumbnails the dynamic remote host needs to be
  in `next.config.js` `images.remotePatterns`.
- Forms: rate-limit + honeypot (already in `useLeadsForm`). Validation
  client- + server-side. Submit handler returns a real `Promise` so the
  UI can show pending state.

**Brand-token discipline (must-have):**
- All color references in component/page CSS use `var(--color-...)` or
  `var(--t-...)` (the role tokens defined in `styles/color-policy.css`).
  Never hardcode brand-relevant hex codes outside `tokens.ts` /
  `BrandStyles.tsx` / `color-policy.css`.
- Pure neutrals (`#000`, `#fff`, `#111`, `#f5f5f5`-style greys) in scoped
  CSS rules are fine — they're not brand-driven.
- Typography uses `var(--font-ui-family-override)` and
  `var(--font-brand-family-override)` — set up by `BrandStyles.tsx`.

**CSS scoping discipline (must-have, learned 2026-05-08 from gilded-drive vs classic-dealer icon bleed):**
- **Every CSS rule that targets a class name in `styles/base.css` (or any global stylesheet) must be wrapped in `:where(body[data-theme-id='<this-theme-id>'])` or `[data-theme-id='<this-theme-id>']`.** Without that scoping, a `.contact-bar`, `.preview-banner`, `.social-link` rule from one theme will leak into every other theme bundled into the same preview, and source order decides which wins. Concrete past damage: gilded-drive's `.contact-item svg { stroke: none }` blanked classic-dealer's contact icons because its global rule out-specificity-tied classic-dealer's scoped rule. Use `:where(...)` for the scope wrapper to keep specificity at (0,1,0) so brand overrides via class still win.
- CSS *modules* (`*.module.css`) are inherently scoped (CSS-modules generates unique class names) — these don't need the wrapper. The rule is for global stylesheets only (`base.css`, `color-policy.css`, etc.).
- Skeleton scaffolder's `base.css` already namespaces its rules under the new theme's id when it rewrites identifiers — preserve that wrapping when adding new rules. Don't introduce a `:where(a) { color: ... }` style blanket — see Element-visibility hygiene below for the link-color-blanket lesson.

**Page wrappers are Server Components (must-have, learned 2026-05-10 from Turbopack chunk-item collision):**
- **Never put `'use client'` at the top of a `pages/**/page.tsx` file.** Two parallel themes (e.g. `springalls-classic` and `columbus-vehicles-bespoke`) with `'use client'` page wrappers at the same relative path collide in Turbopack's parsed-exports cache: it picks one theme's exported component name and uses it for the other theme's eval-context, throwing "Code generation for chunk item errored" at runtime. The collision regenerates after every restart.
- **Pattern**: every page is a Server Component composition. Client interactivity (forms, modals, garage state, anything reading `useGarage` / `useBrand` outside SSR) lives in a co-located component under `components/<Name>.tsx` with its own `'use client'` directive, and the page imports it. The wishlist/compare/contact/sell-your-car/part-exchange pages in `columbus-vehicles-bespoke` are the canonical example.
- Component names under `components/` should NOT mirror sibling themes' component names (use `<ColumbusContactForm>`, not `<ContactForm>`, when there's already a `<ContactForm>` in another theme — or just rely on theme-folder isolation if naming is unique already).

**Co-locate CSS modules with their importing file (must-have, learned 2026-05-10):**
- **Always import CSS modules from the same folder** — `import styles from './page.module.css'`, not `import styles from '../sell-your-car/page.module.css'`. Cross-folder CSS module imports trip Turbopack's export-tracking on `'use client'` files: it caches the parsed exports against the cross-folder file path and serves stale data on next request. Symptom: "Code generation for chunk item errored / <SomeOldExportName>" referencing a name that no longer exists in source.
- Tradeoff: ~150 lines of CSS may be duplicated between two similar pages (e.g. `sell-your-car/page.module.css` and `part-exchange/page.module.css`). Take the duplication; the alternative is the parse error that takes 30 minutes to diagnose every time.

**Kept-page CSS independence (must-have, learned 2026-05-10):**
- The skeleton scaffolder keeps a few pages with substantial logic (`used-cars/`, `used-cars/[slug]/`, `recently-sold/`). **The CSS those kept pages reference must also belong to this theme** — never to a global class name defined in another theme's `base.css` that the scaffolder pruned. If a kept page renders unstyled in the new theme, the fix is to write theme-owned CSS for that page in Phase 8, not to reach into another theme's stylesheet.

**Define your own role tokens (must-have, learned 2026-05-10):**
- Inventory pages and several section components reference `--t-*` role tokens (`--t-page`, `--t-card`, `--t-border`, `--t-text`, `--t-muted`, `--t-icon-bg`, `--t-icon-bg-strong`). These are defined in `styles/color-policy.css` and must exist in every theme. The skeleton scaffolder keeps `color-policy.css` automatically; if you produce a theme by hand or surgical edit, make sure each `--t-*` resolves to a `var(--color-*)` brand token equivalent so dashboard edits propagate. A theme that uses `border: 1px solid var(--t-border)` but never defines `--t-border` will render every input as borderless.

**Brand-scoped server fetches (must-have, learned 2026-05-08 from new-theme inventory falling back to defaults):**
- **Server-side fetches to `/api/inventory`, `/api/featured-vehicles`, `/api/recently-sold` etc. must thread the brand slug as `?brand=<slug>` (or `&brand=<slug>`).** Without the brand param, the API server has no host or `x-brand` context (the request comes from `127.0.0.1:3000` server-to-server) and falls back to the default `inventory.json` instead of the per-brand `<slug>-inventory.json`. Symptom: dealer's uploaded vehicles persist on disk but never appear on Latest Arrivals / Directory / `/used-cars`.
- Pattern: server components call `getBrandSlugFromRequest()` (provided in `lib/brand-slug.server.ts`) and append `&brand=<slug>` to their `apiUrl()` call. Client components read `useBrand().slug` and pass it down — never call the hook outside React.

**Element-visibility hygiene (must-have, learned 2026-05-10):**
- **Never apply blanket `:where(a) { color: var(--color-primary) }` (or
  similar) in `base.css`.** Brand wordmarks, header logos, and footer
  pillars are usually wrapped in `<Link>` for navigation; they render as
  `<a>` and inherit any global anchor color rule, which makes them appear
  in the brand's primary color rather than the design intent (often white
  on a dark header, or accent on a coloured surface). Style links
  per-component (`.callCta`, `.footerLink`, etc.) and let `<a>` defaults
  fall through where context dictates.
- **Form inputs and selects must have a visible border at all surfaces.**
  A `1px solid var(--color-border)` (or the equivalent `--t-border` role
  token) is the floor — it stays visible against `var(--t-card)` /
  `var(--color-surface)` backgrounds. Avoid
  `border: 1px solid color-mix(in srgb, var(--*-border) 50%, transparent)`
  and similar fade patterns: token border colors are already low-opacity
  (e.g. `rgba(15,23,42,0.08)`), and mixing them further to transparency
  drops the effective opacity below the visibility threshold so the input
  appears borderless against the card. Same caution applies to dashed
  borders, focus rings, and skeleton outlines — solid token color or a
  named near-neutral, not an alpha-faded mix.
- Brand wordmark elements (`.brandWordmark`, `.brand`, header brand
  Link content) should set `color` explicitly (white on dark, accent on
  surface). Don't depend on inheritance from `<a>` defaults — even with
  the blanket `:where(a)` rule removed, future skin work could re-introduce
  it; explicit colors are defensive.

**Canonical inner-page routes (must-have, learned 2026-05-10 from ELE-theme `/sell-your-car` 404):**
- The Next.js app router only resolves URLs that match folders under
  `app/<slug>/page.tsx`. The currently routed inner-page slugs are:
  `/about`, `/contact`, `/services`, `/finance`, `/part-exchange`,
  `/sell-my-car`, `/used-cars`, `/recently-sold`, `/compare`,
  `/wishlist`, `/privacy-policy`, `/cookie-policy`.
- **Note `/sell-my-car` — NOT `/sell-your-car`.** Despite the page label
  reading "Sell your car", the route is `/sell-my-car`. Header nav,
  Footer link lists, hero CTAs, and any in-body links must use the
  routed slug, not the visible label.
- All theme `<Link href="...">` and `<a href="...">` references inside
  the theme must point to slugs in that whitelist. Any URL outside it
  404s — there is no per-theme route system that adds new top-level URLs.

**Header must have a visible background (must-have, learned 2026-05-10):**
- **Do NOT use `background: transparent` for the default header state**
  and rely on scroll-detection to fill it in. On the homepage, when the
  hero isn't dark or imagery-heavy, the nav links sit on the same plane
  as page content and become illegible at the top of the page. Either:
  (a) use a translucent backdrop-blur background that's visible
  immediately (`color-mix(in srgb, var(--color-bg) 92%, transparent)`
  with `backdrop-filter: blur(...)`) and intensify on scroll, or
  (b) use a solid `var(--color-bg)` or themed background at all times.
- Add a thin accent line below the header (gradient, brand-tinted) for
  visual separation — this is the kind of subtle detail the "futuristic /
  imagery-rich" requirement calls for.

**Always include a Home link in nav (must-have, learned 2026-05-10):**
- `NAV_ITEMS` must start with `{ label: 'Home', href: '/' }`. The brand
  wordmark is typically clickable and goes home, but UK car-buyer demos
  often skew older and expect an explicit "Home" item too — relying on
  "click the logo" as discovery is a regression we've been called out on.
- Mobile overlay nav and footer's primary nav must include Home as well.

**Hero title sizing — fit-in-2-lines max (must-have, learned 2026-05-11):**
- Hero titles that span 3+ lines on desktop look clumpsy. The headline
  should fit in **1 line on desktop, 2 lines maximum on mobile**. Cap the
  upper bound of the title `clamp()` to roughly `3.6rem` for a single-
  clause headline (e.g. "Quality used cars, honestly sold."); shorter
  two-word brand statements can go up to `4.4rem`; never beyond.
- The wrong pattern: `font-size: clamp(2.8rem, 6.4vw, 5.6rem)` on a long
  title like "BUILT FOR THE ROAD, BACKED FOR THE LONG HAUL." — at a 1920px
  viewport this lands at 5.6rem (89.6px) and wraps to 4 lines, looking
  oversized and amateurish. The right pattern: `clamp(2.2rem, 4.4vw, 3.6rem)`
  PLUS `max-width: 14ch` (or similar character cap, ~18ch for two-clause
  titles) on the title element so it never stretches edge-to-edge on
  ultrawide displays.
- Title text itself must be short. Two-clause headlines like "Quality
  used cars, built for the road." are the upper bound — three clauses
  is too many. If the dealer's brand voice needs three statements, split
  into eyebrow + title + lead (NOT one wrapped title).
- Audit rule `lib-hero-title-too-big` (deferred — when shipped, flag any
  hero CSS with a `clamp(...)` upper bound ≥ 4.5rem AND any title text
  longer than ~50 characters). Until shipped: eyeball at 1920px during
  Phase 8 and shrink if it wraps to 3+ lines.

**Top contact bar — required composition (must-have, learned 2026-05-11):**
- Every theme's top contact bar (above or as part of the Header) must
  include four things, in this order, to match the canonical UK-dealer
  layout that dealers expect:
  1. **Showroom location chip** — "{city}, {county}" pulled from
     `brand.location.address`. Use a small map-pin icon next to the text.
  2. **Live-stock / status chip** — pulsing `.mfx-pulse-dot` + "LIVE STOCK"
     or "OPEN NOW" label tied to `brand.openingHours` via the
     `use-working-hours` hook. Shows the dealer is operational without
     forcing the user to read the hours table.
  3. **Social icons** — Facebook, Instagram, YouTube, LinkedIn icons
     sourced from `brand.socialLinks` (UK dealers care about social
     presence; missing them makes the site look incomplete). Hide
     individual icons whose URL is empty in the brand record; if
     `brand.socialLinks` is absent entirely, hide the icon group but
     do NOT crash. Use accessible `<a>` elements with `aria-label`.
  4. **Phone CTA** — `tel:` link with a phone glyph, pulled from
     `brand.location.phone`. Always rightmost.
- The PreviewBanner widget sits **ABOVE** the top contact bar
  (`position: sticky; top: 0` on the banner; the contact bar below it).
  When `NEXT_PUBLIC_PREVIEW=1` is set, the banner is the first visible
  strip. When the env var isn't set, the banner returns null and the
  contact bar becomes the topmost strip — no layout shift either way.
- The mobile overlay nav must also surface the social icons (typically
  in the footer of the overlay sheet) so they're discoverable on touch
  devices where the desktop top bar is collapsed.

**Brand-uploaded images must render — `var(--brand-image-*)` plumbing (must-have, learned 2026-05-11):**
- The dashboard's `/update/<slug>` lets operators upload custom hero /
  about / services / finance / partExchange / sellYourCar / recentlySold
  images that override the theme's archetype defaults. The brand record
  stores them in `brand.images.<slot>` (URL strings); `BrandStyles.tsx`
  writes them as CSS variables (`--brand-image-hero`,
  `--brand-image-about`, etc.) onto `:root`.
- **Every visible image in every theme must reference these CSS variables**
  — not hardcoded paths, not inline `src` attributes, not theme-folder-
  scoped image references. The pattern: `background-image: var(--brand-image-<slot>)`
  on a CSS-module class that the component sets via its `.image` or
  `.media` element. The exception: dynamic inventory thumbnails sourced
  from `/api/inventory` (those are per-vehicle URLs and pass through as
  `<img src={v.image}>`).
- Slots and their canonical use:
  - `--brand-image-hero` — homepage Hero photo backdrop
  - `--brand-image-about` — About page PageHero, About section panels
  - `--brand-image-services` — Services page PageHero, services section
  - `--brand-image-finance` — Finance page PageHero, CtaBanner image
  - `--brand-image-part-exchange` — Part-ex page PageHero
  - `--brand-image-sell-your-car` — Sell-your-car page PageHero
  - `--brand-image-recently-sold` — Recently-sold page PageHero
- If the operator uploads via the dashboard but the image doesn't render,
  the fault is almost always: (a) a theme component using a hardcoded
  image path instead of the CSS variable, OR (b) a missing slot mapping
  in `BrandStyles.tsx` (the scaffolder generates all 7 by default — never
  remove them). Diagnose with `getComputedStyle(document.documentElement).getPropertyValue('--brand-image-hero')`
  in the browser console; if it's `none` or empty, the brand record
  doesn't have the slot set; if it's `url("...")` but the image doesn't
  render, the URL itself is wrong.
- Audit rule `lib-image-not-brand-driven` (deferred — when shipped, flag
  any `background-image: url(...)` in a theme CSS module that's NOT
  `var(--brand-image-*)` and NOT a decorative SVG data-URI). Until
  shipped: cross-check every Hero / PageHero / decorative image
  during Phase 8.

**Hero & PageHero text-contrast floor (must-have, learned 2026-05-10):**
- Any title/lead rendered ON TOP of an image or dark background must
  reach AAA-class legibility, not just AA. The pattern that has worked:
  (a) layer a strong gradient over the image — radial brand-tinted glow
  + linear dark overlay starting at `rgba(8, 11, 17, 0.86)` near the
  text and easing to ~0.55 at the far edge; (b) heading color `#ffffff`
  with `text-shadow: 0 2px 24px rgba(0,0,0,0.4)`; (c) lead color
  `#ffffff` at 92% opacity with a softer text-shadow. Never set the lead
  to `color-mix(in srgb, #ffffff 84%, transparent)` over imagery — that
  drops contrast at the edges where the photo is brightest. Title text
  on imagery-rich heroes uses solid white, not muted white.
- Inside-page heroes (`PageHero`) need stronger overlays than the
  homepage hero because they're often atop the same hero image with no
  hero-specific composition tuning. Default the `PageHero` gradient to
  the heavy preset and only weaken it if the photograph is genuinely
  light/uniform.
- **Specificity gotcha (do not set `color` on global `h1-h4` rules in
  `base.css`).** A rule like `[data-theme-id='<id>'] h1, [...] h2,
  [...] h3, [...] h4 { color: var(--color-text); }` resolves at
  specificity (0,1,1) and silently beats every CSS-module
  `.title { color: #ffffff }` rule (which is (0,1,0)) — making white-
  on-image hero titles render in dark `var(--color-text)` and disappear
  into the photo. The fix: leave global heading rules to typography
  only (`font-family`, `font-weight`, `letter-spacing`, `margin`) and
  let `color` cascade from `body` (light sections) or be set
  per-component (dark sections). If you must scope global heading rules
  by theme id, wrap the selector in `:where(...)` so its specificity
  drops to (0,0,0) and any per-component class overrides cleanly.

**Cookie banners (and section components) must NOT be one-size-fits-all (must-have, learned 2026-05-10):**
- **Supersedes the earlier "always mount `<CookieBanner />` from
  `@/app/widgets/CookieBanner`" rule (Pitfall row 16).** That widget is
  now a FALLBACK / starter, not the default for bespoke themes. Every
  bespoke theme should ship its own consent banner under
  `components/<Theme>CookieBanner.tsx` with a layout that fits the
  archetype:
  - classic / modern → slide-up corner card with inline chip toggles
  - luxury → tall right-side panel with editorial typography
  - rugged → full-width bottom dock, dark mode by default
  - prestige → magazine-style modal with split layout
  The consent payload shape MUST stay compatible (same localStorage key
  scheme — `${brandSlug}_cookie_consent` storing `{ prefs: { analytics,
  marketing }, updatedAt }`) so consolidated reporting can read either.
- The same principle applies to **every section component** (Hero,
  Header, Footer, ServiceHighlights, LatestArrivals, CTA, Reviews,
  Directory, PageHero, forms): vary layout, composition, decorative
  language, imagery treatment per archetype. Two themes that share the
  same JSX with only color tokens swapped are NOT two themes — they're
  one theme repainted. Re-shape the markup, not just the palette.
- The shared `<CookieBanner />` widget at `app/widgets/CookieBanner/`
  stays as institutional infrastructure (audit fallback, dashboard
  reference, future "consolidated consent log" reader). New themes
  reference it only as a structural starting point, never import it.

**Footer attribution to Carous Limited (must-have, learned 2026-05-10):**
- The bottom strip of every theme's footer must include:
  `Site by <a href="https://carous.co.uk" target="_blank" rel="noopener
  noreferrer">Carous Limited</a>`. This is the platform attribution that
  reassures dealers we're building on stable infrastructure (and is also
  a soft marketing surface). Style it subtly — brand-primary link color
  is fine, position between the copyright and the legal nav, never use a
  loud badge or logo block.

**Restraint and visual hierarchy — professional, not hacky (must-have, learned 2026-05-11; supersedes the maximalist clauses below):**
- The dominant failure mode for /new-theme themes is **overdesign**: too
  many font sizes, too many gradient surfaces, too many decorative
  layers stacked in every section, brand color dominating instead of
  accenting. The result reads as amateur-busy, not premium. This rule
  is the governing constraint — when a downstream rule (motion, futuristic,
  archetype spec) collides with this one, restraint wins.
- **Typography scale cap.** A single page may use ≤ 5 distinct font
  sizes total. One display size for hero / page-title, one heading size
  for section H2s, one sub-heading for H3, one body size, one small/
  caption. Anything beyond reads as inconsistent. Use `clamp()` to
  scale per viewport; don't introduce a new size for "this one card".
- **Gradient budget.** ≤ 2 gradient-painted surface backgrounds per
  page (hero gradient + one section band is the typical maximum).
  Other sections sit on `var(--color-bg)` / `var(--color-surface)`
  flat. Don't paint every alternating section in `--t-brand-gradient`
  / `--t-neon-gradient` — the eye has no resting place.
- **Brand color is the accent, not the surface.** The brand primary
  occupies ≤ ~25% of pixel area per page (CTAs, eyebrows, focus rings,
  one feature band). Most of the page surface is neutral (`var(--color-bg)`,
  `var(--color-surface)`). The brand "feeling" comes from the few
  high-impact moments, not from coverage. Filling every section with
  a brand-tinted background = a 1990s billboard.
- **Decorative-layer budget per section.** ≤ 2 decorative layers per
  section (e.g. hero gets photo + ONE of: grid pattern / glow / scanline
  / corner reticles — not all four). Section bands and inner pages
  typically get zero decorative layers — just type and content.
- **Mobile strip.** On viewports ≤ 640px, decorative layers (`mfx-glow-pulse`,
  `mfx-grid-drift`, `.scanline`, corner reticles, parallax) either
  hide via `display: none` / `opacity: 0` or scale to ≤ 50% intensity.
  Mobile demands clarity; decorative depth that worked on desktop
  becomes visual noise on a 360px screen. Test mentally at 360px during
  Phase 8 — if there are more than 2 visible decorative layers in the
  first viewport, cut.
- **Status-indicator restraint.** One `.mfx-pulse-dot` per visible
  viewport is the bar — typically the "Live stock" / "Available" chip.
  Every chip getting a pulse-dot drains the indicator's meaning;
  buyers stop noticing. Other chips stay static.
- **Shimmer restraint.** `.mfx-shimmer` belongs on the ONE dominant
  CTA per page (the "Browse stock" / "Apply" button in the hero). Not
  on every button, not on cards, not on chips. Shimmer everywhere =
  shimmer nowhere.
- **AOS restraint.** 2–3 staggered entry animations per page (the
  marquee moments) — NOT 4+. Quality > quantity. The previous "4+ per
  page" rule was producing themes where every other element flickered
  in; that's busyness, not liveliness.
- **Visual hierarchy per section.** Each section has ONE focal element
  — the headline, the photo, OR the CTA — not all three competing for
  attention. Subordinate elements stay quiet (smaller, lower-contrast,
  no motion). A hero with text-glow + chips with pulse-dots + shimmer
  CTA + corner reticles + grid pattern + parallax + scan line all at
  once has six attention-pullers; pick two.

The maximalist rules below (Modern / futuristic visual language, Motion
& light language) remain in force but should be read THROUGH this
restraint rule: their device lists are MENUS to pick 2-3 from, not
checklists to satisfy in full.

**Modern / futuristic visual language — choose 2-3 devices, not all (must-have, learned 2026-05-10, tempered 2026-05-11):**
- "Plain and predictable" layouts are a regression. So is "Phase 8
  applied every device on the menu". Phase 8 picks **2-3 of the
  devices below** — typically all concentrated in the hero, with the
  rest of the page running clean. The menu (NOT a checklist):
  - layered hero imagery (photo + decorative SVG + gradient + glow)
  - neon-tinted brand glow blobs on/around hero
  - gridded dot-pattern or vector grid background, subtly visible
  - corner-bracket / sci-fi reticle accents on hero media frames
  - chip-style status badges with pulsing dot indicators (live stock,
    in-store now, finance available, etc.)
  - text-gradient on key headlines (linear-gradient brand-mix on the
    visual primary phrase, NOT the entire title — pick the "highlight"
    word/phrase)
  - thin brand-tinted top-borders or bottom-borders on alternating
    sections, paired with section-eyebrow accents
  - asymmetric / staggered card layouts (avoid uniform N-up grids on
    EVERY section — break the rhythm at least once per page)
- Imagery-rich does NOT mean "more stock photos" and does NOT mean
  "stack every CSS device in one section". It means **2-3 well-chosen
  decorative moves per theme**, concentrated where they earn attention
  (the hero, one feature band) and absent from the rest of the page.
  Decorative tools survive the brand-token rules cleanly; they don't
  survive the restraint rule above if used profligately.

**Performance (should-have):**
- LCP image (the hero) uses `priority` on the `next/image` and has explicit
  dimensions to avoid layout shift.
- Bundle additions to `'use client'` components are scrutinized — heavy
  libs (e.g. moment, lodash) shouldn't ship to the client unless needed.
- CSS doesn't depend on JavaScript — the page must look reasonable with
  JS disabled (graceful degradation).

If any must-have can't be met for a specific theme (e.g. dealer site has
wildly unusual layout that doesn't translate cleanly to the section
contract), document the gap in the final report. Don't ship silently.

**Motion & light language — REQUIRED, not optional (must-have, learned 2026-05-11):**
- Static themes feel dead. Every bespoke theme MUST include motion and
  light primitives drawn from `app/widgets/MotionFX` (shared keyframes) and
  `app/widgets/AnimateOnScroll` (entry animations). Specifically:
  - **Animated glow blobs** — every hero, every CtaBanner, every
    full-bleed dark section must include at least one `.mfx-glow-pulse`
    or `.mfx-glow-orbit` (decorative ::before / aside) — NOT a static
    radial-gradient div. Static glows are the "I forgot to add motion"
    signature; animated glows (breathing every 6s, orbiting every 18s)
    make the page feel alive without being distracting.
  - **Pulsing status indicators** — every "Live stock" / "Online now" /
    "Available" chip uses the `.mfx-pulse-dot` class (not a static dot).
    The pulse signals freshness — the page is live data, not a static
    listing.
  - **Entry animations** — every page (home AND inner pages) must have
    at least 4 `data-aos="…"` decorated elements with staggered
    `data-aos-delay` values across the major sections. AOS variants:
    `fade-up` / `fade-down` / `fade-left` / `fade-right` /
    `fade-up-right` / `fade-up-left` / `zoom-in` / `zoom-in-up` /
    `flip-up` / `slide-up` / `blur-in`. Vary across sections — the same
    variant on every section is a tell of mechanical use.
  - **Scroll-tied motion** — every theme must include at least one
    `data-mfx-scroll` effect on the homepage (hero parallax, hero blur-
    on-exit, decorative aside zoom-on-enter, or section fade-out-on-exit).
    Use `parallax-slow` for hero photo backgrounds, `parallax-medium` for
    decorative SVG layers, `parallax-fast` for tiny accent decorations.
  - **Shimmer on primary CTAs** — every primary "Browse stock" / "Apply"
    button (the dominant CTA per page) carries `.mfx-shimmer` so it
    shimmers on hover. Cheap visual interest, no performance cost.
  - **Text-glow on hero highlight phrase** — the gradient-highlighted
    portion of the hero title (the brand-tinted text-gradient phrase)
    carries `.mfx-text-glow` for a subtle infinite glow loop. Adds
    futuristic feel without harming legibility.

  All MotionFX classes honour `prefers-reduced-motion: reduce` — they
  freeze in place when accessibility settings request it. Themes don't
  need to reimplement that.

  The Shell stub generated by the skeleton scaffolder already mounts
  `<AnimateOnScroll />`, `<MotionFX />` (CSS injector), and
  `<ScrollProgress />` (parallax driver). Phase 8 just sprinkles the
  classes + `data-aos` / `data-mfx-scroll` attributes; no per-theme
  motion plumbing required.

**Inventory pages MUST be redesigned per archetype, not inherited verbatim (must-have, learned 2026-05-11; reinforced by the autonomous-design clause below):**
- The skeleton scaffolder keeps the inventory list page's data layer
  (`pages/used-cars/page.tsx` server-fetch + `UsedCarsClient.tsx` state /
  filter / URL / normalization) because that logic is non-trivial and
  has no design payoff to rewrite. **Phase 8 MUST still redesign their
  presentation layer** — JSX, cards/list rows, CSS module — so the
  inventory page isn't visually identical to other themes.
- See `docs/inventory-design-library.md` for a **reference catalogue**
  of patterns sourced from real dealers. Read it for inspiration, then
  **synthesize** a fresh layout for this theme — don't copy a pattern
  verbatim. Two themes "using" the same pattern should still look
  materially different (chip-row composition, sort affordance, card
  chrome, scroll/snap behavior). Append your choices to the rotation
  table when the design lands.
- The audit's `inv-redesign-required` rule (advisory) targets the list
  page only — a future `inv-detail-redesign-required` rule should
  cover the detail page. Until that rule ships, the autonomous-design
  clause below is the contract.

**Autonomous independent designs — every page, every component (must-have, learned 2026-05-11 from NCR detail-page borrow):**
- **Every page in a /new-theme build must be designed independently for the
  theme.** That includes the vehicle detail page (`pages/used-cars/[slug]/page.tsx`),
  the recently-sold page, the inventory list page, the contact form layout,
  and every other inner page. Borrowing the render-layer structure from
  `springalls-classic` or another sibling theme — even when keeping it under
  an `audit-ignore-file` annotation — produces themes that feel like palette
  swaps of the same site. Difatha flagged this on the `ncr-van-sales-bespoke`
  vehicle detail page (it shipped with the Configurator-led pattern lifted
  near-verbatim from the inventory-design-library) and on prior themes.
- **The inventory-design-library is a REFERENCE / brain-prompt, not a copy
  source.** Read the patterns, pull ideas you like, then **synthesize** a
  fresh layout specific to this theme. Two themes ostensibly using the same
  "list pattern" should still look materially different — different chip-row
  composition, different sort/filter affordance, different empty/skeleton
  states, different scroll/snap behavior, different card chrome.
- **The vehicle detail page especially must have its own composition language**:
  hero (full-bleed photo / split / mixed media / sticky-thumb-rail),
  gallery (carousel / mosaic / scroll-stack / fullscreen-on-tap / lightbox),
  spec presentation (table / pull-quotes / inline-with-prose / accordion /
  pills / data-rings), finance presentation (sticky sidebar / dominant
  calculator / inline band / footer drawer), enquiry surface (inline form /
  drawer / WhatsApp-first / call-to-action panel). Mix-and-match — no two
  themes ship the same combination, even within the same archetype.
- **Required visual language for every theme** (extends the Motion &
  light language requirement above):
  - **Gradient backgrounds** — brand-token-driven, used on heroes, CTAs,
    section bands, and as accent washes behind cards/lists. Linear, radial,
    or conic; multi-stop with brand-mix; can layer with image. Do NOT use
    flat single-color section backgrounds for an entire page — sterile,
    dated. Reach for `--t-brand-gradient`, `--t-neon-gradient`,
    `--t-band-gradient`, or compose your own with `color-mix(in srgb, …)`.
  - **Geometric backgrounds** — abstract shapes (diagonal slashes,
    hexagons, dot grids, mesh patterns, blob masks, decorative SVG lines,
    corner-bracket reticles, scan-line accents). CSS-only patterns (no
    asset weight) or decorative SVG. Brand-tinted, semi-transparent so
    they sit behind content, not on top of it.
  - **Professional + simple is the ceiling.** Don't go overboard — a busy
    page with five competing patterns is worse than a clean page with one
    strong gradient. Aim for ONE primary gradient direction per section,
    ONE geometric motif per page, deployed consistently. Restraint reads
    as "professional"; clutter reads as "amateur".
- **The autonomy principle**: Claude decides the layout per page during
  Phase 8 without operator hand-holding. The skill encodes the
  constraints (Quality Bar + Pitfalls catalogue + reference libraries);
  the skill does NOT prescribe the answer. If a page exists in the
  skeleton, Phase 8 owns its design — full stop.

**Vehicle detail page composition (must-have, learned 2026-05-11 from chesterfield-motor-empire-bespoke review):**

The vehicle detail page is the deepest funnel surface — the single page where
buyers commit. It deserves more compositional rigour than any other page in
the theme. These six requirements apply to *every* `pages/used-cars/[slug]/page.tsx`:

- **Vary the gallery layout per theme.** Pick from (don't always default to
  carousel + thumbnail strip):
  - **Full-bleed mosaic** — main image full-width on the left, 2×2 thumbnail
    grid on the right, "+N gallery" pill on the last thumb that opens the
    lightbox (this is the layout in the Hunts Motors reference screenshot).
    Best for themes with strong photography.
  - **Sticky thumbnail rail** — vertical column of thumbnails fixed left,
    main image fills the rest. Compact, premium feel.
  - **Carousel + counter** — single main image with prev/next + a compact
    thumbnail strip below. Falls back gracefully on mobile.
  - **Mosaic-on-scroll** — vertical stack of all images on desktop, swipe
    carousel on mobile. Best for buyers who want to see everything before
    committing.
  Whichever pattern you pick, **thumbnails must be space-efficient** —
  compact grids or strips, not row-after-row of huge tiles. The user
  scrolling shouldn't have to wade through gallery to reach specs.

- **Use the official WhatsApp brand icon.** Anywhere the page links to
  `wa.me` / `whatsappUrl`, import `<WhatsAppIcon />` from
  `@/app/widgets/WhatsAppFab` — NOT a generic `MessageCircle` from lucide.
  The official mark reads as "WhatsApp" instantly; a generic chat bubble
  reads as "third-party chat" and undermines trust. The WhatsAppFab widget
  re-exports the icon from the same source of truth so there's no risk of
  drift. The audit's `lib-whatsapp-icon-generic` rule fires if a file uses
  `MessageCircle` alongside a wa.me link without importing `WhatsAppIcon`.

- **Enquiry is a modal, not an inline form.** Mount
  `<EnquiryModal />` from `@/app/widgets/EnquiryModal` and trigger it from
  multiple call-out points (sticky sidebar "Enquire", sticky mobile bar,
  hero "Enquire now", optional gallery overlay). The modal pattern:
  - Keeps the page scannable — buyers don't scroll past a 6-field inline
    form to reach the next section.
  - Reuses one form state across triggers — no duplicated validation code.
  - Matches the carous-platform vehicle apps' UX expectation (huntsmotors,
    csmotors, etc.) so dealers find it familiar.

  Pattern (Server-Component-safe — the modal is a client island invoked
  from a button):
  ```tsx
  // co-located client island
  'use client'
  import { EnquiryModal, useEnquiryModal } from '@/app/widgets/EnquiryModal'
  function Enquire({ vehicleTitle, contact }) {
    const { isOpen, open, close } = useEnquiryModal()
    return (
      <>
        <button onClick={open} className={styles.enquireBtn}>Enquire</button>
        <EnquiryModal
          open={isOpen} onClose={close}
          subject={`Enquiry: ${vehicleTitle}`}
          contact={contact}
          leadType="vehicle-enquiry" leadSource="vehicle-detail-modal"
          hiddenFields={{ vehicle: vehicleTitle, url: window.location.href }}
        />
      </>
    )
  }
  ```
  The audit's `inv-detail-enquiry-not-modal` rule fires when an inline
  `<form onSubmit>` exists on the detail page without an `EnquiryModal`
  import.

- **Balance columns on large screens.** Avoid the "huge sidebar dwarfs the
  content" trap. On 1024px+ the gallery+content column should be
  visually dominant (≥ 60% of the row); the sticky info card column should
  feel like an inset widget, not a panel.
  - Recommended ratios: `1.5fr 1fr` for gallery-led pages,
    `1.6fr 1fr` for full-bleed-mosaic, `1fr 1fr` only for split-screen
    layouts where both columns share weight.
  - On `< 720px`, stack with **the sticky-card content first** (price,
    primary CTAs, key specs) and gallery second so the buyer sees decision
    info before scrolling — the gallery can be revisited via a "Photos"
    anchor in the in-page nav.
  - Hide the desktop sidebar's redundant info on mobile (e.g. don't repeat
    the price three times). The mobile sticky bar (price + Call +
    WhatsApp + Enquire) carries the action affordances.

- **Similar vehicles row — required.** After the spec/finance section and
  before the SEO makes-list, render a single horizontal row of 3–4
  vehicles ("More like this" / "Similar vehicles from {brand}").
  - Source: `/api/inventory?brand=<slug>&make=<this make>&limit=4` (or
    body type if make returns nothing). Filter out the current vehicle.
  - Composition: same card chrome as the inventory list page (consistency
    helps recognition), but in a horizontal scroll rail on mobile and a
    3-up grid on desktop.
  - Empty fallback: if the API returns nothing matching make/body, fall
    back to "Latest arrivals" — never render an empty section.
  - The audit's `inv-detail-no-similar-vehicles` rule fires if no
    similar-vehicles strip is detected.

- **SEO makes-list before footer — required.** A clean, scannable
  "Browse by make" panel sits between the similar-vehicles row and the
  footer. Purposes:
  1. SEO surface — internal links to filtered inventory pages
     (`/used-cars?make=BMW`) help search engines crawl the site graph.
  2. Buyer pivot — buyers who didn't pick this car can jump to other
     makes without going via the inventory list.
  Composition rules:
  - **Clean, not clumsy** — chip grid OR small-card grid (≤ 12 items).
    Not a 50-link wall.
  - **With counters** — "BMW (12)", "Audi (8)" etc. — sourced from
    `/api/inventory?brand=<slug>` `meta.available.makes` (or a tally of
    the inventory). Counters give SEO weight to the link AND signal
    inventory depth to the buyer.
  - Brand-token styled chips (use `--t-icon-bg` / `--color-border` etc.).
  - Each chip is a `<Link href="/used-cars?make=<make>">`.
  - The audit's `inv-detail-no-makes-seo` rule fires if no makes-list
    section is detected on the detail page.

These six are non-negotiable on every detail page — they're the difference
between "viewing a listing" and "considering a purchase". The autonomous-
design clause still applies — pick which patterns / compositions to combine,
but include all six requirements.

## Required widgets — use the brandstudio globals, don't re-roll

Every theme's Shell **must** mount these brandstudio-global widgets
(skeleton scaffolder wires them by default; preserve through Phase 8):

- **`<AnimateOnScroll />`** from `@/app/widgets/AnimateOnScroll` —
  one-shot IntersectionObserver-based scroll-reveal driver. Mount once in
  Shell. After it's mounted, ANY element in the tree can opt into entry
  animation by adding `data-aos="<variant>"`. **18 variants supported:**
  `fade` / `fade-up` / `fade-down` / `fade-left` / `fade-right` /
  `fade-up-right` / `fade-up-left` / `fade-down-right` / `fade-down-left`
  (translate + fade); `zoom-in` / `zoom-out` / `zoom-in-up` / `zoom-out-down`
  (scale + fade); `flip-up` / `flip-down` / `flip-left` / `flip-right`
  (3D card-flip); `slide-up` / `slide-down` (long-travel for hero CTAs);
  `blur-in` (premium reveal — expensive on mobile, use sparingly). Per-
  element options: `data-aos-delay="120"` (ms), `data-aos-duration="900"`
  (ms, default 720), `data-aos-easing="ease-out"` (CSS timing function,
  default smooth-out cubic). Honors `prefers-reduced-motion`. The
  companion `aos.css` is auto-imported via the widget's `index.ts`.

- **`<MotionFX />`** from `@/app/widgets/MotionFX` — CSS injector that
  registers a library of neon/light @keyframes and additive utility
  classes. No JS at runtime; the component is a server component that
  imports the stylesheet. Mount once in Shell. Available classes:
  `.mfx-pulse-dot` (status indicator pulse), `.mfx-glow-pulse` (radial
  glow breathes), `.mfx-glow-orbit` (orbiting glow blob), `.mfx-shimmer`
  (sweep on hover), `.mfx-shimmer-loop` (sweep infinitely), `.mfx-scan`
  (vertical scan line), `.mfx-text-glow` (text-shadow loop), `.mfx-border-glow`
  (box-shadow loop), `.mfx-float` (gentle vertical float), `.mfx-float-large`,
  `.mfx-tilt`, `.mfx-grid-drift` (background-position drift),
  `.mfx-rotate-slow`, `.mfx-fade-loop`. All brand-token-driven (use
  `var(--color-primary)` / `var(--color-accent)`). All honour
  `prefers-reduced-motion`.

- **`<PreviewBanner brand={brand} />`** from `@/app/widgets/PreviewBanner` —
  sticky-top notice strip that surfaces when `NEXT_PUBLIC_PREVIEW=1`
  (set by the preview-deploy environment, NOT in production). Brand-
  token-driven (`--color-primary` background, white text); shows the
  dealer name pulled from the `brand` prop + a link to carous.co.uk
  asking the visitor to go live. Renders nothing when not in preview
  mode, so it's safe to always mount — there's no production cost.
  MUST sit before `<Header />` in the Shell so it pushes content down
  rather than overlapping nav. Optional `force={true|false}` prop
  overrides the env-var check (useful during theme development to
  preview the banner without restarting the dev server).

- **`<ScrollProgress />`** from `@/app/widgets/ScrollProgress` — rAF-throttled
  scroll-progress driver. Mount once in Shell. Watches every
  `[data-mfx-scroll]` element and writes `--mfx-progress` (0 → 1) onto it
  as the user scrolls past. The companion MotionFX styles ship five
  scroll-tied utility variants out of the box:
  `data-mfx-scroll="parallax-slow"` (translate `-40px`),
  `"parallax-medium"` (`-90px`), `"parallax-fast"` (`-160px`),
  `"fade-out-on-exit"` (opacity → 0), `"blur-on-exit"` (filter blur),
  `"zoom-on-enter"` (scale 0.95 → 1). Themes can also consume
  `var(--mfx-progress)` directly in their own CSS modules. Skips entirely
  when `prefers-reduced-motion: reduce`.

- **`<CookieBanner />`** from `@/app/widgets/CookieBanner` — starter UK
  GDPR consent banner with three categories. **For bespoke themes,
  replace it with a per-theme banner** (see Quality Bar §"Cookie
  banners must NOT be one-size-fits-all"). The global widget stays as
  a fallback / starter / consolidated-consent-log reader.

- **`<WhatsAppFab brand={brand} />`** from `@/app/widgets/WhatsAppFab` —
  bottom-right floating WhatsApp call-to-action with online/offline
  status pip derived from `brand.openingHours`. Theme-agnostic; the
  green-bubble brand identity is universal so this widget is shared
  across themes by design. Pass the `brand` from `useBrand()`. The
  widget reads `brand.location.phone` to build the wa.me link and
  returns `null` if no phone is set.

- **`<WhatsAppIcon size={N} />`** also from `@/app/widgets/WhatsAppFab` —
  the official WhatsApp brand glyph (speech bubble with phone) extracted
  from the FAB so themes can reuse the SAME mark wherever they link to
  WhatsApp (vehicle detail call-out, contact panel, modal CTA, footer
  chat link). Use `<WhatsAppIcon size={16} />` instead of
  `<MessageCircle />` from lucide so the icon reads as "WhatsApp" not
  "third-party chat" — buyers recognise the official mark instantly. The
  audit's `lib-whatsapp-icon-generic` rule fires if a file uses
  `MessageCircle` alongside a WhatsApp link without importing
  `WhatsAppIcon`. Inherits `currentColor` so the iconic green is for the
  filled-button surface, not the glyph itself.

- **`<EnquiryModal />`** from `@/app/widgets/EnquiryModal` — modal-based
  enquiry form for vehicle detail pages, contact "request a callback"
  call-outs, and any other surface where a focused enquiry beats a long
  inline form. Mirrors the modal pattern used by carous-platform's
  vehicle apps (huntsmotors / csmotors) so dealers find it familiar.
  Triggered via the companion `useEnquiryModal()` hook (`open` / `close` /
  `isOpen` / `toggle`); render the trigger button anywhere on the page
  (sticky sidebar, mobile sticky bar, hero CTA, gallery overlay) and the
  same modal serves them all — one form state, one validation surface.
  Brand-token-driven (retints per brand automatically). Built-in side
  panel renders Call / Email / WhatsApp shortcuts from the supplied
  `contact` prop using the official `<WhatsAppIcon />`. Honours
  `prefers-reduced-motion`. The audit's `inv-detail-enquiry-not-modal`
  rule fires if a detail page renders an inline `<form onSubmit>` without
  importing `EnquiryModal`. Phase 8 must NOT write a per-theme inline
  enquiry form on `pages/used-cars/[slug]/page.tsx` — mount this modal.

- **`<SellYourCarWidget />`** from `@/app/widgets/SellYourCarWidget` —
  the 3-step valuation wizard (Identify → Valuation → Details). Ported
  verbatim from carous-platform's `@carous/sell-your-car` package
  (huntsmotors, csmotors, etc. all mount the same thing). Three steps:
  registration + mileage lookup, guide trade-price reveal, and contact
  details capture. The widget is mounted INSIDE `pages/sell-your-car/`
  via a co-located client island (`SellYourCarMount.tsx`) — see ELE
  Car Sales as the canonical example. Phase 8 must NOT write a per-
  theme valuation form anymore; mount the global widget and pass dealer
  context (`brandName`, `contact: { phoneTel, phoneDisplay, email,
  whatsappUrl }`, `infoPanel={<DefaultInfoPanel brandName={...} />}`,
  custom `copy.cardTitle / cardSubtitle / successHeading / successBody`)
  from `useBrand()` + `getBrandContactInfo(brand)`.

  The widget hits `/api/lookup` (brandstudio route added 2026-05-11)
  with a POST `{reg, mileage}`. The route returns a minimal synthesized
  vehicle record when the upstream Carous vehicle-data proxy isn't
  available — this is the right default for prospect previews so the
  wizard always advances past the Identify step. Don't override the
  `lookupEndpoint` prop unless a specific theme needs a different
  upstream.

  The widget's CSS is shared (`@/app/widgets/SellYourCarWidget/styles.css`,
  prefixed `.sycw-*`) — import it from the mount component, NOT from
  Shell or base.css, so it tree-shakes correctly.

**Why these are widgets, not per-theme components:** the logic
(IntersectionObserver, localStorage consent, wa.me URL composition,
working-hours status calculation, 3-step wizard state machine, vehicle-
lookup fetch with abort handling, lead-payload composition, UK-plate
formatting) is identical across themes. Re-implementing per theme is
duplication that drifts. WhatsApp and the sell-your-car wizard are
operational primitives that buyers expect to behave the same way
regardless of brand identity — a buyer who's used one dealer's "sell
your car" flow expects the next dealer's to work the same.

**Note: do NOT add a floating "Sell your car" CTA widget** — we tried
that 2026-05-11 and removed it the same day per dealer feedback. The
nav-bar "Sell your car" link + the dedicated `/sell-my-car` page (which
mounts the `<SellYourCarWidget />`) + contextual CTAs in the homepage
CtaBanner are the canonical surfaces. A second floating affordance
crowds the corner and competes with the WhatsApp FAB for attention
without giving the user a different decision to make.

**Why the cookie banner is the exception:** consent UI is a brand-voice
surface that operators expect to look distinctive ("our site, our
voice") — so each theme designs its own banner that fits the
archetype. The consent PAYLOAD shape stays compatible so consolidated
reporting reads either source. See Quality Bar §"Cookie banners must
NOT be one-size-fits-all" for the contract.

**When designing the homepage in Phase 8**, sprinkle `data-aos="..."`
attributes on at least:
- The hero (or its eyebrow / headline / CTA row — whichever feels right)
- Each stat card in a SpecsBar (with staggered `data-aos-delay`)
- Each downstream section (LatestArrivals / Services / RecentlySold /
  CTA / Reviews / Directory) wrapped in a `<div data-aos="...">` if the
  section component itself doesn't take the attr

The audit's `lib-no-aos-on-homepage` rule fires (advisory) if the
homepage has zero `data-aos` attributes.

**Pages that capture leads (sell-your-car, part-exchange, contact)**
should ideally use a shared `LeadForm` widget too — see the
"Forms shouldn't be per-theme" entry in the Pitfalls Catalogue. Not
shipped yet; flagged as deferred work.

## Phase 0 — Plan the run

Use **TodoWrite** to capture the phases below as a checklist. Mark each
one complete the moment it lands.

**Scope of this skill (clarified 2026-05-10, expanded 2026-05-11):**
`/new-theme` is primarily a theme-builder — it ships a reusable code asset
under `app/themes/<id>/` + default imagery under `public/themes/<id>/`. As
of 2026-05-11 the skill ALSO offers an **optional Phase 13a** that registers
a preview brand against the new theme (via `tools/build-preview-from-theme.py`
→ `backend.services.preview.upsert_preview`) — defaults to a local `lvh.me`
preview, opt-in to Linux/production DNS + vhost + cert automation via
`--automation`. Phase 13a is OPT-IN per AskUserQuestion at the end of
Phase 12; the operator can always pick "No" and create the preview later
via the dashboard `/create` page (which has the AI brand generator for
richer content). Theme creation and preview creation remain logically
separate; Phase 13a is a fast-path for operators who want both in one go.

**Mode A phases:**

0.5. Pre-flight check (`check-skill-env.mjs`) — verify environment before any work.
1. Gather inputs (logo path + dealer URL via AskUserQuestion).
2. Analyze the logo:
   a. Deterministic colors via `extract-logo-colors.mjs`.
   b. Vision-analyze typography character + shape language.
   c. Validate WCAG AA contrast on the suggested primary; iterate if needed.
   d. Map character to archetype (`classic` / `modern` / `rugged` / `luxury` / `prestige`).
3. Scrape the dealer site (WebFetch — brand name, services, location, hero image, etc — captured in DNA notes for archetype guidance, NOT baked as brand record).
4. Pick a paired Google Font from the character analysis.
5. Synthesize DNA JSON (includes the hero image URL + chosen archetype).
6. Derive theme id + display name from brand name.
7. Run skeleton scaffolder with `--archetype <id>` (produces contract + plumbing stubs; strips visual layer for fresh design).
7.5. Fetch theme imagery + generate favicon — 7 page-level slots via `fetch-theme-images.mjs`, plus a 32×32 archetype-aware SVG mark via `generate-theme-favicon.mjs`.
8. Design every page + component fresh per the archetype spec (`docs/theme-archetype-specs.md`) — no borrowing from any baseline.
9. Sync registries (`npm run theme:sync`).
10. Verify:
    a. `tsc --noEmit` clean against zero baseline.
    b. Contrast re-check on final DNA.
    c. Audit (`audit-theme.mjs`) — 0 blockers.
11. Log to FEATURE_LOG.
12. Report (theme deliverables only — no preview URL).
12b. Offer Phase 13a (`AskUserQuestion`: register a preview brand now?).
13a. (Optional) `tools/build-preview-from-theme.py` registers the brand;
     surface the preview URL.
13. Ship — operator commits + pushes via git; CI deploys; theme appears in `/create`'s picker.

**Phase 9.5 (brand registration) and Phase 10d (preview smoke test) are
NO LONGER part of the canonical Mode A flow.** They were removed when
the skill scope was narrowed to theme-building only (2026-05-10). The
optional Phase 13a helper (`build-preview-from-theme.py`) lets a
developer register a local preview brand if they want to eyeball the
theme on `<slug>.lvh.me:3000` before pushing — but that's opt-in via
AskUserQuestion, NOT a ship gate. The canonical production path is
git-only (Phase 13).

If anything fails between Phase 7 and 12, run
`node tools/rollback-theme.mjs --theme-id <id>` to clean up the partial
artifacts (theme folder, public images, DNA JSON, registries) before
re-attempting. Idempotent — safe to run multiple times.

## Phase 0.5 — Pre-flight environment check

Before gathering inputs (which costs a user round-trip), verify the
environment is healthy:

```bash
node tools/check-skill-env.mjs
```

Three gates (theme-only): `tools-present`, `node-deps` (sharp installed),
`theme-sync-clean`. Exit 0 means proceed; exit 1 means tell the user which
gate(s) failed and stop.

Common failures + fixes:
- **tools-present FAIL**: a required script under `tools/` is missing; check the listed paths.
- **node-deps FAIL**: `sharp` not installed; run `npm install`.
- **theme-sync-clean FAIL**: An existing theme has a broken contract file; investigate before scaffolding a new theme.

The previous Flask / MySQL / lvh.me gates were removed 2026-05-10 when
the skill scope was narrowed to theme-building only. Those services are
preview-creation concerns — not the skill's job.

**Mode B phases:** same as the Mode A flow but Phases 1–5 are replaced by
running `tools/extract-theme-dna.mjs --source <app>` against the named
carous-platform app. **Mode B Phase 8 is adaptation, not redesign** —
the full `scaffold-theme.mjs` produces a working springalls-classic
clone and Phase 8 is text replacement (nav items, dealer copy, phone
numbers, search defaults). Redesigning components in Mode B defeats the
point of porting from a sibling. The autonomous-design rules in this
SKILL apply to **Mode A only**.

## Mode A — Bespoke from logo + URL

### A1 — Gather inputs

If the user passed both `--logo <path>` and `--url <url>` inline, use
those and skip prompting. Otherwise:

**Step 1 — Confirm direction with AskUserQuestion** (so the user knows the
skill engaged and what's coming):

```
Question: "Ready to build a bespoke theme? I'll need a logo file and the
          dealer's website URL."
Header: "Inputs"
Options:
  - "Yes — I'll paste the logo path and URL in my next message"
  - "Yes — but the logo is at a public URL, not a local file"
  - "Cancel — abort the skill"
```

If the user picks Cancel, exit cleanly with a one-line message.

**Step 2 — Read the user's next message** as natural text containing the
logo path/URL and the dealer URL. Parse defensively:

- A line containing `http(s)://...ext` (where `ext` is `.png`, `.jpg`,
  `.jpeg`, `.svg`, `.webp`) is the logo URL.
- A line that is a Windows or Unix path ending in those extensions is the
  logo file path.
- A line containing `http(s)://` without an image extension is the dealer
  URL.
- If the user labels them ("logo: …", "url: …"), respect the labels.

If only one of the two is provided, send a short text message asking for
the missing one and wait for the next message. Don't loop on
AskUserQuestion — the user already engaged.

**Step 3 — Validate**:

- Logo: if it's a local path, confirm it exists on disk. If it's a URL,
  download it via WebFetch (or simply pass the URL to the Read tool —
  it accepts remote image URLs).
- URL: well-formed `https://` prefix, valid host. If not, ask once for
  a corrected URL.

If the user gave a theme id inline (`/new-theme cobalt-modern`), use it.
Otherwise the skill derives one in A6.

### A2 — Analyze the logo (deterministic colors + vision character)

**Step A2a — Run the deterministic color extractor first:**

```bash
node tools/extract-logo-colors.mjs --logo <path-or-url> --out tools/.logo-colors/<dealer-slug>.json
```

This uses sharp + a saturation-filtered histogram to surface dominant
brand colors. Output JSON shape: `{dominant: [...], suggested: { primary,
primaryDark, accent, text }, warnings: [...]}`. Read it with the Read tool
and use `suggested.primary`, `suggested.primaryDark`, `suggested.accent`
as the authoritative colors. **Do not eyeball colors yourself** — the
script is more reproducible than vision-based estimation. If the script
emits warnings (`primary color is weak`, `no usable pixels`), surface
them in the final report.

**Step A2b — Use vision (Read tool on the logo) for character analysis,
not color:**

Inspect typography and shape language. Extract:

- **Typography character** of the wordmark. Categorize as one of:
  - `luxury-serif` — Didone or transitional serifs, high contrast strokes
    (Vogue, Tiffany, prestige dealers).
  - `classic-serif` — old-style or slab serifs, balanced strokes (Lora,
    Bitter feel).
  - `modern-sans` — geometric or neo-grotesque sans (Inter, DM Sans feel).
  - `humanist-sans` — friendly sans with humanist proportions (Nunito,
    Outfit feel).
  - `condensed-bold` — tall narrow uppercase, sport/dealer signage feel
    (Oswald, Bebas).
  - `display-bold` — heavy display weights, high impact (Anton, Archivo
    Black).
  - `geometric-tech` — futuristic, technical (Space Grotesk, Manrope).
  - `script` or `handwritten` — cursive feel (rare for dealers; default to
    classic-serif heading + humanist body if seen).
- **Vibe descriptors** (free-form, 2–3 words): e.g. "luxury, prestige,
  understated" or "bold, sporty, family-run". Used in the theme
  description and content tone in Phase A8.
- **Shape language**: rounded vs angular vs sharp corners on logo
  letterforms. Drives `radii.button` and `radii.card`:
  - rounded → `999px` button, `14px` card
  - balanced → `8px` button, `12px` card
  - sharp → `4px` button, `6px` card

If the logo is ambiguous, default to `humanist-sans` + balanced shapes.
Better to ship a defensible default than block on a perfect read.

### A2d — Map logo character to ARCHETYPE

Each new theme is one of five archetypes (see `docs/theme-archetype-specs.md`
for the full design contract per archetype). The mapping is:

| Logo character (from A2b) | Archetype |
|---------------------------|-----------|
| `humanist-sans`, `classic-serif`, ambiguous | `classic` |
| `modern-sans`, `geometric-tech` | `modern` |
| `condensed-bold`, `display-bold` (sport, dealer-signage) | `rugged` |
| `luxury-serif`, `script` | `luxury` |
| Mixed (display-bold + serif body, magazine feel) | `prestige` |

Record the chosen archetype in the DNA at `notes.archetype`. Phase 8
reads the archetype's spec from `docs/theme-archetype-specs.md` and
redesigns components per that spec — the scaffolder always clones the
same `springalls-classic` baseline, so the visual difference between
archetypes is driven by Phase 8 redesign work, not by template choice.

### A2c — Validate contrast against bg/text

After A2a/b but before scaffolding, dry-run the contrast checker against
the colors you'll use:

```bash
node tools/check-theme-contrast.mjs \
  --primary <suggested.primary> \
  --accent <suggested.accent or suggested.primary> \
  --bg "#ffffff" \
  --text "#0f1623"
```

Exit code 1 = critical fail (white-on-primary, body text, link contrast).
Read the suggestions block — the tool offers a darken/lighten amount that
would pass. Apply the suggestion to `suggested.primary` and re-run before
scaffolding. **Do not ship a theme that fails the critical contrast
check** — dealers will see unreadable button labels.

### A3 — Scrape the dealer site

Use **WebFetch** on the dealer URL with this prompt:

```
Extract the following from this dealer website, using only what is
visible on the page:
- Brand name (legal or trading name)
- Tagline or hero headline (one sentence)
- Address — town, county, postcode
- Phone number (UK format)
- Email (if shown)
- Opening hours (per-day if available)
- Primary navigation items (e.g. Used Cars, Finance, Services)
- Services offered (Finance, Part Exchange, Warranty, Delivery, etc.)
- Hero image URL (if extractable from CSS or img tag)
- Key facts (years established, fleet size, anything that anchors the
  brand voice)
Return as a structured list. If a field is not present, write "not found".
Do not fabricate.
```

Capture the response. If WebFetch fails (timeout, anti-bot wall, 404),
fall back gracefully:

- Ask the user once for the brand name and city, then proceed with logo
  data only. Do not abort the skill.

### A4 — Pick paired Google Fonts

Use this decision table mapping logo character → Google Fonts (heading +
body). All choices are weights `400;500;600;700` unless noted, with
`display=swap`.

| Logo character    | Heading                   | Body              |
|-------------------|---------------------------|-------------------|
| luxury-serif      | `Playfair Display`        | `Montserrat`      |
| classic-serif     | `Lora`                    | `Source Sans 3`   |
| modern-sans       | `DM Sans`                 | `Inter`           |
| humanist-sans     | `Outfit`                  | `Open Sans`       |
| condensed-bold    | `Oswald` (500;600)        | `DM Sans`         |
| display-bold      | `Anton` (400 only)        | `Inter`           |
| geometric-tech    | `Space Grotesk`           | `Inter`           |
| script            | `Cormorant Garamond`      | `Karla`           |

Construct a single Google Fonts URL:

```
https://fonts.googleapis.com/css2?family=<Heading>:wght@<weights>&family=<Body>:wght@400;500;600;700&display=swap
```

Replace spaces with `+` in family names.

### A5 — Synthesize the DNA JSON

Compose a DNA object matching the schema the scaffolder consumes:

```jsonc
{
  "sourceApp": "<dealer-slug>-website",   // e.g. "huntsmotors-website"
  "capturedAt": "<ISO date>",
  "profile": "<one-paragraph dealer summary from A3, max ~220 chars>",
  "colors": {
    "primary": "<hex from A2>",
    "primaryDark": "<darker variant or null>",
    "accent": "<hex from A2 or null>",
    "bg": "#ffffff",
    "surface": "#f7f9fc",
    "text": "#0f1623",
    "muted": "#6b7280",
    "border": "#e5e7eb"
  },
  "fonts": {
    "heading": "'<Heading family>', '<fallback>', sans-serif",
    "body": "'<Body family>', '<fallback>', sans-serif",
    "stylesheets": ["<Google Fonts URL from A4>"],
    "headingWeight": 700,
    "bodyWeight": 400
  },
  "radii": {
    "card": "<from A2 shape>",
    "button": "<from A2 shape>",
    "input": "<same as button>",
    "pill": "999px"
  },
  "shadows": {
    "card": "0 18px 40px rgba(15, 23, 42, 0.18)",
    "floating": "0 22px 48px rgba(0, 0, 0, 0.3)",
    "button": "0 8px 22px rgba(15, 23, 42, 0.20)"
  },
  "hero": {
    "minHeight": "560px",
    "minHeightLg": "620px",
    "minHeightSm": "460px",
    "overlayStart": "<rgba derived from primary color, ~0.30 alpha>",
    "overlayEnd": "<rgba derived from primary color, ~0.65 alpha>",
    "searchRadius": "<same as button>"
  },
  "spacing": {
    "sectionInset": "20px",
    "sectionGap": "64px",
    "containerMax": "1200px",
    "headerMax": "1400px"
  },
  "heroImage": "<URL of dealer hero image from A3, if extracted>",
  "notes": {
    "mode": "logo+url",
    "dealerUrl": "<input URL>",
    "logoPath": "<input logo path>",
    "heroImageUrl": "<same as heroImage; preserved for clarity>",
    "vibe": "<2-3 words from A2>",
    "colorsExtractor": "deterministic (extract-logo-colors.mjs)",
    "contrastCheck": "passed | critical-failed (and-fixed)"
  }
}
```

For `overlayStart`/`overlayEnd`: don't blindly use `rgba(6, 10, 16, ...)`.
Tint the overlay toward the primary so the hero feels brand-coherent.
Quick rule: take the primary hex, darken it by mixing with black ~70%, use
that as the overlay base; alpha 0.30 → 0.65. If unsure, fall back to the
neutral defaults.

Write the DNA JSON with the **Write tool** to:

```
tools/.theme-dna/<dealer-slug>.json
```

`<dealer-slug>` is the brand name lowercased and kebab-cased, with
spaces/punctuation collapsed to `-`. Example: `"Hunts Motors Ltd"` →
`hunts-motors-ltd`.

### A6 — Derive theme id + display name

- **Theme id**: `<dealer-slug>-bespoke`. If `<dealer-slug>` already has
  more than one segment (e.g. `hunts-motors-ltd`), drop the trailing
  `-ltd`/`-limited`/`-group` if present, then append `-bespoke`. Validate
  it's not in `theme/theme-manifest.json`. If it collides, suffix `-02`,
  `-03`, etc.
  - Caller-supplied id (`/new-theme cobalt-modern`) wins over the
    auto-derived one. Validate it's two-segment kebab-case.
- **Display name**: title-case the brand name. Example:
  `"hunts motors ltd"` → `"Hunts Motors Ltd"`. Caller-supplied `--name`
  wins.
- **Description**: one sentence using the dealer profile + vibe. Example:
  `"Bespoke theme for Hunts Motors Ltd — cobalt-on-white modern sans-serif
  with a confident dealer-signage feel."` Keep under 200 chars.

## Phase 7 — Scaffold

**Mode A (default — skeleton-first, fresh design):**

```bash
node tools/scaffold-theme-skeleton.mjs \
  --id <theme-id> \
  --name "<Display Name>" \
  --description "<one-line description>" \
  --dna tools/.theme-dna/<dealer-slug>.json \
  --archetype <classic|modern|rugged|luxury|prestige>
```

The skeleton scaffolder produces ONLY the **contract + plumbing**
(~39 files): theme.json, tokens.ts, the 5 contract exports, the 5
context files (BrandClientWrapper / BrandStyles with the 7 image-slot
CSS vars / AuthProvider / DynamicFavicon / GarageContext), the 7 lib
helpers, the inventory pages (used-cars list + [slug] detail —
substantial logic kept verbatim), recently-sold (kept), and minimal
stubs for Shell / Header / Footer / 12 page bodies / base.css.

**What's deliberately NOT included** (Claude designs these in Phase 8):
- Hero, all section components (TrustSignals / LatestArrivals /
  ServiceHighlights / Reviews / CTA / Directory / etc.)
- Section CSS files (other than minimal base.css)
- Page bodies for home / about / contact / services / sell-your-car /
  finance / part-exchange / compare / wishlist / privacy-policy /
  cookie-policy
- Cookie banner, WhatsApp widget, Preview banner, AOS provider —
  archetype-specific decisions about whether each is wanted

This is the right choice for prospect previews because **two themes
that share Hero.tsx aren't two themes — they're one theme with paint
swapped**. The skeleton guarantees the runtime contract while leaving
all visible design open for fresh per-archetype work.

**Mode B (port from carous-platform sibling):**

```bash
node tools/scaffold-theme.mjs \
  --id <theme-id> \
  --name "<Display Name>" \
  --description "..." \
  --dna tools/.theme-dna/<source-app>.json \
  [--template <existing-theme-id>]
```

Mode B uses the **full clone-and-edit scaffolder** because there you
genuinely want to inherit a working theme's structure — you're porting
from a sibling app, not designing fresh. The full scaffolder copies all
~80 files from the template (default `springalls-classic`), rewrites
identifiers, regenerates tokens, downloads hero. Phase 8 in Mode B is
adaptation (text replacement) not redesign.

Both scaffolders fail loudly if the target folder already exists.

## Phase 7.5 — Fetch theme imagery + generate favicon (Mode A only)

Two sub-steps run here. Both write into `public/themes/<theme-id>/`.

### 7.5a — Source 7 page-level images

```bash
node tools/fetch-theme-images.mjs \
  --theme-id <theme-id> \
  --archetype <classic|modern|rugged|luxury|prestige>
```

Two modes (auto-selected):

- **Curated fallback (default, no API key):** reads
  `tools/theme-image-catalogue.json` for verified Unsplash URLs per
  (archetype × slot). Slots not yet curated for the chosen archetype
  fall back to the `classic` archetype's photos so every slot still
  resolves to something usable.
- **Live Unsplash API mode:** activates when `UNSPLASH_ACCESS_KEY` is in
  the environment. Searches with archetype-specific terms ("modern car
  dealership showroom", "4x4 off road rugged vehicle landscape", etc.)
  and picks the top result per slot.

The script outputs a manifest JSON at `tools/.theme-images/<theme-id>.json`
with `{themeId, archetype, mode, images: { hero: { localPath, attribution },
... }, warnings}`. The 7 images themselves are saved under
`public/themes/<theme-id>/images/<slot>.jpg` and ship with the theme as
archetype-default fallbacks. When the operator creates a brand against
this theme via the dashboard's `/create` flow, those defaults render
automatically; the operator can override per slot via `/update/<slug>`.

If the script reports warnings (slot couldn't be sourced, classic-fallback
used), surface them in the Phase 12 report — the team will want to swap
those slots in the dashboard before a real pitch.

### 7.5b — Generate the theme favicon

```bash
node tools/generate-theme-favicon.mjs --theme-id <theme-id>
```

The generator reads the DNA JSON (auto-discovered from
`tools/.theme-dna/<dealer-slug>.json`) for primary color + archetype +
display name, then writes a 32×32 SVG favicon at
`public/themes/<theme-id>/favicon.svg`. The SVG scales cleanly from
16×16 tab icon up to 512×512 app icon without rasterizing.

Five archetype-specific templates:
- **classic** — rounded square with brand-color gradient, serif initial.
  Trustworthy, family-run signature.
- **modern** — sharp square, geometric sans initial, lightened-primary
  accent underline. Tech-forward.
- **rugged** — asymmetric cornered shape with skewed condensed-bold
  initial + speed-line accents. Dealer-signage / fleet feel.
- **luxury** — charcoal disk with metallic ring + italic serif initial.
  Restrained, prestige.
- **prestige** — hexagon with metallic glyph + thin top rule. Mixed-
  media editorial.

The glyph defaults to the first letter of the theme's display name
(uppercase). Override with `--glyph X` if a specific initial fits the
brand better. Override colors with `--primary #hex` / `--accent #hex` if
the DNA isn't on disk yet.

`DynamicFavicon.tsx` (already shipped in the skeleton) is wired to
prefer `/themes/<theme-id>/favicon.svg` over the brand logo. Operators
can still override per-brand by setting `brand.favicon` from the
dashboard — that wins over the theme favicon.

## Phase 8 — Design every page fresh (Mode A)

Phase 8 turns the skeleton scaffolder's stubs into a finished, bespoke
theme. **Every page and every component is designed fresh** for this
theme. Nothing is copy-pasted from `springalls-classic`, the skeleton
baseline, or another sibling theme. Two themes that share JSX structure
aren't two themes — they're one theme with paint swapped.

**The contract surface that Phase 8 does NOT touch:**
- `theme.json`, `tokens.ts`, `pages.ts`, `shell.tsx`, `recipes/index.ts`,
  `sections/index.tsx` — the scaffolder produced these correctly from DNA
- The five context files (`BrandClientWrapper`, `BrandStyles`,
  `AuthContext`, `DynamicFavicon`, `GarageContext`) — wired by the
  context-registry generator
- The seven `lib/` helpers — same contract across themes
- The 4 generated registries — gitignored, regenerated by `theme:sync`
- The data layer of the inventory list page (`pages/used-cars/page.tsx`
  server-fetch logic + `UsedCarsClient.tsx` state/filter/URL handling +
  `normalizeInventoryItem`) — kept verbatim because rewriting it is
  scope-creep with no design payoff

**Everything else is Phase 8's responsibility.** That includes Hero,
Header, Footer, Shell composition (preserving the global widgets it
mounts), each section component on the homepage, each inner page body
(about / contact / services / finance / part-exchange / sell-my-car /
compare / wishlist / privacy-policy / cookie-policy / recently-sold),
the **render layer** of the inventory list page, the **entire vehicle
detail page** (route handling stays the same; JSX + CSS + composition
are fresh), and a per-theme cookie banner.

**Before designing, read these:**
1. `docs/theme-archetype-specs.md` — the spec for your archetype. This
   is a *design brief*, not a transcript. It lists layout language,
   section composition, decorative motifs. Interpret it; don't
   transcribe it.
2. `docs/inventory-design-library.md` — a **reference catalogue** of
   list and detail patterns sourced from real dealers (Cinch,
   Autotrader, Hexagon, McLaren Approved, etc.). Pull patterns you
   like, then **synthesize** something specific to this theme. The
   library is brain-prompt, not a template — two themes "using" the
   same list pattern should still look materially different (chip-row
   composition, sort/filter affordance, card chrome, empty/skeleton
   states, scroll/snap behavior). Append your theme's pattern choices
   to the rotation table when the design lands.
3. The full **Quality Bar** section earlier in this SKILL — every
   must-have applies. Motion + gradient + geometric backgrounds, brand-
   token discipline, canonical routes, header background, hero
   contrast floor, footer attribution, per-theme cookie banner,
   inventory + detail pages redesigned, autonomous independent designs.

**Design axes the vehicle detail page must vary across themes:**
hero (full-bleed photo / split / mixed media / sticky-thumb-rail),
gallery (carousel / mosaic / scroll-stack / fullscreen-on-tap /
lightbox), spec presentation (table / pull-quotes / inline-prose /
accordion / pills / data-rings), finance presentation (sticky sidebar /
dominant calculator / inline band / footer drawer), enquiry surface
(inline form / drawer / WhatsApp-first / call-to-action panel).
Mix-and-match — no two themes ship the same combination, even within
the same archetype.

### Data-fetching rules (apply across every page Phase 8 writes)

- Page wrappers (`pages/**/page.tsx`) are **Server Components**. Never
  put `'use client'` at the top of a page file (see Pitfall row 4
  for the Turbopack chunk-item collision risk). Interactivity lives in
  co-located `components/<Name>Island.tsx` client islands that the
  Server page imports. Exception: the vehicle detail page is allowed to
  be `'use client'` because the route + galleries + modals + slider
  state cluster naturally there — keep the `audit-ignore-file:
  tp-use-client-on-page` annotation but **redesign the JSX wholesale**.
- Inventory list page server-fetches with `?brand=<slug>` and passes
  `initialVehicles` + `initialMeta` to the client island. The client
  shouldn't re-fetch on mount (the audit fires on `useEffect` + `fetch`
  for initial data).
- Homepage section components (LatestArrivals, RecentlySoldPreview)
  that need brand-scoped inventory CAN use a client-side fetch with
  `useBrand().slug` because the brand context is client-only — annotate
  the `useEffect` with `// audit-ignore: data-useeffect-fetch` and
  comment why (brand context client-side, home page composed of server
  shell + client islands).
- Server-side fetches MUST include `?brand=<slug>` so the API routes
  the request to the right per-brand inventory (see Pitfall rows 14
  and 29).
- All forms (`pages/contact/`, `pages/part-exchange/`,
  `pages/sell-your-car/SellYourCarMount.tsx`) submit via the shared
  `useLeadsForm` hook at `@/app/hooks/useLeadsForm`. Validation uses
  `aria-required` + `aria-invalid` + `aria-describedby`; error
  messages are visible inline. The submit handler calls
  `form.submit()` (the hook's bound method) inside an
  `e.preventDefault()` wrapper.
- Sell-your-car page mounts the global `<SellYourCarWidget />` from
  `@/app/widgets/SellYourCarWidget` — do NOT write a hand-rolled
  valuation form (see Pitfall row 28). Mount via a co-located client
  island that passes `brand`/`contact` from `useBrand()` +
  `getBrandContactInfo(brand)`.

### Time budget

A bespoke Mode A build typically lands **40–80 file edits** (10–12
components, 12–14 page bodies, the same number of CSS modules, the
per-theme cookie banner, plus the inventory list + detail rewrites).
Don't ship a 5-file recolor and call it a theme.

## Mode B — Port from carous-platform sibling

Phases B1–B5 replace A1–A5; everything from Phase 6 onward is shared with
Mode A.

### B1 — Pick a source app

Source apps live under `<carous-platform>/apps/`. The carous-platform
checkout is discovered automatically by `extract-theme-dna.mjs` in
this order: `--apps <path>` CLI arg → `CAROUS_PLATFORM_APPS` env var
→ `../carous-platform/apps` (sibling of brandstudio) →
`../../carous-platform/apps`. Use `Glob` against the resolved apps
directory to enumerate the current pool — examples from recent runs:

```
a2zautocompletezltd, amcarsalesltd, berksmotors, carsofmanchester, cnhcars,
csmotorsltd, huntsmotors, kainmotorsltd, lancashirecarsalesltd, motorsinc,
powercarsales, revupautosgroup, scottishvancenter, springallscarsalesltd,
thebikebuyer, vagtechsolutionltd, visionprestige
```

If the user passed `--from <app>`, validate the folder exists. Else pick
the first app not yet ported (skip `springallscarsalesltd` since it's
already → `springalls-classic`; skip any source whose name appears as a
substring of an existing theme id in `theme/theme-manifest.json`).

### B2–B5 — Extract DNA via the script

```bash
node tools/extract-theme-dna.mjs --source <app>
```

Read the resulting `tools/.theme-dna/<app>.json` with the **Read** tool.
The script handles `app/globals.css`, `theme-style.json`, `next/font/google`
imports and synthesizes a Google Fonts URL when no `@import` exists.

### B-adaptation (Phase 8 in Mode B)

Read the source app's `app/page.tsx`, `app/components/Hero*.tsx`,
`app/components/Header.tsx`, `app/components/Footer.tsx`, and
`app/styles/hero-*.css` to inform the adaptation edits. The targets in the
new theme are the same files listed in Phase 8 (Mode A); the *content
source* changes.

## Phase 9 — Sync registries

```bash
npm run theme:sync
```

Auto-discovers the new folder and regenerates the three generated registry
files plus `theme/theme-manifest.json`. If it errors with `missing
required contract files`, the new folder is incomplete — the scaffolder
should never produce that, so investigate before re-running.

## Phase 10 — Verify

The `springalls-classic` baseline (used by Mode B's full scaffolder and
the skeleton's data-layer carry-overs in Mode A) is type-clean as of
2026-05-09 — the former `SPRINGALLS_PHONE_TEL` out-of-scope reference
and form-handler typing errors were fixed at the source. New themes
inherit a clean baseline.

```bash
npx tsc --noEmit 2>&1 | grep "themes/<theme-id>"
```

Expected: **zero errors**. If anything appears, it's Phase-8-introduced
(missing import, broken JSX, type mismatch in a new component) — fix in
the new theme files only. Never edit the generated registries or other
themes to make this one pass.

Re-run the contrast check against the final scaffolded DNA (defense in
depth — the scaffolder may have produced derived overlay/shadow values
that weren't covered by the A2c pre-check):

```bash
node tools/check-theme-contrast.mjs --dna tools/.theme-dna/<dealer-slug>.json
```

Critical fail (exit code 1) = stop and adjust the primary color before
reporting done.

## Phase 10c — Theme audit (Quality Bar enforcement)

Run the static-analysis audit against the new theme:

```bash
node tools/audit-theme.mjs --id <theme-id>
```

The audit checks the rules listed in the **Quality Bar** section earlier:
a11y (img alt, single h1, no div-as-button), standards (no empty
anchors), data fetching (no `useEffect` + `fetch` for initial data),
mobile-first (warns on `max-width` media queries), performance (raw
`<img>` and missing dimensions), brand-token discipline (no hardcoded
hex outside the allowed files).

Exit codes:
- `0` — no blockers; theme is shippable.
- `1` — at least one blocker; **do not ship**. Fix in the new theme files
  only and re-run.

Advisory findings (yellow) are not blockers but should be addressed when
practical and listed in the final report so the team has visibility.
Run with `--strict` to treat advisories as blockers (use sparingly —
some advisories like the `max-width` queries on inherited template CSS
take real refactoring effort).

**Legitimate exceptions** can be annotated inline so the audit honors
them without weakening the rule:

```tsx
{/* audit-ignore: a11y-div-as-button — modal backdrop; dialog handles keyboard */}
<div className="modal-backdrop" onClick={close}></div>
```

Or for whole files:

```tsx
// audit-ignore-file: brand-hardcoded-color
```

The directive supports both `//` and `/* */` comment styles, JSX
expressions (`{/* ... */}`), and trailing prose after the rule name.
Multiple rules can be comma-separated: `audit-ignore: rule1, rule2`.

`npm run build` only when the user explicitly asks for a build.

## Phase 11 — Log to FEATURE_LOG

Append a new entry at the **top** of `docs/FEATURE_LOG.md`:

```
- YYYY-MM-DD: Added <theme-id> theme — <Mode A: bespoke for <Brand Name> | Mode B: ported from carous-platform/<source>> (owner: Difatha)
  - Scope: app/themes/<theme-id>/* (full theme contract)
  - Reason: <prospect preview for <Brand>> | <internal sibling port>
  - Notes: Generated via /new-theme. Logo: <path>. URL: <dealer URL>. Fonts: <heading> + <body>. Primary: <hex>.
```

Use today's absolute date from system context.

## Phase 12 — Report + offer Phase 13a

Two-step phase: deliver the report, then offer Phase 13a.

### 12a — Report

Concise summary to the user, ~6 lines. **Theme deliverables only** — no
preview URL, no brand record info unless Phase 13a was run (in which case
include the preview URL on its own line). Preview creation is a separate
operator-driven step (see Phase 13).

- Theme id, display name, archetype, source (dealer name + URL / carous-platform app).
- Path: `app/themes/<theme-id>/` + assets at `public/themes/<theme-id>/`.
- Color signature: `primary <hex>` + `accent <hex>`. Mention if A2c
  contrast had to be iterated (e.g. "primary darkened from #ffd700 →
  #595959 to pass white-on-primary AA").
- Font pairing + the logo-character category that drove it.
- 7-slot imagery: archetype-default JPEGs at `/themes/<id>/images/*.jpg`
  (note any slots that fell back to the classic-archetype pool — operator
  can swap per-brand later via `/update/<slug>`).
- Favicon: archetype-aware SVG mark at `/themes/<id>/favicon.svg`
  (mention the glyph + archetype template used).
- Audit result: `0 blockers / N advisories` from `tools/audit-theme.mjs`.
- **Ship instruction (Phase 13):** "commit + push to `main` (or open PR
  per branch policy); CI deploys; theme will appear in the dashboard's
  `/create` picker. Then operator creates a preview against the new
  theme to actually see it rendered for a specific dealer."
- Anything that needs follow-up (WebFetch blocks, missing dealer fields,
  unusual layout flourishes that the Phase 8 design didn't capture).

### 12b — Offer Phase 13a (optional E2E preview)

Immediately after the report, ask the operator a single
**AskUserQuestion** before running the canonical ship path (Phase 13):

```
Question: "Theme is ready. Build a preview site against it now? (Optional —
          you can always run /create on the dashboard later.)"
Header: "Build preview"
Options:
  - "Yes — register a local preview now (lvh.me)" (Recommended)
  - "Yes — register + run automation (Linux/production DNS + vhost + cert)"
  - "No — just commit the theme, I'll create the preview later via /create"
```

Pick the helper invocation accordingly (see Phase 13a below). The
question is OPTIONAL — if the operator picks "No" or cancels, jump
straight to Phase 13 (ship).

## Phase 13a — Optional: register a preview brand now

If the operator picked "Yes" in the Phase 12 prompt, run the helper script
to register a brand record + (optionally) trigger DNS/vhost/cert automation:

```bash
# local-dev preview only (lvh.me — resolves to 127.0.0.1)
python tools/build-preview-from-theme.py \
  --theme-id <theme-id> \
  --brand-name "<Display Name>" \
  [--slug <slug>]            # optional, defaults to slugified brand-name
  [--dna tools/.theme-dna/<dealer-slug>.json]   # optional, auto-discovers
  [--overwrite]              # only if replacing an existing brand record
```

```bash
# add --automation to also kick DNS / Apache vhost / cert (Linux production)
python tools/build-preview-from-theme.py \
  --theme-id <theme-id> --brand-name "<Display Name>" --automation
```

What the helper does (in order):
1. Reads `app/themes/<theme-id>/theme.json` + `tools/.theme-dna/<dealer-slug>.json`
   for colors + name + fonts.
2. Constructs a minimal `BrandConfig` (slug, name, domain, theme tokens) and
   calls `backend.services.preview.upsert_preview` to persist the brand row
   (MySQL `previews` table — same path the dashboard `/create` POST takes).
3. If `--automation` is set, calls `app.maybe_start_linux_brand_automation`
   to provision Cloudflare DNS + Apache vhost + cert. On Windows / dev hosts
   this step no-ops gracefully.
4. Prints the preview URL on the last line of stdout.

Exit codes:
- `0` — success; last stdout line is `[ok] preview: <url>`. Quote that URL
  back in the Phase 12 report so the operator can click straight in.
- `2` — brand slug already exists; re-run with `--overwrite` or pick a new
  `--slug`.
- `1` / `3` — input or persistence failure; surface the error to the
  operator and skip to Phase 13 (operator can register manually).

**Important constraints:**
- The helper imports `backend.services.preview` directly — no Flask HTTP,
  no auth round-trip. It WILL fail if `pymysql` can't reach the `previews`
  database. On a dev machine that means MySQL must be running and
  configured per `backend/services/db.py` / `.env`.
- The `--automation` flag pulls in `app.py`'s `maybe_start_linux_brand_automation`
  which is a no-op on non-Linux hosts. Use it only when the helper is run
  on the production VPS (or in a Linux dev environment that mirrors prod).
- For full end-to-end brand quality (services, FAQ, testimonials, opening
  hours, address), the operator should still open `/update/<slug>` in the
  dashboard after Phase 13a — the helper writes a minimal record with the
  theme tokens, but doesn't fill rich content. The AI brand generator at
  `/api/ai/brand` (dashboard `/create` page) is the recommended path for
  pitch-ready previews; the helper is a fast-path for local development.

## Phase 13 — Ship to production (git-based, automatic)

**The canonical ship path is git.** Once Phases 7–11 are clean, the only
manual steps are: commit, push, merge (if working off a branch).

**What ships automatically when commits land on `main`:**

- `app/themes/<theme-id>/` — the theme contract code (SCP'd by deploy.yml)
- `public/themes/<theme-id>/` — the 7 hero/page images (tracked, SCP'd)
- `theme/theme-manifest.json` — committed, makes the theme appear in the
  `/create` page's theme picker dropdown immediately after deploy
- The 4 generated registries (`app/themes/generated/theme-context-,
  -contract-, -page-, -shell-registry.generated.ts`) — gitignored. The
  deploy script regenerates them on the VPS via `npm run theme:sync`
  after `git pull`, which is why the new theme is wired into the runtime
  picker without any manual step.

**Commit + push:**

```bash
git checkout -b theme/<theme-id>
git add app/themes/<theme-id> public/themes/<theme-id> \
        theme/theme-manifest.json docs/FEATURE_LOG.md
git commit -m "Add <theme-id> theme — <brand>"
git push -u origin theme/<theme-id>
gh pr create --title "Theme: <theme-id> for <brand>" --body "..."
```

(Or commit directly to `main` if your branch policy allows it. The
`/new-theme` skill should NOT push automatically — per the global
"always ask before git push" rule, the operator confirms.)

**What the operator does AFTER ship:** open `/create` on the deployed
brandstudio dashboard, fill in the dealer details, pick the new theme
from the dropdown, set the dealer's domain (or leave the default
`<slug>.carous.co.uk` for an internal preview), and click Create. The
existing `maybe_start_linux_brand_automation` provisions Cloudflare DNS
+ Apache vhost + cert. The skill is done at this point — brand creation
is operator-driven, not skill-driven.

**Why brand creation is split out:** themes are reusable assets shipped
once; brands are operator decisions made many times against the same
theme (per dealer, per preview, per re-skin attempt). Conflating the two
into the same skill made every theme ship a brand-record write, which
locked the theme to one specific dealer at scaffold time and made the
rollback story muddier. Now theme code lives in git, brand records
live in MySQL, and they sync up at brand-creation time — operator picks
the theme from `/create`'s dropdown, the existing dashboard wires the
brand, and the existing automation provisions Cloudflare DNS + Apache
vhost + cert. **The skill stops at "theme files committed to git". It
does not run `register_preview_brand.py` on the canonical path. It does
not interact with MySQL. It does not trigger Cloudflare or Apache.**

The `/new-theme` skill is purely a theme-builder. Preview creation is
purely operator-driven via the existing dashboard. Two skills, two
flows, no overlap.

## Failure modes & escape hatches

- **Logo file not found** → ask once via AskUserQuestion. If still
  invalid, abort with a clear message.
- **WebFetch blocked / 404 / timeout** → ask once for brand name + city,
  proceed with logo-only DNA. Add a `notes.urlFetchFailed: true` field to
  the DNA so future automation can detect.
- **Logo is unreadable** (corrupted, not actually an image, or
  abstract-only with no extractable colors) → use the dealer's website
  primary brand color via WebFetch instead. If both fail, abort and
  ask the user for the primary color directly.
- **Scaffolder reports target exists** → don't `rm -rf`. Ask the user
  whether to remove the existing theme or pick a new id.
- **theme:sync errors** → surface verbatim. Don't paper over.
- **tsc baseline mismatch** → only investigate the *delta* over the
  template's baseline.

## Recovery — partial-theme cleanup

If a `/new-theme` run fails between Phase 7 (scaffold) and Phase 12
(report), the system can be left in inconsistent states: theme folder
present but incomplete, public images downloaded, the 4 generated
registries referencing a now-broken theme. Manual cleanup is error-prone
— use the rollback tool:

```bash
node tools/rollback-theme.mjs --theme-id <theme-id>
node tools/rollback-theme.mjs --theme-id <theme-id> --dry-run     # preview only
```

It removes (in order, each step tolerates "already gone"):

1. `app/themes/<theme-id>/` (scaffolded contract files)
2. `public/themes/<theme-id>/` (downloaded images)
3. `tools/.theme-dna/<theme-id>.json`
4. `tools/.theme-images/<theme-id>.json`
5. `tools/.logo-colors/<theme-id>.json`
6. Re-runs `npm run theme:sync` so the 4 generated registries no longer
   reference the deleted theme — without this, the dev server errors.

The rollback tool no longer touches MySQL — brand-record cleanup is the
dashboard's job (`/templates` admin page or `DELETE /api/brands/<slug>`).
`/new-theme` doesn't create brand records on the canonical ship path,
so a failed run can't leave a half-written MySQL row unless Phase 13a
was already run and then aborted.

Idempotent: safe to run multiple times. After rollback, fix the root
cause (don't blindly retry — diagnose what blew up first), then start
Phase 7 again with a fresh slate.

When to rollback vs. partial fix:
- Rollback when the theme folder is missing files, the brand row points
  at the wrong themeId, or the registries are out of sync — anything
  structural.
- Partial fix when only Phase 8 design or Phase 10c audit failed — those
  are file-edit-and-retry, not "blow it away" situations.

## Slack post (optional, only if user enabled it)

Per the global Slack-update rule, after the theme ships and the user has
confirmed they're happy, post a one-line update via the
`SLACK_AUDIT_WEBHOOK` env var. Skip if not set or if the user told you not
to broadcast. Don't post per-theme during automated batch runs.

## Things the skill must NOT do

- Don't edit `tools/sync-theme-contracts.mjs` or other brandstudio infra.
- Don't edit other themes. Each theme is independent.
- Don't add new ThemePageId entries to `app/themes/types.ts`.
- Don't commit or push. Default brandstudio rule: ask the user before any
  git operation.
- Don't run `npm run build` automatically — `tsc --noEmit` is the gate.
- Don't run `tools/build-preview-from-theme.py` without operator opt-in.
  Phase 13a is OPT-IN via AskUserQuestion — never assume "yes". If MySQL
  env vars aren't set on the host, the helper errors out cleanly; don't
  attempt to configure MySQL or write env files automatically.
- Don't re-roll motion primitives per theme. Always use the three global
  widgets (`<AnimateOnScroll />`, `<MotionFX />`, `<ScrollProgress />`)
  and the documented classes / attributes. Per-theme @keyframes are OK
  for archetype-specific flourishes; reimplementing pulse-dot / glow-
  breathe / shimmer / parallax for the Nth time is not.
- Don't fabricate dealer data. If a field wasn't in the WebFetch result,
  leave the scaffolder placeholder and note it in the final report.
- Don't pick a Google Font outside the curated decision table in A4
  unless the dealer site obviously uses a different one (in which case
  match it and note the deviation).
- Don't generate a logo or alter the input logo. The dealer's logo is
  authoritative — read, don't modify.

## Tested defaults (current)

- **Mode A scaffolder**: `tools/scaffold-theme-skeleton.mjs` — produces
  ONLY contract + plumbing stubs (~39 files), strips visual layer. Phase 8
  designs every page + component fresh.
- **Mode B scaffolder**: `tools/scaffold-theme.mjs` — full clone-and-edit
  from `springalls-classic` (cleanest theme, type-clean baseline). Phase 8
  in Mode B is text replacement, not redesign.
- Mode A inputs: 2 (logo file path + dealer URL). Optional: theme id,
  display name.
- Mode B inputs: 0 if the skill auto-picks; 1 if `--from <app>` given.
- After Phase 8, the theme has: 14 page implementations, full Shell with
  Header / Footer / per-theme cookie banner / WhatsApp widget /
  PreviewBanner (env-gated by `NEXT_PUBLIC_PREVIEW=1` — renders nothing in
  production). Three motion widgets mounted out of the box (AnimateOnScroll
  / MotionFX / ScrollProgress — Phase 8 only sprinkles attributes, no
  per-theme plumbing). Garage context, Brand styles injection,
  DynamicFavicon pointed at the theme's archetype-aware SVG mark
  (generated in 7.5b).
- AOS variants available: 18 (fade / fade-up / fade-down / fade-left /
  fade-right / fade-up-right / fade-up-left / fade-down-right /
  fade-down-left / zoom-in / zoom-out / zoom-in-up / zoom-out-down /
  flip-up / flip-down / flip-left / flip-right / slide-up / slide-down /
  blur-in). Per-element overrides: `data-aos-delay` / `data-aos-duration`
  / `data-aos-easing`. Honours `prefers-reduced-motion: reduce`.
- MotionFX classes available: 12 (`.mfx-glow-pulse`, `.mfx-glow-orbit`,
  `.mfx-pulse-dot` with `--mfx-dot-color` override, `.mfx-shimmer`,
  `.mfx-shimmer-loop`, `.mfx-scan`, `.mfx-text-glow`, `.mfx-border-glow`,
  `.mfx-float`, `.mfx-float-large`, `.mfx-tilt`, `.mfx-grid-drift`,
  `.mfx-rotate-slow`, `.mfx-fade-loop`). All brand-token-driven; all
  freeze under reduced-motion.
- ScrollProgress variants: 6 (`data-mfx-scroll="parallax-slow|medium|fast"`,
  `"fade-out-on-exit"`, `"blur-on-exit"`, `"zoom-on-enter"`). Themes can
  also consume `var(--mfx-progress)` directly in CSS modules.
- Theme contracts (`shell.tsx`, `pages.ts`, `sections/index.tsx`,
  `recipes/index.ts`, `tokens.ts`) all populate correctly out of the box —
  the scaffolder rewrites them from DNA so they match the new theme's id.
- API contracts the theme components must respect:
  - `/api/inventory?brand=<slug>` → returns `{ items: [...], meta: {...} }`.
    Themes must accept either `Array` or `{ items }` or `{ vehicles }`
    response shapes (Pitfall row 29).
  - `/api/featured-vehicles?brand=<slug>&limit=N` → returns
    `Array<vehicle>`. Falls back to newest-first sort when nothing has
    `featured: true` (not random shuffle).
  - `/api/recently-sold?brand=<slug>&limit=N` → returns `Array<vehicle>`.
- Inventory design library: `docs/inventory-design-library.md` lists 7
  list patterns × 6 detail patterns sourced from real dealers — a
  reference catalogue / brain-prompt, NOT a template. Phase 8 reads it
  for inspiration and synthesizes fresh layouts; the rotation table
  records what each theme leaned on.
- Optional Phase 13a: `python tools/build-preview-from-theme.py` registers
  a preview brand via `backend.services.preview.upsert_preview`. Local
  preview default `<slug>.lvh.me`; `--automation` triggers production
  DNS/vhost/cert.
- DNA JSONs land in `tools/.theme-dna/`. Logo color extracts land in
  `tools/.logo-colors/`. Self-hosted heroes land in `public/themes/<id>/hero.jpg`.
  None of these are gitignored by default; clean periodically.

## Pitfalls catalogue (lessons baked into the tooling)

Each row below is a real bug the skill hit during a previous theme build.
The "How it's caught now" column points to the tool/rule that prevents
recurrence. **Read this list before Phase 7+** — if you find yourself
about to do one of the bad-pattern things, the corresponding guard will
fire and block you, but recognising the pattern earlier saves a round trip.

| # | Symptom | Bad pattern | How it's caught now |
|---|---------|------------|---------------------|
| 1 | Brand record's `logo`/`heroImage` paths come back as `C:/Program Files/Git/...` | Calling `register_preview_brand.py` from git-bash on Windows with leading-slash paths (`--logo "/themes/..."`). MSYS rewrites the arg before Python sees it. | _Tool removed 2026-05-10 with the brand-registration coupling._ Defensive `_undo_msys_path()` lived in `register_preview_brand.py`. If reintroducing CLI tools that take path args on Windows, mirror that pattern. |
| 2 | `<slug>.preview.brandstudio.local` hits `DNS_PROBE_FINISHED_NXDOMAIN` | Fictional placeholder domain baked into the registrar default. | Default is now `<slug>.lvh.me` (public DNS that resolves all subdomains to 127.0.0.1). The optional Phase 13a helper (`build-preview-from-theme.py`) returns the real `previewUrl` for the Phase 12 report when run. |
| 3 | `useBrand must be used within a BrandClientWrapper` runtime error on a freshly-scaffolded theme | Hand-maintained `app/themes/context-registry.ts` missing the new theme entry → layout falls back to wrong theme's wrapper → different `BrandContext` instance → `useBrand` returns null. | `theme-context-registry.generated.ts` is auto-generated by `tools/sync-theme-contracts.mjs` from the per-theme `context/` folders. New themes register automatically. |
| 4 | `Code generation for chunk item errored / Expected export to be in eval context X, exports has Y` | Two parallel `'use client'` files at twin paths across themes (e.g. both `<theme-a>/pages/contact/page.tsx` and `<theme-b>/pages/contact/page.tsx` carrying the directive). Turbopack's chunk-item parsed-exports record gets shared between them. | Audit blocker rule **`tp-use-client-on-page`** — pages must be Server Components; extract interactivity into co-located `components/<Name>.tsx` client islands. Existing exemptions: deferred kept inventory pages (annotated `audit-ignore-file`). |
| 5 | Same error as #4 but for files that imported a CSS module from a parent-relative path | `import styles from '../sell-your-car/page.module.css'` — Turbopack's `'use client'` export tracking is stricter when CSS module imports cross directory boundaries. | Audit blocker rule **`tp-cross-folder-css-module`** — CSS modules must be co-located with the file that imports them. |
| 6 | Form-field borders rendering invisible on the inventory page | Skeleton scaffolder pruned `styles/color-policy.css` but kept inventory CSS modules reference its `--t-*` role tokens → `var(--t-border)` resolved undefined → fell back to `currentcolor` → washed-out 1px stroke. | Two-pronged: (a) **`tools/scaffold-theme-skeleton.mjs` KEEP_PATTERNS** keeps `styles/color-policy.css`. (b) Audit blocker rule **`lib-missing-color-policy`** fires if any file uses `var(--t-*)` but the policy file is absent. |
| 7 | Form-field borders visible but visually washed out | `border: 1px solid color-mix(in srgb, var(--t-border) <70>%, transparent)` — token borders are already low-opacity; mixing further toward transparent drops them below visibility against card surfaces. | Audit blocker rule **`a11y-form-field-faded-border`** — flags `color-mix(... border <70%, transparent)` patterns. |
| 8 | "COLUMBUS VEHICLES" wordmark in primary blue against the dark header | `:where(a)/:is(a) { color: var(--color-primary) }` blanket rule in `base.css` — `:where()` ties on specificity (0,1,0) with CSS-module classes, so `<Link>`-wrapped wordmarks inherited the wrong color depending on stylesheet load order. | Audit blocker rule **`std-link-color-blanket`** — flags any `:where(a) { color: ... }` / `:is(a) { color: ... }` in CSS files. Style links per-component instead. |
| 9 | Hero section renders flat charcoal when `--brand-image-hero` is unset or 404s | Hero component painted only the brand image background; nothing behind it. | Audit advisory rule **`lib-hero-no-svg-fallback`** — flags `*Hero*.tsx` files that use `var(--brand-image-*)` but don't render `<HeroBackdrop>`. The skeleton scaffolder also keeps `components/HeroBackdrop.tsx` so the SVG fallback is always available. |
| 10 | Newly-scaffolded theme's `recently-sold` page renders unstyled | `recently-sold/page.tsx` was kept by the skeleton's keep-list, but its inline class names (`sps-section-container`, `sps-vehicle-card`) referenced styles in pruned CSS files. | Phase 8 design guidance now treats the kept `recently-sold/page.tsx` as a stub to redesign per archetype — like any other inner page. |
| 11 | Skill imports `app.py` for `maybe_start_linux_brand_automation` and crashes on Windows console (`'charmap' codec can't encode character '\U0001f527'`) | app.py prints emoji during startup; default cp1252 console can't encode it. | Guard applied in `tools/build-preview-from-theme.py` (Phase 13a helper): first action in `main()` is `sys.stdout.reconfigure(errors='replace')` + `sys.stderr.reconfigure(errors='replace')` so the optional `--automation` import of `app.maybe_start_linux_brand_automation` survives on Windows. Apply the same guard at the top of any future Python tool that imports `app.py`. |
| 12 | Identifier rewrite leaves UPPER_CASE constants like `SPRINGALLS_PHONE_TEL` | Scaffolder only handled Pascal/camel/kebab forms. | `scaffold-theme.mjs` and `scaffold-theme-skeleton.mjs` `replaceIdentifiers()` now also handles `upperShort` and `upperFull` forms (longest-first to avoid double-replacement). |
| 13 | Gilded-drive's `.contact-item svg { stroke: none }` blanks classic-dealer's contact icons when both themes ship to the same preview | Unscoped class-rule in a global stylesheet (`base.css`) — competes on tied (0,1,0) specificity with the other theme's scoped rule, source order decides which wins. | Audit advisory rule **`std-css-unscoped-global-rule`** — flags class selectors at column 0 in any global `.css` that doesn't reference `data-theme-id` anywhere. Wrap every rule in `:where(body[data-theme-id='<this-theme>'])` so it can't bleed. |
| 14 | Latest Arrivals / Directory / `/used-cars` show empty even though the dealer uploaded inventory via `/update/<slug>` | Server-side `fetch('/api/inventory')` from a theme component without `?brand=<slug>` — server-to-server requests resolve to 127.0.0.1 with no host or x-brand context, API falls back to default `inventory.json`. | Audit advisory rule **`data-fetch-no-brand-param`** — flags `fetch(...)` / `apiUrl(...)` to brand-scoped endpoints (`/api/inventory`, `/api/featured-vehicles`, `/api/recently-sold`, etc.) without a `brand=` parameter. Use `getBrandSlugFromRequest()` server-side or `useBrand().slug` client-side. |
| 15 | Browser silently kills form submit; console reports "An invalid form control with name='X' is not focusable" | `<input required>` (or `<input type="hidden" required>`) on a tab that's `display:none` when not active. Browser tries to focus the invalid field to display its message, can't focus a hidden control, aborts submit. | Multi-tab forms must use `<form novalidate>` and rely on server-side validation; alternatively, validate per-tab in JS and switch tabs to surface errors. Caught at `templates/update.html` 2026-05-10. |
| 16 | Theme ships without GDPR cookie consent — UK regulator complaints, no consent state captured | Phase 8 designed Hero / Header / Footer / sections fresh but forgot to mount a cookie banner; previous themes had a per-theme `CookieBanner.tsx` that was pruned by the skeleton scaffolder. | Two-pronged: (a) **Skeleton scaffolder's `componentShell` stub** mounts `<CookieBanner />` from `@/app/widgets/CookieBanner` by default — preserve through Phase 8 redesign. (b) Audit advisory rule **`lib-missing-cookie-banner`** — fires if Shell.tsx doesn't reference `CookieBanner`. The widget itself lives at `app/widgets/CookieBanner/` (theme-agnostic, brand-token-driven). |
| 17 | Homepage feels static / dead — no entrance animations, sections just appear | Phase 8 didn't add any `data-aos="..."` attributes. Themes used to have a per-theme `AosProvider` that was extracted to `app/widgets/AnimateOnScroll`; if Phase 8 doesn't sprinkle the attributes, the observer has nothing to animate. | Two-pronged: (a) **Skeleton scaffolder's `componentShell` stub** mounts `<AnimateOnScroll />` from `@/app/widgets/AnimateOnScroll` by default — observer's always running. (b) Audit advisory rule **`lib-no-aos-on-homepage`** — flags `pages/home/page.tsx` if it has zero `data-aos` attributes. **Variant list now lives in the Required Widgets section** (18 variants — fade family, zoom family, flip family, slide, blur-in) — kept there to avoid drift; this row only flags the gap. Honors `prefers-reduced-motion`. |
| 18 | Same form code duplicated across `pages/contact`, `pages/sell-your-car`, `pages/part-exchange` per theme — drift between themes, repeated debugging | Each theme writing its own `useLeadsForm`-wired form for the lead-capture pages. Field validation, error display, submit-handling, accessibility wiring — 150 lines of nearly-identical JSX per theme per form. | **Deferred work** (no rule yet). Plan: extract `<LeadCaptureForm config={{ leadType, fields, copy }} />` global widget at `app/widgets/LeadCaptureForm/` that themes consume with field config + className overrides. Until shipped, the per-theme forms are acceptable with the caveat that form fixes need to be applied to every theme's instance. |
| 19 | "Sell your car" nav link 404s | Header `NAV_ITEMS` pointed to `/sell-your-car`, but the Next.js app route is `/sell-my-car` (only that folder exists in `app/`). Visible label and URL slug diverge. Multiple themes (columbus, gilded-drive, ele) had the same bug. | SKILL Quality Bar §"Canonical inner-page routes" enumerates the 12 routed slugs. New audit advisory rule **`std-unrouted-href`** (deferred) — flag any `<Link href="...">` / `<a href="...">` inside a theme that points to a path outside the whitelist. Until shipped: SKILL.md whitelist is the canonical reference; cross-check it during Phase 8. |
| 20 | Header invisible at the top of the page on light backgrounds — nav links sit on top of page content, illegible | `background: transparent` on the default header, only filling in `headerScrolled` on scroll. On homepage, the hero often starts pale enough that the nav can't read. | SKILL Quality Bar §"Header must have a visible background" — default to translucent `color-mix(in srgb, var(--color-bg) 92%, transparent)` + `backdrop-filter: blur(...)`. Intensify on scroll. Add a thin brand-tinted gradient line below the header for separation. |
| 21 | UK car-buyer demos miss "Home" in nav and bounce when they want to return to homepage | Reliance on "click the logo" as the home-discovery affordance. Older buyers don't reach for the wordmark. | SKILL Quality Bar §"Always include a Home link in nav" — `NAV_ITEMS[0]` MUST be `{ label: 'Home', href: '/' }`. Mobile overlay nav + footer's primary nav both include Home. |
| 22 | Page hero / section titles look washed-out — white text over light-area patches of the photo drops below AAA | Lead text painted as `color-mix(in srgb, #ffffff 84%, transparent)` over imagery, with a single ~50% dark gradient overlay. At image bright spots the lead becomes legible only at AA-borderline. | SKILL Quality Bar §"Hero & PageHero text-contrast floor" — heavy gradient (`rgba(8,11,17,0.86) → 0.55`) + radial brand glow + grid mask layer. Titles `#fff` with `text-shadow: 0 2px 24px rgba(0,0,0,0.4)`; lead text `#ffffff` at opacity 0.92 with softer shadow. Solid white, never muted-white, over imagery. |
| 23 | Every theme ships the same shared `<CookieBanner />` widget — looks identical across dealers, "rigid" and undifferentiated | Pitfall row 16's earlier rule (mount the global widget) made the cookie banner uniform. Same applies to every section component when archetypes share the same JSX and only swap tokens. | SKILL Quality Bar §"Cookie banners must NOT be one-size-fits-all" (supersedes row 16) — every bespoke theme ships its own `components/<Theme>CookieBanner.tsx` matching the archetype's visual language. Payload shape stays compatible. Same per-archetype variation principle applies to every section component (Hero, Header, Footer, sections, PageHero, forms). Shared widget remains as fallback / reference, not as default. |
| 24 | Footers don't credit Carous Limited — dealers miss platform attribution; lost soft-marketing surface | Default scaffolder footer template + most Phase-8 redesigns omit the platform credit. | SKILL Quality Bar §"Footer attribution to Carous Limited" — every theme's footer-bottom strip MUST include `Site by <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">Carous Limited</a>`. Subtle brand-primary link styling, sits between copyright and legal nav. |
| 25 | Themes feel "plain and predictable" — palette swap but identical predictable layout, no visual interest, dealers respond lukewarmly | Phase-8 redesigns sticking to the minimum: a clean grid, a clean form, no decorative texture. Modern archetype spec was followed mechanically without injecting the futuristic/imagery-rich devices the prospect-preview surface demands. | SKILL Quality Bar §"Modern / futuristic visual language is REQUIRED, not optional" — every Phase 8 must inject a number of: layered hero imagery (photo + SVG + gradient + glow), neon brand-tinted glow blobs, gridded dot-pattern backgrounds, corner-bracket reticle accents, chip-status badges with pulsing dot indicators, text-gradient highlights on hero phrases, brand-tinted top/bottom borders on alternating sections, asymmetric/staggered card layouts (break uniform N-up grids at least once per page). CSS-only, no asset weight, token-discipline preserved. |
| 26 | Hero/PageHero/CtaBanner title text renders in dark `var(--color-text)` over the dark image — title looks washed out, almost invisible. Lead text is fine, only the heading is broken. | `base.css` set `color: var(--color-text)` on the global `[data-theme-id='<id>'] h1, h2, h3, h4` rule (specificity (0,1,1)). The CSS-module `.title { color: #ffffff }` in PageHero/CtaBanner is at (0,1,0) and silently loses. Symptom: dark navy text on a dark hero photo, looks like the photo "ate" the headline. First repro: ELE Car Sales `/finance` page 2026-05-10 (second round). | SKILL Quality Bar §"Hero & PageHero text-contrast floor → Specificity gotcha" — `base.css` global heading rules MUST stay typography-only (font-family / font-weight / letter-spacing / margin). Never set `color` on global `h1-h4`. If you need a default heading color, let it cascade from `body { color: var(--color-text) }` (light-section default) and let per-component CSS-modules override on dark sections. If global heading rules must be scoped by theme id, wrap in `:where(...)` so specificity drops to (0,0,0) and class overrides win cleanly. |
| 27 | Themes generated via /new-theme shipped without a WhatsApp floating CTA — dealers expect this as an operational primitive on used-car sites. | The skeleton scaffolder's Shell stub only mounted `<AnimateOnScroll />` and the shared `<CookieBanner />`. The WhatsApp widget lived as a per-theme component in old templates (springalls-classic's WhatsAppEnquiry) and wasn't promoted to a global widget, so the skeleton scaffolder pruned it when it stripped the visual layer. New themes shipped without it. First report: 2026-05-10, ELE Car Sales preview. | (a) Built a new brandstudio-global widget at `app/widgets/WhatsAppFab/`. (b) Updated `tools/scaffold-theme-skeleton.mjs` `componentShell()` stub to mount `<WhatsAppFab brand={brand} />` by default. (c) SKILL §"Required widgets" expanded with the contract: brand-token-driven, reads `brand.location.phone`, has online/offline status from opening hours, shared across themes by design (operational primitive, not a brand-voice surface). |
| 27b | "Sell your car" floating FAB tried and rejected | Built `<SellYourCarFab />` companion to the WhatsApp FAB on 2026-05-11, then removed the same day per dealer feedback. A second floating affordance in the corner crowded the WhatsApp button and didn't give the user a different decision to make. | SKILL §"Required widgets" includes the explicit "do NOT add a floating Sell your car CTA" note. Surfaces for the sell-your-car flow stay nav-bar link, dedicated page, homepage CtaBanner — no floating affordance. |
| 28 | Skill-generated sell-your-car pages were hand-rolled per theme — drift between themes, lower fidelity than carous-platform's huntsmotors/csmotors pages, missing the 3-step wizard + UK plate flag + vehicle lookup + valuation reveal that buyers expect. | Phase 8 wrote a per-theme `ValuationFormIsland.tsx` (a single-step form with manual reg/mileage/make/model inputs) instead of mounting the carous-platform widget. The carous-platform monorepo has `packages/sell-your-car/` (`@carous/sell-your-car`) at ~2k LOC that handles plate formatting, mileage formatting, vehicle lookup via `/api/lookup`, trade-price reveal, contact panel — none of that was being replicated. First report: 2026-05-11. | (a) Ported the full carous-platform widget into `app/widgets/SellYourCarWidget/` (types + format + lookup + payload + DefaultInfoPanel + SellYourCarWidget + 910-line styles.css). (b) Added `/api/lookup` POST route that proxies to `/api/vehicles/lookup` and falls back to a synthesized minimal vehicle for prospect previews. (c) SKILL §"Required widgets" now mandates mounting `<SellYourCarWidget />` inside `pages/sell-your-car/` via a co-located client island — Phase 8 must NOT write a hand-rolled valuation form anymore. (d) ELE theme is the canonical example: `pages/sell-your-car/page.tsx` (Server Component) + `pages/sell-your-car/SellYourCarMount.tsx` (client island that calls `useBrand()` + passes brand context to the widget). |
| 29 | Saved per-brand inventory JSON ignored — dealer uploaded vehicles via `/update/<slug>` but Latest Arrivals / `/used-cars` / Featured / Recently Sold all rendered empty or showed the default `inventory.json` instead of `<slug>-inventory.json`. | `/api/inventory/route.ts` only read the `x-brand` header and host for brand resolution; the `?brand=<slug>` query param that themes pass on server-side fetches was IGNORED. Server-to-server fetches resolve to `127.0.0.1` (no useful host, no x-brand header) so the API fell through to the `'fairfield'` default. The companion `/api/featured-vehicles` and `/api/recently-sold` routes correctly read `?brand=`, so they worked — but their themes were ALSO affected because `LatestArrivals.tsx` was parsing `data.vehicles` instead of the actual `{ items, meta }` response shape. First report: 2026-05-11, auto-wow-uk-bespoke preview. | (a) Updated `app/api/inventory/route.ts` to read `?brand=` first (with previews.db validation via `fetchBrandBySlug`, but accepts the literal slug if not yet in the previews table so freshly-scaffolded themes serve disk inventory). (b) Updated `app/api/featured-vehicles/route.ts` fallback: when no vehicle has `featured: true`, sort by newest-year + price-desc and take the first N instead of a random shuffle (the random shuffle made previews look different every reload, which dealers found unsettling). (c) SKILL Quality Bar §"Brand-scoped server fetches" stays in force — themes still must pass `?brand=`; the API is now equipped to actually use it. (d) Documented response shapes in this row: `/api/inventory` → `{ items, meta }`; `/api/featured-vehicles` → `Array<vehicle>`; `/api/recently-sold` → `Array<vehicle>`. Theme components must accept either array-or-`{items}` shape so they survive future shape tweaks. |
| 30 | Inventory pages identical across every theme — the skeleton scaffolder keeps `pages/used-cars/page.tsx` and `[slug]/page.tsx` verbatim from `springalls-classic` because the data-layer logic is non-trivial, but Phase 8 was treating "kept" as "don't touch" → every prospect preview shipped with the same showroom-grid layout, lower visual differentiation than dealers expect. | Phase 8 conflated "keep the data layer" with "don't touch the file at all". The SKILL.md guidance for kept inventory was effectively `audit-ignore-file: ... — deferred work`, which was correct for the audit advisories but wrong as a design directive. | (a) Added a new SKILL Quality Bar §"Inventory pages MUST be redesigned per archetype" with the data-layer/render-layer split rule. (b) Created `docs/inventory-design-library.md` — 7 list patterns + 6 detail patterns sourced from reference dealers (Autotrader, Cinch, Cazoo, Hexagon, Vision Prestige, McLaren Approved, etc.), with a rotation table so no two themes ship the same layout. (c) New audit advisory rule **`inv-redesign-required`** (deferred — when shipped, flag inventory pages whose JSX is unchanged from springalls-classic baseline). **Superseded 2026-05-11 by row 32**: the "pick ONE list pattern and ONE detail pattern" framing was too prescriptive. The library is now a reference catalogue / brain-prompt, not a template; themes synthesize fresh layouts. The rotation table still records what each theme leaned on, but the constraint is "no two themes ship the same layout", not "no two themes pick the same library entry". |
| 31 | Themes ship "static and dead" — palette-swapped Hero / Header / sections that don't move or glow at all once the page loads. Dealer feedback consistently described prospect previews as "fine but lifeless." | Phase 8 added decorative SVG and gradient layers but no motion. Static radial-gradient glows look intentional in static mockups but feel inert on a real device. `data-aos` attributes were sprinkled on a few sections but not used systematically — typical theme had 3-4 AOS attrs only on the homepage and zero on inner pages. No scroll-tied effects. Hero photos sat still while everything else moved. | Two-pronged: (a) New brandstudio-global widgets — `<MotionFX />` (animated keyframe library: `.mfx-glow-pulse`, `.mfx-glow-orbit`, `.mfx-pulse-dot`, `.mfx-shimmer`, `.mfx-text-glow`, `.mfx-border-glow`, `.mfx-scan`, `.mfx-float`, `.mfx-tilt`, etc — all brand-token-driven, all `prefers-reduced-motion`-respecting) and `<ScrollProgress />` (rAF scroll-tied driver that writes `--mfx-progress` per `[data-mfx-scroll]` element, paired with five built-in variants: `parallax-slow|medium|fast`, `fade-out-on-exit`, `blur-on-exit`, `zoom-on-enter`). AnimateOnScroll expanded from 7 variants to 18 (added flip-up/down/left/right, slide-up/down, fade-up-right/up-left/down-right/down-left, zoom-in-up/out-down, blur-in) plus per-element `data-aos-duration` and `data-aos-easing`. (b) New SKILL Quality Bar §"Motion & light language — REQUIRED, not optional" mandates: animated glows (no static radial-gradient divs in heroes), `.mfx-pulse-dot` on every status chip, 4+ data-aos elements per page with varied variants, at least 1 `data-mfx-scroll` effect on the homepage, `.mfx-shimmer` on primary CTAs, `.mfx-text-glow` on hero highlight phrase. (c) Skeleton scaffolder's Shell stub now mounts all three motion widgets by default so Phase 8 only sprinkles attributes; no plumbing per theme. First report: 2026-05-11 from operator feedback on auto-wow-uk-bespoke. |
| 32 | Vehicle detail page (and other "kept" inner pages) reuse the springalls-classic / sibling-theme render structure verbatim — only colors and class names differ. Result: every theme's `/used-cars/<slug>` looks like the same page in a different palette. | Phase 8 lifted the configurator-led pattern from `docs/inventory-design-library.md` near-verbatim for `ncr-van-sales-bespoke` and kept the `audit-ignore-file: tp-use-client-on-page` annotation that the skeleton ships with. The design library was being used as a **template** rather than a **reference**. Audit rule `inv-redesign-required` (advisory) targets the LIST page only; no equivalent for the detail page. First report: 2026-05-11, Difatha on `ncr-van-sales-bespoke`. | (a) New SKILL Quality Bar §"Autonomous independent designs — every page, every component" explicitly forbids borrowing render structure from any baseline; inventory-design-library is documented as reference / brain-prompt only, not a copy source. (b) Required visual language extended to mandate gradient backgrounds + geometric backgrounds in addition to the existing motion requirements (`--t-brand-gradient`, `--t-neon-gradient`, `--t-band-gradient` already exist; geometric is CSS-only patterns or decorative SVG). (c) The "vehicle detail page must have its own composition language" clause enumerates the design axes (hero / gallery / spec / finance / enquiry) that must vary across themes. (d) Future audit rule `inv-detail-redesign-required` (deferred) should compare detail-page JSX structure against the springalls baseline. Until shipped, the SKILL clause is the contract. |
| 33 | Vehicle detail page review (chesterfield-motor-empire-bespoke 2026-05-11): 6 missing must-haves — gallery layout was the same "main + thumbnail strip" as every other theme, generic `<MessageCircle />` icon used on the WhatsApp link, enquiry rendered as a 4-field inline form mid-page (buyers had to scroll past it to reach specs), columns balanced poorly on large screens, no "similar vehicles" row, no SEO makes-list before the footer. The page felt like "another listing template" rather than a deep-funnel commit surface. | Phase 8 designed the detail page autonomously per the autonomous-design clause but the SKILL didn't enforce these specific must-haves. The full-bleed mosaic gallery pattern (1 main + 4-thumb 2×2 mosaic, like the Hunts Motors reference screenshot Difatha shared) wasn't in the inventory-design-library. WhatsApp icon discipline was implicit in the WhatsAppFab widget but not surfaced as a per-theme rule. The EnquiryModal pattern existed in carous-platform but hadn't been ported to brandstudio as a shared widget. Similar-vehicles + makes-SEO sections were assumed obvious but absent from the SKILL. | Five-pronged: (a) New shared `<WhatsAppIcon />` extracted from `app/widgets/WhatsAppFab/WhatsAppIcon.tsx` (re-exports from the WhatsAppFab index) so themes use the same official mark. WhatsAppFab itself now imports the same icon — single source of truth. (b) New shared `<EnquiryModal />` widget at `app/widgets/EnquiryModal/` with the canonical modal pattern (carous-platform parity), brand-token-driven, two-column layout with form on the left + Call/Email/WhatsApp side panel using the official WhatsApp glyph. Companion `useEnquiryModal()` hook for trigger management. (c) New SKILL Quality Bar §"Vehicle detail page composition (must-have)" enumerates all 6 requirements with code patterns. (d) New SKILL Required Widgets entries for `<WhatsAppIcon />` and `<EnquiryModal />`. (e) Four new audit advisory rules: `lib-whatsapp-icon-generic` (file uses MessageCircle alongside wa.me), `inv-detail-enquiry-not-modal` (inline form on detail page without EnquiryModal), `inv-detail-no-similar-vehicles` (no similar-vehicles row detected), `inv-detail-no-makes-seo` (no Browse-by-make panel detected). Inventory design library extended with two new detail patterns: G. Full-bleed mosaic + H. Modal-led enquiry; new "Required detail-page sections" section listing the contract. |
| 34 | Newly-scaffolded themes shipped without a preview-mode notice strip — when the preview-deploy env set `NEXT_PUBLIC_PREVIEW=1`, dealers and prospects had no visual confirmation they were on a preview vs. the live site, so dealers shared preview URLs as if they were production. Older themes (`classic-dealer`, `gilded-drive`, `springalls-classic`) had per-theme `components/PreviewBanner.tsx` files; the skeleton scaffolder pruned them when it stripped the visual layer, so every new bespoke theme (columbus, ele, auto-wow) shipped without one. | The PreviewBanner lived as a per-theme component reading `usePreviewBanner` from `app/hooks/`. The skeleton scaffolder kept the hook but pruned the component file. Phase 8 was meant to redesign it but instead skipped it entirely — the "preview banner is a preview-deploy concern, not a theme concern" mental model meant it kept dropping off the Phase 8 checklist. First report: 2026-05-11 from Difatha after the auto-wow-uk-bespoke build. | (a) Promoted to a brandstudio-global widget at `app/widgets/PreviewBanner/` — single brand-token-driven implementation (uses `--color-primary` background, white text) that themes consume with `<PreviewBanner brand={brand} />`. Renders nothing when `NEXT_PUBLIC_PREVIEW !== '1'` so it's always-mountable. Optional `force` prop for dev preview. (b) Updated `tools/scaffold-theme-skeleton.mjs` Shell stub to mount `<PreviewBanner brand={brand} />` BEFORE `<Header />` by default — so every future theme inherits the banner without re-rolling. (c) SKILL §"Required widgets" expanded with the widget contract — themes must NOT re-implement a per-theme preview banner; mount the global widget. (d) Hooked into auto-wow-uk-bespoke's Shell as the reference implementation. |
| 35 | Hero title rendered too large on desktop, wrapping to 3-4 lines, looking clumpsy and amateurish. Title text "BUILT FOR THE ROAD, BACKED FOR THE LONG HAUL." at `clamp(2.8rem, 6.4vw, 5.6rem)` filled the entire hero column at 1920px. | Phase 8 used the rugged-archetype recommendation `clamp(2.8rem, 6vw, 5.5rem)` directly without considering the actual title text length. Without a `max-width` character cap, the title stretched edge-to-edge. The "bigger is better" intuition for hero titles overrode the "fit-in-2-lines" constraint that defines a polished hero. First report: 2026-05-11, Difatha with screenshot of NCR Van Sales preview. | New SKILL Quality Bar §"Hero title sizing — fit-in-2-lines max" caps the upper bound of the `clamp()` to ~3.6rem for single-clause headlines and ~4.4rem for two-word brand statements. ALL hero titles get a `max-width: 14ch` (single clause) or `max-width: 18ch` (two clause) on the title element. Title text must be ≤ ~50 characters and ≤ 2 clauses; three-clause titles split into eyebrow + title + lead. Audit rule `lib-hero-title-too-big` (deferred — flag clamp upper bound ≥ 4.5rem alongside title text > 50 chars). |
| 36 | Top contact bar (the strip above the Header) didn't include social icons — dealers reported that the missing Facebook/Instagram links made the site look incomplete. Multiple themes also failed to surface the live-stock pulsing chip + showroom-location chip + phone-CTA in the canonical UK-dealer order. | Phase 8 designed Headers organically per archetype without a top-bar composition contract. Social icons existed in the brand record (`brand.socialLinks.facebook/instagram/youtube/linkedin`) but Phase 8 didn't know to surface them. The status-strip pattern was implemented inconsistently — some themes had pulsing chips, others didn't; some had the phone CTA, others didn't. | New SKILL Quality Bar §"Top contact bar — required composition" enumerates the 4 required elements in canonical order: (1) showroom location chip with map-pin icon, (2) live-stock / status chip with `.mfx-pulse-dot` tied to `brand.openingHours`, (3) social icons sourced from `brand.socialLinks` (hide individual icons whose URL is empty; hide group entirely if `socialLinks` absent), (4) phone CTA pulled from `brand.location.phone` (always rightmost). PreviewBanner sits ABOVE the top contact bar (`position: sticky; top: 0`); when `NEXT_PUBLIC_PREVIEW=1` is set, the banner is first; otherwise contact bar is topmost (no layout shift). Mobile overlay nav must also surface social icons. |
| 37 | Operator uploaded custom hero / about / services images via the dashboard `/update/<slug>` page, but they don't render on the deployed preview — the theme keeps showing its archetype-default photos instead. | Phase 8 theme component hardcoded `background-image: url('/themes/<id>/images/hero.jpg')` (or a literal remote URL) directly in the CSS module instead of `var(--brand-image-hero)`. The dashboard saved the URL into `brand.images.hero` and `BrandStyles.tsx` wrote it into `--brand-image-hero` correctly, but the component never consumed the var. Result: dashboard edits silently drop. First report: 2026-05-11, Difatha after testing dashboard image upload against multiple themes. | (a) New SKILL Quality Bar §"Brand-uploaded images must render — `var(--brand-image-*)` plumbing" enumerating all 7 image slots and the consumption contract. (b) Every Hero / PageHero / CtaBanner / decorative-image component MUST use `background-image: var(--brand-image-<slot>)` on a CSS-module class — never a hardcoded URL. (c) `BrandStyles.tsx` ships all 7 slot mappings by default; the rule is "never remove them" rather than "set them up". (d) Diagnostic: `getComputedStyle(document.documentElement).getPropertyValue('--brand-image-hero')` in the browser console shows what the brand record resolves to. (e) Audit rule `lib-image-not-brand-driven` (deferred — flag any `background-image: url(...)` in a theme CSS module that isn't `var(--brand-image-*)` or a decorative data-URI). |

When you add a new audit rule for a future bug, append a row here. The
catalogue should grow as a record of "what we've already learned not to
do" — a future Claude reading this list won't re-debug what's already
been debugged. Don't remove rows even if the underlying tool changes:
the row stays as institutional memory.

## Tool reference (this skill calls these)

| Tool | Purpose | Mode |
|------|---------|------|
| `tools/check-skill-env.mjs` | Phase 0.5 pre-flight. 3 gates: tools-present, node-deps (sharp), theme-sync-clean. Exit 1 on any fail. | Both modes |
| `tools/extract-logo-colors.mjs` | Deterministic dominant-color extraction from a logo (sharp + saturation-filtered histogram). | Mode A only |
| `tools/check-theme-contrast.mjs` | WCAG AA validator for theme color combos. Exit 1 on critical fail. | Both modes |
| `tools/audit-theme.mjs` | Static-analysis quality gate. Rule prefixes: `a11y-` (accessibility), `std-` (standards), `data-` (data-fetching), `mobile-` (responsive), `perf-` (performance), `brand-` (token discipline), `tp-` (Turbopack collision avoidance), `lib-` (foundation/dependency), `motion-` (motion & light language), `inv-` (inventory page contracts — list and detail). Blockers exit 1. Supports inline `audit-ignore: <rule>` and file-level `audit-ignore-file: <rule>` directives. See **Pitfalls catalogue** above for the historical bugs each rule prevents. | Both modes |
| `tools/rollback-theme.mjs` | Partial-theme cleanup when a run fails between Phase 7 and 12. Removes theme folder, public images, DNA JSON, images manifest, logo-colors JSON, then re-runs theme:sync. Idempotent. Flag: `--dry-run`. (No longer touches MySQL — brand cleanup is dashboard-only.) | Both modes |
| `tools/fetch-theme-images.mjs` | Source 7 page-level images (hero/about/services/finance/partExchange/sellYourCar/recentlySold). Curated Unsplash catalogue with classic-archetype fallback; live API mode when `UNSPLASH_ACCESS_KEY` is set. | Mode A only |
| `tools/generate-theme-favicon.mjs` | Emit a 32×32 archetype-aware SVG favicon at `public/themes/<id>/favicon.svg`. Five templates (classic / modern / rugged / luxury / prestige). Auto-discovers primary color + archetype + glyph from the DNA JSON; accepts `--primary`, `--accent`, `--archetype`, `--glyph` overrides. | Both modes |
| `tools/extract-theme-dna.mjs` | DNA extractor from a carous-platform sibling app. | Mode B only |
| `tools/scaffold-theme.mjs` | Full clone-and-edit scaffolder. Used by Mode B — clones springalls-classic, applies DNA, downloads hero. | Mode B |
| `tools/scaffold-theme-skeleton.mjs` | Skeleton-first scaffolder. Used by Mode A — produces ONLY contract + plumbing (~39 files), strips visual layer for Phase 8 fresh design. | Mode A |
| `tools/build-preview-from-theme.py` | Optional Phase 13a helper. Registers a preview brand against a theme via `backend.services.preview.upsert_preview` (same path the dashboard `/create` POST takes). Flags: `--theme-id`, `--brand-name`, `--slug`, `--domain`, `--dna`, `--automation`, `--overwrite`. On Windows uses `sys.stdout.reconfigure(errors='replace')` to survive emoji output from `app.py` import. Exits 0 with preview URL on stdout; 2 if slug collides; 3 on persistence failure. | Both modes (optional) |
| `npm run theme:sync` | Auto-discovers themes, regenerates registries + manifest. Run automatically by `.github/workflows/deploy.yml` on every prod deploy so new themes wire into the dashboard's `/create` picker without manual steps. | Both modes |
