'use client'

import Link from 'next/link'
import { ArrowRight, Heart, Trash2 } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import VehicleCard from '../../components/VehicleCard'
import styles from './page.module.css'

export default function WishlistClient() {
  const garage = useGarage()
  const items = garage?.wishlist || []

  return (
    <>
      <section className="axis-page-hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">Your shortlist</span>
          <h1 className="axis-page-hero-title">Wishlist.</h1>
          <p className="axis-page-hero-lead">
            Cars you've saved for later. Reserve, enquire, or arrange a viewing — we'll hold them for 24 hours.
          </p>
        </div>
      </section>

      <section className="axis-section">
        <div className="axis-shell">
          {items.length === 0 ? (
            <div className={styles.empty} data-aos="fade-up">
              <Heart size={32} strokeWidth={1.4} aria-hidden="true" />
              <h2 className={styles.emptyTitle}>Your wishlist is empty.</h2>
              <p className={styles.emptyBody}>
                Browse our stock and tap the heart icon on any car you'd like to save.
              </p>
              <Link href="/used-cars" className="axis-btn axis-btn--primary">
                Browse the stock
                <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
            </div>
          ) : (
            <>
              <header className={styles.header} data-aos="fade-up">
                <div>
                  <span className="axis-eyebrow">{items.length} saved</span>
                  <h2 className="axis-section-title">Your saved cars.</h2>
                </div>
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={() => garage?.clearWishlist?.()}
                >
                  <Trash2 size={14} strokeWidth={1.8} />
                  Clear wishlist
                </button>
              </header>
              <div className={styles.grid}>
                {items.map((v: any, i: number) => (
                  <div key={v.id} data-aos="fade-up" data-aos-delay={(i % 3) * 60}>
                    <VehicleCard vehicle={v} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
