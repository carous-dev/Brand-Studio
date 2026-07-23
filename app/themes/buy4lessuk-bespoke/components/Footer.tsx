'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import type { WorkingPeriod } from '@/app/lib/working-status'
import BrandLogo from './BrandLogo'
import styles from './Footer.module.css'

const FALLBACK_PERIODS: WorkingPeriod[] = [
  { day: 'mon', from: '09:00', to: '17:00' },
  { day: 'tue', from: '09:00', to: '17:00' },
  { day: 'wed', from: '09:00', to: '17:00' },
  { day: 'thu', from: '09:00', to: '17:00' },
  { day: 'fri', from: '09:00', to: '17:00' },
  { day: 'sat', from: '08:30', to: '17:00' },
]

const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

const QUICK_LINKS = [
  { label: 'Inventory', href: '/used-cars' },
  { label: 'Financing', href: '/finance' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'Part Exchange', href: '/part-exchange' },
  { label: 'Services', href: '/services' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

export default function Footer() {
  const brand = useBrand()
  const name = (brand?.name || 'Buy4Less UK').trim()
  const location = (brand as any)?.location || {}
  const address = (location.address || {}) as Record<string, string | undefined>
  const phone = String(location.phone || '').trim()
  const phoneTel = phone.replace(/[^\d+]/g, '')
  const email = String(location.email || '').trim()
  const vat = String((brand as any)?.vatNumber || (brand as any)?.legalNumber || '').trim()
  const social = (brand as any)?.socialLinks || {}
  const today = new Date().toLocaleString('en-GB', { weekday: 'long' })
  const year = new Date().getFullYear()

  const workingConfig = useMemo(() => {
    const raw = (brand as any)?.openingHours
    const periods: WorkingPeriod[] = Array.isArray(raw?.periods) && raw.periods.length > 0
      ? raw.periods
      : FALLBACK_PERIODS
    return { periods, timezone: raw?.timezone || 'Europe/London' }
  }, [brand])
  const { isOnline } = useWorkingHours(workingConfig)

  const addressLines = [
    address.line1 || address.street || (location as any).line1,
    address.line2 || (location as any).line2,
    [address.city || (location as any).city, address.postcode || (location as any).postcode]
      .filter(Boolean).join(', '),
  ].filter((v): v is string => typeof v === 'string' && v.trim().length > 0)

  const socials = [
    { key: 'facebook', href: social.facebook, label: 'Facebook', Icon: Facebook },
    { key: 'instagram', href: social.instagram, label: 'Instagram', Icon: Instagram },
    { key: 'twitter', href: social.twitter, label: 'Twitter / X', Icon: Twitter },
    { key: 'youtube', href: social.youtube, label: 'YouTube', Icon: Youtube },
  ]

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.col}>
          <Link href="/" aria-label={name} className={styles.brandRow}>
            <BrandLogo variant="footer" />
          </Link>
          <p className={styles.blurb}>
            We&apos;re more than a dealership. We&apos;re your automotive
            partner for life.
          </p>
          <div className={styles.socials}>
            {socials.map(({ key, href, label, Icon }) =>
              typeof href === 'string' && href.trim() ? (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={styles.social}
                >
                  <Icon size={15} strokeWidth={2} aria-hidden />
                </a>
              ) : (
                <span key={key} aria-hidden="true" className={styles.social}>
                  <Icon size={15} strokeWidth={2} aria-hidden />
                </span>
              )
            )}
          </div>
        </div>

        <div className={styles.col}>
          <h3 className={styles.heading}>Quick Links</h3>
          <ul className={styles.linkList}>
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h3 className={styles.heading}>Contact Us</h3>
          <p className={styles.companyName}>{name}</p>
          {phone ? (
            <a href={`tel:${phoneTel}`} className={styles.contactLink}>
              <Phone size={14} strokeWidth={2.2} aria-hidden /> {phone}
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className={styles.contactLink}>
              <Mail size={14} strokeWidth={2.2} aria-hidden /> {email}
            </a>
          ) : null}
          {addressLines.length > 0 ? (
            <address className={styles.address}>
              <MapPin size={14} strokeWidth={2.2} aria-hidden />
              <span>{addressLines.join(', ')}</span>
            </address>
          ) : null}
          {vat ? <p className={styles.vat}>VAT Number: {vat}</p> : null}
        </div>

        <div className={styles.col}>
          <h3 className={styles.heading}>
            <span>Hours</span>
            <span className={`${styles.status} ${isOnline ? styles.statusOpen : ''}`}>
              <Clock size={12} strokeWidth={2.4} aria-hidden />
              {isOnline ? 'Open now' : 'Closed'}
            </span>
          </h3>
          <dl className={styles.hours}>
            {workingConfig.periods.map((period) => {
              const isToday = DAY_LABELS[period.day] === today
              return (
                <div key={period.day} className={`${styles.hoursRow} ${isToday ? styles.hoursRowActive : ''}`}>
                  <dt>{DAY_LABELS[period.day] || period.day}</dt>
                  <dd>{period.from} – {period.to}</dd>
                </div>
              )
            })}
            {!workingConfig.periods.some((p) => p.day === 'sun') ? (
              <div className={styles.hoursRow}>
                <dt>Sunday</dt>
                <dd>Closed</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      <div className={styles.legal}>
        <span>© {year} All Rights Reserved. Designed by Carous</span>
        <nav aria-label="Legal" className={styles.legalNav}>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/cookie-policy">Cookie Policy</Link>
          <Link href="/sitemap.xml">Sitemap</Link>
        </nav>
      </div>
    </footer>
  )
}
