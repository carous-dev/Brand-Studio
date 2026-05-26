'use client'

import React from 'react'
import styles from './Skeleton.module.css'

type Variant = 'light' | 'dark'
type BarProps = {
  width?: string | number
  height?: string | number
  radius?: string | number
  variant?: Variant
  className?: string
  style?: React.CSSProperties
}

export function SkeletonBar({
  width = '100%',
  height = 14,
  radius = 4,
  variant = 'light',
  className,
  style,
}: BarProps) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={`${styles.bar} ${variant === 'dark' ? styles.barDark : ''} ${className || ''}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: typeof radius === 'number' ? `${radius}px` : radius,
        ...style,
      }}
    />
  )
}

export function SkeletonTextLines({
  count = 3,
  variant = 'light',
  widths,
}: {
  count?: number
  variant?: Variant
  widths?: string[]
}) {
  const lines = Array.from({ length: count }, (_, i) => widths?.[i] || (i === count - 1 ? '60%' : '100%'))
  return (
    <div className={styles.lines} aria-hidden="true">
      {lines.map((w, i) => (
        <SkeletonBar key={i} width={w} height={i === 0 ? 18 : 12} variant={variant} />
      ))}
    </div>
  )
}

export function SkeletonVehicleCard({ variant = 'light' }: { variant?: Variant }) {
  return (
    <article
      className={`${styles.card} ${variant === 'dark' ? styles.cardDark : ''}`}
      aria-busy="true"
      aria-label="Loading vehicle"
    >
      <div className={styles.cardImage}>
        <SkeletonBar width="100%" height="100%" radius={0} variant={variant} />
      </div>
      <div className={styles.cardBody}>
        <SkeletonBar width="85%" height={18} variant={variant} />
        <SkeletonBar width="55%" height={14} variant={variant} />
        <div className={styles.cardSpecs}>
          <SkeletonBar width="22%" height={12} variant={variant} />
          <SkeletonBar width="22%" height={12} variant={variant} />
          <SkeletonBar width="22%" height={12} variant={variant} />
        </div>
        <div className={styles.cardFooter}>
          <SkeletonBar width="35%" height={22} variant={variant} />
          <SkeletonBar width="60px" height={32} radius={4} variant={variant} />
        </div>
      </div>
    </article>
  )
}

export function SkeletonVehicleGrid({ count = 6, variant = 'light' }: { count?: number; variant?: Variant }) {
  return (
    <div className={styles.grid} aria-busy="true" aria-label="Loading vehicles">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonVehicleCard key={i} variant={variant} />
      ))}
    </div>
  )
}

export function SkeletonRail({ count = 4, variant = 'light' }: { count?: number; variant?: Variant }) {
  return (
    <div className={styles.rail} aria-busy="true" aria-label="Loading vehicles">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.railItem}>
          <SkeletonVehicleCard variant={variant} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTickerRow({ count = 6, variant = 'dark' }: { count?: number; variant?: Variant }) {
  return (
    <div className={styles.tickerRow} aria-busy="true" aria-label="Loading live stock">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.tickerItem}>
          <SkeletonBar width={64} height={48} radius={4} variant={variant} />
          <div className={styles.tickerCol}>
            <SkeletonBar width={130} height={14} variant={variant} />
            <SkeletonBar width={86} height={12} variant={variant} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonDetailPage({ variant = 'light' }: { variant?: Variant }) {
  return (
    <div className={styles.detail} aria-busy="true" aria-label="Loading vehicle">
      <div className={styles.detailGallery}>
        <SkeletonBar width="100%" height={420} radius={6} variant={variant} />
        <div className={styles.detailThumbs}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBar key={i} width="100%" height={90} radius={4} variant={variant} />
          ))}
        </div>
      </div>
      <div className={styles.detailSide}>
        <SkeletonBar width="80%" height={28} variant={variant} />
        <SkeletonBar width="40%" height={20} variant={variant} />
        <SkeletonBar width="100%" height={120} radius={6} variant={variant} />
        <SkeletonBar width="100%" height={44} radius={4} variant={variant} />
        <SkeletonBar width="100%" height={44} radius={4} variant={variant} />
      </div>
    </div>
  )
}
