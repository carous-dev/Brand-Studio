import type { ThemePageProps } from '../../../types'
import { loadHomeData } from '../../lib/home-data.server'
import HeroSplash from '../../components/HeroSplash'
import FinanceSellSplit from '../../components/FinanceSellSplit'
import FeaturedStock from '../../components/FeaturedStock'
import WelcomeBlock from '../../components/WelcomeBlock'
import ManufacturersBodySplit from '../../components/ManufacturersBodySplit'
import QuickSearchTabs from '../../components/QuickSearchTabs'
import ImageTrio from '../../components/ImageTrio'
import PartnersStrip from '../../components/PartnersStrip'
import PopularMakes from '../../components/PopularMakes'

export async function Buy4lessukHomePage(_: ThemePageProps) {
  const { featured, makes } = await loadHomeData()
  return (
    <>
      <HeroSplash />
      <FinanceSellSplit />
      <FeaturedStock vehicles={featured} />
      <WelcomeBlock />
      <ManufacturersBodySplit makes={makes} />
      <QuickSearchTabs makes={makes} />
      <ImageTrio />
      <PartnersStrip />
      <PopularMakes makes={makes} />
    </>
  )
}

export default Buy4lessukHomePage
