/**
 * Brand-driven text helpers for the pmg-used-cars theme. Thin binding onto the
 * shared resolver in `app/themes/lib/theme-text.ts`; `recipes/text-recipe.json`
 * is the single source of truth for customisable copy.
 *
 * Resolution order per key: `brand.text[key]` (operator/LLM override) → recipe
 * default (token-interpolated) → ''. Fallbacks stay generic ("the showroom") so
 * a misconfigured brand can never leak the seed dealer's identity.
 */
import recipe from '../recipes/text-recipe.json'
import { makeTextResolver, type BrandTextTokens } from '@/app/themes/lib/theme-text'

export type { BrandTextTokens }
export const { resolveText, resolveTexts, textRecipe } = makeTextResolver(recipe)
