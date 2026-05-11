'use client'

import { useEffect, useState } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './BrandLogo.module.css'

const THEME_DEFAULT_LOGO = '/themes/showroom-shine-cars-bespoke/logo.png'

type BrandLogoProps = {
  variant?: 'header' | 'footer' | 'mobile'
  className?: string
}

/**
 * Renders the brand's logo with a three-tier fallback:
 *   1. brand.logo (operator-uploaded via dashboard) — same plumbing as hero image
 *   2. Theme default at /themes/<id>/logo.png
 *   3. Text wordmark (rugged italic + condensed-bold sub) — last-resort
 *
 * Wordmark fallback only fires when BOTH images fail to load (img.onError).
 * Matches the hero-image rule from SKILL: dashboard uploads override the
 * theme default, theme default ships with the theme so prospect previews
 * always have something to show.
 */
export default function BrandLogo({ variant = 'header', className }: BrandLogoProps) {
  const brand = useBrand()
  const brandName = brand?.name || 'Showroom Shine Cars'
  const uploadedLogo = typeof brand?.logo === 'string' ? brand.logo.trim() : ''

  const [src, setSrc] = useState(uploadedLogo || THEME_DEFAULT_LOGO)
  const [stage, setStage] = useState<'uploaded' | 'theme-default' | 'wordmark'>(
    uploadedLogo ? 'uploaded' : 'theme-default'
  )

  useEffect(() => {
    setSrc(uploadedLogo || THEME_DEFAULT_LOGO)
    setStage(uploadedLogo ? 'uploaded' : 'theme-default')
  }, [uploadedLogo])

  const handleError = () => {
    if (stage === 'uploaded') {
      setSrc(THEME_DEFAULT_LOGO)
      setStage('theme-default')
    } else if (stage === 'theme-default') {
      setStage('wordmark')
    }
  }

  const wrapperClass = [
    styles.logoWrap,
    styles[`logoWrap_${variant}`],
    className || '',
  ]
    .filter(Boolean)
    .join(' ')

  if (stage === 'wordmark') {
    return (
      <span className={wrapperClass}>
        <span className={styles.wordmarkAccent}>SHOWROOM</span>
        <span className={styles.wordmarkSub}>SHINE CARS</span>
      </span>
    )
  }

  return (
    <span className={wrapperClass}>
      <img
        src={src}
        alt={brandName}
        className={styles.logoImg}
        onError={handleError}
        loading="eager"
        decoding="async"
      />
    </span>
  )
}
