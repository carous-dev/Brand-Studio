import type { ThemePageProps } from '../../../types'
import Link from 'next/link'
import styles from './page.module.css'

export function DualAboutPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'this dealership'
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
            Independent dealer support for cars and motorcycles. Honest stock, honest finance, honest delivery.
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
                We help customers compare stock clearly and buy with confidence. Buyers should not have to choose
                between a trustworthy car dealer and a knowledgeable bike dealer. Both stocks sit side by side with
                clear preparation standards, finance options and after-sales support.
              </p>
              <p className={styles.body}>
                Every vehicle is presented with clear details and checks available where applicable. Viewings can be
                arranged so you get proper time with the team, not a queue. Finance, part exchange and handover support
                work the same whether you are choosing a family hatch or an adventure bike.
              </p>
            </div>
            <div className={styles.statBlock} data-aos="fade-left">
              <Stat number="Live" label="Stock updates" />
              <Stat number="Cars" label="And motorcycles" />
              <Stat number="Clear" label="Customer reviews" />
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
            <li data-aos="fade-up"><h3>No pressure</h3><p>You set the pace, ask every question and get the information you need before making a decision.</p></li>
            <li data-aos="fade-up" data-aos-delay="80"><h3>Honest finance</h3><p>Finance options are explained clearly before you commit, with suitable routes discussed around your needs.</p></li>
            <li data-aos="fade-up" data-aos-delay="160"><h3>Real after-sales</h3><p>Warranty options and follow-up support are explained clearly before collection.</p></li>
          </ul>
        </div>
      </section>

      <section className="dual-section">
        <div className="dual-container">
          <div className={styles.ctaPanel} data-aos="zoom-in-up">
            <h2 className={styles.h2}>Ready to browse?</h2>
            <p>Find your next vehicle from our hand-picked stock, with cars and bikes side by side where available.</p>
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
