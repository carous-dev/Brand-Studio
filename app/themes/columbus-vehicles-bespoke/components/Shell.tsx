'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
// Brandstudio global widgets — same implementation across every theme.
// `@/*` maps to project root in tsconfig, so widgets live at `@/app/widgets/...`.
import AnimateOnScroll from '@/app/widgets/AnimateOnScroll'
import CookieBanner from '@/app/widgets/CookieBanner'

import '../styles/base.css'
import '../styles/color-policy.css'

const KNOWN_ROUTES = new Set([
  '/', '/about', '/about-us', '/contact', '/contact-us',
  '/cookie-policy', '/privacy-policy', '/services',
  '/sell-your-car', '/sell-my-car', '/finance', '/part-exchange',
  '/used-cars', '/recently-sold', '/wishlist', '/compare',
])

/**
 * SKELETON Shell — replace with archetype-appropriate composition during
 * Phase 8. Currently provides minimal structural plumbing only:
 *  - GarageProvider for wishlist/compare state
 *  - Header / main / Footer
 *  - Special-area handling for /dashboard and /login
 *
 * Phase 8 ADDITIONS to consider per archetype: skip-to-content link,
 * AOS provider, cookie banner, WhatsApp widget, preview banner. None of
 * these are mandatory — keep only what the archetype calls for.
 */
export function ColumbusShell({ children }: { children: ReactNode }) {
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
      <main id="content" role="main" className="columbus-main main-dashboard">
        {children}
      </main>
    )
  }

  return (
    <GarageProvider brandSlug={brand?.slug || 'default'}>
      <a href="#content" className="columbus-skip-link">Skip to content</a>
      <AnimateOnScroll />
      <Header />
      <main id="content" role="main" className="columbus-main">
        {children}
      </main>
      <Footer />
      <CookieBanner brandSlug={brand?.slug} cookiePolicyHref="/cookie-policy" />
    </GarageProvider>
  )
}

export default ColumbusShell
