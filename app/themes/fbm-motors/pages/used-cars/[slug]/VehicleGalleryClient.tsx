'use client'

import { useState } from 'react'

export default function VehicleGalleryClient({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0)
  if (images.length === 0) return null

  const heroImg = images[active] || images[0]

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div
        className="fbm-card"
        style={{ overflow: 'hidden', borderRadius: '24px', aspectRatio: '16/10' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImg} alt={title} width={1280} height={800} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {images.length > 1 && (
        <div
          style={{
            display: 'grid',
            gap: '8px',
            gridTemplateColumns: `repeat(${Math.min(images.length, 6)}, 1fr)`,
          }}
        >
          {images.slice(0, 6).map((src, i) => (
            <button
              type="button"
              key={`${src}-${i}`}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              style={{
                padding: 0,
                border: i === active ? '2px solid var(--fbm-ember-500, var(--color-primary))' : '1px solid rgba(14,20,32,0.06)',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#ffffff',
                aspectRatio: '16/10',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" width={200} height={125} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
