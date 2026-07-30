/**
 * Shared image contract for themes — the single source of truth that turns a
 * theme's `recipes/image-recipe.json` manifest into (a) the `--brand-image-*`
 * CSS vars BrandStyles emits and (b) per-slot URL/CSS resolvers components call.
 *
 * One manifest slot drives the var, the dashboard control (served separately by
 * Flask), the theme default, and the brand override — so adding an image to a
 * theme is a single declaration, never a hand-edit across BrandStyles + backend
 * + template. Mirrors `theme-tokens.ts` (colours/fonts) for images.
 *
 * Resolution order per slot: `brand.images[key]` (dashboard override) →
 * (role:'hero' only) `brand.heroImage` / `brand.images.hero` → `slot.default`
 * (theme-shipped fallback; '' => `none`, i.e. a brand-colour panel). Everything
 * runs through `optimizeImageUrl` at the slot's width.
 */

import type { BrandConfig } from '@/brands/types'
import { optimizeImageUrl, optimizedCssUrl, type OptimizeImageOptions } from '@/app/lib/imageOptimize'

export interface ImageSlot {
  /** brand.images key AND the CSS-var suffix source. */
  key: string
  label?: string
  page?: string
  /** 'hero' opts the slot into the brand.heroImage tier-1 special-case. */
  role?: 'hero' | string
  aspect?: string
  /** Rendered width fed to optimizeImageUrl (snapped to Next's allowed set). */
  width?: number
  /** Theme-shipped fallback path; '' => no default (brand-colour panel). */
  default?: string
  aiHint?: string
  /** Per-slot search bias for prospect image sourcing (fetch-theme-images). */
  unsplashHint?: string
}

export interface ImageRecipe {
  themeId?: string
  version?: number
  slots: ImageSlot[]
}

/**
 * Back-compat shim: the historical 7-slot vocabulary. Themes without an
 * `image-recipe.json` (the 13 not yet migrated) resolve against this so their
 * `var(--brand-image-*)` keeps working and their dashboard shows the legacy
 * controls exactly as before.
 */
export const DEFAULT_LEGACY_SLOTS: ImageSlot[] = [
  { key: 'hero', role: 'hero', width: 1920, default: '' },
  { key: 'about', width: 1280, default: '' },
  { key: 'services', width: 1280, default: '' },
  { key: 'finance', width: 1280, default: '' },
  { key: 'partExchange', width: 1280, default: '' },
  { key: 'sellYourCar', width: 1280, default: '' },
  { key: 'recentlySold', width: 1280, default: '' },
]

const DEFAULT_WIDTH = 1280

/** camelCase / snake / spaced → kebab-case (canonical CSS-var suffix form). */
export function kebabKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

type RecipeLike = ImageRecipe | ImageSlot[] | null | undefined

/** Normalise a recipe/array/absent input to a non-empty slot list (shim). */
export function normalizeSlots(recipe: RecipeLike): ImageSlot[] {
  if (!recipe) return DEFAULT_LEGACY_SLOTS
  if (Array.isArray(recipe)) return recipe.length ? recipe : DEFAULT_LEGACY_SLOTS
  return Array.isArray(recipe.slots) && recipe.slots.length ? recipe.slots : DEFAULT_LEGACY_SLOTS
}

export function findSlot(recipe: RecipeLike, key: string): ImageSlot | undefined {
  return normalizeSlots(recipe).find((s) => s.key === key)
}

function brandImages(brand: BrandConfig | null | undefined): Record<string, unknown> {
  return ((brand as any)?.images as Record<string, unknown>) || {}
}

function firstString(...candidates: Array<unknown>): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  return ''
}

/** Raw resolved source for a slot (before optimization), or '' when none. */
function rawSource(brand: BrandConfig | null | undefined, slot: ImageSlot): string {
  const imgs = brandImages(brand)
  const override = typeof imgs[slot.key] === 'string' ? (imgs[slot.key] as string) : ''
  const heroTier =
    slot.role === 'hero' ? firstString((brand as any)?.heroImage, imgs['hero']) : ''
  return firstString(override, heroTier, slot.default)
}

function slotOpts(slot: ImageSlot): OptimizeImageOptions {
  return { width: slot.width ?? DEFAULT_WIDTH }
}

/**
 * Optimized URL for a slot (`<img src>` / inline use), or '' when there is no
 * source. Prefer `themeImageUrl(recipe, brand, key)` from a component.
 */
export function resolveImageUrl(brand: BrandConfig | null | undefined, slot: ImageSlot): string {
  const raw = rawSource(brand, slot)
  return raw ? optimizeImageUrl(raw, slotOpts(slot)) : ''
}

/**
 * CSS `url("…")` for a slot (`background-image`), or `none` when there is no
 * source. Prefer `themeImageCss(recipe, brand, key)` from a component.
 */
export function resolveImageCss(brand: BrandConfig | null | undefined, slot: ImageSlot): string {
  const raw = rawSource(brand, slot)
  return optimizedCssUrl(raw || null, slotOpts(slot))
}

/** Convenience: resolve a slot by key from a recipe → optimized URL ('' if absent). */
export function themeImageUrl(recipe: RecipeLike, brand: BrandConfig | null | undefined, key: string): string {
  const slot = findSlot(recipe, key)
  return slot ? resolveImageUrl(brand, slot) : ''
}

/** Convenience: resolve a slot by key from a recipe → CSS url() ('none' if absent). */
export function themeImageCss(recipe: RecipeLike, brand: BrandConfig | null | undefined, key: string): string {
  const slot = findSlot(recipe, key)
  return slot ? resolveImageCss(brand, slot) : 'none'
}

/**
 * The `--brand-image-<kebab(key)>` var map for EVERY declared slot, spread into
 * BrandStyles' `extras`. camelCase keys also emit a `--brand-image-<rawKey>`
 * alias so legacy theme CSS referencing the camel form keeps resolving.
 */
export function buildImageVars(
  brand: BrandConfig | null | undefined,
  recipe: RecipeLike,
): Record<string, string> {
  const out: Record<string, string> = {}
  for (const slot of normalizeSlots(recipe)) {
    const css = resolveImageCss(brand, slot)
    const kebab = kebabKey(slot.key)
    out[`--brand-image-${kebab}`] = css
    if (kebab !== slot.key) out[`--brand-image-${slot.key}`] = css
  }
  return out
}
