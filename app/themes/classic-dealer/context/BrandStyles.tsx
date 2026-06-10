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
  const heroImage =
    brand.heroImage ||
    brand.images?.hero ||
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=2400&q=80';
  
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
