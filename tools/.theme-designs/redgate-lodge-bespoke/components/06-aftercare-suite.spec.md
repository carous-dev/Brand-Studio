# 06 — Aftercare suite (services showcase)
id: aftercare-suite
files: components/AftercareSuite.tsx, components/AftercareSuite.module.css
depends-on: featured-stock

## Purpose
This dealer's real differentiator is everything AFTER the sale — workshop,
bodyshop, valeting. This section sells the "full house" so buyers understand
they're buying a relationship, not just a car.

## Unique move
Cards behave like **house departments**: each card's top edge carries a
short 32px-wide primary "bookmark" tab notch (a 3px-tall primary bar
inset from the left) instead of icons-in-circles; on hover the bar slides to
full card width. Copy is hospitality-toned ("The workshop", "The bodyshop",
"The car spa"-style naming via recipes). No sibling theme marks cards with
an animated top tab.

## Adjacency contract
- Above: featured-stock (`bg`). This section is `surface` — hue-free token
  alternation, no rule needed.
- Below (homepage): px-invite (primary band — hue break).
- Homepage shows 3 cards + a "See all services →" ledger-style title line
  (same header motif as featured-stock). /services renders the EXPANDED
  variant: 6 cards, no "see all" link, on `bg`.
- Promises: cards link to `/services` only (no per-service routes exist).

## Layout
- **360 (base CSS, verify at 505):** title line (rule hidden ≤640), cards
  stacked full-width; each card: bookmark tab, subtitle-size Lato 700 title,
  2-line body, "Learn more →" text link. Tap target = whole card
  (stretched link to /services).
- **768:** 3-up grid (2-up ×3 rows for the /services 6-card variant).
- **1024:** 3-up, equal heights; hover states on.
- **1440:** container 1200px.

## Tokens
- Section (homepage): `background: var(--color-surface); color: var(--color-text)`.
- Cards: `background: var(--color-bg); color: var(--color-text); border: 1px
  solid var(--color-border)` (bg-on-surface inversion of the vehicle card,
  keeps the page from feeling striped). /services variant: section `bg`,
  cards `surface`.
- Bookmark tab: `background: var(--color-primary)` (decorative, no text).
- Body copy: `var(--color-muted)`; link: `var(--color-primary)`.

## States
- hover (≥1024): tab width animates 32px → 100% (240ms; reduced-motion:
  none); border-color warms via `color-mix(… primary 40%, border)`.
- focus-visible: 2px primary outline on the stretched link.
- No loading/empty states — content is recipe-static.

## Copy keys
- `aftercare.eyebrow` → "Aftercare, under one roof"
- `aftercare.title` → "We look after the car, and you"
- `aftercare.view_all` → "See all services"
- `aftercare.1_title` → "The workshop" / `aftercare.1_body` → "Servicing,
  MOT and diagnostics by our own technicians."
- `aftercare.2_title` → "The bodyshop" / `aftercare.2_body` → "Accident
  repairs and paintwork, handled in-house."
- `aftercare.3_title` → "The car spa" / `aftercare.3_body` → "Valeting and
  protection to keep it feeling brand new."
- Expanded (/services) adds: `aftercare.4_title` → "Warranties" /
  `aftercare.4_body` → "Extended cover and service plans, explained simply." ·
  `aftercare.5_title` → "Breakdown assistance" / `aftercare.5_body` →
  "Support that travels with you." · `aftercare.6_title` → "EV & hybrid
  care" / `aftercare.6_body` → "Trained hands for electrified cars."
- `aftercare.card_link` → "Learn more"

## Acceptance criteria
- AC1 (unique move): 1024 screenshot shows the 32px primary bookmark tab on
  each card top edge; hover screenshot (or CSS grep for the width
  transition) proves the slide-to-full behaviour.
- AC2 (mobile): at 505px cards stack full-width, whole card tappable,
  ≥44px targets; no icon circles anywhere.
- AC3 (tokens): cards are `--color-bg` plates on the `--color-surface`
  homepage band (grep both pairings with explicit `color:`); zero hex.
- AC4 (adjacency): homepage full-page shot shows bg→surface→primary
  progression (featured-stock → aftercare → px-invite) with no hairline
  between aftercare and px-invite (hue break suffices).
- AC5: homepage renders exactly 3 cards; /services renders 6 (screenshot
  both); all card links resolve to `/services` (grep).
