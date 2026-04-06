"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  Car,
  Handshake,
  PoundSterling,
  Shield,
  Truck,
  Wrench,
} from "lucide-react"
import "../styles/services-page.css"

type AppIconName =
  | "arrow-right"
  | "car"
  | "handshake"
  | "pound-sign"
  | "shield-alt"
  | "truck"
  | "wrench"

const ICON_MAP: Record<AppIconName, LucideIcon> = {
  "arrow-right": ArrowRight,
  car: Car,
  handshake: Handshake,
  "pound-sign": PoundSterling,
  "shield-alt": Shield,
  truck: Truck,
  wrench: Wrench,
}

function AppIcon({ name }: { name: AppIconName }) {
  const Icon = ICON_MAP[name]

  return (
    <i className="app-icon" aria-hidden="true">
      <Icon size="1em" strokeWidth={2} />
    </i>
  )
}

export default function ServiceMain() {
  return (
    <motion.section
      className="services-section"
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="services-container">
        <div className="services-header">
          <h2 className="services-title" data-aos="fade-up">
            OUR SERVICES
          </h2>
          <div className="services-divider" data-aos="fade-up" data-aos-delay="60" />
          <p className="services-subtitle" data-aos="fade-up" data-aos-delay="120">
            Complete used car support from enquiry to handover
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card" data-aos="zoom-in" data-aos-delay="60">
            <div className="service-icon">
              <AppIcon name="car" />
            </div>
            <h3 className="service-title">CAR SALES</h3>
            <p className="service-description">
              Quality used vehicles sourced predominantly through main dealers and prepared to a
              high retail standard.
            </p>
            <Link href="/services" className="service-link">
              Learn More <AppIcon name="arrow-right" />
            </Link>
          </div>

          <div className="service-card" data-aos="zoom-in" data-aos-delay="120">
            <div className="service-icon">
              <AppIcon name="handshake" />
            </div>
            <h3 className="service-title">PART EXCHANGE</h3>
            <p className="service-description">
              Competitive part exchange values for your current vehicle to keep your upgrade simple
              and cost-effective.
            </p>
            <Link href="/services" className="service-link">
              Learn More <AppIcon name="arrow-right" />
            </Link>
          </div>

          <div className="service-card" data-aos="zoom-in" data-aos-delay="180">
            <div className="service-icon">
              <AppIcon name="pound-sign" />
            </div>
            <h3 className="service-title">FINANCE OPTIONS</h3>
            <p className="service-description">
              Finance support tailored to your budget with clear options explained before you
              commit.
            </p>
            <Link href="/services" className="service-link">
              Learn More <AppIcon name="arrow-right" />
            </Link>
          </div>

          <div className="service-card" data-aos="zoom-in" data-aos-delay="240">
            <div className="service-icon">
              <AppIcon name="wrench" />
            </div>
            <h3 className="service-title">AFTER-SALES SUPPORT</h3>
            <p className="service-description">
              Minimum 3-month comprehensive warranty (unless stated) plus friendly after-sales
              support.
            </p>
            <Link href="/services" className="service-link">
              Learn More <AppIcon name="arrow-right" />
            </Link>
          </div>

          <div className="service-card" data-aos="zoom-in" data-aos-delay="300">
            <div className="service-icon">
              <AppIcon name="shield-alt" />
            </div>
            <h3 className="service-title">VEHICLE INSPECTION</h3>
            <p className="service-description">
              HPI and finance checks with careful preparation so you can buy with confidence.
            </p>
            <Link href="/services" className="service-link">
              Learn More <AppIcon name="arrow-right" />
            </Link>
          </div>

          <div className="service-card" data-aos="zoom-in" data-aos-delay="360">
            <div className="service-icon">
              <AppIcon name="truck" />
            </div>
            <h3 className="service-title">DELIVERY SERVICE</h3>
            <p className="service-description">
              Collection support and practical handover options for local and distance customers.
            </p>
            <Link href="/services" className="service-link">
              Learn More <AppIcon name="arrow-right" />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
