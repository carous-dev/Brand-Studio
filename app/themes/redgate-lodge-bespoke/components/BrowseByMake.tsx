'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import { resolveText } from '../lib/brand-text'
import { apiUrl } from '../lib/api'
import styles from './BrowseByMake.module.css'

// Marque logos come from the simple-icons jsDelivr CDN. Slugs are lowercase
// alphanumeric; NFD + [^a-z0-9] drops accents/spaces/hyphens (Citroën ->
// citroen, Land Rover -> landrover). Overrides cover the mismatches.
const SLUG_OVERRIDES: Record<string, string> = {
  mercedesbenz: 'mercedes',
  vw: 'volkswagen',
  ds: 'dsautomobiles',
  rangerover: 'landrover',
}

function makeIconUrl(make: string): string | null {
  const norm = make.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '')
  const slug = SLUG_OVERRIDES[norm] || norm
  if (!slug) return null
  return `https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/${slug}.svg`
}

/**
 * Marque logo tile. Renders the CDN SVG through a PLAIN <img> — NOT a CSS
 * mask: cross-origin simple-icons SVGs paint invisible through `mask-image`
 * (the mask reads as CORS-tainted), a latent bug carried by other themes'
 * MakeLogo components (see memory feedback_css_mask_cross_origin_svg). A plain
 * <img> loads fine cross-origin; on 404/network error it falls back to the
 * make's initial so unknown makes still read.
 */
function ChipLogo({ name }: { name: string }) {
  const url = makeIconUrl(name)
  const [failed, setFailed] = useState(false)
  return (
    <span className={styles.chipInitial} aria-hidden="true">
      {url && !failed ? (
        // audit-ignore: perf-raw-img — external marque SVG; not an inventory
        // slot, and optimizeImageUrl/_next/image can't process simple-icons.
        <img
          className={styles.chipLogoImg}
          src={url}
          alt=""
          width={18}
          height={18}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        name.charAt(0)
      )}
    </span>
  )
}

/**
 * BrowseByMake — the shell-owned directory band (design-language §7). Mounts
 * ONCE between </main> and the footer for every route, satisfying the homepage
 * `directory` slot and the detail-page makes-SEO panel — never per-page.
 *
 * Data plumbing (build-rules §12): a client island reads `meta.available.makes`
 * from a light, brand-scoped inventory probe. `useBrand().slug` threads the
 * `?brand=` param; the makes list is normalised to `string[]` at the boundary
 * (the API sometimes returns `{key,count}[]`). When no makes resolve the band
 * renders nothing, so an empty forecourt never shows an empty directory.
 *
 * Surface grammar (design-language §5/§7): the band sits on `--color-surface`
 * with a single top hairline (the same-token separator from the last route
 * section) and hands off to the footer deep-plate below (hue break). Chips are
 * hairline-bordered 4px tiles with an EB Garamond ledger-numeral-style initial
 * mark — tokens only, so the band reads on the claret palette AND a light
 * throwaway brand. Every string routes through `resolveText`.
 */

export default function BrowseByMake() {
  const brand = useBrand()
  const slug = brand?.slug
  const [makes, setMakes] = useState<string[]>([])

  const eyebrow = resolveText(brand, 'browse.eyebrow')
  const title = resolveText(brand, 'browse.title')

  // audit-ignore: data-useeffect-fetch — client island; brand-scoped fetch runs on mount.
  useEffect(() => {
    if (!slug) return
    let aborted = false
    fetch(apiUrl(`/inventory?brand=${encodeURIComponent(slug)}&per_page=1&light=1`), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (aborted) return
        const raw = data?.meta?.available?.makes
        if (!Array.isArray(raw)) return
        // Normalise to string[] — the boundary sometimes hands back {key,count}[].
        const names = raw
          .map((m: unknown) => (typeof m === 'string' ? m : (m as any)?.key ?? (m as any)?.name))
          .filter((m: unknown): m is string => typeof m === 'string' && m.trim().length > 0)
          .map((m: string) => m.trim())
        const unique = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))
        setMakes(unique.slice(0, 12))
      })
      .catch(() => {})
    return () => {
      aborted = true
    }
  }, [slug])

  if (makes.length === 0) return null

  return (
    <section className={styles.section} aria-labelledby="browse-by-make-heading" data-aos="fade-up">
      <div className={styles.inner}>
        <header className={styles.head}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h2 id="browse-by-make-heading" className={styles.title}>
            {title}
          </h2>
        </header>
        <ul className={styles.grid}>
          {makes.map((name, idx) => (
            <li key={`${name}-${idx}`}>
              <Link href={`/used-cars?make=${encodeURIComponent(name)}`} className={styles.chip}>
                <ChipLogo name={name} />
                <span className={styles.chipName}>{name}</span>
                <span className={styles.chipArrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
