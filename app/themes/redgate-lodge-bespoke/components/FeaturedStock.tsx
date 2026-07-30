import type { BrandConfig } from '@/brands/types'
import { apiUrl } from '../lib/api'
import { getBrandSlugFromRequest } from '../lib/brand-slug.server'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import { resolveText } from '../lib/brand-text'
import VehicleCard from './VehicleCard'
import styles from './FeaturedStock.module.css'

/**
 * FeaturedStock — homepage section 3 (after proof-ledger). Puts six real,
 * latest-arrival cars on the page the moment trust is established, with one
 * clear path to the full showroom.
 *
 * Unique move (design-language §7 "connecting-rule title line"): the section
 * header is a single flex row — sentence-case serif title, a 1px flex-1
 * hairline, then a serif "View all cars →" link. The rule literally runs from
 * the title's end to the action; no sibling theme draws its headers this way.
 * ≤640 the rule is hidden and the link drops to its own row below the title.
 *
 * Surface grammar (§5/§7): sits on `--color-bg` with NO top border of its own —
 * the ledger above owns the handoff hairline — between two `--color-surface`
 * bands (ledger, aftercare), so the page alternation reads correctly.
 *
 * Data: Server Component. Fetches the six latest arrivals server-side, threading
 * `?brand=<slug>` via `getBrandSlugFromRequest` (build-rules §12 — without it the
 * API falls back to default inventory). Canonical request (spec adjacency
 * contract): `/api/inventory?brand=<slug>&limit=6&per_page=6&sort=newest`.
 * Consumes the shared VehicleCard verbatim.
 * States: populated grid, or a quiet muted empty note (fetch failure degrades to
 * the same empty state — never a broken grid). The loading state is surfaced via
 * `<FeaturedStockSkeleton>` used as the home page's Suspense fallback.
 */

const FEATURED_LIMIT = 6

async function loadFeatured(): Promise<InventoryVehicle[]> {
  try {
    const params = new URLSearchParams()
    params.set('page', '1')
    // Exactly six cells: `limit` states intent (and is forward-compatible); the
    // API paginates on `per_page` today, so we send both at the same value.
    params.set('limit', String(FEATURED_LIMIT))
    params.set('per_page', String(FEATURED_LIMIT))
    params.set('sort', 'newest') // latest arrivals
    params.set('light', '1')
    params.set('vehicle_type', 'car')
    params.set('stock_status', 'in_stock')

    // Brand-scoped fetch (build-rules §12): without ?brand the API serves the
    // default inventory instead of this preview's cars.
    const slug = await getBrandSlugFromRequest()
    if (slug) params.set('brand', slug)

    const res = await fetch(apiUrl(`/inventory?${params.toString()}`), { cache: 'no-store' })
    if (!res.ok) return []

    const payload = await res.json()
    const items = Array.isArray(payload?.items) ? payload.items : []
    return items
      .map((item: any) => normalizeInventoryItem(item))
      .filter(Boolean)
      .slice(0, FEATURED_LIMIT) as InventoryVehicle[]
  } catch {
    return []
  }
}

type FeaturedStockProps = {
  brand: BrandConfig | null | undefined
}

/** The connecting-rule title line — shared by the live section and the skeleton. */
function FeaturedHead({ brand }: FeaturedStockProps) {
  const eyebrow = resolveText(brand, 'featured.eyebrow')
  const title = resolveText(brand, 'featured.title')
  const viewAll = resolveText(brand, 'featured.view_all')

  return (
    <header className={styles.head}>
      {eyebrow ? (
        <p className={styles.eyebrow} data-aos="fade-up">
          {eyebrow}
        </p>
      ) : null}
      <div className={styles.titleRow}>
        <h2
          id="featured-stock-title"
          className={styles.title}
          data-aos="fade-up"
          data-aos-delay="60"
        >
          {title}
        </h2>
        <span className={styles.rule} aria-hidden="true" />
        <a className={styles.viewAll} href="/used-cars" data-aos="fade-up" data-aos-delay="120">
          <span className={styles.viewAllLabel}>{viewAll}</span>
          <span className={styles.arrow} aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </header>
  )
}

export default async function FeaturedStock({ brand }: FeaturedStockProps) {
  const vehicles = await loadFeatured()
  const empty = resolveText(brand, 'featured.empty')

  return (
    <section className={styles.section} aria-labelledby="featured-stock-title">
      <div className={styles.inner}>
        <FeaturedHead brand={brand} />

        {vehicles.length > 0 ? (
          <div className={styles.grid}>
            {vehicles.map((vehicle, index) => (
              // Gentle staggered reveal per card — delay capped at 4 steps so a
              // full grid doesn't drag (0 / 80 / 160 / 240ms). The wrapper is a
              // grid-stretch cell so the shared VehicleCard still fills its slot;
              // VehicleCard is furnished separately and is not edited here.
              <div
                key={vehicle.id}
                className={styles.cardReveal}
                data-aos="fade-up"
                data-aos-delay={String(Math.min(index, 3) * 80)}
              >
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>{empty}</p>
        )}
      </div>
    </section>
  )
}

/**
 * Loading fallback — the same title line plus six VehicleCard skeletons in the
 * live grid, so the section holds its shape while the brand inventory streams in.
 */
export function FeaturedStockSkeleton({ brand }: FeaturedStockProps) {
  return (
    <section className={styles.section} aria-hidden="true">
      <div className={styles.inner}>
        <FeaturedHead brand={brand} />
        <div className={styles.grid}>
          {Array.from({ length: FEATURED_LIMIT }).map((_, index) => (
            <VehicleCard key={index} loading />
          ))}
        </div>
      </div>
    </section>
  )
}
