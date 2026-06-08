---
name: new-theme
description: Generate a fully bespoke brandstudio theme for a real dealer from their logo and website URL — vision-extracts dominant colors and typography character from the logo, scrapes the dealer site for brand context (name, services, location, hours), picks a paired Google Font, scaffolds the entire theme contract, adapts hero/header/footer to the dealer's content, and ships a previewable theme. Also supports an advanced "port from carous-platform sibling app" mode for internal use. Designed for prospect-customer preview generation with three required inputs (logo + URL + primary hex) plus an optional free-text context hint (e.g. "dealer sells bikes AND cars", "EV-only", "classic cars only") that biases scrape, copy, and inventory chips.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, TodoWrite, WebFetch, AskUserQuestion
---

# `/new-theme` — automated brandstudio theme generator

Creates a fully working theme under `app/themes/<theme-id>/` for any dealer.
Two modes:

- **Mode A — Bespoke from logo + URL** (default).
  User provides a logo file, the dealer's website URL, a primary brand
  hex, and (optionally) a free-text context hint. The skill
  vision-extracts typography character from the logo, scrapes the dealer
  site for content (brand name, services, address, hours, hero imagery),
  picks a Google Font that pairs with the logo's character, and ships a
  custom theme adapted to the dealer's brand. The optional context hint
  (e.g. "sells bikes AND cars", "EV-only specialist", "classic cars
  only", "commercial vans") biases the site scrape, inventory category
  chips, and hero copy so the theme reflects the dealer's actual
  business mix instead of defaulting to generic "used cars".
- **Mode B — Port from a carous-platform sibling** (advanced).
  Caller passes `--from <app-folder>`. DNA gets extracted from the named
  carous-platform app's `globals.css` / `layout.tsx` / `theme-style.json`.
  Useful for internal porting between sibling dealer apps; not the prospect
  preview path.

## Invocation

```
/new-theme                                       # Mode A — skill prompts for logo + URL + primary hex
/new-theme <theme-id>                            # Mode A with caller-supplied id
/new-theme --context "<free text>"               # Mode A with inline context hint (also accepted in the freeform input message)
/new-theme --app-mode <app>                      # Mode B — page-for-page clone of a carous-platform app
/new-theme <id> --app-mode <app>                 # Mode B with explicit theme id
```

Examples:

- `/new-theme` → skill asks for logo + URL + primary hex, builds a bespoke
  theme for that dealer.
- `/new-theme --context "sells motorbikes AND cars under same brand"` →
  same flow, but the optional context hint threads into A3 scrape (also
  pulls /bikes pages), A5 DNA notes, A8 hero copy + inventory chips
  (chips become All / Cars / Bikes instead of body-type defaults).
- `/new-theme --app-mode lancashirecarsalesltd` → clones the
  lancashirecarsalesltd carous-platform app page-for-page into a new theme
  (default id: `lancashirecarsalesltd-clone`), tokenizes its colors / fonts /
  image URLs so brand records can override them.
- `/new-theme huntsmotors-bold --app-mode huntsmotors` → same, with an
  explicit theme id.

The older `--from <app>` flag (which did a light DNA-only adaptation onto
the skeleton scaffolder) was superseded on 2026-05-26 by `--app-mode`. If
you see `--from` referenced in older docs or commits, treat it as the old
mode B behaviour; new runs should use `--app-mode`.

## Prerequisites checklist

Before doing anything else, confirm:

1. Working directory is the **brandstudio repo root** — the folder
   containing `package.json`, `app/`, and `tools/`. Path varies per
   machine (Windows / macOS / Linux); the skill never assumes a
   specific drive letter. If you're not at the repo root, `cd` there
   first.
2. `tools/scaffold-theme-skeleton.mjs` exists for Mode A and
   `tools/clone-app-to-theme.mjs` exists for Mode B. (Mode A doesn't need
   `extract-theme-dna.mjs`; Mode B calls it under the hood.)
3. **For Mode B only**: a `carous-platform` checkout is reachable.
   Resolution order: `--apps <path>` CLI arg → `CAROUS_PLATFORM_APPS`
   env var → `../carous-platform/apps` (sibling of brandstudio) →
   `../../carous-platform/apps`. The cloner and `extract-theme-dna.mjs`
   share the same resolver and error with a clear "could not locate"
   message if none of those resolve.

## Quality Bar — every theme must clear this

Prospect previews go to dealers. A broken-looking preview costs us trust
and a sale. These are the non-negotiables every generated theme must hit.
The audit tool (`tools/audit-theme.mjs`) enforces the mechanical ones in
Phase 10c; the principles below cover what the tool can't reliably check.

**Distinctiveness contract — no two themes feel the same (must-have, learned 2026-05-25 from "every /new-theme output looks like a recolor of the last"):**

> **Canonical home for distinctiveness policy.** This section is the
> source of truth for the rule that supersedes every "consistent
> chrome" rule below. If a Required Widget / Top contact bar / Required
> Section rule conflicts with the distinctiveness contract, this rule
> wins — those rules are MENUS to pick a variant from, not single-
> variant mandates.

The dominant complaint after `/new-theme` ships is "themes look the
same as each other". Three structural causes, addressed structurally:

1. **A "Signature Concept" is mandatory** (encoded in SKILL Phase A2e).
   Before Phase 8 designs a single component, the skill picks ONE
   distinctive design move from the menu below and writes a 1-sentence
   concept that locks the visual direction. Phase 8 then builds to
   that concept rather than to a generic archetype default.

2. **A fingerprint registry blocks collisions** (`tools/.theme-fingerprints.json`).
   Every shipped theme appends its fingerprint (archetype + signature
   move + hero pattern + header structure + homepage section composition
   + inventory patterns + font pair + the one-big-move axis). New themes
   read this registry in Phase A2e and CANNOT pick a fingerprint that
   collides with any existing entry on these axes:
   - same archetype + same `signatureMove` → HARD block
   - same archetype + same `heroPattern` → HARD block
   - same archetype + same `inventoryListPattern` + same `vehicleDetailPattern` → HARD block
   - same archetype + homepage section composition Jaccard ≥ 0.65 → HARD block
   - same archetype + same `fontHeading`+`fontBody` pair → advisory

   `tools/check-theme-uniqueness.mjs` runs in Phase 10d and exits 1 on
   any hard collision. The theme cannot ship until Phase A2e picks a
   different axis.

3. **Cross-theme similarity check compares against same-archetype peers**,
   not just the skeleton baseline (`tools/check-theme-similarity.mjs`
   peer pass). Two new "modern" themes can each score 0.4 vs springalls-
   classic but 0.85 against each other — the peer pass catches that
   regression at threshold 0.55.

### Signature Move menu (Phase A2e picks ONE)

Each entry is a kebab-case identifier that locks into the fingerprint.
Read across the menu and pick the move that fits the dealer's logo
character + context hint + business mix. A move not yet used by any
peer of the chosen archetype is the bar.

- `centered-headline-search-below` — hero is a centered headline with the search dropdown landing directly below it (the original `springalls-classic` move)
- `centered-headline-full-bleed` — centered hero text over a full-bleed photo, no inline search
- `split-screen-photo-right` — 50/50 hero with headline left, single photo right
- `split-screen-photo-left` — inverse of above
- `dark-fullbleed-condensed-display` — uppercase condensed display in a dark-mode hero
- `dark-hero-status-pill-row` — dark hero with a row of status pills under the headline
- `corner-serif-display-fullbleed` — serif headline in the lower-left corner of a full-bleed photo
- `corner-serif-display-with-thin-gold-rules` — corner serif + gold rule dividers between sections
- `mixed-media-asymmetric` — 60/40 hero with asymmetric text block + display number ("Vol. X")
- `typography-only-hero` — no hero photo at all; oversized type IS the hero
- `lead-image-byline-caption` — large lead image + newspaper-style byline caption above headline
- `grid-overlaid-photo` — hero photo behind a heavy grid overlay (8×6 lines, brand-tinted)
- `warm-team-photo-avatar-cluster` — warm photo of the team/forecourt + clickable avatar cluster
- `stacked-alternating-image-side` — sections alternate image-left / image-right per row
- `vertical-side-rail-navigation` — primary nav lives in a vertical left rail, content scrolls right of it
- `horizontal-stock-ticker` — live-stock count + scrolling vehicle ticker as a hero band
- `stats-band-plus-recently-sold-rail` — stats bar above + dedicated recently-sold horizontal rail below
- `edition-strip-plus-acquisitions-row` — "Volume X · Spring Edition" strip + horizontal acquisitions cards
- `why-choose-us-trust-strip` — primary feature is a multi-pillar "why choose us" band high in the page

If the dealer's brand voice genuinely demands a move not on this list,
ADD a new kebab id and write a one-line description so the next theme
can avoid it.

### Personality voice menu (Phase A2e picks ONE)

Drives copy tone, microcopy, button labels, helper text:

- `formal` — restrained, third-person ("The showroom is open...")
- `warm` — first-person plural, soft tone ("We'd love to help you...")
- `technical` — spec-heavy, numbers-led ("0–60 in 5.2s. From £24,995 / month £348.")
- `editorial` — narrative, byline tone ("This week's pick: a 2019 Defender...")
- `playful` — light wit, occasional informal phrase ("Find your next set of wheels.")
- `brutalist` — minimal-words direct ("Stock. Finance. Drive.")
- `utilitarian` — operational, dealer-signage tone ("In stock now. Drive away today.")

### Header structure menu (Phase A2e picks ONE)

The "top contact bar + header + nav" assembly varies materially per theme:

- `topbar-strip-plus-horizontal-centered-nav` — classic 2-row, centered logo
- `topbar-strip-plus-horizontal-left-nav` — 2-row, left logo
- `thin-sticky-transparent` — single thin row, transparent at top, solid on scroll
- `dark-stat-pills-light-on-scroll` — dark header w/ status pills, flips to light past hero
- `tall-symmetrical-centered-logo` — tall (96–120px) with 3+3 symmetrical nav around centered logo
- `two-tier-editorial` — top action strip + secondary editorial nav (NYT-style)
- `vertical-side-rail` — primary nav lives in a vertical left-side rail (no horizontal nav)
- `hairline-thin-borderless` — 52px hairline border-bottom, minimalist-archetype default
- `dark-accent-strip-top` — dark charcoal nav with 3px brand-accent strip across the very top
- `newspaper-masthead-two-tier` — edition strip + nav below, serif wordmark centered

### "One big move" — restraint exemption

Every theme picks ONE axis from this list where the restraint rule
(see §"Restraint and visual hierarchy" below) is LIFTED for this theme.
The other three axes stay capped. Record the chosen axis in the
fingerprint as `oneBigMove`:

- `typography-scale` — allow up to 7 distinct font sizes per page (cap is 5)
- `gradient-coverage` — allow up to 4 gradient-painted surfaces per page (cap is 2)
- `decorative-density` — allow up to 4 decorative layers per section (cap is 2); OR set to *minimum* (zero decorative layers) for minimalist themes — record as `decorative-density-minimum`
- `brand-color-coverage` — allow brand-primary to occupy up to 40% of pixel area (cap is 25%)
- `none` — keep all four caps; the theme's distinctiveness comes from composition not amplitude

**Why exempt one axis:** the 2026-05-11 restraint rule was correct in
catching "amateur busyness" but over-corrected toward "calm corporate
template". Every great brand has ONE thing it commits hard to — gilded-
drive's editorial type scale, auto-wow-uk's dealer-signage brand
saturation, kain-motors's decorative density. The one-big-move clause
gives each theme permission to amplify ONE expressive lever while
keeping the others restrained.

**How to apply:**
- Phase A2e writes `tools/.theme-concepts/<theme-id>.json` capturing
  the full fingerprint BEFORE the palette generator runs.
- Phase 8 reads the concept file FIRST (before the archetype spec)
  and designs to the locked direction.
- Phase 10d runs `check-theme-uniqueness.mjs` AND
  `check-theme-similarity.mjs --peer-threshold 0.55` — both must pass.
- Phase 11 appends the new fingerprint to the registry.

**Color policy — natural-role dashboard tokens (must-have, settled 2026-06-09):**

> **Canonical home for color policy.** Themes consume the 8 dashboard
> tokens (Primary, Secondary, Accent, Background, Text, Border, Muted,
> Surface) in their **natural semantic roles**. `--color-bg` is ALWAYS
> the surface. `--color-text` is ALWAYS the foreground. NO inversion,
> NO `--t-feature-*` locked tokens, NO hex literals.

## How to use the 8 tokens

**Brand accents (flow with brand record):**
- `var(--color-primary)` — CTAs, eyebrows, link accents, focus rings, brand-tinted highlights
- `var(--color-secondary)` — soft section tints (low-% color-mix with `--color-bg`)
- `var(--color-accent)` — decorative chevrons, hover highlights

**Surfaces and text — natural roles for EVERY section (no dark/light tier split):**
- `background: var(--color-bg);` — page bg
- `background: var(--color-surface);` — card / panel (slightly off-bg)
- `color: var(--color-text);` — foreground text
- `color: var(--color-muted);` — secondary / caption text
- `border-color: var(--color-border);` — borders, dividers
- Brand-tinted surface: `color-mix(in srgb, var(--color-primary) NN%, var(--color-bg))` — primary subtly tints the page bg

## Dark structural surfaces — NOT a separate pattern

There is no "dark feature band" pattern. A theme's dark identity exists ONLY when the brand record sets `--color-bg` to a dark hex. For a brand with `--color-bg: #FFFFFF` + `--color-text: #302C2C`, every section renders LIGHT. The rugged-dark archetype's locked-dark identity is sacrificed for light-brand records. This is the explicit trade-off — the dashboard is the source of truth.

If a future review demands "rugged themes must stay dark for every brand", the only valid responses are:
1. Petition the platform team to add a 9th picker (Chrome Surface or similar).
2. Reject the request and stand on the natural-roles policy.

Do NOT reintroduce `--t-feature-*` locked tokens (rejected — see `feedback_theme_dark_surface_role_tokens.md`). Do NOT reintroduce the inverted-role pattern (rejected — `background: var(--color-text)` is "absurd").

## Allowed `--t-*` role aliases

`color-policy.css` may define role aliases that **derive from dashboard tokens** — these are abstractions, not new color definitions:

```css
--t-action-bg: var(--color-primary);
--t-action-fg: var(--color-bg);
--t-link: var(--color-text);
--t-link-hover: var(--color-accent);
--t-eyebrow: var(--color-primary);
--t-card: var(--color-surface);
--t-border: var(--color-border);
--t-section-tint: color-mix(in srgb, var(--color-secondary) 6%, var(--color-bg));
```

**Status tokens** (`--t-success: #0f5132`, `--t-error: #b42318`) stay literal — they're semantic UI signals, not brand-driven.

**Forbidden:** `--t-feature-bg: #0a0e14` and similar locked literals for surfaces. If a token has a hex value and represents a surface, it's banned.

## Audit checks (Phase 10c)

Treat ALL of these as a blocker:
- `background: var(--color-text)` / `background-color: var(--color-text)` — inverted-role abuse, use `var(--color-bg)` or `var(--color-surface)`
- `color: var(--color-bg)` on a non-CTA surface — inverted-role abuse, use `var(--color-text)` or `var(--color-muted)`. **CTA exception** only when the same rule sets `background: var(--color-primary)`.
- Hex / rgba color literals in component CSS (`#0a0e14`, `rgba(255,255,255,0.08)`, etc) — bypass the dashboard. Use `color-mix` over `var(--color-*)`.
- `--t-*` token definitions with literal hex values (status `--t-success` / `--t-error` excepted).

**Allowed literal exception:** photo overlays / lightbox scrims / gallery chrome over imagery may use literal `rgba(0,0,0,X)` or `rgba(255,255,255,X)`. Document with a near-by comment.

## Component rule (paired surfaces, still in force)

Every CSS rule that sets `background:` MUST set `color:` in the same rule or enclosing scope. Pair `var(--color-bg)` / `var(--color-surface)` with `var(--color-text)`. Never let cascade decide.

The historical journey: (1) logo-extracted primary often failed AA
white-on-primary, so we moved to operator-provided primary + automated
darken; (2) generic `var(--color-text)` cascade onto brand-overridable
surfaces caused invisible text; (3) the "invert role tokens for dark
tier" attempt (use `--color-text` as dark bg, `--color-bg` as light fg)
fixed the cascade but introduced semantic abuse — Difatha rejected it
2026-06-08: "why would text color token be used for bg color". The
current three-tier model isolates each concern: brand voice (tier 1),
locked theme dark intent (tier 2), brand-tinted dark variants (tier 3).

**The policy:**

1. **One brand color input from the user** (NOT extracted from logo).
   Phase A1 asks for ONE primary hex. The logo is for character/shape
   vision analysis only.

2. **The palette policy generator validates + expands the primary** into
   the full token set: `tools/check-palette-policy.mjs --primary <hex>`.
   It auto-darkens the primary until AA white-on-primary passes (or
   flips `--brand-on-primary` to dark if no AA-passing darken exists),
   derives `--brand-primary-strong` (12% darker for hover), and pairs
   the brand triad with two FIXED neutral tiers:

   ```
   Light tier (always paired):
     --surface-bg-light: #ffffff
     --surface-card-light: #f6f7fb
     --text-on-light-strong: #0f1623   (AAA 18.11:1 on light bg)
     --text-on-light-muted: #5b6573    (AA 6.36:1 on light bg)
     --border-on-light: #e3e6ee

   Dark tier (always paired):
     --surface-bg-dark: #0a0e14
     --surface-card-dark: #14181f
     --text-on-dark-strong: #ffffff    (AAA on dark)
     --text-on-dark-muted: rgba(255,255,255,0.78)
     --border-on-dark: rgba(255,255,255,0.12)

   Brand triad (from user primary):
     --brand-primary: <validated, post-darken if needed>
     --brand-primary-strong: <12% darker for hover/pressed>
     --brand-on-primary: #ffffff or #0a0e14 (whichever passes AA)
   ```

   The generator walks all 11 surface/foreground pairs (light ×
   {strong, muted} × {bg, card} + dark × same + brand triad) and exits 1
   if any pair fails AA. **No theme ships with even one failing pair.**

3. **Brand records may ONLY override the brand triad.** The
   `--surface-*` / `--text-on-*` / `--border-on-*` tokens are
   theme-locked (defined in `tokens.ts` + `BrandStyles.tsx` as constants,
   never set from the brand record's `theme.colors`). This means a brand
   record cannot break contrast — the neutrals are guaranteed AA against
   their paired foregrounds at all times.

4. **Component rule (the structural part).** Every CSS rule that paints
   `background:` from a surface token MUST set `color:` from the paired
   foreground token in the same rule or an enclosing scope. **No more
   `color: var(--color-text)` floating around** hoping the cascading
   surface matches.

   Wrong (the failure mode):
   ```css
   .card {
     background: var(--color-surface);  /* might be overridden to dark */
     /* no color set — inherits --color-text which assumes light surface */
   }
   .card .title {
     color: var(--color-text);  /* invisible when card flips dark */
   }
   ```

   Right:
   ```css
   .card {
     background: var(--surface-card-light);    /* light tier surface */
     color: var(--text-on-light-strong);       /* paired foreground */
     border: 1px solid var(--border-on-light);
   }
   /* OR for a dark card: */
   .heroCard {
     background: var(--surface-card-dark);     /* dark tier surface */
     color: var(--text-on-dark-strong);        /* paired foreground */
   }
   ```

   The brand-primary token still applies for accents (button bg, links,
   eyebrows, focus rings) — that's the one color that retints per brand.

5. **Hero images need a guaranteed dark overlay.** When the hero
   background is `var(--brand-image-hero)` (operator-uploaded; brightness
   unknown), pair it with a strong dark gradient so
   `--text-on-dark-strong` always passes contrast regardless of image
   brightness:

   ```css
   .hero {
     background:
       linear-gradient(rgba(8,11,17,0.86), rgba(8,11,17,0.62)),
       var(--brand-image-hero) center / cover no-repeat;
     color: var(--text-on-dark-strong);
   }
   ```

**Why:** Difatha reviewed an auto-wow-uk-bespoke preview rendered through
the Columbus Vehicles brand record. Three classes of bug appeared in the
same screenshot: (a) `LatestArrivalsSection` card titles invisible
(dark `--color-text` on dark `--color-surface` after Columbus's brand
record overrode the surface token); (b) hero ghost-CTA content invisible
(`color: var(--color-text)` painted dark on the hero's fixed dark
background because the ghost button rule wasn't scoped to dark surfaces);
(c) topbar social icons hidden when the brand record had no
`socialLinks` populated. The first two are direct color-policy failures
caused by relying on cascading `--color-text` inheritance.

**How to apply:**

- Phase A1: ask the user for the primary hex (don't extract from logo).
- Phase A2c: run `tools/check-palette-policy.mjs` to validate +
  generate the full token set. Block on any failing pair.
- Phase A5: copy the token set verbatim into DNA `colors`. Don't
  hand-pick values.
- Phase 7 (scaffolder): emit `tokens.ts` with the paired-token CSS
  variable shape (`--surface-*`, `--text-on-*`, `--border-on-*`, plus
  the brand triad). Legacy `--color-bg` / `--color-text` aliases stay
  for backward compatibility but reference the light-tier values.
- Phase 8: every CSS rule consumes paired tokens. Never paint `color:
  var(--color-text)` on a component whose surface might flip per brand.
- Phase 10c audit: `lib-unpaired-foreground` rule (deferred) flags any
  CSS rule that sets `color: var(--color-text)` without setting
  `background:` from the same tier in the same selector / scope.

See also memory `feedback_color_palette_policy.md` for the full
component pattern catalogue and `feedback_no_logo_color_extraction.md`
for the input policy.

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

**Brand-uploaded images must render — `var(--brand-image-*)` plumbing + 3-tier fallback chain (must-have, learned 2026-05-11):**

> The dashboard upload → CSS var → component pipeline must be wired
> end-to-end for every theme. There are TWO failure surfaces: (1)
> theme components using hardcoded paths instead of `var(--brand-image-<slot>)`,
> and (2) BrandStyles emitting a 404'ing placeholder URL instead of the
> theme's own curated default when no operator upload is available.
> Both have been seen in real previews and both need explicit policy.

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

- **`BrandStyles.tsx` must emit ALL 7 `--brand-image-<slot>` vars
  unconditionally with the per-slot fallback chain below. NEVER gate
  on "if operator uploaded".**

  **Hero slot — `brand.heroImage` is the source of truth, NOT
  `brand.images.hero`.** The dashboard's update_brand handler keeps
  `brand.heroImage` fresh on every save, but `brand.images.hero` is a
  derived alias that often goes STALE — a real brand record
  (`columbus-vehicles-preview`) had `images.hero = "/images/hero-bg.png"`
  (a generic placeholder from initial brand creation) while
  `brand.heroImage = "/images/<slug>-hero.png"` (the operator's actual
  upload). Read `brand.heroImage` FIRST, fall through to
  `brand.images.hero` as backup, then theme default.

  **Other slots** use `brand.images.<slot>` → theme default. No
  cross-fall to hero.

  Canonical implementation:

  ```ts
  const THEME_ID = '<this-theme-id>'
  const themeDefault = (slotFile: string) =>
    `/themes/${THEME_ID}/images/${slotFile}.jpg`

  const brandImages: Record<string, unknown> = (brand as any)?.images || {}

  const pickString = (...candidates: Array<unknown>): string | null => {
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c.trim()
    }
    return null
  }

  // HERO: brand.heroImage (authoritative) → brand.images.hero (may be stale) → theme default.
  const heroImageSlot =
    pickString(brand.heroImage, brandImages['hero']) || themeDefault('hero')

  // Other slots: brand.images.<slot> → theme default. No cross-fall to hero.
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile)

  const aboutImage        = resolveSlot('about',        'about')
  const servicesImage     = resolveSlot('services',     'services')
  const financeImage      = resolveSlot('finance',      'finance')
  const partExchangeImage = resolveSlot('partExchange', 'partExchange')
  const sellYourCarImage  = resolveSlot('sellYourCar',  'sellYourCar')
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold')
  ```

- **Layered-background CSS fallback (mandatory belt-and-braces).** Even
  with the correct BrandStyles chain, brand URLs can still 404 at the
  HTTP layer — stale records pointing to deleted files, URLs from a
  different deploy environment, file-server misroutes. CSS `var(name,
  fallback)` does NOT save you: BrandStyles emits a non-empty `url(...)`
  even when the URL 404s, so the var IS set and the fallback never
  triggers. The browser silently fails the layer and you see nothing.

  **The fix is multi-layer `background-image`** where the theme default
  sits underneath the brand URL. If the top layer 404s, the bottom layer
  shows through.

  ```css
  /* Component CSS module — Hero, CtaBanner, About PageHero etc. */
  .heroImage {
    background-image:
      var(--brand-image-hero, none),
      url('/themes/<theme-id>/images/hero.jpg');
    background-size: cover, cover;
    background-position: center, center;
    background-repeat: no-repeat, no-repeat;
  }

  /* PageHero pattern with overlay gradient — 3 layers stacked top-to-bottom. */
  .auto-page-hero--finance {
    background-image:
      linear-gradient(180deg, rgba(10,14,20,0.86), rgba(10,14,20,0.62)),
      var(--brand-image-finance, none),
      url('/themes/<theme-id>/images/finance.jpg');
    background-size: auto, cover, cover;
    background-position: center, center, center;
    background-repeat: no-repeat, no-repeat, no-repeat;
  }
  ```

  Use `var(--brand-image-X, none)` (not `var(--brand-image-X)`) so the
  layer is `none` (renders nothing) when the var is undeclared, rather
  than making the entire `background-image` declaration invalid.

  Prefer **per-page CSS classes** (e.g. `.auto-page-hero--finance`) over
  inline `style={{ backgroundImage: ... }}` in JSX — the class lives in
  base.css, gets the multi-layer pattern correct once, and every page
  using `<section className="auto-page-hero auto-page-hero--finance">`
  picks it up cleanly. Inline styles are harder to keep consistent and
  obscure the multi-layer intent.

- **NEVER fall back to a generic placeholder like
  `/images/hero-placeholder.jpg`.** That file typically 404s on
  deployments and the browser-level `var(name, fallback)` CSS fallback
  WILL NOT kick in, because BrandStyles has already set the var to a
  non-empty (but broken) URL. CSS-level `var(name, fallback)` only fires
  when the var is undeclared, NEVER when it's set to a 404'ing string.
  The theme's curated `/themes/<id>/images/<slot>.jpg` is the only
  acceptable terminal fallback — those 7 files are shipped on disk by
  Phase 7.5a and ALWAYS exist for the theme.

- **No cross-fall between slots.** The previous pattern of "about
  defaults to hero" (so if operator only uploads hero, every page shows
  the same hero) was a regression. Each slot falls back to its OWN
  curated theme default — that way operator-uploads-hero-only previews
  still render distinctive per-page imagery (the curated about,
  services, finance, etc photos) rather than the same hero five times.

- Slots and their canonical use:
  - `--brand-image-hero` — homepage Hero photo backdrop
  - `--brand-image-about` — About page PageHero, About section panels
  - `--brand-image-services` — Services page PageHero, services section
  - `--brand-image-finance` — Finance page PageHero, CtaBanner image
  - `--brand-image-part-exchange` — Part-ex page PageHero
  - `--brand-image-sell-your-car` — Sell-your-car page PageHero
  - `--brand-image-recently-sold` — Recently-sold page PageHero
  (Note the camelCase ↔ kebab-case translation: `brand.images.partExchange`
  is read from the brand record but written as `--brand-image-part-exchange`
  to CSS. The translation table is explicit, not derived programmatically.)

- **Diagnostic when imagery is missing in a deployed preview:**

  ```js
  // Browser console
  getComputedStyle(document.documentElement).getPropertyValue('--brand-image-hero')
  ```

  - Returns `none` / empty → BrandStyles isn't mounting. Check the brand
    record's `themeId` and whether the new theme is deployed to the
    target environment.
  - Returns `url("/images/<slug>-hero.png")` and the image is missing →
    Flask didn't save the upload to `public/images/`. Check the upload
    handler logs.
  - Returns `url("/themes/<id>/images/hero.jpg")` → operator hasn't
    uploaded; theme default is rendering correctly. Verify the file
    exists at `public/themes/<id>/images/hero.jpg`.
  - Returns `url("/images/hero-placeholder.jpg")` or similar generic
    fallback URL → this rule's failure mode; BrandStyles needs the
    3-tier fallback chain fix.

- **Cross-theme caveat:** older themes that only emit
  `--classic-hero-image` (classic-dealer + gilded-drive) DON'T support
  the 7-slot brand-image system. Brand records bound to those themes
  will show only a hero image, with about/services/finance pages
  falling back to nothing. Migrating those themes to emit the full
  7-slot set is a follow-up. **New themes scaffolded by `/new-theme`
  MUST emit all 7 by default with the 3-tier fallback chain above.**

- Audit rule `lib-image-not-brand-driven` (deferred — when shipped, flag
  any `background-image: url(...)` in a theme CSS module that's NOT
  `var(--brand-image-*)` and NOT a decorative SVG data-URI). Additional
  audit rule `lib-brand-styles-incomplete-slots` (deferred — flag any
  theme's `BrandStyles.tsx` that doesn't emit all 7 `--brand-image-*`
  vars OR uses a placeholder URL as the terminal fallback).

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

**Restraint and visual hierarchy — professional, not hacky (must-have, learned 2026-05-11; supersedes the maximalist clauses below). Each theme is allowed ONE exempted axis — see §"Distinctiveness contract → One big move":**
- The dominant failure mode for /new-theme themes is **overdesign**: too
  many font sizes, too many gradient surfaces, too many decorative
  layers stacked in every section, brand color dominating instead of
  accenting. The result reads as amateur-busy, not premium. This rule
  is the governing constraint — when a downstream rule (motion, futuristic,
  archetype spec) collides with this one, restraint wins.
- **Typography scale cap.** A single page may use ≤ 5 distinct font
  sizes total — UNLESS `oneBigMove` is `typography-scale`, in which
  case the cap lifts to 7. One display size for hero / page-title, one
  heading size for section H2s, one sub-heading for H3, one body size,
  one small/caption. Anything beyond reads as inconsistent. Use
  `clamp()` to scale per viewport; don't introduce a new size for
  "this one card".
- **Gradient budget.** ≤ 2 gradient-painted surface backgrounds per
  page — UNLESS `oneBigMove` is `gradient-coverage`, in which case ≤ 4.
  Other sections sit on `var(--color-bg)` / `var(--color-surface)`
  flat. Don't paint every alternating section in `--t-brand-gradient`
  / `--t-neon-gradient` — the eye has no resting place.
- **Brand color is the accent, not the surface.** The brand primary
  occupies ≤ ~25% of pixel area per page (CTAs, eyebrows, focus rings,
  one feature band) — UNLESS `oneBigMove` is `brand-color-coverage`,
  in which case ≤ ~40%. Most of the page surface is neutral
  (`var(--color-bg)`, `var(--color-surface)`). The brand "feeling"
  comes from the few high-impact moments, not from coverage. Filling
  every section with a brand-tinted background = a 1990s billboard.
- **Decorative-layer budget per section.** ≤ 2 decorative layers per
  section (e.g. hero gets photo + ONE of: grid pattern / glow / scanline
  / corner reticles — not all four) — UNLESS `oneBigMove` is
  `decorative-density`, in which case ≤ 4 per section. If `oneBigMove`
  is `decorative-density-minimum`, the cap drops to ZERO (minimalist
  themes ship with no decorative layers at all — animated glows,
  shimmer, text-glow are also suppressed). Section bands and inner
  pages typically get zero decorative layers either way — just type
  and content.
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

> **Canonical home for motion policy.** This section is the source of
> truth for what motion a theme must include and how much. Required
> Widgets §AnimateOnScroll / MotionFX / ScrollProgress (later in this
> SKILL) document the *widget API* (variant names, props, helpers);
> Pitfall row 31 documents the *failure mode*. If those mentions
> conflict with this section, this section wins.

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
  - **Entry animations** — every page must have **2–3 staggered
    `data-aos="…"` entry animations** on its marquee moments (hero,
    primary CTA reveal, one section transition). NOT 4+ — that's
    busyness, not liveliness. **The restraint rule earlier wins on
    counts** (§"AOS restraint"). The audit's `motion-aos-min-count`
    rule still requires ≥4 on the homepage and ≥2 on inner pages as a
    floor, NOT a target — pick the marquee moments and stop. AOS
    variants: `fade-up` / `fade-down` / `fade-left` / `fade-right` /
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

  **Custom keyframe animations (theme-specific marquees, tickers,
  scrolling rails) MUST follow the same fallback contract** — pitfall
  catalogue row 40 documents the exact failure mode. The only override
  in `@media (prefers-reduced-motion: reduce)` is `animation: none`. Do
  NOT add `flex-wrap: wrap` / `white-space: normal` / padding tweaks
  "to let the items wrap when frozen" — for any marquee that renders a
  duplicated track (`[...items, ...items]`) for seamless looping, the
  wrap fallback dumps 2× the visible items into a clumsy stacked grid.
  Let the parent's `overflow: hidden` + an edge-fade `mask-image` clip
  the frozen track cleanly into a static snapshot. Canonical reference:
  `app/themes/auto-wow-uk-bespoke-02/components/HorizontalStockTicker.module.css`.

  The Shell stub generated by the skeleton scaffolder already mounts
  `<AnimateOnScroll />`, `<MotionFX />` (CSS injector), and
  `<ScrollProgress />` (parallax driver). Phase 8 just sprinkles the
  classes + `data-aos` / `data-mfx-scroll` attributes; no per-theme
  motion plumbing required.

**Inventory pages MUST be redesigned per archetype, not inherited verbatim (must-have, learned 2026-05-11; reinforced by the autonomous-design clause below):**

> **Canonical home for inventory contract.** This section is the source
> of truth for "what Phase 8 must redesign vs keep" on the inventory
> pages. The §"Autonomous independent designs" block below extends it
> with the design-language requirements (mix-and-match composition
> categories). Pitfalls rows 30 / 32 / 33 are concrete failure cases.
> `docs/inventory-design-library.md` is the reference pattern catalogue
> Phase 8 reads for inspiration — NOT a copy source.

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
(skeleton scaffolder wires them by default; preserve through Phase 8).

> The entries below document the *widget API* (what the widget exposes,
> variant names, props). For *policy* — how much motion to use, what
> belongs in which slot, what restraint applies — see Quality Bar
> §"Motion & light language" and §"Restraint and visual hierarchy"
> earlier in this SKILL. If counts here and counts there disagree, the
> Quality Bar wins.

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
   d. Map character to archetype (`classic-trad` / `classic-warm` / `modern` / `minimalist` / `industrial` / `editorial` / `rugged` / `luxury` / `prestige`).
   e. **Lock the Signature Concept** — read `tools/.theme-fingerprints.json`, pick a non-colliding fingerprint, write `tools/.theme-concepts/<theme-id>.json`, self-validate with `check-theme-uniqueness.mjs`.
   c. Run `check-palette-policy.mjs` to validate the primary hex and generate the full token set.
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

Note: a NEW `Phase 10d` was added (cross-theme similarity check via
`check-theme-similarity.mjs`) — unrelated to the removed preview-smoke
phase. See the Phase 10d section later in this SKILL.

If anything fails between Phase 7 and 12, run
`node tools/rollback-theme.mjs --theme-id <id>` to clean up the partial
artifacts (theme folder, public images, DNA JSON, registries) before
re-attempting. Idempotent — safe to run multiple times.

### Phases safe to run in parallel

Several phase pairs are independent. Issue their tool calls in a single
message (single Bash/Read/Edit message with multiple tool blocks) to
shave 15–30 seconds of wall clock. Order of independent operations does
not matter; only the listed dependencies do.

| Parallel group | Phases | Why safe |
|---|---|---|
| Logo + site context | Phase 2 (extract-logo-colors + vision) and Phase 3 (WebFetch dealer site) | Inputs are the logo path and the dealer URL respectively — both available from Phase 1, neither depends on the other |
| Image + favicon | Phase 7.5a (`fetch-theme-images.mjs`) and Phase 7.5b (`generate-theme-favicon.mjs`) | Both write into `public/themes/<id>/`; neither reads the other's output |
| Image + work package | Phase 7.5a, 7.5b, and 7.5c (`generate-theme-workpackage.mjs`) | 7.5c reads DNA only — independent of imagery |
| Verification triad | Phase 10a (`tsc --noEmit`), 10b (contrast re-check), 10c (`audit-theme.mjs`) | Independent static analyses on the same file set |
| Verification + similarity | Phase 10c (audit) and 10d (similarity) | Both read the new theme's files; neither writes |

Sequential dependencies you cannot collapse:
- Phase 2 → 2d (archetype mapping needs character)
- Phase 2d → 2e (concept lock needs the chosen archetype + must read peers from fingerprint registry)
- Phase 2e → 2c (palette generator runs AFTER the concept is locked so font/archetype/move are settled before the token set is committed)
- Phase 2 → 4 (font choice depends on logo character)
- Phase 5 (DNA) → 7 (scaffolder reads DNA + the concept file)
- Phase 7 → 7.5 (image/favicon/work-package need the scaffolded theme dir)
- Phase 7.5c → 8 (work-package is the Phase 8 entry checklist)
- Phase 8 → 9 (theme:sync needs designed files)
- Phase 9 → 10 (verifications run against the synced theme)

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

**Three inputs required: logo, dealer URL, primary hex.** One **optional**
fourth input: a free-text **context hint** (e.g. "sells motorbikes AND
cars under same brand", "EV-only specialist", "classic cars only",
"commercial vans + minibuses"). Color is NEVER extracted from the logo
(see Pitfall row 38 + memory `feedback_no_logo_color_extraction.md`). The
logo is used only for vision-based character analysis (font + radius
decisions) and as the brand wordmark/favicon glyph. The palette is
designed by Claude from the user-supplied primary hex via
`tools/check-palette-policy.mjs`.

If the user passed `--logo <path>`, `--url <url>`, `--primary <hex>`,
and/or `--context "<text>"` inline, use those and skip prompting.
Otherwise:

**Step 1 — Confirm direction with AskUserQuestion**:

```
Question: "Ready to build a bespoke theme? I'll need a logo, the dealer's
          website URL, and ONE primary brand hex (e.g. #be0e11). I'll
          design the rest of the palette around that primary. You can
          ALSO (optional) include a one-line context hint — e.g.
          'sells bikes AND cars', 'EV-only', 'classic cars only',
          'commercial vans' — and I'll bias the scrape, inventory chips,
          and hero copy accordingly."
Header: "Inputs"
Options:
  - "Yes — I'll paste logo + URL + primary hex (+ optional context) in my next message"
  - "Yes — logo is at a public URL (not a local file)"
  - "Cancel — abort the skill"
```

If the user picks Cancel, exit cleanly with a one-line message.

**Step 2 — Read the user's next message** as natural text containing the
three required inputs plus an optional fourth. Parse defensively:

- A line containing `http(s)://...ext` (where `ext` is `.png`, `.jpg`,
  `.jpeg`, `.svg`, `.webp`) is the logo URL.
- A line that is a Windows or Unix path ending in those extensions is the
  logo file path.
- A line containing `http(s)://` without an image extension is the dealer
  URL.
- A bare `#RRGGBB` (or `#RGB`) is the primary hex.
- A line prefixed `context:` (case-insensitive) is the context hint. If
  no such line is labelled, treat **any remaining free-text line** that
  doesn't match the four patterns above as the context hint. Multiple
  unlabelled lines join with `; `.
- If the user labels them (`logo:`, `url:`, `primary:`, `context:`),
  respect the labels.

If any of the three **required** fields is missing, send a short text
message asking for the missing field and wait for the next message.
Don't loop on AskUserQuestion — the user already engaged. The context
hint is optional; if absent, store `null` and proceed silently.

**Step 3 — Validate**:

- Logo: if it's a local path, confirm it exists on disk. If it's a URL,
  download it via WebFetch (or simply pass the URL to the Read tool —
  it accepts remote image URLs).
- URL: well-formed `https://` prefix, valid host. If not, ask once for
  a corrected URL.
- Primary hex: must match `^#?[0-9a-fA-F]{3,6}$`. Normalize to lowercase
  `#rrggbb`. If invalid, ask once for a valid hex.
- Context hint (if present): trim to ≤ 240 chars (cut at sentence boundary
  if longer; warn the user once). Strip surrounding quotes. Never
  ask the user to re-supply a context hint — it's optional, so silently
  drop it if it parses to an empty string.

If the user gave a theme id inline (`/new-theme cobalt-modern`), use it.
Otherwise the skill derives one in A6.

**Step 4 — Capture `contextHint` for downstream phases**. Persist it
locally so later tool calls don't lose it:

```
mkdir -p tools/.context-hint
echo '{"contextHint": "<trimmed text or empty>"}' > tools/.context-hint/<slug>.json
```

The DNA JSON written in Phase A5 carries `notes.contextHint` as the
authoritative copy; the sidecar is for resilience across tool boundaries.

### A2 — Analyze the logo (vision character ONLY — no color extraction)

**DO NOT extract colors from the logo.** Color comes from the user-supplied
primary hex in A1 and is validated/expanded into the full palette by the
policy generator in A2c. The logo is for character + shape analysis only.

(`tools/extract-logo-colors.mjs` still exists for retrospective use but is
NOT part of the canonical Mode A flow as of the color-policy update —
see memory `feedback_no_logo_color_extraction.md` + Pitfall row 38.)

**Step A2a — Vision character analysis (Read tool on the logo):**

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

**Step A2b — Persist character to a sidecar artifact** (optional, but
keeps the value retrievable across tool calls):

```bash
mkdir -p tools/.logo-character
echo '{"logoCharacter": "<category>", "shapeLanguage": "<rounded|balanced|sharp>"}' > tools/.logo-character/<slug>.json
```

The DNA JSON written in Phase A5 carries `notes.logoCharacter` as the
authoritative copy; the sidecar is for resilience.

### A2d — Map logo character to ARCHETYPE

Each new theme is one of **eight** archetypes (see
`docs/theme-archetype-specs.md` for the full design contract per
archetype). The mapping is:

| Logo character (from A2b) + context signals | Archetype |
|---------------------------|-----------|
| `classic-serif`, traditional condensed sans | `classic-trad` |
| `humanist-sans`, friendly rounded sans, ambiguous **(catch-all default)** | `classic-warm` |
| `modern-sans`, `geometric-tech` | `modern` |
| `geometric-tech` + tight letterspacing + single-weight wordmark; OR contextHint hints at EV/premium-curated/design-led | `minimalist` |
| `condensed-bold` + mechanical/stencil feel; OR contextHint hints at vans/commercial/fleet/workshop | `industrial` |
| `transitional-serif`; OR mixed serif-and-sans logo with lockup tagline; OR contextHint hints at heritage/storytelling/buyers-guide | `editorial` |
| `condensed-bold`, `display-bold` (sport, dealer-signage); OR contextHint hints at 4×4 / performance | `rugged` |
| `luxury-serif`, `script` | `luxury` |
| Mixed `display-bold` + serif body, magazine feel | `prestige` |

**Ambiguous logos default to `classic-warm`** (NOT `classic-trad`) so the
catch-all path still triggers a full Phase 8 redesign cycle — the old
"classic" archetype is now `classic-trad` and it's `springalls-classic`'s
neighbourhood; routing every ambiguous logo there was the dominant cause
of theme sameness.

The contextHint from A1 is a tie-breaker. "EV-only" + a clean geometric
sans → prefer `minimalist` over `modern`. "vans + commercial" + condensed
bold → prefer `industrial` over `rugged`. Document the tie-breaker in
DNA notes if it overrides the logo-character default.

Record the chosen archetype in the DNA at `notes.archetype`. Phase 8
reads the archetype's spec from `docs/theme-archetype-specs.md` and
redesigns components per that spec — the scaffolder always clones the
same `springalls-classic` baseline, so the visual difference between
archetypes is driven by Phase 8 redesign work, not by template choice.

### A2e — Lock the Signature Concept (distinctiveness gate)

> This phase is the structural answer to "every /new-theme output looks
> like a recolor of the last". See Quality Bar §"Distinctiveness
> contract" for the full menus and rationale. A2e enforces that contract
> at scaffold time — BEFORE Phase 7 runs, BEFORE Phase 8 designs anything.

**Step A2e.1 — Read the fingerprint registry.** Open
`tools/.theme-fingerprints.json` and list every shipped theme of the
SAME `archetype` chosen in A2d. These are the peers you must not
collide with.

**Step A2e.2 — Pick the fingerprint axes.** From the menus in Quality
Bar §"Distinctiveness contract", pick:

- `signatureMove` — ONE kebab id from the Signature Move menu (or coin a
  new one with a one-line description if the menu doesn't fit)
- `signatureConcept` — ONE sentence locking the visual direction
  (e.g. "Stock-ticker modern layout with prominent live stats band and
  a dedicated recently-sold scroll rail")
- `personalityVoice` — ONE from the personality voice menu
- `headerStructure` — ONE from the header structure menu
- `heroPattern` — derive from `signatureMove` (the canonical pairings
  are documented in the menu; use the same id format)
- `homepageSections` — an ordered list of 6–9 kebab-case section ids
  (see the expanded section menu in §Phase 8 below)
- `inventoryListPattern` — kebab id from `docs/inventory-design-library.md`
- `vehicleDetailPattern` — kebab id from `docs/inventory-design-library.md`
- `fontHeading` / `fontBody` — your A4 picks
- `oneBigMove` — ONE axis where you'll lift the restraint cap (see
  Quality Bar §"One big move")

**Step A2e.3 — Write the concept artifact** for downstream phases:

```bash
mkdir -p tools/.theme-concepts
```

Write `tools/.theme-concepts/<theme-id>.json` (use the **Write** tool):

```jsonc
{
  "themeId": "<theme-id>",
  "archetype": "<from A2d>",
  "signatureConcept": "<one sentence>",
  "signatureMove": "<kebab id from menu>",
  "personalityVoice": "<menu entry>",
  "headerStructure": "<kebab id from menu>",
  "heroPattern": "<kebab id>",
  "homepageSections": ["hero", "...", "..."],
  "inventoryListPattern": "<kebab id>",
  "vehicleDetailPattern": "<kebab id>",
  "fontHeading": "<Google Font family>",
  "fontBody": "<Google Font family>",
  "oneBigMove": "none | typography-scale | gradient-coverage | decorative-density | brand-color-coverage | decorative-density-minimum"
}
```

**Step A2e.4 — Self-validate before Phase 7.** Run the uniqueness tool
against the concept you just wrote:

```bash
node tools/check-theme-uniqueness.mjs --id <theme-id>
```

Exit 0 means proceed to A2c. Exit 1 means one or more of the
fingerprint axes collides with an existing same-archetype peer — open
the concept JSON, pick a different axis, and re-run. Don't proceed to
Phase 7 with a known collision; the audit will re-block it in Phase 10d
and you'll waste an entire build cycle.

**Step A2e.5 — Mirror the concept into the DNA.** The DNA JSON written
in A5 carries `notes.signatureConcept`, `notes.signatureMove`,
`notes.personalityVoice`, `notes.oneBigMove` as the authoritative copy
for downstream phases (Phase 8 reads them when designing). The concept
file is for cross-tool resilience; the DNA is for in-component access.

### A2c — Run the palette policy generator

This step replaces the old extract-then-contrast-check flow. The policy
generator takes the user's primary hex from A1, auto-darkens it (if
needed) to pass AA white-on-primary, derives `primary-strong` and
`on-primary`, and walks the **full 11-pair surface×foreground contrast
matrix** (light tier × {strong, muted} × {bg, card} = 4, dark tier × same
= 4, brand triad = 3). Errors with exit 1 if any pair fails — no theme
can ship that has even one failing pair.

```bash
node tools/check-palette-policy.mjs \
  --primary "<user-supplied hex>" \
  --slug <dealer-slug>
```

The tool writes the full token set to `tools/.palette/<dealer-slug>.json`
(structured for direct consumption in Phase A5 + the scaffolder). Exit 0
means proceed; exit 1 means a pair failed AA — surface the failing pair
to the user and ask whether to (a) accept further auto-darkening with
`--max-darken 0.8`, (b) flip `--brand-on-primary` to dark text and
re-run, or (c) pick a different primary.

**What the tool does (in short):**

1. Validates the input hex and normalizes to lowercase `#rrggbb`.
2. Walks darken steps (2% increments, default cap 60%) until
   white-on-primary clears AA (4.5:1). If white-on-primary can't reach
   AA even at full darken, flips `--brand-on-primary` to `#0a0e14` and
   uses the deepest variant.
3. Derives `--brand-primary-strong` as the primary darkened a further 12%
   for hover/pressed states.
4. Pairs the brand triad with two FIXED neutral tiers (never derived from
   primary, never overridable by brand records):

   ```
   Light tier:                       Dark tier:
     --surface-bg-light  #ffffff       --surface-bg-dark   #0a0e14
     --surface-card-light #f6f7fb      --surface-card-dark #14181f
     --text-on-light-strong #0f1623    --text-on-dark-strong #ffffff
     --text-on-light-muted #5b6573     --text-on-dark-muted rgba(255,255,255,0.78)
     --border-on-light #e3e6ee         --border-on-dark rgba(255,255,255,0.12)
   ```

5. Asserts WCAG AA on every paired combination (text on each surface +
   on-primary on each primary variant + primary on light surface). Writes
   the full token JSON to `tools/.palette/<slug>.json`.

**Read the resulting tokens with the Read tool** and use them directly
in Phase A5's DNA `colors` block. **Do not invent additional colors** —
the policy intentionally constrains the palette to enforce structural
contrast safety.

See **Quality Bar §"Color palette policy — paired surface + foreground
tokens"** for the full rationale and the component-level rule
(every CSS rule that paints `background:` from a surface token MUST set
`color:` from the paired foreground token in the same rule or enclosing
scope).

### A3 — Scrape the dealer site

Use **WebFetch** on the dealer URL with this prompt (substitute the
`contextHint` from A1 into the bracketed slot if non-null — otherwise
omit the bracketed paragraph entirely):

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

[Context hint from operator: "<contextHint>". If this hint mentions a
vehicle category beyond cars (motorbikes, vans, commercial, classic,
EV-only, etc.), ALSO extract: (a) any sub-section nav for that category
(e.g. /bikes, /vans, /classics), (b) category-specific services or
finance products, (c) any inventory counts split by category, and (d)
imagery URLs that anchor that category. Treat the hint as authoritative
about the dealer's business mix — do not infer it away just because the
home page leads with cars.]

Return as a structured list. If a field is not present, write "not found".
Do not fabricate.
```

Capture the response. If WebFetch fails (timeout, anti-bot wall, 404),
fall back gracefully:

- Ask the user once for the brand name and city, then proceed with logo
  data only. Do not abort the skill. If a `contextHint` was supplied
  but the scrape failed, KEEP the hint — it still threads into A5 DNA
  notes and Phase 8 copy/chips even without scrape backing.

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
    // Brand triad (from tools/.palette/<slug>.json — DO NOT hand-pick).
    "primary": "<brand.primary from palette policy>",
    "primaryStrong": "<brand.primaryStrong from palette policy>",
    "onPrimary": "<brand.onPrimary from palette policy (#fff or #0a0e14)>",

    // Fixed neutral tiers — copied verbatim from palette policy output.
    // Theme components reference these by their CSS variable names; brand
    // records may NEVER override the neutrals.
    "neutralsLight": {
      "surfaceBg": "#ffffff",
      "surfaceCard": "#f6f7fb",
      "textStrong": "#0f1623",
      "textMuted": "#5b6573",
      "border": "#e3e6ee"
    },
    "neutralsDark": {
      "surfaceBg": "#0a0e14",
      "surfaceCard": "#14181f",
      "textStrong": "#ffffff",
      "textMuted": "rgba(255,255,255,0.78)",
      "border": "rgba(255,255,255,0.12)"
    },

    // Legacy aliases kept for scaffolder/registry consumers that still
    // read --color-bg / --color-text / --color-surface. These mirror the
    // light tier by default; archetype-dark themes (rugged, luxury) MUST
    // additionally pair components with the dark tier directly (don't
    // rely on these legacy aliases for dark surfaces).
    "bg": "#ffffff",
    "surface": "#f6f7fb",
    "text": "#0f1623",
    "muted": "#5b6573",
    "border": "#e3e6ee"
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
    "logoCharacter": "<single phrase from A2b vision pass, e.g. 'condensed-bold', 'luxury-serif', 'geometric-sans', 'rounded-friendly'>",
    "vibe": "<2-3 words from A2>",
    "archetype": "<classic | modern | rugged | luxury | prestige — set in A2d>",
    "colorsExtractor": "deterministic (extract-logo-colors.mjs)",
    "contrastCheck": "passed | critical-failed (and-fixed)",
    "contextHint": "<verbatim trimmed context hint from A1, or null if not supplied>"
  }
}
```

**`notes.logoCharacter` is required (must-have, learned 2026-05-11):**
The vision-derived character phrase from A2b drives font choice (Phase A4)
and archetype mapping (Phase A2d). Persist it in the DNA so downstream
phases don't carry it in head across tool boundaries. The
`extract-logo-colors.mjs --character "<phrase>"` flag writes it directly
into the logo-colors artifact for traceability.

**`notes.archetype` is required:** one of `classic | modern | rugged |
luxury | prestige` — set by Phase A2d. Used by Phase 7.5a (image catalogue
lookup), Phase 7.5b (favicon glyph selection), Phase 7.5c (work-package
generator pulls archetype-specific required components), and Phase 8
(designer reads `docs/theme-archetype-specs.md` for the archetype).

**`notes.contextHint` is OPTIONAL** (may be `null`). When present, it
encodes business-mix info the home page alone won't reveal — e.g.
"sells motorbikes AND cars under same brand", "EV-only specialist",
"classic cars only", "commercial vans + minibuses". Phase 8 reads it to:
(a) override default hero copy ("Used cars in Leeds" → "Bikes and cars
in Leeds, side by side"), (b) replace inventory category chips
(All / Hatch / SUV / Saloon → All / Cars / Bikes if the hint says bikes;
All / EV / Hybrid / PHEV if EV-only; etc.), (c) add or rename nav items
("Used Cars" → "Cars & Bikes"; add a /bikes route stub if archetype
inventory supports it), and (d) reflect the mix in About/Services copy.
The hint is authoritative — Phase 8 must NOT silently revert to
"used cars" wording just because the inventory data layer is generic.

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

### Kept-vs-stubbed file map (read before Phase 8)

Phase 8 needs to know which scaffolded files are *empty stubs awaiting
fresh designs* vs *kept data layers whose presentation must still be
redesigned*. The distinction matters: "kept" does NOT mean "don't
touch" — it means **the data fetch, state, URL handling stay verbatim;
the JSX render layer and the CSS module are rewritten** (Pitfall row 30).

| File | Status | Phase 8 action |
|------|--------|----------------|
| `theme.json` | generated from args | none — already final |
| `tokens.ts` | generated from DNA | none — already final |
| `recipes/index.ts`, `sections/index.tsx`, `shell.tsx`, `pages.ts` | empty stubs | leave empty unless adding bespoke recipes |
| `context/*` (BrandStyles, BrandClientWrapper, AuthProvider, DynamicFavicon, GarageContext) | kept verbatim | none — runtime plumbing |
| `lib/*` (contact, api, vehicle-links, seo, uk-phone, brand-slug.server, inventory) | kept verbatim | none — runtime plumbing |
| `components/Shell.tsx` | minimal stub | **redesign** — mount sequence (PreviewBanner above Header, per-theme CookieBanner, WhatsAppFab) |
| `components/Header.tsx` | minimal stub | **redesign** — top contact bar, NAV_ITEMS with Home first, mobile overlay nav |
| `components/Footer.tsx` | minimal stub | **redesign** — primary nav + Carous credit |
| `styles/base.css` | minimal stub | **rewrite** — no blanket `:where(a)`, scope every rule, `[hidden]` override |
| `styles/color-policy.css` | kept verbatim | none — role-token mapping |
| `components/HeroBackdrop.tsx` | kept verbatim | none — SVG fallback dep of used-cars pages |
| `pages/home/page.tsx` | minimal stub | **redesign** — full section composition per archetype |
| `pages/about/page.tsx`, `pages/contact/page.tsx`, `pages/services/page.tsx`, `pages/sell-your-car/page.tsx`, `pages/finance/page.tsx`, `pages/part-exchange/page.tsx`, `pages/compare/page.tsx`, `pages/wishlist/page.tsx`, `pages/privacy-policy/page.tsx`, `pages/cookie-policy/page.tsx` | minimal stubs | **redesign** — fresh page bodies |
| `pages/used-cars/page.tsx` + `page.module.css` + `UsedCarsClient.tsx` | **kept (data layer)** | **redesign JSX + CSS only** — keep state/URL/fetch verbatim; pick a list pattern from `docs/inventory-design-library.md` |
| `pages/used-cars/[slug]/page.tsx` + `page.module.css` | **kept (data layer)** | **redesign JSX + CSS only** — pick a detail pattern A–H; ALSO add required sections (similar vehicles + makes-list panel + EnquiryModal + WhatsAppIcon) |
| `pages/recently-sold/page.tsx` | kept | **redesign** — distinctive treatment vs the live inventory list |

The full work-package (with per-file titles, archetype-specific
component requirements, and quality-bar items) is emitted by
`tools/generate-theme-workpackage.mjs` in the next sub-phase (7.5c).
Read that JSON into TodoWrite at the start of Phase 8 for a definition
of done.

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

### 7.5c — Generate the Phase 8 work package

```bash
node tools/generate-theme-workpackage.mjs \
  --id <theme-id> \
  --dna tools/.theme-dna/<dealer-slug>.json
```

Writes two artifacts:

1. `tools/.theme-work/<theme-id>.json` — the work package Claude reads
   into TodoWrite. Items are categorised:
   - `checklist-component` — every required (`[1]`) item from
     `.claude/skills/new-theme/Checklist.md`, the **canonical source**
     for what components must exist in every theme. This is the
     definition of "no component is omitted".
   - `stub-implementation` — pages/shell files the skeleton scaffolder
     ships as placeholders.
   - `kept-redesign` — inventory list + detail data-layer files whose
     JSX + CSS still need redesign (Pitfall row 30).
   - `archetype-required` — visual/layout specs from
     `docs/theme-archetype-specs.md` for the theme's archetype
     (provides the *how* for shared component slots like Hero, Header,
     Featured Stock).
   - `quality-bar` — cross-cutting checks (per-theme CookieBanner,
     brand-image vars, hero title cap, mobile simplification, motion
     budget, audit clean).
2. `app/themes/<theme-id>/CHECKLIST.md` — a **marked copy of
   `Checklist.md`** scoped to this theme. Required items are rendered
   unchecked (`[ ]`); optional ones carry an `(optional)` suffix and
   should only be filled if the archetype calls for them.

**Phase 8 entry rule:** read the JSON into TodoWrite as the first action
of Phase 8. As each component lands, tick the matching item in
`app/themes/<theme-id>/CHECKLIST.md` from `[ ]` to `[x]` and mark the
TodoWrite item complete. Phase 8 is not done until **every required item
in CHECKLIST.md is `[x]`** and the audit phases pass. The per-theme
CHECKLIST.md ships with the theme and serves as a permanent
build-completeness record.

**Canonical source rule (must-have, learned 2026-05-11):**
`Checklist.md` is the **only** place Phase 8 looks for "what components
to build". Do NOT invent components from elsewhere, do NOT skip required
items because the archetype spec didn't mention them, and do NOT pad the
build with components that aren't in Checklist.md. Archetype specs
describe *how* a slot looks for that archetype; Checklist.md decides
*whether* the slot must exist at all. When the two disagree, Checklist.md
wins on scope and the archetype spec wins on visual treatment.

Without this checklist, Phase 8 has no definition of done — that's the
regression class that caused the 5 May 2026 theme purge.

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
0a. `tools/.theme-concepts/<theme-id>.json` — the **Signature Concept**
   locked in Phase A2e. This is the single most important input to
   Phase 8: it names the signatureMove, heroPattern, headerStructure,
   homepage section composition, inventory patterns, and the
   one-big-move axis where restraint is exempted. **Phase 8 builds to
   the concept**, not to a generic archetype default. If you find
   yourself reaching for a section or move that isn't in the concept,
   stop — either it belongs in the concept (go back to A2e and update
   it, then re-run the uniqueness check) or it doesn't belong in this
   theme.
0b. `tools/.theme-fingerprints.json` — the registry of every existing
   theme's fingerprint. Open it. For each same-archetype peer, note
   what sections / patterns / moves they shipped. Your theme must
   differ on at least two homepage sections from the most recent
   same-archetype peer (Jaccard < 0.65 on the section set — enforced by
   `check-theme-uniqueness.mjs`).
0. `tools/.theme-dna/<dealer-slug>.json` → `notes.contextHint` — if
   non-null, this OVERRIDES default copy and inventory chips throughout
   Phase 8. Treat the hint as authoritative about the dealer's actual
   business mix. See Phase A5 §"`notes.contextHint`" for the full list
   of places it must apply (hero copy, inventory category chips, nav
   labels, About/Services copy). If you find yourself writing "used
   cars in <city>" while the hint says "bikes AND cars", you've missed
   step 0 — go back.
1. `app/themes/<theme-id>/CHECKLIST.md` — the **per-theme marked copy
   of `Checklist.md`** generated in Phase 7.5c. This is the canonical
   "what components must exist" list. Open it now; you will tick items
   off as you build, and Phase 8 is not done until every required item
   is `[x]`. If a component is not in this checklist, don't build it
   (and don't omit one that is).
2. `docs/theme-archetype-specs.md` — the spec for your archetype. This
   is a *design brief*, not a transcript. It lists layout language,
   section composition, decorative motifs. Interpret it; don't
   transcribe it. Use it to decide *how* each CHECKLIST.md slot looks,
   never to decide whether a slot exists.
3. `docs/inventory-design-library.md` — a **reference catalogue** of
   list and detail patterns sourced from real dealers (Cinch,
   Autotrader, Hexagon, McLaren Approved, etc.). Pull patterns you
   like, then **synthesize** something specific to this theme. The
   library is brain-prompt, not a template — two themes "using" the
   same list pattern should still look materially different (chip-row
   composition, sort/filter affordance, card chrome, empty/skeleton
   states, scroll/snap behavior). Append your theme's pattern choices
   to the rotation table when the design lands.
4. The full **Quality Bar** section earlier in this SKILL — every
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

### Homepage section composition — must differ ≥2 sections from the most recent same-archetype peer

The Phase A2e concept locked an ordered `homepageSections` list. Phase 8
builds to that list. The list MUST be drawn from the expanded section
menu below (add a new id if you genuinely need one — document it
inline) AND must differ from the most recent same-archetype peer's list
on at least TWO entries. The `check-theme-uniqueness.mjs` gate runs the
Jaccard math; aim for Jaccard ≤ 0.55 on the section set.

**Section menu (the catalogue Phase A2e + Phase 8 pick from):**

Core (most themes use one variant of these):
- `hero` — your locked hero pattern
- `latest-arrivals` / `latest-arrivals-carousel` / `latest-arrivals-4up` — recent stock grid or rail
- `service-highlights` — services as icon-led grid
- `services` — long-form services band
- `cta` / `cta-banner` / `cta-band` / `cta-fullbleed` — a primary call-to-action band
- `reviews` — testimonials in card or pull-quote form
- `directory` — SEO browse-by-make + browse-by-bodytype panel
- `trust` / `trust-band` / `brand-trust` — trust badges / accreditations

Distinctive (use these to differentiate from peers — Phase 8 should
pick at least 2 of these that the nearest peer doesn't have):
- `founder-note` — single-column narrative + photo (warm/family voice)
- `editorial-intro` — long-form opener paragraph
- `featured-collection` — 2-up alternating image-side cards (luxury)
- `concierge-services` — 3-column services with serif headings
- `pull-quote` — full-width editorial pull-quote testimonial
- `edition-strip` — "Vol. X · Spring Edition" magazine strip
- `acquisitions-row` / `featured-acquisitions` — horizontal recent-acquisitions row
- `stats-bar` / `stats-band` — 4-tile stat counters (years, stock, postcodes, rating)
- `specs-bar` — rugged-archetype quick-spec band
- `recently-sold-preview` / `recently-sold-rail` — recently-sold vehicles
- `category-band` — 3-tile category grid (Vans / Cars / Trucks etc.)
- `compact-stock-list` — dense image-left rows (industrial)
- `editorial-lead-story` — long-form lead story above the fold
- `story-card-grid` — 3-up topic-tagged story cards
- `pull-quote-review` — review framed as a letter
- `location-feature` — "Find us in <city>" with map preview
- `why-choose-us` — multi-pillar trust strip
- `why-city-pull-quotes` — buyer quotes about the dealer
- `team` / `meet-the-team` — staff cards
- `horizontal-stock-ticker` — live-stock scrolling rail
- `stock-table` — minimalist no-chrome row layout
- `services-grid-text-only` — minimalist services as text-only cells
- `industrial-grid-overlay-feature` — feature band with grid-overlay treatment

If you need a section not on this menu, ADD a kebab id + 1-line
description inline in the concept JSON and Phase 11 will roll it into
the registry for future themes to peer-compare against.

### Required-widget placement varies per theme

The Required Widgets are operational primitives that must mount — but
their POSITION varies per theme, drawn from these menus. The concept
file's `headerStructure` choice constrains some of these:

- **WhatsAppFab** — default bottom-right. Variants: `bottom-right` (default), `top-right-floating` (below header on the right), `header-chip` (integrated into the header as a green chip rather than a floating bubble). Industrial / minimalist themes typically use `header-chip` for less visual noise.
- **PreviewBanner** — default slim top strip. Variant: `slim-side-strip` (right-edge vertical strip) for editorial / magazine themes where the top strip would compete with an edition-strip.
- **Top contact bar** — three composition modes:
  - `strip` (default, classic-trad / warm) — full-width strip above Header with the 4 elements in canonical order
  - `integrated-into-header` (modern / minimalist) — location chip and phone CTA live as items inside the Header itself; socials move to the footer top
  - `omitted-with-footer-only` (minimalist / editorial) — top contact bar absent; the Header carries location chip only; socials + phone + status live in a footer-top band
- **Header structure** — pick from the menu in Quality Bar §"Distinctiveness contract"
- **Cookie banner** — already per-theme (see §"Cookie banners must NOT be one-size-fits-all"); the visual treatment must match the archetype

The four required elements of the top contact bar (location chip,
status chip, social icons, phone CTA) still must all be present
somewhere on the page chrome — the variants above only change WHERE.

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

## Mode B — App clone (`--app-mode <app>`)

> **Reshaped on 2026-05-26.** Mode B used to be a light DNA-only adaptation
> onto the skeleton scaffolder (which strips the visual layer) — the result
> was effectively a recolored springalls clone, not a port of the source
> app's actual design. The new Mode B is a **page-for-page faithful clone**
> of the source app's components, pages, styles, and lib helpers, with
> brand-overridable tokens swapped in for colors / fonts / image URLs. The
> result reads like the source app in a different palette/font/image set
> via brand record overrides — i.e. "highly configurable like the usual
> preview themes."
>
> The old `--from <app>` flag was retired in favour of `--app-mode <app>`.
> The underlying tool is now `tools/clone-app-to-theme.mjs` (replacing the
> `scaffold-theme.mjs` + `extract-theme-dna.mjs` two-step). DNA extraction
> still runs under the hood, so the standalone `extract-theme-dna.mjs`
> remains useful for one-off inspection.

Phases B1–B5 replace A1–A5; everything from Phase 9 onward is shared with
Mode A. **Skip Phases A2e (Lock Signature Concept) and the cross-theme
similarity peer pass** — clones are intentionally similar to their source
app; the peer pass should ignore themes whose `theme.json.mode === 'app-clone'`.

### B1 — Pick a source app

Source apps live under `<carous-platform>/apps/`. The carous-platform
checkout is discovered automatically (same resolver used by `extract-theme-dna.mjs`):
`--apps <path>` CLI arg → `CAROUS_PLATFORM_APPS` env var
→ `../carous-platform/apps` (sibling of brandstudio) →
`../../carous-platform/apps`. Use `Glob` against the resolved apps
directory to enumerate the current pool — examples from recent runs:

```
a2zautocompletezltd, amcarsalesltd, berksmotors, carsofmanchester, cnhcars,
columbusvehicles, csmotorsltd, huntsmotors, kainmotorsltd, lancashirecarsalesltd,
motorsinc, powercarsales, prestigemarques, revupautosgroup, scottishvancenter,
springallscarsalesltd, thebikebuyer, vagtechsolutionltd, visionprestige
```

The user always names the source via `--app-mode <app>`; this mode never
auto-picks. Validate the folder exists at `<apps-root>/<source>/app/`
before proceeding.

### B2 — Decide the theme id

Default: `<source>-clone` (e.g. `lancashirecarsalesltd-clone`). The user
may override via `/new-theme <id> --app-mode <source>`. Theme ids must be
kebab-case with ≥2 segments — the cloner validates and errors clearly.

### B3 — Run the cloner

```bash
node tools/clone-app-to-theme.mjs \
  --source <app> \
  --target <theme-id>               # optional; defaults to <app>-clone
  [--apps <abs-path>]               # optional; same resolver as extract-theme-dna
  [--name "<Display Name>"]         # optional theme.json display name
  [--description "<one-liner>"]     # optional theme.json description
  [--no-tokenize]                   # skip the color/font/image tokenization pass
  [--dry-run]                       # report counts only, write nothing
```

The cloner does, in order:

1. **Resolve** the carous-platform checkout and verify the source app exists.
2. **Extract DNA** by shelling out to `extract-theme-dna.mjs` — captures the
   source's palette, font stack, radii, shadows, hero metrics.
3. **Resolve `var(--name)` references** in the DNA palette via the source's
   `globals.css` `:root` block so we can build a real hex→token map (most
   source apps store their colors as CSS custom properties — the DNA file
   carries the var references, not the underlying hex).
4. **Discover routes** by walking `app/` for `page.tsx` files. Skips
   `api/`, `dashboard/`, `login/`, `data/` (as a routed dir), `hooks/`,
   `search/`, `in/`, `out/`. Route groups `(group)/<route>/page.tsx`
   collapse to `<route>`.
5. **Plan the writes**: every routed page → `pages/<route>/page.tsx`;
   every component → `components/<name>.tsx`; every style → `styles/<name>.css`;
   `app/globals.css` → `styles/base.css`; `lib/` and `data/` copied verbatim.
6. **Rewrite imports** in each text file:
   - `@/app/<seg>/...` → `<themeRoot>/<seg>/...` (strips `app/` prefix)
   - `@/<seg>/...` → `<themeRoot>/<seg>/...`
   - `./components/X` / `./styles/X` / `./lib/X` / `./data/X` from a page
     → `<themeRoot>/<seg>/X` (the source homepage at `app/page.tsx` reached
     siblings; the cloned homepage at `pages/home/page.tsx` is two folders
     deeper).
7. **Tokenize CSS** (per CSS module + `styles/base.css`):
   - hex literals matching the resolved palette → `var(--color-*)`
   - `font-family: ...;` declarations → `var(--font-brand-family-override, ...)`
     (heading) or `var(--font-brand-body-override, ...)` (body), inferred by
     comparing the first family to the DNA heading family.
   - `background-image: url('/images/<file>')` → multi-layer
     `background-image: var(--brand-image-<slot>, none), url('/themes/<id>/images/<slot>.jpg')`
     — slot inferred from the filename (hero / about / services / finance /
     partExchange / sellYourCar / recentlySold).
8. **Emit the theme contract** files: `theme.json` (with
   `mode: "app-clone"` and the source app name), `pages.ts` (one entry per
   discovered route), `shell.tsx` (mounts all the standard brandstudio
   widgets — AnimateOnScroll, MotionFX, ScrollProgress, PreviewBanner,
   CookieBanner, WhatsAppFab), `tokens.ts`, `context/BrandClientWrapper.tsx`,
   `context/BrandStyles.tsx` (emits the brand-overridable CSS variables
   the tokenized files now consume).
9. **Emit `CLONE_FOLLOWUPS.md`** at the theme root listing the things the
   tool couldn't auto-fix:
   - `@carous/*` workspace package imports (cloner doesn't know which are
     available in brandstudio).
   - `hooks/` imports (source's `hooks/` isn't copied — inline or move to `lib/`).
   - `data/` imports (the cloner copies `data/` verbatim so the theme
     compiles, but these references should be rewired to read from the
     brand record at runtime).
   - Direct `fetch('/api/...')` calls (source-app API routes don't exist
     in brandstudio; rewire to brandstudio's shared API).

### B4 — Resolve the follow-ups checklist

Open `app/themes/<id>/CLONE_FOLLOWUPS.md` and walk it top-to-bottom.
The hierarchy of fixes (most → least likely to break the build):

1. **Workspace `@carous/*` imports** — type-check will fail until each is
   either swapped for an in-tree equivalent, inlined, or added to
   brandstudio's dependencies. Common cases:
   - `@carous/seo` → already lives in brandstudio (`packages/seo`); just
     update the import path.
   - `@carous/sell-your-car` → mount `<SellYourCarWidget />` from
     `@/app/widgets/SellYourCarWidget` instead (see Pitfall row 28).
   - `@carous/hooks` → inline the specific hook (usually one helper per
     consumer) into `lib/`.
2. **`hooks/` imports** — either inline into the consumer (if used in one
   place) or move to `lib/<name>.ts`. Update import paths.
3. **`data/<file>` imports** — the source's hardcoded dealer profile.
   Replace each reference with the equivalent brand-record read:
   - `companyProfile.name` → `brand.name`
   - `companyProfile.location.address` → `brand.location?.address`
   - `companyProfile.location.phone` → `brand.location?.phone`
   - `companyProfile.openingHours` → `brand.openingHours`
   - `companyProfile.services` → `brand.services`
   This is the bulk of "highly configurable" — once `data/` is gone, the
   theme is genuinely brand-record-driven.
4. **`fetch('/api/...')` calls** — rewire to the shared brandstudio API
   surface using `apiUrl()` from `lib/api.ts` and pass `?brand=<slug>`
   (Pitfalls catalogue row 14 / 29 invariants still apply).
5. **The queensbury-era pitfalls** — re-verify rows 40 / 41 / 42 against
   the cloned hero / CTA / sold-cars rail. The source app may have shipped
   patterns that we've since learned not to use; the clone inherits them
   verbatim.

### B5 — Phase-8 polish (the "maybe better styles" pass)

The cloner aims for "same design, maybe better styles." Phase 8 in
Mode B is lighter than Mode A (no fresh design needed) but still has
work to do:

- Apply the **Pitfalls catalogue** to the cloned files: rows 40 (reduced-
  motion fallback), 41 (CTA centering), 42 (card-rail repeat-grid),
  plus the rest as relevant.
- Sweep CSS modules for hardcoded hex that the cloner missed (the
  tokenizer only handles palette colors; ad-hoc decorative hex stays).
  Replace with brand tokens where the brand would want them overridable.
- Apply the **Modern / futuristic visual language** restraint rule (§"Visual
  hierarchy per section") — source apps sometimes ship 4-5 attention-pullers
  in a section; trim to two per the restraint rule.
- Audit blocker pass per Phase 10c (`node tools/audit-theme.mjs --id <id>`).

Skip the cross-theme similarity *peer pass* — clones are intentionally
similar to their source app. The baseline pass (vs `springalls-classic`)
is still meaningful and should run.

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

**Pre-flight: checklist completeness.** Before invoking the static audit,
open `app/themes/<theme-id>/CHECKLIST.md` and verify **every required
item is `[x]`**. Any required item still on `[ ]` means a canonical
component is missing — go build it before continuing. The audit tool
doesn't grep CHECKLIST.md (intentional — manual ticking is the discipline);
the gate is your read of the file. Optional `(optional)` items can stay
unchecked.

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

## Phase 10d — Distinctiveness gates (uniqueness + similarity)

Two checks. **Both must exit 0.** Run them in parallel.

### 10d-i — Fingerprint uniqueness

```bash
node tools/check-theme-uniqueness.mjs --id <theme-id>
```

Reads `tools/.theme-concepts/<theme-id>.json` (written by Phase A2e)
and asserts the fingerprint doesn't collide with any existing
same-archetype peer on:

- archetype + signatureMove → HARD block
- archetype + heroPattern → HARD block
- archetype + inventoryListPattern + vehicleDetailPattern → HARD block
- archetype + homepageSections Jaccard ≥ 0.65 → HARD block
- archetype + identical fontHeading + fontBody pair → advisory

If A2e was diligent this passes cleanly. If it fires, the operator
short-circuited Phase A2e somehow — go back and re-run the concept
selection, then return here.

### 10d-ii — Render-layer similarity (baseline + peer pass)

```bash
node tools/check-theme-similarity.mjs --id <theme-id>
```

Two passes:

- **Baseline pass** vs `springalls-classic` skeleton at threshold 0.85.
  Catches "Phase 8 renamed identifiers without redesigning JSX".
- **Peer pass** vs the 3 most recent same-archetype peers from the
  fingerprint registry at threshold 0.55. Catches "two modern themes
  feel like twins". Auto-discovered via
  `tools/.theme-concepts/<theme-id>.json`. Pass `--no-peers` to skip
  this pass (not recommended).

Compares `Hero.tsx`, `pages/home/page.tsx`, `pages/used-cars/page.tsx`,
`pages/used-cars/[slug]/page.tsx`, `pages/recently-sold/page.tsx`.
Uses normalized-shingle Jaccard (identifiers lowercased, whitespace
squashed, comments stripped) so theme renames don't lower the score.

Exit codes (both passes):
- `0` — all files under their respective thresholds.
- `1` — one or more files at/above threshold; open each flagged file
  and redesign its JSX before declaring Phase 8 done.

Compare against a specific theme (instead of the skeleton or auto-
picked peers) with `--baseline <theme-id>`.

## Phase 11 — Log to FEATURE_LOG + append fingerprint

**11a — FEATURE_LOG.** Append a new entry at the **top** of
`docs/FEATURE_LOG.md`:

```
- YYYY-MM-DD: Added <theme-id> theme — <Mode A: bespoke for <Brand Name> | Mode B: ported from carous-platform/<source>> (owner: Difatha)
  - Scope: app/themes/<theme-id>/* (full theme contract)
  - Reason: <prospect preview for <Brand>> | <internal sibling port>
  - Notes: Generated via /new-theme. Logo: <path>. URL: <dealer URL>. Fonts: <heading> + <body>. Primary: <hex>. Archetype: <archetype>. Signature: <signatureMove>.
```

Use today's absolute date from system context.

**11b — Fingerprint registry.** Append the new theme's fingerprint to
`tools/.theme-fingerprints.json` so future themes peer-compare against
it. Open the file, append to the `themes` array, and add `addedAt: "<today>"`.

```jsonc
{
  "themeId": "<theme-id>",
  "archetype": "<from A2d>",
  "signatureConcept": "<one-sentence locked in A2e>",
  "signatureMove": "<kebab id>",
  "personalityVoice": "<menu entry>",
  "headerStructure": "<kebab id>",
  "heroPattern": "<kebab id>",
  "homepageSections": ["hero", "...", "..."],
  "inventoryListPattern": "<kebab id>",
  "vehicleDetailPattern": "<kebab id>",
  "fontHeading": "<heading family>",
  "fontBody": "<body family>",
  "oneBigMove": "<axis>",
  "addedAt": "YYYY-MM-DD"
}
```

**Critical:** the registry is the source of truth for the next
`/new-theme` invocation's Phase A2e — if you forget to append, the next
theme can collide with this one without the uniqueness check seeing it.
This step is the only piece of Phase 11 that's load-bearing for future
runs; the FEATURE_LOG is for humans, the registry is for the skill.

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
  - "Yes — push theme + register a production preview via remote API"
  - "No — just commit the theme, I'll create the preview later via /create"
```

Pick the helper invocation accordingly:
- Local-dev → `tools/build-preview-from-theme.py` (Phase 13a, existing)
- Production via remote API → `tools/create-preview.mjs` (Phase 13c, see below)
- No → skip to Phase 13 ship

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

## Phase 13c — Optional: register a PRODUCTION preview via remote API

When the operator picks **"push theme + register a production preview via
remote API"** in the Phase 12b question, the pipeline is:

1. Commit + push the theme code (Phase 13 ship path). Wait for the production
   build to deploy the new `app/themes/<theme-id>/` folder. The script
   already retries when the theme isn't deployed yet, so this step can run
   concurrently with the push.
2. Run `tools/create-preview.mjs` from the operator's local machine. It POSTs
   to `https://<production>/api/v1/preview/create` with an API-key Bearer
   token, the theme id, and the brand record (logo/colour/contact/address
   collected during Phase A). If `--ai` is passed, the server runs OpenAI
   with the theme's `recipes/text-recipe.json` and auto-fills `brand.text`
   per recipe field — the AI generator is the same one the dashboard
   `/create` page uses, so output quality matches.
3. The endpoint persists the preview via `upsert_preview` (same store the
   dashboard `/create` uses) and returns the live preview URL.

**Required env vars (on the operator's local machine):**

```
BRANDSTUDIO_API_URL  https://brandstudio.carous.co.uk   # production host
BRANDSTUDIO_API_KEY  sk_<long-random-string>            # must match server config
```

The matching `BRANDSTUDIO_API_KEY` must be set on the production server.
When unset on the server, `/api/v1/preview/create` returns `503` with the
message "Remote preview creation is disabled — BRANDSTUDIO_API_KEY is not
set on the server." (the endpoint is opt-in for security).

**Invocation:**

```bash
node tools/create-preview.mjs \
  --theme <theme-id> \
  --slug <preview-slug> \
  --name "<Display Name>" \
  --domain <domain.co.uk> \
  --hex "<#hex>" \
  --logo <https://...logo.png> \
  --hero <https://...hero.jpg> \
  --phone "<+44 ...>" \
  --email "<info@...>" \
  --address-line1 "<Street>" \
  --city "<City>" \
  --postcode "<POSTCODE>" \
  --ai \
  --context "<short business description for AI>" \
  --website "<https://dealer.co.uk>"
```

**What the helper does:**

1. Builds a `BrandConfig` payload from the flags (or loads one from
   `--brand-json <path>` if the operator wants to round-trip a manually
   edited record).
2. POSTs to `/api/v1/preview/create` with `Authorization: Bearer <API_KEY>`.
3. If the response is `404 + code:"theme_not_deployed"`, retries every 30s
   up to 10 times (configurable with `--retries` / `--retry-delay`). This
   handles the natural race condition where the git push hasn't deployed yet.
4. On success, prints the live preview URL. Quote it in the Phase 12 report.
5. On `409 slug_conflict`, advises `--force` to overwrite.
6. On `401 / 503`, advises checking `BRANDSTUDIO_API_KEY` matches between
   client + server.

**Exit codes:**
- `0` — success, preview live at the printed URL.
- `2` — env var or required flag missing.
- `3` — slug conflict; re-run with `--force` to overwrite.
- `4` — auth failure; check API key.
- `5` — unexpected server error; payload in stderr for diagnosis.
- `99` — uncaught script failure (network blip, JSON parse error, etc).

**Important constraints:**
- The theme MUST be deployed on production before the API call resolves.
  The default 10×30s retry window (5 minutes) covers a typical deploy. For
  slower deploys, raise `--retries`.
- AI auto-fill is optional but strongly recommended — without it, all of
  `brand.text` stays empty and the theme renders its recipe defaults
  (generic copy). Pass `--ai --context "..." --website "..."` for
  pitch-ready output.
- The operator can still open `/update/<slug>` in the dashboard afterwards
  to fine-tune copy, swap images, or adjust hours. The remote API path is
  for the "create and go" case; the dashboard owns iteration.

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
- **Don't extract colors from the logo.** The user supplies one primary
  hex in Phase A1; the policy generator derives the rest. See Quality
  Bar §"Color palette policy" and memory
  `feedback_no_logo_color_extraction.md`.
- **Don't paint `color: var(--color-text)` on components whose surface
  comes from a brand-overridable token.** Use the paired surface +
  foreground tokens (`--surface-*-light` + `--text-on-light-*` or
  `--surface-*-dark` + `--text-on-dark-*`) so brand-record overrides
  can't break contrast.
- **Don't invent components Phase 8 must build from anywhere other than
  `Checklist.md`.** That file is the canonical "what components must
  exist" source — Phase 7.5c parses it, the work package ingests every
  required (`[1]`) item, and the per-theme `app/themes/<id>/CHECKLIST.md`
  is the build-completeness record. Don't omit required items because
  the archetype spec didn't mention them, and don't pad the build with
  components that aren't on the list. Archetype specs decide *how* a
  slot looks; `Checklist.md` decides *whether* it exists at all.

## Tested defaults (current)

- **Mode A scaffolder**: `tools/scaffold-theme-skeleton.mjs` — produces
  ONLY contract + plumbing stubs (~39 files), strips visual layer. Phase 8
  designs every page + component fresh.
- **Mode B scaffolder**: `tools/scaffold-theme.mjs` — full clone-and-edit
  from `springalls-classic` (cleanest theme, type-clean baseline). Phase 8
  in Mode B is text replacement, not redesign.
- Mode A inputs: 3 required (logo file path + dealer URL + primary brand
  hex) + 1 optional free-text `contextHint` (e.g. "sells bikes AND cars",
  "EV-only", "classic cars only", "commercial vans"). Optional: theme id,
  display name. Color is NEVER extracted from the logo — see Quality
  Bar §"Color palette policy". The context hint threads through A3
  scrape, A5 DNA `notes.contextHint`, and Phase 8 hero copy + inventory
  chips + nav labels.
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
| 38b | Difatha re-reported the same class of bug a day later: "the images persisted on brandstudio dashboard are not wiring correctly into themed previews — previews are lacking imagery completely for the new theme." Rule 37 had been encoded but Phase 8 still produced a theme whose BrandStyles couldn't surface dashboard uploads consistently. Three distinct failure modes were all hiding behind the same symptom (empty image areas in the preview). | (i) BrandStyles fell back to `/images/hero-placeholder.jpg` when neither `brand.images.hero` nor `brand.heroImage` was set. That file 404s on most deployments, AND the CSS-level `var(name, fallback)` defensive fallback NEVER fires because BrandStyles had already set the var to a non-empty (but broken) URL. CSS `var(name, fallback)` only kicks in when the var is undeclared, never when set to a 404'ing string. (ii) Per-slot fallback cross-fell to the hero (`aboutImage = brand.images.about OR heroImageSlot`), so an operator who uploaded only a hero saw every page render the same hero — masking the curated theme defaults entirely and making the preview look monotonous. (iii) Older themes (classic-dealer, gilded-drive) only emit `--classic-hero-image`, not the 7-slot `--brand-image-*` set; a brand record bound to those themes shows no per-page imagery at all. The new theme inherited the bogus-placeholder fallback from the scaffolder's default BrandStyles template. | (a) New BrandStyles fallback chain mandated by Quality Bar §"Brand-uploaded images must render". (b) No cross-fall: each slot independently falls back to its own theme-curated default so operator-uploads-hero-only previews still render distinctive per-page imagery rather than five copies of the hero. (c) Helper pattern `pickString(...)` + `resolveSlot(...)` shipped in the SKILL as the canonical implementation; future scaffolders should emit this shape by default. (d) Memory `feedback_brand_image_plumbing.md` rewritten with diagnostic flow (`getComputedStyle(...).getPropertyValue('--brand-image-hero')` in browser console, with response→cause table). (e) Audit rule `lib-brand-styles-incomplete-slots` (deferred — flag any theme's BrandStyles.tsx that doesn't emit all 7 `--brand-image-*` vars OR uses a placeholder URL as the terminal fallback). (f) Older themes (classic-dealer, gilded-drive) flagged as "cross-theme caveat" — they only emit `--classic-hero-image`; brand records bound to those themes don't get per-page imagery. Migrating them to emit all 7 is a follow-up. |
| 38c | Difatha came back AGAIN the same day with a screenshot showing the dashboard had an uploaded hero (forecourt photo with "AUTOWOW" signage clearly visible in the Brand Assets section of `/update/columbus-vehicles-preview`) but the rendered preview hero was the curated theme default Unsplash photo, NOT the dashboard upload. Rule 38b's 3-tier chain was already shipped (`brand.images.hero` first, then `brand.heroImage`, then theme default). | Direct inspection of the brand record via `GET /api/previews/columbus-vehicles-preview` showed: `heroImage: "/images/columbus-vehicles-preview-hero.png"` (the real upload, file present on disk) but `images.hero: "/images/hero-bg.png"` (a stale placeholder from initial brand creation that pre-dated the operator's hero upload). The dashboard's update_brand handler tries to sync `images.hero` from `heroImage` on each save, but this brand record's `images.hero` was set during initial brand creation and never re-synced (the operator updated the hero AFTER creation through a save path that didn't fire the sync, OR through a different version of the handler that didn't have the sync code). My 3-tier chain checked `brand.images.hero` FIRST → returned the stale placeholder → CSS layered fallback served the THEME default underneath (because the placeholder URL 404'd) → user saw theme default, not the dashboard upload they'd just shipped. The chain was structurally correct but had the wrong PRIORITY for the hero slot. | (a) **Reorder the hero slot specifically**: read `brand.heroImage` FIRST (the authoritative top-level field — the dashboard always refreshes it on every save), then `brand.images.hero` as backup, then theme default. Other slots stay the same (they don't have an authoritative top-level alias). (b) **Add layered-background CSS as a defensive belt-and-braces** for the rare case the brand URL 404s anyway: every component that consumes `var(--brand-image-<slot>)` does multi-layer `background-image: var(--brand-image-X, none), url('/themes/<id>/images/<slotFile>.jpg')` so the theme default always renders if the brand URL fails to load. The CSS-level `var(name, fallback)` idiom is NOT used here — it doesn't trigger when the var is set to a broken URL. Use `var(name, none)` so the layer is `none` (renders nothing) when undeclared, rather than making the entire declaration invalid. (c) **Prefer per-page hero variant CSS classes over inline styles**: `.auto-page-hero--finance` etc. live in base.css with the multi-layer pattern, and pages use `<section className="auto-page-hero auto-page-hero--finance">` instead of inline `style={{ backgroundImage: ... }}` — keeps the multi-layer intent in one place and easier to keep consistent. (d) Memory `feedback_brand_image_plumbing.md` updated with the special-cased hero ordering + the layered-CSS pattern. (e) Future audit rule `data-images-hero-stale` (deferred) could fetch the brand record, compare `brand.heroImage` vs `brand.images.hero`, and warn if they disagree. |
| 38 | Three contrast bugs in the same auto-wow-uk-bespoke preview screenshot (rendered through the Columbus Vehicles brand record): (a) `LatestArrivalsSection` vehicle card titles invisible — dark `--color-text` painted on a card whose `--color-surface` had been overridden to dark by Columbus's brand record; (b) hero ghost-CTA content invisible — `auto-btn--ghost` rule painted `color: var(--color-text)` (dark) on the hero's fixed dark background because the ghost-button-on-dark variant was only scoped under `.auto-section--dark` and the hero wasn't wrapped in it; (c) topbar social icons hid entirely when `brand.socialLinks` was empty — the previous rule "hide individual icons whose URL is empty; hide group entirely if `socialLinks` absent" made the bar look incomplete on real-world brand records. Compounded: the original logo-extracted primary `#fd1317` also failed AA white-on-primary out of the gate and required iterative manual darkening. | The brandstudio token system treats `--color-surface` and `--color-text` as INDEPENDENT brand-overridable tokens. When a brand record overrides one but not the other (or the theme assumes light tier and the brand assumes dark), components painted from `color: var(--color-text)` against `background: var(--color-surface)` lose contrast. Generic foreground inheritance is structurally fragile; brand-record cross-rendering exposes it. The logo-extraction path was also unreliable as a color SOURCE: it would happily return an AA-failing primary and force iterative darkening before the theme could ship. | Three-pronged: (a) New tool `tools/check-palette-policy.mjs --primary <hex>` validates the user-supplied primary, auto-darkens if needed, and emits the full 11-pair contrast-checked token set (light tier × 2 surfaces × 2 fg-strengths + dark tier × same + brand triad). Exits 1 if any pair fails AA. Phase A2c now runs this instead of the old extract+contrast flow. (b) New SKILL Quality Bar §"Color palette policy — paired surface + foreground tokens" mandates: ONE brand color input from user (not extracted from logo); two FIXED neutral tiers (light + dark) that brand records may NEVER override; brand records may ONLY override the brand triad; every CSS rule that sets `background:` from a surface token MUST set `color:` from the paired foreground token in the same rule or enclosing scope. (c) Updated `feedback_topbar_essentials.md` memory to require ALWAYS rendering all 4 social icons in canonical order; render unconfigured icons as muted non-clickable spans (never hide the group). Memories `feedback_no_logo_color_extraction.md` + `feedback_color_palette_policy.md` capture the new invariants. Future audit rule `lib-unpaired-foreground` (deferred) will flag any CSS rule that sets `color: var(--color-text*)` without a same-scope `background:` from the paired tier. |

| 39 | Difatha reported 2026-05-25: "themes created with /new-theme look similar to one another in feel and look" despite the existing 5-archetype catalogue + the cross-theme similarity check. Side-by-side comparison of `auto-wow-uk-bespoke` / `dual-stock-modern-bespoke` / `showroom-shine-cars-bespoke` / `kain-motors-bespoke` showed the same chrome (top contact bar, WhatsApp FAB position, AOS animations, glow blobs in hero, restraint-capped typography) and overlapping section composition (Hero → Trust → FeaturedStock → Services → CTA → Reviews → Directory) — the perceived sameness was structural, not just a recolor problem. | Five compounding causes: (a) only 5 archetypes with `classic` as the catch-all default ("no redesign needed" routed every ambiguous logo into a springalls-classic clone); (b) the same required-widget chrome on every theme (4-item top contact bar in canonical order, WhatsAppFab bottom-right, MotionFX glow blobs mandatory in every hero, EnquiryModal/PreviewBanner positioned identically); (c) the 2026-05-11 restraint rule (5 fonts / 2 gradients / 25% brand color / 2 decorative layers) pushed every theme toward "safe corporate calm"; (d) the cross-theme similarity check only compared vs `springalls-classic` — two new "modern" themes could each score 0.4 vs skeleton but 0.85 against each other and never get caught; (e) no fingerprint memory between runs — a new theme had no signal about what the most recent shipped theme already did. | Six-pronged fix (2026-05-25): (a) New SKILL Quality Bar §"Distinctiveness contract" with explicit menus for `signatureMove` (~19 kebab ids), `personalityVoice` (7 entries), `headerStructure` (10 variants), and the `oneBigMove` restraint-exemption axis. (b) New Phase **A2e — Lock Signature Concept** runs between A2d and A2c, writes `tools/.theme-concepts/<theme-id>.json` capturing the full fingerprint, self-validates via `check-theme-uniqueness.mjs` before Phase 7 scaffolds. (c) New `tools/check-theme-uniqueness.mjs` blocks (exit 1) on archetype+signatureMove / archetype+heroPattern / archetype+inventory-pair / homepageSections-Jaccard ≥ 0.65. (d) New `tools/.theme-fingerprints.json` registry backfilled with the 7 existing themes; Phase 11 appends the new theme so the next run sees it. (e) `tools/check-theme-similarity.mjs` extended with a **peer pass** at threshold 0.55 against the 3 most recent same-archetype peers (auto-discovered via the concept file). (f) Archetype catalogue expanded from 5 to 8: `classic` split into `classic-trad` (the original springalls neighbourhood) + `classic-warm` (new catch-all default with a fresh redesign cycle); added `minimalist`, `industrial`, `editorial`. Phase 8's "Required-widget placement varies per theme" rule gives WhatsAppFab / PreviewBanner / top contact bar / Header three placement variants each, and the restraint rule lifts ONE cap per theme via `oneBigMove`. |

| 40 | Hero live-stock marquee renders as a clumsy 4-row stacked grid under `prefers-reduced-motion` instead of a clean static snapshot. Visible in BrandStudio's preview (which may force reduced motion) and on any OS with the accessibility setting on. | The `@media (prefers-reduced-motion: reduce)` block on a custom keyframe-animated marquee track was overriding `flex-wrap: wrap` + `white-space: normal` + `padding-inline` "to let the items wrap when frozen." But the marquee track was rendering the *duplicated* array (`[...items, ...items]`) intended for seamless looping, so `flex-wrap: wrap` dumped 2× the visible items into a stacked multi-row grid. First repro: `queensbury-cars-bespoke/components/Hero.module.css` 2026-05-26 (Reliable Autos preview). | New SKILL Quality Bar guidance in §"Motion & light language" — for any infinite-loop marquee/ticker, the ONLY reduced-motion override is `animation: none`. Do NOT add `flex-wrap: wrap`, `white-space: normal`, or padding overrides to the reduced-motion block. Let the parent's `overflow: hidden` + edge-fade `mask-image` clip the frozen track into a static snapshot. Canonical reference: `app/themes/auto-wow-uk-bespoke-02/components/HorizontalStockTicker.module.css` lines 88–90 (`@media (prefers-reduced-motion: reduce) { .railTrack { animation: none; } }` — that's the whole rule). Audit rule `motion-marquee-wrap-fallback` (deferred — flag any `prefers-reduced-motion: reduce` block on a `.module.css` containing a keyframe-animated track that overrides `flex-wrap` or `white-space`). |
| 41 | Primary-CTA banner section (e.g. "Tell us what you want. We'll match you to it.") reads as awkward / boxy — left-aligned content inside a rounded-card frame with side gutters, decorative glow stuck top-right, grid pattern anchored 20% off-center to the left. Doesn't feel like the page's primary call-to-action; feels like a content tile. | Phase 8 wrapped the homepage CTA section in a `border-radius: 12px` card with horizontal `margin: ... clamp(16px, 3vw, 28px)` side gutters and left-aligned the `.inner` block (no `align-items: center`, no `text-align: center`, `.inner { max-width: 720px }` only). Decorative layers (`.glow` at `top: -30%; right: -10%`, `.gridPattern` mask anchored `at 20% 50%`) were positioned for that left-aligned layout — once a reviewer wanted the content centered, the decorative layers fought the composition. First report: `queensbury-cars-bespoke/components/CtaBanner.module.css` 2026-05-26 (Reliable Autos preview). | New SKILL Quality Bar §"Primary-CTA section composition" — the homepage's primary call-to-action band defaults to **full-bleed (no horizontal margin, no border-radius) with centered content**: `.inner` uses `margin-inline: auto` + `align-items: center` + `text-align: center`. Decorative layers (`.glow`, `.gridPattern`, any background radial mask) MUST be anchored to match — centered (`at 50% 50%`) for centered content, not corner-stuck or off-axis. Off-center decorative anchors are a deliberate choice that requires asymmetric content to balance, NOT the leftover position from a previous left-aligned layout. Rounded-card-with-side-gutters is acceptable for *secondary* content blocks (testimonial tiles, service cards), but the page's primary CTA reads cleaner as a full-bleed band. Eyebrow line accents (`::before` / `::after`) must be symmetric (`::before` AND `::after`) when the eyebrow sits in a centered layout — a single `::before` line reads as a left-aligned holdover. |
| 42 | `RecentlySoldPreview` (and similar homepage card rails) shipped a desktop `grid-template-columns: repeat(4, 1fr)` that produced a 4+2 orphan layout once the fetch limit exceeded the column count — looks broken on the homepage. Also fights the theme's locked `signatureMove` when that signature is a ticker/rail. | Phase 8 rendered a horizontal-scroll grid on mobile (`grid-auto-flow: column` + `overflow-x: auto`) but switched to `repeat(4, 1fr)` at `min-width: 960px` "for desktop polish." With `limit=6` items fetched, the extra 2 wrapped into a second row. Themes whose signature is a horizontal stock ticker (`signatureMove=horizontal-stock-ticker`, `stats-band-plus-recently-sold-rail`) shouldn't be flipping to a static 4-column grid for sold-vehicle rails — the grid contradicts the locked signature. First report: `queensbury-cars-bespoke/components/RecentlySoldPreview.module.css` 2026-05-26 (Reliable Autos preview). | New SKILL Quality Bar §"Homepage card rails — never `repeat(N, 1fr)` when items may exceed N" — homepage card rails (RecentlySoldPreview, any "what we sold / what's new" strip, FeaturedStock when rail-shaped) MUST pick one of: **(a) single-row horizontal scroll** at every viewport (mobile manual swipe → desktop manual swipe with edge fades), OR **(b) infinite auto-scrolling marquee** with duplicated track for seamless loop, paused on hover, `animation: none` under reduced-motion (no wrap fallback — see row 40), edge-fade `mask-image`. Pick (b) when the theme's `signatureMove` is a ticker (`horizontal-stock-ticker`, `stats-band-plus-recently-sold-rail`) — the marquee reinforces the signature instead of fighting it. Pick (a) otherwise. When using (b): bump the fetch `limit` to ≥10 so the duplicated track looks populated; render the duplicate half with `aria-hidden="true"` so screen readers see each vehicle once; on mobile hide the duplicates via `.railItem[aria-hidden='true'] { display: none }` so swipe users don't cycle past the same stock. Canonical reference: `queensbury-cars-bespoke/components/RecentlySoldPreview.tsx` + `.module.css` post-2026-05-26 fix. Audit rule `lib-rail-repeat-grid` (deferred — flag any `grid-template-columns: repeat(N, 1fr)` inside a `*Rail*` / `*Recently*` / `*Preview*` CSS module). |

When you add a new audit rule for a future bug, append a row here. The
catalogue should grow as a record of "what we've already learned not to
do" — a future Claude reading this list won't re-debug what's already
been debugged. Don't remove rows even if the underlying tool changes:
the row stays as institutional memory.

## Tool reference (this skill calls these)

| Tool | Purpose | Mode |
|------|---------|------|
| `tools/check-skill-env.mjs` | Phase 0.5 pre-flight. 3 gates: tools-present, node-deps (sharp), theme-sync-clean. Exit 1 on any fail. | Both modes |
| `tools/check-palette-policy.mjs` | Phase A2c color-policy generator + validator. Takes user-supplied primary hex, auto-darkens to AA if needed, derives the full token set (two fixed neutral tiers + brand triad), walks the 11-pair surface×foreground contrast matrix, emits `tools/.palette/<slug>.json`. Exits 1 if any pair fails AA. Flags: `--primary <hex>`, `--slug <slug>`, `--out <path>`, `--json`, `--max-darken 0.6`. | Both modes (required) |
| `tools/extract-logo-colors.mjs` | DEPRECATED for color decisions as of the color-policy update — kept for retrospective inspection of dominant logo colors but NOT part of the canonical Mode A flow. Phase A2 now uses vision for character analysis only. | (deprecated) |
| `tools/check-theme-contrast.mjs` | Legacy WCAG AA validator for individual color combos. Superseded by `check-palette-policy.mjs` which walks the full matrix and emits paired tokens. Retained for one-off contrast checks against arbitrary fg/bg pairs. | Both modes (legacy) |
| `tools/check-theme-uniqueness.mjs` | Phase 10d distinctiveness gate. Reads `tools/.theme-concepts/<theme-id>.json` + `tools/.theme-fingerprints.json`; blocks (exit 1) when the new theme collides with any same-archetype peer on (signatureMove / heroPattern / inventoryListPattern+vehicleDetailPattern / homepageSections Jaccard ≥ 0.65). Soft advisories for matching font pairs. Flags: `--id`, `--concept <path>`, `--json`. | Mode A (required) |
| `tools/check-theme-similarity.mjs` | Phase 10d render-layer Jaccard check. Two passes: vs skeleton at 0.85 (baseline) and vs ≤3 recent same-archetype peers at 0.55 (peer pass — auto-discovered via concepts file). Exit 1 on any flagged file. Flags: `--id`, `--baseline`, `--threshold`, `--peer-threshold`, `--no-peers`, `--json`. | Mode A (required); Mode B only baseline pass is useful |
| `tools/audit-theme.mjs` | Static-analysis quality gate. Rule prefixes: `a11y-` (accessibility), `std-` (standards), `data-` (data-fetching), `mobile-` (responsive), `perf-` (performance), `brand-` (token discipline), `tp-` (Turbopack collision avoidance), `lib-` (foundation/dependency), `motion-` (motion & light language), `inv-` (inventory page contracts — list and detail). Blockers exit 1. Supports inline `audit-ignore: <rule>` and file-level `audit-ignore-file: <rule>` directives. See **Pitfalls catalogue** above for the historical bugs each rule prevents. | Both modes |
| `tools/rollback-theme.mjs` | Partial-theme cleanup when a run fails between Phase 7 and 12. Removes theme folder, public images, DNA JSON, images manifest, logo-colors JSON, then re-runs theme:sync. Idempotent. Flag: `--dry-run`. (No longer touches MySQL — brand cleanup is dashboard-only.) | Both modes |
| `tools/fetch-theme-images.mjs` | Source 7 page-level images (hero/about/services/finance/partExchange/sellYourCar/recentlySold). Curated Unsplash catalogue with classic-archetype fallback; live API mode when `UNSPLASH_ACCESS_KEY` is set. | Mode A only |
| `tools/generate-theme-favicon.mjs` | Emit a 32×32 archetype-aware SVG favicon at `public/themes/<id>/favicon.svg`. Five templates (classic / modern / rugged / luxury / prestige). Auto-discovers primary color + archetype + glyph from the DNA JSON; accepts `--primary`, `--accent`, `--archetype`, `--glyph` overrides. | Both modes |
| `tools/extract-theme-dna.mjs` | DNA extractor from a carous-platform sibling app — palette, fonts, radii, shadows, hero metrics. Called internally by `clone-app-to-theme.mjs`; still useful as a standalone for inspecting a source app's design tokens. | Mode B (internal) |
| `tools/clone-app-to-theme.mjs` | **Mode B's new core (2026-05-26)**. Page-for-page faithful clone of a carous-platform app into a brandstudio theme. Discovers routed pages, copies components + styles + lib + data, rewires imports (`@/`, `@/app/`, plain relative-from-page), tokenizes hex/fonts/image URLs into brand-overridable tokens, emits the theme contract files (`theme.json`, `pages.ts`, `shell.tsx`, `tokens.ts`, `context/`), and writes a `CLONE_FOLLOWUPS.md` listing what Phase 8 still needs to handle (workspace packages, `hooks/`, `data/` rewiring, direct `fetch('/api/...')`). Flags: `--source`, `--target`, `--apps`, `--name`, `--description`, `--no-tokenize`, `--dry-run`. | Mode B (required) |
| `tools/scaffold-theme.mjs` | _Deprecated for Mode B as of 2026-05-26._ Was the previous Mode B core — clone-and-edit scaffolder that cloned `springalls-classic` and applied DNA. Retained for retrospective use; Mode B now uses `clone-app-to-theme.mjs`. | (deprecated) |
| `tools/scaffold-theme-skeleton.mjs` | Skeleton-first scaffolder. Used by Mode A — produces ONLY contract + plumbing (~39 files), strips visual layer for Phase 8 fresh design. | Mode A |
| `tools/build-preview-from-theme.py` | Optional Phase 13a helper. Registers a preview brand against a theme via `backend.services.preview.upsert_preview` (same path the dashboard `/create` POST takes). Flags: `--theme-id`, `--brand-name`, `--slug`, `--domain`, `--dna`, `--automation`, `--overwrite`. On Windows uses `sys.stdout.reconfigure(errors='replace')` to survive emoji output from `app.py` import. Exits 0 with preview URL on stdout; 2 if slug collides; 3 on persistence failure. | Both modes (optional) |
| `npm run theme:sync` | Auto-discovers themes, regenerates registries + manifest. Run automatically by `.github/workflows/deploy.yml` on every prod deploy so new themes wire into the dashboard's `/create` picker without manual steps. | Both modes |

---

## Session-learned fixes (auto-wow-uk-bespoke, 2026-06-08) — bake into every future theme

These came up during Columbus Vehicles preview review. Every new theme must ship with these patterns from Phase 8.

### 1. Dark-section `<header>` must own typography locally — never reuse global utility classes

When a section uses a `<header>` inside an explicitly dark band, the `<header>` JSX must NOT contain `<p class="auto-eyebrow">` / `<h2 class="auto-section-title">` / `<p class="auto-section-lead">`. The global cascade leaks a mystery white surface and the title goes invisible. Pattern:

```tsx
// Wrong:
<header className={styles.header}>
  <p className="auto-eyebrow">Customer reviews</p>
  <h2 className="auto-section-title">Verified feedback from real buyers.</h2>
</header>

// Right — local typography in the module CSS:
<header className={styles.header}>
  <span className={styles.eyebrow}>
    <span className={styles.eyebrowMark} aria-hidden="true" />
    Customer reviews
  </span>
  <h2 className={styles.title}>Verified feedback from real buyers.</h2>
</header>
```

Belt-and-braces in base.css: `.<section-class> header { background: transparent !important; box-shadow: none !important; }` scoped to the theme's section utility class — defensive net for future sections.

### 2. Footer butts against last section — no margin-top gap

`margin-top` on `<Footer>` exposes the page bg, which on light-brand records (Columbus has `--color-bg: #ffffff`) leaks as a white strip between the last dark section and the dark footer. Use only `padding` inside the footer; let it sit flush against `<main>`.

### 3. Listing pages get NO hero (or a slim header strip max)

Inventory / wishlist / compare / recently-sold pages: cards must be near the fold. Either skip the page-hero entirely or use a slim `.auto-listings-header` strip (~60–80px tall) with crumb + h1 only. NEVER the tall `auto-page-hero` with background image, big padding, and lead paragraph. Marketing pages (about / services / finance / part-exchange / sell-your-car / contact) keep the tall hero — that's the right treatment there.

### 4. CtaBanner ghost buttons need explicit overrides for contrast

On full-bleed banners with brand-tinted gradient overlays, the global `.auto-btn--ghost` rule's faint cascade is too weak. Module override per banner — natural-role tokens, frosted backdrop carries the contrast:

```css
.cta:global(.auto-btn--ghost) {
  background: color-mix(in srgb, var(--color-text) 12%, transparent);
  border-color: color-mix(in srgb, var(--color-text) 60%, transparent);
  color: var(--color-text);
  backdrop-filter: blur(8px);
}
.cta:global(.auto-btn--ghost):hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-bg);
}
```

### 5. Hero / section title — no `max-width` clamp

Per existing memory (`feedback_no_max_width_on_titles`): drop ALL `max-width` caps on `h1` / `.title` elements. Let `text-wrap: balance` + `clamp()` font-size handle line breaking. `max-width: 28ch` on titles produces ugly 4-line stacks of 2 words.

### 6. Footer "Visit Us" — pull today's opening hours from `brand.openingHours`

Don't ship "Contact us for today's opening hours" as static fallback. Read `brand.openingHours[<weekday>]` and render `Today: <hours>` / `Closed today` / `Open by appointment` based on what's set. Single helper at the top of `Footer.tsx`.

### 7. AOS attrs are dead weight unless AosProvider is wired

The skeleton scaffolder emits `data-aos="..."` on section eyebrows/titles. Without `<AosProvider />` in the Shell, those attrs do nothing AND in some themes have been associated with the white-block bug. Either wire AosProvider OR strip the attrs from JSX. Default: strip them — animations are easy to add later, dead attrs are easy to overlook.

### 8. Natural-role tokens only — no inversion, no locked theme literals (FINAL: settled 2026-06-09)

`background: var(--color-text)` and non-CTA `color: var(--color-bg)` are **FORBIDDEN**. `var(--color-bg)` is always a surface. `var(--color-text)` is always a foreground. The rugged-dark archetype's locked-dark identity dies for light-brand records — that's the explicit trade-off Difatha accepted.

This rule has flip-flopped four times. The current direction is final. If a future review says "the rugged theme should stay dark for every brand", the only valid response is: ask the platform team to add a 9th dashboard picker. Do NOT reintroduce `--t-feature-*` tokens. Do NOT reintroduce inverted-role.

Forbidden by Phase 10c audit:
- `background:.*var\(--color-text\)` — anywhere
- `color:.*var\(--color-bg\)` — except when the same rule sets `background: var(--color-primary)` or `background: var(--color-secondary)` (CTA-style filled brand-surface exception)
- Hex / rgba color literals in component CSS (`color-mix` over `var(--color-*)` instead). Photo-chrome scrims excepted with a comment.
- `--t-*` token definitions with literal hex values (status tokens `--t-success` / `--t-error` excepted).

### 9. Chrome layout — brand-color bands for header topbar + footer (default for rugged archetype)

Header topbar, footer body, and footer bottom strip use **filled brand-color surfaces**, paired against `var(--color-bg)` as foreground (legitimate CTA-style exception):

| Surface | Background | Foreground |
|---|---|---|
| Header `.topbar` (contact strip) | `var(--color-secondary)` | `var(--color-bg)` + alpha variants |
| Header `.header` (main nav) | `var(--color-bg)` | `var(--color-text)` |
| Footer `.footer` (body) | `var(--color-primary)` | `var(--color-bg)` + alpha variants |
| Footer `.bottomBar` (copyright strip) | `var(--color-secondary)` | `var(--color-bg)` + alpha variants |

Pattern rules for these bands:
- All inner copy (wordmark, headings, body, links, nav, icons) → `color: var(--color-bg)` or `color-mix(... var(--color-bg) NN%, transparent)` (80% for primary text, 86% for footer-bottom legal links, 88% for topbar chips)
- Heading underline accents (`h2::after`) → `var(--color-bg)` (NOT `var(--color-primary)` — invisible on primary surface)
- Social icon pills → `color-mix(... var(--color-bg) 14%, transparent)` bg, `var(--color-bg)` glyph; hover INVERTS to `var(--color-bg)` pill + brand-color glyph
- No `box-shadow`, no `border-bottom` separators between these bands — let the brand-color polarity carry the visual seam
- Top accent strip above footer (if used) → white-fading gradient (`linear-gradient(90deg, var(--color-bg), color-mix(... var(--color-bg) 60%, transparent), transparent)`)
- "Site by Carous Limited" link in footer-bottom → `var(--color-bg)` with `text-decoration: underline; text-underline-offset: 3px;` (was `var(--color-primary)` — invisible on a primary/secondary surface)

For Columbus's brand record where primary == secondary (`#CC0F48`), the topbar + footer + footer-bottom all render the same red — a unified branded chrome. For brands with distinct primary/secondary hues, the three bands show as a layered brand-color story.

Scaffolder default: emit Header + Footer with this layout from Phase 7. The Section bgs stay plain `var(--color-bg)` (don't tint sections with brand colors — Difatha rejected that in the same session).
