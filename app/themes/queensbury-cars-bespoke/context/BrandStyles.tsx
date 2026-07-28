'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl } from '@/app/themes/lib/theme-tokens';
import { optimizeImageUrl } from '@/app/lib/imageOptimize';

interface BrandStylesProps {
  brand: BrandConfig;
}

const THEME_ID = 'queensbury-cars-bespoke';
const themeDefault = (slotFile: string) =>
  `/themes/${THEME_ID}/images/${slotFile}.jpg`;

const pickString = (...candidates: Array<unknown>): string | null => {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
};

/**
 * BrandStyles for queensbury-cars-bespoke — emits the canonical token block via
 * the shared emitter (buildThemeTokens + renderThemeStyle), plus the theme's own
 * chrome extras (topbar/reserve/shade), image slots and font overrides.
 *
 * Queensbury runs a DARK header + heavy hero scrim, so header-* and hero-overlay-*
 * are passed as `defaults` (they are distinct dark literals, not derived from
 * bg/text/muted). --color-status-online/-offline match the emitter's values so
 * they are dropped. --color-topbar-bg, --shade-deep and --color-reserve-teal are
 * extended tokens the emitter lacks, so they live in `extras` verbatim.
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;
  const c = theme.colors as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Saira', 'Inter', system-ui, sans-serif";

  // ---- Brand image plumbing (3-tier fallback chain, per SKILL Quality Bar §38b/c) ----
  // Hero: brand.heroImage (authoritative — dashboard refreshes on every save) ->
  //       brand.images.hero (often stale alias) -> theme default. No cross-fall.
  // Other slots: brand.images.<slot> -> their OWN theme default. Never the hero.
  const brandImages: Record<string, unknown> = (brand as any)?.images || {};
  const heroImageSource = pickString((brand as any).heroImage, brandImages['hero']);
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile);

  const aboutImage = resolveSlot('about', 'about');
  const servicesImage = resolveSlot('services', 'services');
  const financeImage = resolveSlot('finance', 'finance');
  const partExchangeImage = resolveSlot('partExchange', 'partExchange');
  const sellYourCarImage = resolveSlot('sellYourCar', 'sellYourCar');
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold');

  // --brand-primary-strong historically tracked the SECONDARY picker, so
  // primaryStrong defaults to the resolved secondary (byte-identical under the
  // default palette, and still repaints when a brand overrides secondaryColor).
  const secondary = c.secondaryColor || '#0d5ecf';

  // Canonical token block via the shared emitter. Queensbury's bespoke palette
  // is passed as `defaults`; brand records override any core token via
  // theme.colors.*. The dark header + hero scrim tokens are distinct literals
  // (not derived from bg/text/muted) so they're passed through too.
  const vars = buildThemeTokens(theme.colors as any, {
    defaults: {
      primaryColor: '#0f6beb',
      secondaryColor: '#0d5ecf',
      accentColor: '#38a3ff',
      backgroundColor: '#ffffff',
      surfaceColor: '#f6f7fb',
      textColor: '#0f1623',
      mutedColor: '#5b6573',
      borderColor: '#e3e6ee',
      primaryStrong: secondary,
      onPrimary: '#ffffff',
      headerBg: '#0a0e14',
      headerText: '#ffffff',
      headerMuted: 'rgba(255,255,255,0.78)',
      heroOverlayStart: 'rgba(8, 11, 28, 0.86)',
      heroOverlayEnd: 'rgba(8, 11, 28, 0.55)',
      heroTextMuted: 'rgba(255, 255, 255, 0.92)',
      heroReviewMuted: 'rgba(255, 255, 255, 0.86)',
      reviewStar: '#facc15',
    },
  });

  const extras: Record<string, string> = {
    // Fixed chrome / decorative hues (theme-locked — emitter lacks these).
    '--color-topbar-bg': c.topbarBg || '#050810',
    '--shade-deep': '#000',
    '--color-reserve-teal': '#067a74',

    // Per-page imagery — emitted unconditionally, ALWAYS resolves to either an
    // operator upload or this theme's curated default. Components consume via
    // var(--brand-image-<slot>) layered above the theme default.
    '--brand-image-hero': heroImageSource
      ? `url("${escapeCssUrl(optimizeImageUrl(heroImageSource, { width: 1920 }))}")`
      : 'none',
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

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: renderThemeStyle({ vars, extras, fontFamily: fontUi }),
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
