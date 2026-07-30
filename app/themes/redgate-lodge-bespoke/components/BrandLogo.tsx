'use client'

import { useState } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './BrandLogo.module.css'

type BrandLogoProps = {
  height?: number
  className?: string
  /**
   * 'plaque' constrains the wordmark to the fixed-width house plaque: it wraps
   * a long serif brand name to multiple centred lines (tightened line-height +
   * slightly smaller size) instead of overflowing the plaque and clipping the
   * leading letter. 'default' keeps the single-line nowrap wordmark used in the
   * mobile nav row and overlay head.
   */
  variant?: 'default' | 'plaque'
}

/**
 * 2-tier brand logo: brand.logo -> serif wordmark. A brand logo renders as a
 * plain <img> (never a CSS mask); if it 404s, onError degrades to the wordmark.
 * This theme ships NO raster theme default by design — the operator's real
 * Redgate mark is white-on-transparent (built for a dark header) and would be
 * invisible on the ivory plaque, and a known-404 raster tier produced a
 * broken-image box. The styled EB Garamond wordmark IS the theme default.
 */
export default function BrandLogo({ height = 44, className, variant = 'default' }: BrandLogoProps) {
  const brand = useBrand()
  const brandName = brand?.name || 'The showroom'
  const brandLogo = (brand as any)?.logo as string | undefined

  const [primaryFailed, setPrimaryFailed] = useState(false)

  const showWordmark = !brandLogo || primaryFailed
  const isPlaque = variant === 'plaque'

  return (
    <span
      className={[styles.wrap, isPlaque && styles.wrapPlaque, className]
        .filter(Boolean)
        .join(' ')}
    >
      {brandLogo && !primaryFailed && (
        <img
          src={brandLogo}
          alt={brandName}
          style={{ maxHeight: height }}
          className={styles.img}
          onError={() => setPrimaryFailed(true)}
        />
      )}
      {showWordmark && (
        <span className={[styles.wordmark, isPlaque && styles.wordmarkPlaque].filter(Boolean).join(' ')}>
          {brandName}
        </span>
      )}
    </span>
  )
}
