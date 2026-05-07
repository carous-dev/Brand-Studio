import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'finance', canonicalPath: '/finance' })
}

export default async function FinancePage() {
  return renderThemePage({ pageId: 'finance', canonicalPath: '/finance' })
}
