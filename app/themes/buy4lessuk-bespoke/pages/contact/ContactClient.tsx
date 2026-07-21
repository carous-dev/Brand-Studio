'use client'

import { useMemo, useState } from 'react'
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'
import { useWorkingHours } from '@/app/hooks/use-working-hours'
import type { WorkingPeriod } from '@/app/lib/working-status'
import PageShell from '../../components/PageShell'
import styles from './page.module.css'

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

export default function ContactClient() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const name = (brand?.name || 'us').trim()

  const workingConfig = useMemo(() => {
    const raw = (brand as any)?.openingHours
    const periods: WorkingPeriod[] = Array.isArray(raw?.periods) && raw.periods.length > 0
      ? raw.periods
      : FALLBACK_PERIODS
    return { periods, timezone: raw?.timezone || 'Europe/London' }
  }, [brand])
  const { isOnline } = useWorkingHours(workingConfig)

  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Enquiry from ${form.name || 'website'}`)
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`
    )
    if (contact.email) {
      window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`
    }
    setSubmitted(true)
  }

  return (
    <PageShell>
      <div className={styles.grid}>
        <div>
          <h2 className={styles.heading}>Get in touch</h2>
          <p className={styles.lead}>
            Want to view a car, talk finance, or just check whether we have something coming
            in? Drop us a message — we usually reply within an hour during opening hours.
          </p>

          <ul className={styles.list}>
            {contact.showroomAddress ? (
              <li>
                <MapPin size={16} strokeWidth={2.2} aria-hidden />
                <span>{contact.showroomAddress}</span>
              </li>
            ) : null}
            {contact.phoneDisplay ? (
              <li>
                <Phone size={16} strokeWidth={2.2} aria-hidden />
                <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a>
              </li>
            ) : null}
            {contact.email ? (
              <li>
                <Mail size={16} strokeWidth={2.2} aria-hidden />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            ) : null}
            {contact.whatsappUrl ? (
              <li>
                <MessageCircle size={16} strokeWidth={2.2} aria-hidden />
                <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  Message on WhatsApp
                </a>
              </li>
            ) : null}
          </ul>

          <div className={styles.hoursCard}>
            <div className={styles.hoursHead}>
              <Clock size={14} strokeWidth={2.2} aria-hidden />
              <span>Opening hours</span>
              <span className={`${styles.status} ${isOnline ? styles.statusOpen : ''}`}>
                {isOnline ? 'Open now' : 'Closed'}
              </span>
            </div>
            <dl className={styles.hoursList}>
              {workingConfig.periods.map((p) => (
                <div key={p.day} className={styles.hoursRow}>
                  <dt>{DAY_LABELS[p.day] || p.day}</dt>
                  <dd>{p.from} – {p.to}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} aria-label={`Contact ${name}`}>
          {submitted ? (
            <div className={styles.success}>
              <h3>Message sent</h3>
              <p>Thanks — we'll be in touch as soon as we can.</p>
            </div>
          ) : (
            <>
              <label>
                <span>Your name</span>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  autoComplete="name"
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  autoComplete="email"
                />
              </label>
              <label>
                <span>Phone</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  autoComplete="tel"
                />
              </label>
              <label>
                <span>How can we help?</span>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </label>
              <button type="submit">Send message</button>
            </>
          )}
        </form>
      </div>
    </PageShell>
  )
}
