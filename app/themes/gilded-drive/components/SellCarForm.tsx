"use client"

import React, { useCallback, useEffect, useState } from 'react'
import "../styles/sell-your-car-modern.css";
import "../styles/modern-valuation-modal.css";
import { motion, Variants, useReducedMotion } from 'framer-motion'
import { Search, TrendingUp, Clock, Shield, ArrowRight, CheckCircle, Car, DollarSign, Award } from 'lucide-react'
import ModernValuationModal from './ModernValuationModal'
import { useLeadsForm } from '@/app/hooks/useLeadsForm'
import { useBrand } from '../context/BrandClientWrapper'

type VehicleData = Record<string, any>
type LookupResult = { vehicle?: VehicleData; valuations?: Record<string, any> }

const copyVariants: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.995 },
  visible: (reduce: boolean) => ({ opacity: 1, y: 0, scale: 1, transition: { duration: reduce ? 0.18 : 0.55, ease: 'anticipate' } })
}

interface SellCarFormProps {
  showHeroContent?: boolean;
  className?: string;
}

export const SellCarForm: React.FC<SellCarFormProps> = ({
  showHeroContent = true,
  className = ""
}) => {
  const brand = useBrand()
  const city = String(brand?.location?.address?.city || brand?.location?.city || 'your area')
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [vehicle, setVehicle] = useState<VehicleData | null>(null)
  const [valuations, setValuations] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ msg: string; success: boolean; visible: boolean }>({ msg: '', success: true, visible: false })
  const [registration, setRegistration] = useState<string>('')
  const [mileage, setMileage] = useState<string>('')
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number>(0)
  const [rateLimitResetTime, setRateLimitResetTime] = useState<number>(0)

  const companyName = process.env.NEXT_PUBLIC_COMPANY_NAME || 'our dealership'
  const leadSource = 'sell-your-car'
  const leadsEndpoint = process.env.NEXT_PUBLIC_LEADS_API_URL || ''
  const useExternalLeadApi = Boolean(leadsEndpoint && !leadsEndpoint.startsWith('/api/'))

  const sellLeadForm = useLeadsForm({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      condition: 'good',
      notes: '',
      registration: '',
      mileage: ''
    },
    leadType: 'sell-your-car',
    leadSource,
    honeypotField: 'honeypot',
    endpoint: leadsEndpoint || '/api/sell-vehicle',
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? null : 'Enter a valid email.')
      },
      phone: { required: true },
      condition: { required: true }
    },
    buildPayload: (formValues, meta) => {
      const permalink = typeof window !== 'undefined' ? window.location.href : ''
      if (useExternalLeadApi) {
        return {
          leadType: 'sell-your-car',
          leadSource,
          ...formValues,
          vehicle,
          permalink,
          formTs: meta.formTs,
          recaptchaToken: meta.recaptchaToken,
          [meta.honeypotField]: meta.honeypotValue
        }
      }
      return {
        name: formValues.name,
        email: formValues.email,
        phone: formValues.phone,
        condition: formValues.condition,
        notes: formValues.notes,
        registration: formValues.registration,
        mileage: formValues.mileage,
        vehicle,
        permalink
      }
    }
  })

  const showSnackbar = useCallback((msg: string, success = true) => {
    setSnackbar({ msg, success, visible: true })
    window.setTimeout(() => setSnackbar(s => ({ ...s, visible: false })), 4000)
  }, [])

  // Rate limiting helpers
  const getRateLimitData = useCallback(() => {
    try {
      const data = localStorage.getItem('valuation_rate_limit')
      return data ? JSON.parse(data) : { attempts: [], lastReset: Date.now() }
    } catch (e) {
      return { attempts: [], lastReset: Date.now() }
    }
  }, [])

  const setRateLimitData = useCallback((data: any) => {
    try {
      localStorage.setItem('valuation_rate_limit', JSON.stringify(data))
    } catch (e) { /* ignore */ }
  }, [])

  const checkRateLimit = useCallback(() => {
    const data = getRateLimitData()
    const now = Date.now()
    const windowMs = 60000 // 1 minute window
    const maxAttempts = 5 // Maximum 5 attempts per minute

    // Reset window if more than 1 minute has passed
    if (now - data.lastReset > windowMs) {
      setRateLimitData({ attempts: [], lastReset: now })
      setRateLimitRemaining(maxAttempts)
      setRateLimitResetTime(0)
      return { allowed: true, remaining: maxAttempts, resetTime: 0 }
    }

    // Filter attempts within the current window
    const recentAttempts = data.attempts.filter((timestamp: number) => now - timestamp < windowMs)
    const remaining = Math.max(0, maxAttempts - recentAttempts.length)

    // Update rate limit state
    setRateLimitRemaining(remaining)
    setRateLimitResetTime(data.lastReset + windowMs)

    if (remaining === 0) {
      const resetTime = data.lastReset + windowMs
      return { allowed: false, remaining: 0, resetTime }
    }

    return { allowed: true, remaining, resetTime: 0 }
  }, [getRateLimitData, setRateLimitData])

  const recordAttempt = useCallback(() => {
    const data = getRateLimitData()
    const now = Date.now()
    const windowMs = 60000

    // Add current attempt
    const attempts = [...data.attempts.filter((timestamp: number) => now - timestamp < windowMs), now]
    
    setRateLimitData({ 
      attempts, 
      lastReset: data.lastReset > now - windowMs ? data.lastReset : now 
    })

    // Update remaining count
    const maxAttempts = 5
    const remaining = Math.max(0, maxAttempts - attempts.length)
    setRateLimitRemaining(remaining)
  }, [getRateLimitData, setRateLimitData])

  // Initialize rate limit on mount
  useEffect(() => {
    checkRateLimit()
  }, [checkRateLimit])

  // Countdown timer for rate limit reset
  useEffect(() => {
    if (rateLimitResetTime > 0 && rateLimitRemaining === 0) {
      const interval = setInterval(() => {
        const now = Date.now()
        if (now >= rateLimitResetTime) {
          checkRateLimit()
          clearInterval(interval)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [rateLimitResetTime, rateLimitRemaining, checkRateLimit])

  // helpers: session storage cache
  const getStored = useCallback(() => {
    try { return JSON.parse(sessionStorage.getItem('carous_lookups') || '[]') as LookupResult[] } catch (e) { return [] }
  }, [])
  const store = useCallback((obj: LookupResult) => {
    try { const arr = getStored(); arr.push(obj); sessionStorage.setItem('carous_lookups', JSON.stringify(arr)); } catch (e) { /* ignore */ }
  }, [getStored])
  const hasRegistration = useCallback((reg?: string) => {
    if (!reg) return false
    try { return getStored().some(it => (it.vehicle && it.vehicle.registration && it.vehicle.registration.toUpperCase()) === reg.toUpperCase()) } catch (e) { return false }
  }, [getStored])

  const lookup = useCallback(async (reg: string, mileage: string) => {
    const url = 'https://api.carous.co.uk/v1/lookup'
    const payload = { reg: reg.toUpperCase(), mileage: Number(mileage) }
    const resp = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!resp.ok) { const t = await resp.text(); throw new Error(resp.status + ' ' + (t || resp.statusText)) }
    return resp.json() as Promise<LookupResult>
  }, [])

  const openVehiclePanel = useCallback((data: LookupResult, reg?: string, mil?: string) => {
    const v = data.vehicle || {}
    setVehicle(v)
    setValuations(data.valuations || null)
    if (reg) setRegistration(reg)
    if (mil) setMileage(mil)
    setVisible(true)
  }, [])

  const closeVehiclePanel = useCallback(() => {
    setVisible(false)
  }, [])

  // Attach global handlers for the form and wire to lookup/open
  useEffect(() => {
    const form = document.getElementById('sellForm') as HTMLFormElement | null

    async function handleSubmit(e: Event) {
      e.preventDefault()
      const regInput = document.getElementById('registration') as HTMLInputElement | null
      const mileageInput = document.getElementById('mileage') as HTMLInputElement | null
      const reg = (regInput?.value || '').trim().toUpperCase()
      const mileage = (mileageInput?.value || '').trim()
      if (!reg || !mileage) { 
        showSnackbar('Please enter registration and mileage', false)
        return 
      }

      // Check rate limit
      const rateLimit = checkRateLimit()
      if (!rateLimit.allowed) {
        const resetTime = Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        const minutes = Math.floor(resetTime / 60)
        const seconds = resetTime % 60
        const timeString = minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : `${seconds} second${seconds > 1 ? 's' : ''}`
        showSnackbar(`Rate limit exceeded. Please try again in ${timeString}.`, false)
        return
      }

      // Record this attempt
      recordAttempt()

      // check cached
      if (hasRegistration(reg)) {
        try {
          const arr = getStored() || []
          const rec = arr.slice().reverse().find(it => it.vehicle && it.vehicle.registration && it.vehicle.registration.toUpperCase() === reg)
          if (rec) {
            const hasVehicleData = rec.vehicle && Object.keys(rec.vehicle).length > 1
            const hasValuationData = rec.valuations && (rec.valuations.retail && (rec.valuations.retail.amountGBP || rec.valuations.retail.amount))
            
            if (hasVehicleData && hasValuationData) {
              openVehiclePanel(rec, reg, mileage)
              return
            }
            // fetch fresh if cached but missing data or valuation
            try {
              setLoading(true)
              const fresh = await lookup(reg, mileage); 
              store(fresh); 
              
              // Check if valuation data exists in fresh response
              const freshHasValuation = fresh.valuations && (fresh.valuations.retail && (fresh.valuations.retail.amountGBP || fresh.valuations.retail.amount))
              if (freshHasValuation) {
                openVehiclePanel(fresh, reg, mileage); 
              } else {
                showSnackbar('Valuation not found for this vehicle. Please check the registration number and try again.', false)
              }
              return
            } catch (err) { 
              console.warn('Failed to fetch missing vehicle details for cached reg', err); 
              setLoading(false)
              showSnackbar('Failed to fetch vehicle details. Please try again.', false)
              return
            }
          }
        } catch (e) { console.warn('Error reading cached valuation', e) }
      }

      const submitBtn = form?.querySelector('button[type="submit"]') as HTMLButtonElement | null
      if (submitBtn) { submitBtn.disabled = true; submitBtn.setAttribute('aria-busy', 'true') }
      
      setLoading(true)
      try {
        const data = await lookup(reg, mileage)
        store(data)
        
        // Check if valuation data exists
        const hasValuation = data.valuations && (data.valuations.retail && (data.valuations.retail.amountGBP || data.valuations.retail.amount))
        
        if (hasValuation) {
          openVehiclePanel(data, reg, mileage)
        } else {
          showSnackbar('Valuation not found for this vehicle. Please check the registration number and try again.', false)
        }
      } catch (err: any) { 
        console.error(err)
        showSnackbar('Failed to fetch valuation. Please try again.', false)
      }
      finally { 
        if (submitBtn) { submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy') }
        setLoading(false)
      }
    }

    if (form) form.addEventListener('submit', handleSubmit)

    return () => { if (form) form.removeEventListener('submit', handleSubmit) }
  }, [getStored, hasRegistration, lookup, openVehiclePanel, showSnackbar, store, checkRateLimit, recordAttempt])

  // panel internal submit handled via React to ensure listeners attach when panel mounts
  const handlePanelSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formEl = e.currentTarget
    const submitBtn = formEl.querySelector<HTMLButtonElement>('button[type="submit"]')
    
    if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add('loading'); submitBtn.setAttribute('aria-busy', 'true') }
    
    const formData = new FormData(formEl)
    const values = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      phone: String(formData.get('phone') || ''),
      condition: String(formData.get('condition') || 'good'),
      notes: String(formData.get('notes') || ''),
      registration: String(formData.get('registration') || registration),
      mileage: String(formData.get('mileage') || mileage)
    }

    const result = await sellLeadForm.submitValues(values)
    if (!result.success) {
      showSnackbar(result.error || 'Failed to submit — please try again.', false)
    } else {
      showSnackbar('Thanks — we have received your details. A tailored offer is on the way.', true)
    }
    
    setTimeout(() => {
      if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.removeAttribute('aria-busy'); submitBtn.disabled = false }
      closeVehiclePanel()
    }, 900)
  }, [closeVehiclePanel, registration, mileage, sellLeadForm, showSnackbar])

  // expose a global helper for other scripts if needed (optional)
  useEffect(() => {
    // @ts-ignore
    window.__openCarousVehiclePanel = (data: LookupResult) => openVehiclePanel(data)
    return () => { try { // @ts-ignore
      delete window.__openCarousVehiclePanel } catch (e) { } }
  }, [openVehiclePanel])

  return (
    <section className={`sell-hero ${className}`}>
      <div className="container sell-hero-inner">
        {showHeroContent && (
          <motion.div className="sell-hero-copy" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={copyVariants}>
            <div className="hero-badge">
              <Shield className="badge-icon" />
              <span>Trusted by {city} Car Sellers</span>
            </div>
            <h1 className="hero-title">Sell Your Car the Modern Way</h1>
            <p className="hero-lead">Get an instant, fair valuation and sell your car on your terms. No hassle, no hidden fees, just a smooth experience from start to finish.</p>
            
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">£2.5K+</div>
                <div className="stat-label">Average Valuation</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24hrs</div>
                <div className="stat-label">Quick Payment</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Customer Satisfaction</div>
              </div>
            </div>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => document.getElementById('registration')?.focus()}>
                <Search className="btn-icon" />
                Get Instant Valuation
                <ArrowRight className="btn-icon-right" />
              </button>
              <a className="btn btn-secondary" href="/contact/">
                <Award className="btn-icon" />
                Talk to Expert
              </a>
            </div>
            
            <div className="trust-indicators">
              <div className="trust-item">
                <CheckCircle className="trust-icon" />
                <span>Instant Free Valuation</span>
              </div>
              <div className="trust-item">
                <Car className="trust-icon" />
                <span>Free Collection</span>
              </div>
              <div className="trust-item">
                <DollarSign className="trust-icon" />
                <span>Best Price Guarantee</span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.aside className="sell-hero-panel" aria-labelledby="sell-form-title" initial="hidden" animate="visible" variants={panelVariants} custom={reduce} transition={{ delay: 0.12 }}>
          {loading && (
            <div className="valuation-loader">
              <div className="loader-spinner"></div>
              <div className="loader-text">Fetching valuation...</div>
            </div>
          )}
          {rateLimitRemaining < 5 && rateLimitRemaining > 0 && (
            <div className="rate-limit-indicator">
              <span className="rate-limit-text">{rateLimitRemaining} attempts remaining</span>
            </div>
          )}
          <div className="panel-top">
            <div className="panel-badge">
              <TrendingUp className="badge-icon" />
              <span>Instant Valuation</span>
            </div>
            <h2 id="sell-form-title">Get Your Free Car Valuation</h2>
            <p className="panel-lead">Enter your details and receive an instant estimate in seconds.</p>
          </div>

          <form id="sellForm" className="sell-form panel-form" noValidate>
            <div className="form-group">
              <label className="field" htmlFor="registration">
                <span className="field-label">
                  <Car className="field-icon" />
                  Registration Number
                </span>
                <input 
                  id="registration" 
                  name="registration" 
                  type="text" 
                  inputMode="text" 
                  placeholder="e.g. AB12 CDE" 
                  required 
                  className="modern-input"
                />
              </label>
            </div>

            <div className="form-group">
              <label className="field" htmlFor="mileage">
                <span className="field-label">
                  <TrendingUp className="field-icon" />
                  Current Mileage
                </span>
                <input 
                  id="mileage" 
                  name="mileage" 
                  type="number" 
                  inputMode="numeric" 
                  placeholder="e.g. 45,200" 
                  required 
                  className="modern-input"
                />
              </label>
            </div>

            <button className="btn btn-primary btn-full" type="submit">
              <Search className="btn-icon" />
              Get Instant Valuation
              <ArrowRight className="btn-icon-right" />
            </button>
          </form>
        </motion.aside>
      </div>
      <div className="hero-decor" aria-hidden="true"></div>

      {/* Modern Valuation Modal */}
      <ModernValuationModal
        isOpen={visible}
        onClose={closeVehiclePanel}
        vehicle={vehicle}
        valuations={valuations}
        registration={registration}
        mileage={mileage}
        onSubmit={handlePanelSubmit}
        honeypotProps={sellLeadForm.honeypotProps}
      />

      {/* Snackbar */}
      {snackbar.visible && (
        <div id="snackbar" className={`snackbar ${snackbar.success ? 'snackbar--success' : 'snackbar--error'} snackbar--visible`} role="status" aria-live="polite">{snackbar.msg}</div>
      )}
    </section>
  );
}

export default SellCarForm
