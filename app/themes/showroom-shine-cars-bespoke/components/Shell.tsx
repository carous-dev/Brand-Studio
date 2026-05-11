'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import BrowseByMake from './BrowseByMake'
import ShowroomCookieBanner from './ShowroomCookieBanner'
import AnimateOnScroll from '@/app/widgets/AnimateOnScroll'
import '@/app/widgets/AnimateOnScroll/aos.css'
import { MotionFX } from '@/app/widgets/MotionFX'
import ScrollProgress from '@/app/widgets/ScrollProgress'
import PreviewBanner from '@/app/widgets/PreviewBanner'
import WhatsAppFab from '@/app/widgets/WhatsAppFab'

import '../styles/base.css'
import '../styles/color-policy.css'

const KNOWN_ROUTES = new Set([
  '/', '/about', '/about-us', '/contact', '/contact-us',
  '/cookie-policy', '/privacy-policy', '/services',
  '/sell-your-car', '/sell-my-car', '/finance', '/part-exchange',
  '/used-cars', '/recently-sold', '/wishlist', '/compare',
])

export function ShowroomShell({ children }: { children: ReactNode }) {
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
      <main id="content" role="main" className="shr-main main-dashboard">
        {children}
      </main>
    )
  }

  return (
    <GarageProvider brandSlug={brand?.slug || 'default'}>
      <a href="#content" className="shr-skip-link">Skip to content</a>
      <AnimateOnScroll />
      <MotionFX />
      <ScrollProgress />
      <PreviewBanner brand={brand} />
      <Header />
      <main id="content" role="main" className="shr-main">
        {children}
      </main>
      <BrowseByMake />
      <Footer />
      <WhatsAppFab brand={brand} />
      <ShowroomCookieBanner />
    </GarageProvider>
  )
}

export default ShowroomShell
