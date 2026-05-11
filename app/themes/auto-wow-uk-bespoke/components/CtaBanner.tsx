import Link from 'next/link'
import styles from './CtaBanner.module.css'

export default function CtaBanner() {
  return (
    <section className={styles.section} aria-labelledby="cta-heading" data-mfx-scroll="zoom-on-enter">
      <div className={styles.image} aria-hidden="true" />
      <div className={styles.overlay} aria-hidden="true" />
      <span className={[styles.glow, 'mfx-glow-pulse'].join(' ')} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content} data-aos="fade-up">
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            Ready when you are
          </p>
          <h2 id="cta-heading" className={styles.heading} data-aos="fade-up" data-aos-delay="80">
            Find your next car.
            <span className={[styles.headingAccent, 'mfx-text-glow'].join(' ')}> Drive away same week.</span>
          </h2>
          <p className={styles.lead} data-aos="fade-up" data-aos-delay="160">
            Reserve online, finance pre-approval in minutes, free home delivery
            anywhere in mainland UK. Walk-ins welcome at the showroom.
          </p>
          <div className={styles.actions} data-aos="fade-up" data-aos-delay="240">
            <Link href="/used-cars" className={[styles.primaryCta, 'mfx-shimmer'].join(' ')}>
              Browse stock
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/finance" className={styles.ghostCta}>
              Apply for finance
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
