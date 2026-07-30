# Fix — redgate-lodge-bespoke · polish round 1

Scope: 2 shipped visual defects (inventory hero, detail gutter+overflow) + the
4 deferred minors. Builder applies verbatim — no judgement calls. Every value is
a token / `color-mix`; zero hex, zero gradient. Verify mobile at **505px**.

Spec amendments made by the designer alongside this fix:
- `components/12-inventory.spec.md` — new "Inventory hero (lean elevated band)"
  section + ACs AC8–AC11, AC1/AC5 updated, Layout note added.
- `design-language.md` §7 `/used-cars` line — now an inventory hero band, not a
  slim page-ribbon.

---

## Issue 1 — Inventory hero (/used-cars): DESIGN + build a real lean hero
Decision: **spec-change + build.** The route shipped a bare left-aligned
"THE SHOWROOM / Cars in stock / 29 cars ready to view" page-ribbon that reads
unfinished (build-rules §10). Replace it with a lean, elevated claret-matted
framed hero that leads with the in-stock figure and surfaces search + the Make
filter. The hero is rendered by the client component so its controls are live.

### 1a. `pages/used-cars/page.tsx` — drop the slim PageRibbon
- DELETE the `import PageRibbon from '../../components/PageRibbon'` line.
- DELETE the entire `<PageRibbon … count={initialTotal} />` element from the
  returned JSX (keep `<UsedCarsClient … />` and `<PxInvite … />`).
- The `initialTotal` computation becomes unused → delete it (lines that derive
  `initialTotal` from `initialMeta?.total`). `UsedCarsClient` already derives the
  count from `initialMeta`; no new prop is needed.

### 1b. `pages/used-cars/UsedCarsClient.tsx`
Resolved copy — add beside the existing `resolveText(...)` block (~line 704):
```
const heroEyebrow = resolveText(brand, 'ribbon.used_cars_eyebrow')
const heroTitle = resolveText(brand, 'ribbon.used_cars_title')
```
(Reuse those existing recipe keys — do NOT mint new ones.)

Insert the hero as the FIRST child of the returned `<>` fragment, immediately
before `<section className={styles.section} …>`:
```
<section className={styles.hero} aria-label={heroTitle || countLabel}>
  <div className={styles.heroInner}>
    <div className={styles.heroFrame}>
      <div className={styles.heroHeading}>
        {heroEyebrow ? <p className={styles.heroEyebrow}>{heroEyebrow}</p> : null}
        {heroTitle ? <h1 className={styles.heroTitle}>{heroTitle}</h1> : null}
        <p className={styles.heroFigure} aria-live="polite">
          <span className={styles.heroFigureNumeral}>
            {showSkeleton ? '–' : resultsCount.toLocaleString('en-GB')}
          </span>
          <span className={styles.heroFigureLabel}>{countLabel}</span>
        </p>
      </div>
      <div className={styles.heroSearchZone}>
        <div className={styles.search}>
          <span className={styles.searchIcon} aria-hidden="true">
            <Search size={18} strokeWidth={2} />
          </span>
          <input
            className={styles.searchField}
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            aria-label={searchPlaceholder}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <SelectChip
          id="inventory-make"
          icon={<CarFront size={15} strokeWidth={2} />}
          value={make}
          options={makeSelectOptions}
          onChange={setMake}
          ariaLabel="Make"
        />
      </div>
    </div>
  </div>
</section>
```
This `<h1>` is now the page's single h1 (the removed PageRibbon owned it before).

Toolbar row 1 — REPLACE the `.countBlock` numeral with a small caption. Swap:
```
<p className={styles.countBlock}>
  <span className={styles.countLabel}>{countLabel}</span>
  <span className={styles.countNumeral} aria-live="polite">
    {showSkeleton ? '–' : resultsCount.toLocaleString('en-GB')}
  </span>
</p>
```
for:
```
<p className={styles.resultsCaption} aria-live="polite">
  {countLabel} <strong>{showSkeleton ? '–' : resultsCount.toLocaleString('en-GB')}</strong>
</p>
```
(Reuses `countLabel` — no hardcoded string, no new recipe key. Hero owns the big
figure; this stays a small live count.)

Toolbar row 2 — REMOVE the search + Make (now in the hero):
- DELETE the `<div className={styles.search}> … </div>` block from inside
  `.controlsRow`.
- DELETE the `<SelectChip id="inventory-make" … />` from inside `.fieldRail`.
- KEEP the Body `SelectChip`, the Sort `SelectChip`, and the mobile
  `wishlistChip(styles.railChip)` / `compareChip(styles.railChip)`.

### 1c. `pages/used-cars/page.module.css`
Remove the now-unused `.countBlock`, `.countLabel`, `.countNumeral` rules. Add:
```
/* ---- Inventory hero (build-rules §10) ------------------------------------- */
.hero {
  background: var(--color-surface);
  color: var(--color-text);
  padding-block: clamp(1.5rem, 4vw, 2.75rem);
  border-top: 1px solid var(--color-border);
}
.heroInner {
  max-width: none;
  margin: 0 auto;
  padding-inline: clamp(1rem, 3vw, 2.5rem);
}
.heroFrame {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-primary);
}
.heroHeading {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}
.heroEyebrow {
  margin: 0;
  font-family: var(--font-brand-family-override, 'EB Garamond', Georgia, serif);
  font-weight: 600;
  font-size: 0.8125rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.heroTitle {
  margin: 0;
  font-family: var(--font-brand-family-override, 'EB Garamond', Georgia, serif);
  font-weight: 600;
  font-size: clamp(1.6rem, 4vw, 2.5rem);
  line-height: 1.18;
  color: var(--color-text);
  text-wrap: balance;
}
.heroFigure {
  margin: 0.25rem 0 0;
  display: inline-flex;
  align-items: baseline;
  gap: 0.55rem;
}
.heroFigureNumeral {
  font-family: var(--font-brand-family-override, 'EB Garamond', Georgia, serif);
  font-weight: 600;
  font-size: clamp(2.4rem, 6vw, 3.4rem);
  line-height: 1;
  color: var(--color-primary);
}
.heroFigureLabel {
  font-family: var(--font-brand-family-override, 'EB Garamond', Georgia, serif);
  font-weight: 600;
  font-size: 0.8125rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-muted);
}
.heroSearchZone {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}
/* Make chip fills its column inside the hero. */
.heroSearchZone .selectChip {
  width: 100%;
  justify-content: space-between;
}

/* Small live count caption that replaces the toolbar's big numeral. */
.resultsCaption {
  margin: 0;
  flex: 0 0 auto;
  white-space: nowrap;
  font-family: var(--font-ui-family-override, 'Lato', system-ui, sans-serif);
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--color-muted);
}
.resultsCaption strong {
  color: var(--color-text);
}
```
Add to the existing `@media (min-width: 768px)` block (2-column frame + rule):
```
.heroFrame {
  flex-direction: row;
  align-items: stretch;
  gap: clamp(1.5rem, 3vw, 2.5rem);
}
.heroHeading {
  flex: 1 1 auto;
  justify-content: center;
}
.heroSearchZone {
  flex: 0 0 22rem;
  max-width: 22rem;
  justify-content: center;
  padding-left: clamp(1.5rem, 3vw, 2.5rem);
  border-left: 1px solid var(--color-border);
}
```
Notes: the `.search` shell already sets `width:100%`, so it fills the hero
column with no extra rule. Do NOT add any gradient/shadow. The only claret in
the hero is the 3px `border-top` + the figure numeral (px-invite stays the
route's single full primary band — do-not #9).

---

## Issue 2 — Vehicle detail: ONE container gutter + specs-band overflow
Decision: **fix.** Root cause (a): the title strip/specs/similar use
`--wide-max` (1600) while the body uses `--content-max` (1280) → the title+price
sit ~80px left of the inset body (the §11 canonical failure). Root cause (b):
`.specsGrid` carries `padding: 0 var(--wide-pad)` AND its tint background
(`color-mix(on-primary 25%)`), so the 40px side padding paints as lighter-claret
strips — the right strip reads as a clipped half-column. (`box-sizing` is
globally border-box, so this is NOT a width overflow.)

Rule per build-rules §11: title strip, specs-band CONTENT, and body share ONE
inner (`--content-max`). The gallery mosaic stays full-bleed wide
(design-language §4) — the one intended exception.

### 2a. `pages/used-cars/[slug]/page.module.css`
- **Title aligns to body.** The shared rule `.titleInner, .galleryInner { max-width: var(--wide-max); … }`
  must be SPLIT so only the gallery stays wide:
  - Give `.titleInner` its own `max-width: var(--content-max)` (keep
    `margin: 0 auto; padding: 0 var(--wide-pad)`).
  - Leave `.galleryInner` at `max-width: var(--wide-max)` (full-bleed mosaic —
    intentional).
- **Specs content aligns + stops bleeding.** On `.specsGrid` DELETE these three
  declarations: `max-width: var(--wide-max);`, `margin: 0 auto;`,
  `padding: 0 var(--wide-pad);` (keep `display: grid`, `grid-template-columns`,
  `gap: 1px`, `background`, `color`). Then ADD a new gutter wrapper rule:
  ```
  .specsInner {
    max-width: var(--content-max);
    margin: 0 auto;
    padding: 0 var(--wide-pad);
  }
  ```
  Now the tint background spans only the grid cells (internal 1px gaps still
  show it) — no side strips, no clipped column — and the specs content lines up
  with the body.
- **Similar rail aligns.** Change `.similarInner` `max-width: var(--wide-max)` →
  `max-width: var(--content-max)`.
- `.contentInner` already uses `--content-max` — leave it.

### 2b. `pages/used-cars/[slug]/DetailClient.tsx`
Wrap the specs `<dl>` in the new gutter div:
```
<section className={styles.specsBand} aria-label="Key specification">
  <div className={styles.specsInner}>
    <dl className={styles.specsGrid}>
      {specs.map((spec) => { … })}
    </dl>
  </div>
</section>
```
(No other detail JSX changes. `.specCol` already has `min-width: 0`.)

Result: title/price, specs cells, spec-table, and body all left-align to the
same 1280 inner; the gallery mosaic remains the wider full-bleed hero; the specs
band shows exactly its 6 columns with no right-edge bleed.

---

## Issue 3 — Similar rail shows 1 card on data-thin slugs
Decision: **fix.** `fetchSimilar` returns same-make results whenever the array
is non-empty, so a make with a single sibling (e.g. Mercedes-Benz → one B-Class)
never falls back — it renders 1 lonely card. Broaden to top up when same-make
`< 3` using body-type, then latest stock; dedupe; cap 4.

### `pages/used-cars/[slug]/page.tsx` — replace the tail of `fetchSimilar`
Replace:
```
  // Prefer same make; fall back to same body type; finally latest stock.
  if (make) {
    const byMake = await query({ make })
    if (byMake.length) return byMake
  }
  if (body) {
    const byBody = await query({ body })
    if (byBody.length) return byBody
  }
  return query({ sort: 'newest' })
```
with:
```
  // Prefer same make; TOP UP with same body type, then latest stock, until we
  // have at least 3 (show up to 4). Dedupe across the passes.
  const seen = new Set<string>([excludeId])
  const collected: DetailSimilarVehicle[] = []
  const addUnique = (list: DetailSimilarVehicle[]) => {
    for (const v of list) {
      if (seen.has(v.id)) continue
      seen.add(v.id)
      collected.push(v)
    }
  }
  if (make) addUnique(await query({ make }))
  if (collected.length < 3 && body) addUnique(await query({ body }))
  if (collected.length < 3) addUnique(await query({ sort: 'newest' }))
  return collected.slice(0, 4)
```
(`query` already excludes `excludeId` and slices; the outer `seen` + `slice(4)`
merge the passes safely.)

---

## Issue 4 — Contact split sits on `surface` vs §7's `bg`
Decision: **fix.** The contact `.section` is already `--color-bg`, and the
`VisitLodge` bare column is transparent — the only surface is the `ContactForm`
card, which flips to `--color-surface` at ≥1024, making the dominant left column
read as a surface band. Align to §7 ("contact split on `bg`, unbanded"): keep the
hairline frame, change only the fill to `bg`.

### `components/ContactForm.module.css` — the `@media (min-width: 1024px)` `.card`
Change `background: var(--color-surface);` → `background: var(--color-bg);`
inside the `@media (min-width: 1024px) { .card { … } }` block. Keep the
`border: 1px solid var(--color-border)`, `border-radius: 6px`, and padding — a
quiet bg-on-bg hairline frame so the split reads on `bg` end-to-end. (ContactForm
is used only on /contact, so this is scoped.)

---

## Issue 5 — motion-aos-min-count on /services, /sell-my-car, /recently-sold, /wishlist
Decision: **fix.** Ensure each page's rendered content carries ≥2 *staggered*
`data-aos` entries (design-language §6: `fade`, 60ms stagger for ledger-style
entries; `fade-up` for blocks). `/services` and `/sell-my-car` already render
`LedgerSteps` (staggered `data-aos="fade"` `<li>`s); reinforce them and add
stagger to the two garage grids which currently have none.

### 5a. `/recently-sold` — `pages/recently-sold/RecentlySoldClient.tsx`
On each grid `<li>` (the `list.map(...)` return), add staggered attrs:
```
<li key={v.id ?? v.slug ?? idx} data-aos="fade-up" data-aos-delay={Math.min(idx, 8) * 60}>
```
Empty-state fallback — add `data-aos="fade-up"` to the `<p className={styles.empty}>`
and `data-aos="fade-up" data-aos-delay="80"` to the `<div className={styles.ctaRow}>`
so the empty page still has 2 staggered entries.

### 5b. `/wishlist` — `pages/wishlist/WishlistClient.tsx`
On each grid `<li className={styles.cell}>`, add:
```
<li key={v.id} className={styles.cell} data-aos="fade-up" data-aos-delay={Math.min(idx, 8) * 60}>
```
(add `idx` to the map: `wishlist.map((v, idx) => …)`). Empty state — add
`data-aos="fade-up"` to `<p className={styles.emptyTitle}>` and
`data-aos="fade-up" data-aos-delay="80"` to `<p className={styles.emptyBody}>`.

### 5c. `/services` — `components/AftercareSuite.tsx` (shared; home benefits too)
Move the AOS from the grid wrapper onto the cards so they stagger:
- On `<div className={styles.grid} data-aos="fade-up">` REMOVE `data-aos="fade-up"`.
- On each `<article className={styles.card} …>` ADD
  `data-aos="fade-up" data-aos-delay={index * 60}` (add `index` to the
  `cards.map((card, index) => …)` signature).

### 5d. `/sell-my-car` — `components/SellPxForm.tsx`
Add `data-aos="fade-up"` to the form card `<div className={styles.card}>` (both
the success and the form branch, or just the form branch). Combined with the
`LedgerSteps` rail's existing staggered `<li>`s this yields ≥2 staggered entries
in the section. (No change needed to `LedgerSteps` — it already staggers.)

---

## Issue 6 — Underline form inputs vs boxed
Decision: **KEEP the ledger-underline inputs (reject the boxing).** They are the
theme's signature "writing on a ruled page" grammar and the documented Unique
move of both `ContactForm` and `SellPxForm`: a serif-caps caption label over a
value line whose only border is a 1px `--color-border` bottom hairline that
thickens to 2px `--color-primary` on focus (that underline IS the visible focus
affordance). They are visible, labelled, ≥48px touch targets, and `aria-invalid`
wired — legibility and accessibility are already met. Boxing them would erase a
core distinctiveness axis for no accessibility gain. No code change. Recorded here
so the verifier stops re-flagging it.
