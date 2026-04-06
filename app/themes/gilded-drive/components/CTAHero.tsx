"use client"

import { motion, useReducedMotion, Variants } from 'framer-motion'
import Link from 'next/link'
import "../styles/futuristic-homepage.css";
import { Zap, ArrowRight } from 'lucide-react';
import { useBrand } from '../context/BrandClientWrapper'

const ctaVariant: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.995 },
  visible: (reduce?: boolean) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: reduce ? 0.2 : 0.8, ease: 'easeOut' },
  }),
}

export default function CTAHero() {
    const brand = useBrand()
    const brandName = brand?.name || 'our dealership'
    const reduce = useReducedMotion()
    return (
        <section className="cta-futuristic" aria-label="Ready to find your next car">
          <motion.div className="cta-content-futuristic" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} custom={reduce} variants={ctaVariant}>
            <div className="cta-badge-futuristic">
              <Zap size={16} />
              New Drivers Welcome
            </div>
            
            <h2 className="cta-title-futuristic">
              Just Passed Your Test?
              <br />
              Start Your Journey with {brandName}
            </h2>
            
            <p className="cta-description-futuristic">
              Starter-friendly cars, flexible finance and expert guidance — curated to get you on the road with confidence and peace of mind.
            </p>
            
            <div className="cta-actions-futuristic">
              <Link href="/used-cars" className="btn-cta-futuristic">
                <Zap size={20} />
                Find Your First Car
              </Link>
              <Link href="/contact" className="btn-cta-secondary-futuristic">
                <ArrowRight size={20} />
                Browse Starter Cars
              </Link>
            </div>
          </motion.div>
        </section>
    )
}
