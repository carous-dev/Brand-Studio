'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import styles from './Directory.module.css'

type Counts = Record<string, number>
type LoadState = 'loading' | 'ready' | 'empty' | 'error'

const FALLBACK_MAKES = ['Audi', 'BMW', 'Ford', 'Mercedes-Benz', 'Nissan', 'Toyota', 'Vauxhall', 'Volkswagen']

export default function Directory() {
  const brand = useBrand()
  const [makes, setMakes] = useState<string[]>([])
  const [counts, setCounts] = useState<Counts>({})
  const [state, setState] = useState<LoadState>('loading')

  // audit-ignore: data-useeffect-fetch — brand context client-side
  useEffect(() => {
    const ctrl = new AbortController()
    const url = apiUrl(`/inventory?brand=${encodeURIComponent(brand?.slug || '')}&per_page=200`)
    fetch(url, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        const items = Array.isArray(data) ? data : data.items || data.vehicles || []
        const metaMakes = data?.meta?.available?.makes
        let makeList: string[] = []
        if (Array.isArray(metaMakes) && metaMakes.length > 0) {
          makeList = metaMakes.map((m: any) => (typeof m === 'string' ? m : String(m?.name || m?.key || ''))).filter(Boolean)
        }
        const tally: Counts = {}
        items.forEach((it: any) => {
          const name = String(it?.make?.name || it?.make || it?.vehicle?.make || '').trim()
          if (!name) return
          tally[name] = (tally[name] || 0) + 1
        })
        if (makeList.length === 0) makeList = Object.keys(tally)
        makeList.sort((a, b) => (tally[b] || 0) - (tally[a] || 0) || a.localeCompare(b))
        setCounts(tally)
        setMakes(makeList.slice(0, 12))
        setState(makeList.length > 0 ? 'ready' : 'empty')
      })
      .catch((err) => {
        if ((err as Error).name === 'AbortError') return
        setMakes(FALLBACK_MAKES)
        setState('error')
      })
    return () => ctrl.abort()
  }, [brand?.slug])

  return (
    <section className={`qb-section ${styles.section}`}>
      <div className="qb-container">
        <header className="qb-section-head" data-aos="fade-up">
          <span className="qb-eyebrow">Browse by make</span>
          <h2 className="qb-section-title">Jump straight to your make.</h2>
          <p className="qb-section-lead">
            Quick pivot — pick a marque to filter the floor. Counts shown are current.
          </p>
        </header>

        {state === 'loading' && (
          <div className={styles.grid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className={styles.chipSkeleton} aria-hidden="true" />
            ))}
          </div>
        )}

        {(state === 'ready' || state === 'error') && (
          <div className={styles.grid}>
            {makes.map((make, i) => (
              <Link
                key={make}
                href={`/used-cars?make=${encodeURIComponent(make)}`}
                className={styles.chip}
                data-aos="fade-up"
                data-aos-delay={i * 30}
              >
                <span className={styles.chipName}>{make}</span>
                {counts[make] ? <span className={styles.chipCount}>{counts[make]}</span> : null}
              </Link>
            ))}
          </div>
        )}

        {state === 'empty' && (
          <p className={styles.fallback}>
            New stock landing soon — <Link href="/used-cars" className={styles.fallbackLink}>view everything in</Link>.
          </p>
        )}
      </div>
    </section>
  )
}
