import type { ThemePageProps } from '../../../types'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../../lib/inventory'
import Hero from '../../components/Hero'
import EditorialIntro from '../../components/EditorialIntro'
import FeaturedStock from '../../components/FeaturedStock'
import ServiceHighlights from '../../components/ServiceHighlights'
import RecentlySoldPreview from '../../components/RecentlySoldPreview'
import CTABand from '../../components/CTABand'
import Directory from '../../components/Directory'

async function fetchVehicles(params: Record<string, string>): Promise<InventoryVehicle[]> {
  try {
    const usp = new URLSearchParams(params)
    const res = await fetch(apiUrl(`/inventory?${usp.toString()}`), { next: { revalidate: 60 } })
    if (!res.ok) return []
    const data = await res.json()
    const raw = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    return raw.map(normalizeInventoryItem).filter(Boolean) as InventoryVehicle[]
  } catch {
    return []
  }
}

/**
 * Home page composition for axis-autos-bespoke. Reflects the fingerprint
 * homepageSections array: hero → editorial-intro → featured-stock →
 * service-highlights → recently-sold-preview → cta-band → directory.
 */
export async function AxisHomePage({ brand: _brand }: ThemePageProps) {
  const [featured, sold] = await Promise.all([
    fetchVehicles({ per_page: '6', sort: 'newest', light: '1' }),
    fetchVehicles({ per_page: '4', sort: 'newest', light: '1', sold: '1' }),
  ])

  return (
    <>
      <Hero featuredCount={featured.length} />
      <EditorialIntro />
      <FeaturedStock vehicles={featured} />
      <ServiceHighlights />
      <RecentlySoldPreview vehicles={sold} />
      <CTABand />
      <Directory />
    </>
  )
}

export default AxisHomePage
