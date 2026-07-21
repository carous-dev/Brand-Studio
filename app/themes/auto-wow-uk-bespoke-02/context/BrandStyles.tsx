'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildGoogleFontsImport } from '@/app/lib/googleFonts';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl, hexToRgb } from '@/app/themes/lib/theme-tokens';

interface BrandStylesProps {
  brand: BrandConfig;
}

const THEME_ID = 'auto-wow-uk-bespoke-02';

const pickString = (...candidates: Array<unknown>): string | null => {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
};

/**
 * BrandStyles for auto-wow-uk-bespoke-02 — emits the canonical token block via
 * the shared emitter (buildThemeTokens + renderThemeStyle), plus the theme's own
 * image-slot / state / placeholder / font-override extras. Paired surface/
 * foreground tokens live in base.css and DERIVE from the dashboard pickers
 * (--color-bg, --color-surface, --color-text, --color-muted, --color-border)
 * set here. Brand records may override the brand triad AND the neutral pickers;
 * every surface repaints automatically. See
 * feedback_dashboard_tokens_drive_all_surfaces.md.
 *
 * Image slots use the 3-tier fallback chain per SKILL §"Brand-uploaded images
 * must render". Hero slot reads brand.heroImage FIRST (dashboard's
 * authoritative top-level field) before brand.images.hero (often stale alias).
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'Inter', 'Helvetica Neue', Arial, sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Anton', 'Impact', sans-serif";

  // Theme-default image paths shipped at /public/themes/<id>/images/*.jpg.
  const themeDefault = (slotFile: string) =>
    `/themes/${THEME_ID}/images/${slotFile}.jpg`;

  const brandImages: Record<string, unknown> = (brand as any)?.images || {};

  // HERO: brand.heroImage (authoritative) → brand.images.hero (may be stale) → theme default.
  const heroImageSlot =
    pickString((brand as any).heroImage, brandImages['hero']) || themeDefault('hero');

  // Other slots: brand.images.<slot> → theme default. NO cross-fall to hero.
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile);

  const aboutImage = resolveSlot('about', 'about');
  const servicesImage = resolveSlot('services', 'services');
  const financeImage = resolveSlot('finance', 'finance');
  const partExchangeImage = resolveSlot('partExchange', 'partExchange');
  const sellYourCarImage = resolveSlot('sellYourCar', 'sellYourCar');
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold');

  // Background + text drive auto-wow's dark tier (roles inverted — see base.css).
  // Kept here so the surface-bg-*-rgb overrides below track brand overrides.
  const bgColor = theme.colors.backgroundColor || '#ffffff';
  const textColor = theme.colors.textColor || '#0f1623';

  // Canonical token block via the shared emitter. Auto Wow's bespoke palette is
  // passed as `defaults`; brand records override any core token via
  // theme.colors.*. primaryStrong/secondary/accent literals differ from the
  // emitter's generic fallbacks, so they're passed. onPrimary (#ffffff) matches
  // the emitter default, so it's omitted. header-* and hero-* tokens are OMITTED
  // — nothing in this theme's CSS consumes them, and --color-review-star equals
  // the emitter default (#facc15), which IS consumed and emitted identically.
  const vars = buildThemeTokens(theme.colors as any, {
    defaults: {
      primaryColor: '#b51c24',
      secondaryColor: '#9f1920',
      accentColor: '#b51c24',
      backgroundColor: '#ffffff',
      surfaceColor: '#f6f7fb',
      textColor: '#0f1623',
      mutedColor: '#5b6573',
      borderColor: '#e3e6ee',
      primaryStrong: '#9f1920',
    },
  });

  const extras: Record<string, string> = {
    // Dark/light-surface rgb kept brand-reactive: base.css, used-cars, wishlist
    // consume rgba(var(--surface-bg-dark-rgb), X) / rgba(var(--surface-bg-light-rgb), X),
    // and auto-wow derives its dark tier from --color-text and its light tier
    // from --color-bg. Override the emitter's FIXED #0a0e14 / #ffffff so these
    // track brand overrides exactly as before.
    '--surface-bg-dark-rgb': hexToRgb(textColor),
    '--surface-bg-light-rgb': hexToRgb(bgColor),

    // Semantic state tokens — theme-locked bespoke hues (success/warning read in
    // the theme's own palette family, distinct from the emitter's generic
    // #16a34a/#d97706). Consumed by Hero + HorizontalStockTicker.
    '--state-success': '#67ffa3',
    '--state-success-strong': '#3fe88f',
    '--state-warning': '#d18a3d',
    '--state-warning-strong': '#b56c1f',

    // Missing-image placeholder fill.
    '--image-placeholder-bg': '#d8d8dc',

    // 7 image slots — themes reference these via var(--brand-image-*).
    '--brand-image-hero': `url("${escapeCssUrl(heroImageSlot)}")`,
    '--brand-image-about': `url("${escapeCssUrl(aboutImage)}")`,
    '--brand-image-services': `url("${escapeCssUrl(servicesImage)}")`,
    '--brand-image-finance': `url("${escapeCssUrl(financeImage)}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(partExchangeImage)}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(sellYourCarImage)}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(recentlySoldImage)}")`,

    // Compat alias consumed by legacy widgets.
    '--auto-hero-image': `url("${escapeCssUrl(heroImageSlot)}")`,

    // Font overrides.
    '--font-ui-family-override': fontUi,
    '--font-brand-family-override': fontBrand,
  };

  // Pull whichever Google Fonts the theme + brand record asks for. Without this
  // @import, --font-brand-family-override resolves to a font the browser never
  // loaded and headings silently fall back. See
  // feedback_brandstyles_must_load_google_fonts.
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
