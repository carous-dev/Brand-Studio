"use client";
// audit-ignore-file: tp-use-client-on-page
// Warwick baseline page; Mode B (clone-and-edit) ports inherit this.
// Extracting interactivity into client islands is a known follow-up — same
// risk-management as columbus-vehicles-bespoke/pages/used-cars/[slug]/page.tsx
// (see FEATURE_LOG 2026-05-10 for the Turbopack chunk-item collision rationale).

import {
  type CSSProperties,
  type PointerEvent,
  type TouchEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Script from "next/script";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Cog,
  DoorOpen,
  Expand,
  Fuel,
  Gauge,
  Globe,
  Mail,
  MapPin,
  Leaf,
  Palette,
  Phone,
  Tag,
  Timer,
  Users,
  ShieldCheck,
  X,
} from "lucide-react";
import styles from "./page.module.css";
import { apiUrl } from "../../../lib/api";
import { useBrand } from "../../../context/BrandClientWrapper";
import { getBrandContactInfo } from "../../../lib/contact";
import { normalizeInventoryItem } from "../../../lib/inventory";
import { buildVehiclePermalink, getVehicleLookupCandidates } from "../../../lib/vehicle-links";
import { HeroBackdrop } from "../../../components/HeroBackdrop";

type VehicleRecord = {
  vin: string;
  registration: string;
  make: string;
  model: string;
  derivative: string;
  trim: string;
  body_type: string;
  fuel_type: string;
  transmission_type: string;
  drivetrain: string;
  emission_class: string;
  colour: string;
  ownership_condition: string;
  seats: number;
  doors: number;
  cylinders: number;
  engine_capacity_cc: number;
  engine_power_bhp: number;
  co2_emission_gpkm: number;
  odometer_reading_miles: number;
  first_registration_date: string;
  year_of_manufacture: string;
  vehicle_excise_duty_gbp: string;
  length_mm: number;
  height_mm: number;
  width_mm: number;
  boot_space_seats_up_litres: number;
  boot_space_seats_down_litres: number;
  fuel_economy_nedc_combined_mpg: string;
  description: string;
  derivative_slug: string;
  original_id: string;
  price: string;
  attention_grabber: string;
  stock_status: string;
  advertiser_phone: string;
  advertiser_website: string;
  town: string;
};

type AdvertRecord = {
  advert_id: string;
  forecourt_price_gbp: string;
  last_updated: string;
  stock_status: string;
};

type VehicleHistoryRecord = {
  scrapped: number;
  stolen: number;
  imported: number;
  exported: number;
  previous_owners_count: number;
};

type VehicleFeature = {
  feature_id: number;
  name: string;
  category: string;
  type: string;
};

type VehicleSpecGroup = {
  category: string;
  count: string;
  items: Array<{ name: string; value: string }>;
};

type VehicleGalleryItem = {
  url: string;
  label: string;
  category: string;
};

type VehicleDetailsPayload = {
  vehicle: VehicleRecord;
  advert: AdvertRecord;
  vehicle_history: VehicleHistoryRecord;
  features: VehicleFeature[];
  specs: VehicleSpecGroup[];
  gallery: VehicleGalleryItem[];
  images: string[];
};

const EMPTY_VEHICLE_DETAILS: VehicleDetailsPayload = {
  vehicle: {
    vin: "",
    registration: "",
    make: "Vehicle",
    model: "",
    derivative: "",
    trim: "",
    body_type: "Car",
    fuel_type: "Petrol",
    transmission_type: "Manual",
    drivetrain: "",
    emission_class: "",
    colour: "Colour",
    ownership_condition: "Used",
    seats: 5,
    doors: 4,
    cylinders: 0,
    engine_capacity_cc: 0,
    engine_power_bhp: 0,
    co2_emission_gpkm: 0,
    odometer_reading_miles: 0,
    first_registration_date: "",
    year_of_manufacture: "",
    vehicle_excise_duty_gbp: "0",
    length_mm: 0,
    height_mm: 0,
    width_mm: 0,
    boot_space_seats_up_litres: 0,
    boot_space_seats_down_litres: 0,
    fuel_economy_nedc_combined_mpg: "",
    description: "Vehicle details available on request.",
    derivative_slug: "",
    original_id: "",
    price: "0",
    attention_grabber: "",
    stock_status: "in_stock",
    advertiser_phone: "",
    advertiser_website: "",
    town: "",
  },
  advert: {
    advert_id: "",
    forecourt_price_gbp: "0",
    last_updated: "",
    stock_status: "in_stock",
  },
  vehicle_history: {
    scrapped: 0,
    stolen: 0,
    imported: 0,
    exported: 0,
    previous_owners_count: 0,
  },
  features: [],
  specs: [],
  gallery: [],
  images: [],
};

function toText(input: unknown): string {
  if (input === null || input === undefined) return "";
  if (typeof input === "string" || typeof input === "number") return String(input).trim();
  if (typeof input === "object") {
    const named = (input as any).name;
    if (typeof named === "string" || typeof named === "number") return String(named).trim();
    const label = (input as any).label;
    if (typeof label === "string" || typeof label === "number") return String(label).trim();
  }
  return "";
}

function toNumber(input: unknown, fallback = 0): number {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  const text = toText(input).replace(/[^0-9.-]+/g, "");
  if (!text) return fallback;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function collectImages(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      if (typeof item === "object") {
        return toText((item as any).url || (item as any).href || (item as any).src || (item as any).image || (item as any).HREF);
      }
      return "";
    })
    .filter(Boolean);
}

function normalizeGallery(input: unknown): VehicleGalleryItem[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item, index) => {
      const url = typeof item === "string"
        ? item
        : toText((item as any)?.url || (item as any)?.href || (item as any)?.src || (item as any)?.image);
      if (!url) return null;
      const label = toText((item as any)?.label || (item as any)?.name) || `Vehicle image ${index + 1}`;
      const category = toText((item as any)?.category) || "Gallery";
      return { url, label, category };
    })
    .filter((item): item is VehicleGalleryItem => Boolean(item));
}

function buildFallbackSpecs(vehicle: VehicleRecord): VehicleSpecGroup[] {
  return [
    {
      category: "Performance",
      count: "4",
      items: [
        { name: "Cylinders", value: String(vehicle.cylinders || "-") },
        { name: "Engine power", value: String(vehicle.engine_power_bhp || "-") },
        { name: "Miles per gallon", value: String(vehicle.fuel_economy_nedc_combined_mpg || "-") },
        { name: "CO2", value: String(vehicle.co2_emission_gpkm || "-") },
      ],
    },
    {
      category: "Size and dimensions",
      count: "4",
      items: [
        { name: "Height", value: String(vehicle.height_mm || "-") },
        { name: "Length", value: String(vehicle.length_mm || "-") },
        { name: "Width", value: String(vehicle.width_mm || "-") },
        { name: "Seats", value: String(vehicle.seats || "-") },
      ],
    },
  ];
}

function normalizeSpecs(input: unknown, vehicle: VehicleRecord): VehicleSpecGroup[] {
  if (!Array.isArray(input)) return buildFallbackSpecs(vehicle);

  const normalized = input
    .map((group) => {
      const category = toText((group as any)?.category) || "Specification";
      const items = Array.isArray((group as any)?.items)
        ? (group as any).items
            .map((item: any) => {
              const name = toText(item?.name);
              const value = toText(item?.value);
              if (!name || !value) return null;
              return { name, value };
            })
            .filter((item: any): item is { name: string; value: string } => Boolean(item))
        : [];

      if (!items.length) return null;

      return {
        category,
        count: String((group as any)?.count ?? items.length),
        items,
      };
    })
    .filter((item): item is VehicleSpecGroup => Boolean(item));

  return normalized.length ? normalized : buildFallbackSpecs(vehicle);
}

function resolveVehiclePayload(payload: unknown): Record<string, any> | null {
  if (!payload || typeof payload !== "object") return null;

  const queue: any[] = [payload];

  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;

    const vehicleNode = (current as any).vehicle;
    if (vehicleNode && typeof vehicleNode === "object") {
      if (vehicleNode.vehicle && typeof vehicleNode.vehicle === "object") {
        queue.push(vehicleNode);
      }
      if (
        vehicleNode.registration ||
        vehicleNode.vin ||
        vehicleNode.make ||
        vehicleNode.model ||
        vehicleNode.derivative
      ) {
        return current as Record<string, any>;
      }
    }

    if ((current as any).registration || (current as any).vin) {
      return { vehicle: current } as Record<string, any>;
    }

    if ((current as any).data && typeof (current as any).data === "object") {
      queue.push((current as any).data);
    }
    if ((current as any).item && typeof (current as any).item === "object") {
      queue.push((current as any).item);
    }
  }

  return null;
}

function normalizeVehiclePayload(payload: unknown): VehicleDetailsPayload | null {
  const resolved = resolveVehiclePayload(payload);
  if (!resolved) return null;

  const source = resolved.vehicle && resolved.vehicle.vehicle ? resolved.vehicle : resolved;
  const vehicleNode = source.vehicle && typeof source.vehicle === "object" ? source.vehicle : source;
  if (!vehicleNode || typeof vehicleNode !== "object") return null;

  const advertNode = source.advert && typeof source.advert === "object" ? source.advert : {};
  const historyNode = source.vehicle_history && typeof source.vehicle_history === "object" ? source.vehicle_history : {};

  const make = toText(source.make?.name ?? vehicleNode.make) || "Vehicle";
  const model = toText(source.model?.name ?? vehicleNode.model);
  const derivative = toText(vehicleNode.derivative ?? vehicleNode.trim);

  const priceText = toText(advertNode.forecourt_price_gbp ?? advertNode.price ?? vehicleNode.price) || "0";
  const stockStatus = toText(vehicleNode.stock_status ?? advertNode.stock_status ?? source.stock_status) || "in_stock";

  const gallery = normalizeGallery(source.gallery ?? vehicleNode.gallery);
  const images = unique([
    ...gallery.map((item) => item.url),
    ...collectImages(source.images),
    ...collectImages(source.media),
    ...collectImages(vehicleNode.images),
    toText(vehicleNode.image),
  ]);

  const normalizedGallery = gallery.length
    ? gallery
    : images.map((url, index) => ({ url, label: `Vehicle image ${index + 1}`, category: "Gallery" }));

  const normalizedVehicle: VehicleRecord = {
    vin: toText(vehicleNode.vin),
    registration: toText(vehicleNode.registration),
    make,
    model,
    derivative,
    trim: toText(vehicleNode.trim),
    body_type: toText(vehicleNode.body_type ?? vehicleNode.bodyType) || "Car",
    fuel_type: toText(vehicleNode.fuel_type ?? vehicleNode.fuel) || "Petrol",
    transmission_type: toText(vehicleNode.transmission_type ?? vehicleNode.trans) || "Manual",
    drivetrain: toText(vehicleNode.drivetrain),
    emission_class: toText(vehicleNode.emission_class),
    colour: toText(vehicleNode.colour ?? vehicleNode.color) || "Colour",
    ownership_condition: toText(vehicleNode.ownership_condition) || "Used",
    seats: toNumber(vehicleNode.seats, 5),
    doors: toNumber(vehicleNode.doors, 4),
    cylinders: toNumber(vehicleNode.cylinders, 0),
    engine_capacity_cc: toNumber(vehicleNode.engine_capacity_cc, 0),
    engine_power_bhp: toNumber(vehicleNode.engine_power_bhp, 0),
    co2_emission_gpkm: toNumber(vehicleNode.co2_emission_gpkm, 0),
    odometer_reading_miles: toNumber(vehicleNode.odometer_reading_miles ?? vehicleNode.mileage, 0),
    first_registration_date: toText(vehicleNode.first_registration_date),
    year_of_manufacture: toText(vehicleNode.year_of_manufacture ?? vehicleNode.year),
    vehicle_excise_duty_gbp: toText(vehicleNode.vehicle_excise_duty_gbp) || "0",
    length_mm: toNumber(vehicleNode.length_mm, 0),
    height_mm: toNumber(vehicleNode.height_mm, 0),
    width_mm: toNumber(vehicleNode.width_mm, 0),
    boot_space_seats_up_litres: toNumber(vehicleNode.boot_space_seats_up_litres, 0),
    boot_space_seats_down_litres: toNumber(vehicleNode.boot_space_seats_down_litres, 0),
    fuel_economy_nedc_combined_mpg: toText(vehicleNode.fuel_economy_nedc_combined_mpg),
    description: toText(vehicleNode.description || advertNode.attention_grabber) || "Vehicle details available on request.",
    derivative_slug: toText(vehicleNode.derivative_slug),
    original_id: toText(vehicleNode.original_id ?? vehicleNode.id),
    price: priceText,
    attention_grabber: toText(vehicleNode.attention_grabber ?? advertNode.attention_grabber),
    stock_status: stockStatus,
    advertiser_phone: toText(vehicleNode.advertiser_phone ?? source.advertiser?.phone),
    advertiser_website: toText(vehicleNode.advertiser_website ?? source.advertiser?.website),
    town: toText(vehicleNode.town ?? source.advertiser?.town),
  };

  const features: VehicleFeature[] = Array.isArray(source.features)
    ? source.features
        .map((feature: any, index: number) => {
          const name = toText(feature?.name ?? feature);
          if (!name) return null;
          return {
            feature_id: toNumber(feature?.feature_id, index + 1),
            name,
            category: toText(feature?.category) || "Other",
            type: toText(feature?.type) || "Standard",
          };
        })
        .filter((feature: VehicleFeature | null): feature is VehicleFeature => Boolean(feature))
    : [];

  const normalizedAdvert: AdvertRecord = {
    advert_id: toText(advertNode.advert_id ?? vehicleNode.original_id),
    forecourt_price_gbp: priceText,
    last_updated: toText(advertNode.last_updated ?? advertNode.date_on_forecourt),
    stock_status: stockStatus,
  };

  const vehicleHistory: VehicleHistoryRecord = {
    scrapped: toNumber(historyNode.scrapped, 0),
    stolen: toNumber(historyNode.stolen, 0),
    imported: toNumber(historyNode.imported, 0),
    exported: toNumber(historyNode.exported, 0),
    previous_owners_count: toNumber(historyNode.previous_owners_count, 0),
  };

  return {
    vehicle: normalizedVehicle,
    advert: normalizedAdvert,
    vehicle_history: vehicleHistory,
    features,
    specs: normalizeSpecs(source.specs, normalizedVehicle),
    gallery: normalizedGallery,
    images,
  };
}

async function fetchVehicleFromTarget(target: string, signal: AbortSignal): Promise<VehicleDetailsPayload | null> {
  try {
    const response = await fetch(target, { cache: "no-store", signal });
    if (!response.ok) return null;
    const payload = await response.json().catch(() => null);
    return normalizeVehiclePayload(payload);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    return null;
  }
}

function appendBrand(target: string, brand?: string | null): string {
  if (!target) return target;
  const slug = (brand || "").trim();
  if (!slug) return target;
  const separator = target.includes("?") ? "&" : "?";
  return `${target}${separator}brand=${encodeURIComponent(slug)}`;
}

async function fetchVehicleByLookupValue(
  value: string,
  signal: AbortSignal,
  brand?: string | null,
): Promise<VehicleDetailsPayload | null> {
  const trimmed = value.trim();
  if (!trimmed) return null;

  for (const candidate of getVehicleLookupCandidates(trimmed)) {
    const targets = [
      candidate.slug ? apiUrl(`/vehicle?slug=${encodeURIComponent(candidate.slug)}`) : '',
      candidate.reg ? apiUrl(`/vehicle?slug=${encodeURIComponent(candidate.reg)}`) : '',
      candidate.slug ? apiUrl(`/vehicle/${encodeURIComponent(candidate.slug)}`) : '',
      candidate.reg ? apiUrl(`/vehicle/${encodeURIComponent(candidate.reg)}`) : '',
    ].filter(Boolean).map((target) => appendBrand(target, brand));

    for (const target of targets) {
      const resolved = await fetchVehicleFromTarget(target, signal);
      if (resolved) return resolved;
    }
  }

  return null;
}

function inventoryMatchScore(item: { slug?: string; title: string }, candidate: string): number {
  const normalizedCandidate = candidate.trim().toLowerCase();
  if (!normalizedCandidate) return 0;

  const itemSlug = String(item.slug ?? "").trim().toLowerCase();
  const titleSlug = toSlug(item.title);

  if (itemSlug && itemSlug === normalizedCandidate) return 100;
  if (titleSlug && titleSlug === normalizedCandidate) return 95;
  if (itemSlug && normalizedCandidate.endsWith(itemSlug)) return 80;
  if (titleSlug && normalizedCandidate.endsWith(titleSlug)) return 75;
  if (itemSlug && itemSlug.includes(normalizedCandidate)) return 60;
  if (titleSlug && titleSlug.includes(normalizedCandidate)) return 55;
  if (itemSlug && normalizedCandidate.includes(itemSlug)) return 50;
  if (titleSlug && normalizedCandidate.includes(titleSlug)) return 45;
  return 0;
}

async function fetchVehiclePayloadFromInventoryFallback(
  slugCandidates: string[],
  signal: AbortSignal,
  brand?: string | null,
): Promise<VehicleDetailsPayload | null> {
  for (const candidate of slugCandidates) {
    const queryCandidates = unique([candidate, candidate.replace(/-/g, " ").trim()]);

    for (const queryCandidate of queryCandidates) {
      if (!queryCandidate) continue;

      const params = new URLSearchParams({
        page: "1",
        per_page: "24",
        sort: "newest",
        q: queryCandidate,
        light: "1",
        vehicle_type: "car",
      });
      const brandSlug = (brand || "").trim();
      if (brandSlug) params.set("brand", brandSlug);

      const target = apiUrl(`/inventory?${params.toString()}`);
      let payload: any = null;

      try {
        const response = await fetch(target, { cache: "no-store", signal });
        if (!response.ok) continue;
        payload = await response.json().catch(() => null);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw error;
        }
        continue;
      }

      const items = Array.isArray(payload?.items) ? payload.items : [];
      const normalizedItems = items
        .map((item: unknown) => normalizeInventoryItem(item))
        .filter(
          (item: ReturnType<typeof normalizeInventoryItem>): item is NonNullable<ReturnType<typeof normalizeInventoryItem>> =>
            Boolean(item)
        );
      if (!normalizedItems.length) continue;

      type RankedInventoryItem = {
        item: NonNullable<ReturnType<typeof normalizeInventoryItem>>;
        score: number;
      };

      const rankedItems: RankedInventoryItem[] = normalizedItems
        .map((item: NonNullable<ReturnType<typeof normalizeInventoryItem>>) => ({
          item,
          score: inventoryMatchScore(item, candidate),
        }))
        .sort((a: RankedInventoryItem, b: RankedInventoryItem) => b.score - a.score);

      const bestMatch = rankedItems[0];
      if (!bestMatch || bestMatch.score < 45) continue;

      const lookupValues = unique([bestMatch.item.slug ?? "", bestMatch.item.id]);
      for (const lookupValue of lookupValues) {
        const resolved = await fetchVehicleByLookupValue(lookupValue, signal, brand);
        if (resolved) return resolved;
      }
    }
  }

  return null;
}

async function fetchVehiclePayloadBySlug(
  slug: string,
  signal: AbortSignal,
  brand?: string | null,
): Promise<VehicleDetailsPayload | null> {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return null;

  const decodedSlug = (() => {
    try {
      return decodeURIComponent(normalizedSlug);
    } catch {
      return normalizedSlug;
    }
  })();

  const slugCandidates = unique([
    normalizedSlug,
    decodedSlug,
    normalizedSlug.includes("--") ? normalizedSlug.split("--").pop() || "" : "",
    decodedSlug.replace(/^\d{4}-/, ""),
  ]);

  for (const candidate of slugCandidates) {
    const resolved = await fetchVehicleByLookupValue(candidate, signal, brand);
    if (resolved) return resolved;
  }

  return fetchVehiclePayloadFromInventoryFallback(slugCandidates, signal, brand);
}

const SWIPE_THRESHOLD = 42;
const MODERN_GALLERY_PAGE_SIZE = 5;
const OVERVIEW_PREVIEW_COUNT = 1;
const WIDGETS_BASE_URL =
  process.env.NEXT_PUBLIC_WIDGETS_BASE_URL?.replace(/\/+$/, "") || "https://widgets.carous.co.uk";
const VEHICLE_ENQUIRY_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/vehicle-enquiry/latest/vehicle-enquiry.js`;
const RESERVE_WIDGET_SRC = `${WIDGETS_BASE_URL}/widgets/reserve-a-car/latest/reserve-a-car.js`;

type VehicleActionWidgetKind = "enquiry" | "reserve";

type VehicleActionWidgetConfig = Record<string, unknown> & {
  brandName?: string;
  dealerName?: string;
  leadOwner?: string;
  leadEndpoint?: string;
  leadType?: string;
  leadSource?: string;
  defaultIntent?: string;
  holdHours?: number;
  contact?: {
    phoneTel?: string;
    phoneDisplay?: string;
    whatsappUrl?: string;
    email?: string;
  };
};

type VehicleActionWidgetSummary = {
  title?: string;
  registration?: string;
  stock?: string;
  make?: string;
  model?: string;
  derivative?: string;
  year?: number | string;
  price?: number;
  priceText?: string;
  mileage?: number | string;
  transmission?: string;
  fuel?: string;
  engineSize?: string;
  image?: string;
  url: string;
};

type VehicleActionWidgetApi = {
  open?: (options: { vehicle: VehicleActionWidgetSummary }) => void;
  close?: () => void;
  configure?: (config: VehicleActionWidgetConfig) => void;
};

type WindowWithVehicleActionWidgets = Window & {
  CarousVehicleEnquiry?: VehicleActionWidgetApi;
  CarousReserveACar?: VehicleActionWidgetApi;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function formatStockStatus(value: string | null | undefined) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return "In stock";
  if (["sold", "sold_out", "out_of_stock"].includes(normalized)) return "Sold";
  if (["reserved", "on_hold", "hold", "pending"].includes(normalized)) return "Reserved";
  if (["in_stock", "available", "instock", "in stock"].includes(normalized)) return "In stock";
  return normalized.replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeLeadOwner(value: unknown) {
  return String(value || "warwick-dealer")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "warwick-dealer";
}

function getVehicleActionWidget(kind: VehicleActionWidgetKind) {
  if (typeof window === "undefined") return undefined;
  const win = window as WindowWithVehicleActionWidgets;
  return kind === "reserve" ? win.CarousReserveACar : win.CarousVehicleEnquiry;
}

function waitForVehicleActionWidget(kind: VehicleActionWidgetKind) {
  const existing = getVehicleActionWidget(kind);
  if (existing?.open) return Promise.resolve(existing);

  return new Promise<VehicleActionWidgetApi | undefined>((resolve) => {
    if (typeof window === "undefined") {
      resolve(undefined);
      return;
    }

    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      const widget = getVehicleActionWidget(kind);
      if (widget?.open || attempts >= 30) {
        window.clearInterval(interval);
        resolve(widget);
      }
    }, 100);
  });
}

function VehicleDetailsSkeleton() {
  return (
    <main className={styles.page} aria-busy="true" aria-live="polite">
      <section className={styles.hero}>
        <HeroBackdrop />
        <div className={styles.heroInner}>
          <div className={styles.heroShell}>
            <p className={styles.srOnly}>Loading vehicle details...</p>
            <span className={`${styles.skeletonBlock} ${styles.skeletonHeroTitle}`} aria-hidden="true" />
            <span className={`${styles.skeletonBlock} ${styles.skeletonHeroLead}`} aria-hidden="true" />
            <span className={`${styles.skeletonBlock} ${styles.skeletonHeroLeadShort}`} aria-hidden="true" />
            <div className={styles.heroActions}>
              <span className={`${styles.skeletonBlock} ${styles.skeletonHeroButton}`} aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.contentGrid}>
            <div className={styles.galleryColumn}>
              <article className={styles.galleryCard}>
                <div className={`${styles.skeletonBlock} ${styles.skeletonGallery}`} aria-hidden="true" />
              </article>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.stickyCard}>
                <div className={styles.sideCard}>
                  <span className={`${styles.skeletonBlock} ${styles.skeletonSectionTitle}`} aria-hidden="true" />
                  <div className={styles.sideStats}>
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={`side-stats-skeleton-${index}`}>
                        <span className={`${styles.skeletonBlock} ${styles.skeletonRowShort}`} aria-hidden="true" />
                        <span className={`${styles.skeletonBlock} ${styles.skeletonStatValue}`} aria-hidden="true" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.sideCard}>
                  <span className={`${styles.skeletonBlock} ${styles.skeletonSectionTitle}`} aria-hidden="true" />
                  <div className={styles.checkList}>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <span key={`assurance-skeleton-${index}`}>
                        <span className={`${styles.skeletonBlock} ${styles.skeletonRow}`} aria-hidden="true" />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className={styles.mainColumn}>
              <div className={styles.priceCard}>
                <div className={styles.priceRow}>
                  <span className={`${styles.skeletonBlock} ${styles.skeletonPriceTag}`} aria-hidden="true" />
                  <span className={`${styles.skeletonBlock} ${styles.skeletonBadge}`} aria-hidden="true" />
                </div>
                <span className={`${styles.skeletonBlock} ${styles.skeletonRow}`} aria-hidden="true" />
                <span className={`${styles.skeletonBlock} ${styles.skeletonPriceMeta}`} aria-hidden="true" />
              </div>

              <section className={styles.summaryGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div className={styles.summaryCard} key={`summary-skeleton-${index}`}>
                    <div className={styles.summaryHeader}>
                      <span className={`${styles.skeletonBlock} ${styles.skeletonBadge}`} aria-hidden="true" />
                      <span className={`${styles.skeletonBlock} ${styles.skeletonRowShort}`} aria-hidden="true" />
                    </div>
                    <span className={`${styles.skeletonBlock} ${styles.skeletonSummaryValue}`} aria-hidden="true" />
                  </div>
                ))}
              </section>

              <section className={styles.contentCard}>
                <span className={`${styles.skeletonBlock} ${styles.skeletonSectionTitle}`} aria-hidden="true" />
                <span className={`${styles.skeletonBlock} ${styles.skeletonParagraph}`} aria-hidden="true" />
                <span className={`${styles.skeletonBlock} ${styles.skeletonParagraph}`} aria-hidden="true" />
                <span className={`${styles.skeletonBlock} ${styles.skeletonParagraphShort}`} aria-hidden="true" />
              </section>

              <section className={styles.contentCard}>
                <span className={`${styles.skeletonBlock} ${styles.skeletonSectionTitle}`} aria-hidden="true" />
                <div className={styles.specsGrid}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div className={styles.specItem} key={`spec-skeleton-${index}`}>
                      <span className={`${styles.skeletonBlock} ${styles.skeletonBadge}`} aria-hidden="true" />
                      <span className={`${styles.skeletonBlock} ${styles.skeletonParagraphShort}`} aria-hidden="true" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function VehicleNotFoundTemplate({
  message,
  slug,
}: {
  message: string;
  slug: string;
}) {
  const __brand = useBrand();
  const __contact = getBrandContactInfo(__brand);
  const WARWICK_PHONE_DISPLAY = __contact.phoneDisplay;
  const WARWICK_PHONE_TEL = __contact.phoneTel;
  const WARWICK_WHATSAPP_URL = __contact.whatsappUrl;
  const listingReference = slug ? `Reference: ${slug}` : "Reference unavailable";

  return (
    <main className={styles.notFoundPage}>
      <section className={styles.notFoundHero} aria-labelledby="vehicle-not-found-title">
        <div className={styles.notFoundInner}>
          <p className={styles.notFoundKicker}>Vehicle unavailable</p>
          {/* audit-ignore: a11y-h1-multiple — this h1 only renders in the not-found branch; the details branch's h1 (line ~1336) is mutually exclusive */}
          <h1 id="vehicle-not-found-title" className={styles.notFoundTitle}>
            Vehicle not found.
          </h1>
          <p className={styles.notFoundLead}>
            {message || "This listing may have been sold, removed, or replaced with a newer advert."}
          </p>
          <p className={styles.notFoundReference}>{listingReference}</p>

          <div className={styles.notFoundActions}>
            <Link href="/used-cars" className={styles.notFoundAction}>
              Back to used cars
            </Link>
            <Link href="/contact-us" className={styles.notFoundAction}>
              Contact us
            </Link>
          </div>

          <div className={styles.notFoundLinks} aria-label="Helpful shortcuts">
            <Link href="/finance" className={styles.notFoundInlineLink}>
              Finance
            </Link>
            <span className={styles.notFoundSeparator} aria-hidden="true">
              ·
            </span>
            <Link href="/sell-my-car" className={styles.notFoundInlineLink}>
              Part exchange
            </Link>
            <span className={styles.notFoundSeparator} aria-hidden="true">
              ·
            </span>
            <a className={styles.notFoundInlineLink} href={`tel:${WARWICK_PHONE_TEL}`}>
              Call {WARWICK_PHONE_DISPLAY}
            </a>
            <span className={styles.notFoundSeparator} aria-hidden="true">
              ·
            </span>
            <a className={styles.notFoundInlineLink} href={WARWICK_WHATSAPP_URL} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export function WarwickVehicleDetailPage() {
  const __brand = useBrand();
  const __contact = getBrandContactInfo(__brand);
  const WARWICK_PHONE_DISPLAY = __contact.phoneDisplay;
  const WARWICK_PHONE_TEL = __contact.phoneTel;
  const WARWICK_WHATSAPP_URL = __contact.whatsappUrl;
  const params = useParams<{ slug?: string | string[] }>();
  const slug = useMemo(() => {
    const raw = params?.slug;
    if (Array.isArray(raw)) return raw[0] || "";
    return raw || "";
  }, [params]);

  const [vehicleData, setVehicleData] = useState<VehicleDetailsPayload | null>(null);
  const [isVehicleLoading, setIsVehicleLoading] = useState(true);
  const [vehicleLoadError, setVehicleLoadError] = useState<string | null>(null);
  const [isContentVisible, setIsContentVisible] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    async function loadVehicle() {
      if (!slug) {
        if (!isMounted) return;
        setVehicleData(null);
        setVehicleLoadError("Missing vehicle identifier.");
        setIsVehicleLoading(false);
        return;
      }

      setIsVehicleLoading(true);
      setVehicleLoadError(null);

      try {
        const nextVehicle = await fetchVehiclePayloadBySlug(slug, controller.signal, __brand?.slug);
        if (!isMounted) return;
        if (!nextVehicle) {
          setVehicleData(null);
          setVehicleLoadError("Vehicle not found.");
          setIsVehicleLoading(false);
          return;
        }
        setVehicleData(nextVehicle);
        setVehicleLoadError(null);
      } catch (error) {
        if (!isMounted) return;
        if (error instanceof Error && error.name === "AbortError") return;
        setVehicleData(null);
        setVehicleLoadError("Unable to load vehicle details right now.");
      } finally {
        if (isMounted) {
          setIsVehicleLoading(false);
        }
      }
    }

    loadVehicle();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [slug]);

  const detailData = vehicleData ?? EMPTY_VEHICLE_DETAILS;
  const { vehicle, advert, vehicle_history: history, features, specs, gallery, images } = detailData;
  const isVehicleReady = Boolean(vehicleData);
  const canonicalPath = useMemo(
    () => buildVehiclePermalink({ slug, reg: vehicle.registration || vehicle.vin }, '/used-cars'),
    [slug, vehicle.registration, vehicle.vin],
  );
  const listingLabel = useMemo(
    () =>
      [vehicle.year_of_manufacture, vehicle.make, vehicle.model, vehicle.derivative]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean)
        .join(" ") || "Vehicle details",
    [vehicle.derivative, vehicle.make, vehicle.model, vehicle.year_of_manufacture],
  );
  const vehicleViewSubject = useMemo(
    () =>
      vehicleData
        ? {
            advertId: (advert as any)?.advert_id ?? null,
            vehicleKey: (advert as any)?.advert_id || vehicle.registration || vehicle.vin || slug || null,
            slug,
            registration: vehicle.registration || null,
            vin: vehicle.vin || null,
            label: listingLabel,
            path: canonicalPath,
          }
        : null,
    [advert, canonicalPath, listingLabel, slug, vehicle.registration, vehicle.vin, vehicleData],
  );
  useEffect(() => {
    if (isVehicleLoading || !isVehicleReady) {
      setIsContentVisible(false);
      return;
    }

    const frameId = window.requestAnimationFrame(() => setIsContentVisible(true));
    return () => window.cancelAnimationFrame(frameId);
  }, [isVehicleLoading, isVehicleReady, slug]);

  const price = Number(vehicle.price);
  const financeMonthly = Math.round(price / 48);
  const galleryImages = useMemo(() => {
    const source = gallery.length ? gallery : images.map((url) => ({ url, label: "Vehicle image" }));
    return source.map((item, index) => ({
      src: item.url,
      alt: item.label ? `${item.label} view` : `Vehicle image ${index + 1}`,
    }));
  }, [gallery, images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isModernGallery, setIsModernGallery] = useState(false);
  const [galleryPageIndex, setGalleryPageIndex] = useState(0);
  const [maxLoadedIndex, setMaxLoadedIndex] = useState(0);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const lightboxCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const lightboxFocusRestoreRef = useRef<HTMLElement | null>(null);
  const touchStateRef = useRef({ active: false, startX: 0, startY: 0, pointerId: -1 });
  const swipeGuardRef = useRef(false);
  const modernGalleryRef = useRef<HTMLDivElement | null>(null);
  const modernGalleryScrollRaf = useRef<number | null>(null);

  useEffect(() => {
    setActiveIndex(0);
    setLightboxIndex(0);
    setGalleryPageIndex(0);
    setMaxLoadedIndex(0);
    setIsOverviewExpanded(false);
    setIsLightboxOpen(false);
  }, [slug]);

  const descriptionParagraphs = useMemo(
    () => vehicle.description.split("\n").map((line) => line.trim()).filter(Boolean),
    [vehicle.description],
  );
  const overviewCharCount = useMemo(
    () => descriptionParagraphs.reduce((total, paragraph) => total + paragraph.length, 0),
    [descriptionParagraphs],
  );
  const isLongOverview = descriptionParagraphs.length > OVERVIEW_PREVIEW_COUNT || overviewCharCount > 420;
  const visibleOverviewParagraphs = isLongOverview && !isOverviewExpanded
    ? descriptionParagraphs.slice(0, OVERVIEW_PREVIEW_COUNT)
    : descriptionParagraphs;
  const galleryPages = useMemo(() => {
    if (!galleryImages.length) return [];
    const pages: Array<typeof galleryImages> = [];
    for (let i = 0; i < galleryImages.length; i += MODERN_GALLERY_PAGE_SIZE) {
      pages.push(galleryImages.slice(i, i + MODERN_GALLERY_PAGE_SIZE));
    }
    return pages;
  }, [galleryImages]);
  const shouldLoadGalleryImage = (index: number) => index <= maxLoadedIndex;

  const heroMileage = Number.isFinite(Number(vehicle.odometer_reading_miles))
    ? `${formatNumber(Number(vehicle.odometer_reading_miles))} miles`
    : "";
  const heroSubtitle = [
    vehicle.year_of_manufacture,
    heroMileage,
    vehicle.fuel_type,
    vehicle.transmission_type,
  ]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" · ");
  const heroLead = heroSubtitle || "Vehicle specification details available on request.";
  const stockStatusLabel = formatStockStatus(vehicle.stock_status || advert.stock_status);

  const leadsEndpoint = process.env.NEXT_PUBLIC_LEADS_API_URL || "/leads";
  const dealerName = __brand?.name || "Columbus Vehicles";
  const widgetLeadOwner = normalizeLeadOwner(__brand?.slug || __brand?.name);
  const enquiryVehicleName = `${vehicle.make} ${vehicle.model} ${vehicle.derivative}`.replace(/\s+/g, " ").trim() || "selected vehicle";
  const enquiryRegistration = vehicle.registration;
  const enquiryMileage = Number.isFinite(Number(vehicle.odometer_reading_miles))
    ? String(vehicle.odometer_reading_miles)
    : "";
  const enquiryTransmission = vehicle.transmission_type;
  const enquiryFuelType = vehicle.fuel_type;
  const enquiryEngineSize = Number.isFinite(Number(vehicle.engine_capacity_cc))
    ? `${(Number(vehicle.engine_capacity_cc) / 1000).toFixed(1)}L`
    : "";
  const enquiryPriceValue = Math.round(Number(vehicle.price));
  const enquiryPriceText = formatPrice(enquiryPriceValue);
  const widgetContact = useMemo(
    () => ({
      phoneTel: WARWICK_PHONE_TEL || undefined,
      phoneDisplay: WARWICK_PHONE_DISPLAY || undefined,
      whatsappUrl: WARWICK_WHATSAPP_URL || undefined,
      email: __contact.email || undefined,
    }),
    [WARWICK_PHONE_DISPLAY, WARWICK_PHONE_TEL, WARWICK_WHATSAPP_URL, __contact.email],
  );
  const vehicleWidgetSummary = useMemo<VehicleActionWidgetSummary>(
    () => ({
      title: enquiryVehicleName,
      registration: enquiryRegistration || undefined,
      stock: enquiryRegistration || (advert as any)?.advert_id || undefined,
      make: vehicle.make || undefined,
      model: vehicle.model || undefined,
      derivative: vehicle.derivative || undefined,
      year: vehicle.year_of_manufacture || undefined,
      price: Number.isFinite(enquiryPriceValue) ? enquiryPriceValue : undefined,
      priceText: enquiryPriceText,
      mileage: enquiryMileage || undefined,
      transmission: enquiryTransmission || undefined,
      fuel: enquiryFuelType || undefined,
      engineSize: enquiryEngineSize || undefined,
      image: galleryImages[0]?.src || images[0] || undefined,
      url: canonicalPath,
    }),
    [
      advert,
      canonicalPath,
      enquiryEngineSize,
      enquiryFuelType,
      enquiryMileage,
      enquiryPriceText,
      enquiryPriceValue,
      enquiryRegistration,
      enquiryTransmission,
      enquiryVehicleName,
      galleryImages,
      images,
      vehicle.derivative,
      vehicle.make,
      vehicle.model,
      vehicle.year_of_manufacture,
    ],
  );
  const enquiryWidgetConfig = useMemo<VehicleActionWidgetConfig>(
    () => ({
      brandName: dealerName,
      dealerName,
      leadOwner: widgetLeadOwner,
      leadEndpoint: leadsEndpoint,
      leadType: "dealer-enquiry",
      leadSource: "vehicle-details",
      defaultIntent: "info",
      contact: widgetContact,
    }),
    [dealerName, leadsEndpoint, widgetContact, widgetLeadOwner],
  );
  const reserveWidgetConfig = useMemo<VehicleActionWidgetConfig>(
    () => ({
      brandName: dealerName,
      dealerName,
      leadOwner: widgetLeadOwner,
      leadEndpoint: leadsEndpoint,
      leadType: "reservation",
      leadSource: "reserve-widget",
      holdHours: 24,
      contact: widgetContact,
    }),
    [dealerName, leadsEndpoint, widgetContact, widgetLeadOwner],
  );

  const featureGroups = useMemo(() => {
    const map = new Map<string, string[]>();
    features.forEach((feature) => {
      const key = feature.category || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(feature.name);
    });
    return Array.from(map.entries())
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => a.localeCompare(b)),
      }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [features]);

  const highlightFeatures = useMemo(() => features.slice(0, 10).map((item) => item.name), [features]);

  const handlePrev = () => {
    if (!galleryImages.length) return;
    setActiveIndex((current) => (current - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleNext = () => {
    if (!galleryImages.length) return;
    setActiveIndex((current) => (current + 1) % galleryImages.length);
  };

  const finishSwipe = (endX: number, endY: number) => {
    const deltaX = endX - touchStateRef.current.startX;
    const deltaY = endY - touchStateRef.current.startY;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD || Math.abs(deltaX) < Math.abs(deltaY)) return;
    swipeGuardRef.current = true;
    if (deltaX > 0) {
      handlePrev();
    } else {
      handleNext();
    }
    window.setTimeout(() => {
      swipeGuardRef.current = false;
    }, 240);
  };

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStateRef.current = { active: true, startX: touch.clientX, startY: touch.clientY, pointerId: -1 };
  };

  const onTouchEnd = (event: TouchEvent) => {
    const touch = event.changedTouches[0];
    if (!touch || !touchStateRef.current.active) return;
    touchStateRef.current.active = false;
    finishSwipe(touch.clientX, touch.clientY);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;
    touchStateRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      pointerId: event.pointerId,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // no-op
    }
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || !touchStateRef.current.active) return;
    touchStateRef.current.active = false;
    finishSwipe(event.clientX, event.clientY);
  };

  const onPointerCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") return;
    touchStateRef.current.active = false;
  };

  const openLightbox = (index: number, trigger?: HTMLElement | null) => {
    if (!galleryImages.length) return;
    lightboxFocusRestoreRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    setActiveIndex(index);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    setMaxLoadedIndex((current) => Math.max(current, index));
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    lightboxFocusRestoreRef.current?.focus();
  };

  const openVehicleActionWidget = async (kind: VehicleActionWidgetKind) => {
    const widget = await waitForVehicleActionWidget(kind);
    if (!widget?.open) return;
    widget.configure?.(kind === "reserve" ? reserveWidgetConfig : enquiryWidgetConfig);
    widget.open({
      vehicle: {
        ...vehicleWidgetSummary,
        url: typeof window !== "undefined" ? window.location.href : vehicleWidgetSummary.url,
      },
    });
  };

  const openEnquiry = () => void openVehicleActionWidget("enquiry");
  const openReserve = () => void openVehicleActionWidget("reserve");

  const scrollModernGallery = (direction: "prev" | "next") => {
    const node = modernGalleryRef.current;
    if (!node || !galleryPages.length) return;
    const nextIndex = direction === "next"
      ? Math.min(galleryPages.length - 1, galleryPageIndex + 1)
      : Math.max(0, galleryPageIndex - 1);
    setGalleryPageIndex(nextIndex);
    node.scrollTo({ left: node.clientWidth * nextIndex, behavior: "smooth" });
  };

  const handleModernGalleryScroll = () => {
    const node = modernGalleryRef.current;
    if (!node) return;
    if (modernGalleryScrollRaf.current !== null) {
      window.cancelAnimationFrame(modernGalleryScrollRaf.current);
    }
    modernGalleryScrollRaf.current = window.requestAnimationFrame(() => {
      const width = node.clientWidth || 1;
      const nextIndex = Math.round(node.scrollLeft / width);
      setGalleryPageIndex((current) => (current === nextIndex ? current : nextIndex));
    });
  };

  useEffect(() => {
    if (!isLightboxOpen) return undefined;
    const scrollY = window.scrollY;
    document.body.style.setProperty("--vehicle-lightbox-scroll-y", `-${scrollY}px`);
    document.body.classList.add("vehicle-lightbox-open");
    lightboxCloseButtonRef.current?.focus();

    return () => {
      document.body.classList.remove("vehicle-lightbox-open");
      document.body.style.removeProperty("--vehicle-lightbox-scroll-y");
      window.scrollTo(0, scrollY);
    };
  }, [isLightboxOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const media = window.matchMedia("(min-width: 900px)");
    const handleChange = () => setIsModernGallery(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!galleryImages.length) return;
    setMaxLoadedIndex((current) => Math.max(current, activeIndex));
  }, [activeIndex, galleryImages.length]);

  useEffect(() => {
    if (!isModernGallery || !galleryImages.length) return;
    const lastIndex = Math.min(
      galleryImages.length - 1,
      (galleryPageIndex + 1) * MODERN_GALLERY_PAGE_SIZE - 1,
    );
    if (lastIndex >= 0) {
      setMaxLoadedIndex((current) => Math.max(current, lastIndex));
    }
  }, [galleryPageIndex, galleryImages.length, isModernGallery]);

  if (isVehicleLoading) {
    return <VehicleDetailsSkeleton />;
  }

  if (!isVehicleReady) {
    return <VehicleNotFoundTemplate message={vehicleLoadError || ""} slug={slug} />;
  }

  return (
    <main className={styles.page}>
      <Script
        id="carous-vehicle-enquiry-widget"
        src={VEHICLE_ENQUIRY_WIDGET_SRC}
        strategy="afterInteractive"
        data-brand-name={dealerName}
        data-dealer-name={dealerName}
        data-dealer-client-id={widgetLeadOwner}
        data-lead-owner={widgetLeadOwner}
        data-lead-endpoint={leadsEndpoint}
        data-lead-submit-url={leadsEndpoint}
        data-lead-type="dealer-enquiry"
        data-lead-source="vehicle-details"
        data-default-intent="info"
        data-phone-tel={WARWICK_PHONE_TEL || undefined}
        data-phone-display={WARWICK_PHONE_DISPLAY || undefined}
        data-phone-number={WARWICK_PHONE_DISPLAY || undefined}
        data-whatsapp-url={WARWICK_WHATSAPP_URL || undefined}
        data-email={__contact.email || undefined}
      />
      <Script
        id="carous-reserve-a-car-widget"
        src={RESERVE_WIDGET_SRC}
        strategy="afterInteractive"
        data-brand-name={dealerName}
        data-dealer-name={dealerName}
        data-dealer-client-id={widgetLeadOwner}
        data-lead-owner={widgetLeadOwner}
        data-lead-endpoint={leadsEndpoint}
        data-lead-submit-url={leadsEndpoint}
        data-lead-type="reservation"
        data-lead-source="reserve-widget"
        data-hold-hours="24"
        data-phone-tel={WARWICK_PHONE_TEL || undefined}
        data-phone-display={WARWICK_PHONE_DISPLAY || undefined}
        data-phone-number={WARWICK_PHONE_DISPLAY || undefined}
        data-whatsapp-url={WARWICK_WHATSAPP_URL || undefined}
        data-email={__contact.email || undefined}
      />
      <div className={`${styles.contentTransition} ${isContentVisible ? styles.contentTransitionVisible : ""}`}>
        <section className={styles.hero}>
          <HeroBackdrop />
          <div className={styles.heroInner}>
            <div className={styles.heroShell}>
              {/* audit-ignore: a11y-h1-multiple — paired with the not-found h1 (~line 798); only one renders */}
              <h1 className={styles.heroTitle}>{vehicle.make} {vehicle.model} {vehicle.derivative}</h1>
              <p className={styles.heroLead}>{heroLead}</p>
              <div className={styles.heroActions}>
                <button type="button" className={styles.primaryButton} onClick={openEnquiry}>
                  Enquire now
                  <ArrowRight size={16} strokeWidth={2.2} />
                </button>
                <button type="button" className={styles.secondaryButton} onClick={openReserve}>
                  Reserve vehicle
                  <Calendar size={16} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.contentGrid}>
              <div className={styles.galleryColumn}>
                <article className={styles.galleryCard}>
                  <div className="vehicle-gallery-card">
                    <div className="vehicle-gallery-main" tabIndex={0} aria-label="Vehicle image gallery">
                      <div
                        className="vehicle-gallery-viewport"
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                        onPointerDown={onPointerDown}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerCancel}
                      >
                        <div
                          className="vehicle-gallery-track"
                          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                          {galleryImages.map((image, index) => (
                            <figure
                              className="vehicle-gallery-slide"
                              key={`${image.src}-${index}`}
                              onClick={(event) => {
                                if (swipeGuardRef.current) {
                                  event.preventDefault();
                                  return;
                                }
                                openLightbox(index, event.currentTarget);
                              }}
                            >
                              {shouldLoadGalleryImage(index) ? (
                                <img src={image.src} alt={image.alt} loading={index === 0 ? "eager" : "lazy"} />
                              ) : (
                                <div className="vehicle-gallery-slide-placeholder" aria-hidden="true" />
                              )}
                            </figure>
                          ))}
                        </div>
                      </div>
                      <button className="vehicle-gallery-control prev" type="button" aria-label="Previous image" onClick={handlePrev}>
                        <ChevronLeft size={20} strokeWidth={2} />
                      </button>
                      <button className="vehicle-gallery-control next" type="button" aria-label="Next image" onClick={handleNext}>
                        <ChevronRight size={20} strokeWidth={2} />
                      </button>
                      <button
                        className="vehicle-gallery-expand"
                        type="button"
                        aria-label="Open full screen gallery"
                        onClick={(event) => openLightbox(activeIndex, event.currentTarget)}
                      >
                        <Expand size={16} strokeWidth={2} />
                        <span>Full Screen</span>
                      </button>
                      <p className="vehicle-gallery-counter" aria-live="polite">
                        <span className="vehicle-gallery-current">{String(activeIndex + 1).padStart(2, "0")}</span>
                        <span>/</span>
                        <span className="vehicle-gallery-total">{String(galleryImages.length).padStart(2, "0")}</span>
                      </p>
                    </div>

                    {galleryPages.length ? (
                      <div
                        className="vehicle-gallery-modern"
                        aria-hidden="false"
                        ref={modernGalleryRef}
                        onScroll={handleModernGalleryScroll}
                      >
                        {galleryPages.map((page, pageIndex) => (
                          <div className="vehicle-gallery-grid" key={`gallery-page-${pageIndex}`}>
                            {page.map((image, index) => {
                              const absoluteIndex = pageIndex * MODERN_GALLERY_PAGE_SIZE + index;
                              return (
                                <button
                                  key={`gallery-grid-${image.src}-${absoluteIndex}`}
                                  type="button"
                                  className={`vehicle-gallery-tile${index === 0 ? " is-primary" : ""}`}
                                  onClick={(event) => openLightbox(absoluteIndex, event.currentTarget)}
                                  aria-label={`Open image ${absoluteIndex + 1} of ${galleryImages.length}`}
                                >
                                  {shouldLoadGalleryImage(absoluteIndex) ? (
                                    <img
                                      src={image.src}
                                      alt={image.alt}
                                      loading={absoluteIndex === 0 ? "eager" : "lazy"}
                                    />
                                  ) : (
                                    <div className="vehicle-gallery-tile-placeholder" aria-hidden="true" />
                                  )}
                                </button>
                              );
                            })}
                            {pageIndex === 0 ? (
                              <button
                                type="button"
                                className="vehicle-gallery-grid-cta"
                                onClick={(event) => openLightbox(0, event.currentTarget)}
                              >
                                View gallery
                                <span className="vehicle-gallery-grid-cta-count">{galleryImages.length}</span>
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {galleryPages.length > 1 ? (
                      <>
                        <button
                          type="button"
                          className="vehicle-gallery-modern-control prev"
                          aria-label="Scroll gallery left"
                          onClick={() => scrollModernGallery("prev")}
                        >
                          <ChevronLeft size={20} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          className="vehicle-gallery-modern-control next"
                          aria-label="Scroll gallery right"
                          onClick={() => scrollModernGallery("next")}
                        >
                          <ChevronRight size={20} strokeWidth={2} />
                        </button>
                      </>
                    ) : null}
                  </div>
                </article>
              </div>

            <aside className={styles.sidebar}>
              <div className={styles.stickyCard}>
                <div className={styles.sideCard}>
                  <h3>At a glance</h3>
                  <div className={styles.sideStats}>
                    <div>
                      <span className={styles.sideStatLabel}>
                        <span className={styles.sideStatIcon}><Gauge size={14} strokeWidth={1.8} /></span>
                        Mileage
                      </span>
                      <strong>{formatNumber(vehicle.odometer_reading_miles)} mi</strong>
                    </div>
                    <div>
                      <span className={styles.sideStatLabel}>
                        <span className={styles.sideStatIcon}><Cog size={14} strokeWidth={1.8} /></span>
                        Engine
                      </span>
                      <strong>{(vehicle.engine_capacity_cc / 1000).toFixed(1)}L</strong>
                    </div>
                    <div>
                      <span className={styles.sideStatLabel}>
                        <span className={styles.sideStatIcon}><Leaf size={14} strokeWidth={1.8} /></span>
                        CO2
                      </span>
                      <strong>{vehicle.co2_emission_gpkm} g/km</strong>
                    </div>
                    <div>
                      <span className={styles.sideStatLabel}>
                        <span className={styles.sideStatIcon}><Tag size={14} strokeWidth={1.8} /></span>
                        Road tax
                      </span>
                      <strong>{formatPrice(Number(vehicle.vehicle_excise_duty_gbp))}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.sideCard}>
                  <h3>Vehicle assurance</h3>
                  <div className={styles.checkList}>
                    <span><ShieldCheck size={16} strokeWidth={2} /> 30-day warranty included</span>
                    <span><BadgeCheck size={16} strokeWidth={2} /> Full inspection carried out</span>
                    <span><Check size={16} strokeWidth={2} /> {history.previous_owners_count} previous owners</span>
                    <span><Check size={16} strokeWidth={2} /> HPI clear status pending</span>
                  </div>
                </div>

                <div className={styles.sideCard}>
                  <h3>Contact the showroom</h3>
                  <div className={styles.contactStack}>
                    {WARWICK_PHONE_TEL ? (
                      <a href={`tel:${WARWICK_PHONE_TEL}`}>
                        <span className={styles.sideStatIcon}><Phone size={16} strokeWidth={2} /></span>
                        {WARWICK_PHONE_DISPLAY || 'Call us'}
                      </a>
                    ) : null}
                    {__contact.email ? (
                      <a href={`mailto:${__contact.email}`}>
                        <span className={styles.sideStatIcon}><Mail size={16} strokeWidth={2} /></span>
                        {__contact.email}
                      </a>
                    ) : null}
                    <span>
                      <span className={styles.sideStatIcon}><MapPin size={16} strokeWidth={2} /></span>
                      {__contact.showroomAddress || 'Contact us for location details'}
                    </span>
                  </div>
                  <button type="button" className={styles.primaryButton} onClick={openEnquiry}>
                    Send an enquiry
                    <ArrowRight size={16} strokeWidth={2.2} />
                  </button>
                  <button type="button" className={styles.secondaryButton} onClick={openReserve}>
                    Reserve vehicle
                    <Calendar size={16} strokeWidth={2.2} />
                  </button>
                </div>

                <div className={styles.sideCard}>
                  <h3>Finance snapshot</h3>
                  <p className={styles.financeCopy}>
                    Representative example based on 10% deposit over 48 months.
                  </p>
                  <div className={styles.financeRow}>
                    <span>Deposit</span>
                    <strong>{formatPrice(price * 0.1)}</strong>
                  </div>
                  <div className={styles.financeRow}>
                    <span>Monthly</span>
                    <strong>{formatPrice(financeMonthly)}</strong>
                  </div>
                  <div className={styles.financeRow}>
                    <span>APR</span>
                    <strong>9.9%</strong>
                  </div>
                  <button type="button" className={styles.secondaryButton} onClick={openEnquiry}>
                    View finance options
                    <ArrowRight size={16} strokeWidth={2.2} />
                  </button>
                </div>

                <div className={styles.historyGrid}>
                  <div className={styles.historyCard}>
                    <h2>Vehicle history</h2>
                    <p>Transparent checks on every stock item.</p>
                    <div className={styles.historyRows}>
                      <span><Check size={16} strokeWidth={2} /> Not recorded as stolen</span>
                      <span><Check size={16} strokeWidth={2} /> Not recorded as scrapped</span>
                      <span><Check size={16} strokeWidth={2} /> Not recorded as imported/exported</span>
                    </div>
                  </div>
                  <div className={styles.historyCard}>
                    <h2>Dimensions</h2>
                    <div className={styles.dimensions}>
                      <div>
                        <span>Length</span>
                        <strong>{formatNumber(vehicle.length_mm)} mm</strong>
                      </div>
                      <div>
                        <span>Width</span>
                        <strong>{formatNumber(vehicle.width_mm)} mm</strong>
                      </div>
                      <div>
                        <span>Height</span>
                        <strong>{formatNumber(vehicle.height_mm)} mm</strong>
                      </div>
                      <div>
                        <span>Boot space</span>
                        <strong>{formatNumber(vehicle.boot_space_seats_up_litres)} L</strong>
                      </div>
                    </div>
                  </div>
                  <div className={styles.historyCard}>
                    <h2>Ready to reserve?</h2>
                    <p>Secure this vehicle with a fully refundable holding deposit.</p>
                    <button type="button" className={styles.primaryButton} onClick={openReserve}>
                      Reserve vehicle
                      <ArrowRight size={16} strokeWidth={2.2} />
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <div className={styles.mainColumn}>
              <div className={styles.priceCard}>
                <div className={styles.priceRow}>
                  <span className={styles.priceTag}>{formatPrice(price)}</span>
                  <span className={styles.priceLabel}>{stockStatusLabel}</span>
                </div>
                <p className={styles.financeText}>Finance from {formatPrice(financeMonthly)} / month</p>
                <div className={styles.priceMeta}>
                  <span><Timer size={14} strokeWidth={1.8} /> Updated {formatDate(advert.last_updated.split(" ")[0])}</span>
                  <span><Tag size={14} strokeWidth={1.8} /> Stock ID {vehicle.registration}</span>
                </div>
              </div>
              <section className={styles.summaryGrid} aria-label="Key highlights">
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <span className={styles.summaryIcon}><Calendar size={16} strokeWidth={1.8} /></span>
                    <span>Year</span>
                  </div>
                  <strong>{vehicle.year_of_manufacture}</strong>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <span className={styles.summaryIcon}><Gauge size={16} strokeWidth={1.8} /></span>
                    <span>Mileage</span>
                  </div>
                  <strong>{formatNumber(vehicle.odometer_reading_miles)} miles</strong>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <span className={styles.summaryIcon}><Fuel size={16} strokeWidth={1.8} /></span>
                    <span>Fuel</span>
                  </div>
                  <strong>{vehicle.fuel_type}</strong>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <span className={styles.summaryIcon}><Cog size={16} strokeWidth={1.8} /></span>
                    <span>Transmission</span>
                  </div>
                  <strong>{vehicle.transmission_type}</strong>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <span className={styles.summaryIcon}><Users size={16} strokeWidth={1.8} /></span>
                    <span>Seats</span>
                  </div>
                  <strong>{vehicle.seats}</strong>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryHeader}>
                    <span className={styles.summaryIcon}><Palette size={16} strokeWidth={1.8} /></span>
                    <span>Colour</span>
                  </div>
                  <strong>{vehicle.colour}</strong>
                </div>
              </section>

              <section className={styles.contentCard}>
                <header className={styles.sectionHeader}>
                  <h2>Overview</h2>
                  <p>Condition, preparation, and key ownership highlights.</p>
                </header>
                <div className={styles.highlightList}>
                  {highlightFeatures.map((feature) => (
                    <span key={feature}>
                      <Check size={16} strokeWidth={2} />
                      {feature}
                    </span>
                  ))}
                </div>
                <div className={styles.description}>
                  {visibleOverviewParagraphs.map((paragraph, index) => (
                    <p key={`desc-${index}`}>{paragraph}</p>
                  ))}
                </div>
                {isLongOverview ? (
                  <button
                    type="button"
                    className={styles.readMoreButton}
                    onClick={() => setIsOverviewExpanded((current) => !current)}
                    aria-expanded={isOverviewExpanded}
                  >
                    {isOverviewExpanded ? "Show less" : "Read more"}
                  </button>
                ) : null}
              </section>

              <section className={styles.contentCard}>
                <header className={styles.sectionHeader}>
                  <h2>Specification</h2>
                  <p>Performance, economy, and core technical data.</p>
                </header>
                <div className={styles.specsGrid}>
                  <div className={styles.specItem}>
                    <Fuel size={18} strokeWidth={1.8} />
                    <div>
                      <span>Fuel economy (mpg)</span>
                      <strong>{vehicle.fuel_economy_nedc_combined_mpg}</strong>
                    </div>
                  </div>
                  <div className={styles.specItem}>
                    <Gauge size={18} strokeWidth={1.8} />
                    <div>
                      <span>Engine power</span>
                      <strong>{vehicle.engine_power_bhp} bhp</strong>
                    </div>
                  </div>
                  <div className={styles.specItem}>
                    <Calendar size={18} strokeWidth={1.8} />
                    <div>
                      <span>First registered</span>
                      <strong>{formatDate(vehicle.first_registration_date)}</strong>
                    </div>
                  </div>
                  <div className={styles.specItem}>
                    <DoorOpen size={18} strokeWidth={1.8} />
                    <div>
                      <span>Doors</span>
                      <strong>{vehicle.doors}</strong>
                    </div>
                  </div>
                </div>
                <div className={styles.specDetailGrid}>
                  {specs.map((group) => (
                    <div key={group.category} className={styles.specGroup}>
                      <h3>{group.category}</h3>
                      <dl>
                        {group.items.map((item) => (
                          <div key={item.name} className={styles.specRow}>
                            <dt>{item.name}</dt>
                            <dd>{item.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.contentCard}>
                <header className={styles.sectionHeader}>
                  <h2>Features & Equipment</h2>
                  <p>Everything fitted on this vehicle, grouped by category.</p>
                </header>
                <div className={styles.featuresGrid}>
                  {featureGroups.map((group, index) => (
                    <details key={group.category} className={styles.featureGroup} open={index === 0}>
                      <summary className={styles.featureGroupSummary}>
                        <span>{group.category}</span>
                        <span className={styles.featureCount}>{group.items.length}</span>
                      </summary>
                      <ul className={styles.featureList}>
                        {group.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </section>
            </div>
            </div>
          </div>
        </section>

      </div>
      <div className={isLightboxOpen ? "vehicle-lightbox is-open" : "vehicle-lightbox"} aria-hidden={!isLightboxOpen}>
        {/* audit-ignore: a11y-div-as-button — lightbox backdrop; the dialog has its own close button + keyboard handlers */}
        <div className="vehicle-lightbox-backdrop" data-close="true" onClick={closeLightbox}></div>
        <div className="vehicle-lightbox-inner" role="dialog" aria-modal="true" aria-label="Vehicle image gallery lightbox">
          <div className="vehicle-lightbox-top">
            <p className="vehicle-lightbox-counter" aria-live="polite">
              <span className="vehicle-lightbox-current">{String(lightboxIndex + 1).padStart(2, "0")}</span>
              <span>/</span>
              <span className="vehicle-lightbox-total">{String(galleryImages.length).padStart(2, "0")}</span>
            </p>
            <button
              ref={lightboxCloseButtonRef}
              className="vehicle-lightbox-close"
              type="button"
              aria-label="Close full screen gallery"
              onClick={closeLightbox}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>
          <div
            className="vehicle-lightbox-viewport"
            style={{
              "--vehicle-lightbox-fill-image": galleryImages[lightboxIndex]?.src
                ? `url(${galleryImages[lightboxIndex]?.src})`
                : "none",
            } as CSSProperties}
          >
            {galleryImages.length ? (
              <figure className="vehicle-lightbox-slide" key={`lightbox-slide-${lightboxIndex}`}>
                <img src={galleryImages[lightboxIndex]?.src} alt={galleryImages[lightboxIndex]?.alt} />
              </figure>
            ) : (
              <p className="vehicle-lightbox-empty">No gallery images available.</p>
            )}
            <button
              className="vehicle-lightbox-control prev"
              type="button"
              aria-label="Previous image"
              onClick={() =>
                setLightboxIndex((current) => {
                  if (!galleryImages.length) return current;
                  const nextIndex = (current - 1 + galleryImages.length) % galleryImages.length;
                  setMaxLoadedIndex((max) => Math.max(max, nextIndex));
                  return nextIndex;
                })
              }
            >
              <ChevronLeft size={20} strokeWidth={2} />
            </button>
            <button
              className="vehicle-lightbox-control next"
              type="button"
              aria-label="Next image"
              onClick={() =>
                setLightboxIndex((current) => {
                  if (!galleryImages.length) return current;
                  const nextIndex = (current + 1) % galleryImages.length;
                  setMaxLoadedIndex((max) => Math.max(max, nextIndex));
                  return nextIndex;
                })
              }
            >
              <ChevronRight size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default WarwickVehicleDetailPage
