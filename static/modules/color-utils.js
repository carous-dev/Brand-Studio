/**
 * Color Utils Module
 * Handles color conversion and palette generation
 */

export const ColorUtils = {
  /**
   * Convert HEX to HSL
   */
  hexToHsl(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  },

  /**
   * Convert HSL to HEX
   */
  hslToHex(h, s, l) {
    s = s / 100;
    l = l / 100;
    
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    
    return `#${f(0)}${f(8)}${f(4)}`;
  },

  /**
   * Parse HSL string
   */
  parseHslString(hslString) {
    const match = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return null;
    
    return {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3])
    };
  },

  /**
   * Create HSL string
   */
  createHslString(h, s, l) {
    return `hsl(${h}, ${s}%, ${l}%)`;
  },

  /**
   * Update palette color
   */
  updatePaletteColor(colorType, newColor) {
    console.log(`🎨 Updating ${colorType} to ${newColor}`); // Debug log
    
    // Update the color display
    const displayElement = document.getElementById(colorType + 'Display');
    if (displayElement) {
      displayElement.style.backgroundColor = newColor;
    }
    
    // Update the hex value display
    const hexElement = document.getElementById(colorType + 'Hex');
    if (hexElement) {
      hexElement.textContent = newColor;
    }
    
    // Update the color picker value
    const pickerElement = document.getElementById(colorType + 'ColorPicker');
    if (pickerElement) {
      pickerElement.value = newColor;
    }
    
    // Update hidden form inputs
    const hiddenInput = document.getElementById(colorType);
    if (hiddenInput) {
      hiddenInput.value = newColor;
      console.log(`✅ Updated hidden input ${colorType} to ${newColor}`); // Debug log
    }
    
    // Update live preview elements
    this.updateLivePreview();
  },

  /**
   * Update live preview colors
   */
  updateLivePreview() {
    const primaryColor = document.getElementById('primaryHex')?.textContent || '#c41e3a';
    const secondaryColor = document.getElementById('secondaryHex')?.textContent || '#e64153';
    const accentColor = document.getElementById('accentHex')?.textContent || '#c41e3a';
    const backgroundColor = document.getElementById('backgroundHex')?.textContent || '#0f172a';
    const textColor = document.getElementById('textHex')?.textContent || '#f8fafc';
    
    // Update preview buttons
    const primaryBtn = document.getElementById('previewPrimaryBtn');
    if (primaryBtn) {
      primaryBtn.style.backgroundColor = primaryColor;
      primaryBtn.style.color = textColor;
    }
    
    const secondaryBtn = document.getElementById('previewSecondaryBtn');
    if (secondaryBtn) {
      secondaryBtn.style.backgroundColor = secondaryColor;
      secondaryBtn.style.color = textColor;
    }
    
    const badge = document.getElementById('previewBadge');
    if (badge) {
      badge.style.backgroundColor = accentColor;
      badge.style.color = textColor;
    }
    
    const link = document.getElementById('previewLink');
    if (link) {
      link.style.color = accentColor;
    }

    // Update the live preview section background
    const themePreview = document.getElementById('themePreview');
    if (themePreview) {
      themePreview.style.backgroundColor = backgroundColor;
      themePreview.style.color = textColor;
    }

    // Update preview component headers to use text color
    const previewHeaders = themePreview?.querySelectorAll('.preview-header');
    if (previewHeaders) {
      previewHeaders.forEach(header => {
        header.style.color = textColor;
      });
    }

    // Update preview components to have proper borders with text color
    const previewComponents = themePreview?.querySelectorAll('.preview-component');
    if (previewComponents) {
      previewComponents.forEach(component => {
        component.style.borderColor = textColor + '20'; // Add transparency for subtle border
      });
    }
  },

  /**
   * Get contrast color (black or white)
   */
  getContrastColor(hex) {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return '#000000';
    
    return hsl.l > 50 ? '#000000' : '#ffffff';
  },

  /**
   * Calculate complementary color
   */
  getComplementary(hex) {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return hex;
    
    const complementHue = (hsl.h + 180) % 360;
    const complementS = Math.max(20, hsl.s - 20);
    const complementL = Math.min(70, hsl.l + 20);
    
    return this.hslToHex(complementHue, complementS, complementL);
  },

  /**
   * Generate analogous colors
   */
  getAnalogous(hex) {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return [hex];
    
    const colors = [];
    for (let i = -2; i <= 2; i++) {
      const hue = (hsl.h + (i * 30) + 360) % 360;
      const s = Math.max(15, hsl.s - 15);
      const l = Math.min(85, hsl.l + 15);
      colors.push(this.hslToHex(hue, s, l));
    }
    
    return colors;
  },

  /**
   * Generate triadic colors
   */
  getTriadic(hex) {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return [hex];
    
    const colors = [hex];
    for (let i = 1; i <= 2; i++) {
      const hue = (hsl.h + (i * 120)) % 360;
      const s = Math.max(20, hsl.s - 20);
      const l = Math.min(80, hsl.l + 20);
      colors.push(this.hslToHex(hue, s, l));
    }
    
    return colors;
  },

  /**
   * Generate monochromatic colors
   */
  getMonochromatic(hex) {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return [hex];
    
    const colors = [];
    const lightnessValues = [15, 25, 35, 45, 55, 65, 75, 85];
    
    lightnessValues.forEach(l => {
      const s = Math.max(10, hsl.s - 10);
      colors.push(this.hslToHex(hsl.h, s, l));
    });
    
    return colors;
  },

  /**
   * Generate split-complementary colors
   */
  getSplitComplementary(hex) {
    const hsl = this.hexToHsl(hex);
    if (!hsl) return [hex];
    
    const colors = [hex];
    for (let i = -1; i <= 1; i += 2) {
      const hue = (hsl.h + 150 + (i * 30) + 360) % 360;
      const s = Math.max(20, hsl.s - 20);
      const l = Math.min(75, hsl.l + 15);
      colors.push(this.hslToHex(hue, s, l));
    }
    
    return colors;
  },

  /**
   * Generate brand-safe palette
   */
  generateBrandPalette(primaryHex) {
    const hsl = this.hexToHsl(primaryHex);
    if (!hsl) return null;
    
    // Create a more sophisticated brand palette with better contrast
    const primaryHue = hsl.h;
    const primarySat = hsl.s;
    const primaryLight = hsl.l;
    
    // Generate secondary with more hue separation
    const secondaryHue = (primaryHue + 30) % 360;
    const secondarySat = Math.max(20, primarySat - 25);
    const secondaryLight = Math.min(75, primaryLight + 20);
    
    // Generate accent with complementary relationship but softened
    const accentHue = (primaryHue + 180) % 360;
    const accentSat = Math.max(30, primarySat - 20);
    const accentLight = Math.min(65, primaryLight + 15);
    
    // Create a softer, more sophisticated background instead of pure black
    const backgroundHue = primaryHue;
    const backgroundSat = Math.max(15, Math.min(25, primarySat / 3)); // Much lower saturation
    const backgroundLight = Math.max(15, Math.min(25, primaryLight / 4)); // Much darker but not pure black
    
    return {
      primary: primaryHex,
      secondary: this.hslToHex(secondaryHue, secondarySat, secondaryLight),
      accent: this.hslToHex(accentHue, accentSat, accentLight),
      background: this.hslToHex(backgroundHue, backgroundSat, backgroundLight),
      text: this.getContrastColor(this.hslToHex(backgroundHue, backgroundSat, backgroundLight))
    };
  },

  /**
   * Generate color palette based on harmony mode
   */
  generatePalette(primaryHex, mode = 'brand-safe') {
    const hsl = this.hexToHsl(primaryHex);
    if (!hsl) return null;
    
    switch (mode) {
      case 'complementary':
        return this.generateComplementaryPalette(hsl);
      case 'analogous':
        return this.generateAnalogousPalette(hsl);
      case 'split-complementary':
        return this.generateSplitComplementaryPalette(hsl);
      case 'triadic':
        return this.generateTriadicPalette(hsl);
      case 'monochromatic':
        return this.generateMonochromaticPalette(hsl);
      default:
        return this.generateBrandPalette(primaryHex);
    }
  },

  generateComplementaryPalette(hsl) {
    const complementHue = (hsl.h + 180) % 360;
    const complementHex = this.hslToHex(complementHue, Math.max(20, hsl.s - 20), Math.min(70, hsl.l + 20));
    
    return {
      primary: this.hslToHex(hsl.h, hsl.s, hsl.l),
      secondary: complementHex,
      accent: this.adjustBrightness(complementHex, 20),
      background: this.adjustBrightness(complementHex, -80),
      text: this.getContrastColor(complementHex)
    };
  },

  generateAnalogousPalette(hsl) {
    const palette = {};
    const colors = this.getAnalogous(this.hslToHex(hsl.h, hsl.s, hsl.l));
    
    return {
      primary: colors[2],
      secondary: colors[1],
      accent: colors[3],
      background: this.adjustBrightness(colors[2], -85),
      text: this.getContrastColor(colors[2])
    };
  },

  generateTriadicPalette(hsl) {
    const primary = this.hslToHex(hsl.h, Math.max(30, hsl.s), Math.min(70, hsl.l));
    const colors = this.getTriadic(primary);
    
    return {
      primary: colors[0],
      secondary: colors[1],
      accent: colors[2],
      background: this.adjustBrightness(primary, -85),
      text: this.getContrastColor(primary)
    };
  },

  generateMonochromaticPalette(hsl) {
    const colors = this.getMonochromatic(this.hslToHex(hsl.h, hsl.s, hsl.l));
    
    return {
      primary: colors[4],
      secondary: colors[3],
      accent: colors[5],
      background: colors[1],
      text: this.getContrastColor(colors[4])
    };
  },

  generateSplitComplementaryPalette(hsl) {
    const colors = this.getSplitComplementary(this.hslToHex(hsl.h, hsl.s, hsl.l));
    
    return {
      primary: colors[0],
      secondary: colors[1],
      accent: colors[2],
      background: this.adjustBrightness(colors[0], -85),
      text: this.getContrastColor(colors[0])
    };
  },

  // --- Palette derivation (mirror of backend/services/color_derive.py) ---
  // The dashboard collects Primary/Secondary/Accent/Background; Text, Surface,
  // Border, Muted are derived. This mirror powers the live derived swatches;
  // Python is canonical at persist time. Both must stay in lockstep: same
  // constants, same integer step loops, same half-up rounding.

  DERIVE_DEFAULTS: {
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff'
  },
  LIGHT_INK: '#0f1623',
  TEXT_TARGET: 7.0,
  MUTED_TARGET: 4.5,
  UI_TARGET: 3.0,
  PRIMARY_TINT: 0.08,
  SURFACE_LIFT_DARK: 0.07,
  SURFACE_DIP_LIGHT: 0.03,
  BORDER_MIX: 0.12,
  MUTED_MIX_START: 60,

  normalizeHex(value) {
    if (typeof value !== 'string') return null;
    let raw = value.trim().toLowerCase();
    if (raw.startsWith('#')) raw = raw.slice(1);
    if (/^[0-9a-f]{3}$/.test(raw)) raw = raw.split('').map(c => c + c).join('');
    if (!/^[0-9a-f]{6}$/.test(raw)) return null;
    return '#' + raw;
  },

  hexToRgbTriplet(hex) {
    const h = hex.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  },

  rgbTripletToHex(rgb) {
    return '#' + rgb.map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
  },

  mixHex(a, b, weightOfA) {
    const ra = this.hexToRgbTriplet(a);
    const rb = this.hexToRgbTriplet(b);
    const w = weightOfA;
    // Math.round is half-up for non-negative values, matching Python's int(x + 0.5)
    return this.rgbTripletToHex([
      Math.round(ra[0] * w + rb[0] * (1 - w)),
      Math.round(ra[1] * w + rb[1] * (1 - w)),
      Math.round(ra[2] * w + rb[2] * (1 - w))
    ]);
  },

  relativeLuminance(hex) {
    const lin = c => {
      const x = c / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    };
    const [r, g, b] = this.hexToRgbTriplet(hex);
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  },

  contrastRatio(a, b) {
    const la = this.relativeLuminance(a);
    const lb = this.relativeLuminance(b);
    const bright = Math.max(la, lb);
    const dim = Math.min(la, lb);
    return (bright + 0.05) / (dim + 0.05);
  },

  isLightBackground(bg) {
    return this.contrastRatio(bg, '#000000') >= this.contrastRatio(bg, '#ffffff');
  },

  deriveText(primary, bg, light) {
    const base = light ? this.LIGHT_INK : '#ffffff';
    const extreme = light ? '#000000' : '#ffffff';
    const tinted = this.mixHex(primary, base, this.PRIMARY_TINT);
    for (let step = 0; step <= 10; step++) {
      const candidate = this.mixHex(extreme, tinted, step / 10);
      if (this.contrastRatio(candidate, bg) >= this.TEXT_TARGET) return candidate;
    }
    return extreme;
  },

  deriveSurface(bg, text, light) {
    if (light) {
      if (this.contrastRatio(bg, '#ffffff') < 1.05) {
        return this.mixHex(text, bg, this.SURFACE_DIP_LIGHT);
      }
      return '#ffffff';
    }
    return this.mixHex('#ffffff', bg, this.SURFACE_LIFT_DARK);
  },

  deriveMuted(text, bg) {
    for (let pct = this.MUTED_MIX_START; pct <= 100; pct += 5) {
      const candidate = this.mixHex(text, bg, pct / 100);
      if (this.contrastRatio(candidate, bg) >= this.MUTED_TARGET) return candidate;
    }
    return text;
  },

  /**
   * Full 8-color set from up to 4 inputs. Invalid/missing inputs fall back
   * to DERIVE_DEFAULTS. Returns form-field-named keys.
   */
  derivePalette(primary, secondary, accent, background) {
    const p = this.normalizeHex(primary) || this.DERIVE_DEFAULTS.primaryColor;
    const s = this.normalizeHex(secondary) || this.DERIVE_DEFAULTS.secondaryColor;
    const a = this.normalizeHex(accent) || this.DERIVE_DEFAULTS.accentColor;
    const bg = this.normalizeHex(background) || this.DERIVE_DEFAULTS.backgroundColor;

    const light = this.isLightBackground(bg);
    const text = this.deriveText(p, bg, light);

    return {
      primaryColor: p,
      secondaryColor: s,
      accentColor: a,
      backgroundColor: bg,
      textColor: text,
      surfaceColor: this.deriveSurface(bg, text, light),
      borderColor: this.mixHex(text, bg, this.BORDER_MIX),
      mutedColor: this.deriveMuted(text, bg)
    };
  },

  /**
   * Advisories for brand colors that read poorly on the background.
   * Returns [{role, color, ratio, message}]; never mutates colors.
   */
  contrastWarnings(colors) {
    const bg = this.normalizeHex(colors?.backgroundColor) || this.DERIVE_DEFAULTS.backgroundColor;
    const warnings = [];
    const roles = [['primary', 'primaryColor'], ['secondary', 'secondaryColor'], ['accent', 'accentColor']];
    for (const [role, key] of roles) {
      const value = this.normalizeHex(colors?.[key]);
      if (!value) continue;
      const ratio = this.contrastRatio(value, bg);
      if (ratio < this.UI_TARGET) {
        const label = role.charAt(0).toUpperCase() + role.slice(1);
        warnings.push({
          role,
          color: value,
          ratio: Math.round(ratio * 100) / 100,
          message: `${label} color ${value} has ${ratio.toFixed(2)}:1 contrast on the background (below 3:1) — it may be hard to see when used for buttons or links.`
        });
      }
    }
    return warnings;
  },

  /**
   * Validate color format
   */
  isValidColor(color) {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    const rgbRegex = /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/;
    const hslRegex = /^hsl\(\d{1,3},\s*\d{1,3}%,\s*\d{1,3}%\)$/;
    
    return hexRegex.test(color) || rgbRegex.test(color) || hslRegex.test(color);
  },

  /**
   * Format color for display
   */
  formatColor(hex, format = 'hex') {
    if (!this.isValidColor(hex)) return hex;
    
    switch (format) {
      case 'hsl': {
        const hsl = this.hexToHsl(hex);
        return this.createHslString(hsl.h, hsl.s, hsl.l);
      }
      case 'rgb': {
        const hex2 = hex.replace('#', '');
        const r = parseInt(hex2.substring(0, 2), 16);
        const g = parseInt(hex2.substring(2, 4), 16);
        const b = parseInt(hex2.substring(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
      default:
        return hex;
    }
  }
};

export default ColorUtils;
