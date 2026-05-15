import Link from 'next/link'
import { Gauge, Banknote, Phone } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import { getBrandContactInfo } from '../../lib/contact'
import SellYourCarMount from './SellYourCarMount'
import styles from './page.module.css'

export function ShowroomSellYourCarPage({ brand }: ThemePageProps) {
  const contact = getBrandContactInfo(brand)

  return (
    <article>
      <section className="shr-page-hero shr-page-hero--sell-your-car">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Sell your car</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Free dealer valuation, no fuss.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Share your vehicle details and the team will follow up with clear next steps.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.wizardSection}`}>
        <div className="shr-container">
          <SellYourCarMount />
        </div>
      </section>

      <section className={`shr-section shr-section--dark ${styles.benefits}`}>
        <div className="shr-container">
          <div className="shr-section-head" data-aos="fade-up">
            <span className="shr-eyebrow">Why sell to us</span>
            <h2 className="shr-section-head__title">Fair price, fast contact, zero hassle.</h2>
          </div>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefit} data-aos="fade-up" data-aos-delay="80">
              <span className={styles.benefitIcon}><Gauge size={22} strokeWidth={2.2} /></span>
              <h3>Fast valuation</h3>
              <p>Quick registration lookup with a guide price based on available market data.</p>
            </div>
            <div className={styles.benefit} data-aos="fade-up" data-aos-delay="160">
              <span className={styles.benefitIcon}><Banknote size={22} strokeWidth={2.2} /></span>
              <h3>Clear offer</h3>
              <p>The team will explain the valuation and any next steps before you proceed.</p>
            </div>
            <div className={styles.benefit} data-aos="fade-up" data-aos-delay="240">
              <span className={styles.benefitIcon}><Phone size={22} strokeWidth={2.2} /></span>
              <h3>Helpful callback</h3>
              <p>Talk through pricing, vehicle condition and handover or collection options.</p>
            </div>
          </div>

          <div className={styles.contactStrip} data-aos="fade-up" data-aos-delay="320">
            {contact.phoneDisplay ? (
              <p>Prefer to talk it through? Call us on <a href={`tel:${contact.phoneTel}`}>{contact.phoneDisplay}</a></p>
            ) : (
              <p>Prefer to talk it through? Send the team a message.</p>
            )}
            <Link href="/contact" className="shr-btn-primary">Send a message</Link>
          </div>
        </div>
      </section>
    </article>
  )
}

export default ShowroomSellYourCarPage
