import type { ThemePageProps } from '../../../types'
import SellCarForm from '../../components/SellCarForm'
import How from '../../components/How'
import SellCTA from '../../components/SellCTA'
import BreadcrumbSchema from '../../components/BreadcrumbSchema'

export function GildedSellYourCarPage(_: ThemePageProps) {
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Sell Your Car', url: '/sell-your-car' },
  ]

  return (
    <main>
      <BreadcrumbSchema items={breadcrumbs} />
      <SellCarForm />
      <How />
      <SellCTA />
    </main>
  )
}

export default GildedSellYourCarPage
