import Link from 'next/link'
import { PoundSterling, Search } from 'lucide-react'
import styles from './CtaSection.module.css'

export default function CtaSection() {
  return (
    <section className={styles.section} aria-labelledby="cta-title" data-aos="zoom-in">
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Next Steps</p>
          <h2 id="cta-title" className={styles.title}>Ready to find your next car or trade in?</h2>
          <p className={styles.subtitle}>
            Browse our stock or get a quick valuation. We make the process clear, friendly, and fast.
          </p>
        </div>

        <div className={styles.grid}>
          <article className={`${styles.card} ${styles.cardBrowse}`} aria-label="Browse used cars and vans">
            <div className={styles.cardContent}>
              <p className={styles.cardTag}>Browse Stock</p>
              <h3 className={styles.cardTitle}>Browse Used Cars & Vans</h3>
              <p className={styles.cardText}>
                Explore our regularly updated stock list and find your next car with confidence.
              </p>
              <Link href="/used-cars" className={styles.button}>
                <Search aria-hidden="true" />
                Browse Stock
              </Link>
            </div>
          </article>

          <article className={`${styles.card} ${styles.cardExchange}`} aria-label="Sell or part exchange your car">
            <div className={styles.cardContent}>
              <p className={styles.cardTag}>Sell or Part Exchange</p>
              <h3 className={styles.cardTitle}>Sell or Part Exchange?</h3>
              <p className={styles.cardText}>
                Speak with our friendly team for competitive pricing, clear advice, and full support.
              </p>
              <Link href="/sell-my-car" className={`${styles.button} ${styles.buttonAlt}`}>
                <PoundSterling aria-hidden="true" />
                Get Valuation
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
