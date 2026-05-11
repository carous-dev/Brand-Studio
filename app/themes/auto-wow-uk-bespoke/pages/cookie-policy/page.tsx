import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

export function AutoCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'AUTOWOW UK'

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Cookie policy."
        lead={`What cookies ${brandName} uses, why we use them, and how you can change your mind.`}
        imageSlot="hero"
      />

      <section className={styles.legal} data-aos="fade-up">
        <article className={styles.legalInner} data-aos="fade-up" data-aos-delay="100">
          <h2>What is a cookie?</h2>
          <p>
            Cookies are small text files that get saved to your browser when
            you visit a website. They let the site remember things — like
            keeping you logged in, what&apos;s in your wishlist, or which
            analytics events have already been counted — across page reloads.
          </p>

          <h2>The cookies we use</h2>
          <ul className={styles.list}>
            <li>
              <strong>Essential.</strong> Keep this site usable. They store
              your consent choice, your wishlist, and your compare list. Without
              them the site can&apos;t function. Always on.
            </li>
            <li>
              <strong>Analytics (optional).</strong> Aggregate, anonymised stats
              that show us which cars get attention and where buyers drop off.
              Helps us pick better stock. Off by default.
            </li>
            <li>
              <strong>Marketing (optional).</strong> Used when we&apos;ve
              partnered with a finance lender or third-party advertiser. Off by
              default.
            </li>
          </ul>

          <h2>Changing your choice</h2>
          <p>
            Open the cookie banner at the bottom of any page and you can adjust
            your preferences. Clearing the cookies from your browser settings
            will reset your consent — we&apos;ll ask again next visit.
          </p>

          <h2>Third-party cookies</h2>
          <p>
            Some pages embed third-party widgets (vehicle history checks,
            payment processors, mapping). Those providers may set their own
            cookies governed by their privacy policies. We don&apos;t share
            personal information with them beyond what&apos;s required to make
            the feature work.
          </p>

          <p className={styles.footer}>Last updated: 2026-05-11.</p>
        </article>
      </section>
    </>
  )
}

export default AutoCookiePolicyPage
