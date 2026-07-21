'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { ArrowRight, RefreshCcw, CheckCircle2 } from 'lucide-react'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import styles from './page.module.css'

export default function PartExchangeClient() {
  const brand = useBrand()
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    setStatus('sending')
    try {
      const payload = {
        name: String(fd.get('name') || ''),
        email: String(fd.get('email') || ''),
        phone: String(fd.get('phone') || ''),
        reg: String(fd.get('reg') || ''),
        mileage: String(fd.get('mileage') || ''),
        targetCar: String(fd.get('targetCar') || ''),
        notes: String(fd.get('notes') || ''),
        leadType: 'part-exchange',
        brandSlug: brand?.slug || '',
      }
      const res = await fetch(apiUrl('/leads'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <section className="axis-page-hero axis-page-hero--part-exchange">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">Part-exchange</span>
          <h1 className="axis-page-hero-title">Part-exchange your current car against your next one.</h1>
          <p className="axis-page-hero-lead">
            Fair, transparent valuations based on the wider used-car market — not a chain's lowball offer.
            Send us your details, hear back the same working day, drive home in your next car.
          </p>
        </div>
      </section>

      <section className="axis-section axis-section--card">
        <div className="axis-shell">
          <div className={styles.benefits} data-aos="fade-up">
            <span className={styles.iconBox} aria-hidden="true"><RefreshCcw size={22} strokeWidth={1.6} /></span>
            <h2 className={styles.h2}>Why part-exchange with us?</h2>
            <ul className={styles.benefitList}>
              <li><CheckCircle2 size={16} strokeWidth={1.8} aria-hidden="true" />Independent valuations against the wider used-car market</li>
              <li><CheckCircle2 size={16} strokeWidth={1.8} aria-hidden="true" />Settled finance on your existing car? No problem</li>
              <li><CheckCircle2 size={16} strokeWidth={1.8} aria-hidden="true" />One-trip handover — leave one car, drive away in the other</li>
              <li><CheckCircle2 size={16} strokeWidth={1.8} aria-hidden="true" />No obligation to buy once you have your figure</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="axis-section">
        <div className="axis-shell">
          <div className={styles.grid}>
            <form className={styles.form} onSubmit={onSubmit} aria-label="Part-exchange enquiry" data-aos="fade-up">
              <h2 className={styles.h2}>Tell us about your current car.</h2>
              <div className={styles.row}>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="px-name">Name</label>
                  <input className="axis-input" id="px-name" name="name" required autoComplete="name" />
                </div>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="px-email">Email</label>
                  <input className="axis-input" type="email" id="px-email" name="email" required autoComplete="email" />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="px-phone">Phone</label>
                  <input className="axis-input" type="tel" id="px-phone" name="phone" required autoComplete="tel" />
                </div>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="px-reg">Your car's reg</label>
                  <input className="axis-input" id="px-reg" name="reg" required style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="px-mileage">Mileage</label>
                  <input className="axis-input" type="number" id="px-mileage" name="mileage" min={0} />
                </div>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="px-target">Interested in (optional)</label>
                  <input className="axis-input" id="px-target" name="targetCar" placeholder="e.g. VW Golf GTI" />
                </div>
              </div>
              <div className={styles.formField}>
                <label className="axis-label" htmlFor="px-notes">Notes</label>
                <textarea className="axis-input" id="px-notes" name="notes" rows={4} placeholder="Service history, modifications, outstanding finance…" />
              </div>
              <button type="submit" className="axis-btn axis-btn--primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Get my valuation'}
                <ArrowRight size={16} strokeWidth={1.8} />
              </button>
              {status === 'sent' ? <p className={styles.success} role="status">Thanks — your details are with us. We'll come back today with a fair offer.</p> : null}
              {status === 'error' ? <p className={styles.error} role="alert">Sorry, that didn't send. Please try again or give us a call.</p> : null}
            </form>

            <aside className={styles.side} data-aos="fade-up" data-aos-delay="80">
              <h3>Looking at a specific car?</h3>
              <p>Browse our current stock and we'll set the part-exchange figure against your chosen vehicle.</p>
              <Link href="/used-cars" className="axis-btn axis-btn--ghost">
                Browse stock
                <ArrowRight size={16} strokeWidth={1.8} />
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
