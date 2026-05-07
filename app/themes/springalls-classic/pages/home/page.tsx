import Hero from '../../components/Hero'
import TrustSignalsSection from '../../components/TrustSignalsSection'
import LatestArrivalsSection from '../../components/LatestArrivalsSection'
import ServiceHighlightsSection from '../../components/ServiceHighlightsSection'
import ServicesSection from '../../components/ServicesSection'
import CtaSection from '../../components/CtaSection'
import ReviewsSection from '../../components/ReviewsSection'
import DirectorySection, { fetchInventoryMakes } from '../../components/DirectorySection'
import type { ThemePageProps } from '../../../types'

export async function SpringallsHomePage({ brand }: ThemePageProps) {
  const directoryItems = (await fetchInventoryMakes()) || []
  const brandName = (brand as any)?.name || 'Springalls Car Sales'
  const county = (brand as any)?.location?.address?.county || 'Berkshire'

  return (
    <>
      <Hero />
      <TrustSignalsSection />
      <LatestArrivalsSection />
      <ServiceHighlightsSection />
      <ServicesSection />
      <CtaSection />
      <ReviewsSection />
      <DirectorySection
        items={Array.isArray(directoryItems) ? directoryItems : []}
        brandName={brandName}
        county={county}
      />
    </>
  )
}

export default SpringallsHomePage
