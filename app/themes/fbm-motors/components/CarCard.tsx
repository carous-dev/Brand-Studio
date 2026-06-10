import Link from 'next/link'
import type { Car } from '../lib/cars'
import styles from './CarCard.module.css'

export function CarCard({ car }: { car: Car }) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={car.image}
          alt={car.name}
          loading="lazy"
          className={styles.image}
        />
        <div className={styles.mediaOverlay} aria-hidden />
        <span className={styles.warrantyBadge}>3-MO WARRANTY</span>
        <span className={styles.priceBadge}>£{car.price.toLocaleString()}</span>
        {car.reserved && (
          <div className="fbm-stamp-reserved">
            <span className="fbm-stamp-reserved-pill">VEHICLE RESERVED</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{car.name}</h3>
        <dl className={styles.specs}>
          <div className={styles.spec}><span className={styles.dot} aria-hidden /><dt className="sr-only">Year</dt><dd>{car.year}</dd></div>
          <div className={styles.spec}><span className={styles.dot} aria-hidden /><dt className="sr-only">Mileage</dt><dd>{car.mileage}</dd></div>
          <div className={styles.spec}><span className={styles.dot} aria-hidden /><dt className="sr-only">Colour</dt><dd>{car.colour}</dd></div>
          <div className={styles.spec}><span className={styles.dot} aria-hidden /><dt className="sr-only">Spec</dt><dd>{car.fuel} · {car.gearbox}</dd></div>
        </dl>
        <Link href="/contact" className={styles.enquire}>
          Enquire about this car →
        </Link>
      </div>
    </article>
  )
}

export default CarCard
