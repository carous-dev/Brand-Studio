import Script from "next/script";
import { permanentRedirect } from "next/navigation";
import {
  normalizeVehiclePayload,
  VEHICLE_GALLERY_WIDGET_SRC,
  VEHICLE_ENQUIRY_WIDGET_SRC,
  RESERVE_WIDGET_SRC,
  type NormalizedVehicle,
} from "@/app/themes/pmg-used-cars/lib/vendor/dealer-shell";
import { RecordRecentlyViewed } from "@/app/themes/pmg-used-cars/lib/vendor/garage";
import type { SavedVehicle } from "@/app/themes/pmg-used-cars/lib/vendor/garage";
import { dealer, theme } from "../../../data/site-config";
import { fetchInventory } from "../_lib/inventory";
import { EMPTY_FILTERS, type InventoryVehicle } from "../_lib/types";
import { getBrandSlugFromRequest } from "../../../lib/brand-slug.server";
import { VehicleDetail } from "./VehicleDetail";

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const NUM = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

// brandstudio ThemePageProps — the runtime passes { brand, vehicleSlug, vehicle,
// images, similarList }. We re-fetch the full vehicle payload from the
// same-origin /api/vehicle so normalizeVehiclePayload has the complete record
// (metadata is owned by the app-route's generateThemePageMetadata).
type PageProps = { brand?: { slug?: string }; vehicleSlug?: string };

function serverOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_INTERNAL_ORIGIN ||
    `http://127.0.0.1:${process.env.PORT || process.env.NEXT_INTERNAL_PORT || "3000"}`
  ).replace(/\/+$/, "");
}

async function loadVehicle(slug: string, brandSlug: string | null): Promise<NormalizedVehicle | null> {
  const qs = new URLSearchParams({ slug });
  if (brandSlug) qs.set("brand", brandSlug);
  try {
    const response = await fetch(`${serverOrigin()}/api/vehicle?${qs.toString()}`, { cache: "no-store" });
    if (!response.ok) return null;
    return normalizeVehiclePayload(await response.json());
  } catch {
    return null;
  }
}

function vehicleTitle(v: NormalizedVehicle): string {
  return [v.year, v.make, v.model].filter(Boolean).join(" ") || dealer.brandName;
}

/* ── Similar vehicles ─────────────────────────────────────────────────────── */

async function loadSimilar(vehicle: NormalizedVehicle, brandSlug: string | null): Promise<InventoryVehicle[]> {
  const make = vehicle.make ?? "";
  try {
    // Prefer same-make stock; top up with newest stock if that's thin.
    const primary = make ? await fetchInventory({ ...EMPTY_FILTERS, make }, brandSlug) : { items: [] as InventoryVehicle[] };
    let items = primary.items;
    if (items.filter((i) => i.slug && i.slug !== vehicle.slug).length < 3) { /* text-static-ok */
      const fallback = await fetchInventory({ ...EMPTY_FILTERS }, brandSlug);
      const seen = new Set(items.map((i) => i.slug));
      items = [...items, ...fallback.items.filter((i) => !seen.has(i.slug))];
    }
    return items.filter((i) => i.slug && i.slug !== vehicle.slug).slice(0, 3);
  } catch {
    return [];
  }
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default async function VehiclePage({ brand, vehicleSlug }: PageProps) {
  const slug = vehicleSlug ?? "";
  const brandSlug = brand?.slug ?? (await getBrandSlugFromRequest());
  const vehicle = slug ? await loadVehicle(slug, brandSlug) : null;
  if (!vehicle) permanentRedirect("/used-cars");

  const pageUrl = `${dealer.siteUrl}/used-cars/${slug}`;
  const title = vehicleTitle(vehicle);
  const similar = await loadSimilar(vehicle, brandSlug);

  const recentSnapshot: SavedVehicle = {
    slug: vehicle.slug,
    href: `/used-cars/${slug}`,
    title,
    price: vehicle.price ? GBP.format(vehicle.price) : "POA",
    image: vehicle.images[0] ?? "",
    year: vehicle.year ? String(vehicle.year) : "",
    mileage: vehicle.mileage ? `${NUM.format(vehicle.mileage)} miles` : "",
    transmission: vehicle.transmission ?? "",
    fuel: vehicle.fuelType ?? "",
  };

  const availability =
    (vehicle.stockStatus ?? "").toLowerCase().includes("sold")
      ? "https://schema.org/SoldOut"
      : (vehicle.stockStatus ?? "").toLowerCase().includes("reserv")
        ? "https://schema.org/InStock"
        : "https://schema.org/InStock";

  const vehicleLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${title}${vehicle.derivative ? ` ${vehicle.derivative}` : ""}`,
    ...(vehicle.make ? { brand: { "@type": "Brand", name: vehicle.make } } : {}),
    ...(vehicle.model ? { model: vehicle.model } : {}),
    ...(vehicle.year ? { vehicleModelDate: String(vehicle.year) } : {}),
    ...(vehicle.colour ? { color: vehicle.colour } : {}),
    ...(vehicle.bodyType ? { bodyType: vehicle.bodyType } : {}),
    ...(vehicle.vin ? { vehicleIdentificationNumber: vehicle.vin } : {}),
    ...(vehicle.fuelType ? { fuelType: vehicle.fuelType } : {}),
    ...(vehicle.transmission ? { vehicleTransmission: vehicle.transmission } : {}),
    ...(vehicle.mileage
      ? { mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.mileage, unitCode: "SMI" } }
      : {}),
    ...(vehicle.enginePowerBhp
      ? { vehicleEngine: { "@type": "EngineSpecification", enginePower: { "@type": "QuantitativeValue", value: vehicle.enginePowerBhp, unitText: "bhp" } } }
      : {}),
    image: vehicle.images.slice(0, 8),
    ...(vehicle.price
      ? {
          offers: {
            "@type": "Offer",
            price: vehicle.price,
            priceCurrency: "GBP",
            availability,
            url: pageUrl,
            itemCondition: "https://schema.org/UsedCondition",
            seller: { "@type": "AutoDealer", name: dealer.brandName },
          },
        }
      : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: dealer.siteUrl },
      { "@type": "ListItem", position: 2, name: "Used Cars", item: `${dealer.siteUrl}/used-cars` },
      { "@type": "ListItem", position: 3, name: title, item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(vehicleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {/* CDN widget bundles the detail page drives: gallery mount + enquiry/reserve
          modals. The site-wide WhatsApp launcher is loaded once by the shell. */}
      <Script id="carous-vehicle-gallery-widget" src={VEHICLE_GALLERY_WIDGET_SRC} strategy="afterInteractive" />
      <Script id="carous-vehicle-enquiry-widget" src={VEHICLE_ENQUIRY_WIDGET_SRC} strategy="afterInteractive" />
      <Script id="carous-reserve-a-car-widget" src={RESERVE_WIDGET_SRC} strategy="afterInteractive" />
      <RecordRecentlyViewed vehicle={recentSnapshot} />
      <VehicleDetail vehicle={vehicle} dealer={dealer} theme={theme} pageUrl={pageUrl} similar={similar} />
    </>
  );
}
