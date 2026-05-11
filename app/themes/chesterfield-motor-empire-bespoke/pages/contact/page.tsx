import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import { getBrandContactInfo } from '../../lib/contact'
import ContactFormIsland from './ContactFormIsland'
import styles from './page.module.css'

const HOURS_ROWS = [
  { label: 'Monday – Friday', value: '09:00 – 16:30' },
  { label: 'Saturday', value: '09:00 – 16:30' },
  { label: 'Sunday', value: 'Closed (viewings by appointment)' },
]

export function ChesterfieldContactPage({ brand }: ThemePageProps) {
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Chesterfield Motor Empire'

  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title={<>Talk to the <span className={styles.heroAccent}>showroom team</span>.</>}
        lead={`Drop in to the showroom in Shuttlewood, give us a call, or send a message — we typically reply within minutes during opening hours.`}
        imageVar="var(--brand-image-services)"
        variant="compact"
      />

      <section className={styles.section} aria-label="Contact details and form">
        <div className={styles.inner}>
          <aside className={styles.sidebar} data-aos="fade-right">
            <div className={styles.sidebarCard}>
              <p className={styles.sidebarEyebrow}>Showroom</p>
              <h2 className={styles.sidebarTitle}>{brandName}</h2>

              <div className={styles.detailRow}>
                <span className={styles.detailIcon} aria-hidden="true">
                  <MapPin size={16} strokeWidth={2} />
                </span>
                <address className={styles.detailValue}>
                  {contact.showroomAddress || '1 Bolsover Road, Shuttlewood, Chesterfield, Derbyshire, S44 6QX'}
                </address>
              </div>

              {contact.phoneTel ? (
                <a className={styles.detailRow} href={`tel:${contact.phoneTel}`}>
                  <span className={styles.detailIcon} aria-hidden="true">
                    <Phone size={16} strokeWidth={2.4} />
                  </span>
                  <span className={`${styles.detailValue} ${styles.detailValueAction}`}>
                    {contact.phoneDisplay}
                  </span>
                </a>
              ) : null}

              {contact.email ? (
                <a className={styles.detailRow} href={`mailto:${contact.email}`}>
                  <span className={styles.detailIcon} aria-hidden="true">
                    <Mail size={16} strokeWidth={2.4} />
                  </span>
                  <span className={`${styles.detailValue} ${styles.detailValueAction}`}>
                    {contact.email}
                  </span>
                </a>
              ) : null}

              {contact.whatsappUrl ? (
                <a
                  className={styles.whatsappRow}
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={16} strokeWidth={2.4} aria-hidden="true" />
                  <span>WhatsApp the team</span>
                </a>
              ) : null}

              <div className={styles.hoursBlock}>
                <p className={styles.hoursTitle}>
                  <Clock size={14} strokeWidth={2.4} aria-hidden="true" />
                  Opening hours
                </p>
                <dl className={styles.hoursList}>
                  {HOURS_ROWS.map((row) => (
                    <div key={row.label} className={styles.hoursRow}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className={styles.linkCard}>
              <p className={styles.linkCardTitle}>Looking for a specific car?</p>
              <p className={styles.linkCardBody}>
                Browse our latest stock or request sourcing if you can&rsquo;t see what you&rsquo;re after.
              </p>
              <Link href="/used-cars" className={styles.linkCardCta}>
                Browse stock →
              </Link>
            </div>
          </aside>

          <div className={styles.formColumn} data-aos="fade-left">
            <ContactFormIsland brandName={brandName} />
          </div>
        </div>
      </section>
    </>
  )
}

export default ChesterfieldContactPage
