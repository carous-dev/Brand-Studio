import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageBody from '../../components/PageBody'

export function ColumbusPrivacyPolicyPage({ brand }: ThemePageProps) {
  const dealerName = brand?.name || 'Columbus Vehicles'
  const email = (brand as any)?.location?.email || 'enquiries@columbusvehicles.uk'
  const updatedAt = '2026-05-10'

  return (
    <main>
      <PageHero
        eyebrow="Legal"
        title="Privacy policy"
        lead={`How ${dealerName} collects, uses, and protects your personal information under UK GDPR.`}
        imageSlot="hero"
      />
      <PageBody narrow>
        <p>Last updated: {updatedAt}</p>

        <h2>Who we are</h2>
        <p>
          {dealerName} is the data controller for any personal data you
          provide via this website, by phone, or in person at our showroom.
          Contact our data protection lead at <a href={`mailto:${email}`}>{email}</a>.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>Contact details (name, email, phone) when you submit an enquiry, valuation request, or finance application.</li>
          <li>Vehicle interest data (which 4×4s you viewed or saved).</li>
          <li>Identification documents required by lenders during finance underwriting.</li>
          <li>Anonymous analytics on how visitors use the site (page views, referrer, broad geography).</li>
        </ul>

        <h2>Why we use it</h2>
        <ul>
          <li>To respond to your enquiries and arrange viewings, finance, or valuations.</li>
          <li>To process and fulfil sales, including liaising with lenders and delivery partners.</li>
          <li>To meet legal obligations (tax records, anti-money-laundering, distance selling rules).</li>
          <li>With your consent, to send occasional updates about new stock that matches your interest.</li>
        </ul>

        <h2>Who we share it with</h2>
        <p>
          We share data only when necessary to deliver the service: finance lenders
          handling your application, our covered-transport delivery partner, and
          warranty providers. We never sell your data to third parties for marketing.
        </p>

        <h2>Your rights</h2>
        <p>
          Under UK GDPR you have the right to access, correct, or delete the
          personal data we hold about you, and to object to or restrict
          certain types of processing. Email <a href={`mailto:${email}`}>{email}</a> to exercise
          any of these rights and we&apos;ll respond within one calendar month.
        </p>

        <h2>How long we keep it</h2>
        <p>
          Enquiry data: 24 months from last contact. Sale records: 6 years for tax
          purposes. Marketing consent: until you withdraw it (one click in any email).
        </p>

        <h2>Complaints</h2>
        <p>
          If you&apos;re unhappy with how we&apos;ve handled your data, contact us
          first — we&apos;ll try to resolve it. You also have the right to complain
          to the UK Information Commissioner&apos;s Office at <a href="https://ico.org.uk" target="_blank" rel="noreferrer">ico.org.uk</a>.
        </p>
      </PageBody>
    </main>
  )
}

export default ColumbusPrivacyPolicyPage
