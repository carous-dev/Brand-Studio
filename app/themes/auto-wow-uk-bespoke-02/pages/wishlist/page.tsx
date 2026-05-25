'use client'
// audit-ignore-file: tp-use-client-on-page — wishlist depends on client-only useGarage state.

import Link from 'next/link'
import { ArrowRight, Heart, Trash2 } from 'lucide-react'
import { useGarage } from '../../context/GarageContext'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import styles from './page.module.css'

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value || 0)

const toSlug = (value: string) =>
  String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function AutoWishlistPage() {
  const { wishlist, toggleWishlist } = useGarage()

  return (
    <main>
      <section className="auto-page-hero auto-page-hero--about" aria-label="Wishlist hero">
        <div className="auto-page-hero-inner">
          <span className="auto-page-hero-eyebrow">[ Wishlist ]</span>
          <h1>Your shortlist</h1>
          <p>Save what catches your eye — pick it back up whenever you&apos;re ready.</p>
        </div>
      </section>

      <section className={`auto-section ${styles.section}`}>
        <div className={styles.inner}>
          {wishlist.length === 0 ? (
            <div className={styles.empty}>
              <Heart size={48} strokeWidth={1.5} />
              <h2>Nothing saved yet</h2>
              <p>Tap the heart icon on any vehicle card and it&apos;ll land here.</p>
              <Link href="/used-cars" className="auto-btn auto-btn--primary mfx-shimmer">
                Browse stock
                <ArrowRight size={18} strokeWidth={2} />
              </Link>
            </div>
          ) : (
            <>
              <header className={styles.header}>
                <h2>{wishlist.length} car{wishlist.length > 1 ? 's' : ''} saved</h2>
                <Link href="/used-cars" className="auto-cta-link">Add more <ArrowRight size={14} strokeWidth={2} /></Link>
              </header>

              <div className={styles.grid}>
                {wishlist.map((v) => (
                  <article key={v.id} className={styles.card}>
                    <Link
                      href={buildVehiclePermalink({ slug: v.slug || toSlug(v.title), reg: v.reg }, '/used-cars')}
                      className={styles.cardLink}
                      aria-label={`View ${v.title}`}
                    >
                      <span className={styles.srOnly}>View details</span>
                    </Link>
                    <div className={styles.image} style={{ backgroundImage: `url(${v.image})` }} role="img" aria-label={v.title} />
                    <div className={styles.body}>
                      <h3>{v.title}</h3>
                      <p className={styles.meta}>{v.year} · {v.fuel} · {v.transmission}</p>
                      <p className={styles.price}>{formatPrice(v.price || 0)}</p>
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleWishlist(v)
                      }}
                      aria-label={`Remove ${v.title} from wishlist`}
                    >
                      <Trash2 size={15} strokeWidth={1.8} />
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
