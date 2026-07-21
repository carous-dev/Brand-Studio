'use client'

import Link from 'next/link'
import styles from './CtaBanner.module.css'

export default function CtaBanner() {
  return (
    <section className={styles.cta} data-aos="fade-up">
      <div className={`${styles.glow} mfx-glow-pulse`} aria-hidden="true" />
      <div className={styles.gridPattern} aria-hidden="true" />
      <div className={styles.inner}>
        <span className={styles.eyebrow}>Ready to drive?</span>
        <h2 className={styles.title}>
          Tell us what you want.
          <br />
          We'll match you to it.
        </h2>
        <p className={styles.lead}>
          Pick a car off the floor, sell us yours, or apply for finance — we'll have an answer in under 24 hours.
        </p>
        <div className={styles.ctaRow}>
          <Link href="/used-cars" className={`qb-btn qb-btn--gradient mfx-shimmer`}>
            Browse the stock
          </Link>
          <Link href="/sell-my-car" className="qb-btn qb-btn--ghost-on-dark">
            Value my car
          </Link>
          <Link href="/finance" className={styles.financeLink}>
            Or apply for finance →
          </Link>
        </div>
      </div>
    </section>
  )
}
