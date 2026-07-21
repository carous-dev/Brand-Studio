'use client'

import { ReactNode } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'

import '../styles/base.css'
import '../styles/color-policy.css'
import '../styles/header.css'
import '../styles/footer.css'
import '../styles/hero.css'
import '../styles/sections.css'

/**
 * Springalls shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack, GarageProvider). Theme-specific bits: its
 * own Header/Footer. Springalls historically ran no MotionFX / ScrollProgress
 * (only its own AOS reveal), so those two widgets stay off — ThemeChrome's
 * shared AnimateOnScroll (a superset of the old AosProvider) drives the reveals.
 */
export function SpringallsShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  return (
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="springalls"
      provider={GarageProvider}
      header={<Header />}
      footer={<Footer />}
      widgets={{ motionFx: false, scrollProgress: false }}
    >
      {children}
    </ThemeChrome>
  )
}

export default SpringallsShell
