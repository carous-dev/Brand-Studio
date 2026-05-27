import type { Metadata } from "next"

// Inlined thin replacement for `@carous/seo` createSeoBuilder — only the two
// methods consumed below (toAbsoluteUrl + buildMetadata) are exposed.
type SeoBuilderInput = {
  siteUrl: string
  brandName: string
  defaultImage: string
  defaultKeywords: string[]
  locale: string
}
type SeoMetadataInput = { title: string; description: string; path: string; keywords?: string[] }

function createSeoBuilder({ siteUrl, brandName, defaultImage, defaultKeywords, locale }: SeoBuilderInput) {
  const root = siteUrl.replace(/\/+$/, "")

  function toAbsoluteUrl(path = "/"): string {
    if (!path) return root + "/"
    if (/^https?:\/\//i.test(path)) return path
    return root + (path.startsWith("/") ? path : "/" + path)
  }

  function buildMetadata({ title, description, path, keywords = [] }: SeoMetadataInput): Metadata {
    const canonical = toAbsoluteUrl(path)
    const allKeywords = Array.from(new Set([...keywords, ...defaultKeywords])).filter(Boolean)
    const image = toAbsoluteUrl(defaultImage)
    return {
      title,
      description,
      keywords: allKeywords.join(", "),
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: brandName,
        locale,
        images: [{ url: image, alt: brandName }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image],
      },
    }
  }

  return { toAbsoluteUrl, buildMetadata }
}

const FALLBACK_SITE_URL = "https://cnhcars.co.uk"

const normalizeSiteUrl = (input: string) => {
  const trimmed = input.trim().replace(/\/+$/, "")
  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed.replace(/^\/+/, "")}`
  return new URL(normalized).origin
}

const isLocalHostValue = (value: string) =>
  /(^https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value.trim())

const rawConfiguredSiteUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL

const configuredSiteUrl =
  rawConfiguredSiteUrl && !(process.env.NODE_ENV === "production" && isLocalHostValue(rawConfiguredSiteUrl))
    ? rawConfiguredSiteUrl
    : FALLBACK_SITE_URL

export const siteUrl = normalizeSiteUrl(configuredSiteUrl)

export const siteConfig = {
  name: "CNH Cars Ltd",
  legalName: "CNH Cars Ltd",
  locale: "en_GB",
  phoneDisplay: "(07537) 164889",
  phoneIntl: "+447537164889",
  email: "chcars24@yahoo.com",
  description:
    "Quality used cars in Welwyn, Hertfordshire. CNH Cars Ltd offers handpicked vehicles, honest advice, and UK-wide delivery support.",
  address: {
    streetAddress: "113-115 Codicote Road",
    addressLocality: "Welwyn",
    addressRegion: "Hertfordshire",
    postalCode: "AL6 9TY",
    addressCountry: "GB",
  },
  coordinates: {
    latitude: 51.8333,
    longitude: -0.1833,
  },
  openingHours: [
    {
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "16:00",
    },
  ],
} as const

export const defaultKeywords = [
  "used cars welwyn",
  "used cars hertfordshire",
  "welwyn car dealership",
  "quality used cars",
  "car valuations",
  "buying advice",
  "cnh cars ltd",
]

export const defaultOgImage = "/images/cnh-home.png"

const seo = createSeoBuilder({
  siteUrl,
  brandName: siteConfig.name,
  defaultImage: defaultOgImage,
  defaultKeywords,
  locale: siteConfig.locale,
})

export function absoluteUrl(path = "/"): string {
  return seo.toAbsoluteUrl(path)
}

type PageMetadataInput = {
  title: string
  description: string
  path: string
  keywords?: string[]
}

const geoMetadata = {
  "geo.region": "GB-HRT",
  "geo.placename": "Welwyn, Hertfordshire",
  "geo.position": `${siteConfig.coordinates.latitude};${siteConfig.coordinates.longitude}`,
  ICBM: `${siteConfig.coordinates.latitude}, ${siteConfig.coordinates.longitude}`,
}

export function buildPageMetadata({ title, description, path, keywords = [] }: PageMetadataInput): Metadata {
  return {
    ...seo.buildMetadata({ title, description, path, keywords }),
    other: geoMetadata,
  }
}
