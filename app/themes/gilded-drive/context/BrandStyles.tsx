'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl, hexToRgb } from '@/app/themes/lib/theme-tokens';
import { optimizeImageUrl } from '@/app/lib/imageOptimize';

interface BrandStylesProps {
  brand: BrandConfig;
}

/**
 * BrandStyles for the gilded-drive theme.
 * =============================================================================
 *
 * MIGRATED to the shared token contract (buildThemeTokens + renderThemeStyle)
 * ADDITIVELY: the modern --color- set is now emitted (latent — gilded's legacy
 * CSS does not read it yet), while EVERY legacy var this theme historically
 * emitted (the --brand-, --bg-, --text-, --accent- families, the bare
 * --bg/--panel/--card/--accent/--muted aliases, --radius/--nav-height, the
 * --field-, --skeleton-, --snack- families, fonts, --classic-hero-image) is
 * preserved VERBATIM via `legacyAliases` + `extras`. Values are computed with
 * the exact same brand-color fallbacks as before, so the render is
 * byte-identical under the default palette.
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
  const heroImage = brand.heroImage || brand.logo || '/favicon.svg';

  // Brand colours with the SAME fallbacks the theme has always used. These feed
  // both the legacy alias values below and the core-8 `defaults` passed to the
  // shared emitter, so nothing about the rendered palette changes.
  const c = theme.colors as any;
  const primary = c.primaryColor || '#666666';
  const secondary = c.secondaryColor || '#555555';
  const accent = c.accentColor || '#444444';
  const background = c.backgroundColor || '#ffffff';
  const text = c.textColor || '#1f2933';

  // Canonical modern token block via the shared emitter. Gilded's bespoke
  // fallbacks map onto the core-8 `defaults`; brand records override any of the
  // 8 via theme.colors.*. text/surface/muted/border use standard light-tier
  // neutrals where gilded had no clear equivalent (surface/muted/border are new
  // latent tokens; text mirrors the theme's existing text fallback).
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
    // Every legacy custom property the theme has always emitted, reproduced
    // verbatim so existing component CSS keeps resolving unchanged.
    legacyAliases: {
      // Core brand colours (mirror; identical values to the emitter's)
      '--brand-primary': primary,
      '--brand-secondary': secondary,
      '--brand-accent': accent,
      '--brand-background': background,
      '--brand-text': text,

      '--brand-primary-rgb': hexToRgb(primary),
      '--brand-secondary-rgb': hexToRgb(secondary),
      '--brand-accent-rgb': hexToRgb(accent),
      '--brand-background-rgb': hexToRgb(background),
      '--brand-text-rgb': hexToRgb(text),

      // Legacy background/text/accent families
      '--bg-primary': c.bgPrimary || background,
      '--bg-secondary': c.bgSecondary || background,
      '--bg-tertiary': c.bgTertiary || background,
      '--bg-elevated': c.bgElevated || background,
      '--bg-glass': c.bgGlass || `rgba(${hexToRgb(background)}, 0.92)`,
      '--bg-accent': c.bgAccent || primary,

      '--text-primary': c.textPrimary || text,
      '--text-secondary': c.textSecondary || text,
      '--text-muted': c.textMuted || text,
      '--text-inverse': c.textInverse || background,
      '--text-accent': c.textAccent || accent,

      '--accent-primary': primary,
      '--accent-primary-rgb': hexToRgb(primary),
      '--accent-secondary': secondary,
      '--accent-secondary-rgb': hexToRgb(secondary),
      '--accent-accent': accent,
      '--accent-accent-rgb': hexToRgb(accent),

      // Gilded drive theme aliases (mapped to brand tokens)
      '--bg': background,
      '--panel': background,
      '--card': background,
      '--muted': `rgba(${hexToRgb(text)}, 0.7)`,
      '--accent': primary,
      '--accent-rgb': hexToRgb(primary),
      '--accent-2': secondary,
      '--accent-2-rgb': hexToRgb(secondary),
      '--surface-light': background,
      '--radius': '14px',
      '--nav-height': '96px',
      '--dark-center': text,
      '--field-bg': background,
      '--field-height': '55px',
      '--skeleton-bg': `rgba(${hexToRgb(text)}, 0.08)`,
      '--skeleton-highlight': `rgba(${hexToRgb(primary)}, 0.06)`,
      '--skeleton-shimmer': `linear-gradient(90deg, rgba(${hexToRgb(text)}, 0.08) 0%, rgba(${hexToRgb(primary)}, 0.06) 50%, rgba(${hexToRgb(text)}, 0.08) 100%)`,
      '--snack-right': '20px',
      '--snack-bottom': '20px',
      '--snack-min-width': '240px',
      '--snack-max-width': '360px',
      '--snack-radius': '10px',
      '--snack-padding': '12px 16px',
      '--snack-shadow': '0 10px 30px rgba(6, 10, 15, 0.25)',
      '--snack-color': background,
    },
  });

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
    '--classic-hero-image': `url("${escapeCssUrl(optimizeImageUrl(heroImage, { width: 1920 }))}")`,
  };

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
