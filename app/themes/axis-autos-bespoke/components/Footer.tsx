'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Footer.module.css'

/**
 * Minimalist footer — 4-column grid on desktop, stacked on mobile. Hairline
 * dividers, no decorative density. Brand block left, quick links + service
 * links centre, contact + opening hours right. Bottom strip is a hairline
 * separator + copyright + policy links.
 */
export default function Footer() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Axis Autos'
  const year = new Date().getFullYear()

  const address = (brand as any)?.location?.address || {}
  const addressLine = [
    address.street,
    address.city,
    address.county,
    address.postcode,
  ].filter(Boolean).join(', ')

  const hours = (brand as any)?.openingHours || []
  const social = (brand as any)?.socialLinks || {}

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.shell}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brandLink} aria-label={brandName}>
              <img
                src={(brand as any)?.logo || '/themes/axis-autos-bespoke/logo.png'}
                alt={brandName}
                className={styles.brandLogo}
                onError={(e) => {
                  const img = e.currentTarget
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = '1'
                    img.src = '/themes/axis-autos-bespoke/logo.png'
                  } else {
                    img.style.display = 'none'
                  }
                }}
              />
            </Link>
            <p className={styles.brandTagline}>
              Independent used-car specialists serving {address.city || 'the local area'} and beyond.
              Honest pricing, every vehicle inspected, finance options for every budget.
            </p>
            <div className={styles.socials}>
              {social.facebook ? (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook size={18} strokeWidth={1.6} /></a>
              ) : <span aria-hidden="true" className={styles.socialPlaceholder}><Facebook size={18} strokeWidth={1.6} /></span>}
              {social.instagram ? (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={18} strokeWidth={1.6} /></a>
              ) : <span aria-hidden="true" className={styles.socialPlaceholder}><Instagram size={18} strokeWidth={1.6} /></span>}
              {social.twitter ? (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X"><Twitter size={18} strokeWidth={1.6} /></a>
              ) : <span aria-hidden="true" className={styles.socialPlaceholder}><Twitter size={18} strokeWidth={1.6} /></span>}
              {social.youtube ? (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"><Youtube size={18} strokeWidth={1.6} /></a>
              ) : <span aria-hidden="true" className={styles.socialPlaceholder}><Youtube size={18} strokeWidth={1.6} /></span>}
            </div>
          </div>

          <div>
            <h4 className={styles.colTitle}>Browse</h4>
            <ul className={styles.linkList}>
              <li><Link href="/used-cars">All stock</Link></li>
              <li><Link href="/recently-sold">Recently sold</Link></li>
              <li><Link href="/wishlist">Wishlist</Link></li>
              <li><Link href="/compare">Compare</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Services</h4>
            <ul className={styles.linkList}>
              <li><Link href="/services">All services</Link></li>
              <li><Link href="/finance">Car finance</Link></li>
              <li><Link href="/part-exchange">Part-exchange</Link></li>
              <li><Link href="/sell-my-car">Sell your car</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Visit us</h4>
            <address className={styles.contact}>
              {addressLine ? (
                <a href="/contact" className={styles.contactRow}>
                  <MapPin size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span>{addressLine}</span>
                </a>
              ) : null}
              {contact.phoneTel ? (
                <a href={`tel:${contact.phoneTel}`} className={styles.contactRow}>
                  <Phone size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span>{contact.phoneDisplay}</span>
                </a>
              ) : null}
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className={styles.contactRow}>
                  <Mail size={16} strokeWidth={1.6} aria-hidden="true" />
                  <span>{contact.email}</span>
                </a>
              ) : null}
            </address>
            {hours.length > 0 ? (
              <dl className={styles.hours}>
                {hours.slice(0, 7).map((h: any, i: number) => (
                  <div key={i} className={styles.hoursRow}>
                    <dt>{h?.day || '—'}</dt>
                    <dd>{h?.closed ? 'Closed' : `${h?.open || '—'}–${h?.close || '—'}`}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.bottom}>
          <p className={styles.copy}>© {year} {brandName}. All rights reserved.</p>
          <nav aria-label="Legal" className={styles.legal}>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/cookie-policy">Cookies</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </nav>
          <p className={styles.designedBy}>Designed by <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">Carous</a></p>
        </div>
      </div>
    </footer>
  )
}
