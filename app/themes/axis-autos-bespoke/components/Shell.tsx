'use client'

import { ReactNode } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import BrowseByMake from './BrowseByMake'
import SmoothScroll from './SmoothScroll'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'

import '../styles/base.css'
import '../styles/color-policy.css'

/**
 * Axis shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack, GarageProvider). Theme-specific bits: its
 * own Header/Footer and the BrowseByMake band below <main>. Axis adds no routes
 * beyond the canonical set, so no extraRoutes; its cookie banner uses the
 * default voice, so no cookie prop.
 */
export function AxisShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  return (
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="axis"
      provider={GarageProvider}
      header={<><SmoothScroll /><Header /></>}
      footer={<Footer />}
      belowMain={<BrowseByMake />}
    >
      {children}
    </ThemeChrome>
  )
}

export default AxisShell
