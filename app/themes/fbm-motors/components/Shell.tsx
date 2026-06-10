'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import PreviewBanner from '@/app/widgets/PreviewBanner'
import CookieBanner from '@/app/widgets/CookieBanner'
import CarousWhatsAppWidget from '@/app/widgets/CarousWhatsAppWidget'

import '../styles/base.css'

const KNOWN_ROUTES = new Set([
  '/',
  '/about',
  '/about-us',
  '/contact',
  '/contact-us',
  '/cookie-policy',
  '/privacy-policy',
  '/services',
  '/sell-your-car',
  '/sell-my-car',
  '/finance',
  '/loan-calculator',
  '/part-exchange',
  '/used-cars',
  '/recently-sold',
  '/wishlist',
  '/compare',
  '/faqs',
  '/faq',
])

export function FbmShell({ children }: { children: ReactNode }) {
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
      <main id="content" role="main" className="fbm-main main-dashboard">
        {children}
      </main>
    )
  }

  return (
    <GarageProvider brandSlug={brand?.slug || 'default'}>
      <a href="#content" className="fbm-skip-link">Skip to content</a>
      <PreviewBanner brand={brand} />
      <Header />
      <main id="content" role="main" className="fbm-main">
        {children}
      </main>
      <Footer />
      <CarousWhatsAppWidget brand={brand} />
      <CookieBanner brandSlug={brand?.slug} cookiePolicyHref="/cookie-policy" />
    </GarageProvider>
  )
}

export default FbmShell
