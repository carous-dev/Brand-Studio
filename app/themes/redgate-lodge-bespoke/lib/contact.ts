import type { BrandConfig } from '@/brands/types'

export type BrandContactInfo = {
  phoneDisplay: string
  phoneTel: string
  email: string
  whatsappUrl: string
  showroomAddress: string
  /** Best single-word city for showroom style copy. Empty string if absent. */
  city: string
  /** County label. Empty string if absent. */
  county: string
  /** Postcode, e.g. "M12 6LB". Empty string if absent. */
  postcode: string
  /** Street + line2, e.g. "Midlands Street". Empty string if absent. */
  streetLine: string
  /**
   * Short location label: "{city}, {county}" when both exist, else whichever is
   * present, else empty. Use anywhere the dealer's "where" needs one line.
   */
  locationLabel: string
  /**
   * Same as city but with a generic fallback "the showroom" so copy never breaks
   * when the brand record is missing a city.
   */
  cityOrShowroom: string
}

const FALLBACK_PHONE_DISPLAY = ''
const FALLBACK_EMAIL = ''

function digitsOnly(value: string): string {
  return String(value || '').replace(/\D/g, '')
}

function pickStringField(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  return ''
}

function buildAddressLine(brand: BrandConfig | null | undefined): string {
  if (!brand?.location) return ''
  const fullAddress = (brand.location as any).fullAddress
  if (typeof fullAddress === 'string' && fullAddress.trim()) return fullAddress.trim()

  const parts: string[] = []
  const addr = (brand.location.address || {}) as Record<string, string | undefined>
  if (addr.line1) parts.push(addr.line1)
  if (addr.line2) parts.push(addr.line2)
  if (addr.city) parts.push(addr.city)
  if (addr.county) parts.push(addr.county)
  if (addr.postcode) parts.push(addr.postcode)
  return parts.filter(Boolean).join(', ')
}

export function getBrandContactInfo(brand: BrandConfig | null | undefined): BrandContactInfo {
  const phoneRaw = String(brand?.location?.phone || FALLBACK_PHONE_DISPLAY).trim()
  const tel = digitsOnly(phoneRaw)
  const phoneTel = tel ? `+${tel.replace(/^0/, '44')}` : ''
  const email = String(brand?.location?.email || FALLBACK_EMAIL).trim()
  const whatsappUrl = phoneTel ? `https://wa.me/${phoneTel.replace(/^\+/, '')}` : ''

  const addr = (brand?.location?.address || {}) as Record<string, unknown>
  const city = pickStringField(addr.city) || pickStringField(addr.town)
  const county = pickStringField(addr.county) || pickStringField(addr.region)
  const postcode = pickStringField(addr.postcode) || pickStringField(addr.zip)
  const line1 = pickStringField(addr.line1) || pickStringField(addr.street)
  const line2 = pickStringField(addr.line2)
  const streetLine = [line1, line2].filter(Boolean).join(', ')

  const locationLabel = [city, county].filter(Boolean).join(', ')
  const cityOrShowroom = city || county || 'the showroom'

  return {
    phoneDisplay: phoneRaw,
    phoneTel,
    email,
    whatsappUrl,
    showroomAddress: buildAddressLine(brand),
    city,
    county,
    postcode,
    streetLine,
    locationLabel,
    cityOrShowroom,
  }
}
