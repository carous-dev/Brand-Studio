import Link from 'next/link'
import type { BrandConfig } from '@/brands/types'
import { getBrandContactInfo } from '../lib/contact'
import styles from './Directory.module.css'

type DirectoryProps = { brand: BrandConfig | null | undefined }

const OPENING_HOURS: Array<{ day: string; hours: string }> = [
  { day: 'Mon — Fri', hours: '09:00 — 18:00' },
  { day: 'Saturday', hours: '09:00 — 17:00' },
  { day: 'Sunday', hours: '10:00 — 16:00' },
]

const POSTCODES = [
  'Reading', 'Slough', 'Maidenhead', 'Wokingham', 'Bracknell',
  'Newbury', 'Henley', 'High Wycombe', 'Basingstoke',
]

export default function Directory({ brand }: DirectoryProps) {
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'AUTOWOW UK'

  return (
    <section className={styles.section} aria-labelledby="directory-heading">
      <div className={styles.inner}>
        <header className={styles.head} data-aos="fade-up">
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            Where to find us
          </p>
          <h2 id="directory-heading" className={styles.heading}>
            One forecourt. UK-wide delivery.
          </h2>
        </header>

        <div className={styles.grid}>
          <div className={styles.col} data-aos="fade-up">
            <h3 className={styles.colHeading}>Showroom</h3>
            <address className={styles.address}>
              {brandName}<br />
              {contact.showroomAddress || 'Reading, Berkshire'}
            </address>
            {contact.phoneDisplay ? (
              <a className={styles.contactLink} href={contact.phoneTel ? `tel:${contact.phoneTel}` : '#'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {contact.phoneDisplay}
              </a>
            ) : null}
            {contact.email ? (
              <a className={styles.contactLink} href={`mailto:${contact.email}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
                {contact.email}
              </a>
            ) : null}
          </div>

          <div className={styles.col} data-aos="fade-up" data-aos-delay="100">
            <h3 className={styles.colHeading}>Opening hours</h3>
            <dl className={styles.hours}>
              {OPENING_HOURS.map((entry) => (
                <div key={entry.day} className={styles.hoursRow}>
                  <dt>{entry.day}</dt>
                  <dd>{entry.hours}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={styles.col} data-aos="fade-up" data-aos-delay="200">
            <h3 className={styles.colHeading}>Delivery coverage</h3>
            <ul className={styles.chips}>
              {POSTCODES.map((postcode) => (
                <li key={postcode} className={styles.chip}>
                  <span className={styles.chipDot} aria-hidden="true" />
                  {postcode}
                </li>
              ))}
              <li className={[styles.chip, styles.chipPlus].join(' ')}>
                + Mainland UK
              </li>
            </ul>
            <Link href="/contact" className={styles.tailCta}>
              Get a delivery quote
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
