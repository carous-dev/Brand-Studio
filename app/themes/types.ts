import type { ComponentType, ReactNode } from 'react'
import type { BrandConfig } from '@/brands/types'

export type ThemePageId =
  | 'home'
  | 'about'
  | 'contact'
  | 'services'
  | 'sellYourCar'
  | 'recentlySold'
  | 'usedCars'
  | 'vehicleDetail'
  | 'compare'
  | 'wishlist'
  | 'privacyPolicy'
  | 'cookiePolicy'

export type ThemePageProps = {
  brand: BrandConfig
  initialInventory?: any[]
  vehicle?: any
  images?: string[]
  similarList?: any[]
}

export type ThemePageComponent = (props: ThemePageProps) => ReactNode | Promise<ReactNode>
export type ThemePageRegistry = Partial<Record<ThemePageId, ThemePageComponent>>
export type ThemePageRegistryMap = Record<string, ThemePageRegistry>

export type ThemeShellProps = {
  children: ReactNode
}

export type ThemeShellComponent = ComponentType<ThemeShellProps>
export type ThemeShellRegistry = Record<string, ThemeShellComponent>

export type ThemeSectionProps = {
  brand: BrandConfig
}

export type ThemeSectionComponent = ComponentType<ThemeSectionProps>
export type ThemeSectionRegistry = Record<string, ThemeSectionComponent>

export type ThemeRecipe = {
  section: string
  description?: string
  defaults?: Record<string, unknown>
}

export type ThemeRecipeRegistry = Record<string, ThemeRecipe>
export type ThemeTokenValue = string | number | boolean | ThemeTokenMap
export interface ThemeTokenMap {
  [key: string]: ThemeTokenValue
}

export type ThemeManifestEntry = {
  id: string
  name: string
  description?: string
  status?: string
}

export type ThemeCustomizationContract = {
  meta: ThemeManifestEntry
  sections: ThemeSectionRegistry
  recipes: ThemeRecipeRegistry
  tokens: ThemeTokenMap
}

export type ThemeCustomizationContractRegistry = Record<string, ThemeCustomizationContract>
