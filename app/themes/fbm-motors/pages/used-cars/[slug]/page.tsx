import Link from 'next/link'
import { getBrandContactInfo } from '../../../lib/contact'
import { PageHero } from '../../../components/PageHero'
import VehicleGalleryClient from './VehicleGalleryClient'
import type { ThemePageProps } from '../../../../types'

function fmtPrice(n: unknown): string {
  const v = Number(n)
  if (!Number.isFinite(v) || v <= 0) return '£POA'
  return `£${v.toLocaleString('en-GB')}`
}

function fmtMileage(n: unknown): string {
  const v = Number(n)
  if (!Number.isFinite(v) || v <= 0) return '—'
  return `${v.toLocaleString('en-GB')} mi`
}

/**
 * Vehicle detail page — gallery + key facts + enquiry CTA. The page is a
 * Server Component; the gallery thumbnail picker is delegated to a client
 * island. The page-runtime pre-fetches the vehicle + similar list and walks
 * every payload path for gallery extraction (per the gallery-extraction
 * feedback memory).
 */
export function FbmVehicleDetailPage({ brand, vehicle, images = [], similarList = [] }: ThemePageProps) {
  const contact = getBrandContactInfo(brand)

  if (!vehicle) {
    return (
      <>
        <PageHero title="Vehicle not found" lead="That listing may have sold. Browse current stock below." />
        <section style={{ maxWidth: '768px', margin: '0 auto', padding: '56px 24px', textAlign: 'center' }}>
          <Link href="/used-cars" className="fbm-btn-primary">View live stock →</Link>
        </section>
      </>
    )
  }

  const title =
    [vehicle.year, vehicle.make, vehicle.model, vehicle.derivative].filter(Boolean).join(' ') ||
    vehicle.title ||
    'Vehicle'
  const gallery = images.length > 0 ? images : vehicle.image ? [vehicle.image] : []

  return (
    <>
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '40px 24px 0',
        }}
      >
        <Link
          href="/used-cars"
          style={{ fontSize: '0.875rem', color: 'var(--fbm-ink-500)', textDecoration: 'none' }}
        >
          ← All stock
        </Link>
        <h1
          style={{
            marginTop: '12px',
            fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)",
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            fontWeight: 700,
            textWrap: 'balance',
          }}
        >
          {title}
        </h1>
      </section>

      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '32px 24px',
          display: 'grid',
          gap: '32px',
        }}
      >
        {gallery.length > 0 && <VehicleGalleryClient images={gallery} title={title} />}

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
          <article>
            <h2 style={{ fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)", fontSize: '1.25rem', fontWeight: 700 }}>
              About this vehicle
            </h2>
            <p style={{ marginTop: '16px', fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--fbm-ink-700)' }}>
              {vehicle.description || vehicle.shortDescription || 'Inspected, history-checked, and ready to drive away. Includes a free 3-month warranty plus 12 months of AA Breakdown Cover.'}
            </p>

            <dl
              style={{
                marginTop: '32px',
                display: 'grid',
                gap: '16px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              }}
            >
              {([
                ['Year', vehicle.year],
                ['Mileage', fmtMileage(vehicle.mileage)],
                ['Fuel', vehicle.fuel],
                ['Transmission', vehicle.trans || vehicle.transmission],
                ['Body', vehicle.body],
                ['Colour', vehicle.color || vehicle.colour],
              ] as Array<[string, unknown]>).map(([k, v]) => (
                <div key={k} className="fbm-card" style={{ padding: '16px' }}>
                  <dt style={{ fontSize: '0.75rem', color: 'var(--fbm-ink-500)' }}>{k}</dt>
                  <dd style={{ marginTop: '4px', fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)", fontWeight: 600 }}>
                    {v ? String(v) : '—'}
                  </dd>
                </div>
              ))}
            </dl>
          </article>

          <aside
            className="fbm-card"
            style={{
              padding: '28px',
              position: 'sticky',
              top: '120px',
              alignSelf: 'start',
              display: 'grid',
              gap: '16px',
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)",
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--fbm-ink-900)',
              }}
            >
              {fmtPrice(vehicle.price)}
            </p>
            <Link href="/contact" className="fbm-btn-primary" style={{ width: '100%' }}>
              Enquire about this car
            </Link>
            {contact.phoneDisplay && (
              <a href={`tel:${contact.phoneTel || contact.phoneDisplay}`} className="fbm-btn-ghost" style={{ width: '100%' }}>
                Call {contact.phoneDisplay}
              </a>
            )}
          </aside>
        </div>

        {similarList.length > 0 && (
          <div>
            <h2 style={{ fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)", fontSize: '1.25rem', fontWeight: 700 }}>
              Similar vehicles
            </h2>
            <div
              style={{
                marginTop: '24px',
                display: 'grid',
                gap: '16px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              }}
            >
              {similarList.slice(0, 6).map((s: any, i: number) => (
                <article key={s?.id || i} className="fbm-card" style={{ overflow: 'hidden' }}>
                  {s?.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.image} alt={s?.title || ''} width={400} height={250} style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '16px' }}>
                    <p style={{ fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)", fontWeight: 600, fontSize: '0.875rem' }}>
                      {s?.title || `${s?.make || ''} ${s?.model || ''}`.trim()}
                    </p>
                    <p style={{ marginTop: '4px', fontSize: '0.875rem', color: 'var(--fbm-ember-600, var(--color-primary))', fontWeight: 600 }}>
                      {fmtPrice(s?.price)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}

export default FbmVehicleDetailPage
