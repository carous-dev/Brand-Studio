/**
 * Utility for UK vehicle registration validation.
 * Implements DVLA rules for current, prefix, suffix and dateless formats.
 */
const LETTERS = 'ABCDEFGHJKMNPRSTUVWXY' // I,Q,Z excluded
const LETTER_CLASS = `[${LETTERS}]`
const DIGITS_CLASS = '\\d'

const currentRegex = new RegExp(`^(${LETTER_CLASS}{2})(${DIGITS_CLASS}{2})\\s?(${LETTER_CLASS}{3})$`)
const prefixRegex = new RegExp(`^(${LETTER_CLASS})(${DIGITS_CLASS}{3})\\s?(${LETTER_CLASS}{3})$`)
const suffixRegex = new RegExp(`^(${LETTER_CLASS}{3})\\s?(${DIGITS_CLASS}{3})([A-Za-z])$`)
const datelessRegex = new RegExp(`^(${LETTER_CLASS}{3})\\s?(${DIGITS_CLASS}{3})$`)

export interface UkRegistrationResult {
  valid: boolean
  normalised_plate: string
  format: 'current' | 'prefix' | 'suffix' | 'dateless' | null
  error: string | null
}

/**
 * Normalize UK registration input: trim, uppercase, remove punctuation, allow optional space.
 */
function normalise(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/**
 * Determines whether a string contains any forbidden letters.
 */
function hasInvalidLetters(value: string): boolean {
  return /[IQZ]/.test(value)
}

/**
 * Validates the current (post-2001) registration age identifier.
 * Accepts 01-99 and fails fast on numbers outside range.
 */
function validateAgeIdentifier(age: string): boolean {
  const num = Number(age)
  return num >= 1 && num <= 99
}

export function validateUkRegistration(input: string): UkRegistrationResult {
  const normalised = normalise(input)
  if (!normalised) {
    return { valid: false, normalised_plate: '', format: null, error: 'Registration cannot be empty' }
  }
  if (hasInvalidLetters(normalised)) {
    return { valid: false, normalised_plate: normalised, format: null, error: 'Letters I, Q and Z are not permitted' }
  }
  const patterns: Array<{ type: UkRegistrationResult['format']; match: RegExp }> = [
    { type: 'current', match: currentRegex },
    { type: 'prefix', match: prefixRegex },
    { type: 'suffix', match: suffixRegex },
    { type: 'dateless', match: datelessRegex },
  ]

  for (const { type, match } of patterns) {
    const result = match.exec(normalised)
    if (!result) continue
    if (type === 'current') {
      const age = result[2]
      if (!validateAgeIdentifier(age)) {
        return { valid: false, normalised_plate: normalised, format: null, error: 'Age identifier must be between 01 and 99' }
      }
    }
    return { valid: true, normalised_plate: normalised, format: type, error: null }
  }

  return { valid: false, normalised_plate: normalised, format: null, error: 'Not a recognised UK registration format' }
}

// Unit test style examples
export const ukRegValidExamples = [
  'AB12 CDE',
  'F123 ABC',
  'XYZ 123A',
  'OLD 456',
]

export const ukRegInvalidExamples = [
  'A1 BCD', // too short
  'AB12 3DE', // digits and letters wrong order
  'AZ12 CDE', // forbidden Z
  'AB00 CDE', // invalid age identifier
]
