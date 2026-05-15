import Link from 'next/link'
import { Shield, BarChart3, Megaphone, ArrowUpRight } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import { getBrandContactInfo } from '../../lib/contact'
import styles from './page.module.css'

const CATEGORIES = [
  {
    icon: Shield,
    title: 'Essential',
    body: 'Required for the site to function — session tokens, security, basket / wishlist state. These always run.',
    examples: ['session', 'csrf', 'cookie_consent'],
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    body: 'Help us understand what stock buyers look at and where the site needs improving. Anonymised.',
    examples: ['_ga', '_gid', 'analytics_session'],
  },
  {
    icon: Megaphone,
    title: 'Marketing',
    body: 'Lets us tailor offers and remarketing across other sites. We only set these if you opt in.',
    examples: ['fb_pixel', 'g_ads', 'tt_pixel'],
  },
]

export function ShowroomCookiePolicyPage({ brand }: ThemePageProps) {
  const contact = getBrandContactInfo(brand)

  return (
    <article>
      <section className="shr-page-hero shr-page-hero--legal">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Cookie Policy</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            How we use cookies on this site.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            We use cookies to keep the site running, to understand usage in aggregate, and (with
            your permission) to deliver relevant marketing. You can change your mind any time.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.cookieBody}`}>
        <div className="shr-container">
          <div className={styles.intro} data-aos="fade-up">
            <p>
              When you visit our site, we (or services we use) may store small text files in your
              browser — these are <strong>cookies</strong>. They sit in three buckets:
            </p>
          </div>

          <div className={styles.grid}>
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon
              return (
                <article key={cat.title} className={styles.card} data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                  <span className={styles.cardIcon} aria-hidden><Icon size={22} strokeWidth={2.2} /></span>
                  <h2 className={styles.cardTitle}>{cat.title}</h2>
                  <p className={styles.cardBody}>{cat.body}</p>
                  <ul className={styles.examples}>
                    {cat.examples.map((c) => <li key={c}><code>{c}</code></li>)}
                  </ul>
                </article>
              )
            })}
          </div>

          <div className={styles.controlPanel} data-aos="fade-up">
            <h2 className={styles.controlTitle}>Manage your preferences</h2>
            <p>
              You can change your cookie preferences any time using the consent banner —
              it lives in the bottom-left of the site. Browser settings can also block
              cookies entirely, but some site features (wishlist, finance applications,
              login) may not work without essential cookies.
            </p>
            <div className={styles.controlActions}>
              <Link href="/privacy-policy" className="shr-btn-primary">
                Read privacy policy
                <ArrowUpRight size={16} strokeWidth={2.4} />
              </Link>
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="shr-btn-ghost-light">Email us</a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}

export default ShowroomCookiePolicyPage
