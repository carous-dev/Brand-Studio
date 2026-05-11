"use client"
// audit-ignore-file: tp-use-client-on-page
// Springalls baseline page; Mode B (clone-and-edit) ports inherit this.
// Extracting interactivity into client islands is a known follow-up — same
// risk-management as columbus-vehicles-bespoke/pages/used-cars/[slug]/page.tsx
// (see FEATURE_LOG 2026-05-10 for the Turbopack chunk-item collision rationale).

import { useEffect, useMemo } from 'react'
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import styles from './page.module.css'
import { useBrand } from '../../context/BrandClientWrapper'
import { HeroBackdrop } from '../../components/HeroBackdrop'
import { useLeadsForm } from '../../../../hooks/useLeadsForm'
import { isValidUkPhone } from '../../lib/uk-phone'
import { getBrandContactInfo } from '../../lib/contact'

type ContactFormValues = {
  name: string
  email: string
  phone: string
  topic: string
  message: string
  url: string
}

function formatHoursLine(hours?: Record<string, string>): string {
  if (!hours) return 'Mon-Sat 10:00-18:00 · Sun 10:00-16:00'
  const weekday = hours.Monday || hours.monday || hours['Mon-Sat'] || hours['Mon-Fri']
  const sun = hours.Sunday || hours.sunday
  const parts: string[] = []
  if (weekday && !/closed/i.test(weekday)) parts.push(`Mon-Sat ${weekday}`)
  if (sun && !/closed/i.test(sun)) parts.push(`Sun ${sun}`)
  return parts.length ? parts.join(' · ') : 'Mon-Sat 10:00-18:00 · Sun 10:00-16:00'
}

export function SpringallsContactPage() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const brandName = brand?.name || 'Springalls Car Sales'

  const showroomAddress = contact.showroomAddress || 'Office 108a, Regus, 200 Brook Drive, Reading, Berkshire RG2 6UB'
  const phoneDisplay = contact.phoneDisplay || '+44 7738 906707'
  const phoneTel = contact.phoneTel || '+447738906707'
  const whatsappUrl = contact.whatsappUrl || 'https://wa.me/447738906707'
  const email = contact.email || 'sales@springalls.co.uk'
  const hoursLine = formatHoursLine((brand as any)?.openingHours)

  const mapsEmbedUrl = useMemo(
    () => `https://www.google.com/maps?q=${encodeURIComponent(showroomAddress)}&output=embed`,
    [showroomAddress]
  )
  const mapsDirectionsUrl = useMemo(
    () => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(showroomAddress)}`,
    [showroomAddress]
  )

  const CONTACT_CARDS = [
    { title: 'Visit our showroom', detail: showroomAddress, icon: MapPin },
    { title: 'Call the team', detail: phoneDisplay, href: `tel:${phoneTel}`, icon: Phone },
    { title: 'WhatsApp us', detail: phoneDisplay, href: whatsappUrl, icon: MessageCircle },
    { title: 'Email us', detail: email, icon: Mail },
    { title: 'Opening hours', detail: hoursLine, icon: Clock }
  ]

  const leadsEndpoint = process.env.NEXT_PUBLIC_LEADS_API_URL || '/leads'

  const contactForm = useLeadsForm<ContactFormValues>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      topic: 'Vehicle enquiry',
      message: '',
      url: ''
    },
    endpoint: leadsEndpoint || '/leads',
    leadType: 'contact-enquiry',
    leadSource: 'contact-us',
    honeypotField: 'website',
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (value) => (/\S+@\S+\.\S+/.test(String(value || '')) ? null : 'Please enter a valid email.')
      },
      phone: {
        required: true,
        validate: (value) => (isValidUkPhone(value) ? null : 'Please enter a valid phone number.')
      },
      topic: { required: true },
      message: { required: true }
    },
    buildPayload: (values, meta) => {
      const pageUrl = values.url || (typeof window !== 'undefined' ? window.location.href : '')
      const extraLines = [
        `Topic: ${values.topic || 'Not specified'}`,
        `Phone: ${values.phone || 'Not provided'}`,
        `Page URL: ${pageUrl || 'Not provided'}`
      ]
      const composedMessage = [values.message, '', ...extraLines].filter(Boolean).join('\n')
      return {
        name: values.name,
        email: values.email,
        phone: values.phone,
        topic: values.topic,
        subject: `Contact enquiry: ${values.topic || 'General'}`,
        message: composedMessage,
        url: pageUrl,
        leadType: 'contact-enquiry',
        leadSource: 'contact-us',
        formTs: meta.formTs,
        recaptchaToken: meta.recaptchaToken,
        [meta.honeypotField]: meta.honeypotValue
      }
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && !contactForm.values.url) {
      contactForm.setFieldValue('url', window.location.href)
    }
  }, [contactForm.setFieldValue, contactForm.values.url])

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <HeroBackdrop />
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Contact Us</p>
          <h1 className={styles.heroTitle}>We are here to help</h1>
          <p className={styles.heroLead}>
            Speak to the team for vehicle enquiries, finance questions, or part exchange valuations.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.cardGrid}>
            {CONTACT_CARDS.map((card) => {
              const Icon = card.icon
              const cardBody = card.href ? (
                <a
                  className={styles.cardLink}
                  href={card.href}
                  {...(card.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  {card.detail}
                </a>
              ) : (
                <p className={styles.cardText}>{card.detail}</p>
              )
              return (
                <article key={card.title} className={styles.card}>
                  <div className={styles.cardIcon} aria-hidden="true">
                    <Icon size={22} strokeWidth={1.8} />
                  </div>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  {cardBody}
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Send us a message</h2>
            <p className={styles.sectionText}>Complete the form below and we will respond as quickly as possible.</p>
          </div>
          <div className={styles.contactGrid}>
            <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void contactForm.submit() }}>
              <input type="text" {...contactForm.honeypotProps} />
              <label className={styles.field}>
                <span>Full name</span>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Your name"
                  aria-invalid={Boolean(contactForm.errors.name)}
                  {...contactForm.getFieldProps('name')}
                />
                {contactForm.errors.name ? <span className={styles.fieldError}>{contactForm.errors.name}</span> : null}
              </label>
              <label className={styles.field}>
                <span>Email address</span>
                <input
                  id="contact-email"
                  type="email"
                  placeholder="you@email.com"
                  aria-invalid={Boolean(contactForm.errors.email)}
                  {...contactForm.getFieldProps('email')}
                />
                {contactForm.errors.email ? (
                  <span className={styles.fieldError}>{contactForm.errors.email}</span>
                ) : null}
              </label>
              <label className={styles.field}>
                <span>Phone number</span>
                <input
                  id="contact-phone"
                  type="tel"
                  placeholder="07123 456789"
                  aria-invalid={Boolean(contactForm.errors.phone)}
                  {...contactForm.getFieldProps('phone')}
                />
                {contactForm.errors.phone ? (
                  <span className={styles.fieldError}>{contactForm.errors.phone}</span>
                ) : null}
              </label>
              <label className={styles.field}>
                <span>Topic</span>
                <select
                  id="contact-topic"
                  aria-invalid={Boolean(contactForm.errors.topic)}
                  {...contactForm.getFieldProps('topic')}
                >
                  <option>Vehicle enquiry</option>
                  <option>Finance</option>
                  <option>Part exchange</option>
                  <option>General question</option>
                </select>
                {contactForm.errors.topic ? (
                  <span className={styles.fieldError}>{contactForm.errors.topic}</span>
                ) : null}
              </label>
              <label className={styles.fieldWide}>
                <span>Your message</span>
                <textarea
                  rows={4}
                  placeholder="Tell us how we can help."
                  aria-invalid={Boolean(contactForm.errors.message)}
                  {...contactForm.getFieldProps('message')}
                />
                {contactForm.errors.message ? (
                  <span className={styles.fieldError}>{contactForm.errors.message}</span>
                ) : null}
              </label>
              <div className={styles.formActions}>
                <button type="submit" className={styles.formButton} disabled={contactForm.status === 'submitting'}>
                  {contactForm.status === 'submitting' ? 'Sending...' : 'Send message'}
                </button>
                {contactForm.status === 'success' ? (
                  <span className={styles.formSuccess}>Thanks! We will be in touch shortly.</span>
                ) : null}
                {contactForm.status === 'error' || contactForm.status === 'rate-limited' ? (
                  <span className={styles.formError}>
                    {contactForm.errorMessage || 'Something went wrong. Please try again.'}
                  </span>
                ) : null}
              </div>
            </form>
            <div className={styles.mapCard}>
              <div className={styles.mapPlaceholder}>
                <iframe
                  title={`${brandName} location map`}
                  src={mapsEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className={styles.mapDetails}>
                <strong>{brandName}</strong>
                <span>{showroomAddress}</span>
                <span>Free customer parking available</span>
                <a href={mapsDirectionsUrl} target="_blank" rel="noreferrer">
                  Open directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default SpringallsContactPage
