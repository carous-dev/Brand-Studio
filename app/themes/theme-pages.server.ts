import type { BrandConfig } from '@/brands/types'
import type { ThemePageId, ThemePageRegistry } from './types'
import { resolveThemeIdFromBrand } from './theme-selection'
import { DEFAULT_THEME_ID } from './manifest'
import { THEME_PAGE_REGISTRY } from './generated/theme-page-registry.generated'

function getFallbackRegistry(): ThemePageRegistry {
  return THEME_PAGE_REGISTRY[DEFAULT_THEME_ID] || Object.values(THEME_PAGE_REGISTRY)[0] || {}
}

const FALLBACK_PAGE_REGISTRY = getFallbackRegistry()

export function getThemePageForBrand(brand: BrandConfig, pageId: ThemePageId) {
  const themeId = resolveThemeIdFromBrand(brand)
  const themePages = THEME_PAGE_REGISTRY[themeId] || FALLBACK_PAGE_REGISTRY
  return themePages[pageId]
}
