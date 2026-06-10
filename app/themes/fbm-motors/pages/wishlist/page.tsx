import { PageHero } from '../../components/PageHero'
import WishlistClient from './WishlistClient'

export function FbmWishlistPage() {
  return (
    <>
      <PageHero
        title="Your wishlist"
        lead="Cars you've saved while browsing. Add or remove from any vehicle card."
      />
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px' }}>
        <WishlistClient />
      </section>
    </>
  )
}

export default FbmWishlistPage
