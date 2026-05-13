import type { ThemePageProps } from '../../../types'
import Link from 'next/link'
import styles from './page.module.css'

export function DualAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Dual Stock Dealer'
  return (
    <main>
      <section className="dual-page-hero dual-page-hero--about">
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">About us</span>
          </nav>
          <h1 className="dual-page-hero__title">About {brandName}</h1>
          <p className="dual-page-hero__lead">
            UK independent dealer for cars and motorcycles. Honest stock, honest finance, honest delivery.
          </p>
        </div>
      </section>

      <section className={`dual-section ${styles.intro}`}>
        <div className="dual-container">
          <div className={styles.introGrid}>
            <div data-aos="fade-right">
              <span className="dual-eyebrow">Our story</span>
              <h2 className={styles.h2}>Two stocks. One dealer. One promise.</h2>
              <p className={styles.body}>
                We have been trading independently in Leicestershire since 2011, registered with
                Companies House and listed on every major UK marketplace — AutoTrader, CarGurus and
                PistonHeads. From the start the idea has been simple: buyers should not have to choose
                between a trustworthy car dealer and a knowledgeable bike dealer. Today we run both
                stocks side by side with the same prep, the same finance options, and the same
                after-sales support.
              </p>
              <p className={styles.body}>
                Every vehicle is AA-inspected, HPI-clear and road-prepared. Viewings are by
                appointment so you get a proper hour with us, not a queue. Finance, part-exchange
                and nationwide delivery work the same whether you're picking up a family hatch or a
                fresh adventure bike — and our customers regularly come back for their second and
                third vehicle.
              </p>
            </div>
            <div className={styles.statBlock} data-aos="fade-left">
              <Stat number="2011" label="Trading since" />
              <Stat number="3" label="Marketplaces listed" />
              <Stat number="5★" label="AutoTrader reviews" />
              <Stat number="By appt." label="One-to-one viewings" />
            </div>
          </div>
        </div>
      </section>

      <section className={`dual-section dual-section--alt ${styles.values}`}>
        <div className="dual-container">
          <header className={styles.valuesHead} data-aos="fade-up">
            <span className="dual-eyebrow">What we promise</span>
            <h2 className={styles.h2}>Built on three things</h2>
          </header>
          <ul className={styles.valuesGrid}>
            <li data-aos="fade-up"><h3>No pressure</h3><p>Reviewers consistently call out our patient, no-pressure approach — you set the pace, ask every question, take the extended test drive.</p></li>
            <li data-aos="fade-up" data-aos-delay="80"><h3>Honest finance</h3><p>FCA-regulated PCP and HP via a panel of UK lenders. Soft-search first, all options on the table — never inflated to chase commission.</p></li>
            <li data-aos="fade-up" data-aos-delay="160"><h3>Real after-sales</h3><p>3-month inclusive warranty with a 12-month upgrade option, plus a real follow-up call after collection — service history posted on if it lands later.</p></li>
          </ul>
        </div>
      </section>

      <section className="dual-section">
        <div className="dual-container">
          <div className={styles.ctaPanel} data-aos="zoom-in-up">
            <h2 className={styles.h2}>Ready to browse?</h2>
            <p>Find your next vehicle from our hand-picked stock — cars and bikes side by side.</p>
            <div className={styles.ctaRow}>
              <Link href="/used-cars" className="dual-btn dual-btn--primary">Browse stock</Link>
              <Link href="/contact" className="dual-btn dual-btn--outline">Talk to us</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statNum}>{number}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

export default DualAboutPage
