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
import WhatsAppFab from '@/app/widgets/WhatsAppFab'
import EleCookieBanner from './EleCookieBanner'

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
 *  - <AnimateOnScroll /> from @/app/widgets/AnimateOnScroll — once mounted
 *    here, every page can use data-aos="fade-up" / "zoom-in" etc. without
 *    re-mounting the observer.
 *  - <CookieBanner /> from @/app/widgets/CookieBanner — UK GDPR consent.
 *    Pass brand-aware props for the localStorage key + cookie-policy link.
 *
 * Phase 8 typically does NOT add: per-theme AOS reimplementations,
 * per-theme cookie banners, ad-hoc preview banners. Use the global widgets
 * and add archetype-specific decoration (Header/Footer styling, hero
 * patterns, section composition) on top of them.
 */
export function EleShell({ children }: { children: ReactNode }) {
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
      <main id="content" role="main" className="ele-main main-dashboard">
        {children}
      </main>
    )
  }

  return (
    <GarageProvider brandSlug={brand?.slug || 'default'}>
      <a href="#content" className="ele-skip-link">Skip to content</a>
      <AnimateOnScroll />
      <Header />
      <main id="content" role="main" className="ele-main">
        {children}
      </main>
      <Footer />
      <WhatsAppFab brand={brand} />
      <EleCookieBanner brandSlug={brand?.slug} cookiePolicyHref="/cookie-policy" />
    </GarageProvider>
  )
}

export default EleShell
