'use client'

import type { ThemeShellComponent } from '../types'
import ThemeChrome from '@/app/themes/lib/ThemeChrome'
import { useBrand } from './context/BrandClientWrapper'
import { GarageProvider } from './context/GarageContext'
import Header from './components/Header'
import Footer from './components/Footer'
import BrowseByMake from './components/BrowseByMake'
import SmoothScroll from './components/SmoothScroll'

import './styles/base.css'
import './styles/color-policy.css'

/**
 * redgate-lodge-bespoke theme shell — thin wrapper over the shared
 * <ThemeChrome> (route-gating, skip-link, canonical widget stack). Theme
 * identity lives in its own Header/Footer + base.css; ThemeChrome handles the
 * rest. Keeps `classPrefix="redgate"` so `.redgate-main` / `.redgate-skip-link`
 * selectors in base.css still match.
 */
export const themeShell: ThemeShellComponent = ({ children }) => {
  const brand = useBrand() as any

  return (
    <>
      <SmoothScroll />
      <ThemeChrome
        brand={brand ?? null}
        classPrefix="redgate"
        provider={GarageProvider}
        header={<Header />}
        footer={<Footer />}
        belowMain={<BrowseByMake />}
        cookie={{
          title: 'A warm welcome — and a note on cookies',
          summary:
            'We use a few cookies to keep the lodge running smoothly and to remember the cars you love. Settle in and browse; you can change your mind any time.',
        }}
      >
        {children}
      </ThemeChrome>
    </>
  )
}

export default themeShell
