# Build rules digest — non-negotiables for every theme-builder agent

Distilled from `.claude/skills/new-theme/SKILL.md` (canonical on any conflict)
plus accumulated review feedback. Builders and the verifier treat every line
as a hard rule unless marked *(advisory)*. Rules the verifier can grep are
tagged `[grep]`; rules it judges from screenshots are tagged `[visual]`.

## 1. Theme contract (mechanical gates)

- Required files: `shell.tsx`, `pages.ts`, `sections/index.tsx`,
  `recipes/index.ts`, `tokens.ts`, `theme.json`, `context/BrandStyles.tsx`,
  `styles/color-policy.css`, `lib/contact.ts`. Folder name must equal
  `theme.json.id` or the Flask catalog silently drops the theme.
- Shell renders shared `<ThemeChrome>`; import `KNOWN_ROUTES` from
  `@/app/themes/lib/known-routes` — never hand-roll it. [grep]
- NEVER fork shared widgets (`CookieBanner`, `AosProvider`, WhatsApp/Support,
  `PreviewBanner`) into the theme — they come via ThemeChrome. [grep]
- `BrandStyles.tsx` uses `buildThemeTokens` and MUST call
  `buildGoogleFontsImport` — without the `@import url(...)` the heading font
  silently falls back to a system font. [grep]
- Gates that must be green before ship: `theme:sync`, `tsc`,
  `check-theme-contract.mjs`, `check-color-contract.mjs`, `audit-theme.mjs`,
  `check-theme-uniqueness.mjs`, `check-theme-similarity.mjs --peer-threshold 0.55`.

## 2. Color policy — 8 natural-role tokens

- Only `var(--color-primary|secondary|accent|bg|surface|text|muted|border)`,
  `--t-*` aliases derived from them, or `color-mix(in srgb, var(--color-*) N%, …)`.
  ZERO raw hex/rgb/hsl literals in component CSS/TSX. [grep]
- Natural roles, never inverted: `--color-bg` is always a background,
  `--color-text` always a foreground. `background: var(--color-text)` is
  banned; `color: var(--color-bg)` only on a CTA whose same rule sets
  `background: var(--color-primary)`. [grep]
- **Paired surfaces**: every rule that sets `background:` sets `color:` in the
  same rule or enclosing scope. Never let the cascade pick the foreground. [grep]
- Photo scrims/lightbox chrome may use literal `rgba(0,0,0,x)` /
  `rgba(255,255,255,x)` with a `/* photo-scrim-ok */` comment. On dark
  plate-on-plate sections use explicit `#ffffff`, not inherited
  `rgba(255,255,255,.7–.88)` (renders ~#a0a0a0).
- Status tokens (`--t-success/-error/-warning/-info`) stay literal.
- Hero over an unknown-brightness brand image: fixed uniform DARK overlay
  (e.g. `linear-gradient(rgba(8,16,32,.86), rgba(8,16,32,.78))`) + white
  captions. Never a light/diagonal overlay, never `var(--color-bg)` scrim. [visual]
- Dark-leaning designs MUST also work when the brand palette is LIGHT —
  no assumption that `--color-bg` is dark. Inputs use natural surface
  (`color-mix` over `--color-bg`), not hardcoded dark shells.

## 3. CSS scoping & structure

- Global stylesheets (`base.css`, `color-policy.css`, …): every rule wrapped in
  `:where(body[data-theme-id='<id>'])`. NO bare element selectors — a bare
  `header{}` / `footer{}` styles in-card `<header>` elements and leaks across
  themes. [grep]
- No blanket `:where(a){color:…}` link rules; style links per component.
- CSS modules co-located with their importer — never import another folder's
  `page.module.css` (Turbopack export-cache corruption). [grep]
- When copying a component between themes, rename every theme-specific class
  and the default export — `.auto-btn` from another theme won't exist here. [grep]
- Mobile-first: base styles target ~360px; add via `@media (min-width:…)` only.
  `max-width` media queries are audit warnings. [grep]
- **`min-width` breakpoints STACK — a narrower one's rules stay active in wider
  ones.** If a mid breakpoint sets `nth-child` padding/border resets (e.g. a
  2×2 grid flushing outer edges) and a wider breakpoint changes the column
  count, the wider block MUST re-assert those values at matching `nth-child`
  specificity — a bare `.entry{padding:…}` (0,1,0) does NOT override a lingering
  `.entry:nth-child(2n+1){padding-left:0}` (0,2,0), so the reset leaks and a
  column crams against its divider / grows a stray hairline. (Redgate proof-
  ledger hit this 2026-07-30.)
- `[hidden]{display:none!important}` wherever a class also sets
  `display:flex|grid|block` (modal-won't-close bug).
- Pages under `pages/**/page.tsx` are Server Components — NO `'use client'`
  in page wrappers; interactivity lives in co-located `components/*.tsx`. [grep]

## 4. Routes & navigation

- Route whitelist: `/`, `/about`, `/contact`, `/services`, `/finance`,
  `/part-exchange`, `/sell-my-car`, `/used-cars`, `/used-cars/[slug]`,
  `/recently-sold`, `/compare`, `/wishlist`, `/privacy-policy`,
  `/cookie-policy`. Any other `<Link href>` 404s — note it's **/sell-my-car**,
  not /sell-your-car. [grep]
- Header nav is LEAN: no Home/About/Contact items — wordmark clicks home,
  About/Contact live in footer Quick Links. (Overrides older "Home first"
  guidance per 2026-06 feedback.)
- Active nav: `usePathname()` + prefix-match (`/used-cars/<slug>` keeps
  Used Cars active) + `aria-current` + a visible brand-primary treatment.

## 5. Header / top bar

- Sticky header: **no box-shadow ever** — `border-bottom` only. [visual+grep]
- Header always has a visible background from first paint (solid or
  translucent backdrop-blur over `--color-bg`) — never transparent-until-scroll.
- Top contact bar *(menu — CONTENTS required, arrangement/styling is the
  design's; the distinctiveness contract beats any single-variant reading)*:
  location chip ("{city}, {county}" via `getBrandContactInfo`), open/live-stock
  status chip, social icons, phone CTA. Social icons render ALL FOUR at full
  opacity even when URLs are missing.
- Mobile ≤640: top bar collapses to ONE nowrap row (no hardcoded city text),
  socials hide, wordmark clamps ~1.25rem, desktop CTAs hidden with
  `!important`, hamburger opens a full-screen list-style overlay (items
  ≥56px tall, phone/WhatsApp/socials inside).
- Brand logo: 3-tier fallback `brand.logo` → `/themes/<id>/logo.png` → text
  wordmark, in header, footer, and mobile overlay. CDN marque/logo SVGs render
  as plain `<img>` — never CSS `mask` (cross-origin mask paints invisible).

## 6. Hero

- SIMPLE + BALANCED: 1 eyebrow, 1 headline (≤50ch, wraps ≤2 lines at every
  width), 1 lead, ≤1 primary CTA (+ optionally one ghost). NO search cards,
  chip rows, or stat clusters inside the hero — move them below. [visual]
- Headline `clamp()` upper bound ≤3.6rem (≤4.4rem only for two-word
  statements). **Never `max-width` on title elements** — font-size is the only
  width control. Use `text-wrap: balance` on titles, `text-wrap: pretty` on
  leads, intentional `<br/>` where it helps. [grep+visual]
- One ornament max; a hairline "assurance strip" (icon + short line ×3) may
  close the hero — not a chip cluster.
- Hero image: `brand.heroImage` FIRST, then `brand.images.hero`, then theme
  default — layered `background-image` so a 404 reveals the theme default.
- Any decorative backdrop SVG: content wrapper needs `position:relative;
  z-index:1` above it.

## 7. Typography

- Respect the concept's `titleTreatment` — not every theme is uppercase
  condensed-bold. No global `text-transform: uppercase` on `:where(h1-h4)`.
- Dark-band section headers own their typography locally (module CSS) — no
  global eyebrow/title utility classes that leak white backgrounds.
- Body ≥16px mobile; captions ≥13px; ≤5 distinct sizes per page unless
  `oneBigMove: typography-scale`.

## 8. Mobile is NOT a shrunken desktop

- ≤640px: single column (2-col only for genuinely paired label/value rows),
  hide decorative layers, ONE primary CTA full-width, trim chips to 1–2,
  single-image hero, tighten section padding to ~60–70% of desktop.
- Long pages (detail/finance/services): fixed bottom action bar with the one
  primary action. Modals become full-screen sheets. Forms one field per row,
  full-width submits. Touch targets ≥44×44.
- Page heroes on mobile: modest — top padding 56–160px, lead hidden ≤480px,
  one chip max, short title.
- Rows of N that can't stack (logo strips, similar vehicles, galleries):
  horizontal scroll-snap rail, never a cramped shrunken grid.
- Verify mobile at **505px** (headless Chrome clamps ~500px min; 505 still
  matches the ≤767 MQ). A 390px screenshot request silently renders ~500px
  and fakes x-overflow.

## 9. Vehicle card

- Image area `aspect-ratio: 4/3` with a LIGHT fallback bg
  (`--surface-bg-light` equivalent via tokens); inline `backgroundImage` must
  declare `cover / center / no-repeat` or the thumb tiles. [grep]
- Title single-line ellipsis; no year badge; wishlist+compare = transparent
  primary-tinted 22×22 glyphs top-left over the photo (no bg/border).
- Spec chips: cap at 3 via `:nth-child(n+4){display:none}`; specs area is a
  2-col grid, not flex-wrap (chips drift between sibling cards).
- Whole card clickable via stretched `.cardLink` — overlay-only "View details"
  fails on touch.
- Compact variant (rails): keep specs + price, hide ONLY the CTA buttons.
- Sold variant (`sold` prop): grayscale photo + SOLD stamp + struck price +
  actions hidden — buyers must not try to reserve sold cars.

## 10. Inventory (/used-cars)

- **The listing page gets a REAL hero, never a bare page-ribbon.** A plain
  left-aligned "Cars in stock / N cars" ribbon reads as unfinished. Give
  /used-cars a lean, elevated hero band (eyebrow + short headline + live
  stock count + the search/primary filter, on a distinct surface with the
  theme's ornament grammar) that sits above the toolbar — designed to the
  theme's aesthetic, not the generic inner-page ribbon. [visual] (corrected
  2026-07-30 — Redgate inventory shipped a bare ribbon and read as poor.)
- Full-width container for the list (per-page `.wideInner`, `max-width:none`;
  4-col grid ≥1600px) — not the 1240px inner.
- Toolbar: 2-row — result count + Filters toggle on top; search + 3 equal
  selects below. Chips `flex: 0 0 auto` (no stretch), labels always visible,
  Sort = icon+value+chevron with an invisible native `<select>` overlaid.
  Wishlist/Compare counters from `useGarage()`. Sidebar filter header keeps
  title + Reset only (no counter there).
- `meta.available.makes/.bodies` are `string[]` — normalise at the boundary;
  treating them as `{key,count}[]` renders empty dropdowns. [grep]

## 11. Vehicle detail

- Structure: title strip ABOVE gallery → full-width gallery mosaic → dark
  6-icon specs band → content + sticky sidebar (price, CTA, contact, key
  facts). Mobile order: gallery → info → description; thumbs = scroll rail;
  sticky bottom bar = price + full-width Enquire only. Grid children need
  `min-width:0`; page `overflow-x:hidden`.
- **ONE container gutter for the whole page — title strip, specs-band
  CONTENT, and body must all left-align to the same inner
  max-width/padding.** Full-bleed BACKGROUNDS (gallery mosaic, dark specs
  band) are fine, but their CONTENT stays inside the shared inner container —
  never flush to the viewport edge while the body below is inset. The
  title/price flush-left with no gutter while the description is inset is the
  canonical failure. The specs band's grid must FIT its columns inside the
  container (`min-width:0` cells, `grid-template-columns` that sum to the
  inner width) — a clipped/half-visible extra column or right-edge bleed is a
  horizontal-overflow bug. [visual] (corrected 2026-07-30 — Redgate detail
  shipped title+specs flush-left with a specs-band overflow.)
- Gallery extraction walks ALL payload paths (`.gallery/.images/.media/.photos`
  at root, under `.vehicle`, under `.advert`) or imageful cars show "Photos
  coming soon".
- Enquiry/Reserve: hosted Carous CDN widgets via `lib/external-widgets.ts`
  (2 `afterInteractive` Scripts) with `isExternal*Ready()` fallback to the
  local `EnquiryModal`; gallery stays local.

## 12. Content & data plumbing

- Every rendered string routes through `resolveText(brand, key)` backed by
  `recipes/text-recipe.json`; generic fallbacks — NEVER the seed dealer's
  name/city hardcoded (it leaks into every reused preview). [grep]
- `brand.location.address` is an OBJECT — use `getBrandContactInfo`, never
  render it or cast `as any`. [grep]
- `brand.openingHours` has many shapes and is often "Appointment Only"/empty —
  key-existence ≠ open; don't render a false "Closed".
- Server fetches to `/api/inventory` etc. MUST thread `?brand=<slug>` via
  `getBrandSlugFromRequest()`; client components read `useBrand().slug`. [grep]
- Images go through `optimizeImageUrl` → `/_next/image` (card 640 / hero 1920 /
  section 1280) — no raw remote `<img>` for known slots. [grep]
- **Image contract — every theme image is DECLARED, never static.** Each
  brand-overridable image is a slot in `recipes/image-recipe.json`
  (`{key,label,page,role,aspect,width,default,aiHint}`); `BrandStyles` emits all
  slots' `--brand-image-<kebab(key)>` vars via `buildImageVars(brand, recipe)`
  (never hand-rolled), and components resolve them with
  `themeImageCss(recipe, brand, key)` / `themeImageUrl(...)` from
  `@/app/themes/lib/theme-images` — NEVER a literal `/themes/…` path or an inline
  `brand.images.X` read. One manifest entry auto-surfaces a dashboard Page-Images
  upload control (Flask `GET /api/themes/<id>/image-recipe`). Exempt: per-vehicle
  inventory feed images, `brand.logo`/`brand.favicon`, marque logos — annotate a
  genuinely-static image with `// image-static-ok`. `node tools/check-image-contract.mjs --id <id>`
  is a Stage-6 ship gate (hard-blocks a theme that ships a manifest). [grep]
- `BrowseByMake` band lives in the SHELL (between `<main>` and `<Footer>`),
  data from `meta.available.makes`, 4 cols ≥1024 — never duplicated per page.
  Chips show the real **marque logo**, not a letter tile: a plain `<img>` from
  the simple-icons jsDelivr CDN
  (`https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/<slug>.svg`,
  slug = make lowercased + NFD + `[^a-z0-9]` stripped, with overrides like
  mercedesbenz→mercedes, vw→volkswagen), with `onError` → the make's initial
  as fallback. **Plain `<img>`, NEVER a CSS `mask` of the CDN SVG** — the
  cross-origin mask paints invisible (existing MakeLogo mask components carry
  this latent bug). Add `audit-ignore: perf-raw-img` (external marque SVG, not
  an inventory slot). [visual] (added 2026-07-30.)

## 13. Motion & misc

- AOS: `AnimateOnScroll` self-injects its CSS — mount it + `data-aos` attrs;
  never inline AOS CSS into base.css. ≤720px disabled.
- CSS marquees: under `prefers-reduced-motion` slow them + pad short lists —
  never `animation:none` (kills the -50% loop and leaks layout).
- Any animation >200ms respects `prefers-reduced-motion`.
- Cookie banner (shared widget) is a slim full-width bottom strip — don't
  restyle it into a centered card.
- Semantic HTML, single `<h1>`, real `<button>`/`<a>`, labels on every input,
  visible focus states, skip-to-content preserved from the skeleton.

## 14. Furnishing — rich by default (the conveyor belt)

**Every component is FURNISHED, never plain.** Restraint is no longer the
governing constraint — it is a **quality floor**: it blocks only amateur-busy,
illegible, broken-on-mobile, or contract-violating results. Within that floor,
richness is EXPECTED — a component that ships plain (no imagery/motion/depth/
micro-interaction where the archetype wants it) is a **defect the verifier
FAILs** and routes to the furnisher. (This supersedes the older "restraint
always wins over futuristic/motion" clause in new-theme SKILL.)

**Archetype-gated vocabulary — futuristic where it fits, refined where it
doesn't. The furnisher picks from the row matching the concept's archetype:**

| Archetype | Furnishing vocabulary |
|---|---|
| `modern` | full neon: `mfx-glow-pulse/-orbit`, `mfx-text-glow`, `mfx-scan`, `CanvasFX particle-drift`, gradient CTAs, split-grid depth |
| `industrial` | `CanvasFX vector-grid`, grid/reticle overlays, category badges, sharp-corner strips — **NO gradients** |
| `rugged` | `CanvasFX vector-grid`, monochrome sharp strips, `mfx-border-glow`, gritty imagery |
| `luxury` / `editorial` / `prestige` | rich + REFINED (not neon): cinematic bg imagery, `CanvasFX aurora-light` (soft brand light), gold/hairline rules, elegant `mfx-spotlight`, ken-burns, tasteful reveals |
| `classic-warm` / `classic-trad` | warm imagery, soft shadow depth, gentle reveals, one quiet glow accent |
| `minimalist` | restrained — ≤1 crisp accent, precise motion; **no glow/gradient/canvas floods** (its ban stands) |

**Primitives to reach for (all token-driven + guarded — reuse, don't reinvent):**
- `MotionFX` `.mfx-*` (glow-pulse/-orbit, shimmer, scan, text-glow, border-glow,
  float, tilt, grid-drift, **spotlight** [cursor-reactive], pulse-dot) — auto-
  freeze under reduced-motion + ≤720px.
- `AnimateOnScroll` `data-aos` (20 entry variants) + `data-aos-delay` stagger.
- `ScrollProgress` `data-mfx-scroll` (parallax/blur/zoom on hero/feature media).
- `CanvasFX` (`<CanvasFX variant="particle-drift|aurora-light|vector-grid" />`)
  — opt-in per positioned section; self-guards (reduced-motion/≤640px → static
  token wash, pauses off-screen + tab-hidden, DPR≤2).
- Imagery via the §12 image contract (`themeImageCss`), never a literal path.

**Hard floors furnishing must NOT cross (unchanged):**
- Tokens/`color-mix` only; paired surfaces; decorative els `aria-hidden` +
  `pointer-events:none`.
- Heavy decor gets a theme-scoped `*-decor-mobile-hide` (`display:none` ≤640px);
  **mobile stays CALM** regardless of how rich desktop is (§8 still governs).
- Reduced-motion safe; animations >200ms respect it; AOS ≤720 off.
- Hero simplicity (§6), tap targets ≥44px, single `<h1>` — furnishing adds
  depth/motion/imagery, never more competing CTAs/chips.
- Contracts hold: `check-color-contract`, `check-image-contract`, `audit-theme`
  stay green after furnishing.

**Verifying motion furnishing:** headless Chrome defaults to
`prefers-reduced-motion: reduce`, so the window-mode desktop shots
(505/768/1024/1440) render motion FROZEN — judge *static* richness (imagery,
depth, layered composition, ornament) there. Motion (canvas/ken-burns/mfx) is
verified via the device-mode shots (`--device …`, which force the rich state)
plus a computed-style/canvas-pixel probe (e.g. `.cfx` not `.cfx-static`, canvas
painting, `animation-name` set). The `--reduced-motion` device run must show the
static wash + zero animation — that contrast IS the guard test.
