'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildGoogleFontsImport } from '@/app/lib/googleFonts';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl } from '@/app/themes/lib/theme-tokens';
import { optimizeImageUrl } from '@/app/lib/imageOptimize';

interface BrandStylesProps {
  brand: BrandConfig;
}

/**
 * Injects brand-specific CSS variables for the springalls-classic theme.
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

  const heroImage = brand.heroImage || brand.logo || '/images/hero-placeholder.jpg';

  // Per-page imagery (7 slots) — sourced by tools/fetch-theme-images.mjs and
  // saved per-brand under /themes/<id>/images/<slot>.jpg. brand.images is the
  // dashboard-editable structured field; falls back to the hero for any slot
  // the dashboard hasn't filled in.
  const brandImages: Record<string, unknown> = (brand as any)?.images || {};
  const imageOr = (slotKey: string, fallback: string): string => {
    const v = brandImages[slotKey];
    return typeof v === 'string' && v.trim() ? v : fallback;
  };
  const heroImageSlot = imageOr('hero', heroImage);
  const aboutImage = imageOr('about', heroImageSlot);
  const servicesImage = imageOr('services', heroImageSlot);
  const financeImage = imageOr('finance', heroImageSlot);
  const partExchangeImage = imageOr('partExchange', heroImageSlot);
  const sellYourCarImage = imageOr('sellYourCar', heroImageSlot);
  const recentlySoldImage = imageOr('recentlySold', heroImageSlot);

  // Canonical token block via the shared emitter. Springalls' bespoke spring
  // palette is passed as `defaults`; brand records override any of the 8 via
  // theme.colors.*. header-text / hero-review-muted / review-star are OMITTED
  // because the emitter derives them identically (headerText = text, and the
  // hero-review/review-star defaults match). The header-bg / header-muted and
  // the darker spring hero overlays differ from the emitter's derived values,
  // so they stay as defaults to preserve visual parity.
  const vars = buildThemeTokens(theme.colors as any, {
    defaults: {
      primaryColor: '#067a74',
      secondaryColor: '#08a49d',
      accentColor: '#16b3a8',
      backgroundColor: '#f7f7f9',
      surfaceColor: '#ffffff',
      textColor: '#111827',
      mutedColor: '#4b5563',
      borderColor: '#d3d7dc',
      headerBg: '#ffffff',
      headerMuted: '#6b7280',
      heroOverlayStart: 'rgba(11, 18, 17, 0.5)',
      heroOverlayEnd: 'rgba(11, 18, 17, 0.55)',
      heroTextMuted: 'rgba(255, 255, 255, 0.9)',
    },
  });

  const extras: Record<string, string> = {
    // Fixed brand-identity hues that must NOT retint with the palette.
    // WhatsApp's green is a recognised third-party brand mark; the vehicle
    // spec-icon hues are a deliberate multi-colour set that would collapse
    // into one colour if mapped to a single brand token.
    '--color-whatsapp': '#25D366',
    '--color-whatsapp-online': '#22c55e',
    '--color-whatsapp-offline': '#9aa1a8',
    '--spec-hue-blue': '#2563eb',
    '--spec-hue-orange': '#f97316',
    '--spec-hue-green': '#16a34a',
    '--spec-hue-sky': '#0ea5e9',

    // Hero background image (resolves to brand.heroImage if set in dashboard)
    '--springalls-hero-image': `url("${escapeCssUrl(optimizeImageUrl(heroImage, { width: 1920 }))}")`,

    // Per-page image slots — every theme references these via var(--brand-image-*)
    // so dashboard edits to brand.images.* propagate without code changes.
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

  // Dynamic Google Fonts import — without this the --font-brand-family-override
  // var resolves to a font the browser never loaded and headings silently fall
  // back to a system serif. See memory `feedback_brandstyles_must_load_google_fonts`.
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
