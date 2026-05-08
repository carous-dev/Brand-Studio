'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import CookieBanner from './CookieBanner'
import WhatsAppEnquiry from './WhatsAppEnquiry'
import PreviewBanner from './PreviewBanner'
import AosProvider from './AosProvider'

import '../styles/base.css'
import '../styles/color-policy.css'
import '../styles/header.css'
import '../styles/footer.css'
import '../styles/cookie.css'
import '../styles/hero.css'
import '../styles/sections.css'
import '../styles/whatsapp.css'
import '../styles/preview-banner.css'
import '../styles/aos.css'

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
  '/part-exchange',
  '/used-cars',
  '/recently-sold',
  '/wishlist',
  '/compare',
])

export function SpringallsShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  const pathname = usePathname() || ''
  const isKnownRoute =
    KNOWN_ROUTES.has(pathname) || pathname.startsWith('/used-cars/') || pathname.startsWith('/dashboard') || pathname === '/login'
  const isSpecialArea = pathname.startsWith('/dashboard') || pathname === '/login' || !isKnownRoute

  if (isSpecialArea) {
    return (
      <main id="content" role="main" className="springalls-main main-dashboard">
        {children}
      </main>
    )
  }

  return (
    <GarageProvider brandSlug={brand?.slug || 'default'}>
      <AosProvider />
      <PreviewBanner />
      <Header />
      <main id="content" role="main" className="springalls-main">
        {children}
      </main>
      <Footer />
      <CookieBanner />
      <WhatsAppEnquiry />
    </GarageProvider>
  )
}

export default SpringallsShell
