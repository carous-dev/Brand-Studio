import type { ThemePageProps } from '../../../types'
import SellYourCarMount from './SellYourCarMount'
import { ShieldCheck, Clock, BadgePoundSterling } from 'lucide-react'
import styles from './page.module.css'

export function AutoSellYourCarPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Autowow'
  return (
    <main>
      <section className="auto-page-hero auto-page-hero--sell-your-car" aria-label="Sell your car hero">
        <div className="auto-page-hero-inner">
          <span className="auto-page-hero-eyebrow">[ Sell your car ]</span>
          <h1>One quote. No call-back games.</h1>
          <p>
            Three quick steps and {brandName} comes back with a guide price.
            Decision in 24 hours, no obligation either way.
          </p>
        </div>
      </section>

      <section className={`auto-section ${styles.section}`}>
        <div className={styles.inner}>
          <SellYourCarMount />
        </div>
      </section>

      <section className={`auto-section auto-section--card ${styles.tail}`}>
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

export default AutoSellYourCarPage
