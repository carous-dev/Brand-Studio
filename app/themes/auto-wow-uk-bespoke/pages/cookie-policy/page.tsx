import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import styles from './page.module.css'

export function AutoCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'this dealership'

  return (
    <>
      <section className="auto-page-hero">
        <div className="auto-page-hero-inner">
          <p className="auto-page-hero-crumb">Legal</p>
          <h1>Cookie policy</h1>
          <p>How {brandName} uses cookies and what you can switch on or off.</p>
        </div>
      </section>

      <article className={`auto-section ${styles.policy}`}>
        <div className={`auto-container ${styles.prose}`}>
          <p className={styles.last}>Last updated: 11 May 2026</p>

          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files stored on your device by your browser when you visit a
            website. They&rsquo;re used to make sites work, remember preferences, and measure how the
            site is used.
          </p>

          <h2>Categories we use</h2>
          <ul className={styles.cookieList}>
            <li>
              <h3>Essential</h3>
              <p>Always on. Required for the site to work &mdash; session, security, language preference.
              You can&rsquo;t turn these off.</p>
            </li>
            <li>
              <h3>Analytics</h3>
              <p>Optional. Anonymous usage stats (page views, button clicks) so we can improve the site.
              Off until you accept.</p>
            </li>
            <li>
              <h3>Marketing</h3>
              <p>Optional. Retargeting on third-party platforms and offer personalisation. Off until
              you accept.</p>
            </li>
          </ul>

          <h2>Managing your choices</h2>
          <p>
            Open the cookie banner at the bottom of any page to update your choices, or clear your
            browser&rsquo;s site data to reset everything.
          </p>

          <h2>More information</h2>
          <p>
            See our <Link href="/privacy-policy">privacy policy</Link> for full details on how we
            handle personal data.
          </p>
        </div>
      </article>
    </>
  )
}

export default AutoCookiePolicyPage
