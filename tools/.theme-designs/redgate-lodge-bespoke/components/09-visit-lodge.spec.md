# 09 — Visit lodge (find us / hours / hospitality note)
id: visit-lodge
files: components/VisitLodge.tsx, components/VisitLodge.module.css
depends-on: reviews

## Purpose
Closes the homepage with the practical answer older buyers want on paper:
where you are, when you're open, how to call — plus the hospitality promise
for buyers travelling a distance.

## Unique move
An **"arrival card" laid out like a hotel welcome sheet**: left column is a
hairline-ruled details list (Address / Phone / Email / Hours as label-value
rows), right column is a framed photo (reusing the hero's mat treatment at
smaller offset) over a short italic-leaning "travelling far?" hospitality
note. No map embed, no icon grid — typography and rules only.

## Adjacency contract
- Above: reviews (`bg`). Section is `surface` — token alternation.
- Below (on `/`): shell BrowseByMake band, also `surface` → this section
  ends with a full-width single hairline (explicit same-token separator per
  design-language §7).
- On /contact: reused as the right column of the contact split, unbanded
  (transparent wrapper variant prop) — details list + note only, no photo.
- Promises: all contact data via `getBrandContactInfo`; hours guarded
  (unknown shape → fallback line, never "Closed").

## Layout
- **360 (base CSS, verify at 505):** title line; details list full-width
  (label-value rows ARE genuinely paired → 2-col grid allowed: label 40% /
  value 60%, hairline under each row); phone + email values are tappable
  links ≥44px row height; photo hidden ≤640; hospitality note below list.
- **768:** two columns 55/45 (details | photo+note), photo mat offset 12px.
- **1024:** same; details rows gain more row padding.
- **1440:** container 1200px.

## Tokens
- Section: `background: var(--color-surface); color: var(--color-text)`.
- Labels: `color: var(--color-muted)` serif-caps eyebrow style at caption
  size; values: `var(--color-text)`; links: `var(--color-primary)`.
- Row hairlines + closing hairline: `var(--color-border)`.
- Photo mat: `color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))`;
  photo fallback `var(--color-bg)` + `var(--color-muted)`.
- Note: `color: var(--color-muted)`.

## States
- hover: phone/email link underline; focus-visible 2px primary outline.
- Missing hours: render `visit.hours_fallback`; missing photo: mat +
  fallback surface (never broken img).
- Photo source: `brand.images.location || brand.heroImage || theme default`
  layered.

## Copy keys
- `visit.eyebrow` → "Come and see us"
- `visit.title` → "Visit the showroom"
- `visit.label_address` → "Address"; `visit.label_phone` → "Phone";
  `visit.label_email` → "Email"; `visit.label_hours` → "Hours"
- `visit.hours_fallback` → "Call us to arrange a time that suits you"
- `visit.note` → "Travelling a long way to collect your car? Tell us — we'll
  make the trip worth it and have everything ready when you arrive."
- `visit.directions` → "Get directions" (external maps link built from
  getBrandContactInfo address string; `rel="noopener"`, new tab)

## Acceptance criteria
- AC1 (unique move): 1024 screenshot shows label-value hairline rows left +
  matted photo with italic hospitality note right; NO map iframe, NO icon
  grid (grep: no iframe in VisitLodge.tsx).
- AC2 (mobile): at 505px photo hidden, rows 2-col label/value with ≥44px
  tap rows, phone value is a `tel:` link (grep).
- AC3 (tokens): zero hex; section surface + closing hairline visible above
  the BrowseByMake band in the full-page shot (same-token separator rule).
- AC4: address rendered via `getBrandContactInfo` (grep — no
  `brand.location.address` direct render, no `as any`).
- AC5: hours fallback path exists (grep for the fallback key) — empty
  openingHours never renders "Closed".
