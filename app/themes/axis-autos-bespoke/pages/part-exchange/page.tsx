import { CheckCircle2, BadgePoundSterling, Clock, ShieldCheck } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PartExchangeIsland from './PartExchangeIsland'
import styles from './page.module.css'

export function AxisPartExchangePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Axis Autos'
  return (
    <main>
      <section className="axis-page-hero axis-page-hero--part-exchange" aria-label="Part exchange hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">part-exchange</span>
          <h1>Trade in. Drive out.</h1>
          <p>
            Bring the old car. Drive a new one away. {brandName} values
            part-exchanges on the spot — no callback theatre.
          </p>
        </div>
      </section>

      <section className={`axis-section ${styles.section}`}>
        <div className={styles.inner}>
          <aside className={styles.sidebar} data-aos="fade-right">
            <h2 className={styles.sidebarTitle}>{'> '}how-it-works</h2>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepNum}>01</span>
                <strong>Tell us about your car</strong>
                <span>Reg, mileage, condition. Two minutes.</span>
              </li>
              <li>
                <span className={styles.stepNum}>02</span>
                <strong>Get a guide price</strong>
                <span>Decision in 24 hours.</span>
              </li>
              <li>
                <span className={styles.stepNum}>03</span>
                <strong>Settle the swap</strong>
                <span>Drive the new car out.</span>
              </li>
            </ol>

            <div className={styles.assurances}>
              <div className={styles.assurance}>
                <BadgePoundSterling size={18} strokeWidth={1.8} />
                <span>Fair guide prices.</span>
              </div>
              <div className={styles.assurance}>
                <Clock size={18} strokeWidth={1.8} />
                <span>Same-day decisions when you visit.</span>
              </div>
              <div className={styles.assurance}>
                <ShieldCheck size={18} strokeWidth={1.8} />
                <span>Outstanding finance settled for you.</span>
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

export default AxisPartExchangePage
