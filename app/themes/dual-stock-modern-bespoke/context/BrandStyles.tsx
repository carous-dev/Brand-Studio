'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildGoogleFontsImport } from '@/app/lib/googleFonts';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl } from '@/app/themes/lib/theme-tokens';
import { optimizeImageUrl } from '@/app/lib/imageOptimize';

interface BrandStylesProps {
  brand: BrandConfig;
}

const THEME_ID = 'dual-stock-modern-bespoke';

const themeDefault = (slotFile: string) =>
  `/themes/${THEME_ID}/images/${slotFile}.jpg`;

const pickString = (...candidates: Array<unknown>): string | null => {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
};

/**
 * Injects brand-specific CSS variables for dual-stock-modern-bespoke.
 *
 * Emits the canonical token block via the shared emitter (buildThemeTokens +
 * renderThemeStyle). The theme's bespoke electric-sky-blue-on-deep-navy palette
 * is passed as `defaults` — including its DISTINCT dark-header literals so the
 * emitter's --color-header-bg/-text/-muted resolve to the theme's dark chrome
 * rather than the light-theme fallback. Dark-surface extras (--color-surface-dark
 * etc.), the third-party WhatsApp colors, and the legacy --dual-hero-image alias
 * live in `extras` since the emitter does not produce them.
 *
 * Image-slot policy (per SKILL.md Pitfall row 38c):
 *  - Hero: brand.heroImage FIRST (operator-uploaded — authoritative) →
 *    brand.images.hero (may be stale) → theme default.
 *  - Other slots: brand.images.<slot> → theme default. No cross-fall to hero.
 *
 * Each component layers the theme default UNDER the CSS var so a 404'ing
 * brand URL still resolves visually (see base.css multi-layer background
 * patterns).
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'Open Sans', system-ui, sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Roboto Condensed', 'Arial Narrow', 'Open Sans', sans-serif";

  const brandImages: Record<string, unknown> = (brand as any)?.images || {};

  // HERO: brand.heroImage (authoritative top-level) → brand.images.hero (may be stale) → theme default.
  const heroImageSlot =
    pickString((brand as any).heroImage, brandImages['hero']) || themeDefault('hero');

  // Other slots: brand.images.<slot> → theme default. No cross-fall to hero.
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile);

  const aboutImage = resolveSlot('about', 'about');
  const servicesImage = resolveSlot('services', 'services');
  const financeImage = resolveSlot('finance', 'finance');
  const partExchangeImage = resolveSlot('partExchange', 'partExchange');
  const sellYourCarImage = resolveSlot('sellYourCar', 'sellYourCar');
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold');

  // Canonical token block via the shared emitter. Dual Stock Modern's bespoke
  // triad — electric sky blue on deep navy (scottishvancenter-inspired) — is
  // passed as `defaults`; brand records override any of the 8 via theme.colors.*.
  // The header-* / hero-overlay-* tokens ARE distinct dark literals (dark header
  // chrome + a heavy navy hero scrim), so they're passed as defaults rather than
  // left to the emitter's light-theme derivations.
  const vars = buildThemeTokens(theme.colors as any, {
    defaults: {
      primaryColor: '#28a2e6',
      secondaryColor: '#10254a',
      accentColor: '#2fb4ff',
      backgroundColor: '#f5f8ff',
      surfaceColor: '#ffffff',
      textColor: '#0b1c3a',
      mutedColor: '#52688c',
      borderColor: '#d6def0',
      headerBg: '#030a1a',
      headerText: '#ffffff',
      headerMuted: 'rgba(216,226,246,0.78)',
      heroOverlayStart: 'rgba(3, 10, 26, 0.92)',
      heroOverlayEnd: 'rgba(11, 28, 58, 0.55)',
      heroTextMuted: 'rgba(255, 255, 255, 0.92)',
      heroReviewMuted: 'rgba(255, 255, 255, 0.85)',
      reviewStar: '#facc15',
    },
  });

  const extras: Record<string, string> = {
    // Dark-surface tier — the emitter emits --surface-*-dark / --border-on-dark
    // under DIFFERENT names, so this theme's own dark navy surfaces live here.
    // Kept brand-overridable via theme.colors.* exactly as before.
    '--color-surface-dark': (theme.colors as any).surfaceDark || '#0b1c3a',
    '--color-surface-card-dark': (theme.colors as any).surfaceCardDark || '#10254a',
    '--color-border-dark': (theme.colors as any).borderDark || 'rgba(149,177,220,0.22)',
    // Foreground ink used on dark navy bands and filled brand surfaces.
    '--color-on-dark': (theme.colors as any).onDark || '#ffffff',
    // Third-party brand colors (WhatsApp FAB) — fixed by the third party, not the dealer palette.
    '--color-whatsapp': '#25d366',
    '--color-whatsapp-hover': '#1ebe5b',

    // Per-page image slots — every component references these via var(--brand-image-*).
    // Each slot independently falls back to its own theme-curated default (no cross-fall).
    '--brand-image-hero': `url("${escapeCssUrl(optimizeImageUrl(heroImageSlot, { width: 1920 }))}")`,
    '--brand-image-about': `url("${escapeCssUrl(optimizeImageUrl(aboutImage, { width: 1280 }))}")`,
    '--brand-image-services': `url("${escapeCssUrl(optimizeImageUrl(servicesImage, { width: 1280 }))}")`,
    '--brand-image-finance': `url("${escapeCssUrl(optimizeImageUrl(financeImage, { width: 1280 }))}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(optimizeImageUrl(partExchangeImage, { width: 1280 }))}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(optimizeImageUrl(sellYourCarImage, { width: 1280 }))}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(optimizeImageUrl(recentlySoldImage, { width: 1280 }))}")`,

    // Legacy var kept for any leftover references during transition.
    '--dual-hero-image': `url("${escapeCssUrl(optimizeImageUrl(heroImageSlot, { width: 1920 }))}")`,

    // Font family overrides.
    '--font-ui-family-override': fontUi,
    '--font-brand-family-override': fontBrand,
  };

  // Dynamic Google Fonts import — without this the --font-brand-family-override
  // var resolves to a font the browser never loaded and headings silently fall
  // back to a system serif. See memory feedback_brandstyles_must_load_google_fonts.
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
