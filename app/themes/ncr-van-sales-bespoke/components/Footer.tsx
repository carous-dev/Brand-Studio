'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, ArrowUpRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Footer.module.css'

const DEFAULT_HOURS = [
  { day: 'Mon – Fri', hours: '09:00 – 18:00' },
  { day: 'Saturday', hours: '09:00 – 17:00' },
  { day: 'Sunday', hours: 'Closed' },
]

export default function Footer() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'NCR Van Sales Ltd'
  const year = new Date().getFullYear()

  const openingHours: Array<{ day: string; hours: string }> = (() => {
    const raw = (brand as any)?.openingHours
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((r: any) => ({ day: String(r.day ?? ''), hours: String(r.hours ?? r.value ?? '') })).filter((r) => r.day)
    }
    return DEFAULT_HOURS
  })()

  return (
    <footer className={styles.footer} data-aos="fade-up">
      <div className={`${styles.glowBlob} mfx-glow-pulse`} aria-hidden="true" />

      <div className={styles.top}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brandLink} aria-label={brandName}>
            {brand?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brand.logo} alt={brandName} className={styles.brandLogo} />
            ) : (
              <span className={styles.brandWordmark}>{brandName}</span>
            )}
          </Link>
          <p className={styles.tagline}>
            Commercial van specialists for trade buyers. Inspected, prepared and ready to work — backed by finance, delivery and a 7-day exchange promise.
          </p>
          <div className={styles.contactStack}>
            {contact.showroomAddress ? (
              <p className={styles.contactRow}>
                <MapPin size={16} strokeWidth={2} aria-hidden="true" />
                <address>{contact.showroomAddress}</address>
              </p>
            ) : null}
            {contact.phoneDisplay ? (
              <p className={styles.contactRow}>
                <Phone size={16} strokeWidth={2} aria-hidden="true" />
                <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`}>{contact.phoneDisplay}</a>
              </p>
            ) : null}
            {contact.email ? (
              <p className={styles.contactRow}>
                <Mail size={16} strokeWidth={2} aria-hidden="true" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
            ) : null}
          </div>
        </div>

        <div className={styles.linkCol}>
          <h3 className={styles.colHeading}>Stock</h3>
          <ul>
            <li><Link href="/used-cars">All vans</Link></li>
            <li><Link href="/used-cars?body=Panel%20Van">Panel vans</Link></li>
            <li><Link href="/used-cars?body=Luton">Lutons</Link></li>
            <li><Link href="/used-cars?body=Tipper">Tippers</Link></li>
            <li><Link href="/recently-sold">Recently sold</Link></li>
          </ul>
        </div>

        <div className={styles.linkCol}>
          <h3 className={styles.colHeading}>Buying</h3>
          <ul>
            <li><Link href="/finance">Finance options</Link></li>
            <li><Link href="/part-exchange">Part exchange</Link></li>
            <li><Link href="/sell-my-car">Sell your van</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/contact">Get in touch</Link></li>
          </ul>
        </div>

        <div className={styles.linkCol}>
          <h3 className={styles.colHeading}>Opening hours</h3>
          <dl className={styles.hours}>
            {openingHours.map((row) => (
              <div key={row.day} className={styles.hoursRow}>
                <dt><Clock size={14} strokeWidth={2} aria-hidden="true" /> {row.day}</dt>
                <dd>{row.hours}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copy}>© {year} {brandName}. All rights reserved.</p>
        <nav aria-label="Legal" className={styles.legalNav}>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/cookie-policy">Cookies</Link>
        </nav>
        <p className={styles.attribution}>
          Site by{' '}
          <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">
            Carous Limited <ArrowUpRight size={12} strokeWidth={2.4} aria-hidden="true" />
          </a>
        </p>
      </div>
    </footer>
  )
}
