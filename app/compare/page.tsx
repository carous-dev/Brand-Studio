import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'compare', canonicalPath: '/compare' })
}

export default async function ComparePage() {
  return renderThemePage({ pageId: 'compare', canonicalPath: '/compare' })
}
