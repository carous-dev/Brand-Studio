import type { BrandConfig } from '@/brands/types'

export type BrandContactInfo = {
  phoneDisplay: string
  phoneTel: string
  email: string
  whatsappUrl: string
  showroomAddress: string
}

const FALLBACK_PHONE_DISPLAY = ''
const FALLBACK_EMAIL = ''

function digitsOnly(value: string): string {
  return String(value || '').replace(/\D/g, '')
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

  return {
    phoneDisplay: phoneRaw,
    phoneTel,
    email,
    whatsappUrl,
    showroomAddress: buildAddressLine(brand),
  }
}
