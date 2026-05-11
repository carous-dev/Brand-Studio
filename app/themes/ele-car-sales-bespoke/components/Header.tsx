'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Header.module.css'

type NavItem = { label: string; href: string }

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Stock', href: '/used-cars' },
  { label: 'Sell your car', href: '/sell-my-car' },
  { label: 'Part exchange', href: '/part-exchange' },
  { label: 'Finance', href: '/finance' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const brand = useBrand()
  const brandName = brand?.name || 'ELE Car Sales'
  const contact = getBrandContactInfo(brand as any)
  const phoneDisplay = contact.phoneDisplay || '01501 000 000'
  const phoneTel = contact.phoneTel || '+441501000000'

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeBtnRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label={brandName}>
          <span className={styles.brandMark}>ELE</span>
          <span className={styles.brandText}>Car Sales</span>
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <a href={`tel:${phoneTel}`} className={styles.callCta}>
            <Phone size={16} aria-hidden="true" />
            <span className={styles.callLabel}>{phoneDisplay}</span>
          </a>
          <button
            type="button"
            className={styles.menuToggle}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="ele-mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="ele-mobile-menu"
          className={styles.overlay}
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
        >
          <div className={styles.overlayHeader}>
            <Link href="/" className={styles.brand} aria-label={brandName} onClick={() => setMenuOpen(false)}>
              <span className={styles.brandMark}>ELE</span>
              <span className={styles.brandText}>Car Sales</span>
            </Link>
            <button
              ref={closeBtnRef}
              type="button"
              className={styles.menuToggle}
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Mobile primary" className={styles.overlayNav}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={styles.overlayLink}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`tel:${phoneTel}`}
              className={styles.overlayCall}
              onClick={() => setMenuOpen(false)}
            >
              <Phone size={18} aria-hidden="true" />
              Call {phoneDisplay}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
