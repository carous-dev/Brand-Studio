# 04 — Proof ledger (signature band)
id: proof-ledger
files: components/ProofLedger.tsx, components/ProofLedger.module.css
depends-on: hero

## Purpose
Converts the dealer's real credibility (awards, review score, scale,
aftercare) into the page's second impression — structured proof instead of
badge clutter, for buyers who need a reason to trust an independent.

## Unique move
THE signature: a full-width **ledger** with a double-hairline top rule.
Four entries, each led by an oversized oldstyle EB Garamond numeral
("01"–"04", title size, `var(--color-primary)`) above a serif-caps
letterspaced label and a one-line Lato detail. Desktop: 4 columns separated
by vertical hairlines. Mobile: stacked full-width rows with horizontal
hairlines — reading like lines in a guest ledger. No icons, no badges, no
cards.

## Adjacency contract
- Above: hero on `bg`. Ledger opens with the theme's ONLY double-hairline
  (two 1px `--color-border` rules 4px apart, full-bleed width).
- Below: featured-stock on `bg`; ledger closes with a single hairline.
- Promises: this is the only numbered-ledger element on the route
  (design-language do-not §5); reused verbatim on /about only.

## Layout
- **360 (base CSS, verify at 505):** stacked rows; each row is a 2-col grid:
  numeral left (fixed 3.5rem column), label + detail right; horizontal
  hairline between rows; section padding compact (`clamp` low end). All four
  entries visible — no truncation.
- **768:** 2×2 grid, hairlines both directions (vertical rules via borders
  on cells, collapsed edges — no double lines).
- **1024:** single row of 4 columns, vertical hairlines between; entries
  top-aligned.
- **1440:** container 1200px; column gaps stop growing.

## Tokens
- Section: `background: var(--color-surface); color: var(--color-text)`.
- Numerals: `color: var(--color-primary)` (on surface — AA-checked pair in
  palette).
- Labels: `color: var(--color-text)`; details: `color: var(--color-muted)`.
- All rules: `var(--color-border)`. No other colors; no backgrounds inside
  entries.

## States
- AOS: entries `fade` with 60ms stagger (≤720px disabled). No hover states —
  the band is not interactive (no links; keeps calm).
- If a recipe slot resolves empty: entry renders with its generic fallback,
  never collapses the grid (fixed 4 entries).

## Copy keys
- `ledger.title_sr` → "Why buy from us" (visually-hidden h2 for semantics)
- `ledger.1_label` → "Award-winning" / `ledger.1_detail` → "Recognised by
  the motor trade for how we look after our customers."
- `ledger.2_label` → "Rated by drivers" / `ledger.2_detail` → "Thousands of
  verified reviews from happy owners."
- `ledger.3_label` → "Real choice" / `ledger.3_detail` → "A forecourt full
  of prepared, workshop-checked cars at every budget."
- `ledger.4_label` → "Aftercare on site" / `ledger.4_detail` → "Servicing,
  bodywork and valeting under the same roof."
- Numerals "01"–"04" are presentational literals, not copy keys.

## Acceptance criteria
- AC1 (unique move): 1024 screenshot shows 4 columns, primary-colored serif
  numerals 01–04, vertical hairlines between entries, double-hairline top
  edge; no icons/badges/cards present.
- AC2 (mobile): at 505px entries stack as full-width hairline-separated rows
  with the numeral in a fixed left column; nothing hidden.
- AC3 (tokens): no hex/rgb literals in ProofLedger.module.css (grep); band
  reads correctly on the light throwaway brand (numerals visibly tinted,
  text AA on surface).
- AC4 (adjacency): full-page 1024 shot shows the double hairline only here
  (hero above ends clean; featured-stock below has no top rule of its own).
- AC5: all copy via resolveText keys above (grep: no award names, review
  counts, "300", or dealer geography literals in TSX).
- AC6: no interactive elements inside the band (grep: no <a>/<button> in
  ProofLedger.tsx).
