import Link from 'next/link'
import { Banknote, ShieldCheck, Clock, Phone } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import FinanceCalculator from './FinanceCalculator'
import styles from './page.module.css'

export function AutoFinancePage({ brand }: ThemePageProps) {
  return (
    <>
      <section className="auto-page-hero auto-page-hero--finance">
        <div className="auto-page-hero-inner">
          <p className="auto-page-hero-crumb">Vehicle finance</p>
          <h1>Finance built around the way you drive.</h1>
          <p>
            Flexible Hire Purchase &amp; PCP from FCA-regulated lenders. Fixed monthly payments,
            transparent costs, no surprises &mdash; explained before you sign.
          </p>
        </div>
      </section>

      <section className={`auto-section ${styles.section}`}>
        <div className={`auto-container ${styles.layout}`}>
          <div className={styles.copy}>
            <p className="auto-eyebrow">How it works</p>
            <h2 className="auto-section-title">Three steps to drive-away finance.</h2>

            <ol className={styles.steps}>
              <li>
                <strong>01</strong>
                <div>
                  <h3>Tell us your budget</h3>
                  <p>Pick a comfortable monthly payment and term. We&rsquo;ll work backwards to the right car.</p>
                </div>
              </li>
              <li>
                <strong>02</strong>
                <div>
                  <h3>We match you to lenders</h3>
                  <p>Soft search where possible. We compare offers from FCA-regulated lenders so you don&rsquo;t have to.</p>
                </div>
              </li>
              <li>
                <strong>03</strong>
                <div>
                  <h3>Drive away</h3>
                  <p>Sign the agreement, complete the paperwork, take delivery. Same-day completion is common.</p>
                </div>
              </li>
            </ol>

            <ul className={styles.trustRow}>
              <li><ShieldCheck size={16} aria-hidden="true" /> FCA-regulated lenders only</li>
              <li><Clock size={16} aria-hidden="true" /> Decision usually within hours</li>
              <li><Banknote size={16} aria-hidden="true" /> Settle early without penalty</li>
            </ul>

            <p className={styles.disclaimer}>
              <strong>FCA disclosure:</strong> {brand?.name || 'AUTOWOW UK LTD'} is a credit broker, not a lender.
              We are authorised and regulated by the Financial Conduct Authority. Finance subject to status; over 18s only.
              Terms and conditions apply. Written quotations available on request.
            </p>
          </div>

          <aside className={styles.calcCard}>
            <FinanceCalculator />
            <div className={styles.calcFoot}>
              <Link href="/contact" className={`auto-btn auto-btn--primary ${styles.calcCta}`}>
                <Phone size={16} aria-hidden="true" />
                Speak to a finance advisor
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}

export default AutoFinancePage
