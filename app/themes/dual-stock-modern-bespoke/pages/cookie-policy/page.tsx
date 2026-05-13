import type { ThemePageProps } from '../../../types'
import Link from 'next/link'
import styles from './page.module.css'

export function DualCookiePolicyPage(_props: ThemePageProps) {
  return (
    <main>
      <section className="dual-page-hero dual-page-hero--cookie">
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Cookie policy</span>
          </nav>
          <h1 className="dual-page-hero__title">Cookie policy</h1>
          <p className="dual-page-hero__lead">How and why we use cookies on this site.</p>
        </div>
      </section>

      <section className="dual-section">
        <div className={`dual-container ${styles.legal}`}>
          <h2>What are cookies?</h2>
          <p>Cookies are small text files stored on your device that help us remember your preferences and understand how you use the site.</p>

          <h2>Categories</h2>
          <p>We split cookies into three categories. You can opt in or out of the second and third via the cookie banner at the bottom of the page.</p>
          <table className={styles.table}>
            <thead>
              <tr><th>Category</th><th>Purpose</th><th>Opt-in?</th></tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Essential</th>
                <td>Required for the site to function — login, cart, basic preferences.</td>
                <td>Always on</td>
              </tr>
              <tr>
                <th scope="row">Analytics</th>
                <td>Anonymous traffic + stock-view data to help us improve the site.</td>
                <td>Optional</td>
              </tr>
              <tr>
                <th scope="row">Marketing</th>
                <td>Remarketing for vehicles you viewed, on third-party platforms.</td>
                <td>Optional</td>
              </tr>
            </tbody>
          </table>

          <h2>Changing your consent</h2>
          <p>You can change your cookie preferences at any time using the banner at the bottom of the screen, or by clearing your browser's site data.</p>

          <h2>More info</h2>
          <p>See also our <Link href="/privacy-policy">privacy policy</Link> for how we handle the personal data you give us through forms.</p>
        </div>
      </section>
    </main>
  )
}

export default DualCookiePolicyPage
