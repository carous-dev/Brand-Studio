# Fix — header, iteration 1 → 2

Theme: redgate-lodge-bespoke · Component: header
Applies to verdict: verdicts/header-1.json

---

## header-1-01 — plaque renders broken-image sitewide

**Decision: spec-change + fix.**

Root cause confirmed from the evidence (`header-1-home-w1440.png`,
`header-1-home-w505.png`, `crop-header-1-used-cars-w1440.png`): the QA brand
has no `brand.logo`, so `BrandLogo` falls to tier-2 `THEME_LOGO`
(`/themes/redgate-lodge-bespoke/logo.png`), which 404s. The `onError` that
should degrade to the wordmark does not fire on the captured page (classic
SSR/hydration race: an always-present `<img>` whose src 404s before React
attaches the handler never runs `onError`, so `themeFailed` stays `false` and
the broken `<img>` + wrapped alt text persists at every width).

Design decision (locked into the spec — see the new **Logo policy** block in
`components/01-header.spec.md`): this is a light ivory-plaque theme whose
identity treatment IS the serif wordmark. We deliberately DO NOT ship a raster
`/themes/redgate-lodge-bespoke/logo.png`:
- the operator's real Redgate mark is white-on-transparent (built for a dark
  header) and would be invisible on the ivory plaque, so it is the wrong theme
  default; and
- a known-404 raster tier is what produced the broken-image box.

The styled serif wordmark serves the build-rules §5 "theme default" role for
this theme. The plaque stays on `var(--color-bg)` (NOT claret/dark) so real
brand logos — usually dark-on-light or full-colour — read on it.

### Builder instructions

**File: `app/themes/redgate-lodge-bespoke/components/BrandLogo.tsx`**

Collapse the fallback from three tiers to two (`brand.logo` → serif wordmark).
Remove the theme-raster tier entirely so no `<img>` ever requests a path this
theme does not ship, and so the logo-less case renders the wordmark directly
(no `onError` race).

1. Delete the constant `const THEME_LOGO = '/themes/redgate-lodge-bespoke/logo.png'`.
2. Delete the `themeFailed` state (`const [themeFailed, setThemeFailed] = useState(false)`).
3. Replace the two derived flags:
   - remove `showThemeDefault`
   - change `showWordmark` to: `const showWordmark = !brandLogo || primaryFailed`
4. Remove the entire `{showThemeDefault && ( <img src={THEME_LOGO} … /> )}`
   block.
5. Keep the `brand.logo` `<img>` block exactly as-is (plain `<img>`, `onError`
   → `setPrimaryFailed(true)`), and keep the final
   `{showWordmark && <span className={styles.wordmark}>{brandName}</span>}`.
6. Update the doc comment to describe a 2-tier fallback (brand.logo → serif
   wordmark) and note that this theme ships no raster default by design.

Resulting render logic (target):
```
const showWordmark = !brandLogo || primaryFailed
// <span wrap>
//   {brandLogo && !primaryFailed && <img src={brandLogo} … onError={() => setPrimaryFailed(true)} />}
//   {showWordmark && <span className={styles.wordmark}>{brandName}</span>}
// </span>
```

**File: `app/themes/redgate-lodge-bespoke/components/BrandLogo.module.css`** —
no change required. `.wordmark` already sets `white-space: nowrap` and
`clamp(1.25rem, 2.4vw, 1.6rem)` on `var(--color-text)` (dark serif on ivory),
which is the intended default. Do NOT let it wrap (the two-line wrap in the
iter-1 shots was the `<img alt>`, not the wordmark — it disappears once the
wordmark span renders).

**Do NOT** create `public/themes/redgate-lodge-bespoke/logo.png`. The theme
default is the wordmark by design.

### Verify (iter-2)
- At 505 and 1440 on `/` and `/used-cars`, the QA brand (no `brand.logo`)
  shows the dark serif wordmark inside the plaque — no broken-image glyph,
  single line.
- Network panel / served HTML shows no request to
  `/themes/redgate-lodge-bespoke/logo.png`.
- A brand WITH a valid `brand.logo` still renders that raster; a brand whose
  `brand.logo` 404s degrades to the wordmark (onError path intact).

---

## header-1-02 — hardcoded overlay labels

**Decision: fix.**

Route the three visible overlay labels through `resolveText`. `resolveText` is
already imported (`Header.tsx:9`) and used elsewhere in the file.

Recipe keys: `footer.wishlist` and `footer.compare` already exist in
`recipes/text-recipe.json`. A new `header.whatsapp` key has been added to the
header section of that recipe (default `"WhatsApp us"`) — reuse it.

### Builder instructions

**File: `app/themes/redgate-lodge-bespoke/components/Header.tsx`**

- Line 224 — replace `<span>Wishlist</span>` with
  `<span>{resolveText(brand, 'footer.wishlist')}</span>`.
- Line 228 — replace `<span>Compare</span>` with
  `<span>{resolveText(brand, 'footer.compare')}</span>`.
- Line 243 — replace `<span>WhatsApp us</span>` with
  `<span>{resolveText(brand, 'header.whatsapp')}</span>`.

Leave the surrounding `<Link>` / `<a>` structure, count pills, and icons
untouched. `aria-label`s that are not visible copy do not need routing.

### Verify (iter-2)
- Grep `Header.tsx` for the literals `>Wishlist<`, `>Compare<`,
  `WhatsApp us` — none remain as hardcoded JSX text.
