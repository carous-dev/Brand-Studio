'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Phone, X } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './Header.module.css'

/**
 * Columbus Vehicles — Header (rugged archetype)
 * Designed fresh per the rugged spec:
 *   - Dark by default (charcoal background, white nav)
 *   - Sticky with subtle border-bottom on scroll
 *   - Direct CTA "Call us" button paired with the nav (dealer-signage feel)
 *   - Mobile: full-screen overlay nav opened by a real <button aria-expanded=>
 *   - Touch targets ≥ 44px
 */

type NavItem = { label: string; href: string }
const NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Inventory', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'Financing', href: '/finance' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const brand = useBrand()
  const dealerName = brand?.name || 'Columbus Vehicles'
  const phoneDisplay = (brand as any)?.location?.phone || '+44 (0) 7000 000000'
  const phoneTel = phoneDisplay.replace(/\D/g, '').replace(/^/, '+')
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname() || '/'

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close the mobile nav when route changes.
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={`${dealerName} — home`}>
          <span className={styles.brandWordmark}>{dealerName}</span>
          <span className={styles.brandSub}>4×4 specialists</span>
        </Link>

        <nav aria-label="Primary" className={styles.desktopNav}>
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

        <a href={`tel:${phoneTel}`} className={styles.callCta}>
          <Phone size={16} strokeWidth={2.2} aria-hidden="true" />
          <span className={styles.callCtaText}>{phoneDisplay}</span>
        </a>

        <button
          type="button"
          className={styles.mobileToggle}
          aria-expanded={mobileOpen}
          aria-controls="columbus-mobile-nav"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={24} strokeWidth={2.2} /> : <Menu size={24} strokeWidth={2.2} />}
        </button>
      </div>

      {mobileOpen ? (
        <div
          id="columbus-mobile-nav"
          className={styles.mobileNav}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <nav aria-label="Mobile primary" className={styles.mobileNavList}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileNavLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <a href={`tel:${phoneTel}`} className={styles.mobileCallCta}>
            <Phone size={18} strokeWidth={2.2} aria-hidden="true" />
            Call {phoneDisplay}
          </a>
        </div>
      ) : null}
    </header>
  )
}
