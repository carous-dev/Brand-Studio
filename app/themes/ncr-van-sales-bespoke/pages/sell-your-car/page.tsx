import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import SellYourCarMount from './SellYourCarMount'

export function NcrSellYourCarPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'NCR Van Sales Ltd'
  return (
    <>
      <PageHero
        eyebrow="Sell your van"
        title="Sell your van. We'll do the legwork."
        lead={`No auction queues, no haggling. ${brandName} will value your van, collect it free of charge from anywhere in mainland UK, and pay you same-day.`}
        imageSlot="sellYourCar"
        pills={['Free valuation', 'Decision in 24h', 'Same-day payment', 'Free collection']}
      />
      <SellYourCarMount />
    </>
  )
}

export default NcrSellYourCarPage
