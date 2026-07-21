"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { Quote } from "lucide-react"
import { useBrand } from "../context/BrandClientWrapper"
import "../styles/testimonials.css"

type Testimonial = {
  text: string
  author: string
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    text: "Professional and friendly. We will not try to sell you a car that is not right for you. We take the effort to get things right.",
    author: "DEREK POLLARD",
  },
  {
    text: "Highly recommend. Very friendly and helpful, and they do all they can to make the sale right without pressure or rushing.",
    author: "TRACY",
  },
  {
    text: "Open and honest advice with cars prepared to a high standard. I would absolutely recommend this dealership.",
    author: "ANONYMOUS CUSTOMER",
  },
]

const PLACEHOLDER_NAME_PATTERNS = [
  /^john\s+doe$/i,
  /^jane\s+doe$/i,
  /^test\s+(user|customer)?$/i,
  /^lorem(\s+ipsum)?$/i,
  /^customer\s*\d*$/i,
  /^placeholder$/i,
]

const PLACEHOLDER_TEXT_PATTERNS = [
  /reliable\s+autos\s+ltd/i,
  /lorem\s+ipsum/i,
  /sample\s+(review|testimonial)/i,
]

function isPlaceholderTestimonial(entry: Testimonial, brandName: string): boolean {
  if (PLACEHOLDER_NAME_PATTERNS.some((pattern) => pattern.test(entry.author))) return true
  if (PLACEHOLDER_TEXT_PATTERNS.some((pattern) => pattern.test(entry.text))) return true

  const trimmedBrandName = brandName.trim()
  if (trimmedBrandName.length >= 4) {
    const escaped = trimmedBrandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const foreignDealer = new RegExp(`\\b(?!${escaped}\\b)([A-Z][A-Za-z'&-]+\\s+){0,3}(autos?|motors|cars)\\s+(ltd|limited|inc|llc|gmbh)\\b`, "i")
    if (foreignDealer.test(entry.text)) return true
  }

  return false
}

function normalizeIndex(value: number, count: number): number {
  return (value + count) % count
}

const Testimonials = () => {
  const brand = useBrand()
  const testimonialsContent = brand.pages?.home?.testimonials || {
    eyebrow: "Testimonials",
    heading: "Customer Reviews",
    description: `Verified customer feedback from ${brand.name} buyers.`,
  }

  const brandTestimonials = useMemo<Testimonial[]>(() => {
    const configured = Array.isArray(brand.testimonials) ? brand.testimonials : []
    const mapped = configured
      .map((entry) => {
        const text = typeof entry?.review === "string" ? entry.review.trim() : ""
        const authorRaw = typeof entry?.name === "string" ? entry.name.trim() : ""
        if (!text || !authorRaw) return null
        return {
          text,
          author: authorRaw.toUpperCase(),
        }
      })
      .filter((entry): entry is Testimonial => entry !== null)
      .filter((entry) => !isPlaceholderTestimonial(entry, brand.name || ""))

    return mapped.length > 0 ? mapped : FALLBACK_TESTIMONIALS
  }, [brand.testimonials, brand.name])

  const slideCount = brandTestimonials.length
  const slides = useMemo(() => {
    if (slideCount === 1) {
      return [brandTestimonials[0], brandTestimonials[0], brandTestimonials[0]]
    }
    return [brandTestimonials[slideCount - 1], ...brandTestimonials, brandTestimonials[0]]
  }, [brandTestimonials, slideCount])

  const [currentRealIndex, setCurrentRealIndex] = useState(0)
  const [visualIndex, setVisualIndex] = useState(1)
  const [isTrackTransitionEnabled, setIsTrackTransitionEnabled] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [minHeight, setMinHeight] = useState<number | null>(null)
  const [autoSeed, setAutoSeed] = useState(0)
  const sliderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    const updateSliderHeight = () => {
      const items = Array.from(slider.querySelectorAll<HTMLElement>(".testimonial-item"))
      if (!items.length) return

      slider.style.minHeight = ""
      let maxHeight = 0
      items.forEach((item) => {
        maxHeight = Math.max(maxHeight, item.offsetHeight)
      })
      setMinHeight(maxHeight > 0 ? maxHeight : null)
    }

    updateSliderHeight()
    window.addEventListener("resize", updateSliderHeight)
    window.addEventListener("load", updateSliderHeight, { once: true })

    return () => {
      window.removeEventListener("resize", updateSliderHeight)
      window.removeEventListener("load", updateSliderHeight)
    }
  }, [])

  useEffect(() => {
    if (slideCount <= 1 || isHovered) return

    const interval = window.setInterval(() => {
      setCurrentRealIndex((current) => normalizeIndex(current + 1, slideCount))
      setVisualIndex((current) => current + 1)
      setIsTrackTransitionEnabled(true)
    }, 5000)

    return () => {
      window.clearInterval(interval)
    }
  }, [autoSeed, isHovered, slideCount])

  useEffect(() => {
    if (isTrackTransitionEnabled) return

    const frame = window.requestAnimationFrame(() => {
      setIsTrackTransitionEnabled(true)
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [isTrackTransitionEnabled])

  useEffect(() => {
    if (!isTrackTransitionEnabled || slideCount <= 1) return

    const fallback = window.setTimeout(() => {
      if (visualIndex >= slideCount + 1) {
        setVisualIndex(1)
        setIsTrackTransitionEnabled(false)
        return
      }

      if (visualIndex <= 0) {
        setVisualIndex(slideCount)
        setIsTrackTransitionEnabled(false)
      }
    }, 750)

    return () => {
      window.clearTimeout(fallback)
    }
  }, [isTrackTransitionEnabled, slideCount, visualIndex])

  const goToReal = (targetIndex: number) => {
    if (slideCount <= 1) return
    const normalized = normalizeIndex(targetIndex, slideCount)
    setCurrentRealIndex(normalized)
    setVisualIndex(normalized + 1)
    setIsTrackTransitionEnabled(true)
    setAutoSeed((seed) => seed + 1)
  }

  const handleTrackTransitionEnd = () => {
    if (slideCount <= 1) return
    if (visualIndex >= slideCount + 1) {
      setVisualIndex(1)
      setIsTrackTransitionEnabled(false)
      return
    }
    if (visualIndex <= 0) {
      setVisualIndex(slideCount)
      setIsTrackTransitionEnabled(false)
    }
  }

  const subtitle =
    testimonialsContent.description ||
    testimonialsContent.eyebrow ||
    `Verified customer feedback from ${brand.name} buyers.`
  const title = testimonialsContent.heading || "Customer Reviews"

  return (
    <motion.section
      id="testimonials"
      className="testimonials-split testimonials-section"
      data-aos="fade-up"
      aria-label="Customer testimonials"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-subtitle">{subtitle}</h2>
          <h1 className="testimonials-title">{title}</h1>
        </div>

        <div
          ref={sliderRef}
          className="testimonials-slider"
          style={minHeight ? { minHeight: `${minHeight}px` } : undefined}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="testimonials-viewport">
            <div
              className="testimonials-track"
              style={{
                transform: `translateX(-${visualIndex * 100}%)`,
                transition: isTrackTransitionEnabled ? "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)" : "none",
              }}
              onTransitionEnd={handleTrackTransitionEnd}
            >
              {slides.map((testimonial, index) => (
                <article className="testimonial-item" key={`${testimonial.author}-${index}`}>
                  <div className="quote-icon" aria-hidden="true">
                    <Quote size={56} strokeWidth={1.9} />
                  </div>
                  <div className="testimonial-content">
                    <p className="testimonial-text">{testimonial.text}</p>
                    <div className="testimonial-author">
                      <span className="author-name">{testimonial.author}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {slideCount > 1 && (
          <div className="testimonials-pagination">
            {brandTestimonials.map((_, index) => (
              <button
                key={`testimonial-dot-${index}`}
                className={`dot${index === currentRealIndex ? " active" : ""}`}
                type="button"
                aria-label={`Show testimonial ${index + 1}`}
                onClick={() => goToReal(index)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  )
}

export default Testimonials
