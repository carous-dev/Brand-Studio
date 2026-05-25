'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';

interface BrandStylesProps {
  brand: BrandConfig;
}

const THEME_ID = 'auto-wow-uk-bespoke-02';

const pickString = (...candidates: Array<unknown>): string | null => {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
};

/**
 * BrandStyles for auto-wow-uk-bespoke-02 — emits brand triad + 7 image-slot
 * variables. Neutrals are theme-locked in base.css (paired surface/foreground
 * tokens) so brand records cannot break contrast.
 *
 * Image slots use the 3-tier fallback chain per SKILL §"Brand-uploaded images
 * must render". Hero slot reads brand.heroImage FIRST (dashboard's
 * authoritative top-level field) before brand.images.hero (often stale alias).
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;

  const fontUi =
    resolveFontToken(fonts.ui, (fonts as any).body, themeAny.fontUi, themeAny.uiFont, themeAny.fontBody) ||
    "'Inter', 'Helvetica Neue', Arial, sans-serif";
  const fontBrand =
    resolveFontToken(fonts.brand, (fonts as any).heading, themeAny.fontBrand, themeAny.brandFont) ||
    "'Anton', 'Impact', sans-serif";

  // Theme-default image paths shipped at /public/themes/<id>/images/*.jpg.
  const themeDefault = (slotFile: string) =>
    `/themes/${THEME_ID}/images/${slotFile}.jpg`;

  const brandImages: Record<string, unknown> = (brand as any)?.images || {};

  // HERO: brand.heroImage (authoritative) → brand.images.hero (may be stale) → theme default.
  // See SKILL pitfall #38c for the priority rationale.
  const heroImageSlot =
    pickString((brand as any).heroImage, brandImages['hero']) || themeDefault('hero');

  // Other slots: brand.images.<slot> → theme default. NO cross-fall to hero.
  const resolveSlot = (slotKey: string, slotFile: string): string =>
    pickString(brandImages[slotKey]) || themeDefault(slotFile);

  const aboutImage = resolveSlot('about', 'about');
  const servicesImage = resolveSlot('services', 'services');
  const financeImage = resolveSlot('finance', 'finance');
  const partExchangeImage = resolveSlot('partExchange', 'partExchange');
  const sellYourCarImage = resolveSlot('sellYourCar', 'sellYourCar');
  const recentlySoldImage = resolveSlot('recentlySold', 'recentlySold');

  const primary = theme.colors.primaryColor || '#b51c24';
  const primaryStrong = (theme.colors as any).primaryStrong || '#9f1920';
  const onPrimary = (theme.colors as any).onPrimary || '#ffffff';

  // Dashboard-driven neutrals. Themes consume these as the source of truth —
  // dark sections derive from textColor (inverted role), light sections
  // derive from backgroundColor / surfaceColor / borderColor / mutedColor.
  // See feedback_dashboard_tokens_drive_all_surfaces.md for the policy.
  const bgColor = theme.colors.backgroundColor || '#ffffff';
  const surfaceColor = (theme.colors as any).surfaceColor || '#f6f7fb';
  const textColor = theme.colors.textColor || '#0f1623';
  const mutedColor = (theme.colors as any).mutedColor || '#5b6573';
  const borderColor = (theme.colors as any).borderColor || '#e3e6ee';

  const cssVariables: Record<string, string> = {
    // Brand triad — the ONLY colors brand records may override at runtime.
    '--color-primary': primary,
    '--color-primary-strong': primaryStrong,
    '--color-on-primary': onPrimary,
    '--brand-primary': primary,
    '--brand-primary-strong': primaryStrong,
    '--brand-on-primary': onPrimary,
    '--brand-primary-rgb': hexToRgb(primary),
    // RGB triples derived from the SAME dashboard pickers so gradient stops
    // and alpha overlays inherit brand-record changes automatically.
    '--color-bg-rgb': hexToRgb(bgColor),
    '--color-text-rgb': hexToRgb(textColor),
    '--color-surface-rgb': hexToRgb(surfaceColor),
    // Surface aliases — kept for backwards-compat with component CSS that
    // still references the paired-token names. They resolve through the
    // dashboard, not through hardcoded literals.
    '--surface-bg-dark-rgb': hexToRgb(textColor),
    '--surface-bg-light-rgb': hexToRgb(bgColor),
    // Semantic state + utility tokens — theme-locked so they read consistently
    // across brand records (success/warning live in the same hue family).
    '--state-success': '#67ffa3',
    '--state-success-strong': '#3fe88f',
    '--state-warning': '#d18a3d',
    '--state-warning-strong': '#b56c1f',
    '--image-placeholder-bg': '#d8d8dc',

    // Dashboard-set neutrals — flow into every surface in the theme.
    // See feedback_dashboard_tokens_drive_all_surfaces.md.
    '--color-bg': bgColor,
    '--color-surface': surfaceColor,
    '--color-text': textColor,
    '--color-muted': mutedColor,
    '--color-border': borderColor,
    '--color-secondary': (theme.colors as any).secondaryColor || primaryStrong,
    '--color-accent': (theme.colors as any).accentColor || primary,

    // Header chrome — dark sections re-use --color-text as bg, --color-bg as fg.
    '--color-header-bg': textColor,
    '--color-header-text': bgColor,
    '--color-header-muted': `color-mix(in srgb, ${bgColor} 78%, transparent)`,
    '--color-hero-overlay-start': 'rgba(var(--color-text-rgb), 0.62)',
    '--color-hero-overlay-end': 'rgba(var(--color-text-rgb), 0.88)',
    '--color-hero-text-muted': `color-mix(in srgb, ${bgColor} 92%, transparent)`,
    '--color-hero-review-muted': `color-mix(in srgb, ${bgColor} 85%, transparent)`,
    '--color-review-star': '#facc15',

    // 7 image slots — every theme references these via var(--brand-image-*).
    // CSS modules MUST also include a theme-default layer underneath as a
    // multi-layer background-image (see base.css .auto-page-hero--*).
    '--brand-image-hero': `url("${escapeCssUrl(heroImageSlot)}")`,
    '--brand-image-about': `url("${escapeCssUrl(aboutImage)}")`,
    '--brand-image-services': `url("${escapeCssUrl(servicesImage)}")`,
    '--brand-image-finance': `url("${escapeCssUrl(financeImage)}")`,
    '--brand-image-part-exchange': `url("${escapeCssUrl(partExchangeImage)}")`,
    '--brand-image-sell-your-car': `url("${escapeCssUrl(sellYourCarImage)}")`,
    '--brand-image-recently-sold': `url("${escapeCssUrl(recentlySoldImage)}")`,

    // Compatibility aliases consumed by legacy widgets.
    '--auto-hero-image': `url("${escapeCssUrl(heroImageSlot)}")`,

    // Font overrides.
    '--font-ui-family-override': fontUi,
    '--font-brand-family-override': fontBrand,
  };

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          :root {
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
