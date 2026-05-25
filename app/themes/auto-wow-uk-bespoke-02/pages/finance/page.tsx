import Link from 'next/link'
import { ArrowRight, BadgePoundSterling, Calculator, ShieldCheck, Sparkle } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AutoFinancePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Autowow'
  return (
    <main>
      <section className="auto-page-hero auto-page-hero--finance" aria-label="Finance hero">
        <div className="auto-page-hero-inner">
          <span className="auto-page-hero-eyebrow">[ Finance ]</span>
          <h1>Finance that fits, no theatre</h1>
          <p>
            PCP, HP, and dealer-arranged finance through the major UK lenders.
            Soft-search quotes in minutes — no impact on your credit, no
            commission upsell at the end.
          </p>
        </div>
      </section>

      <section className={`auto-section ${styles.section}`}>
        <div className={styles.inner}>
          <header className={styles.header} data-aos="fade-up">
            <span className={styles.eyebrow}>[ Products ]</span>
            <h2 className={styles.title}>Three ways to drive</h2>
            <p className={styles.lead}>
              Pick what fits — {brandName} will walk you through each. No
              pressure to swap, no commission games.
            </p>
          </header>

          <div className={styles.grid}>
            <article className={styles.card} data-aos="fade-up">
              <span className={styles.cardEyebrow}>01 / Hire Purchase</span>
              <h3 className={styles.cardTitle}>Hire Purchase (HP)</h3>
              <p className={styles.cardBody}>
                Pay a deposit, then fixed monthly payments until the car is
                yours. No mileage limits, no balloon at the end. Most popular
                for buyers who want to own outright.
              </p>
              <ul className={styles.cardList}>
                <li>Own the car at the end of the term</li>
                <li>No mileage limits</li>
                <li>Fixed monthly payments</li>
              </ul>
            </article>

            <article className={styles.card} data-aos="fade-up" data-aos-delay="80">
              <span className={styles.cardEyebrow}>02 / PCP</span>
              <h3 className={styles.cardTitle}>Personal Contract Purchase</h3>
              <p className={styles.cardBody}>
                Lower monthly payments with a final &ldquo;balloon&rdquo; choice — hand
                back, pay off, or part-exchange. Good for buyers who change cars
                regularly.
              </p>
              <ul className={styles.cardList}>
                <li>Lower monthly payments than HP</li>
                <li>Three choices at the end of the term</li>
                <li>Mileage limit applies</li>
              </ul>
            </article>

            <article className={styles.card} data-aos="fade-up" data-aos-delay="160">
              <span className={styles.cardEyebrow}>03 / Direct</span>
              <h3 className={styles.cardTitle}>Cash + part-exchange</h3>
              <p className={styles.cardBody}>
                Outright purchase with an optional part-exchange. We&apos;ll value
                your current car on the spot. No paperwork beyond the V5C
                handover.
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
                Soft search · no credit impact
              </span>
              <h2 className={styles.softSearchTitle}>See your rate in 60 seconds</h2>
              <p>
                Tell us a bit about the car and your situation. We&apos;ll match you
                to the right lender from our panel before anything hits your
                credit file.
              </p>
            </div>
            <div className={styles.softSearchActions}>
              <Link href="/contact" className="auto-btn auto-btn--primary mfx-shimmer">
                <Calculator size={18} strokeWidth={2} />
                Apply for finance
              </Link>
              <Link href="/used-cars" className="auto-btn auto-btn--ghost-dark">
                Browse stock first
              </Link>
            </div>
          </div>

          <div className={styles.assurance} data-aos="fade-up">
            <div className={styles.assuranceItem}>
              <BadgePoundSterling size={20} strokeWidth={1.8} />
              <div>
                <strong>FCA-regulated panel</strong>
                <span>We work with FCA-authorised lenders only.</span>
              </div>
            </div>
            <div className={styles.assuranceItem}>
              <ShieldCheck size={20} strokeWidth={1.8} />
              <div>
                <strong>No hidden fees</strong>
                <span>Whatever rate you&apos;re quoted is the rate you pay.</span>
              </div>
            </div>
            <div className={styles.assuranceItem}>
              <Sparkle size={20} strokeWidth={1.8} />
              <div>
                <strong>Honest broker, not a sale-target machine</strong>
                <span>We get a flat fee from the lender. No incentive to upsell.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AutoFinancePage
