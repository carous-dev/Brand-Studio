'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, Heart, GitCompare } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { useGarage } from '../context/GarageContext'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Stock', href: '/used-cars' },
  { label: 'Finance', href: '/finance' },
  { label: 'Sell your van', href: '/sell-my-car' },
  { label: 'Part exchange', href: '/part-exchange' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const pathname = usePathname() || '/'
  const garage = useGarage()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const brandName = brand?.name || 'NCR Van Sales Ltd'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const wishlistCount = garage.wishlistCount
  const compareCount = garage.compareCount

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`} data-mfx-scroll="parallax-slow">
      <div className={styles.statusStrip} aria-hidden="true">
        <div className={styles.statusStripInner}>
          <span><span className="mfx-pulse-dot" style={{ width: 6, height: 6, borderRadius: 999, display: 'inline-block', background: '#6fe88a', marginRight: 8 }} />Finance available · 7-day exchange · UK-wide delivery</span>
          {contact.phoneDisplay ? (
            <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.statusPhone}>
              <Phone size={13} strokeWidth={2.4} aria-hidden="true" />
              {contact.phoneDisplay}
            </a>
          ) : null}
        </div>
      </div>

      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={brandName}>
          {brand?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brand.logo} alt={brandName} className={styles.brandLogo} />
          ) : (
            <span className={styles.brandWordmark}>{brandName}</span>
          )}
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className={styles.actions}>
          <Link href="/wishlist" className={styles.actionIcon} aria-label={`Wishlist (${wishlistCount} items)`}>
            <Heart size={20} strokeWidth={2} />
            {wishlistCount > 0 ? <span className={styles.badge}>{wishlistCount}</span> : null}
          </Link>
          <Link href="/compare" className={styles.actionIcon} aria-label={`Compare (${compareCount} items)`}>
            <GitCompare size={20} strokeWidth={2} />
            {compareCount > 0 ? <span className={styles.badge}>{compareCount}</span> : null}
          </Link>
          <Link href="/used-cars" className={styles.cta}>
            View stock
          </Link>
          <button
            type="button"
            className={styles.hamburger}
            aria-expanded={open}
            aria-controls="ncr-mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} strokeWidth={2.4} /> : <Menu size={24} strokeWidth={2.4} />}
          </button>
        </div>
      </div>

      <div
        id="ncr-mobile-nav"
        className={`${styles.mobileNav} ${open ? styles.mobileNavOpen : ''}`}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={`m-${item.href}`}
                href={item.href}
                className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        {contact.phoneDisplay ? (
          <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.mobilePhone}>
            <Phone size={18} strokeWidth={2.2} aria-hidden="true" />
            {contact.phoneDisplay}
          </a>
        ) : null}
      </div>
    </header>
  )
}
