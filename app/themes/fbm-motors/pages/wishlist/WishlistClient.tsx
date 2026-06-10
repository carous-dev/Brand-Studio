'use client'

import Link from 'next/link'
import { useGarage } from '../../context/GarageContext'

export default function WishlistClient() {
  const { wishlist } = useGarage()

  if (wishlist.length === 0) {
    return (
      <div className="fbm-card" style={{ padding: '56px', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)",
            fontSize: '1.125rem',
            fontWeight: 600,
          }}
        >
          No saved cars yet
        </p>
        <p style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--fbm-ink-500)' }}>
          Tap the heart icon on any vehicle card to add it here.
        </p>
        <Link href="/used-cars" className="fbm-btn-primary" style={{ marginTop: '32px' }}>
          Browse used cars →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
      {wishlist.map((v) => (
        <article key={v.id} className="fbm-card" style={{ overflow: 'hidden' }}>
          {v.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.image} alt={v.title} width={400} height={250} style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />
          )}
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)", fontWeight: 600, fontSize: '0.95rem' }}>
              {v.title}
            </h3>
            <p style={{ marginTop: '8px', fontSize: '0.875rem', color: 'var(--fbm-ember-600, var(--color-primary))', fontWeight: 600 }}>
              £{Number(v.price).toLocaleString()}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
