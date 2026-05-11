import Link from 'next/link'
import type { BrandConfig } from '@/brands/types'
import { apiUrl } from '../lib/api'
import { getBrandSlugFromRequest } from '../lib/brand-slug.server'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import styles from './LatestArrivals.module.css'

type LatestArrivalsProps = {
  brand: BrandConfig | null | undefined
  limit?: number
}

async function fetchLatest(brandSlug: string | null, limit: number): Promise<InventoryVehicle[]> {
  try {
    const url = apiUrl(`/api/inventory?brand=${encodeURIComponent(brandSlug || '')}&per_page=${limit}&sort=newest`)
    const res = await fetch(url, { next: { revalidate: 60 } })
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
const miles = new Intl.NumberFormat('en-GB')

export default async function LatestArrivals({ brand, limit = 8 }: LatestArrivalsProps) {
  const brandSlug = (await getBrandSlugFromRequest()) || brand?.slug || null
  const vehicles = await fetchLatest(brandSlug, limit)

  return (
    <section className={styles.section} aria-label="Latest arrivals">
      <div className={styles.inner}>
        <header className={styles.head} data-aos="fade-up">
          <div className={styles.headLeft}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDash} aria-hidden="true" />
              Fresh on the forecourt
            </p>
            <h2 className={styles.heading}>Latest arrivals</h2>
          </div>
          <Link href="/used-cars" className={styles.headCta}>
            View all stock
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </header>

        {vehicles.length === 0 ? (
          <div className={styles.empty} data-aos="fade-up">
            <p>Stock is updated daily. Check back shortly — or browse our full inventory.</p>
            <Link href="/used-cars" className={styles.emptyLink}>
              Browse all vehicles
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        ) : (
          <ul className={styles.grid}>
            {vehicles.map((v, idx) => (
              <li
                key={v.id}
                className={styles.card}
                data-aos="fade-up"
                data-aos-delay={String((idx % 4) * 100)}
              >
                <Link href={buildVehiclePermalink(v)} className={styles.cardLink} aria-label={v.title}>
                  <div className={styles.cardMedia}>
                    {v.image ? (
                      <img
                        src={v.image}
                        alt=""
                        loading="lazy"
                        width="640"
                        height="420"
                        className={styles.cardImg}
                      />
                    ) : (
                      <div className={styles.cardMediaFallback} aria-hidden="true" />
                    )}
                    <span className={styles.cardStatus}>
                      <span className="mfx-pulse-dot" aria-hidden="true" />
                      Available
                    </span>
                    {v.featured ? <span className={[styles.cardFeatured, 'mfx-shimmer-loop'].join(' ')}>Featured</span> : null}
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardPrice}>{gbp.format(v.price || 0)}</div>
                    <h3 className={styles.cardTitle}>{v.title}</h3>
                    <dl className={styles.specRow}>
                      <div className={styles.spec}>
                        <dt>Year</dt>
                        <dd>{v.year || '—'}</dd>
                      </div>
                      <div className={styles.spec}>
                        <dt>Miles</dt>
                        <dd>{v.mileage ? miles.format(v.mileage) : '—'}</dd>
                      </div>
                      <div className={styles.spec}>
                        <dt>Fuel</dt>
                        <dd>{v.fuel}</dd>
                      </div>
                      <div className={styles.spec}>
                        <dt>Trans</dt>
                        <dd>{v.transmission}</dd>
                      </div>
                    </dl>
                  </div>
                  <span className={styles.cardArrow} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
