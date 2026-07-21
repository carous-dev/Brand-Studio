import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import WishlistClient from './WishlistClient'

export function Buy4lessukWishlistPage(_: ThemePageProps) {
  return (
    <>
      <PageHero title="Your shortlist" eyebrow="Saved cars" slot="about" />
      <WishlistClient />
    </>
  )
}

export default Buy4lessukWishlistPage
