import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

export function ChesterfieldCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Chesterfield Motor Empire'
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Cookie policy"
        lead="What cookies we use and how to control them."
        variant="compact"
      />
      <article className={styles.article}>
        <p className={styles.intro}>
          This cookie policy explains how {brandName} uses cookies on this website. You can change your preferences at any time
          via the cookie banner that appears on your first visit, or by clearing your browser&rsquo;s site data for this domain.
        </p>

        <div className={styles.categoryGrid}>
          <article className={styles.category}>
            <span className={styles.categoryBadge} data-tone="essential">Always on</span>
            <h2 className={styles.categoryTitle}>Essential</h2>
            <p>Required to make the site work — page navigation, secure form submission, and remembering your cookie choice.</p>
            <p className={styles.categoryMeta}>Cannot be disabled.</p>
          </article>

          <article className={styles.category}>
            <span className={styles.categoryBadge} data-tone="optional">Opt-in</span>
            <h2 className={styles.categoryTitle}>Analytics</h2>
            <p>Anonymous traffic stats so we can see which cars and pages you&rsquo;re looking at and improve them.</p>
            <p className={styles.categoryMeta}>Provider: Google Analytics. Lifetime: up to 24 months.</p>
          </article>

          <article className={styles.category}>
            <span className={styles.categoryBadge} data-tone="optional">Opt-in</span>
            <h2 className={styles.categoryTitle}>Marketing</h2>
            <p>Personalised stock suggestions and remarketing pixels (used only when running campaigns).</p>
            <p className={styles.categoryMeta}>Provider: Meta, Google Ads. Lifetime: up to 90 days.</p>
          </article>
        </div>

        <h2 className={styles.h2}>Managing your preferences</h2>
        <ul className={styles.list}>
          <li>The cookie banner is visible until you make a choice. You can re-open it by clearing cookies for this domain.</li>
          <li>You can opt out of analytics and marketing cookies at any time without affecting your ability to browse stock or contact us.</li>
          <li>Most browsers let you block all cookies via their settings, though some site features may not work if you do.</li>
        </ul>

        <h2 className={styles.h2}>Related policies</h2>
        <p>
          See our <Link href="/privacy-policy" className={styles.inlineLink}>privacy policy</Link> for information on
          how we use the data we collect with your consent.
        </p>

        <p className={styles.updated}>Last updated: 11 May 2026</p>
      </article>
    </>
  )
}

export default ChesterfieldCookiePolicyPage
