import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

export function KainCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Kain Motors'
  return (
    <>
      <PageHero
        variant="about"
        eyebrow="Legal"
        title="Cookie policy"
        lead="The cookies we use, why we use them, and how to change your mind."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cookies' }]}
      />

      <section className={`kain-section ${styles.section}`}>
        <article className={`${styles.article} kain-prose`}>
          <p className={styles.lastUpdated}>Last updated: April 2026</p>

          <h2>1. What cookies are</h2>
          <p>
            Cookies are small text files saved to your device when you visit a website. They help sites remember
            preferences and understand how visitors move around.
          </p>

          <h2>2. Categories we use</h2>
          <dl className={styles.cats}>
            <div>
              <dt>Essential</dt>
              <dd>Required for the site to work — page navigation, form submission and security. These always run.</dd>
            </div>
            <div>
              <dt>Analytics</dt>
              <dd>Aggregated stats that help us see which cars get the most attention. No personal identification.</dd>
            </div>
            <div>
              <dt>Marketing</dt>
              <dd>Used to show relevant finance offers and remarketing on partner platforms. Opt-in only.</dd>
            </div>
          </dl>

          <h2>3. Managing your preferences</h2>
          <p>
            When you first visited the site, you set preferences via the consent banner. You can change those at any
            time by opening the banner from the link below — or via your browser’s cookie settings.
          </p>
          <p>
            Most browsers let you block or delete cookies entirely. Doing so may break parts of the site (e.g. your
            wishlist won’t persist between visits).
          </p>

          <h2>4. Third-party cookies</h2>
          <p>
            Some pages embed third-party content (YouTube videos, Google Maps, etc.) which set their own cookies. We
            don’t control these — see those providers’ policies for details.
          </p>

          <h2>5. Get in touch</h2>
          <p>
            Questions about how {brandName} uses cookies? <Link href="/contact">Send us a message</Link>{' '}
            and we’ll reply during showroom hours.
          </p>
        </article>
      </section>
    </>
  )
}

export default KainCookiePolicyPage
