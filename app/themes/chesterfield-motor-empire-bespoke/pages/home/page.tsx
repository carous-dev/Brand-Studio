import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import SpecsBar from '../../components/SpecsBar'
import LatestArrivalsRail from '../../components/LatestArrivalsRail'
import ServicesGrid from '../../components/ServicesGrid'
import WhyUsStrip from '../../components/WhyUsStrip'
import RecentlySoldStrip from '../../components/RecentlySoldStrip'
import CtaImageBand from '../../components/CtaImageBand'
import ReviewsBand from '../../components/ReviewsBand'

export function ChesterfieldHomePage(_props: ThemePageProps) {
  return (
    <>
      <Hero />
      <SpecsBar />
      <LatestArrivalsRail />
      <ServicesGrid />
      <WhyUsStrip />
      <RecentlySoldStrip />
      <CtaImageBand variant="sell" />
      <ReviewsBand />
    </>
  )
}

export default ChesterfieldHomePage
