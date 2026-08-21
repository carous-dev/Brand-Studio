"use client";

export type DefaultInfoStep = {
  number: string;
  title: string;
  body: string;
};

export type DefaultInfoPanelProps = {
  /** Brand name embedded into the default benefits heading. */
  brandName?: string;
  /** Heading above the steps. Defaults to "How It Works". */
  heading?: string;
  /** Intro paragraph below the heading. */
  intro?: string;
  /** Step cards. Defaults to the 3-step Find / Complete / Receive flow. */
  steps?: DefaultInfoStep[];
  /** Heading above the benefits checklist. Defaults to "Why sell to {brandName}?". */
  benefitsHeading?: string;
  /** Benefit lines. Defaults to the dealer-backed selling proposition. */
  benefits?: string[];
};

const DEFAULT_STEPS: DefaultInfoStep[] = [
  {
    number: "01",
    title: "Find Your Vehicle",
    body: "Enter registration and mileage so we can match key vehicle details instantly.",
  },
  {
    number: "02",
    title: "Complete Your Details",
    body: "Once matched, add your contact information and vehicle condition details in one form.",
  },
  {
    number: "03",
    title: "Receive A Fair Offer",
    body: "Our team reviews your request and contacts you with valuation guidance and next-step options.",
  },
];

const DEFAULT_BENEFITS = [
  "Professional, friendly and hassle-free process",
  "Dealer-backed valuation from an experienced local team",
  "Part exchange options available",
  "Appointment-led handover planning",
];

export function DefaultInfoPanel({
  brandName,
  heading = "How It Works",
  intro = "We keep the process quick, clear and dealer-backed so you can move on your next vehicle without unnecessary delays.",
  steps = DEFAULT_STEPS,
  benefitsHeading,
  benefits = DEFAULT_BENEFITS,
}: DefaultInfoPanelProps) {
  const resolvedBenefitsHeading =
    benefitsHeading ?? `Why sell to ${brandName ?? "us"}?`;

  return (
    <div className="sycw-info-panel">
      <header className="sycw-info-head">
        <h2>{heading}</h2>
        <p>{intro}</p>
      </header>

      <div className="sycw-info-steps">
        {steps.map((step) => (
          <article key={step.number} className="sycw-info-step">
            <span className="sycw-info-step-number">{step.number}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="sycw-info-benefits">
        <h3>{resolvedBenefitsHeading}</h3>
        <ul>
          {benefits.map((benefit) => (
            <li key={benefit}>
              <span aria-hidden="true">✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
