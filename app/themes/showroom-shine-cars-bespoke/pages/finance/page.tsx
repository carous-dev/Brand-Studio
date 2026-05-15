import Link from 'next/link'
import { Calculator, FileText, ShieldCheck, Banknote, Phone, CheckCircle2 } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import { getBrandContactInfo } from '../../lib/contact'
import styles from './page.module.css'

const FINANCE_OPTIONS = [
  {
    name: 'Hire Purchase (HP)',
    body: 'Straightforward monthly payments. Once the final instalment is made the car is yours.',
    points: ['Fixed monthly cost', 'Own the car at the end', 'Available across eligible stock'],
  },
  {
    name: 'Personal Contract Purchase (PCP)',
    body: 'Lower monthly payments and flexible choices at the end, where available.',
    points: ['Lower monthly payments', 'Flexibility at the end', 'Mileage tailored to you'],
  },
  {
    name: 'Tailored plans',
    body: 'Terms can be discussed around your circumstances, deposit and part-exchange position.',
    points: ['Part-exchange equity counted', 'Budget-led options', 'Clear explanation'],
  },
]

export function ShowroomFinancePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'this dealership'
  const contact = getBrandContactInfo(brand)

  return (
    <article>
      <section className="shr-page-hero shr-page-hero--finance">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Finance</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Finance, clearly explained.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Ask {brandName} about finance options for your next vehicle. The team can explain
            available plans, affordability checks and next steps before you commit.
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
              <p>Browse stock or speak to the team about sourcing the right vehicle for you.</p>
            </li>
            <li data-aos="fade-up" data-aos-delay="160">
              <span className={styles.stepNum}>02</span>
              <h3 className={styles.stepTitle}>Apply in minutes</h3>
              <p>Share your details and the dealership will explain the available finance route.</p>
            </li>
            <li data-aos="fade-up" data-aos-delay="240">
              <span className={styles.stepNum}>03</span>
              <h3 className={styles.stepTitle}>Get a decision</h3>
              <p>Review the terms before deciding whether you want to proceed.</p>
            </li>
            <li data-aos="fade-up" data-aos-delay="320">
              <span className={styles.stepNum}>04</span>
              <h3 className={styles.stepTitle}>Drive away</h3>
              <p>Sign, collect, and drive with support for the road ahead.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className={`shr-section ${styles.assurance}`}>
        <div className="shr-container">
          <div className={styles.assuranceLayout}>
            <div data-aos="fade-right">
              <span className="shr-eyebrow">Finance support</span>
              <h2 className={styles.assuranceTitle}>Clear paperwork and straightforward answers.</h2>
              <p className={styles.assuranceLead}>
                {brandName} can discuss finance options and explain any lender, broker or
                commission information that applies to your enquiry.
              </p>
              <div className={styles.assuranceBadges}>
                <span className={styles.assuranceBadge}><ShieldCheck size={16} strokeWidth={2.2} aria-hidden /> Clear checks</span>
                <span className={styles.assuranceBadge}><FileText size={16} strokeWidth={2.2} aria-hidden /> Clear paperwork</span>
                <span className={styles.assuranceBadge}><Banknote size={16} strokeWidth={2.2} aria-hidden /> Budget-led options</span>
                <span className={styles.assuranceBadge}><Calculator size={16} strokeWidth={2.2} aria-hidden /> Simple enquiries</span>
              </div>
            </div>
            <aside className={styles.contactCard} data-aos="fade-left">
              <h3 className={styles.contactTitle}>Speak to a real person.</h3>
              <p>Call the team for a no-pressure chat about your options.</p>
              {contact.phoneDisplay ? (
                <a href={`tel:${contact.phoneTel}`} className={`shr-btn-primary ${styles.contactCta}`}>
                  <Phone size={16} strokeWidth={2.4} aria-hidden />
                  {contact.phoneDisplay}
                </a>
              ) : null}
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
