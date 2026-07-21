'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './EditorialIntro.module.css'

/**
 * Editorial intro — a calm two-column band between the hero and featured stock.
 * Left: short paragraph + link. Right: 3 statement bullets. No imagery. The
 * sentence-case display headline anchors the brand voice.
 */
export default function EditorialIntro() {
  const brand = useBrand()
  const address = (brand as any)?.location?.address || {}
  const city = address.city || 'the local area'
  const brandName = brand?.name || 'Axis Autos'

  return (
    <section className={`axis-section ${styles.intro}`} aria-label="About us" data-aos="fade-up">
      <div className="axis-shell">
        <div className={styles.grid}>
          <div className={styles.left}>
            <span className="axis-eyebrow">About us</span>
            <h2 className={styles.title}>
              A small showroom that takes used cars seriously.
            </h2>
            <p className={styles.body}>
              {brandName} is an independent used-car dealer in {city}. We hand-pick every vehicle
              we sell — no auction stock that nobody knows the history of, no inflated forecourt
              prices. Just a steady rotation of cars we'd happily drive ourselves.
            </p>
            <Link href="/about" className={styles.link}>
              Read more about us
              <ArrowUpRight size={16} strokeWidth={1.6} />
            </Link>
          </div>

          <ul className={styles.points}>
            <li>
              <span className={`axis-kicker ${styles.kicker}`}>Sourcing</span>
              <strong>Hand-picked stock.</strong>
              <span className={styles.pointBody}>Each car is mechanically inspected and HPI-checked before it joins the showroom.</span>
            </li>
            <li>
              <span className={`axis-kicker ${styles.kicker}`}>Pricing</span>
              <strong>Honest, upfront numbers.</strong>
              <span className={styles.pointBody}>What you see is what you pay. No setup fees, no admin fees, no surprises.</span>
            </li>
            <li>
              <span className={`axis-kicker ${styles.kicker}`}>Finance</span>
              <strong>Shopped across lenders.</strong>
              <span className={styles.pointBody}>Independent broker access — we compare your application for a fair rate.</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  )
}
