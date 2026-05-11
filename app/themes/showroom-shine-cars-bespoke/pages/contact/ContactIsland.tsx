'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react'
import { useBrand } from '../../context/BrandClientWrapper'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { WhatsAppIcon } from '@/app/widgets/WhatsAppFab'
import styles from './page.module.css'

type ContactFormValues = {
  name: string
  email: string
  phone: string
  message: string
}

export default function ContactIsland() {
  const brand = useBrand()
  const phoneDisplay = (brand as any)?.location?.phone || '07537 164927'
  const phoneTel = phoneDisplay.replace(/[^\d+]/g, '')
  const email = (brand as any)?.location?.email || 'info@showroomshinecars.co.uk'
  const whatsappUrl = `https://wa.me/${phoneTel.replace(/^\+?/, '')}`

  const [submitted, setSubmitted] = useState(false)

  const lead = useLeadsForm<ContactFormValues>({
    initialValues: { name: '', email: '', phone: '', message: '' },
    leadType: 'contact',
    leadSource: 'contact-page',
    fieldConfig: {
      name: { required: true },
      email: { required: true },
      message: { required: true },
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await lead.submit()
    if (result.success) setSubmitted(true)
  }

  const nameProps = lead.getFieldProps('name')
  const emailProps = lead.getFieldProps('email')
  const phoneProps = lead.getFieldProps('phone')
  const messageProps = lead.getFieldProps('message')

  return (
    <article>
      <section className="shr-page-hero shr-page-hero--contact">
        <div className="shr-page-hero__inner">
          <span className="shr-page-hero__eyebrow" data-aos="fade-up">Contact</span>
          <h1 className="shr-page-hero__title" data-aos="fade-up" data-aos-delay="80">
            Need help? Talk to our team.
          </h1>
          <p className="shr-page-hero__lead" data-aos="fade-up" data-aos-delay="160">
            Stock, finance, valuations or sourcing — drop us a message or call and we&apos;ll
            come back to you the same working day.
          </p>
        </div>
      </section>

      <section className={`shr-section ${styles.contactBody}`}>
        <div className="shr-container">
          <div className={styles.layout}>
            <aside className={styles.details} data-aos="fade-right">
              <h2 className={styles.detailsTitle}>Showroom Shine Cars</h2>
              <ul className={styles.detailList}>
                <li>
                  <MapPin size={18} strokeWidth={2.2} aria-hidden />
                  <div>
                    <span className={styles.detailLabel}>Address</span>
                    <p>No 1 Oak Cottage, Coventry, CV5 9DA</p>
                    <p>West Midlands, United Kingdom</p>
                  </div>
                </li>
                <li>
                  <Phone size={18} strokeWidth={2.2} aria-hidden />
                  <div>
                    <span className={styles.detailLabel}>Call us</span>
                    <a href={`tel:${phoneTel}`}>{phoneDisplay}</a>
                  </div>
                </li>
                <li>
                  <Mail size={18} strokeWidth={2.2} aria-hidden />
                  <div>
                    <span className={styles.detailLabel}>Email</span>
                    <a href={`mailto:${email}`}>{email}</a>
                  </div>
                </li>
                <li>
                  <Clock size={18} strokeWidth={2.2} aria-hidden />
                  <div>
                    <span className={styles.detailLabel}>Opening hours</span>
                    <p>Mon–Sat 09:00–18:00</p>
                    <p>Sunday closed</p>
                    <p className={styles.detailNote}>Viewings by appointment only</p>
                  </div>
                </li>
                <li>
                  <WhatsAppIcon size={18} aria-hidden />
                  <div>
                    <span className={styles.detailLabel}>WhatsApp</span>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">Chat with us</a>
                  </div>
                </li>
              </ul>
            </aside>

            <form className={styles.form} onSubmit={handleSubmit} data-aos="fade-left" noValidate>
              {submitted ? (
                <div className={styles.success} role="status">
                  <CheckCircle2 size={48} strokeWidth={1.6} />
                  <h2>Message received.</h2>
                  <p>Thanks {String(lead.values.name).split(' ')[0]}, our team will reply within one working day.</p>
                </div>
              ) : (
                <>
                  <div className={styles.formHead}>
                    <span className="shr-eyebrow">Send a message</span>
                    <h2 className={styles.formTitle}>Drop us a line.</h2>
                  </div>
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      <span>Name *</span>
                      <input
                        type="text"
                        {...nameProps}
                        required
                        aria-required="true"
                        aria-invalid={Boolean(lead.errors.name)}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Email *</span>
                      <input
                        type="email"
                        {...emailProps}
                        required
                        aria-required="true"
                        aria-invalid={Boolean(lead.errors.email)}
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Phone</span>
                      <input type="tel" {...phoneProps} />
                    </label>
                    <label className={`${styles.field} ${styles.fieldFull}`}>
                      <span>Message *</span>
                      <textarea
                        rows={5}
                        {...messageProps}
                        required
                        aria-required="true"
                        aria-invalid={Boolean(lead.errors.message)}
                      />
                    </label>
                    <input type="text" {...lead.honeypotProps} aria-hidden tabIndex={-1} className={styles.honeypot} />
                  </div>
                  {lead.errorMessage ? (
                    <p className={styles.error} role="alert">{lead.errorMessage}</p>
                  ) : null}
                  <button
                    type="submit"
                    className={`shr-btn-primary ${styles.submit}`}
                    disabled={lead.status === 'submitting'}
                  >
                    <Send size={16} strokeWidth={2.4} />
                    {lead.status === 'submitting' ? 'Sending…' : 'Send message'}
                  </button>
                  <p className={styles.formFootnote}>
                    By submitting, you agree to be contacted by our team about your enquiry.
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      </section>
    </article>
  )
}
