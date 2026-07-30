# 07 — PX invite (primary band CTA)
id: px-invite
files: components/PxInvite.tsx, components/PxInvite.module.css
depends-on: none (used on /, /about, /services, /used-cars, /recently-sold)

## Purpose
The single loudest conversion moment per page: turn "I have a car to get rid
of" anxiety into an easy next step — the warm hospitality version of a CTA
banner.

## Unique move
The band is a **written invitation, not a billboard**: left-aligned serif
display line in italic-leaning EB Garamond 500 (sentence case, reads like a
hand-written note), a one-line body, and an OUTLINED on-primary CTA — plus a
right-aligned oversized ornamental serif closing quote-flourish
(`”` glyph at ~6rem, 20% opacity, aria-hidden, hidden ≤640) as the section's
single ornament. Siblings' CTA bands are all centered bold-sans shouts.

## Adjacency contract
- Above: varies (surface or bg) — hue break needs no rule.
- Below: reviews (`bg`) on `/`; footer chain elsewhere. Band never sits
  directly against the footer plate (BrowseByMake `surface` band always
  intervenes via the shell).
- Promises: the ONLY `--color-primary`-background band on its route (footer
  plate excluded; on /used-cars/[slug] the specs band takes this slot and
  px-invite is NOT rendered — design-language do-not §9).

## Layout
- **360 (base CSS, verify at 505):** stacked, left-aligned: title (title
  size, ≤2 lines), body line, ONE full-width outlined CTA → `/sell-my-car`.
  Flourish hidden. Vertical padding compact (`clamp` low end).
- **768:** flourish appears right; content max 60% width.
- **1024:** single row feel — text block left, CTA right-aligned vertically
  centered; flourish behind CTA area, `z-index` below content.
- **1440:** container 1200px inside the full-bleed primary band.

## Tokens
- Band: `background: var(--color-primary); color: var(--color-on-primary)`
  (one rule, paired).
- Title/body/flourish: `color: var(--color-on-primary)` (flourish via
  opacity 0.2 of the same token — no white literals).
- CTA: `background: transparent; border: 1px solid var(--color-on-primary);
  color: var(--color-on-primary)`; hover: `background:
  var(--color-on-primary); color: var(--color-primary)`.

## States
- hover: CTA inversion above (160ms).
- focus-visible: 2px `var(--color-on-primary)` outline offset 2px.
- Copy variants per route via props/keys: default (sell), recently-sold
  variant.

## Copy keys
- `px.title` → "Change your car the easy way"
- `px.body` → "Tell us about your current car — we'll value it fairly and
  handle the paperwork."
- `px.cta` → "Value my car"
- `px.title_sold` → "Yours could be the next one sold"
- `px.body_sold` → "We're always looking for good cars. Selling yours takes
  minutes."

## Acceptance criteria
- AC1 (unique move): 1024 screenshot shows left-aligned serif invitation
  text + outlined CTA + the single oversized flourish at ~20% opacity right;
  nothing is centered.
- AC2 (mobile): at 505px the flourish is hidden, CTA is full-width ≥44px,
  content left-aligned single column.
- AC3 (tokens): band uses `--color-primary` bg + `--color-on-primary` fg in
  one paired rule; zero `#fff`/rgba-white literals (grep); CTA hover
  inversion legible on the light throwaway brand screenshot.
- AC4 (adjacency): on `/` the band sits between aftercare (`surface`) and
  reviews (`bg`) with no hairlines — hue break both sides; grep confirms
  px-invite is NOT imported by the vehicle-detail page.
- AC5: CTA href is `/sell-my-car` exactly (grep — not /sell-your-car).
