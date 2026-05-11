'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, MapPin, Phone, Mail, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import type { WorkingPeriod } from '@/app/lib/working-status'
import styles from './Header.module.css'

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  // Treat /used-cars/<slug> as active for /used-cars; same for /sell-my-car/.
  return pathname === href || pathname.startsWith(`${href}/`)
}

const FALLBACK_PERIODS: WorkingPeriod[] = [
  { day: 'mon', from: '09:00', to: '18:00' },
  { day: 'tue', from: '09:00', to: '18:00' },
  { day: 'wed', from: '09:00', to: '18:00' },
  { day: 'thu', from: '09:00', to: '18:00' },
  { day: 'fri', from: '09:00', to: '18:00' },
  { day: 'sat', from: '09:00', to: '18:00' },
]

const NAV_ITEMS = [
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'Services', href: '/services' },
  { label: 'Finance', href: '/finance' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
]

const SOCIAL_LINKS = [
  { key: 'facebook', icon: Facebook, label: 'Facebook' },
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
  { key: 'youtube', icon: Youtube, label: 'YouTube' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
] as const

export default function Header() {
  const brand = useBrand()
  const brandName = brand?.name || 'Showroom Shine Cars'
  const location = (brand as any)?.location || {}
  const address = (location?.address || {}) as Record<string, string | undefined>
  const city = (address.city || (typeof location.city === 'string' ? location.city : '') || '').trim()
  const county = (address.county || (typeof location.county === 'string' ? location.county : '') || '').trim()
  const locationLabel = [city, county].filter(Boolean).join(', ')
  const phoneDisplay = (typeof location.phone === 'string' ? location.phone : '') || '07537 164927'
  const phoneTel = phoneDisplay.replace(/[^\d+]/g, '')
  const socials: Record<string, string> = (brand as any)?.socialLinks || {}

  const workingConfig = useMemo(() => {
    const raw = (brand as any)?.openingHours
    const periods: WorkingPeriod[] = Array.isArray(raw?.periods) && raw.periods.length > 0
      ? raw.periods
      : FALLBACK_PERIODS
    return { periods, timezone: raw?.timezone || 'Europe/London' }
  }, [brand])
  const { isOnline } = useWorkingHours(workingConfig)
  const pathname = usePathname() || '/'
  const [navOpen, setNavOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  return (
    <>
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`} data-aos="fade-down">
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.topbarLeft}>
            {locationLabel ? (
              <span className={styles.topChip}>
                <MapPin size={14} strokeWidth={2.2} aria-hidden />
                {locationLabel}
              </span>
            ) : null}
            <span className={`${styles.topChip} ${styles.topChipStatus}`}>
              <span className={`mfx-pulse-dot ${isOnline ? styles.dotOpen : styles.dotClosed}`} aria-hidden />
              {isOnline ? 'OPEN NOW' : 'BY APPOINTMENT'}
            </span>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.socials} aria-label="Social media">
              {SOCIAL_LINKS.map(({ key, icon: Icon, label }) => {
                const url = socials[key]
                return (
                  <a
                    key={key}
                    href={url || '#'}
                    target={url ? '_blank' : undefined}
                    rel={url ? 'noopener noreferrer' : undefined}
                    className={styles.socialLink}
                    aria-label={label}
                    onClick={url ? undefined : (e) => e.preventDefault()}
                  >
                    <Icon size={14} strokeWidth={2} />
                  </a>
                )
              })}
            </div>
            <a href={`tel:${phoneTel}`} className={styles.topPhone}>
              <Phone size={14} strokeWidth={2.2} aria-hidden />
              {phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <div className={styles.mainBar}>
        <div className={styles.mainBarInner}>
          <Link href="/" className={styles.brandLink} aria-label={brandName}>
            <span className={styles.brandWordmarkAccent}>SHOWROOM</span>
            <span className={styles.brandWordmarkSub}>SHINE CARS</span>
          </Link>

          <nav aria-label="Primary" className={styles.primaryNav}>
            {NAV_ITEMS.map((item) => {
              const active = isActiveRoute(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className={styles.mainBarActions}>
            <a href={`tel:${phoneTel}`} className={styles.callCta}>
              <Phone size={16} strokeWidth={2.4} aria-hidden />
              Call now
            </a>
            <Link href="/used-cars" className={`shr-btn-primary mfx-shimmer ${styles.browseCta}`}>
              Browse stock
            </Link>
            <button
              type="button"
              className={styles.hamburger}
              aria-label="Open menu"
              aria-expanded={navOpen}
              aria-controls="shr-mobile-nav"
              onClick={() => setNavOpen(true)}
            >
              <Menu size={24} strokeWidth={2} />
            </button>
          </div>
        </div>
        <div className={styles.accentLine} aria-hidden />
      </div>
    </header>

    {/* Mobile nav lives OUTSIDE <header> because the header's backdrop-filter
     * creates a stacking context that traps `position: fixed` children. As a
     * sibling of <header>, the nav can use a high z-index that beats
     * WhatsAppFab / CookieBanner / PreviewBanner. */}
    <div
      id="shr-mobile-nav"
      className={`${styles.mobileNav} ${navOpen ? styles.mobileNavOpen : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      hidden={!navOpen}
    >
        <div className={styles.mobileNavHead}>
          <Link href="/" onClick={() => setNavOpen(false)} className={styles.mobileBrand}>
            <span className={styles.brandWordmarkAccent}>SHOWROOM</span>
            <span className={styles.brandWordmarkSub}>SHINE CARS</span>
          </Link>
          <button
            type="button"
            className={styles.mobileClose}
            aria-label="Close menu"
            onClick={() => setNavOpen(false)}
          >
            <X size={24} strokeWidth={2} />
          </button>
        </div>
        <nav aria-label="Mobile" className={styles.mobileNavLinks}>
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className={`${styles.mobileNavLink} ${active ? styles.mobileNavLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className={styles.mobileNavFooter}>
          <a href={`tel:${phoneTel}`} className={styles.mobileCallCta}>
            <Phone size={18} strokeWidth={2.4} aria-hidden />
            {phoneDisplay}
          </a>
          <a href={`mailto:${(brand as any)?.location?.email || 'info@showroomshinecars.co.uk'}`} className={styles.mobileEmailCta}>
            <Mail size={18} strokeWidth={2.4} aria-hidden />
            Email us
          </a>
          <div className={styles.mobileSocials} aria-label="Social media">
            {SOCIAL_LINKS.map(({ key, icon: Icon, label }) => {
              const url = socials[key]
              return url ? (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={label}
                >
                  <Icon size={18} strokeWidth={2} />
                </a>
              ) : (
                <span
                  key={key}
                  className={`${styles.socialLink} ${styles.socialLinkDisabled}`}
                  aria-hidden
                >
                  <Icon size={18} strokeWidth={2} />
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
