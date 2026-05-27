export type VehicleFeatureDetail = {
  name: string;
  category: string | null;
  type: string | null;
};

export type VehicleSpecItem = {
  name: string;
  value: string;
};

export type VehicleSpecGroup = {
  category: string | null;
  count: number | null;
  items: VehicleSpecItem[];
};

export type VehicleHistory = {
  scrapped: boolean | null;
  stolen: boolean | null;
  imported: boolean | null;
  exported: boolean | null;
  previousOwnersCount: number | null;
};

export type VehicleDetailsData = {
  slug: string;
  vin: string | null;
  registration: string | null;
  make: string | null;
  model: string | null;
  derivative: string | null;
  trim: string | null;
  generation: string | null;
  year: number | null;
  mileage: number | null;
  fuelType: string | null;
  transmission: string | null;
  bodyType: string | null;
  drivetrain: string | null;
  emissionClass: string | null;
  ownershipCondition: string | null;
  doors: number | null;
  seats: number | null;
  colour: string | null;
  engineNumber: string | null;
  cylinders: number | null;
  engineCapacityCc: number | null;
  enginePowerBhp: number | null;
  co2EmissionGpkm: number | null;
  fuelEconomyNedcCombinedMpg: number | null;
  vehicleExciseDutyGbp: number | null;
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  bootSpaceSeatsUpLitres: number | null;
  bootSpaceSeatsDownLitres: number | null;
  firstRegistrationDate: string | null;
  originalId: string | null;
  price: number | null;
  description: string | null;
  videoUrl: string | null;
  stockStatus: string | null;
  attentionGrabber: string | null;
  advertId: string | null;
  advertPriceIndicatorRating: string | null;
  advertDateOnForecourt: string | null;
  advertLastUpdated: string | null;
  advertLifecycleState: string | null;
  advertStatus: string | null;
  advertFeatured: boolean | null;
  advertManufacturerApproved: boolean | null;
  advertTwelveMonthsMot: boolean | null;
  advertiserName: string | null;
  advertiserPhone: string | null;
  advertiserWebsite: string | null;
  advertiserAddressLineOne: string | null;
  advertiserTown: string | null;
  advertiserRegion: string | null;
  advertiserPostCode: string | null;
  vehicleHistory: VehicleHistory | null;
  media: Array<{
    type: string | null;
    href: string | null;
    url: string | null;
  }>;
  images: string[];
  image: string | null;
  features: string[];
  featureDetails: VehicleFeatureDetail[];
  specs: VehicleSpecGroup[];
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

function pickVideoFromVideos(videos: unknown): string | null {
  if (!Array.isArray(videos)) return null;
  for (const item of videos) {
    if (!isObject(item)) continue;
    const url = toStringOrNull(item.url ?? item.href);
    if (url) return url;
  }
  return null;
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

function normalizeFeatureDetail(item: unknown): VehicleFeatureDetail | null {
  if (typeof item === "string") {
    const trimmed = item.trim();
    return trimmed ? { name: trimmed, category: null, type: null } : null;
  }

  if (isObject(item)) {
    const name = toStringOrNull(item.name ?? item.label);
    if (!name) return null;
    return {
      name,
      category: toStringOrNull(item.category),
      type: toStringOrNull(item.type),
    };
  }

  return null;
}

function normalizeSpecGroups(specsSource: unknown): VehicleSpecGroup[] {
  if (!Array.isArray(specsSource)) return [];
  return specsSource
    .map((group) => {
      if (!isObject(group)) return null;
      const itemsSource = Array.isArray(group.items) ? group.items : [];
      const items = itemsSource
        .map((item) => {
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
    .filter((item): item is VehicleSpecGroup => Boolean(item));
}

function normalizeMediaItems(mediaSource: unknown): Array<{
  type: string | null;
  href: string | null;
  url: string | null;
}> {
  if (!Array.isArray(mediaSource)) return [];

  return mediaSource
    .map((item) => {
      if (!isObject(item)) return null;
      const type = toStringOrNull(item.type);
      const href = toStringOrNull(item.href ?? item.HREF);
      const url = toStringOrNull(item.url ?? item.href_string);
      if (!type && !href && !url) return null;
      return { type, href, url };
    })
    .filter((item): item is { type: string | null; href: string | null; url: string | null } => Boolean(item));
}

function getCandidateDetails(payload: unknown) {
  if (!isObject(payload)) {
    return null;
  }

  const vehicleNode = payload.vehicle;

  if (isObject(vehicleNode)) {
    // Shape 1: { vehicle: { vehicle: {...}, images: [...], features: [...] } }
    if (isObject(vehicleNode.vehicle)) {
      return {
        detail: vehicleNode.vehicle as Record<string, unknown>,
        imagesSource: vehicleNode.images ?? vehicleNode.media ?? (vehicleNode.vehicle as Record<string, unknown>).images,
        featuresSource: vehicleNode.features ?? (vehicleNode.vehicle as Record<string, unknown>).features,
        specsSource: vehicleNode.specs ?? payload.specs ?? (vehicleNode.vehicle as Record<string, unknown>).specs,
        wrapper: payload as Record<string, unknown>,
      };
    }

    // Shape 2: { vehicle: {...}, specs: [...] }
    return {
      detail: vehicleNode as Record<string, unknown>,
      imagesSource: vehicleNode.images ?? payload.images ?? payload.media,
      featuresSource: vehicleNode.features ?? payload.features,
      specsSource: payload.specs ?? vehicleNode.specs,
      wrapper: payload as Record<string, unknown>,
    };
  }

  // Shape 3: compact vehicle object at root
  return {
    detail: payload as Record<string, unknown>,
    imagesSource: payload.images ?? payload.media,
    featuresSource: payload.features,
    specsSource: payload.specs,
    wrapper: payload as Record<string, unknown>,
  };
}

export function normalizeVehiclePayload(payload: unknown): VehicleDetailsData | null {
  const candidate = getCandidateDetails(payload);
  if (!candidate) return null;

  const { detail, featuresSource, specsSource, wrapper } = candidate;
  const wrapperObj = wrapper && isObject(wrapper) ? wrapper : null;
  const advert = wrapperObj && isObject(wrapperObj.advert) ? (wrapperObj.advert as Record<string, unknown>) : null;
  const advertiser = wrapperObj && isObject(wrapperObj.advertiser) ? (wrapperObj.advertiser as Record<string, unknown>) : null;
  const historyNode =
    wrapperObj && isObject(wrapperObj.vehicle_history)
      ? (wrapperObj.vehicle_history as Record<string, unknown>)
      : wrapperObj && isObject(wrapperObj.vehicleHistory)
        ? (wrapperObj.vehicleHistory as Record<string, unknown>)
        : null;
  const makeRow = wrapperObj && isObject(wrapperObj.make) ? (wrapperObj.make as Record<string, unknown>) : null;
  const modelRow = wrapperObj && isObject(wrapperObj.model) ? (wrapperObj.model as Record<string, unknown>) : null;
  const wrapperVehicle = wrapperObj && isObject(wrapperObj.vehicle) ? (wrapperObj.vehicle as Record<string, unknown>) : null;
  const nestedVehicle = wrapperVehicle && isObject(wrapperVehicle.vehicle)
    ? (wrapperVehicle.vehicle as Record<string, unknown>)
    : null;
  const gallerySource =
    wrapperObj?.gallery ??
    wrapperVehicle?.gallery ??
    nestedVehicle?.gallery ??
    (isObject(detail) ? (detail as Record<string, unknown>).gallery : null);
  const mediaSource =
    wrapperObj?.media ??
    wrapperVehicle?.media ??
    nestedVehicle?.media ??
    (isObject(detail) ? (detail as Record<string, unknown>).media : null);
  const videosSource =
    wrapperObj?.videos ??
    wrapperVehicle?.videos ??
    nestedVehicle?.videos ??
    (isObject(detail) ? (detail as Record<string, unknown>).videos : null);
  const videoFromMedia = pickVideoFromMedia(mediaSource);
  const videoFromVideos = pickVideoFromVideos(videosSource);
  const media = normalizeMediaItems(mediaSource);

  const images = Array.isArray(gallerySource)
    ? gallerySource
        .map((item) => {
          if (isObject(item)) {
            return toStringOrNull(item.url ?? item.href ?? item.HREF ?? item.href_string);
          }
          return toStringOrNull(item);
        })
        .filter((item): item is string => Boolean(item))
    : [];
  const featureDetails = Array.isArray(featuresSource)
    ? featuresSource.map(normalizeFeatureDetail).filter((item): item is VehicleFeatureDetail => Boolean(item))
    : [];
  const features = featureDetails.length
    ? featureDetails.map((item) => item.name)
    : Array.isArray(featuresSource)
      ? featuresSource.map(normalizeFeatureLabel).filter((item): item is string => Boolean(item))
      : [];
  const specs = normalizeSpecGroups(specsSource);
  const vehicleHistory = historyNode
    ? {
        scrapped: toBooleanOrNull(historyNode.scrapped),
        stolen: toBooleanOrNull(historyNode.stolen),
        imported: toBooleanOrNull(historyNode.imported),
        exported: toBooleanOrNull(historyNode.exported),
        previousOwnersCount: toNumberOrNull(historyNode.previous_owners_count ?? historyNode.previousOwnersCount),
      }
    : null;

  return {
    slug: toStringOrNull(detail.derivative_slug) || "",
    vin: toStringOrNull(detail.vin),
    registration: toStringOrNull(detail.registration ?? detail.reg ?? detail.registration_number),
    make: toStringOrNull(detail.make ?? makeRow?.name),
    model: toStringOrNull(detail.model ?? modelRow?.name),
    derivative: toStringOrNull(detail.derivative ?? detail.trim ?? detail.derivative_name ?? detail.sub_title),
    trim: toStringOrNull(detail.trim),
    generation: toStringOrNull(detail.generation),
    year: toNumberOrNull(detail.year_of_manufacture ?? detail.year),
    mileage: toNumberOrNull(detail.odometer_reading_miles ?? detail.mileage ?? detail.odometer),
    fuelType: toStringOrNull(detail.fuel_type ?? detail.fuel ?? detail.fuelType),
    transmission: toStringOrNull(detail.transmission_type ?? detail.transmission ?? detail.trans),
    bodyType: toStringOrNull(detail.body_type ?? detail.bodyType ?? detail.body),
    drivetrain: toStringOrNull(detail.drivetrain ?? detail.drive_train ?? detail.driveTrain),
    emissionClass: toStringOrNull(detail.emission_class ?? detail.emissionClass),
    ownershipCondition: toStringOrNull(detail.ownership_condition ?? detail.ownershipCondition ?? detail.condition),
    doors: toNumberOrNull(detail.doors ?? detail.door_count ?? detail.number_of_doors),
    seats: toNumberOrNull(detail.seats),
    colour: toStringOrNull(detail.colour ?? detail.color ?? detail.exterior_color ?? detail.exteriorColour),
    engineNumber: toStringOrNull(detail.engine_number ?? detail.engineNumber),
    cylinders: toNumberOrNull(detail.cylinders ?? detail.cylinder_count ?? detail.cylinderCount),
    engineCapacityCc: toNumberOrNull(detail.engine_capacity_cc ?? detail.engine_capacity ?? detail.engineSizeCc ?? detail.engine_size_cc),
    enginePowerBhp: toNumberOrNull(detail.engine_power_bhp ?? detail.engine_power ?? detail.power),
    co2EmissionGpkm: toNumberOrNull(detail.co2_emission_gpkm ?? detail.co2_emission ?? detail.co2),
    fuelEconomyNedcCombinedMpg: toNumberOrNull(
      detail.fuel_economy_nedc_combined_mpg ?? detail.fuel_economy ?? detail.combined_mpg ?? detail.mpg
    ),
    vehicleExciseDutyGbp: toNumberOrNull(
      detail.vehicle_excise_duty_gbp ?? detail.vehicleExciseDutyGbp ?? detail.ved_gbp ?? detail.vehicle_tax_gbp
    ),
    lengthMm: toNumberOrNull(detail.length_mm ?? detail.lengthMm),
    widthMm: toNumberOrNull(detail.width_mm ?? detail.widthMm),
    heightMm: toNumberOrNull(detail.height_mm ?? detail.heightMm),
    bootSpaceSeatsUpLitres: toNumberOrNull(detail.boot_space_seats_up_litres ?? detail.boot_space_up_litres),
    bootSpaceSeatsDownLitres: toNumberOrNull(detail.boot_space_seats_down_litres ?? detail.boot_space_down_litres),
    firstRegistrationDate: toStringOrNull(detail.first_registration_date ?? detail.firstRegistrationDate),
    originalId: toStringOrNull(detail.original_id ?? detail.originalId),
    price: toNumberOrNull(
      detail.forecourt_price_gbp ??
        detail.price ??
        detail.price_gbp ??
        advert?.forecourt_price_gbp ??
        advert?.supplied_price_gbp ??
        advert?.price
    ),
    description: toStringOrNull(detail.description ?? detail.details ?? detail.long_description ?? advert?.attention_grabber),
    videoUrl: pickVideoUrl(detail) || videoFromVideos || videoFromMedia,
    stockStatus: toStringOrNull(detail.stock_status ?? detail.stockStatus ?? wrapperObj?.stock_status ?? wrapperObj?.stockStatus),
    attentionGrabber: toStringOrNull(detail.attention_grabber ?? advert?.attention_grabber),
    advertId: toStringOrNull(advert?.advert_id ?? advert?.id ?? advert?.advertId),
    advertPriceIndicatorRating: toStringOrNull(advert?.price_indicator_rating ?? advert?.priceIndicatorRating),
    advertDateOnForecourt: toStringOrNull(advert?.date_on_forecourt ?? advert?.dateOnForecourt),
    advertLastUpdated: toStringOrNull(advert?.last_updated ?? advert?.lastUpdated),
    advertLifecycleState: toStringOrNull(advert?.lifecycle_state ?? advert?.lifecycleState),
    advertStatus: toStringOrNull(advert?.status),
    advertFeatured: toBooleanOrNull(advert?.featured),
    advertManufacturerApproved: toBooleanOrNull(advert?.manufacturer_approved ?? advert?.manufacturerApproved),
    advertTwelveMonthsMot: toBooleanOrNull(advert?.twelve_months_mot ?? advert?.twelveMonthsMot),
    advertiserName: toStringOrNull(advertiser?.name ?? detail.advertiser_name ?? detail.advertiserName),
    advertiserPhone: toStringOrNull(advertiser?.phone ?? detail.advertiser_phone ?? detail.advertiserPhone),
    advertiserWebsite: toStringOrNull(advertiser?.website ?? detail.advertiser_website ?? detail.advertiserWebsite),
    advertiserAddressLineOne: toStringOrNull(advertiser?.address_line_one ?? detail.address_line_one),
    advertiserTown: toStringOrNull(advertiser?.town ?? detail.town),
    advertiserRegion: toStringOrNull(advertiser?.region ?? detail.region),
    advertiserPostCode: toStringOrNull(advertiser?.post_code ?? detail.post_code),
    vehicleHistory,
    media,
    images,
    image: toStringOrNull(detail.image ?? detail.primary_image ?? detail.primaryImage ?? detail.thumbnail ?? detail.image_url ?? detail.imageUrl),
    features,
    featureDetails,
    specs,
  };
}

export function extractVideoUrlFromPayload(payload: unknown): string | null {
  const candidate = getCandidateDetails(payload);
  if (!candidate) return null;

  const { detail, wrapper } = candidate;
  const wrapperObj = wrapper && isObject(wrapper) ? wrapper : null;
  const wrapperVehicle = wrapperObj && isObject(wrapperObj.vehicle) ? (wrapperObj.vehicle as Record<string, unknown>) : null;
  const nestedVehicle = wrapperVehicle && isObject(wrapperVehicle.vehicle)
    ? (wrapperVehicle.vehicle as Record<string, unknown>)
    : null;
  const videosSource =
    wrapperObj?.videos ??
    wrapperVehicle?.videos ??
    nestedVehicle?.videos ??
    (isObject(detail) ? (detail as Record<string, unknown>).videos : null);
  const mediaSource =
    wrapperObj?.media ??
    wrapperVehicle?.media ??
    nestedVehicle?.media ??
    (isObject(detail) ? (detail as Record<string, unknown>).media : null);

  return pickVideoUrl(detail) || pickVideoFromVideos(videosSource) || pickVideoFromMedia(mediaSource);
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

