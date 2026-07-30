# redgate-lodge-bespoke — Integration Checklist

Theme id: `redgate-lodge-bespoke`
Archetype: `luxury` (warm-premium, credibility-led)
Role: integrator (page assembly + dynamic-content contracts)
Source of truth: `tools/.theme-designs/redgate-lodge-bespoke/design-language.md` §7 +
`.claude/skills/theme-builder/references/build-rules.md` §4 / §12

Tick only what can be pointed at in the code. Unticked required items are listed
in the integrator return.

## Route assembly (design-language §7 section-flow)

- [x] `/` — hero → proof-ledger → featured-stock → aftercare → px-invite → reviews → visit-lodge
- [x] `/about` — page-ribbon → story split (AboutStory) → proof-ledger (reused) → aftercare → px-invite
- [x] `/contact` — page-ribbon → contact split (ContactForm + VisitLodge bare)
- [x] `/services` — page-ribbon → aftercare EXPANDED (6 cards) → how-it-works ledger-steps → px-invite
- [x] `/finance` — page-ribbon → finance intro + 3 ledger-steps → assurance strip → enquiry form
- [x] `/part-exchange` — page-ribbon → SellPxForm (px variant, ledger-steps rail)
- [x] `/sell-my-car` — page-ribbon → SellPxForm (sell variant) → reviews
- [x] `/used-cars` — slim page-ribbon (count) → toolbar + showroom grid → px-invite
- [x] `/used-cars/[slug]` — title strip → mosaic gallery → claret specs band → content + sticky sidebar → similar rail
- [x] `/recently-sold` — page-ribbon → sold-variant grid → px-invite (sold copy)
- [x] `/compare` — slim page-ribbon → compare table (ledger hairlines) + empty state
- [x] `/wishlist` — slim page-ribbon → saved-cars grid + empty state
- [x] `/privacy-policy` — slim page-ribbon → 720px legal prose
- [x] `/cookie-policy` — slim page-ribbon → 720px legal prose

## Shell & adjacency

- [x] BrowseByMake band mounted ONCE in the shell (`belowMain`, between `</main>` and footer)
- [x] No per-page BrowseByMake duplicate
- [x] Backgrounds alternate per §7; primary bands use the §5 canonical recipes
- [x] Max one primary band per route (px-invite OR specs band; footer excluded)
- [x] Numbered-ledger motif appears at most once per route (proof-ledger OR ledger-steps)

## Dynamic-content contracts (build-rules §12)

- [x] Every rendered string routes through `resolveText(brand, key)`
- [x] `recipes/text-recipe.json` complete — 229 keys, each with label/type/default (+ aiHint where relevant)
- [x] No hardcoded dealer names / cities / phone numbers in TSX/CSS (generic fallbacks only)
- [x] Contact/address/hours via `getBrandContactInfo` + hours-guard (VisitLodge); never raw `brand.location.address`
- [x] Hours never render a false "Closed" (fallback line when unknown)
- [x] Hero reads `brand.heroImage` first; AboutStory/VisitLodge layer heroImage then theme default
- [x] Every server fetch threads `?brand=<slug>` (used-cars, detail, similar)
- [x] Every client data hook uses `useBrand().slug` (BrowseByMake probe)
- [x] `meta.available.makes` normalised to `string[]` at the boundary (BrowseByMake)
- [x] Vehicle detail CDN enquiry/reserve widgets wired via `lib/external-widgets.ts` with local fallback

## Link audit (build-rules §4)

- [x] Every `<Link>`/`<a>` resolves to the route whitelist
- [x] Canonical `/sell-my-car` used in hrefs (no `/sell-your-car`)
- [x] Nav uses the active-route pattern; footer Quick Links carry About/Contact
- [x] Garage links (`/wishlist`, `/compare`) resolve

## Gates

- [x] `npm run theme:sync` — clean
- [x] `npx tsc --noEmit` — clean
- [x] `node tools/check-theme-contract.mjs --id redgate-lodge-bespoke` — PASS
- [x] `node tools/check-color-contract.mjs --id redgate-lodge-bespoke` — 0 literals
- [x] `node tools/audit-theme.mjs --id redgate-lodge-bespoke` — 0 blockers (advisories only)

## Advisory notes (non-blocking, acknowledged)

- `motion-aos-min-count` on server page wrappers: entry animations live inside the
  composed section components (each carries `data-aos`), not the page.tsx files the
  static scan reads.
- `inv-detail-no-similar-vehicles` / `inv-detail-no-makes-seo` on the detail page:
  satisfied at runtime by the similar-vehicles rail (DetailClient) and the
  shell-owned BrowseByMake band; the static scan reads only page.tsx.
- `perf-raw-img` in GalleryMosaic: intentional local gallery per component spec.
- `motion-no-animated-glow`: the luxury archetype is deliberately calm (design §6 —
  no glow/parallax/marquee); AOS fade-up/fade is the only motion.
