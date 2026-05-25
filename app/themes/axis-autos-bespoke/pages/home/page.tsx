import Hero from '../../components/Hero'
import StockTable from '../../components/StockTable'
import CategoryBand from '../../components/CategoryBand'
import WhyChooseUs from '../../components/WhyChooseUs'
import ServicesGridTextOnly from '../../components/ServicesGridTextOnly'
import StatsBand from '../../components/StatsBand'
import CtaBand from '../../components/CtaBand'
import Reviews from '../../components/Reviews'
import { apiUrl } from '../../lib/api'
import { getBrandSlugFromRequest } from '../../lib/brand-slug.server'
import type { ThemePageProps } from '../../../types'

type HomeData = {
  featured: any[]
  meta: { total?: number; makes: string[]; bodies: string[] }
}

async function fetchHomeData(): Promise<HomeData> {
  let featured: any[] = []
  let total: number | undefined
  let makes: string[] = []
  let bodies: string[] = []
  const brand = await getBrandSlugFromRequest()

  try {
    const params = new URLSearchParams()
    params.set('limit', '6')
    params.set('light', '1')
    if (brand) params.set('brand', brand)
    const res = await fetch(apiUrl(`/featured-vehicles?${params.toString()}`), { cache: 'no-store' })
    if (res.ok) {
      const payload = await res.json()
      featured = Array.isArray(payload) ? payload : Array.isArray(payload?.items) ? payload.items : []
    }
  } catch {
    featured = []
  }

  try {
    const params = new URLSearchParams()
    params.set('page', '1')
    params.set('per_page', '12')
    params.set('light', '1')
    params.set('vehicle_type', 'car')
    params.set('stock_status', 'in_stock')
    if (brand) params.set('brand', brand)
    const res = await fetch(apiUrl(`/inventory?${params.toString()}`), { cache: 'no-store' })
    if (res.ok) {
      const payload = await res.json()
      total = typeof payload?.meta?.total === 'number' ? payload.meta.total : undefined
      const m = payload?.meta?.available?.makes
      const b = payload?.meta?.available?.body_types
      makes = Array.isArray(m) ? m.filter((x: unknown): x is string => typeof x === 'string' && x.length > 0) : []
      bodies = Array.isArray(b) ? b.filter((x: unknown): x is string => typeof x === 'string' && x.length > 0) : []
    }
  } catch {
    /* keep defaults */
  }

  return { featured, meta: { total, makes, bodies } }
}

export async function AxisHomePage(_props: ThemePageProps) {
  const { featured, meta } = await fetchHomeData()

  return (
    <>
      <Hero featuredCount={meta.total} />
      <StockTable vehicles={featured} />
      <CategoryBand availableBodies={meta.bodies} />
      <WhyChooseUs />
      <ServicesGridTextOnly />
      <StatsBand stockCount={meta.total} />
      <CtaBand />
      <Reviews />
    </>
  )
}

export default AxisHomePage
