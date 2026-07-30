# 12 — Inventory (/used-cars hero + toolbar + showroom grid)
id: inventory
files: pages/used-cars/page.tsx (server — drops the slim PageRibbon),
  pages/used-cars/UsedCarsClient.tsx (renders the hero + toolbar + grid),
  pages/used-cars/page.module.css
depends-on: vehicle-card

## Purpose
The workhorse route for a 300-car supermarket: fast filter, fast scan,
full-width grid — nothing between the buyer and the stock. The route now
OPENS on a real, lean, elevated hero (build-rules §10) — never the bare
page-ribbon it originally shipped, which read as unfinished.

## Unique move
The results header is a **ledger line**: a live "Showing {N}" caption, then
the connecting hairline running to the Filters/Wishlist/Compare chip cluster
right — the toolbar itself carries the theme's rule motif. Above it, the
**inventory hero** (below) leads with the standing in-stock figure as an
oversized EB Garamond claret numeral inside a claret-matted frame. Grid cards
are the ledger-footline VehicleCard, so the whole page reads as ruled stock
pages, unlike any sibling inventory.

## Inventory hero (lean elevated band) — added 2026-07-30 (build-rules §10)
/used-cars opens on a REAL hero, not the bare slim page-ribbon. Rendered by
`UsedCarsClient` (client) as the FIRST child so its search + Make control are
live-wired to the grid; `page.tsx` no longer renders `<PageRibbon slim>` for
this route (the eyebrow/title copy keys `ribbon.used_cars_eyebrow` /
`ribbon.used_cars_title` are reused verbatim — no new recipe keys minted).

Concept: a lean "showroom index" band — the warm-premium framed grammar of the
home hero, recomposed around a confident stock figure and a surfaced search.
"Futuristic" here means sleek restraint in EB Garamond + claret + ivory, NOT
sci-fi neon (that would break the design language).

Composition — a single framed panel, radius 0:
- Band `.hero`: full-width `background: var(--color-surface); color:
  var(--color-text)`, LEAN block padding `clamp(1.5rem, 4vw, 2.75rem)`; content
  in `.wideInner` (the SAME wide gutter as the grid — the route shares one
  gutter). Supplies its own top hairline (allowed same-token adjacency, §7).
- Frame `.heroFrame`: `background: var(--color-bg); color: var(--color-text)`,
  `border: 1px solid var(--color-border)`, `border-top: 3px solid
  var(--color-primary)` (the wax-seal / claret-mat echo). No shadow, no
  gradient, no radius.
- Heading zone: `.heroEyebrow` (serif-caps letterspaced, `ribbon.used_cars_eyebrow`)
  → `.heroTitle` (EB Garamond 600, title clamp `clamp(1.6rem, 4vw, 2.5rem)`,
  sentence case, short, `ribbon.used_cars_title`) → `.heroFigure`: an EB
  Garamond 600 `var(--color-primary)` numeral `clamp(2.4rem, 6vw, 3.4rem)` (the
  LIVE in-stock count = `resultsCount`) on one baseline with a serif-caps
  `.heroFigureLabel` (`inventory.count_label` = "In stock"). Loading → the
  numeral shows an en-dash, never "0".
- Search zone: the two-tone `.search` shell (primary icon block + flat input,
  reused verbatim) with the Make `SelectChip` beneath — the surfaced "search +
  primary filter". Both drive the same client state that filters the grid.

Layout:
- 360 base (verify 505): single column inside the frame — eyebrow → title →
  figure (numeral + label, one baseline row) → full-width search → full-width
  Make select. Modest padding; no internal vertical hairline.
- 768+: frame becomes 2-col `minmax(0, 1fr) minmax(0, 22rem)` — heading left,
  search right, separated by a 1px `var(--color-border)` vertical rule. Figure
  sits under the title.
- The hero carries NO chip cluster, sort, wishlist/compare, stats, or photo
  (do-not #7; theme is scrim-free).

Toolbar demotion (consequence): the big serif count numeral MOVES into the
hero. Toolbar row 1 keeps the rule motif but the numeral becomes a small live
`.resultsCaption` ("Showing {N}") → hairline → chip cluster. The search input
and the Make select are REMOVED from toolbar row 2 (now in the hero); row 2
keeps Body + Sort SelectChips (+ Wishlist/Compare rail chips ≤767). No control
renders in BOTH the hero and the toolbar.

Restraint: the hero is NOT a full primary band — claret appears only as the
3px top rule + the figure numeral (ribbon/ledger accents, §5). px-invite stays
the route's ONE full primary band (do-not #9 holds; oneBigMove `none`).

## Adjacency contract
- Above: page-ribbon slim (`surface`, hairline bottom; count line lives in
  the ribbon AND the toolbar shows the same live count — single source via
  meta.total prop).
- Below: px-invite (primary band) → shell BrowseByMake → footer.
- Promises: wide container (`.wideInner`, `max-width:none`); page owns no
  primary bands besides px-invite.

## Layout
NOTE (2026-07-30): the search input and the Make select described below now
live in the HERO, not the toolbar (see "Inventory hero"). Toolbar row 1's big
numeral is demoted to a small "Showing {N}" caption. Toolbar row 2 keeps only
Body + Sort SelectChips (+ Wishlist/Compare rail chips ≤767).
- **360 (base CSS, verify at 505):** toolbar row 1 = "Showing {N}" caption +
  "Filters" toggle chip; row 2 = horizontally scroll-snapping chip rail (Sort
  chip with overlaid invisible native select, Wishlist chip, Compare chip —
  `flex: 0 0 auto`, labels always visible, counters via `useGarage()`).
  Filters toggle opens a full-screen sheet (make/body/price selects + Reset;
  `[hidden]` rule applies). Grid: 1-up cards.
- **768:** grid 2-up; Body + Sort selects inline in row 2 (search + Make are
  in the hero).
- **1024:** grid 3-up; toolbar single-container two-row layout per build
  rules; no sidebar (chip/select bar pattern — showroom-grid).
- **1440/≥1600:** grid 4-up ≥1600px; gutters capped.

## Tokens
- Page: `background: var(--color-bg); color: var(--color-text)`.
- Toolbar chips: `background: var(--color-surface); color: var(--color-text);
  border: 1px solid var(--color-border)`; active chip border →
  `var(--color-primary)` + count pill `color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))`
  paired with `var(--color-text)`.
- Search input: two-tone shell — icon block `background: var(--color-primary);
  color: var(--color-on-primary)` left, flat input right on
  `var(--color-bg)` with border token; NO gradients; icon never overlaps
  placeholder.
- Count numeral: `var(--color-primary)`; connecting hairline: border token.

## States
- Filter sheet open/close: shadow allowed (floating chrome); traps focus;
  close ✕ ≥44px.
- Empty results: warm empty state (`inventory.empty` + "Clear filters"
  action) centered on bg — no broken grid.
- Loading: 6–8 skeleton cards.
- Sort select focus-visible ring on the visible chip.
- meta.available.makes/bodies normalised to `string[]` at the boundary.

## Copy keys
- `inventory.count_label` → "In stock"
- `inventory.filters` → "Filters"; `inventory.reset` → "Reset"
- `inventory.search_placeholder` → "Search make or model"
- `inventory.sort_label` → "Sort"; sort options: "Newest first", "Price:
  low to high", "Price: high to low"
- `inventory.empty` → "Nothing matches just yet — try widening your search,
  or call us: new cars arrive every week."
- `inventory.clear` → "Clear filters"

## Acceptance criteria
- AC1 (unique move): 1024 screenshot shows the hero's oversized serif claret
  in-stock numeral AND the toolbar ledger line — "Showing {N}" caption +
  hairline connecting to the right chip cluster. The big numeral appears in the
  hero, not the toolbar.
- AC2 (mobile): at 505px toolbar is 2 rows (count+Filters / search+chip
  rail), chips don't stretch (`flex:0 0 auto` grep), filter sheet is
  full-screen with Reset in header (title + Reset ONLY).
- AC3: grid is 3-up at 1024 and 4-up in a ≥1600 screenshot; `.wideInner`
  has `max-width: none` (grep).
- AC4 (tokens): search icon block primary/on-primary paired; zero hex; zero
  gradient (grep); both palettes legible.
- AC5 (adjacency): the hero in-stock figure and the toolbar "Showing {N}"
  caption show the same number on first paint (both seed from `resultsCount` /
  `initialMeta.total`).
- AC6: every `styles.X` referenced in UsedCarsClient.tsx exists in
  page.module.css (grep completeness); fetch threads `?brand=` via
  `getBrandSlugFromRequest`/`useBrand().slug` (grep).
- AC7: Sort chip = icon + current value + chevron with an overlaid invisible
  native `<select>` (grep opacity-0 select).
- AC8 (hero exists, not a ribbon): the /used-cars 1440 screenshot shows the
  framed inventory hero — 3px claret top rule, eyebrow, short serif headline, a
  large claret EB Garamond in-stock numeral, and a working search field + Make
  select INSIDE the frame. `page.tsx` renders no `<PageRibbon>` for used-cars
  (grep).
- AC9 (lean + mobile-modest): at 505px the hero is a single-column frame, block
  padding ≤ ~2.75rem, search + Make full-width stacked, no chip/sort/stat
  clusters inside the hero; the band does not dominate the fold.
- AC10 (no duplication): the search input and the Make select appear EXACTLY
  once on the page (hero) — grep one `.searchField`, one make `SelectChip`;
  toolbar row 2 shows only Body + Sort; toolbar row 1 shows a small "Showing
  {N}" caption, not a second oversized numeral.
- AC11 (tokens/restraint): hero uses only tokens / `color-mix` (zero hex, zero
  gradient — grep); the only claret is the 3px top rule + the numeral; px-invite
  remains the sole full primary band on the route; legible on the claret palette
  AND a light throwaway brand.
