import type { Metadata } from 'next'
import type { BrandConfig } from '@/brands/types'

export type BuildMetadataInput = {
  title: string
  description?: string
  path?: string
  image?: string
  keywords?: string[]
}

function getSiteUrlFromBrand(brand: BrandConfig | null | undefined): string {
  const candidate = brand?.domain || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return candidate.replace(/\/$/, '')
}

function toAbsolute(siteUrl: string, value?: string): string | undefined {
  if (!value) return undefined
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) return `${siteUrl}${value}`
  return `${siteUrl}/${value}`
}

/**
 * Brand-aware metadata builder. Use inside generateMetadata for theme pages
 * to ensure all titles/descriptions/images reference the active brand rather
 * than the original columbus hardcoded values.
 */
export function buildBrandMetadata(brand: BrandConfig | null | undefined, input: BuildMetadataInput): Metadata {
  const siteUrl = getSiteUrlFromBrand(brand)
  const siteName = brand?.name || 'Used cars'
  const description = input.description || brand?.seo?.description || ''
  const path = input.path ? (input.path.startsWith('/') ? input.path : `/${input.path}`) : '/'
  const canonical = path === '/' ? siteUrl : `${siteUrl}${path}`
  const imageAbsolute = toAbsolute(siteUrl, input.image || brand?.heroImage || brand?.logo)
  const keywords = input.keywords?.length ? input.keywords : (brand?.seo?.keywords as string[] | undefined)

  return {
    title: input.title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: input.title,
      description,
      url: canonical,
      siteName,
      type: 'website',
      locale: 'en_GB',
      images: imageAbsolute ? [{ url: imageAbsolute, alt: siteName }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: input.title,
      description,
      images: imageAbsolute ? [imageAbsolute] : undefined,
      creator: brand?.seo?.twitterHandle,
      site: brand?.seo?.twitterHandle,
    },
  }
}
