import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PartExchangeFormIsland from './PartExchangeFormIsland'
import styles from './page.module.css'

const STEPS = [
  { n: '01', title: 'Submit details', body: 'Tell us about your current van — reg, mileage, condition.' },
  { n: '02', title: 'Free valuation', body: "We benchmark against current trade prices and come back within 24 hours." },
  { n: '03', title: 'Drive away', body: 'Bring your van to the forecourt and drive away in your new one — settle outstanding finance as part of the deal.' },
]

export function NcrPartExchangePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'NCR Van Sales Ltd'
  return (
    <>
      <PageHero
        eyebrow="Part exchange"
        title="Swap up. We'll take your old van off your hands."
        lead={`Trade your existing van for one of ours. ${brandName} valuations are honest, fast, and based on real trade prices — not lowball offers.`}
        imageSlot="partExchange"
        pills={['Free valuation', 'No obligation', 'Settle finance']}
      />

      <section className={styles.steps}>
        <div className={styles.inner}>
          <header className={styles.header} data-aos="fade-up">
            <p className={styles.eyebrow}>How it works</p>
            <h2 className={styles.headline}>Three steps from <span className={styles.headlineAccent}>old to new.</span></h2>
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

      <section className={styles.form}>
        <div className={styles.inner}>
          <div className={styles.formGrid}>
            <div data-aos="fade-up">
              <PartExchangeFormIsland />
            </div>
            <aside className={styles.sidebar} data-aos="fade-up" data-aos-delay="120">
              <h3>What we need</h3>
              <ul>
                <li><strong>Registration</strong> — so we can pull the spec.</li>
                <li><strong>Mileage</strong> — current odometer reading.</li>
                <li><strong>Condition</strong> — honest description, including any damage or known faults.</li>
                <li><strong>Finance</strong> — let us know if there's outstanding finance; we can settle it as part of the deal.</li>
              </ul>
              <p className={styles.sidebarNote}>Submitted details are reviewed by a member of the {brandName} team. We'll come back within one working day.</p>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

export default NcrPartExchangePage
