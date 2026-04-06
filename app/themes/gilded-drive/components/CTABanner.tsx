"use client"

import "../styles/cta.css";
import { motion, useReducedMotion, Variants } from 'framer-motion'
import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'

const bannerVariant: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default () => {
  const brand = useBrand()
  const brandName = brand?.name || 'our dealership'
  const reduce = useReducedMotion()
  return (
    // CTA Banner Section (modern futuristic redesign)
    <motion.section className="cta-hero hero-cta" aria-label="Ready to hit the road" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={bannerVariant}>
      <div
        className="hero-cta__bg lqip"
        role="img"
        aria-hidden="true"
        data-bg="https://images.unsplash.com/photo-1656912988935-c4df54eedcca?q=70&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1656912988935-c4df54eedcca?q=70&w=1000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
      />
      <div className="hero-cta__overlay" aria-hidden="true"></div>

      <div className="container hero-cta__inner">
        <div className="hero-cta__content">
          <p className="eyebrow">New Drivers Welcome</p>
          <h2 className="hero-cta__title">Just passed your driving test? Start your journey with {brandName}.</h2>
          <p className="hero-cta__sub">Starter-friendly cars, flexible finance and expert guidance — curated to get you on the road with confidence.</p>
          <div className="hero-cta__actions">
            <Link className="btn btn-pill btn-neon" href="/used-cars" role="button">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2 L3 14 H10 L9 22 L21 10 H14 L15 2 Z" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              Find Your First Car
            </Link>
            <Link className="btn btn-pill btn-dim" href="/used-cars" role="button">Browse Starter Cars</Link>
          </div>
        </div>
      </div>

      <div className="cta-accent" aria-hidden="true"></div>
    </motion.section>
    )
}
