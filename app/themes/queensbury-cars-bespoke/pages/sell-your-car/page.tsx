import type { ThemePageProps } from '../../../types'
import SellYourCarMount from './SellYourCarMount'

export function QueensburySellYourCarPage({ brand }: ThemePageProps) {
  return (
    <>
      <section className="qb-page-hero qb-page-hero--sell" data-aos="fade-up">
        <div className="qb-page-hero__inner">
          <span className="qb-page-hero__eyebrow">Sell your car</span>
          <h1 className="qb-page-hero__title">Three steps to a clean handover.</h1>
          <p className="qb-page-hero__lead">
            Plug in your reg, see a guide trade-price, share your details. We come back the same working day —
            often within the hour.
          </p>
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-container">
          <SellYourCarMount brand={brand} />
        </div>
      </section>
    </>
  )
}

export default QueensburySellYourCarPage
