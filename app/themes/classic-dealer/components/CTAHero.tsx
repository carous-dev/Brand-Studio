"use client"

import { motion } from "framer-motion"
import "../styles/cta.css";
import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'

export default function CTAHero() {
    return (
        <motion.section
            className="cta-hero-lean"
            data-aos="fade-up"
            aria-label="Special offer"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
        >
            <div className="cta-hero-container">
                <h1 className="cta-hero-title">
                    Quality Cars, Dependable Service
                </h1>
                <p className="cta-hero-subtitle">
                    Every car undergoes a full specialist health check. Test drives at your convenience.
                </p>
                <div className="cta-hero-actions">
                    <Link href="/contact" className="cta-hero-btn primary">
                        <Phone size={18} />
                        Call Now
                        <ArrowRight size={16} />
                    </Link>
                    <Link href="/used-cars" className="cta-hero-btn secondary">
                        View Deals
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.section>
    )
}
