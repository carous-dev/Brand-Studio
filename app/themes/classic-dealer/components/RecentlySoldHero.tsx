"use client"

import React from "react"
import { motion } from "framer-motion"
import { useBrand } from '../context/BrandClientWrapper'
import { CheckCircle, TrendingUp, Users } from "lucide-react"

export default function RecentlySoldHero() {
  const brand = useBrand()

  return (
    <motion.section
      className="recently-sold-hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
        <div className="container">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="hero-badge">
              <CheckCircle size={16} />
              <span>Success Stories</span>
            </div>

            <h1 className="hero-title">
              Recently Sold at {brand.name}
            </h1>

            <p className="hero-subtitle">
              Discover the quality vehicles our customers have recently driven home with.
              Each sale represents our commitment to excellence and customer satisfaction.
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <TrendingUp size={20} />
                <div className="stat-content">
                  <span className="stat-number">95%</span>
                  <span className="stat-label">Customer Satisfaction</span>
                </div>
              </div>

              <div className="stat-item">
                <Users size={20} />
                <div className="stat-content">
                  <span className="stat-number">1000+</span>
                  <span className="stat-label">Happy Customers</span>
                </div>
              </div>

              <div className="stat-item">
                <CheckCircle size={20} />
                <div className="stat-content">
                  <span className="stat-number">30</span>
                  <span className="stat-label">Day Average Sale Time</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
