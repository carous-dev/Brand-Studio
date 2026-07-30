# 13 — Vehicle detail (/used-cars/[slug]: title masthead, mosaic gallery, specs band, highlights+prose, spec grid, premium sidebar, sticky bar, similar)
id: vehicle-detail
files: pages/used-cars/[slug]/page.tsx (server), pages/used-cars/[slug]/DetailClient.tsx, pages/used-cars/[slug]/GalleryMosaic.tsx, pages/used-cars/[slug]/parseDescription.ts (NEW), pages/used-cars/[slug]/page.module.css
depends-on: vehicle-card, page-ribbon (ribbon NOT used here — dependency is
shared clamp values only). Enquiry wiring (CDN widgets + local EnquiryModal)
is OWNED by component 14 (enquiry-form) and patches into this page's CTA.

## Purpose
The decision page: five angles of the car before the fold, the six facts
that qualify it, a scannable set of the seller's genuine selling points, and
price + one action always in reach — for buyers comparing tabs on a phone.
It must read like a curated listing, NEVER like a pasted feed blurb.

## Unique move
The **specs band is a claret ledger**: full-width primary band whose
label-over-value entries are separated by on-primary hairlines (mileage, year,
fuel, gearbox, engine, body) with values in EB Garamond — the proof-ledger
motif re-voiced on primary. Combined with the mosaic gallery and the
**seated title masthead** (title + subline left, a right-aligned price unit —
"Price" serif-caps eyebrow over serif price over finance line — on a shared
hairline baseline), the page is unmistakably this theme's. The description is
never dumped: it is refined into a **hairline "Highlights" checklist** (short
positive points, primary tick glyphs) plus a genuine prose "About this car"
paragraph, with dealer phone/name/payment/booking lines filtered out.

## Adjacency contract
- Above: header (no page-ribbon here). Title masthead on `bg` ABOVE the
  gallery: h1 (serif, ≤2 line wrap), subline (derivative — plate), and a
  right-aligned price unit. The masthead closes with a full-width hairline
  (the shared inner gutter) that seats it as a masthead, not a floating strip.
- Middle: gallery (bg, wide container) → specs band (primary, full-bleed) →
  content grid (bg): highlights + prose + spec grid left, sticky sidebar right.
- Below: similar-vehicles rail (`surface`) → shell BrowseByMake (`surface`,
  separated by hairline; satisfies the makes-SEO requirement) → footer.
- Promises: px-invite is NOT rendered (specs band is the route's one primary
  band); ONE inner gutter — masthead, specs-band CONTENT, and body all
  left-align to the same `--content-max` / `--wide-pad`; mobile sticky bottom
  bar overlays with floating-chrome shadow.

## Layout
- **360 (base CSS, verify at 505):** order: gallery as swipe carousel
  (scroll-snap, thumbs as a scroll rail below; "+N photos" pill opens
  lightbox) → title masthead (title, subline, then the price unit stacked
  left-aligned with its "Price" eyebrow + finance line) → specs band (2-col
  grid of the POPULATED entries, on-primary hairlines, no empty/— cells) →
  Highlights (single-column checklist) → About this car (prose) → Specification
  (single-column label/value ledger rows) → key facts list → similar rail
  (scroll-snap). Sticky BOTTOM bar: price left + full-width-remainder "Enquire"
  primary button (only those two). Page `overflow-x: hidden`; grid children
  `min-width: 0`.
- **768:** title masthead is a row (title/subline left, price unit right,
  bottom baseline aligned, closing hairline spans full inner width); gallery =
  main image left + 2×2 thumb mosaic right ("Gallery (N)" pill on last thumb);
  specs band 3 columns; Highlights = 2-col checklist; Specification = 2-col
  label/value grid.
- **1024:** content grid: highlights + prose + spec grid left (2fr), sticky
  sidebar right (1fr): premium price card (claret ribbon top rule, "Price"
  eyebrow, serif price, finance-from line, "Enquire" primary CTA, tel link,
  key facts hairline list). Specs band lays its populated entries in ONE row
  (column count = number of populated facts, ≤6). Sidebar
  `position: sticky; top: <nav height + 16px>`.
- **1440:** wide container caps at 1600px (gallery), content caps at 1280px;
  gallery stops growing.

## Tokens
- Title masthead/content: `background: var(--color-bg); color: var(--color-text)`.
- Masthead price value: `var(--color-text)` serif title size; "Price" eyebrow +
  finance line + subline: `var(--color-muted)`; closing baseline hairline
  `var(--color-border)`.
- Specs band: `background: var(--color-primary); color: var(--color-on-primary)`
  paired; labels serif-caps caption on-primary FULL opacity; column/row
  hairlines drawn per-cell via inset box-shadow
  `color-mix(in srgb, var(--color-on-primary) 22%, transparent)` (count-robust
  after empties are filtered — no tint-behind-gap that leaves a hanging block
  when a cell is dropped).
- Highlights checklist: rows on `bg`; tick glyph `var(--color-primary)`; label
  `var(--color-text)`; row hairline `var(--color-border)`.
- Spec grid: label `var(--color-muted)`, value `var(--color-text)`, row
  hairline `var(--color-border)`.
- Sidebar card: `background: var(--color-surface); color: var(--color-text);
  border: 1px solid var(--color-border)`; `border-top: 3px solid
  var(--color-primary)` (ribbon cue — "primary appears as ribbon elements").
  Price zone separated from the action group by a `var(--color-border)`
  hairline. CTA primary/on-primary.
- Lightbox chrome: `rgba(0,0,0,.9)` scrim + white controls with
  `/* photo-scrim-ok */`.
- Sticky bar: `background: var(--color-bg); color: var(--color-text)`,
  top hairline + floating shadow (allowed case).

## States
- Gallery: extraction walks .gallery/.images/.media/.photos at root,
  .vehicle, .advert; zero images → "Photos coming soon" placeholder on
  surface/muted (never broken mosaic).
- Description: `parseVehicleDescription()` (see Copy/rules) may yield
  highlights-only, prose-only, both, or neither. Render each block only when
  non-empty; if BOTH empty, render no description region at all (no empty
  heading, no gap). Dealer phone numbers, "call/ring/text X", payment/bank
  transfer, and "book a test drive / by appointment" lines NEVER render.
- Specs band: only facts with a value render; no "—" cell, no empty ENGINE.
- Enquire: hosted CDN widget via lib/external-widgets.ts (2 afterInteractive
  Scripts) with `isExternal*Ready()` fallback to local EnquiryModal; modal
  full-screen sheet ≤640.
- Sold vehicle: masthead + sidebar + sticky price struck; CTA replaced by
  "Recently sold" static chip + link to /used-cars.
- Sticky sidebar deactivates <1024 (normal flow).
- Similar rail: `/api/inventory?brand=<slug>&make=<make>&limit=4`, current
  car filtered out, fallback body-type → latest; compact cards, 3-up desktop
  grid, scroll-snap mobile.

## Furnishing
Archetype = luxury → rich + REFINED (no neon). The page is furnished, not
decorated; every device is token-driven and self-guarded.
- **Devices (3):** (1) `CanvasFX variant="aurora-light"` soft brand-light
  aurora behind the claret specs band (opacity ~0.5, deepens the plate, never
  competes with on-primary text). (2) cinematic **ken-burns** on the mosaic
  hero tile + gentle lift on thumbs (clipped by tile `overflow:hidden`). (3)
  cursor-reactive `mfx-spotlight` bloom on the mosaic hero tile, and a single
  `mfx-shimmer` sweep on the sidebar Enquire CTA (hover/focus only).
- **Imagery:** per-vehicle inventory feed photos in the gallery (image-static
  exempt — inventory slot, `optimizeImageUrl`); no theme backdrop slot needed
  (text never sits on a photo — theme has zero scrim dependence).
- **Entrance + scroll motion:** `data-aos="fade-up"` on masthead, highlights,
  prose, spec grid, sidebar card, similar cells (400ms); `data-aos="fade"`
  with 60ms stagger on each populated spec-band cell. Nothing translates >16px.
- **Canvas:** `<CanvasFX variant="aurora-light">` mounted inside `.specsBand`
  only (z-index 0 behind `.specsInner`).
- **Micro-interactions:** ken-burns `transform: scale(1.045–1.06)` over
  ~600ms (hover only); highlights tick + key-facts rows warm on hover via
  `background-color 160ms ease` (color-only, no layout shift); CTA shimmer
  sweep; call-link border/color 160ms. All ≤200ms-aware where it matters and
  reduced-motion safe.
- **Mobile (≤640):** aurora + ken-burns + spotlight + shimmer all self-freeze
  to a static token wash (CanvasFX ≤640 guard, mfx ≤720 guard,
  reduced-motion). Highlights collapse to one column; sidebar hidden (sticky
  bottom bar carries the action). Mobile stays calm and tap-target-safe (≥44px).
- **oneBigMove axis spent here:** none (theme `oneBigMove: none`; 5-size cap
  holds — the masthead eyebrow reuses the caption slot).

## Copy keys
- `detail.enquire` → "Enquire about this car"
- `detail.call` → "Call us"
- `detail.finance_line` → "Finance available — ask us for a quote"
- `detail.price_label` → "Price"
- `detail.highlights_title` → "Highlights"
- `detail.about_title` → "About this car"
- `detail.spec_title` → "Specification"
- `detail.key_facts` → "Key facts"
- `detail.similar_title` → "More like this"
- `detail.photos_soon` → "Photos coming soon"
- `detail.gallery_pill` → "Gallery ({count})"
- `detail.sold_chip` → "Recently sold"
- Spec labels: "Mileage", "Year", "Fuel", "Gearbox", "Engine", "Body",
  "Make", "Model", "Derivative", "Colour", "Doors", "Registration".

### Description-parsing rules (deterministic — `parseVehicleDescription`)
`parseVehicleDescription(raw, ctx)` returns `{ highlights: string[], prose: string[] }`.
`ctx = { make, model, derivative, reg, title, priceText }`.
1. Split `raw` on `/[\r\n]+|[•·‣▪|]+|(?:\s+\/\s+)/`; collapse each fragment's
   whitespace, trim, drop empties.
2. `norm(s) = s.toLowerCase().replace(/[^a-z0-9]+/g,'')`. Build an identity set
   from `make`, `model`, `` `${make} ${model}` ``, `derivative`, `reg`, `title`
   (norm'd, length > 2).
3. A fragment is **NOISE (dropped)** if ANY:
   - PHONE — `/(?:\+?44|\b0)\s*(?:\d\s*){9,}/` OR `frag.replace(/\D/g,'').length >= 10`
   - CONTACT — `/\b(call|ring|phone|txt|text|whatsapp|dm|e-?mail|contact us|contact me)\b/i`
   - PAYMENT — `/\b(bank transfer|bacs|paypal|payment (?:via|by|is|method|preferred)|cash only|card payment|deposit (?:secures|required|of))\b/i`
   - BOOKING — `/\b(book|arrange|to view|viewing by|test drive|by appointment|appointment only|come and see)\b/i`
   - PLEASE-INSTRUCTION — `/^please\b/i`
   - IDENTITY DUP — identity set has `norm(frag)`
   - BARE PRICE — `/^£?\s?\d[\d,]*(?:\.\d+)?\s*(?:ono|ovno|o\.n\.o\.?)?$/i` OR `norm(frag) === norm(ctx.priceText)`
   - SPEC-TOKEN DUP — `/^\d(?:\.\d)?\s?(?:l|litre|tdci|tsi|dci|cdti|hdi|vti|bhp|ps|cc|v\d)\b/i` AND ≤2 words
4. Else **HIGHLIGHT** if `wordCount ≤ 6 && frag.length ≤ 48`; strip a trailing
   `.`/`!`, capitalize first letter.
5. Else **PROSE** (kept in order; each fragment = one paragraph).
6. highlights: dedupe case-insensitively, cap 8. Return.

## Acceptance criteria
- AC1 (unique move — masthead): 768+ screenshot shows the title masthead with
  title/subline left and a right-aligned price unit (serif-caps "Price"
  eyebrow above the serif price above the finance line) sharing ONE bottom
  hairline baseline — not a floating number on a thin strip.
- AC2 (unique move — ledger): 1024 screenshot shows the full-bleed primary
  specs band with populated label/value columns, serif values, on-primary
  hairlines, directly under the mosaic; NO "—" cell and NO empty ENGINE.
- AC3 (description NOT a dump — blocker): on the Ford C-Max test car, the
  rendered page shows a formatted "Highlights" checklist (e.g. Recent cambelt
  change, Just been serviced, Long MOT, HPI clear, Cheap tax, Part exchange
  welcome) as a grid with tick glyphs — NOT a stack of `<p>` lines; AND the
  page contains NO dealer phone number, NO "Please call Abe…", NO "Payment via
  … bank transfer", NO bare make/model line, NO "07771898585". (Screenshot +
  grep the rendered text.)
- AC4 (spec redundancy resolved): the "Specification" block is a 2-col
  label/value grid (≥768) whose fields are the non-band identity facts
  (Make/Model/Derivative/Colour/Doors/Registration) — it does NOT repeat
  Mileage/Year/Fuel/Gearbox/Engine/Body already in the band; empty fields are
  absent (no blank rows).
- AC5 (gallery): 768+ shows title ABOVE the gallery and the 1-main + 2×2
  mosaic with "+N"/"Gallery (N)" pill; 505px shows swipe carousel + thumb rail
  (no shrunken mosaic).
- AC6 (mobile): 505px sticky bottom bar contains ONLY price + Enquire; page
  has no x-overflow at 505 (screenshot + `overflow-x:hidden` grep +
  `min-width:0` grep); Highlights collapse to one column.
- AC7 (tokens): specs band paired primary/on-primary (grep); on-primary labels
  FULL opacity (no sub-0.9 alpha on label selectors); sidebar card paired
  surface/text; legible on the light throwaway brand.
- AC8 (premium sidebar): 1024 sidebar is sticky with a claret ribbon top rule,
  "Price" eyebrow + serif price, finance line, hairline separating price from
  a primary Enquire CTA + tel link + key-facts list — reads as a designed card,
  not a plain white box.
- AC9 (one gutter / adjacency): masthead content, specs-band content, and body
  all left-align to the same inner container (no flush-left title over an inset
  body); px-invite absent from this route (grep imports); similar rail on
  `surface` then hairline before BrowseByMake in the full-page shot.
- AC10 (furnishing): the aurora canvas paints behind the claret band and the
  mosaic hero shows ken-burns/spotlight in the device-mode shot; the
  reduced-motion window shot shows the static wash + frozen motion (that
  contrast is the guard). A plain, un-furnished render FAILs.
- AC11: h1 count on the page = 1 (masthead title). Gallery extraction helper
  still covers all payload paths (grep .media/.photos/.advert walks).
