'use client'

/**
 * <BrandMedia> — the single renderer for a theme media slot (image OR video).
 *
 * Resolves the slot via `resolveMedia(recipe, brand, key)` and renders:
 *   - image slot  → <img> (optimized src)
 *   - video slot  → poster <img> on the server + first client paint, then
 *     PROGRESSIVELY UPGRADES to an autoplaying muted-inline <video> only on
 *     capable clients (wide screens, motion allowed, a clip present).
 *
 * The progressive-enhancement approach keeps SSR output === first client paint
 * (no hydration mismatch) and honours the theme floors:
 *   - prefers-reduced-motion → never autoplay; poster still only
 *   - ≤640px (mobile) → poster still only (modest, no heavy autoplay video)
 *   - missing clip → poster still only
 * so a video slot is never blank and never janky. See docs/theme-contract.md.
 */

import { useEffect, useState, type CSSProperties } from 'react'
import type { BrandConfig } from '@/brands/types'
import { resolveMedia, type MediaRecipe } from '@/app/themes/lib/theme-images'

type RecipeLike = MediaRecipe | MediaRecipe['slots'] | null | undefined

export interface BrandMediaProps {
  recipe: RecipeLike
  brand: BrandConfig | null | undefined
  /** Media-recipe slot key. */
  slotKey: string
  /** Applied to the rendered <img>/<video> (sizing/positioning live here). */
  className?: string
  style?: CSSProperties
  /** Alt text for image slots / poster (video is decorative background by default). */
  alt?: string
  /** Min viewport width (px) at which a video slot may autoplay. Default 641. */
  videoMinWidth?: number
  /**
   * For video slots: when the clip isn't playing (reduced-motion / mobile /
   * missing clip), render the poster still. Set false when the surrounding
   * markup already shows the still (e.g. a CSS `background-image`) so the poster
   * isn't loaded twice. Default true.
   */
  renderPosterFallback?: boolean
}

const FILL_STYLE: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }

export default function BrandMedia({
  recipe,
  brand,
  slotKey,
  className,
  style,
  alt = '',
  videoMinWidth = 641,
  renderPosterFallback = true,
}: BrandMediaProps) {
  const media = resolveMedia(recipe, brand, slotKey)
  const mergedStyle = { ...FILL_STYLE, ...style }

  // Video slots start as their poster still (SSR-safe) and only mount the clip
  // once the client confirms it's allowed to.
  const [playVideo, setPlayVideo] = useState(false)

  const isVideo = media.type === 'video'
  const canConsiderVideo = isVideo && media.autoplay && !!media.url

  useEffect(() => {
    if (!canConsiderVideo || typeof window === 'undefined' || !window.matchMedia) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const wide = window.matchMedia(`(min-width: ${videoMinWidth}px)`)
    const decide = () => setPlayVideo(!reduce.matches && wide.matches)
    decide()
    reduce.addEventListener?.('change', decide)
    wide.addEventListener?.('change', decide)
    return () => {
      reduce.removeEventListener?.('change', decide)
      wide.removeEventListener?.('change', decide)
    }
  }, [canConsiderVideo, videoMinWidth])

  if (isVideo) {
    if (playVideo) {
      return (
        <video
          className={className}
          style={mergedStyle}
          poster={media.poster || undefined}
          autoPlay
          muted
          playsInline
          loop={media.loop}
          preload="metadata"
          aria-hidden="true"
        >
          <source src={media.url} />
        </video>
      )
    }
    // Poster still (SSR + reduced-motion + mobile + missing clip).
    if (!renderPosterFallback || !media.poster) return null
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} style={mergedStyle} src={media.poster} alt={alt} />
  }

  if (!media.url) return null
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} style={mergedStyle} src={media.url} alt={alt} />
}
