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

  // Per-page imagery (7 slots) — fallback chain per the brand-image policy.
  //
  // **Hero slot** uses a special-cased order because `brand.images.hero` can
  // go STALE in MySQL (Difatha 2026-05-11 found a brand record where
  // `images.hero` was the placeholder "/images/hero-bg.png" from brand
  // creation, while `brand.heroImage` had been updated by the dashboard to
  // the operator's latest upload `/images/<slug>-hero.png`). The top-level
  // `brand.heroImage` is the AUTHORITATIVE field — the dashboard always
  // refreshes it on each save. `brand.images.hero` is a derived alias that
  // older brand records or non-standard save paths may leave behind.
  // Order: brand.heroImage → brand.images.hero → theme curated default.
  //
  // **Other slots** use the standard chain: brand.images.<slot> → theme
  // curated default. No cross-fall to hero (so operator-uploads-hero-only
  // previews still render distinctive per-page imagery rather than five
  // copies of the hero).
  //
  // We DO NOT fall back to /images/hero-placeholder.jpg (which 404s).
  // The chain MUST terminate at /themes/<id>/images/<slot>.jpg — the
  // curated Unsplash defaults shipped on disk in Phase 7.5a.
  const THEME_ID = 'auto-wow-uk-bespoke';
  const themeDefault = (slot: string): string => `/themes/${THEME_ID}/images/${slot}.jpg`;
  const brandImages: Record<string, unknown> = (brand as any)?.images || {};

  const pickString = (...candidates: Array<unknown>): string | null => {
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c.trim();
    }
    return null;
  };

  // Hero — prefer top-level brand.heroImage (authoritative) over brand.images.hero (can be stale).
  const heroImageSlot =
    pickString(brand.heroImage, brandImages['hero']) || themeDefault('hero');

  // Other slots — brand.images.<slot> → theme default.
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile);

  const aboutImage = resolveSlot('about', 'about');
  const servicesImage = resolveSlot('services', 'services');
  const financeImage = resolveSlot('finance', 'finance');
  const partExchangeImage = resolveSlot('partExchange', 'partExchange');
  const sellYourCarImage = resolveSlot('sellYourCar', 'sellYourCar');
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold');
  // Legacy reference for any code that reads --auto-hero-image directly.
  const heroImage = heroImageSlot;

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
