type VehicleLinkInput = {
  slug?: string | null
  derivative_slug?: string | null
  reg?: string | null
  registration?: string | null
}

export type VehicleLookupCandidate = {
  slug?: string
  reg?: string
}

function normalizeSlugText(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function looksLikeRegistrationToken(value: string): boolean {
  return /^[a-z0-9]{6,8}$/.test(value) && /[a-z]/.test(value) && /\d/.test(value)
}

export function normalizeRegistrationIdentifier(value: unknown): string {
  return String(value ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
}

function splitVehiclePermalinkSlug(value: unknown): VehicleLookupCandidate {
  const normalized = normalizeSlugText(value)
  if (!normalized) return { slug: '' }

  const parts = normalized.split('-').filter(Boolean)
  const lastPart = parts[parts.length - 1] || ''
  if (parts.length > 1 && looksLikeRegistrationToken(lastPart)) {
    return {
      slug: parts.slice(0, -1).join('-'),
      reg: normalizeRegistrationIdentifier(lastPart),
    }
  }

  return { slug: normalized }
}

export function getVehicleLookupCandidates(value: unknown): VehicleLookupCandidate[] {
  const raw = String(value ?? '').trim()
  if (!raw) return []

  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    decoded = raw
  }

  const candidates: VehicleLookupCandidate[] = []
  const pushCandidate = (candidate: VehicleLookupCandidate) => {
    const slug = candidate.slug ? normalizeSlugText(candidate.slug) : ''
    const reg = candidate.reg ? normalizeRegistrationIdentifier(candidate.reg) : ''
    if (!slug && !reg) return
    if (candidates.some((entry) => entry.slug === slug && entry.reg === reg)) return
    candidates.push({ slug: slug || undefined, reg: reg || undefined })
  }

  const normalized = normalizeSlugText(decoded)
  const parsed = splitVehiclePermalinkSlug(decoded)
  pushCandidate({ slug: normalized })
  if (parsed.slug && parsed.slug !== normalized) pushCandidate({ slug: parsed.slug })
  const yearless = normalized.replace(/^\d{4}-/, '')
  if (yearless && yearless !== normalized) pushCandidate({ slug: yearless })
  if (parsed.reg) {
    pushCandidate({ reg: parsed.reg })
  } else if (looksLikeRegistrationToken(normalized)) {
    pushCandidate({ reg: parsed.reg || normalized })
  }

  return candidates
}

export function buildVehiclePermalink(
  vehicle: VehicleLinkInput | null | undefined,
  fallback = '/used-cars',
): string {
  if (!vehicle) return fallback

  const slug = normalizeSlugText(vehicle.slug ?? vehicle.derivative_slug)
  const reg = normalizeRegistrationIdentifier(vehicle.reg ?? vehicle.registration)
  const baseSlug = slug || (reg ? reg.toLowerCase() : '')
  if (!baseSlug) return fallback

  const permalinkSlug =
    reg && !baseSlug.endsWith(`-${reg.toLowerCase()}`) && baseSlug !== reg.toLowerCase()
      ? `${baseSlug}-${reg.toLowerCase()}`
      : baseSlug

  return `${fallback}/${encodeURIComponent(permalinkSlug)}`
}
