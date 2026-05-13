import type { ThemePageProps } from '../../../types'
import Link from 'next/link'
import styles from './page.module.css'

export function DualPartExchangePage(_props: ThemePageProps) {
  return (
    <main>
      <section className="dual-page-hero dual-page-hero--part-exchange">
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Part exchange</span>
          </nav>
          <h1 className="dual-page-hero__title">Trade in. Trade up.</h1>
          <p className="dual-page-hero__lead">
            Part-exchange your existing car OR bike against any vehicle in our stock — even swap between categories.
          </p>
        </div>
      </section>

      <section className="dual-section">
        <div className="dual-container">
          <div className={styles.layout}>
            <article className={styles.copy} data-aos="fade-right">
              <span className="dual-eyebrow">Why part-exchange?</span>
              <h2 className={styles.h2}>Less hassle than selling privately</h2>
              <ul className={styles.benefits}>
                <li><CheckIcon /> Free, no-obligation valuation in 60 seconds online</li>
                <li><CheckIcon /> Cross-category — trade a bike for a car, or vice versa</li>
                <li><CheckIcon /> Fair settlement of any outstanding finance</li>
                <li><CheckIcon /> Single deal: drive away the same day</li>
                <li><CheckIcon /> Specialist HPI + history check on your trade-in</li>
              </ul>
              <div className={styles.ctaRow}>
                <Link href="/sell-my-car" className="dual-btn dual-btn--primary">Start a valuation</Link>
                <Link href="/used-cars" className="dual-btn dual-btn--outline">Browse stock</Link>
              </div>
            </article>

            <aside className={styles.stepsCard} data-aos="fade-left">
              <h3 className={styles.h3}>How it works</h3>
              <ol className={styles.steps}>
                <li><span>1</span> Tell us about your current vehicle</li>
                <li><span>2</span> Get an instant guide price</li>
                <li><span>3</span> Pick your replacement from our stock</li>
                <li><span>4</span> We settle the difference and you drive away</li>
              </ol>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default DualPartExchangePage
