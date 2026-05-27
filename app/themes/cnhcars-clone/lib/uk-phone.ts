export function normalizeUkPhone(value: string): string {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  let cleaned = raw.replace(/[^\d+]/g, '')

  if (cleaned.startsWith('+')) {
    cleaned = `+${cleaned.slice(1).replace(/\+/g, '')}`
  } else {
    cleaned = cleaned.replace(/\+/g, '')
  }

  if (cleaned.startsWith('0044')) return `0${cleaned.slice(4)}`
  if (cleaned.startsWith('+44')) return `0${cleaned.slice(3)}`
  if (/^44\d+$/.test(cleaned)) return `0${cleaned.slice(2)}`

  return cleaned
}

export function isValidUkPhone(value: string): boolean {
  const normalized = normalizeUkPhone(value).replace(/[^\d]/g, '')
  return /^0[1-9]\d{8,9}$/.test(normalized)
}

