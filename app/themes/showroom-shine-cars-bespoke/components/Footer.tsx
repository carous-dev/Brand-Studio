'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Linkedin, ArrowUpRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import BrandLogo from './BrandLogo'
import styles from './Footer.module.css'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'Services', href: '/services' },
  { label: 'Finance', href: '/finance' },
  { label: 'Part Exchange', href: '/part-exchange' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const SERVICE_LINKS = [
  { label: 'Car Sales', href: '/services' },
  { label: 'Finance Options', href: '/finance' },
  { label: 'Part Exchange', href: '/part-exchange' },
  { label: 'After-Sales Support', href: '/services' },
  { label: 'Vehicle Inspection', href: '/services' },
  { label: 'Delivery Service', href: '/services' },
]

const SOCIAL_LINKS = [
  { key: 'facebook', icon: Facebook, label: 'Facebook' },
  { key: 'instagram', icon: Instagram, label: 'Instagram' },
  { key: 'youtube', icon: Youtube, label: 'YouTube' },
  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
] as const

function openingHoursSummary(hours: unknown): string {
  if (!hours || typeof hours !== 'object') return 'Contact us for opening hours'
  const entries = Object.entries(hours as Record<string, unknown>)
    .map(([day, value]) => `${day}: ${String(value || '').trim()}`)
    .filter((line) => !line.endsWith(':'))
  return entries.slice(0, 2).join(', ') || 'Contact us for opening hours'
}

export default function Footer() {
  const brand = useBrand()
  const brandName = brand?.name || 'this dealership'
  const contact = getBrandContactInfo(brand)
  const socials: Record<string, string> = (brand as any)?.socialLinks || {}
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.stripeAccent} aria-hidden />
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brandLink} aria-label={brandName}>
            <BrandLogo variant="footer" />
          </Link>
          <p className={styles.brandBlurb}>
            Quality used vehicles from {brandName}, with clear vehicle information, finance
            support, part exchange guidance and helpful after-sales contact.
          </p>
          <div className={styles.brandStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>Live</span>
              <span className={styles.statLabel}>Stock</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>Fast</span>
              <span className={styles.statLabel}>Enquiries</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>Clear</span>
              <span className={styles.statLabel}>Support</span>
            </div>
          </div>
        </div>

        <nav aria-label="Site links" className={styles.linkCol}>
          <h3 className={styles.colTitle}>Quick Links</h3>
          <ul className={styles.linkList}>
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Services" className={styles.linkCol}>
          <h3 className={styles.colTitle}>Our Services</h3>
          <ul className={styles.linkList}>
            {SERVICE_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.contactCol}>
          <h3 className={styles.colTitle}>Contact</h3>
          <address className={styles.address}>
            {contact.showroomAddress ? (
              <div className={styles.contactRow}>
                <MapPin size={16} strokeWidth={2} aria-hidden />
                <span>{contact.showroomAddress}</span>
              </div>
            ) : null}
            {contact.phoneDisplay ? (
              <div className={styles.contactRow}>
                <Phone size={16} strokeWidth={2} aria-hidden />
                <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a>
              </div>
            ) : null}
            {contact.email ? (
              <div className={styles.contactRow}>
                <Mail size={16} strokeWidth={2} aria-hidden />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
            ) : null}
            <div className={styles.contactRow}>
              <Clock size={16} strokeWidth={2} aria-hidden />
              <span>{openingHoursSummary((brand as any)?.openingHours)}</span>
            </div>
            {contact.whatsappUrl ? (
              <div className={styles.contactRow}>
                <WhatsAppIcon size={16} aria-hidden />
                <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a>
              </div>
            ) : null}
          </address>

          <div className={styles.socials} aria-label="Social media">
            {SOCIAL_LINKS.map(({ key, icon: Icon, label }) => {
              const url = socials[key]
              return url ? (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={label}
                >
                  <Icon size={16} strokeWidth={2} />
                </a>
              ) : (
                <span
                  key={key}
                  className={`${styles.socialLink} ${styles.socialLinkDisabled}`}
                  aria-hidden
                >
                  <Icon size={16} strokeWidth={2} />
                </span>
              )
            })}
          </div>

          <a href="/used-cars" className={styles.browseFooterCta}>
            Browse our stock
            <ArrowUpRight size={16} strokeWidth={2.4} aria-hidden />
          </a>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span className={styles.copyright}>Copyright {year} {brandName}. All rights reserved.</span>
          <span className={styles.attribution}>
            Site by{' '}
            <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">Carous Limited</a>
          </span>
          <nav aria-label="Legal" className={styles.legalNav}>
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/cookie-policy">Cookie Policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
