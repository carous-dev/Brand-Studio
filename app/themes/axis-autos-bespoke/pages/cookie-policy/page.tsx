import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AxisCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Axis Autos'

  return (
    <>
      <section className="axis-page-hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">Legal</span>
          <h1 className="axis-page-hero-title">Cookie policy.</h1>
          <p className="axis-page-hero-lead">
            What cookies {brandName} uses on this website, and how you can change your preferences.
          </p>
        </div>
      </section>

      <section className="axis-section">
        <div className="axis-shell">
          <article className={styles.prose}>
            <h2>What cookies are</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help the site remember
              your preferences and how you arrived. We only set cookies that genuinely improve your experience or help us
              understand how the site is performing.
            </p>

            <h2>The cookies we use</h2>
            <table className={styles.table}>
              <thead>
                <tr><th scope="col">Category</th><th scope="col">Purpose</th><th scope="col">Consent</th></tr>
              </thead>
              <tbody>
                <tr><td>Essential</td><td>Session, security, fraud-prevention. The site doesn't work without these.</td><td>Always on</td></tr>
                <tr><td>Preference</td><td>Remembers your wishlist + compare list across visits.</td><td>Opt-in</td></tr>
                <tr><td>Analytics</td><td>Anonymous traffic + page-view data. No personal identification.</td><td>Opt-in</td></tr>
                <tr><td>Marketing</td><td>Retargeting where relevant. Off by default.</td><td>Opt-in</td></tr>
              </tbody>
            </table>

            <h2>Managing cookies</h2>
            <p>
              You can change your consent at any time using the cookie banner that appears on first visit, or by clearing
              your browser cookies for this site. You can also block cookies in your browser settings — note that doing so
              may make parts of the site unusable.
            </p>

            <p className={styles.updated}>This policy was last updated {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}.</p>
          </article>
        </div>
      </section>
    </>
  )
}

export default AxisCookiePolicyPage
