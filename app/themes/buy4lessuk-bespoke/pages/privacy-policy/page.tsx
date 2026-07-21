import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageShell from '../../components/PageShell'
import styles from './page.module.css'

export function Buy4lessukPrivacyPolicyPage({ brand }: ThemePageProps) {
  const name = (brand?.name || 'Buy4Less UK').trim()
  const email = String((brand as any)?.location?.email || '').trim()
  return (
    <>
      <PageHero title="Privacy policy" eyebrow="How we handle your data" slot="about" />
      <PageShell narrow>
        <article className={styles.article}>
          <p>
            {name} ("we", "us") respects your privacy and is committed to protecting your
            personal data in line with the UK GDPR and the Data Protection Act 2018.
          </p>

          <h2>What we collect</h2>
          <p>
            When you contact us, request a valuation, apply for finance or save vehicles to a
            shortlist, we collect your name, contact details, vehicle of interest and any other
            information you choose to share. Browsing the site sets standard analytics cookies
            (see our Cookie policy).
          </p>

          <h2>How we use it</h2>
          <ul>
            <li>Responding to enquiries about stock, finance, valuations and aftersales.</li>
            <li>Sending agreed marketing or service updates.</li>
            <li>Meeting our legal and FCA obligations.</li>
          </ul>

          <h2>Sharing</h2>
          <p>
            We never sell your data. We share it only with approved finance partners when you
            apply for finance, our hosting and email providers, and authorities where required.
          </p>

          <h2>Your rights</h2>
          <p>
            You can ask us to access, correct or delete your data at any time. Contact{' '}
            {email ? <a href={`mailto:${email}`}>{email}</a> : 'us'} and we'll respond within 30 days.
            You can also complain to the Information Commissioner's Office (ico.org.uk).
          </p>

          <p className={styles.updated}>Last updated: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </article>
      </PageShell>
    </>
  )
}

export default Buy4lessukPrivacyPolicyPage
