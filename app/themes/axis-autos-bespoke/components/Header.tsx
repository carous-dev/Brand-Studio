'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Heart, GitCompare } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { useGarage } from '../context/GarageContext'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Header.module.css'

/**
 * Hairline-thin-borderless header — 64px, 1px hairline bottom border, light
 * surface. Brand wordmark left, primary nav center-right, single phone action
 * far right. Mobile collapses to hamburger + full-screen overlay.
 *
 * Per feedback_header_nav_lean: Home/About/Contact are NOT in the nav. The
 * brand wordmark IS the home link. About/Contact belong in footer quick links.
 */
export default function Header() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const contact = getBrandContactInfo(brand)
  const garage = useGarage()
  const wishlistCount = garage?.wishlist?.length ?? 0
  const compareCount = garage?.compare?.length ?? 0

  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const brandName = brand?.name || 'Axis Autos'
  const logo = (brand as any)?.logo || `/themes/axis-autos-bespoke/logo.png`

  const NAV: Array<{ label: string; href: string }> = [
    { label: 'Stock', href: '/used-cars' },
    { label: 'Sell', href: '/sell-my-car' },
    { label: 'Finance', href: '/finance' },
    { label: 'Part-exchange', href: '/part-exchange' },
    { label: 'Services', href: '/services' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={brandName}>
          <img
            src={logo}
            alt={brandName}
            className={styles.brandLogo}
            onError={(e) => {
              const img = e.currentTarget
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1'
                img.src = '/themes/axis-autos-bespoke/logo.png'
              } else {
                img.style.display = 'none'
                const wordmark = img.nextElementSibling as HTMLElement | null
                if (wordmark) wordmark.style.display = 'inline-flex'
              }
            }}
          />
          <span className={styles.brandWordmark} aria-hidden="true">{brandName}</span>
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href="/wishlist" className={styles.iconAction} aria-label={`Wishlist (${wishlistCount})`}>
            <Heart size={18} strokeWidth={1.6} />
            {wishlistCount > 0 ? <span className={styles.countBadge}>{wishlistCount}</span> : null}
          </Link>
          <Link href="/compare" className={styles.iconAction} aria-label={`Compare (${compareCount})`}>
            <GitCompare size={18} strokeWidth={1.6} />
            {compareCount > 0 ? <span className={styles.countBadge}>{compareCount}</span> : null}
          </Link>
          {contact.phoneTel ? (
            <a href={`tel:${contact.phoneTel}`} className={`axis-btn axis-btn--primary ${styles.cta}`}>
              {contact.phoneDisplay}
            </a>
          ) : (
            <Link href="/contact" className={`axis-btn axis-btn--primary ${styles.cta}`}>
              Contact
            </Link>
          )}
          <button
            type="button"
            className={styles.hamburger}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="axis-mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} strokeWidth={1.6} /> : <Menu size={22} strokeWidth={1.6} />}
          </button>
        </div>
      </div>

      <div
        id="axis-mobile-nav"
        className={`${styles.mobile} ${open ? styles.mobileOpen : ''}`}
        hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <nav className={styles.mobileNav}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.mobileNavLinkActive : ''}`}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/used-cars" className={`axis-btn axis-btn--primary ${styles.mobileCta}`}>
            Browse stock
          </Link>
          {contact.phoneTel ? (
            <a href={`tel:${contact.phoneTel}`} className={`axis-btn axis-btn--ghost ${styles.mobileCta}`}>
              {contact.phoneDisplay}
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
