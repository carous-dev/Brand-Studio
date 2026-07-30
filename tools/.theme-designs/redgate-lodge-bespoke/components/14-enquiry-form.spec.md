# 14 — Enquiry (CDN widget wiring + local modal fallback + contact form)
id: enquiry-form
files: lib/external-widgets.ts (wiring), components/EnquiryModal.tsx, components/EnquiryModal.module.css, components/ContactForm.tsx, components/ContactForm.module.css
depends-on: vehicle-detail, page-ribbon

## Purpose
The moment a browser becomes a lead. Hosted Carous widgets do the heavy
lifting; the local fallback and the contact-page form must feel like the
same warm household, with zero friction on a phone.

## Unique move
Form fields are **ledger-underline inputs**: no boxed input shells — each
field is label (serif-caps caption) over a value line with only a bottom
hairline that thickens to 2px primary on focus, like writing on a ruled
page. Submit is the only solid element. No sibling theme uses underline-only
inputs.

## Adjacency contract
- Detail page: "Enquire" CTAs (sidebar + sticky bar) call the hosted CDN
  enquiry/reserve widgets via 2 `afterInteractive` Scripts; when
  `isExternal*Ready()` fails, open local EnquiryModal.
- /contact: ContactForm card sits left of the reused visit-lodge details
  (unbanded variant) on `bg`.
- Promises: modal is a centered dialog ≥768 and a FULL-SCREEN sheet ≤640;
  `[hidden]{display:none!important}` present; body scroll locked while open.

## Layout
- **360 (base CSS, verify at 505):** full-screen sheet: header row (title +
  ✕ ≥44px), vehicle context line (title + price, muted), fields one per
  row full-width (Name, Phone, Email, Message textarea), full-width primary
  submit, quiet side-channel row under submit: Call / WhatsApp / Email text
  links. Inputs ≥48px tall, 16px font (no iOS zoom).
- **768:** centered dialog max-width 560px, radius 6, floating shadow
  (allowed chrome); same single-column fields.
- **1024:** unchanged; ContactForm on /contact is a surface card with 1px
  border, fields identical, submit right-aligned auto-width.
- **1440:** unchanged.

## Tokens
- Modal sheet/card: `background: var(--color-bg); color: var(--color-text)`.
- Scrim behind dialog: `rgba(0,0,0,.55) /* photo-scrim-ok */`.
- Labels: `color: var(--color-muted)`; values: `var(--color-text)`.
- Input rule: `border-bottom: 1px solid var(--color-border)`; focus:
  `border-bottom: 2px solid var(--color-primary)` (no outline box; plus a
  visible focus-visible treatment on the label via primary color).
- Submit: `background: var(--color-primary); color: var(--color-on-primary)`.
- Validation error text + rule: `var(--t-error)` status token; success note:
  `var(--t-success)`.
- Inputs use natural surface — NO dark shells, works on light throwaway
  brand.

## States
- focus-visible: 2px primary underline + label color shift; submit gets
  standard 2px outline.
- error: field rule + message in `--t-error`, message ≥13px, `aria-describedby`
  wired; submit disabled state at 60% opacity with `cursor:not-allowed`.
- submitting: submit shows "Sending…" (key below), disabled.
- success: form swaps to a thank-you block (serif title + warm line + close).
- Widget-ready path: grep-checkable `isExternalEnquiryReady()` /
  `isExternalReserveReady()` branch before opening local modal.

## Copy keys
- `enquiry.title` → "Ask us about this car"
- `enquiry.contact_title` → "Send us a message"
- `enquiry.label_name` → "Your name"; `enquiry.label_phone` → "Phone";
  `enquiry.label_email` → "Email"; `enquiry.label_message` → "Message"
- `enquiry.placeholder_message` → "Tell us what you'd like to know — or when
  you'd like to pop in."
- `enquiry.submit` → "Send enquiry"; `enquiry.sending` → "Sending…"
- `enquiry.success_title` → "Thank you — we've got it"
- `enquiry.success_body` → "One of the team will come back to you shortly.
  If it's urgent, give us a ring."
- `enquiry.error` → "Please check this field"

## Acceptance criteria
- AC1 (unique move): screenshot shows underline-only fields with serif-caps
  labels; focus screenshot (or CSS grep) shows the 2px primary focus rule;
  no boxed input borders (grep: no full `border:` on input selectors).
- AC2 (mobile): at 505px the modal is a full-screen sheet with ✕ ≥44px,
  one field per row, full-width submit; body doesn't scroll behind (grep
  scroll lock).
- AC3 (tokens): scrim carries `/* photo-scrim-ok */`; status colors use
  `--t-error/--t-success`; zero other literals (grep); legible both
  palettes.
- AC4: CDN wiring present — lib/external-widgets.ts + 2 afterInteractive
  Scripts + `isExternal*Ready()` fallback branch (grep all three); gallery/
  modal fallback is local.
- AC5: labels are real `<label for>` on every input (grep); error messages
  wired via aria-describedby.
- AC6: `[hidden]{display:none!important}` rule present in modal CSS (grep);
  Escape and ✕ both close the modal.
