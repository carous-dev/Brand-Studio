'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';

interface BrandStylesProps {
  brand: BrandConfig;
}

/**
 * Injects brand-specific CSS variables for the auto-wow-uk-bespoke theme.
 * The theme's base.css consumes these via var(--color-...) so swapping a
 * brand's primary/secondary/accent colours fully recolours the site.
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'Montserrat', 'Segoe UI', sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Oswald', 'Montserrat', 'Segoe UI', sans-serif";

  const heroImage = brand.heroImage || brand.logo || '/images/hero-placeholder.jpg';

  // Per-page imagery (7 slots) — sourced by tools/fetch-theme-images.mjs and
  // saved per-brand under /themes/<id>/images/<slot>.jpg. brand.images is the
  // dashboard-editable structured field; falls back to the hero for any slot
  // the dashboard hasn't filled in.
  const brandImages: Record<string, unknown> = (brand as any)?.images || {};
  const imageOr = (slotKey: string, fallback: string): string => {
    const v = brandImages[slotKey];
    return typeof v === 'string' && v.trim() ? v : fallback;
  };
  const heroImageSlot = imageOr('hero', heroImage);
  const aboutImage = imageOr('about', heroImageSlot);
  const servicesImage = imageOr('services', heroImageSlot);
  const financeImage = imageOr('finance', heroImageSlot);
  const partExchangeImage = imageOr('partExchange', heroImageSlot);
  const sellYourCarImage = imageOr('sellYourCar', heroImageSlot);
  const recentlySoldImage = imageOr('recentlySold', heroImageSlot);

  const cssVariables: Record<string, string> = {
    // Spring core palette mapped to brand tokens
    '--color-primary': theme.colors.primaryColor || '#067a74',
    '--color-secondary': theme.colors.secondaryColor || '#08a49d',
    '--color-accent': theme.colors.accentColor || '#16b3a8',
    '--color-bg': theme.colors.backgroundColor || '#f7f7f9',
    '--color-surface': (theme.colors as any).surfaceColor || '#ffffff',
    '--color-text': theme.colors.textColor || '#111827',
    '--color-muted': (theme.colors as any).mutedColor || '#4b5563',
    '--color-border': (theme.colors as any).borderColor || '#d3d7dc',
    '--color-header-bg': (theme.colors as any).headerBg || '#ffffff',
    '--color-header-text': (theme.colors as any).headerText || theme.colors.textColor || '#111827',
    '--color-header-muted': (theme.colors as any).headerMuted || '#6b7280',
    '--color-hero-overlay-start': (theme.colors as any).heroOverlayStart || 'rgba(11, 18, 17, 0.5)',
    '--color-hero-overlay-end': (theme.colors as any).heroOverlayEnd || 'rgba(11, 18, 17, 0.55)',
    '--color-hero-text-muted': (theme.colors as any).heroTextMuted || 'rgba(255, 255, 255, 0.9)',
    '--color-hero-review-muted': (theme.colors as any).heroReviewMuted || 'rgba(255, 255, 255, 0.85)',
    '--color-review-star': (theme.colors as any).reviewStar || '#facc15',

    // Bridge variables for shared chrome / carous-platform style references
    '--brand-primary': theme.colors.primaryColor || '#067a74',
    '--brand-secondary': theme.colors.secondaryColor || '#08a49d',
    '--brand-accent': theme.colors.accentColor || '#16b3a8',
    '--brand-background': theme.colors.backgroundColor || '#f7f7f9',
    '--brand-text': theme.colors.textColor || '#111827',
    '--brand-primary-rgb': hexToRgb(theme.colors.primaryColor || '#067a74'),
    '--brand-secondary-rgb': hexToRgb(theme.colors.secondaryColor || '#08a49d'),
    '--brand-accent-rgb': hexToRgb(theme.colors.accentColor || '#16b3a8'),

    // Hero background image (resolves to brand.heroImage if set in dashboard)
    '--auto-hero-image': `url("${escapeCssUrl(heroImage)}")`,

    // Per-page image slots — every theme references these via var(--brand-image-*)
    // so dashboard edits to brand.images.* propagate without code changes.
    '--brand-image-hero': `url("${escapeCssUrl(heroImageSlot)}")`,
    '--brand-image-about': `url("${escapeCssUrl(aboutImage)}")`,
    '--brand-image-services': `url("${escapeCssUrl(servicesImage)}")`,
    '--brand-image-finance': `url("${escapeCssUrl(financeImage)}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(partExchangeImage)}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(sellYourCarImage)}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(recentlySoldImage)}")`,

    // Font family overrides
    '--font-ui-family-override': fontUi,
    '--font-brand-family-override': fontBrand,
  };

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          :root {
            ${Object.entries(cssVariables)
              .map(([key, value]) => `${key}: ${value};`)
              .join('\n            ')}
            font-family: ${fontUi};
          }
        `,
      }}
    />
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
}

function escapeCssUrl(url: string): string {
  return String(url).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n|\r/g, '');
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
