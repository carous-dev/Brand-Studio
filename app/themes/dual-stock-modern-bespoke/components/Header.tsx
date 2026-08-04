'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { useGarage } from '../context/GarageContext'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Header.module.css'

type NavItem = { label: string; href: string; match?: 'exact' | 'prefix' }
type NavGroup = { label: string; href: string; children: NavItem[] }
type NavEntry = NavItem | NavGroup

const isGroup = (entry: NavEntry): entry is NavGroup => 'children' in entry

/* Compact primary nav — only the stock-browse items collapse into one Stock
 * dropdown (trigger links to /used-cars; hover / keyboard-focus reveals the
 * refinements). Home, Finance, Part Exchange, About and Contact stay flat;
 * "Sell your car" stays the standalone header CTA. */
const NAV_ENTRIES: NavEntry[] = [
  { label: 'Home', href: '/', match: 'exact' },
  {
    label: 'Stock',
    href: '/used-cars',
    children: [
      { label: 'All Stock', href: '/used-cars' },
      { label: 'Cars', href: '/used-cars?type=car', match: 'prefix' },
      { label: 'Bikes', href: '/used-cars?type=bike', match: 'prefix' },
      { label: 'Recently Sold', href: '/recently-sold' },
    ],
  },
  { label: 'Finance', href: '/finance' },
  { label: 'Part Exchange', href: '/part-exchange' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const SOCIAL_LINKS = ['facebook', 'x', 'youtube', 'instagram'] as const

function isActiveRoute(pathname: string, item: NavItem): boolean {
  const cleanHref = item.href.split('?')[0]
  if (item.match === 'exact') return pathname === item.href
  if (item.match === 'prefix') {
    return pathname.startsWith('/used-cars') &&
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('type') === new URLSearchParams(item.href.split('?')[1]).get('type')
  }
  if (cleanHref === '/') return pathname === '/'
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`)
}

function isGroupActive(pathname: string, group: NavGroup): boolean {
  return group.children.some((c) => isActiveRoute(pathname, c))
}

export default function Header() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const garage = useGarage()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Dual Stock'
  const logoSrc = (brand as any)?.logo as string | undefined

  const locationParts: string[] = []
  const address = (brand as any)?.location?.address
  if (address && typeof address === 'object') {
    if (address.city) locationParts.push(address.city)
    if (address.county && address.county !== address.city) locationParts.push(address.county)
  }
  const locationLabel = locationParts.join(', ')

  const socials = ((brand as any)?.socialLinks || {}) as Record<string, string>

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setDrawerOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false)
        setSearchOpen(false)
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [searchOpen])

  useEffect(() => {
    if (drawerOpen || searchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen, searchOpen])

  const wishlistCount = garage?.wishlist?.length || 0
  const compareCount = garage?.compare?.length || 0

  return (
    <>
      {/* ANNOUNCEMENT BAR — finance line + dual-stock signal.
       *  Desktop:  ⚡ Cars + Bikes in one place. Finance from £99/mo. ...  Apply now →
       *  Mobile:   ⚡ Finance from £99/mo →  (single tappable chip, centered)  */}
      <Link href="/finance" className={styles.announcement} aria-label="Finance from £99 per month">
        <div className={styles.announcementInner}>
          <span className={styles.announcementBolt} aria-hidden="true">⚡</span>
          <span className={styles.announcementText}>
            <strong>Cars + Bikes</strong> in one place. Finance from £99/mo. Nationwide delivery.
          </span>
          <span className={styles.announcementShort}>Finance from £99/mo</span>
          <span className={styles.announcementLink}>
            <span className={styles.announcementLinkLabel}>Apply now</span>
            <span className={styles.announcementArrow} aria-hidden="true">→</span>
          </span>
        </div>
      </Link>

      {/* TOP CONTACT BAR — location chip / live-stock pulse / socials / phone */}
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <div className={styles.topbarLeft}>
            {locationLabel && (
              <span className={styles.topbarChip}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {locationLabel}
              </span>
            )}
            <span className={styles.topbarChip}>
              <span className="dual-icon-pulse" aria-hidden="true" />
              Live stock
            </span>
          </div>
          <div className={styles.topbarRight}>
            <ul className={styles.socials} aria-label="Social links">
              {SOCIAL_LINKS.map((s) => {
                const url = s === 'x' ? (socials.x || socials.twitter) : socials[s]
                const labelName = s === 'x' ? 'X (Twitter)' : s
                return (
                  <li key={s}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${brandName} on ${labelName}`}>
                        <SocialIcon name={s} />
                      </a>
                    ) : (
                      <span className={styles.socialDisabled} aria-hidden="true">
                        <SocialIcon name={s} />
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
            {contact.phoneTel && (
              <a href={`tel:${contact.phoneTel}`} className={styles.phoneCta}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.7 3.06a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.02-1.27a2 2 0 0 1 2.11-.45c.99.33 2.01.57 3.06.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {contact.phoneDisplay || 'Call us'}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* MAIN STICKY HEADER */}
      <header
        className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}
        data-aos="fade-down"
      >
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label={brandName}>
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={brandName}
                width={120}
                height={56}
                className={styles.brandLogo}
              />
            ) : (
              <span className={styles.brandWordmark}>
                <span className={styles.brandWordmarkAccent}>D</span>
                {brandName}
              </span>
            )}
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
            {NAV_ENTRIES.map((entry) => {
              if (!isGroup(entry)) {
                const active = isActiveRoute(pathname, entry)
                return (
                  <Link
                    key={entry.label}
                    href={entry.href}
                    className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {entry.label}
                  </Link>
                )
              }
              const groupActive = isGroupActive(pathname, entry)
              return (
                <div key={entry.label} className={styles.navGroup}>
                  <Link
                    href={entry.href}
                    className={`${styles.navLink} ${groupActive ? styles.navLinkActive : ''}`}
                    aria-current={groupActive ? 'page' : undefined}
                    aria-haspopup="true"
                  >
                    {entry.label}
                    <svg className={styles.navChevron} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </Link>
                  <div className={styles.dropdown} role="menu" aria-label={entry.label}>
                    {entry.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        role="menuitem"
                        className={`${styles.dropdownLink} ${isActiveRoute(pathname, child) ? styles.dropdownLinkActive : ''}`}
                        aria-current={isActiveRoute(pathname, child) ? 'page' : undefined}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </nav>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Open search"
              onClick={() => setSearchOpen(true)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            <Link href="/wishlist" className={`${styles.iconBtn} ${styles.iconBtnDesktop}`} aria-label={`Wishlist (${wishlistCount})`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 && <span className={styles.iconBadge}>{wishlistCount}</span>}
            </Link>

            <Link href="/compare" className={`${styles.iconBtn} ${styles.iconBtnDesktop}`} aria-label={`Compare (${compareCount})`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              {compareCount > 0 && <span className={styles.iconBadge}>{compareCount}</span>}
            </Link>

            <Link href="/sell-my-car" className={styles.sellCta}>
              <span className={styles.sellCtaIcon} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
              </span>
              <span className={styles.sellCtaLabel}>
                <span className={styles.sellCtaEyebrow}>Get a quote</span>
                <span className={styles.sellCtaTitle}>Sell your car</span>
              </span>
              <span className={styles.sellCtaArrow} aria-hidden="true">→</span>
            </Link>

            <button
              type="button"
              className={`${styles.iconBtn} ${styles.hamburger}`}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
              aria-controls="dual-mobile-drawer"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              <span aria-hidden="true">{drawerOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Thin gradient separation line */}
        <div className={styles.headerAccent} aria-hidden="true" />
      </header>

      {/* MOBILE DRAWER — full-screen, list-style */}
      {drawerOpen && (
        <div
          id="dual-mobile-drawer"
          className={styles.drawer}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className={styles.drawerInner}>
            <nav className={styles.drawerNav} aria-label="Mobile navigation">
              {NAV_ENTRIES.map((entry) =>
                isGroup(entry) ? (
                  <div key={entry.label} className={styles.drawerGroup}>
                    <span className={styles.drawerGroupLabel}>{entry.label}</span>
                    {entry.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className={`${styles.drawerLink} ${isActiveRoute(pathname, child) ? styles.drawerLinkActive : ''}`}
                        onClick={() => setDrawerOpen(false)}
                      >
                        {child.label}
                        <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div key={entry.label} className={styles.drawerGroup}>
                    <Link
                      href={entry.href}
                      className={`${styles.drawerLink} ${isActiveRoute(pathname, entry) ? styles.drawerLinkActive : ''}`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      {entry.label}
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                )
              )}
            </nav>

            <div className={styles.drawerContact}>
              {contact.phoneTel && (
                <a href={`tel:${contact.phoneTel}`} className="dual-btn dual-btn--primary">
                  Call {contact.phoneDisplay || contact.phoneTel}
                </a>
              )}
              {contact.whatsappUrl && (
                <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className={`dual-btn dual-btn--outline ${styles.drawerWa}`}>
                  WhatsApp
                </a>
              )}
            </div>

            <ul className={styles.drawerSocials} aria-label="Social links">
              {SOCIAL_LINKS.map((s) => {
                const url = s === 'x' ? (socials.x || socials.twitter) : socials[s]
                const labelName = s === 'x' ? 'X (Twitter)' : s
                return (
                  <li key={s}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${brandName} on ${labelName}`}>
                        <SocialIcon name={s} />
                      </a>
                    ) : (
                      <span className={styles.socialDisabled} aria-hidden="true">
                        <SocialIcon name={s} />
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      {/* SEARCH OVERLAY */}
      {searchOpen && (
        // audit-ignore: a11y-div-as-button — modal backdrop click-to-close; submit + Esc handle keyboard, role=dialog declared
        <div
          className={styles.searchOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Search stock"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
        >
          <form
            className={styles.searchPanel}
            action="/used-cars"
            method="GET"
            onSubmit={() => setSearchOpen(false)}
          >
            <label htmlFor="dual-search-input" className={styles.searchLabel}>
              Find your next vehicle
            </label>
            <div className={styles.searchInputRow}>
              <span className={styles.searchIconBlock} aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                ref={searchInputRef}
                id="dual-search-input"
                name="q"
                type="search"
                placeholder='Make, model, "Honda CBR", "Audi A4"...'
                className={styles.searchInput}
                autoComplete="off"
              />
              <button type="submit" className="dual-btn dual-btn--primary">Search</button>
            </div>
            <div className={styles.searchChips}>
              <Link href="/used-cars?type=car" onClick={() => setSearchOpen(false)} className={styles.searchChip}>Cars</Link>
              <Link href="/used-cars?type=bike" onClick={() => setSearchOpen(false)} className={styles.searchChip}>Bikes</Link>
              <Link href="/used-cars?body=suv" onClick={() => setSearchOpen(false)} className={styles.searchChip}>SUVs</Link>
              <Link href="/used-cars?fuel=electric" onClick={() => setSearchOpen(false)} className={styles.searchChip}>Electric</Link>
              <Link href="/used-cars?body=sport" onClick={() => setSearchOpen(false)} className={styles.searchChip}>Sport bikes</Link>
            </div>
            <button
              type="button"
              className={styles.searchClose}
              aria-label="Close search"
              onClick={() => setSearchOpen(false)}
            >
              Esc
            </button>
          </form>
        </div>
      )}
    </>
  )
}

function SocialIcon({ name }: { name: string }) {
  const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true as const }
  if (name === 'facebook') {
    return (
      <svg {...common}>
        <path d="M22 12a10 10 0 1 0-11.6 9.87v-7H8v-2.87h2.4V9.8c0-2.36 1.4-3.66 3.55-3.66 1.03 0 2.1.18 2.1.18v2.31h-1.18c-1.16 0-1.52.72-1.52 1.46v1.76h2.59l-.41 2.87h-2.18v7A10 10 0 0 0 22 12z" />
      </svg>
    )
  }
  if (name === 'x') {
    // X (formerly Twitter) — official wordmark glyph
    return (
      <svg {...common}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  }
  if (name === 'youtube') {
    return (
      <svg {...common}>
        <path d="M23 7.3a3 3 0 0 0-2.1-2.1C19.06 4.8 12 4.8 12 4.8s-7.06 0-8.9.4A3 3 0 0 0 1 7.3 31 31 0 0 0 .6 12 31 31 0 0 0 1 16.7 3 3 0 0 0 3.1 18.8c1.84.4 8.9.4 8.9.4s7.06 0 8.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.4 12 31 31 0 0 0 23 7.3zM9.75 15.27V8.73L15.5 12l-5.75 3.27z" />
      </svg>
    )
  }
  if (name === 'instagram') {
    // Instagram — canonical squared camera glyph with lens + spark
    return (
      <svg {...common}>
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.86 5.86 0 0 0 1.38 2.13 5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
      </svg>
    )
  }
  return null
}
