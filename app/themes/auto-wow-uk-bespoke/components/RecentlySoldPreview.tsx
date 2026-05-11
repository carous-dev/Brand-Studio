import Link from 'next/link'
import type { BrandConfig } from '@/brands/types'
import { apiUrl } from '../lib/api'
import { getBrandSlugFromRequest } from '../lib/brand-slug.server'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import styles from './RecentlySoldPreview.module.css'

async function fetchRecentlySold(brandSlug: string | null, limit: number): Promise<InventoryVehicle[]> {
  try {
    const url = apiUrl(`/api/recently-sold?brand=${encodeURIComponent(brandSlug || '')}&limit=${limit}`)
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = await res.json()
    const list: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.items)
        ? (data as any).items
        : Array.isArray((data as any)?.vehicles)
          ? (data as any).vehicles
          : []
    return list.map((item) => normalizeInventoryItem(item)).filter((v): v is InventoryVehicle => Boolean(v)).slice(0, limit)
  } catch {
    return []
  }
}

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })

export default async function RecentlySoldPreview({ brand }: { brand: BrandConfig | null | undefined }) {
  const brandSlug = (await getBrandSlugFromRequest()) || brand?.slug || null
  const vehicles = await fetchRecentlySold(brandSlug, 3)

  if (vehicles.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="sold-heading">
      <div className={styles.inner}>
        <header className={styles.head} data-aos="fade-up">
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            Recently driven away
          </p>
          <h2 id="sold-heading" className={styles.heading}>Cars sold this month.</h2>
          <p className={styles.lead}>
            A snapshot of cars that found new homes. Spot something you like? We
            can usually source another to spec.
          </p>
        </header>

        <ul className={styles.grid}>
          {vehicles.map((v, idx) => (
            <li
              key={v.id}
              className={styles.card}
              data-aos="fade-up"
              data-aos-delay={String(idx * 120)}
            >
              <div className={styles.cardMedia}>
                {v.image ? (
                  <img src={v.image} alt="" loading="lazy" width="640" height="420" className={styles.cardImg} />
                ) : (
                  <div className={styles.cardImgFallback} aria-hidden="true" />
                )}
                <span className={styles.soldBanner} aria-hidden="true">SOLD</span>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{v.title}</h3>
                <p className={styles.cardPrice}>{gbp.format(v.price || 0)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.tail} data-aos="fade-up">
          <Link href="/recently-sold" className={styles.tailLink}>
            See every car we&apos;ve sold
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
