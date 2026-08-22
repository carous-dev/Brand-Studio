'use client'

import type { ReactNode } from 'react'
import type { BrandConfig } from '@/brands/types'
import { buildThemeTokens, renderThemeStyle } from '@/app/themes/lib/theme-tokens'
import { buildImageVars } from '@/app/themes/lib/theme-images'
import mediaRecipe from '../recipes/media-recipe.json'

// Chakra Petch (display, incl. italic 700 for the hero) + Inter (body/UI).
const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,700&family=Inter:wght@400;500;600;700&display=swap');\n"

/**
 * Emits the brand-overridable CSS variables for the PMG Used Car Sales theme.
 *
 * Colours: buildThemeTokens with PMG design values as `defaults`; brand records
 * override any of the 8 via theme.colors.*. Emitted on :root (NOT
 * [data-theme-id]) because base.css bridges the PMG token names
 * (--pmg-red → var(--color-primary), --jet → var(--color-secondary), …) on
 * :root — a custom property's var() resolves at its declaration element, so
 * --color-* MUST live on the same element (:root) or the bridge always falls
 * back to the PMG literal. Previews render one theme at a time, so :root is safe.
 *
 * Images: buildImageVars reads recipes/media-recipe.json (image slots) and emits one
 * `--brand-image-<kebab(key)>` per slot, resolving brand.images[key] (the
 * dashboard Page-Images override) → (hero) brand.heroImage → the slot's theme
 * default. Adding an editable image is a single recipe declaration — the
 * dashboard renders its upload control and this var emits automatically.
 */
export function BrandStyles({ brand }: { brand: BrandConfig }): ReactNode {
  const theme = brand?.theme

  const vars = buildThemeTokens(theme?.colors as any, {
    defaults: {
      primaryColor: '#de010d',
      secondaryColor: '#050506',
      accentColor: '#ff3b45',
      backgroundColor: '#ffffff',
      surfaceColor: '#f5f5f6',
      textColor: '#1b1b1f',
      mutedColor: '#5d5d66',
      borderColor: '#e3e3e7',
      primaryStrong: '#b70009',
    },
  })

  // Per-slot image vars from the recipe → --brand-image-<kebab(key)>.
  // (Video slots are skipped by buildImageVars — they render via <BrandMedia>.)
  const extras: Record<string, string> = {
    ...buildImageVars(brand, mediaRecipe as any),
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: renderThemeStyle({ vars, extras, fontImport: FONT_IMPORT }),
      }}
    />
  )
}
