# Theme archetype design specs

The `/new-theme` skill picks an archetype based on the dealer logo's character
(see SKILL.md Phase A2b). The scaffolder always clones the same working
baseline (`springalls-classic`), and Phase 8 of the skill **redesigns
distinctive components** per the spec below. The result is genuinely
different themes — different hero patterns, section composition, card
layouts, decorative language — not just a recolor.

Every spec is a contract with Claude: in Phase 8, follow it. Don't
"simplify" or default to springalls-classic's layout — that's the
regression pattern (see `feedback_skill_no_regression.md`).

Archetype IDs match `tools/scaffold-theme.mjs::ARCHETYPE_TO_TEMPLATE`.

> **Distinctiveness layer (added 2026-05-25):** the archetype is the
> design *neighbourhood*; the **Signature Concept** chosen in SKILL Phase
> A2e is the *building*. Two themes can share an archetype and still be
> visually unrelated if their signature moves, section composition, hero
> patterns, and header structures don't collide. The archetype menu
> below was expanded from 5 to 8 (split `classic` into `classic-trad` /
> `classic-warm`; added `minimalist`, `industrial`, `editorial`) so the
> default catch-all isn't dominant. The fingerprint registry
> (`tools/.theme-fingerprints.json`) enforces no-collision per the rules
> in SKILL §"Distinctiveness contract".

## Archetype catalogue at a glance

| Archetype | Logo character that maps here | Vibe one-liner |
|---|---|---|
| `classic-trad` | `classic-serif`, traditional sans | Trustworthy, conventional, family-run forecourt |
| `classic-warm` | `humanist-sans`, friendly sans | Warm, approachable, neighbourhood dealer |
| `modern` | `modern-sans`, `geometric-tech` | Tech-forward, clean lines, urban showroom |
| `minimalist` | `geometric-tech` with tight letterspacing, single-weight wordmarks | Whitespace-first, near-monochrome, magazine-grid restraint |
| `industrial` | `condensed-bold`, mechanical sans | Workshop / commercial / van dealer — gridded, utilitarian |
| `editorial` | `transitional-serif`, `humanist-sans` mixed | Long-form storytelling, byline strip, lead-image journalism |
| `rugged` | `condensed-bold`, `display-bold` | 4×4 / performance / dealer-signage, dark mode |
| `luxury` | `luxury-serif`, `script` | Restrained premium, generous white space, hushed |
| `prestige` | `display-bold` + serif body, magazine-mixed | Supercar editorial, asymmetric, mixed media |

Ambiguous / generic logos now default to `classic-warm` (NOT the
no-redesign-needed `classic-trad`) so the "catch-all" outcome still gets
a real redesign cycle. See SKILL Phase A2d for the full mapping table.

---

## classic-trad

**Logo character that maps here:** `classic-serif`, traditional condensed sans.
**Vibe:** trustworthy, family-run, conventional dealer signage.
**Reference dealer types:** established independent used-car dealers,
multi-generation family lots, town-centre showrooms.

**Layout:**
- Hero: centered headline + lead, search dropdowns below, full-bleed
  background image with dark overlay.
- Header: white background, centered logo on mobile, horizontal nav on
  desktop. Sticky on scroll.
- Section composition (homepage): Hero → TrustSignals → LatestArrivals
  (carousel) → ServiceHighlights → Services → CTA → Reviews → Directory.
- Cards: rounded corners (12–14px), soft shadow, image-top + body-below.
- Typography: ~16px body, ~clamp(2rem, 4vw, 3rem) hero headline.

This was the original "classic" archetype — `springalls-classic`
implements it. **Phase 8 still designs fresh per the Distinctiveness
contract** — pick a different signature move (the centered-headline +
search-below combo is already taken) so this theme doesn't ship as
"springalls-classic in a different palette".

---

## classic-warm

**Logo character that maps here:** `humanist-sans`, friendly rounded sans, ambiguous.
**Vibe:** warm, approachable, neighbourhood dealer.
**Reference dealer types:** family-run dealers with a soft brand voice,
mixed-stock independents, dealers who emphasise after-sale care.

**Layout — must be materially different from classic-trad:**
- Hero: large warm photo of the forecourt or dealer team (NOT a stock
  car shot), headline left-aligned with a personal-tone lead ("Helping
  Birmingham families find the right car since 1992"). One primary
  CTA + a "Speak to our team" ghost link with a small avatar cluster.
- Header: cream / off-white background (`#fbf8f3`-ish, theme-tinted),
  rounded buttons (12–16px radii), nav links larger than usual (17px)
  to feel less corporate.
- Section composition (homepage): Hero → Founder/team note (1-column
  centered narrative + small photo) → LatestArrivals (grid, 3-up) →
  Services (warm icon set, hand-drawn feel optional) → "Why <city>
  buyers choose us" (review pull-quotes, 2-up) → Recently Sold preview
  → CTA → Directory.
- Cards: generous radii (14–18px), pastel border-tinted from the
  brand-primary at low opacity, lots of breathing room.
- Typography: serif headings paired with humanist sans body; body 17px
  for readability; hero headline `clamp(2.2rem, 4.4vw, 3.4rem)`.

**Components Phase 8 must redesign:**
- `components/Hero.tsx` — warm photo with avatar cluster + personal lead
- `components/Header.tsx` — cream background, rounded buttons
- `pages/home/page.tsx` — founder note section, Why-<city> pull-quotes
- `components/FounderNote.tsx` (NEW) — single-column narrative + photo

---

## modern

**Logo character that maps here:** `modern-sans`, `geometric-tech`.
**Vibe:** technology-forward, urban, clean lines, generous white space.
**Reference dealer types:** progressive dealers, tech-forward franchises,
urban showrooms.

**Layout — must be materially different from classic:**
- Hero: **split-screen** layout (50/50 on desktop, stacked on mobile).
  Left: large display headline + 1-line lead + primary CTA + secondary
  link, all left-aligned. Right: full-bleed hero photo with NO overlay
  (image stands alone). Search bar moves OUT of the hero into a
  standalone strip directly below.
- Header: thin (60px), sticky transparent at top, solid white on scroll.
  Logo left, nav right, no centered alignment. Mobile: full-screen
  overlay nav (not a side drawer).
- Section composition (homepage): Hero → SearchStrip → ServiceHighlights
  (icon-grid, 4 columns desktop) → LatestArrivals (3-up grid, NOT
  carousel) → CtaSection (full-width with `--brand-image-finance`
  background) → Reviews (asymmetric quote cards) → Directory.
- Cards: minimal, 8px corners, no shadow (border-only), image-top with
  6:4 aspect ratio enforced. Price + key spec on one line below title.
- Typography: 17–18px body for readability, hero headline
  `clamp(2.5rem, 5vw, 4.5rem)`, font-weight 700 on display copy.
- Decorative accents: thin colored top-border on alternating sections,
  CTA section uses subtle gradient overlay on top of the image.

**Components Phase 8 must redesign:**
- `components/Hero.tsx` — split-screen layout
- `components/Header.tsx` — thin sticky-transparent
- `pages/home/page.tsx` — section order, drop the carousel
- `components/LatestArrivalsSection.tsx` — switch from carousel to 3-up
  grid using CSS Grid (`grid-template-columns: repeat(3, 1fr)` desktop)
- `components/ServiceHighlightsSection.tsx` — icon grid in 4 columns

**CSS classes to add scoped under `[data-theme-id='<id>']`:**
- `.modern-hero-split { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 4vw, 64px); }`
- `.modern-search-strip { background: var(--color-surface); border-block: 1px solid var(--color-border); padding: 16px 0; }`

---

## rugged

**Logo character that maps here:** `condensed-bold`, `display-bold`.
**Vibe:** durable, off-road, performance-oriented, dealer-signage feel.
**Reference dealer types:** 4×4 specialists (Columbus Vehicles, Land
Rover dealers), motorcycle dealers, performance car dealers.

**Layout — must be materially different from classic:**
- Hero: **dark mode** (`--color-bg: var(--color-text)` swapped for the
  hero section only). Full-bleed photo at 80vh on desktop, 60vh mobile.
  Headline is uppercase condensed-bold (Oswald/Bebas Neue) at
  `clamp(2.8rem, 6vw, 5.5rem)`, letter-spacing: 0.02em. Two pill CTAs
  side-by-side with strong color contrast.
- Header: dark mode by default (charcoal background, white logo + nav),
  flips to light when scrolling past the hero. Sharp 4px button radii
  (NOT pill). Status pills next to the logo: "Quality assured · Finance
  available · Nationwide delivery".
- Section composition (homepage): Hero → SpecsBar (4 stat cards: years
  in business, vehicles in stock, postcodes covered, rating) →
  LatestArrivals (full-width strip, 4-up grid, sharp corners, monochrome
  with status badge) → ServicesSection (dark band, white text) →
  RecentlySold preview (3 most recent sold cards with "SOLD" diagonal
  banner) → CTA (full-bleed image background with strong overlay) →
  Reviews → Directory (chip-style, dark mode).
- Cards: SQUARED corners (4–6px), bold border (2px) using
  `--color-border-strong`, IMG-zoom on hover. Price as the dominant
  element (larger than title), spec line in monospace if available.
- Typography: condensed-bold display family for ALL headings, body in
  geometric sans (DM Sans / Inter), generous letter-spacing on uppercase
  labels.
- Decorative accents: diagonal "SOLD" banners on RecentlySold, status
  badges on every card, sharp diagonal section dividers.

**Components Phase 8 must redesign:**
- `components/Hero.tsx` — dark-mode full-bleed, condensed display heading
- `components/Header.tsx` — dark-by-default with light-on-scroll
- `pages/home/page.tsx` — new SpecsBar section, RecentlySold preview
- `components/LatestArrivalsSection.tsx` — 4-up grid, sharp corners,
  monochrome treatment
- `components/RecentlySold.tsx` (NEW component if not exists) — 3-card
  preview with diagonal SOLD banner

**CSS classes to add:**
- `.rugged-hero { background: #0a0e14; color: #fff; min-height: 80vh; }`
- `.rugged-card { border: 2px solid var(--color-border-strong); border-radius: 4px; }`
- `.rugged-sold-banner { position: absolute; top: 12px; right: -28px; transform: rotate(35deg); background: var(--color-primary); color: #fff; padding: 6px 32px; font-weight: 700; letter-spacing: 0.1em; }`

---

## luxury

**Logo character that maps here:** `luxury-serif`, `script`.
**Vibe:** premium, restrained, magazine-editorial, white-space-heavy.
**Reference dealer types:** luxury brand dealers (Aston Martin, Bentley,
prestige-tier independents).

**Layout — must be materially different from classic:**
- Hero: **full-bleed photograph** at 100vh, with serif display headline
  in lower-left corner (NOT centered). Subtle vignette, no busy
  overlay. Search hidden behind a "Browse the collection" CTA — luxury
  visitors browse, they don't filter.
- Header: tall (96–120px), transparent at top with white text/logo,
  flips to white-bg with serif wordmark on scroll. Centered logo,
  symmetrical nav (3 items left, 3 items right).
- Section composition (homepage): Hero → Editorial Intro (1-column
  centered serif copy at ~640px max-width) → Featured Collection (2-up
  grid of large hero-style vehicle cards, alternating left/right image
  position) → Concierge Services (3 columns with serif headings + body)
  → Testimonial pull-quote (full-width, serif italic) → Reviews →
  Directory (small, refined).
- Cards: NO shadow, image dominant (80% of card height), title in serif
  italic below, price subtle (smaller than title).
- Typography: Playfair Display / Cormorant Garamond display, Montserrat
  body. Hero headline `clamp(2.5rem, 6vw, 5rem)`, body 17px with
  generous line-height (1.7). All-caps labels disabled — luxury reads
  in title-case.
- Decorative accents: thin gold horizontal rules between sections,
  generous vertical rhythm (96–128px section gaps), monochromatic
  photography preferred.

**Components Phase 8 must redesign:**
- `components/Hero.tsx` — full-bleed with corner-aligned serif display
- `components/Header.tsx` — tall, transparent-to-white, symmetrical
- `pages/home/page.tsx` — editorial-intro section, 2-up featured
  collection, pull-quote testimonial
- `components/FeaturedCollection.tsx` (NEW) — 2-up grid with alternating
  image positions

**CSS classes to add:**
- `.luxury-hero-display { position: absolute; bottom: clamp(32px, 8vw, 96px); left: clamp(20px, 5vw, 80px); font-family: 'Playfair Display', serif; font-style: italic; }`
- `.luxury-rule { width: 80px; height: 1px; background: var(--color-primary); margin: clamp(48px, 8vw, 96px) auto; }`

---

## prestige

**Logo character that maps here:** `display-bold` paired with serif body,
or any logo with a clear "magazine" feel (high-contrast, condensed
serifs, mixed media).
**Vibe:** editorial, supercar-magazine, asymmetric, mixed-media.
**Reference dealer types:** supercar dealers, ultra-prestige independents,
private collection brokers.

**Layout — must be materially different from classic:**
- Hero: **mixed media** layout. 60% of viewport is a large vehicle
  photograph; 40% is an asymmetric text block with a display-serif
  number ("Established 1987" or "Inventory: 47 prestige vehicles"),
  followed by a tagline + thin horizontal rule + two minimal text
  links. Background photo can be a video loop (if available) or a still.
- Header: minimalist top strip + a secondary editorial nav-bar below
  (think New York Times). Top strip has logo + 3 actions. Editorial
  nav has 8–10 categories ("Coupes", "Convertibles", "Track Cars",
  "Investment Pieces"). Mobile collapses both into a sidebar.
- Section composition (homepage): Hero → Inline date/edition strip
  ("Volume 23, Spring 2026") → 3-column editorial grid (lead story
  with large photo + 2 supporting stories with smaller photos, magazine
  feel) → Featured vehicle (1-column full-width with multi-image
  gallery + spec sidebar) → Pull quote → Recent acquisitions (5-card
  horizontal scrolling row) → Concierge / contact CTA.
- Cards: mixed sizes (NOT a uniform grid). Some span 2 columns, some 1.
  Images bleed to edges. Captions use small-caps serif italic.
- Typography: display headlines mix serif (Playfair Display Italic)
  and condensed sans (Anton, Oswald 600+) within the same composition.
  Body in transitional serif (Lora or Source Serif 4). Numerals use
  old-style figures where the font supports it.
- Decorative accents: thin gold rule above section titles, "Volume X"
  edition strip, byline-style attribution under every featured-vehicle
  block ("Curated by Columbus Vehicles · 2026 Spring Edition").

**Components Phase 8 must redesign:**
- `components/Hero.tsx` — mixed-media split, asymmetric text block
- `components/Header.tsx` — two-tier (action strip + editorial nav)
- `pages/home/page.tsx` — completely new section structure
- `components/EditorialGrid.tsx` (NEW) — magazine-style 3-column grid
- `components/FeaturedVehicleEditorial.tsx` (NEW) — multi-image gallery
  with spec sidebar
- `components/AcquisitionsRow.tsx` (NEW) — horizontal-scrolling 5-card row

**CSS classes to add:**
- `.prestige-edition-strip { font-family: 'Playfair Display', serif; font-variant: small-caps; letter-spacing: 0.18em; padding: 12px 0; border-block: 1px solid var(--color-border); }`
- `.prestige-editorial-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; }`
- `.prestige-pull-quote { font-family: 'Playfair Display', serif; font-style: italic; font-size: clamp(1.5rem, 3vw, 2.4rem); line-height: 1.4; max-width: 880px; margin: 0 auto; padding: clamp(48px, 8vw, 96px) 24px; }`

---

## minimalist

**Logo character that maps here:** `geometric-tech` with tight letter-
spacing, single-weight wordmarks, monolinear sans-serif logos with no
decoration.
**Vibe:** whitespace-first, magazine-grid restraint, near-monochrome.
**Reference dealer types:** EV-only specialists, premium-curated
boutique dealers, design-led independents who want their photography
to do the talking.

**Layout — must be materially different from modern:**
- Hero: large quiet headline left-aligned, single-line lead beneath,
  ONE photo to the right at a fixed 4:3 aspect — no decorative SVGs,
  no glow blobs, no gradient overlay. Brand color used ONLY on the CTA
  and a single 4px underline mark.
- Header: hairline 1px border-bottom, very thin (52px). Logo left,
  text-only nav right. No top contact bar (the contact info lives in
  the footer); status chip moves into a small footer-strip instead.
- Section composition (homepage): Hero → Compact spec table (4
  vehicles in a clean horizontal grid, no card chrome — just rows) →
  Editorial intro 1-column → ServicesGrid (4-up, text-only with a
  small icon glyph) → CTA (single sentence + button) → Footer.
- Cards: NO shadow, NO border, image only + title + price stacked
  beneath. Hover: subtle 4px lift, nothing flashy.
- Typography: ONE display weight (heavy), ONE body weight. Heading
  `clamp(2rem, 3.8vw, 3rem)`, body 16px with line-height 1.75.
- Decorative budget: zero. Brand color coverage ≤ 8% of pixel area.

**Components Phase 8 must redesign:**
- `components/Hero.tsx` — quiet two-column composition with single photo
- `components/Header.tsx` — hairline thin header
- `pages/home/page.tsx` — row-grid stock table, editorial intro
- `components/StockTable.tsx` (NEW) — row-grid layout, no card chrome

**Restraint note:** this archetype EXEMPTS the "motion is required"
clauses — minimalist themes can ship with ONLY entry fades and the
WhatsAppFab. Animated glow blobs, mfx-shimmer, mfx-text-glow are NOT
required (and should be avoided). Document in the fingerprint as
`oneBigMove: "decorative-density"` flipped to *minimum* (lower is the
big move).

---

## industrial

**Logo character that maps here:** `condensed-bold`, mechanical sans,
stencil-inspired wordmarks, logos with chevrons or arrows.
**Vibe:** workshop / commercial / van dealer — gridded, utilitarian,
no nonsense.
**Reference dealer types:** van and commercial-vehicle dealers, fleet
specialists, MOT/servicing-led dealers, agricultural dealers.

**Layout — must be materially different from rugged:**
- Hero: full-bleed photo BEHIND a heavy grid overlay (8×6 thin grid
  lines, brand-tinted at low opacity). Headline UPPERCASE
  monospace-feeling sans, large condensed numerals for any stat
  ("OVER 200 VANS IN STOCK"). Status chip uses a square indicator
  (NOT a pulse dot — too soft).
- Header: dark charcoal background by default, brand-color accent
  strip across the very top (3px), squared 0px corners on buttons,
  uppercase nav labels.
- Section composition (homepage): Hero → "Live stock by category"
  band (3-tile grid: Vans, Trucks, Cars, each tile a clickable
  category) → Compact list of 6 latest arrivals (NOT 3-up grid —
  dense list with image-left layout) → Workshop services (MOT, repairs,
  servicing) → Fleet enquiry CTA → Reviews → Directory.
- Cards: SHARP corners (0px), 1px hairline brand-color border, image
  + dense spec line + price in monospace.
- Typography: condensed display for headings (Oswald 700), monospace
  digits where applicable (IBM Plex Mono, Roboto Mono), body in
  geometric sans.
- Decorative accents: thin grid overlays on every section bg,
  category-tag badges in solid brand color, NO gradients (a single
  flat brand-tinted band per page).

**Components Phase 8 must redesign:**
- `components/Hero.tsx` — grid-overlaid hero with uppercase stat
- `components/Header.tsx` — dark charcoal + top accent strip
- `pages/home/page.tsx` — category band, compact list latest arrivals
- `components/CategoryBand.tsx` (NEW) — 3-tile category grid
- `components/CompactStockList.tsx` (NEW) — dense image-left rows

**CSS classes to add:**
- `.industrial-grid-overlay { background-image: linear-gradient(...), linear-gradient(...); background-size: 12.5% 16.66%; }`
- `.industrial-card { border-radius: 0; border: 1px solid var(--color-primary); }`

---

## editorial

**Logo character that maps here:** `transitional-serif` (Lora, Source
Serif), `humanist-sans` mixed with serifs, logos with both a wordmark
AND a lockup tagline.
**Vibe:** long-form storytelling, byline strip, lead-image journalism.
**Reference dealer types:** dealers with strong owner-story content,
heritage dealers, dealers who run a blog / buyer's guide alongside stock.

**Layout — must be materially different from prestige and luxury:**
- Hero: large lead image with a byline-style caption beneath ("Issue
  47 · This week at <Dealer>"), serif headline that's actually a sentence
  ("This week we drove a 1998 Defender across the Brecon Beacons. Here's
  what we found.") — narrative tone, NOT salesy.
- Header: top-strip with edition number + date ("Vol. 5, Issue 47 · 25
  May 2026"), main nav below — feels like a newspaper masthead. Logo
  in a serif wordmark, centered.
- Section composition (homepage): Hero → Editorial lead story (full-
  width image + long-form opening paragraph + "Read on" link) → 3-up
  "More stories from the showroom" cards (each card has a topic
  tag — "Buyer's Guide", "Maintenance", "Tested") → LatestArrivals
  (small 4-up grid, image-led, no chrome) → Reviews displayed as pull-
  quote letters with editorial framing → Directory (small at footer).
- Cards: NO shadow, image dominant, serif italic captions, byline-style
  attribution beneath each card ("Inspected by James, March 2026").
- Typography: transitional serif headings, sans body, italic for
  captions and quotes. Body 17px with generous line-height 1.7.
- Decorative accents: thin horizontal rules between sections, drop
  caps on lead paragraphs, marginalia-style sidenotes optional.

**Components Phase 8 must redesign:**
- `components/Hero.tsx` — lead image + byline caption + sentence headline
- `components/Header.tsx` — newspaper-masthead two-tier
- `pages/home/page.tsx` — editorial lead story + topic-tagged story cards
- `components/EditorialLeadStory.tsx` (NEW) — long-form opener
- `components/StoryCardGrid.tsx` (NEW) — 3-up topic-tagged cards
- `components/PullQuoteReview.tsx` (NEW) — editorial-framed review quote

**CSS classes to add:**
- `.editorial-byline { font-family: var(--font-body); font-size: 0.875rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-on-light-muted); }`
- `.editorial-dropcap::first-letter { font-family: var(--font-heading); font-size: 4em; float: left; line-height: 0.9; margin: 0 0.1em 0 0; }`

---

## How Phase 8 uses these specs

After scaffolding (which always clones springalls-classic for the working
baseline), the SKILL Phase 8 instructions tell Claude:

1. Pick the archetype the logo character maps to (recorded in the DNA's
   `notes.archetype` field).
2. Open this file (`docs/theme-archetype-specs.md`) and read the spec
   for that archetype.
3. Redesign the components listed under "Components Phase 8 must
   redesign", using the layout description and the CSS classes provided.
4. Update `pages/home/page.tsx` to match the section composition for the
   archetype.
5. Use the `--brand-image-*` CSS variables wired up by `BrandStyles.tsx`
   so dashboard edits to the dealer's image slots automatically swap in.

If the archetype calls for a NEW component (`FeaturedCollection`,
`SpecsBar`, `EditorialGrid`, etc.), create it under `components/` in the
new theme. Don't add it to `springalls-classic` — that's the baseline,
not the destination.

For the audit (`tools/audit-theme.mjs`) to pass on a redesigned theme,
follow the same Quality Bar (semantic HTML, mobile-first media queries,
no `useEffect` for initial data, brand-token discipline). Each archetype
spec above already accounts for this — e.g. rugged uses
`--color-border-strong` rather than a hardcoded `#000`.
