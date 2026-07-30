'use client'

import { useEffect, useState, type ReactElement } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'
import { useGarage } from '../context/GarageContext'
import { getBrandContactInfo } from '../lib/contact'
import { resolveText } from '../lib/brand-text'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import BrandLogo from './BrandLogo'
import styles from './Header.module.css'

type NavItem = { key: string; href: string }

// Lean nav — no Home/About/Contact (wordmark -> home; About/Contact in footer).
const NAV_ITEMS: NavItem[] = [
  { key: 'nav.used_cars', href: '/used-cars' },
  { key: 'nav.recently_sold', href: '/recently-sold' },
  { key: 'nav.services', href: '/services' },
  { key: 'nav.finance', href: '/finance' },
  { key: 'nav.part_exchange', href: '/part-exchange' },
  { key: 'nav.sell', href: '/sell-my-car' },
]

function isActiveRoute(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.92Z"/></svg>
)
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/></svg>
)
const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>
)
const CompareIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3l4 4-4 4"/><path d="M20 7H4"/><path d="M8 21l-4-4 4-4"/><path d="M4 17h16"/></svg>
)
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
)
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
)
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M12.04 2a9.9 9.9 0 0 0-8.46 15.05L2 22l5.09-1.33A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 6.9 12.35l-.2.32.6 2.19-2.25-.59-.31.18a8.1 8.1 0 1 1-4.74-14.65Zm-2.6 4.02c-.14 0-.37.05-.56.26-.19.2-.73.71-.73 1.74s.75 2.02.85 2.16c.1.14 1.46 2.34 3.6 3.19 1.78.7 2.14.56 2.53.53.39-.04 1.26-.52 1.44-1.02.18-.5.18-.93.13-1.02-.05-.09-.19-.14-.4-.24-.2-.1-1.26-.62-1.45-.69-.19-.07-.34-.1-.48.11-.14.2-.55.68-.67.82-.12.14-.25.16-.46.05-.2-.1-.87-.32-1.66-1.02-.61-.55-1.03-1.22-1.15-1.43-.12-.2-.01-.31.09-.42.09-.09.2-.24.3-.36.1-.12.13-.2.2-.34.07-.14.03-.26-.02-.36-.05-.1-.46-1.13-.63-1.55-.16-.4-.33-.35-.46-.35Z"/></svg>
)

type SocialDef = { key: string; Icon: () => ReactElement; label: string; fallback: string }

const SOCIAL_DEFS: SocialDef[] = [
  { key: 'facebook', Icon: () => (<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9V12h2.5V9.85c0-2.47 1.47-3.84 3.72-3.84 1.08 0 2.21.2 2.21.2v2.43h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.75l-.44 2.89h-2.31V21.87A10 10 0 0 0 22 12Z"/></svg>), label: 'Facebook', fallback: 'https://facebook.com' },
  { key: 'instagram', Icon: () => (<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/></svg>), label: 'Instagram', fallback: 'https://instagram.com' },
  { key: 'twitter', Icon: () => (<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M18.244 2H21.5l-7.39 8.45L23 22h-6.74l-5.27-6.92L4.95 22H1.7l7.91-9.04L1 2h6.91l4.76 6.3L18.24 2Zm-1.18 18h1.86L7.04 4H5.06l11.99 16Z"/></svg>), label: 'X (Twitter)', fallback: 'https://x.com' },
  { key: 'youtube', Icon: () => (<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M23 12s0-3.16-.4-4.67a3 3 0 0 0-2.13-2.12C18.96 4.8 12 4.8 12 4.8s-6.96 0-8.47.4A3 3 0 0 0 1.4 7.33C1 8.84 1 12 1 12s0 3.16.4 4.67a3 3 0 0 0 2.13 2.12C5.04 19.2 12 19.2 12 19.2s6.96 0 8.47-.41a3 3 0 0 0 2.13-2.12C23 15.16 23 12 23 12Zm-13.2 3V9l5.2 3-5.2 3Z"/></svg>), label: 'YouTube', fallback: 'https://youtube.com' },
]

export default function Header() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const contact = getBrandContactInfo(brand)
  const { isOnline } = useWorkingHours((brand as any)?.openingHours)
  const { wishlistCount, compareCount } = useGarage()

  const [open, setOpen] = useState(false)

  const socials = (brand as any)?.socialLinks || {}
  const statusLabel = isOnline
    ? resolveText(brand, 'header.status_open')
    : resolveText(brand, 'header.status_fallback')
  const ctaLabel = resolveText(brand, 'header.cta')

  // Close overlay on route change.
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const socialLinks = SOCIAL_DEFS.map(({ key, Icon, label, fallback }) => {
    const brandHref = socials[key]
    const href = typeof brandHref === 'string' && brandHref.trim().length > 0 ? brandHref : fallback
    return { key, Icon, label, href }
  })

  return (
    <>
      {/* ---- Contact strip (static, scrolls away) ---- */}
      <div className={styles.contactStrip} role="region" aria-label="Contact and opening status">
        <div className={styles.contactInner}>
          {/* Unique move: the plaque spans BOTH rows — one element, one hairline
              right border touching the strip above and the nav row below. */}
          <Link href="/" className={styles.plaque} aria-label={brand?.name || 'Home'}>
            <BrandLogo height={64} variant="plaque" />
          </Link>

          <div className={styles.contactContent}>
            <div className={styles.contactLeft}>
              {contact.locationLabel && (
                <span className={`${styles.contactChip} ${styles.locationChip}`}>
                  <MapPinIcon />
                  <span>{contact.locationLabel}</span>
                </span>
              )}
              {contact.phoneTel && (
                <a href={`tel:${contact.phoneTel}`} className={`${styles.contactPhone} ${styles.phoneMobile}`}>
                  <PhoneIcon />
                  <span>{contact.phoneDisplay || contact.phoneTel}</span>
                </a>
              )}
            </div>

            <div className={styles.contactRight}>
              <span className={`${styles.contactChip} ${styles.statusChip}`}>
                <span className={styles.statusDot} data-online={isOnline || undefined} aria-hidden="true" />
                <span>{statusLabel}</span>
              </span>
              <span className={styles.socials} aria-label="Social media">
                {socialLinks.map(({ key, Icon, label, href }) => (
                  <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={styles.socialLink}>
                    <Icon />
                  </a>
                ))}
              </span>
              {contact.phoneTel && (
                <a href={`tel:${contact.phoneTel}`} className={`${styles.contactPhone} ${styles.phoneDesktop}`}>
                  <PhoneIcon />
                  <span>{contact.phoneDisplay || contact.phoneTel}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Nav row (sticky; no logo, no box-shadow, border-bottom only) ---- */}
      <header className={styles.navRow}>
        <div className={styles.navInner}>
          {/* Mobile-only logo (plaque owns identity from 768 up). */}
          <Link href="/" className={styles.navLogo} aria-label={brand?.name || 'Home'}>
            <BrandLogo height={36} />
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
            {NAV_ITEMS.map(({ key, href }) => {
              const active = isActiveRoute(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {resolveText(brand, key)}
                </Link>
              )
            })}
          </nav>

          <div className={styles.navRight}>
            <Link href="/wishlist" className={styles.iconLink} aria-label={`Wishlist (${wishlistCount} saved)`}>
              <HeartIcon />
              {wishlistCount > 0 && <span className={styles.countPill}>{wishlistCount}</span>}
            </Link>
            <Link href="/compare" className={styles.iconLink} aria-label={`Compare (${compareCount} saved)`}>
              <CompareIcon />
              {compareCount > 0 && <span className={styles.countPill}>{compareCount}</span>}
            </Link>
            <Link href="/sell-my-car" className={styles.cta}>{ctaLabel}</Link>
          </div>

          <button
            type="button"
            className={styles.hamburger}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="redgate-mobile-nav"
            onClick={() => setOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* ---- Full-screen mobile overlay ---- */}
      <div
        id="redgate-mobile-nav"
        className={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!open}
      >
        <div className={styles.overlayHead}>
          <Link href="/" className={styles.overlayLogo} aria-label={brand?.name || 'Home'} onClick={() => setOpen(false)}>
            <BrandLogo height={40} />
          </Link>
          <button type="button" className={styles.overlayClose} aria-label="Close menu" onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Mobile primary" className={styles.overlayNav}>
          {NAV_ITEMS.map(({ key, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`${styles.overlayLink} ${isActiveRoute(pathname, href) ? styles.overlayLinkActive : ''}`}
              aria-current={isActiveRoute(pathname, href) ? 'page' : undefined}
            >
              {resolveText(brand, key)}
            </Link>
          ))}
          <Link href="/wishlist" onClick={() => setOpen(false)} className={styles.overlayLink}>
            <span>{resolveText(brand, 'footer.wishlist')}</span>
            {wishlistCount > 0 && <span className={styles.countPill}>{wishlistCount}</span>}
          </Link>
          <Link href="/compare" onClick={() => setOpen(false)} className={styles.overlayLink}>
            <span>{resolveText(brand, 'footer.compare')}</span>
            {compareCount > 0 && <span className={styles.countPill}>{compareCount}</span>}
          </Link>
        </nav>

        <div className={styles.overlayFoot}>
          {contact.phoneTel && (
            <a href={`tel:${contact.phoneTel}`} className={styles.overlayPhone}>
              <PhoneIcon />
              <span>{contact.phoneDisplay || contact.phoneTel}</span>
            </a>
          )}
          {contact.whatsappUrl && (
            <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.overlayWhatsapp}>
              <WhatsAppIcon />
              <span>{resolveText(brand, 'header.whatsapp')}</span>
            </a>
          )}
          <div className={styles.overlaySocials} aria-label="Social media">
            {socialLinks.map(({ key, Icon, label, href }) => (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={styles.socialLink}>
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
