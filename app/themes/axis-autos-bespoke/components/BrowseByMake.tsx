'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import { MakeLogo } from './MakeLogo'
import styles from './BrowseByMake.module.css'

/**
 * SEO + internal-linking band — chip grid of every make in the dealer's stock
 * with counts. Mounts site-wide above the Footer via Shell. Per memory
 * feedback_browse_by_make_shell — single canonical location, never duplicated
 * on per-page templates. The shape `meta.available.makes` may arrive as
 * string[] OR {key,count}[]; normalize at the boundary.
 */
export default function BrowseByMake() {
  const brand = useBrand()
  const slug = brand?.slug
  const [makes, setMakes] = useState<Array<{ name: string; count?: number }>>([])

  // audit-ignore: data-useeffect-fetch — client island; useBrand() returns null at SSR so brand-scoped fetch runs on mount.
  useEffect(() => {
    if (!slug) return
    let aborted = false
    fetch(apiUrl(`/inventory?brand=${encodeURIComponent(slug)}&per_page=1&light=1`), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (aborted) return
        const raw = data?.meta?.available?.makes
        if (!Array.isArray(raw)) return
        const normalised = raw
          .map((m: unknown) => {
            if (typeof m === 'string') return { name: m.trim() }
            if (m && typeof m === 'object') {
              const name = String((m as any).key ?? (m as any).name ?? '').trim()
              const count = Number((m as any).count)
              return name ? { name, count: Number.isFinite(count) ? count : undefined } : null
            }
            return null
          })
          .filter((m): m is { name: string; count?: number } => m !== null && m.name.length > 0)

        const dedup = new Map<string, { name: string; count?: number }>()
        for (const m of normalised) {
          if (!dedup.has(m.name)) dedup.set(m.name, m)
        }
        const sorted = Array.from(dedup.values()).sort((a, b) => a.name.localeCompare(b.name))
        setMakes(sorted.slice(0, 12))
      })
      .catch(() => {})
    return () => { aborted = true }
  }, [slug])

  if (makes.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="browse-by-make-heading">
      <div className={styles.inner}>
        <header className={styles.head}>
          <span className="axis-eyebrow">Browse by manufacturer</span>
          <h2 id="browse-by-make-heading" className={styles.title}>
            Looking for a specific brand?
          </h2>
        </header>
        <ul className={styles.grid}>
          {makes.map((m) => (
            <li key={m.name}>
              <Link href={`/used-cars?make=${encodeURIComponent(m.name)}`} className={styles.chip}>
                <span className={styles.chipInitial} aria-hidden="true"><MakeLogo make={m.name} /></span>
                <span className={styles.chipName}>{m.name}</span>
                {typeof m.count === 'number' ? <span className={styles.chipCount}>{m.count}</span> : null}
                <ArrowUpRight size={14} strokeWidth={1.8} className={styles.chipArrow} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
