'use client'

import type { ComponentType, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import type { BrandConfig } from '@/brands/types'

import AnimateOnScroll from '@/app/widgets/AnimateOnScroll'
import { MotionFX } from '@/app/widgets/MotionFX'
import ScrollProgress from '@/app/widgets/ScrollProgress'
import PreviewBanner from '@/app/widgets/PreviewBanner'
import CookieBanner from '@/app/widgets/CookieBanner'
import CarousWhatsAppWidget from '@/app/widgets/CarousWhatsAppWidget'

import { isKnownRoute } from './known-routes'

/**
 * Shared theme chrome — the standard shell wiring every theme repeats.
 * =============================================================================
 *
 * Centralizes: route-gating (public page vs dashboard/login/unknown → bare),
 * skip-link, the canonical widget stack (AnimateOnScroll, MotionFX,
 * ScrollProgress, PreviewBanner, CookieBanner, CarousWhatsAppWidget), and the
 * optional Garage/Wishlist provider. Themes pass their own <Header/> / <Footer/>
 * (+ optional belowMain band) and a `classPrefix` for the skip-link / main
 * classes, and a `cookie` voice. This kills the copy-pasted KNOWN_ROUTES +
 * widget-mount drift while keeping each theme's identity.
 *
 * Provider is injectable: each theme supplies its OWN GarageProvider (per-theme
 * context/GarageContext); cnhcars passes its WishlistContext instead. Omit for
 * no wrapping.
 */
export interface ThemeChromeProps {
  brand: BrandConfig | null
  children: ReactNode
  /** CSS namespace prefix, e.g. 'warwick' → `.warwick-main` / `.warwick-skip-link`. */
  classPrefix: string
  header: ReactNode
  footer: ReactNode
  /** Rendered between </main> and <Footer>, e.g. a BrowseByMake band. */
  belowMain?: ReactNode
  /** Extra public routes this theme adds beyond the canonical set. */
  extraRoutes?: readonly string[]
  /** Per-theme provider (GarageProvider / WishlistContext). Wraps everything when set.
   *  ThemeChrome always passes a defined brandSlug string. */
  provider?: ComponentType<{ brandSlug: string; children: ReactNode }>
  /** Opt-out flags for individual widgets. All default ON. */
  widgets?: {
    aos?: boolean
    motionFx?: boolean
    scrollProgress?: boolean
    previewBanner?: boolean
    cookieBanner?: boolean
    whatsApp?: boolean
  }
  /** Per-theme cookie-banner voice. */
  cookie?: { title?: string; summary?: string; cookiePolicyHref?: string }
}

export function ThemeChrome({
  brand,
  children,
  classPrefix,
  header,
  footer,
  belowMain,
  extraRoutes = [],
  provider: Provider,
  widgets,
  cookie,
}: ThemeChromeProps) {
  const pathname = usePathname() || ''
  const w = {
    aos: true,
    motionFx: true,
    scrollProgress: true,
    previewBanner: true,
    cookieBanner: true,
    whatsApp: true,
    ...(widgets || {}),
  }

  // Dashboard / login / any non-site route → render bare, no chrome.
  const isSpecialArea =
    pathname.startsWith('/dashboard') ||
    pathname === '/login' ||
    !isKnownRoute(pathname, extraRoutes)

  if (isSpecialArea) {
    return (
      <main id="content" role="main" className={`${classPrefix}-main main-dashboard`}>
        {children}
      </main>
    )
  }

  const inner = (
    <>
      {w.aos && <AnimateOnScroll />}
      {w.motionFx && <MotionFX />}
      {w.scrollProgress && <ScrollProgress />}
      <a href="#content" className={`${classPrefix}-skip-link`}>
        Skip to content
      </a>
      {w.previewBanner && <PreviewBanner brand={brand} />}
      {header}
      <main id="content" role="main" className={`${classPrefix}-main`}>
        {children}
      </main>
      {belowMain}
      {footer}
      {w.whatsApp && brand && <CarousWhatsAppWidget brand={brand} />}
      {w.cookieBanner && (
        <CookieBanner
          brandSlug={brand?.slug}
          cookiePolicyHref={cookie?.cookiePolicyHref || '/cookie-policy'}
          title={cookie?.title}
          summary={cookie?.summary}
        />
      )}
    </>
  )

  if (Provider) {
    return <Provider brandSlug={brand?.slug || 'default'}>{inner}</Provider>
  }
  return inner
}

export default ThemeChrome
