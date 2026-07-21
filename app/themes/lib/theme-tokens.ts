/**
 * Shared theme token emitter — the single source of truth for the CSS custom
 * properties every brandstudio theme injects via its context/BrandStyles.tsx.
 * =============================================================================
 *
 * WHY: each theme used to hand-roll its own `:root { --… }` block, so the token
 * vocabulary drifted (some themes missing the dark tier, the --brand-* alias
 * mirror, rgb variants, status colors; two legacy themes emitting no --color-*
 * at all). This module emits ONE canonical block from `brand.theme.colors`.
 *
 * It is a pure CONSUMER of the dashboard palette: the 8 core colors
 * (primary/secondary/accent/background/text/surface/muted/border) are already
 * produced by backend/services/color_derive.py (JS mirror
 * static/modules/color-utils.js) and stored on brand.theme.colors. This emitter
 * does NOT re-derive — it maps what's there onto the full token contract, with
 * a theme's bespoke palette supplied via `opts.defaults` (that's what preserves
 * each theme's visual identity).
 *
 * ADDITIVE by design: adopting this in a theme adds any missing extended tokens
 * but never changes the value of a token the theme already emitted, so no theme
 * can visually regress. Legacy themes pass their old vars through
 * `opts.legacyAliases` so their existing component CSS keeps resolving.
 *
 * NOTE: this file legitimately contains hex fallbacks (it DEFINES the tokens),
 * so it is on the SKIP_FILE list in tools/check-color-contract.mjs.
 */

export interface ThemeTokenColors {
  // Core 8 — from the dashboard / color_derive.py, on brand.theme.colors
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  backgroundColor?: string
  surfaceColor?: string
  textColor?: string
  mutedColor?: string
  borderColor?: string
  // Optional chrome overrides (themes with dark headers / hero scrims set these)
  headerBg?: string
  headerText?: string
  headerMuted?: string
  heroOverlayStart?: string
  heroOverlayEnd?: string
  heroTextMuted?: string
  heroReviewMuted?: string
  reviewStar?: string
  primaryStrong?: string
  onPrimary?: string
  [k: string]: unknown
}

export interface BuildThemeTokensOptions {
  /** Theme's bespoke palette fallbacks. REQUIRED — preserves visual identity. */
  defaults?: Partial<ThemeTokenColors>
  /** Emit fixed paired light/dark tiers (--surface-*, --text-on-*, --border-on-*). Default true. */
  darkTier?: boolean
  /** Emit the --brand-* alias mirror for back-compat. Default true. */
  brandAliasMirror?: boolean
  /** Emit rgb triples (--color-*-rgb, --brand-*-rgb). Default true. */
  rgbVariants?: boolean
  /** Emit status colours (--state-success/-warning, --color-status-online/-offline). Default true. */
  status?: boolean
  /** Theme-specific legacy aliases merged verbatim (classic/gilded/fbm). Additive. */
  legacyAliases?: Record<string, string>
}

// Hard fallbacks — last resort if a theme provides neither a brand color nor a
// default. Core-color fallbacks match color_derive.py DEFAULTS + the light-tier
// neutrals in tools/check-palette-policy.mjs.
const HARD: Required<Pick<ThemeTokenColors,
  'primaryColor' | 'secondaryColor' | 'accentColor' | 'backgroundColor' |
  'surfaceColor' | 'textColor' | 'mutedColor' | 'borderColor'>> = {
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  surfaceColor: '#f6f7fb',
  textColor: '#0f1623',
  mutedColor: '#5b6573',
  borderColor: '#e3e6ee',
}

// Fixed neutral tiers — theme-locked, NEVER brand-overridable. Values from
// tools/check-palette-policy.mjs FIXED_NEUTRALS.
const FIXED_TIERS: Record<string, string> = {
  '--surface-bg-light': '#ffffff',
  '--surface-card-light': '#f6f7fb',
  '--text-on-light-strong': '#0f1623',
  '--text-on-light-muted': '#5b6573',
  '--border-on-light': '#e3e6ee',
  '--surface-bg-dark': '#0a0e14',
  '--surface-card-dark': '#14181f',
  '--text-on-dark-strong': '#ffffff',
  '--text-on-dark-muted': 'rgba(255, 255, 255, 0.78)',
  '--border-on-dark': 'rgba(255, 255, 255, 0.12)',
}

export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex))
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0'
}

export function escapeCssUrl(url: string): string {
  return String(url).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n|\r/g, '')
}

/**
 * Return the COMPLETE canonical custom-property record for a theme.
 * Resolution for every value: colors[key] ?? defaults[key] ?? HARD[key].
 */
export function buildThemeTokens(
  colors: ThemeTokenColors | undefined,
  opts: BuildThemeTokensOptions = {},
): Record<string, string> {
  const c = colors || {}
  const d = opts.defaults || {}
  const {
    darkTier = true,
    brandAliasMirror = true,
    rgbVariants = true,
    status = true,
    legacyAliases,
  } = opts

  const pick = (key: keyof ThemeTokenColors, hard?: string): string => {
    const fromColors = typeof c[key] === 'string' ? (c[key] as string) : ''
    const fromDefault = typeof d[key] === 'string' ? (d[key] as string) : ''
    return fromColors || fromDefault || hard || ''
  }

  const primary = pick('primaryColor', HARD.primaryColor)
  const secondary = pick('secondaryColor', HARD.secondaryColor)
  const accent = pick('accentColor', HARD.accentColor)
  const background = pick('backgroundColor', HARD.backgroundColor)
  const surface = pick('surfaceColor', HARD.surfaceColor)
  const text = pick('textColor', HARD.textColor)
  const muted = pick('mutedColor', HARD.mutedColor)
  const border = pick('borderColor', HARD.borderColor)

  const primaryStrong = pick('primaryStrong', `color-mix(in srgb, ${primary} 88%, #000)`)
  const onPrimary = pick('onPrimary', '#ffffff')

  const vars: Record<string, string> = {
    // Core 8 — brand-overridable natural roles
    '--color-primary': primary,
    '--color-secondary': secondary,
    '--color-accent': accent,
    '--color-bg': background,
    '--color-surface': surface,
    '--color-text': text,
    '--color-muted': muted,
    '--color-border': border,

    // Brand triad extension
    '--color-primary-strong': primaryStrong,
    '--color-on-primary': onPrimary,

    // Header / hero chrome — light defaults keep light themes light
    '--color-header-bg': pick('headerBg', background),
    '--color-header-text': pick('headerText', text),
    '--color-header-muted': pick('headerMuted', muted),
    '--color-hero-overlay-start': pick('heroOverlayStart', 'rgba(15, 10, 37, 0.30)'),
    '--color-hero-overlay-end': pick('heroOverlayEnd', 'rgba(15, 10, 37, 0.65)'),
    '--color-hero-text-muted': pick('heroTextMuted', 'rgba(255, 255, 255, 0.92)'),
    '--color-hero-review-muted': pick('heroReviewMuted', 'rgba(255, 255, 255, 0.85)'),
    '--color-review-star': pick('reviewStar', '#facc15'),
  }

  if (darkTier) {
    Object.assign(vars, FIXED_TIERS)
  }

  if (rgbVariants) {
    Object.assign(vars, {
      '--color-primary-rgb': hexToRgb(primary),
      '--color-secondary-rgb': hexToRgb(secondary),
      '--color-accent-rgb': hexToRgb(accent),
      '--color-bg-rgb': hexToRgb(background),
      '--color-text-rgb': hexToRgb(text),
      '--color-surface-rgb': hexToRgb(surface),
      '--surface-bg-dark-rgb': hexToRgb('#0a0e14'),
      '--surface-bg-light-rgb': hexToRgb('#ffffff'),
    })
  }

  if (brandAliasMirror) {
    Object.assign(vars, {
      '--brand-primary': primary,
      '--brand-secondary': secondary,
      '--brand-accent': accent,
      '--brand-background': background,
      '--brand-text': text,
      '--brand-primary-strong': primaryStrong,
      '--brand-on-primary': onPrimary,
    })
    if (rgbVariants) {
      Object.assign(vars, {
        '--brand-primary-rgb': hexToRgb(primary),
        '--brand-secondary-rgb': hexToRgb(secondary),
        '--brand-accent-rgb': hexToRgb(accent),
        '--brand-background-rgb': hexToRgb(background),
        '--brand-text-rgb': hexToRgb(text),
      })
    }
  }

  if (status) {
    Object.assign(vars, {
      '--state-success': '#16a34a',
      '--state-warning': '#d97706',
      '--color-status-online': '#22c55e',
      '--color-status-offline': '#f59e0b',
    })
  }

  // Theme-specific legacy aliases (classic/gilded/fbm) — merged verbatim, last
  // so a theme can pin an alias to a specific value if it must.
  if (legacyAliases) Object.assign(vars, legacyAliases)

  return vars
}

export interface RenderThemeStyleArgs {
  /** Canonical tokens from buildThemeTokens. */
  vars: Record<string, string>
  /** Theme-specific extras: hero-image vars, per-page image slots, --fbm-* scales, font overrides. */
  extras?: Record<string, string>
  /** font-family applied to the scope root. */
  fontFamily?: string
  /** buildGoogleFontsImport(...) output, prepended so heading fonts actually load. */
  fontImport?: string
  /** CSS scope selector. Default ':root'. cnhcars passes '[data-theme-id="cnhcars-clone"]'. */
  scope?: string
}

/** Render the full <style> innerHTML string for a theme's BrandStyles. */
export function renderThemeStyle({
  vars,
  extras,
  fontFamily,
  fontImport = '',
  scope = ':root',
}: RenderThemeStyleArgs): string {
  const all = extras ? { ...vars, ...extras } : vars
  const body = Object.entries(all)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')
  const fontLine = fontFamily ? `\n  font-family: ${fontFamily};` : ''
  return `${fontImport}${scope} {\n${body}${fontLine}\n}\n`
}
