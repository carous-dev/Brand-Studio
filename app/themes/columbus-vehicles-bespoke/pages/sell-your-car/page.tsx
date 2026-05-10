import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import SellYourCarForm from '../../components/SellYourCarForm'
import styles from './page.module.css'

/**
 * Columbus Vehicles — Sell your 4×4 (rugged archetype)
 *
 * SERVER COMPONENT. Composition + intro + form mount. Form is a
 * client island (`<SellYourCarForm>`) — same pattern as part-exchange.
 */
export function ColumbusSellYourCarPage(_props: ThemePageProps) {
  return (
    <main>
      <PageHero
        eyebrow="Get a valuation"
        title="Sell your 4×4 to specialists"
        lead="Send us the registration and a few details — we'll come back with a firm valuation within the working day. Whether you sell to us or trade in against a new 4×4 from our stock, the offer stands."
        imageSlot="sell-your-car"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <aside className={styles.aside}>
            <h2 className={styles.asideTitle}>Why sell to us?</h2>
            <ul className={styles.asideList}>
              <li>Specialists in 4×4 — we know what your vehicle is actually worth.</li>
              <li>Firm valuation within the working day, not "subject to inspection" weasel words.</li>
              <li>Fast payment — typically same-day BACS once collection is agreed.</li>
              <li>Nationwide collection on a covered transporter.</li>
              <li>Outstanding finance? We settle directly with the lender.</li>
            </ul>
          </aside>

          <SellYourCarForm />
        </div>
      </section>
    </main>
  )
}

export default ColumbusSellYourCarPage
