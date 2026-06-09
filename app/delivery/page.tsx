import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'delivery', canonicalPath: '/delivery' })
}

export default async function DeliveryPage() {
  return renderThemePage({ pageId: 'delivery', canonicalPath: '/delivery' })
}
