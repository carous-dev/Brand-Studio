'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildGoogleFontsImport } from '@/app/lib/googleFonts';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl, hexToRgb } from '@/app/themes/lib/theme-tokens';

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
 * BrandStyles for axis-autos-bespoke — emits the canonical token block via the
 * shared emitter (buildThemeTokens + renderThemeStyle), plus the theme's own
 * image-slot / spec-accent / font-override extras. Paired surface/foreground
 * tokens live in base.css and DERIVE from the dashboard pickers (--color-bg,
 * --color-surface, --color-text, --color-muted, --color-border) set here.
 * Brand records may override the brand triad AND the neutral pickers; every
 * surface repaints automatically. See feedback_dashboard_tokens_drive_all_surfaces.md.
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Manrope', 'IBM Plex Sans', sans-serif";

  const themeDefault = (slotFile: string) =>
    `/themes/${THEME_ID}/images/${slotFile}.jpg`;

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

  // Text colour drives axis's dark tier (roles inverted — see base.css). Kept
  // here so the surface-bg-dark-rgb override below tracks brand overrides.
  const textColor = theme.colors.textColor || '#0f1623';

  // Canonical token block via the shared emitter. Axis Autos' bespoke palette
  // is passed as `defaults`; brand records override any core token via
  // theme.colors.*. header-* tokens are OMITTED — axis derived them straight
  // from bg/text/muted, which is exactly what the emitter does. hero-overlay
  // (transparent — split-screen-photo-left never tints the photo) and the
  // muted-grey hero text/review tokens ARE distinct literals, so they're passed.
  const vars = buildThemeTokens(theme.colors as any, {
    defaults: {
      primaryColor: '#248709',
      secondaryColor: '#207708',
      accentColor: '#248709',
      backgroundColor: '#ffffff',
      surfaceColor: '#f6f7fb',
      textColor: '#0f1623',
      mutedColor: '#5b6573',
      borderColor: '#e3e6ee',
      primaryStrong: '#207708',
      onPrimary: '#ffffff',
      heroOverlayStart: 'rgba(0, 0, 0, 0.0)',
      heroOverlayEnd: 'rgba(0, 0, 0, 0.0)',
      heroTextMuted: '#5b6573',
      heroReviewMuted: '#5b6573',
      reviewStar: '#facc15',
    },
  });

  const extras: Record<string, string> = {
    // Dark-surface rgb kept brand-reactive: used-cars/[slug] consumes
    // rgba(var(--surface-bg-dark-rgb), 0.7), and axis derives its dark tier
    // from --color-text. Override the emitter's fixed #0a0e14 so this tracks
    // textColor exactly as before (byte-identical under the default palette).
    '--surface-bg-dark-rgb': hexToRgb(textColor),

    // Missing-image placeholder fill.
    '--image-placeholder-bg': '#e6e9ee',

    // Inventory spec-row icon accents — a fixed decorative multi-hue set so
    // each spec glyph (mileage / fuel / gearbox / etc.) reads distinctly.
    // Intentionally NOT brand-reactive; lives here so component CSS references
    // var(--spec-accent-*) instead of raw hex.
    '--spec-accent-1': '#2563eb',
    '--spec-accent-2': '#f97316',
    '--spec-accent-3': '#16a34a',
    '--spec-accent-4': '#0ea5e9',

    // 7 image slots — themes reference these via var(--brand-image-*).
    '--brand-image-hero': `url("${escapeCssUrl(heroImageSlot)}")`,
    '--brand-image-about': `url("${escapeCssUrl(aboutImage)}")`,
    '--brand-image-services': `url("${escapeCssUrl(servicesImage)}")`,
    '--brand-image-finance': `url("${escapeCssUrl(financeImage)}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(partExchangeImage)}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(sellYourCarImage)}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(recentlySoldImage)}")`,

    // Compat alias.
    '--axis-hero-image': `url("${escapeCssUrl(heroImageSlot)}")`,

    // Font overrides.
    '--font-ui-family-override': fontUi,
    '--font-brand-family-override': fontBrand,
  };

  // Pull whichever Google Fonts the theme + brand record asks for. Without
  // this @import, --font-ui-family-override resolves to "Manrope, ..." but the
  // browser has no @font-face for it, so the page silently falls back to a
  // system serif. See memory feedback_brandstyles_must_load_google_fonts.
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
