import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import Directory from '../../components/Directory'
import FinanceFormIsland from './FinanceFormIsland'
import styles from './page.module.css'

export function AutoFinancePage({ brand }: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Finance"
        title="Soft-search finance. Rates from 9.9% APR."
        lead="Apply in two minutes, get a decision in 24 hours, and we'll never run a hard credit check until you're ready to commit."
        imageSlot="finance"
        pills={['Soft-search', '24h decision', 'From 9.9% APR']}
      />

      <section className={styles.body} data-aos="fade-up">
        <div className={styles.bodyInner}>
          <div className={styles.intro} data-aos="fade-up" data-aos-delay="120">
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDash} aria-hidden="true" />
              How it works
            </p>
            <h2 className={styles.heading}>Finance that fits your life.</h2>
            <ul className={styles.steps}>
              <li>
                <span className={styles.stepNum}>01</span>
                <div>
                  <h3>Tell us your budget</h3>
                  <p>Deposit, monthly payment, term. We tune the numbers to fit.</p>
                </div>
              </li>
              <li>
                <span className={styles.stepNum}>02</span>
                <div>
                  <h3>Soft-search check</h3>
                  <p>No mark on your credit file. We shop multiple lenders to find the right rate.</p>
                </div>
              </li>
              <li>
                <span className={styles.stepNum}>03</span>
                <div>
                  <h3>Decision in 24h</h3>
                  <p>We confirm the lender, term and monthly figure in writing. You take it from there.</p>
                </div>
              </li>
            </ul>
          </div>

          <FinanceFormIsland />
        </div>
      </section>

      <div data-aos="fade-up" data-aos-delay="200"><Directory brand={brand} /></div>
    </>
  )
}

export default AutoFinancePage
