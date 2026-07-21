import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageShell from '../../components/PageShell'
import CookieManageButton from './CookieManageButton'
import styles from './page.module.css'

const CATEGORIES = [
  {
    title: 'Strictly necessary',
    body: 'Required to make the site work — cookies that remember your consent choices, save your shortlist and let the contact form submit.',
  },
  {
    title: 'Performance and analytics',
    body: 'Help us understand how the site is used so we can improve it. We aggregate this data — it never identifies you personally.',
  },
  {
    title: 'Marketing',
    body: 'Used by ads and remarketing platforms to show you relevant car content on other sites. Set only with your consent.',
  },
]

export function Buy4lessukCookiePolicyPage({ brand }: ThemePageProps) {
  const name = (brand?.name || 'Buy4Less UK').trim()
  return (
    <>
      <PageHero title="Cookie policy" eyebrow="What we set and why" slot="about" />
      <PageShell narrow>
        <article className={styles.article}>
          <p>
            {name} uses cookies and similar technologies to make the site work, to remember your
            preferences, and to understand how visitors use the site so we can keep improving it.
          </p>

          <ul className={styles.categories}>
            {CATEGORIES.map((c) => (
              <li key={c.title}>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </li>
            ))}
          </ul>

          <h2>Managing your choices</h2>
          <p>
            You can change your consent at any time using the link below or via your browser's
            cookie controls. Blocking strictly necessary cookies may prevent parts of the site
            from working.
          </p>

          <p>
            <CookieManageButton />
          </p>

          <p className={styles.updated}>
            Last updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </article>
      </PageShell>
    </>
  )
}

export default Buy4lessukCookiePolicyPage
