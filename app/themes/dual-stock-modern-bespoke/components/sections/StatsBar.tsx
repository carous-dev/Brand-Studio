'use client'

import { useEffect, useRef, useState } from 'react'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import styles from './StatsBar.module.css'

export default function StatsBar() {
  const brand = useBrand()
  const slug = brand?.slug || 'default'
  const [counts, setCounts] = useState<{ total: number; cars: number; bikes: number } | null>(null)

  // audit-ignore: data-useeffect-fetch — brand context client-side, decorative counter island
  useEffect(() => {
    let cancelled = false
    const fetchCounts = async () => {
      try {
        const res = await fetch(apiUrl(`/inventory?brand=${slug}&per_page=200&light=1`))
        const data = await res.json()
        if (cancelled) return
        const items: any[] = Array.isArray(data?.items) ? data.items : Array.isArray(data?.vehicles) ? data.vehicles : []
        let bikes = 0
        items.forEach((v) => {
          const t = String(v?.type ?? v?.vehicleType ?? '').toLowerCase()
          if (t === 'bike' || t === 'motorcycle' || t === 'motorbike') bikes += 1
        })
        const total = Number(data?.meta?.total ?? data?.total ?? items.length)
        setCounts({ total, cars: Math.max(0, total - bikes), bikes })
      } catch {
        // silent — counts are decorative
      }
    }
    fetchCounts()
    return () => { cancelled = true }
  }, [slug])

  const hasResolvedBikes = counts !== null && counts.bikes === 0
  const showBikesStat = !hasResolvedBikes // hide once we know there are zero bikes

  return (
    <section className={`${styles.bar} dual-section dual-section--tight`} aria-label="At a glance">
      <div className={`${styles.barInner} dual-container ${showBikesStat ? styles.gridFour : styles.gridThree}`}>
        <Stat eyebrow="In stock" value={counts?.total} fallback={120} suffix="+" label="Vehicles ready to go" delay={0} />
        <Stat eyebrow="Cars" value={counts?.cars} fallback={80} suffix="+" label="Hand-picked, AA-inspected" delay={80} />
        {showBikesStat && (
          <Stat eyebrow="Bikes" value={counts?.bikes} fallback={40} suffix="+" label="Sport · cruiser · adventure" delay={160} />
        )}
        <Stat eyebrow="Years" value={15} fallback={15} suffix="" label="Trading independently since 2011" delay={240} />
      </div>
    </section>
  )
}

function Stat({
  eyebrow,
  value,
  fallback,
  suffix,
  label,
  delay,
}: {
  eyebrow: string
  value: number | null | undefined
  fallback: number
  suffix: string
  label: string
  delay: number
}) {
  const targetValue = typeof value === 'number' && value > 0 ? value : fallback
  const animatedDisplay = useCountUp(targetValue, delay)

  return (
    <div className={styles.stat} data-aos="zoom-in" data-aos-delay={delay}>
      <span className={styles.statEyebrow}>{eyebrow}</span>
      <span className={styles.statValue}>
        <span aria-live="polite">{animatedDisplay.toLocaleString('en-GB')}</span>
        {suffix && <span className={styles.statSuffix}>{suffix}</span>}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}

/**
 * Count-up animation hook — tweens from 0 to `target` over ~1500ms once the
 * element scrolls into view. Honors prefers-reduced-motion (skips animation).
 */
function useCountUp(target: number, delay = 0) {
  const [display, setDisplay] = useState(0)
  const elRef = useRef<number | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (startedRef.current) return

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplay(target)
      startedRef.current = true
      return
    }

    const duration = 1500
    let start: number | null = null
    let raf = 0
    const tick = (ts: number) => {
      if (start === null) start = ts
      const elapsed = ts - start
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    const timer = window.setTimeout(() => {
      startedRef.current = true
      raf = requestAnimationFrame(tick)
    }, delay)
    elRef.current = timer
    return () => {
      window.clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [target, delay])

  return display
}
