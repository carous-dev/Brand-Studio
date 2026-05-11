"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLeadsForm } from "@/app/hooks/useLeadsForm";
import { lookupVehicleValuation } from "./lookup";
import { buildSellYourCarLeadPayload } from "./payload";
import {
  formatMileage,
  formatRegistration,
  formatRegistrationDisplay,
  formatValuationAmount,
  formatVehicleSubtitle,
  formatVehicleTitle,
} from "./format";
import type {
  LookupState,
  LookupValuations,
  SellYourCarConfig,
  SellYourCarFormValues,
  VehicleLookupData,
} from "./types";

/**
 * Brandstudio global widget — ported from `@carous/sell-your-car`.
 * =============================================================================
 *
 * Faithful port of the carous-platform monorepo's sell-your-car package
 * (huntsmotors, csmotors, etc. all mount it). Three-step wizard:
 *
 *   1. Identify  — registration plate + mileage; POSTs to /api/lookup.
 *   2. Valuation — shows the matched vehicle + trade price (or "On request").
 *   3. Details   — name/phone/email/condition/finance/expected price/notes.
 *
 * Differences from the upstream package (kept intentional):
 *   - Uses brandstudio's `useLeadsForm` (slightly thinner meta shape — we
 *     enrich the meta passed to `buildSellYourCarLeadPayload` so the lead
 *     payload still ships with `leadType` / `leadSource` / `leadOwner`).
 *   - The upstream `onSubmitSuccess` callback receives the response body in
 *     carous-platform; brandstudio's submit doesn't expose it, so we pass
 *     `undefined`. Analytics call sites that key off the body should be
 *     aware of this gap.
 *
 * The CSS lives in `./styles.css` and uses class names `.sycw-*` — import
 * it from the consuming page (the mount component below imports it).
 */

type WizardStep = "identify" | "valuation" | "details" | "success";

const INITIAL_LOOKUP_STATE: LookupState = {
  status: "idle",
  message: "",
  vehicle: null,
  valuations: null,
};

const DEFAULT_COPY = {
  cardTitle: "Get a free valuation",
  cardSubtitle: "Three quick steps. No obligation. Decision within 24 hours.",
  stepIdentify: "Identify",
  stepValuation: "Valuation",
  stepDetails: "Your details",
  identifyHeading: "What car are you selling?",
  identifyHint: "Pop in your registration and current mileage. We will pull the vehicle details and a guide price for you.",
  identifyCta: "Find my car",
  identifyCtaLoading: "Looking up...",
  valuationHeading: "Here is your valuation",
  valuationSubheading: "Guide prices based on current market data. Final figure confirmed once we review the vehicle.",
  valuationDisclaimer: "Estimates only — confirmed once we review condition, history, and specification.",
  valuationContinueCta: "Continue to your details",
  detailsHeading: "Last few questions",
  detailsSubheading: "Drop your contact details and we will be in touch with a confirmed offer.",
  detailsSubmitCta: "Request my offer",
  detailsSubmitLoadingCta: "Sending...",
  successHeading: "Thanks — your valuation request is in",
  successBody: "Our team is reviewing your details and will be in touch shortly with a confirmed offer.",
  successCtaLabel: "Speak to us now",
  trustHeading: "Why sell to us",
};

const DEFAULT_TRUST = [
  { text: "Free, no-obligation valuation" },
  { text: "Decision within 24 hours" },
  { text: "Top of market on the right vehicles" },
  { text: "Hassle-free handover, paid same day" },
];

const DEFAULT_CONDITION_OPTIONS = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
];

const DEFAULT_FINANCE_OPTIONS = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
];

const DEFAULT_LOOKUP_ENDPOINT = "/api/lookup";

function resolveLookupEndpoint(override?: string): string {
  if (override && override.trim()) return override.trim();
  return DEFAULT_LOOKUP_ENDPOINT;
}

function UkPlateFlag() {
  return (
    <span className="sycw-plate-flag" aria-hidden="true">
      <svg className="sycw-plate-flag-jack" viewBox="0 0 30 18" xmlns="http://www.w3.org/2000/svg">
        <rect width="30" height="18" fill="#012169" />
        <path d="M0,0 L30,18 M30,0 L0,18" stroke="#fff" strokeWidth="3.6" />
        <path d="M0,0 L30,18 M30,0 L0,18" stroke="#C8102E" strokeWidth="1.6" />
        <path d="M15,0 L15,18 M0,9 L30,9" stroke="#fff" strokeWidth="5" />
        <path d="M15,0 L15,18 M0,9 L30,9" stroke="#C8102E" strokeWidth="2.6" />
      </svg>
      <span className="sycw-plate-flag-label">UK</span>
    </span>
  );
}

function VehicleSummary({ vehicle, mileage }: { vehicle: VehicleLookupData; mileage: string }) {
  const subtitle = formatVehicleSubtitle(vehicle);
  return (
    <div className="sycw-vehicle-summary">
      <div className="sycw-vehicle-summary-plate">
        <UkPlateFlag />
        <span className="sycw-vehicle-summary-plate-text">
          {formatRegistrationDisplay(String(vehicle.registration ?? ""))}
        </span>
      </div>
      <div className="sycw-vehicle-summary-meta">
        <h3 className="sycw-vehicle-summary-title">{formatVehicleTitle(vehicle) || "Vehicle matched"}</h3>
        {subtitle ? <p className="sycw-vehicle-summary-subtitle">{subtitle}</p> : null}
        {mileage ? <p className="sycw-vehicle-summary-mileage">{formatMileage(mileage)} miles</p> : null}
      </div>
    </div>
  );
}

export function SellYourCarWidget(props: SellYourCarConfig = {}) {
  const copy = useMemo(() => ({ ...DEFAULT_COPY, ...(props.copy ?? {}) }), [props.copy]);
  const trust = props.trust ?? DEFAULT_TRUST;
  const fields = props.fields ?? {};
  const conditionOptions = fields.conditionOptions ?? DEFAULT_CONDITION_OPTIONS;
  const financeOptions = fields.financeOptions ?? DEFAULT_FINANCE_OPTIONS;
  const lookupEndpoint = useMemo(() => resolveLookupEndpoint(props.lookupEndpoint), [props.lookupEndpoint]);

  const [step, setStep] = useState<WizardStep>("identify");
  const [registration, setRegistration] = useState("");
  const [mileage, setMileage] = useState("");
  const [lookupState, setLookupState] = useState<LookupState>(INITIAL_LOOKUP_STATE);
  const [submitFeedback, setSubmitFeedback] = useState<{ type: "error"; message: string } | null>(null);

  const lookupAbortRef = useRef<AbortController | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const onLookupSuccessRef = useRef(props.onLookupSuccess);
  const onSubmitSuccessRef = useRef(props.onSubmitSuccess);
  useEffect(() => {
    onLookupSuccessRef.current = props.onLookupSuccess;
  }, [props.onLookupSuccess]);
  useEffect(() => {
    onSubmitSuccessRef.current = props.onSubmitSuccess;
  }, [props.onSubmitSuccess]);

  const leadType = props.leadType ?? "sell-your-car";
  const leadSource = props.leadSource ?? "sell-your-car";

  const sellForm = useLeadsForm<SellYourCarFormValues>({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      condition: "",
      finance: "",
      expectedPrice: "",
      notes: "",
    },
    leadType,
    leadSource,
    endpoint: props.leadEndpoint,
    honeypotField: "website",
    fieldConfig: {
      name: { required: true },
      phone: { required: true },
      email: {
        required: true,
        validate: (value) => (/\S+@\S+\.\S+/.test(String(value || "")) ? null : "Please enter a valid email."),
      },
      ...(fields.hideCondition ? {} : { condition: { required: true } }),
      ...(fields.hideFinance ? {} : { finance: { required: true } }),
    },
    buildPayload: (values, meta) =>
      buildSellYourCarLeadPayload({
        values,
        meta: {
          formTs: meta.formTs,
          honeypotField: meta.honeypotField,
          honeypotValue: meta.honeypotValue,
          recaptchaToken: meta.recaptchaToken ?? undefined,
          leadType,
          leadSource,
          leadOwner: props.leadOwner,
        },
        registration,
        mileage,
        vehicle: lookupState.status === "success" ? lookupState.vehicle : null,
        valuations: lookupState.status === "success" ? lookupState.valuations : null,
      }),
  });

  useEffect(() => {
    if (step === "identify") return;
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  const handleRegistrationChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRegistration(formatRegistration(event.target.value));
    if (lookupState.status === "success" || lookupState.status === "error") {
      setLookupState(INITIAL_LOOKUP_STATE);
      setStep("identify");
    }
  };

  const handleMileageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = event.target.value.replace(/[^0-9]/g, "");
    setMileage(digitsOnly);
    if (lookupState.status === "success" || lookupState.status === "error") {
      setLookupState(INITIAL_LOOKUP_STATE);
      setStep("identify");
    }
  };

  const handleLookup = useCallback(async () => {
    setSubmitFeedback(null);

    const cleanReg = formatRegistration(registration);
    const cleanMileage = mileage.trim();
    if (!cleanReg) {
      setLookupState({
        status: "error",
        message: "Enter your registration plate.",
        vehicle: null,
        valuations: null,
      });
      return;
    }
    if (!cleanMileage) {
      setLookupState({
        status: "error",
        message: "Enter your current mileage.",
        vehicle: null,
        valuations: null,
      });
      return;
    }

    lookupAbortRef.current?.abort();
    const controller = new AbortController();
    lookupAbortRef.current = controller;

    setLookupState({
      status: "loading",
      message: "Looking up your vehicle...",
      vehicle: null,
      valuations: null,
    });

    try {
      const result = await lookupVehicleValuation({
        endpoint: lookupEndpoint,
        registration: cleanReg,
        mileage: cleanMileage,
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      setLookupState({
        status: "success",
        message: "Vehicle found.",
        vehicle: result.vehicle,
        valuations: result.valuations,
      });
      setStep("valuation");
      onLookupSuccessRef.current?.(result);
    } catch (error) {
      if (controller.signal.aborted) return;
      setLookupState({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to fetch vehicle details right now.",
        vehicle: null,
        valuations: null,
      });
    }
  }, [lookupEndpoint, registration, mileage]);

  const handleIdentifySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleLookup();
  };

  const handleDetailsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lookupState.status !== "success") {
      setSubmitFeedback({ type: "error", message: "Lookup the vehicle first before submitting your details." });
      setStep("identify");
      return;
    }
    setSubmitFeedback(null);
    const result = await sellForm.submit();
    if (result.success) {
      setStep("success");
      // brandstudio's useLeadsForm doesn't expose the response body; pass undefined.
      onSubmitSuccessRef.current?.(undefined);
    } else if (result.error) {
      setSubmitFeedback({ type: "error", message: result.error });
    }
  };

  const valuations: LookupValuations | null =
    lookupState.status === "success" ? lookupState.valuations : null;

  const tradePrice = valuations?.trade ?? null;
  const tradeAvailable = tradePrice !== null && tradePrice !== undefined && Number.isFinite(tradePrice);

  const idPrefix = useId();

  const wizardColumn = (
    <div className="sycw-wizard-column">
      <header className="sycw-header">
        <h2 className="sycw-card-title">{copy.cardTitle}</h2>
        <p className="sycw-card-subtitle">{copy.cardSubtitle}</p>
      </header>

      <div className="sycw-progress" role="list" aria-label="Wizard progress">
        {[
          { key: "identify", label: copy.stepIdentify, n: 1 },
          { key: "valuation", label: copy.stepValuation, n: 2 },
          { key: "details", label: copy.stepDetails, n: 3 },
        ].map((entry, index) => {
          const order: WizardStep[] = ["identify", "valuation", "details", "success"];
          const currentIndex = order.indexOf(step);
          const itemIndex = order.indexOf(entry.key as WizardStep);
          const status: "done" | "current" | "upcoming" =
            currentIndex > itemIndex ? "done" : currentIndex === itemIndex ? "current" : "upcoming";
          return (
            <div
              key={entry.key}
              role="listitem"
              className={`sycw-progress-item is-${status}`}
              aria-current={status === "current" ? "step" : undefined}
            >
              <span className="sycw-progress-bullet">{status === "done" ? "✓" : entry.n}</span>
              <span className="sycw-progress-label">{entry.label}</span>
              {index < 2 ? <span className="sycw-progress-connector" aria-hidden="true" /> : null}
            </div>
          );
        })}
      </div>

      <div ref={cardRef} className="sycw-card" data-step={step}>
        {step === "identify" ? (
          <form className="sycw-step sycw-step-identify" onSubmit={handleIdentifySubmit} noValidate>
            <h3 className="sycw-step-heading">{copy.identifyHeading}</h3>
            <p className="sycw-step-hint">{copy.identifyHint}</p>

            <div className="sycw-identify-fields">
              <label className="sycw-field sycw-field-plate" htmlFor={`${idPrefix}-reg`}>
                <span className="sycw-field-label">Registration</span>
                <div className="sycw-plate-input">
                  <UkPlateFlag />
                  <input
                    id={`${idPrefix}-reg`}
                    type="text"
                    name="registration"
                    autoComplete="off"
                    spellCheck={false}
                    inputMode="text"
                    placeholder="LP65 ABC"
                    value={formatRegistrationDisplay(registration)}
                    onChange={handleRegistrationChange}
                    required
                  />
                </div>
              </label>
              <label className="sycw-field sycw-field-mileage" htmlFor={`${idPrefix}-mileage`}>
                <span className="sycw-field-label">Current mileage</span>
                <div className="sycw-mileage-input">
                  <input
                    id={`${idPrefix}-mileage`}
                    type="text"
                    name="mileage"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="65,432"
                    value={formatMileage(mileage)}
                    onChange={handleMileageChange}
                    required
                  />
                  <span className="sycw-mileage-suffix" aria-hidden="true">miles</span>
                </div>
              </label>
            </div>

            {lookupState.status === "error" ? (
              <p className="sycw-status is-error" role="alert">
                {lookupState.message}
              </p>
            ) : null}

            <button
              type="submit"
              className="sycw-cta"
              disabled={lookupState.status === "loading"}
            >
              {lookupState.status === "loading" ? copy.identifyCtaLoading : copy.identifyCta}
              <span className="sycw-cta-arrow" aria-hidden="true">→</span>
            </button>
          </form>
        ) : null}

        {step === "valuation" && lookupState.status === "success" ? (
          <div className="sycw-step sycw-step-valuation">
            <h3 className="sycw-step-heading">{copy.valuationHeading}</h3>
            <p className="sycw-step-hint">{copy.valuationSubheading}</p>

            <VehicleSummary vehicle={lookupState.vehicle} mileage={mileage} />

            <div className="sycw-valuation-card">
              <span className="sycw-valuation-card-label">Online guide trade price</span>
              {tradeAvailable ? (
                <span className="sycw-valuation-card-amount">{formatValuationAmount(tradePrice)}</span>
              ) : (
                <span className="sycw-valuation-card-fallback">
                  Online guide trade price is available on request once we review your vehicle details.
                </span>
              )}
            </div>

            <p className="sycw-disclaimer">{copy.valuationDisclaimer}</p>
            <p className="sycw-disclaimer">
              Indicative only — not an offer or guarantee. Final figure is confirmed by our team after review.
            </p>

            <div className="sycw-step-actions">
              <button
                type="button"
                className="sycw-secondary"
                onClick={() => setStep("identify")}
              >
                ← Back
              </button>
              <button
                type="button"
                className="sycw-cta"
                onClick={() => setStep("details")}
              >
                {copy.valuationContinueCta}
                <span className="sycw-cta-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        ) : null}

        {step === "details" && lookupState.status === "success" ? (
          <form className="sycw-step sycw-step-details" onSubmit={handleDetailsSubmit} noValidate>
            <h3 className="sycw-step-heading">{copy.detailsHeading}</h3>
            <p className="sycw-step-hint">{copy.detailsSubheading}</p>

            <input type="text" {...sellForm.honeypotProps} />

            <div className="sycw-details-grid">
              <label className="sycw-field">
                <span className="sycw-field-label">Full name</span>
                <input type="text" autoComplete="name" required {...sellForm.getFieldProps("name")} />
                {sellForm.errors.name ? <span className="sycw-field-error">{sellForm.errors.name}</span> : null}
              </label>
              <label className="sycw-field">
                <span className="sycw-field-label">Phone</span>
                <input type="tel" autoComplete="tel" required {...sellForm.getFieldProps("phone")} />
                {sellForm.errors.phone ? <span className="sycw-field-error">{sellForm.errors.phone}</span> : null}
              </label>
              <label className="sycw-field sycw-field-wide">
                <span className="sycw-field-label">Email</span>
                <input type="email" autoComplete="email" required {...sellForm.getFieldProps("email")} />
                {sellForm.errors.email ? <span className="sycw-field-error">{sellForm.errors.email}</span> : null}
              </label>
              {fields.hideCondition ? null : (
                <label className="sycw-field">
                  <span className="sycw-field-label">Condition</span>
                  <select required {...sellForm.getFieldProps("condition")}>
                    <option value="" disabled>
                      Select condition
                    </option>
                    {conditionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {fields.hideFinance ? null : (
                <label className="sycw-field">
                  <span className="sycw-field-label">Outstanding finance</span>
                  <select required {...sellForm.getFieldProps("finance")}>
                    <option value="" disabled>
                      Select option
                    </option>
                    {financeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {fields.hideExpectedPrice ? null : (
                <label className="sycw-field sycw-field-wide">
                  <span className="sycw-field-label">Expected price (optional)</span>
                  <input
                    type="text"
                    placeholder="e.g. £12,500"
                    {...sellForm.getFieldProps("expectedPrice")}
                  />
                </label>
              )}
              {fields.hideNotes ? null : (
                <label className="sycw-field sycw-field-wide">
                  <span className="sycw-field-label">Notes (optional)</span>
                  <textarea
                    rows={3}
                    placeholder="Anything we should know — service history, modifications, condition notes..."
                    {...sellForm.getFieldProps("notes")}
                  />
                </label>
              )}
            </div>

            {submitFeedback ? (
              <p className="sycw-status is-error" role="alert">
                {submitFeedback.message}
              </p>
            ) : null}

            <div className="sycw-step-actions">
              <button
                type="button"
                className="sycw-secondary"
                onClick={() => setStep("valuation")}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="sycw-cta"
                disabled={sellForm.status === "submitting"}
              >
                {sellForm.status === "submitting" ? copy.detailsSubmitLoadingCta : copy.detailsSubmitCta}
                <span className="sycw-cta-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        ) : null}

        {step === "success" ? (
          <div className="sycw-step sycw-step-success" role="status" aria-live="polite">
            <div className="sycw-success-icon" aria-hidden="true">✓</div>
            <h3 className="sycw-step-heading">{copy.successHeading}</h3>
            <p className="sycw-step-hint">{copy.successBody}</p>

            {props.contact ? (
              <div className="sycw-contact-panel">
                <p className="sycw-contact-panel-label">{copy.successCtaLabel}</p>
                <div className="sycw-contact-actions">
                  {props.contact.phoneTel ? (
                    <a
                      href={`tel:${props.contact.phoneTel}`}
                      className="sycw-contact-link"
                    >
                      Call {props.contact.phoneDisplay || props.contact.phoneTel}
                    </a>
                  ) : null}
                  {props.contact.whatsappUrl ? (
                    <a
                      href={props.contact.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sycw-contact-link is-whatsapp"
                    >
                      WhatsApp
                    </a>
                  ) : null}
                  {props.contact.email ? (
                    <a href={`mailto:${props.contact.email}`} className="sycw-contact-link">
                      Email
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {trust.length && !props.infoPanel ? (
        <div className="sycw-trust">
          <p className="sycw-trust-heading">{copy.trustHeading}</p>
          <ul className="sycw-trust-list">
            {trust.map((item, index) => (
              <li key={index} className="sycw-trust-item">
                <span className="sycw-trust-tick" aria-hidden="true">✓</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );

  return (
    <section className={`sycw-root${props.className ? ` ${props.className}` : ""}${props.infoPanel ? " is-two-col" : ""}`}>
      {props.infoPanel ? (
        <div className="sycw-shell sycw-shell-two-col">
          <div className="sycw-info-column">{props.infoPanel}</div>
          {wizardColumn}
        </div>
      ) : (
        <div className="sycw-shell">{wizardColumn}</div>
      )}
    </section>
  );
}

export default SellYourCarWidget;
