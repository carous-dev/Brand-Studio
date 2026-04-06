"use client"

import React, { FormEvent, useMemo } from 'react'
import Link from 'next/link'
import '../styles/footer.css'
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Youtube, Send, Linkedin } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'

type FooterProps = {}

const QUICK_LINKS = [
  { href: '/used-cars', label: 'Buy Used Cars' },
  { href: '/sell-your-car', label: 'Sell Your Car' },
  { href: '/finance', label: 'Finance' },
  { href: '/warranty', label: 'Warranty' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/contact', label: 'Contact' },
]

const Footer: React.FC<FooterProps> = () => {
  const brand = useBrand()
  const brandName = brand?.name || 'Dealership'
  const logoSrc = brand?.logo || '/images/logo-l.png'
  const year = new Date().getFullYear()
  const socialLinks = brand?.socialLinks ?? {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: '',
  }

  const address = useMemo(() => {
    const addressData = (brand?.location?.address ?? {}) as Record<string, any>
    const parts = [
      addressData.line1,
      addressData.line2,
      addressData.city,
      addressData.county,
      addressData.postcode || addressData.postalCode,
      addressData.country,
    ]
      .map((part) => (typeof part === 'string' ? part.trim() : ''))
      .filter(Boolean)

    return parts.length ? parts.join(', ') : ''
  }, [brand?.location?.address])

  const primaryPhone = brand?.location?.phone || ''
  const secondaryPhone = String((brand?.location as any)?.phoneSecondary || (brand?.location as any)?.phone2 || '')
  const email = brand?.location?.email || ''

  function handleNewsletter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const form = e.currentTarget
    const data = new FormData(form)
    const newsletterEmail = data.get('email')

    if (newsletterEmail) {
      // placeholder feedback - replace with real integration
      // eslint-disable-next-line no-alert
      alert('Thanks - ' + newsletterEmail)
      form.reset()
    }
  }

  return (
    <>
      <footer className="site-footer">
        <div className="container footer-top">
          <div className="footer-col footer-brand">
            <Link href="/">
              <img src={logoSrc} alt={brandName} className="footer-logo" />
            </Link>
            <p className="footer-desc">
              {brandName} delivers inspected vehicles, clear pricing and local service.
            </p>
            <ul className="contact-list">
              {address ? (
                <li>
                  <span className="ico"><MapPin size={16} /></span>
                  {address}
                </li>
              ) : null}
              {primaryPhone || secondaryPhone ? (
                <li>
                  <span className="ico"><Phone size={16} /></span>
                  {primaryPhone ? (
                    <a href={`tel:${String(primaryPhone).replace(/[^0-9+]/g, '')}`}>{primaryPhone}</a>
                  ) : null}
                  {secondaryPhone ? (
                    <>
                      {primaryPhone ? ' / ' : null}
                      <a href={`tel:${String(secondaryPhone).replace(/[^0-9+]/g, '')}`}>{secondaryPhone}</a>
                    </>
                  ) : null}
                </li>
              ) : null}
              {email ? (
                <li>
                  <span className="ico"><Mail size={16} /></span>
                  <a href={`mailto:${email}`}>{email}</a>
                </li>
              ) : null}
            </ul>
          </div>

          <div className="footer-col footer-links">
            <h4>Quick Links</h4>
            <ul className="footer-links-list">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
              ))}
            </ul>
            <div className="mt-20">
              <Link className="btn btn-primary" href="/sell-your-car">Sell Your Car</Link>
            </div>
          </div>

          <div className="footer-col footer-news">
            <h4>Newsletter</h4>
            <p>Subscribe to our newsletter for the latest offers and updates.</p>
            <form className="newsletter-form" onSubmit={handleNewsletter} aria-label="Subscribe to newsletter">
              <label htmlFor="footer-email" className="sr-only">Email</label>
              <div className="input-wrap">
                <input id="footer-email" name="email" type="email" placeholder="Your email address" required />
                <button className="btn-send" aria-label="Send newsletter">
                  <Send size={16} />
                </button>
              </div>
            </form>

            <h5 className="follow-title">Follow Us</h5>
            <div className="social-row">
              {socialLinks.facebook ? (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-ico"><Facebook size={14} /></a>
              ) : null}
              {socialLinks.instagram ? (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="social-ico"><Instagram size={14} /></a>
              ) : null}
              {socialLinks.twitter ? (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="social-ico"><Twitter size={14} /></a>
              ) : null}
              {socialLinks.youtube ? (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-ico"><Youtube size={14} /></a>
              ) : null}
              {socialLinks.linkedin ? (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-ico"><Linkedin size={14} /></a>
              ) : null}
            </div>

            <p className="hours footer-hours">Open Mon-Sat: 09:30-17:30</p>
          </div>
        </div>
      </footer>

      <div className="footer-legal full-bleed">
        <div className="container legal-inner">
          <div className="copyright">(c) {year} {brandName}. All rights reserved.</div>
          <div className="legal-links">
            <Link href="/privacy-policy">Privacy Policy</Link>
            <Link href="/cookie-policy">Cookie Policy</Link>
            <a href="/sitemap.xml">Sitemap</a>
          </div>
          <div className="built">Built with <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer" className="carous">Carous Limited</a></div>
        </div>
      </div>
    </>
  )
}

export default Footer
