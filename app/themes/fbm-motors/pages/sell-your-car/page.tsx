import type { ThemePageProps } from '../../../types'
import { ShieldCheck, Clock, BadgePoundSterling } from 'lucide-react'
import SellYourCarMount from './SellYourCarMount'
import styles from './page.module.css'

export function FbmSellYourCarPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'the showroom'

  return (
    <main>
      <section className={styles.hero} aria-label="Sell your car hero">
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroInner}>
          <span className={styles.heroEyebrow}>Sell your car</span>
          <h1 className={styles.heroTitle}>One quote. No call-back games.</h1>
          <p className={styles.heroLead}>
            Three quick steps and {brandName} comes back with a guide price.
            Decision in 24 hours, no obligation either way.
          </p>
        </div>
      </section>

      <section className={styles.widgetSection}>
        <div className={styles.widgetInner}>
          <SellYourCarMount />
        </div>
      </section>

      <section className={styles.tailSection}>
        <div className={styles.tailInner}>
          <div className={styles.tailCard}>
            <ShieldCheck size={28} strokeWidth={1.6} />
            <h3>No obligation</h3>
            <p>Get the number first. Sell only if you&apos;re happy with it.</p>
          </div>
          <div className={styles.tailCard}>
            <Clock size={28} strokeWidth={1.6} />
            <h3>24-hour decision</h3>
            <p>We&apos;ll come back with a firm price within one working day.</p>
          </div>
          <div className={styles.tailCard}>
            <BadgePoundSterling size={28} strokeWidth={1.6} />
            <h3>Fair guide prices</h3>
            <p>Real market data, not the low-ball offers that waste your time.</p>
          </div>
        </div>
      </section>
    </main>
  )
}

export default FbmSellYourCarPage
