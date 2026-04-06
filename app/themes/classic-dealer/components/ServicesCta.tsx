"use client"

import React from "react"
import { Mail, Phone } from "lucide-react"
import { useBrand } from "../context/BrandClientWrapper"
import "../styles/services-cta.css"

type ServicesCtaContent = {
  title?: string
  description?: string
  phoneLabel?: string
  emailLabel?: string
}

export default function ServicesCta() {
  const brand = useBrand()
  const servicesCta = (brand.pages?.home?.servicesCta || {}) as ServicesCtaContent

  const phone = brand?.location?.phone || ""
  const email = brand?.location?.email || ""
  const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, "")}` : ""
  const mailHref = email ? `mailto:${email}` : ""

  const title = servicesCta.title || "Need Help? Contact Us Today!"
  const description =
    servicesCta.description ||
    `Speak to ${brand.name} for stock, finance, valuation or sourcing support.`
  const defaultPhoneLabel = "Book Appointment"
  const rawPhoneLabel = servicesCta.phoneLabel || defaultPhoneLabel
  const phoneLabel = /\d/.test(rawPhoneLabel) ? defaultPhoneLabel : rawPhoneLabel
  const emailLabel = servicesCta.emailLabel || "Send Email"

  if (!phone && !email) return null

  return (
    <section className="services-cta" aria-label="Contact call to action">
      <div className="services-cta-content">
        <h3 className="cta-title" data-aos="fade-up">
          {title}
        </h3>
        <p className="cta-description" data-aos="fade-up" data-aos-delay="60">
          {description}
        </p>
        <div className="cta-buttons">
          {phone ? (
            <a href={telHref} className="cta-btn phone-btn" data-aos="fade-right" data-aos-delay="120">
              <Phone size={18} aria-hidden="true" />
              {phoneLabel}
            </a>
          ) : null}
          {email ? (
            <a href={mailHref} className="cta-btn email-btn" data-aos="fade-left" data-aos-delay="160">
              <Mail size={18} aria-hidden="true" />
              {emailLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  )
}
