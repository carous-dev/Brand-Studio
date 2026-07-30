# 05 — Featured stock (latest arrivals)
id: featured-stock
files: components/FeaturedStock.tsx, components/FeaturedStock.module.css
depends-on: vehicle-card, proof-ledger

## Purpose
Puts real cars on the homepage fast — six current arrivals with a clear path
to the full showroom, immediately after trust is established.

## Unique move
The section header is a **ledger-style title line**: eyebrow + sentence-case
serif title on the left, and on the right a hairline that runs from the
title's end to a serif "View all cars →" link — the rule literally connects
the title to the action (one flex row: title, 1px flex-1 rule, link). No
sibling theme draws its section headers this way; the motif recurs on
aftercare-suite and reviews for internal consistency.

## Adjacency contract
- Above: proof-ledger (`surface`, single bottom hairline). This section is
  `bg` — no top border of its own.
- Below: aftercare-suite (`surface`). Ends clean on `bg`.
- Promises: exactly 6 cards fetched (limit=6, latest arrivals via
  `/api/inventory?brand=<slug>&limit=6` with `getBrandSlugFromRequest`).

## Layout
- **360 (base CSS, verify at 505):** title line (rule hidden ≤640 — title
  above, "View all cars →" below as its own row, left-aligned); cards as a
  horizontal scroll-snap RAIL showing ~1.15 cards (compact variant), snap
  mandatory, no cramped 2-col grid.
- **768:** 2×3 grid (standard cards), title line gains the connecting rule.
- **1024:** 3×2 grid.
- **1440:** container 1200px; grid stops growing.

## Tokens
- Section: `background: var(--color-bg); color: var(--color-text)`.
- Eyebrow: `color: var(--color-primary)`; title: `var(--color-text)`.
- Connecting rule: `background: var(--color-border)` (1px tall div) — or
  border-top on a spacer; either way border token only.
- Link: `color: var(--color-primary)`; hover underline.
- Cards bring their own surface tokens.

## States
- Empty inventory: render the title line + a quiet empty note
  (`featured.empty`) on muted — never a broken grid.
- Loading: 6 skeleton cards (VehicleCard skeleton).
- Rail scroll (mobile): native momentum + `scroll-snap-type: x mandatory`;
  no arrows.

## Copy keys
- `featured.eyebrow` → "Just arrived"
- `featured.title` → "The latest cars to join us"
- `featured.view_all` → "View all cars"
- `featured.empty` → "New arrivals are being prepared — check back shortly."

## Acceptance criteria
- AC1 (unique move): 1024 screenshot shows the hairline running between the
  title and the "View all cars →" link in one row.
- AC2 (mobile): at 505px cards render as a scroll-snap rail (~1.15 cards
  visible, horizontal overflow scrolls, page itself has NO x-overflow).
- AC3: exactly 6 cards at 1024 (3×2); fetch limit matches cell count (grep
  `limit=6`).
- AC4 (tokens): no hex literals (grep); section is `--color-bg` and sits
  between two `--color-surface` bands in the full-page shot (alternation
  visible).
- AC5 (adjacency): no border-top on this section (ledger owns the rule
  above); gap to ledger equals section rhythm.
- AC6: "View all cars" href is `/used-cars` (grep).
