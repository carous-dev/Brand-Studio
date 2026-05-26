import type { ThemePageProps } from '../../../types'
import PartExFormIsland from './PartExFormIsland'
import styles from './page.module.css'

export function QueensburyPartExchangePage(_props: ThemePageProps) {
  return (
    <>
      <section className="qb-page-hero qb-page-hero--part-exchange" data-aos="fade-up">
        <div className="qb-page-hero__inner">
          <span className="qb-page-hero__eyebrow">Part exchange</span>
          <h1 className="qb-page-hero__title">Trade in. Drive away.</h1>
          <p className="qb-page-hero__lead">
            Plug in your reg, get a guide price in 60 seconds, drop the keys in when you collect your next car.
            No haggling, no chasing.
          </p>
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-container">
          <div className={styles.layout}>
            <div className={styles.formCol} data-aos="fade-up">
              <h2 className={styles.colTitle}>Tell us about your car</h2>
              <p className={styles.colLead}>
                We'll come back the same working day with a guide trade-in figure.
              </p>
              <PartExFormIsland />
            </div>

            <aside className={styles.sideCol} data-aos="fade-up" data-aos-delay="120">
              <h3 className={styles.sideTitle}>How the figure is built</h3>
              <ul className={styles.sideList}>
                <li>
                  <strong>Market data first.</strong> We start from current sold-prices for cars matching yours
                  on age, mileage, and spec.
                </li>
                <li>
                  <strong>Condition adjustment.</strong> Service history, MOT advisories, and visible condition
                  shift the figure up or down — we explain how.
                </li>
                <li>
                  <strong>Outstanding finance handled.</strong> Already on PCP/HP? We'll settle the existing
                  agreement direct with the lender.
                </li>
                <li>
                  <strong>Guaranteed for 7 days.</strong> Our guide figure holds for a week from quote, subject
                  to a physical look-over on collection day.
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}

export default QueensburyPartExchangePage
