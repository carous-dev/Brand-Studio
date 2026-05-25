import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import { getBrandContactInfo } from '../../lib/contact'
import ContactIsland from './ContactIsland'
import styles from './page.module.css'

export function AutoContactPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Autowow'
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
      <section className="auto-page-hero auto-page-hero--about" aria-label="Contact hero">
        <div className="auto-page-hero-inner">
          <span className="auto-page-hero-eyebrow">[ Contact ]</span>
          <h1>Talk to the showroom</h1>
          <p>
            Walk in, call, or message {brandName}. Whatever&apos;s easiest — we&apos;ll
            reply the same day.
          </p>
        </div>
      </section>

      <section className={`auto-section ${styles.section}`}>
        <div className={styles.inner}>
          <aside className={styles.sidebar} data-aos="fade-right">
            <h2 className={styles.sidebarTitle}>How to reach us</h2>

            {contact.phoneTel ? (
              <a href={`tel:${contact.phoneTel}`} className={styles.detailRow}>
                <Phone size={20} strokeWidth={1.8} />
                <div>
                  <strong>Call</strong>
                  <span>{contact.phoneDisplay}</span>
                </div>
              </a>
            ) : null}

            {contact.email ? (
              <a href={`mailto:${contact.email}`} className={styles.detailRow}>
                <Mail size={20} strokeWidth={1.8} />
                <div>
                  <strong>Email</strong>
                  <span>{contact.email}</span>
                </div>
              </a>
            ) : null}

            {address?.line1 || address?.city ? (
              <div className={styles.detailRow}>
                <MapPin size={20} strokeWidth={1.8} />
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
                <Clock size={20} strokeWidth={1.8} />
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
              <Link href="/used-cars" className="auto-cta-link">Browse stock</Link>
              <Link href="/finance" className="auto-cta-link">Get finance quote</Link>
              <Link href="/sell-my-car" className="auto-cta-link">Sell your car</Link>
            </div>
          </aside>

          <ContactIsland />
        </div>
      </section>
    </main>
  )
}

export default AutoContactPage
