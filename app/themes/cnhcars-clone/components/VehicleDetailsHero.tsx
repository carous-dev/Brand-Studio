"use client";

import {
  buildVehicleTitle,
  formatVehicleMileage,
  formatVehiclePrice,
  type VehicleDetailsData,
} from "./vehicle-data";
import LoaderSpinner from "./LoaderSpinner";
import Link from "next/link";
import { useBrand } from "../context/BrandClientWrapper";

type VehicleDetailsHeroProps = {
  vehicle: VehicleDetailsData | null;
  loading?: boolean;
};

const DEFAULT_SUBTITLE = "Vehicle specification details available on request.";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripRepeatedPrefix(derivative: string, make: string, model: string): string {
  let next = derivative.trim();
  if (!next) return "";

  if (make && model) {
    const makeModelPattern = new RegExp(
      `^${escapeRegExp(make)}\\s+${escapeRegExp(model)}\\b\\s*`,
      "i",
    );
    next = next.replace(makeModelPattern, "").trim();
  }

  if (model) {
    const modelPattern = new RegExp(`^${escapeRegExp(model)}\\b\\s*`, "i");
    next = next.replace(modelPattern, "").trim();
  }

  return next;
}

function stripMileageMentions(value: string): string {
  return value
    .replace(/\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\s*(?:miles?|mi)\b/gi, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s*[-|·,]\s*$/g, "")
    .trim();
}

function getHeroTitle(vehicle: VehicleDetailsData | null, fallback: string): string {
  if (!vehicle) return fallback;

  const year = vehicle.year ? String(vehicle.year).trim() : "";
  const make = String(vehicle.make ?? "").trim();
  const model = String(vehicle.model ?? "").trim();
  const derivative = stripRepeatedPrefix(String(vehicle.derivative ?? ""), make, model);

  const compactTitle = [year, make, model, derivative].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  const sanitizedCompactTitle = stripMileageMentions(compactTitle);
  if (sanitizedCompactTitle) return sanitizedCompactTitle;

  const fallbackTitle = buildVehicleTitle(vehicle, fallback);
  return stripMileageMentions(fallbackTitle) || fallback;
}

function getSubtitle(vehicle: VehicleDetailsData | null): string {
  if (!vehicle) return DEFAULT_SUBTITLE;

  const mileage = formatVehicleMileage(vehicle.mileage, "");
  const parts = [
    mileage,
    vehicle.fuelType,
    vehicle.transmission,
  ]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  return parts.join(" · ") || DEFAULT_SUBTITLE;
}

export default function VehicleDetailsHero({ vehicle, loading = false }: VehicleDetailsHeroProps) {
  const brand = useBrand();
  const brandName = brand?.name || "Our showroom";
  const defaultTitle = `${brandName} Used Vehicle`;
  const vehicleTitle = getHeroTitle(vehicle, defaultTitle);
  const subtitle = getSubtitle(vehicle);

  return (
    <section className="vehicle-details-hero-modern inventory-hero inventory-hero-dark">
      <div className="container">
        <div className="inventory-hero-dark-shell">
          <h1 className="inventory-hero-dark-title" data-aos="fade-up" data-aos-delay="60">
            {vehicleTitle}
          </h1>
          <p className="inventory-hero-dark-lead vehicle-details-hero-modern-lead" data-aos="fade-up" data-aos-delay="100">
            {loading ? <LoaderSpinner label="Loading vehicle details" size="sm" tone="light" /> : subtitle}
          </p>

          <div className="inventory-hero-dark-actions" data-aos="fade-up" data-aos-delay="150">
            <Link href="/sell-my-car" className="inventory-hero-dark-btn inventory-hero-dark-btn-secondary">
              Looking to sell?
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
