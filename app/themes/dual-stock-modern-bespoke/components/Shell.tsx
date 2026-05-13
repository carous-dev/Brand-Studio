'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
// Brandstudio global widgets — same implementation across every theme.
// Don't re-roll AOS / cookie consent / motion FX / preview-banner per
// theme; mount the widgets and pass brand-aware props.
import AnimateOnScroll from '@/app/widgets/AnimateOnScroll'
import { MotionFX } from '@/app/widgets/MotionFX'
import ScrollProgress from '@/app/widgets/ScrollProgress'
import PreviewBanner from '@/app/widgets/PreviewBanner'
import WhatsAppFab from '@/app/widgets/WhatsAppFab'
import DualStockCookieBanner from './DualStockCookieBanner'

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
 *    Use data-aos="<variant>" on any element (18 variants supported — fade,
 *    fade-up/down/left/right, fade-up-right/up-left/down-right/down-left,
 *    zoom-in/out, zoom-in-up, zoom-out-down, flip-up/down/left/right,
 *    slide-up/down, blur-in). Optional: data-aos-delay / -duration / -easing.
 *  - <MotionFX /> — CSS-only injector for animated neon/light primitives:
 *    .mfx-glow-pulse, .mfx-glow-orbit, .mfx-pulse-dot, .mfx-shimmer,
 *    .mfx-text-glow, .mfx-border-glow, .mfx-scan, .mfx-float, .mfx-tilt,
 *    .mfx-grid-drift. All brand-token-driven, all reduced-motion safe.
 *  - <ScrollProgress /> — rAF-throttled scroll-tied progress driver. Add
 *    data-mfx-scroll="parallax-slow|parallax-medium|parallax-fast|
 *    fade-out-on-exit|blur-on-exit|zoom-on-enter" to any container — its
 *    children get the effect for free. Themes can also consume
 *    var(--mfx-progress) (0 → 1) directly in their own CSS modules.
 *  - <PreviewBanner brand={brand} /> — sticky-top notice strip that renders
 *    when NEXT_PUBLIC_PREVIEW=1 (set by the preview-deploy env, NOT in
 *    production). Brand-token-driven (--color-primary), shows the dealer
 *    name + a link to carous.co.uk. Renders nothing in production — safe
 *    to always mount. MUST sit before <Header /> in the Shell so it
 *    pushes content down rather than overlapping the nav.
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
export function DualShell({ children }: { children: ReactNode }) {
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
      <main id="content" role="main" className="dual-main main-dashboard">
        {children}
      </main>
    )
  }

  return (
    <GarageProvider brandSlug={brand?.slug || 'default'}>
      <a href="#content" className="dual-skip-link">Skip to content</a>
      <AnimateOnScroll />
      <MotionFX />
      <ScrollProgress />
      <PreviewBanner brand={brand} />
      <Header />
      <main id="content" role="main" className="dual-main">
        {children}
      </main>
      <Footer />
      <WhatsAppFab brand={brand} />
      <DualStockCookieBanner brandSlug={brand?.slug} cookiePolicyHref="/cookie-policy" />
    </GarageProvider>
  )
}

export default DualShell
