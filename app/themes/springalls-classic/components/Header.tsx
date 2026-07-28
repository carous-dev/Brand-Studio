"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clock, Heart, MapPin, Menu, X } from 'lucide-react'
import styles from './Header.module.css'
import { useBrand } from '../context/BrandClientWrapper'
import { useGarage } from '../context/GarageContext'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Services', href: '/services' },
  {
    label: 'Looking to sell?',
    children: [
      { label: 'Sell your car', href: '/sell-my-car' },
      { label: 'Part exchange', href: '/part-exchange' }
    ]
  },
  { label: 'Finance', href: '/finance' }
]

function pickFirstOpenWindow(hours?: Record<string, string>): string | null {
  if (!hours) return null
  const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  for (const day of order) {
    const value = hours[day] || hours[day.toLowerCase()]
    if (value && !/closed/i.test(value)) {
      return value
    }
  }
  return null
}

export default function Header() {
  const brand = useBrand()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { wishlistCount } = useGarage()
  const pathname = usePathname()

  const normalizePath = (path: string) => {
    const clean = String(path || '').split('?')[0].split('#')[0].trim()
    if (!clean) return '/'
    if (clean === '/') return '/'
    return clean.replace(/\/+$/, '')
  }

  const activePath = normalizePath(pathname || '/')

  const isActive = (href: string) => normalizePath(href) === activePath
  const isChildActive = (children: Array<{ href: string }>) => children.some((child) => isActive(child.href))

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const logo = brand?.logo || '/images/springsallcarsalesltd-logo.png'
  const city = brand?.location?.address?.city || ''
  const county = brand?.location?.address?.county || ''
  const locationLabel = [city, county].filter(Boolean).join(', ') || 'Contact us'
  const openingWindow = pickFirstOpenWindow((brand as any)?.openingHours) || 'Mon-Sat 10:00-18:00'

  return (
    <header className={styles.siteHeader}>
      <div className={styles.siteHeaderInner}>
        <div className={styles.brand}>
          <span className={styles.brandBadge} aria-hidden="true">
            <img
              src={logo}
              alt=""
              width={160}
              height={48}
            />
          </span>
        </div>

        <nav className={styles.mainNav} aria-label="Primary">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className={styles.navDropdown}>
                <button
                  type="button"
                  className={`${styles.mainNavLink} ${styles.navDropdownToggle} ${isChildActive(item.children) ? styles.isActive : ''}`}
                  aria-haspopup="true"
                >
                  {item.label}
                  <span className={styles.mainNavChev} aria-hidden="true" />
                </button>
                <div className={styles.navDropdownMenu}>
                  {item.children.map((child) => (
                    <a
                      key={child.href}
                      className={`${styles.navDropdownLink} ${isActive(child.href) ? styles.isActive : ''}`}
                      href={child.href}
                      aria-current={isActive(child.href) ? 'page' : undefined}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a
                key={item.label}
                className={`${styles.mainNavLink} ${isActive(item.href) ? styles.isActive : ''}`}
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        <div className={styles.headerTools}>
          <div className={styles.headerActions}>
            <div className={styles.headerActionsItem}>
              <span className={styles.headerActionsIcon} aria-hidden="true">
                <MapPin size={18} strokeWidth={1.8} />
              </span>
              <span>{locationLabel}</span>
            </div>
            <div className={styles.headerActionsItem}>
              <span className={styles.headerActionsIcon} aria-hidden="true">
                <Clock size={18} strokeWidth={1.8} />
              </span>
              <span>{openingWindow}</span>
            </div>
          </div>
          <Link
            href="/wishlist"
            className={styles.wishlistButton}
            aria-label={`Wishlist with ${wishlistCount} items`}
          >
            <Heart size={26} strokeWidth={1.9} aria-hidden="true" />
            <span className={styles.wishlistCount} aria-hidden="true">
              {wishlistCount}
            </span>
            <span className="sr-only">Wishlist</span>
          </Link>
        </div>

        <button
          type="button"
          className={styles.mobileToggle}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={26} strokeWidth={2} /> : <Menu size={26} strokeWidth={2} />}
        </button>
      </div>

      <div className={`${styles.mobileNav} ${mobileOpen ? styles.isOpen : ''}`} aria-hidden={!mobileOpen}>
        <button
          type="button"
          className={styles.mobileNavBackdrop}
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
        <div className={styles.mobileNavPanel} role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className={styles.mobileNavHeader}>
            <span className={styles.mobileNavTitle}>Menu</span>
            <button
              type="button"
              className={styles.mobileNavClose}
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <nav className={styles.mobileNavLinks} aria-label="Mobile">
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div key={`mobile-${item.label}`} className={styles.mobileNavGroup}>
                  <span className={styles.mobileNavGroupTitle}>{item.label}</span>
                  {item.children.map((child) => (
                    <Link
                      key={`mobile-${child.href}`}
                      href={child.href}
                      className={`${styles.mobileNavLink} ${isActive(child.href) ? styles.isActive : ''}`}
                      aria-current={isActive(child.href) ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={`mobile-${item.label}`}
                  href={item.href}
                  className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.isActive : ''}`}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className={styles.mobileNavActions}>
            <div className={styles.mobileNavInfoItem}>
              <span className={styles.mobileNavInfoIcon} aria-hidden="true">
                <MapPin size={16} strokeWidth={1.8} />
              </span>
              <div className={styles.mobileNavInfoText}>
                <span className={styles.mobileNavInfoLabel}>Location</span>
                <span className={styles.mobileNavInfoValue}>{locationLabel}</span>
              </div>
            </div>
            <div className={styles.mobileNavInfoItem}>
              <span className={styles.mobileNavInfoIcon} aria-hidden="true">
                <Clock size={16} strokeWidth={1.8} />
              </span>
              <div className={styles.mobileNavInfoText}>
                <span className={styles.mobileNavInfoLabel}>Opening times</span>
                <span className={styles.mobileNavInfoValue}>{openingWindow}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
