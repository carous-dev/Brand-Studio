import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import Directory from '../../components/Directory'
import SellYourCarMount from './SellYourCarMount'

export function AutoSellYourCarPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'AUTOWOW UK'

  return (
    <>
      <PageHero
        eyebrow="Sell your car"
        title="Drive in. Drive out. Get paid."
        lead={`Free valuation, same-day decision, paid by faster-payments before you walk back through the door. ${brandName} buys cars on any age, finance status, or condition.`}
        imageSlot="sellYourCar"
        pills={['Free valuation', 'Decision in 24h', 'Paid same day', 'Free collection']}
      />

      <div data-aos="fade-up"><SellYourCarMount /></div>
      <div data-aos="fade-up" data-aos-delay="120"><Directory brand={brand} /></div>
    </>
  )
}

export default AutoSellYourCarPage
