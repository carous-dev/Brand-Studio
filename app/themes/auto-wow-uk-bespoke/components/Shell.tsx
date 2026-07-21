'use client'

import { ReactNode } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'

import '../styles/base.css'
import '../styles/color-policy.css'

/**
 * Auto Wow shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack, GarageProvider, shared CookieBanner).
 * Theme-specific bits: its own Header/Footer and the cookie-banner voice.
 */
export function AutoShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  return (
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="auto"
      provider={GarageProvider}
      header={<Header />}
      footer={<Footer />}
      cookie={{
        title: 'We use cookies to keep this site running',
        summary:
          'Essential cookies are always on to keep the site working. Choose which of the rest to allow, or accept all.',
      }}
    >
      {children}
    </ThemeChrome>
  )
}

export default AutoShell
