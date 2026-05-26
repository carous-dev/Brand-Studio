'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { useGarage } from '../context/GarageContext'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Header.module.css'

const NAV_ITEMS: Array<{ label: string; href: string }> = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'Finance', href: '/finance' },
  { label: 'Services', href: '/services' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'Contact', href: '/contact' },
]

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  if (href === '/used-cars') return pathname === '/used-cars' || pathname.startsWith('/used-cars/')
  return pathname === href || pathname.startsWith(href + '/')
}

// Inline SVG icons — kept here to avoid runtime icon lib imports.
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.563V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5 3-5 3z" />
    </svg>
  )
}
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.34 18.34H5.67V9.67h2.67v8.67zM7 8.5a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1zm11.33 9.84h-2.66v-4.5c0-1.07-.02-2.45-1.49-2.45-1.5 0-1.73 1.17-1.73 2.37v4.58H9.78V9.67h2.56v1.18h.04c.36-.68 1.23-1.4 2.53-1.4 2.7 0 3.2 1.78 3.2 4.1v4.79z" />
    </svg>
  )
}
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}
function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
function CompareIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 3h5v5M4 20l16-16M21 16v5h-5M4 4l5 5" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l18 18" />
    </svg>
  )
}

export default function Header() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const garage = useGarage()
  const { isOnline } = useWorkingHours(brand?.openingHours as any)
  const contact = useMemo(() => getBrandContactInfo(brand), [brand])

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const onLogoError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    img.style.display = 'none'
    const sibling = img.nextElementSibling as HTMLElement | null
    if (sibling) sibling.style.display = 'inline-block'
  }, [])

  const social = (brand as any)?.socialLinks || {}
  const socialItems = [
    { id: 'facebook', label: 'Facebook', url: social.facebook, Icon: FacebookIcon },
    { id: 'instagram', label: 'Instagram', url: social.instagram, Icon: InstagramIcon },
    { id: 'youtube', label: 'YouTube', url: social.youtube, Icon: YoutubeIcon },
    { id: 'linkedin', label: 'LinkedIn', url: social.linkedin, Icon: LinkedinIcon },
  ]

  const addr: any = brand?.location?.address || {}
  const locationParts = [addr.city, addr.county].filter(Boolean)
  const locationLabel = locationParts.join(', ')

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      {/* Signature 3px gradient accent strip */}
      <div className={styles.accentStrip} aria-hidden="true" />

      {/* Top contact bar — required composition */}
      <div className={styles.topBar} aria-hidden={scrolled}>
        <div className={styles.topBarInner}>
          {locationLabel && (
            <span className={styles.topBarItem}>
              <MapPinIcon />
              <span>{locationLabel}</span>
            </span>
          )}
          <span className={`${styles.topBarItem} ${styles.statusPill}`} aria-live="polite">
            <span
              className={`${styles.statusDot} mfx-pulse-dot ${isOnline ? styles.statusDotOnline : styles.statusDotOffline}`}
              aria-hidden="true"
            />
            <span>{isOnline ? 'Live stock · Open now' : 'By appointment'}</span>
          </span>
          <span className={styles.topBarSpacer} aria-hidden="true" />
          <span className={styles.socialRow} aria-label="Social links">
            {socialItems.map(({ id, label, url, Icon }) =>
              url ? (
                <a
                  key={id}
                  href={String(url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={styles.socialLink}
                >
                  <Icon />
                </a>
              ) : (
                <span key={id} aria-label={label} className={styles.socialLink} role="presentation">
                  <Icon />
                </span>
              ),
            )}
          </span>
          {contact.phoneDisplay && (
            <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.phoneCta}>
              <PhoneIcon />
              <span>{contact.phoneDisplay}</span>
            </a>
          )}
        </div>
      </div>

      {/* Main dark nav */}
      <div className={styles.navBar}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.brand} aria-label={brand?.name || 'Queensbury Cars'}>
            {brand?.logo && (
              <img
                src={brand.logo}
                alt=""
                className={styles.brandLogo}
                onError={onLogoError}
              />
            )}
            <span className={styles.brandWordmark} style={brand?.logo ? { display: 'none' } : undefined}>
              {brand?.name || 'Queensbury Cars'}
            </span>
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
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

          <div className={styles.navActions}>
            <Link href="/wishlist" className={styles.iconAction} aria-label={`Wishlist (${garage.wishlistCount})`}>
              <HeartIcon />
              {garage.wishlistCount > 0 && <span className={styles.actionBadge}>{garage.wishlistCount}</span>}
            </Link>
            <Link href="/compare" className={styles.iconAction} aria-label={`Compare (${garage.compareCount})`}>
              <CompareIcon />
              {garage.compareCount > 0 && <span className={styles.actionBadge}>{garage.compareCount}</span>}
            </Link>
            <Link href="/used-cars" className={`qb-btn qb-btn--gradient qb-btn--sm ${styles.searchCta}`}>
              <SearchIcon />
              <span>Browse Stock</span>
            </Link>
            <button
              type="button"
              className={styles.menuToggle}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile full-screen overlay nav */}
      <div className={`${styles.mobileOverlay} ${mobileOpen ? styles.mobileOverlayOpen : ''}`} role="dialog" aria-modal="true" aria-label="Site menu">
        <nav aria-label="Mobile primary" className={styles.mobileNav}>
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className={styles.mobileFooter}>
          {contact.phoneDisplay && (
            <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.mobilePhone}>
              <PhoneIcon />
              <span>{contact.phoneDisplay}</span>
            </a>
          )}
          <div className={styles.mobileSocials}>
            {socialItems.map(({ id, label, url, Icon }) =>
              url ? (
                <a key={id} href={String(url)} target="_blank" rel="noopener noreferrer" aria-label={label} className={styles.mobileSocialLink}>
                  <Icon />
                </a>
              ) : (
                <span key={id} aria-label={label} className={styles.mobileSocialLink} role="presentation">
                  <Icon />
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
