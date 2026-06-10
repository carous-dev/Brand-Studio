'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { resolveText } from '../lib/brand-text'
import styles from './Footer.module.css'

const quickLinks: Array<[string, string]> = [
  ['Buy Used Cars', '/used-cars'],
  ['Sell Your Car', '/sell-my-car'],
  ['Loan Calculator', '/finance'],
  ['FAQs', '/faqs'],
  ['About Us', '/about'],
  ['Contact', '/contact'],
]

const bottomLinks: Array<[string, string]> = [
  ['Privacy Policy', '/privacy-policy'],
  ['Terms & Conditions', '/privacy-policy'],
  ['Cookie Policy', '/cookie-policy'],
]

export default function Footer() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'FBM Motors'
  const tokens = brandName.trim().split(/\s+/)
  const wordmarkLead = tokens[0] || brandName
  const wordmarkTrail = tokens.slice(1).join(' ')
  const logo = brand?.logo

  const brandLead = resolveText(brand, 'footerBrandLead')
  const newsletterTitle = resolveText(brand, 'footerNewsletterTitle')
  const newsletterLead = resolveText(brand, 'footerNewsletterLead')
  const openingHours = resolveText(brand, 'footerOpeningHours')
  const copyright = resolveText(brand, 'footerCopyright')

  const address = (brand?.location?.address || {}) as Record<string, string | undefined>
  const fullAddress = (brand?.location as any)?.fullAddress

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.column}>
          {logo ? (
            <Image src={logo} alt={brandName} width={200} height={48} className={styles.brandLogo} />
          ) : (
            <p className={styles.brand}>
              {wordmarkLead}
              {wordmarkTrail && (
                <span style={{ color: 'var(--fbm-ember-500, var(--color-primary))' }}> {wordmarkTrail}</span>
              )}
            </p>
          )}
          {brandLead && <p className={styles.brandLead}>{brandLead}</p>}

          <address className={styles.address}>
            {fullAddress ? (
              <p>{fullAddress}</p>
            ) : (
              <>
                {address.line1 && <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>}
                {(address.city || address.county || address.postcode) && (
                  <p>{[address.city, address.county, address.postcode].filter(Boolean).join(', ')}</p>
                )}
              </>
            )}
            {contact.phoneDisplay && (
              <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className={styles.addressPhone}>
                {contact.phoneDisplay}
              </a>
            )}
            {contact.email && (
              <a href={`mailto:${contact.email}`} className={styles.addressEmail}>
                {contact.email}
              </a>
            )}
          </address>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnHeading}>Quick links</h3>
          <ul className={styles.quickLinks}>
            {quickLinks.map(([label, href]) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
          <Link href="/sell-my-car" className={`fbm-btn-primary ${styles.sellCta}`}>
            Sell your car
          </Link>
        </div>

        <div className={styles.column}>
          <h3 className={styles.columnHeading}>{newsletterTitle}</h3>
          {newsletterLead && <p className={styles.newsletterLead}>{newsletterLead}</p>}
          <form className={styles.newsletterRow} onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="fbm-newsletter" className="sr-only">Email address</label>
            <input
              id="fbm-newsletter"
              type="email"
              placeholder="Your email address"
              className={styles.newsletterInput}
            />
            <button type="submit" className={`fbm-btn-primary ${styles.newsletterSubmit}`} aria-label="Subscribe">
              →
            </button>
          </form>
          {openingHours && <p className={styles.hours}>{openingHours}</p>}
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomInner}>
          <p>{copyright}</p>
          <div className={styles.bottomLinks}>
            {bottomLinks.map(([label, href]) => (
              <Link key={label} href={href} className={styles.bottomLink}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
