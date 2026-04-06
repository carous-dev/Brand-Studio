import type { ThemePageProps } from '../../../types'
import SellCarForm from '../../components/SellCarForm'

export function ClassicSellYourCarPage(_: ThemePageProps) {
  return (
    <main className="sell-theme">
      <SellCarForm className="has-image" />
    </main>
  )
}

export default ClassicSellYourCarPage
