'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mail, MapPin, Facebook, Phone, Menu, X } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Header.module.css'

type NavItem = {
  label: string
  href: string
  match: ReadonlyArray<string>
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: 'Home',          href: '/',                  match: ['/'] },
  { label: 'Showroom',      href: '/used-cars',         match: ['/used-cars'] },
  { label: 'Warranty',      href: '/warranty',          match: ['/warranty'] },
  { label: 'Delivery',      href: '/delivery',          match: ['/delivery'] },
  { label: 'Reviews',       href: '/reviews',           match: ['/reviews'] },
  { label: 'Sell Your Car', href: '/part-exchange',     match: ['/part-exchange', '/sell-my-car'] },
] as const

const THEME_DEFAULT_LOGO = '/themes/warwick-hall-cars-bespoke/logo.png'

function isActiveRoute(pathname: string, item: NavItem): boolean {
  if (item.match.length === 0) return false
  return item.match.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'))
}

function buildTelHref(raw: string | undefined | null): string {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return ''
  return `tel:+${digits.replace(/^0/, '44')}`
}

function deriveFacebookLabel(url: string): string {
  if (!url) return ''
  try {
    const u = new URL(url)
    const path = u.pathname.replace(/^\/+/, '').replace(/\/+$/, '')
    return path ? `/${path}` : ''
  } catch {
    return ''
  }
}

export default function Header() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const pathname = usePathname() || '/'

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape-to-close + body scroll lock for the mobile overlay
  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const brandName = brand?.name || 'Warwick Hall Cars'
  const logoSrc = (brand as any)?.logo || THEME_DEFAULT_LOGO
  const email = contact.email
  const address = contact.showroomAddress
  const facebookUrl = String((brand?.socialLinks as any)?.facebook || '').trim()
  const facebookLabel = deriveFacebookLabel(facebookUrl)

  // Phone numbers — primary from brand; optional secondary from common
  // alt-phone field shapes (altPhone / phone2 / phoneSecondary). Conditionally
  // rendered so themes without a secondary phone collapse cleanly.
  const primaryPhone = contact.phoneDisplay
  const primaryPhoneTel = contact.phoneTel
  const locationAny = (brand?.location || {}) as Record<string, unknown>
  const secondaryPhoneRaw = String(
    locationAny.altPhone ||
    locationAny.phone2 ||
    locationAny.phoneSecondary ||
    ''
  ).trim()
  const secondaryPhoneTel = buildTelHref(secondaryPhoneRaw)

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        {/* ---------- Topbar (collapses on scroll) ---------- */}
        <div className={styles.topbarWrap} aria-hidden={scrolled}>
          <div className={styles.topbar}>
            <div className={styles.topbarInner}>
              {email && (
                <a
                  href={`mailto:${email}`}
                  className={styles.topbarItem}
                  aria-label={`Email ${brandName}`}
                >
                  <Mail aria-hidden="true" />
                  <span>{email}</span>
                </a>
              )}
              {address && (
                <span className={`${styles.topbarItemPlain} ${styles.topbarAddress}`}>
                  <MapPin aria-hidden="true" />
                  <span>{address}</span>
                </span>
              )}
              {facebookUrl ? (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.topbarItem}
                  aria-label="Facebook"
                >
                  <Facebook aria-hidden="true" />
                  {facebookLabel && <span>{facebookLabel}</span>}
                </a>
              ) : null}
              <span className={styles.topbarSpacer} aria-hidden="true" />
              <Link href="/contact" className={styles.topbarContact}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* ---------- Main row (sticky) ---------- */}
        <div className={styles.main}>
          <div className={styles.mainInner}>
            <Link href="/" className={styles.brand} aria-label={`${brandName} — home`}>
              <img
                src={logoSrc}
                alt={brandName}
                className={styles.brandImage}
                width={260}
                height={64}
              />
            </Link>

            <nav aria-label="Primary" className={styles.nav}>
              {NAV_ITEMS.map(item => {
                const active = isActiveRoute(pathname, item)
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className={styles.rightCluster}>
              <Link
                href="/finance"
                className={styles.financeCta}
                aria-label="Finance available — apply"
              >
                <span className={styles.financeCtaTitle}>Finance Available</span>
                <span className={styles.financeCtaSub}>Click Here To Apply</span>
              </Link>

              {primaryPhone && (
                <div className={styles.phoneBlock}>
                  <a
                    href={primaryPhoneTel || '#'}
                    className={styles.phoneIconBtn}
                    aria-label={`Call ${primaryPhone}`}
                  >
                    <Phone aria-hidden="true" />
                  </a>
                  <div className={styles.phoneNumbers}>
                    <a
                      href={primaryPhoneTel || '#'}
                      className={`${styles.phoneNumber} ${styles.phonePrimary}`}
                    >
                      {primaryPhone}
                    </a>
                    {secondaryPhoneRaw && (
                      <a href={secondaryPhoneTel} className={styles.phoneNumber}>
                        {secondaryPhoneRaw}
                      </a>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                className={styles.menuToggle}
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="warwick-mobile-nav"
              >
                <Menu aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- Mobile overlay (full-screen sheet) ---------- */}
      <div
        id="warwick-mobile-nav"
        className={styles.mobileOverlay}
        data-open={menuOpen ? 'true' : 'false'}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!menuOpen}
      >
        <div className={styles.mobileOverlayHead}>
          <Link href="/" className={styles.mobileOverlayBrand} onClick={closeMenu} aria-label={`${brandName} — home`}>
            <img src={logoSrc} alt={brandName} />
          </Link>
          <button
            type="button"
            className={styles.mobileOverlayClose}
            onClick={closeMenu}
            aria-label="Close menu"
          >
            <X aria-hidden="true" />
          </button>
        </div>

        <nav className={styles.mobileOverlayNav} aria-label="Mobile primary">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.label}
              href={item.href}
              onClick={closeMenu}
              className={styles.mobileOverlayItem}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/contact" onClick={closeMenu} className={styles.mobileOverlayItem}>Contact Us</Link>
        </nav>

        <div className={styles.mobileOverlayCallStrip}>
          <Link href="/finance" onClick={closeMenu} className={styles.mobileOverlayCta}>
            Finance Available — Apply Now
          </Link>
          {primaryPhone && (
            <a href={primaryPhoneTel || '#'} className={styles.mobileOverlayPhone}>
              <Phone aria-hidden="true" />
              <span>{primaryPhone}</span>
            </a>
          )}
        </div>
      </div>
    </>
  )
}
