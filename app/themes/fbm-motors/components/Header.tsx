'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { resolveText } from '../lib/brand-text'
import styles from './Header.module.css'

const nav: Array<{ label: string; href?: string; children?: Array<{ label: string; href: string }> }> = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  {
    label: 'Pages',
    children: [
      { label: 'Loan Calculator', href: '/finance' },
      { label: 'FAQs', href: '/finance#faqs' },
    ],
  },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 4h4l2 5-3 2a14 14 0 005 5l2-3 5 2v4a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export default function Header() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  const [pagesOpen, setPagesOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Condense the bar + drop a shadow once the page scrolls — a modern
  // sticky-header cue. Passive listener, cleaned up on unmount.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'FBM Motors'
  const locationLabel = resolveText(brand, 'topbarLocationLabel') || ''
  const openingLine = resolveText(brand, 'topbarOpeningLine')
  const logo = brand?.logo

  // Split the brand name into wordmark parts: first word gets ink color,
  // remaining words get ember primary. Mirrors the FBM "FIRST<span>BUY</span>"
  // pattern while staying brand-agnostic.
  const tokens = brandName.trim().split(/\s+/)
  const wordmarkLead = tokens[0] || brandName
  const wordmarkTrail = tokens.slice(1).join(' ')

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      {/* Top utility bar — dark accent strip */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.topBarLeft}>
            {contact.phoneDisplay && (
              <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.topBarLink}>
                <PhoneIcon className={styles.topIcon} />
                {contact.phoneDisplay}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className={styles.topBarLink}>
                <svg className={styles.topIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                {contact.email}
              </a>
            )}
            {locationLabel && locationLabel !== 'the showroom' && (
              <span className={styles.topBarCity}>
                <svg className={styles.topIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                {locationLabel}
              </span>
            )}
          </div>
          {openingLine && (
            <span className={styles.topBarRight}>
              <svg className={styles.topIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {openingLine}
            </span>
          )}
        </div>
      </div>

      {/* Main bar */}
      <div className={styles.mainBar}>
        <div className={styles.mainBarInner}>
          <Link href="/" className={styles.brand} aria-label={brandName}>
            {logo ? (
              <Image src={logo} alt={brandName} width={240} height={56} className={styles.brandLogo} />
            ) : (
              <span className={styles.wordmark}>
                {wordmarkLead}
                {wordmarkTrail && <span className={styles.wordmarkTrail}>{wordmarkTrail}</span>}
              </span>
            )}
          </Link>

          <nav className={styles.nav} aria-label="Main">
            {nav.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className={styles.dropdownWrap}
                  onMouseEnter={() => setPagesOpen(true)}
                  onMouseLeave={() => setPagesOpen(false)}
                >
                  <button
                    type="button"
                    className={`${styles.dropdownTrigger} ${pagesOpen ? styles.dropdownTriggerOpen : ''}`}
                    aria-expanded={pagesOpen}
                    onClick={() => setPagesOpen((v) => !v)}
                  >
                    {item.label}
                    <svg className={styles.chevron} width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {pagesOpen && (
                    <div className={styles.dropdownMenu} role="menu">
                      {item.children.map((c) => (
                        <Link
                          key={c.href}
                          href={c.href}
                          className={styles.dropdownLink}
                          role="menuitem"
                          onClick={() => setPagesOpen(false)}
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ''}`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className={styles.actions}>
            {contact.phoneDisplay && (
              <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.callCta}>
                <span className={styles.callIcon}>
                  <PhoneIcon />
                </span>
                <span className={styles.callText}>{contact.phoneDisplay}</span>
              </a>
            )}
            <button
              type="button"
              className={styles.menuToggle}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label="Toggle menu"
            >
              <span className={`${styles.burger} ${open ? styles.burgerOpen : ''}`} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>

        {open && (
          <nav className={styles.mobileNav} aria-label="Mobile">
            {[...nav.filter((n) => !n.children), ...nav.flatMap((n) => n.children ?? [])].map((item) => (
              <Link
                key={item.href}
                href={item.href!}
                onClick={() => setOpen(false)}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`${styles.mobileLink} ${isActive(item.href) ? styles.mobileLinkActive : ''}`}
              >
                {item.label}
              </Link>
            ))}
            {contact.phoneDisplay && (
              <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.mobileCall} onClick={() => setOpen(false)}>
                <PhoneIcon />
                {contact.phoneDisplay}
              </a>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
