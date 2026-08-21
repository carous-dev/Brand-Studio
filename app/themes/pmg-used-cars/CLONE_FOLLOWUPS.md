# Clone follow-ups — pmg-used-cars

Cloned from `apps/pmgcarsales`.

- Pages copied: 13
- Components copied: 15

## What still needs Phase 8 attention

### Workspace package imports

The cloned files import from these `@carous/*` workspace packages:

- `@carous/dealer-shell`
- `@carous/garage`
- `@carous/hooks`
- `@carous/sell-your-car`
- `@carous/vehicle-filters`

Brandstudio doesn't carry these packages by default. For each:
(a) replace with an in-tree brandstudio equivalent if one exists
(b) inline the needed code into `lib/` or a co-located component
(c) add the package to brandstudio's dependencies if it's published.

## Phase-8 polish targets

- Verify the cloned hero / footer / CTA respect the queensbury-era
  lessons (Pitfalls catalogue rows 40 / 41 / 42): no `flex-wrap: wrap`
  on marquee reduced-motion fallbacks, primary CTAs are full-bleed + centered,
  card rails never use `repeat(N, 1fr)` where N may be exceeded.
- Run `npm run theme:sync` then `npx tsc --noEmit | grep themes/pmg-used-cars` —
  resolve type errors before Phase 10.
- Run `node tools/audit-theme.mjs --id pmg-used-cars` and address blockers.
- Decide whether to opt this theme out of the cross-theme similarity check
  — clones are intentionally similar to their source app, so the peer pass
  should ignore themes whose `theme.json.mode === 'app-clone'`.
