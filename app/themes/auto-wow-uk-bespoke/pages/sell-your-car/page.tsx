import type { ThemePageProps } from '../../../types'
import SellYourCarMount from './SellYourCarMount'

export function AutoSellYourCarPage(_props: ThemePageProps) {
  return (
    <>
      <section className="auto-page-hero auto-page-hero--sell-your-car">
        <div className="auto-page-hero-inner">
          <p className="auto-page-hero-crumb">Sell your car</p>
          <h1>Honest valuation in minutes.</h1>
          <p>
            Three quick steps: registration + mileage, instant guide trade price, contact details.
            We&rsquo;ll come back with a firm offer the same working day.
          </p>
        </div>
      </section>
      <SellYourCarMount />
    </>
  )
}

export default AutoSellYourCarPage
