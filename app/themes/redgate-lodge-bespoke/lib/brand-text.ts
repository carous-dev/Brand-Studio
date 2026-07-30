import type { BrandConfig } from '@/brands/types'
import recipe from '../recipes/text-recipe.json'

/**
 * Brand-driven text helpers for the redgate-lodge-bespoke theme. The recipe file
 * (`recipes/text-recipe.json`) is the single source of truth for which copy
 * strings are customizable — the dashboard `/create` + `/update` pages read the
 * same JSON to render form inputs, and the AI brand generator reads it to know
 * what copy to populate. The runtime resolves a final string per key by:
 *   1. `brand.text[<key>]` if present and non-empty
 *   2. Recipe default with token interpolation
 *
 * Tokens supported (interpolated into BOTH overrides and defaults):
 *   {brandName}, {city}, {county}, {cityish}, {streetLine}, {postcode}, {year},
 *   {tagline}, {namePossessive}
 *
 * Fallbacks are deliberately generic ("the showroom" — never the seed dealer's
 * name) so a misconfigured brand record can never leak the seed dealer's identity.
 */

type RecipeField = { key: string; default: string }
type RecipeSection = { id: string; fields: RecipeField[] }
type Recipe = { sections: RecipeSection[] }

const TYPED_RECIPE = recipe as Recipe

function buildDefaultIndex(): Record<string, string> {
  const idx: Record<string, string> = {}
  for (const section of TYPED_RECIPE.sections || []) {
    for (const field of section.fields || []) {
      if (field?.key && typeof field.default === 'string') idx[field.key] = field.default
    }
  }
  return idx
}

const RECIPE_DEFAULTS: Record<string, string> = buildDefaultIndex()

function pickStringField(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  return ''
}

function toPossessive(name: string): string {
  if (!name) return ''
  return name.endsWith('s') ? `${name}'` : `${name}'s`
}

export type BrandTextTokens = {
  brandName: string
  namePossessive: string
  city: string
  county: string
  cityish: string
  streetLine: string
  postcode: string
  year: string
  tagline: string
}

function buildTokens(brand: BrandConfig | null | undefined): BrandTextTokens {
  const rawName = pickStringField(brand?.name)
  const name = rawName || 'the showroom'
  const addr = (brand?.location?.address || {}) as Record<string, unknown>
  const city = pickStringField(addr.city) || pickStringField(addr.town)
  const county = pickStringField(addr.county) || pickStringField(addr.region)
  const postcode = pickStringField(addr.postcode) || pickStringField(addr.zip)
  const line1 = pickStringField(addr.line1) || pickStringField(addr.street)
  const line2 = pickStringField(addr.line2)
  const streetLine = [line1, line2].filter(Boolean).join(', ')
  const tagline = pickStringField((brand as any)?.tagline) || ''
  return {
    brandName: name,
    namePossessive: rawName ? toPossessive(rawName) : "the showroom's",
    city,
    county,
    cityish: city || county || 'the showroom',
    streetLine,
    postcode,
    year: String(new Date().getFullYear()),
    tagline,
  }
}

/**
 * Replace {token} placeholders in `template` with values from `tokens`. Falls back
 * to empty string for any token that's missing or resolves to empty — callers are
 * expected to keep their default strings sensible when tokens are blank.
 */
function interpolate(template: string, tokens: BrandTextTokens): string {
  if (typeof template !== 'string' || template.length === 0) return ''
  return template.replace(/\{([a-zA-Z]+)\}/g, (_match, key: string) => {
    const value = (tokens as any)[key]
    return typeof value === 'string' ? value : ''
  })
}

/**
 * Resolve a text recipe key. Order:
 *   1. brand.text[key] (operator override from /create or /update form)
 *   2. recipe default (from text-recipe.json)
 *   3. '' (empty string — callers must guard if a key is missing from the recipe)
 *
 * Both overrides and defaults are token-interpolated.
 */
export function resolveText(brand: BrandConfig | null | undefined, key: string): string {
  const override = pickStringField((brand as any)?.text?.[key])
  const template = override || RECIPE_DEFAULTS[key] || ''
  const tokens = buildTokens(brand)
  return interpolate(template, tokens)
}

/**
 * Resolve a whole bag of text keys at once. Useful when a component needs many
 * keys and wants to avoid N function calls.
 */
export function resolveTexts<K extends string>(
  brand: BrandConfig | null | undefined,
  keys: readonly K[],
): Record<K, string> {
  const out = {} as Record<K, string>
  for (const key of keys) out[key] = resolveText(brand, key)
  return out
}

/**
 * Static export of the recipe schema — used by the dashboard form template via
 * the `/api/themes/<id>/text-recipe` endpoint (which reads the JSON file directly).
 */
export { TYPED_RECIPE as textRecipe }
