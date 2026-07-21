import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageShell from '../../components/PageShell'
import styles from './page.module.css'

export function Buy4lessukAboutPage({ brand }: ThemePageProps) {
  const name = (brand?.name || 'Buy4Less UK').trim()
  const city = (brand as any)?.location?.address?.city || (brand as any)?.location?.city || 'the UK'
  return (
    <>
      <PageHero title={`About ${name}`} eyebrow="Our story" slot="about" />
      <PageShell narrow>
        <div className={styles.lead}>
          <p>
            {name} is a family-run used-car dealership based in {city}. We pride ourselves on
            sourcing carefully prepared vehicles and treating every customer with the same
            honesty and detail we'd want for ourselves.
          </p>
          <p>
            Every car we sell is hand-picked, fully inspected, and prepared by our workshop
            team before it reaches the forecourt. We're proud of our review record and the
            steady stream of returning customers who buy from us, refer friends, and trust us
            with their next car.
          </p>
        </div>

        <ul className={styles.pillars}>
          <li>
            <h3>Hand-selected stock</h3>
            <p>Quality used cars sourced and inspected by our buying team — never auction-fresh.</p>
          </li>
          <li>
            <h3>Tailored finance</h3>
            <p>Flexible HP and PCP from a panel of lenders, with weekly payments to suit every budget.</p>
          </li>
          <li>
            <h3>Honest part-exchange</h3>
            <p>Free valuation. Fair price, settled finance, and same-day collection if needed.</p>
          </li>
        </ul>

        <div className={styles.cta}>
          <Link href="/used-cars" className={styles.ctaPrimary}>Browse stock</Link>
          <Link href="/contact" className={styles.ctaGhost}>Visit the showroom</Link>
        </div>
      </PageShell>
    </>
  )
}

export default Buy4lessukAboutPage
