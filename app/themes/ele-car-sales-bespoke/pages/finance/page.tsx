import { CheckCircle2, ShieldCheck, ScrollText, PoundSterling } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CtaBanner from '../../components/CtaBanner'
import styles from './page.module.css'

const STEPS = [
  { Icon: CheckCircle2, title: 'Tell us about you', body: 'A short eligibility check — no credit footprint, no commitment.' },
  { Icon: PoundSterling, title: 'See your options', body: 'We match your profile to a panel of FCA-approved lenders to find competitive HP and PCP rates.' },
  { Icon: ScrollText, title: 'Get your paperwork', body: 'Sign electronically; we send all docs to you and the lender directly.' },
  { Icon: ShieldCheck, title: 'Drive away', body: 'Collect the car or take delivery to your door — the finance side is sorted.' },
]

export function EleFinancePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'ELE Car Sales'
  return (
    <main>
      <PageHero
        eyebrow="Finance"
        title="Finance that fits the car and your budget."
        lead={`${brandName} works with a panel of FCA-approved lenders so we can match you to a competitive HP or PCP plan — no obligation, no impact on your credit score for the initial check.`}
        imageSlot="finance"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.head}>
            <p className={styles.eyebrow}>How it works</p>
            <h2 className={styles.h2}>Four short steps from enquiry to keys.</h2>
          </div>

          <ol className={styles.steps}>
            {STEPS.map((s, i) => {
              const Icon = s.Icon
              return (
                <li key={s.title} className={styles.step} data-aos="fade-up" data-aos-delay={String(60 * i)}>
                  <span className={styles.stepNum} aria-hidden="true">{i + 1}</span>
                  <span className={styles.stepIcon} aria-hidden="true">
                    <Icon size={20} />
                  </span>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepBody}>{s.body}</p>
                </li>
              )
            })}
          </ol>

          <div className={styles.disclaimer} role="note">
            <p>
              <strong>Representative example:</strong> Finance subject to status.
              {' '}{brandName} is a credit broker, not a lender, and is authorised
              and regulated by the Financial Conduct Authority. Speak to us for a
              personalised quote.
            </p>
          </div>
        </div>
      </section>

      <CtaBanner
        eyebrow="Ready to apply?"
        title="Let's run a no-impact eligibility check."
        body="Send us your details and we'll get back the same working day with the options that fit."
        primaryHref="/contact"
        primaryLabel="Start your enquiry"
        secondaryHref="/used-cars"
        secondaryLabel="Browse cars first"
        imageSlot="finance"
      />

    </main>
  )
}

export default EleFinancePage
