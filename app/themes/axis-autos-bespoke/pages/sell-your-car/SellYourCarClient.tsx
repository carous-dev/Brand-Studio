'use client'

import { useState, FormEvent } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import styles from './page.module.css'

export default function SellYourCarClient() {
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
        condition: String(fd.get('condition') || ''),
        notes: String(fd.get('notes') || ''),
        leadType: 'sell-my-car',
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
      <section className="axis-page-hero axis-page-hero--sell-your-car">
        <div className="axis-page-hero-inner">
          <span className="axis-page-hero-eyebrow">Sell your car</span>
          <h1 className="axis-page-hero-title">Sell us your car. Same-day offer, no haggling.</h1>
          <p className="axis-page-hero-lead">
            Send us a few details about your car and we'll come back with a fair offer the same working day. No obligation
            to accept. If you do, we'll pay on collection and handle the DVLA paperwork.
          </p>
        </div>
      </section>

      <section className="axis-section">
        <div className="axis-shell">
          <div className={styles.grid}>
            <div className={styles.steps} data-aos="fade-up">
              <span className="axis-eyebrow">How it works</span>
              <h2 className={styles.h2}>Three simple steps to a sale.</h2>
              <ol className={styles.stepList}>
                <li>
                  <span className={styles.stepNum}>01</span>
                  <div>
                    <h3>Send us your car's details.</h3>
                    <p>Reg, mileage, condition, optional photos. Takes about two minutes.</p>
                  </div>
                </li>
                <li>
                  <span className={styles.stepNum}>02</span>
                  <div>
                    <h3>We come back same-day.</h3>
                    <p>Within one working day with a fair offer based on the wider market.</p>
                  </div>
                </li>
                <li>
                  <span className={styles.stepNum}>03</span>
                  <div>
                    <h3>Accept &mdash; we collect &amp; pay.</h3>
                    <p>Free collection across the UK mainland. Bank transfer on the day, V5C handled.</p>
                  </div>
                </li>
              </ol>

              <ul className={styles.tickList}>
                <li><CheckCircle2 size={18} strokeWidth={1.6} aria-hidden="true" /> Free vehicle collection</li>
                <li><CheckCircle2 size={18} strokeWidth={1.6} aria-hidden="true" /> Settled finance accepted</li>
                <li><CheckCircle2 size={18} strokeWidth={1.6} aria-hidden="true" /> Same-day bank transfer</li>
                <li><CheckCircle2 size={18} strokeWidth={1.6} aria-hidden="true" /> DVLA paperwork sorted for you</li>
              </ul>
            </div>

            <form className={styles.form} onSubmit={onSubmit} aria-label="Sell your car form" data-aos="fade-up" data-aos-delay="80">
              <h2 className={styles.h2}>Tell us about your car.</h2>
              <div className={styles.row}>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="syc-name">Your name</label>
                  <input className="axis-input" id="syc-name" name="name" required autoComplete="name" />
                </div>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="syc-email">Email</label>
                  <input className="axis-input" type="email" id="syc-email" name="email" required autoComplete="email" />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="syc-phone">Phone</label>
                  <input className="axis-input" type="tel" id="syc-phone" name="phone" required autoComplete="tel" />
                </div>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="syc-reg">Registration</label>
                  <input className="axis-input" id="syc-reg" name="reg" required style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="syc-mileage">Mileage</label>
                  <input className="axis-input" type="number" id="syc-mileage" name="mileage" min={0} />
                </div>
                <div className={styles.formField}>
                  <label className="axis-label" htmlFor="syc-condition">Condition</label>
                  <select className="axis-input" id="syc-condition" name="condition" defaultValue="">
                    <option value="" disabled>Select condition</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
              <div className={styles.formField}>
                <label className="axis-label" htmlFor="syc-notes">Anything we should know?</label>
                <textarea className="axis-input" id="syc-notes" name="notes" rows={4} placeholder="Service history, modifications, damage, outstanding finance…" />
              </div>
              <button type="submit" className="axis-btn axis-btn--primary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Get my offer'}
                <ArrowRight size={16} strokeWidth={1.8} />
              </button>
              {status === 'sent' ? <p className={styles.success} role="status">Thanks — your details are with us. We'll come back with a fair offer the same working day.</p> : null}
              {status === 'error' ? <p className={styles.error} role="alert">Sorry, that didn't send. Please try again or give us a call.</p> : null}
            </form>
          </div>
        </div>
      </section>
    </>
  )
}
