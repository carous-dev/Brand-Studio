"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from "framer-motion"
import { useBrand } from '../context/BrandClientWrapper'
import '../styles/cta-question.css'

export const CTAQuestion: React.FC = () => {
  const brand = useBrand()
  const home = brand.pages?.home || {}
  const splitCta = home.splitCta || {}
  const city = brand.location?.address?.city || "your area"

  const buyTitle = splitCta.buyTitle || "LOOKING FOR A USED CAR?"
  const buyDescription =
    splitCta.buyDescription ||
    `Browse our latest stock in ${city} and enquire on any vehicle that fits your needs.`
  const buyButtonText = splitCta.buyButtonText || "Browse Stock"
  const buyButtonHref = splitCta.buyButtonHref || "/used-cars"

  const sellTitle = splitCta.sellTitle || "WANT TO SELL YOUR CAR?"
  const sellDescription =
    splitCta.sellDescription ||
    "Request a fair dealer valuation and connect with our team for straightforward next steps."
  const sellButtonText = splitCta.sellButtonText || "Start Valuation"
  const sellButtonHref = splitCta.sellButtonHref || "/sell-your-car"

  const buyImage =
    splitCta.buyImage ||
    "https://images.unsplash.com/photo-1714348938110-d3692bc3716a?auto=format&fit=crop&w=2400&h=1400&q=80"
  const sellImage =
    splitCta.sellImage ||
    "https://images.unsplash.com/photo-1565376901308-37344a4b06ea?auto=format&fit=crop&w=2400&h=1400&q=80"

  const sectionStyle = {
    "--split-cta-buy-image": `url("${buyImage}")`,
    "--split-cta-sell-image": `url("${sellImage}")`,
  } as React.CSSProperties

  return (
    <motion.section
      className="cta-question-section split-cta-section"
      data-aos="fade-up"
      style={sectionStyle}
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="split-cta-panel split-cta-buy">
        <div className="split-cta-content">
          <h2 data-aos="fade-right">{buyTitle}</h2>
          <p data-aos="fade-right" data-aos-delay="80">{buyDescription}</p>
          <Link href={buyButtonHref} className="split-cta-btn split-cta-btn-red" data-aos="fade-right" data-aos-delay="140">
            {buyButtonText}
          </Link>
        </div>
      </div>

      <div className="split-cta-panel split-cta-sell">
        <div className="split-cta-content">
          <h2 data-aos="fade-left">{sellTitle}</h2>
          <p data-aos="fade-left" data-aos-delay="80">{sellDescription}</p>
          <Link href={sellButtonHref} className="split-cta-btn split-cta-btn-white" data-aos="fade-left" data-aos-delay="140">
            {sellButtonText}
          </Link>
        </div>
      </div>
    </motion.section>
  )
}

export default CTAQuestion
