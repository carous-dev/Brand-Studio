export type ThemeColors = {
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  // Allow legacy/extra derived keys used across the codebase (e.g. accentPrimary, bgPrimary, textPrimary)
  [key: string]: string | undefined
}

export type ThemeFonts = {
  ui?: string
  brand?: string
  mono?: string
  [key: string]: string | undefined
}

export type ThemeConfig = {
  id?: string
  themeId?: string
  colors: ThemeColors
  fonts?: ThemeFonts
  [key: string]: unknown
}

export type BrandLocation = {
  address: {
    line1?: string
    line2?: string
    city: string
    county?: string
    postcode: string
    [key: string]: unknown
  }
  phone: string
  email: string
  fullAddress: string
  [key: string]: unknown
}

export type BrandSeo = {
  title: string
  description: string
  keywords: string[]
  twitterHandle?: string
  country?: string
  [key: string]: unknown
}

export type BrandServiceItem = {
  title?: string
  description?: string
  [key: string]: unknown
}

export type BrandServices =
  | {
      title?: string
      items?: BrandServiceItem[]
      [key: string]: unknown
    }
  | BrandServiceItem[]

export type BrandTestimonial = {
  name?: string
  date?: string
  rating?: number | string
  platform?: string
  review?: string
  [key: string]: unknown
}

export type BrandFaq = {
  question?: string
  answer?: string
  [key: string]: unknown
}

export type BrandSocialLinks = {
  facebook?: string
  instagram?: string
  youtube?: string
  linkedin?: string
  [key: string]: unknown
}

export type BrandImageSlots = {
  hero?: string
  about?: string
  services?: string
  finance?: string
  partExchange?: string
  sellYourCar?: string
  recentlySold?: string
  [key: string]: string | undefined
}

/**
 * Editable component copy, keyed by a theme's `recipes/text-recipe.json` slot
 * key. Operator/LLM values live here and win over the recipe default; a theme's
 * shared `resolveText(brand, key)` reads this first. See `docs/theme-contract.md`.
 */
export type BrandTextSlots = Record<string, string>

/**
 * Editable media, keyed by a theme's `recipes/media-recipe.json` slot key.
 * VIDEO slots resolve their clip URL from here (image slots keep using
 * `images` for back-compat). Values are hosted mp4/webm URLs (brand upload or
 * curated stock). `<BrandMedia>` degrades to the slot's poster still when empty.
 */
export type BrandMediaSlots = Record<string, string>

export type BrandConfig = {
  // Identity
  slug: string
  name: string
  domain: string
  tagline?: string
  logo: string
  heroImage?: string
  favicon?: string
  // Per-page imagery — sourced from Unsplash for prospect previews; dealer can
  // override individual slots from the dashboard. Each slot is a URL (remote
  // or self-hosted under /themes/<id>/images/). BrandStyles.tsx exposes these
  // as CSS variables: --brand-image-hero, --brand-image-about, etc.
  images?: BrandImageSlots

  // Editable component copy (text-recipe slots) and video media (media-recipe
  // video slots). Both are LLM/operator-filled at preview-create time and read
  // through the shared resolvers (resolveText / resolveMedia).
  text?: BrandTextSlots
  media?: BrandMediaSlots

  // Core nested config
  location: BrandLocation
  seo: BrandSeo
  theme: ThemeConfig
  themeId?: string
  aaApprovedDealer?: boolean
  /** When set, this preview is bound to a Carous dealer (e.g. a DMS demo account):
   *  stock is live-fetched from the Carous API by this client_id and branding is
   *  overlaid from the dealer's DMS Appearance settings — instead of static JSON. */
  carousClientId?: string

  // Optional sections
  socialLinks?: BrandSocialLinks
  openingHours?: Record<string, string>
  aboutUs?: { title?: string; headline?: string; description?: string; [key: string]: unknown }
  whyChooseUs?: {
    title?: string
    features?: Array<{ id?: string; title?: string; description?: string; [key: string]: unknown }>
    [key: string]: unknown
  }
  services?: { title?: string; items?: BrandServiceItem[]; [key: string]: unknown }
  testimonials?: BrandTestimonial[]
  faq?: BrandFaq[]
  // The dashboard stores a fairly free-form pages object; keep this loose.
  pages?: any
  email?: Record<string, unknown>
  api?: Record<string, unknown>

  // Allow forward-compatible fields from the dashboard/DB
  [key: string]: unknown
}
