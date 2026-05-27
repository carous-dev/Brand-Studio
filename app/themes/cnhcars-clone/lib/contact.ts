// Brand-record contact helper. Used by Header / ContactBar / Footer / contact
// forms so phone/email/address render the current brand's values rather than
// the hardcoded cnhcars source-app strings.
import type { BrandConfig } from '@/brands/types'

export type BrandContactInfo = {
  phoneDisplay: string
  phoneTel: string
  email: string
  whatsappUrl: string
  showroomAddress: string
  showroomCity: string
}

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
  const phoneRaw = String(brand?.location?.phone || '').trim()
  const tel = digitsOnly(phoneRaw)
  const phoneTel = tel ? `+${tel.replace(/^0/, '44')}` : ''
  const email = String(brand?.location?.email || '').trim()
  const whatsappUrl = phoneTel ? `https://wa.me/${phoneTel.replace(/^\+/, '')}` : ''
  const addr = (brand?.location?.address || {}) as Record<string, string | undefined>

  return {
    phoneDisplay: phoneRaw,
    phoneTel,
    email,
    whatsappUrl,
    showroomAddress: buildAddressLine(brand),
    showroomCity: addr.city || '',
  }
}

export type BrandSocialLink = { label: string; href: string; key: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' }

export function getBrandSocialLinks(brand: BrandConfig | null | undefined): BrandSocialLink[] {
  const social = (brand as any)?.socialLinks || (brand as any)?.social || {}
  const out: BrandSocialLink[] = []
  if (social.facebook) out.push({ label: 'Facebook', href: social.facebook, key: 'facebook' })
  if (social.twitter) out.push({ label: 'Twitter', href: social.twitter, key: 'twitter' })
  if (social.instagram) out.push({ label: 'Instagram', href: social.instagram, key: 'instagram' })
  if (social.linkedin) out.push({ label: 'LinkedIn', href: social.linkedin, key: 'linkedin' })
  if (social.youtube) out.push({ label: 'YouTube', href: social.youtube, key: 'youtube' })
  return out
}
