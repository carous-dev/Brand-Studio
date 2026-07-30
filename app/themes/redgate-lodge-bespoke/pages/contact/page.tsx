import type { ThemePageProps } from '../../../types'
import PageRibbon from '../../components/PageRibbon'
import ContactForm from '../../components/ContactForm'
import VisitLodge from '../../components/VisitLodge'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'
import styles from './contact.module.css'

/**
 * Contact — Server Component (build-rules §3: no `'use client'` in the page
 * wrapper). Page ribbon (design §7), then the contact split on `bg`: the
 * enquiry ContactForm (client) left, the reused visit-lodge details (bare,
 * unbanded variant) right. `brand` is plain JSON, so it passes safely into the
 * client ContactForm as a prop.
 */
export function RedgateContactPage({ brand }: ThemePageProps) {
  return (
    <>
      <PageRibbon
        brand={brand}
        eyebrowKey="ribbon.eyebrow"
        titleKey="ribbon.contact_title"
        leadKey="ribbon.contact_lead"
      />

      <section className={styles.section} aria-label="Contact">
        {/* Furnishing (luxury→refined): the same faint aurora light the hero and
            visit-lodge carry, kept low-density so the ledger-underline form stays
            the focus. Self-guards — static token wash under reduced-motion / ≤640px,
            pauses off-screen. Decorative + aria-hidden + pointer-events:none. */}
        <CanvasFX variant="aurora-light" density={0.4} className={styles.aurora} />
        <div className={styles.inner}>
          <div className={styles.grid}>
            <ContactForm brand={brand} />
            <VisitLodge brand={brand} variant="bare" />
          </div>
        </div>
      </section>
    </>
  )
}

export default RedgateContactPage
