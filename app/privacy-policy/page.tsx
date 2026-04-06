import type { Metadata } from 'next'
import { generateThemePageMetadata, renderThemePage } from '@/app/themes/page-runtime.server'

export async function generateMetadata(): Promise<Metadata> {
  return generateThemePageMetadata({ pageId: 'privacyPolicy', canonicalPath: '/privacy-policy' })
}

export default async function PrivacyPolicyPage() {
  return renderThemePage({ pageId: 'privacyPolicy', canonicalPath: '/privacy-policy' })
}
