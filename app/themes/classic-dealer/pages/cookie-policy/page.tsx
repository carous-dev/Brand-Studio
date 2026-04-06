import Link from 'next/link'
import type { ThemePageProps } from '../../../types'

export function ClassicCookiePolicyPage({ brand }: ThemePageProps) {
  return (
    <main className="policy-page">
      <div className="container" style={{ maxWidth: 900, paddingTop: 32, paddingBottom: 48 }}>
        <h1>Cookie Policy</h1>
        <p>
          This policy explains how {brand.name} uses cookies and similar technologies on this website.
        </p>

        <h2>Essential Cookies</h2>
        <p>These cookies are required for core functionality like navigation, security, and session continuity.</p>

        <h2>Analytics Cookies</h2>
        <p>These cookies help us understand usage trends and improve the user experience.</p>

        <h2>Managing Preferences</h2>
        <p>You can control cookies through your browser settings. Disabling essential cookies may affect functionality.</p>

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
          <Link href="/privacy-policy">Read Privacy Policy</Link>
        </p>
      </div>
    </main>
  )
}

export default ClassicCookiePolicyPage
