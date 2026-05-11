'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Footer.module.css'

const SHOP_LINKS = [
  { label: 'Used cars', href: '/used-cars' },
  { label: 'Recently sold', href: '/recently-sold' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Compare', href: '/compare' },
]

const SERVICES_LINKS = [
  { label: 'Finance', href: '/finance' },
  { label: 'Part-exchange', href: '/part-exchange' },
  { label: 'Sell your car', href: '/sell-my-car' },
  { label: 'All services', href: '/services' },
]

const COMPANY_LINKS = [
  { label: 'About us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy policy', href: '/privacy-policy' },
  { label: 'Cookie policy', href: '/cookie-policy' },
]

export default function Footer() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'AUTOWOW UK'
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.edge} aria-hidden="true" />
      <span className={[styles.glow, 'mfx-glow-pulse'].join(' ')} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brand} aria-label={`${brandName} home`}>
              <span className={styles.brandMark} aria-hidden="true">
                <span className={styles.brandChevronLeft} />
                <span className={styles.brandChevronRight} />
              </span>
              <span className={styles.brandWord}>{brandName}</span>
            </Link>
            <p className={styles.tagline}>
              Quality used cars, honestly sold. Workshop-checked, HPI-clear,
              delivered nationwide.
            </p>
            <address className={styles.address}>
              {contact.showroomAddress || 'Reading, Berkshire'}
            </address>
            <div className={styles.contactRow}>
              {contact.phoneDisplay ? (
                <a className={styles.contactPill} href={contact.phoneTel ? `tel:${contact.phoneTel}` : '#'}>
                  Call {contact.phoneDisplay}
                </a>
              ) : null}
              {contact.whatsappUrl ? (
                <a className={styles.contactPill} href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              ) : null}
            </div>
          </div>

          <nav aria-label="Shop" className={styles.linksCol}>
            <h3 className={styles.colHeading}>Shop</h3>
            <ul className={styles.linkList}>
              {SHOP_LINKS.map((l) => (
                <li key={l.href}><Link href={l.href} className={styles.link}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Services" className={styles.linksCol}>
            <h3 className={styles.colHeading}>Services</h3>
            <ul className={styles.linkList}>
              {SERVICES_LINKS.map((l) => (
                <li key={l.href}><Link href={l.href} className={styles.link}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company" className={styles.linksCol}>
            <h3 className={styles.colHeading}>Company</h3>
            <ul className={styles.linkList}>
              {COMPANY_LINKS.map((l) => (
                <li key={l.href}><Link href={l.href} className={styles.link}>{l.label}</Link></li>
              ))}
            </ul>
          </nav>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {year} {brandName}. All rights reserved.
          </p>
          <p className={styles.attribution}>
            Site by{' '}
            <a
              href="https://carous.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attributionLink}
            >
              Carous Limited
            </a>
          </p>
          <nav aria-label="Legal" className={styles.legalNav}>
            <Link href="/privacy-policy" className={styles.legalLink}>Privacy</Link>
            <Link href="/cookie-policy" className={styles.legalLink}>Cookies</Link>
            <Link href="/contact" className={styles.legalLink}>Complaints</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
