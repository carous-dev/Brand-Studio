'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { useBrand } from '../../../context/BrandClientWrapper'
import { resolveText } from '../../../lib/brand-text'
import { optimizeImageUrl } from '@/app/lib/imageOptimize'
import styles from './page.module.css'

/**
 * GalleryMosaic — the theme's LOCAL gallery (build-rules §11: gallery stays
 * local even though enquiry/reserve use CDN widgets). One component, two
 * layouts driven purely by CSS media queries:
 *
 *   ≤767: a scroll-snap swipe carousel with a thumb scroll rail below and a
 *         "+N photos" pill that opens the lightbox (build-rules §8 — rows that
 *         can't stack become a rail, never a shrunken grid).
 *   ≥768: a full-bleed mosaic — one big image left + a 2×2 thumb grid right,
 *         "Gallery (N)" pill on the last thumb.
 *
 * Zero images degrades to a "Photos coming soon" panel on surface/muted — never
 * a broken mosaic. Lightbox chrome is the one allowed literal-scrim case.
 */

const MOSAIC_TILES = 5 // 1 main + 2x2 thumbs

export default function GalleryMosaic({ images, alt }: { images: string[]; alt: string }) {
  const brand = useBrand()
  const photosSoon = resolveText(brand, 'detail.photos_soon') || 'Photos coming soon'
  // resolveText() interpolates brand {tokens} and BLANKS any it doesn't own —
  // including the component-scoped {count} — so substituting AFTER it yields
  // "Gallery ()". Seed the real photo count into the template first, then let
  // resolveText resolve any brand tokens around it (same seed-then-resolve
  // pattern PageRibbon uses for its count line).
  const pillOverride =
    typeof (brand as any)?.text?.['detail.gallery_pill'] === 'string'
      ? String((brand as any).text['detail.gallery_pill'])
      : ''
  const pillTemplate = pillOverride || 'Gallery ({count})'
  const seededBrand = {
    ...(brand as any),
    text: {
      ...((brand as any)?.text || {}),
      'detail.gallery_pill': pillTemplate.replace('{count}', String(images.length)),
    },
  }
  const pillLabel = resolveText(seededBrand, 'detail.gallery_pill') || `Gallery (${images.length})`

  const [active, setActive] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const scrollRaf = useRef<number | null>(null)

  const total = images.length
  const isOpen = lightboxIndex !== null

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const step = useCallback(
    (dir: 1 | -1) => setLightboxIndex((current) => (current === null ? current : (current + dir + total) % total)),
    [total],
  )

  // Keep the "+N" pill / thumb-rail highlight in sync with the swipe carousel.
  const handleTrackScroll = useCallback(() => {
    const node = trackRef.current
    if (!node) return
    if (scrollRaf.current !== null) window.cancelAnimationFrame(scrollRaf.current)
    scrollRaf.current = window.requestAnimationFrame(() => {
      const width = node.clientWidth || 1
      const next = Math.round(node.scrollLeft / width)
      setActive((current) => (current === next ? current : next))
    })
  }, [])

  const scrollToIndex = useCallback((index: number) => {
    const node = trackRef.current
    if (!node) return
    node.scrollTo({ left: node.clientWidth * index, behavior: 'smooth' })
    setActive(index)
  }, [])

  // Lightbox: body-scroll lock + keyboard controls.
  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox()
      else if (event.key === 'ArrowRight') step(1)
      else if (event.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, step, closeLightbox])

  if (total === 0) {
    return (
      <div className={styles.galleryEmpty} role="img" aria-label={photosSoon}>
        <span>{photosSoon}</span>
      </div>
    )
  }

  const mosaicMain = images[0]
  const mosaicThumbs = images.slice(1, MOSAIC_TILES)
  const hasMoreThanMosaic = total > MOSAIC_TILES

  return (
    <>
      {/* ≤767 — swipe carousel + thumb rail */}
      <div className={styles.galleryMobile}>
        <div
          className={styles.carouselTrack}
          ref={trackRef}
          onScroll={handleTrackScroll}
          aria-label={`${alt} — photo gallery`}
        >
          {images.map((src, index) => (
            <button
              type="button"
              className={styles.carouselSlide}
              key={`slide-${index}`}
              onClick={() => openLightbox(index)}
              aria-label={`View photo ${index + 1} of ${total}`}
            >
              <img
                src={optimizeImageUrl(src, { width: 1280 })}
                alt={`${alt} — photo ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </button>
          ))}
          <span className={styles.carouselPill} aria-hidden="true">
            {active + 1} / {total}
          </span>
          <button
            type="button"
            className={styles.carouselExpand}
            onClick={() => openLightbox(active)}
            aria-label="Open full-screen gallery"
          >
            <Expand size={15} strokeWidth={2} aria-hidden="true" />
            <span>{pillLabel}</span>
          </button>
        </div>

        <div className={styles.thumbRail} role="tablist" aria-label="Photo thumbnails">
          {images.map((src, index) => (
            <button
              type="button"
              key={`thumb-${index}`}
              className={`${styles.thumb} ${active === index ? styles.thumbActive : ''}`.trim()}
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to photo ${index + 1}`}
              aria-selected={active === index}
              role="tab"
            >
              <img src={optimizeImageUrl(src, { width: 640 })} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      {/* ≥768 — mosaic: 1 main + 2x2 thumbs */}
      <div className={styles.galleryMosaic}>
        {/* Furnishing (luxury→refined): the hero photo tile gets a cursor-reactive
            mfx-spotlight (soft brand-light bloom that follows the pointer) plus a
            clipped ken-burns on hover below. Self-freezes under reduced-motion +
            ≤720px (the mosaic itself only renders ≥768). */}
        <button
          type="button"
          className={`${styles.mosaicTile} ${styles.mosaicMain} mfx-spotlight ${mosaicThumbs.length === 0 ? styles.mosaicFull : ''}`.trim()}
          onClick={() => openLightbox(0)}
          aria-label={`View ${alt}, photo 1 of ${total}`}
        >
          <img src={optimizeImageUrl(mosaicMain, { width: 1280 })} alt={`${alt} — photo 1`} loading="eager" />
        </button>
        {mosaicThumbs.map((src, i) => {
          const index = i + 1
          const isLast = i === mosaicThumbs.length - 1
          return (
            <button
              type="button"
              key={`mosaic-${index}`}
              className={styles.mosaicTile}
              onClick={() => openLightbox(index)}
              aria-label={`View ${alt}, photo ${index + 1} of ${total}`}
            >
              <img src={optimizeImageUrl(src, { width: 640 })} alt={`${alt} — photo ${index + 1}`} loading="lazy" />
              {isLast ? (
                <span className={styles.mosaicPill}>
                  {hasMoreThanMosaic ? `+${total - MOSAIC_TILES + 1}` : ''} {pillLabel}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Lightbox — the one allowed literal-scrim surface (photo-scrim-ok). */}
      {isOpen ? (
        <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label={`${alt} gallery`}>
          {/* audit-ignore: a11y-div-as-button — backdrop; dialog has Escape + close button */}
          <div className={styles.lightboxBackdrop} onClick={closeLightbox} aria-hidden="true" />
          <button type="button" className={styles.lightboxClose} onClick={closeLightbox} aria-label="Close gallery">
            <X size={20} strokeWidth={2} aria-hidden="true" />
          </button>
          <p className={styles.lightboxCounter} aria-live="polite">
            {(lightboxIndex ?? 0) + 1} / {total}
          </p>
          {total > 1 ? (
            <>
              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                onClick={() => step(-1)}
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} strokeWidth={2} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={() => step(1)}
                aria-label="Next photo"
              >
                <ChevronRight size={24} strokeWidth={2} aria-hidden="true" />
              </button>
            </>
          ) : null}
          <figure className={styles.lightboxStage}>
            <img
              src={optimizeImageUrl(images[lightboxIndex ?? 0], { width: 1920 })}
              alt={`${alt} — photo ${(lightboxIndex ?? 0) + 1}`}
            />
          </figure>
        </div>
      ) : null}
    </>
  )
}
