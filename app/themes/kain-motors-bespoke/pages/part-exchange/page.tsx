import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PartExchangeForm from './PartExchangeForm'
import styles from './page.module.css'

export function KainPartExchangePage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        variant="part-exchange"
        eyebrow="Part exchange"
        title="A fair price for your current car — applied to your next one."
        lead="We use live market data and our own forecourt inspection to put a real number against your old motor. No bait-and-switch."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Part exchange' }]}
        actions={
          <Link href="#get-quote" className="kain-btn kain-btn--gold">Request my quote</Link>
        }
      />

      <section className={`kain-section ${styles.intro}`}>
        <div className={styles.introGrid}>
          <div className={styles.col} data-aos="fade-up">
            <p className="kain-eyebrow">How it works</p>
            <h2 className={styles.title}>Three painless steps.</h2>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepNum}>01</span>
                <strong>Submit the details</strong>
                <p>Reg + mileage + a few photos give us 80% of what we need. Outstanding finance? Fine — we’ll settle it.</p>
              </li>
              <li>
                <span className={styles.stepNum}>02</span>
                <strong>Get a guide number</strong>
                <p>You’ll have a fair guide range within hours. Subject to a quick inspection at the showroom.</p>
              </li>
              <li>
                <span className={styles.stepNum}>03</span>
                <strong>Trade in & drive away</strong>
                <p>Final figure agreed on inspection, settlement applied, balance against your next car. Done.</p>
              </li>
            </ol>
          </div>

          <aside className={styles.faqCard} data-aos="fade-left">
            <h3 className={styles.faqTitle}>Common questions</h3>
            <details>
              <summary>Do you take cars on outstanding finance?</summary>
              <p>Yes. We obtain the settlement figure direct from your finance house and pay it off on completion.</p>
            </details>
            <details>
              <summary>What if I can’t bring the car in?</summary>
              <p>For UK-mainland trades over £8,000 we can collect. There may be a delivery offset on the final figure.</p>
            </details>
            <details>
              <summary>Do you buy without a replacement?</summary>
              <p>We do — see our <Link href="/sell-my-car">Sell Your Car</Link> page for the outright-sale flow.</p>
            </details>
            <details>
              <summary>Will the value drop after inspection?</summary>
              <p>Only if the car materially differs from what was described. Honest descriptions = honest offers.</p>
            </details>
          </aside>
        </div>
      </section>

      <section id="get-quote" className={`kain-section ${styles.formSection}`}>
        <div className={styles.formInner}>
          <header className={styles.formHead}>
            <p className="kain-eyebrow">Get a guide</p>
            <h2 className={styles.formTitle}>Request your part-exchange figure.</h2>
            <p className={styles.formLead}>
              Drop your registration and a few details. We’ll come back with a guide range within
              showroom hours — no chasing, no spam.
            </p>
          </header>
          <PartExchangeForm />
        </div>
      </section>
    </>
  )
}

export default KainPartExchangePage
