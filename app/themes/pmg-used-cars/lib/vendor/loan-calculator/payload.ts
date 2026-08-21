import type { LeadFormMeta } from "../hooks/useLeadsForm";
import { formatGBP, formatGBPDetailed } from "./formulas";

/**
 * Immutable snapshot of the figures on screen when the buyer asked us to email
 * the illustration. Captured at submit time so the lead carries the exact
 * numbers they were looking at.
 */
export type LoanQuoteSnapshot = {
  price: number;
  downPayment: number;
  annualRatePercent: number;
  termMonths: number;
  principal: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
};

export type LoanLeadValues = {
  name: string;
  email: string;
  phone: string;
};

export type BuildLoanLeadPayloadInput = {
  values: LoanLeadValues;
  meta: LeadFormMeta;
  snapshot: LoanQuoteSnapshot;
  /** Dealer brand name, surfaced in the lead subject. */
  brandName?: string;
  /** Page URL; falls back to window.location.href. */
  url?: string;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Shapes a finance-calculator lead so it lands in the same pipeline as
 * vehicle-enquiry / reserve captures, with the on-screen illustration attached
 * both as a readable message (for the dealer's inbox) and a structured
 * `financeQuote` block (for downstream tooling).
 */
export function buildLoanLeadPayload(input: BuildLoanLeadPayloadInput): Record<string, any> {
  const { values, meta, snapshot, brandName } = input;
  const url = input.url || (typeof window !== "undefined" ? window.location.href : "");

  const detailLines = [
    "FINANCE ILLUSTRATION REQUEST",
    `Vehicle price: ${formatGBP(snapshot.price)}`,
    `Deposit: ${formatGBP(snapshot.downPayment)}`,
    `Amount financed: ${formatGBP(snapshot.principal)}`,
    `APR: ${snapshot.annualRatePercent}%`,
    `Term: ${snapshot.termMonths} months`,
    `Monthly payment: ${formatGBPDetailed(snapshot.monthlyPayment)}`,
    `Total interest: ${formatGBP(snapshot.totalInterest)}`,
    `Total cost: ${formatGBP(snapshot.totalPaid)}`,
    url ? `Page: ${url}` : "",
  ].filter(Boolean);

  const message = [
    `${values.name || "A visitor"} asked us to email this finance illustration.`,
    "",
    ...detailLines,
    "",
    "Illustration only — not a quote or offer of finance.",
  ].join("\n");

  return {
    name: values.name,
    email: values.email,
    phone: values.phone || undefined,
    intent: "Finance quote",
    subject: `Finance illustration request${brandName ? ` — ${brandName}` : ""}`,
    message,
    submittedDetails: detailLines.join("\n"),
    permalink: url || undefined,
    url: url || undefined,
    leadType: meta.leadType || "finance-quote",
    leadSource: meta.leadSource || "loan-calculator",
    leadOwner: meta.leadOwner,
    formTs: meta.formTs,
    recaptchaToken: meta.recaptchaToken,
    [meta.honeypotField]: meta.honeypotValue,
    financeQuote: {
      price: snapshot.price,
      deposit: snapshot.downPayment,
      amountFinanced: snapshot.principal,
      aprPercent: snapshot.annualRatePercent,
      termMonths: snapshot.termMonths,
      monthlyPayment: round2(snapshot.monthlyPayment),
      totalInterest: round2(snapshot.totalInterest),
      totalCost: round2(snapshot.totalPaid),
    },
  };
}
