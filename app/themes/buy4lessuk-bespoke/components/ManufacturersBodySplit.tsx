'use client'

import { useRouter } from 'next/navigation'
import styles from './ManufacturersBodySplit.module.css'

type BodyType = { key: string; label: string }

const BODY_TYPES: BodyType[] = [
  { key: 'hatchback', label: 'Hatchback' },
  { key: 'mpv', label: 'MPV and Estate' },
  { key: 'coupe', label: 'Coupe' },
]

const FALLBACK_MAKES = ['Audi', 'BMW', 'Ford', 'Fiat']

export default function ManufacturersBodySplit({ makes }: { makes?: string[] }) {
  const router = useRouter()
  const showMakes = (makes && makes.length > 0) ? makes.slice(0, 4) : FALLBACK_MAKES

  const goMake = (make: string) => router.push(`/used-cars?make=${encodeURIComponent(make)}`)
  const goBody = (body: string) => router.push(`/used-cars?body=${encodeURIComponent(body)}`)

  return (
    <section className={styles.section} aria-label="Browse stock by manufacturer or body type" data-aos="fade-up">
      <div className={styles.inner}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.dot} aria-hidden />
            <h2 className={styles.panelTitle}>Search Manufacturers</h2>
          </div>
          <div className={styles.tileRow}>
            {showMakes.map((make) => (
              <button
                key={make}
                type="button"
                className={styles.tile}
                onClick={() => goMake(make)}
                aria-label={`Browse ${make} stock`}
              >
                <span className={styles.tileLabel}>{make}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.dot} aria-hidden />
            <h2 className={styles.panelTitle}>Search Body Types</h2>
          </div>
          <div className={styles.tileRow}>
            {BODY_TYPES.map((body) => (
              <button
                key={body.key}
                type="button"
                className={`${styles.tile} ${styles.tileBody}`}
                onClick={() => goBody(body.label)}
                aria-label={`Browse ${body.label} stock`}
              >
                <span className={styles.bodyIcon} aria-hidden data-body={body.key} />
                <span className={styles.tileLabel}>{body.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
