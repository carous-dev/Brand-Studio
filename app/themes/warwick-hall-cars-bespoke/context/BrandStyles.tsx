'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildGoogleFontsImport } from '@/app/lib/googleFonts';

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
  const heroImageCss = heroImageSource ? `url("${escapeCssUrl(heroImageSource)}")` : 'none';
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

  const cssVariables: Record<string, string> = {
    // Dashboard's 8 natural-role tokens. Theme defaults below are
    // Warwick Hall Cars' bespoke palette; brand records may override any
    // of the 8 via theme.colors.*
    '--color-primary':   theme.colors.primaryColor   || '#31237c',
    '--color-secondary': theme.colors.secondaryColor || '#31237c',
    '--color-accent':    theme.colors.accentColor    || '#3da9fc',
    '--color-bg':        theme.colors.backgroundColor          || '#ffffff',
    '--color-surface':   (theme.colors as any).surfaceColor    || '#f6f7fb',
    '--color-text':      theme.colors.textColor                || '#0f1623',
    '--color-muted':     (theme.colors as any).mutedColor      || '#5b6573',
    '--color-border':    (theme.colors as any).borderColor     || '#e3e6ee',
    '--color-header-bg':    (theme.colors as any).headerBg    || '#ffffff',
    '--color-header-text':  (theme.colors as any).headerText  || theme.colors.textColor || '#0f1623',
    '--color-header-muted': (theme.colors as any).headerMuted || '#5b6573',
    '--color-hero-overlay-start': (theme.colors as any).heroOverlayStart || 'rgba(15, 10, 37, 0.30)',
    '--color-hero-overlay-end':   (theme.colors as any).heroOverlayEnd   || 'rgba(15, 10, 37, 0.65)',
    '--color-hero-text-muted':    (theme.colors as any).heroTextMuted    || 'rgba(255, 255, 255, 0.92)',
    '--color-hero-review-muted': (theme.colors as any).heroReviewMuted || 'rgba(255, 255, 255, 0.85)',
    '--color-review-star': (theme.colors as any).reviewStar || '#facc15',

    // Bridge variables for shared chrome / carous-platform style references
    '--brand-primary':       theme.colors.primaryColor   || '#31237c',
    '--brand-secondary':     theme.colors.secondaryColor || '#31237c',
    '--brand-accent':        theme.colors.accentColor    || '#3da9fc',
    '--brand-background':    theme.colors.backgroundColor || '#ffffff',
    '--brand-text':          theme.colors.textColor       || '#0f1623',
    '--brand-primary-rgb':   hexToRgb(theme.colors.primaryColor   || '#31237c'),
    '--brand-secondary-rgb': hexToRgb(theme.colors.secondaryColor || '#31237c'),
    '--brand-accent-rgb':    hexToRgb(theme.colors.accentColor    || '#3da9fc'),

    // Hero background image (resolves to brand.heroImage if set in dashboard)
    '--warwick-hero-image': `url("${escapeCssUrl(heroImage)}")`,

    // Per-page image slots — every theme references these via var(--brand-image-*)
    // so dashboard edits to brand.images.* propagate without code changes.
    // Hero var resolves to `none` when no brand image is set so Hero.module.css
    // can fall back to background-color instead of a generic stock photo.
    '--brand-image-hero': heroImageCss,
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

  // Dynamic Google Fonts import — without this the --font-brand-family-override
  // var resolves to a font the browser never loaded and headings silently fall
  // back to a system serif. See memory `feedback_brandstyles_must_load_google_fonts`.
  const fontImport = buildGoogleFontsImport(fontUi, fontBrand);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `${fontImport}:root {
            ${Object.entries(cssVariables)
              .map(([key, value]) => `${key}: ${value};`)
              .join('\n            ')}
            font-family: ${fontUi};
          }
        `,
      }}
    />
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
}

function escapeCssUrl(url: string): string {
  return String(url).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n|\r/g, '');
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
