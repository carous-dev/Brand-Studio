'use client'

// audit-ignore-file: data-useeffect-fetch — brand context is client-side; SEO band is a client island composed below the server Shell.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import styles from './BrowseByMake.module.css'

type MakeEntry = { name: string; count: number }

export default function BrowseByMake() {
  const brand = useBrand()
  const brandSlug = brand?.slug || ''
  const [makes, setMakes] = useState<MakeEntry[]>([])

  useEffect(() => {
    let aborted = false
    const controller = new AbortController()

    async function load() {
      try {
        const params = new URLSearchParams()
        params.set('per_page', '1')
        if (brandSlug) params.set('brand', brandSlug)
        const res = await fetch(apiUrl(`/inventory?${params.toString()}`), {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!res.ok) return
        const payload = await res.json()
        if (aborted) return
        const meta = payload?.meta?.available
        const rawMakes: unknown = meta?.makes
        if (!Array.isArray(rawMakes)) return
        const counts: Record<string, number> = (meta?.makes_count && typeof meta.makes_count === 'object')
          ? meta.makes_count as Record<string, number>
          : {}
        const list: MakeEntry[] = rawMakes
          .map((m) => String(m || '').trim())
          .filter(Boolean)
          .map((name) => ({ name, count: Number(counts[name] || 0) }))
        setMakes(list)
      } catch {
        if (!aborted) setMakes([])
      }
    }
    load()
    return () => { aborted = true; controller.abort() }
  }, [brandSlug])

  if (makes.length === 0) return null

  return (
    <section className={styles.section} aria-label="Browse by make">
      <div className="shr-container">
        <div className={styles.head}>
          <span className="shr-eyebrow">Browse by make</span>
          <h2 className={styles.title}>Find your next car at Showroom Shine Cars.</h2>
        </div>
        <ul className={styles.grid}>
          {makes.slice(0, 16).map((m) => (
            <li key={m.name}>
              <Link href={`/used-cars?make=${encodeURIComponent(m.name)}`} className={styles.chip}>
                <ChevronRight size={14} strokeWidth={2.4} className={styles.chipArrow} aria-hidden />
                <span className={styles.chipName}>{m.name}</span>
                {m.count > 0 ? <span className={styles.chipCount}>{m.count}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
