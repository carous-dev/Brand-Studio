import type { ThemePageProps } from '../../../types'
import WishlistIsland from './WishlistIsland'

export function QueensburyWishlistPage(_props: ThemePageProps) {
  return (
    <>
      <section className="qb-page-hero qb-page-hero--plain" data-aos="fade-up">
        <div className="qb-page-hero__inner">
          <span className="qb-page-hero__eyebrow">Your wishlist</span>
          <h1 className="qb-page-hero__title">Cars you've saved.</h1>
          <p className="qb-page-hero__lead">
            Bookmark anything you like the look of. We keep it here until you're ready to chat.
          </p>
        </div>
      </section>

      <section className="qb-section">
        <div className="qb-container">
          <WishlistIsland />
        </div>
      </section>
    </>
  )
}

export default QueensburyWishlistPage
