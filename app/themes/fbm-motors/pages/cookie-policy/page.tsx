import { PageHero } from '../../components/PageHero'
import type { ThemePageProps } from '../../../types'

export function FbmCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'the showroom'

  return (
    <>
      <PageHero
        title="Cookie policy"
        lead={`How ${brandName} uses cookies and similar technologies.`}
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
          This site uses cookies to keep the experience smooth — remembering your wishlist, comparing cars across
          pages, and helping us understand how visitors use the site so we can improve it.
        </p>
        <h2 style={{ marginTop: '32px', fontSize: '1.25rem', fontWeight: 700 }}>Categories</h2>
        <ul style={{ marginTop: '16px', paddingLeft: '24px', display: 'grid', gap: '12px' }}>
          <li>
            <strong>Strictly necessary</strong> — required for the site to function (e.g. remembering you accepted
            the cookie banner). Always on.
          </li>
          <li>
            <strong>Functional</strong> — remembers your wishlist and compare list locally so they survive between
            pages.
          </li>
          <li>
            <strong>Analytics</strong> — aggregate stats about how visitors use the site. We don&apos;t use these to
            identify individual users.
          </li>
        </ul>
        <h2 style={{ marginTop: '32px', fontSize: '1.25rem', fontWeight: 700 }}>Managing cookies</h2>
        <p>
          You can clear cookies at any time from your browser settings. Doing so will clear your saved wishlist
          and compare list on this site.
        </p>
      </section>
    </>
  )
}

export default FbmCookiePolicyPage
