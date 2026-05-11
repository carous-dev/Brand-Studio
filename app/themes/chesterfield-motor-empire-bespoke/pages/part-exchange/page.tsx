import { Search, Calculator, Handshake, Check } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CtaImageBand from '../../components/CtaImageBand'
import PartExchangeFormIsland from './PartExchangeFormIsland'
import styles from './page.module.css'

const STEPS = [
  {
    icon: Search,
    n: '01',
    title: 'Tell us about your car',
    body: 'Share your registration, mileage, and condition. We&rsquo;ll pull the basics for you.',
  },
  {
    icon: Calculator,
    n: '02',
    title: 'Get a written valuation',
    body: 'We compare against current market data and come back with a clear figure within 24 hours.',
  },
  {
    icon: Handshake,
    n: '03',
    title: 'Roll it into your next car',
    body: 'Use the part-ex value as deposit on a new car, settle outstanding finance, or take cash.',
  },
]

export function ChesterfieldPartExchangePage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Part exchange"
        title={<>Honest part-ex value, <span className={styles.heroAccent}>simple swap</span>.</>}
        lead="Drop in your registration. We&rsquo;ll give you a fair market figure and roll it straight into your next car."
        imageVar="var(--brand-image-part-exchange)"
      />

      <section className={styles.steps} aria-labelledby="px-steps-heading">
        <div className={styles.stepsInner}>
          <header className={styles.sectionHeader} data-aos="fade-up">
            <p className={styles.eyebrow}>How it works</p>
            <h2 id="px-steps-heading" className={styles.heading}>
              Three steps from query to handover.
            </h2>
          </header>
          <ol className={styles.stepList}>
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <li
                  key={s.n}
                  className={styles.stepCard}
                  data-aos="fade-up"
                  data-aos-delay={String(i * 80)}
                >
                  <span className={styles.stepNumber} aria-hidden="true">{s.n}</span>
                  <span className={styles.stepIcon} aria-hidden="true">
                    <Icon size={20} strokeWidth={2} />
                  </span>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p
                    className={styles.stepBody}
                    dangerouslySetInnerHTML={{ __html: s.body }}
                  />
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className={styles.formSection} aria-labelledby="px-form-heading">
        <div className={styles.formInner}>
          <aside className={styles.formIntro} data-aos="fade-right">
            <p className={styles.eyebrow}>Get your valuation</p>
            <h2 id="px-form-heading" className={styles.heading}>
              Send us the details — we&rsquo;ll quote inside a working day.
            </h2>
            <p className={styles.intro}>
              No obligation, no pressure. If you&rsquo;ve got finance outstanding we&rsquo;ll factor that in too.
            </p>
            <ul className={styles.checklist}>
              <li><Check size={16} strokeWidth={2.4} aria-hidden="true" /> Honest dealer-backed valuation</li>
              <li><Check size={16} strokeWidth={2.4} aria-hidden="true" /> Outstanding finance settled</li>
              <li><Check size={16} strokeWidth={2.4} aria-hidden="true" /> Roll value into your next car</li>
              <li><Check size={16} strokeWidth={2.4} aria-hidden="true" /> Same-day handover when ready</li>
            </ul>
          </aside>
          <div data-aos="fade-left">
            <PartExchangeFormIsland />
          </div>
        </div>
      </section>

      <CtaImageBand variant="contact" />
    </>
  )
}

export default ChesterfieldPartExchangePage
