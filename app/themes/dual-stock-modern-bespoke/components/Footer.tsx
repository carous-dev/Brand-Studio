'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Footer.module.css'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy policy', href: '/privacy-policy' },
  { label: 'Cookie policy', href: '/cookie-policy' },
]

const STOCK_LINKS = [
  { label: 'All stock', href: '/used-cars' },
  { label: 'Used cars', href: '/used-cars?type=car' },
  { label: 'Used bikes', href: '/used-cars?type=bike' },
  { label: 'Compare', href: '/compare' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Recently sold', href: '/recently-sold' },
]

const SERVICE_LINKS = [
  { label: 'Vehicle finance', href: '/finance' },
  { label: 'Part exchange', href: '/part-exchange' },
  { label: 'Sell your car', href: '/sell-my-car' },
  { label: 'Services', href: '/services' },
]

const SOCIAL_LINKS = ['facebook', 'x', 'youtube', 'instagram'] as const

export default function Footer() {
  const brand = useBrand()
  const brandName = brand?.name || 'Dual Stock Dealer'
  const logoSrc = (brand as any)?.logo as string | undefined
  const contact = getBrandContactInfo(brand)
  const year = new Date().getFullYear()
  const socials = ((brand as any)?.socialLinks || {}) as Record<string, string>

  const tagline = (brand as any)?.tagline as string | undefined
  const address = (brand as any)?.location?.address as Record<string, string> | undefined
  const cityish = address?.city || address?.county || ''
  const footerEyebrow = cityish ? `${cityish} · Quality stock` : 'Bikes & Cars'
  const footerTitle = tagline || 'Two stocks, one trusted dealer.'
  const footerLead = (brand as any)?.aboutUs?.description
    || 'Finance, part-exchange and nationwide delivery — straight to your door.'

  return (
    <footer className={styles.footer} aria-label="Site footer">
      <div className={styles.upperBand}>
        <div className={styles.upperInner}>
          <span className={styles.upperEyebrow}>{footerEyebrow}</span>
          <h2 className={styles.upperTitle}>{footerTitle}</h2>
          <p className={styles.upperLead}>{footerLead}</p>
          <div className={styles.upperCtas}>
            <Link href="/used-cars" className="dual-btn dual-btn--primary">Browse stock</Link>
            <Link href="/sell-my-car" className="dual-btn dual-btn--ghost">Sell yours</Link>
          </div>
        </div>
      </div>

      <div className={styles.mega}>
        <div className={styles.megaInner}>
          <section className={styles.col}>
            <h3 className={styles.colTitle}>
              {logoSrc ? (
                <Image
                  src={logoSrc}
                  alt={brandName}
                  width={120}
                  height={56}
                  className={styles.footerLogo}
                />
              ) : (
                <span className={styles.brandMark}>
                  {(brandName?.[0] || 'D').toUpperCase()}
                </span>
              )}
              {!logoSrc && brandName}
            </h3>
            <p className={styles.colBody}>
              UK independent dealer for cars and motorcycles. FCA-regulated finance, full warranty, AA-inspected stock.
            </p>
            {contact.showroomAddress && (
              <address className={styles.address}>{contact.showroomAddress}</address>
            )}
            <ul className={styles.socials} aria-label="Social links">
              {SOCIAL_LINKS.map((s) => {
                // X profiles may still be stored under the legacy `twitter` key
                // in older brand records — fall back so the link still renders.
                const url = s === 'x' ? (socials.x || socials.twitter) : socials[s]
                const labelName = s === 'x' ? 'X (Twitter)' : s
                return (
                  <li key={s}>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${brandName} on ${labelName}`}>
                        <SocialIcon name={s} />
                      </a>
                    ) : (
                      <span className={styles.socialDisabled} aria-hidden="true">
                        <SocialIcon name={s} />
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>

          <section className={styles.col}>
            <h3 className={styles.colTitle}>Stock</h3>
            <ul className={styles.linkList}>
              {STOCK_LINKS.map((l) => (
                <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </section>

          <section className={styles.col}>
            <h3 className={styles.colTitle}>Services</h3>
            <ul className={styles.linkList}>
              {SERVICE_LINKS.map((l) => (
                <li key={l.label}><Link href={l.href}>{l.label}</Link></li>
              ))}
            </ul>
          </section>

          <section className={styles.col}>
            <h3 className={styles.colTitle}>Get in touch</h3>
            <ul className={styles.contactList}>
              {contact.phoneTel && (
                <li>
                  <a href={`tel:${contact.phoneTel}`}>
                    <ContactIcon name="phone" /> {contact.phoneDisplay || contact.phoneTel}
                  </a>
                </li>
              )}
              {contact.email && (
                <li>
                  <a href={`mailto:${contact.email}`}>
                    <ContactIcon name="mail" /> {contact.email}
                  </a>
                </li>
              )}
              {contact.whatsappUrl && (
                <li>
                  <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <ContactIcon name="wa" /> WhatsApp us
                  </a>
                </li>
              )}
            </ul>
            <Link href="/contact" className={`dual-btn dual-btn--outline ${styles.contactCta}`}>
              Contact options
            </Link>
          </section>
        </div>
      </div>

      <div className={styles.legal}>
        <div className={styles.legalInner}>
          <span>© {year} {brandName}. All rights reserved.</span>
          <nav aria-label="Footer legal" className={styles.legalNav}>
            {QUICK_LINKS.map((l) => (
              <Link key={l.label} href={l.href}>{l.label}</Link>
            ))}
          </nav>
          <span className={styles.carousCredit}>
            Site by <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">Carous Limited</a>
          </span>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ name }: { name: string }) {
  const common = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true as const }
  if (name === 'facebook') {
    return (
      <svg {...common}>
        <path d="M22 12a10 10 0 1 0-11.6 9.87v-7H8v-2.87h2.4V9.8c0-2.36 1.4-3.66 3.55-3.66 1.03 0 2.1.18 2.1.18v2.31h-1.18c-1.16 0-1.52.72-1.52 1.46v1.76h2.59l-.41 2.87h-2.18v7A10 10 0 0 0 22 12z" />
      </svg>
    )
  }
  if (name === 'x') {
    // X (formerly Twitter) — official wordmark glyph
    return (
      <svg {...common}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  }
  if (name === 'youtube') {
    return (
      <svg {...common}>
        <path d="M23 7.3a3 3 0 0 0-2.1-2.1C19.06 4.8 12 4.8 12 4.8s-7.06 0-8.9.4A3 3 0 0 0 1 7.3 31 31 0 0 0 .6 12 31 31 0 0 0 1 16.7 3 3 0 0 0 3.1 18.8c1.84.4 8.9.4 8.9.4s7.06 0 8.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.4 12 31 31 0 0 0 23 7.3zM9.75 15.27V8.73L15.5 12l-5.75 3.27z" />
      </svg>
    )
  }
  if (name === 'instagram') {
    // Instagram — canonical squared camera glyph with lens + spark
    return (
      <svg {...common}>
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.86 5.86 0 0 0 1.38 2.13 5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" />
      </svg>
    )
  }
  return null
}

function ContactIcon({ name }: { name: string }) {
  if (name === 'phone') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1.05.37 2.07.7 3.06a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l2.02-1.27a2 2 0 0 1 2.11-.45c.99.33 2.01.57 3.06.7A2 2 0 0 1 22 16.92z" />
      </svg>
    )
  }
  if (name === 'mail') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    )
  }
  if (name === 'wa') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5 0-.1-.7-1.7-1-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.4 5.2 4.6 2.5 1 3 .8 3.5.8.5 0 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.5c-1.7 0-3.4-.5-4.9-1.4l-.4-.2-3.6.9.9-3.5-.2-.4c-1-1.5-1.5-3.3-1.5-5.1 0-5.4 4.4-9.8 9.8-9.8 2.6 0 5.1 1 7 2.9 1.9 1.9 2.9 4.4 2.9 7 0 5.4-4.4 9.8-9.8 9.8z" />
      </svg>
    )
  }
  return null
}
