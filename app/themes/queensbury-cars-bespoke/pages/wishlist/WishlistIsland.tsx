'use client'

import Link from 'next/link'
import { useGarage } from '../../context/GarageContext'
import VehicleCard from '../../components/VehicleCard'
import styles from './WishlistIsland.module.css'

export default function WishlistIsland() {
  const garage = useGarage()
  const list = garage.wishlist

  if (list.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Wishlist is empty.</h2>
        <p>Tap the heart on any car to save it here. Easier to come back to later.</p>
        <Link href="/used-cars" className="qb-btn qb-btn--gradient">
          Browse stock
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.actionsRow} data-aos="fade-up">
        <p className={styles.summary}>
          <strong>{list.length}</strong> saved {list.length === 1 ? 'car' : 'cars'}.
        </p>
        <button type="button" className="qb-btn qb-btn--ghost qb-btn--sm" onClick={() => garage.clearWishlist()}>
          Clear wishlist
        </button>
      </div>

      <div className={styles.grid}>
        {list.map((v, i) => (
          <div key={v.id} data-aos="fade-up" data-aos-delay={i * 50}>
            <VehicleCard
              vehicle={{
                id: v.id,
                slug: v.slug,
                title: v.title,
                price: v.price,
                year: v.year,
                mileage: v.mileage,
                fuel: v.fuel,
                transmission: v.transmission,
                body: v.body,
                make: v.make,
                color: v.color,
                doors: v.doors,
                image: v.image,
              } as any}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
