'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildGoogleFontsImport } from '@/app/lib/googleFonts';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl } from '@/app/themes/lib/theme-tokens';

interface BrandStylesProps {
  brand: BrandConfig;
}

/**
 * Injects brand-specific CSS variables for the auto-wow-uk-bespoke theme via the
 * shared token emitter (buildThemeTokens + renderThemeStyle). Auto Wow's bespoke
 * palette is passed as `defaults`; brand records override any of the 8 core
 * tokens via theme.colors.*. The theme's base.css consumes these via
 * var(--color-...) so swapping a brand's colours fully recolours the site.
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

  // Per-page imagery (7 slots) — fallback chain per the brand-image policy.
  //
  // **Hero slot** uses a special-cased order because `brand.images.hero` can
  // go STALE in MySQL (Difatha 2026-05-11 found a brand record where
  // `images.hero` was the placeholder "/images/hero-bg.png" from brand
  // creation, while `brand.heroImage` had been updated by the dashboard to
  // the operator's latest upload `/images/<slug>-hero.png`). The top-level
  // `brand.heroImage` is the AUTHORITATIVE field — the dashboard always
  // refreshes it on each save. `brand.images.hero` is a derived alias that
  // older brand records or non-standard save paths may leave behind.
  // Order: brand.heroImage → brand.images.hero → theme curated default.
  //
  // **Other slots** use the standard chain: brand.images.<slot> → theme
  // curated default. No cross-fall to hero (so operator-uploads-hero-only
  // previews still render distinctive per-page imagery rather than five
  // copies of the hero).
  //
  // We DO NOT fall back to /images/hero-placeholder.jpg (which 404s).
  // The chain MUST terminate at /themes/<id>/images/<slot>.jpg — the
  // curated Unsplash defaults shipped on disk in Phase 7.5a.
  const THEME_ID = 'auto-wow-uk-bespoke';
  const themeDefault = (slot: string): string => `/themes/${THEME_ID}/images/${slot}.jpg`;
  const brandImages: Record<string, unknown> = (brand as any)?.images || {};

  const pickString = (...candidates: Array<unknown>): string | null => {
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c.trim();
    }
    return null;
  };

  // Hero — prefer top-level brand.heroImage (authoritative) over brand.images.hero (can be stale).
  const heroImageSlot =
    pickString(brand.heroImage, brandImages['hero']) || themeDefault('hero');

  // Other slots — brand.images.<slot> → theme default.
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile);

  const aboutImage = resolveSlot('about', 'about');
  const servicesImage = resolveSlot('services', 'services');
  const financeImage = resolveSlot('finance', 'finance');
  const partExchangeImage = resolveSlot('partExchange', 'partExchange');
  const sellYourCarImage = resolveSlot('sellYourCar', 'sellYourCar');
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold');
  // Legacy reference for any code that reads --auto-hero-image directly.
  const heroImage = heroImageSlot;

  // Canonical token block via the shared emitter. Auto Wow's bespoke palette is
  // passed as `defaults`; brand records override any core token via
  // theme.colors.*. header-text is OMITTED (Auto Wow derived it from text, which
  // is exactly what the emitter does). header-bg (#ffffff, not the #f7f7f9 page
  // bg), header-muted, the dark hero-overlay pair, hero-text-muted (0.9) and the
  // gold review star ARE distinct literals, so they're passed through.
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
      reviewStar: '#f0b400',
    },
  });

  const extras: Record<string, string> = {
    // Fixed conventional hues that must NOT collapse to brand colours.
    // WhatsApp/reserve green is a recognised action colour; kept as named
    // tokens here (the sanctioned home) so components reference var(--t-*)
    // instead of raw literals while the exact hue is preserved.
    '--t-whatsapp': '#25d366',
    '--t-whatsapp-ink': '#1f8b46',

    // Hero background image (resolves to brand.heroImage if set in dashboard)
    '--auto-hero-image': `url("${escapeCssUrl(heroImage)}")`,

    // Per-page image slots — every theme references these via var(--brand-image-*)
    // so dashboard edits to brand.images.* propagate without code changes.
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

  // Dynamic Google Fonts import — lets a brand record's chosen font pack
  // override the theme defaults at runtime instead of being ignored.
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
