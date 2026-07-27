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
 * Injects brand-specific CSS variables for the warwick-hall-cars-bespoke theme.
 * The theme's base.css consumes these via var(--color-...) so swapping a
 * brand's primary/secondary/accent colours fully recolours the site.
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'Karla', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Cormorant Garamond', 'Times New Roman', Georgia, serif";

  // ---- Brand image plumbing ----
  // Hero sources from the dashboard RECIPE SECTION (`brand.images.hero` — the
  // "Per-page Images" picker), then top-level `brand.heroImage`, then the
  // theme-curated default on disk. Per-page slots terminate at their OWN
  // theme default — never cross-fall to hero (so dealers who only set hero
  // still get distinctive per-page imagery rather than seven copies of it).
  const THEME_ID = 'warwick-hall-cars-bespoke';
  const themeDefault = (slot: string): string => `/themes/${THEME_ID}/images/${slot}.jpg`;
  const brandImages: Record<string, unknown> = (brand as any)?.images || {};
  const pickString = (...candidates: Array<unknown>): string => {
    for (const candidate of candidates) {
      if (typeof candidate !== 'string') continue;
      const value = candidate.trim();
      if (value) return value;
    }
    return '';
  };
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile);

  // HERO: brand.heroImage (authoritative) → brand.images.hero (recipe slot)
  // → NONE. Theme-curated default photo dropped per Difatha 2026-06-09 —
  // dealer-record previews without an uploaded hero now fall back to a
  // brand-coloured panel via the Hero.module.css `background-color`
  // rather than a generic stock photo.
  const heroImageSource = pickString((brand as any).heroImage, brandImages['hero']);
  const heroImageCss = heroImageSource ? `url("${escapeCssUrl(optimizeImageUrl(heroImageSource, { width: 1920 }))}")` : 'none';
  // Per-page slots still need a non-empty fallback in their own var (the
  // about/services/etc. pages are designed around having a backdrop photo).
  const heroImageSlot = heroImageSource || themeDefault('hero');
  const heroImage = heroImageSlot; // legacy alias for --warwick-hero-image

  const aboutImage = resolveSlot('about', 'about');
  const servicesImage = resolveSlot('services', 'services');
  const financeImage = resolveSlot('finance', 'finance');
  const partExchangeImage = resolveSlot('partExchange', 'partExchange');
  const sellYourCarImage = resolveSlot('sellYourCar', 'sellYourCar');
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold');

  // Canonical token block via the shared emitter. Warwick Hall Cars' bespoke
  // palette is passed as `defaults`; brand records override any of the 8 via
  // theme.colors.*. header-*/hero-* tokens that Warwick derived from text/muted
  // are omitted so the emitter derives them (brand-aware) identically.
  const vars = buildThemeTokens(theme.colors as any, {
    defaults: {
      primaryColor: '#31237c',
      secondaryColor: '#31237c',
      accentColor: '#3da9fc',
      backgroundColor: '#ffffff',
      surfaceColor: '#f6f7fb',
      textColor: '#0f1623',
      mutedColor: '#5b6573',
      borderColor: '#e3e6ee',
      heroOverlayStart: 'rgba(15, 10, 37, 0.30)',
      heroOverlayEnd: 'rgba(15, 10, 37, 0.65)',
      heroTextMuted: 'rgba(255, 255, 255, 0.92)',
      heroReviewMuted: 'rgba(255, 255, 255, 0.85)',
      reviewStar: '#facc15',
    },
  });

  const extras: Record<string, string> = {
    // Hero background image (resolves to brand.heroImage if set in dashboard)
    '--warwick-hero-image': `url("${escapeCssUrl(optimizeImageUrl(heroImage, { width: 1920 }))}")`,
    // Per-page image slots — theme references these via var(--brand-image-*)
    // so dashboard edits to brand.images.* propagate without code changes.
    // Hero var resolves to `none` when no brand image is set so Hero.module.css
    // can fall back to background-color instead of a generic stock photo.
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
