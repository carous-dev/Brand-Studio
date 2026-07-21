'use client'

import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Directory.module.css'

export default function Directory() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const address = (brand as any)?.location?.address || {}
  const hours = (brand as any)?.openingHours || []

  const addressLine = [
    address.street, address.city, address.county, address.postcode
  ].filter(Boolean).join(', ')

  const mapsQuery = encodeURIComponent(addressLine || `${address.city || ''} ${address.postcode || ''}`.trim())
  const mapsUrl = mapsQuery ? `https://www.google.com/maps?q=${mapsQuery}` : null

  return (
    <section className={`axis-section ${styles.dir}`} aria-label="Find us" data-aos="fade-up">
      <div className="axis-shell">
        <header className={styles.header}>
          <span className="axis-eyebrow">Find us</span>
          <h2 className="axis-section-title">Showroom information.</h2>
        </header>

        <div className={styles.grid}>
          <div className={styles.card}>
            <span className={styles.iconBox} aria-hidden="true"><MapPin size={20} strokeWidth={1.6} /></span>
            <h3 className={styles.cardTitle}>Address</h3>
            {addressLine ? <p className={styles.cardBody}>{addressLine}</p> : <p className={styles.cardBody}>Address on request — get in touch.</p>}
            {mapsUrl ? <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>Get directions →</a> : null}
          </div>

          <div className={styles.card}>
            <span className={styles.iconBox} aria-hidden="true"><Phone size={20} strokeWidth={1.6} /></span>
            <h3 className={styles.cardTitle}>Contact</h3>
            <ul className={styles.contactList}>
              {contact.phoneTel ? (
                <li><a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a></li>
              ) : null}
              {contact.email ? (
                <li><a href={`mailto:${contact.email}`}><Mail size={14} strokeWidth={1.6} aria-hidden="true" /> {contact.email}</a></li>
              ) : null}
              {!contact.phoneTel && !contact.email ? (
                <li>Use the contact form to get in touch.</li>
              ) : null}
            </ul>
          </div>

          <div className={styles.card}>
            <span className={styles.iconBox} aria-hidden="true"><Clock size={20} strokeWidth={1.6} /></span>
            <h3 className={styles.cardTitle}>Opening hours</h3>
            {hours.length > 0 ? (
              <dl className={styles.hours}>
                {hours.slice(0, 7).map((h: any, i: number) => (
                  <div key={i} className={styles.hoursRow}>
                    <dt>{h?.day || '—'}</dt>
                    <dd>{h?.closed ? 'Closed' : `${h?.open || '—'}–${h?.close || '—'}`}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className={styles.cardBody}>Hours by appointment — call ahead.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
