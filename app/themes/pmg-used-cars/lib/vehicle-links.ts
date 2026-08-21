/**
 * Build the canonical permalink for a vehicle detail page.
 * Prefers the slug (`/used-cars/<slug>`); falls back to the supplied path
 * when no usable slug exists.
 */
export function buildVehiclePermalink(
  v: { slug?: string | null; reg?: string | null },
  fallback = "/used-cars",
): string {
  const slug = (v.slug ?? "").trim();
  if (slug) return `/used-cars/${slug}`;
  return fallback;
}
