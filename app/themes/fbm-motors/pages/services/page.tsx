import Link from 'next/link'
import { PageHero } from '../../components/PageHero'
import { SectionHeading } from '../../components/SectionHeading'
import type { ThemePageProps } from '../../../types'

const defaultServices = [
  { title: 'Quality used cars', description: 'Hand-picked stock, prepped and HPI-checked before listing.' },
  { title: 'Part exchange', description: 'Fair valuations on any condition — we handle the paperwork.' },
  { title: 'Finance', description: 'Competitive rates from reputable lenders matched to your budget.' },
  { title: 'Warranty + breakdown', description: 'Every car ships with a 3-month warranty and 12 months of AA cover.' },
]

export function FbmServicesPage({ brand }: ThemePageProps) {
  const items = Array.isArray(brand.services)
    ? (brand.services as any[])
    : Array.isArray((brand.services as any)?.items)
      ? ((brand.services as any).items as any[])
      : defaultServices

  return (
    <>
      <PageHero
        image={brand.images?.services || brand.heroImage}
        title={`Services at ${brand.name || 'our showroom'}`}
        lead="Everything you need under one roof — buying, selling, financing, and aftersales support."
      />
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px' }}>
        <SectionHeading eyebrow="What we offer" title="Our services" />
        <div
          style={{
            marginTop: '40px',
            display: 'grid',
            gap: '24px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          {items.map((s: any, i: number) => (
            <article key={s?.title || i} className="fbm-card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)", fontWeight: 600 }}>
                {s?.title || 'Service'}
              </h3>
              <p style={{ marginTop: '12px', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--fbm-ink-500)' }}>
                {s?.description || ''}
              </p>
            </article>
          ))}
        </div>
        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <Link href="/contact" className="fbm-btn-primary">Talk to us →</Link>
        </div>
      </section>
    </>
  )
}

export default FbmServicesPage
