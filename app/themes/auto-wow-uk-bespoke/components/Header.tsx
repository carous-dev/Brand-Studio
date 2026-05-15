'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, Phone, MapPin, Clock, ChevronRight,
  Facebook, Instagram, Youtube, Linkedin,
} from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'Services', href: '/services' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

function isOpenNow(brand: any): boolean {
  const hours = brand?.openingHours
  if (!hours) return true
  const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const now = new Date()
  const todayLabel = dayKeys[now.getDay()]
  const today = hours[todayLabel]
  if (!today || /closed/i.test(today)) return false
  return true
}

export default function Header() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const contact = getBrandContactInfo(brand)
  const city = brand?.location?.address?.city || ''
  const county = brand?.location?.address?.county || ''
  const locationLabel = [city, county].filter(Boolean).join(', ') || 'Contact us'
  const social = brand?.socialLinks || {}
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const live = isOpenNow(brand)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Always render the social icon group in the canonical order; when a
  // brand.socialLinks[platform] is empty/missing we render the icon as a
  // muted, non-clickable span so the bar never looks incomplete.
  // See memory: feedback_topbar_essentials.md.
  const socialItems: Array<{ Icon: any; href: string; label: string; configured: boolean }> = [
    { Icon: Facebook, href: (social.facebook as string) || '', label: 'Facebook', configured: Boolean(social.facebook) },
    { Icon: Instagram, href: (social.instagram as string) || '', label: 'Instagram', configured: Boolean(social.instagram) },
    { Icon: Youtube, href: (social.youtube as string) || '', label: 'YouTube', configured: Boolean(social.youtube) },
    { Icon: Linkedin, href: (social.linkedin as string) || '', label: 'LinkedIn', configured: Boolean(social.linkedin) },
  ]

  return (
    <>
      <div className={styles.topbar} role="region" aria-label="Dealer contact bar">
        <div className={styles.topbarInner}>
          <span className={styles.topChip} title="Showroom">
            <MapPin size={14} aria-hidden="true" />
            {locationLabel}
          </span>
          <span className={`${styles.topChip} ${styles.liveChip}`} aria-live="polite">
            <span className={`mfx-pulse-dot ${styles.liveDot}`} aria-hidden="true" />
            {live ? 'Live stock · Open now' : 'Live stock · Closed'}
          </span>
          <span className={`${styles.topChip} ${styles.hoursChip}`}>
            <Clock size={14} aria-hidden="true" />
            Mon-Sat 09:00&ndash;18:00
          </span>
          <ul className={styles.socials} aria-label="Social links">
            {socialItems.map(({ Icon, href, label, configured }) => (
              <li key={label}>
                {configured ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <Icon size={14} aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    className={styles.socialDisabled}
                    aria-label={`${label} link not yet configured`}
                    role="presentation"
                  >
                    <Icon size={14} aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
          {contact.phoneTel && (
            <a href={`tel:${contact.phoneTel}`} className={styles.topPhone}>
              <Phone size={14} aria-hidden="true" />
              <span>{contact.phoneDisplay}</span>
            </a>
          )}
        </div>
      </div>

      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label={brand?.name || 'this dealership'}>
            {brand?.logo ? (
              <img src={brand.logo} alt={brand?.name || 'this dealership'} className={styles.brandLogo} />
            ) : (
              <span className={styles.brandWordmark}>{brand?.name || 'Dealer'}</span>
            )}
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className={styles.headerActions}>
            {contact.phoneTel && (
              <a href={`tel:${contact.phoneTel}`} className={`auto-btn auto-btn--primary mfx-shimmer ${styles.callCta}`}>
                <Phone size={16} aria-hidden="true" />
                <span>Call now</span>
              </a>
            )}
            <button
              type="button"
              className={styles.menuToggle}
              aria-expanded={mobileOpen}
              aria-controls="auto-mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="auto-mobile-nav"
        className={`${styles.mobileSheet} ${mobileOpen ? styles.mobileOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        hidden={!mobileOpen}
      >
        <div className={styles.mobileInner}>
          <ul className={styles.mobileNavList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.mobileNavLink}>
                  <span>{item.label}</span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.mobileFooter}>
            {contact.phoneTel && (
              <a href={`tel:${contact.phoneTel}`} className={`auto-btn auto-btn--primary ${styles.mobileCall}`}>
                <Phone size={16} aria-hidden="true" />
                <span>{contact.phoneDisplay}</span>
              </a>
            )}
            <ul className={styles.mobileSocials} aria-label="Social links">
              {socialItems.map(({ Icon, href, label, configured }) => (
                <li key={label}>
                  {configured ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                      <Icon size={18} aria-hidden="true" />
                    </a>
                  ) : (
                    <span
                      className={styles.socialDisabled}
                      aria-label={`${label} link not yet configured`}
                      role="presentation"
                    >
                      <Icon size={18} aria-hidden="true" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
