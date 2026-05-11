import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import SellYourCarMount from './SellYourCarMount'

/**
 * ELE Car Sales — Sell Your Car page.
 *
 * Mounts the brandstudio-global `<SellYourCarWidget />` (ported from
 * carous-platform's `@carous/sell-your-car`) — 3-step wizard with vehicle
 * lookup, guide valuation, and contact-details capture. The mount component
 * is a co-located client island so this page stays a Server Component.
 */
export function EleSellYourCarPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'ELE Car Sales'
  return (
    <main>
      <PageHero
        eyebrow="Sell your car"
        title="Sell your car the easy way."
        lead={`No haggling, no auction queues. ${brandName} will value your car, collect it free of charge from anywhere in mainland UK, and pay you same-day.`}
        imageSlot="sellYourCar"
        pills={['Free valuation', 'Decision in 24h', 'Paid same day', 'Free collection']}
      />

      <SellYourCarMount />
    </main>
  )
}

export default EleSellYourCarPage
