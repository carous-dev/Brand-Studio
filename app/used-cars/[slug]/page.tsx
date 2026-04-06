import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

type VehicleDetailParams = {
  slug: string
}

type VehicleDetailPageProps = {
  params: Promise<VehicleDetailParams> | VehicleDetailParams
}

export async function generateMetadata({ params }: VehicleDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  return generateThemePageMetadata({
    pageId: 'vehicleDetail',
    canonicalPath: `/used-cars/${encodeURIComponent(slug)}`,
    vehicleSlug: slug,
  })
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const { slug } = await params
  return renderThemePage({
    pageId: 'vehicleDetail',
    canonicalPath: `/used-cars/${encodeURIComponent(slug)}`,
    vehicleSlug: slug,
  })
}
