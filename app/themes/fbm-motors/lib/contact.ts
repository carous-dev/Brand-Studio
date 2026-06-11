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

/**
 * Format a raw UK phone number for display. Accepts strings like
 * "7723090172", "07723090172", "+44 7723 090172" and emits "07723 090172"
 * (mobile) / "01183 333 444" (landline) / leaves the leading "+44 " when
 * the input is international form.
 */
function formatUkPhone(input: string): string {
  const raw = String(input || '').trim()
  if (!raw) return ''
  const digits = digitsOnly(raw)
  if (!digits) return raw

  // International form input — keep the +44 prefix.
  if (raw.startsWith('+44')) {
    const local = digits.replace(/^44/, '')
    if (local.length === 10 && local.startsWith('7')) {
      return `+44 ${local.slice(0, 4)} ${local.slice(4)}`
    }
    if (local.length === 10) {
      return `+44 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
    }
    return raw
  }

  // Local form. Normalise "7..." (10 digits) to "07..." then space-format.
  const local = digits.startsWith('0')
    ? digits
    : digits.length === 10 && digits.startsWith('7')
      ? `0${digits}`
      : digits
  if (local.length === 11 && local.startsWith('07')) {
    return `${local.slice(0, 5)} ${local.slice(5)}`
  }
  if (local.length === 11) {
    return `${local.slice(0, 5)} ${local.slice(5, 8)} ${local.slice(8)}`
  }
  if (local.length === 10 && local.startsWith('7')) {
    return `0${local.slice(0, 4)} ${local.slice(4)}`
  }
  return raw
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
    phoneDisplay: formatUkPhone(phoneRaw),
    phoneTel,
    email,
    whatsappUrl,
    showroomAddress: buildAddressLine(brand),
  }
}
