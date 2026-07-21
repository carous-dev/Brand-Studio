import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageShell from '../../components/PageShell'
import ValuationForm from '../../components/ValuationForm'
import styles from './page.module.css'

export function Buy4lessukSellYourCarPage({ brand }: ThemePageProps) {
  const name = (brand?.name || 'Buy4Less UK').trim()
  return (
    <>
      <PageHero
        title="Sell your car for what it's really worth"
        eyebrow="Sell your car"
        slot="sell-your-car"
      />
      <PageShell>
        <div className={styles.intro}>
          <h2>Hassle-free, honest valuation</h2>
          <p>
            Pop in your registration and mileage and we'll give you a guide price within hours.
            If you're happy, drive it in, settle finance with us if needed, and walk away the
            same day. {name} buys all makes, models, ages and conditions.
          </p>
        </div>
        <ValuationForm leadType="sell-my-car" ctaLabel="Get my valuation" />
        <ul className={styles.steps}>
          <li><span>1</span> Tell us your reg + mileage</li>
          <li><span>2</span> We send a guide price the same day</li>
          <li><span>3</span> Drive in, accept the offer, walk away paid</li>
        </ul>
      </PageShell>
    </>
  )
}

export default Buy4lessukSellYourCarPage
