import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import styles from './LatestArrivalsSection.module.css'

/**
 * Columbus Vehicles — Latest arrivals (rugged archetype)
 *
 * Server Component (no 'use client'): fetches inventory at request time so
 * the user sees real stock immediately, no client-side waterfall. Per the
 * Quality Bar: `next: { revalidate: 60 }` keeps cached for a minute, then
 * re-fetches on next request — appropriate for prospect-preview inventory
 * that doesn't change second-by-second.
 *
 * Rugged archetype design choices:
 *   - 4-up grid on desktop, 2-up tablet, 1-up mobile
 *   - Sharp 4px corners on cards (not the 12-14px the classic uses)
 *   - Status badge top-left of each card image
 *   - Price as the dominant element below the title
 *   - Monochrome card body (no soft shadows, just border)
 */
async function fetchLatestArrivals(brandSlug: string | undefined, limit = 8): Promise<InventoryVehicle[]> {
  try {
    const url = apiUrl('/api/inventory')
    const search = new URLSearchParams()
    if (brandSlug) search.set('brand', brandSlug)
    search.set('limit', String(limit))
    search.set('sort', 'newest')
    const res = await fetch(`${url}?${search.toString()}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []
    return list.map(normalizeInventoryItem).filter(Boolean) as InventoryVehicle[]
  } catch {
    return []
  }
}

function fmtPrice(n: number) {
  if (!Number.isFinite(n)) return '—'
  return `£${n.toLocaleString('en-GB')}`
}

function fmtMiles(n: number) {
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString('en-GB')} miles`
}

export default async function LatestArrivalsSection({ brandSlug }: { brandSlug?: string }) {
  const items = await fetchLatestArrivals(brandSlug, 8)

  return (
    <section className={styles.section} aria-labelledby="latest-arrivals-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Newest stock</p>
          <h2 id="latest-arrivals-heading" className={styles.heading}>Latest arrivals</h2>
          <Link href="/used-cars" className={styles.viewAll}>
            View all 4×4 stock
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </header>

        {items.length === 0 ? (
          <p className={styles.empty}>
            New 4×4 inventory is being prepared. Check back shortly or
            <Link href="/contact" className={styles.emptyLink}> tell us what you&apos;re looking for</Link>.
          </p>
        ) : (
          <ul className={styles.grid} role="list">
            {items.slice(0, 8).map((v) => (
              <li key={v.id} className={styles.card}>
                <Link href={v.slug ? `/used-cars/${v.slug}` : '/used-cars'} className={styles.cardLink}>
                  <div className={styles.cardMedia}>
                    {v.image ? (
                      <img src={v.image} alt={v.title} loading="lazy" />
                    ) : (
                      <div className={styles.cardPlaceholder} aria-hidden="true" />
                    )}
                    <span className={styles.cardBadge}>{v.year || 'Available'}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{v.title}</h3>
                    <p className={styles.cardPrice}>{fmtPrice(v.price)}</p>
                    <p className={styles.cardMeta}>
                      <span>{fmtMiles(v.mileage)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{v.fuel || '—'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{v.transmission || '—'}</span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
