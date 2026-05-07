import type { ThemePageProps } from '../../../types'

export function SpringallsPrivacyPolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'us'
  const email = brand?.location?.email
  return (
    <section className="springalls-section" style={{ background: 'var(--color-surface)' }}>
      <div className="sps-section-container" style={{ maxWidth: 820 }}>
        <h1 className="sps-section-title">Privacy policy</h1>
        <p style={{ color: 'var(--color-muted)', lineHeight: 1.7, marginTop: 8 }}>
          {brandName} respects your privacy. This page explains how we collect and use the personal information you share with us
          — for example when you enquire about a vehicle, request a valuation, or sign up for our newsletter.
        </p>
        <h2 style={{ marginTop: 28 }}>Information we collect</h2>
        <p style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}>
          We collect contact details (name, email, phone), enquiry information about specific vehicles, and analytics data
          (anonymous traffic patterns) to improve the site.
        </p>
        <h2 style={{ marginTop: 24 }}>How we use it</h2>
        <p style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}>
          To respond to your enquiry, send vehicle alerts you've opted into, and improve our services. We do not sell
          personal data.
        </p>
        <h2 style={{ marginTop: 24 }}>Your rights</h2>
        <p style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}>
          You can request access, correction, or deletion of your data at any time
          {email ? <> by emailing <a href={`mailto:${email}`}>{email}</a></> : null}.
        </p>
      </div>
    </section>
  )
}

export default SpringallsPrivacyPolicyPage
