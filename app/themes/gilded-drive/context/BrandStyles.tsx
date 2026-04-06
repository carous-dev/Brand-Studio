'use client';

import React from 'react';
import type { BrandConfig } from '@/brands/types';

interface BrandStylesProps {
  brand: BrandConfig;
}

/**
 * BrandStyles component injects brand-specific CSS variables
 * This ensures brand colors and fonts are applied dynamically without fallbacks
 */
export function BrandStyles({ brand }: BrandStylesProps) {
  const { theme } = brand;
  const fonts = theme.fonts || {};
  const themeAny = theme as any;
  const fontUi = resolveFontToken(
    fonts.ui,
    (fonts as any).body,
    themeAny.fontUi,
    themeAny.uiFont,
    themeAny.fontBody
  ) || "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";
  const fontBrand = resolveFontToken(
    fonts.brand,
    (fonts as any).heading,
    (fonts as any).display,
    themeAny.fontBrand,
    themeAny.brandFont,
    themeAny.fontHeading
  ) || 'Lora, Georgia, serif';
  const fontMono = resolveFontToken(
    fonts.mono,
    themeAny.fontMono,
    themeAny.monoFont
  ) || "'JetBrains Mono', Consolas, monospace";
  const heroImage = brand.heroImage || brand.logo || '/favicon.svg';
  
  // Convert brand colors to CSS custom properties
  const cssVariables = {
    // Core Brand Colors (from 5-color system)
    '--brand-primary': theme.colors.primaryColor || '#666666',
    '--brand-secondary': theme.colors.secondaryColor || '#555555',
    '--brand-accent': theme.colors.accentColor || '#444444',
    '--brand-background': theme.colors.backgroundColor || '#ffffff',
    '--brand-text': theme.colors.textColor || '#1f2933',
    
    // RGB versions for opacity calculations
    '--brand-primary-rgb': hexToRgb(theme.colors.primaryColor || '#666666'),
    '--brand-secondary-rgb': hexToRgb(theme.colors.secondaryColor || '#555555'),
    '--brand-accent-rgb': hexToRgb(theme.colors.accentColor || '#444444'),
    '--brand-background-rgb': hexToRgb(theme.colors.backgroundColor || '#ffffff'),
    '--brand-text-rgb': hexToRgb(theme.colors.textColor || '#1f2933'),
    
    // Legacy Colors (for backward compatibility)
    '--bg-primary': theme.colors.bgPrimary || theme.colors.backgroundColor || '#ffffff',
    '--bg-secondary': theme.colors.bgSecondary || theme.colors.backgroundColor || '#ffffff',
    '--bg-tertiary': theme.colors.bgTertiary || theme.colors.backgroundColor || '#ffffff',
    '--bg-elevated': theme.colors.bgElevated || theme.colors.backgroundColor || '#ffffff',
    '--bg-glass': theme.colors.bgGlass || `rgba(${hexToRgb(theme.colors.backgroundColor || '#ffffff')}, 0.92)`,
    '--bg-accent': (theme.colors as any).bgAccent || theme.colors.primaryColor || '#666666',
    
    '--text-primary': theme.colors.textPrimary || theme.colors.textColor || '#1f2933',
    '--text-secondary': theme.colors.textSecondary || theme.colors.textColor || '#1f2933',
    '--text-muted': theme.colors.textMuted || theme.colors.textColor || '#1f2933',
    '--text-inverse': theme.colors.textInverse || theme.colors.backgroundColor || '#ffffff',
    '--text-accent': (theme.colors as any).textAccent || theme.colors.accentColor || '#444444',
    
    // Accent System
    '--accent-primary': theme.colors.primaryColor || '#666666',
    '--accent-primary-rgb': hexToRgb(theme.colors.primaryColor || '#666666'),
    '--accent-secondary': theme.colors.secondaryColor || '#555555',
    '--accent-secondary-rgb': hexToRgb(theme.colors.secondaryColor || '#555555'),
    '--accent-accent': theme.colors.accentColor || '#444444',
    '--accent-accent-rgb': hexToRgb(theme.colors.accentColor || '#444444'),

    // Gilded drive theme aliases (mapped to brand tokens)
    '--bg': theme.colors.backgroundColor || '#ffffff',
    '--panel': theme.colors.backgroundColor || '#ffffff',
    '--card': theme.colors.backgroundColor || '#ffffff',
    '--muted': `rgba(${hexToRgb(theme.colors.textColor || '#1f2933')}, 0.7)`,
    '--accent': theme.colors.primaryColor || '#666666',
    '--accent-rgb': hexToRgb(theme.colors.primaryColor || '#666666'),
    '--accent-2': theme.colors.secondaryColor || '#555555',
    '--accent-2-rgb': hexToRgb(theme.colors.secondaryColor || '#555555'),
    '--surface-light': theme.colors.backgroundColor || '#ffffff',
    '--radius': '14px',
    '--nav-height': '96px',
    '--dark-center': theme.colors.textColor || '#1f2933',
    '--field-bg': theme.colors.backgroundColor || '#ffffff',
    '--field-height': '55px',
    '--skeleton-bg': `rgba(${hexToRgb(theme.colors.textColor || '#1f2933')}, 0.08)`,
    '--skeleton-highlight': `rgba(${hexToRgb(theme.colors.primaryColor || '#666666')}, 0.06)`,
    '--skeleton-shimmer': `linear-gradient(90deg, rgba(${hexToRgb(theme.colors.textColor || '#1f2933')}, 0.08) 0%, rgba(${hexToRgb(theme.colors.primaryColor || '#666666')}, 0.06) 50%, rgba(${hexToRgb(theme.colors.textColor || '#1f2933')}, 0.08) 100%)`,
    '--snack-right': '20px',
    '--snack-bottom': '20px',
    '--snack-min-width': '240px',
    '--snack-max-width': '360px',
    '--snack-radius': '10px',
    '--snack-padding': '12px 16px',
    '--snack-shadow': '0 10px 30px rgba(6, 10, 15, 0.25)',
    '--snack-color': theme.colors.backgroundColor || '#ffffff',

    // Font family overrides (globals.css composes final stacks from these)
    '--font-ui-family-override': fontUi,
    '--font-brand-family-override': fontBrand,
    '--font-mono-family-override': fontMono,

    // Font shortcuts / legacy aliases used across stylesheets
    '--font-ui': 'var(--font-ui-family)',
    '--font-brand': 'var(--font-brand-family)',
    '--font-mono': 'var(--font-mono-family)',
    '--font-base': 'var(--font-ui-family)',
    '--font-display': 'var(--font-brand-family)',
    '--font-badge': 'var(--font-ui-family)',
    '--classic-hero-image': `url("${escapeCssUrl(heroImage)}")`,
  };

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          :root {
            ${Object.entries(cssVariables)
              .map(([key, value]) => `${key}: ${value};`)
              .join('\n            ')}
          }
        `,
      }}
    />
  );
}

/**
 * Convert hex color to RGB format
 */
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
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
