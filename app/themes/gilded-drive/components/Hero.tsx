"use client"

import React from 'react'
import { motion, Variants } from 'framer-motion'
import "../styles/futuristic-homepage.css";
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Zap, Car, Headphones, ArrowRight, Star, Shield, Truck } from 'lucide-react';
import Link from 'next/link';
import { useBrand } from '../context/BrandClientWrapper'

const heroVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'circOut' } },
}

const brandsVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export const Hero: React.FC = () => {
    const brand = useBrand()
    const brandName = brand?.name || 'Dealership'
    const city = String(brand?.location?.address?.city || brand?.location?.city || 'your area')
    const badgeText = city ? `Trusted Used Cars in ${city}` : 'Trusted Used Cars'
    return (
    <section className="hero-futuristic">
      <div className="hero-content-futuristic">
          <motion.div className="hero-main-futuristic" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={heroVariant}>
            <div className="hero-badge-futuristic">
              <Zap size={16} />
              {badgeText}
            </div>
            
            <h1 className="hero-title-futuristic">
              {brandName} — 
              <span className="accent-text">Quality Used Cars & Light Commercials</span>
            </h1>
            
            <p className="hero-description-futuristic">
              Based in {city} — hand‑inspected used vehicles, valuations, warranty options and local delivery. Your trusted partner for quality vehicles.
            </p>
            
            <div className="hero-actions-futuristic">
              <Link href="/used-cars" className="btn-futuristic-primary">
                <Car size={20} />
                Browse Inventory
              </Link>
              <Link href="/sell-your-car" className="btn-futuristic-secondary">
                <ArrowRight size={20} />
                Get Valuation
              </Link>
            </div>

            <motion.div className="hero-visual-futuristic" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={brandsVariant}>
              <div className="hero-brands-futuristic">
                <h3 className="brands-title">Popular Brands</h3>
                <div className="brands-grid">
                  {['Ford', 'Vauxhall', 'BMW', 'Audi', 'Toyota', 'Mercedes', 'Nissan', 'Volkswagen'].map((brand) => (
                    <div key={brand} className="brand-item-futuristic">
                      <Image 
                        src={`https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/${brand.toLowerCase()}.svg`}
                        alt={`${brand} logo`}
                        width={40}
                        height={40}
                        className="brand-logo"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
    </section>
    );
}

export default Hero


