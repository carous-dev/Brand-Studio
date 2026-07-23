"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useBrand } from '../context/BrandClientWrapper'

function escapeCssUrl(url: string): string {
  return String(url).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n|\r/g, '')
}

/**
 * Recently-sold page hero — mirrors the used-cars dark mini-hero language:
 * brand.heroImage under a uniform dark scrim, white captions, one CTA.
 * The proof stats live in a hairline assurance strip (not floating chips).
 */
export default function RecentlySoldHero() {
  const brand = useBrand()
  const brandName = brand?.name || 'Our Dealership'

  const heroImage = typeof brand?.heroImage === 'string' ? brand.heroImage.trim() : ''
  const heroStyle = heroImage
    ? ({ '--rs-hero-bg-image': `url("${escapeCssUrl(heroImage)}")` } as React.CSSProperties)
    : undefined

  return (
    <section className="rs-hero" aria-label={`Recently sold at ${brandName}`} style={heroStyle}>
      <div className="container">
        <motion.div
          className="rs-hero-shell"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="rs-hero-eyebrow">Success stories</p>
          <h1 className="rs-hero-title">
            Recently Sold at <br />{brandName}
          </h1>
          <p className="rs-hero-lead">
            The cars our customers have just driven home — proof of stock that
            moves and buyers who leave happy.
          </p>
          <div className="rs-hero-actions">
            <Link href="/used-cars" className="rs-hero-btn">
              Browse available stock
            </Link>
          </div>

          <dl className="rs-hero-assurance">
            <div className="rs-hero-assurance-item">
              <dt className="rs-hero-assurance-value">95%</dt>
              <dd className="rs-hero-assurance-label">Customer satisfaction</dd>
            </div>
            <div className="rs-hero-assurance-item">
              <dt className="rs-hero-assurance-value">1,000+</dt>
              <dd className="rs-hero-assurance-label">Happy customers</dd>
            </div>
            <div className="rs-hero-assurance-item">
              <dt className="rs-hero-assurance-value">30 days</dt>
              <dd className="rs-hero-assurance-label">Average sale time</dd>
            </div>
          </dl>
        </motion.div>
      </div>
    </section>
  )
}
