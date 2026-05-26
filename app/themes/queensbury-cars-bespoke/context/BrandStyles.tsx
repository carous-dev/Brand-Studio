'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';

interface BrandStylesProps {
  brand: BrandConfig;
}

const THEME_ID = 'queensbury-cars-bespoke';
const themeDefault = (slotFile: string) =>
  `/themes/${THEME_ID}/images/${slotFile}.jpg`;

const pickString = (...candidates: Array<unknown>): string | null => {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
};

export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Saira', 'Inter', system-ui, sans-serif";

  // ---- Brand image plumbing (3-tier fallback chain, per SKILL Quality Bar §38b/c) ----
  // Hero: brand.heroImage (authoritative — dashboard refreshes on every save) ->
  //       brand.images.hero (often stale alias) -> theme default. No cross-fall.
  // Other slots: brand.images.<slot> -> their OWN theme default. Never the hero.
  const brandImages: Record<string, unknown> = (brand as any)?.images || {};
  const heroImageSlot =
    pickString((brand as any).heroImage, brandImages['hero']) || themeDefault('hero');
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile);

  const aboutImage = resolveSlot('about', 'about');
  const servicesImage = resolveSlot('services', 'services');
  const financeImage = resolveSlot('finance', 'finance');
  const partExchangeImage = resolveSlot('partExchange', 'partExchange');
  const sellYourCarImage = resolveSlot('sellYourCar', 'sellYourCar');
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold');

  const primary = theme.colors.primaryColor || '#0f6beb';
  const secondary = theme.colors.secondaryColor || '#0d5ecf';
  const accent = theme.colors.accentColor || '#38a3ff';

  const cssVariables: Record<string, string> = {
    // Brand triad — the ONLY tokens brand records may override.
    '--color-primary': primary,
    '--color-secondary': secondary,
    '--color-accent': accent,

    // Surface + foreground tokens (LIGHT tier — paired, theme-locked).
    '--color-bg': theme.colors.backgroundColor || '#ffffff',
    '--color-surface': (theme.colors as any).surfaceColor || '#f6f7fb',
    '--color-text': theme.colors.textColor || '#0f1623',
    '--color-muted': (theme.colors as any).mutedColor || '#5b6573',
    '--color-border': (theme.colors as any).borderColor || '#e3e6ee',

    // Paired tokens — NEVER overridable by brand records.
    '--surface-bg-light': '#ffffff',
    '--surface-card-light': '#f6f7fb',
    '--text-on-light-strong': '#0f1623',
    '--text-on-light-muted': '#5b6573',
    '--border-on-light': '#e3e6ee',
    '--surface-bg-dark': '#0a0e14',
    '--surface-card-dark': '#14181f',
    '--text-on-dark-strong': '#ffffff',
    '--text-on-dark-muted': 'rgba(255,255,255,0.78)',
    '--border-on-dark': 'rgba(255,255,255,0.12)',
    '--brand-primary': primary,
    '--brand-primary-strong': secondary,
    '--brand-on-primary': '#ffffff',

    // Header / hero text bridges
    '--color-header-bg': (theme.colors as any).headerBg || '#0a0e14',
    '--color-header-text': (theme.colors as any).headerText || '#ffffff',
    '--color-header-muted': (theme.colors as any).headerMuted || 'rgba(255,255,255,0.78)',
    '--color-hero-overlay-start': (theme.colors as any).heroOverlayStart || 'rgba(8, 11, 28, 0.86)',
    '--color-hero-overlay-end': (theme.colors as any).heroOverlayEnd || 'rgba(8, 11, 28, 0.55)',
    '--color-hero-text-muted': (theme.colors as any).heroTextMuted || 'rgba(255, 255, 255, 0.92)',
    '--color-hero-review-muted': (theme.colors as any).heroReviewMuted || 'rgba(255, 255, 255, 0.86)',
    '--color-review-star': (theme.colors as any).reviewStar || '#facc15',

    // RGB bridges for color-mix shims
    '--brand-primary-rgb': hexToRgb(primary),
    '--brand-secondary-rgb': hexToRgb(secondary),
    '--brand-accent-rgb': hexToRgb(accent),

    // Per-page imagery — emitted unconditionally, ALWAYS resolves to either
    // an operator upload or this theme's curated default. Components consume
    // via var(--brand-image-<slot>, none) layered above the theme default,
    // so 404s reveal the theme default underneath.
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
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '15, 107, 235';
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
