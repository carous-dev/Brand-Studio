/**
 * SEO hub-link helpers — dependency-free so BOTH server components (footer, hub
 * pages, sitemap) and client components (MakesBand) can import them without
 * pulling the `@carous/seo` barrel into the client bundle.
 *
 * `slugifyPart` is byte-identical to `@carous/seo`'s `slugifyLocalePart`, so the
 * slugs this file builds match what the sitemap emits and what the route folders
 * resolve — sitemap ↔ route parity is guaranteed by using ONE slugifier.
 */
import type { DealerArea } from "./areas";

/** Static parent segment for location landing routes: /used-cars-in/<town>. */
export const LOCATION_PREFIX = "used-cars-in";

export function slugifyPart(value: string): string {
  if (!value) return "";
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Title-case a slug back into a display label ("land-rover" → "Land Rover"). */
export function humanizeSlug(value: string): string {
  const slug = slugifyPart(value);
  if (!slug) return "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((token) =>
      token.length <= 3 && /^[a-z]+$/.test(token)
        ? token.toUpperCase()
        : token.charAt(0).toUpperCase() + token.slice(1),
    )
    .join(" ");
}

/** /make/<slug> — clean make hub URL. Falls back to the listing if empty. */
export function buildMakePath(make: string): string {
  const slug = slugifyPart(make);
  return slug ? `/make/${slug}` : "/used-cars";
}

/** /used-cars-in/<town> — clean location landing URL. */
export function buildLocationPath(town: string): string {
  const slug = slugifyPart(town);
  return slug ? `/${LOCATION_PREFIX}/${slug}` : "/used-cars";
}

/** Resolve a make slug back to the real make label using live stock keys. */
export function resolveMakeFromSlug(value: string, availableMakes: string[]): string {
  const slug = slugifyPart(value);
  if (!slug) return "";
  const match = availableMakes.find((make) => slugifyPart(make) === slug);
  return match || humanizeSlug(slug);
}

/** Resolve a town slug back to its DealerArea (or null if not covered). */
export function resolveAreaFromSlug(value: string, areas: DealerArea[]): DealerArea | null {
  const slug = slugifyPart(value);
  if (!slug) return null;
  return areas.find((area) => slugifyPart(area.town) === slug) ?? null;
}
