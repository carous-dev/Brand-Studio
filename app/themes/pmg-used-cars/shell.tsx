'use client'

import type { ThemeShellComponent } from '../types'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'
import { useBrand } from './context/BrandClientWrapper'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { PmgConsentBar } from './components/PmgConsentBar'
import SmoothScroll from './components/SmoothScroll'

import './styles/base.css'
import './styles/color-policy.css'

/**
 * PMG Used Car Sales theme shell — thin wrapper over the shared <ThemeChrome>
 * (route-gating, skip-link, PreviewBanner + AOS/MotionFX/ScrollProgress stack).
 *
 * Theme-specific bits: PMG's own sticky/overlay Header + jet Footer, the source
 * app's smooth-scroll (Lenis), and its own bottom-left dark-glass consent bar
 * (PmgConsentBar). ThemeChrome's shared CookieBanner + floating WhatsApp are
 * disabled — PMG surfaces consent via its own banner and WhatsApp via wa.me
 * links in the utility bar / header / detail page (no floating FAB in the
 * source design).
 *
 * @carous/garage is provider-less (localStorage + CustomEvents) so no wishlist
 * provider is needed. The context registry mounts BrandClientWrapper +
 * BrandStyles + AuthProvider + DynamicFavicon above this shell.
 */
export const themeShell: ThemeShellComponent = ({ children }) => {
  const brand = useBrand() as any

  return (
    <>
      <SmoothScroll />
      <ThemeChrome
        brand={brand ?? null}
        classPrefix="pmg"
        extraRoutes={['/car-sourcing']}
        header={<Header />}
        footer={<Footer />}
        widgets={{ cookieBanner: false, whatsApp: false }}
      >
        {children}
        <PmgConsentBar />
      </ThemeChrome>
    </>
  )
}

export default themeShell
