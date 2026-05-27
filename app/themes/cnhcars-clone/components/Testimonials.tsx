'use client';

// audit-ignore-file: data-useeffect-fetch — reviews fetched client-side from
// the carous reviews API; brand slug + scope only known after BrandClientWrapper
// mounts. Legitimate per SKILL.md Pitfall row 14. Mode B clone.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { apiUrl } from '../lib/api';

interface Testimonial {
  id: number;
  name: string;
  text: string;
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Anonymous',
    text: 'Great service and straightforward experience from start to finish.',
  },
  {
    id: 2,
    name: 'Anonymous',
    text: 'Helpful team, honest advice, and exactly the car that was advertised.',
  },
  {
    id: 3,
    name: 'Anonymous',
    text: 'Friendly communication, no pressure, and everything was clear from viewing to handover.',
  },
  {
    id: 4,
    name: 'Anonymous',
    text: 'Professional and transparent throughout. I would recommend this dealership to friends and family.',
  },
];

interface ReviewsApiResponse {
  reviews?: Array<{
    id?: number;
    name?: string;
    text?: string;
    rating?: number;
  }>;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(FALLBACK_TESTIMONIALS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const total = testimonials.length;

  const goTo = useCallback(
    (index: number) => {
      if (!total) return;
      const next = (index + total) % total;
      setActiveIndex(next);
    },
    [total]
  );

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        const response = await fetch(apiUrl('/reviews'), { cache: 'no-store' });
        if (!response.ok) {
          if (isMounted) {
            setTestimonials(FALLBACK_TESTIMONIALS);
          }
          if (response.status !== 404) {
            console.error(`Failed to load reviews: status ${response.status}`);
          }
          return;
        }

        const data: ReviewsApiResponse = await response.json();
        const normalized = Array.isArray(data?.reviews)
          ? data.reviews
              .filter((review) => typeof review?.name === 'string' && typeof review?.text === 'string')
              .map((review, index) => ({
                id: Number.isFinite(review.id) ? Number(review.id) : index + 1,
                name: review.name!.trim() || 'Anonymous',
                text: review.text!.trim(),
              }))
              .filter((review) => review.text.length > 0)
          : [];

        if (!isMounted) return;
        setTestimonials(normalized.length > 0 ? normalized : FALLBACK_TESTIMONIALS);
      } catch (error) {
        console.error('Failed to load reviews:', error);
        if (isMounted) {
          setTestimonials(FALLBACK_TESTIMONIALS);
        }
      }
    };

    loadReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!total || paused) return;
    intervalRef.current = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 5200);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [paused, total]);

  useEffect(() => {
    if (activeIndex >= total && total > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, total]);

  const slides = useMemo(
    () =>
      testimonials.map((review, index) => (
        <article key={`${review.name}-${review.id}-${index}`} className="testimonials-slide" aria-hidden={index !== activeIndex}>
          <div className="testimonials-slide-card">
            <p className="testimonial-review-text">{review.text}</p>
            <div className="testimonial-review-name">{review.name}</div>
          </div>
        </article>
      )),
    [activeIndex, testimonials]
  );

  return (
    <section className="testimonials">
      <div className="testimonials-inner">
        <p className="testimonials-eyebrow">Verified customer feedback</p>
        <h2 className="testimonials-title">Customer Reviews</h2>
        <Quote className="testimonials-quote-mark" aria-hidden="true" />

        <div
          className="testimonials-slider"
          aria-label="Customer reviews"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="testimonials-track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {slides}
          </div>
          <button type="button" className="testimonials-nav-button" onClick={goPrev} aria-label="Previous review">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="testimonials-nav-button testimonials-nav-button-right"
            onClick={goNext}
            aria-label="Next review"
          >
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="testimonials-dots" role="tablist" aria-label="Review slides">
          {testimonials.map((review, index) => (
            <button
              key={`${review.name}-${review.id}-${index}`}
              type="button"
              className={`testimonials-dot ${index === activeIndex ? 'active' : ''}`}
              aria-label={`Go to review from ${review.name}`}
              aria-pressed={index === activeIndex}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
