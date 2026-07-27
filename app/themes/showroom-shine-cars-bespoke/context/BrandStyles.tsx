'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildGoogleFontsImport } from '@/app/lib/googleFonts';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl } from '@/app/themes/lib/theme-tokens';
import { optimizeImageUrl } from '@/app/lib/imageOptimize';

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

/**
 * BrandStyles for showroom-shine-cars-bespoke — emits the canonical token block
 * via the shared emitter (buildThemeTokens + renderThemeStyle), plus the theme's
 * own image-slot / font-override extras. Showroom's bespoke palette is passed as
 * `defaults`; brand records override any of the 8 core colours via theme.colors.*
 * and every surface repaints. header-* tokens are OMITTED — showroom derived them
 * straight from bg/text/muted, exactly what the emitter does. The dark tier and
 * the --brand-* alias mirror (+ rgb triples) are emitter-supplied.
 */
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

  // Canonical token block via the shared emitter. Showroom Shine's bespoke
  // palette is passed as `defaults`; brand records override any of the 8 via
  // theme.colors.*. The hero overlay is a deep warm-to-night scrim (distinct
  // literals) so it's passed; hero text/review muted + review-star match the
  // emitter defaults but are passed for explicitness.
  const vars = buildThemeTokens(theme.colors as any, {
    defaults: {
      primaryColor: '#ad0b1b',
      secondaryColor: '#0a0e14',
      accentColor: '#ad0b1b',
      backgroundColor: '#ffffff',
      surfaceColor: '#f6f7fb',
      textColor: '#0f1623',
      mutedColor: '#5b6573',
      borderColor: '#e3e6ee',
      primaryStrong: '#980a18',
      onPrimary: '#ffffff',
      heroOverlayStart: 'rgba(20, 4, 8, 0.32)',
      heroOverlayEnd: 'rgba(8, 11, 17, 0.78)',
      heroTextMuted: 'rgba(255, 255, 255, 0.92)',
      heroReviewMuted: 'rgba(255, 255, 255, 0.85)',
      reviewStar: '#facc15',
    },
  });

  const extras: Record<string, string> = {
    // 7 image slots — the theme references these via var(--brand-image-*) so
    // dashboard edits to brand.images.* propagate without code changes. Pair
    // with multi-layer CSS background-image patterns in base.css so a 404 on
    // the brand URL still reveals the theme default underneath.
    '--brand-image-hero': `url("${escapeCssUrl(optimizeImageUrl(heroImageSlot, { width: 1920 }))}")`,
    '--brand-image-about': `url("${escapeCssUrl(optimizeImageUrl(aboutImage, { width: 1280 }))}")`,
    '--brand-image-services': `url("${escapeCssUrl(optimizeImageUrl(servicesImage, { width: 1280 }))}")`,
    '--brand-image-finance': `url("${escapeCssUrl(optimizeImageUrl(financeImage, { width: 1280 }))}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(optimizeImageUrl(partExchangeImage, { width: 1280 }))}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(optimizeImageUrl(sellYourCarImage, { width: 1280 }))}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(optimizeImageUrl(recentlySoldImage, { width: 1280 }))}")`,

    // Font family overrides
    '--font-ui-family-override': fontUi,
    '--font-brand-family-override': fontBrand,
  };

  // Pull whichever Google Fonts the brand record asks for. Without this @import,
  // --font-ui-family-override resolves to a font the browser never loaded and
  // the page silently falls back to system-ui / a system serif for headings.
  // See memory feedback_brandstyles_must_load_google_fonts.
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
