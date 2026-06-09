'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { fetchMakesInStock, type MakeStockEntry } from '../lib/makes-stock'
import { simpleIconsLogoUrl } from '../lib/make-logos'
import styles from './BrowseByMakes.module.css'

type Status = 'idle' | 'loading' | 'ready'

const MAX_MAKES = 12

export default function BrowseByMakes() {
  const brand = useBrand()
  const brandSlug = brand?.slug || ''
  const [makes, setMakes] = useState<MakeStockEntry[]>([])
  const [status, setStatus] = useState<Status>('idle')

  // audit-ignore: data-useeffect-fetch — brand context is client-side; this
  // section mounts in Shell so useBrand() is the canonical source.
  useEffect(() => {
    if (!brandSlug) return
    const ctrl = new AbortController()
    setStatus('loading')

    fetchMakesInStock(brandSlug, { signal: ctrl.signal })
      .then(entries => {
        setMakes(entries.slice(0, MAX_MAKES))
        setStatus('ready')
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        setStatus('ready')
      })

    return () => ctrl.abort()
  }, [brandSlug])

  if (status === 'ready' && makes.length === 0) return null

  const totalBrands = makes.length
  const totalCars = makes.reduce((sum, m) => sum + (m.count || 0), 0)

  return (
    <section
      className={styles.section}
      aria-labelledby="warwick-makes-heading"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>Our Stock</span>
          <h2 id="warwick-makes-heading" className={styles.heading}>
            Browse by Make
          </h2>
          {status === 'ready' && (
            <p className={styles.lead}>
              {totalBrands} {totalBrands === 1 ? 'brand' : 'brands'}
              {totalCars > 0 ? (
                <>
                  {' · '}
                  {totalCars} {totalCars === 1 ? 'car' : 'cars'} in stock
                </>
              ) : null}
              {' — jump straight to the manufacturer you’re after.'}
            </p>
          )}
        </header>

        <ul className={styles.grid} role="list">
          {status === 'loading'
            ? Array.from({ length: 8 }).map((_, i) => (
                <li
                  key={`sk-${i}`}
                  className={`${styles.tile} ${styles.tileSkeleton}`}
                  aria-hidden="true"
                >
                  <span className={styles.tileBadge} />
                  <span className={styles.tileText}>
                    <span className={styles.skelLine} />
                    <span className={`${styles.skelLine} ${styles.skelLineShort}`} />
                  </span>
                </li>
              ))
            : makes.map(entry => (
                <li key={entry.slug} className={styles.tileWrap}>
                  <Link
                    href={`/used-cars?make=${encodeURIComponent(entry.name)}`}
                    className={styles.tile}
                    aria-label={`Browse ${entry.count} ${entry.name} ${entry.count === 1 ? 'vehicle' : 'vehicles'} in stock`}
                  >
                    <span className={styles.tileBadge} aria-hidden="true">
                      {entry.logoSlug ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={simpleIconsLogoUrl(entry.logoSlug)}
                          alt=""
                          width={28}
                          height={28}
                          loading="lazy"
                          decoding="async"
                          className={styles.tileLogoImg}
                        />
                      ) : (
                        <span className={styles.tileMonogram}>
                          {entry.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className={styles.tileText}>
                      <span className={styles.makeName}>{entry.name}</span>
                      <span className={styles.makeCount}>
                        {entry.count > 0
                          ? `${entry.count} ${entry.count === 1 ? 'car' : 'cars'}`
                          : 'In stock'}
                      </span>
                    </span>
                    <span className={styles.tileArrow} aria-hidden="true">
                      <ArrowRight size={18} />
                    </span>
                  </Link>
                </li>
              ))}
        </ul>

        <div className={styles.footer}>
          <Link href="/used-cars" className={styles.viewAllCta}>
            View all stock
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
