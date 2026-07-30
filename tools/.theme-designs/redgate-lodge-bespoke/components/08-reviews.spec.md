# 08 — Reviews (featured quote + supporting pair)
id: reviews
files: components/Reviews.tsx, components/Reviews.module.css
depends-on: px-invite

## Purpose
Social proof for cautious buyers: one memorable customer voice given real
typographic weight, backed by an aggregate score line — not a carousel of
interchangeable star cards.

## Unique move
**One featured quote set in EB Garamond at title size** (sentence case,
hanging punctuation open-quote in primary), attributed with a small-caps
serif name — flanked (desktop) by two quiet supporting quotes at body size
separated by vertical hairlines. Reads like a guest book spread, not a
testimonial widget. Sibling themes all do card grids/carousels.

## Adjacency contract
- Above: px-invite (primary band) on `/`; ledger-steps (`surface`) on
  /sell-my-car. Section is `bg` — hue/token break, no rule.
- Below: visit-lodge (`surface`) on `/`; footer chain on /sell-my-car.
- Promises: static recipe-driven content (no API); exactly 3 quotes.

## Layout
- **360 (base CSS, verify at 505):** ledger-style title line (rule hidden);
  featured quote full-width; score line under it (aggregate text, e.g.
  "Rated excellent by our customers"); supporting quotes STACK below,
  separated by horizontal hairlines; attribution right-aligned per quote.
- **768:** featured quote spans full width; supporting pair side-by-side
  below with a single vertical hairline between.
- **1024:** 3-col grid — supporting | featured (2fr, center) | supporting,
  vertical hairlines between columns; featured visually dominant.
- **1440:** container 1200px.

## Tokens
- Section: `background: var(--color-bg); color: var(--color-text)`.
- Open-quote glyph + score accent: `color: var(--color-primary)`.
- Featured quote text: `var(--color-text)`; supporting quotes + attributions:
  `var(--color-muted)`; hairlines: `var(--color-border)`.

## States
- AOS fade-up once for the whole section (no per-quote stagger — calm).
- No interactivity, no hover states.

## Copy keys
- `reviews.eyebrow` → "From the guest book"
- `reviews.title` → "What our customers say"
- `reviews.score_line` → "Rated excellent by thousands of verified drivers"
- `reviews.featured_quote` → "From the first phone call to driving away,
  nothing felt like a hard sell — just genuinely helpful people."
- `reviews.featured_name` → "A happy customer"
- `reviews.quote_2` / `reviews.quote_2_name` → "The car was immaculate and
  exactly as described." / "Verified buyer"
- `reviews.quote_3` / `reviews.quote_3_name` → "They collected my old car
  and sorted everything. Effortless." / "Verified buyer"

## Acceptance criteria
- AC1 (unique move): 1024 screenshot shows the large serif featured quote
  center at ~2× the supporting quotes' size, primary open-quote glyph,
  vertical hairlines — and NO cards, stars-row widgets, or carousel controls
  (grep: no button/scroll logic in Reviews.tsx).
- AC2 (mobile): at 505px quotes stack with horizontal hairlines; featured
  quote still visibly larger (title size holds ≥1.5rem).
- AC3 (tokens): zero hex; primary appears ONLY on the quote glyph and score
  accent (screenshot on both palettes).
- AC4 (adjacency): on `/`, section reads as a calm `bg` pause between the
  primary px-invite band and the `surface` visit-lodge band.
- AC5: within the 5-size scale — featured quote reuses the `title` slot, no
  new font-size introduced (grep distinct font-size count in module ≤4).
