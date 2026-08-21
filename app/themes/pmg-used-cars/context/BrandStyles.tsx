'use client'

import type { ReactNode } from 'react'
import type { BrandConfig } from '@/brands/types'
import { buildThemeTokens, renderThemeStyle } from '@/app/themes/lib/theme-tokens'
import { buildImageVars } from '@/app/themes/lib/theme-images'
import imageRecipe from '../recipes/image-recipe.json'

const THEME_ID = 'pmg-used-cars'
const SCOPE = `[data-theme-id="${THEME_ID}"]`

// Chakra Petch (display, incl. italic 700 for the hero) + Inter (body/UI).
const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,700&family=Inter:wght@400;500;600;700&display=swap');\n"

/**
 * Emits the brand-overridable CSS variables for the PMG Used Car Sales theme,
 * scoped to [data-theme-id="pmg-used-cars"] so a multi-theme preview bundle
 * never leaks PMG's palette onto sibling themes.
 *
 * Colours: buildThemeTokens with PMG design values as `defaults`; brand records
 * override any of the 8 via theme.colors.*. base.css bridges the PMG token
 * names (--pmg-red, --ink, …) onto these canonical --color-* tokens.
 *
 * Images: buildImageVars reads recipes/image-recipe.json and emits one
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
  const extras: Record<string, string> = {
    ...buildImageVars(brand, imageRecipe as any),
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: renderThemeStyle({ vars, extras, scope: SCOPE, fontImport: FONT_IMPORT }),
      }}
    />
  )
}
