'use client';

import { CheckCircle, AlertCircle, User, Mail, Phone, MessageSquare, Send, MapPin } from 'lucide-react';
import { useContactLeadForm } from '../hooks/useContactLeadForm';
import { useBrand } from '../context/BrandClientWrapper';
import { getBrandContactInfo } from '../lib/contact';

// Honeypot input must NOT be visible — source app inherited a bare
// <input> with no hiding. Visually hide while keeping it focusable for bots.
const HONEYPOT_STYLE: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
  opacity: 0,
  pointerEvents: 'none',
};

export default function Contact() {
  const {
    handleSubmit,
    getFieldProps,
    errors,
    status,
    errorMessage,
    successMessage,
    honeypotProps,
  } = useContactLeadForm();

  const brand = useBrand();
  const contact = getBrandContactInfo(brand);
  const brandName = brand?.name || 'us';
  const isSubmitting = status === 'submitting';
  // brandstudio's useLeadsForm sets errors on submit/blur only; render them
  // only after the user has interacted (status !== 'idle' OR there's input).
  const showErrors = status !== 'idle';

  return (
    <section id="contact" className="contact-section" data-aos="fade-up">
      <div className="container">
        <div className="contact-inner">
          <div className="contact-card">
            {status === 'success' && (
              <div className="form-success" role="status" aria-live="polite">
                <CheckCircle className="form-icon" />
                <span>{successMessage ?? "Thanks for your message — someone will be in touch soon."}</span>
              </div>
            )}
            {status === 'error' && (
              <div className="form-error" role="alert">
                <AlertCircle className="form-icon" />
                <span>{errorMessage ?? 'Something went wrong. Please try again.'}</span>
              </div>
            )}

            <form className="contact-form" onSubmit={handleSubmit} aria-label="Contact form">
              <input type="text" {...honeypotProps} style={HONEYPOT_STYLE} tabIndex={-1} aria-hidden="true" />
              <div className="form-row">
                <div className="input-with-icon">
                  <label className="form-label" htmlFor="hc-name">Full name</label>
                  <User className="input-icon" />
                  <input
                    id="hc-name"
                    className="form-input"
                    type="text"
                    placeholder="Full name"
                    aria-required="true"
                    {...getFieldProps('name')}
                  />
                  {showErrors && errors.name && (
                    <p className="field-error">{errors.name}</p>
                  )}
                </div>
                <div className="input-with-icon">
                  <label className="form-label" htmlFor="hc-email">Email address</label>
                  <Mail className="input-icon" />
                  <input
                    id="hc-email"
                    className="form-input"
                    type="email"
                    placeholder="Email address"
                    aria-required="true"
                    {...getFieldProps('email')}
                  />
                  {showErrors && errors.email && (
                    <p className="field-error">{errors.email}</p>
                  )}
                </div>
              </div>
              <div className="input-with-icon">
                <label className="form-label" htmlFor="hc-phone">Phone (optional)</label>
                <Phone className="input-icon" />
                <input
                  id="hc-phone"
                  className="form-input"
                  type="tel"
                  placeholder="Phone (optional)"
                  {...getFieldProps('phone')}
                />
              </div>
              <div className="input-with-icon textarea">
                <label className="form-label" htmlFor="hc-message">Tell us how we can help</label>
                <MessageSquare className="input-icon" />
                <textarea
                  id="hc-message"
                  className="form-textarea"
                  placeholder="Tell us how we can help"
                  aria-required="true"
                  {...getFieldProps('message')}
                />
                {showErrors && errors.message && (
                  <p className="field-error">{errors.message}</p>
                )}
              </div>
              <div className="contact-actions">
                <button type="submit" className="form-submit" disabled={isSubmitting}>
                  <Send className="btn-icon" />
                  <span className="btn-text">{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
                <p className="contact-help-text">Typical response time: within 24 hours.</p>
              </div>
            </form>
          </div>

          <aside className="contact-info" aria-labelledby="contact-info-title">
            <h4 id="contact-info-title">Showroom Contact Details</h4>
            {contact.phoneDisplay ? (
              <div className="contact-line">
                <Phone className="contact-icon" />
                <div>
                  <p className="contact-label">Call us</p>
                  <a href={contact.phoneTel ? `tel:${contact.phoneTel}` : `tel:${contact.phoneDisplay.replace(/\s+/g, '')}`}>{contact.phoneDisplay}</a>
                </div>
              </div>
            ) : null}
            {contact.email ? (
              <div className="contact-line">
                <Mail className="contact-icon" />
                <div>
                  <p className="contact-label">Email us</p>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </div>
              </div>
            ) : null}
            {contact.showroomAddress ? (
              <div className="contact-visit">
                <div className="visit-row">
                  <MapPin className="contact-icon" />
                  <div>
                    <p className="visit-title">Visit us</p>
                    <p className="visit-address">{contact.showroomAddress}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
        {contact.showroomAddress ? (
          <div className="contact-map-wide">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(contact.showroomAddress)}&output=embed`}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${brandName} location`}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
