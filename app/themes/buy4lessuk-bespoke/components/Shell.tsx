'use client'

import { ReactNode } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import TopBar from './TopBar'
import Header from './Header'
import Footer from './Footer'
import FixedCtaBar from './FixedCtaBar'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'

import '../styles/base.css'
import '../styles/color-policy.css'

/**
 * Buy4Less shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack, GarageProvider). Theme-specific chrome:
 * its own TopBar (above the Header) and FixedCtaBar (below the Footer), folded
 * into the header/footer fragments so ThemeChrome renders them in order. All
 * of Buy4Less' routes are in the canonical set, so no extraRoutes are needed.
 */
export function Buy4lessukShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  return (
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="buy4lessuk"
      provider={GarageProvider}
      header={<><TopBar /><Header /></>}
      footer={<><Footer /><FixedCtaBar /></>}
    >
      {children}
    </ThemeChrome>
  )
}

export default Buy4lessukShell
