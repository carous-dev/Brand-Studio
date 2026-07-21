/**
 * Canonical known-route set for theme shells.
 * =============================================================================
 *
 * Shells used to each hardcode their own `KNOWN_ROUTES` literal to decide
 * whether a path is a public site page (render full chrome) vs a dashboard/
 * login/unknown area (render bare). Those copies drifted (gilded carried
 * legacy `/car-service`, `/in`, `/warranty`; others listed only a subset).
 * This is the single source of truth; ThemeChrome consumes it and the
 * /new-theme audit's `std-unrouted-href` rule should read the same list.
 */
export const KNOWN_ROUTES: ReadonlySet<string> = new Set([
  '/',
  '/about',
  '/about-us',
  '/contact',
  '/contact-us',
  '/cookie-policy',
  '/privacy-policy',
  '/services',
  '/sell-your-car',
  '/sell-my-car',
  '/finance',
  '/loan-calculator',
  '/part-exchange',
  '/used-cars',
  '/recently-sold',
  '/wishlist',
  '/compare',
  '/faqs',
  '/faq',
])

/** Path prefixes that always count as public site pages. */
export const KNOWN_ROUTE_PREFIXES: readonly string[] = ['/used-cars/']

/**
 * True when `pathname` is a public site page (full chrome). `extraRoutes`
 * lets a theme declare its own additional pages (e.g. warwick's /delivery,
 * /reviews, /warranty) without forking the base set.
 */
export function isKnownRoute(pathname: string, extraRoutes: readonly string[] = []): boolean {
  const path = pathname || '/'
  if (KNOWN_ROUTES.has(path)) return true
  if (extraRoutes.includes(path)) return true
  if (KNOWN_ROUTE_PREFIXES.some((p) => path.startsWith(p))) return true
  return false
}
