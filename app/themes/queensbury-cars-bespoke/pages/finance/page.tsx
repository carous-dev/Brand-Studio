import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const FAQ = [
  {
    q: 'How long does an application take?',
    a: "A soft-search eligibility check is under 60 seconds and won't mark your credit file. A full application is usually answered within one working day, often faster.",
  },
  {
    q: 'Do you offer PCP and HP?',
    a: "Both. We'll show you monthly figures side by side so you can see the trade-offs (final payment vs ownership at end of term) before you sign anything.",
  },
  {
    q: 'Can I settle early?',
    a: "Yes — every agreement we arrange is settle-able early. We'll outline the early settlement figure with the quote so there are no surprises.",
  },
  {
    q: 'What if my credit is patchy?',
    a: "Our lender panel includes specialist underwriters. We'll be honest about the rate band you're in and what improvement might unlock.",
  },
]

const STEPS = [
  { step: '01', title: 'Soft-search eligibility', desc: "Tell us your monthly budget. We'll check eligibility across our panel without touching your credit file." },
  { step: '02', title: 'Two figures, side-by-side', desc: 'PCP vs HP for the same car, same term — see the trade-off and pick what fits.' },
  { step: '03', title: 'Sign and collect', desc: "Soft-search becomes a full proposal once you've picked a car. We handle the paperwork on the day." },
  { step: '04', title: 'Live aftercare', desc: "Got questions about a missed payment, refinancing, or early settlement? We're the same number you called on day one." },
]

export function QueensburyFinancePage(_props: ThemePageProps) {
  return (
    <>
      <section className="qb-page-hero qb-page-hero--finance" data-aos="fade-up">
        <div className="qb-page-hero__inner">
          <span className="qb-page-hero__eyebrow">Finance</span>
          <h1 className="qb-page-hero__title">Finance built around the budget — not the dealer.</h1>
          <p className="qb-page-hero__lead">
            Soft-search eligibility in seconds. Transparent quotes. PCP, HP, and balloon options explained
            without the jargon.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/contact" className={`qb-btn qb-btn--gradient mfx-shimmer ${styles.heroCta}`}>
              Apply for finance
            </Link>
            <Link href="/used-cars" className="qb-btn qb-btn--ghost-on-dark">
              Browse stock first
            </Link>
          </div>
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-container">
          <header className="qb-section-head" data-aos="fade-up">
            <span className="qb-eyebrow">How it works</span>
            <h2 className="qb-section-title">From quote to keys in four steps.</h2>
          </header>

          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.step} className={styles.step} data-aos="fade-up" data-aos-delay={i * 60}>
                <span className={styles.stepNumber}>{s.step}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="qb-section qb-section--tint">
        <div className="qb-container">
          <header className="qb-section-head" data-aos="fade-up">
            <span className="qb-eyebrow">Common questions</span>
            <h2 className="qb-section-title">What everyone asks before they apply.</h2>
          </header>

          <ul className={styles.faq}>
            {FAQ.map((f, i) => (
              <li key={f.q} className={styles.faqItem} data-aos="fade-up" data-aos-delay={i * 50}>
                <h3 className={styles.faqQ}>{f.q}</h3>
                <p className={styles.faqA}>{f.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="qb-section qb-section--dark">
        <div className="qb-container">
          <div className={styles.applyBand}>
            <div>
              <span className="qb-eyebrow qb-eyebrow--on-dark">Ready to apply?</span>
              <h2 className="qb-section-title">Five minutes. No commitment. No credit-mark.</h2>
              <p className={styles.applyLead}>
                Tell us a few details and we'll come back with two figures and a recommended route. If you don't
                like it, you walk away.
              </p>
            </div>
            <div className={styles.applyCtas}>
              <Link href="/contact" className="qb-btn qb-btn--gradient mfx-shimmer">
                Apply now
              </Link>
              <span className={styles.disclaimer}>
                Finance is subject to status, terms apply. Queensbury Cars introduces customers to a panel of UK
                lenders.
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default QueensburyFinancePage
