import Link from 'next/link'
import { ArrowRight, BadgePoundSterling } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import SellYourCarWidgetMount from '../../components/SellYourCarWidgetMount'
import styles from '../info-page.module.css'

export function WarwickPartExchangePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Warwick Hall Cars'

  return (
    <main className={styles.page} style={{ '--page-hero-image': 'var(--brand-image-sell-your-car)' } as any}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>
            <BadgePoundSterling size={17} aria-hidden="true" />
            Sell your car
          </span>
          <h1 className={styles.heroTitle}>Sell your car to {brandName}.</h1>
          <p className={styles.heroLead}>
            The old part-exchange page has been replaced with a sell-your-car valuation flow.
            Enter your registration and mileage to start a no-obligation request.
          </p>
          <div className={styles.heroActions}>
            <Link href="#valuation" className={styles.primaryLink}>
              Start valuation
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/used-cars" className={styles.secondaryLink}>
              Browse stock
            </Link>
          </div>
        </div>
      </section>

      <section id="valuation" className={styles.widgetSection}>
        <div className={styles.shell}>
          <SellYourCarWidgetMount source="part-exchange" />
        </div>
      </section>
    </main>
  )
}

export default WarwickPartExchangePage
