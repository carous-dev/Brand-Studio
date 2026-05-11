import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

const STEPS = [
  { n: '01', title: 'Pick a van', body: 'Browse our stock list and find the vehicle that fits your work.' },
  { n: '02', title: 'Soft search', body: 'Quick eligibility check — no impact on your credit score.' },
  { n: '03', title: 'Decision in 24h', body: 'Same-day decisions from trade-friendly lenders most of the time.' },
  { n: '04', title: 'Drive away', body: 'Sign, collect or have it delivered. Repayments structured around your cashflow.' },
]

const PRODUCTS = [
  {
    name: 'Hire Purchase',
    body: 'Pay a deposit, monthly instalments over 2–5 years, you own the van at the end. Tax-deductible for businesses.',
    suits: ['Sole traders', 'Limited companies', 'Owner-operators'],
  },
  {
    name: 'Finance Lease',
    body: 'Lower monthly payments, balloon at the end. VAT split across the term. Good for cash-flow-conscious operators.',
    suits: ['Limited companies', 'VAT-registered', 'Fleet growth'],
  },
  {
    name: 'Contract Hire',
    body: 'Fixed monthly cost, hand it back at the end of the term. Maintenance options. Common across fleet operations.',
    suits: ['Fleet operators', 'Multi-van businesses', 'Predictable budgets'],
  },
]

export function NcrFinancePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'NCR Van Sales Ltd'

  return (
    <>
      <PageHero
        eyebrow="Finance"
        title="Finance that gets you moving."
        lead={`${brandName} works with trade-friendly finance partners to put working drivers in vans without the high-street nonsense.`}
        imageSlot="finance"
        pills={['Soft search', 'Decision in 24h', 'No hidden fees']}
      />

      <section className={styles.steps}>
        <div className={styles.inner}>
          <header className={styles.header} data-aos="fade-up">
            <p className={styles.eyebrow}>How it works</p>
            <h2 className={styles.headline}>
              Four steps from <span className={styles.headlineAccent}>browse to drive away.</span>
            </h2>
          </header>

          <ol className={styles.stepsGrid}>
            {STEPS.map((s, i) => (
              <li key={s.n} className={styles.stepCard} data-aos="fade-up" data-aos-delay={i * 80}>
                <span className={styles.stepNumber} aria-hidden="true">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.products}>
        <div className={styles.inner}>
          <header className={styles.header} data-aos="fade-up">
            <p className={styles.eyebrow}>Products</p>
            <h2 className={styles.headline}>Three ways to finance your van.</h2>
            <p className={styles.lead}>We'll walk you through which one fits — and the trade-offs of each.</p>
          </header>

          <ul className={styles.productsGrid}>
            {PRODUCTS.map((p, i) => (
              <li key={p.name} className={styles.productCard} data-aos="zoom-in-up" data-aos-delay={i * 100}>
                <h3 className={styles.productTitle}>{p.name}</h3>
                <p>{p.body}</p>
                <p className={styles.productSuitsHeading}>Best for</p>
                <ul className={styles.productSuits}>
                  {p.suits.map((s) => (<li key={s}>{s}</li>))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner} data-aos="zoom-in-up">
          <p className={styles.eyebrow}>Apply today</p>
          <h2>Soft search now. No hit to your credit score.</h2>
          <p className={styles.lead}>
            Tell us a bit about you and the van you want. We'll line up indicative finance terms and bring options to you — not the other way round.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/contact" className={`${styles.ctaPrimary} mfx-shimmer`}>Start finance enquiry</Link>
            <Link href="/used-cars" className={styles.ctaSecondary}>Browse vans first</Link>
          </div>
          <p className={styles.disclaimer}>
            Finance subject to status and acceptance. {brandName} is a credit broker, not a lender. Specific finance terms depend on the lender and applicant.
          </p>
        </div>
      </section>
    </>
  )
}

export default NcrFinancePage
