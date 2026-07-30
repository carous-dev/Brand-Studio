# 03 — Vehicle card (grid, compact/rail, sold variants)
id: vehicle-card
files: components/VehicleCard.tsx, components/VehicleCard.module.css
depends-on: none (consumed by featured-stock, inventory, detail similar rail, wishlist, recently-sold)

## Purpose
The unit of scanning for a 300-car supermarket: photo, price, and the four
facts a UK buyer triages on (year plate, mileage, fuel, gearbox) — tappable
as one whole target.

## Unique move
The price sits in a **ledger footline**: a full-width hairline-topped row at
the card's base with the price in EB Garamond 600 (title-size at ~1.25rem
scale within card) on the left and a quiet serif-caps "View" affordance on
the right — echoing the proof-ledger rule motif. No badge blobs, no shadow;
siblings all use bold-sans price stacked under the title.

## Adjacency contract
- Above/Below: grid siblings — card heights equalize because specs are a
  fixed 2-col grid and the title is single-line ellipsis.
- Promises: card is `background: var(--color-surface)` with 1px
  `var(--color-border)` and 6px radius, works on both `bg` and `surface`
  section parents (hairline provides separation on same-token parents).

## Layout
- **360 (base CSS, verify at 505):** full-width card: image (aspect 4/3,
  cover/center/no-repeat, LIGHT fallback `var(--color-surface)` +
  `var(--color-muted)` glyph), wishlist+compare glyphs 22×22 top-LEFT over
  photo (transparent, primary-tinted, no bg/border), body: title (single
  line ellipsis, subtitle size, NO year badge), spec grid 2-col (year plate,
  mileage, fuel, gearbox — Lato caption size, muted), ledger footline with
  price + "View". Whole card clickable via stretched `.cardLink`.
- **768:** 2-up in grids.
- **1024:** 3-up; hover state active.
- **1440:** card max ~420px wide inside grid; image never upsizes past
  640px source (optimizeImageUrl card width 640).
- Compact/rail variant (`compact` prop): identical, CTA-free (there are no
  separate CTA buttons anyway — "View" affordance stays), specs+price kept.
- Sold variant (`sold` prop): photo `filter: grayscale(1)`, SOLD stamp
  (serif caps letterspaced, `background: var(--color-primary); color: var(--color-on-primary)`,
  small rotated -4° plate top-right), price struck-through and muted,
  wishlist/compare glyphs hidden, `.cardLink` inert (no navigation) or
  links allowed but footline reads "Sold" instead of "View".

## Tokens
- Card: `background: var(--color-surface); color: var(--color-text);
  border: 1px solid var(--color-border)`.
- Spec labels/values: `color: var(--color-muted)` on the same surface.
- Price: `color: var(--color-text)`; footline hairline `var(--color-border)`.
- "View" affordance + glyph icons: `color: var(--color-primary)`.
- No shadows (design-language §5). Image fallback pairs
  surface + muted.

## States
- hover (≥1024): border-color → `color-mix(in srgb, var(--color-primary) 40%, var(--color-border))`;
  image scales 1.02 (300ms; off under reduced motion); "View" gains 2px
  underline.
- focus-visible on `.cardLink`: 2px primary outline around the whole card.
- Wishlist active: glyph fills solid `var(--color-primary)`; count updates
  via `useGarage()`.
- loading: skeleton block matches 4/3 image + three text bars, on
  surface/border tokens only.
- Missing price: footline shows `card.poa` instead — never "£0".

## Copy keys
- `card.view` → "View"
- `card.sold` → "Sold"
- `card.poa` → "Price on request"
- Spec labels come from data (year/mileage/fuel/transmission), formatted
  UK-style ("42,000 miles").

## Acceptance criteria
- AC1 (unique move): screenshot shows the hairline-topped ledger footline
  with serif price left + serif-caps "View" right; grep confirms no
  price-badge overlay on the photo.
- AC2: title is single-line ellipsis at 505 and 1024 (long-title fixture);
  NO year badge anywhere on the card.
- AC3 (build rules): image area `aspect-ratio: 4/3` with light fallback bg;
  inline backgroundImage declares cover/center/no-repeat (grep); specs are a
  2-col GRID (grep `grid-template-columns` in `.cardSpecs`), chips capped
  ≤3 via `:nth-child(n+4){display:none}` where chip rows exist.
- AC4 (tokens): zero hex/rgb literals and zero box-shadow in
  VehicleCard.module.css (grep); card legible in light-brand screenshot.
- AC5: stretched `.cardLink` present (grep) — tapping anywhere on the card
  at 505px navigates to `/used-cars/<slug>`.
- AC6 (sold): sold-variant screenshot shows grayscale photo, primary SOLD
  plate, struck price, and NO wishlist/compare glyphs.
- AC7 (mobile): at 505px card is full-width single column; glyph targets
  have ≥44px effective tap area (padding) despite 22×22 render.
