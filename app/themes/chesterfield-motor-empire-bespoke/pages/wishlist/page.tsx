import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import WishlistIsland from './WishlistIsland'

export function ChesterfieldWishlistPage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Saved cars"
        title="Your wishlist"
        lead="Cars you've saved while browsing the showroom. Stored on your device only."
        variant="compact"
      />
      <WishlistIsland />
    </>
  )
}

export default ChesterfieldWishlistPage
