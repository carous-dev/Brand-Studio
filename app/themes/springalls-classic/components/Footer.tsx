'use client'

import Image from 'next/image'
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'
import styles from './Footer.module.css'
import { useBrand } from '../context/BrandClientWrapper'

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'Finance', href: '/finance' },
  { label: 'Services', href: '/services' },
  { label: 'Sell My Car', href: '/sell-my-car' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Contact Us', href: '/contact-us' },
]

const SOCIAL_DEFS = [
  { label: 'Facebook', key: 'facebook', icon: Facebook },
  { label: 'Instagram', key: 'instagram', icon: Instagram },
  { label: 'Twitter', key: 'twitter', icon: Twitter },
  { label: 'LinkedIn', key: 'linkedin', icon: Linkedin }
] as const

function buildContactLines(brand: any): string[] {
  const addr = brand?.location?.address || {}
  const out: string[] = []
  const line1 = String(addr.line1 || '').trim()
  const line2 = String(addr.line2 || '').trim()
  if (line1) out.push(line2 ? `${line1}, ${line2}` : line1)
  const cityCounty = [addr.city, addr.county, addr.postcode].filter(Boolean).join(', ').trim()
  if (cityCounty) out.push(cityCounty)
  const hours = brand?.openingHours
  if (hours && typeof hours === 'object') {
    const weekday = hours.Monday || hours.monday || hours['Mon-Sat'] || hours['Mon-Fri']
    if (weekday && !/closed/i.test(weekday)) out.push(`Mon-Sat: ${weekday}`)
    const sun = hours.Sunday || hours.sunday
    if (sun && !/closed/i.test(sun)) out.push(`Sun: ${sun}`)
  }
  if (!out.length) {
    return [
      'Office 108a, Regus, 200 Brook Drive',
      'Reading, Berkshire, RG2 6UB',
      'Mon-Sat: 10:00-18:00',
      'Sun: 10:00-16:00',
      'Home delivery available'
    ]
  }
  out.push('Home delivery available')
  return out
}

export default function Footer() {
  const brand = useBrand()
  const logo = brand?.logo || '/images/springsallcarsalesltd-logo.png'
  const brandName = brand?.name || 'Springalls Car Sales Ltd'
  const city = brand?.location?.address?.city || 'Reading'
  const county = brand?.location?.address?.county || 'Berkshire'
  const asString = (v: unknown): string | null => (typeof v === 'string' && v ? v : null)
  const summary =
    asString(brand?.aboutUs?.description) ||
    asString((brand as any)?.description) ||
    `Privately sourced used vehicles, trusted service, and a transparent buying experience in ${city}${county ? `, ${county}` : ''}.`
  const contactLines = buildContactLines(brand)
  const socialLinks: Record<string, string> | undefined = (brand as any)?.socialLinks
  const socials = SOCIAL_DEFS.map((s) => ({
    ...s,
    href: (socialLinks?.[s.key] as string) || '#'
  }))
  const youtubeHref = (socialLinks?.youtube as string) || '#'
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <section className={styles.brand}>
          <div className={styles.brandMark}>
            <Image
              className={styles.brandLogo}
              src={logo}
              alt={brandName}
              width={180}
              height={54}
            />
          </div>
          <p className={styles.brandSummary}>{summary}</p>
          <div className={styles.socials}>
            {socials.map((item) => {
              const Icon = item.icon
              return (
                <a key={item.label} className={styles.socialLink} href={item.href} aria-label={item.label}>
                  <Icon size={18} strokeWidth={1.6} />
                </a>
              )
            })}
          </div>
        </section>

        <section>
          <h3 className={styles.columnTitle}>Quick Links</h3>
          <ul className={styles.linkList}>
            {QUICK_LINKS.map((item) => (
              <li key={item.label}>
                <a className={styles.linkItem} href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className={styles.columnTitle}>Contact</h3>
          <ul className={styles.contactList}>
            {contactLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className={styles.newsletter}>
          <h3 className={styles.columnTitle}>Stay Updated</h3>
          <p className={styles.newsletterText}>
            Get the latest arrivals and offers directly to your inbox.
          </p>
          <form className={styles.newsletterForm}>
            <input
              className={styles.newsletterInput}
              type="email"
              placeholder="Your email address"
              aria-label="Email address"
            />
            <button className={styles.newsletterButton} type="submit">Subscribe</button>
          </form>
          <div className={styles.findUs}>
            <strong>Find us on</strong>
            <a className={styles.findUsRow} href={youtubeHref}>
              <Youtube size={18} strokeWidth={1.6} />
              YouTube
            </a>
            <p className={styles.findUsLabel}>
              Subscribe to our channel for vehicle walk-throughs, reviews, and dealership updates.
            </p>
          </div>
        </section>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.footerBottomInner}>
          <span>© {year} {brandName}. All rights reserved.</span>
          <span>Designed by Carous Limited</span>
          <span className={styles.footerBottomLinks}>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/cookie-policy">Cookie Policy</a>
            <a href="/sitemap.xml">Sitemap</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
