'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import VehicleCard from './VehicleCard'
import styles from './AcquisitionsRow.module.css'

type Props = {
  title?: string
  eyebrow?: string
  description?: string
  endpoint?: 'recently-sold' | 'inventory-latest'
  cta?: { label: string; href: string }
}

export default function AcquisitionsRow({
  title = 'Recent acquisitions',
  eyebrow = 'Just landed',
  description = 'Latest cars to arrive on the forecourt. Reserve before they’re booked for viewing.',
  endpoint = 'inventory-latest',
  cta = { label: 'See all', href: '/used-cars' },
}: Props) {
  const brand = useBrand()
  const slug = brand?.slug
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // audit-ignore: data-useeffect-fetch — client island depending on useBrand(); fetch follows brand context resolution at runtime.
  useEffect(() => {
    if (!slug) return
    let aborted = false
    const url =
      endpoint === 'recently-sold'
        ? apiUrl(`/recently-sold?brand=${encodeURIComponent(slug)}&limit=8`)
        : apiUrl(`/inventory?brand=${encodeURIComponent(slug)}&per_page=8&sort=date_desc&light=1`)
    fetch(url, { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (aborted) return
        const arr =
          Array.isArray(data) ? data :
          Array.isArray(data?.items) ? data.items :
          Array.isArray(data?.vehicles) ? data.vehicles :
          []
        setItems(arr)
      })
      .catch(() => {})
      .finally(() => { if (!aborted) setLoading(false) })
    return () => { aborted = true }
  }, [slug, endpoint])

  if (!loading && items.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="acquisitions-row-heading">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className="kain-eyebrow">{eyebrow}</p>
            <h2 id="acquisitions-row-heading" className={styles.title}>{title}</h2>
            {description && <p className={styles.description}>{description}</p>}
          </div>
          <Link href={cta.href} className="kain-cta-link">{cta.label}</Link>
        </div>

        <div className={styles.rail} role="list" aria-label={title}>
          {loading && [0, 1, 2, 3].map((i) => <div key={i} className={styles.skeleton} aria-hidden="true" />)}
          {!loading && items.map((v, idx) => (
            <div role="listitem" className={styles.railCell} key={v.slug || v.reg || idx}>
              <VehicleCard vehicle={v} variant="compact" sold={endpoint === 'recently-sold'} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
