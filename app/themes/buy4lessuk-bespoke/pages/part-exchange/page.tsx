import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageShell from '../../components/PageShell'
import ValuationForm from '../../components/ValuationForm'
import styles from './page.module.css'

export function Buy4lessukPartExchangePage(_: ThemePageProps) {
  return (
    <>
      <PageHero
        title="Part-exchange against your next car"
        eyebrow="Part exchange"
        slot="part-exchange"
      />
      <PageShell>
        <div className={styles.lead}>
          <p>
            Found a car you love on our forecourt? We'll part-exchange your current vehicle and
            settle outstanding finance if needed. The valuation below is a guide — bring your car
            in and we'll confirm the final figure on the day.
          </p>
        </div>

        <ValuationForm leadType="part-exchange" ctaLabel="Value my part-ex" />

        <ul className={styles.points}>
          <li>
            <h3>Settle outstanding finance</h3>
            <p>We'll pay off your existing HP or PCP balance and offset the rest against your next car.</p>
          </li>
          <li>
            <h3>No-pressure offer</h3>
            <p>Take the offer or leave it — there's no obligation to buy from us if the numbers don't work.</p>
          </li>
          <li>
            <h3>Drive away the same day</h3>
            <p>If everything stacks up, we can swap you into your next car on the day of valuation.</p>
          </li>
        </ul>

        <div className={styles.cta}>
          <Link href="/used-cars" className={styles.ctaPrimary}>Browse what you could swap into</Link>
        </div>
      </PageShell>
    </>
  )
}

export default Buy4lessukPartExchangePage
