import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AutoAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'AUTOWOW UK LTD'
  const city = brand?.location?.address?.city || 'Barking'
  const county = brand?.location?.address?.county || 'Essex'

  return (
    <>
      <section className="auto-page-hero">
        <div className="auto-page-hero-inner">
          <p className="auto-page-hero-crumb">Our story</p>
          <h1>About {brandName}</h1>
          <p>
            A family-run independent dealership in {city}, {county}. Specialists in quality
            used cars sourced through main dealers and prepared to a high retail standard.
          </p>
        </div>
      </section>

      <section className={`auto-section ${styles.intro}`}>
        <div className={`auto-container ${styles.introInner}`}>
          <div className={styles.copy}>
            <p className="auto-eyebrow">Who we are</p>
            <h2 className="auto-section-title">Customer-focused, quality-led, no surprises.</h2>
            <p className="auto-section-lead">
              We&rsquo;ve built our reputation on transparency and service excellence in used car
              sales and imports. Every vehicle goes through a full specialist health check, with
              HPI and finance checks completed before it hits the forecourt.
            </p>
            <p className="auto-section-lead">
              From sourcing through finance, preparation and aftercare, we&rsquo;re the dealer you
              can keep calling. Visit our showroom in Barking or browse the latest stock online &mdash;
              same-day callbacks are normal.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/used-cars" className="auto-btn auto-btn--primary">Browse stock</Link>
              <Link href="/contact" className="auto-btn auto-btn--ghost">Visit us</Link>
            </div>
          </div>

          <aside className={styles.media} aria-hidden="true">
            <div className={styles.mediaInner} />
            <div className={styles.mediaBadge}>
              <strong>500+</strong>
              <span>Vehicles available</span>
            </div>
          </aside>
        </div>
      </section>

      <section className={`auto-section auto-section--dark ${styles.values}`}>
        <div className="auto-container">
          <p className="auto-eyebrow">Our values</p>
          <h2 className="auto-section-title">Three things we never compromise on.</h2>

          <ul className={styles.valueGrid}>
            <li>
              <span className={styles.valueNum}>01</span>
              <h3>Quality</h3>
              <p>
                Sourced through main dealers. Independently inspected. Retail-standard
                preparation before the keys change hands.
              </p>
            </li>
            <li>
              <span className={styles.valueNum}>02</span>
              <h3>Transparency</h3>
              <p>
                Clear pricing, finance options explained before you commit, and HPI/finance
                checks on every vehicle.
              </p>
            </li>
            <li>
              <span className={styles.valueNum}>03</span>
              <h3>Service</h3>
              <p>
                Minimum 3-month warranty, collection support, nationwide delivery and friendly
                aftercare you can rely on.
              </p>
            </li>
          </ul>
        </div>
      </section>
    </>
  )
}

export default AutoAboutPage
