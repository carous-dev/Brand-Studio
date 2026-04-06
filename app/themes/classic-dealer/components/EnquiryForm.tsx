"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useBrand } from '../context/BrandClientWrapper'
import '../styles/enquiry.css'

type Props = {
  open: boolean
  onClose: () => void
  initialReg?: string
}

export default function EnquiryForm({ open, onClose, initialReg = '' }: Props) {
  const brand = useBrand()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [stock, setStock] = useState(initialReg || '')
  const [message, setMessage] = useState('')
  const [terms, setTerms] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 50)
      setStatusMsg(null)
    }
  }, [open])

  const dealerName = brand?.name || process.env.NEXT_PUBLIC_COMPANY_NAME || 'our dealership'

  function buildMessageTemplate(reg?: string) {
    const greeting = `Hi ${dealerName},`
    if (reg && reg.trim()) {
      return `${greeting}\n\nI'm interested in the vehicle (${reg}). Please confirm availability, current mileage, service history, and any outstanding finance. Could you also share the best price and viewing availability?\n\nThanks,`
    }
    return `${greeting}\n\nI'm interested in one of your vehicles. Please share availability, pricing, and viewing options.\n\nThanks,`
  }

  useEffect(() => {
    if (open && (!message || message.trim().length === 0)) {
      setMessage(buildMessageTemplate(initialReg))
    }
  }, [open, initialReg])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function validateEmail(e?: string) {
    if (!e) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  }

  const canSubmit = name.trim().length > 1 && validateEmail(email) && message.trim().length > 5 && terms && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setStatusMsg(null)
    try {
      const leadData = {
        leadType: 'dealer-enquiry',
        name,
        email,
        phone,
        message,
        vehicleDetails: {
          registration: stock || undefined,
        },
      }
      const payload = { leadData }
      const res = await fetch('/api/send-lead-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        setStatusMsg(text || 'Failed to submit enquiry - please try again.')
      } else {
        setStatusMsg('Enquiry submitted - we will contact you shortly.')
        setName('')
        setEmail('')
        setPhone('')
        setMessage(buildMessageTemplate(initialReg))
        setTerms(false)
      }
    } catch (err) {
      setStatusMsg('Network error - please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="enquiry-overlay" role="dialog" aria-modal="true" aria-label="Dealer enquiry form" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="enquiry-modal" role="document">
        <button className="enquiry-close" aria-label="Close enquiry form" onClick={onClose}>&times;</button>
        <div className="enquiry-header">
          <div className="enquiry-eyebrow">Vehicle Enquiry</div>
          <h2 className="enquiry-title">Let's get you booked in</h2>
          <p className="enquiry-sub">Share a few details and we'll confirm availability and viewing options.</p>
        </div>

        <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
          <div className="enquiry-grid">
            <label className="enquiry-vehicle">
              <span className="label">Vehicle</span>
              <input type="text" value={stock} readOnly aria-readonly="true" />
            </label>

            <label>
              <span className="label">Contact full name <span className="req">*</span></span>
              <input ref={firstInputRef} type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>

            <label>
              <span className="label">Business email <span className="req">*</span></span>
              <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <label>
              <span className="label">Work phone (optional)</span>
              <input type="tel" placeholder="Phone number (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          </div>

          <input type="hidden" name="stock" value={stock} />

          <label className="enquiry-full">
            <span className="label">Message <span className="req">*</span></span>
            <textarea placeholder="Add any extra details or questions..." value={message} onChange={(e) => setMessage(e.target.value)} required />
          </label>

          <label className="enquiry-terms enquiry-full">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span>I accept the <a href="/terms" target="_blank" rel="noopener noreferrer">dealer terms &amp; conditions</a> <span className="req">*</span></span>
          </label>

          <div className="enquiry-actions">
            <button type="submit" className="btn-submit" disabled={!canSubmit} aria-disabled={!canSubmit}>{submitting ? 'Submitting...' : 'Submit Enquiry'}</button>
          </div>

          <div className="enquiry-footer">Press ESC to close.</div>

          {statusMsg ? <div className="enquiry-status" role="status">{statusMsg}</div> : null}
        </form>
      </div>
    </div>
  )
}
