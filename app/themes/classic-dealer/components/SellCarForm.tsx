"use client";

import type { CSSProperties } from "react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppIcon from "./AppIcon";
import { formatVehiclePrice } from "./vehicle-data";
import { useBrand } from "../context/BrandClientWrapper";
import "../styles/sell-your-car.css";

type VehicleLookupData = {
  vin?: string | null;
  registration?: string | null;
  derivative?: string | null;
  make_name?: string | null;
  model_name?: string | null;
  year_of_manufacture?: number | string | null;
  body_type?: string | null;
  fuel_type?: string | null;
  transmission_type?: string | null;
  colour?: string | null;
  odometer_reading_miles?: number | string | null;
  doors?: number | string | null;
  seats?: number | string | null;
  drivetrain?: string | null;
  engine_capacity_cc?: number | string | null;
  engine_power_bhp?: number | string | null;
  engine_power_ps?: number | string | null;
  owners?: number | string | null;
  first_registration_date?: string | null;
  vehicle_type?: string | null;
};

type LookupValuations = {
  retail?: number | null;
  trade?: number | null;
  private?: number | null;
  partExchange?: number | null;
};

type LookupState = {
  status: "idle" | "loading" | "success" | "error";
  message: string;
  vehicle: VehicleLookupData | null;
  valuations: LookupValuations | null;
};

type SellFormValues = {
  name: string;
  phone: string;
  email: string;
  condition: string;
  finance: string;
  expectedPrice: string;
  notes: string;
};

type SellCarFormProps = {
  showHeroContent?: boolean;
  className?: string;
};

type LookupPayload = {
  warnings?: Array<{ type?: string | null; message?: string | null }> | null;
  vehicle?: Record<string, unknown> | null;
  data?: Record<string, unknown> | null;
  valuations?: Record<string, unknown> | null;
  message?: string | null;
  error?: string | null;
};

const INITIAL_LOOKUP_STATE: LookupState = {
  status: "idle",
  message: "",
  vehicle: null,
  valuations: null,
};

const DEFAULT_STEPS = [
  {
    title: "Find Your Vehicle",
    description: "Enter registration and mileage so we can match key vehicle details instantly.",
  },
  {
    title: "Complete Your Details",
    description: "Once matched, add your contact information and confirm the condition of your vehicle.",
  },
  {
    title: "Receive A Fair Offer",
    description: "Our team reviews your request and contacts you with valuation guidance and next-step options.",
  },
];

const DEFAULT_BENEFITS = [
  "Professional, friendly and hassle-free process",
  "Dealer-backed valuation from an experienced local team",
  "Part exchange options available",
  "Appointment-led handover planning",
];

function normalizeRegistration(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
}

function formatLookupValue(value: unknown, fallback = "-"): string {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text.length ? text : fallback;
}

function yearFromRegistrationDate(value?: string | null): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})/);
  return match ? match[1] : null;
}

function normalizeVehicle(raw: Record<string, unknown>): VehicleLookupData {
  const make = raw.make_name ?? raw.make;
  const model = raw.model_name ?? raw.model;
  const registration = raw.registration ?? raw.reg ?? raw.vrm ?? raw.plate;
  const firstRegDate = raw.first_registration_date ?? raw.firstRegistrationDate;
  const year =
    raw.year_of_manufacture ??
    raw.year ??
    raw.firstRegistrationYear ??
    raw.firstReg ??
    yearFromRegistrationDate(firstRegDate ? String(firstRegDate) : "");

  return {
    vin: (raw.vin ?? null) as string | null,
    registration: (registration ?? null) as string | null,
    derivative: (raw.derivative ?? raw.trim ?? raw.version ?? null) as string | null,
    make_name: (make ?? null) as string | null,
    model_name: (model ?? null) as string | null,
    year_of_manufacture: (year ?? null) as number | string | null,
    body_type: (raw.body_type ?? raw.bodyType ?? null) as string | null,
    fuel_type: (raw.fuel_type ?? raw.fuelType ?? raw.fuel ?? null) as string | null,
    transmission_type: (raw.transmission_type ?? raw.transmissionType ?? raw.transmission ?? null) as string | null,
    colour: (raw.colour ?? raw.color ?? null) as string | null,
    odometer_reading_miles: (raw.odometer_reading_miles ?? raw.mileage ?? raw.odometer ?? null) as number | string | null,
    doors: (raw.doors ?? null) as number | string | null,
    seats: (raw.seats ?? null) as number | string | null,
    drivetrain: (raw.drivetrain ?? null) as string | null,
    engine_capacity_cc: (raw.engine_capacity_cc ?? raw.engineCapacityCC ?? null) as number | string | null,
    engine_power_bhp: (raw.engine_power_bhp ?? raw.enginePowerBHP ?? null) as number | string | null,
    engine_power_ps: (raw.engine_power_ps ?? raw.enginePowerPS ?? null) as number | string | null,
    owners: (raw.owners ?? raw.previousOwners ?? null) as number | string | null,
    first_registration_date: (firstRegDate ?? null) as string | null,
    vehicle_type: (raw.vehicle_type ?? raw.vehicleType ?? null) as string | null,
  };
}

function formatVehicleTitle(vehicle: VehicleLookupData): string {
  const year = formatLookupValue(vehicle.year_of_manufacture, "");
  const make = formatLookupValue(vehicle.make_name, "");
  const model = formatLookupValue(vehicle.model_name, "");
  const derivative = formatLookupValue(vehicle.derivative, "");

  return [year, make, model, derivative]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractValuationAmount(value?: unknown): number | null {
  if (value === null || value === undefined) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const rawCandidates = [
      record.amountGBP,
      record.amountNoVatGBP,
      record.amountExcludingVatGBP,
      record.amount,
    ];

    for (const raw of rawCandidates) {
      if (raw === null || raw === undefined || raw === "") continue;
      const numeric = typeof raw === "number" ? raw : Number(raw);
      if (Number.isFinite(numeric)) return numeric;
    }
  }

  return null;
}

function mapExternalValuations(raw?: Record<string, unknown> | null): LookupValuations | null {
  if (!raw) return null;

  const retail = extractValuationAmount(raw.retail);
  const trade = extractValuationAmount(raw.trade);
  const privateSale = extractValuationAmount(raw.private);
  const partExchange = extractValuationAmount(raw.partExchange);

  return {
    retail,
    trade,
    private: privateSale,
    partExchange,
  };
}

function formatValuation(value?: number | null): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "On request";
  return formatVehiclePrice(value, "On request");
}

function isValidEmail(value: string): boolean {
  return /\S+@\S+\.\S+/.test(value);
}

export const SellCarForm = ({ showHeroContent = true, className = "" }: SellCarFormProps) => {
  const brand = useBrand();
  const sellContent = (brand.pages?.sellYourCar ?? {}) as Record<string, unknown>;
  const heroContent = (sellContent.hero ?? {}) as Record<string, unknown>;
  const processContent = (sellContent.process ?? {}) as Record<string, unknown>;
  const formContent = (sellContent.form ?? {}) as Record<string, unknown>;

  const companyName = brand.name || process.env.NEXT_PUBLIC_COMPANY_NAME || "our dealership";
  const locationCity = brand.location?.address?.city || "your area";
  const heroTitle =
    typeof heroContent.title === "string" && heroContent.title.trim().length > 0
      ? heroContent.title
      : "Sell Your Car";
  const heroDescription =
    typeof heroContent.description === "string" && heroContent.description.trim().length > 0
      ? heroContent.description
      : `Request a fast dealer valuation from ${companyName} in ${locationCity}. We will confirm the next steps once your vehicle is matched.`;
  const heroImage =
    typeof heroContent.image === "string" && heroContent.image.trim().length > 0
      ? heroContent.image
      : brand.heroImage || "/images/IMG_3829.png";

  const processTitle =
    typeof processContent.title === "string" && processContent.title.trim().length > 0
      ? processContent.title
      : "How It Works";
  const processIntro =
    typeof processContent.description === "string" && processContent.description.trim().length > 0
      ? processContent.description
      : "We keep the process quick, clear and dealer-backed so you can move on your next vehicle without unnecessary delays.";

  const configuredSteps = Array.isArray(processContent.steps)
    ? processContent.steps
        .filter((step) => step && typeof step.title === "string" && typeof step.description === "string")
        .slice(0, 3)
    : [];
  const processSteps = configuredSteps.length ? configuredSteps : DEFAULT_STEPS;

  const configuredBenefits = Array.isArray(sellContent.benefits)
    ? sellContent.benefits.filter((item) => typeof item === "string" && item.trim().length > 0)
    : Array.isArray(sellContent.highlights)
      ? sellContent.highlights.filter((item) => typeof item === "string" && item.trim().length > 0)
      : [];
  const benefits = configuredBenefits.length ? configuredBenefits : DEFAULT_BENEFITS;

  const [registration, setRegistration] = useState("");
  const [mileage, setMileage] = useState("");
  const [lookupState, setLookupState] = useState<LookupState>(INITIAL_LOOKUP_STATE);
  const [resolvedLookupKey, setResolvedLookupKey] = useState("");
  const [lookupSubmitError, setLookupSubmitError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [formValues, setFormValues] = useState<SellFormValues>({
    name: "",
    phone: "",
    email: "",
    condition: "",
    finance: "",
    expectedPrice: "",
    notes: "",
  });

  const lookupKey = useMemo(() => {
    return `${normalizeRegistration(registration)}::${mileage.trim()}`;
  }, [registration, mileage]);

  const isLookupCurrent = lookupState.status === "success" && lookupKey === resolvedLookupKey;
  const isLookupStale = lookupState.status === "success" && lookupKey !== resolvedLookupKey;

  useEffect(() => {
    if (!isLookupCurrent) {
      setLookupSubmitError(null);
    }
  }, [isLookupCurrent]);

  const formKicker = isLookupCurrent
    ? typeof formContent.kickerMatched === "string"
      ? formContent.kickerMatched
      : "Vehicle Matched"
    : typeof formContent.kicker === "string"
      ? formContent.kicker
      : "Get Started";

  const formTitle = isLookupCurrent
    ? typeof formContent.titleMatched === "string"
      ? formContent.titleMatched
      : "Valuation Snapshot"
    : typeof formContent.title === "string"
      ? formContent.title
      : "Vehicle Valuation Request";

  const formDescription = isLookupCurrent
    ? typeof formContent.descriptionMatched === "string"
      ? formContent.descriptionMatched
      : "Review the match details and valuation guidance below, then finish your request."
    : typeof formContent.description === "string"
      ? formContent.description
      : "Start with registration and mileage. We will fetch your vehicle details, then unlock the full valuation request form.";

  const handleLookup = async () => {
    const lookupBase = (process.env.NEXT_PUBLIC_CAROUS_LOOKUP_API_URL || "https://api.carous.co.uk/v1/lookup").trim();

    const normalizedRegistration = normalizeRegistration(registration);
    const normalizedMileage = mileage.trim();

    if (!normalizedRegistration || !normalizedMileage) {
      setLookupState({
        status: "error",
        message: "Enter registration and mileage to find vehicle details.",
        vehicle: null,
        valuations: null,
      });
      return;
    }

    const mileageInt = Number.parseInt(normalizedMileage, 10);
    if (!Number.isFinite(mileageInt) || mileageInt < 0) {
      setLookupState({
        status: "error",
        message: "Mileage must be a valid positive number.",
        vehicle: null,
        valuations: null,
      });
      return;
    }

    setLookupSubmitError(null);
    setLookupState({
      status: "loading",
      message: "Looking up vehicle details...",
      vehicle: null,
      valuations: null,
    });

    try {
      let lookupUrl: URL;
      try {
        lookupUrl = new URL(lookupBase);
      } catch {
        setLookupState({
          status: "error",
          message: "Vehicle lookup URL is invalid. Please check NEXT_PUBLIC_CAROUS_LOOKUP_API_URL.",
          vehicle: null,
          valuations: null,
        });
        return;
      }

      const response = await fetch(lookupUrl.toString(), {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reg: normalizedRegistration,
          mileage: mileageInt,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as LookupPayload & {
        data?: Record<string, unknown>;
      };

      const warning = payload.warnings?.find((item) => item?.type?.toUpperCase() === "ERROR");
      if (warning?.message) {
        throw new Error(warning.message);
      }

      const rawVehicle =
        (payload.vehicle as Record<string, unknown> | null) ??
        (payload.data?.vehicle as Record<string, unknown> | null) ??
        (payload.data as Record<string, unknown> | null);
      const mappedVehicle = rawVehicle && typeof rawVehicle === "object" ? normalizeVehicle(rawVehicle) : null;
      const rawValuations =
        (payload.valuations as Record<string, unknown> | null) ??
        (payload.data?.valuations as Record<string, unknown> | null);
      const mappedValuations = rawValuations ? mapExternalValuations(rawValuations) : null;

      if (!response.ok || !mappedVehicle) {
        throw new Error(payload.message || payload.error || "Vehicle not found.");
      }

      setLookupState({
        status: "success",
        message: "Vehicle found. Complete the remaining fields and submit your request.",
        vehicle: mappedVehicle,
        valuations: mappedValuations,
      });
      setResolvedLookupKey(`${normalizedRegistration}::${normalizedMileage}`);
    } catch (error) {
      setLookupState({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to fetch vehicle details right now.",
        vehicle: null,
        valuations: null,
      });
      setResolvedLookupKey("");
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isLookupCurrent || !lookupState.vehicle) {
      setLookupSubmitError("Lookup the vehicle first before submitting your details.");
      return;
    }

    if (!formValues.name.trim() || !formValues.phone.trim() || !isValidEmail(formValues.email) || !formValues.condition || !formValues.finance) {
      setSubmitStatus("error");
      setSubmitMessage("Please complete all required fields with valid information.");
      return;
    }

    if (honeypot.trim().length > 0) {
      setSubmitStatus("success");
      setSubmitMessage("Thanks. Your valuation request has been sent successfully.");
      return;
    }

    setLookupSubmitError(null);
    setSubmitStatus("submitting");
    setSubmitMessage(null);

    const normalizedRegistration = normalizeRegistration(registration);
    const vehicleTitle = lookupState.vehicle ? formatVehicleTitle(lookupState.vehicle) : "";
    const valuationLines = lookupState.valuations
      ? [
          `Retail valuation: ${formatValuation(lookupState.valuations.retail)}`,
          `Private sale estimate: ${formatValuation(lookupState.valuations.private)}`,
          `Trade valuation: ${formatValuation(lookupState.valuations.trade)}`,
          `Part exchange estimate: ${formatValuation(lookupState.valuations.partExchange)}`,
        ]
      : [];

    const composedMessage = [
      valuationLines.length ? "Valuation snapshot:" : "",
      ...valuationLines,
      `Outstanding finance: ${formValues.finance}`,
      `Expected price: ${formValues.expectedPrice?.trim() || "Not provided"}`,
      formValues.notes?.trim() ? `Notes: ${formValues.notes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const leadData = {
      leadType: "sell-your-car" as const,
      name: formValues.name,
      email: formValues.email,
      phone: formValues.phone,
      subject: `Sell Your Car Valuation Request: ${normalizedRegistration || "Unknown"}`,
      message: composedMessage,
      vehicleDetails: {
        registration: normalizedRegistration || undefined,
        make: lookupState.vehicle?.make_name || undefined,
        model: [lookupState.vehicle?.model_name, lookupState.vehicle?.derivative]
          .filter(Boolean)
          .join(" ")
          .trim() || undefined,
        mileage: mileage.trim() || undefined,
        condition: formValues.condition || undefined,
        year: lookupState.vehicle?.year_of_manufacture
          ? String(lookupState.vehicle?.year_of_manufacture)
          : undefined,
      },
      additional_info: composedMessage,
    };

    try {
      const response = await fetch("/api/send-lead-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leadData }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Unable to send your valuation request.");
      }

      setSubmitStatus("success");
      setSubmitMessage("Thanks. Your valuation request has been sent successfully.");
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "Unable to send your valuation request.");
    }
  };

  const submitFeedback = lookupSubmitError
    ? { type: "error" as const, message: lookupSubmitError }
    : submitStatus === "error"
      ? { type: "error" as const, message: submitMessage || "Unable to send your valuation request." }
      : submitStatus === "success"
        ? { type: "success" as const, message: submitMessage || "Thanks. Your valuation request has been sent successfully." }
        : null;

  const heroStyle = heroImage
    ? ({ "--sell-hero-image": `url('${heroImage}')` } as CSSProperties)
    : undefined;
  const phone = brand.location?.phone ? String(brand.location.phone).trim() : "";

  return (
    <>
      {showHeroContent ? (
        <section className={`sell-hero ${className}`} style={heroStyle}>
          <div className="sell-shell sell-hero-inner">
            <h1 className="sell-title">{heroTitle}</h1>
            <p className="sell-subtitle">{heroDescription}</p>
            <div className="sell-hero-actions">
              <a className="sell-hero-btn primary" href="#sell-form">
                Start valuation
              </a>
              {phone ? (
                <a className="sell-hero-btn ghost" href={`tel:${phone}`}>
                  Call {phone}
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section className="sell-main">
        <div className="sell-shell sell-main-grid">
          <div className="sell-main-content">
            <header className="sell-section-head">
              <h2>{processTitle}</h2>
              <p>{processIntro}</p>
            </header>

            <div className="sell-steps">
              {processSteps.map((step, index) => (
                <article className="sell-step-card" key={`${step.title}-${index}`}>
                  <span className="sell-step-number">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="sell-benefits">
              <h3>Why sell to {companyName}?</h3>
              <ul>
                {benefits.map((benefit) => (
                  <li key={benefit}>
                    <AppIcon name="check-circle" /> {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="sell-form-wrap">
            <div className="sell-form-card" id="sell-form">
              <header>
                <p className="sell-form-kicker">{formKicker}</p>
                <h3>{formTitle}</h3>
                <p>{formDescription}</p>
              </header>

              <form className="sell-form" onSubmit={handleSubmit} noValidate>
                <label className="sell-honeypot">
                  <span>Leave this field empty</span>
                  <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(event) => setHoneypot(event.target.value)}
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </label>

                <div className="sell-form-grid sell-form-grid-lookup">
                  <label>
                    <span>Registration *</span>
                    <input
                      type="text"
                      name="registration"
                      placeholder="e.g. AB12 CDE"
                      value={registration}
                      onChange={(event) => setRegistration(event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Mileage *</span>
                    <input
                      type="number"
                      name="mileage"
                      min="0"
                      placeholder="e.g. 45200"
                      value={mileage}
                      onChange={(event) => setMileage(event.target.value)}
                      required
                    />
                  </label>
                </div>

                <div className="sell-form-lookup-actions">
                  <button
                    type="button"
                    className="sell-form-btn"
                    onClick={handleLookup}
                    disabled={lookupState.status === "loading"}
                  >
                    <AppIcon name="search" />
                    {lookupState.status === "loading" ? "Looking up..." : "Find Vehicle"}
                  </button>
                </div>

                {lookupState.message ? (
                  <p
                    className={`sell-form-status${lookupState.status === "error" ? " is-error" : ""}${lookupState.status === "success" ? " is-success" : ""}`}
                    role="status"
                  >
                    {lookupState.message}
                  </p>
                ) : null}

                {isLookupStale ? (
                  <p className="sell-form-status is-error" role="status">
                    Registration or mileage changed. Run vehicle lookup again to continue.
                  </p>
                ) : null}

                {isLookupCurrent && lookupState.vehicle ? (
                  <>
                    <section className="sell-match-panel" aria-live="polite">
                      <div className="sell-match-header">
                        <div>
                          <p className="sell-match-kicker">Vehicle Match</p>
                          <h4>We found your vehicle</h4>
                          <p className="sell-match-title">{formatVehicleTitle(lookupState.vehicle) || "Vehicle found"}</p>
                        </div>
                        <span className="sell-match-pill">Matched</span>
                      </div>
                    </section>

                    <section className="sell-valuation-panel">
                      <div className="sell-valuation-header">
                        <h4>Market Valuation</h4>
                        <p>Guide prices based on market data for similar vehicles.</p>
                      </div>
                      <p className="sell-valuation-highlight">
                        {lookupState.valuations?.retail !== null && lookupState.valuations?.retail !== undefined ? (
                          <>
                            Your vehicle is currently valued at{" "}
                            <strong className="sell-valuation-amount">{formatValuation(lookupState.valuations.retail)}</strong>{" "}
                            based on retail market guidance.
                          </>
                        ) : (
                          "Retail valuation is available on request once we review your vehicle details."
                        )}
                      </p>
                      <p className="sell-valuation-note">
                        Values are estimates and will be confirmed once we review condition, history, and specification.
                      </p>
                    </section>

                    <section className="sell-form-details">
                      <header className="sell-form-details-head">
                        <p className="sell-form-kicker">Your Details</p>
                        <h4>Finish Your Request</h4>
                        <p>Tell us how to reach you and confirm the condition of your vehicle.</p>
                      </header>
                      <div className="sell-form-grid sell-form-grid-details">
                        <label>
                          <span>Full Name *</span>
                          <input
                            type="text"
                            autoComplete="name"
                            value={formValues.name}
                            onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
                            required
                          />
                        </label>
                        <label>
                          <span>Phone *</span>
                          <input
                            type="tel"
                            autoComplete="tel"
                            value={formValues.phone}
                            onChange={(event) => setFormValues((prev) => ({ ...prev, phone: event.target.value }))}
                            required
                          />
                        </label>
                        <label>
                          <span>Email *</span>
                          <input
                            type="email"
                            autoComplete="email"
                            value={formValues.email}
                            onChange={(event) => setFormValues((prev) => ({ ...prev, email: event.target.value }))}
                            required
                          />
                        </label>
                        <label>
                          <span>Condition *</span>
                          <select
                            value={formValues.condition}
                            onChange={(event) => setFormValues((prev) => ({ ...prev, condition: event.target.value }))}
                            required
                          >
                            <option value="" disabled>
                              Select condition
                            </option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                          </select>
                        </label>
                        <label>
                          <span>Outstanding Finance *</span>
                          <select
                            value={formValues.finance}
                            onChange={(event) => setFormValues((prev) => ({ ...prev, finance: event.target.value }))}
                            required
                          >
                            <option value="" disabled>
                              Select option
                            </option>
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </label>
                        <label>
                          <span>Expected Price (Optional)</span>
                          <input
                            type="text"
                            placeholder="e.g. £12,500"
                            value={formValues.expectedPrice}
                            onChange={(event) => setFormValues((prev) => ({ ...prev, expectedPrice: event.target.value }))}
                          />
                        </label>
                        <label className="sell-form-note-field">
                          <span>Notes (Optional)</span>
                          <textarea
                            rows={2}
                            placeholder="Any key details we should know"
                            value={formValues.notes}
                            onChange={(event) => setFormValues((prev) => ({ ...prev, notes: event.target.value }))}
                          ></textarea>
                        </label>
                      </div>

                      <div className="sell-form-submit-row">
                        <button type="submit" className="sell-form-btn" disabled={submitStatus === "submitting"}>
                          <AppIcon name="paper-plane" />
                          {submitStatus === "submitting" ? "Submitting..." : "Request Valuation"}
                        </button>
                      </div>
                    </section>
                  </>
                ) : (
                  <p className="sell-form-lock-note">Complete vehicle lookup to unlock the rest of the form.</p>
                )}

                {submitFeedback ? (
                  <p
                    className={`sell-form-status${submitFeedback.type === "error" ? " is-error" : ""}${submitFeedback.type === "success" ? " is-success" : ""}`}
                    role="status"
                  >
                    {submitFeedback.message}
                  </p>
                ) : null}
              </form>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default SellCarForm;
