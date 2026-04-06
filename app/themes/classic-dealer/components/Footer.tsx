"use client"

import React, { FormEvent } from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'

type FooterProps = {}

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/used-cars', label: 'Used Cars' },
  { href: '/services', label: 'Services' },
  { href: '/sell-your-car', label: 'Sell Your Car' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
]

const Footer: React.FC<FooterProps> = () => {
  const brand = useBrand()
  const socialLinks = brand?.socialLinks ?? { facebook: '', instagram: '', youtube: '', linkedin: '', twitter: '' }
  const footerSocialItems = [
    { key: 'facebook', label: 'Facebook', href: socialLinks.facebook, Icon: Facebook },
    { key: 'instagram', label: 'Instagram', href: socialLinks.instagram, Icon: Instagram },
    { key: 'twitter', label: 'Twitter', href: String((socialLinks as any).twitter || ''), Icon: Twitter },
    { key: 'linkedin', label: 'LinkedIn', href: socialLinks.linkedin, Icon: Linkedin },
  ]
  const brandName = brand?.name || 'Dealership'
  const logoSrc = brand?.logo || '/images/logo.png'
  const aboutDescription = brand?.aboutUs?.description || brand?.tagline || ''
  const fullAddress = brand?.location?.fullAddress || ''
  const phone = brand?.location?.phone || ''
  const secondaryPhone = String((brand?.location as any)?.phoneSecondary || (brand?.location as any)?.phone2 || '')
  const email = brand?.location?.email || ''
  const telHref = phone ? `tel:${phone.replace(/[^0-9]/g, '')}` : ''
  const secondaryTelHref = secondaryPhone ? `tel:${secondaryPhone.replace(/[^0-9]/g, '')}` : ''
  const address = brand?.location?.address || {}
  const addressLine1 = [address?.line1, address?.line2].filter(Boolean).join(', ')
  const addressLine2 = [address?.city, address?.county, address?.postcode].filter(Boolean).join(', ')
  const openingHours = brand?.openingHours || {}
  const mondayHours = openingHours?.monday
  const saturdayHours = openingHours?.saturday
  const hoursSummary = mondayHours && saturdayHours
    ? `Mon-Sat: ${mondayHours}`
    : mondayHours || saturdayHours || ''

  function handleNewsletter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
  }

  return (
    <>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-shell">
            <div className="footer-brand">
              <Link href="/" className="footer-logo" aria-label={`${brandName} home`}>
                <img
                  src={logoSrc}
                  alt={brandName}
                  className="footer-logo-image"
                />
              </Link>
              <p className="footer-tagline">
                {aboutDescription}
              </p>
              <div className="footer-social" aria-label="Social links">
                {footerSocialItems.map(({ key, label, href, Icon }) => {
                  const safeHref = href && href.trim() ? href.trim() : '#'
                  const disabled = safeHref === '#'

                  return (
                    <a
                      key={key}
                      href={safeHref}
                      aria-label={label}
                      target={disabled ? undefined : "_blank"}
                      rel={disabled ? undefined : "noopener noreferrer"}
                      className={disabled ? "is-disabled" : ""}
                      aria-disabled={disabled}
                      tabIndex={disabled ? -1 : undefined}
                      onClick={disabled ? (event) => event.preventDefault() : undefined}
                    >
                      <Icon size={16} />
                    </a>
                  )
                })}
              </div>
            </div>

            <div className="footer-column">
              <h3>Quick Links</h3>
              <ul>
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}><Link href={link.href}>{link.label}</Link></li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h3>Contact</h3>
              <ul>
                {phone && <li><a href={telHref}>{phone}</a></li>}
                {secondaryPhone && <li><a href={secondaryTelHref}>{secondaryPhone}</a></li>}
                {email && <li><a href={`mailto:${email}`}>{email}</a></li>}
                {addressLine1 ? <li>{addressLine1}</li> : null}
                {addressLine2 ? <li>{addressLine2}</li> : (fullAddress ? <li>{fullAddress}</li> : null)}
                {hoursSummary && <li>{hoursSummary}</li>}
                <li>Viewings by appointment only</li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Stay Updated</h3>
              <p className="footer-news-text">Get the latest arrivals and offers directly to your inbox.</p>
              <form className="footer-newsletter" onSubmit={handleNewsletter}>
                <label className="sr-only" htmlFor="footer-email">Email address</label>
                <input id="footer-email" type="email" placeholder="Your email address" required />
                <button type="submit">Subscribe</button>
              </form>

              {socialLinks.youtube && (
                <div className="youtube-widget">
                  <div className="youtube-widget-header">
                    <h4 className="youtube-widget-title">Find us on</h4>
                  </div>
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="youtube-link"
                    aria-label="Visit our YouTube channel"
                  >
                    <div className="youtube-logo">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <span className="youtube-text">YouTube</span>
                  </a>
                  <p className="youtube-description">
                    Subscribe to our channel for vehicle walkthroughs, reviews, and dealership updates.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-shell footer-bottom-inner">
            <p className="footer-copyright">&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
            <p className="footer-designed-by">
              Designed by{" "}
              <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">
                Carous Limited
              </a>
            </p>
            <div className="footer-bottom-links">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/cookie-policy">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Footer
