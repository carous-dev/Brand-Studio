'use client'

import { useState } from 'react'
import styles from './MakeLogo.module.css'

// simple-icons slugs are lowercase alphanumeric; most makes normalise cleanly
// (Land Rover -> landrover, Alfa Romeo -> alfaromeo). Overrides cover the rest.
const SLUG_OVERRIDES: Record<string, string> = {
  mercedesbenz: 'mercedes',
  vw: 'volkswagen',
  ds: 'dsautomobiles',
  rangerover: 'landrover',
}

function makeIconUrl(make: string): string | null {
  // NFD splits accented letters (Citroën -> Citroen + combining mark); the
  // [^a-z0-9] filter then drops the marks along with spaces and hyphens.
  const norm = make
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]/g, '')
  const slug = SLUG_OVERRIDES[norm] || norm
  if (!slug) return null
  return `https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/${slug}.svg`
}

/**
 * Marque logo from the simple-icons CDN. Rendered as a plain <img> (CSS masks
 * of cross-origin SVGs don't paint — see feedback_css_mask_cross_origin_svg),
 * softened via opacity so the monochrome glyphs read as a quiet logo mark.
 * Makes without an icon fall back to a monogram badge when the request 404s.
 */
export function MakeLogo({ make }: { make: string }) {
  const url = makeIconUrl(make)
  const [failed, setFailed] = useState(url === null)

  if (failed || !url) {
    return <span className={styles.monogram} aria-hidden="true">{make.trim().charAt(0).toUpperCase()}</span>
  }

  return (
    <img
      src={url}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={styles.logo}
      onError={() => setFailed(true)}
    />
  )
}

export default MakeLogo
