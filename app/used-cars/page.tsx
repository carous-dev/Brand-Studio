import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'usedCars', canonicalPath: '/used-cars' })
}

type SearchParamValue = string | string[] | undefined
type SearchParamMap = Record<string, SearchParamValue>

export default async function UsedCarsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParamMap> | SearchParamMap
}) {
  const resolvedParams = searchParams ? await Promise.resolve(searchParams) : undefined
  return renderThemePage({ pageId: 'usedCars', canonicalPath: '/used-cars', searchParams: resolvedParams })
}
