'use client'

import Link from 'next/link'
import { ArrowRight, Car } from 'lucide-react'
import styles from './HorizontalStockTicker.module.css'

export default function HorizontalStockTicker({
  stockCount,
  sampleMakes,
}: {
  stockCount?: number
  sampleMakes?: string[]
}) {
  const count = typeof stockCount === 'number' && stockCount > 0 ? stockCount : null
  const makes = (sampleMakes || []).filter(Boolean).slice(0, 12)
  // Duplicate the strip so the marquee loop reads seamlessly.
  const rail = makes.length ? [...makes, ...makes] : []

  return (
    <section className={styles.ticker} aria-label="Live stock">
      <div className={styles.inner}>
        <div className={styles.lead} data-aos="fade-right">
          <span className={`mfx-pulse-dot ${styles.dot}`} aria-hidden="true" />
          <span className={styles.label}>In stock now</span>
          <span className={styles.count}>
            {count ? <strong>{count}+</strong> : <strong>Live</strong>} cars ready to drive
          </span>
        </div>

        {rail.length ? (
          <div className={styles.rail} aria-hidden="true">
            <div className={styles.railTrack}>
              {rail.map((make, idx) => (
                <span key={`tick-${idx}-${make}`} className={styles.chip}>
                  <Car size={14} strokeWidth={2} />
                  {make}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <Link href="/used-cars" className={`auto-cta-link ${styles.cta}`}>
          Browse the lot
          <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>
    </section>
  )
}
