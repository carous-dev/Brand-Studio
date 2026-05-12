'use client'

import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import BrandLogo from './BrandLogo'
import styles from './Footer.module.css'

const PILLARS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: 'Browse',
    links: [
      { label: 'Used Cars', href: '/used-cars' },
      { label: 'Recently Sold', href: '/recently-sold' },
      { label: 'Wishlist', href: '/wishlist' },
      { label: 'Compare', href: '/compare' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Finance', href: '/finance' },
      { label: 'Part Exchange', href: '/part-exchange' },
      { label: 'Sell Your Car', href: '/sell-my-car' },
      { label: 'Warranty & Delivery', href: '/services' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'Our Story', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
    ],
  },
]

const FacebookIcon = () => (<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.87v-6.98H7.9V12h2.5V9.85c0-2.47 1.47-3.84 3.72-3.84 1.08 0 2.21.2 2.21.2v2.43h-1.25c-1.23 0-1.61.76-1.61 1.55V12h2.75l-.44 2.89h-2.31V21.87A10 10 0 0 0 22 12Z"/></svg>)
const InstagramIcon = () => (<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/></svg>)
const YouTubeIcon = () => (<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M23 12s0-3.16-.4-4.67a3 3 0 0 0-2.13-2.12C18.96 4.8 12 4.8 12 4.8s-6.96 0-8.47.4A3 3 0 0 0 1.4 7.33C1 8.84 1 12 1 12s0 3.16.4 4.67a3 3 0 0 0 2.13 2.12C5.04 19.2 12 19.2 12 19.2s6.96 0 8.47-.41a3 3 0 0 0 2.13-2.12C23 15.16 23 12 23 12Zm-13.2 3V9l5.2 3-5.2 3Z"/></svg>)
const LinkedInIcon = () => (<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.4 9.4h3.16V21H3.4V9.4Zm6.18 0h3.03v1.58h.04c.42-.8 1.45-1.64 2.99-1.64 3.2 0 3.79 2.1 3.79 4.84V21H16.3v-5.4c0-1.29-.02-2.96-1.8-2.96-1.8 0-2.07 1.4-2.07 2.86V21H9.58V9.4Z"/></svg>)
const TwitterIcon = () => (<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M18.244 2H21.5l-7.39 8.45L23 22h-6.74l-5.27-6.92L4.95 22H1.7l7.91-9.04L1 2h6.91l4.76 6.3L18.24 2Zm-1.18 18h1.86L7.04 4H5.06l11.99 16Z"/></svg>)

export default function Footer() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Kain Motors'
  const year = new Date().getFullYear()
  const socials = (brand as any)?.socialLinks || {}
  const addr = brand?.location?.address || {}
  const addressLines = [
    (addr as any).line1,
    (addr as any).line2,
    [(addr as any).city, (addr as any).county].filter(Boolean).join(', '),
    (addr as any).postcode,
  ].filter(Boolean) as string[]

  return (
    <footer className={styles.footer} aria-label="Site">
      <div className={styles.topRule} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.brandColumn}>
          <BrandLogo tone="dark" height={56} showTagline />
          <p className={styles.brandLead}>
            Appointment-only used car and van showroom in Manchester. Hand-picked stock, transparent
            valuations, finance from competitive rates, and nationwide delivery.
          </p>
          <div className={styles.socialRow} aria-label="Social media">
            {([
              { key: 'facebook', Icon: FacebookIcon, fallback: 'https://facebook.com' },
              { key: 'instagram', Icon: InstagramIcon, fallback: 'https://instagram.com' },
              { key: 'youtube', Icon: YouTubeIcon, fallback: 'https://youtube.com' },
              { key: 'linkedin', Icon: LinkedInIcon, fallback: 'https://linkedin.com' },
              { key: 'twitter', Icon: TwitterIcon, fallback: 'https://x.com' },
            ] as const).map(({ key, Icon, fallback }) => {
              const brandHref = socials[key]
              const href = typeof brandHref === 'string' && brandHref.trim().length > 0 ? brandHref : fallback
              return (
                <a key={key} href={href} target="_blank" rel="noopener noreferrer" aria-label={key} className={styles.socialBtn}>
                  <Icon />
                </a>
              )
            })}
          </div>
        </div>

        {PILLARS.map((p) => (
          <nav key={p.title} className={styles.pillar} aria-label={p.title}>
            <h2 className={styles.pillarTitle}>{p.title}</h2>
            <ul>
              {p.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={styles.pillarLink}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <address className={styles.contactColumn}>
          <h2 className={styles.pillarTitle}>Visit the showroom</h2>
          <p className={styles.addressText}>
            {addressLines.length > 0 ? addressLines.map((line, i) => <span key={i}>{line}<br /></span>) : (
              <>
                <span>Midlands Street<br /></span>
                <span>Manchester, M12 6LB<br /></span>
              </>
            )}
          </p>
          {contact.phoneTel && (
            <p className={styles.contactRow}>
              <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay || contact.phoneTel}</a>
            </p>
          )}
          {contact.email && (
            <p className={styles.contactRow}>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </p>
          )}
          <p className={styles.appointmentNote}>
            By appointment only · Mon–Sat 09:30 – 17:30
          </p>
        </address>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>© {year} {brandName}. All rights reserved.</span>
          <span className={styles.attribution}>
            Site by <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">Carous Limited</a>
          </span>
          <nav className={styles.legalNav} aria-label="Legal">
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/cookie-policy">Cookies</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
