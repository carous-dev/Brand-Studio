'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildThemeTokens, renderThemeStyle, escapeCssUrl } from '@/app/themes/lib/theme-tokens';
import { optimizeImageUrl } from '@/app/lib/imageOptimize';

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
    "'Montserrat', 'Segoe UI', sans-serif";
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
  // Hero: brand.heroImage is the dashboard source of truth; images.hero is
  // often stale, so it's only a fallback when heroImage is unset. NO theme
  // default — an image-less hero resolves to `none` so HomeHero.module.css
  // falls back to the brand-colour gradient panel rather than a stock photo
  // (per Difatha; matches warwick-hall-cars-bespoke).
  const heroPick = (...candidates: Array<unknown>): string => {
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
    return '';
  };
  const heroImageSource = heroPick(brand.heroImage, brandImages['hero']);
  const heroImageCss = heroImageSource
    ? `url("${escapeCssUrl(optimizeImageUrl(heroImageSource, { width: 1920 }))}")`
    : 'none';
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
  // PRESTIGE — classic light dealer palette. White page, deep-navy bands
  // (topbar / search band / value props / footer), bright royal-blue primary
  // for CTAs and emphasis. These are DEFAULTS only: a brand record's
  // theme.colors.* still overrides every core-8 token, so the site remains
  // fully dashboard-recolourable.
  const vars = buildThemeTokens(theme.colors as any, {
    defaults: {
      primaryColor: '#1656c8',
      secondaryColor: '#10294f',
      accentColor: '#2f7df6',
      backgroundColor: '#ffffff',
      surfaceColor: '#f4f6fa',
      textColor: '#101c33',
      mutedColor: '#5b6b84',
      borderColor: '#dce3ee',
      primaryStrong: '#1146a3',
      headerBg: '#ffffff',
      headerMuted: '#5b6b84',
      heroOverlayStart: 'rgba(8, 16, 32, 0.86)',
      heroOverlayEnd: 'rgba(8, 16, 32, 0.78)',
      heroTextMuted: 'rgba(255, 255, 255, 0.92)',
      heroReviewMuted: 'rgba(255, 255, 255, 0.85)',
      reviewStar: '#f5b301',
    },
  });

  const extras: Record<string, string> = {
    // Extended surface / border / topbar / on-dark tokens — NOT part of the
    // core-8 emitter contract; each stays dashboard-overridable. The dark
    // values live on the full-width dark bands only (topbar, search band,
    // value-props band, footer) and are DERIVED from the palette
    // (brand-tinted dark = color-mix over --color-primary + --color-text) so
    // they re-tint with any brand instead of forcing a fixed navy.
    '--color-surface-dark': c.surfaceDark || 'color-mix(in srgb, var(--color-primary) 16%, var(--color-text))',
    '--color-text-invert': c.textInvert || 'var(--color-bg)',
    '--color-border-dark': c.borderDark || 'color-mix(in srgb, var(--color-text-invert) 18%, transparent)',
    '--color-topbar-bg': c.topbarBg || 'color-mix(in srgb, var(--color-primary) 16%, var(--color-text))',
    '--color-topbar-text': c.topbarText || 'color-mix(in srgb, var(--color-text-invert) 82%, transparent)',
    '--color-on-dark-strong': c.onDarkStrong || 'var(--color-bg)',
    '--color-on-dark-muted': c.onDarkMuted || 'color-mix(in srgb, var(--color-text-invert) 72%, transparent)',

    // -----------------------------------------------------------------------
    // Decorative hue tokens — the deep display bands, hero-fallback gradient,
    // reg-plate motif, body-type category coding and vehicle-detail accents.
    // Every value is DERIVED from the 8-token brand palette via color-mix, so
    // a brand with a red/green/etc. primary recolours these too — no foreign
    // hues survive an override. Each still stays dashboard-overridable.
    //
    // Bands: brand-tinted dark, ascending primary tint over --color-text.
    '--b4l-band-charcoal': c.bandCharcoal || 'color-mix(in srgb, var(--color-primary) 24%, var(--color-text))',
    '--b4l-band-charcoal-2': c.bandCharcoal2 || 'color-mix(in srgb, var(--color-primary) 30%, var(--color-text))',
    '--b4l-band-charcoal-3': c.bandCharcoal3 || 'color-mix(in srgb, var(--color-primary) 38%, var(--color-text))',
    '--b4l-band-night': c.bandNight || 'color-mix(in srgb, var(--color-primary) 16%, var(--color-text))',
    '--b4l-band-night-deep': c.bandNightDeep || 'color-mix(in srgb, var(--color-primary) 10%, var(--color-text))',
    // Hero fallback: light brand tints over --color-bg for the image-less panel.
    '--b4l-hero-fallback': c.heroFallback || 'color-mix(in srgb, var(--color-primary) 10%, var(--color-bg))',
    '--b4l-hero-fallback-1': c.heroFallback1 || 'color-mix(in srgb, var(--color-primary) 20%, var(--color-bg))',
    '--b4l-hero-fallback-2': c.heroFallback2 || 'color-mix(in srgb, var(--color-primary) 36%, var(--color-bg))',
    // Reg-plate motif: accent-driven (the brand's bright interaction hue).
    '--b4l-plate-yellow': c.plateYellow || 'var(--color-accent)',
    '--b4l-btn-yellow': c.btnYellow || 'color-mix(in srgb, var(--color-accent) 18%, var(--color-bg))',
    '--b4l-plate-ink': c.plateInk || 'var(--color-text)',
    // Body-type category coding: four distinguishable variants within the
    // primary↔accent range (secondary is never a foreground, per policy).
    '--b4l-cat-blue': c.catBlue || 'var(--color-primary)',
    '--b4l-cat-orange': c.catOrange || 'var(--color-accent)',
    '--b4l-cat-green': c.catGreen || 'color-mix(in srgb, var(--color-primary) 55%, var(--color-accent))',
    '--b4l-cat-sky': c.catSky || 'color-mix(in srgb, var(--color-accent) 65%, var(--color-primary))',
    // Vehicle-detail (slug) accents.
    '--b4l-slug-accent': c.slugAccent || 'var(--color-primary)',
    '--b4l-slug-dark': c.slugDark || 'color-mix(in srgb, var(--color-primary) 12%, var(--color-text))',

    // Hero background image (resolves to brand.heroImage if set in dashboard).
    // Routed through Next's optimizer (WebP/AVIF + resize); hero is the LCP
    // element so it gets a wider derivative, section slots ~1280.
    '--buy4lessuk-hero-image': heroImageCss,

    // Per-page image slots — every theme references these via var(--brand-image-*)
    // so dashboard edits to brand.images.* propagate without code changes.
    '--brand-image-hero': heroImageCss,
    '--brand-image-about': `url("${escapeCssUrl(optimizeImageUrl(aboutImage, { width: 1280 }))}")`,
    '--brand-image-services': `url("${escapeCssUrl(optimizeImageUrl(servicesImage, { width: 1280 }))}")`,
    '--brand-image-finance': `url("${escapeCssUrl(optimizeImageUrl(financeImage, { width: 1280 }))}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(optimizeImageUrl(partExchangeImage, { width: 1280 }))}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(optimizeImageUrl(sellYourCarImage, { width: 1280 }))}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(optimizeImageUrl(recentlySoldImage, { width: 1280 }))}")`,

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
