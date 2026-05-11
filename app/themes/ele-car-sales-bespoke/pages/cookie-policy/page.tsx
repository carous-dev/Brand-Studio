import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

export function EleCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'ELE Car Sales'
  return (
    <main>
      <PageHero
        eyebrow="Legal"
        title="Cookie policy"
        lead="What cookies are, why we use them, and how you can manage your preferences."
        imageSlot="hero"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <article className={styles.prose}>
            <h2>About cookies</h2>
            <p>
              Cookies are small text files stored on your device when you visit a
              website. They help the site remember your preferences and let the
              owner understand how the site is used.
            </p>

            <h2>The cookies we use</h2>
            <h3>Essential</h3>
            <p>
              Required for the site to function — including remembering your
              consent preferences and keeping a session active. These cannot be
              disabled.
            </p>

            <h3>Analytics</h3>
            <p>
              Used to understand how visitors find and move through the site so
              we can improve it. We only enable analytics cookies if you opt in
              via the consent banner.
            </p>

            <h3>Marketing</h3>
            <p>
              Used to show you relevant offers on other sites. Disabled by
              default and only set if you opt in via the consent banner.
            </p>

            <h2>Managing your preferences</h2>
            <p>
              You can change your cookie preferences at any time by clicking the
              cookie settings link in the banner. You can also clear cookies via
              your browser settings — note this will reset any saved
              preferences.
            </p>

            <h2>Contact</h2>
            <p>
              Questions about how {brandName} uses cookies? Send us a message via
              the <a href="/contact">contact page</a>.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default EleCookiePolicyPage
