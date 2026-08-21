'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { BrandConfig } from '@/brands/types'

const PmgBrandContext = createContext<BrandConfig | null>(null)

export function BrandClientWrapper({ brand, children }: { brand: BrandConfig; children: ReactNode }) {
  return (
    <PmgBrandContext.Provider value={brand}>
      {children}
    </PmgBrandContext.Provider>
  )
}

export function useBrand(): BrandConfig {
  const brand = useContext(PmgBrandContext)
  if (!brand) {
    throw new Error(
      'useBrand must be used within a BrandClientWrapper. The theme context registry ' +
        'mounts the wrapper above the shell.',
    )
  }
  return brand
}
