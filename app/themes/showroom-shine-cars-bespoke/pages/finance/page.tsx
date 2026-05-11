import Link from 'next/link'
import { Calculator, FileText, ShieldCheck, Banknote, Phone, CheckCircle2 } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const FINANCE_OPTIONS = [
  {
    name: 'Hire Purchase (HP)',
    body: 'Straightforward monthly payments. Once the final instalment is made the car is yours.',
    points: ['Fixed monthly cost', 'Own the car at the end', 'Available across all stock'],
  },
  {
    name: 'Personal Contract Purchase (PCP)',
    body: 'Lower monthly payments and three choices at the end: keep, swap, or hand back.',
    points: ['Lower monthly payments', 'Flexibility at the end', 'Mileage tailored to you'],
  },
  {
    name: 'Tailored plans',
    body: 'Bespoke terms for buyers with bad credit, self-employed status, or part-exchange equity.',
    points: ['Self-employed friendly', 'Bad-credit specialists', 'Part-exchange equity counted'],
  },
]

export function ShowroomFinancePage(_: ThemePageProps) {
  return (
    <article>
      <section className="shr-page-hero shr-page-hero--finance">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Finance</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Honest finance, clearly explained.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            We work with FCA-regulated UK lenders to match you with the right plan — quick
            decisions, fair rates, no pressure.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.options}`}>
        <div className="shr-container">
          <div className="shr-section-head" data-aos="fade-up">
            <span className="shr-eyebrow">Finance options</span>
            <h2 className="shr-section-head__title">Pick the plan that suits your life.</h2>
          </div>
          <div className={styles.grid}>
            {FINANCE_OPTIONS.map((option, i) => (
              <article key={option.name} className={styles.card} data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                <h3 className={styles.cardTitle}>{option.name}</h3>
                <p className={styles.cardBody}>{option.body}</p>
                <ul className={styles.bullets}>
                  {option.points.map((p) => (
                    <li key={p}><CheckCircle2 size={16} strokeWidth={2.2} aria-hidden /> {p}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`shr-section shr-section--dark ${styles.process}`}>
        <div className="shr-container">
          <div className="shr-section-head" data-aos="fade-up">
            <span className="shr-eyebrow">How it works</span>
            <h2 className="shr-section-head__title">From application to driveaway.</h2>
          </div>
          <ol className={styles.steps}>
            <li data-aos="fade-up" data-aos-delay="80">
              <span className={styles.stepNum}>01</span>
              <h3 className={styles.stepTitle}>Pick your car</h3>
              <p>Browse our stock or speak to us about sourcing the right vehicle for you.</p>
            </li>
            <li data-aos="fade-up" data-aos-delay="160">
              <span className={styles.stepNum}>02</span>
              <h3 className={styles.stepTitle}>Apply in minutes</h3>
              <p>Quick online enquiry. We&apos;ll match you to lenders based on your circumstances.</p>
            </li>
            <li data-aos="fade-up" data-aos-delay="240">
              <span className={styles.stepNum}>03</span>
              <h3 className={styles.stepTitle}>Get a decision</h3>
              <p>Most decisions come back the same working day. No obligation to proceed.</p>
            </li>
            <li data-aos="fade-up" data-aos-delay="320">
              <span className={styles.stepNum}>04</span>
              <h3 className={styles.stepTitle}>Drive away</h3>
              <p>Sign, collect, and drive — with after-sales support for the road ahead.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className={`shr-section ${styles.assurance}`}>
        <div className="shr-container">
          <div className={styles.assuranceLayout}>
            <div data-aos="fade-right">
              <span className="shr-eyebrow">FCA regulated</span>
              <h2 className={styles.assuranceTitle}>Authorised &amp; regulated finance partners.</h2>
              <p className={styles.assuranceLead}>
                Showroom Shine Cars is a credit broker, not a lender. We work only with
                FCA-authorised lenders, and we&apos;re always upfront about how commissions work.
              </p>
              <div className={styles.assuranceBadges}>
                <span className={styles.assuranceBadge}><ShieldCheck size={16} strokeWidth={2.2} aria-hidden /> FCA regulated</span>
                <span className={styles.assuranceBadge}><FileText size={16} strokeWidth={2.2} aria-hidden /> Clear paperwork</span>
                <span className={styles.assuranceBadge}><Banknote size={16} strokeWidth={2.2} aria-hidden /> No hidden fees</span>
                <span className={styles.assuranceBadge}><Calculator size={16} strokeWidth={2.2} aria-hidden /> Same-day decisions</span>
              </div>
            </div>
            <aside className={styles.contactCard} data-aos="fade-left">
              <h3 className={styles.contactTitle}>Speak to a real person.</h3>
              <p>Call our finance team for a no-pressure chat about your options.</p>
              <a href="tel:07537164927" className={`shr-btn-primary ${styles.contactCta}`}>
                <Phone size={16} strokeWidth={2.4} aria-hidden />
                07537 164927
              </a>
              <Link href="/contact" className={`shr-btn-ghost-light ${styles.contactSecondary}`}>
                Send a message
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </article>
  )
}

export default ShowroomFinancePage
