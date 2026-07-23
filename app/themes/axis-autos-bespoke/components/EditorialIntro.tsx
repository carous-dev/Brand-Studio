'use client'

import Link from 'next/link'
import { ArrowUpRight, Search, BadgePoundSterling, Landmark } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './EditorialIntro.module.css'

/**
 * Editorial intro — a calm two-column band between the hero and featured stock.
 * Left: sentence-case display headline + copy + link, anchored by a brand
 * hairline thread. Right: three interactive spec cards (Sourcing / Pricing /
 * Finance) — hairline-bordered, glyph-led, with a precise hover reveal. The
 * "futuristic" read comes from technical precision and motion, NOT decorative
 * layers — the theme's minimalist fingerprint stays intact. All colour derives
 * from the dashboard palette tokens.
 */
const POINTS = [
  {
    kicker: 'Sourcing',
    Icon: Search,
    title: 'Hand-picked stock.',
    body: 'Each car is mechanically inspected and HPI-checked before it joins the showroom.',
  },
  {
    kicker: 'Pricing',
    Icon: BadgePoundSterling,
    title: 'Honest, upfront numbers.',
    body: 'What you see is what you pay. No setup fees, no admin fees, no surprises.',
  },
  {
    kicker: 'Finance',
    Icon: Landmark,
    title: 'Shopped across lenders.',
    body: 'Independent broker access — we compare your application for a fair rate.',
  },
] as const

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
              <span>Read more about us</span>
              <ArrowUpRight size={16} strokeWidth={1.8} />
            </Link>
          </div>

          <ul className={styles.points}>
            {POINTS.map(({ kicker, Icon, title, body }) => (
              <li key={kicker} className={styles.card}>
                <span className={styles.cardEdge} aria-hidden="true" />
                <span className={`axis-icon ${styles.cardIcon}`} aria-hidden="true">
                  <Icon size={20} strokeWidth={1.6} />
                </span>
                <div className={styles.cardText}>
                  <span className={`axis-kicker ${styles.kicker}`}>{kicker}</span>
                  <strong className={styles.cardTitle}>{title}</strong>
                  <span className={styles.pointBody}>{body}</span>
                </div>
                <ArrowUpRight className={styles.cardArrow} size={18} strokeWidth={1.6} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
