import Link from 'next/link'
import type { ThemePageProps } from '../../../types'

export function ClassicPrivacyPolicyPage({ brand }: ThemePageProps) {
  return (
    <main className="policy-page">
      <div className="container" style={{ maxWidth: 900, paddingTop: 32, paddingBottom: 48 }}>
        <h1>Privacy Policy</h1>
        <p>
          {brand.name} is committed to protecting your personal data and processing it lawfully, fairly, and
          transparently.
        </p>

        <h2>What We Collect</h2>
        <p>
          We may collect contact details, enquiry information, and website usage data when you interact with our
          services.
        </p>

        <h2>How We Use Data</h2>
        <p>
          We use data to respond to enquiries, provide services, improve website performance, and comply with legal
          obligations.
        </p>

        <h2>Your Rights</h2>
        <p>
          You can request access, correction, deletion, or restriction of your personal data at any time by contacting
          us.
        </p>

        <h2>Contact</h2>
        <p>
          {brand.location?.email ? (
            <>
              Email: <a href={`mailto:${brand.location.email}`}>{brand.location.email}</a>
            </>
          ) : (
            'Contact details are available on our contact page.'
          )}
        </p>

        <p style={{ marginTop: 24 }}>
          <Link href="/cookie-policy">Read Cookie Policy</Link>
        </p>
      </div>
    </main>
  )
}

export default ClassicPrivacyPolicyPage
