"use client"

import { motion, useReducedMotion, Variants } from 'framer-motion'
import Link from 'next/link'
import "../styles/futuristic-homepage.css";
import { Check, Coins, MapPin, Users } from 'lucide-react';
import { useBrand } from '../context/BrandClientWrapper'

const aboutVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'circOut' } },
}

const featureVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const AboutSection = () => {
    const brand = useBrand()
    const brandName = brand?.name || 'our dealership'
    const city = String(brand?.location?.address?.city || brand?.location?.city || 'your area')
    const reduce = useReducedMotion()
    
    const features = [
      {
        icon: Check,
        title: "Inspected & Approved",
        description: "Every car checked by our expert technicians"
      },
      {
        icon: Coins,
        title: "Flexible Finance",
        description: "Starter-friendly plans, fast decisions"
      },
      {
        icon: MapPin,
        title: "Local Collection",
        description: `Collect from ${city} or arrange local delivery`
      },
      {
        icon: Users,
        title: "Family Values",
        description: "Combining family values with modern buying experience"
      }
    ];

    return (
        <section className="about-futuristic" aria-label={`About ${brandName}`} data-aos="fade-up">
          <div className="about-content-futuristic">
            <motion.div className="about-text-futuristic" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={aboutVariant}>
              <h2 className="about-title-futuristic">
                {brandName} — 
                <span className="accent-text">Driven by Passion, Built for You</span>
              </h2>
              
              <p className="about-description-futuristic">
                We combine family values with a modern buying experience — carefully inspected vehicles, 
                transparent pricing and tailored finance options so you drive away with confidence.
              </p>

              <div className="about-features-futuristic">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="about-feature-futuristic"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={featureVariant}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="about-feature-icon-futuristic">
                      <feature.icon size={24} />
                    </div>
                    <div className="about-feature-text-futuristic">
                      <h3 className="about-feature-title-futuristic">{feature.title}</h3>
                      <p className="about-feature-description-futuristic">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="about-actions-futuristic">
                <Link href="/used-cars" className="btn-futuristic-primary">
                  Browse Vehicles
                </Link>
                <Link href="/sell-your-car" className="btn-futuristic-secondary">
                  Get a Valuation
                </Link>
              </div>
            </motion.div>

            <motion.div 
              className="about-visual-futuristic" 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, amount: 0.3 }} 
              variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.8 } } }}
            >
              <div className="about-image-futuristic" />
            </motion.div>
          </div>
        </section>
    );
}

export default AboutSection;



