import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import KainWishlistClient from './WishlistClient'

export function KainWishlistPage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        variant="contact"
        eyebrow="Your wishlist"
        title="Cars you’re keeping an eye on."
        lead="Save vehicles to keep tabs on price, status and availability — sync with the team when you’re ready."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]}
      />
      <KainWishlistClient />
    </>
  )
}

export default KainWishlistPage
