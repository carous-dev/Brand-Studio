import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import CategoryBand from '../../components/CategoryBand'
import FeaturedStock from '../../components/FeaturedStock'
import ServiceHighlights from '../../components/ServiceHighlights'
import WhyChooseUs from '../../components/WhyChooseUs'
import RecentlySoldPreview from '../../components/RecentlySoldPreview'
import Reviews from '../../components/Reviews'
import CtaBanner from '../../components/CtaBanner'
import Directory from '../../components/Directory'

export function QueensburyHomePage(_props: ThemePageProps) {
  return (
    <>
      <Hero />
      <CategoryBand />
      <FeaturedStock />
      <ServiceHighlights />
      <WhyChooseUs />
      <RecentlySoldPreview />
      <Reviews />
      <CtaBanner />
      <Directory />
    </>
  )
}

export default QueensburyHomePage
