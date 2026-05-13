'use client'

import Link from 'next/link'
import styles from './BrandTrust.module.css'

const CAR_MAKES = [
  'Audi', 'BMW', 'Mercedes-Benz', 'Ford', 'Volkswagen', 'Toyota', 'Honda', 'Volvo', 'Mini', 'Land Rover',
]
const BIKE_MAKES = [
  'Harley-Davidson', 'Yamaha', 'Honda', 'Ducati', 'Kawasaki', 'BMW', 'KTM', 'Suzuki', 'Triumph', 'Aprilia',
]

export default function BrandTrust() {
  return (
    <section className={`dual-section ${styles.section}`} aria-label="Brands we stock">
      <div className="dual-container">
        <header className={styles.head}>
          <span className="dual-eyebrow" data-aos="fade-up">Brands we stock</span>
          <h2 className={styles.title} data-aos="fade-up" data-aos-delay="80">
            From premium saloons to superbikes
          </h2>
        </header>

        <div className={styles.row}>
          <div className={styles.col} data-aos="fade-right">
            <h3 className={styles.colTitle}>
              <span className={styles.colBadge}>Cars</span>
              <span className={styles.colDescriptor}>Premium &amp; everyday</span>
            </h3>
            <ul className={styles.chips}>
              {CAR_MAKES.map((make) => (
                <li key={`car-${make}`}>
                  <Link href={`/used-cars?type=car&make=${encodeURIComponent(make.toLowerCase())}`} className={styles.chip}>
                    {make}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col} data-aos="fade-left">
            <h3 className={styles.colTitle}>
              <span className={styles.colBadge}>Bikes</span>
              <span className={styles.colDescriptor}>Sport · cruiser · adventure</span>
            </h3>
            <ul className={styles.chips}>
              {BIKE_MAKES.map((make) => (
                <li key={`bike-${make}`}>
                  <Link href={`/used-cars?type=bike&make=${encodeURIComponent(make.toLowerCase())}`} className={styles.chip}>
                    {make}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
