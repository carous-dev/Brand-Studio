import type { ThemePageProps } from '../../../types'

/**
 * SKELETON page — Phase 8 design responsibility.
 * Finance proposition + calculator (if archetype calls for one).
 */
export function WarwickFinancePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Warwick'
  return (
    <main className="warwick-page-stub" style={{ padding: '64px 24px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <h1>Finance</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 16 }}>
        Page under construction — designed fresh for {brandName} in Phase 8.
      </p>
    </main>
  )
}

export default WarwickFinancePage
