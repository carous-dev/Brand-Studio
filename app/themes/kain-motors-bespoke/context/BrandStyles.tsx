'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildGoogleFontsImport } from '@/app/lib/googleFonts';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl } from '@/app/themes/lib/theme-tokens';
import { optimizeImageUrl } from '@/app/lib/imageOptimize';

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

/**
 * BrandStyles for kain-motors-bespoke — emits the canonical token block via the
 * shared emitter (buildThemeTokens + renderThemeStyle), then layers Kain's own
 * extended tokens (dark tier --color-*-dark, the large --kain-* prestige
 * palette, --font-editorial-family, the 7 image slots and the legacy hero var)
 * as `extras` since the emitter doesn't produce them. Kain's core 8 + chrome
 * fallbacks are passed as `defaults` so brand records can override the triad
 * and neutral pickers and every surface repaints. Kain's base.css consumes the
 * emitter's fixed light and dark tier tokens (surface, text-on, border-on)
 * directly, so those are not re-declared here.
 */
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

  // Canonical token block via the shared emitter. Kain's prestige palette is
  // passed as `defaults`; brand records override any core token via
  // theme.colors.*. Kain ships a DARK header + a dark hero scrim, so the
  // header-*/hero-* tokens are DISTINCT literals (not derived from bg/text/muted)
  // and are passed as defaults rather than left to the emitter's light defaults.
  const vars = buildThemeTokens(theme.colors as any, {
    defaults: {
      primaryColor: '#86744e',
      secondaryColor: '#d1b67a',
      accentColor: '#d1b67a',
      backgroundColor: '#ffffff',
      surfaceColor: '#f6f7fb',
      textColor: '#0f1623',
      mutedColor: '#5b6573',
      borderColor: '#e3e6ee',
      primaryStrong: '#766645',
      onPrimary: '#ffffff',
      headerBg: '#0a0e14',
      headerText: '#ffffff',
      headerMuted: 'rgba(255,255,255,0.72)',
      heroOverlayStart: 'rgba(8, 11, 17, 0.86)',
      heroOverlayEnd: 'rgba(8, 11, 17, 0.55)',
      heroTextMuted: 'rgba(255, 255, 255, 0.92)',
      heroReviewMuted: 'rgba(255, 255, 255, 0.85)',
      reviewStar: '#facc15',
    },
  });

  const extras: Record<string, string> = {
    // Extended dark tier (theme-locked) — the emitter emits the fixed
    // --surface-*/--text-on-*/--border-on-* paired tier, but Kain's base.css
    // also consumes these --color-*-dark aliases, so they live here verbatim.
    '--color-bg-dark': '#0a0e14',
    '--color-surface-dark': '#14181f',
    '--color-text-dark': '#ffffff',
    '--color-muted-dark': 'rgba(255,255,255,0.78)',
    '--color-border-dark': 'rgba(255,255,255,0.12)',

    // Prestige editorial extras
    '--kain-accent-warm': '#d1b67a',
    '--kain-accent-warm-soft': 'rgba(209, 182, 122, 0.16)',
    '--kain-accent-warm-light': '#f4d99c', // hero title-accent highlight (lighter gold)
    '--kain-accent-warm-hover': '#c9a965', // gold button hover (deeper gold)
    '--kain-badge-hi': '#ffe169', // featured / offer badge (bright gold)
    '--kain-gold-rule': 'linear-gradient(90deg, transparent 0%, #d1b67a 40%, #d1b67a 60%, transparent 100%)',
    '--kain-hero-overlay': 'linear-gradient(180deg, rgba(8,11,17,0.78) 0%, rgba(8,11,17,0.52) 60%, rgba(8,11,17,0.88) 100%)',

    // Named fixed hues — checker-exempt definitions that preserve the exact
    // default palette. Components reference these vars instead of raw literals.
    '--kain-black': '#000000', // pure black for color-mix darken partners + scrims
    '--kain-surface-deep': '#060a0f', // deepest dark plate (footer bottom bar)
    '--kain-status-open': '#34d399', // "open now" status dot (semantic green)
    '--kain-whatsapp': '#25d366', // WhatsApp brand green (fixed)
    '--kain-whatsapp-hover': '#1faa54', // WhatsApp brand green hover (fixed)
    '--kain-whatsapp-hover-alt': '#1ebe5b', // WhatsApp brand green hover (alt shade)
    '--kain-error-text': '#9a3412', // form error text (semantic)
    '--kain-error-accent': '#c2410c', // form error accent/border (semantic)

    // Per-page image slots — 3-tier fallback chain (SKILL row 38c). Hero reads
    // brand.heroImage FIRST (authoritative), then brand.images.hero, then the
    // theme default. Other slots: brand.images.<slot> → theme default.
    '--brand-image-hero': `url("${escapeCssUrl(optimizeImageUrl(heroImageSlot, { width: 1920 }))}")`,
    '--brand-image-about': `url("${escapeCssUrl(optimizeImageUrl(aboutImage, { width: 1280 }))}")`,
    '--brand-image-services': `url("${escapeCssUrl(optimizeImageUrl(servicesImage, { width: 1280 }))}")`,
    '--brand-image-finance': `url("${escapeCssUrl(optimizeImageUrl(financeImage, { width: 1280 }))}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(optimizeImageUrl(partExchangeImage, { width: 1280 }))}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(optimizeImageUrl(sellYourCarImage, { width: 1280 }))}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(optimizeImageUrl(recentlySoldImage, { width: 1280 }))}")`,

    // Legacy alias for older base.css references
    '--kain-hero-image': `url("${escapeCssUrl(optimizeImageUrl(heroImageSlot, { width: 1920 }))}")`,

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
        __html: renderThemeStyle({ vars, extras, fontFamily: fontUi, fontImport }),
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
