'use client'

import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { useGarage } from '../context/GarageContext'
import PageHero from './PageHero'
import styles from './WishlistView.module.css'

/**
 * Wishlist view — full client component (the entire page IS interactive).
 * Lifted out of pages/wishlist/page.tsx so the page itself can stay a
 * Server Component, dodging the Turbopack 'use client' chunk-item collision
 * with springalls-classic's parallel page.
 */

function fmtPrice(n: number) {
  if (!Number.isFinite(n)) return '—'
  return `£${n.toLocaleString('en-GB')}`
}

export default function WishlistView() {
  const { wishlist, removeWishlist, clearWishlist, wishlistCount } = useGarage()

  return (
    <>
      <PageHero
        eyebrow="Your saved 4×4s"
        title={wishlistCount > 0 ? `${wishlistCount} saved vehicle${wishlistCount === 1 ? '' : 's'}` : 'Your wishlist is empty'}
        lead={wishlistCount > 0
          ? "Vehicles you've saved while browsing. Stock moves fast — get in touch if you want to lock one in or arrange a viewing."
          : "Save 4×4s while you browse and they'll appear here so you can compare and follow up later."}
        imageSlot="hero"
      />

      <section className={styles.section}>
        <div className={styles.inner}>
          {wishlist.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nothing saved yet.</p>
              <Link href="/used-cars" className={styles.cta}>Browse current 4×4 stock</Link>
            </div>
          ) : (
            <>
              <div className={styles.toolbar}>
                <Link href="/used-cars" className={styles.toolbarLink}>← Continue browsing</Link>
                <button type="button" onClick={() => clearWishlist()} className={styles.clearBtn}>
                  Clear all
                </button>
              </div>
              <ul className={styles.grid} role="list">
                {wishlist.map((v) => (
                  <li key={v.id} className={styles.card}>
                    <Link href={v.slug ? `/used-cars/${v.slug}` : '/used-cars'} className={styles.cardMedia}>
                      {v.image ? <img src={v.image} alt={v.title} loading="lazy" /> : <div className={styles.cardPlaceholder} aria-hidden="true" />}
                    </Link>
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>
                        <Link href={v.slug ? `/used-cars/${v.slug}` : '/used-cars'}>{v.title}</Link>
                      </h3>
                      <p className={styles.cardPrice}>{fmtPrice(v.price)}</p>
                      <p className={styles.cardMeta}>
                        <span>{v.year || '—'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{v.mileage ? `${v.mileage.toLocaleString('en-GB')} miles` : '—'}</span>
                      </p>
                      <button
                        type="button"
                        onClick={() => removeWishlist(v.id)}
                        className={styles.removeBtn}
                        aria-label={`Remove ${v.title} from wishlist`}
                      >
                        <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  )
}
