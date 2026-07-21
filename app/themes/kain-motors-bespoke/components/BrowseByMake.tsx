'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import styles from './BrowseByMake.module.css'

export default function BrowseByMake() {
  const brand = useBrand()
  const slug = brand?.slug
  const [makes, setMakes] = useState<string[]>([])

  // audit-ignore: data-useeffect-fetch — client island; useBrand() returns null at SSR so brand-scoped fetch runs on mount.
  useEffect(() => {
    if (!slug) return
    let aborted = false
    fetch(apiUrl(`/inventory?brand=${encodeURIComponent(slug)}&per_page=1&light=1`), { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (aborted) return
        const raw = data?.meta?.available?.makes
        if (!Array.isArray(raw)) return
        const names = raw
          .map((m: unknown) => (typeof m === 'string' ? m : (m as any)?.key ?? (m as any)?.name))
          .filter((m: unknown): m is string => typeof m === 'string' && m.trim().length > 0)
          .map((m: string) => m.trim())
        const unique = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))
        setMakes(unique.slice(0, 12))
      })
      .catch(() => {})
    return () => { aborted = true }
  }, [slug])

  if (makes.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="browse-by-make-heading" data-aos="fade-up">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className="kain-eyebrow">Browse by make</p>
          <h2 id="browse-by-make-heading" className={styles.title}>Search the showroom by manufacturer</h2>
        </header>
        <ul className={styles.grid}>
          {makes.map((name, idx) => (
            <li key={`${name}-${idx}`}>
              <Link href={`/used-cars?make=${encodeURIComponent(name)}`} className={styles.chip}>
                <span className={styles.chipInitial} aria-hidden="true">{name.charAt(0)}</span>
                <span className={styles.chipName}>{name}</span>
                <span className={styles.chipArrow} aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
