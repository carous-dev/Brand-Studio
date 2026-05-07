import type { ComponentType, ReactNode } from 'react'
import type { BrandConfig } from '@/brands/types'
import { DEFAULT_THEME_ID } from './manifest'
import {
  BrandClientWrapper as ClassicBrandClientWrapper,
} from './classic-dealer/context/BrandClientWrapper'
import { BrandStyles as ClassicBrandStyles } from './classic-dealer/context/BrandStyles'
import { AuthProvider as ClassicAuthProvider } from './classic-dealer/context/AuthContext'
import { DynamicFavicon as ClassicDynamicFavicon } from './classic-dealer/context/DynamicFavicon'
import {
  BrandClientWrapper as GildedBrandClientWrapper,
} from './gilded-drive/context/BrandClientWrapper'
import { BrandStyles as GildedBrandStyles } from './gilded-drive/context/BrandStyles'
import { AuthProvider as GildedAuthProvider } from './gilded-drive/context/AuthContext'
import { DynamicFavicon as GildedDynamicFavicon } from './gilded-drive/context/DynamicFavicon'
import {
  BrandClientWrapper as SpringallsBrandClientWrapper,
} from './springalls-classic/context/BrandClientWrapper'
import { BrandStyles as SpringallsBrandStyles } from './springalls-classic/context/BrandStyles'
import { AuthProvider as SpringallsAuthProvider } from './springalls-classic/context/AuthContext'
import { DynamicFavicon as SpringallsDynamicFavicon } from './springalls-classic/context/DynamicFavicon'

type BrandClientWrapperComponent = ComponentType<{
  children: ReactNode
  brand: BrandConfig
}>

type BrandStylesComponent = ComponentType<{ brand: BrandConfig }>
type AuthProviderComponent = ComponentType<{ children: ReactNode }>
type DynamicFaviconComponent = ComponentType<Record<string, never>>

export type ThemeContextBundle = {
  BrandClientWrapper: BrandClientWrapperComponent
  BrandStyles: BrandStylesComponent
  AuthProvider: AuthProviderComponent
  DynamicFavicon: DynamicFaviconComponent
}

export const THEME_CONTEXT_REGISTRY: Record<string, ThemeContextBundle> = {
  'classic-dealer': {
    BrandClientWrapper: ClassicBrandClientWrapper,
    BrandStyles: ClassicBrandStyles,
    AuthProvider: ClassicAuthProvider,
    DynamicFavicon: ClassicDynamicFavicon,
  },
  'gilded-drive': {
    BrandClientWrapper: GildedBrandClientWrapper,
    BrandStyles: GildedBrandStyles,
    AuthProvider: GildedAuthProvider,
    DynamicFavicon: GildedDynamicFavicon,
  },
  'springalls-classic': {
    BrandClientWrapper: SpringallsBrandClientWrapper,
    BrandStyles: SpringallsBrandStyles,
    AuthProvider: SpringallsAuthProvider,
    DynamicFavicon: SpringallsDynamicFavicon,
  },
}

export function getThemeContextBundle(themeId: string): ThemeContextBundle {
  return THEME_CONTEXT_REGISTRY[themeId] || THEME_CONTEXT_REGISTRY[DEFAULT_THEME_ID]
}
