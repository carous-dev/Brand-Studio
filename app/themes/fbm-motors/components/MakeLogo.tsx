'use client'

import { useEffect, useState } from 'react'
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
 * Marque logo from the simple-icons CDN, rendered through a CSS mask so it
 * tints with currentColor (contrast-safe on any brand palette). Makes without
 * an icon fall back to a monogram badge once the probe 404s.
 */
export function MakeLogo({ make }: { make: string }) {
  const url = makeIconUrl(make)
  const [failed, setFailed] = useState(url === null)

  useEffect(() => {
    if (!url) return
    let cancelled = false
    const probe = new Image()
    probe.onerror = () => { if (!cancelled) setFailed(true) }
    probe.src = url
    return () => { cancelled = true }
  }, [url])

  if (failed || !url) {
    return <span className={styles.monogram} aria-hidden="true">{make.trim().charAt(0).toUpperCase()}</span>
  }

  return (
    <span
      className={styles.logo}
      aria-hidden="true"
      style={{
        WebkitMaskImage: `url(${url})`,
        maskImage: `url(${url})`,
      }}
    />
  )
}
