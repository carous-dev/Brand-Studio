'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import styles from './ReviewsSection.module.css'

const FALLBACK_REVIEWS = [
  {
    quote:
      'Brought a VW Polo, Akram made the whole process easy. Car was clean and presentable, no pressure and all questions answered.',
    name: 'Anonymous'
  },
  {
    quote:
      'Excellent service from the first call to viewing the car. Everything was exactly as described with no pressure at all.',
    name: 'John W'
  },
  {
    quote:
      'What an incredible experience. Treated with such kindness and enthusiasm. I could not recommend a better company.',
    name: 'Anonymous'
  },
  {
    quote:
      'Fantastic experience with a reassuring amount of knowledge and transparency. Would recommend.',
    name: 'Anonymous'
  }
]

type Review = { quote: string; name: string }

export default function ReviewsSection() {
  const brand = useBrand()
  const reviews: Review[] = useMemo(() => {
    const raw = (brand as any)?.testimonials
    if (Array.isArray(raw) && raw.length > 0) {
      return raw
        .map((t: any) => ({
          quote: String(t?.review || t?.quote || ''),
          name: String(t?.name || 'Anonymous')
        }))
        .filter((t) => t.quote)
    }
    return FALLBACK_REVIEWS
  }, [brand])

  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = reviews.length
  const intervalRef = useRef<number | null>(null)

  const goTo = useCallback(
    (index: number) => {
      const next = (index + total) % total
      setActiveIndex(next)
    },
    [total]
  )

  const goNext = useCallback(() => {
    goTo(activeIndex + 1)
  }, [activeIndex, goTo])

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1)
  }, [activeIndex, goTo])

  useEffect(() => {
    if (paused) return
    intervalRef.current = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total)
    }, 5200)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [paused, total])

  const handleEnter = () => setPaused(true)
  const handleLeave = () => setPaused(false)

  const slides = useMemo(
    () =>
      reviews.map((review, index) => (
        <article
          key={`${review.name}-${index}`}
          className={styles.slide}
          aria-hidden={index !== activeIndex}
        >
          <div className={styles.slideCard}>
            <p className={styles.reviewText}>{review.quote}</p>
            <div className={styles.reviewName}>{review.name}</div>
          </div>
        </article>
      )),
    [activeIndex, reviews]
  )

  const brandName = brand?.name || 'Springalls Car Sales'

  return (
    <section className={styles.reviews}>
      <div className={styles.reviewsInner}>
        <p className={styles.reviewsEyebrow}>Verified customer feedback from {brandName} buyers</p>
        <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
        <Quote className={styles.quoteMark} aria-hidden="true" />

        <div
          className={styles.slider}
          aria-label="Customer reviews"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onFocus={handleEnter}
          onBlur={handleLeave}
        >
          <div className={styles.track} style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {slides}
          </div>
          <button type="button" className={styles.navButton} onClick={goPrev} aria-label="Previous review">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <button
            type="button"
            className={`${styles.navButton} ${styles.navButtonRight}`}
            onClick={goNext}
            aria-label="Next review"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.dots} role="tablist" aria-label="Review slides">
          {reviews.map((review, index) => (
            <button
              key={`${review.name}-${index}`}
              type="button"
              className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
              aria-label={`Go to review from ${review.name}`}
              aria-pressed={index === activeIndex}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
