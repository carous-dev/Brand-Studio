'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';

interface BrandStylesProps {
  brand: BrandConfig;
}

const THEME_ID = 'axis-autos-bespoke';

const pickString = (...candidates: Array<unknown>): string | null => {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
};

/**
 * BrandStyles for axis-autos-bespoke — emits ALL 8 dashboard pickers as
 * tokens (Primary/Secondary/Accent/Background/Text/Border/Muted/Surface)
 * plus RGB triples for token-safe alpha. Theme base.css derives every
 * paired surface/foreground token from these — see
 * feedback_dashboard_tokens_drive_all_surfaces.md.
 *
 * Image slots use the 3-tier fallback per SKILL Pitfall #38c — hero reads
 * brand.heroImage FIRST (the dashboard's authoritative top-level field).
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'IBM Plex Sans', 'Inter', 'Helvetica Neue', Arial, sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'IBM Plex Mono', 'Courier New', monospace";

  const themeDefault = (slotFile: string) =>
    `/themes/${THEME_ID}/images/${slotFile}.jpg`;

  const brandImages: Record<string, unknown> = (brand as any)?.images || {};

  // Hero slot: brand.heroImage (authoritative) → brand.images.hero → theme default.
  const heroImageSlot =
    pickString((brand as any).heroImage, brandImages['hero']) || themeDefault('hero');

  // Other slots: brand.images.<slot> → theme default. No cross-fall.
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile);

  const aboutImage = resolveSlot('about', 'about');
  const servicesImage = resolveSlot('services', 'services');
  const financeImage = resolveSlot('finance', 'finance');
  const partExchangeImage = resolveSlot('partExchange', 'partExchange');
  const sellYourCarImage = resolveSlot('sellYourCar', 'sellYourCar');
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold');

  // 8 dashboard pickers — single source of truth.
  const primary = theme.colors.primaryColor || '#248709';
  const primaryStrong = (theme.colors as any).primaryStrong || '#207708';
  const onPrimary = (theme.colors as any).onPrimary || '#ffffff';
  const bgColor = theme.colors.backgroundColor || '#ffffff';
  const surfaceColor = (theme.colors as any).surfaceColor || '#f6f7fb';
  const textColor = theme.colors.textColor || '#0f1623';
  const mutedColor = (theme.colors as any).mutedColor || '#5b6573';
  const borderColor = (theme.colors as any).borderColor || '#e3e6ee';

  const cssVariables: Record<string, string> = {
    // Brand triad
    '--color-primary': primary,
    '--color-primary-strong': primaryStrong,
    '--color-on-primary': onPrimary,
    '--brand-primary': primary,
    '--brand-primary-strong': primaryStrong,
    '--brand-on-primary': onPrimary,
    '--brand-primary-rgb': hexToRgb(primary),

    // Dashboard neutrals — base.css derives every surface/foreground token from these.
    '--color-bg': bgColor,
    '--color-surface': surfaceColor,
    '--color-text': textColor,
    '--color-muted': mutedColor,
    '--color-border': borderColor,
    '--color-secondary': (theme.colors as any).secondaryColor || primaryStrong,
    '--color-accent': (theme.colors as any).accentColor || primary,

    // RGB triples for token-safe alpha
    '--color-bg-rgb': hexToRgb(bgColor),
    '--color-text-rgb': hexToRgb(textColor),
    '--color-surface-rgb': hexToRgb(surfaceColor),
    '--surface-bg-dark-rgb': hexToRgb(textColor),
    '--surface-bg-light-rgb': hexToRgb(bgColor),

    // Semantic state tokens — theme-locked utility colors.
    '--state-success': '#67ffa3',
    '--state-success-strong': '#3fe88f',
    '--state-warning': '#d18a3d',
    '--state-warning-strong': '#b56c1f',
    '--image-placeholder-bg': '#d8d8dc',

    // Header chrome — dark sections re-use --color-text as bg, --color-bg as fg.
    '--color-header-bg': textColor,
    '--color-header-text': bgColor,
    '--color-header-muted': `color-mix(in srgb, ${bgColor} 78%, transparent)`,
    '--color-hero-overlay-start': 'rgba(var(--color-text-rgb), 0.62)',
    '--color-hero-overlay-end': 'rgba(var(--color-text-rgb), 0.88)',
    '--color-hero-text-muted': `color-mix(in srgb, ${bgColor} 92%, transparent)`,
    '--color-hero-review-muted': `color-mix(in srgb, ${bgColor} 85%, transparent)`,
    '--color-review-star': '#facc15',

    // 7 image slots with multi-layer fallback in component CSS.
    '--brand-image-hero': `url("${escapeCssUrl(heroImageSlot)}")`,
    '--brand-image-about': `url("${escapeCssUrl(aboutImage)}")`,
    '--brand-image-services': `url("${escapeCssUrl(servicesImage)}")`,
    '--brand-image-finance': `url("${escapeCssUrl(financeImage)}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(partExchangeImage)}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(sellYourCarImage)}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(recentlySoldImage)}")`,

    // Legacy alias.
    '--axis-hero-image': `url("${escapeCssUrl(heroImageSlot)}")`,

    // Fonts.
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
