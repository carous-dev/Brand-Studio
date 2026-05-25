import Link from 'next/link'
import { ArrowRight, BadgePoundSterling, Calculator, ShieldCheck, Sparkle } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AxisFinancePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Axis Autos'
  return (
    <main>
      <section className="axis-page-hero axis-page-hero--finance" aria-label="Finance hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">finance.options</span>
          <h1>Finance that fits</h1>
          <p>
            PCP, HP, and dealer-arranged finance through the major UK lenders.
            Soft-search quotes — no impact on your credit, no commission upsell.
          </p>
        </div>
      </section>

      <section className={`axis-section ${styles.section}`}>
        <div className={styles.inner}>
          <header className={styles.header} data-aos="fade-up">
            <span className={styles.eyebrow}>{'> '}products.index</span>
            <h2 className={styles.title}>Three ways to drive</h2>
            <p className={styles.lead}>
              Pick what fits — {brandName} walks you through each. No pressure,
              no commission games.
            </p>
          </header>

          <div className={styles.grid}>
            <article className={styles.card} data-aos="fade-up">
              <span className={styles.cardCode}>01 / HP</span>
              <h3 className={styles.cardTitle}>Hire Purchase</h3>
              <p className={styles.cardBody}>
                Deposit, then fixed monthlies until the car is yours. No mileage
                limits, no balloon. Most popular for outright ownership.
              </p>
              <ul className={styles.cardList}>
                <li>Own the car at term end</li>
                <li>No mileage limits</li>
                <li>Fixed monthly payments</li>
              </ul>
            </article>

            <article className={styles.card} data-aos="fade-up" data-aos-delay="80">
              <span className={styles.cardCode}>02 / PCP</span>
              <h3 className={styles.cardTitle}>Personal Contract Purchase</h3>
              <p className={styles.cardBody}>
                Lower monthly payments with a balloon choice at term end —
                hand back, pay off, or part-exchange.
              </p>
              <ul className={styles.cardList}>
                <li>Lower payments than HP</li>
                <li>Three end-of-term choices</li>
                <li>Mileage limit applies</li>
              </ul>
            </article>

            <article className={styles.card} data-aos="fade-up" data-aos-delay="160">
              <span className={styles.cardCode}>03 / Direct</span>
              <h3 className={styles.cardTitle}>Cash + part-exchange</h3>
              <p className={styles.cardBody}>
                Outright purchase with optional part-exchange. Value on the
                spot. Paperwork is the V5C handover, nothing else.
              </p>
              <ul className={styles.cardList}>
                <li>Drive away same day</li>
                <li>Part-exchange welcomed</li>
                <li>Card, transfer, or cash</li>
              </ul>
            </article>
          </div>

          <div className={styles.softSearch} data-aos="fade-up">
            <div className={styles.softSearchCopy}>
              <span className={styles.softSearchEyebrow}>
                <Sparkle size={14} strokeWidth={2} />
                {'> '}soft-search · no credit impact
              </span>
              <h2 className={styles.softSearchTitle}>Rate in 60 seconds</h2>
              <p>
                Tell us about the car and your situation. We match you to the
                right lender before anything hits your credit file.
              </p>
            </div>
            <div className={styles.softSearchActions}>
              <Link href="/contact" className="axis-btn axis-btn--primary">
                <Calculator size={18} strokeWidth={2} />
                Apply for finance
              </Link>
              <Link href="/used-cars" className="axis-btn axis-btn--ghost-light">
                Browse stock first
              </Link>
            </div>
          </div>

          <div className={styles.assurance} data-aos="fade-up">
            <div className={styles.assuranceItem}>
              <BadgePoundSterling size={20} strokeWidth={1.8} />
              <div>
                <strong>FCA-regulated panel</strong>
                <span>FCA-authorised lenders only.</span>
              </div>
            </div>
            <div className={styles.assuranceItem}>
              <ShieldCheck size={20} strokeWidth={1.8} />
              <div>
                <strong>No hidden fees</strong>
                <span>Quoted rate is the rate you pay.</span>
              </div>
            </div>
            <div className={styles.assuranceItem}>
              <Sparkle size={20} strokeWidth={1.8} />
              <div>
                <strong>Honest broker</strong>
                <span>Flat fee from lender. No incentive to upsell.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AxisFinancePage
