import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import WishlistIsland from './WishlistIsland'

export function AutoWishlistPage({ brand }: ThemePageProps) {
  return (
    <>
      <div data-aos="fade">
        <PageHero
          eyebrow="Your garage"
          title="Saved for you."
          lead="The cars you’ve liked along the way — back here whenever you’re ready to compare, enquire or take a test drive."
          imageSlot="hero"
        />
      </div>
      <div data-aos="fade-up" data-aos-delay="120"><WishlistIsland /></div>
    </>
  )
}

export default AutoWishlistPage
