'use client'

import Link from 'next/link'
import { Facebook, Instagram, MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Footer.module.css'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const SERVICES_LINKS = [
  { label: 'Finance', href: '/finance' },
  { label: 'Part Exchange', href: '/part-exchange' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'Services', href: '/services' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
]

export default function Footer() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Chesterfield Motor Empire'
  const tagline = brand?.tagline || 'Quality used cars and vans, dependable service.'
  const year = new Date().getFullYear()
  const facebookUrl = brand?.socialLinks?.facebook
  const instagramUrl = brand?.socialLinks?.instagram

  const hours = (brand?.openingHours as Record<string, string> | undefined) || {
    monday: '09:00 - 16:30',
    tuesday: '09:00 - 16:30',
    wednesday: '09:00 - 16:30',
    thursday: '09:00 - 16:30',
    friday: '09:00 - 16:30',
    saturday: '09:00 - 16:30',
    sunday: 'Closed',
  }

  const orderedDays: Array<{ key: string; label: string }> = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ]

  return (
    <footer className={styles.footer}>
      <span className={styles.topAccent} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true">
        <span className="mfx-glow-pulse" />
      </div>

      <div className={styles.inner}>
        <div className={styles.column}>
          <Link href="/" className={styles.brandLink} aria-label={`${brandName} home`}>
            {brand?.logo ? (
              <img src={brand.logo} alt={brandName} className={styles.brandLogo} />
            ) : (
              <span className={styles.brandWordmark}>{brandName}</span>
            )}
          </Link>
          <p className={styles.brandTagline}>{tagline}</p>
          {(facebookUrl || instagramUrl) ? (
            <div className={styles.social}>
              {facebookUrl ? (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className={styles.socialLink}
                >
                  <Facebook size={18} strokeWidth={2} />
                </a>
              ) : null}
              {instagramUrl ? (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className={styles.socialLink}
                >
                  <Instagram size={18} strokeWidth={2} />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={styles.column}>
          <p className={styles.colHeading}>Showroom</p>
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.colLink}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.column}>
          <p className={styles.colHeading}>Services</p>
          {SERVICES_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.colLink}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className={styles.column}>
          <p className={styles.colHeading}>Visit us</p>
          <address className={styles.address}>
            <span className={styles.addressLine}>
              <MapPin size={14} strokeWidth={2} aria-hidden="true" />
              {contact.showroomAddress || 'Shuttlewood, Chesterfield, Derbyshire'}
            </span>
            {contact.phoneTel ? (
              <a className={styles.addressLink} href={`tel:${contact.phoneTel}`}>
                <Phone size={14} strokeWidth={2.4} aria-hidden="true" />
                {contact.phoneDisplay}
              </a>
            ) : null}
            {contact.email ? (
              <a className={styles.addressLink} href={`mailto:${contact.email}`}>
                <Mail size={14} strokeWidth={2.4} aria-hidden="true" />
                {contact.email}
              </a>
            ) : null}
          </address>

          <div className={styles.hours}>
            <p className={styles.hoursHeader}>
              <Clock size={14} strokeWidth={2.4} aria-hidden="true" />
              Opening hours
            </p>
            <dl className={styles.hoursList}>
              {orderedDays.map((day) => {
                const value = hours[day.key] || 'Closed'
                const isClosed = /closed/i.test(value)
                return (
                  <div key={day.key} className={styles.hoursRow}>
                    <dt>{day.label}</dt>
                    <dd className={isClosed ? styles.hoursClosed : ''}>{value}</dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>
      </div>

      <div className={styles.ctaStrip}>
        <div className={styles.ctaInner}>
          <p className={styles.ctaCopy}>
            <span className={styles.ctaEyebrow}>Ready to drive away?</span>
            <span className={styles.ctaHeadline}>Browse 500+ vehicles in stock today.</span>
          </p>
          <Link href="/used-cars" className={`${styles.ctaButton} mfx-shimmer`}>
            View stock
            <ArrowUpRight size={18} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className={styles.bottomStrip}>
        <div className={styles.bottomInner}>
          <span>© {year} {brandName}. All rights reserved.</span>
          <span className={styles.attribution}>
            Site by{' '}
            <a
              href="https://carous.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attributionLink}
            >
              Carous Limited
            </a>
          </span>
          <nav aria-label="Legal" className={styles.legalNav}>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.legalLink}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
