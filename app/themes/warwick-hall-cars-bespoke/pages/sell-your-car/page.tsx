import Link from 'next/link'
import { ArrowRight, BadgePoundSterling } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import SellYourCarWidgetMount from '../../components/SellYourCarWidgetMount'
import styles from '../info-page.module.css'

export function WarwickSellYourCarPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Warwick Hall Cars'

  return (
    <main className={styles.page} style={{ '--page-hero-image': 'var(--brand-image-sell-your-car)' } as any}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>
            <BadgePoundSterling size={17} aria-hidden="true" />
            Sell your car
          </span>
          <h1 className={styles.heroTitle}>Get a dealer-backed valuation.</h1>
          <p className={styles.heroLead}>
            Tell {brandName} about your vehicle using the sell-your-car widget. The team will
            review your details and contact you with the next step.
          </p>
          <div className={styles.heroActions}>
            <Link href="#valuation" className={styles.primaryLink}>
              Start valuation
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link href="/contact" className={styles.secondaryLink}>
              Speak to the team
            </Link>
          </div>
        </div>
      </section>

      <section id="valuation" className={styles.widgetSection}>
        <div className={styles.shell}>
          <SellYourCarWidgetMount />
        </div>
      </section>
    </main>
  )
}

export default WarwickSellYourCarPage
