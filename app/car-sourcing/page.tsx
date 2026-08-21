import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'carSourcing', canonicalPath: '/car-sourcing' })
}

export default async function CarSourcingPage() {
  return renderThemePage({ pageId: 'carSourcing', canonicalPath: '/car-sourcing' })
}
