'use client'

import type { ReactElement } from 'react'
import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { resolveText } from '../lib/brand-text'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'
import BrandLogo from './BrandLogo'
import styles from './Footer.module.css'

type FooterLink = { key: string; href: string }

// Showroom column — reuses the lean nav.* labels (whitelisted routes only).
const SHOWROOM_LINKS: FooterLink[] = [
  { key: 'nav.used_cars', href: '/used-cars' },
  { key: 'nav.recently_sold', href: '/recently-sold' },
  { key: 'nav.finance', href: '/finance' },
  { key: 'nav.part_exchange', href: '/part-exchange' },
  { key: 'nav.sell', href: '/sell-my-car' },
]

// Explore column — carries About + Contact (nav-lean contract) + garage routes.
const EXPLORE_LINKS: FooterLink[] = [
  { key: 'footer.about', href: '/about' },
  { key: 'nav.services', href: '/services' },
  { key: 'footer.contact', href: '/contact' },
  { key: 'footer.compare', href: '/compare' },
  { key: 'footer.wishlist', href: '/wishlist' },
]

type SocialDef = { key: string; Icon: () => ReactElement; label: string; fallback: string }

const SOCIAL_DEFS: SocialDef[] = [
  { key: 'facebook', Icon: () => (<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9V12h2.5V9.85c0-2.47 1.47-3.84 3.72-3.84 1.08 0 2.21.2 2.21.2v2.43h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.75l-.44 2.89h-2.31V21.87A10 10 0 0 0 22 12Z"/></svg>), label: 'Facebook', fallback: 'https://facebook.com' },
  { key: 'instagram', Icon: () => (<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/></svg>), label: 'Instagram', fallback: 'https://instagram.com' },
  { key: 'twitter', Icon: () => (<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M18.244 2H21.5l-7.39 8.45L23 22h-6.74l-5.27-6.92L4.95 22H1.7l7.91-9.04L1 2h6.91l4.76 6.3L18.24 2Zm-1.18 18h1.86L7.04 4H5.06l11.99 16Z"/></svg>), label: 'X (Twitter)', fallback: 'https://x.com' },
  { key: 'youtube', Icon: () => (<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M23 12s0-3.16-.4-4.67a3 3 0 0 0-2.13-2.12C18.96 4.8 12 4.8 12 4.8s-6.96 0-8.47.4A3 3 0 0 0 1.4 7.33C1 8.84 1 12 1 12s0 3.16.4 4.67a3 3 0 0 0 2.13 2.12C5.04 19.2 12 19.2 12 19.2s6.96 0 8.47-.41a3 3 0 0 0 2.13-2.12C23 15.16 23 12 23 12Zm-13.2 3V9l5.2 3-5.2 3Z"/></svg>), label: 'YouTube', fallback: 'https://youtube.com' },
]

export default function Footer() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const { isOnline } = useWorkingHours((brand as any)?.openingHours)

  // Generic fallback — never the seed dealer's literal name (leaks across previews).
  const brandName = String(brand?.name || '').trim() || 'The showroom'
  const year = new Date().getFullYear()

  const socials = (brand as any)?.socialLinks || {}
  const socialLinks = SOCIAL_DEFS.map(({ key, Icon, label, fallback }) => {
    const brandHref = socials[key]
    const href = typeof brandHref === 'string' && brandHref.trim().length > 0 ? brandHref : fallback
    return { key, Icon, label, href }
  })

  // Guarded hours: reuse the header working-hours status — never renders "Closed".
  const hoursLine = isOnline
    ? resolveText(brand, 'header.status_open')
    : resolveText(brand, 'header.status_fallback')

  const cityLine = [contact.city, contact.county].filter(Boolean).join(', ')
  const localityLine = [cityLine, contact.postcode].filter(Boolean).join(' ').trim()

  return (
    <footer className={styles.footer}>
      {/* Furnishing (luxury→refined): the same soft brand-light canvas the hero
          and arrival card got, held further back over the deep claret plate for
          gentle depth. Self-guards — static token wash under reduced-motion /
          ≤640px, pauses off-screen. Decorative + aria-hidden. */}
      <CanvasFX variant="aurora-light" density={0.6} className={styles.aurora} />
      <div className={styles.inner} data-aos="fade-up">
        {/* Unique move: double-hairline opening rule above the solo monogram. */}
        <div className={styles.doubleRule} aria-hidden="true" />

        <div className={styles.monogram}>
          <Link href="/" className={`${styles.monogramLink} mfx-float`} aria-label={`${brandName} — home`}>
            <BrandLogo height={44} />
          </Link>
        </div>

        <div className={styles.columns}>
          {/* 1 — blurb + socials (hidden on the base mobile stack) */}
          <div className={`${styles.col} ${styles.colBlurb}`}>
            <p className={styles.blurb}>{resolveText(brand, 'footer.blurb')}</p>
            <div className={styles.socials} aria-label="Social media">
              {socialLinks.map(({ key, Icon, label, href }) => (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={styles.socialLink}>
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* 2 — Showroom */}
          <nav className={styles.col} aria-label={resolveText(brand, 'footer.col_showroom')}>
            <h2 className={styles.colHead}>{resolveText(brand, 'footer.col_showroom')}</h2>
            <ul className={styles.linkList}>
              {SHOWROOM_LINKS.map(({ key, href }) => (
                <li key={href}>
                  <Link href={href}>{resolveText(brand, key)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 3 — Explore */}
          <nav className={styles.col} aria-label={resolveText(brand, 'footer.col_explore')}>
            <h2 className={styles.colHead}>{resolveText(brand, 'footer.col_explore')}</h2>
            <ul className={styles.linkList}>
              {EXPLORE_LINKS.map(({ key, href }) => (
                <li key={href}>
                  <Link href={href}>{resolveText(brand, key)}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 4 — Contact */}
          <div className={styles.col}>
            <h2 className={styles.colHead}>{resolveText(brand, 'footer.col_contact')}</h2>
            <address className={styles.contactBlock}>
              {contact.streetLine && <span className={styles.contactLine}>{contact.streetLine}</span>}
              {localityLine && <span className={styles.contactLine}>{localityLine}</span>}
              {contact.phoneTel && (
                <a href={`tel:${contact.phoneTel}`} className={styles.contactLink}>
                  {contact.phoneDisplay || contact.phoneTel}
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className={styles.contactLink}>
                  {contact.email}
                </a>
              )}
              <span className={styles.contactLine}>{hoursLine}</span>
            </address>
          </div>
        </div>

        {/* Fine print — © line + privacy/cookie under a single interior hairline. */}
        <div className={styles.finePrint}>
          <span>© {year} {brandName}. {resolveText(brand, 'footer.rights')}</span>
          <nav className={styles.legal} aria-label="Legal">
            <Link href="/privacy-policy">{resolveText(brand, 'footer.privacy')}</Link>
            <Link href="/cookie-policy">{resolveText(brand, 'footer.cookies')}</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
