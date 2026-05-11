import type { ThemePageProps } from '../../../types'
import WishlistIsland from './WishlistIsland'

export function AutoWishlistPage(_props: ThemePageProps) {
  return (
    <>
      <section className="auto-page-hero">
        <div className="auto-page-hero-inner">
          <p className="auto-page-hero-crumb">Your wishlist</p>
          <h1>The cars you&rsquo;re circling.</h1>
          <p>
            Saved vehicles are stored on this device so you can come back to them. Ready to enquire?
            Tap through to the listing or send the whole list as a message.
          </p>
        </div>
      </section>
      <WishlistIsland />
    </>
  )
}

export default AutoWishlistPage
