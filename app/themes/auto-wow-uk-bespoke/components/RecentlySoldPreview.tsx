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
      <div className={`auto-container ${styles.inner}`}>
        <header className={styles.header} data-aos="fade-up">
          <div className={styles.headerCopy}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowMark} aria-hidden="true" />
              Recently sold
            </span>
            <h2 id="recently-sold-title" className={styles.title}>
              These found new owners. Yours could be next.
            </h2>
          </div>
          <Link href="/recently-sold" className={styles.viewAll}>
            See sold archive
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </header>

        <ul className={styles.grid}>
          {items.map((v, i) => (
            <li
              key={v.id}
              className={styles.card}
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <div className={styles.media}>
                {v.image ? (
                  <img src={v.image} alt={v.title} loading="lazy" />
                ) : (
                  <div className={styles.mediaPlaceholder} aria-hidden="true" />
                )}
                <div className={styles.mediaScrim} aria-hidden="true" />
                <span className={styles.soldBanner} aria-hidden="true">Sold</span>
              </div>
              <div className={styles.body}>
                <p className={styles.cardTitle}>{v.title}</p>
                <div className={styles.priceRow}>
                  <span className={styles.priceWas}>Was {formatPrice(v.price)}</span>
                  <span className={styles.soldNote}>Find your next match</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
