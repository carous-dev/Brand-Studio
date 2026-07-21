'use client'

import { ReactNode } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { GarageProvider } from '../context/GarageContext'
import Header from './Header'
import Footer from './Footer'
import KainA11yToolbar from './KainA11yToolbar'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'

import '../styles/base.css'
import '../styles/color-policy.css'

/**
 * Kain shell — thin wrapper over the shared <ThemeChrome> (route-gating,
 * skip-link, canonical widget stack, GarageProvider). Theme-specific chrome:
 * its own Header/Footer plus the floating KainA11yToolbar (text-size control),
 * folded into the footer fragment so ThemeChrome mounts it after the Footer as
 * in the original tree. All of Kain's routes are in the canonical set, so no
 * extraRoutes are needed. The `cookie` voice preserves Kain's understated copy.
 */
export function KainShell({ children }: { children: ReactNode }) {
  const brand = useBrand()
  return (
    <ThemeChrome
      brand={brand ?? null}
      classPrefix="kain"
      provider={GarageProvider}
      header={<Header />}
      footer={<><Footer /><KainA11yToolbar /></>}
      cookie={{
        title: 'Cookies',
        summary: 'We use cookies to keep the site running and improve your visit.',
      }}
    >
      {children}
    </ThemeChrome>
  )
}

export default KainShell
