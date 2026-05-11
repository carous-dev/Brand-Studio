import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import Directory from '../../components/Directory'
import PartExFormIsland from './PartExFormIsland'
import styles from './page.module.css'

export function AutoPartExchangePage({ brand }: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Part-exchange"
        title="Drive your old one onto our forecourt."
        lead="A written valuation in under 60 seconds. Drive in, drive out — we’ll handle the paperwork and roll the equity straight into your next car."
        imageSlot="partExchange"
        pills={['60-second valuation', 'No-pressure offer', 'Equity rolled forward']}
      />

      <section className={styles.body} data-aos="fade-up">
        <div className={styles.bodyInner}>
          <div className={styles.intro} data-aos="fade-up" data-aos-delay="120">
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDash} aria-hidden="true" />
              How it works
            </p>
            <h2 className={styles.heading}>Honest valuation. No haggling.</h2>
            <ul className={styles.bullets}>
              <li>
                <span className={styles.bulletIcon} aria-hidden="true">✓</span>
                <span><strong>Free, written valuation</strong> — yours to walk away with.</span>
              </li>
              <li>
                <span className={styles.bulletIcon} aria-hidden="true">✓</span>
                <span><strong>Outstanding finance OK</strong> — we settle direct with the lender.</span>
              </li>
              <li>
                <span className={styles.bulletIcon} aria-hidden="true">✓</span>
                <span><strong>Equity rolled forward</strong> — straight onto your next car or back to you.</span>
              </li>
              <li>
                <span className={styles.bulletIcon} aria-hidden="true">✓</span>
                <span><strong>No obligation</strong> — change your mind any time before signing.</span>
              </li>
            </ul>
          </div>

          <PartExFormIsland />
        </div>
      </section>

      <div data-aos="fade-up" data-aos-delay="200"><Directory brand={brand} /></div>
    </>
  )
}

export default AutoPartExchangePage
