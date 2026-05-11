'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';

interface BrandStylesProps {
  brand: BrandConfig;
}

const THEME_ID = 'showroom-shine-cars-bespoke';
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
    "'DM Sans', system-ui, sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Oswald', 'Arial Narrow', sans-serif";

  const brandImages: Record<string, unknown> = (brand as any)?.images || {};

  // HERO slot: brand.heroImage is authoritative (dashboard keeps it fresh on
  // every save). brand.images.hero is a derived alias that often goes stale.
  // Theme default is the terminal fallback.
  const heroImageSlot =
    pickString(brand.heroImage, brandImages['hero']) || themeDefault('hero');

  // Other slots: brand.images.<slot> first, then theme default. NEVER cross-fall
  // to hero — each slot falls back to its own curated theme default so
  // operator-uploads-hero-only previews still render distinctive per-page imagery.
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile);

  const aboutImage = resolveSlot('about', 'about');
  const servicesImage = resolveSlot('services', 'services');
  const financeImage = resolveSlot('finance', 'finance');
  const partExchangeImage = resolveSlot('partExchange', 'partExchange');
  const sellYourCarImage = resolveSlot('sellYourCar', 'sellYourCar');
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold');

  // Brand triad — overridable from brand.theme.colors. Neutrals stay theme-locked.
  const brandPrimary = theme.colors.primaryColor || '#ad0b1b';
  const brandPrimaryStrong = (theme.colors as any).primaryStrong || '#980a18';
  const brandSecondary = theme.colors.secondaryColor || '#0a0e14';
  const brandAccent = theme.colors.accentColor || brandPrimary;
  const brandOnPrimary = (theme.colors as any).onPrimaryColor || '#ffffff';

  const cssVariables: Record<string, string> = {
    // Brand triad (overridable by brand record)
    '--color-primary': brandPrimary,
    '--color-primary-strong': brandPrimaryStrong,
    '--color-on-primary': brandOnPrimary,
    '--color-secondary': brandSecondary,
    '--color-accent': brandAccent,

    // Fixed neutral tiers — NEVER overridable. Brand records cannot
    // break contrast because the surface↔foreground pairing is locked here.
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

    // Brand triad (canonical names — paired with surfaces)
    '--brand-primary': brandPrimary,
    '--brand-primary-strong': brandPrimaryStrong,
    '--brand-on-primary': brandOnPrimary,

    // Legacy aliases (light tier). Components on dark surfaces use the
    // *-dark tokens directly — do NOT depend on these for dark sections.
    '--color-bg': '#ffffff',
    '--color-surface': '#f6f7fb',
    '--color-text': '#0f1623',
    '--color-muted': '#5b6573',
    '--color-border': '#e3e6ee',
    '--color-header-bg': '#ffffff',
    '--color-header-text': '#0f1623',
    '--color-header-muted': '#5b6573',
    '--color-hero-overlay-start': 'rgba(20, 4, 8, 0.32)',
    '--color-hero-overlay-end': 'rgba(8, 11, 17, 0.78)',
    '--color-hero-text-muted': 'rgba(255, 255, 255, 0.92)',
    '--color-review-star': '#facc15',

    // Carous-platform bridge tokens
    '--brand-secondary': brandSecondary,
    '--brand-accent': brandAccent,
    '--brand-background': '#ffffff',
    '--brand-text': '#0f1623',
    '--brand-primary-rgb': hexToRgb(brandPrimary),
    '--brand-secondary-rgb': hexToRgb(brandSecondary),
    '--brand-accent-rgb': hexToRgb(brandAccent),

    // 7-slot per-page image vars. Pair with multi-layer CSS background-image
    // patterns in base.css so a 404 on the brand URL still reveals the theme
    // default underneath. NEVER use a generic placeholder like
    // /images/hero-placeholder.jpg here — that 404s on most deploys and
    // CSS-level var(name, fallback) won't fire when the var is set to
    // a broken URL string.
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
