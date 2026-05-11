import { Car, Calculator, Sparkles, Handshake } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PartExFormIsland from './PartExFormIsland'
import styles from './page.module.css'

const STEPS = [
  { Icon: Car, title: 'Tell us about your car', body: 'Reg, mileage, make and model — that’s all we need to start.' },
  { Icon: Calculator, title: 'Get a part-ex offer', body: 'Honest, market-based valuation against the car you’re after.' },
  { Icon: Sparkles, title: 'Pick your next car', body: 'Browse our stock or tell us what you want — we&apos;ll source it.' },
  { Icon: Handshake, title: 'Drive away', body: 'Settle the difference, swap keys, drive away. Painless.' },
]

export function ElePartExchangePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'ELE Car Sales'
  return (
    <main>
      <PageHero
        eyebrow="Part exchange"
        title="Swap up. Drive away."
        lead={`${brandName} accepts any car in part-exchange. We&apos;ll value yours fairly and put it straight against the price of anything in stock.`}
        imageSlot="partExchange"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <div className={styles.lhs}>
            <div className={styles.head}>
              <p className={styles.eyebrow}>How it works</p>
              <h2 className={styles.h2}>From part-ex valuation to new keys.</h2>
            </div>

            <ol className={styles.steps}>
              {STEPS.map((s, i) => {
                const Icon = s.Icon
                return (
                  <li key={s.title} className={styles.step} data-aos="fade-up" data-aos-delay={String(60 * i)}>
                    <span className={styles.stepIcon} aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.stepBody}>{s.body}</p>
                  </li>
                )
              })}
            </ol>
          </div>

          <PartExFormIsland />
        </div>
      </section>
    </main>
  )
}

export default ElePartExchangePage
