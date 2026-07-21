'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { resolveLogoSlug, simpleIconsLogoUrl } from '../lib/make-logos'
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
  // Pad short make lists so a single marquee half is always wide enough to fill
  // the rail — otherwise a 5-make list leaves a gap and the loop looks static.
  let base = makes
  if (makes.length) {
    while (base.length < 10) base = [...base, ...makes]
  }
  // Two identical halves; the track animates by -50% for a seamless loop.
  const rail = base.length ? [...base, ...base] : []

  return (
    <section className={styles.ticker} aria-label="Live stock" data-aos="fade-up">
      <div className={styles.inner}>
        <div className={styles.lead}>
          <span className={`mfx-pulse-dot ${styles.dot}`} aria-hidden="true" />
          <span className={styles.label}>In stock now</span>
          <span className={styles.count}>
            {count ? <strong>{count}+</strong> : <strong>Live</strong>} cars ready to drive
          </span>
        </div>

        {rail.length ? (
          <div className={styles.rail} aria-hidden="true">
            <div className={styles.railTrack}>
              {rail.map((make, idx) => {
                const slug = resolveLogoSlug(make)
                return (
                  <span key={`tick-${idx}-${make}`} className={styles.chip}>
                    <span className={styles.chipLogo}>
                      {slug ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={simpleIconsLogoUrl(slug)}
                          alt=""
                          width={18}
                          height={18}
                          loading="lazy"
                          decoding="async"
                          className={styles.chipLogoImg}
                        />
                      ) : (
                        <span className={styles.chipMonogram}>{make.charAt(0).toUpperCase()}</span>
                      )}
                    </span>
                    {make}
                  </span>
                )
              })}
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
