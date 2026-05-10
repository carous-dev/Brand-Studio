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

1. Working directory is `F:\projects\brandstudio`. Pivot there if not.
2. `tools/scaffold-theme.mjs` exists. (Mode A doesn't need
   `extract-theme-dna.mjs`; Mode B does.)
3. For Mode B: `F:\projects\carous-platform\apps\` exists with source apps.

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
- Skip-to-content link in the shell. The springalls-classic template ships
  with this; preserve it through adaptation.

**Mobile-first responsive (must-have):**
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

## Required widgets — use the brandstudio globals, don't re-roll

Every theme's Shell **must** mount these brandstudio-global widgets
(skeleton scaffolder wires them by default; preserve through Phase 8):

- **`<AnimateOnScroll />`** from `@/app/widgets/AnimateOnScroll` —
  one-shot IntersectionObserver-based scroll-reveal driver. Mount once in
  Shell. After it's mounted, ANY element in the tree can opt into entry
  animation by adding `data-aos="fade-up" | "fade-down" | "fade-left" |
  "fade-right" | "fade" | "zoom-in" | "zoom-out"` (optional
  `data-aos-delay="120"` ms). Honors `prefers-reduced-motion`. The
  companion `aos.css` is auto-imported via the widget's `index.ts`.

- **`<CookieBanner />`** from `@/app/widgets/CookieBanner` — UK GDPR
  consent banner with three categories (essential / analytics /
  marketing). Theme-agnostic, brand-token-driven, accepts `brandSlug`
  (for namespacing the localStorage key) and `cookiePolicyHref`. Pass
  the brand slug from `useBrand()` so multiple brands bundled into the
  same preview don't share consent state.

**Why these are widgets, not per-theme components:** the logic
(IntersectionObserver, localStorage consent, focus-trapped settings
panel) is identical across themes. Re-implementing per theme is
duplication that drifts. The widget's CSS uses brand tokens
(`var(--color-primary)`, `var(--color-text)` etc.), so the visual
identity still retints per dealer automatically.

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
one complete the moment it lands. The phase set differs by mode.

**Mode A phases:**
0.5. Pre-flight check (`check-skill-env.mjs`) — verify environment before any work.
1. Gather inputs (logo path + dealer URL via AskUserQuestion).
2. Analyze the logo:
   a. Deterministic colors via `extract-logo-colors.mjs`.
   b. Vision-analyze typography character + shape language.
   c. Validate WCAG AA contrast on the suggested primary; iterate if needed.
   d. Map character to archetype (`classic` / `modern` / `rugged` / `luxury` / `prestige`).
3. Scrape the dealer site (WebFetch — brand name, services, location, hero image, etc).
4. Pick a paired Google Font from the character analysis.
5. Synthesize DNA JSON (includes the hero image URL + chosen archetype).
6. Derive theme id + display name from brand name.
7. Run scaffolder with `--archetype <id>` (clones baseline + downloads hero).
7.5. Fetch theme imagery — 7 page-level slots via `fetch-theme-images.mjs`.
8. Adapt per archetype design spec (`docs/theme-archetype-specs.md`).
9. Sync registries.
9.5. Register the preview brand via `register_preview_brand.py --images <manifest>`.
10. Verify:
    a. `tsc --noEmit` clean against zero baseline.
    b. Contrast re-check on final DNA.
    c. Audit (`audit-theme.mjs`) — 0 blockers.
    d. Smoke test (`smoke-test-preview.mjs`) — brand record fetchable, themeId correct, images populated, preview URL responds.
11. Log to FEATURE_LOG.
12. Report (with preview URL + image attributions + audit advisories).

If anything fails between Phase 7 and 12, run
`node tools/rollback-theme.mjs --theme-id <id>` to clean up the partial
artifacts (theme folder, public images, DNA JSON, brand row, registries)
before re-attempting. Idempotent — safe to run multiple times.

## Phase 0.5 — Pre-flight environment check

Before gathering inputs (which costs a user round-trip), verify the
environment is healthy:

```bash
node tools/check-skill-env.mjs
```

Seven gates: tools-present, node-deps (sharp installed), mysql-env,
mysql-reachable, flask-running, lvhme-resolves, theme-sync-clean. Exit 0
means proceed; exit 1 means tell the user which gate(s) failed and stop.

Common failures + fixes:
- **flask-running FAIL**: User needs to run `python app.py` in a separate terminal.
- **mysql-reachable FAIL**: Check MySQL service; verify `.env` has correct creds.
- **lvhme-resolves FAIL**: Internet/DNS issue. Pre-flight can be bypassed with `--skip-lvhme` if you're testing offline, but Phase 12 preview URL won't work.
- **theme-sync-clean FAIL**: An existing theme has a broken contract file; investigate before scaffolding a new theme.

Skip flags exist for testing edge cases: `--skip-flask --skip-lvhme --skip-sync`. Don't skip in normal runs.

**Mode B phases:** same as the Mode A flow but Phases 1–5 are replaced by
running `tools/extract-theme-dna.mjs --source <app>` against the named
carous-platform app. Phase 8 adaptation reads from the source app's files
instead of the dealer URL.

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

## Phase 7.5 — Fetch theme imagery (Mode A only)

After scaffolding, source 7 page-level images for the new theme — hero,
about, services, finance, partExchange, sellYourCar, recentlySold — and
self-host them under `public/themes/<theme-id>/images/<slot>.jpg`.

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
... }, warnings}`. Pass that path to `register_preview_brand.py --images
<path>` in Phase 9.5 so the brand record's `images.<slot>` fields point
at the local URLs.

If the script reports warnings (slot couldn't be sourced, classic-fallback
used), surface them in the Phase 12 report — the team will want to swap
those slots in the dashboard before a real pitch.

## Phase 8 — Adapt to the dealer's content (Mode A)

This is the part that turns a recolored clone into a *bespoke* theme. In
Mode A the dealer-specific copy from Phase A3 drives the edits.

**Mode A — fresh design, not adaptation.** The skeleton you scaffolded
in Phase 7 has stub Header/Footer/Shell + 12 placeholder pages. In Mode
A this phase **designs Hero, Header, Footer, the homepage composition,
each section component, and each page body fresh** — drawing from the
archetype spec, the dealer's brand voice (from Phase A3), the brand
tokens (`var(--color-*)`, `var(--brand-image-*)`), and the chosen
typography. **Never** copy-paste from springalls-classic or another
theme's components — even with rewriting. Two themes that share JSX
structure aren't two themes.

**Read the archetype spec first.** Open `docs/theme-archetype-specs.md`
and find the section matching the archetype you chose in A2d. The spec
lists which components to design, the layout language, section
composition, CSS classes to add, and new components to create. The
spec is a **design brief**, not a copy-paste source — interpret and
execute, don't transcribe.

**Mode B — adaptation, not redesign.** Mode B uses the full
clone-and-edit scaffolder, so the new theme starts as a working
springalls-classic clone. Phase 8 in Mode B is text replacement (nav
items, dealer copy, phone numbers, search defaults) — DON'T redesign
components in Mode B; that defeats the point of porting from a sibling.

Every edit/design below must satisfy the **Quality Bar** section. The
audit in Phase 10c will catch the mechanical violations.

1. **`components/Hero.tsx`** — Replace the placeholder headline with the
   dealer's tagline (or synthesize: `"Used Cars for Sale in <City>,
   <County>"`). Wrap the hero in `<section>` with the headline as the
   single `<h1>`. CTAs are real `<button type="button">` or `<a href>`,
   never `<div onClick=>`. Search-field default makes/models become empty
   states (brand-driven inventory will populate at runtime). Touch
   targets ≥44px. If the dealer URL exposed a hero image, the scaffolder
   already self-hosted it; nothing more to do here.
2. **`components/Header.tsx`** — Replace `NAV_ITEMS` with the dealer's
   actual nav items from A3 (preserve hrefs that map to existing pages:
   `/`, `/used-cars`, `/services`, `/finance`, `/sell-my-car`,
   `/part-exchange`, `/contact`). Items the dealer has that don't map
   should be omitted (don't fabricate routes). Mobile hamburger must
   collapse below ~768px; hamburger trigger is a `<button aria-expanded=>`
   not a `<div>`. Nav uses `<nav aria-label="Primary">`. Each nav `<a>`
   has visible focus state.
3. **`components/Footer.tsx`** — Inject the dealer's address, phone,
   opening hours from A3. Wrap in `<footer>` with column headings as
   `<h3>` (no second `<h1>`). Phone is a `tel:` link, email is a `mailto:`
   link, address is structured (use `<address>` element). Opening hours
   in a `<dl>` (definition list) is semantically correct. Footer columns
   stack on mobile, grid on tablet+.
4. **`pages/contact/page.tsx`** — Replace the placeholder phone/email
   `__contact` defaults with the dealer's actual numbers from A3. Form
   uses real `<label>` for every `<input>`, `aria-required="true"` on
   required fields, visible error messages tied via `aria-describedby`,
   and submit handler that calls `form.submit()` (not `handleSubmit` —
   that doesn't exist on the hook).
5. **`pages/used-cars/[slug]/page.tsx`** — Update the
   `<UPPER>_PHONE_TEL`, `<UPPER>_PHONE_DISPLAY`, `<UPPER>_WHATSAPP_URL`
   fallback strings to the dealer's real numbers from A3. The constants
   appear inside both `VehicleNotFoundTemplate` and the main detail
   component; update both. Don't touch the `audit-ignore` annotations.
6. **`context/BrandStyles.tsx`** — The scaffolder already pinned the hero
   image fallback to `/themes/<id>/hero.jpg` if it downloaded one. If not,
   the default placeholder remains. Don't hardcode dealer-specific colors
   here — the scaffolder set defensible fallbacks; tenant overrides flow
   through the brand's `theme.colors.*` fields.
7. **`pages/home/page.tsx`** — Section composition order. Default order
   from the template: Hero → TrustSignals → LatestArrivals (inventory
   carousel) → ServiceHighlights → Services → CTA → Reviews → Directory.
   If the dealer's homepage from A3 uses a noticeably different
   composition (e.g. reviews higher, no directory), reorder these
   imports to match. **Don't add new section components in this pass** —
   defer to a follow-up if the dealer needs something the section
   contract doesn't cover.

Data-fetching guidance for adapted pages:
- Server Components stay server. Pages that don't already have
  `'use client'` should not gain it during adaptation.
- Inventory pages (`/used-cars`, `/recently-sold`) fetch on the server
  with `next: { revalidate: 60 }` (one minute is a good default for
  prospect previews). Don't add `useEffect` + `fetch` for inventory.
- Vehicle detail page (`/used-cars/[slug]`) is `'use client'` because
  it has galleries and modals. That's fine — it's interactive. Keep its
  initial data fetched via the existing pattern (route param → API call).
- Brand context (`useBrand`) is client-side. That's fine. Pages that
  only read brand metadata for SSR (e.g. SEO meta) should use
  `getBrand` from `@/lib/getBrand.server` (server variant) instead.

Quality bar:

- Each edit must keep the file type-safe — no missing imports, no broken
  JSX. The TS compiler runs in Phase 9 and catches most issues.
- CSS must stay scoped under `[data-theme-id='<theme-id>']` (the
  scaffolder already namespaced existing rules; preserve that).
- Do not touch `theme.json`, `tokens.ts`, `pages.ts`, `shell.tsx`,
  `recipes/index.ts`, `sections/index.tsx` — those are the contract
  surface and the scaffolder produced them correctly.
- Do not invent dealer information. If a field is missing from A3, leave
  the scaffolder's placeholder and note it in the final report.

Time budget for adaptation: 5–10 file edits. Don't expand scope. If the
dealer's site has unusual layout flourishes (split heroes, video backs,
custom 3D), note them in the report as "follow-up enhancements" and skip
in this pass.

## Mode B — Port from carous-platform sibling

Phases B1–B5 replace A1–A5; everything from Phase 6 onward is shared with
Mode A.

### B1 — Pick a source app

Source apps live in `F:\projects\carous-platform\apps\`. Available pool
(`Glob "apps/*"` to refresh):

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

## Phase 9.5 — Register a preview brand (OPTIONAL — local sanity-check only)

> **Scope change 2026-05-10:** the `/new-theme` skill no longer creates
> brand records or wires domains as a required step. Themes ship as
> reusable code; brand creation happens through the brandstudio dashboard
> (`/create`) using the existing automation, which auto-provisions
> Cloudflare DNS + Apache vhost + cert based on the operator-supplied
> domain. The dropdown on `/create` reads `theme/theme-manifest.json`,
> which is regenerated by `theme:sync` (Phase 9) and re-run on every
> deploy by `.github/workflows/deploy.yml`. No manual steps required.
>
> **This phase is now OPTIONAL** — only run it if you want a quick local
> preview at `<slug>.lvh.me:3000` to eyeball the new theme during
> development. Skip it for the canonical Mode-A flow if you only intend
> to ship the theme via git and let real previews come from the
> dashboard later.

```bash
python tools/register_preview_brand.py \
  --slug <dealer-slug>-preview \
  --name "<Display Name>" \
  --theme-id <theme-id> \
  --primary "<suggested.primary>" \
  --primary-dark "<suggested.primaryDark>" \
  --accent "<suggested.accent or suggested.primary>" \
  --logo "<input logo path or hosted URL>" \
  --hero "/themes/<theme-id>/hero.jpg" \
  --images tools/.theme-images/<theme-id>.json \
  --phone "<from A3>" \
  --email "<from A3>" \
  --address-line1 "<from A3>" \
  --city "<from A3>" \
  --county "<from A3>" \
  --postcode "<from A3>" \
  --tagline "<from A3>" \
  --about "<dealer profile from A3>" \
  --font-heading "<heading family>" \
  --font-body "<body family>"
```

The `--images` flag points at the manifest from Phase 7.5
(`fetch-theme-images.mjs`). The registrar reads each slot's `localPath`
and writes them to `brand.images.<slot>` in the brand record. The
dashboard's `/update/<slug>` page can then edit any individual slot
without touching the others.

The script returns a JSON line on stdout with `{ok, slug, action,
automation, previewUrl, ...}`. On `ok: false`, surface the error verbatim
— common causes: missing MYSQL_* env vars (the script auto-loads `.env`
so this should be rare), preview_store import failure, or pymysql
connection rejected.

If a brand for this dealer already exists, the script will *update* it
in place (idempotent). The action field reports `created` vs `updated`.

**The registrar fires brandstudio's existing automation by default.**
After the upsert, it imports `maybe_start_linux_brand_automation` from
`app.py` and runs it with the brand config. That function is dual-mode:

- **Local-preview-base hosts** (default — `<slug>.lvh.me`,
  `<slug>.localtest.me`, `<slug>.sslip.io`, etc., per `LOCAL_PREVIEW_BASE_DOMAINS`
  in app.py): it short-circuits to "preview ready", marks the brand as
  `provisioned` in automation state, and exits. No Apache, no Cloudflare,
  no PM2 — the browser resolves these public-DNS bases to `127.0.0.1`
  automatically and Next's middleware (`proxy.ts`) extracts the brand
  from the first subdomain via `getBrandFromHost`.
- **Production domains** (e.g. `dealer.carous.co.uk`): runs the full
  flow — Cloudflare DNS record creation, Apache vhost generation from
  `vhost_template.conf`, `a2ensite + apache2ctl configtest + systemctl
  reload apache2`, optional pm2 restart. On Windows the subprocess calls
  short-circuit to "[DEV-MODE] would run: ..." and the rendered vhost
  goes to `dev-vhosts/` for inspection.

To skip the automation (for tests / dry runs): pass `--no-automation`.

The result JSON includes `previewUrl` — a clickable URL the user can
visit immediately. For lvh.me bases this is `http://<slug>.lvh.me:3000/`;
for production it's `https://<domain>/`. Use this verbatim in the Phase
12 report — don't construct your own.

**Domain default** — if `--domain` is omitted, the registrar defaults to
`<slug>.lvh.me`. This works locally with no DNS / hosts / Apache setup
because lvh.me resolves all subdomains to `127.0.0.1` via public DNS.
Override only when you actually have a real domain to deploy against.

**MSYS path mangling warning** — when invoking `register_preview_brand.py`
from git-bash on Windows, leading-slash paths like `--logo "/themes/foo"`
get mangled by MSYS into `C:/Program Files/Git/themes/foo` *before* Python
sees the arg. The script defensively undoes this prefix, but if you see
any path coming back wrong (`curl /api/previews/<slug>` shows
`C:/Program Files/Git/...`), pass the path with a doubled leading slash
(`--logo "//themes/foo"`) or run from PowerShell which doesn't mangle.

## Phase 10 — Verify

The template (`springalls-classic`) is type-clean as of 2026-05-09 — the
former `SPRINGALLS_PHONE_TEL` out-of-scope reference and form-handler
typing errors were fixed at the template level. New themes inherit a
clean baseline.

```bash
npx tsc --noEmit 2>&1 | grep "themes/<theme-id>"
```

Expected: **zero errors**. If anything appears, it's scaffolder- or
adaptation-introduced — fix in the new theme files only. Never edit the
generated registries or other themes to make this one pass.

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

## Phase 10d — End-to-end smoke test

After the audit is clean, prove the running stack actually serves the new
theme. The audit only inspects source files; the smoke test verifies that
MySQL, Flask, Next, and the registries all agree on the same theme.

```bash
node tools/smoke-test-preview.mjs --slug <brand-slug> --theme-id <theme-id>
```

The brand slug is what `register_preview_brand.py` returned in Phase 9.5
(typically `<theme-id minus -bespoke>-preview`). Five checks, all must be
green before reporting done:

1. **brand-record-fetchable** — `/api/previews/<slug>` returns 200 with a
   non-empty body. Catches a missing or broken MySQL row.
2. **brand-themeId-correct** — the brand's `themeId` field matches the
   scaffolded theme id. Catches mode-A registrar bugs where the wrong
   theme got linked.
3. **brand-images-populated** — at least 5 of 7 expected slots
   (`hero`, `about`, `services`, `finance`, `partExchange`,
   `sellYourCar`, `recentlySold`) are filled in. Catches Phase 7.5
   silently failing.
4. **theme-folder-exists** — the 6 contract files
   (`theme.json`, `tokens.ts`, `recipes/index.ts`, `sections/index.tsx`,
   `shell.tsx`, `pages.ts`) all exist on disk. Catches scaffolder
   producing an incomplete tree.
5. **preview-url-responds** — `http://<slug>.lvh.me:3000/` returns
   2xx/3xx. Catches Next dev not running, lvh.me not resolving, or
   middleware not picking up the brand.

Exit 0 = ship it; exit 1 = stop and investigate the specific failing
check (the output names which one). Don't bypass; a smoke fail means the
user-visible preview won't work even if the audit passed.

If `preview-url-responds` is the only failure, ask the user to confirm
`npm run dev` is running before re-trying — the rest of the chain is fine,
the dev server just isn't up.

## Phase 11 — Log to FEATURE_LOG

Append a new entry at the **top** of `docs/FEATURE_LOG.md`:

```
- YYYY-MM-DD: Added <theme-id> theme — <Mode A: bespoke for <Brand Name> | Mode B: ported from carous-platform/<source>> (owner: Difatha)
  - Scope: app/themes/<theme-id>/* (full theme contract)
  - Reason: <prospect preview for <Brand>> | <internal sibling port>
  - Notes: Generated via /new-theme. Logo: <path>. URL: <dealer URL>. Fonts: <heading> + <body>. Primary: <hex>.
```

Use today's absolute date from system context.

## Phase 12 — Report

Concise summary to the user, ~6 lines:

- Theme id, display name, status, source (dealer name + URL / carous-platform app).
- Path: `app/themes/<theme-id>/`.
- Color signature: `primary <hex>` + `accent <hex>`. Mention if A2c
  contrast had to be iterated (e.g. "primary darkened from #ffd700 →
  #595959 to pass white-on-primary AA").
- Font pairing chosen + the logo-character category that drove it.
- Hero image + 7-slot images: self-hosted under `/themes/<id>/images/*.jpg`
  (or note any slots that fell back to the classic-archetype pool).
- Audit result: `0 blockers / N advisories` from `tools/audit-theme.mjs`.
- **Ship instruction:** "commit + push to `main` (or open PR per branch
  policy); CI will deploy and the theme will appear in `/create`'s
  picker once the deploy finishes." — see Phase 13.
- Anything that needs follow-up (WebFetch blocks, missing dealer fields,
  unusual layout flourishes the adaptation didn't capture).

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
locked the theme to one specific dealer and made the rollback story
muddier. Now theme code lives in git, brand records live in MySQL, and
they sync up at brand-creation time — operator picks the theme, the
existing dashboard wires the rest.

**If you also want a quick local preview:** run Phase 9.5 (optional)
to register a `<slug>-preview` brand pointing at the new theme on
`<slug>.lvh.me:3000`. That's for development eyeballing only, not a
ship step.

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
present but incomplete, public images downloaded, MySQL row half-written,
4 generated registries referencing a now-broken theme. Manual cleanup is
error-prone — use the rollback tool:

```bash
node tools/rollback-theme.mjs --theme-id <theme-id>
node tools/rollback-theme.mjs --theme-id <theme-id> --dry-run     # preview only
node tools/rollback-theme.mjs --theme-id <theme-id> --keep-brand  # keep MySQL row
```

It removes (in order, each step tolerates "already gone"):

1. `app/themes/<theme-id>/` (scaffolded contract files)
2. `public/themes/<theme-id>/` (downloaded images)
3. `tools/.theme-dna/<theme-id>.json`
4. `tools/.theme-images/<theme-id>.json`
5. `tools/.logo-colors/<theme-id>.json`
6. The MySQL preview row for `<theme-id minus -bespoke>-preview`
   (skip with `--keep-brand` if you want to retry registration only)
7. Re-runs `npm run theme:sync` so the 4 generated registries no longer
   reference the deleted theme — without this, the dev server errors.

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
- Don't fabricate dealer data. If a field wasn't in the WebFetch result,
  leave the scaffolder placeholder and note it in the final report.
- Don't pick a Google Font outside the curated decision table in A4
  unless the dealer site obviously uses a different one (in which case
  match it and note the deviation).
- Don't generate a logo or alter the input logo. The dealer's logo is
  authoritative — read, don't modify.

## Tested defaults (current)

- Template: `springalls-classic` (cleanest theme, type-clean baseline as of 2026-05-09).
- Mode A inputs: 2 (logo file path + dealer URL). Optional: theme id,
  display name.
- Mode B inputs: 0 if the skill auto-picks; 1 if `--from <app>` given.
- Generated theme has: 14 page implementations, full Shell with Header /
  Footer / Cookie banner / WhatsApp widget / Preview banner, AOS provider,
  Garage context, Brand styles injection.
- Theme contracts (`shell.tsx`, `pages.ts`, `sections/index.tsx`,
  `recipes/index.ts`, `tokens.ts`) all populate correctly out of the box —
  the scaffolder rewrites them from DNA so they match the new theme's id.
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
| 1 | Brand record's `logo`/`heroImage` paths come back as `C:/Program Files/Git/...` | Calling `register_preview_brand.py` from git-bash on Windows with leading-slash paths (`--logo "/themes/..."`). MSYS rewrites the arg before Python sees it. | `_undo_msys_path()` defensively strips the prefix in `register_preview_brand.py`. Caller can also use `//themes/...` or run from PowerShell. |
| 2 | `<slug>.preview.brandstudio.local` hits `DNS_PROBE_FINISHED_NXDOMAIN` | Fictional placeholder domain baked into the registrar default. | Default is now `<slug>.lvh.me` (public DNS that resolves all subdomains to 127.0.0.1). Phase 9.5 returns the real `previewUrl` for the Phase 12 report. |
| 3 | `useBrand must be used within a BrandClientWrapper` runtime error on a freshly-scaffolded theme | Hand-maintained `app/themes/context-registry.ts` missing the new theme entry → layout falls back to wrong theme's wrapper → different `BrandContext` instance → `useBrand` returns null. | `theme-context-registry.generated.ts` is auto-generated by `tools/sync-theme-contracts.mjs` from the per-theme `context/` folders. New themes register automatically. |
| 4 | `Code generation for chunk item errored / Expected export to be in eval context X, exports has Y` | Two parallel `'use client'` files at twin paths across themes (e.g. both `<theme-a>/pages/contact/page.tsx` and `<theme-b>/pages/contact/page.tsx` carrying the directive). Turbopack's chunk-item parsed-exports record gets shared between them. | Audit blocker rule **`tp-use-client-on-page`** — pages must be Server Components; extract interactivity into co-located `components/<Name>.tsx` client islands. Existing exemptions: deferred kept inventory pages (annotated `audit-ignore-file`). |
| 5 | Same error as #4 but for files that imported a CSS module from a parent-relative path | `import styles from '../sell-your-car/page.module.css'` — Turbopack's `'use client'` export tracking is stricter when CSS module imports cross directory boundaries. | Audit blocker rule **`tp-cross-folder-css-module`** — CSS modules must be co-located with the file that imports them. |
| 6 | Form-field borders rendering invisible on the inventory page | Skeleton scaffolder pruned `styles/color-policy.css` but kept inventory CSS modules reference its `--t-*` role tokens → `var(--t-border)` resolved undefined → fell back to `currentcolor` → washed-out 1px stroke. | Two-pronged: (a) **`tools/scaffold-theme-skeleton.mjs` KEEP_PATTERNS** keeps `styles/color-policy.css`. (b) Audit blocker rule **`lib-missing-color-policy`** fires if any file uses `var(--t-*)` but the policy file is absent. |
| 7 | Form-field borders visible but visually washed out | `border: 1px solid color-mix(in srgb, var(--t-border) <70>%, transparent)` — token borders are already low-opacity; mixing further toward transparent drops them below visibility against card surfaces. | Audit blocker rule **`a11y-form-field-faded-border`** — flags `color-mix(... border <70%, transparent)` patterns. |
| 8 | "COLUMBUS VEHICLES" wordmark in primary blue against the dark header | `:where(a)/:is(a) { color: var(--color-primary) }` blanket rule in `base.css` — `:where()` ties on specificity (0,1,0) with CSS-module classes, so `<Link>`-wrapped wordmarks inherited the wrong color depending on stylesheet load order. | Audit blocker rule **`std-link-color-blanket`** — flags any `:where(a) { color: ... }` / `:is(a) { color: ... }` in CSS files. Style links per-component instead. |
| 9 | Hero section renders flat charcoal when `--brand-image-hero` is unset or 404s | Hero component painted only the brand image background; nothing behind it. | Audit advisory rule **`lib-hero-no-svg-fallback`** — flags `*Hero*.tsx` files that use `var(--brand-image-*)` but don't render `<HeroBackdrop>`. The skeleton scaffolder also keeps `components/HeroBackdrop.tsx` so the SVG fallback is always available. |
| 10 | Newly-scaffolded theme's `recently-sold` page renders unstyled | `recently-sold/page.tsx` was kept by the skeleton's keep-list, but its inline class names (`sps-section-container`, `sps-vehicle-card`) referenced styles in pruned CSS files. | Phase 8 design guidance now treats the kept `recently-sold/page.tsx` as a stub to redesign per archetype — like any other inner page. |
| 11 | Skill imports `app.py` for `maybe_start_linux_brand_automation` and crashes on Windows console (`'charmap' codec can't encode character '\U0001f527'`) | app.py prints emoji during startup; default cp1252 console can't encode it. | `register_preview_brand.py` calls `sys.stdout.reconfigure(errors='replace')` before the import. |
| 12 | Identifier rewrite leaves UPPER_CASE constants like `SPRINGALLS_PHONE_TEL` | Scaffolder only handled Pascal/camel/kebab forms. | `scaffold-theme.mjs` and `scaffold-theme-skeleton.mjs` `replaceIdentifiers()` now also handles `upperShort` and `upperFull` forms (longest-first to avoid double-replacement). |
| 13 | Gilded-drive's `.contact-item svg { stroke: none }` blanks classic-dealer's contact icons when both themes ship to the same preview | Unscoped class-rule in a global stylesheet (`base.css`) — competes on tied (0,1,0) specificity with the other theme's scoped rule, source order decides which wins. | Audit advisory rule **`std-css-unscoped-global-rule`** — flags class selectors at column 0 in any global `.css` that doesn't reference `data-theme-id` anywhere. Wrap every rule in `:where(body[data-theme-id='<this-theme>'])` so it can't bleed. |
| 14 | Latest Arrivals / Directory / `/used-cars` show empty even though the dealer uploaded inventory via `/update/<slug>` | Server-side `fetch('/api/inventory')` from a theme component without `?brand=<slug>` — server-to-server requests resolve to 127.0.0.1 with no host or x-brand context, API falls back to default `inventory.json`. | Audit advisory rule **`data-fetch-no-brand-param`** — flags `fetch(...)` / `apiUrl(...)` to brand-scoped endpoints (`/api/inventory`, `/api/featured-vehicles`, `/api/recently-sold`, etc.) without a `brand=` parameter. Use `getBrandSlugFromRequest()` server-side or `useBrand().slug` client-side. |
| 15 | Browser silently kills form submit; console reports "An invalid form control with name='X' is not focusable" | `<input required>` (or `<input type="hidden" required>`) on a tab that's `display:none` when not active. Browser tries to focus the invalid field to display its message, can't focus a hidden control, aborts submit. | Multi-tab forms must use `<form novalidate>` and rely on server-side validation; alternatively, validate per-tab in JS and switch tabs to surface errors. Caught at `templates/update.html` 2026-05-10. |
| 16 | Theme ships without GDPR cookie consent — UK regulator complaints, no consent state captured | Phase 8 designed Hero / Header / Footer / sections fresh but forgot to mount a cookie banner; previous themes had a per-theme `CookieBanner.tsx` that was pruned by the skeleton scaffolder. | Two-pronged: (a) **Skeleton scaffolder's `componentShell` stub** mounts `<CookieBanner />` from `@/app/widgets/CookieBanner` by default — preserve through Phase 8 redesign. (b) Audit advisory rule **`lib-missing-cookie-banner`** — fires if Shell.tsx doesn't reference `CookieBanner`. The widget itself lives at `app/widgets/CookieBanner/` (theme-agnostic, brand-token-driven). |
| 17 | Homepage feels static / dead — no entrance animations, sections just appear | Phase 8 didn't add any `data-aos="..."` attributes. Themes used to have a per-theme `AosProvider` that was extracted to `app/widgets/AnimateOnScroll`; if Phase 8 doesn't sprinkle the attributes, the observer has nothing to animate. | Two-pronged: (a) **Skeleton scaffolder's `componentShell` stub** mounts `<AnimateOnScroll />` from `@/app/widgets/AnimateOnScroll` by default — observer's always running. (b) Audit advisory rule **`lib-no-aos-on-homepage`** — flags `pages/home/page.tsx` if it has zero `data-aos` attributes. Variants: `fade-up` / `fade-down` / `fade-left` / `fade-right` / `fade` / `zoom-in` / `zoom-out`; optional `data-aos-delay="120"` (ms) for staggered reveals. Honors `prefers-reduced-motion`. |
| 18 | Same form code duplicated across `pages/contact`, `pages/sell-your-car`, `pages/part-exchange` per theme — drift between themes, repeated debugging | Each theme writing its own `useLeadsForm`-wired form for the lead-capture pages. Field validation, error display, submit-handling, accessibility wiring — 150 lines of nearly-identical JSX per theme per form. | **Deferred work** (no rule yet). Plan: extract `<LeadCaptureForm config={{ leadType, fields, copy }} />` global widget at `app/widgets/LeadCaptureForm/` that themes consume with field config + className overrides. Until shipped, the per-theme forms are acceptable with the caveat that form fixes need to be applied to every theme's instance. |

When you add a new audit rule for a future bug, append a row here. The
catalogue should grow as a record of "what we've already learned not to
do" — a future Claude reading this list won't re-debug what's already
been debugged. Don't remove rows even if the underlying tool changes:
the row stays as institutional memory.

## Tool reference (this skill calls these)

| Tool | Purpose | Mode |
|------|---------|------|
| `tools/check-skill-env.mjs` | Phase 0.5 pre-flight. 7 gates: tools-present, node-deps, mysql-env, mysql-reachable, flask-running, lvhme-resolves, theme-sync-clean. Exit 1 on any fail. Skip flags: `--skip-flask`, `--skip-lvhme`, `--skip-sync` (testing only). | Both modes |
| `tools/extract-logo-colors.mjs` | Deterministic dominant-color extraction from a logo (sharp + saturation-filtered histogram). | Mode A only |
| `tools/check-theme-contrast.mjs` | WCAG AA validator for theme color combos. Exit 1 on critical fail. | Both modes |
| `tools/audit-theme.mjs` | Static-analysis quality gate. Rule prefixes: `a11y-` (accessibility), `std-` (standards), `data-` (data-fetching), `mobile-` (responsive), `perf-` (performance), `brand-` (token discipline), `tp-` (Turbopack collision avoidance), `lib-` (foundation/dependency). Blockers exit 1. Supports inline `audit-ignore: <rule>` and file-level `audit-ignore-file: <rule>` directives. See **Pitfalls catalogue** above for the historical bugs each rule prevents. | Both modes |
| `tools/smoke-test-preview.mjs` | Phase 10d end-to-end check. 5 checks: brand-record-fetchable, brand-themeId-correct, brand-images-populated, theme-folder-exists, preview-url-responds. Verifies MySQL + Flask + Next + registries all agree. Exit 1 on any fail. | Both modes |
| `tools/rollback-theme.mjs` | Partial-theme cleanup when a run fails between Phase 7 and 12. Removes theme folder, public images, DNA JSON, images manifest, logo-colors JSON, MySQL row, then re-runs theme:sync. Idempotent. Flags: `--dry-run`, `--keep-brand`, `--brand-slug <s>`. | Both modes |
| `tools/fetch-theme-images.mjs` | Source 7 page-level images (hero/about/services/finance/partExchange/sellYourCar/recentlySold). Curated Unsplash catalogue with classic-archetype fallback; live API mode when `UNSPLASH_ACCESS_KEY` is set. | Mode A only |
| `tools/extract-theme-dna.mjs` | DNA extractor from a carous-platform sibling app. | Mode B only |
| `tools/scaffold-theme.mjs` | Full clone-and-edit scaffolder. Used by Mode B — clones springalls-classic, applies DNA, downloads hero. | Mode B |
| `tools/scaffold-theme-skeleton.mjs` | Skeleton-first scaffolder. Used by Mode A — produces ONLY contract + plumbing (~39 files), strips visual layer for Phase 8 fresh design. | Mode A |
| `tools/register_preview_brand.py` | Registers the preview brand in MySQL via `preview_store`. | Mode A only |
| `npm run theme:sync` | Auto-discovers themes, regenerates registries + manifest. | Both modes |
