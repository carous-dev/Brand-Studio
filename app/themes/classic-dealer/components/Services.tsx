"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Car, Users, Headphones, Key } from "lucide-react"
import { useBrand } from '../context/BrandClientWrapper'
import "../styles/services-new.css"

const stats = [
  { id: "vehicles", value: "Live", label: "Stock Updates", icon: Car },
  { id: "customers", value: "300+", label: "Happy Customers", icon: Users },
  { id: "support", value: "6 Days", label: "Open Mon-Sat", icon: Headphones },
  { id: "models", value: "125+", label: "Car Model & Make", icon: Key }
]

const Services = () => {
  const brand = useBrand()
  const brandName = brand?.name || 'our dealership'
  const aboutDescription =
    brand?.aboutUs?.description ||
    brand?.pages?.about?.hero?.description ||
    brand?.tagline ||
    ''

  return (
    <motion.section 
      className="services-why" 
      aria-label="Why choose our services"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="services-why-container">
        <div className="services-why-media" aria-hidden="true">
          <div className="services-why-panel" />
          <div className="services-why-image">
            <Image
              src="https://images.unsplash.com/photo-1727893344848-2ec8eba4bacd?auto=format&fit=crop&w=2200&q=80"
              alt="Premium vehicle in showroom"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>

        <div className="services-why-content">
          <h2>Why Buy From {brandName}?</h2>
          <p>
            {aboutDescription}
          </p>

          <motion.div 
            className="services-why-stats"
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
            {stats.map(({ id, value, label, icon: Icon }) => (
              <motion.div 
                key={id} 
                className="services-stat"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <div className="stat-icon">
                  <Icon size={24} />
                </div>
                <div className="stat-meta">
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

export default Services
