'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl, hexToRgb } from '@/app/themes/lib/theme-tokens';
import { optimizeImageUrl } from '@/app/lib/imageOptimize';

interface BrandStylesProps {
  brand: BrandConfig;
}

/**
 * BrandStyles component injects brand-specific CSS variables.
 * =============================================================================
 *
 * classic-dealer is a LEGACY theme: its component CSS reads the legacy
 * --brand-*, --accent-*, --bg-*, --text-* vocabulary, NOT the modern --color-*
 * tokens. This file now emits BOTH:
 *   - the canonical --color-* contract via the shared `buildThemeTokens`
 *     emitter (latent — nothing in classic's CSS reads it yet, but the theme
 *     now conforms to the shared contract), and
 *   - every legacy var this theme has always emitted, passed VERBATIM through
 *     `legacyAliases` / `extras` so the existing CSS keeps resolving with
 *     byte-identical values.
 *
 * ADDITIVE, zero visual change: under the default palette the rendered output
 * is identical to the pre-migration hand-rolled `:root { … }` block.
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;
  const fontUi = resolveFontToken(
    fonts.ui,
    (fonts as any).body,
    themeAny.fontUi,
    themeAny.uiFont,
    themeAny.fontBody
  ) || "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";
  const fontBrand = resolveFontToken(
    fonts.brand,
    (fonts as any).heading,
    (fonts as any).display,
    themeAny.fontBrand,
    themeAny.brandFont,
    themeAny.fontHeading
  ) || 'Lora, Georgia, serif';
  const fontMono = resolveFontToken(
    fonts.mono,
    themeAny.fontMono,
    themeAny.monoFont
  ) || "'JetBrains Mono', Consolas, monospace";
  // Only a REAL brand hero drives the hero image var — no theme-default photo.
  // When unset, the var is omitted entirely: the homepage hero falls back to
  // its brand-color + overlay, and the about/contact heroes fall back to their
  // designed `var(--classic-hero-image, <brand gradient>)` fallback.
  const heroImageSource = brand.heroImage || brand.images?.hero || null;

  // Canonical --color-* token block via the shared emitter. classic-dealer's
  // legacy palette is mapped onto the core-8 `defaults`; brand records override
  // any of the 8 via theme.colors.*. text/surface/muted/border have no legacy
  // equivalent in this theme, so surface/muted/border use the standard
  // neutrals and text uses the theme's own #1f2933.
  const vars = buildThemeTokens(theme.colors as any, {
    defaults: {
      primaryColor: '#666666',
      secondaryColor: '#555555',
      accentColor: '#444444',
      backgroundColor: '#ffffff',
      surfaceColor: '#f6f7fb',
      textColor: '#1f2933',
      mutedColor: '#5b6573',
      borderColor: '#e3e6ee',
    },
    // Every legacy var the theme has always emitted, VERBATIM. These override
    // the emitter's --brand-* alias mirror with identical values, and add the
    // --bg-*/--text-*/--accent-* families the emitter doesn't cover.
    legacyAliases: {
      // Core Brand Colors (from 5-color system)
      '--brand-primary': theme.colors.primaryColor || '#666666',
      '--brand-secondary': theme.colors.secondaryColor || '#555555',
      '--brand-accent': theme.colors.accentColor || '#444444',
      '--brand-background': theme.colors.backgroundColor || '#ffffff',
      '--brand-text': theme.colors.textColor || '#1f2933',

      // RGB versions for opacity calculations
      '--brand-primary-rgb': hexToRgb(theme.colors.primaryColor || '#666666'),
      '--brand-secondary-rgb': hexToRgb(theme.colors.secondaryColor || '#555555'),
      '--brand-accent-rgb': hexToRgb(theme.colors.accentColor || '#444444'),
      '--brand-background-rgb': hexToRgb(theme.colors.backgroundColor || '#ffffff'),
      '--brand-text-rgb': hexToRgb(theme.colors.textColor || '#1f2933'),

      // Legacy Colors (for backward compatibility)
      '--bg-primary': theme.colors.bgPrimary || theme.colors.backgroundColor || '#ffffff',
      '--bg-secondary': theme.colors.bgSecondary || theme.colors.backgroundColor || '#ffffff',
      '--bg-tertiary': theme.colors.bgTertiary || theme.colors.backgroundColor || '#ffffff',
      '--bg-elevated': theme.colors.bgElevated || theme.colors.backgroundColor || '#ffffff',
      '--bg-glass': theme.colors.bgGlass || `rgba(${hexToRgb(theme.colors.backgroundColor || '#ffffff')}, 0.92)`,
      '--bg-accent': (theme.colors as any).bgAccent || theme.colors.primaryColor || '#666666',

      '--text-primary': theme.colors.textPrimary || theme.colors.textColor || '#1f2933',
      '--text-secondary': theme.colors.textSecondary || theme.colors.textColor || '#1f2933',
      '--text-muted': theme.colors.textMuted || theme.colors.textColor || '#1f2933',
      '--text-inverse': theme.colors.textInverse || theme.colors.backgroundColor || '#ffffff',
      '--text-accent': (theme.colors as any).textAccent || theme.colors.accentColor || '#444444',

      // Accent System
      '--accent-primary': theme.colors.primaryColor || '#666666',
      '--accent-primary-rgb': hexToRgb(theme.colors.primaryColor || '#666666'),
      '--accent-secondary': theme.colors.secondaryColor || '#555555',
      '--accent-secondary-rgb': hexToRgb(theme.colors.secondaryColor || '#555555'),
      '--accent-accent': theme.colors.accentColor || '#444444',
      '--accent-accent-rgb': hexToRgb(theme.colors.accentColor || '#444444'),
    },
  });

  // Font + image vars (theme-specific) — emitted verbatim alongside the tokens.
  const extras: Record<string, string> = {
    // Font family overrides (globals.css composes final stacks from these)
    '--font-ui-family-override': fontUi,
    '--font-brand-family-override': fontBrand,
    '--font-mono-family-override': fontMono,

    // Font shortcuts / legacy aliases used across stylesheets
    '--font-ui': 'var(--font-ui-family)',
    '--font-brand': 'var(--font-brand-family)',
    '--font-mono': 'var(--font-mono-family)',
    '--font-base': 'var(--font-ui-family)',
    '--font-display': 'var(--font-brand-family)',
    '--font-badge': 'var(--font-ui-family)',
  };

  if (heroImageSource) {
    extras['--classic-hero-image'] = `url("${escapeCssUrl(optimizeImageUrl(heroImageSource, { width: 1920 }))}")`;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: renderThemeStyle({ vars, extras }),
      }}
    />
  );
}

function resolveFontToken(...candidates: Array<unknown>): string | null {
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const value = candidate.trim();
    if (!value || value.toLowerCase() === 'inherit') continue;
    return value;
  }
  return null;
}
