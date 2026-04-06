export type VehicleDetailsData = {
  slug: string;
  vin: string | null;
  registration: string | null;
  make: string | null;
  model: string | null;
  derivative: string | null;
  year: number | null;
  mileage: number | null;
  fuelType: string | null;
  transmission: string | null;
  bodyType: string | null;
  doors: number | null;
  seats: number | null;
  colour: string | null;
  engineCapacityCc: number | null;
  enginePowerBhp: number | null;
  price: number | null;
  description: string | null;
  videoUrl: string | null;
  images: string[];
  features: string[];
  specs: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const normalized = String(value).trim();
  return normalized.length ? normalized : null;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function slugifyParts(...parts: Array<string | number | null | undefined>): string {
  return parts
    .filter((part) => part !== null && part !== undefined && String(part).trim().length > 0)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getNestedString(source: Record<string, unknown>, ...path: string[]): string | null {
  let current: unknown = source;

  for (const segment of path) {
    if (!isObject(current)) return null;
    current = current[segment];
  }

  if (typeof current !== "string" && typeof current !== "number") {
    return null;
  }

  return toStringOrNull(current);
}

function pickVideoUrl(detail: Record<string, unknown>): string | null {
  const direct =
    getNestedString(detail, "videoUrl") ||
    getNestedString(detail, "video_url") ||
    getNestedString(detail, "youtubeUrl") ||
    getNestedString(detail, "youtube_url") ||
    getNestedString(detail, "vimeoUrl") ||
    getNestedString(detail, "vimeo_url");

  if (direct) return direct;

  return (
    getNestedString(detail, "video", "url") ||
    getNestedString(detail, "video", "href") ||
    getNestedString(detail, "finance", "videoUrl") ||
    getNestedString(detail, "finance", "video_url") ||
    getNestedString(detail, "finance", "video", "url") ||
    getNestedString(detail, "pcpInfo", "videoUrl") ||
    getNestedString(detail, "pcpInfo", "video", "url") ||
    getNestedString(detail, "hpCsInfo", "videoUrl") ||
    getNestedString(detail, "hpCsInfo", "video", "url") ||
    getNestedString(detail, "finance", "pcpInfo", "videoUrl") ||
    getNestedString(detail, "finance", "pcpInfo", "video", "url") ||
    getNestedString(detail, "finance", "hpCsInfo", "videoUrl") ||
    getNestedString(detail, "finance", "hpCsInfo", "video", "url")
  );
}

function normalizeFeatureLabel(item: unknown): string | null {
  if (typeof item === "string") {
    const trimmed = item.trim();
    return trimmed || null;
  }

  if (isObject(item)) {
    const fromName = toStringOrNull(item.name);
    if (fromName) return fromName;
    const fromLabel = toStringOrNull(item.label);
    if (fromLabel) return fromLabel;
  }

  return null;
}

function getCandidateDetails(payload: unknown) {
  if (!isObject(payload)) {
    return null;
  }

  const vehicleNode = payload.vehicle;
  if (!isObject(vehicleNode)) {
    return null;
  }

  // Shape 1: { vehicle: { vehicle: {...}, images: [...], features: [...] } }
  if (isObject(vehicleNode.vehicle)) {
    return {
      detail: vehicleNode.vehicle as Record<string, unknown>,
      imagesSource: vehicleNode.images,
      featuresSource: vehicleNode.features,
      specsSource: vehicleNode.specs ?? payload.specs,
    };
  }

  // Shape 2: { vehicle: {...}, specs: [...] }
  return {
    detail: vehicleNode as Record<string, unknown>,
    imagesSource: vehicleNode.images,
    featuresSource: vehicleNode.features,
    specsSource: payload.specs ?? vehicleNode.specs,
  };
}

export function normalizeVehiclePayload(payload: unknown): VehicleDetailsData | null {
  const candidate = getCandidateDetails(payload);
  if (!candidate) return null;

  const { detail, imagesSource, featuresSource, specsSource } = candidate;
  const slug =
    toStringOrNull(detail.slug) ||
    toStringOrNull(detail.derivative_slug) ||
    slugifyParts(
      toStringOrNull(detail.make),
      toStringOrNull(detail.model),
      toStringOrNull(detail.derivative ?? detail.sub_title),
      toStringOrNull(detail.registration ?? detail.reg),
    );
  const images = Array.isArray(imagesSource)
    ? imagesSource.map((item) => toStringOrNull(item)).filter((item): item is string => Boolean(item))
    : [];
  const features = Array.isArray(featuresSource)
    ? featuresSource.map(normalizeFeatureLabel).filter((item): item is string => Boolean(item))
    : [];

  return {
    slug,
    vin: toStringOrNull(detail.vin),
    registration: toStringOrNull(detail.registration ?? detail.reg),
    make: toStringOrNull(detail.make),
    model: toStringOrNull(detail.model),
    derivative: toStringOrNull(detail.derivative ?? detail.sub_title),
    year: toNumberOrNull(detail.year_of_manufacture ?? detail.year),
    mileage: toNumberOrNull(detail.odometer_reading_miles ?? detail.mileage),
    fuelType: toStringOrNull(detail.fuel_type ?? detail.fuel),
    transmission: toStringOrNull(detail.transmission_type ?? detail.transmission ?? detail.trans),
    bodyType: toStringOrNull(detail.body_type),
    doors: toNumberOrNull(detail.doors),
    seats: toNumberOrNull(detail.seats),
    colour: toStringOrNull(detail.colour ?? detail.color),
    engineCapacityCc: toNumberOrNull(detail.engine_capacity_cc),
    enginePowerBhp: toNumberOrNull(detail.engine_power_bhp),
    price: toNumberOrNull(detail.forecourt_price_gbp ?? detail.price),
    description: toStringOrNull(detail.description),
    videoUrl: pickVideoUrl(detail),
    images,
    features,
    specs: specsSource ?? null,
  };
}

export function buildVehicleTitle(vehicle: VehicleDetailsData | null, fallback: string): string {
  if (!vehicle) return fallback;

  const title = [vehicle.year, vehicle.make, vehicle.model, vehicle.derivative]
    .map((part) => (part === null || part === undefined ? "" : String(part).trim()))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return title || fallback;
}

export function formatVehiclePrice(value: number | null, fallback = "Enquire"): string {
  if (value === null || !Number.isFinite(value)) return fallback;

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatVehicleMileage(value: number | null, fallback = "Mileage on request"): string {
  if (value === null || !Number.isFinite(value)) return fallback;

  return `${new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value)} miles`;
}
