'use client'

import Link from 'next/link'
import {
  MapPin, Phone, Mail, Clock,
  Facebook, Instagram, Youtube, Linkedin,
} from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Footer.module.css'

const PRIMARY_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'Services', href: '/services' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const SERVICE_LINKS = [
  { label: 'Finance options', href: '/finance' },
  { label: 'Part exchange', href: '/part-exchange' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Compare', href: '/compare' },
]

const LEGAL_LINKS = [
  { label: 'Privacy policy', href: '/privacy-policy' },
  { label: 'Cookie policy', href: '/cookie-policy' },
]

export default function Footer() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const year = new Date().getFullYear()
  const brandName = brand?.name || 'AUTOWOW UK LTD'
  const address = contact.showroomAddress || '8 Benson Street, Barking, Essex, IG11 0YY'
  const social = brand?.socialLinks || {}
  const socialItems = [
    social.facebook && { Icon: Facebook, href: social.facebook as string, label: 'Facebook' },
    social.instagram && { Icon: Instagram, href: social.instagram as string, label: 'Instagram' },
    social.youtube && { Icon: Youtube, href: social.youtube as string, label: 'YouTube' },
    social.linkedin && { Icon: Linkedin, href: social.linkedin as string, label: 'LinkedIn' },
  ].filter(Boolean) as Array<{ Icon: any; href: string; label: string }>

  return (
    <footer className={styles.footer}>
      <div className={styles.accent} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.wordmark} aria-label={brandName}>
            {brand?.logo ? (
              <img src={brand.logo} alt={brandName} />
            ) : (
              <span>{brandName}</span>
            )}
          </Link>
          <p className={styles.tagline}>
            Quality used cars, dependable service. Family-run independent dealer in Barking, Essex —
            importing and preparing main-dealer-quality vehicles for the long haul.
          </p>

          {socialItems.length > 0 && (
            <ul className={styles.socials} aria-label="Social links">
              {socialItems.map(({ Icon, href, label }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <Icon size={16} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer primary" className={styles.linkCol}>
          <h2>Explore</h2>
          <ul>
            {PRIMARY_LINKS.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer services" className={styles.linkCol}>
          <h2>Buying tools</h2>
          <ul>
            {SERVICE_LINKS.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        <address className={styles.contactCol}>
          <h2>Visit us</h2>
          <ul>
            <li>
              <MapPin size={14} aria-hidden="true" />
              <span>{address}</span>
            </li>
            {contact.phoneTel && (
              <li>
                <Phone size={14} aria-hidden="true" />
                <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a>
              </li>
            )}
            {contact.email && (
              <li>
                <Mail size={14} aria-hidden="true" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            )}
            <li>
              <Clock size={14} aria-hidden="true" />
              <span>Mon&ndash;Sat 09:00&ndash;18:00 · Sun closed</span>
            </li>
          </ul>
        </address>
      </div>

      <div className={styles.bottomBar}>
        <p>&copy; {year} {brandName}. All rights reserved.</p>
        <p className={styles.carousCredit}>
          Site by{' '}
          <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">
            Carous Limited
          </a>
        </p>
        <nav aria-label="Footer legal" className={styles.legalNav}>
          {LEGAL_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
