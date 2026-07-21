'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, Phone, MapPin, Clock, ChevronRight,
  Facebook, Instagram, Youtube, Linkedin,
} from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'Services', href: '/services' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

// JS getDay() order: 0 = Sunday … 6 = Saturday.
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type OpenState = {
  open: boolean
  known: boolean
  label: string   // e.g. "Open · until 18:00" / "Closed · Opens Mon 09:00"
  hoursToday: string // e.g. "Today 09:00–18:00" / "Closed today"
}

// Day tokens keyed by JS getDay() index. Names ordered longest-first so a scan
// matches the fullest token; all names are ≥3 chars to avoid false hits (e.g.
// "saturday" contains "tu" but never "tue"). 2-letter schema.org codes are
// handled separately below.
const DAY_TOKENS: Array<{ js: number; names: string[]; short2: string }> = [
  { js: 1, names: ['monday', 'mon'], short2: 'mo' },
  { js: 2, names: ['tuesday', 'tues', 'tue'], short2: 'tu' },
  { js: 3, names: ['wednesday', 'weds', 'wed'], short2: 'we' },
  { js: 4, names: ['thursday', 'thurs', 'thur', 'thu'], short2: 'th' },
  { js: 5, names: ['friday', 'fri'], short2: 'fr' },
  { js: 6, names: ['saturday', 'sat'], short2: 'sa' },
  { js: 0, names: ['sunday', 'sun'], short2: 'su' },
]
// Monday-first order used to expand ranges like "monFri" → Mon..Fri.
const MON_FIRST = [1, 2, 3, 4, 5, 6, 0]

/** Resolve a key/label like "monFri", "saturday", "Mon-Sat", "weekdays" or the
 *  schema.org "Mo" into the JS day indices it covers. */
function daysInKey(rawKey: string): number[] {
  const k = String(rawKey || '').toLowerCase().replace(/[^a-z]/g, '')
  if (!k) return []
  if (/weekday/.test(k)) return [1, 2, 3, 4, 5]
  if (/weekend/.test(k)) return [6, 0]
  if (/daily|everyday|allweek|allday/.test(k)) return [1, 2, 3, 4, 5, 6, 0]

  const found: Array<{ js: number; pos: number }> = []
  for (const token of DAY_TOKENS) {
    for (const name of token.names) {
      const pos = k.indexOf(name)
      if (pos >= 0) { found.push({ js: token.js, pos }); break }
    }
  }

  // Fall back to a 2-letter schema.org code only when nothing longer matched
  // (so "saturday" never trips the "sa"/"tu" traps).
  if (found.length === 0) {
    for (const token of DAY_TOKENS) {
      const pos = k.indexOf(token.short2)
      if (pos >= 0) found.push({ js: token.js, pos })
    }
  }

  if (found.length === 0) return []
  found.sort((a, b) => a.pos - b.pos)
  if (found.length === 1) return [found[0].js]

  // Two+ tokens → an inclusive range from the first to the last (Mon-first).
  const startMf = MON_FIRST.indexOf(found[0].js)
  const endMf = MON_FIRST.indexOf(found[found.length - 1].js)
  const out: number[] = []
  const end = endMf >= startMf ? endMf : endMf + 7
  for (let i = startMf; i <= end; i++) out.push(MON_FIRST[i % 7])
  return out
}

/** Extract open/close minutes from a value like "09:00 - 18:00", "9am - 6pm",
 *  or an object `{ open, close, closed }`. Returns null when closed/unparseable. */
function parseRange(value: unknown): { open: number; close: number } | null {
  let text = ''
  if (value && typeof value === 'object') {
    const v = value as Record<string, unknown>
    if (v.closed === true || /closed/i.test(String(v.status ?? ''))) return null
    text = `${String(v.open ?? v.from ?? v.start ?? '')} - ${String(v.close ?? v.to ?? v.end ?? '')}`
  } else {
    text = String(value ?? '')
  }
  if (!text.trim() || /closed/i.test(text)) return null

  const re = /(\d{1,2})(?::(\d{2})|\s*(am|pm))/gi
  const mins: number[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) && mins.length < 2) {
    let h = Number(m[1])
    const min = m[2] ? Number(m[2]) : 0
    const ampm = m[3]?.toLowerCase()
    if (ampm === 'pm' && h < 12) h += 12
    if (ampm === 'am' && h === 12) h = 0
    if (h > 23 || min > 59) continue
    mins.push(h * 60 + min)
  }
  if (mins.length < 2) return null
  return { open: mins[0], close: mins[1] }
}

/** Expand any supported openingHours shape into a per-day (JS index) range map. */
function buildDayMap(raw: any): Record<number, { open: number; close: number }> {
  const entries: Array<{ days: number[]; range: { open: number; close: number } }> = []
  const pushEntry = (keyStr: string, val: unknown) => {
    const days = daysInKey(keyStr)
    if (!days.length) return
    const range = parseRange(val)
    if (range) entries.push({ days, range })
  }

  if (typeof raw === 'string') {
    raw.split(/[;\n]+/).forEach((seg) => pushEntry(seg, seg))
  } else if (Array.isArray(raw)) {
    raw.forEach((item) => {
      if (typeof item === 'string') pushEntry(item, item)
      else if (item && typeof item === 'object') {
        pushEntry(String(item.day ?? item.name ?? ''), item.hours ?? item.value ?? item.time ?? item)
      }
    })
  } else if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw)) pushEntry(k, v)
  }

  // Apply multi-day spans first, then let single-day entries override them, so a
  // "saturday" override wins over a "monSat" span.
  const map: Record<number, { open: number; close: number }> = {}
  entries.filter((e) => e.days.length > 1).forEach((e) => e.days.forEach((d) => { if (map[d] === undefined) map[d] = e.range }))
  entries.filter((e) => e.days.length === 1).forEach((e) => e.days.forEach((d) => { map[d] = e.range }))
  return map
}

const fmt = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

/** True when the record only lists appointment-based hours (no clock times).
 *  Common in the preview data — must not be reported as "Closed". */
function isAppointmentOnly(raw: any): boolean {
  const blob = typeof raw === 'string' ? raw : JSON.stringify(raw ?? '')
  return /appointment/i.test(blob)
}

function getOpenState(brand: any): OpenState {
  const raw = brand?.openingHours
  const map = buildDayMap(raw)
  const known = Object.keys(map).length > 0
  const now = new Date()
  const dayIdx = now.getDay()
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const todayRange = map[dayIdx] || null

  if (!known) {
    // No parseable clock times — never advertise "Closed". Appointment-only
    // dealers get their own label; everything else falls back to a neutral one.
    return isAppointmentOnly(raw)
      ? { open: true, known: false, label: 'Open · by appointment', hoursToday: 'By appointment' }
      : { open: true, known: false, label: 'Live stock available', hoursToday: '' }
  }

  if (todayRange && nowMin >= todayRange.open && nowMin < todayRange.close) {
    return {
      open: true,
      known: true,
      label: `Open · until ${fmt(todayRange.close)}`,
      hoursToday: `Today ${fmt(todayRange.open)}–${fmt(todayRange.close)}`,
    }
  }

  // Closed right now — work out the next opening slot.
  if (todayRange && nowMin < todayRange.open) {
    return {
      open: false,
      known: true,
      label: `Closed · Opens ${fmt(todayRange.open)}`,
      hoursToday: `Today ${fmt(todayRange.open)}–${fmt(todayRange.close)}`,
    }
  }

  for (let i = 1; i <= 7; i++) {
    const next = map[(dayIdx + i) % 7]
    if (next) {
      const dayLabel = i === 1 ? 'tomorrow' : DAY_SHORT[(dayIdx + i) % 7]
      return {
        open: false,
        known: true,
        label: `Closed · Opens ${dayLabel} ${fmt(next.open)}`,
        hoursToday: 'Closed today',
      }
    }
  }

  return { open: false, known: true, label: 'Closed', hoursToday: 'Closed today' }
}

export default function Header() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const contact = getBrandContactInfo(brand)
  const city = brand?.location?.address?.city || ''
  const county = brand?.location?.address?.county || ''
  const locationLabel = [city, county].filter(Boolean).join(', ') || 'Contact us'
  const social = brand?.socialLinks || {}
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // Open/closed is time-dependent, so compute it only after mount to avoid a
  // hydration mismatch, then refresh each minute so the pill flips live as the
  // showroom opens/closes while the page is left open.
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState<OpenState>({ open: true, known: false, label: 'Live stock', hoursToday: '' })

  useEffect(() => {
    setMounted(true)
    setStatus(getOpenState(brand))
    const id = setInterval(() => setStatus(getOpenState(brand)), 60_000)
    return () => clearInterval(id)
  }, [brand])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)')
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Always render the social icon group in the canonical order; when a
  // brand.socialLinks[platform] is empty/missing we render the icon as a
  // muted, non-clickable span so the bar never looks incomplete.
  // See memory: feedback_topbar_essentials.md.
  const socialItems: Array<{ Icon: any; href: string; label: string; configured: boolean }> = [
    { Icon: Facebook, href: (social.facebook as string) || '', label: 'Facebook', configured: Boolean(social.facebook) },
    { Icon: Instagram, href: (social.instagram as string) || '', label: 'Instagram', configured: Boolean(social.instagram) },
    { Icon: Youtube, href: (social.youtube as string) || '', label: 'YouTube', configured: Boolean(social.youtube) },
    { Icon: Linkedin, href: (social.linkedin as string) || '', label: 'LinkedIn', configured: Boolean(social.linkedin) },
  ]

  return (
    <>
      {!isMobile && (
      <div className={styles.topbar} role="region" aria-label="Dealer contact bar">
        <div className={styles.topbarInner}>
          <span className={styles.topChip} title="Showroom">
            <MapPin size={14} aria-hidden="true" />
            {locationLabel}
          </span>
          {status.hoursToday && (
            <span className={`${styles.topChip} ${styles.hoursChip}`}>
              <Clock size={14} aria-hidden="true" />
              {status.hoursToday}
            </span>
          )}
          <span
            className={`${styles.statusPill} ${mounted && status.open ? styles.statusOpen : styles.statusClosed}`}
            aria-live="polite"
          >
            <span className={`mfx-pulse-dot ${styles.liveDot}`} aria-hidden="true" />
            {mounted ? status.label : 'Live stock'}
          </span>
          <ul className={styles.socials} aria-label="Social links">
            {socialItems.map(({ Icon, href, label, configured }) => (
              <li key={label}>
                {configured ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                    <Icon size={14} aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    className={styles.socialDisabled}
                    aria-label={`${label} link not yet configured`}
                    role="presentation"
                  >
                    <Icon size={14} aria-hidden="true" />
                  </span>
                )}
              </li>
            ))}
          </ul>
          {contact.phoneTel && (
            <a href={`tel:${contact.phoneTel}`} className={styles.topPhone}>
              <Phone size={14} aria-hidden="true" />
              <span>{contact.phoneDisplay}</span>
            </a>
          )}
        </div>
      </div>
      )}

      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ''}`}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label={brand?.name || 'this dealership'}>
            {brand?.logo ? (
              <img src={brand.logo} alt={brand?.name || 'this dealership'} className={styles.brandLogo} />
            ) : (
              <span className={styles.brandWordmark}>{brand?.name || 'Dealer'}</span>
            )}
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className={styles.headerActions}>
            {contact.phoneTel && (
              <a href={`tel:${contact.phoneTel}`} className={`auto-btn auto-btn--primary mfx-shimmer ${styles.callCta}`}>
                <Phone size={16} aria-hidden="true" />
                <span>Call now</span>
              </a>
            )}
            <button
              type="button"
              className={styles.menuToggle}
              aria-expanded={mobileOpen}
              aria-controls="auto-mobile-nav"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="auto-mobile-nav"
        className={`${styles.mobileSheet} ${mobileOpen ? styles.mobileOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        hidden={!mobileOpen}
      >
        <div className={styles.mobileInner}>
          <ul className={styles.mobileNavList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.mobileNavLink}>
                  <span>{item.label}</span>
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>

          <div className={styles.mobileFooter}>
            {contact.phoneTel && (
              <a href={`tel:${contact.phoneTel}`} className={`auto-btn auto-btn--primary ${styles.mobileCall}`}>
                <Phone size={16} aria-hidden="true" />
                <span>{contact.phoneDisplay}</span>
              </a>
            )}
            <ul className={styles.mobileSocials} aria-label="Social links">
              {socialItems.map(({ Icon, href, label, configured }) => (
                <li key={label}>
                  {configured ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                      <Icon size={18} aria-hidden="true" />
                    </a>
                  ) : (
                    <span
                      className={styles.socialDisabled}
                      aria-label={`${label} link not yet configured`}
                      role="presentation"
                    >
                      <Icon size={18} aria-hidden="true" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
