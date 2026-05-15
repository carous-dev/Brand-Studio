import Link from 'next/link'
import { Award, Users, ShieldCheck, Wrench, Phone, MapPin } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import { getBrandContactInfo } from '../../lib/contact'
import styles from './page.module.css'

export function ShowroomAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'this dealership'
  const city = (brand as any)?.location?.address?.city || (brand as any)?.location?.city || ''
  const area = city || 'the local area'
  const about = (brand as any)?.aboutUs || {}
  const contact = getBrandContactInfo(brand)
  const values = [
    { icon: ShieldCheck, title: 'Honest', body: 'Clear vehicle details, transparent pricing and no pressure selling.' },
    { icon: Wrench, title: 'Thorough', body: 'Preparation and vehicle checks are explained before you commit.' },
    { icon: Users, title: 'Personal', body: 'Helpful contact from enquiry through to viewing, handover and after-sales support.' },
    { icon: Award, title: 'Trusted', body: `${brandName} supports buyers across ${area} with practical used-car advice.` },
  ]

  return (
    <article>
      <section className="shr-page-hero shr-page-hero--about">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">About Us</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            {about.headline || `${brandName}: your independent used-car dealer${city ? ` in ${city}` : ''}.`}
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            {about.description || `${brandName} helps customers find, finance and part exchange quality used vehicles with clear, practical support.`}
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.story}`}>
        <div className="shr-container">
          <div className={styles.storyLayout}>
            <div className={styles.storyCopy} data-aos="fade-right">
              <span className="shr-eyebrow">Our story</span>
              <h2 className={styles.storyTitle}>
                Used-car support built around the customer.
              </h2>
              <p>
                {about.description || `${brandName} focuses on well-presented stock, useful vehicle information and straightforward communication from first enquiry to handover.`}
              </p>
              <p>
                Browse current vehicles, ask about finance and part exchange, or contact the team
                to arrange a viewing that suits you.
              </p>
              <div className={styles.storyActions}>
                <Link href="/used-cars" className="shr-btn-primary">Browse our stock</Link>
                <Link href="/contact" className="shr-btn-ghost-light">Visit us</Link>
              </div>
            </div>

            <aside className={styles.storyStats} data-aos="fade-left">
              <div className={styles.storyStatHead}>
                <span className={styles.storyStatEyebrow}>What to expect</span>
              </div>
              <div className={styles.storyStatGrid}>
                <div className={styles.storyStat}>
                  <span className={styles.storyStatNum}>Live</span>
                  <span className={styles.storyStatLabel}>Stock updates</span>
                </div>
                <div className={styles.storyStat}>
                  <span className={styles.storyStatNum}>Clear</span>
                  <span className={styles.storyStatLabel}>Vehicle details</span>
                </div>
                <div className={styles.storyStat}>
                  <span className={styles.storyStatNum}>Fair</span>
                  <span className={styles.storyStatLabel}>Part exchange</span>
                </div>
                <div className={styles.storyStat}>
                  <span className={styles.storyStatNum}>Helpful</span>
                  <span className={styles.storyStatLabel}>After-sales contact</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className={`shr-section shr-section--dark ${styles.values}`}>
        <div className="shr-container">
          <div className="shr-section-head" data-aos="fade-up">
            <span className="shr-eyebrow">What we stand for</span>
            <h2 className="shr-section-head__title">Four values, every car, every customer.</h2>
          </div>
          <div className={styles.valuesGrid}>
            {values.map((v, i) => {
              const Icon = v.icon
              return (
                <div key={v.title} className={styles.valueCard} data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                  <span className={styles.valueIcon} aria-hidden>
                    <Icon size={22} strokeWidth={2.2} />
                  </span>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueBody}>{v.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className={`shr-section ${styles.visit}`}>
        <div className="shr-container">
          <div className={styles.visitLayout}>
            <div data-aos="fade-up">
              <span className="shr-eyebrow">Visit the showroom</span>
              <h2 className={styles.visitTitle}>Come and see your next car in person.</h2>
              <ul className={styles.visitDetails}>
                {contact.showroomAddress ? (
                  <li>
                    <MapPin size={18} strokeWidth={2.2} aria-hidden />
                    {contact.showroomAddress}
                  </li>
                ) : null}
                {contact.phoneDisplay ? (
                  <li>
                    <Phone size={18} strokeWidth={2.2} aria-hidden />
                    <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a>
                  </li>
                ) : null}
              </ul>
              <p className={styles.visitNote}>
                Please call or message ahead to confirm vehicle availability and viewing times.
              </p>
              <Link href="/contact" className="shr-btn-primary">Book an appointment</Link>
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}

export default ShowroomAboutPage
