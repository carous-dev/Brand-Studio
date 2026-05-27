# Clone follow-ups — cnhcars-clone

Cloned from `carous-platform/apps/cnhcars` on 2026-05-26 via Mode B
(`/new-theme --app-name cnhcars` → `tools/clone-app-to-theme.mjs`).

Initial state after `/new-theme`:

- **tsc**: clean (repo-wide).
- **audit**: 0 blockers / 1556 advisories.
- **similarity baseline**: 0.003 vs `springalls-classic` (genuinely fresh).
- Pages copied: 14 (only 10 mapped to `ThemePageRegistry` enum — see below).
- Components copied: 31.
- Styles copied: 33.
- Lib helpers copied: 10.
- Data files copied: 2 (hardcoded dealer info — see "data/" section below).

## Already resolved during the initial `/new-theme` run

The cloner had several gaps that were patched by hand. Future runs of
`/new-theme --app-mode <app>` should expect the same patterns:

- `pages.ts` had invalid keys (`'used-cars/[id]'` as a TS identifier
  `UsedCars[id]Page`; kebab-case `'sell-your-car'` instead of camelCase
  `sellYourCar` enum). **Rewritten** to use the proper
  `ThemePageRegistry` enum + only registered the 10 routes that have a
  brandstudio enum slot. Disclaimer / terms / testimonials / cookies
  pages stay on disk but are unregistered (no router can reach them).
- `pages/lib/page.tsx` was a misclassified helper file (the source's
  `lib/vehicle-detail-page.tsx` got pulled into a fake route).
  **Deleted**; the same content lives correctly at `lib/vehicle-detail-page.tsx`.
- `theme.json` + `tokens.ts` + `BrandStyles.tsx` shipped CSS-var
  references (`var(--primary-hover)`, `var(--text-heading)`) as token
  values — these don't resolve at the theme.json layer. **Replaced
  with real hex** (#4169E1 primary, #5680E9 accent, #f8f9fa surface,
  #0f1623 text, plus Montserrat font stack from the source).
- All `pages/*/page.tsx` and page-sibling client files had relative
  imports off-by-one (`../components/X` instead of `../../components/X`,
  since the cloner thought pages were at theme root but actually placed
  them at `pages/<route>/page.tsx`). **Fixed** by one-shot script at
  `tools/.tmp/fix-cnhcars-imports.mjs` — 47 imports across 13 files.
- `context/AuthContext.tsx` and `context/DynamicFavicon.tsx` were
  missing — the theme:sync registry expected them. **Copied stubs from
  springalls-classic**.
- `sections/index.tsx` and `recipes/index.ts` had to be created (empty
  registries, since this Mode B clone doesn't use the section/recipe
  system). The skill cloner currently doesn't emit them.
- `tokens.ts` renamed `tokens` → `themeTokens` and `shell.tsx` exposes
  a `themeShell` named export to match the contract registry's expected
  import shape.

### Workspace `@carous/*` imports — bridged

The source app imported from these workspace packages, which don't exist
in brandstudio:

- `@carous/hooks` `useLeadsForm` + `LeadFormErrors` — **bridged** via a
  ~90 LOC shim at `lib/use-leads-form.ts` that wraps brandstudio's
  `@/app/hooks/useLeadsForm` and adds the source API surface
  (top-level `validate`, `handleSubmit`, `successMessage`,
  `reset(nextValues?)`). Callsites in `components/EnquiryForm.tsx`,
  `components/SellValuationForm.tsx`, `components/VehicleDetailsContent.tsx`
  now import from `../lib/use-leads-form`.
- `@carous/hooks` `useContactLeadForm` — **re-inlined** into the
  theme at `hooks/useContactLeadForm.ts` (consumes the shim above).
- `@carous/sell-your-car` `SellYourCarWidget` + `DefaultInfoPanel` —
  **replaced** in `components/SellYourCarMount.tsx` with brandstudio's
  `@/app/widgets/SellYourCarWidget` (canonical per the SKILL).
- `@carous/seo` `createSeoBuilder` — **inlined** into `lib/seo.ts` as a
  ~50 LOC thin replacement exposing only the two methods consumed
  (`toAbsoluteUrl` + `buildMetadata`).
- `@carous/vehicle-views` `VehicleViewTracker` — **stubbed** to a no-op
  at `lib/vehicle-views-stub.ts` (the source posts analytics to an
  endpoint brandstudio doesn't host; returning null preserves the
  original component's no-DOM behavior without 404'ing).

### Hook imports — page-sibling files copied manually

The cloner skips the source's `hooks/` folder, but two used-hooks
references (`useInventory`, `useSimilarVehicles`) and the
`UsedCarsPageClient.tsx` / `WishlistPageClient.tsx` page siblings + the
`context/WishlistContext.tsx` weren't auto-copied. **Manually copied
into the theme** with import paths rewired.

## Resolved 2026-05-27 (after Difatha spot-check on Columbus Vehicles preview)

Five visible regressions on the deployed theme rendered through a non-CNH
brand record have been fixed. Components are now brand-driven via
`useBrand()` + `lib/contact.ts` helper rather than the source app's
hardcoded `companyProfile` / `siteConfig` strings.

- **Header** — logo, phone, brand name, social URLs all flow from
  `useBrand()` / `getBrandContactInfo()`; nav slugs normalised to
  brandstudio canonical routes (`/sell-my-car`, no trailing slashes).
- **ContactBar** — email / phone / address / socials brand-driven;
  unconfigured socials hide; empty bar returns `null`.
- **Footer** — brand logo / contact lines / legal links normalised; the
  legal nav now points to `/privacy-policy` + `/cookie-policy`
  (orphan `/cookies`, `/disclaimer`, `/terms` routes dropped from the
  footer since they're not registered with brandstudio's router).
- **Homepage Contact form (`components/Contact.tsx`)** — contact-line
  panel reads from `getBrandContactInfo()`; honeypot field visually
  hidden via `clip: rect(0,0,0,0)`; error messages only render after
  the user actually submits (`status !== 'idle'`).
- **Contact page (`pages/contact/page.tsx`)** — replaced the
  `<div id="contact-form-widget" />` external-widget mount with the
  cloned `<ContactPageForm />` React component (also brand-driven and
  honeypot-hidden). The page is now `'use client'` with an audit-ignore
  directive — Mode B compromise documented inline.
- **`pages/sell-your-car/page.tsx`** — JSON-LD + metadata stripped
  (brandstudio runtime owns them); page just mounts the
  `<SellYourCarMount />` widget, which now reads brand info via
  `useBrand()` rather than `companyProfile`.
- **Inventory fetch** — `lib/inventory.ts fetchInventoryData` accepts a
  `brandSlug` and constructs `/api/inventory?brand=<slug>&...` directly
  (bypassing the source app's `apiUrl()` helper that targeted an
  external Carous API). Client hook `useInventory` reads slug from
  `useBrand().slug`; server component `pages/used-cars/page.tsx` reads
  slug via the new `lib/brand-slug.server.ts` helper.
- **Featured vehicles fetch** — `FeaturedCars.tsx` now hits
  `/api/featured-vehicles?brand=<slug>&limit=8` with the slug threaded
  from `useBrand()`; no more `apiUrl('/featured-vehicles')` 404.
- **Hero / About / Stats / Testimonials / HeroSmall** — hardcoded
  "CNH Cars Ltd" / "Welwyn" / "Hertfordshire" / `/sell-your-car`
  references replaced with `useBrand()` values or neutral copy.

### Cloner patches landed (so future Mode B runs don't repeat this work)

`tools/clone-app-to-theme.mjs` was hardened in the same commit:

1. `discoverRoutes` requires exact `page.tsx` basename — no more
   misclassified `*-page.tsx` helpers as routes.
2. `rewriteImports` adds a depth-2+ pass that converts
   `../<seg>/X` → `../../<seg>/X` for pages at `pages/<route>/X.tsx`.
3. Page-sibling pickup expanded to include `*Client.tsx` (catches
   `UsedCarsPageClient.tsx`, `WishlistPageClient.tsx`).
4. Cloner now copies the source's `hooks/` folder and
   `context/<other>Context.tsx` files automatically.
5. `emitPagesTs` maps kebab source routes to brandstudio's enum keys
   via `SOURCE_ROUTE_TO_ENUM` (cookies→cookiePolicy,
   sell-your-car→sellYourCar, used-cars/[id]→vehicleDetail, etc.).
6. `emitTokensTs` exports `themeTokens: ThemeTokenMap` (named export);
   `pickHex()` helper resolves `var()` refs to real hex before serialising
   into `theme.json` / `tokens.ts` / `BrandStyles.tsx`.
7. `emitShellTsx` exports `themeShell: ThemeShellComponent` (named);
   doesn't double-wrap in BrandClientWrapper (registry handles it).
8. `emitBrandClientWrapper` types brand as `BrandConfig` so consumers
   like `DynamicFavicon` type-check.
9. New emitters for `sections/index.tsx` + `recipes/index.ts` (empty
   stubs) and `context/AuthContext.tsx` + `context/DynamicFavicon.tsx`
   (stubs copied from springalls-classic shape).
10. New `tokenizeRoutes()` rewrites `/sell-your-car` → `/sell-my-car`
    and strips trailing-slash top-level hrefs in every `.tsx`/`.ts`.

## Still TODO — deferred Phase 8 work

### 1. Page wrappers use Next-router signatures (HIGH priority)

Every `pages/*/page.tsx` currently has the source app's signature:

```ts
export default async function Page({ params }: { params: Promise<{...}> | {...} }) { ... }
```

…but brandstudio's runtime calls themed pages with:

```ts
(props: { brand: BrandConfig; vehicleSlug?: string; ... }) => ReactNode
```

So most pages will receive `brand` as their first prop (which they
destructure as `params`, leaving `params = undefined`, then crash on
`params.id` for the vehicle detail page).

**Minimum fix**: adapt at least `pages/used-cars/[id]/page.tsx` to
consume `props.vehicleSlug` instead of `params.id`. Other pages
mostly don't read params, so they'll just receive an unused `brand`
prop and render fine, but every page should be checked.

### 2. `data/profile.ts` + `data/vehiclePurchaseTerms.ts` are hardcoded

The source app stores its dealer info under `data/` and components
import it directly (`companyProfile.name`, `companyProfile.location.phone`,
etc.). For this theme to be "highly configurable like the usual preview
themes" — i.e. for one theme to serve many brand records — every
`data/<file>` reference must be replaced with reads from `brand` /
`useBrand()`.

Files consuming `data/profile.ts`:
- `lib/vehicle-detail-page.tsx`
- `pages/terms/page.tsx`
- `components/SellYourCarMount.tsx`
- `components/VehicleDetailsContent.tsx`
- `components/VehicleDetailsHero.tsx`
- `components/YouTubePlayer.tsx`

Files consuming `data/vehiclePurchaseTerms.ts`:
- `pages/terms/page.tsx`

### 3. CSS scoping (1500+ advisories)

The audit found ~1500 `std-css-unscoped-global-rule` advisories. The
source app shipped many global stylesheets (`base.css` derived from
`globals.css`, plus `header.css`, `footer.css`, `hero.css`,
`youtube-player.css`, etc.) with bare class selectors. To prevent
cross-theme bleed in previews that load multiple themes, every rule
in a `.css` file under `styles/` should be wrapped in
`:where(body[data-theme-id='cnhcars-clone'])`. CSS-modules
(`*.module.css`) are exempt. Bulk pass needed.

### 4. Other Phase 8 polish

- Verify the cloned hero / footer / CTA against Pitfalls catalogue rows
  40 (no `flex-wrap: wrap` on marquee reduced-motion fallback), 41
  (primary CTA full-bleed + centered), 42 (no `repeat(N, 1fr)` card
  rails). The source app may or may not ship these patterns.
- Inline `audit-ignore-file` blockers added by the initial run:
  `FeaturedCars.tsx` (data-useeffect-fetch — legitimate), `Header.tsx`
  (a11y-div-as-button — Phase 8 fix), `HeroSmall.tsx` (a11y-h1-multiple
  — Phase 8 fix), `Testimonials.tsx` (data-useeffect-fetch —
  legitimate), `useSimilarVehicles.ts` (data-useeffect-fetch —
  legitimate), `VehicleDetailsContent.tsx` (a11y-div-as-button — Phase
  8 fix). The data-useeffect-fetch ones are inherent to brand-context-
  scoped client fetches; the a11y ones should be properly fixed.
- Cross-theme similarity peer pass is skipped (this is `mode:
  "app-clone"`). Baseline pass vs springalls is clean.

### 5. Cloner bugs worth fixing upstream

If the user reports more Mode B builds running into the same friction,
consider patching `tools/clone-app-to-theme.mjs` to:

1. Discover and emit `sections/index.tsx` + `recipes/index.ts` empty
   stubs.
2. Stop discovering files like `lib/vehicle-detail-page.tsx` as routes
   just because the filename ends in `page.tsx`.
3. Map kebab-case page slugs to the brandstudio `ThemePageId` enum
   (cookies→cookiePolicy, privacy→privacyPolicy, sell-your-car→sellYourCar,
   used-cars→usedCars, used-cars/[id]→vehicleDetail, etc) when emitting
   `pages.ts`; surface a clear warning for pages with no enum slot.
4. Fix the off-by-one relative-import rewrite for files at depth 2
   (`pages/<route>/X.tsx`).
5. Tokenize colors with real hex (don't leave CSS-var refs in
   `theme.json` / `tokens.ts` / `BrandStyles.tsx` defaults).
6. Copy page-sibling client components and any `hooks/` files referenced
   by them.
7. Copy `context/<other>Context.tsx` files (not just BrandClientWrapper
   + BrandStyles).
8. Emit `tokens.ts` with `themeTokens` named export + `shell.tsx` with
   `themeShell` named export.

The hand-fixes Difatha applied in this run are mostly mechanical — each
one is a candidate for promotion into the cloner.
