import { Calculator, ShieldCheck, Clock, Banknote, Check, ArrowRight } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CtaImageBand from '../../components/CtaImageBand'
import FinanceFormIsland from './FinanceFormIsland'
import styles from './page.module.css'

const PILLARS = [
  { icon: Calculator,  title: 'Tailored monthly figures', body: 'Pick your deposit, term, and budget. We&rsquo;ll work the numbers around them — no surprises.' },
  { icon: ShieldCheck, title: 'Soft search first',         body: 'A soft credit search has zero impact on your score so you can shop around with confidence.' },
  { icon: Clock,       title: 'Decision in principle',     body: 'Get a same-day decision in principle so you know exactly where you stand before visiting.' },
  { icon: Banknote,    title: 'Hire purchase &amp; PCP',   body: 'Two finance products, both backed by FCA-regulated lenders. We&rsquo;ll explain the difference clearly.' },
]

const FAQS = [
  {
    q: 'Will applying affect my credit score?',
    a: 'Our initial check is a soft search and leaves no footprint on your file. Only the final application with the lender of your choice will show as a hard search.',
  },
  {
    q: 'How much deposit do I need?',
    a: 'Many of our deals start from 10% deposit, but we&rsquo;ll work with whatever you have available. Larger deposits typically reduce monthly payments and total payable.',
  },
  {
    q: 'What if I have a part exchange?',
    a: 'You can put your part-ex value down as deposit, settle outstanding finance against it, or take the cash. We&rsquo;ll work out which makes most sense for you.',
  },
  {
    q: 'How long can I spread payments?',
    a: 'Hire-purchase agreements typically run 24–60 months. PCP terms are similar but with a final balloon payment if you want to keep the car.',
  },
]

export function ChesterfieldFinancePage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Finance"
        title={<>Finance built around <span className={styles.heroAccent}>your budget</span>.</>}
        lead="Transparent monthly figures, dealer-backed options, no pressure. Get a soft-search decision in principle in minutes."
        imageVar="var(--brand-image-finance)"
      />

      <section className={styles.pillars} aria-labelledby="finance-pillars-heading">
        <div className={styles.pillarsInner}>
          <header className={styles.sectionHeader} data-aos="fade-up">
            <p className={styles.eyebrow}>How our finance works</p>
            <h2 id="finance-pillars-heading" className={styles.heading}>
              Honest finance, four ways.
            </h2>
          </header>

          <ul className={styles.pillarGrid}>
            {PILLARS.map((p, i) => {
              const Icon = p.icon
              return (
                <li
                  key={p.title}
                  className={styles.pillarCard}
                  data-aos="fade-up"
                  data-aos-delay={String(i * 80)}
                >
                  <span className={styles.pillarIcon} aria-hidden="true">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <h3
                    className={styles.pillarTitle}
                    dangerouslySetInnerHTML={{ __html: p.title }}
                  />
                  <p
                    className={styles.pillarBody}
                    dangerouslySetInnerHTML={{ __html: p.body }}
                  />
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className={styles.formSection} aria-labelledby="finance-form-heading">
        <div className={styles.formInner}>
          <aside className={styles.formIntro} data-aos="fade-right">
            <p className={styles.eyebrow}>Apply now</p>
            <h2 id="finance-form-heading" className={styles.heading}>
              Get a finance decision in principle.
            </h2>
            <p className={styles.intro}>
              Tell us how you&rsquo;d like to fund your next car. We&rsquo;ll match you with the right
              lender and come back with a clear monthly figure — usually within a working day.
            </p>
            <ul className={styles.checklist}>
              <li><Check size={16} strokeWidth={2.4} aria-hidden="true" /> Soft search — no impact on credit</li>
              <li><Check size={16} strokeWidth={2.4} aria-hidden="true" /> FCA-regulated lender panel</li>
              <li><Check size={16} strokeWidth={2.4} aria-hidden="true" /> Decision typically within 24 hours</li>
              <li><Check size={16} strokeWidth={2.4} aria-hidden="true" /> Part-ex value rolled in if needed</li>
            </ul>
          </aside>
          <div data-aos="fade-left">
            <FinanceFormIsland />
          </div>
        </div>
      </section>

      <section className={styles.faqs} aria-labelledby="finance-faq-heading">
        <div className={styles.faqsInner}>
          <header className={styles.sectionHeader} data-aos="fade-up">
            <p className={styles.eyebrow}>Common questions</p>
            <h2 id="finance-faq-heading" className={styles.heading}>
              You asked, we answered.
            </h2>
          </header>
          <div className={styles.faqList}>
            {FAQS.map((faq, i) => (
              <details
                key={faq.q}
                className={styles.faqItem}
                data-aos="fade-up"
                data-aos-delay={String(i * 60)}
              >
                <summary className={styles.faqSummary}>
                  <span>{faq.q}</span>
                  <span className={styles.faqIndicator} aria-hidden="true">+</span>
                </summary>
                <p
                  className={styles.faqAnswer}
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaImageBand variant="contact" />

      <p className={styles.regulatoryNote}>
        Chesterfield Motor Empire Ltd is a credit broker, not a lender. We may receive commission from the
        finance provider, the amount of which can vary by product and lender.
      </p>
    </>
  )
}

export default ChesterfieldFinancePage
