import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AxisCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Axis Autos'
  return (
    <main>
      <section className="axis-page-hero axis-page-hero--about" aria-label="Cookie policy hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">legal.cookies</span>
          <h1>Cookie policy</h1>
          <p>What {brandName} stores in your browser — and how to turn it off.</p>
        </div>
      </section>

      <section className={`axis-section ${styles.body}`}>
        <article className={styles.article}>
          <h2>What cookies do</h2>
          <p>
            Cookies are small text files saved by your browser. We use them to
            keep the site running, remember your preferences, and (with your
            permission) measure how visitors use the site.
          </p>

          <h2>Categories</h2>
          <h3>Necessary</h3>
          <p>
            Required for the site to function — session, consent record,
            wishlist, compare. Cannot be switched off.
          </p>
          <h3>Analytics</h3>
          <p>
            Anonymised tracking via Google Analytics so we can see which pages
            help buyers and which don&apos;t. Opt-in via the consent dock.
          </p>
          <h3>Marketing</h3>
          <p>
            Re-marketing pixels (Meta, Google Ads) when you&apos;ve viewed a
            vehicle on our site. Opt-in via the consent dock.
          </p>

          <h2>Manage preferences</h2>
          <p>
            Click &ldquo;Configure&rdquo; on the consent dock at any time, or clear your
            browser cookies to reset to default.
          </p>
        </article>
      </section>
    </main>
  )
}

export default AxisCookiePolicyPage
