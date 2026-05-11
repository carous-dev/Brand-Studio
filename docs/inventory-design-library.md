# Inventory design library

Curated list of inventory-page layout patterns the `/new-theme` skill picks from
in Phase 8. The goal is variety: no two bespoke themes should ship the same
inventory layout. Each theme picks **one list pattern** for `pages/used-cars/page.tsx`
and **one detail pattern** for `pages/used-cars/[slug]/page.tsx`.

The data layer (filter state, URL params, pagination, normalization helpers
from `lib/inventory.ts`) stays the same across patterns — these are about the
PRESENTATION layer only.

## Inventory list patterns

### 1. Showroom grid
- **Reference dealers:** Cinch, Carwow, BMW Approved Used.
- **Best for:** modern / luxury / classic archetypes with strong photography.
- **Layout:** mobile 1-up, tablet 2-up, desktop 3-up large cards. Each card
  shows full-bleed photo on top, price/title/spec-row underneath. Hover-reveal
  reserve button on desktop.
- **CSS hooks:** `.gridShowroom` wrapping container, `.cardLarge` per item.
- **Filter UI:** chip bar above the grid (make / body / price-range), sort
  dropdown right-aligned. Filter sidebar collapses behind a "Filters" sheet
  button on mobile.

### 2. Filtered sidebar
- **Reference dealers:** Autotrader, Heycar, We Buy Any Car.
- **Best for:** classic / rugged archetypes with high-volume stock.
- **Layout:** sticky left sidebar with filter accordions (make, model, body,
  fuel, transmission, year range, price range, mileage). Right column shows
  results as 2-up cards. Pagination at bottom.
- **CSS hooks:** `.gridSidebar` 2-column desktop, `.filterSidebar` sticky on
  desktop, full-overlay sheet on mobile (trigger via "Filter (N)" button).
- **Filter UI:** persistent on desktop, overlay on mobile.

### 3. Compact list
- **Reference dealers:** Cazoo, Motorpoint.
- **Best for:** rugged / classic archetypes where buyers scan many vehicles.
- **Layout:** horizontal row per vehicle — image-left (1:1 aspect), spec
  details right (title, price, year/miles/fuel inline), action buttons far
  right (heart / compare / view). Higher information density per pixel.
- **CSS hooks:** `.listCompact` flex-column, `.listRow` flex-row, `.listMedia`
  fixed aspect.
- **Filter UI:** chip-row above the list, sort dropdown right.

### 4. Map-overlay search
- **Reference dealers:** Hexagon Premium, Lookers, Sytner.
- **Best for:** luxury / prestige archetypes with multiple forecourts.
- **Layout:** split-screen: map left (placeholder for now, static image with
  pin markers), result cards right. Click map pin → highlights card.
- **CSS hooks:** `.gridMap` 2-column flex on desktop, stacked on mobile.
- **Filter UI:** location-first search ("Within X miles of postcode"), then
  filter chips.
- **Implementation note:** static map for v1; integrate Mapbox/Google Maps in
  a follow-up.

### 5. Editorial spotlight
- **Reference dealers:** Vision Prestige, McLaren Used Approved.
- **Best for:** luxury / prestige archetypes.
- **Layout:** first vehicle renders full-width as a hero (large photo + editorial
  copy + price + CTA). Remaining vehicles in a 2-up or 3-up grid below.
- **CSS hooks:** `.spotlightHero`, `.gridSpotlight`.
- **Filter UI:** minimal — just sort + a "refine" link that opens a sheet.

### 6. Stacked cards
- **Reference dealers:** Cinch Spotlight, Pistonheads premium.
- **Best for:** modern archetype with strong typography focus.
- **Layout:** alternating image-side cards — odd vehicles image-left, even
  image-right. Vertical rhythm with strong section dividers.
- **CSS hooks:** `.stackedCards`, `.stackedCard:nth-child(even)`.
- **Filter UI:** chip-row above the stack.

### 7. Carousel-per-make
- **Reference dealers:** Audi Approved, BMW Premium Selection.
- **Best for:** classic / prestige archetypes carrying multi-marque stock.
- **Layout:** vehicles grouped by make, each make as a horizontal scroll
  carousel. Title row per make. Scroll snap on mobile, scroll arrows on
  desktop.
- **CSS hooks:** `.byMakeGroup`, `.makeCarousel`.
- **Filter UI:** make is the grouping; secondary filters as chips above.

## Inventory detail patterns

### A. Gallery-forward + sticky sidebar
- **Reference dealers:** Cinch, Heycar.
- **Best for:** modern / classic archetypes.
- **Layout:** full-bleed photo gallery hero (slide / scroll). Below: 2-column
  layout with vehicle details left (specs, description, history), sticky pricing
  card right (price, monthly finance, reserve CTA, enquiry form trigger).
- **CSS hooks:** `.detailGallery`, `.detailGrid` 2-col, `.detailPriceCard` sticky.

### B. Spec-sheet vertical
- **Reference dealers:** Autotrader, We Buy Any Car.
- **Best for:** rugged / classic archetypes.
- **Layout:** photo block at top (tabbed gallery), then a vertical stack
  underneath — full spec table, finance section, location/seller block,
  enquiry form. Single column on desktop, mobile-first by default.
- **CSS hooks:** `.detailVertical`, `.specTable`.

### C. Magazine editorial
- **Reference dealers:** Vision Prestige, McLaren, Aston Martin Used.
- **Best for:** luxury / prestige archetypes.
- **Layout:** hero photo with editorial title overlay → narrative section
  ("Why we love this car") → spec callouts as pull-quotes (e.g. "0–60 in
  3.2s" as large-type pull quote) → photo break → more specs → finance →
  contact.
- **CSS hooks:** `.detailMagazine`, `.pullQuoteSpec`.

### D. Configurator-led
- **Reference dealers:** Carwow, Tesla Used.
- **Best for:** modern archetype where finance is the primary decision driver.
- **Layout:** photo gallery above the fold but compact; finance/PCP calculator
  is the dominant visual element (deposit slider, term slider, monthly
  result). Spec details below the fold.
- **CSS hooks:** `.detailConfigurator`, `.financeCalculator`.

### E. Comparison view
- **Reference dealers:** Carbuzz, Pistonheads premium.
- **Best for:** prestige archetype.
- **Layout:** vehicle column primary, secondary column shows "vs market"
  data — average price for this make/model/year, mileage percentile, days-on-
  market — so the buyer can see how the listing compares.
- **CSS hooks:** `.detailCompare`, `.marketContext`.

### F. Story-driven
- **Reference dealers:** Hexagon Premium, Talacrest, JD Classics.
- **Best for:** luxury archetype dealing in collector / heritage cars.
- **Layout:** long-form narrative with image breaks every section. Specs are
  inline in the prose ("Powered by the 4.7-litre V8 producing 425bhp at 7000rpm…")
  rather than tabulated. Footer has a tabulated spec sheet for reference.
- **CSS hooks:** `.detailStory`, `.detailStoryBreak`.

## Pattern rotation (record of which themes ship which pattern)

| Theme | List pattern | Detail pattern |
|-------|--------------|----------------|
| `springalls-classic` | 1. Showroom grid | A. Gallery-forward |
| `columbus-vehicles-bespoke` | 2. Filtered sidebar | B. Spec-sheet vertical |
| `gilded-drive` | 5. Editorial spotlight | C. Magazine editorial |
| `ele-car-sales-bespoke` | 3. Compact list | A. Gallery-forward |
| `classic-dealer` | 6. Stacked cards | B. Spec-sheet vertical |
| `auto-wow-uk-bespoke` | _redesign pending_ | _redesign pending_ |
| `ncr-van-sales-bespoke` | 7. Carousel-per-make | D. Configurator-led |

**Rule:** if your archetype-natural pattern is already taken, pick the next
best fit for the archetype. The point is no two themes look the same. Append
your row when the design lands.

## How Phase 8 uses this library

1. Read this file before designing the inventory pages.
2. Look at the rotation table — pick a pattern not yet used (or used by a
   theme of a different archetype).
3. Implement the chosen pattern in `pages/used-cars/page.tsx` and the
   detail in `pages/used-cars/[slug]/page.tsx`. Keep the data-layer code
   (state, URL handling, fetch, normalization) verbatim from the skeleton.
   Rewrite only the JSX render layer and the `page.module.css` file.
4. Append your theme to the rotation table.

If you genuinely need a pattern not in this catalogue, design it fresh, then
add a new row above with reference dealers and the CSS hooks you used — so
the next theme can pick it up if it fits.
