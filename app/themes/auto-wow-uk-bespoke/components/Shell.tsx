'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import AutoWowCookieBanner from './AutoWowCookieBanner'

import AnimateOnScroll from '@/app/widgets/AnimateOnScroll'
import { MotionFX } from '@/app/widgets/MotionFX'
import ScrollProgress from '@/app/widgets/ScrollProgress'
import PreviewBanner from '@/app/widgets/PreviewBanner'
import WhatsAppFab from '@/app/widgets/WhatsAppFab'

import '../styles/base.css'
import '../styles/color-policy.css'

// audit-ignore-file: lib-missing-cookie-banner — per-theme AutoWowCookieBanner replaces the shared widget.

const KNOWN_ROUTES = new Set([
  '/', '/about', '/about-us', '/contact', '/contact-us',
  '/cookie-policy', '/privacy-policy', '/services',
  '/sell-your-car', '/sell-my-car', '/finance', '/part-exchange',
  '/used-cars', '/recently-sold', '/wishlist', '/compare',
])

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
      <AutoWowCookieBanner />
    </GarageProvider>
  )
}

export default AutoShell
