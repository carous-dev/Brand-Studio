'use client'

import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'
import styles from './page.module.css'

const DEFAULT_HOURS = [
  { day: 'Monday – Friday', hours: '09:00 – 18:00' },
  { day: 'Saturday', hours: '09:00 – 17:00' },
  { day: 'Sunday', hours: 'Closed' },
]

export default function ContactInfoPanel() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const hours: Array<{ day: string; hours: string }> = (() => {
    const raw = (brand as any)?.openingHours
    if (Array.isArray(raw) && raw.length > 0) {
      return raw
        .map((r: any) => ({ day: String(r.day ?? ''), hours: String(r.hours ?? r.value ?? '') }))
        .filter((r) => r.day)
    }
    return DEFAULT_HOURS
  })()

  return (
    <div className={styles.infoStack}>
      {contact.showroomAddress ? (
        <article className={styles.infoCard}>
          <span className={styles.infoIcon} aria-hidden="true"><MapPin size={20} strokeWidth={2} /></span>
          <h3>Showroom</h3>
          <address>{contact.showroomAddress}</address>
        </article>
      ) : null}

      {contact.phoneDisplay ? (
        <article className={styles.infoCard}>
          <span className={styles.infoIcon} aria-hidden="true"><Phone size={20} strokeWidth={2} /></span>
          <h3>Phone</h3>
          <p><a href={`tel:${contact.phoneTel || contact.phoneDisplay}`}>{contact.phoneDisplay}</a></p>
        </article>
      ) : null}

      {contact.email ? (
        <article className={styles.infoCard}>
          <span className={styles.infoIcon} aria-hidden="true"><Mail size={20} strokeWidth={2} /></span>
          <h3>Email</h3>
          <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
        </article>
      ) : null}

      <article className={styles.infoCard}>
        <span className={styles.infoIcon} aria-hidden="true"><Clock size={20} strokeWidth={2} /></span>
        <h3>Opening hours</h3>
        <dl>
          {hours.map((row) => (
            <div key={row.day} className={styles.hoursRow}>
              <dt>{row.day}</dt>
              <dd>{row.hours}</dd>
            </div>
          ))}
        </dl>
      </article>
    </div>
  )
}
