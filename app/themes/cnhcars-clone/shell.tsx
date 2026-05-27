'use client'

import type { ReactNode } from 'react'
import AnimateOnScroll from '@/app/widgets/AnimateOnScroll/AnimateOnScroll'
import MotionFX from '@/app/widgets/MotionFX/MotionFX'
import ScrollProgress from '@/app/widgets/ScrollProgress/ScrollProgress'
import PreviewBanner from '@/app/widgets/PreviewBanner/PreviewBanner'
import CookieBanner from '@/app/widgets/CookieBanner/CookieBanner'
import WhatsAppFab from '@/app/widgets/WhatsAppFab/WhatsAppFab'
import type { ThemeShellComponent } from '../types'
import { useBrand } from './context/BrandClientWrapper'
import Providers from './components/Providers'
import Header from './components/Header'
import Footer from './components/Footer'

import './styles/base.css'

/**
 * cnhcars-clone theme shell. The context registry mounts BrandClientWrapper +
 * BrandStyles + AuthProvider + DynamicFavicon ABOVE this shell — so here we
 * only compose source-app Providers (WishlistContext) + Header / children /
 * Footer, plus the brandstudio-global widgets.
 */
export const themeShell: ThemeShellComponent = ({ children }) => {
  const brand = useBrand() as any

  return (
    <Providers>
      <PreviewBanner brand={brand} />
      <AnimateOnScroll />
      <MotionFX />
      <ScrollProgress />
      <Header />
      {children as ReactNode}
      <Footer />
      <WhatsAppFab brand={brand} />
      <CookieBanner />
    </Providers>
  )
}

export default themeShell
