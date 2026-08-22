/**
 * Brand-driven text helpers for the fbm-motors theme. Thin binding onto the
 * shared resolver in `app/themes/lib/theme-text.ts`; `recipes/text-recipe.json`
 * is the single source of truth for which copy strings are customisable.
 *
 * Resolution order per key: `brand.text[key]` (operator/LLM override) → recipe
 * default (token-interpolated) → ''. See docs/theme-contract.md.
 */
import recipe from '../recipes/text-recipe.json'
import { makeTextResolver, type BrandTextTokens } from '@/app/themes/lib/theme-text'

export type { BrandTextTokens }
export const { resolveText, resolveTexts, textRecipe } = makeTextResolver(recipe)
