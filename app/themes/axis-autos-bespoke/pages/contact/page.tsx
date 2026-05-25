import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import { getBrandContactInfo } from '../../lib/contact'
import ContactIsland from './ContactIsland'
import styles from './page.module.css'

export function AxisContactPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Axis Autos'
  const contact = getBrandContactInfo(brand)
  const address = (brand as any)?.location?.address || {}
  const openingHours: Array<{ day: string; hours: string }> = (() => {
    const oh = (brand as any)?.openingHours
    if (!oh) return []
    if (Array.isArray(oh)) return oh
    if (typeof oh === 'object') {
      return Object.entries(oh).map(([day, hours]) => ({
        day,
        hours: typeof hours === 'string' ? hours : String(hours ?? ''),
      }))
    }
    return []
  })()

  return (
    <main>
      <section className="axis-page-hero axis-page-hero--about" aria-label="Contact hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">contact.us</span>
          <h1>Talk to the showroom</h1>
          <p>
            Walk in, call, or message {brandName}. Whatever&apos;s easiest — we
            reply the same day.
          </p>
        </div>
      </section>

      <section className={`axis-section ${styles.section}`}>
        <div className={styles.inner}>
          <aside className={styles.sidebar} data-aos="fade-right">
            <h2 className={styles.sidebarTitle}>{'> '}reach.us</h2>

            {contact.phoneTel ? (
              <a href={`tel:${contact.phoneTel}`} className={styles.detailRow}>
                <span className={styles.code}>01</span>
                <Phone size={18} strokeWidth={1.8} />
                <div>
                  <strong>Call</strong>
                  <span>{contact.phoneDisplay}</span>
                </div>
              </a>
            ) : null}

            {contact.email ? (
              <a href={`mailto:${contact.email}`} className={styles.detailRow}>
                <span className={styles.code}>02</span>
                <Mail size={18} strokeWidth={1.8} />
                <div>
                  <strong>Email</strong>
                  <span>{contact.email}</span>
                </div>
              </a>
            ) : null}

            {address?.line1 || address?.city ? (
              <div className={styles.detailRow}>
                <span className={styles.code}>03</span>
                <MapPin size={18} strokeWidth={1.8} />
                <div>
                  <strong>Showroom</strong>
                  <span>
                    {[address.line1, address.line2, address.city, address.county, address.postcode]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              </div>
            ) : null}

            {openingHours.length ? (
              <div className={styles.detailRow}>
                <span className={styles.code}>04</span>
                <Clock size={18} strokeWidth={1.8} />
                <div>
                  <strong>Opening hours</strong>
                  <dl className={styles.hoursList}>
                    {openingHours.map(({ day, hours }) => (
                      <div key={day} className={styles.hoursRow}>
                        <dt>{day}</dt>
                        <dd>{hours}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : null}

            <div className={styles.quickLinks}>
              <Link href="/used-cars" className="axis-cta-link">Browse stock</Link>
              <Link href="/finance" className="axis-cta-link">Get finance quote</Link>
              <Link href="/sell-my-car" className="axis-cta-link">Sell your car</Link>
            </div>
          </aside>

          <ContactIsland />
        </div>
      </section>
    </main>
  )
}

export default AxisContactPage
