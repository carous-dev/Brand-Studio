import Link from 'next/link'
import { MakeLogo } from './MakeLogo'
import styles from './TopBrands.module.css'

const MAX_BRANDS = 9

export default function TopBrands({ makes }: { makes: string[] }) {
  const shown = makes.filter(Boolean).slice(0, MAX_BRANDS)
  if (shown.length === 0) return null

  return (
    <section className={styles.section} aria-label="Makes we stock">
      <div className={styles.inner}>
        <h2 className={styles.title}>
          <span className={styles.titleDash} aria-hidden />
          <span>We Proudly Carry Top Brands</span>
          <span className={styles.titleDash} aria-hidden />
        </h2>
        <ul className={styles.row}>
          {shown.map((make) => (
            <li key={make} className={styles.cell}>
              <Link
                href={`/used-cars?make=${encodeURIComponent(make)}`}
                className={styles.brand}
                aria-label={`View ${make} stock`}
              >
                <MakeLogo make={make} />
                <span className={styles.brandName}>{make}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
