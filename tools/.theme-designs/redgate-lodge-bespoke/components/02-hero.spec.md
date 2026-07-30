# 02 — Hero (split, claret-matted framed photo right)
id: hero
files: components/Hero.tsx, components/Hero.module.css
depends-on: header

## Purpose
Answer "am I in the right place?" in two seconds: a warm, confident welcome
plus ONE route into stock — for a buyer who may be on a phone in a hurry.

## Unique move
The hero photo is a contained **framed figure**: the image sits on `bg` with
a solid primary-tint mat panel offset 16px down-right behind it plus a 1px
border hairline on the image itself — like a matted picture in a hallway.
Text never overlaps the photo, so the hero needs no scrim and survives any
palette. No sibling theme frames its hero photo; all others full-bleed it.

## Adjacency contract
- Above: sticky nav row (bg + hairline). Hero starts on `bg`; top padding
  `clamp(2.5rem, 6vw, 4.5rem)`.
- Below: proof-ledger band (`surface`, double-hairline top edge). The hero
  ends clean on `bg` with NO assurance strip and NO stats — credentials are
  the ledger's job (do-not §5 in design-language).
- Promises: exactly one `<h1>` on the page; bottom padding
  `clamp(2.5rem, 6vw, 4.5rem)` so the ledger's double hairline reads as a
  deliberate rule, not a crash.

## Layout
- **360 (base CSS, verify at 505):** single column: eyebrow → h1 (display
  clamp, ≤2 lines) → lead (body, `text-wrap: pretty`) → ONE full-width
  primary CTA "Browse the showroom" (`/used-cars`) → framed photo below
  (aspect 4/3, mat offset REDUCED to 8px, still visible). Ghost CTA hidden
  ≤480px.
- **768:** two columns 55/45 (text | photo); ghost CTA "Book a visit"
  (`/contact`) appears inline after the primary CTA; mat offset 16px.
- **1024:** same structure, photo min-height 420px (object-fit cover via
  layered `background-image`), text vertically centered.
- **1440:** container caps at 1200px; photo stops growing; whitespace grows.

## Tokens
- Section: `background: var(--color-bg); color: var(--color-text)`.
- Eyebrow: `color: var(--color-primary)` (serif caps letterspaced role).
- Mat panel: `background: color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))`
  — no foreground needed (decorative, `aria-hidden`).
- Photo frame: `border: 1px solid var(--color-border)`; light fallback bg
  behind image `var(--color-surface)` paired with `var(--color-muted)`
  placeholder text if image missing.
- Primary CTA: `background: var(--color-primary); color: var(--color-on-primary)`.
- Ghost CTA: `border: 1px solid var(--color-border); color: var(--color-text); background: transparent`
  (inherits section bg pairing); hover `border-color: var(--color-primary)`.

## States
- CTA hover: primary darkens via `color-mix(… 85%, var(--color-text))`;
  focus-visible 2px primary outline offset 2px.
- Photo hover: none (no zoom in hero — calm).
- Missing image: layered `background-image: url(brand.heroImage), url(brand.images.hero), url(/themes/redgate-lodge-bespoke/hero-default.jpg)`
  so a 404 reveals the theme default; mat still renders.
- Reduced motion: AOS fade-up off.

## Copy keys
- `hero.eyebrow` → "Independent used cars"
- `hero.title` → "A warmer way to buy your next car"
- `hero.lead` → "Hundreds of prepared, workshop-checked cars — with the
  team, servicing and aftercare to look after you long after you drive away."
- `hero.cta_primary` → "Browse the showroom"
- `hero.cta_secondary` → "Book a visit"

## Acceptance criteria
- AC1 (unique move): at 1024 the photo shows the offset primary-tint mat
  panel behind its bottom-right edges plus a 1px hairline on the image; text
  column never overlaps the photo.
- AC2: hero contains exactly 1 eyebrow, 1 h1 (≤2 lines at 505 AND 1440), 1
  lead, ≤2 CTAs, and ZERO search cards / chip rows / stat clusters
  (screenshot + grep for input/select inside Hero.tsx = none).
- AC3 (mobile): at 505px hero is single-column, primary CTA full-width and
  ≥44px tall, ghost CTA hidden ≤480px, photo below text with mat offset 8px.
- AC4 (tokens): no hex/rgb literals and no gradient in Hero.module.css
  (grep); CTA legible in light-brand screenshot (on-primary pairing).
- AC5: h1 uses `text-wrap: balance` (grep) and has NO `max-width` (grep on
  title selectors).
- AC6 (adjacency): 1024 full-page shot shows hero `bg` meeting the ledger's
  double hairline with balanced breathing room (hero bottom padding ≈ ledger
  top padding); no duplicate credential/stat content inside the hero.
- AC7: `background-image` layers brand.heroImage first, theme default last
  (grep order in Hero.tsx).
