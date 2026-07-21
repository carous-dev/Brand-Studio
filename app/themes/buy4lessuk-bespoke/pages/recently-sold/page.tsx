import Link from 'next/link'
import type { ThemePageProps } from '../../../types'
import PageHero from '../../components/PageHero'
import PageShell from '../../components/PageShell'
import styles from './page.module.css'

function fmtPrice(value: any) {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  return `£${n.toLocaleString('en-GB')}`
}

export function Buy4lessukRecentlySoldPage({ initialInventory, brand }: ThemePageProps) {
  const items = Array.isArray(initialInventory) ? initialInventory : []
  const name = (brand?.name || 'us').trim()

  return (
    <>
      <PageHero
        title="Recently sold"
        eyebrow="Just gone"
        slot="recently-sold"
      />
      <PageShell>
        <p className={styles.lead}>A glimpse of cars that have recently found new homes from {name}.</p>

        {items.length === 0 ? (
          <p className={styles.empty}>Sold vehicle history will appear here as listings are retired.</p>
        ) : (
          <ul className={styles.grid}>
            {items.map((v: any, idx: number) => {
              const title = [v.year, v.make, v.model].filter(Boolean).join(' ') || 'Vehicle'
              const img = (v.images && v.images[0]) || v.image || ''
              return (
                <li key={idx} className={styles.card}>
                  <div className={styles.media}>
                    {img ? <img src={img} alt={title} /> : <div className={styles.placeholder} />}
                    <span className={styles.soldBadge}>Sold</span>
                  </div>
                  <div className={styles.body}>
                    <h3>{title}</h3>
                    <span className={styles.price}>{fmtPrice(v.price)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <div className={styles.cta}>
          <Link href="/used-cars" className={styles.btn}>See current stock</Link>
        </div>
      </PageShell>
    </>
  )
}

export default Buy4lessukRecentlySoldPage
