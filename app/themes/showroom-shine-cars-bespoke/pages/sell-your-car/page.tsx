import Link from 'next/link'
import { Gauge, Banknote, Phone } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import SellYourCarMount from './SellYourCarMount'
import styles from './page.module.css'

export function ShowroomSellYourCarPage(_: ThemePageProps) {
  return (
    <article>
      <section className="shr-page-hero shr-page-hero--sell-your-car">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Sell your car</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Free dealer valuation, no fuss.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Two minutes for an instant guide price. We follow up with a firm dealer offer
            and a same-day callback to walk you through the next steps.
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
            <h2 className="shr-section-head__title">Fair price, fast payout, zero hassle.</h2>
          </div>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefit} data-aos="fade-up" data-aos-delay="80">
              <span className={styles.benefitIcon}><Gauge size={22} strokeWidth={2.2} /></span>
              <h3>Fast valuation</h3>
              <p>Two-minute reg lookup with an instant guide price based on live market data.</p>
            </div>
            <div className={styles.benefit} data-aos="fade-up" data-aos-delay="160">
              <span className={styles.benefitIcon}><Banknote size={22} strokeWidth={2.2} /></span>
              <h3>Fair payout</h3>
              <p>We use main-dealer wholesale data to make sure our offer is competitive.</p>
            </div>
            <div className={styles.benefit} data-aos="fade-up" data-aos-delay="240">
              <span className={styles.benefitIcon}><Phone size={22} strokeWidth={2.2} /></span>
              <h3>Same-day callback</h3>
              <p>Our team rings you the same working day to confirm pricing and arrange collection.</p>
            </div>
          </div>

          <div className={styles.contactStrip} data-aos="fade-up" data-aos-delay="320">
            <p>Prefer to talk it through? Call us on <a href="tel:07537164927">07537 164927</a></p>
            <Link href="/contact" className="shr-btn-primary">Send a message</Link>
          </div>
        </div>
      </section>
    </article>
  )
}

export default ShowroomSellYourCarPage
