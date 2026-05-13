import type { ThemePageProps } from '../../../types'
import Link from 'next/link'
import styles from './page.module.css'

const PRODUCTS = [
  {
    badge: 'Cars · HP',
    title: 'Hire Purchase',
    body: 'Spread the cost over 24-60 months. Own the car outright at the end. Most popular finance option.',
    bullets: ['£99-499 deposit', 'Fixed monthly payments', 'You own it at term end'],
  },
  {
    badge: 'Cars · PCP',
    title: 'Personal Contract Purchase',
    body: 'Lower monthly payments with a final balloon. Three options at term end.',
    bullets: ['Lower monthly cost', 'Return, swap or buy', 'Mileage cap applies'],
  },
  {
    badge: 'Bikes · HP',
    title: 'Bike Hire Purchase',
    body: 'Same finance structure, tailored to motorcycles. Available across A1 / A2 / A categories.',
    bullets: ['Specialist bike lenders', 'Licence-aware options', 'Own outright at term end'],
  },
  {
    badge: 'All · Lease',
    title: 'Personal Lease',
    body: 'Drive or ride for an agreed term, hand it back at the end. Lowest monthly cost.',
    bullets: ['Fixed monthly cost', 'Hand back at term end', 'Cars and bikes'],
  },
]

export function DualFinancePage(_props: ThemePageProps) {
  return (
    <main>
      <section className="dual-page-hero dual-page-hero--finance">
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Finance</span>
          </nav>
          <h1 className="dual-page-hero__title">Finance from £99/mo</h1>
          <p className="dual-page-hero__lead">
            Soft-search first — no impact on your credit score. FCA-regulated lenders for both cars and bikes.
          </p>
        </div>
      </section>

      <section className="dual-section">
        <div className="dual-container">
          <div className={styles.intro} data-aos="fade-up">
            <span className="dual-eyebrow">How it works</span>
            <h2 className={styles.h2}>Three steps. One quote.</h2>
            <ol className={styles.steps}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">01</span>
                <span className={styles.stepTag}>Step 01</span>
                <h3 className={styles.stepTitle}>Tell us about you</h3>
                <p className={styles.stepBody}>Income, employment, where you live. 60 seconds, soft credit check only.</p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">02</span>
                <span className={styles.stepTag}>Step 02</span>
                <h3 className={styles.stepTitle}>Pick a vehicle</h3>
                <p className={styles.stepBody}>Car or bike — we match the right finance product to your situation.</p>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">03</span>
                <span className={styles.stepTag}>Step 03</span>
                <h3 className={styles.stepTitle}>Drive or ride away</h3>
                <p className={styles.stepBody}>Sign, collect or take delivery. Full paperwork sent to you digitally.</p>
              </li>
            </ol>
            <div className={styles.ctaRow}>
              <Link href="/contact" className="dual-btn dual-btn--primary">Start a soft search</Link>
              <Link href="/used-cars" className="dual-btn dual-btn--outline">Browse stock first</Link>
            </div>
          </div>
        </div>
      </section>

      <section className={`dual-section dual-section--alt`}>
        <div className="dual-container">
          <header className={styles.productsHead} data-aos="fade-up">
            <span className="dual-eyebrow">Products</span>
            <h2 className={styles.h2}>Four ways to fund it</h2>
          </header>
          <ul className={styles.productsGrid}>
            {PRODUCTS.map((p, idx) => (
              <li key={p.title} className={styles.product} data-aos="fade-up" data-aos-delay={idx * 80}>
                <span className={styles.badge}>{p.badge}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <ul className={styles.bullets}>
                  {p.bullets.map((b) => <li key={b}>• {b}</li>)}
                </ul>
              </li>
            ))}
          </ul>
          <p className={styles.disclaimer}>
            Representative example: 9.9% APR. Finance subject to status and affordability checks.
            FCA-regulated lenders only. T&amp;Cs apply.
          </p>
        </div>
      </section>
    </main>
  )
}

export default DualFinancePage
