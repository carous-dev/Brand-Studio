/**
 * Standard amortization math for a fixed-rate loan.
 *
 * monthlyPayment = P * (r * (1 + r)^n) / ((1 + r)^n - 1)
 * where:
 *   P = principal (loan amount = price - down payment)
 *   r = monthly interest rate (annual rate / 12 / 100)
 *   n = number of months
 */

export type LoanInputs = {
  price: number;
  downPayment: number;
  annualRatePercent: number;
  termMonths: number;
};

export type LoanOutputs = {
  principal: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPaid: number;
};

export function calculateLoan({ price, downPayment, annualRatePercent, termMonths }: LoanInputs): LoanOutputs {
  const safePrice = Math.max(0, Number.isFinite(price) ? price : 0);
  const safeDown = Math.max(0, Math.min(safePrice, Number.isFinite(downPayment) ? downPayment : 0));
  const principal = safePrice - safeDown;
  const months = Math.max(1, Math.round(Number.isFinite(termMonths) ? termMonths : 0));
  const annualRate = Number.isFinite(annualRatePercent) ? annualRatePercent : 0;
  const monthlyRate = annualRate / 12 / 100;

  if (principal <= 0) {
    return { principal: 0, monthlyPayment: 0, totalInterest: 0, totalPaid: 0 };
  }

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    const growth = Math.pow(1 + monthlyRate, months);
    monthlyPayment = (principal * monthlyRate * growth) / (growth - 1);
  }

  const totalPaid = monthlyPayment * months;
  const totalInterest = totalPaid - principal;

  return {
    principal,
    monthlyPayment,
    totalInterest,
    totalPaid,
  };
}

export function formatGBP(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatGBPDetailed(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 2,
  }).format(value);
}
