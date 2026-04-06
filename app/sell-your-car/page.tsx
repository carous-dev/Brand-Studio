import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'sellYourCar', canonicalPath: '/sell-your-car' })
}

export default async function SellYourCarPage() {
  return renderThemePage({ pageId: 'sellYourCar', canonicalPath: '/sell-your-car' })
}
