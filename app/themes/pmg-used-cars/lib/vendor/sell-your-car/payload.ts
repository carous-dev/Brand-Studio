import type { LeadFormMeta } from "../hooks/useLeadsForm";
import type { LookupValuations, SellYourCarFormValues, VehicleLookupData } from "./types";
import { formatRegistration, formatValuationAmount, formatVehicleTitle } from "./format";

export type BuildSellYourCarLeadPayloadInput = {
  values: SellYourCarFormValues;
  meta: LeadFormMeta;
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
  const partExchangeAmount = valuations?.partExchange;
  const selectedValuationAmount =
    values.valuationType === "part-exchange" ? partExchangeAmount : tradePriceAmount;
  const selectedValuationQuoted =
    selectedValuationAmount !== null && selectedValuationAmount !== undefined
      ? formatValuationAmount(selectedValuationAmount)
      : "";
  const tradePriceQuoted =
    tradePriceAmount !== null && tradePriceAmount !== undefined
      ? formatValuationAmount(tradePriceAmount)
      : "";
  const partExchangeQuoted =
    partExchangeAmount !== null && partExchangeAmount !== undefined
      ? formatValuationAmount(partExchangeAmount)
      : "";

  const attached = [
    `Vehicle: ${vehicleTitle || "Not provided"}`,
    `Registration: ${normalizedRegistration || "Not provided"}`,
    `Mileage: ${mileage.trim() || "Not provided"}`,
    `Transmission: ${transmissionValue || "Not provided"}`,
    `Fuel Type: ${fuelTypeValue || "Not provided"}`,
    `Engine Size: ${engineSizeValue || "Not provided"}`,
    `VIN: ${vehicle?.vin || "Not provided"}`,
    `Colour: ${vehicle?.colour || "Not provided"}`,
    `Preferred contact: ${values.preferredContact || "Not provided"}`,
    `Valuation type: ${values.valuationType || "Not provided"}`,
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
    preferredContact: values.preferredContact,
    preferred_contact: values.preferredContact,
    subject: `Sell Your Car Valuation Request: ${normalizedRegistration || "Unknown"}`,
    message: composedMessage,
    submittedDetails: submittedDetails || undefined,
    url: values.url || undefined,
    leadType: meta.leadType || "sell-your-car",
    leadSource: meta.leadSource || "sell-your-car",
    leadOwner: meta.leadOwner,
    formTs: meta.formTs,
    recaptchaToken: meta.recaptchaToken,
    [meta.honeypotField]: meta.honeypotValue,
    vehicle: vehicleTitle || undefined,
    vehicle_name: vehicleTitle || undefined,
    tradePriceQuoted: tradePriceQuoted || undefined,
    tradePriceAmount: tradePriceAmount ?? undefined,
    valuationType: values.valuationType || undefined,
    valuation_type: values.valuationType || undefined,
    selectedValuation: selectedValuationQuoted || undefined,
    selected_valuation: selectedValuationQuoted || undefined,
    selectedValuationAmount: selectedValuationAmount ?? undefined,
    selected_valuation_amount: selectedValuationAmount ?? undefined,
    partExchangeValuation: partExchangeAmount ?? undefined,
    part_exchange_valuation: partExchangeAmount ?? undefined,
    consent: values.consent ? "Yes" : "No",
    vin: vehicle?.vin || undefined,
    make: vehicle?.make_name || undefined,
    model: vehicle?.model_name || undefined,
    derivative: vehicle?.derivative || undefined,
    year: vehicle?.year_of_manufacture || undefined,
    bodyType: vehicle?.body_type || undefined,
    body_type: vehicle?.body_type || undefined,
    fuelType: fuelTypeValue || undefined,
    transmission: transmissionValue || undefined,
    colour: vehicle?.colour || undefined,
    firstRegistrationDate: vehicle?.first_registration_date || undefined,
    first_registration_date: vehicle?.first_registration_date || undefined,
    vehicleDetails: {
      registration: normalizedRegistration || undefined,
      vin: vehicle?.vin || undefined,
      make: vehicle?.make_name || undefined,
      model: [vehicle?.model_name, vehicle?.derivative]
        .filter(Boolean)
        .join(" ")
        .trim() || undefined,
      mileage: mileage.trim() || undefined,
      valuationType: values.valuationType || undefined,
      selectedValuation: selectedValuationQuoted || undefined,
      selectedValuationAmount: selectedValuationAmount ?? undefined,
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
      preferredContact: values.preferredContact || undefined,
      consent: values.consent ? "Yes" : "No",
      price_label: "Online Guide Price Quoted",
      online_guide_price_quoted: tradePriceQuoted || undefined,
      trade_price: tradePriceQuoted || undefined,
      trade_price_amount: tradePriceAmount ?? undefined,
      part_exchange_price: partExchangeQuoted || undefined,
      part_exchange_price_amount: partExchangeAmount ?? undefined,
    },
  };
}
