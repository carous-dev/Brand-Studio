"use client";

import { useId, useMemo, useState, type FormEvent } from "react";
import { useLeadsForm } from "../hooks/useLeadsForm";
import { calculateLoan, formatGBP, formatGBPDetailed } from "./formulas";
import { buildLoanLeadPayload, type LoanLeadValues, type LoanQuoteSnapshot } from "./payload";

export type LoanCalculatorCopy = {
  title?: string;
  subtitle?: string;
  priceLabel?: string;
  downPaymentLabel?: string;
  rateLabel?: string;
  termLabel?: string;
  monthlyLabel?: string;
  totalInterestLabel?: string;
  totalCostLabel?: string;
  disclaimer?: string;
};

export type LoanLeadCopy = {
  /** Text on the collapsed CTA button. Default "Email me this quote". */
  cta?: string;
  /** Prompt heading beside the collapsed CTA. */
  heading?: string;
  /** Prompt sub-line beside the collapsed CTA. */
  subheading?: string;
  namePlaceholder?: string;
  emailPlaceholder?: string;
  phonePlaceholder?: string;
  submitLabel?: string;
  submitLoadingLabel?: string;
  successHeading?: string;
  successBody?: string;
  footnote?: string;
};

/**
 * Opt-in soft gate. Pass this and the calculator sprouts an "email me this
 * quote" affordance under the result — the same live figures become a lead in
 * the dealer's pipeline. Omit it and the calculator behaves exactly as before
 * (pure estimator, no capture).
 */
export type LoanLeadConfig = {
  /** Lead-owner (dealerClientId). Falls back to NEXT_PUBLIC_CLIENT_ID. */
  leadOwner?: string;
  /** Override the leads endpoint. Falls back to NEXT_PUBLIC_LEADS_API_URL or /leads. */
  leadEndpoint?: string;
  leadType?: string;
  leadSource?: string;
  /** Brand name embedded in the lead subject + default copy. */
  brandName?: string;
  /** Also ask for a phone number (optional field). Default true. */
  collectPhone?: boolean;
  /** Host-app leads API resolver (e.g. so /leads → same-origin /api/leads). */
  resolveApiUrl?: (path: string) => string;
  copy?: LoanLeadCopy;
  onSubmitSuccess?: (response: unknown) => void;
};

export type LoanCalculatorWidgetProps = {
  /** Initial vehicle price (£). Default 15,000. */
  initialPrice?: number;
  /** Initial down payment (£). Default 0. */
  initialDownPayment?: number;
  /** Initial annual interest rate as a percent (e.g. 9.9 means 9.9% APR). */
  initialRate?: number;
  /** Initial loan term in months. Default 60. */
  initialTermMonths?: number;
  /** Brand-specific copy overrides. */
  copy?: LoanCalculatorCopy;
  /** Opt-in lead capture. Renders a soft gate under the result when set. */
  lead?: LoanLeadConfig;
};

const DEFAULTS = {
  price: 15000,
  downPayment: 0,
  rate: 9.9,
  termMonths: 60,
};

const DEFAULT_COPY: Required<LoanCalculatorCopy> = {
  title: "Loan calculator",
  subtitle: "Estimate monthly payments. Adjust any field — the figures update live.",
  priceLabel: "Vehicle price",
  downPaymentLabel: "Deposit",
  rateLabel: "APR",
  termLabel: "Term (months)",
  monthlyLabel: "Monthly payment",
  totalInterestLabel: "Total interest",
  totalCostLabel: "Total cost",
  disclaimer:
    "Estimate only. Figures are an illustration — not a quote or offer of finance. Final terms are subject to status, affordability and lender approval.",
};

function parseNumeric(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function LoanCalculatorWidget(props: LoanCalculatorWidgetProps) {
  const copy = { ...DEFAULT_COPY, ...(props.copy ?? {}) };

  const [price, setPrice] = useState<number>(props.initialPrice ?? DEFAULTS.price);
  const [downPayment, setDownPayment] = useState<number>(props.initialDownPayment ?? DEFAULTS.downPayment);
  const [rate, setRate] = useState<number>(props.initialRate ?? DEFAULTS.rate);
  const [termMonths, setTermMonths] = useState<number>(props.initialTermMonths ?? DEFAULTS.termMonths);

  const result = useMemo(
    () => calculateLoan({ price, downPayment, annualRatePercent: rate, termMonths }),
    [price, downPayment, rate, termMonths],
  );

  const hasResult = result.monthlyPayment > 0;

  return (
    <div className="lcw" role="region" aria-label={copy.title}>
      <header className="lcw-head">
        <h2 className="lcw-title">{copy.title}</h2>
        <p className="lcw-subtitle">{copy.subtitle}</p>
      </header>

      <div className="lcw-grid">
        <Field
          label={copy.priceLabel}
          prefix="£"
          value={price}
          onChange={(next) => setPrice(Math.max(0, next))}
          formatter={(v) => (v > 0 ? v.toLocaleString("en-GB") : "")}
        />
        <Field
          label={copy.downPaymentLabel}
          prefix="£"
          value={downPayment}
          onChange={(next) => setDownPayment(Math.max(0, Math.min(price, next)))}
          formatter={(v) => (v > 0 ? v.toLocaleString("en-GB") : "")}
        />
        <Field
          label={copy.rateLabel}
          suffix="%"
          value={rate}
          onChange={(next) => setRate(Math.max(0, Math.min(40, next)))}
          formatter={(v) => (v > 0 ? String(v) : "")}
          allowDecimal
        />
        <Field
          label={copy.termLabel}
          suffix="mo"
          value={termMonths}
          onChange={(next) => setTermMonths(Math.max(1, Math.min(144, Math.round(next))))}
          formatter={(v) => (v > 0 ? String(v) : "")}
        />
      </div>

      <div className="lcw-result" aria-live="polite">
        <div className="lcw-result-main">
          <span className="lcw-result-label">{copy.monthlyLabel}</span>
          <span className="lcw-result-value">{hasResult ? formatGBPDetailed(result.monthlyPayment) : "—"}</span>
        </div>
        <dl className="lcw-result-meta">
          <div>
            <dt>{copy.totalInterestLabel}</dt>
            <dd>{hasResult ? formatGBP(result.totalInterest) : "—"}</dd>
          </div>
          <div>
            <dt>{copy.totalCostLabel}</dt>
            <dd>{hasResult ? formatGBP(result.totalPaid) : "—"}</dd>
          </div>
        </dl>
      </div>

      {props.lead && hasResult ? (
        <LoanLeadGate
          lead={props.lead}
          snapshot={{
            price,
            downPayment,
            annualRatePercent: rate,
            termMonths,
            principal: result.principal,
            monthlyPayment: result.monthlyPayment,
            totalInterest: result.totalInterest,
            totalPaid: result.totalPaid,
          }}
        />
      ) : null}

      <p className="lcw-disclaimer">{copy.disclaimer}</p>
    </div>
  );
}

function LoanLeadGate({ lead, snapshot }: { lead: LoanLeadConfig; snapshot: LoanQuoteSnapshot }) {
  const idPrefix = useId();
  const [open, setOpen] = useState(false);
  const copy = lead.copy ?? {};
  const collectPhone = lead.collectPhone !== false;

  const form = useLeadsForm<LoanLeadValues>({
    initialValues: { name: "", email: "", phone: "" },
    widget: "loan-calculator",
    endpoint: lead.leadEndpoint,
    resolveApiUrl: lead.resolveApiUrl,
    leadOwner: lead.leadOwner,
    leadType: lead.leadType ?? "finance-quote",
    leadSource: lead.leadSource ?? "loan-calculator",
    honeypotField: "website",
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (value) => {
          const trimmed = String(value || "").trim();
          if (!trimmed) return null;
          return /\S+@\S+\.\S+/.test(trimmed) ? null : "Please enter a valid email.";
        },
      },
    },
    buildPayload: (values, meta) =>
      buildLoanLeadPayload({ values, meta, snapshot, brandName: lead.brandName }),
  });

  const isSuccess = form.status === "success";
  const isSubmitting = form.status === "submitting";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await form.submit();
    if (result.success) lead.onSubmitSuccess?.(result.response);
  };

  if (isSuccess) {
    return (
      <div className="lcw-gate is-success" role="status" aria-live="polite">
        <p className="lcw-gate-success-title">{copy.successHeading || "Sent — check your inbox."}</p>
        <p className="lcw-gate-success-body">
          {copy.successBody ||
            "We've emailed this illustration. A member of the team will follow up with real finance options."}
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="lcw-gate">
        <div className="lcw-gate-prompt">
          <div className="lcw-gate-copy">
            <p className="lcw-gate-heading">{copy.heading || "Want this in writing?"}</p>
            <p className="lcw-gate-sub">
              {copy.subheading ||
                "We'll email your illustration and follow up with finance options that fit."}
            </p>
          </div>
          <button type="button" className="lcw-gate-cta" onClick={() => setOpen(true)}>
            {copy.cta || "Email me this quote"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="lcw-gate is-form" onSubmit={handleSubmit} noValidate>
      <input type="text" {...form.honeypotProps} />
      <p className="lcw-gate-heading">{copy.heading || "Email me this quote"}</p>
      <div className="lcw-gate-fields">
        <label className="lcw-gate-field" htmlFor={`${idPrefix}-name`}>
          <span className="lcw-gate-label">Full name</span>
          <input
            id={`${idPrefix}-name`}
            type="text"
            autoComplete="name"
            required
            placeholder={copy.namePlaceholder || "e.g. Sarah Hughes"}
            aria-invalid={Boolean(form.errors.name)}
            {...form.getFieldProps("name")}
          />
          {form.errors.name ? <span className="lcw-gate-error">{form.errors.name}</span> : null}
        </label>

        <label className="lcw-gate-field" htmlFor={`${idPrefix}-email`}>
          <span className="lcw-gate-label">Email</span>
          <input
            id={`${idPrefix}-email`}
            type="email"
            autoComplete="email"
            required
            placeholder={copy.emailPlaceholder || "you@example.com"}
            aria-invalid={Boolean(form.errors.email)}
            {...form.getFieldProps("email")}
          />
          {form.errors.email ? <span className="lcw-gate-error">{form.errors.email}</span> : null}
        </label>

        {collectPhone ? (
          <label className="lcw-gate-field" htmlFor={`${idPrefix}-phone`}>
            <span className="lcw-gate-label">
              Phone <span className="lcw-gate-label-hint">(optional)</span>
            </span>
            <input
              id={`${idPrefix}-phone`}
              type="tel"
              autoComplete="tel"
              placeholder={copy.phonePlaceholder || "07123 456 789"}
              {...form.getFieldProps("phone")}
            />
          </label>
        ) : null}
      </div>

      {form.status === "error" && form.errorMessage ? (
        <p className="lcw-gate-feedback" role="alert">
          {form.errorMessage}
        </p>
      ) : null}

      <button type="submit" className="lcw-gate-cta" disabled={isSubmitting}>
        {isSubmitting ? copy.submitLoadingLabel || "Sending…" : copy.submitLabel || "Send my quote"}
      </button>

      <p className="lcw-gate-foot">
        {copy.footnote ||
          "No obligation. We'll only use your details to send this illustration and follow up."}
      </p>
    </form>
  );
}

type FieldProps = {
  label: string;
  value: number;
  onChange: (next: number) => void;
  prefix?: string;
  suffix?: string;
  formatter: (value: number) => string;
  allowDecimal?: boolean;
};

function Field({ label, value, onChange, prefix, suffix, formatter, allowDecimal }: FieldProps) {
  return (
    <label className="lcw-field">
      <span className="lcw-field-label">{label}</span>
      <span className="lcw-field-control">
        {prefix ? <span className="lcw-field-affix">{prefix}</span> : null}
        <input
          type="text"
          inputMode={allowDecimal ? "decimal" : "numeric"}
          value={formatter(value)}
          onChange={(event) => onChange(parseNumeric(event.target.value))}
          placeholder="0"
        />
        {suffix ? <span className="lcw-field-affix is-suffix">{suffix}</span> : null}
      </span>
    </label>
  );
}
