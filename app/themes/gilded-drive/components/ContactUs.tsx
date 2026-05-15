'use client'

import React, { useEffect, useState } from 'react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { useBrand } from '../context/BrandClientWrapper'

export default function ContactUs() {
    const brand = useBrand()
    const [submitted, setSubmitted] = useState(false)
    const leadSource = 'contact-page'
    const leadsEndpoint = process.env.NEXT_PUBLIC_LEADS_API_URL || ''
    const useExternalLeadApi = Boolean(leadsEndpoint && !leadsEndpoint.startsWith('/api/'))
    const brandName = brand?.name || 'our dealership'
    const city = String(brand?.location?.address?.city || brand?.location?.city || 'your area')
    const emailAddress = brand?.location?.email || 'info@example.com'
    const phoneNumber = brand?.location?.phone || ''
    const addressLines = [
        (brand?.location?.address as any)?.line1,
        (brand?.location?.address as any)?.line2,
        (brand?.location?.address as any)?.city,
        (brand?.location?.address as any)?.county,
        (brand?.location?.address as any)?.postcode || (brand?.location?.address as any)?.postalCode,
        (brand?.location?.address as any)?.country,
    ]
        .map((part) => (typeof part === 'string' ? part.trim() : ''))
        .filter(Boolean)
    const addressLabel = addressLines.length ? addressLines.join(', ') : city
    const addressHtml = addressLines.length ? addressLines : [city]
    const addressDisplay = [brandName, ...addressHtml]
    const mapQuery = encodeURIComponent(addressLabel)
    const mapEmbedSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`
    const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`

    const {
        values,
        errors,
        status,
        errorMessage,
        getFieldProps,
        honeypotProps,
        submit,
        reset
    } = useLeadsForm({
        initialValues: { first: '', last: '', email: '', phone: '', message: '', preferredContact: 'email' },
        leadType: 'contact-us',
        leadSource,
        honeypotField: 'website',
        endpoint: leadsEndpoint || '/api/send-lead-email',
        fieldConfig: {
            first: { required: true },
            last: { required: true },
            email: {
                required: true,
                validate: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? null : 'Enter a valid email address.')
            },
            message: {
                required: true,
                validate: (value) => (String(value || '').trim().length >= 5 ? null : 'Please enter a message.')
            },
            preferredContact: { required: true }
        },
        buildPayload: (formValues, meta) => {
            const payload = {
                leadType: 'contact-us',
                leadSource,
                name: `${formValues.first} ${formValues.last}`.trim(),
                email: formValues.email,
                phone: formValues.phone,
                message: formValues.message,
                preferredContact: formValues.preferredContact,
                formTs: meta.formTs,
                recaptchaToken: meta.recaptchaToken,
                [meta.honeypotField]: meta.honeypotValue
            }
            if (useExternalLeadApi) return payload
            return { leadData: payload }
        }
    })

    useEffect(() => {
        if (status === 'success') {
            setSubmitted(true)
            reset()
            const timer = window.setTimeout(() => setSubmitted(false), 5000)
            return () => window.clearTimeout(timer)
        }
        if (status === 'error' || status === 'idle' || status === 'rate-limited') {
            setSubmitted(false)
        }
    }, [status, reset])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        await submit()
    }

    const formError = errorMessage || Object.values(errors)[0] || null
    const loading = status === 'submitting'

    return (
        <>
            {/* Hero Section - Dark Theme */}
            <section className="contact-hero-modern">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                    <div className="hero-pattern"></div>
                </div>
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 11v2a2 2 0 002 2h1v-6H6v-0.5A6 6 0 0118 9.5V12h-1v6h1a3 3 0 003-3v-3a9 9 0 00-9-9z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Get in Touch
                        </div>
                        <h1 className="hero-title">Contact <span className="title-highlight">{brandName}</span></h1>
                        <p className="hero-description">
                            Email, call, or complete the form to learn how {brandName} can help you find the right vehicle. 
                            We're available to answer questions, arrange viewings and offer support.
                        </p>
                        
                        <div className="contact-info-grid">
                            <div className="info-item">
                                <div className="info-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <h4>Email</h4>
                                    <p>{emailAddress}</p>
                                </div>
                            </div>
                            
                            <div className="info-item">
                                <div className="info-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <h4>Phone</h4>
                                    <p>{phoneNumber || 'Call us'}</p>
                                </div>
                            </div>
                            
                            <div className="info-item">
                                <div className="info-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <div className="info-content">
                                    <h4>Location</h4>
                                    <p>{city}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Methods Section - Light Theme */}
            <section className="contact-methods-modern">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">How Can We Help?</h2>
                        <p className="section-subtitle">Choose the best way to reach us based on your needs</p>
                    </div>
                    
                    <div className="methods-grid">
                        <article className="method-card">
                            <div className="method-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 3a9 9 0 00-9 9v3a3 3 0 003 3h1v-6H6v-0.5A6 6 0 0118 9.5V12h-1v6h1a3 3 0 003-3v-3a9 9 0 00-9-9z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="method-content">
                                <h3>Customer Support</h3>
                                <p>Our support team is available to address any concerns or queries you may have about our vehicles or services.</p>
                                <a href={`mailto:${emailAddress}?subject=Customer%20Support%20Enquiry`} className="method-link">
                                    Contact Support
                                </a>
                            </div>
                        </article>

                        <article className="method-card">
                            <div className="method-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="method-content">
                                <h3>Feedback & Suggestions</h3>
                                <p>We value your feedback — tell us how we can improve your experience or suggest new features.</p>
                                <a href={`mailto:${emailAddress}?subject=Feedback%20%26%20Suggestions`} className="method-link">
                                    Send Feedback
                                </a>
                            </div>
                        </article>

                        <article className="method-card">
                            <div className="method-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 11v2a2 2 0 002 2h1l7 4V5L6 9H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="method-content">
                                <h3>Media Inquiries</h3>
                                <p>For press or media requests, partnership opportunities, or promotional collaborations.</p>
                                <a href={`mailto:${emailAddress}?subject=Media%20Enquiry`} className="method-link">
                                    Media Contact
                                </a>
                            </div>
                        </article>
                    </div>
                </div>
            </section>

            {/* Contact Form Section - Dark Theme */}
            <section className="contact-form-modern">
                <div className="container">
                    <div className="form-grid">
                        <div className="form-content">
                            <div className="form-badge">Send us a message</div>
                            <h2 className="form-title">Ready to Find Your Perfect Vehicle?</h2>
                            <p className="form-description">
                                Fill out the form below and one of our specialists will get back to you within 24 hours to discuss your requirements.
                            </p>
                            
                            <div className="form-features">
                                <div className="feature-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Quick response within 24 hours</span>
                                </div>
                                <div className="feature-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>Expert vehicle consultation</span>
                                </div>
                                <div className="feature-item">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    <span>No obligation viewing appointments</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-wrapper">
                            <form className="contact-form-card" onSubmit={handleSubmit} aria-label="Contact form">
                                {formError && (
                                    <div className="error-message" role="alert" aria-live="assertive">
                                        {formError}
                                    </div>
                                )}
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="first">First Name</label>
                                        <input
                                            type="text"
                                            id="first"
                                            placeholder="Enter your first name"
                                            {...getFieldProps('first')}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="last">Last Name</label>
                                        <input
                                            type="text"
                                            id="last"
                                            placeholder="Enter your last name"
                                            {...getFieldProps('last')}
                                            required
                                        />
                                    </div>
                                </div>

                                <input type="text" placeholder="Your website" {...honeypotProps} />

                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="your.email@example.com"
                                        {...getFieldProps('email')}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        placeholder={phoneNumber || 'Your phone number'}
                                        {...getFieldProps('phone')}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="preferredContact">Preferred Contact Method</label>
                                    <select
                                        id="preferredContact"
                                        {...getFieldProps('preferredContact')}
                                    >
                                        <option value="email">Email</option>
                                        <option value="phone">Phone</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        placeholder="Tell us about the vehicle you're looking for or how we can help..."
                                        {...getFieldProps('message')}
                                        required
                                    />
                                </div>

                                <div className="form-terms">
                                    <p>
                                        By contacting us, you agree to our{' '}
                                        <a href="/terms" className="terms-link">Terms of Service</a> and{' '}
                                        <a href="/privacy" className="terms-link">Privacy Policy</a>.
                                    </p>
                                </div>

                                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? 'Sending Message...' : 'Send Message'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Section - Light Theme */}
            <section className="contact-location-modern">
                <div className="container">
                    <div className="location-grid">
                        <div className="location-content">
                            <div className="location-badge">Visit Our Showroom</div>
                            <h2 className="location-title">Come See Us in Person</h2>
                            <p className="location-description">
                                Experience our quality vehicles firsthand at our {city} showroom. 
                                Our team is ready to show you around and help you find the perfect car.
                            </p>
                            
                            <div className="location-details">
                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="detail-content">
                                        <h4>Address</h4>
                                        <p>
                                            {addressDisplay.map((line, index) => (
                                                <React.Fragment key={`${line}-${index}`}>
                                                    {line}
                                                    <br />
                                                </React.Fragment>
                                            ))}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="detail-content">
                                        <h4>Opening Hours</h4>
                                        <p>Monday - Friday: 9:00 AM - 6:00 PM<br />Saturday: 10:00 AM - 4:00 PM<br />Sunday: Closed</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="location-actions">
                                <a href={`tel:${String(phoneNumber).replace(/[^0-9+]/g, '')}`} className="btn btn-primary">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Call Now
                                </a>
                                <a href={`mailto:${emailAddress}`} className="btn btn-outline">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Email Us
                                </a>
                            </div>
                        </div>

                        <div className="map-card">
                            <iframe
                                src={mapEmbedSrc}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`${brandName} Location Map - ${addressLabel}`}
                            />
                            <div className="map-overlay">
                                <a 
                                    href={directionsHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="map-directions-btn"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <path d="M12 7v6l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    Get Directions
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Snackbar for success message */}
            <div className={`snackbar-modern ${submitted ? 'show' : ''}`} role="status" aria-live="polite">
                <div className="snackbar-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="snackbar-content">
                    <strong>Message Sent!</strong>
                    <p>Thank you! We'll be in touch shortly.</p>
                </div>
            </div>
        </>
    )
}




