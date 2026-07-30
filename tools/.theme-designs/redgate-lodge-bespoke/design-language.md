# Design language — redgate-lodge-bespoke

Archetype: luxury (warm-premium, credibility-led — NOT aloof boutique).
Verify against BOTH the real claret palette and a light throwaway brand; no
rule below may assume `--color-primary` is dark or `--color-bg` is white.

## 1. Signature concept

> Warm-premium "guest house for cars" — an ivory split hero with a
> claret-matted framed photo hands off to a full-width numbered proof ledger
> of the dealer's credentials, with hairline-rule surface grammar,
> letterspaced EB Garamond serif-caps eyebrows over sentence-case serif
> display, and hospitality-toned aftercare storytelling in a warm voice.

Design intent for builders: this theme behaves like a well-run country
guest house. Pages are calm ivory "paper"; hierarchy is carried by hairline
rules (`--color-border`) and one serif display voice, never by shadows or
gradients. Brand-primary appears as *ribbon* elements — the header contact
strip, the mat behind the hero photo, ledger numerals, one full-width invite
band per page, the footer plate — and as nothing else. Credibility is
structural, not decorative: the proof ledger is the second thing every
visitor sees, and its numbered-hairline-row motif recurs quietly (spec
tables, how-it-works steps). Hero text NEVER sits on a photograph, so the
theme has zero scrim-dependence and survives any brand palette.

## 2. Voice

`personalityVoice: warm` — first-person plural, hospitable, concrete.

- "You're welcome any time — browse at your pace, the kettle's on."
- "Bring your old car with you. We'll value it while you look around."
- "Every car is checked and prepared in our own workshop before it goes up
  for sale."

Never: exclamation marks, "luxury"/"exclusive"/"elite", urgency pressure
("don't miss out"), or third-person distance.

## 3. Type system

- **Heading:** `EB Garamond` (Google), weights 500/600. Display uses 600.
- **Body/UI:** `Lato` (Google), weights 400/700.
- BrandStyles must load both via `buildGoogleFontsImport` (400;500;600;700
  for EB Garamond, 400;700 for Lato).

Scale — exactly 5 sizes per page (`oneBigMove: none`, cap holds):

| role | value | font |
|---|---|---|
| display (hero h1) | `clamp(2.1rem, 5.2vw, 3.4rem)` | EB Garamond 600, line-height 1.12 |
| title (section h2, ledger numerals, detail price) | `clamp(1.5rem, 3vw, 2.25rem)` | EB Garamond 600, line-height 1.18 |
| subtitle (card titles, h3) | `1.1875rem` | Lato 700 |
| body | `1rem` (16px floor everywhere) | Lato 400, line-height 1.65 |
| caption/eyebrow | `0.8125rem` (13px floor) | eyebrow: EB Garamond 600 UPPERCASE `letter-spacing: 0.16em`; captions: Lato 400 |

Title treatment: **sentence case** for all display/title/subtitle text.
Uppercase exists ONLY in the eyebrow role (serif, letterspaced — echoes the
wordmark). No global `text-transform` on `:where(h1-h4)`. `text-wrap:
balance` on display/title, `text-wrap: pretty` on leads. No `max-width` on
any title element — clamp is the only width control. Page-title clamp for
inner routes: `clamp(1.6rem, 4vw, 2.5rem)` (reuses the title slot).

## 4. Space & container

- Section vertical rhythm: `clamp(3.25rem, 7vw, 6rem)` top/bottom; mobile
  automatically lands near 3.25rem (≈60% of desktop).
- Standard container: `1200px` max, `1.25rem` side padding (1rem ≤640).
- Wide container (inventory list, detail mosaic): `max-width: none` with
  `clamp(1rem, 3vw, 2.5rem)` side padding; inventory grid 4-col ≥1600px.
- Grid gutters: `1.5rem` desktop, `1rem` ≤640.
- Header heights: contact strip 36px + nav row 64px desktop; single 60px row
  ≤640.

## 5. Surface grammar

- Radius scale: 0 (hero photo + mat, ledger), 4px (buttons, inputs, chips),
  6px (cards). Pills `999px` only for garage counters and status chips.
- Borders: 1px `var(--color-border)` hairlines are the primary structural
  device (ledger rows, card edges, section rules). Double-hairline (two 1px
  rules 4px apart) is reserved for the ledger band top edge and footer top
  edge — nowhere else.
- Shadows: NONE on header (border-bottom only), NONE on cards. Allowed only
  on floating chrome: open dropdown panels, mobile filter sheet, mobile
  sticky action bar — `0 -2px 12px color-mix(in srgb, var(--color-text) 12%, transparent)`
  (or +2px downward for dropdowns).
- Surface alternation: page sections alternate `bg` → `surface` →
  `bg`… Primary bands (`px-invite`, detail specs band, footer plate) may sit
  adjacent to either since the hue break separates them. Two same-token
  neighbours require a full-width hairline between them (state in the spec).
- Primary band recipes (canonical, palette-safe):
  - Ribbon/band: `background: var(--color-primary); color: var(--color-on-primary)`.
  - Deep plate (footer): `background: color-mix(in srgb, var(--color-primary) 85%, var(--color-text)); color: var(--color-on-primary)`.
  - Tint mat/wash: `color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))`
    with normal `var(--color-text)` foreground.
  Every `background:` pairs its `color:` in the same rule.

## 6. Motion grammar

- AOS only: `fade-up` (sections, 400ms) and `fade` (ledger entries, 350ms,
  60ms stagger). Nothing translates more than 16px. ≤720px AOS disabled
  (shared driver handles this).
- Hover transitions: `background-color/color/border-color 160ms ease`;
  hero-photo and card thumbs may scale `1.02` over 300ms on hover only.
- No marquees, no parallax, no autoplaying carousels.
- Reduced-motion: all >200ms effects collapse to opacity-only or none;
  scale hovers off.

## 7. Section-flow contract (every whitelisted route)

Shell order everywhere: Header → (route sections) → BrowseByMake band
(shell-owned, on `surface`, satisfies the homepage `directory` slot and the
detail-page makes-SEO panel) → Footer (deep plate). Cookie banner, WhatsApp,
PreviewBanner come from ThemeChrome untouched.

Global handoffs:
- Header nav row ends on `bg` with a 1px border-bottom; the first section of
  every route starts on `bg` (hero) or `surface` (page ribbon) — the ribbon
  supplies its own top hairline = allowed same-token adjacency.
- BrowseByMake sits on `surface`; footer plate follows (hue break). The last
  route section before it must NOT be `surface` unless it ends with a
  hairline — px-invite (primary) or reviews (`bg`) are the preferred closers.

Route flows (section → background token):

- **/** — hero (`bg`) → proof-ledger (`surface`, double-hairline top, single
  hairline bottom; promises: the ONLY numbered-credential element on the
  page — hero must not repeat awards/stats) → featured-stock (`bg`) →
  aftercare-suite (`surface`) → px-invite (`primary` band) → reviews (`bg`)
  → visit-lodge (`surface`) → [BrowseByMake `surface` — separated by
  hairline] → footer.
- **/about** — page-ribbon (`surface`) → story split: text + framed photo
  reusing the hero mat treatment (`bg`) → proof-ledger REUSED verbatim
  (`surface`) → aftercare-suite (`surface` → exception: separated from
  ledger by the ledger's bottom hairline) → px-invite (`primary`) → footer
  chain.
- **/contact** — page-ribbon (`surface`) → contact split (`bg`): enquiry
  form card left, visit-lodge details right (component reuse, unbanded) →
  footer chain.
- **/services** — page-ribbon (`surface`) → aftercare-suite EXPANDED (`bg`,
  6 cards: servicing/MOT, bodyshop, valeting, warranties, breakdown, EV) →
  how-it-works ledger-steps 01–03 (`surface`) → px-invite (`primary`) →
  footer chain.
- **/finance** — page-ribbon (`surface`) → finance intro + 3 numbered
  ledger-steps (`bg`) → assurance strip: representative-example card +
  disclaimer captions (`surface`) → enquiry form card (`bg`) → footer chain.
- **/part-exchange** — page-ribbon (`surface`) → sell/PX form section (`bg`,
  PX copy variant: "keep driving your car until handover") → ledger-steps
  01–03 (`surface`) → footer chain.
- **/sell-my-car** — page-ribbon (`surface`) → sell/PX form section (`bg`,
  sell copy variant) → ledger-steps 01–03 (`surface`) → reviews (`bg`) →
  footer chain.
- **/used-cars** — inventory hero band (`surface`, claret-matted frame:
  eyebrow + short serif headline + live in-stock figure + surfaced search &
  Make filter; build-rules §10 — replaces the old bare slim page-ribbon which
  read as unfinished) → inventory toolbar + showroom grid (`bg`, wide
  container) → px-invite (`primary`) → footer chain.
- **/used-cars/[slug]** — title strip (`bg`) → mosaic gallery (`bg`, wide) →
  claret specs band (`primary`, 6 icons) → content + sticky sidebar (`bg`) →
  similar-vehicles rail (`surface`) → footer chain. Mobile appends the
  sticky bottom action bar (price + Enquire).
- **/recently-sold** — page-ribbon (`surface`, warm valediction lead) →
  showroom grid of sold-variant cards (`bg`, wide) → px-invite (`primary`,
  copy variant "yours could be next") → footer chain.
- **/compare** — page-ribbon slim (`surface`) → compare table (`bg`, wide;
  spec rows use ledger hairlines; empty state per spec) → footer chain.
- **/wishlist** — page-ribbon slim (`surface`) → showroom grid of saved cars
  (`bg`, wide; empty state per spec) → footer chain.
- **/privacy-policy**, **/cookie-policy** — page-ribbon slim (`surface`) →
  prose container 720px measure (`bg`; h2s use subtitle size with hairline
  underlines) → footer chain.

## 8. Do-not list (theme-specific, on top of build-rules.md)

1. No gradients anywhere — zero gradient-painted surfaces (photo scrims
   exempt but this theme needs none: text never sits on photos).
2. No box-shadow on cards or header; shadows only on the three floating
   chrome cases in §5.
3. No uppercase outside the eyebrow role; display/titles are sentence case.
4. No gold/amber literal colors — the logo image is the only gold on the
   page. Warmth comes from `--color-primary` mixes only.
5. Numbered-ledger styling (oversized serif numerals + hairline rows) may
   appear at most ONCE per route (proof-ledger OR ledger-steps — never both
   on the same page except /about which reuses proof-ledger only).
6. No card carousels with autoplay; rails are manual scroll-snap.
7. Hero and page-ribbon carry no search cards, chip rows, or stat clusters.
8. Never assume claret: all primary bands use the §5 recipes and must remain
   legible under the light throwaway brand (on-primary token guarantees it).
9. Max ONE primary band per route (px-invite OR specs band); footer plate
   excluded from the count.
10. No hardcoded "Redgate", "Shiremoor", "Newcastle", award names, review
    counts, or "300" anywhere in TSX/CSS — all copy through
    `resolveText(brand, key)` with generic fallbacks.
