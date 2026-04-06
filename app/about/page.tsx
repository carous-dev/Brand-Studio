import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'about', canonicalPath: '/about' })
}

export default async function AboutPage() {
  return renderThemePage({ pageId: 'about', canonicalPath: '/about' })
}
