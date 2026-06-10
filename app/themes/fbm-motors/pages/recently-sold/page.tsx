import Link from 'next/link'
import { PageHero } from '../../components/PageHero'
import { SectionHeading } from '../../components/SectionHeading'
import type { ThemePageProps } from '../../../types'

export function FbmRecentlySoldPage({ brand, initialInventory = [] }: ThemePageProps) {
  return (
    <>
      <PageHero
        image={brand.images?.recentlySold || brand.heroImage}
        title="Recently sold"
        lead="A snapshot of vehicles that have recently found new homes. Stock turns over weekly — fresh cars land on the forecourt all the time."
      />
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px' }}>
        {initialInventory.length === 0 ? (
          <div className="fbm-card" style={{ padding: '56px', textAlign: 'center' }}>
            <SectionHeading
              title="No recently-sold cars to show yet"
              lead="As soon as a vehicle changes hands it'll appear here. In the meantime, browse our live stock."
            />
            <Link href="/used-cars" className="fbm-btn-primary" style={{ marginTop: '32px' }}>
              View live stock →
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gap: '24px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            }}
          >
            {initialInventory.map((v: any, i: number) => (
              <article key={v?.id || i} className="fbm-card" style={{ overflow: 'hidden' }}>
                {v?.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.image}
                    alt={v?.title || ''}
                    width={400}
                    height={250}
                    style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', filter: 'grayscale(1)' }}
                  />
                )}
                <div style={{ padding: '20px' }}>
                  <h3 style={{ fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)", fontWeight: 600, fontSize: '0.95rem' }}>
                    {v?.title || `${v?.make || ''} ${v?.model || ''}`}
                  </h3>
                  <p style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--fbm-ink-500)' }}>
                    SOLD · {v?.year || ''}{v?.mileage ? ` · ${Number(v.mileage).toLocaleString()} mi` : ''}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default FbmRecentlySoldPage
