import Link from 'next/link'
import type { ThemePageProps } from '../../../types'

function fmtPrice(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `£${n.toLocaleString('en-GB')}`
}

export function SpringallsRecentlySoldPage({ initialInventory, brand }: ThemePageProps) {
  const items = Array.isArray(initialInventory) ? initialInventory : []
  return (
    <section className="springalls-section">
      <div className="sps-section-container">
        <header className="sps-section-header">
          <h1 className="sps-section-title">Recently sold</h1>
          <p className="sps-section-subtitle">A glimpse of cars that have recently found new homes from {brand?.name || 'us'}.</p>
        </header>

        {items.length === 0 && <p className="sps-section-empty">Sold vehicle history will appear here as listings are retired.</p>}

        {items.length > 0 && (
          <ul className="sps-vehicle-grid">
            {items.map((v: any, idx: number) => {
              const title = [v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle'
              const img = (v.images && v.images[0]) || v.image || ''
              return (
                <li key={idx} className="sps-vehicle-card">
                  <div className="sps-vehicle-card-link" style={{ cursor: 'default' }}>
                    <div className="sps-vehicle-card-media">
                      {img ? <img src={img} alt={title} /> : <div className="sps-vehicle-card-placeholder" />}
                    </div>
                    <div className="sps-vehicle-card-body">
                      <p className="sps-vehicle-card-title">{title}</p>
                      <p className="sps-vehicle-card-price">{fmtPrice(v.price)}</p>
                      <p className="sps-vehicle-card-meta" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                        Sold
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/used-cars" className="springalls-cta-link">
            See current stock
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SpringallsRecentlySoldPage
