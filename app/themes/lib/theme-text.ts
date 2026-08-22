/**
 * Shared text contract for themes — the single source of truth that turns a
 * theme's `recipes/text-recipe.json` manifest into a `resolveText(brand, key)`
 * resolver. Mirrors `theme-images.ts` (media) for copy.
 *
 * Each theme's `lib/brand-text.ts` collapses to a 2-line binding:
 *
 *   import recipe from '../recipes/text-recipe.json'
 *   import { makeTextResolver } from '@/app/themes/lib/theme-text'
 *   export const { resolveText, resolveTexts, textRecipe } = makeTextResolver(recipe)
 *
 * The runtime resolves a final string per key by:
 *   1. `brand.text[<key>]` if present and non-empty (operator / LLM override)
 *   2. recipe default with token interpolation
 *   3. '' (component renders nothing rather than a leaked seed string)
 *
 * Tokens supported: {brandName}, {namePossessive}, {city}, {county}, {cityish},
 * {streetLine}, {postcode}, {year}, {tagline}.
 */

import type { BrandConfig } from '@/brands/types'

export type RecipeField = { key: string; default?: string; [key: string]: unknown }
export type RecipeSection = { id?: string; label?: string; fields?: RecipeField[] }
export type TextRecipe = { themeId?: string; version?: number; sections?: RecipeSection[] }

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

export interface TextResolver {
  resolveText: (brand: BrandConfig | null | undefined, key: string) => string
  resolveTexts: <K extends string>(
    brand: BrandConfig | null | undefined,
    keys: readonly K[],
  ) => Record<K, string>
  textRecipe: TextRecipe
}

function pickStringField(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function toPossessive(name: string): string {
  if (!name) return ''
  return name.endsWith('s') ? `${name}'` : `${name}'s`
}

function buildDefaultIndex(recipe: TextRecipe): Record<string, string> {
  const idx: Record<string, string> = {}
  for (const section of recipe.sections || []) {
    for (const field of section.fields || []) {
      if (field?.key && typeof field.default === 'string') idx[field.key] = field.default
    }
  }
  return idx
}

export function buildTextTokens(brand: BrandConfig | null | undefined): BrandTextTokens {
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

function interpolate(template: string, tokens: BrandTextTokens): string {
  if (typeof template !== 'string' || template.length === 0) return ''
  return template.replace(/\{([a-zA-Z]+)\}/g, (_match, key: string) => {
    const value = (tokens as any)[key]
    return typeof value === 'string' ? value : ''
  })
}

/**
 * Bind a text-recipe manifest to its resolver functions. The default index is
 * built once per theme module (recipe is static), so per-call cost is just the
 * override lookup + token interpolation.
 */
export function makeTextResolver(recipe: TextRecipe): TextResolver {
  const RECIPE_DEFAULTS = buildDefaultIndex(recipe || {})

  function resolveText(brand: BrandConfig | null | undefined, key: string): string {
    const override = pickStringField(brand?.text?.[key])
    const template = override || RECIPE_DEFAULTS[key] || ''
    return interpolate(template, buildTextTokens(brand))
  }

  function resolveTexts<K extends string>(
    brand: BrandConfig | null | undefined,
    keys: readonly K[],
  ): Record<K, string> {
    const out = {} as Record<K, string>
    for (const key of keys) out[key] = resolveText(brand, key)
    return out
  }

  return { resolveText, resolveTexts, textRecipe: recipe }
}
