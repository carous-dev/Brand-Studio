/**
 * Google Fonts loader helper used by bespoke themes' BrandStyles to
 * dynamically pull in whichever font the brand record specifies
 * (theme.fonts.ui / theme.fonts.brand). Without this, the
 * --font-*-family-override CSS vars resolve to font names the browser
 * has no @font-face for, and the page falls back to system-ui.
 *
 * The helper is intentionally side-effect-free and safe to call from
 * client components — it returns either a CSS @import line or null.
 */

const GENERIC_FAMILIES = new Set(
  [
    'sans-serif',
    'serif',
    'monospace',
    'cursive',
    'fantasy',
    'system-ui',
    'ui-sans-serif',
    'ui-serif',
    'ui-monospace',
    'ui-rounded',
    'inherit',
    'initial',
    'unset',
    'revert',
    'revert-layer',
    '-apple-system',
    'blinkmacsystemfont',
    'segoe ui',
    'helvetica neue',
    'arial',
    'arial narrow',
    'helvetica',
    'georgia',
    'times new roman',
    'times',
    'consolas',
    'courier new',
    'courier',
    'menlo',
    'monaco',
  ].map((s) => s.toLowerCase())
);

/**
 * Pulls the first concrete font name out of a CSS font-family stack.
 * Returns null when the stack contains only generic / system families
 * (which the browser already has — no Google Fonts request needed).
 */
export function extractGoogleFontName(
  stack: string | null | undefined
): string | null {
  if (!stack || typeof stack !== 'string') return null;
  const first = stack.split(',')[0];
  if (!first) return null;
  const cleaned = first.replace(/['"]/g, '').trim();
  if (!cleaned) return null;
  if (GENERIC_FAMILIES.has(cleaned.toLowerCase())) return null;
  return cleaned;
}

export interface GoogleFontRequest {
  name: string;
  /** e.g. "400;500;600;700" — defaults to a UI-suitable range. */
  weights?: string;
}

/**
 * Build a Google Fonts CSS2 URL for one or more families. De-dupes by
 * font name (case-insensitive) so the same font requested as both UI
 * and brand is only loaded once.
 */
export function buildGoogleFontsUrl(
  requests: Array<GoogleFontRequest | null | undefined>
): string | null {
  const dedup = new Map<string, string>();
  for (const req of requests) {
    if (!req || !req.name) continue;
    const key = req.name.toLowerCase();
    if (dedup.has(key)) continue;
    dedup.set(key, req.weights || '400;500;600;700');
  }
  if (dedup.size === 0) return null;
  const params = [...dedup.entries()].map(([name, weights]) => {
    const encoded = encodeURIComponent(name).replace(/%20/g, '+');
    return `family=${encoded}:wght@${weights}`;
  });
  return `https://fonts.googleapis.com/css2?${params.join('&')}&display=swap`;
}

/**
 * Convenience for bespoke themes: given the resolved UI + brand CSS
 * stacks, return an `@import url(...);` CSS line ready to prepend to
 * a <style> block. Returns an empty string when no Google Fonts
 * lookup is needed (both stacks are system-only).
 */
export function buildGoogleFontsImport(
  fontUiStack: string,
  fontBrandStack: string
): string {
  const url = buildGoogleFontsUrl([
    { name: extractGoogleFontName(fontUiStack) || '', weights: '400;500;600;700' },
    { name: extractGoogleFontName(fontBrandStack) || '', weights: '500;600;700' },
  ]);
  return url ? `@import url('${url}');\n` : '';
}
