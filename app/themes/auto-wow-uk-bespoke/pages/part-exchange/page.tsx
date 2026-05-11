import Link from 'next/link'
import { ArrowLeftRight, Clock, ShieldCheck, ChevronRight } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PartExForm from './PartExForm'
import styles from './page.module.css'

export function AutoPartExchangePage(_props: ThemePageProps) {
  return (
    <>
      <section className="auto-page-hero auto-page-hero--part-exchange">
        <div className="auto-page-hero-inner">
          <p className="auto-page-hero-crumb">Part exchange</p>
          <h1>Trade in. Trade up. Keep it simple.</h1>
          <p>
            Competitive part-exchange values for your current vehicle. Honest appraisal, fair offer,
            and we can handle outstanding finance settlement directly.
          </p>
        </div>
      </section>

      <section className={`auto-section ${styles.section}`}>
        <div className={`auto-container ${styles.layout}`}>
          <div className={styles.copy}>
            <p className="auto-eyebrow">Why part-ex with us</p>
            <h2 className="auto-section-title">Fewer steps, fairer value, less hassle.</h2>

            <ul className={styles.reasons}>
              <li>
                <span className={styles.icon}><ArrowLeftRight size={20} aria-hidden="true" /></span>
                <div>
                  <h3>Single-transaction simplicity</h3>
                  <p>One paperwork bundle. The value of your current car comes off the price of your next car &mdash; less back-and-forth.</p>
                </div>
              </li>
              <li>
                <span className={styles.icon}><Clock size={20} aria-hidden="true" /></span>
                <div>
                  <h3>Same-day offer</h3>
                  <p>Submit your details and we&rsquo;ll come back with a fair appraisal &mdash; usually within the same working day.</p>
                </div>
              </li>
              <li>
                <span className={styles.icon}><ShieldCheck size={20} aria-hidden="true" /></span>
                <div>
                  <h3>Outstanding finance handled</h3>
                  <p>Got finance still running? We settle it directly with the lender so you don&rsquo;t have to.</p>
                </div>
              </li>
            </ul>

            <Link href="/used-cars" className={`auto-btn auto-btn--ghost ${styles.browseCta}`}>
              Browse the upgrade options
              <ChevronRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.formCard}>
            <PartExForm />
          </div>
        </div>
      </section>
    </>
  )
}

export default AutoPartExchangePage
