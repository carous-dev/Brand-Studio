import type { VehicleLookupData } from "./types";

export function formatRegistration(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
}

export function formatRegistrationDisplay(value: string): string {
  const stripped = formatRegistration(value);
  if (stripped.length <= 4) return stripped;
  return `${stripped.slice(0, stripped.length - 3)} ${stripped.slice(-3)}`;
}

export function formatMileage(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^0-9]/g, ""));
  if (!Number.isFinite(numeric)) return "";
  return new Intl.NumberFormat("en-GB").format(numeric);
}

export function formatValuationAmount(
  value: number | null | undefined,
  fallback = "On request",
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return fallback;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatVehicleTitle(vehicle: VehicleLookupData): string {
  const year = String(vehicle.year_of_manufacture ?? "").trim();
  const make = String(vehicle.make_name ?? "").trim();
  const model = String(vehicle.model_name ?? "").trim();
  const derivative = String(vehicle.derivative ?? "").trim();
  return [year, make, model, derivative].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}

export function formatVehicleSubtitle(vehicle: VehicleLookupData): string {
  const parts = [
    vehicle.fuel_type,
    vehicle.transmission_type,
    vehicle.body_type,
    vehicle.colour,
  ]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean);
  return parts.join(" • ");
}
