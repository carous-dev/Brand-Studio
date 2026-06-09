import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'warranty', canonicalPath: '/warranty' })
}

export default async function WarrantyPage() {
  return renderThemePage({ pageId: 'warranty', canonicalPath: '/warranty' })
}
