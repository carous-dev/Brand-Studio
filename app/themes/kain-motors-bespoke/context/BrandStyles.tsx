'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildGoogleFontsImport } from '@/app/lib/googleFonts';

interface BrandStylesProps {
  brand: BrandConfig;
}

const THEME_ID = 'kain-motors-bespoke';

const themeDefault = (slotFile: string) => `/themes/${THEME_ID}/images/${slotFile}.jpg`;

function pickString(...candidates: Array<unknown>): string | null {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  }
  return null;
}

export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'DM Sans', 'Inter', system-ui, sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Oswald', 'Arial Narrow', sans-serif";
  const fontEditorial = "'Playfair Display', 'Times New Roman', serif";

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

  const primary = theme.colors.primaryColor || '#86744e';
  const secondary = (theme.colors as any).secondaryColor || '#d1b67a';
  const accent = (theme.colors as any).accentColor || '#d1b67a';

  const cssVariables: Record<string, string> = {
    // Brand triad (brand-record-overridable)
    '--color-primary': primary,
    '--color-primary-strong': (theme.colors as any).primaryStrong || '#766645',
    '--color-secondary': secondary,
    '--color-accent': accent,
    '--color-on-primary': '#ffffff',

    // Light tier (theme-locked, never brand-overridden — paired with text-on-light-*)
    '--color-bg': '#ffffff',
    '--color-surface': '#f6f7fb',
    '--color-text': '#0f1623',
    '--color-muted': '#5b6573',
    '--color-border': '#e3e6ee',

    // Dark tier (theme-locked)
    '--color-bg-dark': '#0a0e14',
    '--color-surface-dark': '#14181f',
    '--color-text-dark': '#ffffff',
    '--color-muted-dark': 'rgba(255,255,255,0.78)',
    '--color-border-dark': 'rgba(255,255,255,0.12)',

    // Paired surface + foreground tokens (canonical names from SKILL color policy)
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
    '--brand-primary-strong': (theme.colors as any).primaryStrong || '#766645',
    '--brand-on-primary': '#ffffff',

    // Prestige editorial extras
    '--kain-accent-warm': '#d1b67a',
    '--kain-accent-warm-soft': 'rgba(209, 182, 122, 0.16)',
    '--kain-gold-rule': 'linear-gradient(90deg, transparent 0%, #d1b67a 40%, #d1b67a 60%, transparent 100%)',
    '--kain-hero-overlay': 'linear-gradient(180deg, rgba(8,11,17,0.78) 0%, rgba(8,11,17,0.52) 60%, rgba(8,11,17,0.88) 100%)',

    // Header surfaces — prestige uses dark header on hero, light when scrolled
    '--color-header-bg': '#0a0e14',
    '--color-header-text': '#ffffff',
    '--color-header-muted': 'rgba(255,255,255,0.72)',

    // Hero
    '--color-hero-overlay-start': 'rgba(8, 11, 17, 0.86)',
    '--color-hero-overlay-end': 'rgba(8, 11, 17, 0.55)',
    '--color-hero-text-muted': 'rgba(255, 255, 255, 0.92)',
    '--color-hero-review-muted': 'rgba(255, 255, 255, 0.85)',
    '--color-review-star': '#facc15',

    // Bridge variables
    '--brand-secondary': secondary,
    '--brand-accent': accent,
    '--brand-background': '#ffffff',
    '--brand-text': '#0f1623',
    '--brand-primary-rgb': hexToRgb(primary),
    '--brand-secondary-rgb': hexToRgb(secondary),
    '--brand-accent-rgb': hexToRgb(accent),

    // Per-page image slots — 3-tier fallback chain (SKILL row 38c)
    // Hero reads brand.heroImage FIRST (authoritative), then brand.images.hero,
    // then theme default. Other slots: brand.images.<slot> → theme default.
    '--brand-image-hero': `url("${escapeCssUrl(heroImageSlot)}")`,
    '--brand-image-about': `url("${escapeCssUrl(aboutImage)}")`,
    '--brand-image-services': `url("${escapeCssUrl(servicesImage)}")`,
    '--brand-image-finance': `url("${escapeCssUrl(financeImage)}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(partExchangeImage)}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(sellYourCarImage)}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(recentlySoldImage)}")`,

    // Legacy alias for older base.css references
    '--kain-hero-image': `url("${escapeCssUrl(heroImageSlot)}")`,

    // Font family overrides
    '--font-ui-family-override': fontUi,
    '--font-brand-family-override': fontBrand,
    '--font-editorial-family': fontEditorial,
  };

  // Dynamic Google Fonts import — the hard-coded @import in base.css covers
  // the curated defaults (DM Sans, Oswald, Playfair Display), but a brand
  // record can swap those for any Google Font via /update or /create, and
  // this line ensures the chosen family actually loads at runtime.
  const fontImport = buildGoogleFontsImport(fontUi, fontBrand);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `${fontImport}:root {
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
