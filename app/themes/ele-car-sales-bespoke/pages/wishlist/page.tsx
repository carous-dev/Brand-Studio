import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import WishlistClient from './WishlistClient'
import styles from './page.module.css'

export function EleWishlistPage(_props: ThemePageProps) {
  return (
    <main>
      <PageHero
        eyebrow="Your wishlist"
        title="Saved cars, all in one place."
        lead="Cars you've saved are kept on this device. Come back any time — or send the team a quick enquiry to lock one in."
        imageSlot="hero"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <WishlistClient />
        </div>
      </section>
    </main>
  )
}

export default EleWishlistPage
