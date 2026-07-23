'use client'

import type { ThemeShellComponent } from '../types'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'
import { useBrand } from './context/BrandClientWrapper'
import Providers from './components/Providers'
import Header from './components/Header'
import Footer from './components/Footer'
import SmoothScroll from './components/SmoothScroll'

import './styles/base.css'
import './styles/color-policy.css'

/**
 * cnhcars-clone theme shell — thin wrapper over the shared <ThemeChrome>
 * (route-gating, skip-link, canonical widget stack). Theme-specific bits: its
 * own Header/Footer and the divergent legal/content routes.
 *
 * The source-app WishlistContext lives in `Providers`; it is NOT a
 * {brandSlug, children} provider, so it wraps <ThemeChrome> EXTERNALLY rather
 * than being passed via the `provider` prop. The context registry mounts
 * BrandClientWrapper + BrandStyles + AuthProvider + DynamicFavicon above this
 * shell.
 */
export const themeShell: ThemeShellComponent = ({ children }) => {
  const brand = useBrand() as any

  return (
    <Providers>
      <SmoothScroll />
      <ThemeChrome
        brand={brand ?? null}
        classPrefix="cnhcars"
        extraRoutes={['/cookies', '/privacy', '/disclaimer', '/terms', '/testimonials']}
        header={<Header />}
        footer={<Footer />}
      >
        {children}
      </ThemeChrome>
    </Providers>
  )
}

export default themeShell
