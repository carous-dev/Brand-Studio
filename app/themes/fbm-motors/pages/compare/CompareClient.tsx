'use client'

import Link from 'next/link'
import { useGarage } from '../../context/GarageContext'

export default function CompareClient() {
  const { compare } = useGarage()

  if (compare.length === 0) {
    return (
      <div className="fbm-card" style={{ padding: '56px', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)",
            fontSize: '1.125rem',
            fontWeight: 600,
          }}
        >
          Your compare list is empty
        </p>
        <p style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--fbm-ink-500)' }}>
          Tap the compare icon on any vehicle card to start building your list.
        </p>
        <Link href="/used-cars" className="fbm-btn-primary" style={{ marginTop: '32px' }}>
          Browse used cars →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
      {compare.map((v) => (
        <article key={v.id} className="fbm-card" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)", fontWeight: 600 }}>
            {v.title}
          </h3>
          <dl style={{ marginTop: '16px', display: 'grid', gap: '8px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ color: 'var(--fbm-ink-500)' }}>Price</dt>
              <dd style={{ fontWeight: 600 }}>£{Number(v.price).toLocaleString()}</dd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ color: 'var(--fbm-ink-500)' }}>Year</dt>
              <dd style={{ fontWeight: 600 }}>{v.year}</dd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ color: 'var(--fbm-ink-500)' }}>Mileage</dt>
              <dd style={{ fontWeight: 600 }}>{Number(v.mileage).toLocaleString()} mi</dd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ color: 'var(--fbm-ink-500)' }}>Fuel</dt>
              <dd style={{ fontWeight: 600 }}>{v.fuel}</dd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <dt style={{ color: 'var(--fbm-ink-500)' }}>Transmission</dt>
              <dd style={{ fontWeight: 600 }}>{v.transmission}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  )
}
