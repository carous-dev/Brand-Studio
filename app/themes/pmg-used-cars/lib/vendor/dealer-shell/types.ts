/**
 * @carous/dealer-shell — shared TypeScript contracts for dealer apps.
 *
 * These types are the canonical shape host apps must produce; the shell's
 * components/hooks/normalizers all consume them. Keep narrow on purpose —
 * dealer-specific extensions belong in the host app's own `site.config.ts`,
 * not here.
 */

/** Minimum identity a dealer app must supply to bootstrap the shell. */
export type DealerConfig = {
  /** Numeric dealer ID from the Carous API (also `data-dealer-client-id` on widget tags). */
  dealerClientId: string;
  /** Brand display name (e.g. "Example Motors"). */
  brandName: string;
  /** Legal name, falls back to brandName when unset. */
  legalName?: string;
  /** Canonical site origin, no trailing slash (e.g. "https://example-motors.co.uk"). */
  siteUrl: string;
  /** Optional sibling hosts that 301-redirect to siteUrl. Useful for OG + canonicals only. */
  alternateHosts?: string[];
  /** Contact details surfaced in the layout chrome + widget data attributes. */
  contact: DealerContact;
  /** Postal address surfaced in JSON-LD + footer. */
  address: DealerAddress;
  /** Opening hours per ISO weekday (1 = Monday, 7 = Sunday). Hours as "HH:MM-HH:MM" or null when closed. */
  openingHours?: Partial<Record<1 | 2 | 3 | 4 | 5 | 6 | 7, string | null>>;
  /** Brand logo path (resolved relative to /public). */
  logoPath: string;
  /** Optional avatar image for the WhatsApp chat card (absolute URL). Falls back to the brand initial. */
  whatsappAvatarUrl?: string;
  /** Optional CDN/widgets host override; default `https://widgets.carous.co.uk`. */
  widgetsBaseUrl?: string;
  /** Visitor Chat (cdn.visitor.chat) integration. Off by default — opt in per dealer. */
  visitorChat?: DealerVisitorChat;
  /** Reserve-a-car widget. Off by default — opt in per dealer. */
  reservations?: DealerReservations;
};

/** Per-dealer reserve-a-car config consumed by `DealerWidgetScripts` + `VehicleDetailsShell`. */
export type DealerReservations = {
  /** Enable the reserve-a-car widget for this dealer. Defaults to false. */
  enabled: boolean;
  /** Hold-duration in hours surfaced to the buyer (e.g. "Hold expires in 24h"). Defaults to 24. */
  holdHours?: number;
  /** Optional CTA label override for the vehicle-details button. Defaults to "I want this car". */
  ctaLabel?: string;
};

/** Per-dealer Visitor Chat config consumed by `DealerWidgetScripts`. */
export type DealerVisitorChat = {
  /** Enable the visitor-chat widget for this dealer. Defaults to false. */
  enabled: boolean;
  /** Optional multi-account id (VC §3b). */
  vcId?: string;
  /** Optional multi-account integer accountId (VC §3b). */
  vcAccountId?: number;
  /** Optional display name shown in the chat box. Defaults to dealer brandName. */
  vcName?: string;
  /** Optional speech-bubble override (VC §3a `sbText`). */
  sbText?: string;
  /** Optional CTA title override (VC §3a `ctaTitle`). */
  ctaTitle?: string;
  /** Optional CTA text override (VC §3a `ctaText`). */
  ctaText?: string;
  /** Override the VC loader URL. Defaults to https://cdn.visitor.chat/vc-loader.min.js */
  loaderSrc?: string;
};

export type DealerContact = {
  /** International dial format, e.g. "+447710103700". */
  phoneE164?: string;
  /** Display phone, e.g. "07710 103700". */
  phoneDisplay?: string;
  /** Optional WhatsApp number (E.164 or wa.me URL). */
  whatsappNumber?: string;
  /** Optional WhatsApp click-to-chat URL (overrides whatsappNumber for `data-whatsapp-url`). */
  whatsappUrl?: string;
  email?: string;
};

export type DealerAddress = {
  line1?: string;
  line2?: string;
  town: string;
  county?: string;
  postcode?: string;
  /** ISO-3166-1 alpha-2; default "GB". */
  country?: string;
};

/** Theme contract a dealer app feeds into `<DealerLayoutShell theme>`. */
export type DealerTheme = {
  /** Stable theme id used as a `data-theme` body attribute. */
  id: string;
  /** Optional CSS class added to <html>; e.g. for a Tailwind preset class. */
  htmlClassName?: string;
  /** Brand-coloured tokens. Consumed as CSS custom properties on `.carous-shell`. */
  tokens?: Partial<DealerThemeTokens>;
  /** Which gallery widget variant fits this theme's vehicle details layout. */
  galleryTemplate?: "grid" | "thumbs" | "strip";
};

export type DealerThemeTokens = {
  brandPrimary: string;
  brandOnPrimary: string;
  brandAccent: string;
  bgSurface: string;
  fgPrimary: string;
  fgMuted: string;
  borderSubtle: string;
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  fontSans: string;
  fontDisplay: string;
};

/** A single label/value row inside a spec group (e.g. "0-62 mph" → "8.1s"). */
export type VehicleSpecItem = {
  name: string;
  value: string;
};

/** A titled group of spec rows as returned by the `/v1/vehicle` `specs[]` array. */
export type VehicleSpecGroup = {
  category: string | null;
  count: number | null;
  items: VehicleSpecItem[];
};

/** A feature/equipment entry with its optional AutoTrader-style category + type. */
export type VehicleFeatureDetail = {
  name: string;
  category: string | null;
  type: string | null;
};

/** Provenance flags from the upstream `vehicle_history` block. */
export type VehicleHistory = {
  scrapped: boolean | null;
  stolen: boolean | null;
  imported: boolean | null;
  exported: boolean | null;
  previousOwnersCount: number | null;
};

/**
 * Normalised vehicle returned by `normalizeVehiclePayload`.
 *
 * The core identity/spec/media fields are what every dealer app relies on; the
 * grouped block below (economy, dimensions, advert/advertiser metadata,
 * history, structured specs) surfaces the richer fields the `/v1/vehicle`
 * endpoint returns so a detail page can display the full picture. All are
 * additive + nullable — a caller can ignore them entirely.
 */
export type NormalizedVehicle = {
  slug: string;
  vin: string | null;
  registration: string | null;
  make: string | null;
  model: string | null;
  derivative: string | null;
  /** Trim level (e.g. "M Sport") when supplied separately from the derivative. */
  trim: string | null;
  /** Model generation label (e.g. "Mk8"). */
  generation: string | null;
  year: number | null;
  mileage: number | null;
  fuelType: string | null;
  transmission: string | null;
  bodyType: string | null;
  /** Drivetrain / drive type (e.g. "AWD", "FWD"). */
  drivetrain: string | null;
  /** Euro emission class (e.g. "Euro 6"). */
  emissionClass: string | null;
  /** "Used" / "New" / "Nearly new". */
  ownershipCondition: string | null;
  doors: number | null;
  seats: number | null;
  colour: string | null;
  /** Number of cylinders. */
  cylinders: number | null;
  engineCapacityCc: number | null;
  enginePowerBhp: number | null;
  /** WLTP/NEDC combined economy in miles-per-gallon. */
  fuelEconomyCombinedMpg: number | null;
  /** Tailpipe CO₂ in grams per km. */
  co2EmissionGpkm: number | null;
  /** Annual road tax (VED) in GBP. */
  vehicleExciseDutyGbp: number | null;
  /** Overall length in millimetres. */
  lengthMm: number | null;
  widthMm: number | null;
  heightMm: number | null;
  /** Boot capacity with seats up, in litres. */
  bootSpaceSeatsUpLitres: number | null;
  /** Boot capacity with seats folded, in litres. */
  bootSpaceSeatsDownLitres: number | null;
  /** ISO date string of first registration. */
  firstRegistrationDate: string | null;
  price: number | null;
  description: string | null;
  /** Short marketing hook shown above the description. */
  attentionGrabber: string | null;
  /** Stock lifecycle status (e.g. "in_stock", "reserved", "sold"). */
  stockStatus: string | null;
  /** AutoTrader-style price rating (e.g. "GREAT", "GOOD", "FAIR"). */
  priceIndicatorRating: string | null;
  /** Whether the advert is flagged as manufacturer-approved. */
  manufacturerApproved: boolean | null;
  /** Whether the advert carries 12 months' MOT. */
  twelveMonthsMot: boolean | null;
  /** Advertiser (dealer) contact block from the payload, when present. */
  advertiserName: string | null;
  advertiserPhone: string | null;
  advertiserWebsite: string | null;
  advertiserTown: string | null;
  advertiserRegion: string | null;
  advertiserPostcode: string | null;
  /** Provenance flags (owners, stolen/scrapped/import/export checks). */
  history: VehicleHistory | null;
  /** YouTube/Vimeo URL extracted from `videos[]` / `media[]` / direct payload fields. */
  videoUrl: string | null;
  images: string[];
  features: string[];
  /** Feature list with categories/types preserved (superset of `features`). */
  featureDetails: VehicleFeatureDetail[];
  /** Raw structured specs array as delivered by the API (untyped, back-compat). */
  specs: unknown;
  /** Typed, grouped spec sheet parsed from `specs[]`. */
  specGroups: VehicleSpecGroup[];
  /** Raw payload kept for app-specific extensions; never relied on by the shell. */
  raw: Record<string, unknown>;
};
