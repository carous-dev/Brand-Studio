import type { ThemePageProps } from '../../../types'
import SellYourCarMount from './SellYourCarMount'
import { ShieldCheck, Clock, BadgePoundSterling } from 'lucide-react'
import styles from './page.module.css'

export function AxisSellYourCarPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Axis Autos'
  return (
    <main>
      <section className="axis-page-hero axis-page-hero--sell-your-car" aria-label="Sell your car hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">sell.your-car</span>
          <h1>One quote. No call-back games.</h1>
          <p>
            Three quick steps and {brandName} comes back with a guide price.
            Decision in 24 hours, no obligation either way.
          </p>
        </div>
      </section>

      <section className={`axis-section ${styles.section}`}>
        <div className={styles.inner}>
          <SellYourCarMount />
        </div>
      </section>

      <section className={`axis-section axis-section--card ${styles.tail}`}>
        <div className={styles.tailInner}>
          <div className={styles.tailCard}>
            <span className={styles.code}>01</span>
            <ShieldCheck size={26} strokeWidth={1.6} />
            <h3>No obligation</h3>
            <p>Get the number first. Sell only if you&apos;re happy with it.</p>
          </div>
          <div className={styles.tailCard}>
            <span className={styles.code}>02</span>
            <Clock size={26} strokeWidth={1.6} />
            <h3>24-hour decision</h3>
            <p>We&apos;ll come back with a firm price within one working day.</p>
          </div>
          <div className={styles.tailCard}>
            <span className={styles.code}>03</span>
            <BadgePoundSterling size={26} strokeWidth={1.6} />
            <h3>Fair guide prices</h3>
            <p>Real market data, not the low-balls that waste your time.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AxisSellYourCarPage
