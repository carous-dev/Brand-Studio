import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AutoCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Autowow'
  return (
    <main>
      <section className="auto-page-hero auto-page-hero--about" aria-label="Cookie policy hero">
        <div className="auto-page-hero-inner">
          <span className="auto-page-hero-eyebrow">[ Legal ]</span>
          <h1>Cookie policy</h1>
          <p>What {brandName} stores in your browser — and how to turn it off.</p>
        </div>
      </section>

      <section className={`auto-section ${styles.body}`}>
        <article className={styles.article}>
          <h2>What cookies do</h2>
          <p>
            Cookies are small text files saved by your browser. We use them to
            keep the site running, remember your preferences, and (with your
            permission) measure how visitors use the site.
          </p>

          <h2>Cookie categories</h2>
          <h3>Necessary</h3>
          <p>
            Required for the site to function — session, consent record,
            wishlist, compare. Cannot be switched off.
          </p>
          <h3>Analytics</h3>
          <p>
            Anonymised tracking via Google Analytics so we can see which pages
            help buyers and which don&apos;t. Opt-in via the cookie banner.
          </p>
          <h3>Marketing</h3>
          <p>
            Used for re-marketing pixels (Meta, Google Ads) when you&apos;ve seen
            a vehicle on our site. Opt-in via the cookie banner.
          </p>

          <h2>Manage preferences</h2>
          <p>
            Click &ldquo;Customise&rdquo; on the cookie banner at any time, or clear your
            browser cookies to reset to default.
          </p>
        </article>
      </section>
    </main>
  )
}

export default AutoCookiePolicyPage
