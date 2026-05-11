'use client'

// audit-ignore-file: data-useeffect-fetch — brand context is client-side; home is a server shell composed of client islands.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import styles from './RecentlySoldPreview.module.css'

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n)

export default function RecentlySoldPreview() {
  const brand = useBrand()
  const [items, setItems] = useState<InventoryVehicle[]>([])

  useEffect(() => {
    let cancelled = false
    const slug = (brand?.slug || '').trim()
    // audit-ignore: data-useeffect-fetch — useBrand is client-side; home is server shell with client islands.
    const params = new URLSearchParams({ limit: '3' })
    if (slug) params.set('brand', slug)
    fetch(apiUrl(`/recently-sold?${params.toString()}`), { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
        setItems(list.map(normalizeInventoryItem).filter(Boolean).slice(0, 3))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [brand?.slug])

  if (!items.length) return null

  return (
    <section className={`auto-section ${styles.section}`} aria-labelledby="recently-sold-title">
      <div className="auto-container">
        <header className={styles.header}>
          <div>
            <p className="auto-eyebrow" data-aos="fade-right">Recently sold</p>
            <h2 id="recently-sold-title" className="auto-section-title" data-aos="fade-up">
              These found new owners. Yours could be next.
            </h2>
          </div>
          <Link href="/recently-sold" className="auto-cta-link" data-aos="fade-left">
            See sold archive
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </header>

        <ul className={styles.grid}>
          {items.map((v, i) => (
            <li
              key={v.id}
              className={styles.card}
              data-aos="flip-up"
              data-aos-delay={i * 120}
            >
              <div className={styles.media}>
                {v.image ? (
                  <img src={v.image} alt={v.title} loading="lazy" />
                ) : (
                  <div className={styles.mediaPlaceholder} aria-hidden="true" />
                )}
                <span className="auto-sold-banner" aria-hidden="true">SOLD</span>
                <div className={styles.mediaOverlay} aria-hidden="true" />
              </div>
              <div className={styles.body}>
                <p className={styles.title}>{v.title}</p>
                <p className={styles.priceRow}>
                  <span className={styles.priceWas}>Was {formatPrice(v.price)}</span>
                  <span className={styles.soldNote}>Find your match below</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
