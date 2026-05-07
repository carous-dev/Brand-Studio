"use client"

import Link from "next/link"
import { ArrowRight, Heart, Trash2 } from "lucide-react"
import styles from "./page.module.css"
import { useGarage } from "../../context/GarageContext"
import { buildVehiclePermalink } from "../../lib/vehicle-links"
import { HeroBackdrop } from "../../components/HeroBackdrop"
import type { ThemePageProps } from "../../../types"

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(value)

export function SpringallsWishlistPage(_props: ThemePageProps) {
  const { wishlist, removeWishlist, clearWishlist } = useGarage()

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <HeroBackdrop />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Wishlist</p>
          <h1>Your saved vehicles</h1>
          <p className={styles.heroLead}>
            Keep track of the cars you love and return when you are ready to enquire.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/used-cars">
              Browse vehicles
            </Link>
            <Link className={styles.secondaryButton} href="/compare">
              Compare selection
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Saved list</p>
              <h2>{wishlist.length ? `${wishlist.length} vehicles saved` : "No saved vehicles yet"}</h2>
            </div>
            {wishlist.length ? (
              <button type="button" className={styles.clearButton} onClick={clearWishlist}>
                <Trash2 size={16} strokeWidth={1.8} />
                Clear wishlist
              </button>
            ) : null}
          </div>

          {wishlist.length ? (
            <div className={styles.grid}>
              {wishlist.map((vehicle) => (
                <article key={vehicle.id} className={styles.card}>
                  <div className={styles.cardImage}>
                    <img src={vehicle.image} alt={vehicle.title} loading="lazy" />
                    <span className={styles.cardBadge}>{formatPrice(vehicle.price)}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardTitleRow}>
                      <h3>{vehicle.title}</h3>
                      <button
                        type="button"
                        className={styles.removeButton}
                        aria-label={`Remove ${vehicle.title} from wishlist`}
                        onClick={() => removeWishlist(vehicle.id)}
                      >
                        <Trash2 size={14} strokeWidth={1.8} />
                      </button>
                    </div>
                    <p className={styles.cardMeta}>{vehicle.make} · {vehicle.body} · {vehicle.color}</p>
                    <div className={styles.cardStats}>
                      <span>{vehicle.year}</span>
                      <span>{vehicle.mileage.toLocaleString()} mi</span>
                      <span>{vehicle.fuel}</span>
                    </div>
                    <Link className={styles.cardAction} href={buildVehiclePermalink({ slug: toSlug(vehicle.title), reg: vehicle.reg }, '/used-cars')}>
                      View details
                      <ArrowRight size={16} strokeWidth={2} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.emptyCard}>
              <div className={styles.emptyIcon}>
                <Heart size={26} strokeWidth={1.6} />
              </div>
              <h3>Start saving</h3>
              <p>Tap the heart icon on a vehicle card to build your wishlist.</p>
              <Link className={styles.primaryButton} href="/used-cars">
                Explore stock
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default SpringallsWishlistPage
