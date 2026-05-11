"use client"
// audit-ignore-file: tp-use-client-on-page
// Springalls baseline page; Mode B (clone-and-edit) ports inherit this.
// Extracting interactivity into client islands is a known follow-up — same
// risk-management as columbus-vehicles-bespoke/pages/used-cars/[slug]/page.tsx
// (see FEATURE_LOG 2026-05-10 for the Turbopack chunk-item collision rationale).

import Link from "next/link"
import { ArrowRight, GitCompare, Trash2 } from "lucide-react"
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

export function SpringallsComparePage(_props: ThemePageProps) {
  const { compare, removeCompare, clearCompare } = useGarage()

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <HeroBackdrop />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Compare vehicles</p>
          <h1>Side-by-side clarity before you decide</h1>
          <p className={styles.heroLead}>
            Review the essentials across your saved vehicles to make a confident choice.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/used-cars">
              Browse vehicles
            </Link>
            <Link className={styles.secondaryButton} href="/wishlist">
              View wishlist
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Your comparison</p>
              <h2>{compare.length ? `${compare.length} vehicles selected` : "Nothing to compare yet"}</h2>
            </div>
            {compare.length ? (
              <button type="button" className={styles.clearButton} onClick={clearCompare}>
                <Trash2 size={16} strokeWidth={1.8} />
                Clear compare
              </button>
            ) : null}
          </div>

          {compare.length ? (
            <div className={styles.compareGrid}>
              {compare.map((vehicle) => (
                <article key={vehicle.id} className={styles.compareCard}>
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
                        aria-label={`Remove ${vehicle.title} from compare`}
                        onClick={() => removeCompare(vehicle.id)}
                      >
                        <Trash2 size={14} strokeWidth={1.8} />
                      </button>
                    </div>
                    <p className={styles.cardMeta}>{vehicle.make} · {vehicle.body} · {vehicle.color}</p>
                    <dl className={styles.cardSpecs}>
                      <div>
                        <dt>Year</dt>
                        <dd>{vehicle.year}</dd>
                      </div>
                      <div>
                        <dt>Mileage</dt>
                        <dd>{vehicle.mileage.toLocaleString()} mi</dd>
                      </div>
                      <div>
                        <dt>Fuel</dt>
                        <dd>{vehicle.fuel}</dd>
                      </div>
                      <div>
                        <dt>Transmission</dt>
                        <dd>{vehicle.transmission}</dd>
                      </div>
                      <div>
                        <dt>Doors</dt>
                        <dd>{vehicle.doors}</dd>
                      </div>
                      <div>
                        <dt>Location</dt>
                        <dd>{vehicle.location}</dd>
                      </div>
                    </dl>
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
                <GitCompare size={26} strokeWidth={1.6} />
              </div>
              <h3>Start comparing</h3>
              <p>Tap the compare icon on a vehicle card to build your list.</p>
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

export default SpringallsComparePage
