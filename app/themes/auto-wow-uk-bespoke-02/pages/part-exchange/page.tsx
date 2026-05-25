import { CheckCircle2, BadgePoundSterling, Clock, ShieldCheck } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PartExchangeIsland from './PartExchangeIsland'
import styles from './page.module.css'

export function AutoPartExchangePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Autowow'
  return (
    <main>
      <section className="auto-page-hero auto-page-hero--part-exchange" aria-label="Part exchange hero">
        <div className="auto-page-hero-inner">
          <span className="auto-page-hero-eyebrow">[ Part-exchange ]</span>
          <h1>Trade in. Drive out.</h1>
          <p>
            Bring the old car. Drive a new one away. {brandName} values
            part-exchanges on the spot — no call-back theatre.
          </p>
        </div>
      </section>

      <section className={`auto-section ${styles.section}`}>
        <div className={styles.inner}>
          <aside className={styles.sidebar} data-aos="fade-right">
            <h2 className={styles.sidebarTitle}>How it works</h2>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepNum}>01</span>
                <strong>Tell us about your car</strong>
                <span>Reg, mileage, condition. Two minutes.</span>
              </li>
              <li>
                <span className={styles.stepNum}>02</span>
                <strong>Get a guide price</strong>
                <span>We&apos;ll come back with a number within 24 hours.</span>
              </li>
              <li>
                <span className={styles.stepNum}>03</span>
                <strong>Settle the swap</strong>
                <span>Bring the car in, drive the new one out.</span>
              </li>
            </ol>

            <div className={styles.assurances}>
              <div className={styles.assurance}>
                <BadgePoundSterling size={18} strokeWidth={1.8} />
                <span>Fair guide prices, not low-ball offers.</span>
              </div>
              <div className={styles.assurance}>
                <Clock size={18} strokeWidth={1.8} />
                <span>Same-day decisions when you visit.</span>
              </div>
              <div className={styles.assurance}>
                <ShieldCheck size={18} strokeWidth={1.8} />
                <span>Outstanding finance? We&apos;ll settle it for you.</span>
              </div>
              <div className={styles.assurance}>
                <CheckCircle2 size={18} strokeWidth={1.8} />
                <span>Whatever it&apos;s worth — we&apos;ll take it.</span>
              </div>
            </div>
          </aside>

          <PartExchangeIsland />
        </div>
      </section>
    </main>
  )
}

export default AutoPartExchangePage
