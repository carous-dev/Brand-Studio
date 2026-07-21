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
 * Queensbury shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack: AnimateOnScroll + MotionFX + ScrollProgress
 * + PreviewBanner + CookieBanner + WhatsApp). Theme-specific bits: its own
 * Header/Footer and the per-theme GarageProvider.
 */
export function QueensburyShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  return (
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="queensbury"
      provider={GarageProvider}
      header={<Header />}
      footer={<Footer />}
    >
      {children}
    </ThemeChrome>
  )
}

export default QueensburyShell
