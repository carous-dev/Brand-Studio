import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'recentlySold', canonicalPath: '/recently-sold' })
}

export default async function RecentlySoldPage() {
  return renderThemePage({ pageId: 'recentlySold', canonicalPath: '/recently-sold' })
}
