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
 * FBM shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack, GarageProvider, shared CookieBanner).
 * Theme-specific bits:
 *  - SmoothScroll (Lenis-based, renders null) folded into the header fragment
 *    so it mounts alongside chrome; ThemeChrome does not own it.
 *  - a deliberately LEAN widget set: MotionFX and ScrollProgress are opted out
 *    (fbm only wants AnimateOnScroll + PreviewBanner + CookieBanner + WhatsApp).
 * All of fbm's public routes are already in the shared known-route set, so no
 * extraRoutes are needed.
 */
export function FbmShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  return (
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="fbm"
      provider={GarageProvider}
      header={<><SmoothScroll /><Header /></>}
      footer={<Footer />}
      widgets={{ motionFx: false, scrollProgress: false }}
    >
      {children}
    </ThemeChrome>
  )
}

export default FbmShell
