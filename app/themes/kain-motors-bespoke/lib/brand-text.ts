/**
 * Brand-driven text helpers for the kain-motors-bespoke theme. Thin binding onto
 * the shared resolver in `app/themes/lib/theme-text.ts`; `recipes/text-recipe.json`
 * is the single source of truth for customisable copy.
 *
 * Resolution order per key: `brand.text[key]` (operator/LLM override) → recipe
 * default (token-interpolated) → ''. Fallbacks stay generic ("the showroom") so
 * a misconfigured brand can never leak the seed dealer's identity.
 *
 * `getBrandText()` below is a legacy structured accessor kept for components that
 * use the named getters (Header chip, footer copyright, editorial edition line).
 * New code should prefer `resolveText(brand, '<recipeKey>')`.
 */
import type { BrandConfig } from '@/brands/types'
import recipe from '../recipes/text-recipe.json'
import { makeTextResolver, buildTextTokens, type BrandTextTokens } from '@/app/themes/lib/theme-text'

export type { BrandTextTokens }
export const { resolveText, resolveTexts, textRecipe } = makeTextResolver(recipe)

export type BrandText = {
  name: string
  namePossessive: string
  tagline: string
  curationLabel: string
  editionLine: (volumeIndex?: number) => string
  showroomTagline: string
  showroomLocationLabel: string
  heroEditionEyebrow: string
  founderAttribution: string
}

export function getBrandText(brand: BrandConfig | null | undefined): BrandText {
  const tokens = buildTextTokens(brand)
  const showroomTagline = resolveText(brand, 'footerBrandLead')
    || `Appointment-only used car and van showroom${tokens.cityish !== 'the showroom' ? ` in ${tokens.cityish}` : ''}. Hand-picked stock, transparent valuations, finance from competitive rates, and nationwide delivery.`

  return {
    name: tokens.brandName,
    namePossessive: tokens.namePossessive,
    tagline: tokens.tagline || 'Hand-picked stock, transparent pricing, and an honest sales experience.',
    curationLabel: tokens.brandName === 'the showroom'
      ? 'The Showroom Curation'
      : `The ${tokens.brandName} Curation`,
    editionLine: (volumeIndex = 3) => {
      const vol = `Volume ${String(volumeIndex).padStart(2, '0')}`
      const cityish = tokens.cityish !== 'the showroom' ? tokens.cityish : ''
      return cityish ? `${vol} · ${cityish} Edition` : `${vol} · The Edition`
    },
    showroomTagline,
    showroomLocationLabel: tokens.cityish !== 'the showroom' ? `${tokens.cityish} showroom` : 'the showroom',
    heroEditionEyebrow: resolveText(brand, 'heroEyebrow') || (tokens.cityish !== 'the showroom' ? `The ${tokens.cityish} Edition · ${tokens.year}` : `The ${tokens.year} Edition`),
    founderAttribution: resolveText(brand, 'pullQuoteAttribution') || (tokens.cityish !== 'the showroom' ? `— ${tokens.brandName} team · ${tokens.cityish}` : `— ${tokens.brandName} team`),
  }
}
