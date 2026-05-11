import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import SpecsBar from '../../components/SpecsBar'
import LatestArrivals from '../../components/LatestArrivals'
import ServiceHighlights from '../../components/ServiceHighlights'
import RecentlySoldPreview from '../../components/RecentlySoldPreview'
import CtaBanner from '../../components/CtaBanner'
import Reviews from '../../components/Reviews'
import Directory from '../../components/Directory'

export function NcrHomePage(_props: ThemePageProps) {
  return (
    <>
      <Hero />
      <SpecsBar />
      <LatestArrivals />
      <ServiceHighlights />
      <RecentlySoldPreview />
      <CtaBanner />
      <Reviews />
      <Directory />
    </>
  )
}

export default NcrHomePage
