"use client"

import React from 'react'
import "../styles/sell-your-car.css";
import { motion, Variants, useReducedMotion } from 'framer-motion'

const copyVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.995 },
  visible: (reduce: boolean) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: reduce ? 0.18 : 0.55, ease: 'anticipate' } })
}

export const Hero: React.FC = () => {
    const reduce = useReducedMotion()
  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'our dealership'
    return (
    <section className="sell-hero">
      <div className="container sell-hero-inner">
        <motion.div className="sell-hero-copy" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={copyVariants}>
          <h1 className="hero-title">Sell Your Car — Fast. Fair. Futuristic.</h1>
          <p className="hero-lead">Get an instant valuation and options to sell your vehicle to {companyName}. Secure, transparent and tailored for used-car sellers.</p>
          <div className="hero-actions">
            <a className="btn btn-neon" href="/used-cars/">Browse Offers</a>
            <a className="btn btn-outline" href="/contact/">Ask an Expert</a>
          </div>
          <ul className="trust-list">
            <li>Instant valuations</li>
            <li>Free vehicle inspection</li>
            <li>Same-day payments</li>
          </ul>
        </motion.div>

        <motion.aside className="sell-hero-panel" aria-labelledby="sell-form-title" initial="hidden" animate="visible" variants={panelVariants} custom={reduce} transition={{ delay: 0.12 }}>
          <div id="valuationLoader" className="panel-loader" aria-hidden="true" hidden={true}>
            <div className="panel-loader__inner">
              <div className="spinner" role="status" aria-hidden="true"></div>
              <div className="panel-loader__label">Fetching valuation…</div>
            </div>
          </div>
          <div className="panel-top">
            <div className="panel-badge">Instant Valuation</div>
            <h2 id="sell-form-title">Get an instant quote</h2>
            <p className="panel-lead">Enter a few details and see your estimated value in seconds.</p>
          </div>

          <form id="sellForm" className="sell-form panel-form" noValidate>
            <label className="field">
              <span className="field-label">Registration</span>
              <input id="registration" name="registration" type="text" inputMode="text" placeholder="e.g. AB12CDE" required />
            </label>

            <label className="field">
              <span className="field-label">Mileage</span>
              <input id="mileage" name="mileage" type="number" inputMode="numeric" placeholder="e.g. 45200" required />
            </label>

            <div className="form-row">
              <button className="btn primary" type="submit">Get Instant Quote</button>
            </div>
          </form>
        </motion.aside>
      </div>
      <div className="hero-decor" aria-hidden="true"></div>
    </section>
    );
}

export default Hero
