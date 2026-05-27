'use client';

import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import type { ComponentType } from 'react';
import { useBrand } from '../context/BrandClientWrapper';
import { getBrandContactInfo, getBrandSocialLinks } from '../lib/contact';

const ICON_BY_KEY: Record<string, ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  youtube: Youtube,
};

export default function ContactBar() {
  const brand = useBrand();
  const contact = getBrandContactInfo(brand);
  const socials = getBrandSocialLinks(brand);

  if (!contact.email && !contact.phoneDisplay && !contact.showroomAddress && socials.length === 0) {
    return null;
  }

  return (
    <div className="contact-bar">
      <div className="contact-bar-wrapper">
        <div className="contact-bar-info">
          {contact.email ? (
            <a className="contact-bar-item" href={`mailto:${contact.email}`}>
              <Mail className="contact-bar-icon" />
              <span className="contact-bar-text">{contact.email}</span>
            </a>
          ) : null}
          {contact.phoneDisplay ? (
            <a
              className="contact-bar-item"
              href={contact.phoneTel ? `tel:${contact.phoneTel}` : `tel:${contact.phoneDisplay.replace(/\s+/g, '')}`}
            >
              <Phone className="contact-bar-icon" />
              <span className="contact-bar-text">{contact.phoneDisplay}</span>
            </a>
          ) : null}
          {contact.showroomAddress ? (
            <div className="contact-bar-item">
              <MapPin className="contact-bar-icon" />
              <span className="contact-bar-text">{contact.showroomAddress}</span>
            </div>
          ) : null}
        </div>

        {socials.length > 0 ? (
          <div className="contact-bar-social">
            {socials.map((social) => {
              const Icon = ICON_BY_KEY[social.key];
              if (!Icon) return null;
              return (
                <a
                  key={social.key}
                  href={social.href}
                  className="contact-bar-social-link"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="contact-bar-social-icon" />
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
