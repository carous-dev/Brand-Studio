"use client"

import React from 'react'
import { motion, Variants } from 'framer-motion'
import Link from 'next/link'
import "../styles/futuristic-homepage.css";
import { Tag, Truck, Clock, Shield, Coins, Wrench } from 'lucide-react';
import { useBrand } from '../context/BrandClientWrapper'

const servicesVariant: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'circOut' } },
}

const serviceItemVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const Services: React.FC = () => {
    const brand = useBrand()
    const city = brand?.location?.address?.city || brand?.location?.city || 'your area'
    const services = [
      {
        icon: Tag,
        title: "Instant Valuation",
        description: "Get a free, instant valuation for your vehicle online in minutes",
        link: "/sell-your-car"
      },
      {
        icon: Coins,
        title: "Quality Inventory",
        description: "Hand-picked selection of quality used cars and commercial vehicles",
        link: "/used-cars"
      },
      {
        icon: Shield,
        title: "Warranty & Support",
        description: "Comprehensive warranty packages and ongoing support for peace of mind",
        link: "/warranty"
      },
      {
        icon: Truck,
        title: "Local Delivery",
        description: `Free local delivery service available across ${city} and surrounding areas`,
        link: "/contact"
      },
      {
        icon: Clock,
        title: "Flexible Finance",
        description: "Competitive finance options with quick approval processes",
        link: "/finance"
      },
      {
        icon: Wrench,
        title: "Expert Service",
        description: "Professional team with years of automotive expertise",
        link: "/about"
      }
    ];

    return (
    <section className="services-futuristic">
      <div className="services-header-futuristic">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={servicesVariant}>
          <h2 className="services-title-futuristic">Our Services</h2>
          <p className="services-subtitle-futuristic">
            Comprehensive automotive solutions tailored to your needs. From valuations to delivery, we've got you covered.
          </p>
        </motion.div>
      </div>

      <div className="services-grid-futuristic">
        {services.map((service, index) => (
          <motion.div
            key={index}
            className="service-item-futuristic"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={serviceItemVariant}
            transition={{ delay: index * 0.1 }}
          >
            <div className="service-icon-futuristic">
              <service.icon size={32} />
            </div>
            <h3 className="service-item-title-futuristic">{service.title}</h3>
            <p className="service-item-description-futuristic">{service.description}</p>
            <Link href={service.link} className="service-link-futuristic">
              Learn More
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
    );
};

export default Services;
