import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

const CATEGORIES = [
  {
    name: 'Essential',
    required: true,
    body: "Needed for the site to work — log-in state, shopping garage (wishlist/compare), cookie consent itself. Can't be switched off.",
    examples: ['ncr-van-sales-bespoke:*:garage-v1', '<slug>_cookie_consent'],
  },
  {
    name: 'Analytics',
    required: false,
    body: 'Anonymous traffic statistics — pages viewed, time on site, sources. Helps us improve the forecourt experience. Off by default.',
    examples: ['_ga (Google Analytics)', '_gid (Google Analytics)'],
  },
  {
    name: 'Marketing',
    required: false,
    body: 'Targeted remarketing on third-party platforms (Google Ads, Facebook). Helps us show our finance offers to people who have visited the site. Off by default.',
    examples: ['_fbp (Meta pixel)', '_gcl_au (Google Ads)'],
  },
]

export function NcrCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'NCR Van Sales Ltd'
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Cookie policy."
        lead={`How ${brandName} uses cookies and how you control them.`}
        imageSlot="hero"
      />

      <article className={styles.article}>
        <section data-aos="fade-up">
          <h2>What are cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. They let us remember your preferences (like cookie consent), keep features working (like your wishlist), and — with your permission — measure how the site is performing.
          </p>
        </section>

        <section data-aos="fade-up">
          <h2>How we use them</h2>
          <p>We split cookies into three categories, and you control whether the non-essential ones are set:</p>

          <div className={styles.catalogue}>
            {CATEGORIES.map((c, i) => (
              <article key={c.name} className={styles.categoryCard} data-aos="fade-up" data-aos-delay={i * 80}>
                <header className={styles.categoryHead}>
                  <h3>{c.name}</h3>
                  <span className={c.required ? styles.statusOn : styles.statusOff}>
                    {c.required ? 'Always on' : 'Off by default'}
                  </span>
                </header>
                <p>{c.body}</p>
                <p className={styles.examplesLabel}>Examples</p>
                <ul className={styles.examples}>
                  {c.examples.map((ex) => <li key={ex}><code>{ex}</code></li>)}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section data-aos="fade-up">
          <h2>Managing your preferences</h2>
          <p>
            When you first visit the site you'll see a consent banner letting you accept all, reject non-essential or manage categories individually. You can change your mind at any time by clearing your cookies for this domain in your browser settings — the banner will reappear on your next visit.
          </p>
          <p>
            Most modern browsers also let you block third-party cookies entirely. We respect that signal — analytics and marketing won't fire if your browser is configured to block them.
          </p>
        </section>
      </article>
    </>
  )
}

export default NcrCookiePolicyPage
