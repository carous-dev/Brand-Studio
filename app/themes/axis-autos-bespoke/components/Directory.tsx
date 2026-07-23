'use client'

import { MapPin, Phone, Mail, Clock, Navigation, ArrowUpRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Directory.module.css'

export default function Directory() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const address = (brand as any)?.location?.address || {}
  const hours = (brand as any)?.openingHours || []

  const addressLine = [
    address.line1, address.street, address.line2, address.city, address.county, address.postcode
  ].filter(Boolean).join(', ')

  const postcode = String(address.postcode || '').trim().toUpperCase()
  const locality = String(address.city || address.county || '').trim()

  const mapsQuery = encodeURIComponent(addressLine || `${address.city || ''} ${address.postcode || ''}`.trim())
  const mapsUrl = mapsQuery ? `https://www.google.com/maps?q=${mapsQuery}` : null

  const openByAppointment = hours.length === 0
  const statusLabel = openByAppointment ? 'By appointment' : 'Open today'

  return (
    <section className={`axis-section ${styles.dir}`} aria-label="Find us">
      <div className="axis-shell">
        <header className={styles.header} data-aos="fade-up">
          <span className="axis-eyebrow">Find us</span>
          <h2 className="axis-section-title">Showroom information.</h2>
        </header>

        <div className={styles.panel} data-aos="fade-up">
          {/* corner brackets */}
          <span className={`${styles.bracket} ${styles.btl}`} aria-hidden="true" />
          <span className={`${styles.bracket} ${styles.btr}`} aria-hidden="true" />
          <span className={`${styles.bracket} ${styles.bbl}`} aria-hidden="true" />
          <span className={`${styles.bracket} ${styles.bbr}`} aria-hidden="true" />

          <div className={styles.panelBar}>
            <span className={styles.barLabel}>Showroom · Locator</span>
            <span className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              {statusLabel}
            </span>
          </div>

          <div className={styles.grid}>
            {/* Address — the anchor cell */}
            <div className={`${styles.cell} ${styles.cellWide}`}>
              <div className={styles.cellHead}>
                <span className={styles.iconBox} aria-hidden="true"><MapPin size={18} strokeWidth={1.7} /></span>
                <span className={styles.microLabel}>Address</span>
              </div>
              {addressLine ? (
                <p className={styles.addressLine}>{addressLine}</p>
              ) : (
                <p className={styles.addressLine}>Address on request — get in touch.</p>
              )}
              {(postcode || locality) ? (
                <div className={styles.readout} aria-hidden="true">
                  <Navigation size={12} strokeWidth={2} />
                  <span>{[locality, postcode].filter(Boolean).join(' · ') || 'UK'}</span>
                </div>
              ) : null}
              {mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  Get directions <ArrowUpRight size={15} strokeWidth={2} />
                </a>
              ) : null}
            </div>

            {/* Contact */}
            <div className={styles.cell}>
              <div className={styles.cellHead}>
                <span className={styles.iconBox} aria-hidden="true"><Phone size={18} strokeWidth={1.7} /></span>
                <span className={styles.microLabel}>Contact</span>
              </div>
              <ul className={styles.contactList}>
                {contact.phoneTel ? (
                  <li><a className={styles.phone} href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a></li>
                ) : null}
                {contact.email ? (
                  <li>
                    <a className={styles.emailLink} href={`mailto:${contact.email}`}>
                      <Mail size={14} strokeWidth={1.7} aria-hidden="true" /> {contact.email}
                    </a>
                  </li>
                ) : null}
                {!contact.phoneTel && !contact.email ? (
                  <li className={styles.mutedItem}>Use the contact form to get in touch.</li>
                ) : null}
              </ul>
            </div>

            {/* Opening hours */}
            <div className={styles.cell}>
              <div className={styles.cellHead}>
                <span className={styles.iconBox} aria-hidden="true"><Clock size={18} strokeWidth={1.7} /></span>
                <span className={styles.microLabel}>Opening hours</span>
              </div>
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
                <p className={styles.mutedItem}>Hours by appointment — call ahead.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
