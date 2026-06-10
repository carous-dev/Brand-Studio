import { PageHero } from '../../components/PageHero'
import type { ThemePageProps } from '../../../types'

export function FbmPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'the showroom'

  return (
    <>
      <PageHero
        title="Privacy policy"
        lead={`How ${brandName} collects, uses, and protects your information.`}
      />
      <section
        style={{
          maxWidth: '768px',
          margin: '0 auto',
          padding: '56px 24px',
          fontSize: '0.9375rem',
          lineHeight: 1.7,
          color: 'var(--fbm-ink-700)',
        }}
      >
        <p>
          This privacy policy explains how {brandName} (&quot;we&quot;) handles personal data collected through this
          website, our showroom enquiries, and our finance and after-sales services. We are committed to handling
          your information transparently and in line with UK GDPR.
        </p>
        <h2 style={{ marginTop: '32px', fontSize: '1.25rem', fontWeight: 700 }}>What we collect</h2>
        <p>
          When you contact us, request a valuation, or apply for finance we may collect your name, email, phone
          number, vehicle details, and information needed for a credit check. We only collect what we need to
          respond to your request.
        </p>
        <h2 style={{ marginTop: '32px', fontSize: '1.25rem', fontWeight: 700 }}>How we use it</h2>
        <p>
          We use your information to respond to enquiries, arrange test drives, prepare finance proposals, and
          keep you informed about your purchase. We never sell your data. With your consent we may share your
          details with reputable lenders to obtain finance quotations.
        </p>
        <h2 style={{ marginTop: '32px', fontSize: '1.25rem', fontWeight: 700 }}>Your rights</h2>
        <p>
          You can ask us to confirm what data we hold, correct or delete it, or withdraw consent at any time.
          Contact us via the details on our Contact page to exercise these rights.
        </p>
      </section>
    </>
  )
}

export default FbmPrivacyPolicyPage
