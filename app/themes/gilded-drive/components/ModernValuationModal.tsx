"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, easeInOut } from 'framer-motion'
import { X, Car, TrendingUp, Calendar, DollarSign, Fuel, Settings, Users, CheckCircle, ArrowRight } from 'lucide-react'

interface VehicleData {
  registration?: string
  make?: string
  model?: string
  firstRegistrationDate?: string
  firstRegistrationYear?: string
  firstReg?: string
  colour?: string
  fuelType?: string
  transmissionType?: string
  enginePowerBHP?: number
  enginePowerKW?: number
  power?: number
  doors?: number
  seats?: number
  co2EmissionGPKM?: number
}

interface ValuationData {
  retail?: {
    amountGBP?: number
    amount?: number
  }
}

interface ModernValuationModalProps {
  isOpen: boolean
  onClose: () => void
  vehicle: VehicleData | null
  valuations: ValuationData | null
  registration: string
  mileage: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  honeypotProps?: React.InputHTMLAttributes<HTMLInputElement>
}

const ModernValuationModal: React.FC<ModernValuationModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  valuations,
  registration,
  mileage,
  onSubmit,
  honeypotProps
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [condition, setCondition] = useState('good')

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Close modal on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }, [onClose])

  const formatPrice = (amount?: number) => {
    if (!amount) return 'Price not available'
    return `£${amount.toLocaleString()}`
  }

  const getYearFromDate = (date?: string) => {
    if (!date) return '—'
    return date.slice(0, 4)
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { duration: 0.3, ease: easeInOut } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20, 
      transition: { duration: 0.2, ease: easeInOut } 
    }
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modern-valuation-backdrop"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={modalRef}
            className="modern-valuation-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="modal-header">
              <div className="modal-vehicle-info">
                <div className="vehicle-icon">
                  <Car size={24} />
                </div>
                <div>
                  <h2 className="vehicle-title">
                    {vehicle?.make && vehicle?.model 
                      ? `${vehicle.make} ${vehicle.model}` 
                      : 'Vehicle Details'}
                  </h2>
                  <p className="vehicle-subtitle">{registration}</p>
                </div>
              </div>
              <button className="modal-close" onClick={onClose} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            {/* Valuation Display */}
            <div className="valuation-section">
              <div className="valuation-header">
                <TrendingUp className="valuation-icon" size={20} />
                <h3>Instant Valuation</h3>
              </div>
              <div className="valuation-price">
                <DollarSign className="price-icon" size={18} />
                <span className="price-amount">{formatPrice(valuations?.retail?.amountGBP || valuations?.retail?.amount)}</span>
              </div>
              <p className="valuation-disclaimer">Based on current market data and vehicle condition</p>
            </div>

            {/* Vehicle Details Grid */}
            <div className="vehicle-details">
              <h3 className="details-title">Vehicle Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <Calendar className="detail-icon" size={16} />
                  <span className="detail-label">Year</span>
                  <span className="detail-value">{getYearFromDate(vehicle?.firstRegistrationDate || vehicle?.firstRegistrationYear || vehicle?.firstReg)}</span>
                </div>
                <div className="detail-item">
                  <div className="detail-icon color-icon" />
                  <span className="detail-label">Colour</span>
                  <span className="detail-value">{vehicle?.colour || '—'}</span>
                </div>
                <div className="detail-item">
                  <Fuel className="detail-icon" size={16} />
                  <span className="detail-label">Fuel</span>
                  <span className="detail-value">{vehicle?.fuelType || '—'}</span>
                </div>
                <div className="detail-item">
                  <Settings className="detail-icon" size={16} />
                  <span className="detail-label">Transmission</span>
                  <span className="detail-value">{vehicle?.transmissionType || '—'}</span>
                </div>
                <div className="detail-item">
                  <Users className="detail-icon" size={16} />
                  <span className="detail-label">Doors/Seats</span>
                  <span className="detail-value">{vehicle?.doors || '—'} / {vehicle?.seats || '—'}</span>
                </div>
                <div className="detail-item">
                  <TrendingUp className="detail-icon" size={16} />
                  <span className="detail-label">Power</span>
                  <span className="detail-value">{vehicle?.enginePowerBHP ?? vehicle?.enginePowerKW ?? vehicle?.power ?? '—'} BHP</span>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form className="valuation-form" onSubmit={onSubmit}>
              <input type="hidden" name="registration" value={registration} />
              <input type="hidden" name="mileage" value={mileage} />
              {honeypotProps ? (
                <input type="text" placeholder="Leave this field empty" {...honeypotProps} />
              ) : null}
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="modal-name">Full Name</label>
                  <input
                    id="modal-name"
                    name="name"
                    type="text"
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="modal-email">Email Address</label>
                  <input
                    id="modal-email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="modal-phone">Phone Number</label>
                  <input
                    id="modal-phone"
                    name="phone"
                    type="tel"
                    placeholder="+44 7911 123456"
                    required
                  />
                </div>
              </div>

              <div className="condition-section">
                <label className="condition-label">Vehicle Condition</label>
                <div className="condition-options">
                  {['excellent', 'good', 'fair', 'poor'].map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      className={`condition-btn ${condition === cond ? 'active' : ''}`}
                      onClick={() => setCondition(cond)}
                    >
                      {cond.charAt(0).toUpperCase() + cond.slice(1)}
                    </button>
                  ))}
                </div>
                <input type="hidden" name="condition" value={condition} />
              </div>

              <div className="form-group">
                <label htmlFor="modal-notes">Additional Notes (Optional)</label>
                <textarea
                  id="modal-notes"
                  name="notes"
                  placeholder="Any additional details about your vehicle..."
                  rows={3}
                />
              </div>

              <button type="submit" className="submit-btn">
                <CheckCircle size={18} />
                Get Your Instant Offer
                <ArrowRight size={18} />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ModernValuationModal
