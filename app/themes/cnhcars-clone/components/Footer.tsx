'use client';

import { Phone, Mail, MapPin } from 'lucide-react';
import { useBrand } from '../context/BrandClientWrapper';
import { getBrandContactInfo } from '../lib/contact';
import '../styles/footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const brand = useBrand();
  const contact = getBrandContactInfo(brand);
  const brandName = brand?.name || 'Our showroom';
  const brandLogo = brand?.logo || '';
  const description =
    (brand as any)?.tagline ||
    (brand as any)?.description ||
    `${brandName} — quality used cars with honest service.`;

  return (
    <>
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-col footer-brand">
              {brandLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brandLogo} alt={`${brandName} logo`} width={130} height={32} style={{ width: '130px', height: 'auto' }} />
              ) : (
                <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{brandName}</span>
              )}
              <p className="brand-description">{description}</p>
            </div>

            <div className="footer-col footer-links">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/used-cars">Used Cars</a></li>
                <li><a href="/services">Services</a></li>
                <li><a href="/sell-my-car">Sell your car</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-col footer-contact">
              <h4>Get in Touch</h4>
              {contact.phoneDisplay ? (
                <div className="contact-line">
                  <Phone className="contact-icon" />
                  <p>
                    <a href={contact.phoneTel ? `tel:${contact.phoneTel}` : `tel:${contact.phoneDisplay.replace(/\s+/g, '')}`}>
                      {contact.phoneDisplay}
                    </a>
                  </p>
                </div>
              ) : null}
              {contact.email ? (
                <div className="contact-line">
                  <Mail className="contact-icon" />
                  <p><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
                </div>
              ) : null}
              {contact.showroomAddress ? (
                <div className="contact-line">
                  <MapPin className="contact-icon" />
                  <p>{contact.showroomAddress}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </footer>
      <div className="footer-bottom">
        <div className="footer-legal">
          <a href="/privacy-policy" className="legal-link">Privacy</a>
          <span className="legal-divider">•</span>
          <a href="/cookie-policy" className="legal-link">Cookies</a>
        </div>
        <p className="footer-bottom-text">&copy; {currentYear} {brandName}. All rights reserved.</p>
        <div className="footer-credit">
          Site by <a href="https://carous.co.uk" target="_blank" rel="noopener noreferrer">Carous Limited</a>
        </div>
      </div>
    </>
  );
}
