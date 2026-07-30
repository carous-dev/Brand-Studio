# 10 — Footer (deep claret plate)
id: footer
files: components/Footer.tsx, components/Footer.module.css
depends-on: header (shares logo fallback + contact helpers)

## Purpose
The site's closing signature and the About/Contact home (nav is lean):
navigation completeness, legal links, and contact details on one calm plate.

## Unique move
The plate opens with the theme's second **double-hairline rule** (on-primary
at reduced opacity via color-mix) and a centered **monogram row**: the brand
logo (3-tier fallback) sits alone, centered, above the column grid — like a
stamped bookplate. Sibling footers all start straight into columns.

## Adjacency contract
- Above: shell BrowseByMake band (`surface`) on every route — hue break into
  the plate, no extra rule needed outside the plate's own double hairline.
- Below: viewport end (cookie banner may overlay — shared widget, untouched).
- Promises: contains About + Contact + Privacy + Cookie links (nav-lean
  contract) and the full whitelisted-route coverage listed below.

## Layout
- **360 (base CSS, verify at 505):** monogram row (logo max-height 44px,
  centered) → single column stacks in order: Showroom links, Explore links,
  Contact block, fine-print row. Link rows ≥44px tall.
- **768:** 2×2 column grid under the monogram row.
- **1024:** 4 columns: (1) blurb — short warm line + social icons (all 4,
  full opacity, on-primary); (2) "Showroom": /used-cars, /recently-sold,
  /finance, /part-exchange, /sell-my-car; (3) "Explore": /about, /services,
  /contact, /compare, /wishlist; (4) "Contact": address lines, tel link,
  email link, hours line (guarded). Fine-print row spans full width under a
  single interior hairline: © line + /privacy-policy + /cookie-policy.
- **1440:** container 1200px inside full-bleed plate.

## Tokens
- Plate: `background: color-mix(in srgb, var(--color-primary) 85%, var(--color-text)); color: var(--color-on-primary)`
  (single paired rule; guarantees a deep plate on light-mode palettes).
- Headings (serif-caps eyebrow style) + links: `color: var(--color-on-primary)`
  at FULL opacity (plate-on-plate greying ban — no 0.7 alphas on links).
- Fine print + blurb: `color: color-mix(in srgb, var(--color-on-primary) 80%, transparent)`
  allowed ONLY on the top-level plate (no nested plates exist here).
- Hairlines on plate: `color-mix(in srgb, var(--color-on-primary) 25%, transparent)`.
- No box-shadow anywhere.

## States
- hover: links underline (on-primary); focus-visible 2px on-primary outline.
- Logo fallback tier 3: wordmark in EB Garamond 600 on-primary.
- Missing socials: still render all 4 icons at full opacity.

## Copy keys
- `footer.blurb` → "A family-run independent, looking after drivers and
  their cars for the long run."
- `footer.col_showroom` → "Showroom"; `footer.col_explore` → "Explore";
  `footer.col_contact` → "Contact"
- `footer.rights` → "All rights reserved."
- Link labels reuse nav.* keys plus `footer.about` → "About us",
  `footer.contact` → "Contact us", `footer.privacy` → "Privacy policy",
  `footer.cookies` → "Cookie policy", `footer.compare` → "Compare",
  `footer.wishlist` → "Wishlist".

## Acceptance criteria
- AC1 (unique move): 1024 screenshot shows the double hairline + centered
  solo monogram/logo row above 4 columns.
- AC2 (mobile): 505px is a single-column stack, link rows ≥44px, monogram
  still centered.
- AC3 (tokens): plate background is the primary-85/text mix with on-primary
  foregrounds (grep); links are FULL-opacity on-primary (grep: no
  0.6–0.9 alpha on link selectors); legible in both palette screenshots.
- AC4: footer includes About, Contact, Privacy, Cookie links, and every
  listed route href is on the whitelist incl. `/sell-my-car` (grep all
  hrefs).
- AC5 (adjacency): full-page shot shows surface BrowseByMake → plate hue
  break with no stray white gap; no `box-shadow` (grep).
- AC6: no bare `footer{}` element selector in any theme CSS (grep) — all
  rules class-scoped.
