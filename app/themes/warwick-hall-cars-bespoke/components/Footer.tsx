'use client'

import React, { FormEvent } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Send,
  Linkedin,
} from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Footer.module.css'

type QuickLink = { href: string; label: string }
const QUICK_LINKS: ReadonlyArray<QuickLink> = [
  { href: '/used-cars',     label: 'Buy Used Cars' },
  { href: '/part-exchange', label: 'Sell Your Car' },
  { href: '/finance',       label: 'Finance' },
  { href: '/warranty',      label: 'Warranty' },
  { href: '/delivery',      label: 'Delivery' },
  { href: '/reviews',       label: 'Reviews' },
  { href: '/contact',       label: 'Contact' },
] as const

const THEME_DEFAULT_LOGO = '/themes/warwick-hall-cars-bespoke/logo.png'

const GENERIC_DESCRIPTION =
  "Quality used cars, finance specialists and AA-backed warranties — local service with nationwide delivery."

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function buildTelHref(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return `tel:+${digits.replace(/^0/, '44')}`
}

type HoursRow = { label: string; hours: string; isToday: boolean }

// Build a structured opening-hours table from brand.openingHours.
// Brandstudio records vary in shape — handle both the compressed
// (monFri/saturday/sunday) and per-day (monday/tuesday/…) variants.
// `isToday` highlights the current day's row in the rendered table.
function buildHoursRows(hours: unknown): HoursRow[] {
  if (!hours || typeof hours !== 'object') return []
  const h = hours as Record<string, unknown>
  const dayIdx = new Date().getDay() // 0 Sun … 6 Sat
  const rows: HoursRow[] = []

  const monFri = readString(h.monFri) || readString(h.weekdays) || readString(h.monToFri)
  const saturday = readString(h.saturday) || readString(h.sat)
  const sunday = readString(h.sunday) || readString(h.sun)

  if (monFri || saturday || sunday) {
    if (monFri) {
      rows.push({
        label: 'Mon – Fri',
        hours: monFri,
        isToday: dayIdx >= 1 && dayIdx <= 5,
      })
    }
    if (saturday) {
      rows.push({ label: 'Saturday', hours: saturday, isToday: dayIdx === 6 })
    }
    if (sunday) {
      rows.push({ label: 'Sunday', hours: sunday, isToday: dayIdx === 0 })
    }
    return rows
  }

  // Per-day shape fallback (monday / tuesday / …).
  const days: Array<{ key: string; label: string; idx: number }> = [
    { key: 'monday',    label: 'Monday',    idx: 1 },
    { key: 'tuesday',   label: 'Tuesday',   idx: 2 },
    { key: 'wednesday', label: 'Wednesday', idx: 3 },
    { key: 'thursday',  label: 'Thursday',  idx: 4 },
    { key: 'friday',    label: 'Friday',    idx: 5 },
    { key: 'saturday',  label: 'Saturday',  idx: 6 },
    { key: 'sunday',    label: 'Sunday',    idx: 0 },
  ]
  for (const d of days) {
    const value = readString(h[d.key])
    if (value) rows.push({ label: d.label, hours: value, isToday: dayIdx === d.idx })
  }
  return rows
}

export default function Footer() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)

  const brandName  = readString(brand?.name) || 'Warwick Hall Cars'
  const logoSrc    = readString((brand as any)?.logo) || THEME_DEFAULT_LOGO
  const description =
    readString((brand as any)?.tagline) ||
    readString((brand as any)?.description) ||
    GENERIC_DESCRIPTION

  const address = contact.showroomAddress
  const email   = contact.email
  const primaryPhoneDisplay = contact.phoneDisplay
  const primaryPhoneTel     = contact.phoneTel

  // Optional secondary phone — same field-shape tolerance as the Header.
  const locationAny = (brand?.location || {}) as Record<string, unknown>
  const secondaryPhoneRaw = readString(
    locationAny.altPhone ||
    locationAny.phone2 ||
    locationAny.phoneSecondary,
  )
  const secondaryPhoneTel = buildTelHref(secondaryPhoneRaw)

  const social = ((brand as any)?.socialLinks || {}) as Record<string, string>
  const socialEntries = [
    { Icon: Facebook,  label: 'Facebook',  url: readString(social.facebook) },
    { Icon: Instagram, label: 'Instagram', url: readString(social.instagram) },
    { Icon: Twitter,   label: 'Twitter',   url: readString(social.twitter) || readString(social.x) },
    { Icon: Youtube,   label: 'YouTube',   url: readString(social.youtube) },
    { Icon: Linkedin,  label: 'LinkedIn',  url: readString(social.linkedin) },
  ].filter(s => s.url)

  const hoursRows = buildHoursRows((brand as any)?.openingHours)
  const year = new Date().getFullYear()

  function handleNewsletter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const submittedEmail = data.get('email')
    if (submittedEmail) {
      // Placeholder feedback until the lead pipeline picks it up.
      // eslint-disable-next-line no-alert
      alert(`Thanks — ${submittedEmail}`)
      form.reset()
    }
  }

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.inner}>
          {/* Column 1 — brand identity + contact */}
          <div className={styles.colBrand}>
            <Link href="/" className={styles.brandLink} aria-label={`${brandName} — home`}>
              <img
                src={logoSrc}
                alt={brandName}
                className={styles.brandLogo}
                width={230}
                height={64}
              />
            </Link>
            <p className={styles.brandDesc}>{description}</p>
            <ul className={styles.contactList}>
              {address && (
                <li>
                  <span className={styles.icoChip} aria-hidden="true"><MapPin size={16} /></span>
                  <span>{address}</span>
                </li>
              )}
              {primaryPhoneDisplay && (
                <li>
                  <span className={styles.icoChip} aria-hidden="true"><Phone size={16} /></span>
                  <span>
                    <a href={primaryPhoneTel || '#'}>{primaryPhoneDisplay}</a>
                    {secondaryPhoneRaw && (
                      <>
                        {' / '}
                        <a href={secondaryPhoneTel}>{secondaryPhoneRaw}</a>
                      </>
                    )}
                  </span>
                </li>
              )}
              {email && (
                <li>
                  <span className={styles.icoChip} aria-hidden="true"><Mail size={16} /></span>
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              )}
            </ul>
          </div>

          {/* Column 2 — quick links + sell CTA */}
          <div className={styles.colLinks}>
            <h4 className={styles.colHeading}>Quick Links</h4>
            <ul className={styles.linksList}>
              {QUICK_LINKS.map(link => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
            <Link href="/part-exchange" className={styles.sellBtn}>
              Sell Your Car
            </Link>
          </div>

          {/* Column 3 — newsletter, socials, hours */}
          <div className={styles.colNews}>
            <h4 className={styles.colHeading}>Newsletter</h4>
            <p className={styles.newsLead}>
              Subscribe for the latest stock arrivals and offers.
            </p>
            <form
              className={styles.newsForm}
              onSubmit={handleNewsletter}
              aria-label="Subscribe to newsletter"
            >
              <label htmlFor="warwick-footer-email" className={styles.srOnly}>
                Email address
              </label>
              <div className={styles.newsInputWrap}>
                <input
                  id="warwick-footer-email"
                  name="email"
                  type="email"
                  placeholder="Your email address"
                  required
                  aria-required="true"
                  className={styles.newsInput}
                />
                <button
                  type="submit"
                  className={styles.newsBtn}
                  aria-label="Subscribe"
                >
                  <Send size={16} aria-hidden="true" />
                </button>
              </div>
            </form>

            {hoursRows.length > 0 && (
              <>
                <h5 className={styles.followTitle}>Opening Hours</h5>
                <dl className={styles.hoursTable}>
                  {hoursRows.map(row => (
                    <div
                      key={row.label}
                      className={`${styles.hoursRow} ${row.isToday ? styles.hoursRowToday : ''}`}
                    >
                      <dt className={styles.hoursLabel}>
                        <span>{row.label}</span>
                        {row.isToday && (
                          <span className={styles.todayBadge} aria-label="Today">
                            Today
                          </span>
                        )}
                      </dt>
                      <dd className={styles.hoursValue}>{row.hours}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {socialEntries.length > 0 && (
              <>
                <h5 className={styles.followTitle}>Follow Us</h5>
                <div className={styles.socialRow}>
                  {socialEntries.map(({ Icon, label, url }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialIco}
                      aria-label={label}
                    >
                      <Icon size={15} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </footer>

      <div className={styles.legalStrip}>
        <div className={styles.legalInner}>
          <div className={styles.copyright}>
            © {year} {brandName}. All rights reserved.
          </div>
          <nav className={styles.legalLinks} aria-label="Legal">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/cookie-policy">Cookie Policy</Link>
            <a href="/sitemap.xml">Sitemap</a>
          </nav>
          <div className={styles.built}>
            Site by{' '}
            <a
              href="https://carous.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.carousLink}
            >
              Carous Limited
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
