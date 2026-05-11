import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import WishlistIsland from './WishlistIsland'

export function NcrWishlistPage(_props: ThemePageProps) {
  return (
    <>
      <PageHero
        eyebrow="Your shortlist"
        title="Saved for later."
        lead="The vans you've earmarked. Saved locally on this device — clear them any time."
        imageSlot="hero"
        pills={['Saved locally', 'Just for you']}
      />
      <WishlistIsland />
    </>
  )
}

export default NcrWishlistPage
