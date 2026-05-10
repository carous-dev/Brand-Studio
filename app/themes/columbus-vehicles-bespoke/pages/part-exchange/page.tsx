import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PartExchangeForm from '../../components/PartExchangeForm'
import styles from './page.module.css'

/**
 * Columbus Vehicles — Part exchange (rugged archetype)
 *
 * SERVER COMPONENT. The page wrapper is composition-only (PageHero + intro
 * copy + form mount). The form lives in `<PartExchangeForm>` as a client
 * island — that's where useLeadsForm + interactive state needs to be.
 *
 * Why split: turning the page itself into 'use client' caused a Turbopack
 * chunk-item key collision with springalls-classic's parallel
 * `pages/part-exchange/page.tsx` (also 'use client' at the same relative
 * path). Server-component pages avoid that whole class of caching issue
 * AND match the SKILL Quality Bar's "Server Components by default" rule.
 */
export function ColumbusPartExchangePage(_props: ThemePageProps) {
  return (
    <main>
      <PageHero
        eyebrow="Trade up"
        title="Part exchange your vehicle"
        lead="Trade in your current vehicle against any 4×4 from our stock. Honest valuation within the working day, no bait-and-switch on collection. Whether you're trading a 4×4, saloon, hatchback or van — we'll value it fairly."
        imageSlot="part-exchange"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <aside className={styles.aside}>
            <h2 className={styles.asideTitle}>How part exchange works</h2>
            <ul className={styles.asideList}>
              <li>Send registration + mileage + a few photos.</li>
              <li>Valuation back the same working day, valid for 14 days.</li>
              <li>We deduct the agreed value from the new 4×4&apos;s price — done.</li>
              <li>Outstanding finance settled directly with the lender.</li>
              <li>Collection or trade-in on your delivery day — no extra trips.</li>
            </ul>
          </aside>

          <PartExchangeForm />
        </div>
      </section>
    </main>
  )
}

export default ColumbusPartExchangePage
