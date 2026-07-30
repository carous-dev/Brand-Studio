import type { ThemePageProps } from '../../../types'
import PageRibbon from '../../components/PageRibbon'
import WishlistClient from './WishlistClient'

/**
 * Wishlist — Server Component. Slim page ribbon (design §7), then the saved-cars
 * showroom grid (with its empty state) rendered by the client garage island.
 */
export function RedgateWishlistPage({ brand }: ThemePageProps) {
  return (
    <>
      <PageRibbon
        brand={brand}
        slim
        eyebrowKey="ribbon.eyebrow"
        titleKey="ribbon.wishlist_title"
        leadKey="ribbon.wishlist_lead"
      />
      <WishlistClient />
    </>
  )
}

export default RedgateWishlistPage
