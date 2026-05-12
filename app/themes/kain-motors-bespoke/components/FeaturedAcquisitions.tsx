'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import VehicleCard from './VehicleCard'
import styles from './FeaturedAcquisitions.module.css'

export default function FeaturedAcquisitions() {
  const brand = useBrand()
  const slug = brand?.slug
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // audit-ignore: data-useeffect-fetch — client island depending on useBrand(); featured-vehicles is brand-scoped at runtime.
  useEffect(() => {
    if (!slug) return
    let aborted = false
    fetch(apiUrl(`/featured-vehicles?brand=${encodeURIComponent(slug)}&limit=5`), { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (aborted) return
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [])
        setItems(arr.slice(0, 5))
      })
      .catch(() => {})
      .finally(() => { if (!aborted) setLoading(false) })
    return () => { aborted = true }
  }, [slug])

  if (!loading && items.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="featured-acquisitions-heading">
      <div className={styles.head} data-aos="fade-up">
        <div>
          <p className="kain-eyebrow">The Cover Story</p>
          <h2 id="featured-acquisitions-heading" className={styles.title}>
            Featured acquisitions
          </h2>
          <p className={styles.lead}>
            A rotating selection of cars our showroom team would happily take home themselves.
          </p>
        </div>
        <Link href="/used-cars" className="kain-cta-link">Browse all stock</Link>
      </div>

      <div className={styles.grid}>
        {loading && [0, 1, 2, 3, 4].map((i) => (
          <div key={i} className={`${styles.skeleton} ${i === 0 ? styles.featureCell : ''}`} aria-hidden="true" />
        ))}
        {!loading && items.map((v, idx) => (
          <div
            key={v.slug || v.reg || idx}
            className={`${styles.gridCell} ${idx === 0 ? styles.featureCell : ''}`}
            data-aos="fade-up"
            data-aos-delay={String(80 + idx * 60)}
          >
            <VehicleCard vehicle={v} variant={idx === 0 ? 'standard' : 'compact'} />
            {idx === 0 && (
              <span className={styles.coverByline}>
                Curated by Kain Motors · 2026 Spring Edition
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
