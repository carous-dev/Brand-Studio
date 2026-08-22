# Brandstudio Theme Contract

One contract, N identities. Every theme shares the same skeleton — file layout, token
vocabulary, widget stack, shell shape — so building a new theme and fixing bugs uniformly is
fast. Themes stay visually distinct through their own palette defaults, fonts, component CSS,
and section designs; only the *scaffolding* is standardized.

Conformance is machine-checked: `npm run check:contract` (`tools/check-theme-contract.mjs`).

---

## 1. Directory contract (required files)

Every theme under `app/themes/<id>/` must have:

| File | Role |
|---|---|
| `shell.tsx` | Exports `const themeShell: ThemeShellComponent`. Thin wrapper delegating to `<ThemeChrome>`. |
| `pages.ts` | Page registry (`ThemePageRegistry`). |
| `sections/index.tsx` | Section registry (`ThemeSectionRegistry`). |
| `recipes/index.ts` | Recipe registry. |
| `tokens.ts` | `themeTokens: ThemeTokenMap` (radii/spacing/typography/hero/shadows/borders/reviewStar…). |
| `theme.json` | id / name / description / status / isDefault. |
| `context/BrandStyles.tsx` | Injects the token `<style>` via `buildThemeTokens` + `renderThemeStyle`. |
| `styles/color-policy.css` | Maps `--color-*` → `--t-*` role tokens for this theme. |
| `lib/contact.ts` | `getBrandContactInfo(brand)` — normalized contact/phone/email. |

The first five are also enforced by `backend/services/theme_catalog.py::THEME_REQUIRED_FILES`
(themes missing them are dropped from the catalog → previews 500). The last four are enforced by
`check-theme-contract.mjs` and are added to `theme_catalog.py` only once all themes conform.

The **content contract** (`recipes/text-recipe.json` + `recipes/media-recipe.json` +
`lib/brand-text.ts`) is currently *advisory-but-staged* — see §9. Themes that adopt it get
fully LLM/operator-fillable copy and media; pmg-used-cars is the reference. Adopt it for every
new theme.

---

## 2. Token contract

The dashboard collects 4 brand colors; `backend/services/color_derive.py` derives the full 8
(`primaryColor, secondaryColor, accentColor, backgroundColor, textColor, surfaceColor,
mutedColor, borderColor`) onto `brand.theme.colors` (JS mirror `static/modules/color-utils.js`).

`context/BrandStyles.tsx` then emits the canonical CSS custom properties via the shared emitter
`app/themes/lib/theme-tokens.ts` — it CONSUMES `theme.colors`, never re-derives.

Pipeline: `theme.colors` → `buildThemeTokens()` → `--color-*` (+ extended) → `color-policy.css`
maps to `--t-*` roles → component CSS paints only from `var(--color-*)` / `var(--t-*)` /
`color-mix` (enforced by `tools/check-color-contract.mjs`).

**Emitted tokens** (see `buildThemeTokens`):
- **Core 8 (brand-overridable):** `--color-primary/-secondary/-accent/-bg/-surface/-text/-muted/-border`
- **Triad ext:** `--color-primary-strong`, `--color-on-primary`
- **Header/hero chrome:** `--color-header-bg/-text/-muted`, `--color-hero-overlay-start/-end`, `--color-hero-text-muted/-review-muted`, `--color-review-star`
- **Fixed paired tiers (theme-locked, NOT overridable):** `--surface-bg/-card-light`, `--text-on-light-strong/-muted`, `--border-on-light`, and the `-dark` equivalents (constants from `tools/check-palette-policy.mjs`)
- **RGB variants:** `--color-*-rgb`, `--surface-bg-dark/-light-rgb`
- **`--brand-*` alias mirror** (back-compat): primary/secondary/accent/background/text (+ `-strong`, `-on-primary`, `-rgb`)
- **Status:** `--state-success/-warning`, `--color-status-online/-offline`

**`--t-*` role tokens stay in each theme's `color-policy.css`** (they encode per-theme role
*policy*); the emitter produces only the raw palette. Keep that boundary.

---

## 3. Emitter API (`app/themes/lib/theme-tokens.ts`)

```ts
buildThemeTokens(colors: ThemeTokenColors | undefined, opts): Record<string,string>
renderThemeStyle({ vars, extras?, fontFamily?, fontImport?, scope? }): string
```

- `opts.defaults` — the theme's bespoke palette (this preserves identity). Resolution per token:
  `colors[key] ?? defaults[key] ?? hard fallback`.
- `opts.legacyAliases` — legacy vars a theme's CSS still reads (classic/gilded `--bg-*`/`--text-*`,
  fbm `--accent-primary`), merged verbatim. **Additive** — never remove legacy vars, so no visual
  regression.
- `opts.darkTier / brandAliasMirror / rgbVariants / status` — all default true.
- `extras` — hero-image vars, per-page image slots, per-theme scales (`--fbm-ember-*`), font overrides.
- `scope` — defaults `:root`; cnhcars passes `[data-theme-id="cnhcars-clone"]` (scoped block, no rename).
- Also exports shared `hexToRgb` + `escapeCssUrl` (stop copy-pasting them per theme).

A theme's `BrandStyles.tsx` becomes: build `vars` (with `defaults`), assemble `extras`, then
`<style dangerouslySetInnerHTML={{ __html: renderThemeStyle({ vars, extras, fontFamily, fontImport }) }} />`.

---

## 4. Chrome / widget contract (`app/themes/lib/ThemeChrome.tsx`)

The sanctioned widget set (do NOT fork): `@/app/widgets/{AnimateOnScroll, MotionFX, ScrollProgress,
PreviewBanner, CookieBanner, CarousWhatsAppWidget}`. `<ThemeChrome>` mounts them + skip-link +
route-gating + optional provider. A theme's `components/Shell.tsx` collapses to a thin `<ThemeChrome>`
call supplying its own `<Header/>`/`<Footer/>`, `classPrefix`, `cookie` voice, and (per-theme)
`provider` (its GarageProvider; cnhcars passes WishlistContext).

Brand the shared **CookieBanner** via props (`cookie.title/summary/cookiePolicyHref`) + `var(--color-*)`
retint — never fork it. WhatsApp is the CDN `CarousWhatsAppWidget` for all themes.

---

## 5. Shell contract

`shell.tsx` exports `const themeShell: ThemeShellComponent`. The inner shell renders `<ThemeChrome>`;
it must NOT hand-roll a `KNOWN_ROUTES` literal — import from `app/themes/lib/known-routes.ts`
(`isKnownRoute`, `extraRoutes` for theme-specific pages).

---

## 6. CSS scoping

Component CSS is CSS-modules-hashed or theme-prefixed (`auto-`, `fbm-`, `qb-`, …). Cross-theme
isolation relies on `[data-theme-id="<id>"]` scoping, NOT prefix renames (prefix unification is
explicitly out of scope). Never paint raw color literals — see `docs` color-contract policy.

---

## 7. Conformance

- `npm run check:contract` — required files, emitter usage / core-8 emission, no widget forks,
  `ThemeChrome` + canonical routes. Exit 0 pass / 1 fail / 2 bad input.
- Companion gates: `tools/check-color-contract.mjs` (no raw color literals), `tools/audit-theme.mjs`
  (Phase 10c), `tools/check-palette-policy.mjs` (WCAG).
- `/new-theme` runs `check-theme-contract.mjs --id <id>` as Phase 10e.

---

## 8. Content contract — text + media (the "never static" layer)

Every brand-voice string and every theme image/video is a declared **slot** so the backend
pipeline can fill it per-dealer and no preview looks templated. Two manifests, both consumed via
shared resolvers (no per-theme copies):

**Text** — `recipes/text-recipe.json` → shared `resolveText`:
- Schema: `{ sections: [{ id, label, fields: [{ key, label, type:'short'|'long', default, maxLength, aiHint }] }] }`.
- `default` may embed tokens: `{brandName} {namePossessive} {city} {county} {cityish} {streetLine} {postcode} {year} {tagline}`. The runtime interpolates AFTER resolution — never write `{tokens}` into `brand.text`.
- Bind per theme with a 2-line `lib/brand-text.ts`:
  `export const { resolveText, resolveTexts, textRecipe } = makeTextResolver(recipe)`
  (`makeTextResolver` in `app/themes/lib/theme-text.ts`).
- Resolution: `brand.text[key]` (operator/LLM) → recipe default (interpolated) → `''`.
- Gate: `node tools/check-text-contract.mjs --id <id>` flags hardcoded multi-word JSX copy /
  `placeholder|aria-label|title|alt`. Escape genuine chrome with `/* text-static-ok */`.

**Media (image + video)** — `recipes/media-recipe.json` → `resolveMedia` + `<BrandMedia>`:
- Same slot schema as the legacy `image-recipe.json` (loaders read `media-recipe.json` first,
  fall back to `image-recipe.json`) **plus** `type:'image'|'video'` and, for video, `poster`
  (slot key or path), `posterDefault`, `loop`, `autoplay`, `stockHint`. Optional top-level
  `archetype` biases prospect auto-fill.
- Image slots persist to `brand.images[key]` (unchanged; also emit `--brand-image-*` via
  `buildImageVars`). Video slots persist to `brand.media[key]`.
- Render media with `<BrandMedia recipe={mediaRecipe} brand={brand} slotKey="…"/>`
  (`app/themes/components/BrandMedia.tsx`): image → `<img>`; video → poster still on the server /
  reduced-motion / ≤640px / missing clip, progressively upgrading to an autoplaying
  muted-inline clip only on capable clients. Never blank.
- Gate: `node tools/check-image-contract.mjs --id <id>` (also validates every video slot has a
  poster). `npm run check:content` runs both content gates.

**Backend auto-fill** (`app.py`): `POST /api/v1/preview/create` fills every empty slot,
operator-wins — text via the LLM (`generate_brand` + the theme's text-recipe), images from
`tools/theme-image-catalogue.json` (archetype × slot), video from `tools/theme-video-catalogue.json`
(archetype × role); when no clip resolves, `<BrandMedia>` shows the poster.

## 9. Conformance status (living)

All 14 themes conform as of 2026-07-20 (`npm run check:contract` → 14/14). Run the
checker for live status; the table records the migration landing.

| Theme | Conforms | Notes |
|---|---|---|
| warwick-hall-cars-bespoke | ✅ | reference (cleanest) |
| axis-autos-bespoke | ✅ | `--spec-accent-*` in extras; `--surface-bg-dark-rgb` override |
| buy4lessuk-bespoke | ✅ | `--b4l-*` palette in extras; TopBar/FixedCtaBar preserved |
| auto-wow-uk-bespoke | ✅ | cookie fork removed |
| auto-wow-uk-bespoke-02 | ✅ | custom `--state-*` + rgb overrides in extras |
| dual-stock-modern-bespoke | ✅ | dark-surface + whatsapp tokens in extras |
| kain-motors-bespoke | ✅ | `--kain-*` in extras; KainA11yToolbar preserved |
| queensbury-cars-bespoke | ✅ | topbar/reserve tokens in extras |
| showroom-shine-cars-bespoke | ✅ | classPrefix `shr`; global cookie-key bug fixed |
| fbm-motors | ✅ | hybrid legacy via legacyAliases; `--fbm-*` in extras; lean widgets; authored color-policy.css |
| springalls-classic | ✅ | 4 forks removed (AOS/preview/cookie/whatsapp) |
| classic-dealer | ✅ | legacy `--bg-*/--text-*/--accent-*` via legacyAliases; authored color-policy.css + lib/contact.ts |
| gilded-drive | ✅ | full legacy set via legacyAliases; authored color-policy.css + lib/contact.ts; ContactBar preserved |
| cnhcars-clone | ✅ | scoped `[data-theme-id]` emission; WishlistContext preserved; WhatsAppFab→CarousWhatsAppWidget |
