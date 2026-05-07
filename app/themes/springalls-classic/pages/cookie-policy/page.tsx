import type { ThemePageProps } from '../../../types'

export function SpringallsCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'we'
  return (
    <section className="springalls-section" style={{ background: 'var(--color-surface)' }}>
      <div className="sps-section-container" style={{ maxWidth: 820 }}>
        <h1 className="sps-section-title">Cookie policy</h1>
        <p style={{ color: 'var(--color-muted)', lineHeight: 1.7, marginTop: 8 }}>
          {brandName === 'we' ? 'We use cookies' : `${brandName} uses cookies`} to make this site work and to understand how
          visitors use it. You can update your cookie preferences from the cookie banner at any time.
        </p>
        <h2 style={{ marginTop: 28 }}>Essential cookies</h2>
        <p style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}>
          These cookies are required for core site features: the wishlist, comparison, and cookie consent itself. They cannot
          be turned off.
        </p>
        <h2 style={{ marginTop: 24 }}>Analytics cookies</h2>
        <p style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}>
          Help us understand how the site is used so we can improve it. Optional — opt in via the cookie banner.
        </p>
        <h2 style={{ marginTop: 24 }}>Marketing cookies</h2>
        <p style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}>
          Used by some advertising platforms to measure campaign effectiveness. Optional — opt in via the cookie banner.
        </p>
      </div>
    </section>
  )
}

export default SpringallsCookiePolicyPage
