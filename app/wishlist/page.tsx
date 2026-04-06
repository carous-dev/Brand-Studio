import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'wishlist', canonicalPath: '/wishlist' })
}

export default async function WishlistPage() {
  return renderThemePage({ pageId: 'wishlist', canonicalPath: '/wishlist' })
}
