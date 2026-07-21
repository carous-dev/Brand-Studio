'use client'

import { ReactNode } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import BrowseByMakes from './BrowseByMakes'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'

import '../styles/base.css'
import '../styles/color-policy.css'

/**
 * Warwick shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack, GarageProvider). Theme-specific bits:
 * its own Header/Footer, the BrowseByMakes band below <main>, and the extra
 * /warranty /delivery /reviews routes.
 */
export function WarwickShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  return (
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="warwick"
      provider={GarageProvider}
      extraRoutes={['/warranty', '/delivery', '/reviews']}
      header={<Header />}
      footer={<Footer />}
      belowMain={<BrowseByMakes />}
    >
      {children}
    </ThemeChrome>
  )
}

export default WarwickShell
