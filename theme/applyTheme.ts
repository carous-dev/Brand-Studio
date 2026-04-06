/**
 * Apply Brand Theme
 * 
 * Converts Dashboard 5-Color Palette into CSS variables.
 * This runs in the layout to inject theme variables into the DOM.
 * 
 * Core Colors: primary, secondary, accent, background, text
 */

import type { BrandConfig } from '@/brands/types';

/**
 * Generate a style tag with CSS variables from brand config
 * @param {BrandConfig} brand - The brand configuration
 * @returns {string} CSS rule string ready for injection
 */
export function generateThemeCSS(brand: BrandConfig): string {
  const colors = brand.theme.colors;

  // Convert hex to RGB for all core colors
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  // Get the 5 core colors from dashboard (NEW SYSTEM)
  const primaryColor = colors.primaryColor || colors.accentPrimary || '#666666';
  const secondaryColor = colors.secondaryColor || colors.accentHover || '#555555';
  const accentColor = colors.accentColor || colors.accentActive || '#444444';
  const backgroundColor = colors.backgroundColor || colors.bgPrimary || '#ffffff';
  const textColor = colors.textColor || colors.textPrimary || '#1f2933';

  // Convert to RGB
  const primaryRgb = hexToRgb(primaryColor);
  const secondaryRgb = hexToRgb(secondaryColor);
  const accentRgb = hexToRgb(accentColor);
  const backgroundRgb = hexToRgb(backgroundColor);
  const textRgb = hexToRgb(textColor);

  const cssVariables = `
    :root {
      /* ===== ${brand.name} – 5 Core Brand Colors ===== */
      
      /* Core Brand Colors (from Dashboard) */
      --brand-primary: ${primaryColor};
      --brand-primary-rgb: ${primaryRgb};
      --brand-secondary: ${secondaryColor};
      --brand-secondary-rgb: ${secondaryRgb};
      --brand-accent: ${accentColor};
      --brand-accent-rgb: ${accentRgb};
      --brand-background: ${backgroundColor};
      --brand-background-rgb: ${backgroundRgb};
      --brand-text: ${textColor};
      --brand-text-rgb: ${textRgb};

      /* Legacy Compatibility (map to core colors) */
      --accent-primary: var(--brand-primary);
      --accent-primary-rgb: var(--brand-primary-rgb);
      --accent-hover: var(--brand-secondary);
      --accent-active: var(--brand-accent);
      --bg-primary: var(--brand-background);
      --text-primary: var(--brand-text);
    }
  `.trim();

  return cssVariables;
}

/**
 * Get theme-color meta tag value
 * @param {BrandConfig} brand - The brand configuration
 * @returns {string} The primary brand color for theme-color meta
 */
export function getThemeColorMeta(brand: BrandConfig): string {
  const colors = brand.theme.colors;
  return colors.primaryColor || colors.accentPrimary || '#666666';
}

export default generateThemeCSS;
