import type { ThemePageProps } from '../../../types'

/**
 * SKELETON page — Phase 8 design responsibility.
 * Side-by-side comparison from useGarage().compareList.
 */
export function WarwickComparePage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Warwick'
  return (
    <main className="warwick-page-stub" style={{ padding: '64px 24px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <h1>Compare vehicles</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 16 }}>
        Page under construction — designed fresh for {brandName} in Phase 8.
      </p>
    </main>
  )
}

export default WarwickComparePage
