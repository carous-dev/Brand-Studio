import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageBody from '../../components/PageBody'

/**
 * Columbus Vehicles — Finance page (rugged archetype)
 * Finance proposition with the dealer-signage-direct voice. Links into
 * /contact for a soft-search application; the actual finance application
 * flow lives outside this page (lender API integration).
 */
export function ColumbusFinancePage({ brand: _brand }: ThemePageProps) {
  return (
    <main>
      <PageHero
        eyebrow="Get on the road"
        title="Finance built for 4×4 buyers"
        lead="Access to 15+ specialist lenders, soft-search applications that don't impact your credit, and full agreement in principle within an hour. No pushy sales — just numbers that work for your situation."
        imageSlot="finance"
      >
        <Link
          href="/contact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0 24px',
            height: 52,
            background: 'var(--color-accent)',
            color: '#0a0e14',
            borderRadius: 4,
            fontFamily: "'Oswald', sans-serif",
            fontWeight: 700,
            letterSpacing: '0.06em',
            fontSize: '0.95rem',
            textTransform: 'uppercase',
            textDecoration: 'none',
          }}
        >
          Apply for finance
        </Link>
      </PageHero>
      <PageBody>
        <h2>How it works</h2>
        <ol>
          <li>Tell us about the 4×4 you&apos;re looking at and your situation. We&apos;ll soft-search across our lender panel — no impact on your credit.</li>
          <li>Within an hour you have a tailored agreement in principle, with monthly payment options laid out clearly.</li>
          <li>Sign electronically when you&apos;re ready. Funds release directly to us; vehicle dispatched on a covered transporter or ready for collection.</li>
        </ol>

        <h2>Mixed credit? We can still help.</h2>
        <p>
          We have specialist lenders for almost every situation: thin-file
          credit, previous defaults, recent CCJs, self-employed buyers
          without two years&apos; accounts, or just buyers who&apos;ve had a
          difficult few years. The only way to know what&apos;s achievable is
          to ask — most of our successful applications come from people who
          assumed they&apos;d be turned down elsewhere.
        </p>

        <h2>Representative example</h2>
        <p style={{ background: 'var(--color-surface)', padding: '20px 24px', borderLeft: '4px solid var(--color-accent)' }}>
          A typical hire-purchase agreement on a £25,000 4×4 with a 10%
          deposit (£2,500) over 60 months at 9.9% APR Representative would
          have monthly payments of approximately £476.
          Total amount payable: ~£31,060. Subject to status. Figures are
          indicative and will vary by lender, term, deposit and individual
          circumstances.
        </p>

        <h2>Ready to start?</h2>
        <p>
          Apply via the <Link href="/contact">contact form</Link> with the
          vehicle you&apos;re interested in (or a budget range if you&apos;re
          still browsing). We&apos;ll come back to you the same working day.
        </p>
      </PageBody>
    </main>
  )
}

export default ColumbusFinancePage
