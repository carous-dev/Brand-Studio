'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import styles from './page.module.css'

type Values = {
  name: string
  email: string
  phone: string
  message: string
}

export default function ContactIsland() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const address = contact.showroomAddress || 'Contact the showroom for location details'
  const form = useLeadsForm<Values>({
    initialValues: { name: '', email: '', phone: '', message: '' },
    leadType: 'contact',
    leadSource: 'contact-page',
    honeypotField: 'website',
    fieldConfig: {
      name: { required: true },
      email: { required: true, validate: (v) => (/\S+@\S+\.\S+/.test(String(v || '')) ? null : 'Enter a valid email') },
      message: { required: true },
    },
  })

  return (
    <section className={`auto-section ${styles.section}`}>
      <div className={`auto-container ${styles.grid}`}>
        <div className={styles.detailsCard}>
          <p className="auto-eyebrow">Contact details</p>
          <h2 className={styles.detailsTitle}>Drop in or get in touch.</h2>

          <ul className={styles.contactList}>
            <li>
              <span className={styles.icon}><MapPin size={16} aria-hidden="true" /></span>
              <div>
                <p className={styles.label}>Showroom</p>
                <p className={styles.value}>{address}</p>
              </div>
            </li>
            {contact.phoneTel && (
              <li>
                <span className={styles.icon}><Phone size={16} aria-hidden="true" /></span>
                <div>
                  <p className={styles.label}>Call</p>
                  <a href={`tel:${contact.phoneTel}`} className={styles.value}>{contact.phoneDisplay}</a>
                </div>
              </li>
            )}
            {contact.email && (
              <li>
                <span className={styles.icon}><Mail size={16} aria-hidden="true" /></span>
                <div>
                  <p className={styles.label}>Email</p>
                  <a href={`mailto:${contact.email}`} className={styles.value}>{contact.email}</a>
                </div>
              </li>
            )}
            <li>
              <span className={styles.icon}><Clock size={16} aria-hidden="true" /></span>
              <div>
                <p className={styles.label}>Hours</p>
                <p className={styles.value}>Contact us for today&rsquo;s opening hours and appointment availability.</p>
              </div>
            </li>
          </ul>

          {contact.whatsappUrl && (
            <a
              href={contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`auto-btn auto-btn--ghost ${styles.whatsappBtn}`}
            >
              <WhatsAppIcon size={16} />
              Chat on WhatsApp
            </a>
          )}
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => { e.preventDefault(); void form.submit() }}
          aria-label="Contact form"
        >
          <p className="auto-eyebrow">Send a message</p>
          <h2 className={styles.formTitle}>Tell us how we can help.</h2>

          <input
            type="text"
            tabIndex={-1}
            aria-hidden="true"
            className={styles.honeypot}
            {...form.honeypotProps}
          />

          <label className={styles.field}>
            <span>Full name</span>
            <input
              type="text"
              placeholder="Your name"
              aria-required="true"
              aria-invalid={Boolean(form.errors.name)}
              {...form.getFieldProps('name')}
            />
            {form.errors.name && <span className={styles.fieldError}>{form.errors.name}</span>}
          </label>

          <div className={styles.fieldRow}>
            <label className={styles.field}>
              <span>Email address</span>
              <input
                type="email"
                placeholder="you@email.com"
                aria-required="true"
                aria-invalid={Boolean(form.errors.email)}
                {...form.getFieldProps('email')}
              />
              {form.errors.email && <span className={styles.fieldError}>{form.errors.email}</span>}
            </label>

            <label className={styles.field}>
              <span>Phone</span>
              <input
                type="tel"
                placeholder="07__ ___ ____"
                {...form.getFieldProps('phone')}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>Message</span>
            <textarea
              rows={5}
              placeholder="What car are you looking for? Any specific needs?"
              aria-required="true"
              aria-invalid={Boolean(form.errors.message)}
              {...form.getFieldProps('message')}
            />
            {form.errors.message && <span className={styles.fieldError}>{form.errors.message}</span>}
          </label>

          <div className={styles.formFoot}>
            <button
              type="submit"
              className={`auto-btn auto-btn--primary ${styles.submit}`}
              disabled={form.status === 'submitting'}
            >
              {form.status === 'submitting' ? 'Sending…' : (
                <>
                  Send message
                  <Send size={16} aria-hidden="true" />
                </>
              )}
            </button>
            {form.status === 'success' && (
              <p className={styles.formSuccess}>Thanks! We&rsquo;ll be in touch shortly.</p>
            )}
            {(form.status === 'error' || form.status === 'rate-limited') && (
              <p className={styles.formError}>
                {form.errorMessage || 'Something went wrong. Please try again.'}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
