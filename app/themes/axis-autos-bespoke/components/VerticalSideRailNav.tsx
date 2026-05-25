'use client'

/**
 * VerticalSideRailNav — the signature move for axis-autos-bespoke.
 *
 * Desktop (≥ 980px): 244px fixed left rail with brand wordmark, vertical nav,
 * location + status + phone CTA at the bottom. Main content sits to the right.
 *
 * Mobile (≤ 980px): collapses to a thin 56px top bar with a hamburger that
 * opens a full-screen overlay nav. Same items, larger tap targets.
 *
 * The 4 top-contact-bar elements (location chip / status chip / social icons /
 * phone CTA) integrate INTO the rail per SKILL §"Required-widget placement
 * varies per theme" → integrated-into-header variant.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
} from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import styles from './VerticalSideRailNav.module.css'

const NAV_ITEMS: Array<{ label: string; href: string; code: string }> = [
  { label: 'Home',         href: '/',             code: '01' },
  { label: 'Stock',        href: '/used-cars',    code: '02' },
  { label: 'Finance',      href: '/finance',      code: '03' },
  { label: 'Sell my car',  href: '/sell-my-car',  code: '04' },
  { label: 'Services',     href: '/services',     code: '05' },
]

const SOCIALS: Array<{ key: string; label: string; Icon: typeof Facebook }> = [
  { key: 'facebook',  label: 'Facebook',  Icon: Facebook },
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'youtube',   label: 'YouTube',   Icon: Youtube },
  { key: 'linkedin',  label: 'LinkedIn',  Icon: Linkedin },
]

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  if (pathname === href) return true
  return pathname.startsWith(`${href}/`)
}

export default function VerticalSideRailNav() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const brandName = brand?.name || 'Axis Autos'
  const logoUrl = (brand as any)?.logo
  const hasLogo = Boolean(logoUrl)
  const contact = getBrandContactInfo(brand)
  const hours = useWorkingHours((brand as any)?.openingHours)
  const address = (brand as any)?.location?.address || {}
  const socials: Record<string, string | undefined> = ((brand as any)?.socialLinks) || {}

  const locationLabel = [address.city, address.county].filter(Boolean).join(', ')

  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [mobileOpen])

  return (
    <>
      {/* Mobile top bar — only visible ≤ 980px */}
      <header className={styles.topBar} aria-label="Site navigation (mobile)">
        <Link href="/" className={styles.topBrand} aria-label={brandName}>
          {hasLogo ? (
            <img src={logoUrl} alt={brandName} className={styles.topLogo} />
          ) : (
            <span className={styles.topWordmark}>{brandName}</span>
          )}
        </Link>
        <button
          type="button"
          className={styles.hamburger}
          aria-expanded={mobileOpen}
          aria-controls="axis-mobile-nav"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>
      </header>

      {/* Desktop side rail — only visible ≥ 980px */}
      <aside className={styles.rail} aria-label="Primary navigation">
        <Link href="/" className={styles.brand} aria-label={brandName}>
          {hasLogo ? (
            <img src={logoUrl} alt={brandName} className={styles.brandLogo} />
          ) : (
            <span className={styles.brandWordmark}>{brandName}</span>
          )}
          <span className={styles.brandTagline}>Used cars · UK</span>
        </Link>

        <div className={styles.statusRow}>
          <span className={`${styles.statusDot} ${hours?.isOnline ? styles.statusOnline : styles.statusOffline}`} aria-hidden="true" />
          <span className={styles.statusLabel}>
            {hours?.isOnline ? 'Showroom open' : 'Browse 24/7'}
          </span>
        </div>

        <nav className={styles.nav} aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.navCode}>{item.code}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className={styles.spacer} />

        <div className={styles.contactBlock}>
          {locationLabel ? (
            <div className={styles.contactRow}>
              <MapPin size={14} strokeWidth={2} aria-hidden="true" />
              <span>{locationLabel}</span>
            </div>
          ) : null}
          {contact.phoneTel ? (
            <a href={`tel:${contact.phoneTel}`} className={styles.phoneCta}>
              <Phone size={14} strokeWidth={2} aria-hidden="true" />
              <span>{contact.phoneDisplay}</span>
            </a>
          ) : null}
          <div className={styles.socials} aria-label="Social media">
            {SOCIALS.map(({ key, label, Icon }) => {
              const url = (socials[key] || '').trim()
              const child = <Icon size={14} strokeWidth={2} />
              if (url) {
                return (
                  <a
                    key={key}
                    href={url}
                    className={styles.socialLink}
                    aria-label={`${label} (opens in new tab)`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {child}
                  </a>
                )
              }
              return (
                <span key={key} className={styles.socialLink} aria-label={`${label} — coming soon`} role="presentation">
                  {child}
                </span>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Mobile overlay nav */}
      <div
        id="axis-mobile-nav"
        className={`${styles.mobilePanel} ${mobileOpen ? styles.mobilePanelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        hidden={!mobileOpen}
      >
        <nav aria-label="Mobile primary" className={styles.mobileNav}>
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href)
            return (
              <Link
                key={`m-${item.href}`}
                href={item.href}
                className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.navCode}>{item.code}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
          <Link href="/about" className={styles.mobileLink}>
            <span className={styles.navCode}>06</span>
            <span>About</span>
          </Link>
          <Link href="/contact" className={styles.mobileLink}>
            <span className={styles.navCode}>07</span>
            <span>Contact</span>
          </Link>
          <Link href="/recently-sold" className={styles.mobileLink}>
            <span className={styles.navCode}>08</span>
            <span>Recently sold</span>
          </Link>
        </nav>
        <div className={styles.mobileContact}>
          {contact.phoneTel ? (
            <a href={`tel:${contact.phoneTel}`} className={styles.mobilePhone}>
              <Phone size={16} strokeWidth={2} />
              {contact.phoneDisplay}
            </a>
          ) : null}
          <div className={styles.socials}>
            {SOCIALS.map(({ key, label, Icon }) => {
              const url = (socials[key] || '').trim()
              const child = <Icon size={14} strokeWidth={2} />
              if (url) {
                return (
                  <a key={`mob-${key}`} href={url} className={styles.socialLink} aria-label={label} target="_blank" rel="noopener noreferrer">
                    {child}
                  </a>
                )
              }
              return <span key={`mob-${key}`} className={styles.socialLink} aria-label={label} role="presentation">{child}</span>
            })}
          </div>
        </div>
      </div>
    </>
  )
}
