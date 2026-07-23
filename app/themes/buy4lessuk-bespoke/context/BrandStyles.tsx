'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl } from '@/app/themes/lib/theme-tokens';

interface BrandStylesProps {
  brand: BrandConfig;
}

/**
 * Injects brand-specific CSS variables for the buy4lessuk-bespoke theme.
 * The theme's base.css consumes these via var(--color-...) so swapping a
 * brand's primary/secondary/accent colours fully recolours the site.
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;
  const c = theme.colors as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'Inter', 'Segoe UI', sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Space Grotesk', 'Segoe UI', sans-serif";
  const fontMono =
    resolveFontToken(fonts.mono, themeAny.fontMono, themeAny.monoFont) ||
    "'Space Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace";

  // Curated automotive fallback imagery from Unsplash CDN — used when neither
  // brand.images.<slot> nor brand.heroImage is set. These are real photos
  // (twin-car splash, silver luxury, showroom interior, handshake, etc.) so
  // the page never falls back to a grey placeholder or solid colour.
  // Unsplash photo IDs are stable; URLs include format/quality hints.
  const FALLBACKS = {
    hero: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&auto=format&fit=crop&q=80',
    about: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1200&auto=format&fit=crop&q=80',
    services: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&auto=format&fit=crop&q=80',
    finance: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&auto=format&fit=crop&q=80',
    partExchange: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=1200&auto=format&fit=crop&q=80',
    sellYourCar: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&auto=format&fit=crop&q=80',
    recentlySold: 'https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=1600&auto=format&fit=crop&q=80',
  } as const

  const heroImage = brand.heroImage || FALLBACKS.hero;

  // Per-page imagery (7 slots) — sourced by tools/fetch-theme-images.mjs and
  // saved per-brand under /themes/<id>/images/<slot>.jpg. brand.images is the
  // dashboard-editable structured field; falls back to the hardcoded Unsplash
  // fallback (NOT the hero) so each slot stays visually distinct even when
  // the brand has uploaded nothing.
  const brandImages: Record<string, unknown> = (brand as any)?.images || {};
  const imageOr = (slotKey: string, fallback: string): string => {
    const v = brandImages[slotKey];
    return typeof v === 'string' && v.trim() ? v : fallback;
  };
  const heroImageSlot = imageOr('hero', heroImage);
  const aboutImage = imageOr('about', FALLBACKS.about);
  const servicesImage = imageOr('services', FALLBACKS.services);
  const financeImage = imageOr('finance', FALLBACKS.finance);
  const partExchangeImage = imageOr('partExchange', FALLBACKS.partExchange);
  const sellYourCarImage = imageOr('sellYourCar', FALLBACKS.sellYourCar);
  const recentlySoldImage = imageOr('recentlySold', FALLBACKS.recentlySold);

  // Canonical token block via the shared emitter. Buy4Less' bespoke palette is
  // passed as `defaults`; brand records override any of the 8 core colours via
  // theme.colors.*. header-text is omitted (the emitter derives it from
  // --color-text identically); header-bg/-muted are passed because their
  // defaults differ from background/muted.
  // VECTOR — futuristic dark-console default palette. Near-black cool
  // surfaces, electric-azure primary, aqua accent, violet supporting tint.
  // These are DEFAULTS only: a brand record's theme.colors.* still overrides
  // every core-8 token, so the site remains fully dashboard-recolourable.
  const vars = buildThemeTokens(theme.colors as any, {
    defaults: {
      primaryColor: '#3d7dff',
      secondaryColor: '#7c5cff',
      accentColor: '#25e6c5',
      backgroundColor: '#060812',
      surfaceColor: '#0e1424',
      textColor: '#e8edfb',
      mutedColor: '#8b96b5',
      borderColor: '#1f294a',
      primaryStrong: '#2b5fd9',
      headerBg: '#080b18',
      headerMuted: '#8b96b5',
      heroOverlayStart: 'rgba(4, 6, 14, 0.20)',
      heroOverlayEnd: 'rgba(4, 6, 14, 0.86)',
      heroTextMuted: 'rgba(255, 255, 255, 0.92)',
      heroReviewMuted: 'rgba(255, 255, 255, 0.85)',
      reviewStar: '#25e6c5',
    },
  });

  const extras: Record<string, string> = {
    // Extended surface / border / topbar / on-dark tokens — NOT part of the
    // core-8 emitter contract; each stays dashboard-overridable. Tuned dark
    // for the VECTOR console aesthetic.
    '--color-surface-dark': c.surfaceDark || '#05070f',
    '--color-text-invert': c.textInvert || '#f2f6ff',
    '--color-border-dark': c.borderDark || 'rgba(140, 170, 255, 0.14)',
    '--color-topbar-bg': c.topbarBg || '#05070f',
    '--color-topbar-text': c.topbarText || 'rgba(226, 233, 255, 0.72)',
    '--color-on-dark-strong': c.onDarkStrong || '#ffffff',
    '--color-on-dark-muted': c.onDarkMuted || 'rgba(226, 233, 255, 0.74)',

    // -----------------------------------------------------------------------
    // Fixed decorative hue tokens — colours that are intentionally NOT part of
    // the 8-token brand palette (deep display bands, hero fallback gradient,
    // UK number-plate yellow, body-type category coding, the vehicle-detail
    // teal/slate carried over from the source layout). Defining them here (the
    // checker-exempt token source) keeps component CSS literal-free while
    // preserving exact hues; each stays dashboard-overridable. Bands are now
    // deep-navy/void to sit under the neon chrome.
    '--b4l-band-charcoal': c.bandCharcoal || '#0b1120',
    '--b4l-band-charcoal-2': c.bandCharcoal2 || '#0f1830',
    '--b4l-band-charcoal-3': c.bandCharcoal3 || '#132146',
    '--b4l-band-night': c.bandNight || '#070b16',
    '--b4l-band-night-deep': c.bandNightDeep || '#03060d',
    '--b4l-hero-fallback': c.heroFallback || '#070b16',
    '--b4l-hero-fallback-1': c.heroFallback1 || '#0b1330',
    '--b4l-hero-fallback-2': c.heroFallback2 || '#122a5c',
    '--b4l-plate-yellow': c.plateYellow || '#ffd400',
    '--b4l-btn-yellow': c.btnYellow || '#fbd826',
    '--b4l-plate-ink': c.plateInk || '#4b3d00',
    '--b4l-cat-blue': c.catBlue || '#2563eb',
    '--b4l-cat-orange': c.catOrange || '#f97316',
    '--b4l-cat-green': c.catGreen || '#16a34a',
    '--b4l-cat-sky': c.catSky || '#0ea5e9',
    '--b4l-slug-accent': c.slugAccent || '#25e6c5',
    '--b4l-slug-dark': c.slugDark || '#070d16',

    // Hero background image (resolves to brand.heroImage if set in dashboard)
    '--buy4lessuk-hero-image': `url("${escapeCssUrl(heroImage)}")`,

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
    '--font-mono-family-override': fontMono,
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
