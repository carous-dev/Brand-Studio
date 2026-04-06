import type { BrandConfig } from '@/brands/types'
import { DEFAULT_THEME_ID, REGISTERED_THEME_IDS } from './manifest'

export function resolveThemeId(themeId: unknown): string {
  const candidate = String(themeId || '').trim().toLowerCase()
  if (candidate && REGISTERED_THEME_IDS.has(candidate)) {
    return candidate
  }
  return DEFAULT_THEME_ID
}

export function resolveThemeIdFromBrand(brand: BrandConfig): string {
  const theme = brand?.theme && typeof brand.theme === 'object' ? brand.theme : {}
  const candidate =
    (brand as any)?.themeId ||
    (theme as any)?.id ||
    (theme as any)?.themeId ||
    (brand as any)?.theme_id

  return resolveThemeId(candidate)
}

