# Multi-Theme Contract & Auto-Discovery Reference

This project now uses a **contract-first theme system** under `app/themes/*`.

## What This Solves

- No manual theme registration in code.
- Stable folder contract for all themes.
- Full isolation per theme (shell, page overrides, sections, recipes, tokens).
- Flask and Next share the same detected theme catalog.

## Theme Contract (Required)

A theme is detected only when it has `theme.json` and all required files:

```text
app/themes/<theme-id>/
  theme.json
  shell.tsx
  pages.ts
  sections/index.tsx
  recipes/index.ts
  tokens.ts
```

Rules:

- `<theme-id>` folder name must exactly match `theme.json.id`.
- `theme.json.isDefault` should be true for at most one theme.
- If no theme is marked default, fallback is `classic-dealer` (if present), otherwise first detected theme.

## Contract Exports

Each file has a stable export name:

- `shell.tsx` -> `themeShell`
- `pages.ts` -> `themePages`
- `sections/index.tsx` -> `themeSections`
- `recipes/index.ts` -> `themeRecipes`
- `tokens.ts` -> `themeTokens`

## Auto-Generation Pipeline

`npm run theme:sync` scans `app/themes/*` and generates:

- `app/themes/generated/theme-shell-registry.generated.ts`
- `app/themes/generated/theme-page-registry.generated.ts`
- `app/themes/generated/theme-contract-registry.generated.ts`
- `theme/theme-manifest.json`

This command is wired into:

- `npm run dev`
- `npm run build`

So adding a valid theme folder is enough; registries and manifest are rebuilt automatically.

## Runtime Wiring

- `app/themes/ThemeShell.tsx` loads shell components from generated shell registry.
- `app/themes/theme-pages.server.ts` loads page overrides from generated page registry.
- `app/themes/theme-selection.ts` validates selected IDs against generated manifest.
- `app/themes/theme-contracts.ts` exposes sections/recipes/tokens contracts.

## Flask Integration

`backend/services/theme_catalog.py` now discovers themes directly from the same filesystem contract in `app/themes/*`.

Detection priority:

1. Contract discovery from `app/themes/*`
2. Fallback to `theme/theme-manifest.json`
3. Final hardcoded fallback catalog

This keeps `/api/themes` aligned with the Next runtime contract.

## Add A New Theme

1. Create `app/themes/<theme-id>/` with all required files.
2. Fill `theme.json` metadata and stable exports in each contract file.
3. Run `npm run theme:sync` (or just `npm run dev` / `npm run build`).
4. Theme appears automatically in selectors and runtime resolution.

No edits needed in:

- `app/themes/ThemeShell.tsx`
- `app/themes/theme-pages.server.ts`
- `theme/theme-manifest.json`

## Minimal Example

`theme.json`

```json
{
  "id": "my-theme",
  "name": "My Theme",
  "description": "Custom independently packaged theme",
  "status": "stable",
  "isDefault": false
}
```

`pages.ts`

```ts
import type { ThemePageRegistry } from '../types'

export const themePages: ThemePageRegistry = {
  // home: MyHomePage,
}
```

`shell.tsx`

```tsx
'use client'
import type { ThemeShellComponent } from '../types'

export const themeShell: ThemeShellComponent = ({ children }) => <>{children}</>
```

## Backward Compatibility

- Existing brand configs using `themeId`, `theme.id`, or `theme.themeId` still resolve.
- Invalid/missing theme IDs still fallback to default theme.
