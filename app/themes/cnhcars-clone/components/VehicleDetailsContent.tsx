"use client";

// audit-ignore-file: a11y-div-as-button — gallery thumbnail strip + modal
// backdrop use <div onClick>; modal handles keyboard and focus elsewhere.
// Inherited from cnhcars source app. Phase 8 followup to switch thumbs to
// <button type="button"> with role="tab" on the strip.
import AppIcon from "./AppIcon";
import Link from "next/link";
import { Cog, Fuel, Gauge, Tag } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  type CSSProperties,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  TouchEvent as ReactTouchEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import LoaderSpinner from "./LoaderSpinner";
import {
  buildVehicleTitle,
  formatVehicleMileage,
  formatVehiclePrice,
  type VehicleDetailsData,
} from "./vehicle-data";
import { useLeadsForm } from "../lib/use-leads-form";
import { companyProfile } from "../data/profile";
import { isValidUkPhone } from "../lib/uk-phone";
import { apiUrl } from "../lib/api";
import { buildVehiclePermalink, getVehicleBasePath } from "../lib/vehicle-links";
import { VehicleViewTracker } from "../lib/vehicle-views-stub";
import {
  openExternalReservation,
  openExternalVehicleEnquiry,
  useExternalVehicleGallery,
  useExternalWhatsAppEnquiryScope,
  type ExternalVehicleEnquirySummary,
  type ExternalWhatsAppEnquirySubject,
} from "../lib/external-widgets";
import { getVehicleType } from "../lib/vehicle-type";
import "../styles/similar.css";

type GalleryImage = {
  src: string;
  alt: string;
  thumbAlt: string;
  thumbDelay: number;
};

type SimilarVehicleCard = {
  id: string;
  reg?: string;
  registration?: string;
  make?: string;
  model?: string;
  derivative?: string;
  year?: number;
  price?: number;
  mileage?: number;
  image?: string;
  images?: string[];
  fuel?: string;
  transmission?: string;
  body_type?: string;
  vehicle_type?: string;
  slug?: string;
};

type VehicleDetailsContentProps = {
  vehicle: VehicleDetailsData | null;
  loading?: boolean;
  error?: string;
};

type VehicleEnquiryFormValues = {
  vehicle: string;
  url: string;
  name: string;
  email: string;
  phone: string;
  postcode: string;
  contact_method: string;
  best_time: string;
  finance: string;
  part_exchange: string;
  message: string;
};

const SWIPE_THRESHOLD = 48;
const MAX_VISIBLE_GALLERY_THUMBS = 5;
const OVERVIEW_PREVIEW_CHAR_LIMIT = 280;
const COMPARE_STORAGE_PREFIX = "vp-vehicle-compare:";
const MAX_COMPARE_VEHICLES = 3;
const DEFAULT_FEATURES = [
  "Virtual cockpit display",
  "Satellite navigation",
  "Heated front seats",
  "Rear parking camera",
  "LED headlights",
  "Apple CarPlay / Android Auto",
  "Dual-zone climate control",
  "Cruise control",
];
const SIMILAR_IMAGE_FALLBACK = "/images/IMG_6479.png";

const companyPhoneText = companyProfile.location.phone;
const companyPhoneHref = companyPhoneText.replace(/[^\d+]/g, "");
const companyOpeningHoursPrimary =
  companyProfile.openingHours[0]
    ? `${companyProfile.openingHours[0].day}: ${companyProfile.openingHours[0].hours}`
    : "Opening times available on request";

function normalizeIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return (index + count) % count;
}

function formatCount(value: number): string {
  return String(value).padStart(2, "0");
}

function formatTextValue(value: string | number | null | undefined, fallback = "On request"): string {
  if (value === null || value === undefined) return fallback;
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : fallback;
}

function formatNumberValue(
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = { maximumFractionDigits: 0 },
  fallback = "On request",
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback;
  try {
    return new Intl.NumberFormat("en-GB", options).format(value);
  } catch {
    return fallback;
  }
}

function formatDateValue(value: string | null | undefined, fallback = "On request"): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return formatTextValue(value, fallback);
  return new Intl.DateTimeFormat("en-GB").format(parsed);
}

function formatDateTimeValue(value: string | null | undefined, fallback = "On request"): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return formatTextValue(value, fallback);
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function formatSpecValue(name: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return formatTextValue(value, "On request");

  const alreadyCalibrated = /[a-zA-Z%\u00A3/\u00B0]/.test(trimmed);
  if (alreadyCalibrated) return trimmed;

  const normalizedValue = trimmed.replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(normalizedValue)) return trimmed;

  const label = name.toLowerCase();
  const numeric = Number(normalizedValue);

  if (label.includes("cylinder") || label.includes("seat") || label.includes("door")) return trimmed;
  if (label.includes("mpg") || label.includes("miles per gallon") || label.includes("fuel economy")) return `${trimmed} mpg`;
  if (label.includes("co2") || label.includes("emission")) return `${trimmed} g/km`;
  if (label.includes("bhp") || label.includes("power")) return `${trimmed} bhp`;
  if (label.includes("torque")) return `${trimmed} Nm`;
  if (label.includes("0-60") || label.includes("0-62") || label.includes("acceleration")) return `${trimmed} s`;
  if (label.includes("top speed") || label.includes("speed")) return `${trimmed} mph`;
  if (label.includes("weight") || label.includes("mass")) return `${trimmed} kg`;
  if (label.includes("length") || label.includes("width") || label.includes("height") || label.includes("wheelbase")) {
    return `${trimmed} mm`;
  }
  if (label.includes("engine") && (label.includes("capacity") || label.includes("displacement"))) {
    if (Number.isFinite(numeric) && numeric < 20) return `${trimmed} L`;
    return `${trimmed} cc`;
  }
  if (label.includes("boot") || label.includes("space") || label.includes("capacity") || label.includes("volume")) {
    return `${trimmed} L`;
  }

  return trimmed;
}

function formatBooleanValue(value: boolean | null | undefined, fallback = "On request"): string {
  if (value === null || value === undefined) return fallback;
  return value ? "Yes" : "No";
}

function toTitleCase(value: string): string {
  return value
    .split(/\s+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
function toSafeCssUrl(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function cleanText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildGalleryImages(vehicle: VehicleDetailsData | null): string[] {
  if (!vehicle) return [];

  return Array.isArray(vehicle.images)
    ? vehicle.images
      .map((value) => cleanText(value))
      .filter((value) => value.length > 0)
    : [];
}

function splitPreviewText(text: string, limit: number): { preview: string; remainder: string } {
  const normalized = text.trim();
  if (normalized.length <= limit) {
    return { preview: normalized, remainder: "" };
  }

  const safeCutoff = Math.max(80, Math.floor(limit * 0.6));
  const lastSpaceBeforeLimit = normalized.lastIndexOf(" ", limit);
  const cutoff = lastSpaceBeforeLimit >= safeCutoff ? lastSpaceBeforeLimit : limit;

  return {
    preview: normalized.slice(0, cutoff).trimEnd(),
    remainder: normalized.slice(cutoff).trimStart(),
  };
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(text);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();

    try {
      const copied = document.execCommand("copy");
      document.body.removeChild(helper);
      if (!copied) {
        reject(new Error("Copy command failed"));
        return;
      }

      resolve();
    } catch (error) {
      document.body.removeChild(helper);
      reject(error);
    }
  });
}

function formatEngine(vehicle: VehicleDetailsData | null): string {
  if (!vehicle) return "Engine on request";

  const capacityCc = vehicle.engineCapacityCc;
  const bhp = vehicle.enginePowerBhp;
  const capacityText = capacityCc && Number.isFinite(capacityCc) ? `${(capacityCc / 1000).toFixed(1)}L` : "";
  const bhpText = bhp && Number.isFinite(bhp) ? `${Math.round(bhp)} BHP` : "";
  const output = [capacityText, bhpText].filter(Boolean).join(" · ");
  return output || "Engine on request";
}

function estimateMonthlyFromPrice(price: number | null): string {
  if (price === null || !Number.isFinite(price)) return "Enquire";
  const estimate = Math.max(99, Math.round(price / 60));
  return formatVehiclePrice(estimate, "Enquire");
}

function toText(value: unknown): string {
  return String(value ?? "").trim();
}

function toNumberOrNull(value: unknown): number | null {
  const number = Number(String(value ?? "").trim());
  return Number.isFinite(number) ? number : null;
}

function slugifyParts(...parts: Array<string | number | null | undefined>): string {
  return parts
    .filter((part) => part !== null && part !== undefined && String(part).trim().length > 0)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeSavedVehiclePath(path: string): string {
  const withoutQuery = String(path || "").split("?")[0].split("#")[0].trim();
  if (!withoutQuery) return "";

  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  if (withLeadingSlash === "/") return "/";

  return withLeadingSlash.replace(/\/+$/, "");
}

function normalizeRegistrationIdentifier(value: unknown): string {
  const raw = toText(value);
  if (!raw) return "";
  return raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

function getLegacyStorageKey(storageKey: string): string {
  const separatorIndex = storageKey.indexOf(":");
  if (separatorIndex < 0) return "";

  const prefix = storageKey.slice(0, separatorIndex + 1);
  const path = storageKey.slice(separatorIndex + 1);
  if (!path || path === "/" || path.endsWith("/")) return "";

  return `${prefix}${path}/`;
}

function readStoredFlag(storageKey: string): boolean {
  if (!storageKey) return false;

  try {
    if (window.localStorage.getItem(storageKey) === "1") return true;
    const legacyKey = getLegacyStorageKey(storageKey);
    return legacyKey ? window.localStorage.getItem(legacyKey) === "1" : false;
  } catch {
    return false;
  }
}

function writeStoredFlag(storageKey: string, next: boolean): void {
  if (!storageKey) return;

  window.localStorage.setItem(storageKey, next ? "1" : "0");

  const legacyKey = getLegacyStorageKey(storageKey);
  if (legacyKey) {
    // Clear legacy key variants so counters don't drift.
    window.localStorage.setItem(legacyKey, "0");
  }
}

function getStoredFlagCount(prefix: string): number {
  try {
    const savedPaths = new Set<string>();
    const keys = Object.keys(window.localStorage);

    for (const key of keys) {
      if (!key.startsWith(prefix)) continue;
      if (window.localStorage.getItem(key) !== "1") continue;

      const normalizedPath = normalizeSavedVehiclePath(key.slice(prefix.length));
      if (
        !normalizedPath.startsWith("/used-cars/") &&
        !normalizedPath.startsWith("/used-vans/") &&
        !normalizedPath.startsWith("/inventory/")
      ) continue;
      savedPaths.add(normalizedPath);
    }

    return savedPaths.size;
  } catch {
    return 0;
  }
}

function normalizeSimilarImageUrl(url?: string): string {
  if (!url) return "";
  try {
    let normalized = String(url);
    normalized = normalized.replace(/%7Bresize%7D/gi, "{resize}");
    normalized = normalized.replace(/%7bresize%7d/gi, "{resize}");
    return normalized.replace(/\/(?:\d+x\d+|\{resize\})\//g, "/");
  } catch {
    return String(url);
  }
}

function formatSimilarText(value: unknown): string {
  const text = toText(value);
  if (!text) return "-";
  if (text.toLowerCase().includes("on request")) return "-";
  return text;
}

function formatSimilarMileage(value?: number): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";
  return `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value)} mi`;
}

function formatSimilarPrice(value?: number): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "Enquire";
  return formatVehiclePrice(Math.round(value), "Enquire");
}

function getSimilarTitle(item: SimilarVehicleCard): string {
  const title = [item.year, item.make, item.model]
    .map((part) => (part === null || part === undefined ? "" : String(part).trim()))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return title || "Used Vehicle";
}

function normalizeSimilarVehicleCard(raw: unknown, index: number): SimilarVehicleCard | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const row = raw as Record<string, unknown>;
  const make = toText(row.make);
  const model = toText(row.model);
  const derivative = toText(row.derivative);
  const year = toNumberOrNull(row.year) ?? toNumberOrNull(row.year_of_manufacture);
  const reg = toText(row.registration || row.reg || row.vin);
  const slug =
    toText(row.slug || row.derivative_slug) || slugifyParts(make, model, derivative, reg || `vehicle-${index + 1}`);
  const id = normalizeRegistrationIdentifier(reg) || slug || `similar-${index + 1}`;
  const images = Array.isArray(row.images)
    ? (row.images as unknown[]).map((value) => toText(value)).filter(Boolean)
    : [];
  const image = toText(row.image) || images[0] || SIMILAR_IMAGE_FALLBACK;

  const mileageValue = toNumberOrNull(row.mileage) ?? toNumberOrNull(row.odometer_reading_miles);
  const trans = toText(row.trans || row.transmission || row.transmission_type);
  const fuel = toText(row.fuel || row.fuel_type);
  const priceValue = toNumberOrNull(row.price) ?? toNumberOrNull(row.forecourt_price_gbp);
  const bodyType = toText(row.body_type || row.bodyType || row.body);
  const vehicleType = toText(row.vehicle_type || row.vehicleType);

  return {
    id,
    reg,
    registration: reg,
    make,
    model,
    derivative,
    year: year ?? undefined,
    price: priceValue ?? undefined,
    mileage: mileageValue ?? undefined,
    image,
    images,
    fuel,
    transmission: trans,
    body_type: bodyType,
    vehicle_type: vehicleType,
    slug,
  };
}

function getSimilarImage(item: SimilarVehicleCard): string {
  const image = Array.isArray(item.images) && item.images.length ? item.images[0] : item.image;
  const normalized = normalizeSimilarImageUrl(image || SIMILAR_IMAGE_FALLBACK);
  return normalized || SIMILAR_IMAGE_FALLBACK;
}

function getSimilarHref(item: SimilarVehicleCard): string {
  return buildVehiclePermalink(item, "/used-stock");
}

function resolveSimilarVehicleType(pathname: string, currentPathname: string, vehicleBasePath: string): "" | "car" | "van" {
  const resolvedPath = pathname || currentPathname;
  if (resolvedPath.startsWith("/used-vans")) return "van";
  if (resolvedPath.startsWith("/used-cars")) return "car";
  if (vehicleBasePath === "/used-vans") return "van";
  if (vehicleBasePath === "/used-cars") return "car";
  return "";
}

function matchesSimilarVehicleType(item: SimilarVehicleCard, filterType: "" | "car" | "van"): boolean {
  if (!filterType) return true;
  return getVehicleType({
    vehicle_type: item.vehicle_type,
    body_type: item.body_type,
    make: item.make,
    model: item.model,
    derivative: item.derivative,
  }) === filterType;
}

export default function VehicleDetailsContent({
  vehicle,
  loading = false,
  error = "",
}: VehicleDetailsContentProps) {
  const pathname = usePathname?.() || "";
  const vehicleTitle = buildVehicleTitle(vehicle, `${companyProfile.name} Used Vehicle`);
  const whatsappEnquirySubject = useMemo<ExternalWhatsAppEnquirySubject | null>(
    () =>
      vehicle
        ? {
            dealerName: companyProfile.name,
            pageTitle: vehicleTitle,
            pageUrl: pathname || null,
            defaultIntentId: "availability",
            launcherLabel: "Vehicle enquiry",
            panelTitle: "Vehicle enquiry",
            panelDescription: "Ask about this vehicle, availability, finance, or part exchange.",
            vehicle: {
              label: vehicleTitle,
              year: vehicle.year ?? null,
              make: vehicle.make ?? null,
              model: vehicle.model ?? null,
              derivative: vehicle.derivative ?? null,
              registration: vehicle.registration ?? null,
              slug: vehicle.slug ?? null,
              price: vehicle.price ?? null,
              mileage: vehicle.mileage ?? null,
              fuel: vehicle.fuelType ?? null,
              transmission: vehicle.transmission ?? null,
              bodyType: vehicle.bodyType ?? null,
              colour: vehicle.colour ?? null,
            },
          }
        : null,
    [pathname, vehicle, vehicleTitle],
  );
  useExternalWhatsAppEnquiryScope(whatsappEnquirySubject);
  const vehicleViewSubject = useMemo(
    () =>
      vehicle
        ? {
            advertId: null,
            vehicleKey: vehicle.vin || vehicle.registration || vehicle.slug || null,
            slug: vehicle.slug || null,
            registration: vehicle.registration || null,
            vin: vehicle.vin || null,
            label: vehicleTitle,
            path: pathname || null,
          }
        : null,
    [pathname, vehicle, vehicleTitle],
  );
  const vehicleSummaryTitle = useMemo(() => {
    const titleParts = [vehicle?.year, vehicle?.make, vehicle?.model]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean);

    return titleParts.join(" ") || vehicleTitle;
  }, [vehicle?.year, vehicle?.make, vehicle?.model, vehicleTitle]);
  const vehiclePrice = formatVehiclePrice(vehicle?.price ?? null, "Enquire");
  const vehicleMonthly = estimateMonthlyFromPrice(vehicle?.price ?? null);
  const featureItems = vehicle?.features?.length ? vehicle.features : DEFAULT_FEATURES;
  const overviewLeadText = loading
    ? "Loading vehicle details..."
    : vehicle?.description || "Vehicle description available on request.";
  const overviewTailText =
    "It offers confident performance, a smooth drive, and practical everyday comfort. Full pre-delivery checks are complete and the car is ready to drive away.";
  const overviewCombinedText = [overviewLeadText, loading ? "" : overviewTailText].filter(Boolean).join(" ");
  const { preview: overviewPreviewText, remainder: overviewRemainderText } = useMemo(
    () => splitPreviewText(overviewCombinedText, OVERVIEW_PREVIEW_CHAR_LIMIT),
    [overviewCombinedText],
  );
  const hasOverviewRemainder = overviewRemainderText.length > 0;
  const galleryImages = useMemo<GalleryImage[]>(() => {
    const sources = buildGalleryImages(vehicle);
    return sources.map((source, index) => ({
      src: source,
      alt: `${vehicleTitle} image ${index + 1}`,
      thumbAlt: `${vehicleTitle} thumbnail ${index + 1}`,
      thumbDelay: 80 + index * 40,
    }));
  }, [vehicle, vehicleTitle]);

  const galleryCount = galleryImages.length;
  const hasGalleryImages = galleryCount > 0;
  const hasInfiniteGallery = galleryCount > 1;

  const galleryImageUrls = useMemo(() => galleryImages.map((image) => image.src), [galleryImages]);

  useExternalVehicleGallery("#vehicle-gallery-mount", {
    images: galleryImageUrls,
    vehicleTitle,
    videoUrl: vehicle?.videoUrl ?? undefined,
    loading,
    template: "thumbs",
  });
  const detailItems = useMemo(
    () => [
      { label: "Registration", value: formatTextValue(vehicle?.registration) },
      { label: "VIN", value: formatTextValue(vehicle?.vin) },
      { label: "First Registered", value: formatDateValue(vehicle?.firstRegistrationDate) },
      { label: "Generation", value: formatTextValue(vehicle?.generation) },
      { label: "Trim", value: formatTextValue(vehicle?.trim) },
      { label: "Drivetrain", value: formatTextValue(vehicle?.drivetrain) },
      { label: "Emission Class", value: formatTextValue(vehicle?.emissionClass) },
      { label: "Engine Number", value: formatTextValue(vehicle?.engineNumber) },
      { label: "Cylinders", value: formatNumberValue(vehicle?.cylinders, { maximumFractionDigits: 0 }) },
      { label: "Ownership", value: formatTextValue(vehicle?.ownershipCondition) },
    ],
    [vehicle],
  );
  const performanceItems = useMemo(
    () => [
      {
        label: "Engine Size",
        value:
          vehicle?.engineCapacityCc && Number.isFinite(vehicle.engineCapacityCc)
            ? `${formatNumberValue(vehicle.engineCapacityCc / 1000, { maximumFractionDigits: 1 })}L`
            : "On request",
      },
      {
        label: "Power",
        value:
          vehicle?.enginePowerBhp && Number.isFinite(vehicle.enginePowerBhp)
            ? `${formatNumberValue(vehicle.enginePowerBhp, { maximumFractionDigits: 0 })} BHP`
            : "On request",
      },
      { label: "Cylinders", value: formatNumberValue(vehicle?.cylinders, { maximumFractionDigits: 0 }) },
      {
        label: "CO2 Emissions",
        value:
          vehicle?.co2EmissionGpkm && Number.isFinite(vehicle.co2EmissionGpkm)
            ? `${formatNumberValue(vehicle.co2EmissionGpkm, { maximumFractionDigits: 0 })} g/km`
            : "On request",
      },
      {
        label: "Combined MPG",
        value:
          vehicle?.fuelEconomyNedcCombinedMpg && Number.isFinite(vehicle.fuelEconomyNedcCombinedMpg)
            ? `${formatNumberValue(vehicle.fuelEconomyNedcCombinedMpg, { maximumFractionDigits: 1 })} mpg`
            : "On request",
      },
      { label: "Emission Class", value: formatTextValue(vehicle?.emissionClass) },
    ],
    [vehicle],
  );
  const sizeItems = useMemo(
    () => [
      {
        label: "Length",
        value:
          vehicle?.lengthMm && Number.isFinite(vehicle.lengthMm)
            ? `${formatNumberValue(vehicle.lengthMm, { maximumFractionDigits: 0 })} mm`
            : "On request",
      },
      {
        label: "Width",
        value:
          vehicle?.widthMm && Number.isFinite(vehicle.widthMm)
            ? `${formatNumberValue(vehicle.widthMm, { maximumFractionDigits: 0 })} mm`
            : "On request",
      },
      {
        label: "Height",
        value:
          vehicle?.heightMm && Number.isFinite(vehicle.heightMm)
            ? `${formatNumberValue(vehicle.heightMm, { maximumFractionDigits: 0 })} mm`
            : "On request",
      },
      {
        label: "Boot (Seats Up)",
        value:
          vehicle?.bootSpaceSeatsUpLitres && Number.isFinite(vehicle.bootSpaceSeatsUpLitres)
            ? `${formatNumberValue(vehicle.bootSpaceSeatsUpLitres, { maximumFractionDigits: 0 })} L`
            : "On request",
      },
      {
        label: "Boot (Seats Down)",
        value:
          vehicle?.bootSpaceSeatsDownLitres && Number.isFinite(vehicle.bootSpaceSeatsDownLitres)
            ? `${formatNumberValue(vehicle.bootSpaceSeatsDownLitres, { maximumFractionDigits: 0 })} L`
            : "On request",
      },
    ],
    [vehicle],
  );
  const listingItems = useMemo(
    () => [
      { label: "Advert ID", value: formatTextValue(vehicle?.advertId) },
      { label: "Original ID", value: formatTextValue(vehicle?.originalId) },
      {
        label: "Vehicle Tax",
        value:
          vehicle?.vehicleExciseDutyGbp && Number.isFinite(vehicle.vehicleExciseDutyGbp)
            ? formatVehiclePrice(vehicle.vehicleExciseDutyGbp, "On request")
            : "On request",
      },
      {
        label: "Price Indicator",
        value: vehicle?.advertPriceIndicatorRating ? toTitleCase(vehicle.advertPriceIndicatorRating) : "On request",
      },
      { label: "On Forecourt", value: formatDateValue(vehicle?.advertDateOnForecourt) },
      { label: "Last Updated", value: formatDateTimeValue(vehicle?.advertLastUpdated) },
      {
        label: "Lifecycle",
        value: vehicle?.advertLifecycleState ? toTitleCase(vehicle.advertLifecycleState) : "On request",
      },
      { label: "Status", value: vehicle?.advertStatus ? toTitleCase(vehicle.advertStatus) : "On request" },
      { label: "Featured", value: formatBooleanValue(vehicle?.advertFeatured) },
      { label: "Manufacturer Approved", value: formatBooleanValue(vehicle?.advertManufacturerApproved) },
      { label: "12 Months MOT", value: formatBooleanValue(vehicle?.advertTwelveMonthsMot) },
    ],
    [vehicle],
  );
  const advertiserItems = useMemo(
    () => [
      { label: "Dealer", value: formatTextValue(vehicle?.advertiserName) },
      { label: "Phone", value: formatTextValue(vehicle?.advertiserPhone) },
      { label: "Website", value: formatTextValue(vehicle?.advertiserWebsite) },
      { label: "Address", value: formatTextValue(vehicle?.advertiserAddressLineOne) },
      { label: "Town", value: formatTextValue(vehicle?.advertiserTown) },
      { label: "Region", value: formatTextValue(vehicle?.advertiserRegion) },
      { label: "Post Code", value: formatTextValue(vehicle?.advertiserPostCode) },
    ],
    [vehicle],
  );
  const historyItems = useMemo(
    () => [
      { label: "Scrapped", value: formatBooleanValue(vehicle?.vehicleHistory?.scrapped) },
      { label: "Stolen", value: formatBooleanValue(vehicle?.vehicleHistory?.stolen) },
      { label: "Imported", value: formatBooleanValue(vehicle?.vehicleHistory?.imported) },
      { label: "Exported", value: formatBooleanValue(vehicle?.vehicleHistory?.exported) },
      {
        label: "Previous Owners",
        value: formatNumberValue(vehicle?.vehicleHistory?.previousOwnersCount, { maximumFractionDigits: 0 }),
      },
    ],
    [vehicle],
  );
  const specGroups = vehicle?.specs ?? [];
  const featureGroups = useMemo(() => {
    const details = vehicle?.featureDetails ?? [];
    if (!details.length) return [];
    const grouped = new Map<string, typeof details>();
    details.forEach((item) => {
      const key = item.category ? String(item.category).trim() : "Other";
      const group = grouped.get(key);
      if (group) {
        group.push(item);
      } else {
        grouped.set(key, [item]);
      }
    });
    return Array.from(grouped.entries()).map(([category, items]) => ({
      category,
      items,
    }));
  }, [vehicle?.featureDetails]);

  useEffect(() => {
    if (!featureGroups.length) return;
    const first = featureGroups[0]?.category;
    if (!first) return;
    setExpandedFeatureCategories((current) => (current.size ? current : new Set([first])));
  }, [featureGroups]);

  const toggleFeatureCategory = (category: string) => {
    setExpandedFeatureCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const highlightFeatures = useMemo(() => featureItems.slice(0, 10), [featureItems]);
  const asideSnapshotItems = useMemo(
    () => [
      { label: "Registration", value: formatTextValue(vehicle?.registration) },
      { label: "Year", value: formatNumberValue(vehicle?.year, { maximumFractionDigits: 0 }) },
      { label: "Mileage", value: formatVehicleMileage(vehicle?.mileage ?? null, "On request") },
      { label: "Fuel", value: formatTextValue(vehicle?.fuelType) },
      { label: "Transmission", value: formatTextValue(vehicle?.transmission) },
      { label: "Body Type", value: formatTextValue(vehicle?.bodyType) },
      { label: "Colour", value: formatTextValue(vehicle?.colour) },
    ],
    [vehicle],
  );
  const hasListingInfo = Boolean(
    vehicle &&
      (vehicle.originalId ||
        vehicle.vehicleExciseDutyGbp ||
        vehicle.advertPriceIndicatorRating ||
        vehicle.advertDateOnForecourt ||
        vehicle.advertLastUpdated ||
        vehicle.advertLifecycleState ||
        vehicle.advertStatus ||
        (vehicle.advertFeatured !== null && vehicle.advertFeatured !== undefined) ||
        (vehicle.advertManufacturerApproved !== null && vehicle.advertManufacturerApproved !== undefined) ||
        (vehicle.advertTwelveMonthsMot !== null && vehicle.advertTwelveMonthsMot !== undefined)),
  );
  const hasAdvertiserInfo = Boolean(
    vehicle?.advertiserName ||
      vehicle?.advertiserPhone ||
      vehicle?.advertiserWebsite ||
      vehicle?.advertiserAddressLineOne ||
      vehicle?.advertiserTown ||
      vehicle?.advertiserRegion ||
      vehicle?.advertiserPostCode,
  );
  const hasDetailInfo = Boolean(
    vehicle?.registration ||
      vehicle?.vin ||
      vehicle?.firstRegistrationDate ||
      vehicle?.generation ||
      vehicle?.trim ||
      vehicle?.drivetrain ||
      vehicle?.emissionClass ||
      vehicle?.engineNumber ||
      vehicle?.cylinders ||
      vehicle?.ownershipCondition,
  );
  const hasPerformanceInfo = Boolean(
    vehicle?.engineCapacityCc ||
      vehicle?.enginePowerBhp ||
      vehicle?.cylinders ||
      vehicle?.co2EmissionGpkm ||
      vehicle?.fuelEconomyNedcCombinedMpg ||
      vehicle?.emissionClass,
  );
  const hasSizeInfo = Boolean(
    vehicle?.lengthMm ||
      vehicle?.widthMm ||
      vehicle?.heightMm ||
      vehicle?.bootSpaceSeatsUpLitres ||
      vehicle?.bootSpaceSeatsDownLitres,
  );
  const hasHistoryInfo = Boolean(
    vehicle?.vehicleHistory &&
      (vehicle.vehicleHistory.scrapped !== null ||
        vehicle.vehicleHistory.stolen !== null ||
        vehicle.vehicleHistory.imported !== null ||
        vehicle.vehicleHistory.exported !== null ||
        vehicle.vehicleHistory.previousOwnersCount !== null),
  );

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isCompared, setIsCompared] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");
  const [wishlistLabel, setWishlistLabel] = useState("Wishlist");
  const [compareLabel, setCompareLabel] = useState("Compare");
  const [isShareDone, setIsShareDone] = useState(false);
  const [isWishlistDone, setIsWishlistDone] = useState(false);
  const [isCompareDone, setIsCompareDone] = useState(false);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [expandedFeatureCategories, setExpandedFeatureCategories] = useState<Set<string>>(() => new Set());
  const [summaryTab, setSummaryTab] = useState<"overview" | "finance">("overview");

  const [galleryActiveIndex, setGalleryActiveIndex] = useState(0);
  const [galleryVisualIndex, setGalleryVisualIndex] = useState(hasInfiniteGallery ? 1 : 0);
  const [isGalleryTransitionEnabled, setIsGalleryTransitionEnabled] = useState(true);

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [similarVehicles, setSimilarVehicles] = useState<SimilarVehicleCard[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [hasSimilarFetched, setHasSimilarFetched] = useState(false);

  const overviewBodyText = isOverviewExpanded || !hasOverviewRemainder ? overviewCombinedText : `${overviewPreviewText}...`;
  const defaultEnquiryMessage = `Hi, I am interested in the ${vehicleTitle}. Please share availability and next steps.`;
  const leadsEndpoint = process.env.NEXT_PUBLIC_LEADS_API_URL || '/leads';
  const useExternalLeadApi = true
  const enquiryMake = String(vehicle?.make ?? "").trim();
  const enquiryModel = [vehicle?.model, vehicle?.derivative]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
  const enquiryModelWithoutMake =
    enquiryMake && enquiryModel.toLowerCase().startsWith(`${enquiryMake.toLowerCase()} `)
      ? enquiryModel.slice(enquiryMake.length).trim()
      : enquiryModel;
  const enquiryVehicleName =
    [enquiryMake, enquiryModelWithoutMake || enquiryModel].filter(Boolean).join(" ").replace(/\s+/g, " ").trim() ||
    vehicleTitle;
  const enquiryRegistration = String(vehicle?.registration ?? "").trim() || undefined;
  const enquiryMileage =
    vehicle?.mileage !== null && vehicle?.mileage !== undefined ? String(Math.round(vehicle.mileage)) : undefined;
  const enquiryTransmission = String(vehicle?.transmission ?? "").trim() || undefined;
  const enquiryFuelType = String(vehicle?.fuelType ?? "").trim() || undefined;
  const engineSpecFallback = formatEngine(vehicle);
  const enquiryEngineSize =
    vehicle?.engineCapacityCc && Number.isFinite(vehicle.engineCapacityCc)
      ? `${(vehicle.engineCapacityCc / 1000).toFixed(1)}L`
      : engineSpecFallback !== "Engine on request"
        ? engineSpecFallback
      : undefined;
  const enquiryPriceValue =
    vehicle?.price !== null && vehicle?.price !== undefined && Number.isFinite(vehicle.price)
      ? Math.round(vehicle.price)
      : null;
  const enquiryPriceText = enquiryPriceValue !== null ? formatVehiclePrice(enquiryPriceValue, "Not provided") : undefined;

  const buildDefaultEnquiryValues = useCallback(
    (): VehicleEnquiryFormValues => ({
      vehicle: vehicleTitle,
      url: currentUrl,
      name: "",
      email: "",
      phone: "",
      postcode: "",
      contact_method: "Email",
      best_time: "Anytime",
      finance: "Not Sure Yet",
      part_exchange: "No",
      message: defaultEnquiryMessage,
    }),
    [currentUrl, defaultEnquiryMessage, vehicleTitle],
  );

  const enquiryForm = useLeadsForm<VehicleEnquiryFormValues>({
    initialValues: buildDefaultEnquiryValues(),
    endpoint: leadsEndpoint || '/leads',
    leadType: "dealer-enquiry",
    leadSource: "vehicle-details",
    honeypotField: "website",
    fieldConfig: {
      name: { required: true },
      email: {
        required: true,
        validate: (value) => (/\S+@\S+\.\S+/.test(String(value || "")) ? null : "Please enter a valid email."),
      },
      phone: {
        required: true,
        validate: (value) => (isValidUkPhone(value) ? null : "Please enter a valid UK phone number."),
      },
      message: { required: true },
    },
    buildPayload: (values, meta) => {
      const vehicleUrl = values.url || currentUrl || window.location.href;
      const leadVehicleLabel = enquiryVehicleName || values.vehicle || vehicleTitle;
      const leadVehicleDisplay =
        enquiryRegistration && !leadVehicleLabel.includes(enquiryRegistration)
          ? `${leadVehicleLabel} - ${enquiryRegistration}`
          : leadVehicleLabel;
      const extraLines = [
        `Vehicle: ${leadVehicleDisplay}`,
        `Stock ID: ${enquiryRegistration || "Not provided"}`,
        `Price: ${enquiryPriceText || "Not provided"}`,
        `Mileage: ${enquiryMileage || "Not provided"}`,
        `Transmission: ${enquiryTransmission || "Not provided"}`,
        `Fuel Type: ${enquiryFuelType || "Not provided"}`,
        `Engine Size: ${enquiryEngineSize || "Not provided"}`,
        `Vehicle URL: ${vehicleUrl}`,
        `Postcode: ${values.postcode || "Not provided"}`,
        `Preferred Contact: ${values.contact_method || "Not specified"}`,
        `Best Time: ${values.best_time || "Not specified"}`,
        `Finance Required: ${values.finance || "Not specified"}`,
        `Part Exchange: ${values.part_exchange || "Not specified"}`,
      ];

      const composedMessage = [values.message, "", ...extraLines].filter(Boolean).join("\n");

      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        postcode: values.postcode,
        preferredContact: values.contact_method,
        preferred_contact: values.contact_method,
        bestTime: values.best_time,
        best_time: values.best_time,
        finance: values.finance,
        partExchange: values.part_exchange,
        part_exchange: values.part_exchange,
        subject: `Vehicle Enquiry: ${leadVehicleDisplay}`,
        message: composedMessage,
        vehicle: leadVehicleDisplay,
        vehicle_name: leadVehicleDisplay,
        stock: enquiryRegistration,
        registration: enquiryRegistration,
        make: enquiryMake || undefined,
        model: enquiryModelWithoutMake || enquiryModel || undefined,
        year: vehicle?.year !== null && vehicle?.year !== undefined ? String(vehicle.year) : undefined,
        price: enquiryPriceValue ?? undefined,
        vehicle_price: enquiryPriceText,
        mileage: enquiryMileage,
        transmission: enquiryTransmission,
        fuelType: enquiryFuelType,
        fuel_type: enquiryFuelType,
        engineSize: enquiryEngineSize,
        engine_size: enquiryEngineSize,
        permalink: vehicleUrl,
        url: vehicleUrl,
        leadType: meta.leadType || "dealer-enquiry",
        leadSource: meta.leadSource || "vehicle-details",
        leadOwner: meta.leadOwner,
        formTs: meta.formTs,
        recaptchaToken: meta.recaptchaToken,
        [meta.honeypotField]: meta.honeypotValue,
        vehicleDetails: {
          registration: enquiryRegistration,
          make: enquiryMake || undefined,
          model: enquiryModelWithoutMake || enquiryModel || undefined,
          year: vehicle?.year !== null && vehicle?.year !== undefined ? String(vehicle.year) : undefined,
          mileage: enquiryMileage,
          odometerReadingMiles: enquiryMileage,
          price: enquiryPriceText,
          transmission: enquiryTransmission,
          fuelType: enquiryFuelType,
          engineSize: enquiryEngineSize,
          condition: values.part_exchange === "Yes" ? "Part exchange requested" : undefined,
        },
      };

      if (useExternalLeadApi) {
        return payload;
      }

      return { leadData: payload };
    },
  });

  const lastTriggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const enquiryNameInputRef = useRef<HTMLInputElement | null>(null);
  const lightboxCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const lightboxFocusRestoreRef = useRef<HTMLElement | null>(null);
  const lightboxScrollYRef = useRef(0);

  const shareResetTimerRef = useRef<number | null>(null);
  const wishlistResetTimerRef = useRef<number | null>(null);
  const compareResetTimerRef = useRef<number | null>(null);

  const galleryTouchStateRef = useRef({ active: false, startX: 0, startY: 0 });
  const lightboxTouchStateRef = useRef({ active: false, startX: 0, startY: 0 });

  const currentPathname = useMemo(() => {
    if (!currentUrl) return "";
    try {
      return normalizeSavedVehiclePath(new URL(currentUrl).pathname);
    } catch {
      return "";
    }
  }, [currentUrl]);

  const vehicleBasePath = useMemo(
    () => getVehicleBasePath(vehicle ?? undefined),
    [vehicle],
  );

  const breadcrumbBasePath = useMemo(() => {
    if (vehicle) return getVehicleBasePath(vehicle);
    if (currentPathname.startsWith("/used-vans/")) return "/used-vans";
    if (currentPathname.startsWith("/used-cars/")) return "/used-cars";
    return "/used-stock";
  }, [currentPathname, vehicle]);

  const breadcrumbLabel = breadcrumbBasePath === "/used-vans"
    ? "Used Vans"
    : breadcrumbBasePath === "/used-cars"
      ? "Used Cars"
      : "Vans & Cars";

  const registrationPathname = useMemo(() => {
    const registrationId = normalizeRegistrationIdentifier(vehicle?.registration || vehicle?.vin);
    return registrationId ? `${vehicleBasePath}/${registrationId}` : "";
  }, [vehicle?.registration, vehicle?.vin, vehicleBasePath]);

  const storagePathname = registrationPathname || currentPathname;

  const wishlistStorageKey = useMemo(
    () => (storagePathname ? `vp-vehicle-wishlist:${storagePathname}` : ""),
    [storagePathname],
  );
  const compareStorageKey = useMemo(
    () => (storagePathname ? `vp-vehicle-compare:${storagePathname}` : ""),
    [storagePathname],
  );
  const legacyWishlistStorageKey = useMemo(
    () =>
      currentPathname && currentPathname !== storagePathname
        ? `vp-vehicle-wishlist:${currentPathname}`
        : "",
    [currentPathname, storagePathname],
  );
  const legacyCompareStorageKey = useMemo(
    () =>
      currentPathname && currentPathname !== storagePathname
        ? `vp-vehicle-compare:${currentPathname}`
        : "",
    [currentPathname, storagePathname],
  );

  const gallerySlides = useMemo(() => {
    if (!hasInfiniteGallery) {
      return galleryImages.map((image, index) => ({
        ...image,
        key: `real-${index}`,
        realIndex: index,
      }));
    }

    return [
      {
        ...galleryImages[galleryCount - 1],
        key: "clone-tail",
        realIndex: galleryCount - 1,
      },
      ...galleryImages.map((image, index) => ({
        ...image,
        key: `real-${index}`,
        realIndex: index,
      })),
      {
        ...galleryImages[0],
        key: "clone-head",
        realIndex: 0,
      },
    ];
  }, [galleryCount, galleryImages, hasInfiniteGallery]);

  const visibleGalleryThumbs = useMemo(() => {
    if (galleryCount <= MAX_VISIBLE_GALLERY_THUMBS) {
      return galleryImages.map((image, index) => ({ image, index }));
    }

    const halfWindow = Math.floor(MAX_VISIBLE_GALLERY_THUMBS / 2);
    let startIndex = galleryActiveIndex - halfWindow;
    let endIndex = galleryActiveIndex + halfWindow;

    if (startIndex < 0) {
      endIndex += -startIndex;
      startIndex = 0;
    }

    if (endIndex > galleryCount - 1) {
      startIndex -= endIndex - (galleryCount - 1);
      endIndex = galleryCount - 1;
    }

    startIndex = Math.max(0, startIndex);

    return galleryImages.slice(startIndex, endIndex + 1).map((image, offset) => ({
      image,
      index: startIndex + offset,
    }));
  }, [galleryActiveIndex, galleryCount, galleryImages]);

  useEffect(() => {
    setGalleryActiveIndex(0);
    setGalleryVisualIndex(hasInfiniteGallery ? 1 : 0);
    setIsGalleryTransitionEnabled(true);
  }, [galleryCount, hasInfiniteGallery]);

  useEffect(() => {
    setIsOverviewExpanded(false);
  }, [overviewCombinedText]);

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (!wishlistStorageKey) return;

    try {
      const next =
        readStoredFlag(wishlistStorageKey) ||
        Boolean(legacyWishlistStorageKey && readStoredFlag(legacyWishlistStorageKey));
      setIsWishlisted(next);
    } catch {
      setIsWishlisted(false);
    }
  }, [wishlistStorageKey, legacyWishlistStorageKey]);

  useEffect(() => {
    if (!compareStorageKey) return;

    try {
      const next =
        readStoredFlag(compareStorageKey) ||
        Boolean(legacyCompareStorageKey && readStoredFlag(legacyCompareStorageKey));
      setIsCompared(next);
    } catch {
      setIsCompared(false);
    }
  }, [compareStorageKey, legacyCompareStorageKey]);

  useEffect(() => {
    const slug = toText(vehicle?.slug);
    const registration = toText(vehicle?.registration);

    if (!slug && !registration) {
      setSimilarVehicles([]);
      setIsSimilarLoading(false);
      setHasSimilarFetched(true);
      return;
    }

    const controller = new AbortController();

    const loadSimilarVehicles = async () => {
      setIsSimilarLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("limit", "4");
        if (slug) params.set("slug", slug);
        if (registration) params.set("reg", registration);

        const resolvedType = resolveSimilarVehicleType(pathname, currentPathname, vehicleBasePath);
        if (resolvedType) {
          params.set("vehicle_type", resolvedType);
        }

        const response = await fetch(apiUrl(`/vehicle/similar?${params.toString()}`), {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = (await response.json().catch(() => ({}))) as unknown;
        if (!response.ok) {
          throw new Error("Unable to load similar vehicles");
        }

        const rows = Array.isArray(payload)
          ? payload
          : payload && typeof payload === "object" && Array.isArray((payload as { items?: unknown[] }).items)
            ? (payload as { items: unknown[] }).items
            : [];

        const normalized = rows
          .map((item, index) => normalizeSimilarVehicleCard(item, index))
          .filter((item): item is SimilarVehicleCard => Boolean(item));

        const filtered = resolvedType ? normalized.filter((item) => matchesSimilarVehicleType(item, resolvedType)) : normalized;
        setSimilarVehicles(filtered);
      } catch {
        if (!controller.signal.aborted) {
          setSimilarVehicles([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSimilarLoading(false);
          setHasSimilarFetched(true);
        }
      }
    };

    loadSimilarVehicles();

    return () => {
      controller.abort();
    };
  }, [currentPathname, pathname, vehicle?.registration, vehicle?.slug, vehicleBasePath]);

  useEffect(() => {
    return () => {
      if (shareResetTimerRef.current) {
        window.clearTimeout(shareResetTimerRef.current);
      }
      if (wishlistResetTimerRef.current) {
        window.clearTimeout(wishlistResetTimerRef.current);
      }
      if (compareResetTimerRef.current) {
        window.clearTimeout(compareResetTimerRef.current);
      }
    };
  }, []);

  const closeEnquiryModal = useCallback(() => {
    setIsEnquiryOpen(false);
    window.setTimeout(() => {
      lastTriggerButtonRef.current?.focus();
    }, 0);
  }, []);

  useEffect(() => {
    if (!isEnquiryOpen) return;

    enquiryNameInputRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeEnquiryModal();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeEnquiryModal, isEnquiryOpen]);

  const buildVehicleSummary = (): ExternalVehicleEnquirySummary => ({
    title: enquiryVehicleName || vehicleTitle,
    registration: enquiryRegistration,
    make: vehicle?.make || undefined,
    model: vehicle?.model || undefined,
    derivative: vehicle?.derivative || undefined,
    year: vehicle?.year ?? undefined,
    price: enquiryPriceValue ?? undefined,
    priceText: enquiryPriceText,
    mileage: enquiryMileage,
    transmission: enquiryTransmission,
    fuel: enquiryFuelType,
    engineSize: enquiryEngineSize,
    image: Array.isArray(vehicle?.images) ? vehicle.images[0] : undefined,
  });

  const openEnquiryModal = (trigger: HTMLButtonElement) => {
    lastTriggerButtonRef.current = trigger;
    openExternalVehicleEnquiry(buildVehicleSummary());
  };

  const openReserveModal = (trigger: HTMLButtonElement) => {
    lastTriggerButtonRef.current = trigger;
    openExternalReservation(buildVehicleSummary());
  };

  const openFinanceEnquiryModal = (trigger: HTMLButtonElement) => {
    lastTriggerButtonRef.current = trigger;
    enquiryForm.reset(buildDefaultEnquiryValues());
    enquiryForm.setFieldValue("finance", "Yes");
    enquiryForm.setFieldValue(
      "message",
      `Hi, I am interested in finance options for the ${vehicleTitle}. Please share eligibility and next steps.`,
    );
    setIsEnquiryOpen(true);
  };

  const handleEnquirySubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      const result = await enquiryForm.handleSubmit(event);
      if (result.success) {
        enquiryForm.reset(buildDefaultEnquiryValues());
        closeEnquiryModal();
      }
    },
    [buildDefaultEnquiryValues, closeEnquiryModal, enquiryForm],
  );

  const flashShareLabel = useCallback((label: string, duration = 1400) => {
    setShareLabel(label);
    setIsShareDone(true);

    if (shareResetTimerRef.current) {
      window.clearTimeout(shareResetTimerRef.current);
    }

    shareResetTimerRef.current = window.setTimeout(() => {
      setShareLabel("Share");
      setIsShareDone(false);
    }, duration);
  }, []);

  const flashWishlistLabel = useCallback((label: string, duration = 1400) => {
    setWishlistLabel(label);
    setIsWishlistDone(true);

    if (wishlistResetTimerRef.current) {
      window.clearTimeout(wishlistResetTimerRef.current);
    }

    wishlistResetTimerRef.current = window.setTimeout(() => {
      setWishlistLabel("Wishlist");
      setIsWishlistDone(false);
    }, duration);
  }, []);

  const flashCompareLabel = useCallback((label: string, duration = 1400) => {
    setCompareLabel(label);
    setIsCompareDone(true);

    if (compareResetTimerRef.current) {
      window.clearTimeout(compareResetTimerRef.current);
    }

    compareResetTimerRef.current = window.setTimeout(() => {
      setCompareLabel("Compare");
      setIsCompareDone(false);
    }, duration);
  }, []);

  const handleShareAction = useCallback(async () => {
    const pageUrl = currentUrl || window.location.href;
    const shareData = {
      title: document.title,
      text: `Check out this vehicle from ${companyProfile.name}`,
      url: pageUrl,
    };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        flashShareLabel("Shared", 1200);
        return;
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "name" in error &&
          (error as { name?: string }).name === "AbortError"
        ) {
          return;
        }
      }
    }

    try {
      await copyToClipboard(pageUrl);
      flashShareLabel("Link Copied", 1500);
    } catch {
      flashShareLabel("Copy Failed", 1200);
    }
  }, [currentUrl, flashShareLabel]);

  const handleWishlistAction = () => {
    if (!wishlistStorageKey) return;

    const next = !isWishlisted;
    setIsWishlisted(next);

    try {
      writeStoredFlag(wishlistStorageKey, next);
      if (legacyWishlistStorageKey) {
        writeStoredFlag(legacyWishlistStorageKey, false);
      }
    } catch {
      // Keep UI responsive if storage is blocked.
    }

    window.dispatchEvent(new CustomEvent("vp:wishlist-updated"));
    flashWishlistLabel(next ? "Saved" : "Removed", 1200);
  };

  const handleCompareAction = () => {
    if (!compareStorageKey) return;

    const next = !isCompared;

    if (next) {
      const isAlreadyCompared =
        readStoredFlag(compareStorageKey) ||
        Boolean(legacyCompareStorageKey && readStoredFlag(legacyCompareStorageKey));
      const savedCompareCount = getStoredFlagCount(COMPARE_STORAGE_PREFIX);

      if (!isAlreadyCompared && savedCompareCount >= MAX_COMPARE_VEHICLES) {
        flashCompareLabel("Max 3 Vehicles", 1500);
        return;
      }
    }

    setIsCompared(next);

    try {
      writeStoredFlag(compareStorageKey, next);
      if (legacyCompareStorageKey) {
        writeStoredFlag(legacyCompareStorageKey, false);
      }
    } catch {
      // Keep UI responsive if storage is blocked.
    }

    window.dispatchEvent(new CustomEvent("vp:compare-updated"));
    flashCompareLabel(next ? "Added" : "Removed", 1200);
  };

  const syncGalleryToIndex = useCallback(
    (index: number, instant = false) => {
      if (galleryCount <= 0) {
        setGalleryActiveIndex(0);
        setGalleryVisualIndex(0);
        setIsGalleryTransitionEnabled(false);
        return;
      }
      const normalized = normalizeIndex(index, galleryCount);
      setGalleryActiveIndex(normalized);
      setGalleryVisualIndex(hasInfiniteGallery ? normalized + 1 : normalized);
      setIsGalleryTransitionEnabled(!instant);
    },
    [galleryCount, hasInfiniteGallery],
  );

  const goToNextGalleryImage = useCallback(() => {
    if (galleryCount <= 0) return;
    if (!hasInfiniteGallery) {
      syncGalleryToIndex(galleryActiveIndex + 1);
      return;
    }

    setGalleryActiveIndex((current) => normalizeIndex(current + 1, galleryCount));
    setGalleryVisualIndex((current) => current + 1);
    setIsGalleryTransitionEnabled(true);
  }, [galleryActiveIndex, galleryCount, hasInfiniteGallery, syncGalleryToIndex]);

  const goToPrevGalleryImage = useCallback(() => {
    if (galleryCount <= 0) return;
    if (!hasInfiniteGallery) {
      syncGalleryToIndex(galleryActiveIndex - 1);
      return;
    }

    setGalleryActiveIndex((current) => normalizeIndex(current - 1, galleryCount));
    setGalleryVisualIndex((current) => current - 1);
    setIsGalleryTransitionEnabled(true);
  }, [galleryActiveIndex, galleryCount, hasInfiniteGallery, syncGalleryToIndex]);

  const handleGalleryTrackTransitionEnd = () => {
    if (!hasInfiniteGallery) return;

    if (galleryVisualIndex === 0) {
      setGalleryVisualIndex(galleryCount);
      setIsGalleryTransitionEnabled(false);
      return;
    }

    if (galleryVisualIndex === galleryCount + 1) {
      setGalleryVisualIndex(1);
      setIsGalleryTransitionEnabled(false);
    }
  };

  useEffect(() => {
    if (isGalleryTransitionEnabled) return;

    const frame = window.requestAnimationFrame(() => {
      setIsGalleryTransitionEnabled(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [isGalleryTransitionEnabled]);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    window.setTimeout(() => {
      lightboxFocusRestoreRef.current?.focus();
    }, 0);
  }, []);

  const setLightboxAndSync = useCallback(
    (nextIndex: number) => {
      if (galleryCount <= 0) return;
      const normalized = normalizeIndex(nextIndex, galleryCount);
      setLightboxIndex(normalized);
      syncGalleryToIndex(normalized);
    },
    [galleryCount, syncGalleryToIndex],
  );

  const goToNextLightboxImage = useCallback(() => {
    setLightboxAndSync(lightboxIndex + 1);
  }, [lightboxIndex, setLightboxAndSync]);

  const goToPrevLightboxImage = useCallback(() => {
    setLightboxAndSync(lightboxIndex - 1);
  }, [lightboxIndex, setLightboxAndSync]);

  const openLightbox = useCallback(
    (startIndex: number, trigger: HTMLElement | null) => {
      if (galleryCount <= 0) return;
      lightboxFocusRestoreRef.current = trigger ?? (document.activeElement as HTMLElement | null);
      setLightboxAndSync(startIndex);
      setIsLightboxOpen(true);
    },
    [galleryCount, setLightboxAndSync],
  );

  useEffect(() => {
    if (!isLightboxOpen) return;

    lightboxCloseButtonRef.current?.focus();
  }, [isLightboxOpen]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const body = document.body;
    const scrollY = window.scrollY || window.pageYOffset || 0;

    lightboxScrollYRef.current = scrollY;
    body.style.setProperty("--vehicle-lightbox-scroll-y", `-${scrollY}px`);
    body.classList.add("vehicle-lightbox-open");

    return () => {
      body.classList.remove("vehicle-lightbox-open");
      body.style.removeProperty("--vehicle-lightbox-scroll-y");
      window.scrollTo(0, scrollY);
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeLightbox();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goToNextLightboxImage();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        goToPrevLightboxImage();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeLightbox, goToNextLightboxImage, goToPrevLightboxImage, isLightboxOpen]);

  const onSwipeStart = (
    event: ReactTouchEvent<HTMLElement>,
    store: { active: boolean; startX: number; startY: number },
  ) => {
    if (event.touches.length !== 1) return;

    store.active = true;
    store.startX = event.touches[0].clientX;
    store.startY = event.touches[0].clientY;
  };

  const onSwipeEnd = (
    event: ReactTouchEvent<HTMLElement>,
    store: { active: boolean; startX: number; startY: number },
    onNext: () => void,
    onPrev: () => void,
  ) => {
    if (!store.active || event.changedTouches.length !== 1) return;

    store.active = false;
    const dx = event.changedTouches[0].clientX - store.startX;
    const dy = event.changedTouches[0].clientY - store.startY;

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) onNext();
    else onPrev();
  };

  const handleGalleryKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (galleryCount <= 0) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNextGalleryImage();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPrevGalleryImage();
    } else if (event.key === "Enter") {
      event.preventDefault();
      openLightbox(galleryActiveIndex, event.currentTarget);
    }
  };

  const activeLightboxImage = galleryImages[lightboxIndex] ?? null;
  const galleryCurrentDisplay = galleryCount > 0 ? galleryActiveIndex + 1 : 0;
  const lightboxCurrentDisplay = galleryCount > 0 ? lightboxIndex + 1 : 0;
  const lightboxViewportStyle: CSSProperties | undefined = activeLightboxImage
    ? ({
        "--vehicle-lightbox-fill-image": `url("${toSafeCssUrl(activeLightboxImage.src)}")`,
      } as CSSProperties)
    : undefined;

  return (
    <>
      <VehicleViewTracker subject={vehicleViewSubject} />
      <section className="vehicle-details-breadcrumb-wrap">
        <div className="vehicle-details-breadcrumb-shell">
          <nav className="vehicle-details-breadcrumb" aria-label="Breadcrumb">
            <Link href="/" className="vehicle-breadcrumb-pill" data-aos="fade-right">
              <AppIcon name="house" />
              <span>Home</span>
            </Link>
            <span className="vehicle-breadcrumb-divider" aria-hidden="true" data-aos="fade-right" data-aos-delay="40">
              <AppIcon name="chevron-right" />
            </span>
            <Link
              href={breadcrumbBasePath}
              className="vehicle-breadcrumb-pill"
              data-aos="fade-right"
              data-aos-delay="80"
            >
              <span>{breadcrumbLabel}</span>
            </Link>
            <span className="vehicle-breadcrumb-divider" aria-hidden="true" data-aos="fade-right" data-aos-delay="120">
              <AppIcon name="chevron-right" />
            </span>
            <span className="vehicle-breadcrumb-pill is-current" aria-current="page" data-aos="fade-right" data-aos-delay="160">
              {vehicleTitle}
            </span>
          </nav>

          <div className="vehicle-details-breadcrumb-actions" data-aos="fade-left" data-aos-delay="120">
            <button
              type="button"
              className={`vehicle-breadcrumb-action${isShareDone ? " is-done" : ""}`}
              data-vehicle-action="share"
              aria-label="Share this vehicle"
              data-tooltip={shareLabel}
              onClick={handleShareAction}
            >
              <AppIcon name="share-nodes" />
            </button>
            <button
              type="button"
              className={`vehicle-breadcrumb-action${isWishlisted ? " is-active" : ""}${isWishlistDone ? " is-done" : ""}`}
              data-vehicle-action="wishlist"
              aria-label="Add vehicle to wishlist"
              aria-pressed={isWishlisted}
              data-tooltip={wishlistLabel}
              onClick={handleWishlistAction}
            >
              <AppIcon name="heart" filled={isWishlisted} />
            </button>
            <button
              type="button"
              className={`vehicle-breadcrumb-action${isCompared ? " is-active" : ""}${isCompareDone ? " is-done" : ""}`}
              data-vehicle-action="compare"
              aria-label="Add vehicle to compare"
              aria-pressed={isCompared}
              data-tooltip={compareLabel}
              onClick={handleCompareAction}
            >
              <AppIcon name="scale-balanced" />
            </button>
            <button
              type="button"
              className="vehicle-breadcrumb-action"
              data-vehicle-action="print"
              aria-label="Print vehicle brochure"
              data-tooltip="Brochure / Print"
              onClick={() => window.print()}
            >
              <AppIcon name="print" />
            </button>
          </div>
        </div>
      </section>

      <section className="vehicle-details-main">
        <div className="vehicle-details-shell">
          <div className="vehicle-details-primary">
            {/* CDN vehicle-gallery widget mount (kept for parity with source
                app; brandstudio doesn't host the script so this slot stays
                empty — the legacy in-component gallery below takes over.) */}
            <div id="vehicle-gallery-mount" data-aos="fade-up" style={{ display: 'none' }} />
            {!hasGalleryImages ? (
              <article className="vehicle-gallery-card-legacy" data-aos="fade-up">
                <div className="vehicle-gallery-placeholder">
                  <AppIcon name="car" />
                  <p>Photos coming soon</p>
                  <span>This vehicle&apos;s gallery is being prepared. Call us to request more photos or arrange a viewing.</span>
                </div>
              </article>
            ) : null}
            {hasGalleryImages ? (
            <article className="vehicle-gallery-card-legacy" data-aos="fade-up">
              <div
                className="vehicle-gallery-main"
                tabIndex={0}
                aria-label="Vehicle image gallery"
                onKeyDown={handleGalleryKeyDown}
              >
                <div
                  className="vehicle-gallery-viewport"
                  onTouchStart={(event) => onSwipeStart(event, galleryTouchStateRef.current)}
                  onTouchEnd={(event) =>
                    onSwipeEnd(
                      event,
                      galleryTouchStateRef.current,
                      goToNextGalleryImage,
                      goToPrevGalleryImage,
                    )
                  }
                >
                  <div
                    className="vehicle-gallery-track"
                    style={{
                      transform: `translateX(-${galleryVisualIndex * 100}%)`,
                      transition: isGalleryTransitionEnabled
                        ? "transform 560ms cubic-bezier(0.22, 1, 0.36, 1)"
                        : "none",
                    }}
                    onTransitionEnd={handleGalleryTrackTransitionEnd}
                  >
                    {gallerySlides.map((slide, index) => (
                      <figure
                        className="vehicle-gallery-slide"
                        key={`${slide.key}-${index}`}
                        data-real-index={slide.realIndex}
                        data-clone={slide.key.startsWith("clone") ? "true" : undefined}
                        onClick={(event) => {
                          if (window.matchMedia("(max-width: 640px)").matches) {
                            return;
                          }

                          openLightbox(slide.realIndex, event.currentTarget);
                        }}
                      >
                        <img src={slide.src} alt={slide.alt} />
                      </figure>
                    ))}
                  </div>
                </div>

                {hasGalleryImages ? (
                  <>
                    {hasInfiniteGallery ? (
                      <>
                        <button
                          className="vehicle-gallery-control prev"
                          type="button"
                          aria-label="Previous image"
                          onClick={goToPrevGalleryImage}
                        >
                          <AppIcon name="chevron-left" />
                        </button>
                        <button
                          className="vehicle-gallery-control next"
                          type="button"
                          aria-label="Next image"
                          onClick={goToNextGalleryImage}
                        >
                          <AppIcon name="chevron-right" />
                        </button>
                      </>
                    ) : null}

                    <button
                      className="vehicle-gallery-expand"
                      type="button"
                      aria-label="Open full screen gallery"
                      onClick={(event) => openLightbox(galleryActiveIndex, event.currentTarget)}
                    >
                      <AppIcon name="expand" />
                      <span>Full Screen</span>
                    </button>

                    <p className="vehicle-gallery-counter" aria-live="polite">
                      <span className="vehicle-gallery-current">{formatCount(galleryCurrentDisplay)}</span>
                      <span>/</span>
                      <span className="vehicle-gallery-total">{formatCount(galleryCount)}</span>
                    </p>
                  </>
                ) : null}
              </div>

              {hasGalleryImages ? (
                <div className="vehicle-gallery-thumbs" role="tablist" aria-label="Select vehicle image">
                  {visibleGalleryThumbs.map(({ image, index }) => {
                    const isActive = index === galleryActiveIndex;

                    return (
                      <a
                        key={`gallery-thumb-${index}`}
                        className={`vehicle-gallery-thumb${isActive ? " is-active" : ""}`}
                        href={`#vehicle-gallery-image-${index + 1}`}
                        role="tab"
                        data-slide-index={index}
                        aria-label={`Show image ${index + 1}`}
                        aria-selected={isActive}
                        data-aos="zoom-in"
                        data-aos-delay={image.thumbDelay}
                        onClick={(event) => {
                          event.preventDefault();
                          syncGalleryToIndex(index);
                        }}
                      >
                        <img src={image.src} alt={image.thumbAlt} />
                      </a>
                    );
                  })}
                </div>
              ) : null}
            </article>
            ) : null}

            <article className="vehicle-copy-card" data-aos="fade-up" data-aos-delay="60">
              <h2>Vehicle Overview</h2>
              <p className="vehicle-overview-text">{overviewBodyText}</p>
              {hasOverviewRemainder ? (
                <button
                  type="button"
                  className="vehicle-overview-toggle"
                  aria-expanded={isOverviewExpanded}
                  onClick={() => setIsOverviewExpanded((expanded) => !expanded)}
                >
                  <span>{isOverviewExpanded ? "Read Less" : "Read More"}</span>
                  <AppIcon name={isOverviewExpanded ? "chevron-up" : "chevron-down"} aria-hidden="true" />
                </button>
              ) : null}
              {error ? <p className="vehicle-overview-error">{error}</p> : null}
            </article>

            <article className="vehicle-specs-card" data-aos="fade-up" data-aos-delay="100">
              <h2>Key Specification</h2>
              <div className="vehicle-spec-grid">
                <div className="vehicle-spec-item">
                  <span>Mileage</span>
                  <strong>{formatVehicleMileage(vehicle?.mileage ?? null, "Mileage on request")}</strong>
                </div>
                <div className="vehicle-spec-item">
                  <span>Registration</span>
                  <strong>{vehicle?.registration || "On request"}</strong>
                </div>
                <div className="vehicle-spec-item">
                  <span>Engine</span>
                  <strong>{formatEngine(vehicle)}</strong>
                </div>
                <div className="vehicle-spec-item">
                  <span>Transmission</span>
                  <strong>{vehicle?.transmission || "On request"}</strong>
                </div>
                <div className="vehicle-spec-item">
                  <span>Fuel</span>
                  <strong>{vehicle?.fuelType || "On request"}</strong>
                </div>
                <div className="vehicle-spec-item">
                  <span>Body Type</span>
                  <strong>{vehicle?.bodyType || "On request"}</strong>
                </div>
                <div className="vehicle-spec-item">
                  <span>Doors</span>
                  <strong>{vehicle?.doors || "On request"}</strong>
                </div>
                <div className="vehicle-spec-item">
                  <span>Colour</span>
                  <strong>{vehicle?.colour || "On request"}</strong>
                </div>
              </div>
            </article>
            {hasDetailInfo ? (
              <article className="vehicle-details-card" data-aos="fade-up" data-aos-delay="120">
                <h2>Vehicle Details</h2>
                <div className="vehicle-data-grid">
                  {detailItems.map((item) => (
                    <div className="vehicle-spec-item" key={`detail-item-${item.label}`}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            {hasPerformanceInfo ? (
              <article className="vehicle-performance-card" data-aos="fade-up" data-aos-delay="140">
                <h2>Performance & Economy</h2>
                <div className="vehicle-data-grid">
                  {performanceItems.map((item) => (
                    <div className="vehicle-spec-item" key={`performance-item-${item.label}`}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            {hasSizeInfo ? (
              <article className="vehicle-size-card" data-aos="fade-up" data-aos-delay="160">
                <h2>Size & Space</h2>
                <div className="vehicle-data-grid">
                  {sizeItems.map((item) => (
                    <div className="vehicle-spec-item" key={`size-item-${item.label}`}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            {specGroups.length ? (
              <article className="vehicle-specs-detail-card" data-aos="fade-up" data-aos-delay="180">
                <h2>Specification</h2>
                <div className="vehicle-spec-groups">
                  {specGroups.map((group, index) => (
                    <div className="vehicle-spec-group" key={`spec-group-${group.category || "spec"}-${index}`}>
                      <h3>{group.category || "Specifications"}</h3>
                      <div className="vehicle-spec-group-list">
                        {group.items.map((item) => (
                          <div className="vehicle-spec-group-item" key={`spec-item-${group.category}-${item.name}`}>
                            <span>{item.name}</span>
                            <strong>{formatSpecValue(item.name, item.value)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ) : null}

            <article className="vehicle-features-card" data-aos="fade-up" data-aos-delay="200">
              <header className="vehicle-section-header">
                <h2>Highlights</h2>
                <p>Condition, preparation, and key ownership highlights.</p>
              </header>
              <div className="vehicle-highlight-list">
                {highlightFeatures.map((feature, index) => (
                  <span key={`highlight-${index}-${feature}`}>
                    <AppIcon name="check" /> {feature}
                  </span>
                ))}
              </div>
            </article>

            {featureGroups.length ? (
              <article className="vehicle-equipment-card" data-aos="fade-up" data-aos-delay="220">
                <h2>Features & Equipment</h2>
                <div className="vehicle-equipment-groups">
                  {featureGroups.map((group) => {
                    const isExpanded = expandedFeatureCategories.has(group.category);
                    const panelId = `feature-panel-${group.category.replace(/\s+/g, "-").toLowerCase()}`;
                    return (
                      <div className="vehicle-equipment-group" key={`equipment-${group.category}`}>
                        <button
                          type="button"
                          className="vehicle-equipment-toggle"
                          onClick={() => toggleFeatureCategory(group.category)}
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                        >
                          <span>{group.category}</span>
                          <AppIcon name={isExpanded ? "chevron-up" : "chevron-down"} aria-hidden="true" />
                        </button>
                        {isExpanded ? (
                          <div className="vehicle-equipment-list" id={panelId}>
                            {group.items.map((item) => (
                              <div className="vehicle-equipment-item" key={`equipment-${group.category}-${item.name}`}>
                                <span>{item.name}</span>
                                {item.type ? <em>{item.type}</em> : null}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </article>
            ) : null}

            <article className="vehicle-history-card" data-aos="fade-up" data-aos-delay="240">
              <h2>Preparation & History</h2>
              {hasHistoryInfo ? (
                <div className="vehicle-history-summary">
                  {historyItems.map((item) => (
                    <div className="vehicle-history-item" key={`history-${item.label}`}>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="vehicle-history-items">
                <div>
                  <AppIcon name="file-alt" />
                  <p>Service history checked and documented.</p>
                </div>
                <div>
                  <AppIcon name="search" />
                  <p>HPI and finance checks complete before listing.</p>
                </div>
                <div>
                  <AppIcon name="wrench" />
                  <p>Multi-point workshop inspection completed.</p>
                </div>
                <div>
                  <AppIcon name="shield-alt" />
                  <p>Supplied with minimum 3-month warranty.</p>
                </div>
              </div>
            </article>

          </div>

          <aside className="vehicle-details-side" data-aos="fade-left" data-aos-delay="80">
            <div className="vehicle-summary-card">
              <div className="vehicle-summary-tabs" role="tablist" aria-label="Vehicle summary sections">
                <button
                  type="button"
                  role="tab"
                  id="vehicle-summary-tab-overview"
                  aria-controls="vehicle-summary-panel-overview"
                  aria-selected={summaryTab === "overview"}
                  className={`vehicle-summary-tab${summaryTab === "overview" ? " is-active" : ""}`}
                  onClick={() => setSummaryTab("overview")}
                >
                  Overview
                </button>
                <button
                  type="button"
                  role="tab"
                  id="vehicle-summary-tab-finance"
                  aria-controls="vehicle-summary-panel-finance"
                  aria-selected={summaryTab === "finance"}
                  className={`vehicle-summary-tab${summaryTab === "finance" ? " is-active" : ""}`}
                  onClick={() => setSummaryTab("finance")}
                >
                  Finance
                </button>
              </div>

              <div className="vehicle-summary-head">
                <h2 className="vehicle-summary-title">{vehicleSummaryTitle}</h2>
                <p className="vehicle-summary-price">{vehiclePrice}</p>
              </div>
              {vehicle?.derivative ? <p className="vehicle-summary-subtitle">{vehicle.derivative}</p> : null}

              <section
                id="vehicle-summary-panel-overview"
                role="tabpanel"
                aria-labelledby="vehicle-summary-tab-overview"
                className={`vehicle-summary-panel${summaryTab === "overview" ? " is-active" : ""}`}
                hidden={summaryTab !== "overview"}
              >
                <div className="vehicle-details-meta">
                  <span>
                    <AppIcon name="shield-alt" /> HPI Clear
                  </span>
                  <span>
                    <AppIcon name="award" /> 3-Month Warranty
                  </span>
                </div>

                <div className="vehicle-summary-actions">
                  <a href={`tel:${companyPhoneHref}`} className="vehicle-summary-btn btn-call">
                    <AppIcon name="phone" /> Call {companyPhoneText}
                  </a>
                  <button
                    type="button"
                    className="vehicle-summary-btn btn-mail"
                    data-enquiry-open=""
                    onClick={(event) => openEnquiryModal(event.currentTarget)}
                  >
                    <AppIcon name="envelope" /> Email Enquiry
                  </button>
                  <button
                    type="button"
                    className="vehicle-summary-btn btn-reserve"
                    onClick={(event) => openReserveModal(event.currentTarget)}
                  >
                    <AppIcon name="calendar-check" /> Reserve this car
                  </button>
                </div>

                <ul className="vehicle-summary-list">
                  <li>
                    <AppIcon name="check-circle" /> Part exchange welcome
                  </li>
                  <li>
                    <AppIcon name="check-circle" /> Reserve online or by phone
                  </li>
                  <li>
                    <AppIcon name="check-circle" /> Nationwide delivery support
                  </li>
                </ul>
              </section>

              <section
                id="vehicle-summary-panel-finance"
                role="tabpanel"
                aria-labelledby="vehicle-summary-tab-finance"
                className={`vehicle-summary-panel${summaryTab === "finance" ? " is-active" : ""}`}
                hidden={summaryTab !== "finance"}
              >
                <p className="vehicle-summary-finance">
                  Representative finance from{" "}
                  <strong>{vehicleMonthly === "Enquire" ? vehicleMonthly : `${vehicleMonthly}/mo`}</strong>
                </p>

                <ul className="vehicle-summary-finance-list">
                  <li>
                    <AppIcon name="check-circle" /> Flexible terms up to 60 months
                  </li>
                  <li>
                    <AppIcon name="check-circle" /> Fast finance decision support
                  </li>
                  <li>
                    <AppIcon name="check-circle" /> Tailored quotes based on your budget
                  </li>
                </ul>

                <div className="vehicle-summary-actions vehicle-summary-actions-finance">
                  <button
                    type="button"
                    className="vehicle-summary-btn btn-finance-primary"
                    onClick={(event) => openFinanceEnquiryModal(event.currentTarget)}
                  >
                    <AppIcon name="credit-card" /> Apply for Finance
                  </button>
                  <a href={`tel:${companyPhoneHref}`} className="vehicle-summary-btn btn-finance-secondary">
                    <AppIcon name="phone-alt" /> Speak to Finance Team
                  </a>
                </div>
              </section>
            </div>

            
            <div className="vehicle-aside-card">
              <h3>Vehicle Snapshot</h3>
              <ul className="vehicle-aside-list">
                {asideSnapshotItems.map((item) => (
                  <li key={`snapshot-${item.label}`}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="vehicle-contact-card">
              <h3>Visit {companyProfile.name}</h3>
              <p>
                {companyProfile.location.address.line1}, {companyProfile.location.address.city}, {companyProfile.location.address.county}, {companyProfile.location.address.postcode}
              </p>
              <p>{companyOpeningHoursPrimary}</p>
              <Link href="/used-stock">Back to Vans & Cars</Link>
            </div>
          </aside>
        </div>
      </section>

      {isSimilarLoading || similarVehicles.length ? (
        <section className="similar-vehicles-section" aria-label="Similar vehicles">
          <div className="similar-vehicles-inner">
            <div className="similar-vehicles-header">
              <h3 className="similar-vehicles-title">Similar Vehicles</h3>
            </div>

            {isSimilarLoading ? (
              <div className="similar-vehicles-loading" role="status" aria-live="polite">
                <div className="loading-spinner" aria-hidden="true" />
                <p>Loading similar vehicles...</p>
              </div>
            ) : (
              <div className="similar-vehicles-grid">
              {similarVehicles.slice(0, 4).map((item) => {
                  const title = getSimilarTitle(item);
                  const href = getSimilarHref(item);
                  const image = getSimilarImage(item);
                  const price = formatSimilarPrice(item.price);
                  const mileage = formatSimilarMileage(item.mileage);
                  const fuel = formatSimilarText(item.fuel);
                  const transmission = formatSimilarText(item.transmission);
                  const bodyType = formatSimilarText(item.body_type);
                  const reg = formatSimilarText(item.reg || item.registration);

                  return (
                    <article key={item.id} className="similar-vehicle-card">
                      <Link href={href} className="similar-vehicle-link" aria-label={`View ${title}`}>
                        <div className="similar-vehicle-media">
                          <div className="similar-vehicle-image-wrapper">
                            <img className="similar-vehicle-image" src={image} alt={title} loading="lazy" decoding="async" />
                          </div>
                        </div>
                        <div className="similar-vehicle-content">
                          <h4 className="similar-vehicle-title">{title}</h4>
                          {item.derivative ? (
                            <p className="similar-vehicle-derivative">{item.derivative}</p>
                          ) : null}
                          <div className="similar-vehicle-specs">
                            <div className="similar-vehicle-spec">
                              <Gauge size={14} aria-hidden="true" />
                              <span>{mileage}</span>
                            </div>
                            <div className="similar-vehicle-spec">
                              <Fuel size={14} aria-hidden="true" />
                              <span>{fuel}</span>
                            </div>
                            <div className="similar-vehicle-spec">
                              <Cog size={14} aria-hidden="true" />
                              <span>{transmission}</span>
                            </div>
                            <div className="similar-vehicle-spec">
                              <Tag size={14} aria-hidden="true" />
                              <span>{bodyType}</span>
                            </div>
                          </div>
                          <div className="similar-vehicle-footer">
                            <span className="similar-vehicle-price">{price}</span>
                            <span className="similar-vehicle-reg">
                              <span className="reg-number">{reg}</span>
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      ) : null}

      <div className={isEnquiryOpen ? "vehicle-enquiry-modal is-open" : "vehicle-enquiry-modal"} id="vehicle-enquiry-modal" aria-hidden={!isEnquiryOpen}>
        <div className="vehicle-enquiry-backdrop" data-enquiry-close="" onClick={closeEnquiryModal}></div>
        <div className="vehicle-enquiry-dialog" role="dialog" aria-modal="true" aria-labelledby="vehicle-enquiry-title">
          <button
            type="button"
            className="vehicle-enquiry-close"
            aria-label="Close enquiry form"
            data-enquiry-close=""
            onClick={closeEnquiryModal}
          >
            <AppIcon name="times" />
          </button>

          <header className="vehicle-enquiry-head">
            <p className="vehicle-enquiry-kicker">Vehicle Enquiry</p>
            <h2 id="vehicle-enquiry-title">Send Your Enquiry</h2>
            <p>Share your details and preferences. We will contact you with availability, finance and part exchange options.</p>
          </header>

          <form className="vehicle-enquiry-form" id="vehicle-enquiry-form" onSubmit={handleEnquirySubmit}>
            <input id="enquiry-vehicle" type="hidden" {...enquiryForm.getFieldProps("vehicle")} readOnly />
            <input id="enquiry-url" type="hidden" {...enquiryForm.getFieldProps("url")} readOnly />
            <input type="text" {...enquiryForm.honeypotProps} />

            <div className="vehicle-enquiry-grid vehicle-enquiry-grid-essential">
              <div className="vehicle-enquiry-field">
                <label htmlFor="enquiry-name">Full Name *</label>
                <input
                  id="enquiry-name"
                  type="text"
                  required
                  autoComplete="name"
                  ref={enquiryNameInputRef}
                  aria-invalid={Boolean(enquiryForm.errors.name)}
                  {...enquiryForm.getFieldProps("name")}
                />
                {enquiryForm.errors.name ? <p className="vehicle-enquiry-field-error">{enquiryForm.errors.name}</p> : null}
              </div>

              <div className="vehicle-enquiry-field">
                <label htmlFor="enquiry-email">Email Address *</label>
                <input
                  id="enquiry-email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-invalid={Boolean(enquiryForm.errors.email)}
                  {...enquiryForm.getFieldProps("email")}
                />
                {enquiryForm.errors.email ? <p className="vehicle-enquiry-field-error">{enquiryForm.errors.email}</p> : null}
              </div>

              <div className="vehicle-enquiry-field">
                <label htmlFor="enquiry-phone">Phone Number *</label>
                <input
                  id="enquiry-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  aria-invalid={Boolean(enquiryForm.errors.phone)}
                  {...enquiryForm.getFieldProps("phone")}
                />
                {enquiryForm.errors.phone ? <p className="vehicle-enquiry-field-error">{enquiryForm.errors.phone}</p> : null}
              </div>
            </div>

            <details className="vehicle-enquiry-more">
              <summary>Optional details</summary>
              <div className="vehicle-enquiry-grid">
                <div className="vehicle-enquiry-field">
                  <label htmlFor="enquiry-postcode">Postcode</label>
                  <input id="enquiry-postcode" type="text" autoComplete="postal-code" {...enquiryForm.getFieldProps("postcode")} />
                </div>

                <div className="vehicle-enquiry-field">
                  <label htmlFor="enquiry-contact-method">Preferred Contact</label>
                  <select id="enquiry-contact-method" {...enquiryForm.getFieldProps("contact_method")}>
                    <option>Email</option>
                    <option>Phone</option>
                    <option>WhatsApp</option>
                  </select>
                </div>

                <div className="vehicle-enquiry-field">
                  <label htmlFor="enquiry-best-time">Best Time to Reach You</label>
                  <select id="enquiry-best-time" {...enquiryForm.getFieldProps("best_time")}>
                    <option>Anytime</option>
                    <option>Morning</option>
                    <option>Afternoon</option>
                    <option>Evening</option>
                  </select>
                </div>

                <div className="vehicle-enquiry-field">
                  <label htmlFor="enquiry-finance">Need Finance?</label>
                  <select id="enquiry-finance" {...enquiryForm.getFieldProps("finance")}>
                    <option>Not Sure Yet</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div className="vehicle-enquiry-field">
                  <label htmlFor="enquiry-part-exchange">Part Exchange</label>
                  <select id="enquiry-part-exchange" {...enquiryForm.getFieldProps("part_exchange")}>
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </div>
              </div>
            </details>

            <div className="vehicle-enquiry-field">
              <label htmlFor="enquiry-message">Message *</label>
              <textarea
                id="enquiry-message"
                {...enquiryForm.getFieldProps("message")}
                required
                rows={2}
                placeholder="Tell us any requirements, budget, or questions about this vehicle."
                aria-invalid={Boolean(enquiryForm.errors.message)}
              />
              {enquiryForm.errors.message ? <p className="vehicle-enquiry-field-error">{enquiryForm.errors.message}</p> : null}
            </div>
            {enquiryForm.errorMessage ? (
              <p className="vehicle-enquiry-status is-error" role="status">
                {enquiryForm.errorMessage}
              </p>
            ) : null}
            {enquiryForm.successMessage ? (
              <p className="vehicle-enquiry-status is-success" role="status">
                {enquiryForm.successMessage}
              </p>
            ) : null}

            <div className="vehicle-enquiry-actions">
              <button type="button" className="vehicle-enquiry-btn btn-secondary" data-enquiry-close="" onClick={closeEnquiryModal}>
                Cancel
              </button>
              <button type="submit" className="vehicle-enquiry-btn btn-primary" disabled={enquiryForm.status === "submitting"}>
                <AppIcon name="paper-plane" />
                {enquiryForm.status === "submitting" ? "Sending..." : "Send Enquiry"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className={isLightboxOpen ? "vehicle-lightbox is-open" : "vehicle-lightbox"} aria-hidden={!isLightboxOpen}>
        <div className="vehicle-lightbox-backdrop" data-close="true" onClick={closeLightbox}></div>
        <div className="vehicle-lightbox-inner" role="dialog" aria-modal="true" aria-label="Vehicle image gallery lightbox">
          <div className="vehicle-lightbox-top">
            <p className="vehicle-lightbox-counter" aria-live="polite">
              <span className="vehicle-lightbox-current">{formatCount(lightboxCurrentDisplay)}</span>
              <span>/</span>
              <span className="vehicle-lightbox-total">{formatCount(galleryCount)}</span>
            </p>

            <button
              ref={lightboxCloseButtonRef}
              className="vehicle-lightbox-close"
              type="button"
              aria-label="Close full screen gallery"
              data-close="true"
              tabIndex={isLightboxOpen ? 0 : -1}
              onClick={closeLightbox}
            >
              <AppIcon name="times" />
            </button>
          </div>

          <div
            className="vehicle-lightbox-viewport"
            style={lightboxViewportStyle}
            onTouchStart={(event) => onSwipeStart(event, lightboxTouchStateRef.current)}
            onTouchEnd={(event) =>
              onSwipeEnd(event, lightboxTouchStateRef.current, goToNextLightboxImage, goToPrevLightboxImage)
            }
          >
            {activeLightboxImage ? (
              <figure className="vehicle-lightbox-slide" key={`lightbox-slide-${lightboxIndex}`}>
                <img src={activeLightboxImage.src} alt={activeLightboxImage.alt} />
              </figure>
            ) : (
              <p className="vehicle-lightbox-empty">No gallery images available.</p>
            )}

            <button
              className="vehicle-lightbox-control prev"
              type="button"
              aria-label="Previous image"
              tabIndex={isLightboxOpen ? 0 : -1}
              onClick={goToPrevLightboxImage}
            >
              <AppIcon name="chevron-left" />
            </button>
            <button
              className="vehicle-lightbox-control next"
              type="button"
              aria-label="Next image"
              tabIndex={isLightboxOpen ? 0 : -1}
              onClick={goToNextLightboxImage}
            >
              <AppIcon name="chevron-right" />
            </button>
          </div>

        </div>
      </div>

    </>
  );
}



