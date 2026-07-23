'use client';

import { CheckCircle, AlertCircle } from 'lucide-react';
import { useLeadsForm } from "../lib/use-leads-form";

const LEADS_ENDPOINT = process.env.NEXT_PUBLIC_LEADS_API_URL ?? '/leads';
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'chcars24@yahoo.com';

export default function SellValuationForm() {
  const {
    handleSubmit,
    getFieldProps,
    status,
    successMessage,
    errorMessage,
    errors,
    honeypotProps,
  } = useLeadsForm<{
    registration: string;
    mileage: string;
  }>({
    initialValues: {
      registration: '',
      mileage: '',
    },
    endpoint: LEADS_ENDPOINT,
    leadType: 'sell-your-car',
    fieldConfig: {
      registration: { required: true },
    },
    validate(values) {
      const validationErrors: Record<string, string> = {};
      if (!values.registration.trim()) {
        validationErrors.registration = 'Please enter your vehicle registration.';
      }
      return validationErrors;
    },
    buildPayload(values, meta) {
      const registration = values.registration.trim();
      const mileage = values.mileage.trim();
      const submittedDetails = [
        `Registration: ${registration || 'Not provided'}`,
        `Mileage: ${mileage || 'Not provided'}`,
      ].join('\n');

      return {
        leadData: {
          registration,
          mileage,
          message: 'No additional message provided.',
          submittedDetails,
          leadType: 'sell-your-car',
          permalink: typeof window === 'undefined' ? undefined : window.location.href,
          website: meta.honeypotValue,
          vehicleDetails: {
            registration,
            mileage,
          },
        },
        recipientEmail: CONTACT_EMAIL,
      };
    },
  });

  const isSubmitting = status === 'submitting';

  return (
    <form className="quick-valuation-form" id="hero-valuation-form" onSubmit={handleSubmit}>
      <input type="text" {...honeypotProps} />

      {status === 'success' && (
        <div className="form-success" role="status" aria-live="polite">
          <CheckCircle className="form-icon" />
          <span>{successMessage ?? 'Thanks! We will contact you with an estimate shortly.'}</span>
        </div>
      )}

      {status === 'error' && (
        <div className="form-error" role="alert">
          <AlertCircle className="form-icon" />
          <span>{errorMessage ?? 'Something went wrong. Please try again later.'}</span>
        </div>
      )}

      <div className="form-group-compact">
        <label htmlFor="hero-registration">Registration</label>
        <input
          type="text"
          id="hero-registration"
          placeholder="e.g. AB12CDE"
          required
          {...getFieldProps('registration')}
        />
        {errors.registration && (
          <p className="field-error" style={{ color: 'var(--t-error)', marginTop: 4 }}>{errors.registration}</p>
        )}
      </div>
      <div className="form-group-compact">
        <label htmlFor="hero-mileage">Mileage</label>
        <input
          type="number"
          id="hero-mileage"
          placeholder="e.g. 45200"
          min={0}
          {...getFieldProps('mileage')}
        />
      </div>
      <button type="submit" className="btn-quote" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Get Instant Quote'}
      </button>
    </form>
  );
}
