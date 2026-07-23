'use client';

import { useMemo, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useLeadsForm } from "../lib/use-leads-form";

interface EnquiryFormData {
  name: string;
  email: string;
  phone: string;
  location: string;
  message: string;
}

interface EnquiryFormProps {
  carInfo?: {
    registration?: string;
    make?: string;
    model?: string;
    derivative?: string;
    year?: number | string;
    price?: number | string;
    mileage?: number | string;
    transmission?: string;
    fuelType?: string;
    engineSize?: number | string;
  };
  modalType?: 'test-drive' | 'details';
}

const LEADS_ENDPOINT = process.env.NEXT_PUBLIC_LEADS_API_URL ?? '/leads';
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'chcars24@yahoo.com';

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPrice(value: unknown): string | undefined {
  const numeric = toNumber(value);
  if (numeric === null || numeric <= 0) return undefined;
  return `£${Math.round(numeric).toLocaleString('en-GB')}`;
}

function formatMileage(value: unknown): string | undefined {
  const numeric = toNumber(value);
  if (numeric === null || numeric < 0) return undefined;
  return `${Math.round(numeric).toLocaleString('en-GB')} miles`;
}

function formatEngineSize(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const raw = String(value).trim();
  if (!raw) return undefined;
  if (/cc$/i.test(raw) || /l$/i.test(raw)) return raw;

  const numeric = toNumber(raw);
  if (numeric === null) return raw;

  if (numeric > 20) {
    return `${Math.round(numeric)}cc`;
  }

  return `${numeric.toFixed(1)}L`;
}

function buildVehicleName(carInfo?: EnquiryFormProps['carInfo']): string | undefined {
  if (!carInfo) return undefined;

  const parts = [carInfo.year, carInfo.make, carInfo.model, carInfo.derivative]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean);

  const title = parts.join(' ').replace(/\s+/g, ' ').trim();
  return title || undefined;
}

export default function EnquiryForm({ carInfo, modalType }: EnquiryFormProps) {
  const defaultMessage = useMemo(() => {
    const vehicleName = buildVehicleName(carInfo) ?? 'this vehicle';
    
    if (modalType === 'test-drive') {
      return `Hi, I'm interested in booking a test drive for ${vehicleName}. Please let me know what times are available.`;
    } else if (modalType === 'details') {
      return `Hi, I'm interested in ${vehicleName}. Could you please provide more details about this vehicle?`;
    }
    
    return `Hi, I'm interested in ${vehicleName} listed on your site. Please provide more details about its availability and condition.`;
  }, [carInfo, modalType]);

  const {
    handleSubmit,
    getFieldProps,
    errors,
    status,
    errorMessage,
    successMessage,
    honeypotProps,
    setFieldValue,
  } = useLeadsForm<EnquiryFormData>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      location: '',
      message: defaultMessage,
    },
    endpoint: LEADS_ENDPOINT,
    leadType: 'dealer-enquiry',
    leadSource: 'vehicle-detail-modal',
    fieldConfig: {
      name: { required: true },
      email: { required: true },
      message: { required: true },
    },
    validate(values) {
      const next: Record<string, string> = {};
      if (!values.name.trim()) {
        next.name = 'Please tell us your name.';
      }
      if (!values.email.trim()) {
        next.email = 'Please provide an email address.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        next.email = 'Enter a valid email.';
      }
      if (!values.message.trim()) {
        next.message = 'A short message helps us understand your interest.';
      }
      return next;
    },
    buildPayload(values, meta) {
      const enquiryType = modalType === 'test-drive' ? 'Test Drive Request' : 'Vehicle Details Request';
      const vehicleName = buildVehicleName(carInfo);
      const vehiclePrice = formatPrice(carInfo?.price);
      const vehicleMileage = formatMileage(carInfo?.mileage);
      const vehicleTransmission = carInfo?.transmission?.trim() || undefined;
      const vehicleFuelType = carInfo?.fuelType?.trim() || undefined;
      const vehicleEngineSize = formatEngineSize(carInfo?.engineSize);

      return {
        leadData: {
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim(),
          message: values.message.trim(),
          location: values.location.trim(),
          leadType: 'dealer-enquiry',
          leadSource: meta.leadSource,
          leadOwner: meta.leadOwner,
          formTs: meta.formTs,
          recaptchaToken: meta.recaptchaToken,
          enquiryType,
          permalink: typeof window === 'undefined' ? undefined : window.location.href,
          website: meta.honeypotValue,
          vehicle: vehicleName,
          price: vehiclePrice,
          mileage: vehicleMileage,
          transmission: vehicleTransmission,
          fuelType: vehicleFuelType,
          engineSize: vehicleEngineSize,
          vehicleDetails: carInfo
            ? {
                registration: carInfo.registration,
                year: carInfo.year !== undefined && carInfo.year !== null ? String(carInfo.year) : undefined,
                make: carInfo.make,
                model: carInfo.model,
                derivative: carInfo.derivative,
                price: vehiclePrice,
                mileage: vehicleMileage,
                transmission: vehicleTransmission,
                fuelType: vehicleFuelType,
                engineSize: vehicleEngineSize,
              }
            : undefined,
        },
        recipientEmail: CONTACT_EMAIL,
      };
    },
  });

  const isSubmitting = status === 'submitting';

  // Reset only the message field when carInfo or modalType changes to update the default message
  useEffect(() => {
    setFieldValue('message', defaultMessage);
  }, [carInfo, modalType, defaultMessage, setFieldValue]);

  return (
    <section className="product-section enquiry-section">

      {status === 'success' && (
        <div className="form-success" role="status" aria-live="polite">
          <CheckCircle className="form-icon" />
          <span>{successMessage ?? "Thanks! We'll get back to you shortly."}</span>
        </div>
      )}
      {status === 'error' && (
        <div className="form-error" role="alert">
          <AlertCircle className="form-icon" />
          <span>{errorMessage ?? 'Something went wrong. Please try again.'}</span>
        </div>
      )}

      <form id="enquiry-form" className="enquiry-form" onSubmit={handleSubmit}>
        <input type="text" {...honeypotProps} />
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="enquiry-name">Full Name *</label>
            <input type="text" id="enquiry-name" placeholder="John Smith" required {...getFieldProps('name')} />
          {errors.name && <p className="field-error" style={{ color: 'var(--t-error)', marginTop: 4 }}>{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="enquiry-email">Email Address *</label>
            <input type="email" id="enquiry-email" placeholder="john@example.com" required {...getFieldProps('email')} />
          {errors.email && <p className="field-error" style={{ color: 'var(--t-error)', marginTop: 4 }}>{errors.email}</p>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="enquiry-phone">Phone Number</label>
            <input type="tel" id="enquiry-phone" placeholder="07700 900000" {...getFieldProps('phone')} />
          </div>
          <div className="form-group">
            <label htmlFor="enquiry-location">Location</label>
            <input
              type="text"
              id="enquiry-location"
              placeholder="City, Country"
              {...getFieldProps('location')}
            />
          </div>
        </div>
          <div className="form-group full-width">
            <label htmlFor="enquiry-message">Message *</label>
            <textarea id="enquiry-message" rows={2} required {...getFieldProps('message')} />
          {errors.message && (
            <p className="field-error" style={{ color: 'var(--t-error)', marginTop: 4 }}>{errors.message}</p>
          )}
        </div>
        <button type="submit" className="btn-primary enquiry-submit" disabled={isSubmitting}>
          <Send className="lucide lucide-send" />
          <span>{isSubmitting ? 'Sending...' : 'Send Enquiry'}</span>
        </button>
      </form>
    </section>
  );
}
