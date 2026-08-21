/**
 * Vendored `buildDealerRobots` from `@carous/seo` (packages/seo/src/index.ts).
 *
 * Only the robots builder (and its tiny `stripTrailingSlash` helper) is
 * vendored here — the theme's own `lib/seo-links.ts` already carries the
 * slugify helpers, and the metadata/sitemap/JSON-LD builders aren't consumed.
 * Needs only `next` types.
 */

import type { MetadataRoute } from "next";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export type DealerRobotsOptions = {
  siteUrl: string;
  /** Paths to disallow. Default `['/api']`. */
  disallow?: string[];
  /** Custom rules array; overrides the default `userAgent: '*'` rule entirely. */
  rules?: MetadataRoute.Robots["rules"];
};

export function buildDealerRobots(options: DealerRobotsOptions): MetadataRoute.Robots {
  const siteUrl = stripTrailingSlash(options.siteUrl);
  return {
    rules:
      options.rules ?? [
        {
          userAgent: "*",
          allow: "/",
          disallow: options.disallow ?? ["/api"],
        },
      ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
