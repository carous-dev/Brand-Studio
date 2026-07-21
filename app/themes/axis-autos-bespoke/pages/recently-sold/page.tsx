import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ThemePageProps } from '../../../types'
import VehicleCard from '../../components/VehicleCard'
import { normalizeInventoryItem } from '../../lib/inventory'
import styles from './page.module.css'

export function AxisRecentlySoldPage({ initialInventory, brand }: ThemePageProps) {
  const items = Array.isArray(initialInventory)
    ? initialInventory.map(normalizeInventoryItem).filter(Boolean)
    : []

  return (
    <>
      <section className="axis-page-hero axis-page-hero--recently-sold">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">Archive</span>
          <h1 className="axis-page-hero-title">Recently sold.</h1>
          <p className="axis-page-hero-lead">
            A snapshot of cars that have recently found new homes from {brand?.name || 'us'}.
            Find something similar? Get in touch — we may have one inbound.
          </p>
        </div>
      </section>

      <section className="axis-section">
        <div className="axis-shell">
          {items.length === 0 ? (
            <p className={styles.empty}>Sold vehicle history will appear here as listings retire.</p>
          ) : (
            <div className={styles.grid}>
              {(items as any[]).map((v: any) => (
                <VehicleCard key={v.id} vehicle={v} sold />
              ))}
            </div>
          )}

          <div className={styles.ctaBlock}>
            <Link href="/used-cars" className="axis-btn axis-btn--primary">
              See current stock
              <ArrowRight size={18} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default AxisRecentlySoldPage
