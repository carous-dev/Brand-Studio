# Builder brief — vehicle-detail redesign (redgate-lodge-bespoke)

Mode: REDESIGN (design iteration, not a verifier fail). Difatha reviewed the
live 2014 Ford C-Max detail page and called it "poor". Root causes: the
description renders as a raw feed dump (and leaks the dealer's phone/name/
payment/booking lines), the title/price masthead is a thin strip with a
floating price, the specs are duplicated (band + full table), empty spec rows
render as "—", and the left column reads sparse.

Apply the changes below verbatim. Do NOT touch the §11 hard rules: title above
gallery, gallery mosaic, dark band light-brand-safe with paired on-primary,
sticky sidebar + mobile bottom bar, `min-width:0` grid children,
`overflow-x:hidden`, CDN enquiry/reserve + local `EnquiryModal` fallback,
gallery extraction. Tokens/`color-mix` only (no hex). All new strings via
`resolveText`.

Files:
- NEW `pages/used-cars/[slug]/parseDescription.ts`
- `pages/used-cars/[slug]/DetailClient.tsx`
- `pages/used-cars/[slug]/page.module.css`
- `recipes/text-recipe.json` (add the new copy keys)

---

## 1. NEW helper — `parseDescription.ts` (the #1 fix)

Create `pages/used-cars/[slug]/parseDescription.ts` (co-located TS — safe to
import from `DetailClient.tsx`; do NOT put it in another folder). It turns the
raw feed blurb into refined highlights + prose and DROPS dealer contact/payment/
booking noise.

```ts
export type ParsedDescription = { highlights: string[]; prose: string[] }

export type DescriptionContext = {
  make: string
  model: string
  derivative: string
  reg: string
  title: string
  priceText: string
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '')

const RE_PHONE = /(?:\+?44|\b0)\s*(?:\d\s*){9,}/
const RE_CONTACT = /\b(call|ring|phone|txt|text|whatsapp|dm|e-?mail|contact us|contact me)\b/i
const RE_PAYMENT = /\b(bank transfer|bacs|paypal|payment (?:via|by|is|method|preferred)|cash only|card payment|deposit (?:secures|required|of))\b/i
const RE_BOOKING = /\b(book|arrange|to view|viewing by|test drive|by appointment|appointment only|come and see)\b/i
const RE_PLEASE = /^please\b/i
const RE_BARE_PRICE = /^£?\s?\d[\d,]*(?:\.\d+)?\s*(?:ono|ovno|o\.n\.o\.?)?$/i
const RE_SPEC_TOKEN = /^\d(?:\.\d)?\s?(?:l|litre|tdci|tsi|dci|cdti|hdi|vti|bhp|ps|cc|v\d)\b/i

export function parseVehicleDescription(
  raw: string,
  ctx: DescriptionContext,
): ParsedDescription {
  if (!raw) return { highlights: [], prose: [] }

  const ids = new Set(
    [ctx.make, ctx.model, `${ctx.make} ${ctx.model}`, ctx.derivative, ctx.reg, ctx.title]
      .map(norm)
      .filter((v) => v.length > 2),
  )
  const priceNorm = norm(ctx.priceText)

  const fragments = raw
    .split(/[\r\n]+|[•·‣▪|]+|(?:\s+\/\s+)/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const isNoise = (frag: string): boolean => {
    const nf = norm(frag)
    if (RE_PHONE.test(frag)) return true
    if (frag.replace(/\D/g, '').length >= 10) return true
    if (RE_CONTACT.test(frag)) return true
    if (RE_PAYMENT.test(frag)) return true
    if (RE_BOOKING.test(frag)) return true
    if (RE_PLEASE.test(frag)) return true
    if (ids.has(nf)) return true
    if (RE_BARE_PRICE.test(frag) || (priceNorm.length > 1 && nf === priceNorm)) return true
    if (RE_SPEC_TOKEN.test(frag) && frag.split(' ').length <= 2) return true
    return false
  }

  const highlights: string[] = []
  const seen = new Set<string>()
  const prose: string[] = []

  for (const frag of fragments) {
    if (isNoise(frag)) continue
    if (frag.split(/\s+/).length <= 6 && frag.length <= 48) {
      const clean = frag.replace(/[.!]+$/, '').trim()
      const cap = clean.charAt(0).toUpperCase() + clean.slice(1)
      const key = cap.toLowerCase()
      if (!seen.has(key) && highlights.length < 8) {
        seen.add(key)
        highlights.push(cap)
      }
    } else {
      prose.push(frag)
    }
  }

  return { highlights, prose }
}
```

---

## 2. `DetailClient.tsx`

### 2a. Import the helper + a tick icon
- Add `import { parseVehicleDescription } from './parseDescription'`.
- Add `Check` to the existing `lucide-react` import.

### 2b. Replace the description memo (currently lines ~131–134)
Delete the `descriptionParagraphs` memo. Add:

```tsx
const priceText = formatPrice(vehicle.price) || poaLabel  // (already exists — keep)

const { highlights, prose } = useMemo(
  () =>
    parseVehicleDescription(vehicle.description, {
      make: vehicle.make,
      model: vehicle.model,
      derivative: vehicle.derivative,
      reg: vehicle.reg,
      title: vehicle.title,
      priceText,
    }),
  [vehicle.description, vehicle.make, vehicle.model, vehicle.derivative, vehicle.reg, vehicle.title, priceText],
)
```

### 2c. New copy labels (near the other `resolveText` calls)
```tsx
const priceLabel = resolveText(brand, 'detail.price_label') || 'Price'
const highlightsTitle = resolveText(brand, 'detail.highlights_title') || 'Highlights'
const aboutTitle = resolveText(brand, 'detail.about_title') || 'About this car'
const specTitle = resolveText(brand, 'detail.spec_title') || 'Specification'
```

### 2d. Specs band — filter empties (currently the `specs` array + render)
- Change the `specs` array to drop empty values BEFORE render:
  `].filter((s) => s.value)` appended to the array literal.
- In the band render, replace `{spec.value || DASH}` with `{spec.value}`.
- On `.specsGrid`, add an inline CSS var for the desktop column count:
  `style={{ ['--spec-cols' as any]: specs.length }}`.

### 2e. Rebuild the `specTable` → non-band identity fields only
Replace the current `specTable` (which duplicated the band) with:

```tsx
const specGrid = [
  { label: 'Make', value: vehicle.make },
  { label: 'Model', value: vehicle.model },
  { label: 'Derivative', value: vehicle.derivative },
  { label: 'Colour', value: vehicle.color },
  { label: 'Doors', value: vehicle.doors > 0 ? String(vehicle.doors) : '' },
  { label: 'Registration', value: vehicle.reg },
].filter((row) => row.value)
```
(Do NOT include Year/Mileage/Fuel/Gearbox/Engine/Body — the band owns those.)

### 2f. Title masthead markup
Replace the `.titleInner` block. Left = title + subline; right = a price UNIT
with an eyebrow, value, and finance line:

```tsx
<div className={styles.titleInner} data-aos="fade-up">
  <div className={styles.titleText}>
    <h1 id="detail-title" className={styles.title}>{headline}</h1>
    {subLine ? <p className={styles.subLine}>{subLine}</p> : null}
  </div>
  <div className={styles.titlePrice}>
    <span className={styles.priceEyebrow}>{vehicle.sold ? soldChip : priceLabel}</span>
    <span className={`${styles.priceValue} ${vehicle.sold ? styles.priceStruck : ''}`.trim()}>{priceText}</span>
    {financeLine && !vehicle.sold ? <span className={styles.priceFinance}>{financeLine}</span> : null}
  </div>
</div>
```
(Drop the old `.priceSoldTag` span — the eyebrow now carries the sold word.)

### 2g. Content column — replace the mainCol body
Order: Highlights → About → Specification → mobile key facts. Render each block
ONLY when it has content:

```tsx
<div className={styles.mainCol}>
  {highlights.length ? (
    <div className={styles.highlights} data-aos="fade-up">
      <h2 className={styles.blockTitle}>{highlightsTitle}</h2>
      <ul className={styles.highlightGrid}>
        {highlights.map((item) => (
          <li className={styles.highlightItem} key={item}>
            <Check size={16} strokeWidth={2.25} aria-hidden="true" className={styles.highlightTick} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : null}

  {prose.length ? (
    <div className={styles.about} data-aos="fade-up" data-aos-delay="60">
      <h2 className={styles.blockTitle}>{aboutTitle}</h2>
      <div className={styles.aboutBody}>
        {prose.map((p, i) => <p key={`p-${i}`}>{p}</p>)}
      </div>
    </div>
  ) : null}

  {specGrid.length ? (
    <div className={styles.specGridWrap} data-aos="fade-up" data-aos-delay="80">
      <h2 className={styles.blockTitle}>{specTitle}</h2>
      <dl className={styles.specGrid}>
        {specGrid.map((row) => (
          <div className={styles.specGridRow} key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  ) : null}

  {/* mobile-only key facts — unchanged */}
</div>
```

### 2h. Premium sidebar price card
Replace the sidebar `.priceCard` inner with an eyebrow-led price zone + a
hairline before the action group:

```tsx
<div className={styles.priceCard} data-aos="fade-up" data-aos-delay="120">
  <div className={styles.priceZone}>
    <span className={styles.priceEyebrow}>{vehicle.sold ? soldChip : priceLabel}</span>
    <span className={`${styles.cardPrice} ${vehicle.sold ? styles.priceStruck : ''}`.trim()}>{priceText}</span>
    {financeLine && !vehicle.sold ? <p className={styles.financeLine}>{financeLine}</p> : null}
  </div>
  <div className={styles.cardActions}>
    {renderCta(vehicle.sold ? styles.cardCta : `${styles.cardCta} mfx-shimmer`)}
    {phoneTel ? (
      <a href={`tel:${phoneTel}`} className={styles.callLink}> … unchanged … </a>
    ) : null}
  </div>
  {keyFacts.length ? ( … unchanged sidebarFacts block … ) : null}
</div>
```
Keep the `renderCta`, `callLink`, and `sidebarFacts` internals exactly as they
are today — only the wrapping structure (`priceZone` / `cardActions`) is new.

---

## 3. `page.module.css`

### 3a. Masthead (replace the `.titleInner` / `.titlePrice` / price block)
```css
.titleInner {
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 0 var(--wide-pad) clamp(0.9rem, 2vw, 1.15rem);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  align-items: flex-start;
  border-bottom: 1px solid var(--hairline); /* seats the masthead */
}
.titlePrice {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
}
.priceEyebrow {
  font-family: var(--font-brand-family-override, 'EB Garamond', Georgia, serif);
  font-weight: 600;
  font-size: var(--fs-caption);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.priceValue {
  font-family: var(--font-brand-family-override, 'EB Garamond', Georgia, serif);
  font-weight: 600;
  font-size: var(--fs-title);
  line-height: 1.05;
  color: var(--color-text);
}
.priceFinance {
  font-size: var(--fs-caption);
  color: var(--color-muted);
}
```
Keep `.priceStruck` as-is. Delete the `.priceSoldTag` rules (no longer used).
At `@media (min-width: 768px)` the existing `.titleInner{flex-direction:row;
align-items:flex-end;justify-content:space-between}` + `.titlePrice{align-items:
flex-end;text-align:right;flex:0 0 auto}` stays — that right-aligns the price
unit and baseline-aligns it with the title. Good.

### 3b. Specs band — count-robust hairlines + filtered cells
Replace the `.specsGrid` / `.specCol` separator model:
```css
.specsGrid {
  --spec-hair: color-mix(in srgb, var(--color-on-primary) 22%, transparent);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;                 /* separators are now per-cell, not gap-tint */
  background: transparent;
  color: var(--color-on-primary);
}
.specCol {
  /* left + bottom interior hairline: count-agnostic, no hanging tint when a
     cell is filtered out */
  box-shadow: inset 1px 0 0 0 var(--spec-hair), inset 0 -1px 0 0 var(--spec-hair);
}
.specCol:first-child {
  box-shadow: inset 0 -1px 0 0 var(--spec-hair); /* no leftmost frame line */
}
```
At `@media (min-width: 768px)`: `.specsGrid { grid-template-columns: repeat(3,
minmax(0,1fr)); }`.
At `@media (min-width: 1024px)`: replace the fixed 6-col rule with
`.specsGrid { grid-template-columns: repeat(var(--spec-cols, 6), minmax(0,1fr)); }`
so the populated facts fill ONE row with no trailing empty cell.

### 3c. Highlights checklist
```css
.highlightGrid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}
.highlightItem {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--hairline);
  font-size: var(--fs-body);
  color: var(--color-text);
}
.highlightTick {
  flex: 0 0 auto;
  margin-top: 0.15rem;
  color: var(--color-primary);
}
@media (min-width: 768px) {
  .highlightGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 2rem; }
  /* keep the last row's bottom hairlines tidy; a lone trailing item is fine */
}
```

### 3d. About (prose) — reuse the old `.description` look
Rename `.description` → `.aboutBody` (or keep `.description` and point the new
markup at it). Keep `line-height:1.65`, `text-wrap:pretty`, `margin 0 0 1rem`
per paragraph, last-child margin 0.

### 3e. Spec grid (2-col label/value)
Replace `.specTable` / `.specTableRow` with:
```css
.specGrid {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 2rem;
}
.specGridRow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--hairline);
  font-size: var(--fs-body);
}
.specGridRow dt { margin: 0; color: var(--color-muted); }
.specGridRow dd { margin: 0; text-align: right; font-weight: 600; color: var(--color-text); }
@media (min-width: 768px) {
  .specGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
```
(Keep `.factsList` / `.factRow` for the key-facts blocks — unchanged.)

### 3f. Premium sidebar
```css
.priceCard {
  display: grid;
  gap: 1.15rem;
  padding: 1.35rem;
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-primary); /* claret ribbon cue */
  border-radius: 6px;
  background: var(--color-surface);
  color: var(--color-text);
}
.priceZone {
  display: grid;
  gap: 0.25rem;
  padding-bottom: 1.15rem;
  border-bottom: 1px solid var(--hairline);
}
.cardActions { display: grid; gap: 0.75rem; }
```
Keep `.cardPrice`, `.financeLine`, `.enquireBtn`, `.callLink`, `.soldChip`,
`.sidebarFacts`, `.factsHeading` as they are. The `.priceEyebrow` rule from 3a
is shared by the sidebar.

### 3g. Rhythm
Set `.mainCol { gap: clamp(1.75rem, 3vw, 2.5rem); }` so the three blocks breathe
evenly and the column no longer reads sparse. Leave `.contentGrid` 2fr/1fr at
1024 unchanged.

---

## 4. `recipes/text-recipe.json`
Add keys with the defaults from the spec Copy section:
`detail.price_label`="Price", `detail.highlights_title`="Highlights",
`detail.about_title`="About this car", `detail.spec_title`="Specification".
(The other detail keys already exist.)

---

## Verify
- Ford C-Max test car: Highlights grid shows the positive points with ticks;
  NO phone number, NO "Please call Abe…", NO "Payment via … bank transfer", NO
  bare "Ford c max" / "1.6tdci" line anywhere in the rendered DOM.
- Specs band: no "—", no empty ENGINE column; hairlines still separate the
  populated columns; one clean row at 1024.
- Specification block: 2-col at ≥768, only Make/Model/Derivative/Colour/Doors/
  Registration that have values.
- Masthead: price unit right-aligned at 768+, seated on the closing hairline.
- Sidebar: claret ribbon top rule, eyebrow price, hairline, CTA + call + facts.
- 505px: sticky bar = price + Enquire only; no x-overflow; highlights 1 col.
- Contracts stay green: `check-color-contract`, `audit-theme`,
  `check-image-contract`, `tsc`.
