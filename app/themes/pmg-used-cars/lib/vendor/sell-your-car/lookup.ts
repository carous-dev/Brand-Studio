import type { LookupResult, LookupValuations, VehicleLookupData } from "./types";
import { formatRegistration } from "./format";

type ExternalLookupWarning = {
  type?: string | null;
  feature?: string | null;
  message?: string | null;
};

type ExternalLookupVehicle = {
  registration?: string | null;
  vin?: string | null;
  make?: string | null;
  model?: string | null;
  derivative?: string | null;
  bodyType?: string | null;
  fuelType?: string | null;
  transmissionType?: string | null;
  colour?: string | null;
  firstRegistrationDate?: string | null;
  doors?: number | string | null;
  seats?: number | string | null;
  drivetrain?: string | null;
  engineCapacityCC?: number | string | null;
  enginePowerBHP?: number | string | null;
  enginePowerPS?: number | string | null;
  owners?: number | string | null;
  vehicleType?: string | null;
};

type ExternalLookupValuation = {
  amountGBP?: number | string | null;
  amountExcludingVatGBP?: number | string | null;
  amountNoVatGBP?: number | string | null;
};

type ExternalLookupValuations = {
  retail?: ExternalLookupValuation | null;
  trade?: ExternalLookupValuation | null;
  private?: ExternalLookupValuation | null;
  partExchange?: ExternalLookupValuation | null;
};

type ExternalLookupResponse = {
  warnings?: ExternalLookupWarning[] | null;
  vehicle?: ExternalLookupVehicle | null;
  valuations?: ExternalLookupValuations | null;
  message?: string | null;
  error?: string | null;
  data?: { vehicle?: ExternalLookupVehicle | null; valuations?: ExternalLookupValuations | null } & VehicleLookupData;
};

function yearFromRegistrationDate(value?: string | null): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})/);
  return match ? match[1] : null;
}

function mapExternalVehicle(vehicle: ExternalLookupVehicle): VehicleLookupData {
  return {
    vin: vehicle.vin ?? null,
    registration: vehicle.registration ?? null,
    derivative: vehicle.derivative ?? null,
    make_name: vehicle.make ?? null,
    model_name: vehicle.model ?? null,
    year_of_manufacture: yearFromRegistrationDate(vehicle.firstRegistrationDate),
    body_type: vehicle.bodyType ?? null,
    fuel_type: vehicle.fuelType ?? null,
    transmission_type: vehicle.transmissionType ?? null,
    colour: vehicle.colour ?? null,
    doors: vehicle.doors ?? null,
    seats: vehicle.seats ?? null,
    drivetrain: vehicle.drivetrain ?? null,
    engine_capacity_cc: vehicle.engineCapacityCC ?? null,
    engine_power_bhp: vehicle.enginePowerBHP ?? null,
    engine_power_ps: vehicle.enginePowerPS ?? null,
    owners: vehicle.owners ?? null,
    first_registration_date: vehicle.firstRegistrationDate ?? null,
    vehicle_type: vehicle.vehicleType ?? null,
  };
}

function extractValuationAmount(value?: ExternalLookupValuation | null): number | null {
  if (!value) return null;
  const candidates = [value.amountGBP, value.amountNoVatGBP, value.amountExcludingVatGBP];
  for (const raw of candidates) {
    if (raw === null || raw === undefined || raw === "") continue;
    const numeric = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(numeric)) return numeric;
  }
  return null;
}

function mapExternalValuations(valuations: ExternalLookupValuations): LookupValuations {
  return {
    retail: extractValuationAmount(valuations.retail),
    trade: extractValuationAmount(valuations.trade),
    private: extractValuationAmount(valuations.private),
    partExchange: extractValuationAmount(valuations.partExchange),
  };
}

export type LookupVehicleValuationOptions = {
  /** Endpoint URL. Required. */
  endpoint: string;
  /** UK registration plate (will be normalised). */
  registration: string;
  /** Mileage in miles. */
  mileage: number | string;
  /** Optional AbortSignal. */
  signal?: AbortSignal;
};

export async function lookupVehicleValuation(
  options: LookupVehicleValuationOptions,
): Promise<LookupResult> {
  const { endpoint, registration, mileage, signal } = options;

  if (!endpoint) {
    throw new Error("Vehicle lookup endpoint is not configured.");
  }

  const normalizedRegistration = formatRegistration(registration);
  if (!normalizedRegistration) {
    throw new Error("Enter a valid registration plate.");
  }

  const mileageInt =
    typeof mileage === "number" ? Math.round(mileage) : Number.parseInt(String(mileage).replace(/[^0-9]/g, ""), 10);
  if (!Number.isFinite(mileageInt) || mileageInt < 0) {
    throw new Error("Enter a valid mileage figure.");
  }

  let lookupUrl: string;
  try {
    const base = typeof window !== "undefined" ? window.location.origin : undefined;
    lookupUrl = new URL(endpoint, base).toString();
  } catch {
    throw new Error("Vehicle lookup URL is invalid.");
  }

  const response = await fetch(lookupUrl, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reg: normalizedRegistration, mileage: mileageInt }),
    signal,
  });

  const payload = (await response.json().catch(() => ({}))) as ExternalLookupResponse;

  const errorWarning = payload.warnings?.find((item) => item?.type?.toUpperCase() === "ERROR");
  if (errorWarning?.message) {
    throw new Error(errorWarning.message);
  }

  const rawVehicle = payload.vehicle ?? payload.data;
  const mappedVehicle = rawVehicle
    ? mapExternalVehicle(rawVehicle as ExternalLookupVehicle)
    : null;

  if (!response.ok || !mappedVehicle) {
    throw new Error(payload.message || payload.error || "Vehicle not found.");
  }

  const rawValuations = payload.valuations ?? payload.data?.valuations;
  const mappedValuations = rawValuations ? mapExternalValuations(rawValuations) : null;

  return { vehicle: mappedVehicle, valuations: mappedValuations };
}
