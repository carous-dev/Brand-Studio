'use client'

import type { ReactNode } from 'react'
import type { BrandConfig } from '@/brands/types'
import { buildThemeTokens, renderThemeStyle, escapeCssUrl } from '@/app/themes/lib/theme-tokens'
import { optimizeImageUrl } from '@/app/lib/imageOptimize'

const THEME_ID = 'cnhcars-clone'
const SCOPE = `[data-theme-id="${THEME_ID}"]`

function pickString(...candidates: Array<unknown>): string | undefined {
  for (const c of candidates) if (typeof c === 'string' && c.trim()) return c
  return undefined
}

/**
 * Emits the brand-overridable CSS variables for the cnhcars-clone theme.
 *
 * Migrated onto the shared token contract (buildThemeTokens + renderThemeStyle).
 * The emitted block stays SCOPED to `[data-theme-id="cnhcars-clone"]` (NOT
 * :root) so a multi-theme preview bundle never leaks cnhcars' royal-blue palette
 * onto sibling themes.
 *
 * ADDITIVE: previously only --color-primary + --color-accent were emitted (the
 * rest of the palette is hardcoded across the theme's CSS). The full canonical
 * --color-* set is now emitted from the theme's real hardcoded design values,
 * passed as `defaults`; brand records override any of the 8 via theme.colors.*.
 * Existing hardcoded CSS is untouched (Phase 6 migrates it). Per-slot
 * --brand-image-* vars are preserved verbatim in `extras`.
 */
export function BrandStyles({ brand }: { brand: BrandConfig }): ReactNode {
  const theme = brand?.theme
  const brandImages: Record<string, unknown> = (brand as any)?.images || {}

  // Route brand-uploaded images through Next's optimizer (WebP/AVIF + resize)
  // so the CSS-background hero + section images aren't full-res originals.
  // The hero is the LCP element, so it gets a wider derivative.
  const toUrl = (img?: string, width = 1280) =>
    img ? `url("${escapeCssUrl(optimizeImageUrl(img, { width }))}")` : 'none'

  const heroImage = pickString((brand as any)?.heroImage, brandImages['hero'])
  const aboutImage = pickString(brandImages['about'])
  const servicesImage = pickString(brandImages['services'])
  const financeImage = pickString(brandImages['finance'])
  const partExchangeImage = pickString(brandImages['partExchange'])
  const sellYourCarImage = pickString(brandImages['sellYourCar'])
  const recentlySoldImage = pickString(brandImages['recentlySold'])

  // Canonical token block via the shared emitter. cnhcars-clone's bespoke
  // "black & royal blue" palette is passed as `defaults` (values sourced from
  // its own base.css: --surface-page/#fff, --surface-section/#F8F9FA,
  // --text-primary-light/#111827, --text-secondary-light/#4b5563, --border,
  // --primary-active/#2A4A9F used everywhere as the --color-primary-strong
  // fallback). Brand records override any of the 8 via theme.colors.*.
  const vars = buildThemeTokens(theme?.colors as any, {
    defaults: {
      primaryColor: '#4169E1',
      secondaryColor: '#2A4A9F',
      accentColor: '#5680E9',
      backgroundColor: '#ffffff',
      surfaceColor: '#F8F9FA',
      textColor: '#111827',
      mutedColor: '#4B5563',
      borderColor: '#E5E7EB',
      primaryStrong: '#2A4A9F',
    },
  })

  // Per-slot brand-image vars — kept verbatim (camelCase slot names) so the
  // theme's CSS `var(--brand-image-partExchange)` etc. keeps resolving.
  const extras: Record<string, string> = {
    '--brand-image-hero': toUrl(heroImage, 1920),
    '--brand-image-about': toUrl(aboutImage),
    '--brand-image-services': toUrl(servicesImage),
    '--brand-image-finance': toUrl(financeImage),
    '--brand-image-partExchange': toUrl(partExchangeImage),
    '--brand-image-sellYourCar': toUrl(sellYourCarImage),
    '--brand-image-recentlySold': toUrl(recentlySoldImage),
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: renderThemeStyle({ vars, extras, scope: SCOPE }),
      }}
    />
  )
}
