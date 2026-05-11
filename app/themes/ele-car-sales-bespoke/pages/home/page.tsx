import type { ThemePageProps } from '../../../types'
import Hero from '../../components/Hero'
import SearchStrip from '../../components/SearchStrip'
import ServiceHighlights from '../../components/ServiceHighlights'
import LatestArrivals from '../../components/LatestArrivals'
import CtaBanner from '../../components/CtaBanner'
import Reviews from '../../components/Reviews'
import Directory from '../../components/Directory'
import { getBrandContactInfo } from '../../lib/contact'

/**
 * Server Component composing the modern-archetype homepage for ELE Car Sales.
 * Section composition (per docs/theme-archetype-specs.md → modern):
 *   Hero → SearchStrip → ServiceHighlights → LatestArrivals → CtaBanner →
 *   Reviews → Directory.
 *
 * No 'use client' directive — interactivity lives in the section components
 * themselves (Header overlay nav, search form), each scoped to what needs it.
 */
export async function EleHomePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'ELE Car Sales'
  const contact = getBrandContactInfo(brand as any)
  const city =
    (brand as any)?.location?.address?.city ||
    (brand as any)?.location?.city ||
    'Shotts'
  const county =
    (brand as any)?.location?.address?.county ||
    (brand as any)?.location?.region ||
    'Lanarkshire'

  return (
    <>
      <Hero brandName={brandName} city={city} county={county} />
      <SearchStrip />
      <ServiceHighlights />
      <LatestArrivals brandName={brandName} />
      <CtaBanner
        eyebrow="Finance, sorted"
        title="Drive away with finance that fits."
        body="Tailored plans from a panel of FCA-approved lenders. Quick eligibility check with no impact on your credit score."
        primaryHref="/finance"
        primaryLabel="Check finance options"
        secondaryHref="/contact"
        secondaryLabel="Speak to the team"
        imageSlot="finance"
      />
      <Reviews />
      <Directory
        brandName={brandName}
        address={contact.showroomAddress || `${city}, ${county}, Scotland`}
        phoneDisplay={contact.phoneDisplay || '01501 000 000'}
        phoneTel={contact.phoneTel || '+441501000000'}
      />
    </>
  )
}

export default EleHomePage
