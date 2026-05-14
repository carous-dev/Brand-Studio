"use client"

import React, { useEffect, useRef, useState } from 'react'
import { motion, Variants } from 'framer-motion'
import "../styles/futuristic-homepage.css";
import LazyImage from './LazyImage';
import { ChevronLeft, ChevronRight, Star, MapPin } from 'lucide-react';

interface FeaturedVehicle {
  vin: string;
  registration: string;
  derivative: string;
  odometer_reading_miles: number;
  colour: string;
  forecourt_price_gbp: number;
  featured: boolean;
  status: string;
}

const featuredVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'circOut' } },
}

const vehicleCardVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Featured() {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [vehicles, setVehicles] = useState<FeaturedVehicle[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch featured vehicles from API
  useEffect(() => {
    const fetchFeaturedVehicles = async () => {
      try {
        const res = await fetch('/api/featured-vehicles')
        const data = await res.json()
        setVehicles(data)
      } catch (error) {
        console.error('Failed to fetch featured vehicles:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeaturedVehicles()
  }, [])

  function prev() {
    setCurrentIndex((i) => (i - 1 + vehicles.length) % vehicles.length)
  }

  function next() {
    setCurrentIndex((i) => (i + 1) % vehicles.length)
  }

  function goTo(i: number) {
    setCurrentIndex(i)
  }

  // Placeholder image if vehicle doesn't have image URL
  const getPlaceholderImage = (vin: string) => {
    const images = [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=70',
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=70',
    ]
    return images[vin.charCodeAt(0) % images.length]
  }

  if (loading) {
    return (
      <section className="featured-futuristic">
        <div className="featured-header-futuristic">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={featuredVariant}>
            <h2 className="featured-title-futuristic">Featured Vehicles</h2>
            <p className="featured-subtitle-futuristic">Loading featured vehicles...</p>
          </motion.div>
        </div>
      </section>
    )
  }

  if (vehicles.length === 0) {
    return null
  }

  return (
    <section className="featured-futuristic">
      <div className="featured-header-futuristic">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={featuredVariant}>
          <h2 className="featured-title-futuristic">Featured Vehicles</h2>
          <p className="featured-subtitle-futuristic">
            Hand-picked, inspected, and ready — quality cars with transparent pricing and trusted service.
          </p>
        </motion.div>
      </div>

      <div className="carousel-futuristic">
        <div className="carousel-track-futuristic" ref={trackRef}>
          {vehicles.map((vehicle: any, idx: number) => {
            const img = vehicle.image || (Array.isArray(vehicle.images) && vehicle.images[0]) || getPlaceholderImage(vehicle.vin || (vehicle.reg || ''))
            const title = `${vehicle.year || ''}${vehicle.make ? ' ' + vehicle.make : ''}${vehicle.model ? ' ' + vehicle.model : ''}`.trim()
            const price = vehicle.price ?? vehicle.forecourt_price_gbp ?? 0
            const mileage = vehicle.mileage ?? vehicle.odometer_reading_miles ?? 0
            const engine = vehicle.engine_capacity_cc ? `${(vehicle.engine_capacity_cc / 1000).toFixed(1)}L` : null
            const transmission = vehicle.trans || null
            const vehicleUrl = vehicle.slug || vehicle.derivative_slug || vehicle.reg
              ? `/used-cars/${encodeURIComponent(String(vehicle.slug || vehicle.derivative_slug || vehicle.reg))}`
              : '#'
            
            return (
              <motion.div
                key={`${vehicle.vin || vehicle.reg}-${idx}`}
                className="vehicle-card-futuristic"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={vehicleCardVariant}
                transition={{ delay: idx * 0.1 }}
              >
                <a href={vehicleUrl} style={{ textDecoration: 'none', display: 'block', height: '100%', color: 'inherit' }}>
                  <LazyImage 
                    src={img} 
                    alt={title || 'Vehicle'} 
                    className="vehicle-image-futuristic" 
                    loading="lazy" 
                    decoding="async" 
                    fetchPriority="low" 
                  />
                  <div className="vehicle-content-futuristic">
                    <h3 className="vehicle-title-futuristic">{title}</h3>
                    
                    <div className="vehicle-specs-futuristic">
                      {engine && (
                        <div className="vehicle-spec-futuristic">
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path d="M3 11h4l2-4h6l2 4h4v6a1 1 0 0 1-1 1h-1v1H5v-1H4a1 1 0 0 1-1-1v-6z"/>
                          </svg>
                          {engine}
                        </div>
                      )}
                      {transmission && (
                        <div className="vehicle-spec-futuristic">
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path d="M7 7v10M12 7v10M17 7v10"/>
                          </svg>
                          {transmission}
                        </div>
                      )}
                      <div className="vehicle-spec-futuristic">
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M12 7a5 5 0 1 1-4.9 6.1"/>
                          <path d="M12 3v4l1 1"/>
                        </svg>
                        {Number(mileage).toLocaleString()} mi
                      </div>
                    </div>
                    
                    <div className="vehicle-price-futuristic">£{Number(price).toLocaleString()}</div>
                  </div>
                </a>
              </motion.div>
            )
          })}
        </div>

        <button className="carousel-prev-futuristic" onClick={prev} aria-label="Previous vehicle">
          <ChevronLeft size={24} />
        </button>
        <button className="carousel-next-futuristic" onClick={next} aria-label="Next vehicle">
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  )
}
