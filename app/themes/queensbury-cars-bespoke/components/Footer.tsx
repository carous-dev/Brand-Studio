'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Footer.module.css'

const QUICK_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'Part Exchange', href: '/part-exchange' },
  { label: 'Finance', href: '/finance' },
]

const SERVICE_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Services', href: '/services' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Compare', href: '/compare' },
]

const LEGAL_LINKS: Array<{ label: string; href: string }> = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
]

export default function Footer() {
  const brand = useBrand()
  const contact = useMemo(() => getBrandContactInfo(brand), [brand])
  const brandName = brand?.name || 'Queensbury Cars'

  const addr: any = brand?.location?.address || {}
  const addressLine = [addr.line1, addr.line2, addr.city, addr.county, addr.postcode]
    .filter((p: string) => p && p.trim())
    .join(', ')

  const openingHours = (brand?.openingHours as Record<string, string>) || {}
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const hasHours = dayKeys.some((k) => openingHours[k])

  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.gradientGlow} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brandLink} aria-label={brandName}>
            {brand?.logo ? (
              <img src={brand.logo} alt={brandName} className={styles.brandLogo} />
            ) : (
              <span className={styles.brandWordmark}>{brandName}</span>
            )}
          </Link>
          <p className={styles.brandLead}>
            Independent used car dealer. Hand-picked stock, clear finance options, and honest aftercare —
            every customer treated like a friend.
          </p>
          {addressLine && (
            <address className={styles.address}>{addressLine}</address>
          )}
          {contact.phoneDisplay && (
            <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.contactLine}>
              <span aria-hidden="true">📞</span> {contact.phoneDisplay}
            </a>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className={styles.contactLine}>
              <span aria-hidden="true">✉️</span> {contact.email}
            </a>
          )}
        </div>

        <div className={styles.linksCol}>
          <h3 className={styles.colTitle}>Quick Links</h3>
          <ul className={styles.linkList}>
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.linksCol}>
          <h3 className={styles.colTitle}>Services</h3>
          <ul className={styles.linkList}>
            {SERVICE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={styles.link}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.hoursCol}>
          <h3 className={styles.colTitle}>Opening Hours</h3>
          {hasHours ? (
            <ul className={styles.hoursList}>
              {dayKeys.map((day) =>
                openingHours[day] ? (
                  <li key={day} className={styles.hoursRow}>
                    <span className={styles.hoursDay}>{day.slice(0, 3).toUpperCase()}</span>
                    <span className={styles.hoursValue}>{openingHours[day]}</span>
                  </li>
                ) : null,
              )}
            </ul>
          ) : (
            <p className={styles.hoursFallback}>By appointment — please call ahead.</p>
          )}
        </div>
      </div>

      <div className={styles.divider} aria-hidden="true" />

      <div className={styles.legalRow}>
        <span className={styles.copy}>© {year} {brandName}. All rights reserved.</span>
        <nav aria-label="Legal" className={styles.legalNav}>
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={styles.legalLink}>
              {l.label}
            </Link>
          ))}
        </nav>
        <span className={styles.credit}>
          Site by{' '}
          <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer" className={styles.creditLink}>
            Carous Limited
          </a>
        </span>
      </div>
    </footer>
  )
}
