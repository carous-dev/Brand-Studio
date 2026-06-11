'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';
import { buildGoogleFontsImport } from '@/app/lib/googleFonts';

interface BrandStylesProps {
  brand: BrandConfig;
}

/**
 * Injects FBM Motors brand CSS variables. The theme's base.css consumes these
 * via var(--color-...) so swapping a brand's primary/background/text colours
 * fully recolours every surface.
 *
 * The fbm-motors design system is "light-dominant with dark anchors": light
 * cards on a paper background, and ember accents — so the ember (orange)
 * accent is exposed both as the global --color-primary AND as
 * --fbm-ember-* tiers so the source UI's ember-50 / ember-400 / ember-500 /
 * ember-600 utility classes resolve cleanly to brand-driven values.
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'Inter', 'Segoe UI', sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Space Grotesk', 'Inter', 'Segoe UI', sans-serif";

  const heroImage = brand.heroImage || brand.logo || '/images/hero-placeholder.jpg';

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

  const primary = theme.colors.primaryColor || '#FF6B1A';
  const secondary = theme.colors.secondaryColor || '#F25800';
  const accent = theme.colors.accentColor || '#FF8A3D';
  const background = theme.colors.backgroundColor || '#F7F8FA';
  const text = theme.colors.textColor || '#0E1420';

  const cssVariables: Record<string, string> = {
    // Dashboard 8 tokens — natural roles, never inverted
    '--color-primary': primary,
    '--color-secondary': secondary,
    '--color-accent': accent,
    '--color-bg': background,
    '--color-surface': (theme.colors as any).surfaceColor || '#ffffff',
    '--color-text': text,
    '--color-muted': (theme.colors as any).mutedColor || '#5B6B7E',
    '--color-border': (theme.colors as any).borderColor || 'rgba(14, 20, 32, 0.08)',
    '--color-header-bg': (theme.colors as any).headerBg || '#ffffff',
    '--color-header-text': (theme.colors as any).headerText || text,
    '--color-header-muted': (theme.colors as any).headerMuted || '#5B6B7E',
    '--color-review-star': (theme.colors as any).reviewStar || '#facc15',

    // Bridge variables
    '--brand-primary': primary,
    '--brand-secondary': secondary,
    '--brand-accent': accent,
    '--brand-background': background,
    '--brand-text': text,
    '--brand-primary-rgb': hexToRgb(primary),
    '--brand-secondary-rgb': hexToRgb(secondary),
    '--brand-accent-rgb': hexToRgb(accent),
    '--brand-background-rgb': hexToRgb(background),
    '--brand-text-rgb': hexToRgb(text),

    // FBM-specific ember accent tiers (light → bright → dark). These map the
    // source app's ember-50/100/400/500/600 utility classes to brand tokens
    // so the orange→deep-orange ramp follows whatever primary the dashboard
    // sets.
    '--fbm-ember-50': `color-mix(in srgb, ${primary} 12%, #ffffff)`,
    '--fbm-ember-100': `color-mix(in srgb, ${primary} 22%, #ffffff)`,
    '--fbm-ember-400': accent,
    '--fbm-ember-500': primary,
    '--fbm-ember-600': secondary,

    // FBM dark anchor (carbon) — dimensional dark surface for hero/footer/testimonials.
    // Derived from --color-text so brand records with custom text colour
    // automatically retint the dark tier (per "tokens drive surfaces in
    // NATURAL roles" rule).
    '--fbm-carbon-950': `color-mix(in srgb, ${text} 95%, #000)`,
    '--fbm-carbon-900': `color-mix(in srgb, ${text} 86%, #000)`,
    '--fbm-carbon-800': `color-mix(in srgb, ${text} 70%, #000)`,
    '--fbm-carbon-700': `color-mix(in srgb, ${text} 56%, #000)`,

    // Paper + ink scale (light surfaces) derived from the brand bg/text.
    '--fbm-paper': background,
    '--fbm-ink-900': text,
    '--fbm-ink-700': `color-mix(in srgb, ${text} 70%, transparent)`,
    '--fbm-ink-500': `color-mix(in srgb, ${text} 45%, transparent)`,
    '--fbm-mist': '#9AA7B8',

    // Shadows + glow
    '--fbm-shadow-card': '0 10px 35px -12px rgba(14, 20, 32, 0.12)',
    '--shadow-soft': '0 10px 35px -12px rgba(14, 20, 32, 0.12)',
    '--fbm-shadow-glow': `0 0 40px -8px color-mix(in srgb, ${primary} 45%, transparent)`,

    // Hero/page imagery
    '--fbm-hero-image': `url("${escapeCssUrl(heroImage)}")`,
    '--brand-image-hero': `url("${escapeCssUrl(heroImageSlot)}")`,
    '--brand-image-about': `url("${escapeCssUrl(aboutImage)}")`,
    '--brand-image-services': `url("${escapeCssUrl(servicesImage)}")`,
    '--brand-image-finance': `url("${escapeCssUrl(financeImage)}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(partExchangeImage)}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(sellYourCarImage)}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(recentlySoldImage)}")`,

    // Image-URL strings (without url() wrapper) for <img src> usage
    '--brand-image-hero-url': heroImageSlot,
    '--brand-image-about-url': aboutImage,
    '--brand-image-services-url': servicesImage,
    '--brand-image-finance-url': financeImage,
    '--brand-image-part-exchange-url': partExchangeImage,
    '--brand-image-sell-your-car-url': sellYourCarImage,
    '--brand-image-recently-sold-url': recentlySoldImage,

    // Font family overrides
    '--font-ui-family-override': fontUi,
    '--font-brand-family-override': fontBrand,
    '--font-ui-family': 'var(--font-ui-family-override)',
    '--font-brand-family': 'var(--font-brand-family-override)',
    '--font-ui': 'var(--font-ui-family-override)',
    '--font-brand': 'var(--font-brand-family-override)',

    // Aliases used by ported inventory-modern / vehicle CSS — point legacy
    // accent-* tokens at the brand palette so colors track the dashboard
    // pickers without each component needing per-token plumbing.
    '--accent-primary': primary,
    '--accent-primary-rgb': hexToRgb(primary),
    '--accent-secondary': secondary,
    '--accent-secondary-rgb': hexToRgb(secondary),
    '--accent-hover': secondary,
    '--bg-secondary': background,
    '--shadow-color': hexToRgb(text),
  };

  // Dynamic Google Fonts import — without this the --font-*-family-override
  // vars resolve to a font the browser never loaded and headings silently
  // fall back to system serif/sans. See memory
  // `feedback_brandstyles_must_load_google_fonts`.
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
