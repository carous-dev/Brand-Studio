'use client'

import { Clock, MapPin, Phone, Facebook, Instagram, Twitter, Youtube } from 'lucide-react'
import { useMemo } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import type { WorkingPeriod } from '@/app/lib/working-status'
import styles from './TopBar.module.css'

const FALLBACK_PERIODS: WorkingPeriod[] = [
  { day: 'mon', from: '09:00', to: '17:00' },
  { day: 'tue', from: '09:00', to: '17:00' },
  { day: 'wed', from: '09:00', to: '17:00' },
  { day: 'thu', from: '09:00', to: '17:00' },
  { day: 'fri', from: '09:00', to: '17:00' },
  { day: 'sat', from: '08:30', to: '17:00' },
]

export default function TopBar() {
  const brand = useBrand()
  const location = (brand as any)?.location || {}
  const address = (location.address || {}) as Record<string, string | undefined>
  const phone = String(location.phone || '').trim()
  const phoneTel = phone.replace(/[^\d+]/g, '')
  const social = (brand as any)?.socialLinks || {}

  const addressLine = [
    address.line1 || address.street || (location as any).line1,
    [address.city || (location as any).city, address.postcode || (location as any).postcode]
      .filter(Boolean).join(', '),
  ].filter((v): v is string => typeof v === 'string' && v.trim().length > 0).join(', ')

  const workingConfig = useMemo(() => {
    const raw = (brand as any)?.openingHours
    const periods: WorkingPeriod[] = Array.isArray(raw?.periods) && raw.periods.length > 0
      ? raw.periods
      : FALLBACK_PERIODS
    return { periods, timezone: raw?.timezone || 'Europe/London' }
  }, [brand])
  const { isOnline } = useWorkingHours(workingConfig)

  const socials = [
    { key: 'facebook', href: social.facebook, label: 'Facebook', Icon: Facebook },
    { key: 'instagram', href: social.instagram, label: 'Instagram', Icon: Instagram },
    { key: 'twitter', href: social.twitter, label: 'Twitter / X', Icon: Twitter },
    { key: 'youtube', href: social.youtube, label: 'YouTube', Icon: Youtube },
  ]

  return (
    <div className={styles.topbar} aria-label="Site utility bar">
      <div className={styles.inner}>
        <div className={styles.left}>
          {addressLine ? (
            <span className={`${styles.item} ${styles.addressItem}`}>
              <MapPin size={13} strokeWidth={2.4} aria-hidden />
              <span>{addressLine}</span>
            </span>
          ) : null}
          {phone ? (
            <a href={`tel:${phoneTel}`} className={`${styles.item} ${styles.itemLink}`}>
              <Phone size={13} strokeWidth={2.4} aria-hidden />
              <span>{phone}</span>
            </a>
          ) : null}
        </div>
        <div className={styles.right}>
          <span className={`${styles.item} ${styles.hoursItem}`}>
            <Clock size={13} strokeWidth={2.4} aria-hidden />
            <span>{isOnline ? 'Open now' : 'Opening Hours'}</span>
          </span>
          <span className={styles.socials}>
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
                  <Icon size={13} strokeWidth={2} aria-hidden />
                </a>
              ) : (
                <span key={key} aria-hidden="true" className={styles.social}>
                  <Icon size={13} strokeWidth={2} aria-hidden />
                </span>
              )
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
