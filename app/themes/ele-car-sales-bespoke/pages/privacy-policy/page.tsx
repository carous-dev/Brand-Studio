import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import styles from './page.module.css'

export function ElePrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'ELE Car Sales'
  return (
    <main>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        lead={`How ${brandName} handles your personal information under UK GDPR.`}
        imageSlot="hero"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <article className={styles.prose}>
            <h2>Who we are</h2>
            <p>
              {brandName} is a used-car dealership based in Shotts, Lanarkshire.
              For any data-protection enquiry, contact us via the address or
              email shown on our <a href="/contact">contact page</a>.
            </p>

            <h2>What we collect</h2>
            <ul>
              <li>Information you provide when submitting an enquiry, finance application, or part-exchange request (name, contact details, vehicle details).</li>
              <li>Information collected automatically when you visit the site (IP address, browser type, pages viewed), used for security and analytics.</li>
              <li>Vehicle history or finance information shared during a finance application, which we forward only to FCA-approved lenders you ask us to apply to.</li>
            </ul>

            <h2>How we use it</h2>
            <ul>
              <li>To respond to your enquiry and arrange viewings, finance, part-exchange, or delivery.</li>
              <li>To meet our regulatory obligations (anti-money-laundering checks, finance broking records).</li>
              <li>To send you information about cars or offers if you&apos;ve opted in. You can withdraw consent at any time.</li>
            </ul>

            <h2>Your rights</h2>
            <p>
              Under UK GDPR you have the right to access, correct, or delete the
              personal data we hold about you, restrict our processing of it, or
              object to it. To exercise any of these rights, email us — we&apos;ll
              respond within one month.
            </p>
            <p>
              You also have the right to complain to the{' '}
              <a href="https://ico.org.uk/" target="_blank" rel="noreferrer">
                Information Commissioner&apos;s Office (ICO)
              </a>{' '}if you&apos;re unhappy with how we&apos;ve handled your data.
            </p>

            <h2>Cookies</h2>
            <p>
              For details on the cookies this site uses and how to manage them,
              see our <a href="/cookie-policy">cookie policy</a>.
            </p>

            <h2>Changes to this policy</h2>
            <p>
              This policy is reviewed periodically. The current version applies
              from the date of your visit.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}

export default ElePrivacyPolicyPage
