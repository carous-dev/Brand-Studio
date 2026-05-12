import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import SellYourCarMount from './SellYourCarMount'
import { getBrandContactInfo } from '../../lib/contact'
import styles from './page.module.css'

export function KainSellYourCarPage({ brand }: ThemePageProps) {
  const contact = getBrandContactInfo(brand)
  const cityish = contact.city || contact.county
  const heroTitle = cityish
    ? `The ${cityish} showroom buys cars — paid in cleared funds.`
    : 'The showroom buys cars — paid in cleared funds.'
  return (
    <>
      <PageHero
        variant="sell-your-car"
        eyebrow="Sell your car"
        title={heroTitle}
        lead="Three quick steps, an honest inspection and BACS payment on collection. We don’t auction, we don’t commission-creep."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Sell your car' }]}
        actions={
          <Link href="#valuation" className="kain-btn kain-btn--gold">Start my valuation</Link>
        }
      />

      <section id="valuation" className={`kain-section ${styles.section}`}>
        <div className={styles.inner}>
          <SellYourCarMount brand={brand} />
        </div>
      </section>
    </>
  )
}

export default KainSellYourCarPage
