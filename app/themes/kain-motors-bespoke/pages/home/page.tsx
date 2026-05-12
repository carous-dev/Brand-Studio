import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import EditionStrip from '../../components/EditionStrip'
import TrustBand from '../../components/TrustBand'
import FeaturedAcquisitions from '../../components/FeaturedAcquisitions'
import ServicesPreview from '../../components/ServicesPreview'
import AcquisitionsRow from '../../components/AcquisitionsRow'
import PullQuote from '../../components/PullQuote'
import CtaBanner from '../../components/CtaBanner'
import Reviews from '../../components/Reviews'
import BrowseByMake from '../../components/BrowseByMake'

export function KainHomePage(_props: ThemePageProps) {
  return (
    <>
      <Hero />
      <EditionStrip />
      <TrustBand />
      <FeaturedAcquisitions />
      <ServicesPreview />
      <AcquisitionsRow
        title="Recent acquisitions"
        eyebrow="Just landed"
        description="Latest cars to arrive on the forecourt — every one inspected before listing."
        endpoint="inventory-latest"
        cta={{ label: 'Browse all stock', href: '/used-cars' }}
      />
      <PullQuote />
      <CtaBanner />
      <AcquisitionsRow
        title="Recently sold"
        eyebrow="Out the door"
        description="A glimpse of the cars that have recently found new homes."
        endpoint="recently-sold"
        cta={{ label: 'View archive', href: '/recently-sold' }}
      />
      <Reviews />
      <BrowseByMake />
    </>
  )
}

export default KainHomePage
