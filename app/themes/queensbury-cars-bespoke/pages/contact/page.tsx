import type { ThemePageProps } from '../../../types'
import { getBrandContactInfo } from '../../lib/contact'
import ContactFormIsland from './ContactFormIsland'
import styles from './page.module.css'

export function QueensburyContactPage({ brand }: ThemePageProps) {
  const contact = getBrandContactInfo(brand)
  const addr: any = brand?.location?.address || {}
  const addressLine = [addr.line1, addr.line2, addr.city, addr.county, addr.postcode]
    .filter((p: string) => p && p.trim())
    .join(', ')

  const openingHours = (brand?.openingHours as Record<string, string>) || {}
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  return (
    <>
      <section className="qb-page-hero qb-page-hero--plain" data-aos="fade-up">
        <div className="qb-page-hero__inner">
          <span className="qb-page-hero__eyebrow">Get in touch</span>
          <h1 className="qb-page-hero__title">Talk to a real human about real cars.</h1>
          <p className="qb-page-hero__lead">
            Send a message, ring the showroom, or pop in for a coffee. We pick up.
          </p>
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-container">
          <div className={styles.grid}>
            <div className={styles.contactCol} data-aos="fade-up">
              <h2 className={styles.colTitle}>Send a message</h2>
              <p className={styles.colLead}>
                Tell us what you're looking for. We reply same-working-day, often faster.
              </p>
              <ContactFormIsland />
            </div>

            <aside className={styles.infoCol} data-aos="fade-up" data-aos-delay="120">
              <div className={styles.infoCard}>
                <h3 className={styles.cardTitle}>Showroom</h3>
                {addressLine && <p className={styles.addressLine}>{addressLine}</p>}
                <p className={styles.helperText}>By appointment — please call ahead.</p>
              </div>

              {(contact.phoneDisplay || contact.email) && (
                <div className={styles.infoCard}>
                  <h3 className={styles.cardTitle}>Direct lines</h3>
                  {contact.phoneDisplay && (
                    <a className={styles.directLine} href={`tel:${contact.phoneTel || contact.phoneDisplay}`}>
                      📞 {contact.phoneDisplay}
                    </a>
                  )}
                  {contact.email && (
                    <a className={styles.directLine} href={`mailto:${contact.email}`}>
                      ✉️ {contact.email}
                    </a>
                  )}
                  {contact.whatsappUrl && (
                    <a className={styles.directLine} href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer">
                      💬 WhatsApp us
                    </a>
                  )}
                </div>
              )}

              <div className={styles.infoCard}>
                <h3 className={styles.cardTitle}>Opening hours</h3>
                <dl className={styles.hours}>
                  {days.map((d) =>
                    openingHours[d] ? (
                      <div key={d} className={styles.hoursRow}>
                        <dt>{d.slice(0, 3).toUpperCase()}</dt>
                        <dd>{openingHours[d]}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
                {!days.some((d) => openingHours[d]) && (
                  <p className={styles.helperText}>By appointment 7 days a week — please call.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

export default QueensburyContactPage
