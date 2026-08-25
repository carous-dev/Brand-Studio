import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getBrandForRequest } from '@/app/lib/brandDetection.server'
import { generateVehicleSlug, resolveBrandInventory } from '@/app/lib/loadInventory'
import { getThemePageForBrand } from '@/app/themes/theme-pages.server'
import type { ThemePageId } from '@/app/themes/types'
import type { BrandConfig } from '@/brands/types'
import {
  generateAboutPageSEO,
  generateContactPageSEO,
  generateHomePageSEO,
  generateInventoryPageSEO,
  generateSellCarPageSEO,
  generateServicesPageSEO,
} from '@/lib/generateSEO'

type RoutedThemePageId = Extract<
  ThemePageId,
  | 'home'
  | 'about'
  | 'contact'
  | 'services'
  | 'sellYourCar'
  | 'carSourcing'
  | 'finance'
  | 'partExchange'
  | 'warranty'
  | 'delivery'
  | 'reviews'
  | 'recentlySold'
  | 'usedCars'
  | 'vehicleDetail'
  | 'compare'
  | 'wishlist'
  | 'privacyPolicy'
  | 'cookiePolicy'
>

type SearchParamValue = string | string[] | undefined
type SearchParamMap = Record<string, SearchParamValue>

export type ThemeRouteRuntimeOptions = {
  pageId: RoutedThemePageId
  canonicalPath: string
  noindex?: boolean
  vehicleSlug?: string
  searchParams?: SearchParamMap
}

function notFoundMetadata(): Metadata {
  return {
    title: '404 - Not Found',
    description: 'The page you are looking for does not exist.',
    robots: 'noindex, nofollow',
  }
}

function buildPageMetadata(
  brand: BrandConfig,
  path: string,
  seo: { title: string; description: string; keywords: string[] },
  noindex = false,
): Metadata {
  const siteUrl = (brand?.domain || 'http://localhost:3000').replace(/\/$/, '')
  const canonical = path === '/' ? siteUrl : `${siteUrl}${path}`

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonical,
      siteName: brand.name,
      images: [
        {
          url: brand.logo,
          width: 1200,
          height: 630,
          alt: `${brand.name} logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [brand.logo],
      creator: brand.seo.twitterHandle,
      site: brand.seo.twitterHandle,
    },
    alternates: {
      canonical,
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  }
}

function buildSimpleMetadata(brand: BrandConfig, path: string, title: string, description: string): Metadata {
  const siteUrl = (brand?.domain || 'http://localhost:3000').replace(/\/$/, '')
  const canonical = `${siteUrl}${path}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: brand.name,
      images: [
        {
          url: brand.logo,
          width: 1200,
          height: 630,
          alt: `${brand.name} logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [brand.logo],
      creator: brand.seo.twitterHandle,
      site: brand.seo.twitterHandle,
    },
    alternates: {
      canonical,
    },
  }
}

function buildRecentlySoldMetadata(brand: BrandConfig): Metadata {
  const siteUrl = (brand?.domain || 'http://localhost:3000').replace(/\/$/, '')
  const title = `Recently Sold Cars | ${brand.name}`
  const description = `See our recently sold vehicles at ${brand.name}. Browse through our successful sales and get an idea of what our customers love.`
  const canonical = `${siteUrl}/recently-sold`

  return {
    title,
    description,
    keywords: `recently sold cars, used cars, ${brand.name}, car sales, automotive`,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: brand.name,
      images: [
        {
          url: brand.logo,
          width: 1200,
          height: 630,
          alt: `${brand.name} logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [brand.logo],
      creator: brand.seo.twitterHandle,
      site: brand.seo.twitterHandle,
    },
    alternates: {
      canonical,
    },
  }
}

function toText(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return ''
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = toText(value)
    if (text) return text
  }
  return ''
}

function extractDerivativeFromSubtitle(value: unknown): string {
  const subtitle = toText(value)
  if (!subtitle) return ''
  return subtitle.split('\u2022')[0].trim()
}

function cleanMetaText(value: unknown): string {
  const raw = toText(value)
  if (!raw) return ''
  return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function toCompactVehicle(apiVehicle: any) {
  if (!apiVehicle) return null

  if (apiVehicle.vehicle) {
    const vRow = apiVehicle.vehicle || {}
    const advert = apiVehicle.advert || null
    const makeRow = apiVehicle.make || null
    const modelRow = apiVehicle.model || null
    const features = Array.isArray(apiVehicle.features)
      ? apiVehicle.features.map((f: any) => (f && f.name ? f.name : String(f)))
      : []
    const imagesArr = Array.isArray(apiVehicle.media)
      ? apiVehicle.media
          .map((m: any) => m.href || m.HREF || m.href_string)
          .filter(Boolean)
          .map((src: any) => String(src))
      : []

    const derivedSubtitle = extractDerivativeFromSubtitle(
      firstText(vRow.subTitle, vRow.subtitle, vRow.sub_title),
    )

    return {
      reg: vRow.registration || vRow.vin,
      make: (makeRow && makeRow.name) || vRow.make || undefined,
      model: (modelRow && modelRow.name) || vRow.model || undefined,
      derivative: firstText(vRow.derivative, vRow.trim, vRow.spec, derivedSubtitle) || undefined,
      year: vRow.year_of_manufacture ?? vRow.year ?? undefined,
      price: advert ? advert.forecourt_price_gbp ?? advert.price ?? undefined : vRow.price ?? undefined,
      mileage: vRow.odometer_reading_miles ?? vRow.mileage ?? undefined,
      trans: vRow.transmission_type ?? vRow.trans ?? undefined,
      fuel: vRow.fuel_type ?? vRow.fuel ?? undefined,
      image: imagesArr.length ? imagesArr[0] : vRow.image || undefined,
      images: imagesArr.length ? imagesArr : vRow.images || (vRow.image ? [vRow.image] : []),
      description: vRow.description || advert?.attention_grabber || undefined,
      shortDescription: advert?.attention_grabber || vRow.short_description || vRow.summary || undefined,
      features,
    }
  }

  const derivedSubtitle = extractDerivativeFromSubtitle(
    firstText(apiVehicle.subTitle, apiVehicle.subtitle, apiVehicle.sub_title),
  )

  return {
    ...apiVehicle,
    derivative: firstText(apiVehicle.derivative, apiVehicle.trim, apiVehicle.spec, derivedSubtitle) || undefined,
    description: apiVehicle.description || apiVehicle.long_description || undefined,
    shortDescription: apiVehicle.shortDescription || apiVehicle.short_description || apiVehicle.summary || undefined,
  }
}

function vehicleImages(vehicle: any): string[] {
  if (!vehicle) return []
  if (Array.isArray(vehicle.images) && vehicle.images.length) {
    return vehicle.images.map((src: any) => String(src)).filter(Boolean)
  }
  if (vehicle.image) return [String(vehicle.image)]
  return []
}

function normalizeLookupKey(value: unknown): string {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

async function findVehicleInLocalInventory(slug: string, brandId?: string) {
  const lookup = normalizeLookupKey(slug)
  if (!lookup) return null

  // Carous-bound previews (demo accounts) look up ONLY the dealer's live DMS
  // stock — never the shared placeholder inventory.
  const inventory = await resolveBrandInventory(brandId)
  return inventory.find((item: any) => {
    const generatedSlug = generateVehicleSlug(item)
    const explicitSlug = String(item.slug || item.derivative_slug || '').toLowerCase()
    const reg = String(item.reg || item.registration || '').toLowerCase()
    const keys = [generatedSlug, explicitSlug, reg]
    if (generatedSlug && reg) keys.push(`${generatedSlug}-${reg}`)
    if (explicitSlug && reg) keys.push(`${explicitSlug}-${reg}`)

    return keys.some((key) => {
      const normalized = normalizeLookupKey(key)
      return normalized && (normalized === lookup || (reg && lookup.endsWith(normalizeLookupKey(reg))))
    })
  }) || null
}

async function fetchCollectionItems(
  endpoint: '/api/inventory' | '/api/recently-sold',
  brandId?: string,
  searchParams?: SearchParamMap,
) {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const params = new URLSearchParams()

    if (endpoint === '/api/inventory') {
      const allowed = [
        'page',
        'per_page',
        'q',
        'make',
        'model',
        'fuel',
        'min_price',
        'max_price',
        'max_mileage',
        'min_year',
        'max_year',
        'sort',
      ]

      for (const key of allowed) {
        const rawValue = searchParams?.[key]
        const value = Array.isArray(rawValue) ? rawValue[0] : rawValue
        if (!value) continue
        params.set(key, value)
      }

      if (!params.has('page')) params.set('page', '1')
      if (!params.has('per_page')) params.set('per_page', '12')
      if (!params.has('sort')) params.set('sort', 'newest')
    } else {
      params.set('page', '1')
      params.set('per_page', '12')
    }

    const res = await fetch(`${protocol}://${host}${endpoint}?${params.toString()}`, {
      cache: 'no-store',
      headers: brandId ? { 'x-brand': brandId } : undefined,
    })

    if (!res.ok) {
      return []
    }

    const payload = await res.json()
    if (Array.isArray(payload?.items)) return payload.items
    if (Array.isArray(payload)) return payload
    return []
  } catch {
    return []
  }
}

async function fetchVehicleBySlug(slug: string, brandId?: string) {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const url = new URL(
      `/api/vehicle?slug=${encodeURIComponent(slug)}&brand=${encodeURIComponent(brandId || '')}`,
      `${protocol}://${host}`,
    ).toString()

    const res = await fetch(url, {
      cache: 'no-store',
      headers: brandId ? { 'x-brand': brandId } : undefined,
    })

    if (!res.ok) {
      return await findVehicleInLocalInventory(slug, brandId)
    }

    const data = await res.json()
    return data?.vehicle ?? data ?? (await findVehicleInLocalInventory(slug, brandId))
  } catch {
    return await findVehicleInLocalInventory(slug, brandId)
  }
}

async function fetchSimilarVehicles(slug: string, brandId?: string) {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const url = new URL(`/api/vehicle/similar?slug=${encodeURIComponent(slug)}&limit=6`, `${protocol}://${host}`).toString()

    const res = await fetch(url, {
      cache: 'no-store',
      headers: brandId ? { 'x-brand': brandId } : undefined,
    })
    if (!res.ok) return []

    const data = await res.json()
    return Array.isArray(data?.items) ? data.items : []
  } catch {
    return []
  }
}

function buildVehicleMetadata(brand: BrandConfig, vehicle: any, slug: string): Metadata {
  if (!vehicle) {
    return {
      title: 'Vehicle not found',
      description: 'The requested vehicle could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const images = vehicleImages(vehicle)
  const siteUrl = (brand?.domain || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const vehicleUrl = `${siteUrl}/used-cars/${encodeURIComponent(slug)}`
  const imageUrls = images.map((src) => (src.startsWith('http') ? src : `${siteUrl}${src}`))
  const primaryImage = imageUrls[0] || brand.logo

  const title =
    [vehicle.year, vehicle.make, vehicle.model, vehicle.derivative]
      .map((part) => toText(part))
      .filter(Boolean)
      .join(' ')
      .trim() || 'Vehicle Details'

  const detailDesc = cleanMetaText(
    vehicle.description || vehicle.shortDescription || vehicle.subTitle || vehicle.subtitle || '',
  )
  const fuelType = vehicle.fuel || ''
  const transmission = vehicle.trans || ''
  const mileage = vehicle.mileage ? `${Number(vehicle.mileage).toLocaleString('en-GB')} miles` : ''
  const price = vehicle.price ? `£${Number(vehicle.price).toLocaleString('en-GB')}` : ''

  let description = ''
  if (detailDesc) {
    description = detailDesc
    if (description.toLowerCase().startsWith(title.toLowerCase())) {
      description = description.substring(title.length).trim()
      if (description.startsWith('-')) {
        description = description.substring(1).trim()
      }
    }
  } else {
    const specs = []
    if (price) specs.push(`priced at ${price}`)
    if (fuelType) specs.push(`${fuelType} engine`)
    if (transmission) specs.push(`${transmission} transmission`)
    if (mileage) specs.push(`with ${mileage}`)

    description =
      specs.length > 0
        ? `${specs.join(', ')}. Available at ${brand.name}.`
        : `Available for sale at ${brand.name}. Quality used vehicle with specialist health check and exceptional service.`
  }

  description = description.slice(0, 160).trim()
  if (description.length > 157) {
    description = `${description.slice(0, 157)}...`
  }

  const keywords = [
    vehicle.make,
    vehicle.model,
    vehicle.derivative,
    vehicle.year?.toString(),
    fuelType,
    transmission,
    'used car',
    'second hand car',
    'car for sale',
    'car finance',
    'home delivery',
    'quality used vehicles',
  ]
    .filter(Boolean)
    .join(', ')

  return {
    title,
    description,
    keywords,
    alternates: { canonical: vehicleUrl },
    openGraph: {
      title,
      description,
      url: vehicleUrl,
      siteName: brand.name,
      type: 'website',
      locale: 'en_GB',
      images: imageUrls.length
        ? [{ url: primaryImage, alt: title }, ...imageUrls.slice(1).map((url) => ({ url }))]
        : [{ url: primaryImage, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryImage],
      creator: brand.seo.twitterHandle,
      site: brand.seo.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export async function generateThemePageMetadata(options: ThemeRouteRuntimeOptions): Promise<Metadata> {
  const brandResult = await getBrandForRequest()
  if (!brandResult) {
    return notFoundMetadata()
  }

  const { brand, brandId } = brandResult

  if (options.pageId === 'home') {
    const seo = generateHomePageSEO(brand)
    return buildPageMetadata(brand, options.canonicalPath, seo, options.noindex)
  }

  if (options.pageId === 'about') {
    const seo = generateAboutPageSEO(brand)
    return buildPageMetadata(brand, options.canonicalPath, seo)
  }

  if (options.pageId === 'contact') {
    const seo = generateContactPageSEO(brand)
    return buildPageMetadata(brand, options.canonicalPath, seo)
  }

  if (options.pageId === 'services') {
    const seo = generateServicesPageSEO(brand)
    return buildPageMetadata(brand, options.canonicalPath, seo)
  }

  if (options.pageId === 'sellYourCar') {
    const seo = generateSellCarPageSEO(brand)
    return buildPageMetadata(brand, options.canonicalPath, seo)
  }

  if (options.pageId === 'carSourcing') {
    return buildSimpleMetadata(
      brand,
      options.canonicalPath,
      `Car Sourcing | ${brand.name}`,
      `Can't find it in stock? ${brand.name} will source the exact car you want — specced, inspected and prepared to our standard.`,
    )
  }

  if (options.pageId === 'finance') {
    const seo = generateServicesPageSEO(brand)
    return buildPageMetadata(brand, options.canonicalPath, { ...seo, title: `Finance | ${brand.name}` })
  }

  if (options.pageId === 'partExchange') {
    const seo = generateSellCarPageSEO(brand)
    return buildPageMetadata(brand, options.canonicalPath, { ...seo, title: `Sell Your Car | ${brand.name}` })
  }

  if (options.pageId === 'warranty') {
    return buildSimpleMetadata(
      brand,
      options.canonicalPath,
      `Warranty | ${brand.name}`,
      `Learn about used car warranty options and aftersales support from ${brand.name}.`,
    )
  }

  if (options.pageId === 'delivery') {
    return buildSimpleMetadata(
      brand,
      options.canonicalPath,
      `Delivery | ${brand.name}`,
      `Learn about collection, handover and vehicle delivery options from ${brand.name}.`,
    )
  }

  if (options.pageId === 'reviews') {
    return buildSimpleMetadata(
      brand,
      options.canonicalPath,
      `Reviews | ${brand.name}`,
      `Read customer reviews and recent buyer feedback for ${brand.name}.`,
    )
  }

  if (options.pageId === 'usedCars') {
    const seo = generateInventoryPageSEO(brand)
    return buildPageMetadata(brand, options.canonicalPath, seo)
  }

  if (options.pageId === 'recentlySold') {
    return buildRecentlySoldMetadata(brand)
  }

  if (options.pageId === 'compare') {
    return buildSimpleMetadata(
      brand,
      options.canonicalPath,
      `Compare Vehicles | ${brand.name}`,
      `Compare selected vehicles side by side at ${brand.name}.`,
    )
  }

  if (options.pageId === 'wishlist') {
    return buildSimpleMetadata(
      brand,
      options.canonicalPath,
      `Wishlist | ${brand.name}`,
      `Save your favourite vehicles and review them later.`,
    )
  }

  if (options.pageId === 'privacyPolicy') {
    return buildSimpleMetadata(
      brand,
      options.canonicalPath,
      `Privacy Policy | ${brand.name}`,
      `Learn how ${brand.name} collects, uses, and protects your personal information.`,
    )
  }

  if (options.pageId === 'cookiePolicy') {
    return buildSimpleMetadata(
      brand,
      options.canonicalPath,
      `Cookie Policy | ${brand.name}`,
      `Learn how ${brand.name} uses cookies and how you can control cookie preferences.`,
    )
  }

  if (options.pageId === 'vehicleDetail') {
    if (!options.vehicleSlug) {
      return notFoundMetadata()
    }
    const vehicleData = await fetchVehicleBySlug(options.vehicleSlug, brandId)
    const vehicle = toCompactVehicle(vehicleData)
    return buildVehicleMetadata(brand, vehicle, options.vehicleSlug)
  }

  return notFoundMetadata()
}

export async function renderThemePage(options: ThemeRouteRuntimeOptions) {
  const brandResult = await getBrandForRequest()
  if (!brandResult) {
    notFound()
  }

  const { brand, brandId } = brandResult
  const ThemedPage = await getThemePageForBrand(brand, options.pageId)

  if (!ThemedPage) {
    notFound()
  }

  if (options.pageId === 'usedCars') {
    const items = await fetchCollectionItems('/api/inventory', brandId, options.searchParams)
    return <ThemedPage brand={brand} initialInventory={items} />
  }

  if (options.pageId === 'recentlySold') {
    const items = await fetchCollectionItems('/api/recently-sold', brandId)
    return <ThemedPage brand={brand} initialInventory={items} />
  }

  if (options.pageId === 'vehicleDetail') {
    if (!options.vehicleSlug) {
      notFound()
    }

    const vehicleData = await fetchVehicleBySlug(options.vehicleSlug, brandId)
    if (!vehicleData) {
      notFound()
    }

    const vehicle = toCompactVehicle(vehicleData)
    const images = vehicleImages(vehicle)
    const similarList = await fetchSimilarVehicles(options.vehicleSlug, brandId)

    const siteUrl = (brand?.domain || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
    const vehicleUrl = `${siteUrl}/used-cars/${encodeURIComponent(options.vehicleSlug)}`

    const ld: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      name: `${vehicle.year ? `${vehicle.year} ` : ''}${vehicle.make || ''} ${vehicle.model || ''}${
        vehicle.derivative ? ` ${vehicle.derivative}` : ''
      }`.trim(),
      description: vehicle.description || vehicle.shortDescription || '',
      image: images.length ? images : undefined,
      brand: {
        '@type': 'Brand',
        name: vehicle.make || undefined,
      },
      model: vehicle.model || undefined,
      vehicleModelDate: vehicle.year ? `${vehicle.year}-01-01` : undefined,
      vehicleConfiguration: vehicle.derivative || undefined,
      vehicleIdentificationNumber: vehicle.reg || undefined,
      fuelType: vehicle.fuel || undefined,
      vehicleTransmission: vehicle.trans || undefined,
      mileageFromOdometer: {
        '@type': 'QuantitativeValue',
        value: vehicle.mileage || undefined,
        unitCode: 'MII',
        unitText: 'miles',
      },
      offers:
        vehicle.price != null
          ? {
              '@type': 'Offer',
              price: String(vehicle.price),
              priceCurrency: 'GBP',
              url: vehicleUrl,
              availability: 'https://schema.org/InStock',
              seller: {
                '@type': 'AutoDealer',
                name: brand.name,
                url: siteUrl,
              },
            }
          : undefined,
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'condition',
          value: 'Used',
        },
        {
          '@type': 'PropertyValue',
          name: 'category',
          value: 'Cars for Sale',
        },
      ],
    }

    return (
      <>
        <ThemedPage brand={brand} vehicle={vehicle} vehicleSlug={options.vehicleSlug} images={images} similarList={similarList} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </>
    )
  }

  return <ThemedPage brand={brand} />
}
