'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, GitCompare, Menu, Phone, X, MapPin } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { useGarage } from '../context/GarageContext'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'Services', href: '/services' },
  { label: 'Finance', href: '/finance' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const { wishlistCount, compareCount } = useGarage()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Chesterfield Motor Empire'
  const town =
    (brand?.location?.address as any)?.city ||
    (brand?.location?.address as any)?.town ||
    'Chesterfield'

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}
      data-mfx-scroll="parallax-slow"
    >
      <div className={styles.contactStrip} aria-label="Showroom contact and location">
        <div className={styles.contactStripInner}>
          <span className={styles.contactItem}>
            <MapPin size={14} strokeWidth={2} aria-hidden="true" />
            {town}, Derbyshire
          </span>
          <span className={styles.contactDivider} aria-hidden="true" />
          <span className={`${styles.contactItem} mfx-pulse-dot`}>
            <span className={styles.liveDot} aria-hidden="true" />
            Live stock — call now
          </span>
          <span className={styles.contactSpacer} />
          {contact.phoneTel ? (
            <a className={styles.contactCall} href={`tel:${contact.phoneTel}`}>
              <Phone size={14} strokeWidth={2.4} aria-hidden="true" />
              <span>{contact.phoneDisplay}</span>
            </a>
          ) : null}
        </div>
      </div>

      <div className={styles.bar}>
        <div className={styles.barInner}>
          <Link href="/" className={styles.brand} aria-label={`${brandName} home`}>
            {brand?.logo ? (
              <img src={brand.logo} alt={brandName} className={styles.brandLogo} loading="eager" />
            ) : (
              <span className={styles.brandWordmark}>{brandName}</span>
            )}
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className={styles.barActions}>
            <Link
              href="/wishlist"
              className={styles.iconButton}
              aria-label={`Your wishlist (${wishlistCount})`}
            >
              <Heart size={18} strokeWidth={2} />
              {wishlistCount > 0 ? <span className={styles.iconBadge}>{wishlistCount}</span> : null}
            </Link>
            <Link
              href="/compare"
              className={styles.iconButton}
              aria-label={`Compare vehicles (${compareCount})`}
            >
              <GitCompare size={18} strokeWidth={2} />
              {compareCount > 0 ? <span className={styles.iconBadge}>{compareCount}</span> : null}
            </Link>
            <Link href="/used-cars" className={`${styles.cta} mfx-shimmer`}>
              Browse stock
            </Link>
            <button
              type="button"
              className={styles.menuToggle}
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-controls="chesterfield-mobile-nav"
            >
              {menuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
            </button>
          </div>
        </div>
        <span className={styles.barAccent} aria-hidden="true" />
      </div>

      <div
        id="chesterfield-mobile-nav"
        className={`${styles.mobileNav} ${menuOpen ? styles.mobileNavOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className={styles.mobileNavInner}>
          <nav aria-label="Mobile primary" className={styles.mobileList}>
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={`m-${item.href}`}
                  href={item.href}
                  className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className={styles.mobileActions}>
            {contact.phoneTel ? (
              <a className={styles.mobileCall} href={`tel:${contact.phoneTel}`}>
                <Phone size={16} strokeWidth={2.4} aria-hidden="true" />
                {contact.phoneDisplay}
              </a>
            ) : null}
            <Link href="/used-cars" className={styles.mobileCta}>
              Browse stock
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
