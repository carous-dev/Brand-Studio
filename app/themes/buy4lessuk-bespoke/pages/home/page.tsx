import type { ThemePageProps } from '../../../types'
import { loadHomeData } from '../../lib/home-data.server'
import HomeHero from '../../components/HomeHero'
import SearchBand from '../../components/SearchBand'
import InventoryShowcase from '../../components/InventoryShowcase'
import ValuePropsBand from '../../components/ValuePropsBand'
import FinanceTradeSplit from '../../components/FinanceTradeSplit'
import TopBrands from '../../components/TopBrands'

export async function Buy4lessukHomePage(_: ThemePageProps) {
  const { featured, makes, bodies } = await loadHomeData()
  return (
    <>
      <HomeHero />
      <SearchBand makes={makes} bodies={bodies} />
      <InventoryShowcase vehicles={featured} />
      <ValuePropsBand />
      <FinanceTradeSplit />
      <TopBrands makes={makes} />
    </>
  )
}

export default Buy4lessukHomePage
