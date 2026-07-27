/**
 * Route raster image URLs through Next's built-in image optimizer
 * (`/_next/image`) to get WebP/AVIF conversion + on-the-fly resizing without
 * migrating every theme to the `next/image` component. Themes keep their plain
 * `<img>` / CSS `background-image` markup and just wrap the URL with
 * `optimizeImageUrl(...)`.
 *
 * SAFE BY DEFAULT: only local paths and hosts Next is allowed to fetch (see
 * `images.remotePatterns` in next.config.js) are rewritten. Any other host is
 * returned untouched so an unknown feed CDN renders normally (unoptimized)
 * rather than 400ing from the optimizer. To optimize a new host, add it to BOTH
 * next.config.js `remotePatterns` AND `OPTIMIZABLE_HOSTS` below.
 */

// Next's default allowed widths (deviceSizes ∪ imageSizes). Requesting a width
// outside this set makes /_next/image 400, so we snap up to the nearest.
const ALLOWED_WIDTHS = [
  16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840,
]

// Keep in sync with `images.remotePatterns` in next.config.js.
const OPTIMIZABLE_HOSTS = new Set([
  'images.unsplash.com',
  'plus.unsplash.com',
  'm-qa.atcdn.co.uk',
  'static.wixstatic.com',
])

function snapWidth(width: number): number {
  return ALLOWED_WIDTHS.find((w) => w >= width) ?? ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1]
}

function isOptimizable(src: string): boolean {
  // Same-origin / relative paths (brand uploads served via /images -> /api/media).
  if (src.startsWith('/') && !src.startsWith('//')) return true
  try {
    const url = new URL(src)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
    return OPTIMIZABLE_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

export interface OptimizeImageOptions {
  /** Intended rendered width in CSS px (snapped up to Next's allowed set). */
  width?: number
  /** JPEG/WebP quality 1-100. Must be listed in next.config `images.qualities`. */
  quality?: number
}

/**
 * Returns a `/_next/image?...` URL for optimizable sources, or the original URL
 * untouched (data URIs, SVGs, unknown hosts, empty). Never throws.
 */
export function optimizeImageUrl(
  src: string | null | undefined,
  { width = 828, quality = 70 }: OptimizeImageOptions = {},
): string {
  if (!src || typeof src !== 'string') return src ?? ''
  if (src.startsWith('data:') || src.startsWith('/_next/image')) return src
  if (/\.svg(\?|#|$)/i.test(src)) return src
  if (!isOptimizable(src)) return src

  const w = snapWidth(width)
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`
}

/**
 * Build a CSS `url("...")` value pointing at the optimizer, for use in
 * `background-image`. Falls back to `none` when there's no source.
 */
export function optimizedCssUrl(
  src: string | null | undefined,
  options?: OptimizeImageOptions,
): string {
  if (!src) return 'none'
  const optimized = optimizeImageUrl(src, options)
  // Escape quotes/backslashes/parens the same way theme code does for url().
  const safe = optimized.replace(/["\\]/g, (c) => `\\${c}`)
  return `url("${safe}")`
}
