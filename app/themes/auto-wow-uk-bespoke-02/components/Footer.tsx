'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { Facebook, Instagram, Linkedin, Youtube, Phone, Mail, MapPin } from 'lucide-react'
import styles from './Footer.module.css'

const SOCIALS: Array<{ key: string; label: string; Icon: typeof Facebook }> = [
  { key: 'facebook', label: 'Facebook', Icon: Facebook },
  { key: 'instagram', label: 'Instagram', Icon: Instagram },
  { key: 'youtube', label: 'YouTube', Icon: Youtube },
  { key: 'linkedin', label: 'LinkedIn', Icon: Linkedin },
]

export default function Footer() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Autowow'
  const year = new Date().getFullYear()
  const address = (brand as any)?.location?.address || {}
  const socials: Record<string, string | undefined> = ((brand as any)?.socialLinks) || {}
  const hasLogo = Boolean((brand as any)?.logo)

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.lead}>
          <Link href="/" className={styles.brand}>
            {hasLogo ? (
              <img src={(brand as any).logo} alt={brandName} className={styles.brandLogo} />
            ) : (
              <span className={styles.brandWordmark}>{brandName.toUpperCase()}</span>
            )}
          </Link>
          <p className={styles.tagline}>
            Independent. Honest. Ready. Used cars sold straight from the showroom floor.
          </p>
          <div className={styles.socials} aria-label="Social media">
            {SOCIALS.map(({ key, label, Icon }) => {
              const url = (socials[key] || '').trim()
              if (url) {
                return (
                  <a
                    key={`f-${key}`}
                    href={url}
                    className={styles.socialLink}
                    aria-label={`${label} (opens in new tab)`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={16} strokeWidth={2} />
                  </a>
                )
              }
              return (
                <span
                  key={`f-${key}`}
                  className={styles.socialLink}
                  aria-label={`${label} — coming soon`}
                  role="presentation"
                >
                  <Icon size={16} strokeWidth={2} />
                </span>
              )
            })}
          </div>
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
            <span className={styles.addressRow}>
              <MapPin size={14} strokeWidth={2} />
              <span>
                {[address.line1, address.line2, address.city, address.county, address.postcode]
                  .filter(Boolean)
                  .join(', ') || 'Contact the showroom for our address'}
              </span>
            </span>
            {contact.phoneTel ? (
              <a href={`tel:${contact.phoneTel}`} className={styles.addressRow}>
                <Phone size={14} strokeWidth={2} />
                <span>{contact.phoneDisplay}</span>
              </a>
            ) : null}
            {contact.email ? (
              <a href={`mailto:${contact.email}`} className={styles.addressRow}>
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
