# 11 — Page ribbon (inner-page heading strip)
id: page-ribbon
files: components/PageRibbon.tsx, components/PageRibbon.module.css
depends-on: header

## Purpose
A modest, instant orientation strip for every inner route — tells the buyer
where they are without spending a photograph or 400px of viewport.

## Unique move
A **photo-free serif ribbon**: eyebrow, sentence-case serif page title, and
a short 48px-wide 2px primary rule UNDER the title (the theme's "wax seal"
line) — plus, in the slim variant, an inline result-count line where the
count numeral is set in EB Garamond primary (ledger numeral echo). Siblings
all use photo/overlay page heroes; this theme's inner pages open on quiet
paper.

## Adjacency contract
- Above: header nav row (`bg` + hairline). Ribbon is `surface` and supplies
  its own bottom hairline; the bg→surface change plus hairline reads as an
  intentional band.
- Below: varies per route (§7 flows); always ends on the hairline.
- Promises: single `<h1>` per page lives here on all non-home,
  non-detail routes.

## Layout
- **360 (base CSS, verify at 505):** top padding 56–96px total strip; eyebrow
  + title (page-title clamp `clamp(1.6rem, 4vw, 2.5rem)`, ≤2 lines) + seal
  rule; lead HIDDEN ≤480px; slim variant shows the count line instead of a
  lead.
- **768:** lead (1 line, `text-wrap: pretty`) appears under the seal rule.
- **1024:** left-aligned within 1200px container; no decorations added.
- **1440:** unchanged (whitespace only).

## Tokens
- Strip: `background: var(--color-surface); color: var(--color-text)`.
- Eyebrow + seal rule + count numeral: `var(--color-primary)`.
- Lead: `var(--color-muted)`; bottom hairline: `var(--color-border)`.

## States
- None interactive. Count line (slim variant) receives the live number as a
  prop; while loading show an en-dash, not 0.

## Copy keys
Per-route keys (defaults):
- `ribbon.used_cars_eyebrow` → "The showroom" / `ribbon.used_cars_title` →
  "Cars in stock" / `ribbon.count_line` → "{count} cars ready to view"
- `ribbon.about_title` → "About us"; `ribbon.services_title` → "Services &
  aftercare"; `ribbon.finance_title` → "Car finance, explained simply";
  `ribbon.px_title` → "Part exchange"; `ribbon.sell_title` → "Sell your car
  to us"; `ribbon.sold_title` → "Recently found new homes";
  `ribbon.contact_title` → "Contact us"; `ribbon.compare_title` →
  "Compare cars"; `ribbon.wishlist_title` → "Your wishlist";
  `ribbon.privacy_title` → "Privacy policy"; `ribbon.cookie_title` →
  "Cookie policy"
- Leads per route follow `ribbon.<route>_lead` keys with warm one-liners.

## Acceptance criteria
- AC1 (unique move): /about 1024 screenshot shows eyebrow + serif sentence-
  case title + 48px primary seal rule; NO background photo or overlay (grep:
  no background-image in PageRibbon files).
- AC2 (mobile): at 505px strip total height ≤200px, lead hidden ≤480px,
  title ≤2 lines.
- AC3 (tokens): zero hex; seal rule + count numeral primary-tinted in both
  palette screenshots.
- AC4 (adjacency): ribbon bottom hairline visible against the following
  `bg` section on /about at 1024.
- AC5 (slim variant): /used-cars shows the count line with serif primary
  numeral; while loading it shows "–" not "0" (code grep).
