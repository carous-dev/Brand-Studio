import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { apiUrl } from '../lib/api'
import { getBrandSlugFromRequest } from '../lib/brand-slug.server'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import { buildVehiclePermalink } from '../lib/vehicle-links'
import styles from './LatestArrivals.module.css'

type LatestArrivalsProps = {
  brandName?: string
}

function fmtPrice(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `£${n.toLocaleString('en-GB')}`
}

function fmtMileage(value: any) {
  if (value == null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `${n.toLocaleString('en-GB')} mi`
}

async function loadLatest(): Promise<InventoryVehicle[]> {
  try {
    const params = new URLSearchParams({
      page: '1',
      per_page: '6',
      light: '1',
      sort: 'created_desc',
      vehicle_type: 'car',
      stock_status: 'in_stock',
    })
    const brand = await getBrandSlugFromRequest()
    if (brand) params.set('brand', brand)
    const res = await fetch(apiUrl(`/inventory?${params.toString()}`), { next: { revalidate: 60 } })
    if (!res.ok) return []
    const payload = await res.json()
    const items = Array.isArray(payload?.items) ? payload.items : []
    return items.map((item: any) => normalizeInventoryItem(item)).filter(Boolean) as InventoryVehicle[]
  } catch {
    return []
  }
}

export default async function LatestArrivals({ brandName = 'ELE Car Sales' }: LatestArrivalsProps) {
  const vehicles = (await loadLatest()).slice(0, 6)

  return (
    <section className={styles.section} aria-labelledby="ele-latest-title">
      <div className={styles.inner}>
        <div className={styles.head} data-aos="fade-up">
          <div>
            <p className={styles.eyebrow}>Latest arrivals</p>
            <h2 id="ele-latest-title" className={styles.title}>
              Fresh in this week
            </h2>
          </div>
          <Link href="/used-cars" className={styles.headLink}>
            See all stock <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className={styles.empty} role="status">
            <p>
              We&apos;re refreshing stock right now. Get in touch and let us know
              what you&apos;re looking for — we&apos;ll match you to the right car as soon
              as it&apos;s ready.
            </p>
            <Link href="/contact" className={styles.emptyCta}>
              Tell {brandName} what you want
            </Link>
          </div>
        ) : (
          <ul className={styles.grid} role="list">
            {vehicles.map((v, idx) => {
              const title = v.title || [v.year, v.make].filter(Boolean).join(' ') || 'Vehicle'
              const img = v.image || ''
              const mileage = fmtMileage(v.mileage)
              const fuel = v.fuel || null
              const href = buildVehiclePermalink({ slug: v.slug, reg: v.reg })
              return (
                <li
                  key={`${v.id || idx}-${title}`}
                  className={styles.card}
                  data-aos="fade-up"
                  data-aos-delay={String(60 * (idx % 3))}
                >
                  <Link href={href} className={styles.cardLink}>
                    <div className={styles.media}>
                      {img ? (
                        <img
                          src={img}
                          alt={title}
                          loading="lazy"
                          width={640}
                          height={426}
                          className={styles.mediaImg}
                        />
                      ) : (
                        <div className={styles.mediaPlaceholder} aria-hidden="true" />
                      )}
                    </div>
                    <div className={styles.body}>
                      <h3 className={styles.cardTitle}>{title}</h3>
                      <p className={styles.cardMeta}>
                        {[mileage, fuel].filter(Boolean).join(' · ')}
                      </p>
                      <p className={styles.cardPrice}>{fmtPrice(v.price)}</p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
