import { resolveText } from '../../lib/brand-text'
import { PageHero } from '../../components/PageHero'
import { sellImage as defaultSell } from '../../lib/cars'
import SellFormClient from './SellFormClient'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

const stepsCopy: Array<[string, string]> = [
  ['Tell us about your car', 'Registration, mileage, and a few details about its condition.'],
  ['Get your valuation', 'A real person reviews it — no algorithm lowballs — and replies within 24 hours.'],
  ['Same-day payment', 'Accept the offer, we collect or you drop off, and funds clear the same day.'],
]

export function FbmSellYourCarPage({ brand }: ThemePageProps) {
  const heroBg = brand.images?.sellYourCar || brand.heroImage || defaultSell
  const sellPhoto = brand.images?.sellYourCar || defaultSell

  const heroTitle = resolveText(brand, 'sellHeroTitle')
  const heroLead = resolveText(brand, 'sellHeroLead')

  return (
    <>
      <PageHero image={heroBg} title={heroTitle} lead={heroLead} />

      <section className={styles.wrap}>
        <div>
          <p className={styles.eyebrow}>How it works</p>
          <ol className={styles.steps}>
            {stepsCopy.map(([t, b], i) => (
              <li key={t} className={styles.step}>
                <span className={styles.stepBadge}>{i + 1}</span>
                <div>
                  <h3 className={styles.stepTitle}>{t}</h3>
                  <p className={styles.stepBody}>{b}</p>
                </div>
              </li>
            ))}
          </ol>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sellPhoto} alt="" width={600} height={300} className={styles.sellImage} />
          <div className={styles.ratingCard}>
            <p className={styles.ratingNumber}>4.9/5</p>
            <p className={styles.ratingBody}>
              Average seller rating across AutoTrader and Feefo. Fair offers, zero pressure.
            </p>
          </div>
        </div>

        <SellFormClient />
      </section>
    </>
  )
}

export default FbmSellYourCarPage
