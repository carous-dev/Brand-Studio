'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';

interface BrandStylesProps {
  brand: BrandConfig;
}

const THEME_ID = 'dual-stock-modern-bespoke';

const themeDefault = (slotFile: string) =>
  `/themes/${THEME_ID}/images/${slotFile}.jpg`;

const pickString = (...candidates: Array<unknown>): string | null => {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
};

/**
 * Injects brand-specific CSS variables for dual-stock-modern-bespoke.
 *
 * Image-slot policy (per SKILL.md Pitfall row 38c):
 *  - Hero: brand.heroImage FIRST (operator-uploaded — authoritative) →
 *    brand.images.hero (may be stale) → theme default.
 *  - Other slots: brand.images.<slot> → theme default. No cross-fall to hero.
 *
 * Each component layers the theme default UNDER the CSS var so a 404'ing
 * brand URL still resolves visually (see base.css multi-layer background
 * patterns).
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'Open Sans', system-ui, sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Roboto Condensed', 'Arial Narrow', 'Open Sans', sans-serif";

  const brandImages: Record<string, unknown> = (brand as any)?.images || {};

  // HERO: brand.heroImage (authoritative top-level) → brand.images.hero (may be stale) → theme default.
  const heroImageSlot =
    pickString((brand as any).heroImage, brandImages['hero']) || themeDefault('hero');

  // Other slots: brand.images.<slot> → theme default. No cross-fall to hero.
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile);

  const aboutImage = resolveSlot('about', 'about');
  const servicesImage = resolveSlot('services', 'services');
  const financeImage = resolveSlot('finance', 'finance');
  const partExchangeImage = resolveSlot('partExchange', 'partExchange');
  const sellYourCarImage = resolveSlot('sellYourCar', 'sellYourCar');
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold');

  // Brand triad defaults — electric sky blue on deep navy (scottishvancenter-inspired).
  // Operators override per-brand via /update; these are the theme-shipped defaults.
  const primary = theme.colors.primaryColor || '#28a2e6';
  const secondary = theme.colors.secondaryColor || '#10254a';
  const accent = theme.colors.accentColor || '#2fb4ff';

  const cssVariables: Record<string, string> = {
    '--color-primary': primary,
    '--color-secondary': secondary,
    '--color-accent': accent,
    '--color-bg': theme.colors.backgroundColor || '#f5f8ff',
    '--color-surface': (theme.colors as any).surfaceColor || '#ffffff',
    '--color-text': theme.colors.textColor || '#0b1c3a',
    '--color-muted': (theme.colors as any).mutedColor || '#52688c',
    '--color-border': (theme.colors as any).borderColor || '#d6def0',
    '--color-header-bg': (theme.colors as any).headerBg || '#030a1a',
    '--color-header-text': (theme.colors as any).headerText || '#ffffff',
    '--color-header-muted': (theme.colors as any).headerMuted || 'rgba(216,226,246,0.78)',
    '--color-hero-overlay-start': (theme.colors as any).heroOverlayStart || 'rgba(3, 10, 26, 0.92)',
    '--color-hero-overlay-end': (theme.colors as any).heroOverlayEnd || 'rgba(11, 28, 58, 0.55)',
    '--color-surface-dark': (theme.colors as any).surfaceDark || '#0b1c3a',
    '--color-surface-card-dark': (theme.colors as any).surfaceCardDark || '#10254a',
    '--color-border-dark': (theme.colors as any).borderDark || 'rgba(149,177,220,0.22)',
    '--color-hero-text-muted': (theme.colors as any).heroTextMuted || 'rgba(255, 255, 255, 0.92)',
    '--color-hero-review-muted': (theme.colors as any).heroReviewMuted || 'rgba(255, 255, 255, 0.85)',
    '--color-review-star': (theme.colors as any).reviewStar || '#facc15',

    // Bridge variables (shared chrome / carous-platform style references)
    '--brand-primary': primary,
    '--brand-secondary': secondary,
    '--brand-accent': accent,
    '--brand-background': theme.colors.backgroundColor || '#ffffff',
    '--brand-text': theme.colors.textColor || '#0f1623',
    '--brand-primary-rgb': hexToRgb(primary),
    '--brand-secondary-rgb': hexToRgb(secondary),
    '--brand-accent-rgb': hexToRgb(accent),

    // Per-page image slots — every component references these via var(--brand-image-*).
    // Each slot independently falls back to its own theme-curated default (no cross-fall).
    '--brand-image-hero': `url("${escapeCssUrl(heroImageSlot)}")`,
    '--brand-image-about': `url("${escapeCssUrl(aboutImage)}")`,
    '--brand-image-services': `url("${escapeCssUrl(servicesImage)}")`,
    '--brand-image-finance': `url("${escapeCssUrl(financeImage)}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(partExchangeImage)}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(sellYourCarImage)}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(recentlySoldImage)}")`,

    // Legacy var kept for any leftover references during transition
    '--dual-hero-image': `url("${escapeCssUrl(heroImageSlot)}")`,

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
