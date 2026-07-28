'use client'

import { ReactNode } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import SmoothScroll from './SmoothScroll'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'

import '../styles/base.css'
import '../styles/color-policy.css'

/**
 * Auto Wow shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack, GarageProvider). Theme-specific bits: its
 * own Header/Footer and a custom cookie-banner voice. Auto Wow adds no routes
 * beyond the canonical set, so no extraRoutes, and no belowMain band.
 */
export function AutoShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  return (
    <>
    <SmoothScroll />
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="auto"
      provider={GarageProvider}
      header={<Header />}
      footer={<Footer />}
      cookie={{
        summary:
          'We use cookies to keep stock fresh, finance offers relevant, and the site running. Necessary cookies always run; optional analytics and marketing help us improve.',
      }}
    >
      {children}
    </ThemeChrome>
    </>
  )
}

export default AutoShell
