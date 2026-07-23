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

// The four socials always render at full opacity — a link when the brand has a
// URL, a plain glyph otherwise. No muted/disabled variants.
const SOCIAL_KEYS = ['facebook', 'twitter', 'instagram', 'youtube'] as const;

export default function ContactBar() {
  const brand = useBrand();
  const contact = getBrandContactInfo(brand);
  const socialUrls = new Map(getBrandSocialLinks(brand).map((s) => [s.key, s.href]));

  if (!contact.email && !contact.phoneDisplay && !contact.showroomAddress) {
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
            <div className="contact-bar-item contact-bar-item-address">
              <MapPin className="contact-bar-icon" />
              <span className="contact-bar-text">{contact.showroomAddress}</span>
            </div>
          ) : null}
        </div>

        <div className="contact-bar-social">
          {SOCIAL_KEYS.map((key) => {
            const Icon = ICON_BY_KEY[key];
            const href = socialUrls.get(key);
            const label = key.charAt(0).toUpperCase() + key.slice(1);
            return href ? (
              <a
                key={key}
                href={href}
                className="contact-bar-social-link"
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon className="contact-bar-social-icon" />
              </a>
            ) : (
              <span key={key} className="contact-bar-social-link" aria-hidden="true">
                <Icon className="contact-bar-social-icon" />
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
