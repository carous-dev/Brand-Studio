import type { LookupValuations, SellYourCarFormValues, VehicleLookupData } from "./types";
import { formatRegistration, formatValuationAmount, formatVehicleTitle } from "./format";

/**
 * Subset of LeadFormMeta exposed by brandstudio's `useLeadsForm`. Mirrors the
 * carous-platform shape but tracks only fields we read in the payload.
 */
export type SellYourCarLeadMeta = {
  formTs: number;
  honeypotField: string;
  honeypotValue: string;
  recaptchaToken?: string | null;
  leadType?: string;
  leadSource?: string;
  leadOwner?: string;
};

export type BuildSellYourCarLeadPayloadInput = {
  values: SellYourCarFormValues;
  meta: SellYourCarLeadMeta;
  registration: string;
  mileage: string;
  vehicle: VehicleLookupData | null;
  valuations: LookupValuations | null;
};

export function buildSellYourCarLeadPayload(input: BuildSellYourCarLeadPayloadInput): Record<string, any> {
  const { values, meta, registration, mileage, vehicle, valuations } = input;
  const normalizedRegistration = formatRegistration(registration);
  const vehicleTitle = vehicle ? formatVehicleTitle(vehicle) : "";

  const transmissionValue = String(vehicle?.transmission_type ?? "").trim();
  const fuelTypeValue = String(vehicle?.fuel_type ?? "").trim();
  const engineCapacityValue = String(vehicle?.engine_capacity_cc ?? "").trim();
  const engineSizeValue = engineCapacityValue ? `${engineCapacityValue}cc` : "";

  const tradePriceAmount = valuations?.trade;
  const tradePriceQuoted =
    tradePriceAmount !== null && tradePriceAmount !== undefined
      ? formatValuationAmount(tradePriceAmount)
      : "";

  const attached = [
    `Vehicle: ${vehicleTitle || "Not provided"}`,
    `Registration: ${normalizedRegistration || "Not provided"}`,
    `Mileage: ${mileage.trim() || "Not provided"}`,
    `Transmission: ${transmissionValue || "Not provided"}`,
    `Fuel Type: ${fuelTypeValue || "Not provided"}`,
    `Engine Size: ${engineSizeValue || "Not provided"}`,
    `Condition: ${values.condition || "Not provided"}`,
    `Outstanding finance: ${values.finance || "Not provided"}`,
    `Expected price: ${values.expectedPrice?.trim() || "Not provided"}`,
  ];
  const submittedDetails = attached.join("\n");

  const composedMessage = values.notes?.trim() || "No additional message provided.";

  return {
    name: values.name,
    email: values.email,
    phone: values.phone,
    subject: `Sell Your Car Valuation Request: ${normalizedRegistration || "Unknown"}`,
    message: composedMessage,
    submittedDetails: submittedDetails || undefined,
    leadType: meta.leadType || "sell-your-car",
    leadSource: meta.leadSource || "sell-your-car",
    leadOwner: meta.leadOwner,
    formTs: meta.formTs,
    recaptchaToken: meta.recaptchaToken,
    [meta.honeypotField]: meta.honeypotValue,
    vehicle: vehicleTitle || undefined,
    tradePriceQuoted: tradePriceQuoted || undefined,
    tradePriceAmount: tradePriceAmount ?? undefined,
    vehicleDetails: {
      registration: normalizedRegistration || undefined,
      make: vehicle?.make_name || undefined,
      model: [vehicle?.model_name, vehicle?.derivative]
        .filter(Boolean)
        .join(" ")
        .trim() || undefined,
      mileage: mileage.trim() || undefined,
      transmission: transmissionValue || undefined,
      transmission_type: transmissionValue || undefined,
      trans: transmissionValue || undefined,
      fuel_type: fuelTypeValue || undefined,
      fuelType: fuelTypeValue || undefined,
      fuel: fuelTypeValue || undefined,
      engine_size: engineSizeValue || undefined,
      engineSize: engineSizeValue || undefined,
      engine_capacity_cc: engineCapacityValue || undefined,
      engineCapacity: engineSizeValue || undefined,
      condition: values.condition || undefined,
      price_label: "Online Guide Price Quoted",
      online_guide_price_quoted: tradePriceQuoted || undefined,
      trade_price: tradePriceQuoted || undefined,
      trade_price_amount: tradePriceAmount ?? undefined,
    },
  };
}
