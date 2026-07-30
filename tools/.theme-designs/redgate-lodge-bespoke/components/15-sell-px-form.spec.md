# 15 — Sell / Part-exchange form (+ ledger steps)
id: sell-px-form
files: components/SellCarSection.tsx, components/SellCarSection.module.css, components/LedgerSteps.tsx, components/LedgerSteps.module.css (used by /sell-my-car, /part-exchange, /services, /finance)
depends-on: enquiry-form (shares ledger-underline input style), page-ribbon

## Purpose
Captures the sell/PX lead in two screens: reg + mileage first (what sellers
have to hand), contact second — with the process made honest by three
numbered steps.

## Unique move
A **two-part ledger entry**: the form card leads with an oversized UK
reg-plate-styled input (wide, centered text, letterspaced — styled with
surface/border tokens, NOT plate-yellow) above a mileage field; the
"how it works" rail beside it is LedgerSteps — the proof-ledger's numbered
serif motif recast as steps 01–03 with hairline rows. If a hosted sell
widget mount exists in the skeleton (`SellYourCarWidgetMount` pattern), it
takes the form card slot and this local form is its fallback — same
placement contract.

## Adjacency contract
- Above: page-ribbon (`surface`, hairline).
- Section on `bg`: desktop 2-col — form card (surface, 1px border, 3fr) |
  LedgerSteps rail (2fr). Below: ledger-steps section rule — on
  /sell-my-car and /part-exchange the steps live IN this section's rail, so
  the following `surface` band is reviews (/sell-my-car) or footer chain
  (/part-exchange); design-language do-not §5 (one ledger element per
  route) is satisfied because LedgerSteps here replaces, not joins, a
  proof-ledger.
- Promises: PX variant differs only in copy keys (route passes variant
  prop); identical layout.

## Layout
- **360 (base CSS, verify at 505):** single column: form card first (reg
  input full-width 56px tall centered text; mileage; then Name/Phone/Email
  ledger-underline fields; full-width primary submit), LedgerSteps stacked
  below as hairline rows (numeral left column, like proof-ledger mobile).
- **768:** form card max 560px, steps below in 3-up row.
- **1024:** 2-col (form | steps rail sticky top).
- **1440:** container 1200px.

## Tokens
- Form card: `background: var(--color-surface); color: var(--color-text);
  border: 1px solid var(--color-border)`.
- Reg input: `background: var(--color-bg); color: var(--color-text);
  border: 1px solid var(--color-border)` — focus border
  `var(--color-primary)`; letterspacing 0.12em; NO yellow/plate literals.
- Other fields: ledger-underline style from component 14.
- Steps numerals: `var(--color-primary)`; step titles `var(--color-text)`;
  body `var(--color-muted)`; hairlines border token.
- Submit: primary/on-primary paired.

## States
- Same error/submitting/success grammar as component 14 (shared classes or
  duplicated locally — never cross-import another page's module.css).
- Reg input auto-uppercases display (`text-transform: uppercase` scoped to
  this input only — allowed: not a title element).
- Widget mount present → local form hidden with `[hidden]` (grep rule).
- Empty submit attempt: first invalid field focused + scrolled into view.

## Copy keys
- `sell.title` → "Tell us about your car"
- `sell.label_reg` → "Registration"; `sell.placeholder_reg` → "YOUR REG"
- `sell.label_mileage` → "Mileage"
- `sell.submit` → "Get my valuation"
- `sell.step_1_title` → "Tell us about it" / `sell.step_1_body` → "Your reg
  and mileage are all we need to start."
- `sell.step_2_title` → "Get a fair offer" / `sell.step_2_body` → "A real
  valuation from people who price cars every day."
- `sell.step_3_title` → "Paperwork done for you" / `sell.step_3_body` →
  "Bank transfer and documents handled the same day."
- PX variant: `px_form.title` → "Value your part exchange";
  `px_form.step_3_body_px` → "Drive your old car in, drive the new one
  home."

## Acceptance criteria
- AC1 (unique move): /sell-my-car 1024 screenshot shows the oversized
  letterspaced reg input atop the form card + the numbered serif LedgerSteps
  rail right; steps reuse the numeral/hairline motif.
- AC2 (mobile): at 505px single column, reg input 56px tall full-width,
  one field per row, full-width submit ≥44px; steps stack as hairline rows.
- AC3 (tokens): reg input uses ONLY surface/border/text tokens — grep
  proves no yellow/amber/hex literals anywhere in these modules.
- AC4 (adjacency): /part-exchange renders the same layout with PX copy
  (screenshot both routes); page-ribbon hairline sits directly above the
  section.
- AC5: routes are `/sell-my-car` and `/part-exchange` exactly (grep hrefs
  and folder names); no cross-theme class names or foreign module imports
  (grep).
- AC6: labels on every input incl. reg + mileage (grep `<label`); uppercase
  transform scoped to the reg input selector only (grep).
