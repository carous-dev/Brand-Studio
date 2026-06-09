import type { ThemePageProps } from '../../../types'

/**
 * SKELETON page — Phase 8 design responsibility.
 * Standard cookie policy — list categories + consent management.
 */
export function WarwickCookiePolicyPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Warwick'
  return (
    <main className="warwick-page-stub" style={{ padding: '64px 24px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <h1>Cookie policy</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 16 }}>
        Page under construction — designed fresh for {brandName} in Phase 8.
      </p>
    </main>
  )
}

export default WarwickCookiePolicyPage
