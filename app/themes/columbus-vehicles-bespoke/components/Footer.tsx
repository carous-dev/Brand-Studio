'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './Footer.module.css'

/**
 * Columbus Vehicles — Footer (rugged archetype)
 * Designed fresh:
 *   - <footer> + <address> + <dl> for opening hours per Quality Bar
 *   - Dark continuation of the header dark-mode (theme stays cohesive)
 *   - 3-column grid desktop, stacked mobile
 *   - "Recently Sold" prominent in quick links
 */
export default function Footer() {
  const brand = useBrand()
  const dealerName = brand?.name || 'Columbus Vehicles'
  const tagline =
    (brand as any)?.tagline ||
    "Quality used 4×4 specialists. Ranked the UK's #1 4×4 dealer for five consecutive years."
  const phone = (brand as any)?.location?.phone || '+44 (0) 7000 000000'
  const email = (brand as any)?.location?.email || 'enquiries@columbusvehicles.uk'
  const addr = (brand as any)?.location?.address || {}
  const hours = ((brand as any)?.openingHours || {}) as Record<string, string>
  const year = new Date().getFullYear()

  const orderedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const renderHours = orderedDays
    .map((d) => ({ day: d, value: hours[d] || hours[d.toLowerCase()] || '' }))
    .filter((h) => h.value)

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <section className={styles.brandSection}>
          <p className={styles.eyebrow}>UK&apos;s #1 4×4 specialist</p>
          <h2 className={styles.brandName}>{dealerName}</h2>
          <p className={styles.brandSummary}>{tagline}</p>
        </section>

        <section className={styles.linkSection} aria-labelledby="footer-explore">
          <h3 id="footer-explore" className={styles.columnTitle}>Explore</h3>
          <ul className={styles.linkList}>
            <li><Link href="/used-cars">Inventory</Link></li>
            <li><Link href="/recently-sold">Recently sold</Link></li>
            <li><Link href="/finance">Financing</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/sell-your-car">Sell your 4×4</Link></li>
            <li><Link href="/part-exchange">Part exchange</Link></li>
            <li><Link href="/contact">Contact us</Link></li>
          </ul>
        </section>

        <section className={styles.contactSection} aria-labelledby="footer-contact">
          <h3 id="footer-contact" className={styles.columnTitle}>Contact</h3>
          <address className={styles.address}>
            {addr.line1 ? <span>{addr.line1}</span> : null}
            {addr.line2 ? <span>{addr.line2}</span> : null}
            {(addr.city || addr.county || addr.postcode)
              ? <span>{[addr.city, addr.county, addr.postcode].filter(Boolean).join(', ')}</span>
              : <span>Showroom location available on request</span>}
            <a href={`tel:${phone.replace(/\s+/g, '')}`} className={styles.contactLink}>{phone}</a>
            <a href={`mailto:${email}`} className={styles.contactLink}>{email}</a>
          </address>
        </section>

        {renderHours.length > 0 ? (
          <section className={styles.hoursSection} aria-labelledby="footer-hours">
            <h3 id="footer-hours" className={styles.columnTitle}>Opening hours</h3>
            <dl className={styles.hoursList}>
              {renderHours.map(({ day, value }) => (
                <div key={day} className={styles.hoursRow}>
                  <dt>{day}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <span>© {year} {dealerName}. All rights reserved.</span>
          <nav aria-label="Legal" className={styles.legalLinks}>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/cookie-policy">Cookies</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
