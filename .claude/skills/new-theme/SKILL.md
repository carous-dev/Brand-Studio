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

## Phase 0 — Plan the run

Use **TodoWrite** to capture the phases below as a checklist. Mark each
one complete the moment it lands. The phase set differs by mode.

**Mode A phases:**
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
10. Verify (tsc clean against zero baseline + contrast re-check + theme audit).
11. Log to FEATURE_LOG.
12. Report (with preview URL + image attributions + audit advisories).

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

## Phase 9.5 — Register a preview brand (Mode A only)

Mode A is for dealer previews; the theme is useless until a brand
references it. Skip this in Mode B (no specific dealer).

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
- Hero image: self-hosted at `/themes/<id>/hero.jpg` from `<source URL>`
  (or note it was skipped + why).
- Brand registered (Mode A only): preview reachable at the
  `previewUrl` field returned by `register_preview_brand.py`
  (typically `http://<slug>.lvh.me:3000/`). lvh.me is public DNS that
  resolves all subdomains to 127.0.0.1, so no hosts-file or Apache setup
  is needed locally. Both Flask (`python app.py`) and Next
  (`npm run dev`) must be running.
- Anything that needs follow-up (WebFetch blocks, missing dealer fields,
  unusual layout flourishes the adaptation didn't capture).

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

## Tool reference (this skill calls these)

| Tool | Purpose | Mode |
|------|---------|------|
| `tools/extract-logo-colors.mjs` | Deterministic dominant-color extraction from a logo (sharp + saturation-filtered histogram). | Mode A only |
| `tools/check-theme-contrast.mjs` | WCAG AA validator for theme color combos. Exit 1 on critical fail. | Both modes |
| `tools/audit-theme.mjs` | Static-analysis quality gate (a11y / standards / mobile-first / data-fetching / brand tokens). Exit 1 on blockers. Supports inline `audit-ignore` directives. | Both modes |
| `tools/fetch-theme-images.mjs` | Source 7 page-level images (hero/about/services/finance/partExchange/sellYourCar/recentlySold). Curated Unsplash catalogue with classic-archetype fallback; live API mode when `UNSPLASH_ACCESS_KEY` is set. | Mode A only |
| `tools/extract-theme-dna.mjs` | DNA extractor from a carous-platform sibling app. | Mode B only |
| `tools/scaffold-theme.mjs` | Full clone-and-edit scaffolder. Used by Mode B — clones springalls-classic, applies DNA, downloads hero. | Mode B |
| `tools/scaffold-theme-skeleton.mjs` | Skeleton-first scaffolder. Used by Mode A — produces ONLY contract + plumbing (~39 files), strips visual layer for Phase 8 fresh design. | Mode A |
| `tools/register_preview_brand.py` | Registers the preview brand in MySQL via `preview_store`. | Mode A only |
| `npm run theme:sync` | Auto-discovers themes, regenerates registries + manifest. | Both modes |
