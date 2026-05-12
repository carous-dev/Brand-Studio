'use client'

import { useState } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './BrandLogo.module.css'

type Tone = 'light' | 'dark' | 'auto'

type BrandLogoProps = {
  tone?: Tone
  height?: number
  className?: string
  showTagline?: boolean
}

const THEME_LOGO = '/themes/kain-motors-bespoke/logo.png'
const FALLBACK_TAGLINE = 'Where Quality Service Meets Affordable Prices'

export default function BrandLogo({ tone = 'dark', height = 44, className, showTagline = false }: BrandLogoProps) {
  const brand = useBrand()
  const brandName = brand?.name || 'Kain Motors'
  const brandLogo = (brand as any)?.logo as string | undefined
  const tagline = (brand as any)?.tagline || FALLBACK_TAGLINE

  const [primaryFailed, setPrimaryFailed] = useState(false)
  const [themeFailed, setThemeFailed] = useState(false)

  const showWordmark = (!brandLogo || primaryFailed) && themeFailed
  const showThemeDefault = (!brandLogo || primaryFailed) && !themeFailed

  return (
    <span className={[styles.wrap, styles[`tone-${tone}`], className].filter(Boolean).join(' ')}>
      {!primaryFailed && brandLogo && (
        <img
          src={brandLogo}
          alt={brandName}
          style={{ height }}
          className={styles.img}
          onError={() => setPrimaryFailed(true)}
        />
      )}
      {showThemeDefault && (
        <img
          src={THEME_LOGO}
          alt={brandName}
          style={{ height }}
          className={styles.img}
          onError={() => setThemeFailed(true)}
        />
      )}
      {showWordmark && (
        <span className={styles.wordmarkBlock} style={{ height }}>
          <span className={styles.wordmark}>{brandName}</span>
          {showTagline && <span className={styles.tagline}>{tagline}</span>}
        </span>
      )}
    </span>
  )
}
