import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageBody from '../../components/PageBody'

export function ColumbusCookiePolicyPage({ brand }: ThemePageProps) {
  const dealerName = brand?.name || 'Columbus Vehicles'
  const updatedAt = '2026-05-10'

  return (
    <main>
      <PageHero
        eyebrow="Legal"
        title="Cookie policy"
        lead={`How ${dealerName} uses cookies and how you can control your preferences.`}
        imageSlot="hero"
      />
      <PageBody narrow>
        <p>Last updated: {updatedAt}</p>

        <h2>What are cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you visit a
          website. They&apos;re used to remember things like your preferences and
          help us understand how the site is used. We only use cookies that are
          either strictly necessary or that you&apos;ve consented to via the
          banner shown on first visit.
        </p>

        <h2>Categories we use</h2>
        <h3>Strictly necessary</h3>
        <p>
          Required for basic site functionality — remembering items you&apos;ve
          added to your wishlist or compare list, and routing your request to
          the correct dealer brand. These cannot be disabled.
        </p>

        <h3>Analytics (optional)</h3>
        <p>
          Anonymous, aggregated data about how visitors use the site (most-viewed
          vehicles, common search filters, where visitors land first). Helps us
          stock the kinds of 4×4s our customers actually want. Disabled until you opt in.
        </p>

        <h3>Marketing (optional)</h3>
        <p>
          If you opt in, we may use cookies to show relevant 4×4 ads on other
          websites you visit. We don&apos;t sell your data — these cookies just
          help us reach buyers genuinely interested in 4×4s. Easy to turn off.
        </p>

        <h2>Manage your preferences</h2>
        <p>
          You can change your cookie preferences at any time by clearing the
          cookie banner choice (clearing site data in your browser will reset it).
          Most browsers also let you block or delete cookies in their privacy
          settings — see <a href="https://www.aboutcookies.org" target="_blank" rel="noreferrer">aboutcookies.org</a> for guidance per browser.
        </p>

        <h2>Third-party services</h2>
        <p>
          We use a small set of third-party services (mapping for our showroom
          location, analytics, finance lender APIs) that may set their own
          cookies when you interact with them. Each is governed by its
          provider&apos;s privacy policy.
        </p>

        <h2>Questions?</h2>
        <p>
          Get in touch via the <a href="/contact">contact page</a> or see our
          full <a href="/privacy-policy">privacy policy</a> for how we handle personal data.
        </p>
      </PageBody>
    </main>
  )
}

export default ColumbusCookiePolicyPage
