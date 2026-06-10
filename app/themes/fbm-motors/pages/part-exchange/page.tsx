import Link from 'next/link'
import { PageHero } from '../../components/PageHero'
import { SectionHeading } from '../../components/SectionHeading'
import type { ThemePageProps } from '../../../types'

const steps: Array<[string, string]> = [
  ['Tell us about your car', 'Registration, mileage, and a few details about its condition.'],
  ['Bring it in for a check', 'We inspect it, run the HPI check, and confirm the valuation in person.'],
  ['Drive away in your next car', 'Settle the difference — we handle the paperwork from there.'],
]

export function FbmPartExchangePage({ brand }: ThemePageProps) {
  return (
    <>
      <PageHero
        image={brand.images?.partExchange || brand.heroImage}
        title="Part exchange"
        lead="Trade your current car against any vehicle on the forecourt. Fair valuations, transparent paperwork, and same-day completion."
      />
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '56px 24px' }}>
        <SectionHeading eyebrow="How it works" title="Three steps to a swap" />
        <ol
          style={{
            listStyle: 'none',
            margin: '40px 0 0',
            padding: 0,
            display: 'grid',
            gap: '20px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          }}
        >
          {steps.map(([t, b], i) => (
            <li key={t} className="fbm-card" style={{ padding: '28px' }}>
              <span style={{ fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)", fontWeight: 700, color: 'var(--fbm-ember-400, var(--color-accent))' }}>
                0{i + 1}
              </span>
              <h3 style={{ marginTop: '12px', fontFamily: "var(--font-brand-family-override, 'Space Grotesk', sans-serif)", fontWeight: 600 }}>
                {t}
              </h3>
              <p style={{ marginTop: '8px', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--fbm-ink-500)' }}>{b}</p>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <Link href="/sell-my-car" className="fbm-btn-primary">Start your valuation →</Link>
        </div>
      </section>
    </>
  )
}

export default FbmPartExchangePage
