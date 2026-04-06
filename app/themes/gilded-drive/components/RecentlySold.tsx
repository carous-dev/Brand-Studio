"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useBrand } from '../context/BrandClientWrapper'
import { Calendar, Clock, CheckCircle, Fuel, Gauge, Settings } from "lucide-react"

interface SoldVehicle {
  vin: string;
  registration: string;
  make?: string;
  model?: string;
  year?: string;
  derivative: string;
  odometer_reading_miles: number;
  colour?: string;
  forecourt_price_gbp: number;
  sale_date?: string;
  days_on_market?: number;
  engine_capacity_cc?: number;
  trans?: string;
  images?: string[];
  image?: string;
}

export default function RecentlySold() {
  const brand = useBrand()
  const [vehicles, setVehicles] = useState<SoldVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchRecentlySold = async () => {
      try {
        const brandSlug = brand.slug || ''
        const res = await fetch(`/api/recently-sold?brand=${encodeURIComponent(brandSlug)}&limit=12`)
        const data = await res.json()
        setVehicles(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Failed to fetch recently sold vehicles:", error)
        setVehicles([])
      } finally {
        setLoading(false)
      }
    }
    fetchRecentlySold()
  }, [brand.slug])

  const getPlaceholderImage = (vin: string) => {
    const images = [
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=70",
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1200&q=70"
    ]
    return images[vin.charCodeAt(0) % images.length]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Recently"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getColorSwatch = (colour?: string) => {
    const normalized = colour?.trim().toLowerCase()
    if (!normalized) return "#9ca3af"

    if (
      normalized.startsWith("#") ||
      normalized.startsWith("rgb(") ||
      normalized.startsWith("rgba(") ||
      normalized.startsWith("hsl(") ||
      normalized.startsWith("hsla(")
    ) {
      return normalized
    }

    const colorMap: Record<string, string> = {
      black: "#111827",
      white: "#f9fafb",
      silver: "#9ca3af",
      grey: "#6b7280",
      gray: "#6b7280",
      blue: "#2563eb",
      red: "#dc2626",
      green: "#16a34a",
      yellow: "#eab308",
      orange: "#f97316",
      brown: "#92400e",
      beige: "#d6d3c4",
      gold: "#ca8a04",
      purple: "#7c3aed",
      pink: "#ec4899",
      bronze: "#b45309"
    }

    const matchedKey = Object.keys(colorMap).find((key) => normalized.includes(key))
    return matchedKey ? colorMap[matchedKey] : "#9ca3af"
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filter === "all") return true
    if (filter === "quick") return (vehicle.days_on_market || 0) < 30
    if (filter === "premium") return vehicle.forecourt_price_gbp > 25000
    return true
  })

  if (loading) {
    return (
      <section className="recently-sold-loading">
        <div className="container">
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-specs"></div>
                  <div className="skeleton-price"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (vehicles.length === 0) {
    return (
      <section className="recently-sold-empty">
        <div className="container">
          <div className="empty-state">
            <CheckCircle size={48} />
            <h3>No recently sold vehicles yet</h3>
            <p>Check back soon to see our latest sales!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <motion.section 
      className="recently-sold-section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container">
        <div className="sold-header">
          <h2>Recently Sold Vehicles</h2>
          <p>See what our customers have been driving home with</p>
          
          <div className="sold-filters">
            <button 
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All Sales
            </button>
            <button 
              className={`filter-btn ${filter === "quick" ? "active" : ""}`}
              onClick={() => setFilter("quick")}
            >
              Quick Sales
            </button>
            <button 
              className={`filter-btn ${filter === "premium" ? "active" : ""}`}
              onClick={() => setFilter("premium")}
            >
              Premium
            </button>
          </div>
        </div>

        <motion.div 
          className="sold-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {filteredVehicles.map((vehicle) => {
            const img = vehicle.image || (Array.isArray(vehicle.images) && vehicle.images[0]) || getPlaceholderImage(vehicle.vin || vehicle.registration || "")
            const title = `${vehicle.year || ""}${vehicle.make ? " " + vehicle.make : ""}${vehicle.model ? " " + vehicle.model : ""}`.trim() || vehicle.derivative || "Sold Vehicle"
            const mileage = vehicle.odometer_reading_miles || 0
            const transmission = vehicle.trans || "Automatic"
            const engine = vehicle.engine_capacity_cc ? `${(vehicle.engine_capacity_cc / 1000).toFixed(1)}L` : "Petrol"
            const daysOnMarket = vehicle.days_on_market || 0
            const colourLabel = vehicle.colour?.trim() || "Unknown"
            const colourSwatch = getColorSwatch(vehicle.colour)

            return (
              <motion.article 
                key={vehicle.vin || vehicle.registration} 
                className="sold-card"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <div className="sold-image">
                  <img src={img} alt={title} loading="lazy" />
                  <div className="sold-badge">SOLD</div>
                  {daysOnMarket > 0 && (
                    <div className="quick-sale-badge">
                      <Clock size={12} />
                      {daysOnMarket} days
                    </div>
                  )}
                </div>
                <div className="sold-body">
                  <div className="sold-meta">{vehicle.make || "Vehicle"}</div>
                  <h3>{title}</h3>
                  
                  <div className="sold-specs">
                    <span><Settings size={14} /> {transmission}</span>
                    <span><Fuel size={14} /> {engine}</span>
                    <span><Gauge size={14} /> {Number(mileage).toLocaleString()} mi</span>
                  </div>
                  
                  <div className="sold-details">
                    <div className="sold-price">
                      <span className="price-amount">£{Number(vehicle.forecourt_price_gbp).toLocaleString()}</span>
                    </div>
                    <div className="sold-date">
                      <Calendar size={14} />
                      {formatDate(vehicle.sale_date)}
                    </div>
                  </div>
                  
                  <div className="sold-footer">
                    <div className="color-info">
                      <span className="color-dot" style={{ backgroundColor: colourSwatch }}></span>
                      {colourLabel}
                    </div>
                    <CheckCircle size={16} className="check-icon" />
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>

        {filteredVehicles.length === 0 && (
          <div className="no-results">
            <p>No vehicles found in this category</p>
          </div>
        )}
      </div>
    </motion.section>
  )
}
