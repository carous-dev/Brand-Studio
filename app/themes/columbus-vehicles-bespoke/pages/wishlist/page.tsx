import type { ThemePageProps } from '../../../types'
import WishlistView from '../../components/WishlistView'

/**
 * Columbus Vehicles — Wishlist (rugged archetype)
 *
 * SERVER COMPONENT wrapper. The interactive view is in `<WishlistView>`
 * (client) — wrapper exists so the route's `'use client'` directive
 * doesn't collide with springalls-classic's parallel wishlist page in
 * Turbopack's chunk-item cache.
 */
export function ColumbusWishlistPage(_props: ThemePageProps) {
  return (
    <main>
      <WishlistView />
    </main>
  )
}

export default ColumbusWishlistPage
