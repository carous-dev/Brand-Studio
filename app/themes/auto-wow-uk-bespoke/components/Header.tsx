'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { useGarage } from '../context/GarageContext'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Header.module.css'

type NavItem = { label: string; href: string }

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Stock', href: '/used-cars' },
  { label: 'Sold', href: '/recently-sold' },
  { label: 'Finance', href: '/finance' },
  { label: 'Part-Ex', href: '/part-exchange' },
  { label: 'Sell', href: '/sell-my-car' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const STATUS_CHIPS = [
  'Quality assured',
  'Finance available',
  'Nationwide delivery',
]

export default function Header() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const garage = useGarage()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'AUTOWOW'
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const wishlistCount = garage.wishlistCount || 0

  return (
    <>
      <div className={styles.statusStrip} role="presentation" aria-hidden="true">
        <div className={styles.statusInner}>
          {STATUS_CHIPS.map((label) => (
            <span key={label} className={styles.statusChip}>
              <span className={styles.statusDot} aria-hidden="true" />
              {label}
            </span>
          ))}
          {contact.phoneDisplay ? (
            <a className={styles.statusCall} href={contact.phoneTel ? `tel:${contact.phoneTel}` : '#'}>
              <span className={styles.statusDot} aria-hidden="true" />
              Call {contact.phoneDisplay}
            </a>
          ) : null}
        </div>
      </div>

      <header className={[styles.header, scrolled ? styles.headerScrolled : ''].join(' ')}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brand} aria-label={`${brandName} home`}>
            <span className={styles.brandMark} aria-hidden="true">
              <span className={styles.brandChevronLeft} />
              <span className={styles.brandChevronRight} />
            </span>
            <span className={styles.brandWord}>{brandName}</span>
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => {
                const active = item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={[styles.navLink, active ? styles.navLinkActive : ''].join(' ')}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className={styles.tools}>
            <Link href="/wishlist" className={styles.toolLink} aria-label={`Wishlist (${wishlistCount} saved)`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 ? <span className={styles.toolBadge}>{wishlistCount}</span> : null}
            </Link>
            <Link href="/used-cars" className={styles.toolCta}>
              View stock
            </Link>
            <button
              type="button"
              className={styles.hamburger}
              aria-expanded={menuOpen}
              aria-controls="auto-mobile-nav"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className={styles.hamburgerBar} aria-hidden="true" />
              <span className={styles.hamburgerBar} aria-hidden="true" />
              <span className={styles.hamburgerBar} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className={styles.headerEdge} aria-hidden="true" />
      </header>

      {menuOpen ? (
        <div
          id="auto-mobile-nav"
          className={styles.mobileOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
        >
          <div className={styles.mobileSheet}>
            <div className={styles.mobileTop}>
              <span className={styles.mobileBrand}>{brandName}</span>
              <button
                type="button"
                className={styles.mobileClose}
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav aria-label="Mobile" className={styles.mobileNav}>
              <ul className={styles.mobileList}>
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.mobileLink}>
                      <span>{item.label}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className={styles.mobileFooter}>
              {contact.phoneDisplay ? (
                <a className={styles.mobileCall} href={contact.phoneTel ? `tel:${contact.phoneTel}` : '#'}>
                  Call {contact.phoneDisplay}
                </a>
              ) : null}
              {contact.whatsappUrl ? (
                <a className={styles.mobileWhats} href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  WhatsApp us
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
