import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import styles from './RecentlySoldPreview.module.css'

/**
 * Columbus Vehicles — Recently sold preview (rugged archetype signature)
 *
 * Server Component. Fetches /api/recently-sold, takes the 3 newest, renders
 * each with a diagonal "SOLD" banner — the rugged spec's signature element
 * for showing inventory velocity. Links through to /recently-sold for the
 * full list.
 */
async function fetchRecentlySold(brandSlug: string | undefined, limit = 3): Promise<InventoryVehicle[]> {
  try {
    const url = apiUrl('/api/recently-sold')
    const search = new URLSearchParams()
    if (brandSlug) search.set('brand', brandSlug)
    search.set('limit', String(limit))
    const res = await fetch(`${url}?${search.toString()}`, {
      next: { revalidate: 300 }, // sold inventory changes slowly; 5min OK
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

export default async function RecentlySoldPreview({ brandSlug }: { brandSlug?: string }) {
  const items = await fetchRecentlySold(brandSlug, 3)
  if (items.length === 0) {
    // Don't render the section at all if there's nothing to show — better
    // than rendering a near-empty placeholder. /recently-sold link still
    // exists in nav and footer.
    return null
  }

  return (
    <section className={styles.section} aria-labelledby="recently-sold-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Just gone</p>
          <h2 id="recently-sold-heading" className={styles.heading}>Recently sold</h2>
          <p className={styles.subheading}>
            A glimpse of vehicles that have just found new owners. Stock moves fast — see something similar in current inventory before it does.
          </p>
        </header>

        <ul className={styles.grid} role="list">
          {items.slice(0, 3).map((v) => (
            <li key={v.id} className={styles.card}>
              <div className={styles.cardMedia}>
                {v.image ? (
                  <img src={v.image} alt={v.title} loading="lazy" />
                ) : (
                  <div className={styles.cardPlaceholder} aria-hidden="true" />
                )}
                <span className={styles.soldBanner} aria-label="Sold">SOLD</span>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{v.title}</h3>
                <p className={styles.cardPrice}>{fmtPrice(v.price)}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          <Link href="/recently-sold" className={styles.cta}>
            See full sold history
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
