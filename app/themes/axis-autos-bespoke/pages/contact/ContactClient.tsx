'use client'

import { useState, FormEvent } from 'react'
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { useBrand } from '../../context/BrandClientWrapper'
import { getBrandContactInfo } from '../../lib/contact'
import { apiUrl } from '../../lib/api'
import styles from './page.module.css'

export default function ContactClient() {
  const brand = useBrand()
  const contact = getBrandContactInfo(brand)
  const address = (brand as any)?.location?.address || {}
  const hours = (brand as any)?.openingHours || []
  const addressLine = [address.street, address.city, address.county, address.postcode].filter(Boolean).join(', ')
  const mapsQuery = encodeURIComponent(addressLine || address.postcode || '')

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setStatus('sending')
    setErrorMsg('')
    try {
      const payload = {
        name: String(fd.get('name') || ''),
        email: String(fd.get('email') || ''),
        phone: String(fd.get('phone') || ''),
        subject: String(fd.get('subject') || ''),
        message: String(fd.get('message') || ''),
        brandSlug: brand?.slug || '',
      }
      const res = await fetch(apiUrl('/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('sent')
      form.reset()
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <>
      <section className="axis-page-hero">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">Contact</span>
          <h1 className="axis-page-hero-title">Get in touch.</h1>
          <p className="axis-page-hero-lead">
            Send us a message, call the showroom, or pop in. We aim to reply within one working hour.
          </p>
        </div>
      </section>

      <section className="axis-section">
        <div className="axis-shell">
          <div className={styles.grid}>
            <form className={styles.form} onSubmit={onSubmit} aria-label="Contact form" data-aos="fade-up">
              <div className={styles.row}>
                <div>
                  <label className="axis-label" htmlFor="name">Name</label>
                  <input className="axis-input" id="name" name="name" required autoComplete="name" />
                </div>
                <div>
                  <label className="axis-label" htmlFor="email">Email</label>
                  <input className="axis-input" type="email" id="email" name="email" required autoComplete="email" />
                </div>
              </div>
              <div className={styles.row}>
                <div>
                  <label className="axis-label" htmlFor="phone">Phone</label>
                  <input className="axis-input" type="tel" id="phone" name="phone" autoComplete="tel" />
                </div>
                <div>
                  <label className="axis-label" htmlFor="subject">Subject</label>
                  <input className="axis-input" id="subject" name="subject" />
                </div>
              </div>
              <div>
                <label className="axis-label" htmlFor="message">Message</label>
                <textarea className="axis-input" id="message" name="message" rows={6} required />
              </div>
              <button type="submit" className="axis-btn axis-btn--primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send message'}
                <ArrowRight size={16} strokeWidth={1.8} />
              </button>
              {status === 'sent' ? (
                <p className={styles.success} role="status">Thanks — your message is on its way. We'll be in touch within one working hour.</p>
              ) : null}
              {status === 'error' ? (
                <p className={styles.error} role="alert">Sorry, we couldn't send that. {errorMsg ? `(${errorMsg})` : ''} Please try again or call us directly.</p>
              ) : null}
            </form>

            <aside className={styles.side} data-aos="fade-up" data-aos-delay="80">
              <h2 className={styles.sideTitle}>Showroom</h2>
              <address className={styles.addr}>
                {addressLine ? (
                  <a href={mapsQuery ? `https://www.google.com/maps?q=${mapsQuery}` : '#'} target="_blank" rel="noopener noreferrer">
                    <MapPin size={16} strokeWidth={1.6} aria-hidden="true" />
                    <span>{addressLine}</span>
                  </a>
                ) : null}
                {contact.phoneTel ? (
                  <a href={`tel:${contact.phoneTel}`}>
                    <Phone size={16} strokeWidth={1.6} aria-hidden="true" />
                    <span>{contact.phoneDisplay}</span>
                  </a>
                ) : null}
                {contact.email ? (
                  <a href={`mailto:${contact.email}`}>
                    <Mail size={16} strokeWidth={1.6} aria-hidden="true" />
                    <span>{contact.email}</span>
                  </a>
                ) : null}
              </address>

              {hours.length > 0 ? (
                <>
                  <h2 className={styles.sideTitle}>Opening hours</h2>
                  <dl className={styles.hours}>
                    {hours.slice(0, 7).map((h: any, i: number) => (
                      <div key={i}>
                        <dt>{h?.day || '—'}</dt>
                        <dd>{h?.closed ? 'Closed' : `${h?.open || '—'}–${h?.close || '—'}`}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : null}
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
