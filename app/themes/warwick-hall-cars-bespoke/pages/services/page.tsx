import type { ThemePageProps } from '../../../types'

/**
 * SKELETON page — Phase 8 design responsibility.
 * Detailed services per brand.services. Use --brand-image-services.
 */
export function WarwickServicesPage({ brand }: ThemePageProps) {
  const brandName = brand?.name || 'Warwick'
  return (
    <main className="warwick-page-stub" style={{ padding: '64px 24px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <h1>Services</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 16 }}>
        Page under construction — designed fresh for {brandName} in Phase 8.
      </p>
    </main>
  )
}

export default WarwickServicesPage
