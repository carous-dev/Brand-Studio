import type { ReactNode } from "react";

export type VehicleLookupData = {
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

export type LookupValuations = {
  retail?: number | null;
  trade?: number | null;
  private?: number | null;
  partExchange?: number | null;
};

export type LookupResult = {
  vehicle: VehicleLookupData;
  valuations: LookupValuations | null;
};

export type LookupState =
  | { status: "idle"; message: ""; vehicle: null; valuations: null }
  | { status: "loading"; message: string; vehicle: null; valuations: null }
  | { status: "error"; message: string; vehicle: null; valuations: null }
  | {
      status: "success";
      message: string;
      vehicle: VehicleLookupData;
      valuations: LookupValuations | null;
    };

export type SellYourCarFormValues = {
  name: string;
  phone: string;
  email: string;
  preferredContact: string;
  valuationType: string;
  condition: string;
  finance: string;
  expectedPrice: string;
  notes: string;
  consent: boolean;
  url: string;
};

export type SellYourCarCopy = {
  /** Title displayed inside the wizard card. */
  cardTitle?: string;
  /** Subtitle below the card title. */
  cardSubtitle?: string;
  /** Step labels shown in the progress strip. */
  stepIdentify?: string;
  stepValuation?: string;
  stepDetails?: string;
  /** Copy for the Identify step. */
  identifyHeading?: string;
  identifyHint?: string;
  identifyCta?: string;
  identifyCtaLoading?: string;
  /** Copy for the Valuation step. */
  valuationHeading?: string;
  valuationSubheading?: string;
  valuationDisclaimer?: string;
  valuationContinueCta?: string;
  /** Copy for the Details step. */
  detailsHeading?: string;
  detailsSubheading?: string;
  detailsSubmitCta?: string;
  detailsSubmitLoadingCta?: string;
  /** Success state. */
  successHeading?: string;
  successBody?: string;
  successCtaLabel?: string;
  /** Trust headline above the trust bullets. */
  trustHeading?: string;
  /** Consent copy shown before submission. */
  consentLabel?: string;
};

export type SellYourCarTrustItem = {
  icon?: ReactNode;
  text: string;
};

export type SellYourCarFieldsConfig = {
  /** Hide the condition select. */
  hideCondition?: boolean;
  /** Hide the outstanding-finance select. */
  hideFinance?: boolean;
  /** Hide the expected-price input. */
  hideExpectedPrice?: boolean;
  /** Hide the notes textarea. */
  hideNotes?: boolean;
  /** Hide the preferred-contact select. */
  hidePreferredContact?: boolean;
  /** Hide the consent checkbox. */
  hideConsent?: boolean;
  /** Override the condition select options. */
  conditionOptions?: Array<{ value: string; label: string }>;
  /** Override the finance select options. */
  financeOptions?: Array<{ value: string; label: string }>;
  /** Override the preferred-contact select options. */
  preferredContactOptions?: Array<{ value: string; label: string }>;
};

export type SellYourCarContactPanel = {
  phoneTel?: string;
  phoneDisplay?: string;
  whatsappUrl?: string;
  email?: string;
};

export type SellYourCarConfig = {
  /** Lead-owner string sent with the lead payload. Defaults to undefined. */
  leadOwner?: string;
  /** Lookup endpoint URL. Defaults to `/api/lookup`, which the platform Next.js rewrite proxies to `${CAROUS_API_PROXY_TARGET}/lookup`. */
  lookupEndpoint?: string;
  /** Override the lead submission endpoint. Falls back to the platform default. */
  leadEndpoint?: string;
  /** Override the lead-type/lead-source strings. */
  leadType?: string;
  leadSource?: string;
  /** Customisable copy strings. */
  copy?: SellYourCarCopy;
  /** Field visibility / option overrides. */
  fields?: SellYourCarFieldsConfig;
  /** Trust bullets shown beneath the wizard. */
  trust?: SellYourCarTrustItem[];
  /** Contact panel shown in the success state. */
  contact?: SellYourCarContactPanel;
  /** Optional className applied to the outermost section. */
  className?: string;
  /** Optional brand label embedded in the success message. */
  brandName?: string;
  /** Disable browser restore for abandoned in-progress valuation journeys. */
  persistProgress?: boolean;
  /** Optional localStorage key override for saved in-progress valuation journeys. */
  persistenceKey?: string;
  /**
   * When provided the widget renders in a 2-column layout: this node fills the
   * (wider) left column for marketing/how-it-works copy, and the wizard fills
   * the right column. Without this prop the widget renders single-column.
   */
  infoPanel?: ReactNode;
  /** Hooks for analytics — called on successful lookup / submission. */
  onLookupSuccess?: (result: LookupResult) => void;
  onSubmitSuccess?: (response: unknown) => void;
};
