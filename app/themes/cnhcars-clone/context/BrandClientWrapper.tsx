'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { BrandConfig } from '@/brands/types'

const BrandContext = createContext<BrandConfig | null>(null)

export function BrandClientWrapper({ brand, children }: { brand: BrandConfig; children: ReactNode }) {
  return <BrandContext.Provider value={brand}>{children}</BrandContext.Provider>
}

export function useBrand(): BrandConfig {
  const brand = useContext(BrandContext)
  if (!brand) {
    throw new Error(
      'useBrand must be used within a BrandClientWrapper. ' +
        'cnhcars-clone shell relies on the theme context registry mounting BrandClientWrapper above it.',
    )
  }
  return brand
}
