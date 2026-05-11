'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Footer.module.css'

const DEFAULT_HOURS: Array<[string, string]> = [
  ['Mon', '9:00 – 18:00'],
  ['Tue', '9:00 – 18:00'],
  ['Wed', '9:00 – 18:00'],
  ['Thu', '9:00 – 18:00'],
  ['Fri', '9:00 – 18:00'],
  ['Sat', '10:00 – 17:00'],
  ['Sun', 'Closed'],
]

function buildHours(brand: any): Array<[string, string]> {
  const raw = brand?.openingHours
  if (!raw || typeof raw !== 'object') return DEFAULT_HOURS
  const dayLookup: Array<[string, string[]]> = [
    ['Mon', ['Monday', 'monday', 'Mon', 'mon']],
    ['Tue', ['Tuesday', 'tuesday', 'Tue', 'tue']],
    ['Wed', ['Wednesday', 'wednesday', 'Wed', 'wed']],
    ['Thu', ['Thursday', 'thursday', 'Thu', 'thu']],
    ['Fri', ['Friday', 'friday', 'Fri', 'fri']],
    ['Sat', ['Saturday', 'saturday', 'Sat', 'sat']],
    ['Sun', ['Sunday', 'sunday', 'Sun', 'sun']],
  ]
  const result: Array<[string, string]> = []
  let foundAny = false
  for (const [short, keys] of dayLookup) {
    let value = ''
    for (const k of keys) {
      const v = raw[k]
      if (typeof v === 'string' && v.trim()) { value = v.trim(); foundAny = true; break }
    }
    result.push([short, value || 'Closed'])
  }
  return foundAny ? result : DEFAULT_HOURS
}

export default function Footer() {
  const brand = useBrand()
  const brandName = brand?.name || 'ELE Car Sales'
  const contact = getBrandContactInfo(brand as any)

  const phoneDisplay = contact.phoneDisplay || '01501 000 000'
  const phoneTel = contact.phoneTel || '+441501000000'
  const email = contact.email || 'info@elecarsales.co.uk'
  const address = contact.showroomAddress || 'Shotts, North Lanarkshire, Scotland'

  const hours = buildHours(brand as any)
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brand} aria-label={brandName}>
            <span className={styles.brandMark}>ELE</span>
            <span className={styles.brandText}>Car Sales</span>
          </Link>
          <p className={styles.tagline}>
            Quality used cars in Shotts, Lanarkshire. Family-run dealer with
            finance, part-exchange, and nationwide delivery.
          </p>
        </div>

        <section className={styles.col} aria-labelledby="ele-footer-visit">
          <h3 id="ele-footer-visit" className={styles.colTitle}>Visit us</h3>
          <address className={styles.address}>
            <span className={styles.row}>
              <MapPin size={16} aria-hidden="true" />
              <span>{address}</span>
            </span>
            <a href={`tel:${phoneTel}`} className={styles.row}>
              <Phone size={16} aria-hidden="true" />
              <span>{phoneDisplay}</span>
            </a>
            <a href={`mailto:${email}`} className={styles.row}>
              <Mail size={16} aria-hidden="true" />
              <span>{email}</span>
            </a>
          </address>
        </section>

        <section className={styles.col} aria-labelledby="ele-footer-hours">
          <h3 id="ele-footer-hours" className={styles.colTitle}>
            <Clock size={16} aria-hidden="true" />
            <span>Opening hours</span>
          </h3>
          <dl className={styles.hours}>
            {hours.map(([day, value]) => (
              <div key={day} className={styles.hoursRow}>
                <dt>{day}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.col} aria-labelledby="ele-footer-explore">
          <h3 id="ele-footer-explore" className={styles.colTitle}>Explore</h3>
          <ul className={styles.linkList}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/used-cars">Used cars</Link></li>
            <li><Link href="/finance">Finance</Link></li>
            <li><Link href="/part-exchange">Part exchange</Link></li>
            <li><Link href="/sell-my-car">Sell your car</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </section>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span className={styles.bottomCopy}>© {year} {brandName}. All rights reserved.</span>
          <span className={styles.bottomAttr}>
            Site by{' '}
            <a
              href="https://carous.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.bottomAttrLink}
            >
              Carous Limited
            </a>
          </span>
          <nav aria-label="Legal" className={styles.legalNav}>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/cookie-policy">Cookies</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
