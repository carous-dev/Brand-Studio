"use client"

import { motion } from "framer-motion"
import { useBrand } from "../context/BrandClientWrapper"
import "../styles/reviews-strip.css"

// Third-party Autotrader wordmark brand colours (fixed asset palette, not theme tokens)
const AT_LOGO_NAVY = "#1D2F67"
const AT_LOGO_RED = "#D61F2C"

function Stars() {
  return (
    <span className="reviews-strip-stars" aria-hidden="true">
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span>★</span>
      <span>★</span>
    </span>
  )
}

function withProtocol(value: string): string {
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith("//")) return `https:${value}`
  if (value.startsWith("/")) return value
  return `https://${value}`
}

function safeReviewLink(candidate: unknown, fallback: string): string {
  if (typeof candidate !== "string") return fallback
  const value = candidate.trim()
  if (!value) return fallback
  return withProtocol(value)
}

export default function ReviewsStrip() {
  const brand = useBrand()
  const reviewLinks = ((brand as any).reviewLinks || (brand as any).reviews || {}) as Record<string, unknown>

  const googleReviewsHref = safeReviewLink(
    reviewLinks.google ?? (brand as any).googleReviewsUrl,
    `https://www.google.com/search?q=${encodeURIComponent(`${brand.name} reviews`)}`,
  )

  const autoTraderHref = safeReviewLink(
    reviewLinks.autotrader ?? (brand as any).autotraderUrl ?? (brand as any).autotraderDealerUrl,
    "https://www.autotrader.co.uk/",
  )

  const testimonialsHref = safeReviewLink(
    reviewLinks.testimonials ?? (brand as any).testimonialsUrl,
    "/#testimonials",
  )

  return (
    <motion.section
      className="reviews-strip"
      aria-label="Review platforms"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="reviews-strip-shell reviews-strip-inner">
        <a
          href={googleReviewsHref}
          className="reviews-strip-item"
          aria-label={`Read ${brand.name} Google reviews`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="reviews-strip-logo reviews-strip-logo-google" aria-hidden="true">
            <span className="g-b">G</span>
            <span className="g-r">o</span>
            <span className="g-y">o</span>
            <span className="g-b">g</span>
            <span className="g-g">l</span>
            <span className="g-r">e</span>
          </div>
          <div className="reviews-strip-cta">
            <Stars />
            <span>Read our reviews</span>
          </div>
        </a>

        <a
          href={autoTraderHref}
          className="reviews-strip-item"
          aria-label={`Read ${brand.name} AutoTrader reviews`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="reviews-strip-logo reviews-strip-logo-autotrader">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              width="171"
              viewBox="0 0 171 20"
              className="atds-svg"
              aria-hidden="true"
              focusable="false"
            >
              <title>Autotrader</title>
              <g fill="none" fillRule="evenodd" data-testid="at-logo-cars">
                <path
                  d="M149.323 10.483c.434-2.115 1.74-3.203 3.572-3.203s3.138 1.088 3.572 3.203h-7.144Zm7.204 4.757c-.776 1.213-1.802 1.743-3.26 1.743-2.299 0-3.727-1.275-4.036-3.763h10.154c.405 0 .747-.435.747-.87v-.25c0-5.567-3.852-7.807-7.237-7.807-3.385 0-7.236 2.24-7.236 7.807 0 5.568 3.726 7.87 7.546 7.87 2.641 0 5.404-1.15 6.739-4.042l-3.417-.685v-.003Zm6.118 4.355h3.418V12.69c0-4.012 2.141-4.665 3.602-4.852.713-.093 1.335-.093 1.335-.093V4.418c-.125-.093-.806-.125-1.181-.125-.746 0-1.707.125-2.578.747a3.523 3.523 0 0 0-1.398 2.053l-.622-1.928c-.092-.31-.404-.497-.684-.497h-1.894v14.93l.002-.003Zm-27.423-2.55c-2.454 0-4.441-2.207-4.441-4.915 0-2.707 1.987-4.915 4.441-4.915 2.454 0 4.411 2.178 4.441 4.853v.125c-.03 2.675-2.02 4.852-4.441 4.852Zm-.714 2.925c2.142 0 3.882-.84 5.125-2.207l.249 1.245c.063.31.405.59.714.59h2.516l-.03-7.465.03-12.13h-2.763c-.372 0-.714.217-.714.652v5.848c-1.243-1.368-2.98-2.208-5.125-2.208-4.41 0-7.236 3.67-7.236 7.838 0 4.167 2.826 7.837 7.236 7.837h-.002Zm-17.486-2.925c-2.454 0-4.441-2.207-4.441-4.915 0-2.707 1.987-4.915 4.441-4.915 2.454 0 4.411 2.178 4.441 4.853v.125c-.03 2.675-2.02 4.852-4.441 4.852Zm-.714 2.925c2.142 0 3.882-.84 5.125-2.207l.249 1.245c.063.31.405.59.714.59h2.517l-.03-7.465.03-7.465h-2.517c-.309 0-.651.28-.714.59l-.249 1.245c-1.243-1.368-2.981-2.208-5.125-2.208-4.411 0-7.236 3.67-7.236 7.838 0 4.167 2.825 7.837 7.236 7.837Zm-16.802-.375h3.418V12.69c0-4.012 2.141-4.665 3.602-4.852.713-.093 1.335-.093 1.335-.093V4.418c-.125-.093-.806-.125-1.181-.125-.746 0-1.707.125-2.578.747a3.523 3.523 0 0 0-1.398 2.053l-.622-1.928c-.092-.31-.404-.497-.684-.497h-1.894v14.93l.002-.003ZM93.792 20c1.336 0 2.3-.342 3.198-.747v-2.738c0-.125-.062-.187-.187-.187h-.31c-.404.31-.714.467-.963.56-.714.25-1.802.28-2.33-.28-.249-.28-.434-.685-.434-1.275V7.4h3.013c.435 0 .747-.342.747-.777v-1.96h-3.757V.965l-2.796.623a.765.765 0 0 0-.621.777v2.303h-2.237v2.737h2.237v7.62c0 1.648.31 2.925 1.118 3.763.746.777 2.02 1.212 3.322 1.212Zm-15.249-3.017c-2.484 0-4.378-2.27-4.378-4.82 0-2.55 1.894-4.883 4.378-4.883s4.378 2.27 4.378 4.883c0 2.612-1.894 4.82-4.378 4.82Zm0 2.987c4.875 0 7.888-3.577 7.888-7.807s-3.013-7.87-7.888-7.87-7.888 3.577-7.888 7.87c0 4.292 3.013 7.807 7.888 7.807ZM66.307 20c1.335 0 2.299-.342 3.197-.747v-2.738c0-.125-.062-.187-.187-.187h-.31c-.404.31-.713.467-.963.56-.714.25-1.802.28-2.329-.28-.25-.28-.434-.685-.434-1.275V7.4h3.013c.434 0 .746-.342.746-.777v-1.96h-3.757V.965l-2.796.623a.765.765 0 0 0-.621.777v2.303h-2.237v2.737h2.237v7.62c0 1.648.31 2.925 1.118 3.763.747.777 2.02 1.212 3.323 1.212Zm-15.437-.03c1.925 0 3.602-.622 4.783-1.617 1.305-1.088 1.677-2.675 1.677-4.448v-9.24h-2.67a.731.731 0 0 0-.747.715v8.243c0 1.087-.25 1.927-.806 2.52-.467.56-1.243.84-2.237.84-.993 0-1.77-.28-2.236-.84-.56-.59-.807-1.43-.807-2.52V4.665h-2.67c-.405 0-.747.343-.747.715v8.523c0 1.772.372 3.36 1.677 4.447 1.181.995 2.859 1.618 4.783 1.618v.002Zm-19.782-8.182 1.707-4.54.901-2.583h.25l.869 2.583 1.707 4.54h-5.434ZM0 19.595h14.628c3.075 0 5.93-1.772 7.049-4.602l1.243-3.173H6.305c-1.832 0-3.51 1.15-4.223 2.83L0 19.595Zm24.068 0H28.2l1.74-4.635h7.795l1.708 4.635h4.098L35.716.933h-3.852l-7.796 18.662Z"
                  fill={AT_LOGO_NAVY}
                />
                <path
                  d="M4.533 8.678h16.74a4.465 4.465 0 0 0 4.131-2.738L27.546.933H12.888C9.845.933 7.142 2.8 5.901 5.598l-1.365 3.08h-.003Z"
                  fill={AT_LOGO_RED}
                />
              </g>
            </svg>
          </div>
          <div className="reviews-strip-cta">
            <Stars />
            <span>Read our reviews</span>
          </div>
        </a>

        <a
          href={testimonialsHref}
          className="reviews-strip-item"
          aria-label={`Read ${brand.name} customer testimonials`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="reviews-strip-logo reviews-strip-logo-brand" aria-hidden="true">
            {brand.name}
          </div>
          <div className="reviews-strip-cta">
            <Stars />
            <span>Read our reviews</span>
          </div>
        </a>
      </div>
    </motion.section>
  )
}
