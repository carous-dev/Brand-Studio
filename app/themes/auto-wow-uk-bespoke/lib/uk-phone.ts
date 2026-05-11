export function isValidUkPhone(input: unknown): boolean {
  const value = String(input || '').replace(/\s+/g, '')
  if (!value) return false
  return /^\+?\d{10,15}$/.test(value)
}
