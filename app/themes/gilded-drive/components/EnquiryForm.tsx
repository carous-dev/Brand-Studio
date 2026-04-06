"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import '../styles/enquiry.css'
import { useBrand } from '../context/BrandClientWrapper'

type Props = {
  open: boolean
  onClose: () => void
  initialReg?: string
  vehicle?: any
  showSnackbar: (msg: string, success?: boolean) => void
}

export default function EnquiryForm({ open, onClose, initialReg = '', vehicle, showSnackbar }: Props) {
  const brand = useBrand()
  const brandName = brand?.name || 'our dealership'
  const [stock, setStock] = useState(initialReg || '')
  const [permalink, setPermalink] = useState('')
  const firstInputRef = useRef<HTMLInputElement | null>(null)
  const leadSource = 'dealer-enquiry'
  const leadsEndpoint = process.env.NEXT_PUBLIC_LEADS_API_URL || ''
  const useExternalLeadApi = Boolean(leadsEndpoint && !leadsEndpoint.startsWith('/api/'))

  const {
    values,
    setValues,
    setFieldValue,
    status,
    errorMessage,
    getFieldProps,
    honeypotProps,
    submit
  } = useLeadsForm({
    initialValues: { name: '', email: '', phone: '', message: '', terms: false },
    leadType: 'dealer-enquiry',
    leadSource,
    honeypotField: 'honeypot',
    endpoint: leadsEndpoint || '/api/enquiry',
    fieldConfig: {
      name: { required: true, validate: (value) => (String(value || '').trim().length >= 2 ? null : 'Enter your full name.') },
      email: {
        required: true,
        validate: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? null : 'Enter a valid email address.')
      },
      message: {
        required: true,
        validate: (value) => (String(value || '').trim().length >= 10 ? null : 'Please provide a longer message.')
      },
      terms: { required: true }
    },
    buildPayload: (formValues, meta) => {
      const vehicleDetails = vehicle ? {
        registration: vehicle.reg || stock,
        make: vehicle.make,
        model: vehicle.model,
        mileage: vehicle.mileage,
        condition: vehicle.condition
      } : undefined

      if (useExternalLeadApi) {
        return {
          leadType: 'dealer-enquiry',
          leadSource,
          name: formValues.name,
          email: formValues.email,
          phone: formValues.phone,
          stock,
          message: formValues.message,
          permalink,
          vehicleDetails,
          formTs: meta.formTs,
          recaptchaToken: meta.recaptchaToken,
          [meta.honeypotField]: meta.honeypotValue
        }
      }

      return {
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        stock,
        message: formValues.message,
        permalink,
        vehicleDetails,
        honeypot: meta.honeypotValue
      }
    }
  })

  // Load persisted form data when modal opens
  useEffect(() => {
    if (open) {
      try {
        const saved = localStorage.getItem('enquiryFormData')
        if (saved) {
          const data = JSON.parse(saved)
          setValues((prev) => ({
            ...prev,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            message: data.message || '',
            terms: data.terms || false
          }))
        }
        // Capture current page URL as permalink
        setPermalink(window.location.href)
      } catch (err) {
        console.warn('Failed to load saved form data:', err)
      }
    }
  }, [open])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    try {
      const data = { name: values.name, email: values.email, phone: values.phone, message: values.message, terms: values.terms }
      localStorage.setItem('enquiryFormData', JSON.stringify(data))
    } catch (err) {
      console.warn('Failed to save form data:', err)
    }
  }, [values.name, values.email, values.phone, values.message, values.terms])

  useEffect(() => {
    if (open) {
      // focus first input when opened
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [open])

  // Build a simple, editable message template. Includes stock/reg when available.
  const dealerName = brandName

  function buildMessageTemplate(reg?: string) {
    const greeting = `Hi ${dealerName}`
    if (reg && reg.trim()) {
      return `${greeting} — I'm interested in the vehicle (${reg}). Please can you confirm availability, current mileage, service history and any outstanding finance? Also include a price and viewing availability.`
    }
    return `${greeting} — Tell us about your enquiry...`
  }

  // When the modal opens, prefill the message with a templated message if it's empty.
  // Set initial message when form opens, but don't override if user has typed something
  useEffect(() => {
    if (open && (!values.message || values.message.trim().length === 0 || values.message === buildMessageTemplate(''))) {
      setFieldValue('message', buildMessageTemplate(initialReg))
    }
  }, [open, initialReg, setFieldValue, values.message])

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

  const canSubmit = values.name.trim().length > 1 && validateEmail(values.email) && values.message.trim().length > 5 && values.terms && status !== 'submitting'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    try {
      const result = await submit()
      if (result.success) {
        onClose()
        showSnackbar('Enquiry submitted — we will contact you shortly.', true)
        try {
          localStorage.removeItem('enquiryFormData')
        } catch (err) {
          console.warn('Failed to clear saved form data:', err)
        }
      } else {
        showSnackbar(result.error || errorMessage || 'Failed to submit enquiry — please try again.', false)
      }
    } catch (err) {
      // Show error snackbar for network errors
      showSnackbar('Network error — please try again later.', false)
    }
  }

  if (!open) return null

  return (
    <div className="enquiry-overlay" role="dialog" aria-modal="true" aria-label="Dealer enquiry form" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="enquiry-modal" role="document">
        <button className="enquiry-close" aria-label="Close enquiry form" onClick={onClose}>&times;</button>
        <h2 className="enquiry-title">Dealer enquiry</h2>
        <p className="enquiry-sub">Fill out the form below to get in touch with our dealership.</p>

          <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
            <label>
              <span className="label">Contact full name <span className="req">*</span></span>
              <input ref={firstInputRef} type="text" {...getFieldProps('name')} required />
            </label>

            <label>
              <span className="label">Business email <span className="req">*</span></span>
              <input type="email" {...getFieldProps('email')} required />
            </label>

            <label>
              <span className="label">Work phone (optional)</span>
              <input type="tel" {...getFieldProps('phone')} />
            </label>

            {/* keep vehicle details as hidden fields so they're submitted but not shown to users */}
            <input type="hidden" name="stock" value={stock} />
            <input type="hidden" name="registration" value={vehicle?.reg || vehicle?.registration || ''} />
            <input type="hidden" name="make" value={vehicle?.make || ''} />
            <input type="hidden" name="model" value={vehicle?.model || ''} />
            <input type="hidden" name="year" value={vehicle?.year || ''} />
            <input type="hidden" name="price" value={vehicle?.price || ''} />
            <input type="hidden" name="mileage" value={vehicle?.mileage || ''} />
            <input type="hidden" name="transmission" value={vehicle?.trans || ''} />
            <input type="hidden" name="fuel_type" value={vehicle?.fuel || ''} />
            <input type="hidden" name="engine_size" value={vehicle?.engineCapacity || ''} />
            <input type="text" placeholder="Leave this field empty" {...honeypotProps} />

            <label>
              <span className="label">Message <span className="req">*</span></span>
              <textarea {...getFieldProps('message')} required />
            </label>

            <label className="enquiry-terms">
              <input
                type="checkbox"
                checked={Boolean(values.terms)}
                onChange={(e) => setFieldValue('terms', e.target.checked)}
              />
              <span>I accept the <a href="/terms" target="_blank" rel="noopener noreferrer">dealer terms &amp; conditions</a> <span className="req">*</span></span>
            </label>

            <div className="enquiry-actions">
              <button type="submit" className="btn-submit" disabled={!canSubmit} aria-disabled={!canSubmit}>{status === 'submitting' ? 'Submitting…' : 'Submit Enquiry'}</button>
            </div>

            <div className="enquiry-footer">Press ESC to close.</div>

            {/* {statusMsg ? <div className="enquiry-status" role="status">{statusMsg}</div> : null} */}
          </form>
        </div>
      </div>
  )
}
