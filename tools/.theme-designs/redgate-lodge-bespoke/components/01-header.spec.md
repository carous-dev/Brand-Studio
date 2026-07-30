# 01 — Header (spanning logo plaque + contact strip + nav + mobile overlay)
id: header
files: components/Header.tsx, components/Header.module.css, components/MobileNav.tsx (may be co-located in Header.tsx if <250 lines)
depends-on: none

## Purpose
First trust moment for an older-skewing, hurried buyer: who this dealer is,
how to phone them, and the one path into stock — visible without thought at
any width.

## Unique move
The logo lives in a full-height bordered **plaque** at the left edge that
spans BOTH header rows (36px contact strip + 64px nav row = 100px tall
plaque, hairline right border), like a brass house plaque beside a door. The
brand-primary contact strip and the nav row each run to the right of it —
no other theme's header has an element crossing its two rows.

## Adjacency contract
- Above: viewport top. Contact strip is the first painted element.
- Below: hero (on `bg`) on `/`; page-ribbon (on `surface`) elsewhere. Nav
  row ends with `border-bottom: 1px var(--color-border)`; NO box-shadow at
  any scroll position.
- Promises: desktop ≥768 — contact strip and plaque are static (scroll
  away); ONLY the nav row is sticky (`position: sticky; top: 0`) with an
  opaque `var(--color-bg)` background from first paint and `border-bottom:
  1px var(--color-border)`. The sticky nav row contains NO logo — the
  plaque next to it owns brand identity at rest, and nav + CTA suffice once
  scrolled (no scroll-reveal JS, no duplicated logo). Mobile ≤640: the
  single 60px logo row is sticky.

## Layout
- **360 (base CSS, verify at 505):** ONE nowrap contact row above (height
  32px, `primary` bg): phone link left, open-status chip right — no city
  text, socials hidden. Below it the sticky 60px bar: logo (3-tier fallback,
  max-height 36px, wordmark fallback clamps 1.25rem) left, hamburger (44×44)
  right. Desktop CTAs hidden with `!important`. Hamburger opens a
  full-screen overlay: logo top, nav items as full-width rows ≥56px tall
  (Used cars, Recently sold, Services, Finance, Part exchange, Sell my car,
  Wishlist, Compare), then phone button (primary, full-width), WhatsApp row,
  4 social icons full-opacity. Overlay uses `[hidden]{display:none!important}`.
- **768:** contact strip grows to 36px and gains location chip
  (`getBrandContactInfo` city/county) + hours-status chip; plaque appears at
  left spanning both rows (width ~180px, logo max-height 64px inside).
- **1024:** full assembly — plaque | strip (location chip, status chip,
  4 socials, phone number right-aligned) over nav row (items left, then
  right cluster: wishlist + compare icon-links with `useGarage()` count
  pills, and ONE solid primary CTA button "Sell my car").
- **1440:** header inner maxes at 1400px; plaque and paddings stop growing.

## Logo policy (amended iter-1 → iter-2)
This is a LIGHT ivory-plaque theme whose brand identity treatment IS a serif
wordmark. The plaque stays on `var(--color-bg)` (never claret/dark) so an
arbitrary brand logo (usually dark-on-light or full-colour) reads on it.
Fallback is therefore TWO tiers, not three:
1. `brand.logo` raster if present — plain `<img>`, `onError` degrades to (2).
2. **Serif wordmark** (`brand.name` in EB Garamond, the styled `.wordmark`
   span) — the theme default. This theme ships NO `/themes/<id>/logo.png`
   raster: the operator's real Redgate mark is white-on-transparent (built for
   a dark header) and would render invisible on the ivory plaque, and a known
   404 raster tier caused a broken-image box (iter-1 header-1-01). The styled
   wordmark satisfies the build-rules §5 "theme default" role for this theme.
No `<img>` element may ever point at a path this theme does not ship.

## Tokens
- Contact strip: `background: var(--color-primary); color: var(--color-on-primary)`
  (links/icons inherit on-primary; hover `opacity` change only).
- Plaque + nav row: `background: var(--color-bg); color: var(--color-text)`;
  hairlines `var(--color-border)`.
- Nav links: `color: var(--color-text)`; active/hover accents
  `var(--color-primary)`.
- CTA button: `background: var(--color-primary); color: var(--color-on-primary)`;
  hover `background: color-mix(in srgb, var(--color-primary) 85%, var(--color-text))`.
- Garage count pills: `background: color-mix(in srgb, var(--color-primary) 12%, var(--color-bg)); color: var(--color-text)`.
- Overlay: `background: var(--color-bg); color: var(--color-text)`.

## States
- hover: nav link text → `var(--color-primary)`; no underline on hover.
- active nav: `usePathname()` prefix-match, `aria-current="page"`, 2px
  `var(--color-primary)` underline offset 6px + link text stays
  `var(--color-text)` weight 700. `/used-cars/<slug>` keeps "Used cars"
  active.
- focus-visible: 2px `var(--color-primary)` outline, offset 2px, on every
  link/button including hamburger and overlay rows.
- Open-status chip: derive from `brand.openingHours` defensively — if shape
  unknown/empty render the neutral fallback label, never "Closed".

## Copy keys
- `header.cta` → "Sell my car"
- `header.status_open` → "Open today"
- `header.status_fallback` → "By appointment & walk-in"
- `nav.used_cars` → "Used cars"; `nav.recently_sold` → "Recently sold";
  `nav.services` → "Services"; `nav.finance` → "Finance";
  `nav.part_exchange` → "Part exchange"; `nav.sell` → "Sell my car"
- Phone/location strings come from `getBrandContactInfo` — never literals.

## Acceptance criteria
- AC1 (unique move): at 1024 the logo plaque visibly spans both header rows
  with a single hairline right border touching strip and nav row; grep
  confirms one plaque element outside both row containers (grid/absolute
  spanning), not a logo repeated per row. For a logo-less brand the plaque
  shows the serif `.wordmark` (dark serif on ivory) — NEVER a broken-image
  box; no `<img>` requests `/themes/<id>/logo.png` (that raster is not
  shipped — see Logo policy).
- AC2: at 505px header is ONE 60px sticky row + one nowrap 32px contact row;
  no city/county text, no socials, no desktop CTA visible; hamburger ≥44×44.
- AC3: no `box-shadow` in Header.module.css (grep) and none visible under
  the sticky row when scrolled at 1024.
- AC4 (tokens): contact strip uses `--color-primary` bg with
  `--color-on-primary` foreground (grep); legible under BOTH claret and the
  light throwaway brand screenshots.
- AC5: nav contains NO Home/About/Contact items (grep hrefs); wordmark/plaque
  links to `/`; all hrefs are whitelisted routes (note `/sell-my-car`).
- AC6: on `/used-cars/some-slug` at 1024, "Used cars" shows the active
  underline and `aria-current`.
- AC7: mobile overlay rows ≥56px tall; overlay closes via visible ✕ ≥44×44;
  `[hidden]` rule present (grep).
- AC8 (adjacency): nav row bottom edge is a 1px `--color-border` line in the
  1024 screenshot over the hero — no gap, no shadow, no double border with
  the hero.
