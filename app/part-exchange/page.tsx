import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'partExchange', canonicalPath: '/part-exchange' })
}

export default async function PartExchangePage() {
  return renderThemePage({ pageId: 'partExchange', canonicalPath: '/part-exchange' })
}
