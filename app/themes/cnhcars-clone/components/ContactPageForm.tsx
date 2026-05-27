'use client';

import { CheckCircle, AlertCircle, Send } from 'lucide-react';
import { useContactLeadForm } from '../hooks/useContactLeadForm';

// See Contact.tsx — honeypot input must be visually hidden.
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

export default function ContactPageForm() {
  const {
    handleSubmit,
    getFieldProps,
    status,
    successMessage,
    errorMessage,
    errors,
    honeypotProps,
  } = useContactLeadForm();

  const isSubmitting = status === 'submitting';
  const showErrors = status !== 'idle';

  return (
    <>
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

      <form className="contact-form" id="contactForm" onSubmit={handleSubmit} aria-label="Contact form">
        <input type="text" {...honeypotProps} style={HONEYPOT_STYLE} tabIndex={-1} aria-hidden="true" />
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            aria-required="true"
            placeholder="Your name"
            {...getFieldProps('name')}
          />
          {showErrors && errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            aria-required="true"
            placeholder="your@email.com"
            {...getFieldProps('email')}
          />
          {showErrors && errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            placeholder="+44 1234 567890"
            {...getFieldProps('phone')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="subject">Subject *</label>
          <input
            type="text"
            id="subject"
            aria-required="true"
            placeholder="What's this about?"
            {...getFieldProps('subject')}
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message *</label>
          <textarea
            id="message"
            rows={5}
            aria-required="true"
            placeholder="Tell us more..."
            {...getFieldProps('message')}
          />
          {showErrors && errors.message && <p className="field-error">{errors.message}</p>}
        </div>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          <Send className="btn-icon" />
          <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
        </button>
      </form>
    </>
  );
}
