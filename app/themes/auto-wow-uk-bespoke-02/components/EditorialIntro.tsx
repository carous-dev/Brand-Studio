'use client'

import Link from 'next/link'
import { ArrowRight, Quote } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './EditorialIntro.module.css'

export default function EditorialIntro() {
  const brand = useBrand()
  const brandName = brand?.name || 'Autowow'
  const address = (brand as any)?.location?.address || {}
  const locationLabel = [address.city, address.county].filter(Boolean).join(', ') || 'across the UK'

  return (
    <section className={`auto-section ${styles.section}`} aria-label="About the showroom">
      <div className={styles.inner}>
        <div className={styles.body} data-aos="fade-up">
          <span className={styles.eyebrow}>[ Who we are ]</span>
          <h2 className={styles.title}>
            No nonsense. No commission upsell. Honest cars priced to move.
          </h2>
          <div className={styles.copy}>
            <p>
              {brandName} is an independent used-car retailer in {locationLabel}. The
              showroom floor is everything you need to know: every car listed has
              been through inspection, prep, and ready-to-drive checks before the
              key gets handed over.
            </p>
            <p>
              Need finance? We&apos;ll quote with no hard credit search. Selling something?
              We&apos;ll value it on the spot. Driving from out of town? We deliver
              UK-wide. No theatre, no upsell. Just cars and the people who sell them.
            </p>
          </div>
          <div className={styles.ctaRow}>
            <Link href="/about" className="auto-cta-link">
              How we work
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link href="/contact" className="auto-cta-link">
              Visit the showroom
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </div>

        <aside className={styles.aside} aria-label="From the desk">
          <div className={styles.quoteCard} data-aos="fade-left">
            <Quote size={28} strokeWidth={2} className={styles.quoteMark} aria-hidden="true" />
            <p className={styles.quoteText}>
              &ldquo;Honest car. Honest price. Honest people. Three of you don&apos;t see often
              enough at independents.&rdquo;
            </p>
            <p className={styles.quoteAttribution}>
              <strong>R. Mitchell</strong>
              <span>Recent customer</span>
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}
