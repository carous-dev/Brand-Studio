import type { BrandConfig } from '@/brands/types'
import type { ThemePageId } from './types'
import { resolveThemeIdFromBrand } from './theme-selection'
import { DEFAULT_THEME_ID } from './manifest'
import { THEME_PAGE_LOADERS } from './generated/theme-page-registry.generated'

/**
 * Resolve a theme's page component, code-split per theme. Each theme's pages
 * module is a lazy `import()` (see theme-page-registry.generated.ts), so only
 * the active theme's page components + CSS are loaded — the other 13 themes
 * never enter the bundle. Async because it awaits the split chunk; callers
 * (renderThemePage) are already async server components.
 */
export async function getThemePageForBrand(brand: BrandConfig, pageId: ThemePageId) {
  const themeId = resolveThemeIdFromBrand(brand)
  const loader =
    THEME_PAGE_LOADERS[themeId] ||
    THEME_PAGE_LOADERS[DEFAULT_THEME_ID] ||
    Object.values(THEME_PAGE_LOADERS)[0]

  if (!loader) return undefined

  const mod = await loader()
  return mod.themePages[pageId]
}
