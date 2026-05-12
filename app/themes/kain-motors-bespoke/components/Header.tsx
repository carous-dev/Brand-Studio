'use client'

import { useEffect, useState, type ReactElement } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { useGarage } from '../context/GarageContext'
import { getBrandContactInfo } from '../lib/contact'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import BrandLogo from './BrandLogo'
import styles from './Header.module.css'

type NavItem = { label: string; href: string }

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Stock', href: '/used-cars' },
  { label: 'Finance', href: '/finance' },
  { label: 'Part Exchange', href: '/part-exchange' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

function isActiveRoute(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9V12h2.5V9.85c0-2.47 1.47-3.84 3.72-3.84 1.08 0 2.21.2 2.21.2v2.43h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.75l-.44 2.89h-2.31V21.87A10 10 0 0 0 22 12Z"/></svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/></svg>
)
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M23 12s0-3.16-.4-4.67a3 3 0 0 0-2.13-2.12C18.96 4.8 12 4.8 12 4.8s-6.96 0-8.47.4A3 3 0 0 0 1.4 7.33C1 8.84 1 12 1 12s0 3.16.4 4.67a3 3 0 0 0 2.13 2.12C5.04 19.2 12 19.2 12 19.2s6.96 0 8.47-.41a3 3 0 0 0 2.13-2.12C23 15.16 23 12 23 12Zm-13.2 3V9l5.2 3-5.2 3Z"/></svg>
)
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.4 9.4h3.16V21H3.4V9.4Zm6.18 0h3.03v1.58h.04c.42-.8 1.45-1.64 2.99-1.64 3.2 0 3.79 2.1 3.79 4.84V21H16.3v-5.4c0-1.29-.02-2.96-1.8-2.96-1.8 0-2.07 1.4-2.07 2.86V21H9.58V9.4Z"/></svg>
)
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M18.244 2H21.5l-7.39 8.45L23 22h-6.74l-5.27-6.92L4.95 22H1.7l7.91-9.04L1 2h6.91l4.76 6.3L18.24 2Zm-1.18 18h1.86L7.04 4H5.06l11.99 16Z"/></svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.92Z"/></svg>
)
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
)
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
)
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>
)
const CompareIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>
)
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
)
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
)

const SOCIAL_DEFS: Array<{ key: string; Icon: () => ReactElement; label: string; fallback: string }> = [
  { key: 'facebook', Icon: FacebookIcon, label: 'Facebook', fallback: 'https://facebook.com' },
  { key: 'instagram', Icon: InstagramIcon, label: 'Instagram', fallback: 'https://instagram.com' },
  { key: 'youtube', Icon: YouTubeIcon, label: 'YouTube', fallback: 'https://youtube.com' },
  { key: 'twitter', Icon: TwitterIcon, label: 'Twitter', fallback: 'https://x.com' },
  { key: 'linkedin', Icon: LinkedInIcon, label: 'LinkedIn', fallback: 'https://linkedin.com' },
]

export default function Header() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const contact = getBrandContactInfo(brand)
  const { isOnline } = useWorkingHours((brand as any)?.openingHours)
  const { wishlistCount, compareCount } = useGarage()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  const socials = (brand as any)?.socialLinks || {}
  const city = contact.city
  const postcode = contact.postcode

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setDrawerOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!drawerOpen && !searchOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [drawerOpen, searchOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    window.location.href = `/used-cars?q=${encodeURIComponent(q)}`
  }

  return (
    <>
      <div className={styles.announcement} role="region" aria-label="Announcement">
        <div className={styles.announcementInner}>
          <span className="mfx-pulse-dot" aria-hidden="true" />
          <span className={styles.announcementText}>
            {city ? `Appointment-only ${city} showroom` : 'Appointment-only showroom'} · Finance from competitive rates · Nationwide delivery available
          </span>
        </div>
      </div>

      <div className={styles.topBar} role="region" aria-label="Showroom contact">
        <div className={styles.topBarInner}>
          <span className={styles.topBarChip}>
            <MapPinIcon />
            <span>{city}{postcode ? ` · ${postcode}` : ''}</span>
          </span>
          <span className={`${styles.topBarChip} ${styles.statusChip}`}>
            <span className={`mfx-pulse-dot ${isOnline ? styles.dotOpen : styles.dotClosed}`} aria-hidden="true" />
            <span>{isOnline ? 'Live stock · Online now' : 'View 24/7 · Reply on opening'}</span>
          </span>
          <span className={styles.topBarSpacer} aria-hidden="true" />
          <span className={styles.socialRow} aria-label="Social media">
            {SOCIAL_DEFS.map(({ key, Icon, label, fallback }) => {
              const brandHref = socials[key]
              const href = typeof brandHref === 'string' && brandHref.trim().length > 0 ? brandHref : fallback
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={styles.socialLink}
                >
                  <Icon />
                </a>
              )
            })}
          </span>
          {contact.phoneTel && (
            <a href={`tel:${contact.phoneTel}`} className={styles.topBarPhone}>
              <PhoneIcon />
              <span>{contact.phoneDisplay || contact.phoneTel}</span>
            </a>
          )}
        </div>
      </div>

      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brandLink} aria-label={brand?.name || 'Home'}>
            <BrandLogo tone="dark" height={scrolled ? 40 : 52} />
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
            {NAV_ITEMS.map(({ label, href }) => {
              const active = isActiveRoute(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className={styles.actionRail}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
            >
              <SearchIcon />
            </button>
            <Link href="/wishlist" className={styles.iconBtn} aria-label={`Wishlist (${wishlistCount} saved)`}>
              <HeartIcon />
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </Link>
            <Link href="/compare" className={styles.iconBtn} aria-label={`Compare (${compareCount} saved)`}>
              <CompareIcon />
              {compareCount > 0 && <span className={styles.badge}>{compareCount}</span>}
            </Link>
            <button
              type="button"
              className={`${styles.iconBtn} ${styles.menuBtn}`}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!drawerOpen}
      >
        <div className={styles.drawerHead}>
          <Link href="/" onClick={() => setDrawerOpen(false)} aria-label={brand?.name || 'Home'}>
            <BrandLogo tone="dark" height={40} />
          </Link>
          <button type="button" className={styles.drawerClose} aria-label="Close menu" onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Mobile primary" className={styles.drawerNav}>
          {NAV_ITEMS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setDrawerOpen(false)}
              className={`${styles.drawerLink} ${isActiveRoute(pathname, href) ? styles.drawerLinkActive : ''}`}
            >
              {label}
              <span aria-hidden="true" className={styles.drawerLinkArrow}>→</span>
            </Link>
          ))}
        </nav>

        <div className={styles.drawerContact}>
          {contact.phoneTel && (
            <a href={`tel:${contact.phoneTel}`} className={styles.drawerContactRow}>
              <PhoneIcon />
              <span>{contact.phoneDisplay}</span>
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className={styles.drawerContactRow}>
              <span>✉</span>
              <span>{contact.email}</span>
            </a>
          )}
        </div>

        <div className={styles.drawerSocials} aria-label="Social media">
          {SOCIAL_DEFS.map(({ key, Icon, label, fallback }) => {
            const brandHref = socials[key]
            const href = typeof brandHref === 'string' && brandHref.trim().length > 0 ? brandHref : fallback
            return (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={styles.drawerSocialLink}>
                <Icon />
              </a>
            )
          })}
        </div>
      </div>

      {/* audit-ignore: a11y-div-as-button — modal scrim is a convenience click target; primary close affordance is the drawer's keyboard-focusable close button. */}
      <div
        className={`${styles.scrim} ${drawerOpen ? styles.scrimOn : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      {/* Search overlay */}
      <div
        className={`${styles.searchOverlay} ${searchOpen ? styles.searchOverlayOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Search inventory"
        hidden={!searchOpen}
      >
        <form className={styles.searchBox} onSubmit={handleSearch}>
          <SearchIcon />
          <input
            type="search"
            autoFocus={searchOpen}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by make, model, registration…"
            aria-label="Search inventory"
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchSubmit}>Search</button>
          <button type="button" className={styles.searchClose} aria-label="Close search" onClick={() => setSearchOpen(false)}>
            <CloseIcon />
          </button>
        </form>
      </div>
    </>
  )
}
