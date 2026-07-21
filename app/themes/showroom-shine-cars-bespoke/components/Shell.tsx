'use client'

import { ReactNode } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import BrowseByMake from './BrowseByMake'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'

import '../styles/base.css'
import '../styles/color-policy.css'

/**
 * Showroom shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack, GarageProvider). Theme-specific bits: its
 * own Header/Footer, the BrowseByMake band mounted site-wide below <main>, and
 * its "Garage cookies" consent voice. CSS namespace is `shr-`.
 */
export function ShowroomShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  return (
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="shr"
      provider={GarageProvider}
      header={<Header />}
      footer={<Footer />}
      belowMain={<BrowseByMake />}
      cookie={{
        title: 'Garage cookies',
        summary:
          'We use essential cookies to run the site. Analytics and marketing cookies help us improve your visit — pick what you’re happy with.',
      }}
    >
      {children}
    </ThemeChrome>
  )
}

export default ShowroomShell
