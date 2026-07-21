'use client'

import { ReactNode } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'

import '../styles/base.css'
import '../styles/color-policy.css'

/**
 * Dual Stock shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack, GarageProvider). Theme-specific bits are
 * just its own Header/Footer; routes stay within the canonical set and there's
 * no site-wide band below <main>.
 */
export function DualShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  return (
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="dual"
      provider={GarageProvider}
      header={<Header />}
      footer={<Footer />}
    >
      {children}
    </ThemeChrome>
  )
}

export default DualShell
