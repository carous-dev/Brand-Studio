import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CtaImageBand from '../../components/CtaImageBand'
import SellYourCarMount from './SellYourCarMount'
import styles from './page.module.css'

export function ChesterfieldSellYourCarPage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Sell your car"
        title={<>Fair dealer valuation. <span className={styles.heroAccent}>Same-day handover</span>.</>}
        lead="Drop in your registration. We&rsquo;ll give you an online guide trade price and confirm an offer within 24 hours."
        imageVar="var(--brand-image-sell-your-car)"
      />

      <section className={styles.widgetSection} aria-label="Sell your car valuation wizard">
        <div className={styles.widgetInner}>
          <SellYourCarMount />
        </div>
      </section>

      <CtaImageBand variant="contact" />
    </>
  )
}

export default ChesterfieldSellYourCarPage
