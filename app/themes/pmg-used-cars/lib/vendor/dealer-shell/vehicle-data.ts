/**
 * Canonical vehicle payload normaliser for dealer apps.
 *
 * Ported from the variants that ended up duplicated across
 * apps/{huntsmotors,berksmotors,cnhcars,csmotorsltd,motorsinc,
 * revupautosgroup,vagtechsolutionltd,visionprestige}/app/components/vehicle-data.ts,
 * plus the inline IIFE walkers in the apps that didn't have a vehicle-data.ts.
 *
 * Walks the four wrapper shapes the upstream /v1/vehicle API can return —
 * {vehicle:{vehicle:{...}, images, features, specs}} (huntsmotors-shape),
 * {vehicle:{...}, specs}, {...} flat, or array-of-records — and produces a
 * single NormalizedVehicle. Importantly: extracts `videoUrl` from the
 * `videos[]` array, `media[]` (type === "video"), and the nested
 * finance/pcp/hpCs paths — the gap that was silently breaking the gallery
 * widget's first-slide video tile on motorsinc + csmotorsltd before
 * commit ff50b7ea.
 */

import type {
  NormalizedVehicle,
  VehicleFeatureDetail,
  VehicleHistory,
  VehicleSpecGroup,
  VehicleSpecItem,
} from "./types";

const VIDEO_PATHS_FLAT = [
  "videoUrl",
  "video_url",
  "youtubeUrl",
  "youtube_url",
  "vimeoUrl",
  "vimeo_url",
] as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    const named = (value as { name?: unknown }).name;
    if (typeof named === "string" || typeof named === "number") {
      const trimmed = String(named).trim();
      return trimmed.length > 0 ? trimmed : null;
    }
  }
  return null;
}

function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isFinite(num) ? num : null;
}

function toBooleanOrNull(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value !== 0 : null;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;
    if (["1", "true", "yes", "y"].includes(normalized)) return true;
    if (["0", "false", "no", "n"].includes(normalized)) return false;
  }
  return null;
}

function getNestedString(source: unknown, ...path: string[]): string | null {
  let current: unknown = source;
  for (const key of path) {
    if (!isObject(current)) return null;
    current = current[key];
  }
  return toStringOrNull(current);
}

/** Direct + nested-finance/pcp video URL fields. */
function pickVideoUrlFromObject(detail: Record<string, unknown>): string | null {
  for (const key of VIDEO_PATHS_FLAT) {
    const direct = toStringOrNull(detail[key]);
    if (direct) return direct;
  }

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

/** Walk a `media[]` array picking the first item with type === "video". */
function pickVideoFromMedia(media: unknown): string | null {
  if (!Array.isArray(media)) return null;
  for (const item of media) {
    if (!isObject(item)) continue;
    const type = toStringOrNull(item.type);
    if (type && type.toLowerCase() !== "video") continue;
    const href = toStringOrNull(item.href ?? item.url);
    if (href) return href;
  }
  return null;
}

/** Walk a `videos[]` array picking the first item with a url/href. */
function pickVideoFromVideos(videos: unknown): string | null {
  if (!Array.isArray(videos)) return null;
  for (const item of videos) {
    if (!isObject(item)) continue;
    const url = toStringOrNull(item.url ?? item.href);
    if (url) return url;
  }
  return null;
}

type CandidateDetails = {
  detail: Record<string, unknown>;
  wrapper: Record<string, unknown> | null;
  wrapperVehicle: Record<string, unknown> | null;
  nestedVehicle: Record<string, unknown> | null;
  imagesSource: unknown;
  featuresSource: unknown;
  specsSource: unknown;
};

function resolveCandidate(payload: unknown): CandidateDetails | null {
  if (!isObject(payload)) return null;

  const wrapper = payload;
  const wrapperVehicle = isObject(wrapper.vehicle) ? wrapper.vehicle : null;
  const nestedVehicle = wrapperVehicle && isObject(wrapperVehicle.vehicle) ? wrapperVehicle.vehicle : null;

  // Three observed shapes:
  // (a) {vehicle: {vehicle: {...}, images, features, specs}}  — huntsmotors
  // (b) {vehicle: {...}, specs}                                — flatter
  // (c) {...}                                                   — already-detail
  if (nestedVehicle) {
    return {
      detail: nestedVehicle,
      wrapper,
      wrapperVehicle,
      nestedVehicle,
      imagesSource:
        wrapper.images ??
        wrapperVehicle?.images ??
        nestedVehicle.images,
      featuresSource:
        wrapper.features ??
        wrapperVehicle?.features ??
        nestedVehicle.features,
      specsSource:
        wrapper.specs ??
        wrapperVehicle?.specs ??
        nestedVehicle.specs,
    };
  }

  if (wrapperVehicle) {
    return {
      detail: wrapperVehicle,
      wrapper,
      wrapperVehicle,
      nestedVehicle: null,
      imagesSource: wrapper.images ?? wrapperVehicle.images,
      featuresSource: wrapper.features ?? wrapperVehicle.features,
      specsSource: wrapper.specs ?? wrapperVehicle.specs,
    };
  }

  return {
    detail: wrapper,
    wrapper,
    wrapperVehicle: null,
    nestedVehicle: null,
    imagesSource: wrapper.images,
    featuresSource: wrapper.features,
    specsSource: wrapper.specs,
  };
}

function collectImages(source: unknown, gallerySource: unknown): string[] {
  const fromGallery = Array.isArray(gallerySource)
    ? gallerySource
        .map((item) => {
          if (isObject(item)) {
            return toStringOrNull(
              item.url ?? item.href ?? item.HREF ?? item.href_string,
            );
          }
          return toStringOrNull(item);
        })
        .filter((value): value is string => Boolean(value))
    : [];
  if (fromGallery.length) return fromGallery;

  if (!Array.isArray(source)) return [];
  return source
    .map((item) => {
      if (isObject(item)) {
        return toStringOrNull(
          item.href ?? item.HREF ?? item.url ?? item.href_string,
        );
      }
      return toStringOrNull(item);
    })
    .filter((value): value is string => Boolean(value));
}

/** Parse the `features[]` array into detail records, preserving category/type. */
function collectFeatureDetails(source: unknown): VehicleFeatureDetail[] {
  if (!Array.isArray(source)) return [];
  return source
    .map((item): VehicleFeatureDetail | null => {
      if (typeof item === "string") {
        const trimmed = item.trim();
        return trimmed ? { name: trimmed, category: null, type: null } : null;
      }
      if (isObject(item)) {
        const name = toStringOrNull(item.name ?? item.label ?? item.title);
        if (!name) return null;
        return {
          name,
          category: toStringOrNull(item.category),
          type: toStringOrNull(item.type),
        };
      }
      return null;
    })
    .filter((item): item is VehicleFeatureDetail => Boolean(item));
}

/** Parse the `specs[]` array into typed groups of label/value rows. */
function collectSpecGroups(source: unknown): VehicleSpecGroup[] {
  if (!Array.isArray(source)) return [];
  return source
    .map((group): VehicleSpecGroup | null => {
      if (!isObject(group)) return null;
      const itemsSource = Array.isArray(group.items) ? group.items : [];
      const items = itemsSource
        .map((item): VehicleSpecItem | null => {
          if (!isObject(item)) return null;
          const name = toStringOrNull(item.name ?? item.label);
          const value = toStringOrNull(item.value ?? item.val ?? item.display);
          if (!name || !value) return null;
          return { name, value };
        })
        .filter((item): item is VehicleSpecItem => Boolean(item));
      if (!items.length) return null;
      return {
        category: toStringOrNull(group.category ?? group.name),
        count: toNumberOrNull(group.count ?? items.length),
        items,
      };
    })
    .filter((group): group is VehicleSpecGroup => Boolean(group));
}

function collectFeatures(source: unknown): string[] {
  if (!Array.isArray(source)) return [];
  return source
    .map((item) => {
      if (typeof item === "string") {
        const trimmed = item.trim();
        return trimmed || null;
      }
      if (isObject(item)) {
        return toStringOrNull(item.label ?? item.name ?? item.title);
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));
}

/**
 * Walk every wrapper variant + array fallback to find a `videoUrl`.
 * Always prefers explicit string fields over arrays so finance/pcp video
 * configs win over generic stock-video uploads.
 */
function pickVideoUrl(detail: Record<string, unknown>, candidate: CandidateDetails): string | null {
  const direct = pickVideoUrlFromObject(detail);
  if (direct) return direct;

  const { wrapper, wrapperVehicle, nestedVehicle } = candidate;

  for (const scope of [wrapperVehicle, wrapper, nestedVehicle]) {
    if (!scope) continue;
    const fromScope = pickVideoUrlFromObject(scope);
    if (fromScope) return fromScope;
  }

  for (const scope of [wrapper, wrapperVehicle, nestedVehicle, detail]) {
    if (!scope) continue;
    const fromVideos = pickVideoFromVideos((scope as Record<string, unknown>).videos);
    if (fromVideos) return fromVideos;
  }

  for (const scope of [wrapper, wrapperVehicle, nestedVehicle, detail]) {
    if (!scope) continue;
    const fromMedia = pickVideoFromMedia((scope as Record<string, unknown>).media);
    if (fromMedia) return fromMedia;
  }

  return null;
}

/**
 * Main entry point. Pass the raw response from `/v1/vehicle?slug=...` or
 * `/v1/vehicle?reg=...` and get back a typed, dealer-shape-agnostic record.
 */
export function normalizeVehiclePayload(payload: unknown): NormalizedVehicle | null {
  const candidate = resolveCandidate(payload);
  if (!candidate) return null;

  const { detail, wrapper, wrapperVehicle, nestedVehicle, imagesSource, featuresSource, specsSource } = candidate;
  const advert = isObject(wrapper?.advert) ? (wrapper.advert as Record<string, unknown>) : null;
  const advertiser = isObject(wrapper?.advertiser) ? (wrapper.advertiser as Record<string, unknown>) : null;
  const makeRow = isObject(wrapper?.make) ? (wrapper.make as Record<string, unknown>) : null;
  const modelRow = isObject(wrapper?.model) ? (wrapper.model as Record<string, unknown>) : null;
  const historyNode = isObject(wrapper?.vehicle_history)
    ? (wrapper.vehicle_history as Record<string, unknown>)
    : isObject(wrapper?.vehicleHistory)
      ? (wrapper.vehicleHistory as Record<string, unknown>)
      : null;

  const gallerySource =
    wrapper?.gallery ??
    wrapperVehicle?.gallery ??
    nestedVehicle?.gallery ??
    detail.gallery;

  const images = collectImages(imagesSource, gallerySource);
  const featureDetails = collectFeatureDetails(featuresSource);
  const features = featureDetails.length
    ? featureDetails.map((item) => item.name)
    : collectFeatures(featuresSource);
  const specGroups = collectSpecGroups(specsSource);

  const history: VehicleHistory | null = historyNode
    ? {
        scrapped: toBooleanOrNull(historyNode.scrapped),
        stolen: toBooleanOrNull(historyNode.stolen),
        imported: toBooleanOrNull(historyNode.imported),
        exported: toBooleanOrNull(historyNode.exported),
        previousOwnersCount: toNumberOrNull(
          historyNode.previous_owners_count ?? historyNode.previousOwnersCount,
        ),
      }
    : null;

  return {
    slug: toStringOrNull(detail.derivative_slug ?? detail.slug) || "",
    vin: toStringOrNull(detail.vin),
    registration: toStringOrNull(
      detail.registration ?? detail.reg ?? detail.registration_number,
    ),
    make: toStringOrNull(detail.make ?? makeRow?.name),
    model: toStringOrNull(detail.model ?? modelRow?.name),
    derivative: toStringOrNull(
      detail.derivative ?? detail.trim ?? detail.derivative_name ?? detail.sub_title,
    ),
    trim: toStringOrNull(detail.trim),
    generation: toStringOrNull(detail.generation),
    year: toNumberOrNull(detail.year_of_manufacture ?? detail.year),
    mileage: toNumberOrNull(detail.odometer_reading_miles ?? detail.mileage ?? detail.odometer),
    fuelType: toStringOrNull(detail.fuel_type ?? detail.fuel ?? detail.fuelType),
    transmission: toStringOrNull(detail.transmission_type ?? detail.transmission ?? detail.trans),
    bodyType: toStringOrNull(detail.body_type ?? detail.bodyType ?? detail.body),
    drivetrain: toStringOrNull(detail.drivetrain ?? detail.drive_train ?? detail.driveTrain),
    emissionClass: toStringOrNull(detail.emission_class ?? detail.emissionClass),
    ownershipCondition: toStringOrNull(
      detail.ownership_condition ?? detail.ownershipCondition ?? detail.condition,
    ),
    doors: toNumberOrNull(detail.doors ?? detail.door_count ?? detail.number_of_doors),
    seats: toNumberOrNull(detail.seats),
    colour: toStringOrNull(
      detail.colour ?? detail.color ?? detail.exterior_color ?? detail.exteriorColour,
    ),
    cylinders: toNumberOrNull(detail.cylinders ?? detail.cylinder_count ?? detail.cylinderCount),
    engineCapacityCc: toNumberOrNull(
      detail.engine_capacity_cc ?? detail.engine_capacity ?? detail.engineSizeCc ?? detail.engine_size_cc,
    ),
    enginePowerBhp: toNumberOrNull(
      detail.engine_power_bhp ?? detail.engine_power ?? detail.power,
    ),
    fuelEconomyCombinedMpg: toNumberOrNull(
      detail.fuel_economy_nedc_combined_mpg ??
        detail.fuel_economy_wltp_combined_mpg ??
        detail.fuel_economy ??
        detail.combined_mpg ??
        detail.mpg,
    ),
    co2EmissionGpkm: toNumberOrNull(detail.co2_emission_gpkm ?? detail.co2_emission ?? detail.co2),
    vehicleExciseDutyGbp: toNumberOrNull(
      detail.vehicle_excise_duty_gbp ?? detail.vehicleExciseDutyGbp ?? detail.ved_gbp ?? detail.vehicle_tax_gbp,
    ),
    lengthMm: toNumberOrNull(detail.length_mm ?? detail.lengthMm),
    widthMm: toNumberOrNull(detail.width_mm ?? detail.widthMm),
    heightMm: toNumberOrNull(detail.height_mm ?? detail.heightMm),
    bootSpaceSeatsUpLitres: toNumberOrNull(
      detail.boot_space_seats_up_litres ?? detail.boot_space_up_litres,
    ),
    bootSpaceSeatsDownLitres: toNumberOrNull(
      detail.boot_space_seats_down_litres ?? detail.boot_space_down_litres,
    ),
    firstRegistrationDate: toStringOrNull(
      detail.first_registration_date ?? detail.firstRegistrationDate,
    ),
    price: toNumberOrNull(
      detail.forecourt_price_gbp ??
        detail.price ??
        detail.price_gbp ??
        advert?.forecourt_price_gbp ??
        advert?.supplied_price_gbp ??
        advert?.price,
    ),
    description: toStringOrNull(
      detail.description ??
        detail.details ??
        detail.long_description ??
        advert?.attention_grabber,
    ),
    attentionGrabber: toStringOrNull(detail.attention_grabber ?? advert?.attention_grabber),
    stockStatus: toStringOrNull(
      detail.stock_status ?? detail.stockStatus ?? wrapper?.stock_status ?? wrapper?.stockStatus,
    ),
    priceIndicatorRating: toStringOrNull(
      advert?.price_indicator_rating ?? advert?.priceIndicatorRating ?? detail.price_indicator_rating,
    ),
    manufacturerApproved: toBooleanOrNull(
      advert?.manufacturer_approved ?? advert?.manufacturerApproved,
    ),
    twelveMonthsMot: toBooleanOrNull(advert?.twelve_months_mot ?? advert?.twelveMonthsMot),
    advertiserName: toStringOrNull(advertiser?.name ?? detail.advertiser_name ?? detail.advertiserName),
    advertiserPhone: toStringOrNull(advertiser?.phone ?? detail.advertiser_phone ?? detail.advertiserPhone),
    advertiserWebsite: toStringOrNull(
      advertiser?.website ?? detail.advertiser_website ?? detail.advertiserWebsite,
    ),
    advertiserTown: toStringOrNull(advertiser?.town ?? detail.town),
    advertiserRegion: toStringOrNull(advertiser?.region ?? detail.region),
    advertiserPostcode: toStringOrNull(advertiser?.post_code ?? advertiser?.postcode ?? detail.post_code),
    history,
    videoUrl: pickVideoUrl(detail, candidate),
    images,
    features,
    featureDetails,
    specs: specsSource ?? null,
    specGroups,
    raw: (wrapper ?? detail) as Record<string, unknown>,
  };
}

/**
 * Pure helper for callers that only need the videoUrl (e.g. when their
 * vehicle is already normalised by a per-app pipeline). Same walker as the
 * full normaliser.
 */
export function extractVideoUrl(payload: unknown): string | null {
  const candidate = resolveCandidate(payload);
  if (!candidate) return null;
  return pickVideoUrl(candidate.detail, candidate);
}
