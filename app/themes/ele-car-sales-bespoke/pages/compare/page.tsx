import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import CompareClient from './CompareClient'
import styles from './page.module.css'

export function EleComparePage(_props: ThemePageProps) {
  return (
    <main>
      <PageHero
        eyebrow="Compare"
        title="Line them up side-by-side."
        lead="Add cars from the listings to compare price, mileage, spec, and more in one view. Up to four at a time."
        imageSlot="hero"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          <CompareClient />
        </div>
      </section>
    </main>
  )
}

export default EleComparePage
