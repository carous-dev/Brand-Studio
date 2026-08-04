'use client'
// audit-ignore-file: perf-raw-img, perf-img-no-dimensions
// Gallery images are dynamic remote URLs (per-vehicle feed); next/image can't
// statically size them and the detail page already opts out of the raw-img gate.

import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './VehicleGallery.module.css'

type Props = {
  images: string[]
  alt: string
}

/** Distance (px) a pointer must travel before a press is read as a swipe, not a tap. */
const SWIPE_COMMIT = 56
/** Below this, a pointer-up counts as a tap (open lightbox) rather than a drag. */
const TAP_SLOP = 6
/** Individual pill dots up to this count; beyond it we show a scrubber progress bar. */
const DOT_LIMIT = 10

const Chevron = ({ dir }: { dir: 'prev' | 'next' }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {dir === 'prev' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
  </svg>
)

const ExpandIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
  </svg>
)

export default function VehicleGallery({ images, alt }: Props) {
  const slides = images.length ? images : ['']
  const count = slides.length

  const [index, setIndex] = useState(0)
  const [dragDX, setDragDX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [lightbox, setLightbox] = useState(false)

  // Pointer bookkeeping shared by inline + lightbox viewports.
  const pointer = useRef({ id: -1, startX: 0, startY: 0, width: 1, moved: 0, active: false })
  const thumbsRef = useRef<HTMLDivElement | null>(null)

  const clamp = useCallback((i: number) => (i + count) % count, [count])
  const goTo = useCallback((i: number) => setIndex(clamp(i)), [clamp])
  const next = useCallback(() => setIndex((i) => clamp(i + 1)), [clamp])
  const prev = useCallback(() => setIndex((i) => clamp(i - 1)), [clamp])

  // Keep the active thumbnail scrolled into view as the slide changes.
  useEffect(() => {
    const rail = thumbsRef.current
    if (!rail) return
    const active = rail.children[index] as HTMLElement | undefined
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [index])

  // Lightbox: lock scroll + keyboard nav.
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false)
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [lightbox, next, prev])

  const onPointerDown = (e: React.PointerEvent) => {
    if (count < 2) return
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture?.(e.pointerId)
    pointer.current = { id: e.pointerId, startX: e.clientX, startY: e.clientY, width: el.clientWidth || 1, moved: 0, active: true }
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const p = pointer.current
    if (!p.active || e.pointerId !== p.id) return
    const dx = e.clientX - p.startX
    const dy = e.clientY - p.startY
    p.moved = Math.max(p.moved, Math.abs(dx))
    // Once clearly horizontal, follow the finger; resist at the ends for a rubber feel.
    if (Math.abs(dx) > Math.abs(dy)) {
      setDragDX(dx)
    }
  }

  const endDrag = (e: React.PointerEvent) => {
    const p = pointer.current
    if (!p.active || e.pointerId !== p.id) return
    const dx = e.clientX - p.startX
    p.active = false
    setDragging(false)
    setDragDX(0)
    if (Math.abs(dx) > SWIPE_COMMIT) {
      if (dx < 0) next()
      else prev()
    } else if (p.moved <= TAP_SLOP && !lightbox) {
      setLightbox(true)
    }
  }

  const hasPhoto = Boolean(slides[0])
  const trackStyle = {
    transform: `translate3d(calc(${-index * 100}% + ${dragDX}px), 0, 0)`,
    transition: dragging ? 'none' : undefined,
  }

  const renderTrack = (variant: 'inline' | 'lightbox') => (
    <div
      className={styles.viewport}
      data-variant={variant}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      role="group"
      aria-roledescription="carousel"
      aria-label={`${alt} photo ${index + 1} of ${count}`}
    >
      <div className={styles.track} style={trackStyle}>
        {slides.map((src, i) =>
          src ? (
            <div className={styles.slide} key={`${src}-${i}`}>
              <img
                src={src}
                alt={i === index ? alt : ''}
                draggable={false}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ) : (
            <div className={styles.slide} key={`empty-${i}`}>
              <span className={styles.placeholder}>Photo coming soon</span>
            </div>
          )
        )}
      </div>

      <span className={styles.sheen} aria-hidden="true" />

      {count > 1 && (
        <>
          <button
            type="button"
            className={`${styles.nav} ${styles.navPrev}`}
            onClick={(e) => { e.stopPropagation(); prev() }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Previous photo"
          >
            <Chevron dir="prev" />
          </button>
          <button
            type="button"
            className={`${styles.nav} ${styles.navNext}`}
            onClick={(e) => { e.stopPropagation(); next() }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Next photo"
          >
            <Chevron dir="next" />
          </button>
        </>
      )}

      <span className={styles.counter} aria-hidden="true">
        <b>{index + 1}</b><i>/</i>{count}
      </span>

      {variant === 'inline' && hasPhoto && (
        <button
          type="button"
          className={styles.expand}
          onClick={(e) => { e.stopPropagation(); setLightbox(true) }}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label="View photos full screen"
        >
          <ExpandIcon /> Full screen
        </button>
      )}
    </div>
  )

  const renderDots = (variant: 'inline' | 'lightbox') => {
    if (count < 2) return null
    if (count > DOT_LIMIT) {
      return (
        <div className={styles.progress} data-variant={variant} aria-hidden="true">
          <span className={styles.progressFill} style={{ width: `${((index + 1) / count) * 100}%` }} />
        </div>
      )
    }
    return (
      <div className={styles.dots} data-variant={variant} role="tablist" aria-label="Choose photo">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Go to photo ${i + 1}`}
            className={`${styles.dot} ${i === index ? styles.dotActive : ''}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.gallery}>
      {renderTrack('inline')}
      {renderDots('inline')}

      {count > 1 && (
        <div className={styles.thumbs} ref={thumbsRef}>
          {slides.map((src, i) =>
            src ? (
              <button
                key={`${src}-thumb-${i}`}
                type="button"
                className={`${styles.thumb} ${i === index ? styles.thumbActive : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
              >
                <img src={src} alt="" loading="lazy" draggable={false} />
              </button>
            ) : null
          )}
        </div>
      )}

      {lightbox && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={(e) => { if (e.target === e.currentTarget) setLightbox(false) }}
        >
          <button type="button" className={styles.lightboxClose} onClick={() => setLightbox(false)} aria-label="Close photo viewer">✕</button>
          {renderTrack('lightbox')}
          {renderDots('lightbox')}
        </div>
      )}
    </div>
  )
}
