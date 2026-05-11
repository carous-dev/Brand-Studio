'use client'

import Link from 'next/link'
import { Heart, ArrowUpRight, Trash2 } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import VehicleCard from '../../components/VehicleCard'
import styles from './page.module.css'

export default function WishlistIsland() {
  const { wishlist, clearWishlist } = useGarage()

  return (
    <article>
      <section className="shr-page-hero shr-page-hero--wishlist">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Wishlist</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Your saved vehicles.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Keep an eye on the cars you&apos;re thinking about. Drop in any time — we&apos;ll let you
            know if anything looks like it&apos;s about to walk out the door.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.wishlistSection}`}>
        <div className="shr-container">
          {wishlist.length === 0 ? (
            <div className={styles.empty}>
              <Heart size={48} strokeWidth={1.6} aria-hidden />
              <h2>Nothing saved yet.</h2>
              <p>Tap the heart on any stock card to save a vehicle here.</p>
              <Link href="/used-cars" className="shr-btn-primary">Browse stock</Link>
            </div>
          ) : (
            <>
              <div className={styles.toolbar}>
                <p>
                  <Heart size={16} strokeWidth={2.2} aria-hidden /> {wishlist.length} saved vehicle{wishlist.length === 1 ? '' : 's'}
                </p>
                <button type="button" className={styles.clearAll} onClick={clearWishlist}>
                  <Trash2 size={14} strokeWidth={2.2} aria-hidden />
                  Clear all
                </button>
              </div>
              <div className={styles.grid}>
                {wishlist.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
              <div className={styles.footnote}>
                Saved across sessions on this device. Sign in (coming soon) to sync across devices.
              </div>
            </>
          )}
        </div>
      </section>
    </article>
  )
}
