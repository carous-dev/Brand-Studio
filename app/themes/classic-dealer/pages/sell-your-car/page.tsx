import type { ThemePageProps } from '../../../types'
import SellYourCarHero from '../../components/SellYourCarHero'
import SellYourCarCdn from '../../components/SellYourCarCdn'
import '../../styles/sell-your-car.css'

export function ClassicSellYourCarPage(_: ThemePageProps) {
  return (
    <main className="sell-theme">
      <SellYourCarHero />
      <SellYourCarCdn />
    </main>
  )
}

export default ClassicSellYourCarPage
