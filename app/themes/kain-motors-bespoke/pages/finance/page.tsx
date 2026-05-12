import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import FinanceCalculator from './FinanceCalculator'
import FinanceForm from './FinanceForm'
import { resolveText } from '../../lib/brand-text'
import styles from './page.module.css'

const STEPS = [
  { num: '01', title: 'Soft-search', body: 'A no-impact eligibility check tells you what rate you can expect without touching your credit file.' },
  { num: '02', title: 'Choose the car', body: 'We share quotes from a panel of lenders — PCP, HP and Lease — with the headline APR and OTR.' },
  { num: '03', title: 'Sign + drive', body: 'Documents are signed at the showroom or sent by secure DocuSign. Most decisions are made within a day.' },
]

export function KainFinancePage({ brand }: ThemePageProps) {
  return (
    <>
      <PageHero
        variant="finance"
        eyebrow="Finance & lending"
        title="Finance from regulated lenders, not pressured salespeople."
        lead="PCP, HP and Lease through a panel of FCA-regulated UK lenders. We share the rates upfront and never inflate APRs to chase commission."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Finance' }]}
        actions={
          <>
            <Link href="#calculator" className="kain-btn kain-btn--gold">Try the calculator</Link>
            <Link href="/used-cars" className="kain-btn kain-btn--ghost-dark">Browse eligible stock</Link>
          </>
        }
      />

      <section className={`kain-section ${styles.steps}`} aria-label="How finance works">
        <div className={styles.stepsInner}>
          <header className={styles.stepsHead}>
            <p className="kain-eyebrow">How it works</p>
            <h2 className={styles.stepsTitle}>Three steps to a clean finance deal.</h2>
          </header>
          <ol className={styles.stepsList}>
            {STEPS.map((s, idx) => (
              <li key={s.num} data-aos="fade-up" data-aos-delay={String(idx * 90)}>
                <span className={styles.stepNum}>{s.num}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="calculator" className={`kain-section--dark ${styles.calcSection}`} aria-labelledby="finance-calculator-heading">
        <div className={styles.calcInner}>
          <header className={styles.calcHead}>
            <p className="kain-eyebrow">Quick estimate</p>
            <h2 id="finance-calculator-heading" className={styles.calcTitle}>Estimate your monthly payment.</h2>
            <p className={styles.calcLead}>
              Quick illustration only — your actual rate depends on lender credit checks and the chosen vehicle.
              Representative APR varies; we’ll share the headline rate before you commit.
            </p>
          </header>
          <FinanceCalculator />
        </div>
      </section>

      <section className={`kain-section ${styles.applySection}`}>
        <div className={styles.applyInner}>
          <header className={styles.applyHead}>
            <p className="kain-eyebrow">Apply</p>
            <h2 className={styles.applyTitle}>Start a no-impact eligibility check.</h2>
            <p className={styles.applyLead}>
              Drop your details below and one of the finance team will be in touch within showroom hours with
              the lender options. We use a soft-search — your credit score isn’t affected.
            </p>
          </header>
          <FinanceForm />
        </div>
      </section>

      <section className={`kain-section ${styles.disclaimer}`}>
        <p>{resolveText(brand, 'financeDisclaimer')}</p>
      </section>
    </>
  )
}

export default KainFinancePage
