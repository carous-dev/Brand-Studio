import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'reviews', canonicalPath: '/reviews' })
}

export default async function ReviewsPage() {
  return renderThemePage({ pageId: 'reviews', canonicalPath: '/reviews' })
}
