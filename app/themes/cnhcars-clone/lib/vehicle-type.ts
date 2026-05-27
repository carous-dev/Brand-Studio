export type VehicleType = 'van' | 'car'

export type VehicleTypeInput = {
  vehicle_type?: unknown
  vehicleType?: unknown
  type?: unknown
  category?: unknown
  stock_type?: unknown
  body_type?: unknown
  bodyType?: unknown
  body?: unknown
  make?: unknown
  model?: unknown
  derivative?: unknown
  subTitle?: unknown
  trim?: unknown
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeKey(value: unknown): string {
  return normalizeText(value).toLowerCase()
}

function normalizePhrase(value: unknown): string {
  return normalizeKey(value).replace(/[^a-z0-9]+/g, ' ').trim()
}

const VAN_BODY_TOKENS = new Set([
  'van',
  'minibus',
  'pickup',
  'combi',
  'crew',
  'dropside',
  'tipper',
  'flatbed',
  'chassis',
  'luton',
  'camper',
  'motorhome',
])

const VAN_BODY_PHRASES = [
  'panel van',
  'crew van',
  'combi van',
  'pick up',
  'double cab',
  'single cab',
  'lwb',
  'swb',
]

const CAR_BODY_TOKENS = new Set([
  'hatchback',
  'saloon',
  'sedan',
  'coupe',
  'suv',
  'estate',
  'convertible',
  'cabriolet',
  'roadster',
  'mpv',
  'crossover',
])

const VAN_MODEL_TOKENS = new Set([
  'transit',
  'sprinter',
  'crafter',
  'vito',
  'vivaro',
  'trafic',
  'kangoo',
  'berlingo',
  'partner',
  'combo',
  'proace',
  'expert',
  'dispatch',
  'transporter',
  'caddy',
  'doblo',
  'ducato',
  'boxer',
  'relay',
  'jumper',
  'daily',
  'nv200',
  'nv300',
  'nv400',
  'connect',
  'courier',
])

function hasAnyToken(tokens: string[], pool: Set<string>): boolean {
  for (const token of tokens) {
    if (pool.has(token)) return true
  }
  return false
}

function hasAnyPhrase(value: string, phrases: string[]): boolean {
  if (!value) return false
  return phrases.some((phrase) => value.includes(phrase))
}

export function getVehicleType(item: VehicleTypeInput | null | undefined): VehicleType {
  const source = item || {}
  const explicit = normalizePhrase(
    source.vehicle_type ?? source.vehicleType ?? source.type ?? source.category ?? source.stock_type
  )
  if (explicit) {
    const explicitTokens = explicit.split(/\s+/g)
    if (explicitTokens.includes('van') || explicitTokens.includes('vans') || explicitTokens.includes('commercial') || explicitTokens.includes('lcv')) {
      return 'van'
    }
    if (explicitTokens.includes('car') || explicitTokens.includes('cars') || explicitTokens.includes('passenger')) {
      return 'car'
    }
  }

  const bodyValue = normalizePhrase(source.body_type ?? source.bodyType ?? source.body)
  if (bodyValue) {
    const bodyTokens = bodyValue.split(/\s+/g)
    if (hasAnyToken(bodyTokens, VAN_BODY_TOKENS) || hasAnyPhrase(bodyValue, VAN_BODY_PHRASES)) return 'van'
    if (hasAnyToken(bodyTokens, CAR_BODY_TOKENS)) return 'car'
  }

  const modelValue = normalizePhrase(`${source.make ?? ''} ${source.model ?? ''} ${source.derivative ?? ''} ${source.subTitle ?? ''} ${source.trim ?? ''}`)
  if (modelValue) {
    const modelTokens = modelValue.split(/\s+/g)
    if (hasAnyToken(modelTokens, VAN_MODEL_TOKENS)) return 'van'
  }

  return 'car'
}
