'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
// Brandstudio global widgets — same implementation across every theme.
// Don't re-roll AOS / cookie consent per theme; mount the widgets and
// pass brand-aware props.
import AnimateOnScroll from '@/app/widgets/AnimateOnScroll'
import { MotionFX } from '@/app/widgets/MotionFX'
import ScrollProgress from '@/app/widgets/ScrollProgress'
import PreviewBanner from '@/app/widgets/PreviewBanner'
import WhatsAppFab from '@/app/widgets/WhatsAppFab'
import AutowowCookieBanner from './AutowowCookieBanner'

import '../styles/base.css'
import '../styles/color-policy.css'

const KNOWN_ROUTES = new Set([
  '/', '/about', '/about-us', '/contact', '/contact-us',
  '/cookie-policy', '/privacy-policy', '/services',
  '/sell-your-car', '/sell-my-car', '/finance', '/part-exchange',
  '/used-cars', '/recently-sold', '/wishlist', '/compare',
])

/**
 * SKELETON Shell — Phase 8 redesigns this per the chosen archetype.
 *
 * What this stub already wires up (don't remove unless you have a strong
 * archetype-specific reason):
 *  - GarageProvider for wishlist/compare state.
 *  - Skip-to-content link for keyboard users.
 *  - <AnimateOnScroll /> — global widget mounting the scroll-reveal observer.
 *  - <CookieBanner /> — UK GDPR consent. Replace with a per-theme bespoke
 *    banner under `components/<Theme>CookieBanner.tsx` during Phase 8
 *    (the shared widget is a fallback / starter, not the default for
 *    bespoke themes — see SKILL Quality Bar §"Cookie banners must NOT
 *    be one-size-fits-all").
 *  - <WhatsAppFab /> — floating WhatsApp CTA with online/offline status
 *    derived from `brand.openingHours`. Theme-agnostic, brand-token-driven.
 *
 * Phase 8 typically does NOT add: per-theme AOS reimplementations,
 * ad-hoc preview banners, hand-rolled WhatsApp widgets. Use the global
 * widgets and add archetype-specific decoration (Header/Footer styling,
 * hero patterns, section composition) on top.
 */
export function AutoShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  const pathname = usePathname() || ''
  const isKnownRoute =
    KNOWN_ROUTES.has(pathname) ||
    pathname.startsWith('/used-cars/') ||
    pathname.startsWith('/dashboard') ||
    pathname === '/login'
  const isSpecialArea = pathname.startsWith('/dashboard') || pathname === '/login' || !isKnownRoute

  if (isSpecialArea) {
    return (
      <main id="content" role="main" className="auto-main main-dashboard">
        {children}
      </main>
    )
  }

  return (
    <GarageProvider brandSlug={brand?.slug || 'default'}>
      <a href="#content" className="auto-skip-link">Skip to content</a>
      <AnimateOnScroll />
      <MotionFX />
      <ScrollProgress />
      <PreviewBanner brand={brand} />
      <Header />
      <main id="content" role="main" className="auto-main">
        {children}
      </main>
      <Footer />
      <WhatsAppFab brand={brand} />
      <AutowowCookieBanner brandSlug={brand?.slug} cookiePolicyHref="/cookie-policy" />
    </GarageProvider>
  )
}

export default AutoShell
