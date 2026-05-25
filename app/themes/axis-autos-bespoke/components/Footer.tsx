'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { MapPin, Phone, Mail } from 'lucide-react'
import styles from './Footer.module.css'

export default function Footer() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Axis Autos'
  const year = new Date().getFullYear()
  const address = (brand as any)?.location?.address || {}

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.lead}>
          <span className={styles.brand}>{brandName}</span>
          <p className={styles.tagline}>
            Used cars, sold straight. No surprises, no theatre. Independent
            specialists working out of a single forecourt.
          </p>
        </div>

        <nav className={styles.column} aria-label="Footer primary">
          <h3 className={styles.colTitle}>Stock</h3>
          <Link href="/" className={styles.colLink}>Home</Link>
          <Link href="/used-cars" className={styles.colLink}>Used cars</Link>
          <Link href="/recently-sold" className={styles.colLink}>Recently sold</Link>
          <Link href="/compare" className={styles.colLink}>Compare</Link>
          <Link href="/wishlist" className={styles.colLink}>Wishlist</Link>
        </nav>

        <nav className={styles.column} aria-label="Footer services">
          <h3 className={styles.colTitle}>Services</h3>
          <Link href="/finance" className={styles.colLink}>Finance</Link>
          <Link href="/part-exchange" className={styles.colLink}>Part exchange</Link>
          <Link href="/sell-my-car" className={styles.colLink}>Sell your car</Link>
          <Link href="/services" className={styles.colLink}>All services</Link>
        </nav>

        <nav className={styles.column} aria-label="Footer dealership">
          <h3 className={styles.colTitle}>Dealership</h3>
          <Link href="/about" className={styles.colLink}>About</Link>
          <Link href="/contact" className={styles.colLink}>Contact</Link>
          <Link href="/privacy-policy" className={styles.colLink}>Privacy</Link>
          <Link href="/cookie-policy" className={styles.colLink}>Cookies</Link>
        </nav>

        <div className={styles.contactCol}>
          <h3 className={styles.colTitle}>Showroom</h3>
          <address className={styles.address}>
            <span className={styles.row}>
              <MapPin size={14} strokeWidth={2} />
              <span>
                {[address.line1, address.line2, address.city, address.county, address.postcode]
                  .filter(Boolean)
                  .join(', ') || 'Contact the showroom for our address'}
              </span>
            </span>
            {contact.phoneTel ? (
              <a href={`tel:${contact.phoneTel}`} className={styles.row}>
                <Phone size={14} strokeWidth={2} />
                <span>{contact.phoneDisplay}</span>
              </a>
            ) : null}
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className={styles.row}>
                <Mail size={14} strokeWidth={2} />
                <span>{contact.email}</span>
              </a>
            ) : null}
          </address>
        </div>
      </div>

      <div className={styles.bottomStrip}>
        <span>© {year} {brandName}. All rights reserved.</span>
        <span className={styles.carousCredit}>
          Site by{' '}
          <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">Carous Limited</a>
        </span>
        <nav className={styles.legalNav} aria-label="Legal">
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/cookie-policy">Cookies</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
        </nav>
      </div>
    </footer>
  )
}
