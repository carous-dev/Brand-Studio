'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import styles from './VehicleGallery.module.css'

/**
 * Brandstudio global widget — vehicle image gallery.
 * =============================================================================
 *
 * Extracted from the auto-wow-uk-bespoke theme's vehicle detail page so any
 * theme can drop in a full gallery (main viewport + thumb rail + lightbox +
 * keyboard + swipe + body-scroll lock) without re-implementing the state
 * machine.
 *
 * Theme-agnostic via CSS variables — the component renders correctly in any
 * theme that defines the standard dashboard token set (--color-primary,
 * --color-secondary, --color-accent, --color-bg, --color-text,
 * --color-surface, --color-border, --color-muted). Surfaces use the natural
 * semantic role: background: var(--color-bg); color: var(--color-text).
 *
 * State is fully internal — there's no exported hook. If a parent needs to
 * inspect/control the active index, prefer adding a callback prop later; do
 * not lift state out by default (it makes the contract harder to use).
 *
 * Usage:
 *   import VehicleGallery from '@/app/widgets/VehicleGallery'
 *   <VehicleGallery images={vehicle.gallery} alt={vehicle.title} />
 */

export type VehicleGalleryProps = {
  images: string[]
  alt?: string
  className?: string
}

const SWIPE_THRESHOLD = 50

export function VehicleGallery({
  images,
  alt = 'Vehicle image',
  className,
}: VehicleGalleryProps) {
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const galleryTouchStateRef = useRef({ active: false, startX: 0, startY: 0 })
  const lightboxTouchStateRef = useRef({ active: false, startX: 0, startY: 0 })

  const galleryCount = images.length
  const hasGallery = galleryCount > 0
  const activeIndex = hasGallery
    ? Math.min(galleryIndex, galleryCount - 1)
    : 0
  const activeImage = hasGallery ? images[activeIndex] : ''

  const goToNext = useCallback(() => {
    if (!hasGallery) return
    setGalleryIndex((i) => (i + 1) % galleryCount)
  }, [galleryCount, hasGallery])

  const goToPrev = useCallback(() => {
    if (!hasGallery) return
    setGalleryIndex((i) => (i - 1 + galleryCount) % galleryCount)
  }, [galleryCount, hasGallery])

  // Keyboard navigation when lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setLightboxOpen(false)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrev()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightboxOpen, goToNext, goToPrev])

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!lightboxOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [lightboxOpen])

  const onSwipeStart = (
    event: ReactTouchEvent<HTMLElement>,
    store: { active: boolean; startX: number; startY: number },
  ) => {
    if (event.touches.length !== 1) return
    store.active = true
    store.startX = event.touches[0].clientX
    store.startY = event.touches[0].clientY
  }

  const onSwipeEnd = (
    event: ReactTouchEvent<HTMLElement>,
    store: { active: boolean; startX: number; startY: number },
  ) => {
    if (!store.active || event.changedTouches.length !== 1) return
    store.active = false
    const dx = event.changedTouches[0].clientX - store.startX
    const dy = event.changedTouches[0].clientY - store.startY
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
    if (dx < 0) goToNext()
    else goToPrev()
  }

  const handleGalleryKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goToNext()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goToPrev()
    } else if (event.key === 'Enter' && hasGallery) {
      event.preventDefault()
      setLightboxOpen(true)
    }
  }

  const bandClassName = className
    ? `${styles.galleryBand} ${className}`
    : styles.galleryBand

  return (
    <>
      <section className={bandClassName}>
        <div
          className={styles.galleryMain}
          tabIndex={0}
          role="region"
          aria-label="Vehicle image gallery"
          onKeyDown={handleGalleryKey}
        >
          <div
            className={styles.galleryViewport}
            onTouchStart={(e) => onSwipeStart(e, galleryTouchStateRef.current)}
            onTouchEnd={(e) => onSwipeEnd(e, galleryTouchStateRef.current)}
          >
            {hasGallery ? (
              <img
                src={activeImage}
                alt={`${alt} — image ${activeIndex + 1} of ${galleryCount}`}
                className={styles.galleryImage}
                onClick={() => setLightboxOpen(true)}
              />
            ) : (
              <div className={styles.galleryPlaceholder} aria-hidden="true">
                <span>Photos coming soon</span>
              </div>
            )}
          </div>

          {hasGallery && galleryCount > 1 ? (
            <>
              <button
                type="button"
                className={`${styles.galleryControl} ${styles.galleryPrev}`}
                aria-label="Previous image"
                onClick={goToPrev}
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${styles.galleryControl} ${styles.galleryNext}`}
                aria-label="Next image"
                onClick={goToNext}
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </>
          ) : null}

          {hasGallery ? (
            <>
              <button
                type="button"
                className={styles.galleryExpand}
                aria-label="Open full screen gallery"
                onClick={() => setLightboxOpen(true)}
              >
                <Expand size={14} aria-hidden="true" />
                <span>Full screen</span>
              </button>
              <p className={styles.galleryCounter} aria-live="polite">
                <span className={styles.galleryCounterNow}>
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <span> / </span>
                <span>{String(galleryCount).padStart(2, '0')}</span>
              </p>
            </>
          ) : null}
        </div>

        {hasGallery ? (
          <ul className={styles.thumbRail} role="tablist" aria-label="Select vehicle image">
            {images.map((src, idx) => {
              const isActive = idx === activeIndex
              return (
                <li key={`${src}-${idx}`}>
                  <button
                    type="button"
                    className={`${styles.thumb} ${isActive ? styles.thumbActive : ''}`}
                    onClick={() => setGalleryIndex(idx)}
                    aria-label={`Show image ${idx + 1}`}
                    aria-selected={isActive}
                    role="tab"
                  >
                    <img src={src} alt="" loading="lazy" />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}
      </section>

      {/* Lightbox */}
      {lightboxOpen && hasGallery ? (
        // audit-ignore: a11y-div-as-button — backdrop close; close button + Esc handle keyboard
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Vehicle gallery lightbox"
          onClick={() => setLightboxOpen(false)}
        >
          <div className={styles.lightboxTop}>
            <p className={styles.lightboxCounter} aria-live="polite">
              <span>{String(activeIndex + 1).padStart(2, '0')}</span>
              <span> / </span>
              <span>{String(galleryCount).padStart(2, '0')}</span>
            </p>
            <button
              type="button"
              className={styles.lightboxClose}
              aria-label="Close gallery"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxOpen(false)
              }}
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <div
            className={styles.lightboxViewport}
            onTouchStart={(e) => onSwipeStart(e, lightboxTouchStateRef.current)}
            onTouchEnd={(e) => onSwipeEnd(e, lightboxTouchStateRef.current)}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImage}
              alt={`${alt} — full size`}
              className={styles.lightboxImage}
            />
            {galleryCount > 1 ? (
              <>
                <button
                  type="button"
                  className={`${styles.lightboxControl} ${styles.lightboxPrev}`}
                  aria-label="Previous image"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrev()
                  }}
                >
                  <ChevronLeft size={22} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${styles.lightboxControl} ${styles.lightboxNext}`}
                  aria-label="Next image"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                >
                  <ChevronRight size={22} aria-hidden="true" />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}

export default VehicleGallery
