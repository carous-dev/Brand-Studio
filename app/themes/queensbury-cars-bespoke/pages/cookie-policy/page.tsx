import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function QueensburyCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Queensbury Cars'

  return (
    <>
      <section className="qb-page-hero qb-page-hero--plain" data-aos="fade-up">
        <div className="qb-page-hero__inner">
          <span className="qb-page-hero__eyebrow">Legal</span>
          <h1 className="qb-page-hero__title">Cookie policy</h1>
          <p className="qb-page-hero__lead">
            What cookies {brandName} uses, why we use them, and how you can change your mind.
          </p>
        </div>
      </section>

      <section className="qb-section">
        <div className={`qb-container ${styles.legal}`}>
          <h2>What is a cookie?</h2>
          <p>
            A cookie is a small piece of data your browser stores when you visit a site. Cookies remember settings,
            keep you logged in, and help us understand which pages are useful. They can be removed at any time.
          </p>

          <h2>Categories we use</h2>
          <ul className={styles.categories}>
            <li className={styles.cat}>
              <span className={styles.catLabel}>Essential</span>
              <p>
                Required for the site to work — saving your wishlist, your consent choice, basic security. These
                cannot be disabled.
              </p>
            </li>
            <li className={styles.cat}>
              <span className={styles.catLabel}>Analytics</span>
              <p>
                Help us see which pages are popular and where users get stuck. No personally-identifying data is
                shared with the analytics provider.
              </p>
            </li>
            <li className={styles.cat}>
              <span className={styles.catLabel}>Marketing</span>
              <p>
                Used for personalised offers and remarketing campaigns. Off by default — turn on only if you'd
                like to see relevant ads.
              </p>
            </li>
          </ul>

          <h2>How to manage cookies</h2>
          <p>
            You can change your choice any time by clearing your cookies and revisiting the site (the consent
            banner will reappear). Most browsers also let you block cookies globally — see your browser's help
            for instructions.
          </p>

          <h2>Specific cookies</h2>
          <p>
            We document the precise cookies set by each integration on this site separately — ask us via the
            contact form and we'll share the current list.
          </p>
        </div>
      </section>
    </>
  )
}

export default QueensburyCookiePolicyPage
