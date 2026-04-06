import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'services', canonicalPath: '/services' })
}

export default async function ServicesPage() {
  return renderThemePage({ pageId: 'services', canonicalPath: '/services' })
}
