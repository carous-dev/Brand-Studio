import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import SpecsBar from '../../components/SpecsBar'
import LatestArrivalsSection from '../../components/LatestArrivalsSection'
import ServicesSection from '../../components/ServicesSection'
import RecentlySoldPreview from '../../components/RecentlySoldPreview'
import CtaBanner from '../../components/CtaBanner'
import ReviewsSection from '../../components/ReviewsSection'
import DirectorySection from '../../components/DirectorySection'

export function AutoHomePage(_props: ThemePageProps) {
  return (
    <>
      <Hero />
      <SpecsBar />
      <LatestArrivalsSection />
      <div className="auto-diagonal-divider" aria-hidden="true" />
      <ServicesSection />
      <RecentlySoldPreview />
      <CtaBanner />
      <ReviewsSection />
      <DirectorySection />
    </>
  )
}

export default AutoHomePage
