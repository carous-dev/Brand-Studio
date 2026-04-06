import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'contact', canonicalPath: '/contact' })
}

export default async function ContactPage() {
  return renderThemePage({ pageId: 'contact', canonicalPath: '/contact' })
}
