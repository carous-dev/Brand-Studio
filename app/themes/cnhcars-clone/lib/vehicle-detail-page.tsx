/* eslint-disable @typescript-eslint/no-explicit-any */
import BreadcrumbSchema from "../components/BreadcrumbSchema";
import VehicleDetailsView from "../components/VehicleDetailsView";
import { normalizeVehiclePayload } from "../components/vehicle-data";
import { companyProfile } from "../data/profile";
import { apiUrl } from "../lib/api";
import { buildVehiclePermalink, getVehicleLookupCandidates } from "../lib/vehicle-links";
import { absoluteUrl, defaultKeywords, siteConfig, siteUrl } from "../lib/seo";
import { headers } from "next/headers";

export type VehicleDetailBasePath = "/used-cars";

function normalizeNumber(value: any) {
  if (value == null) return NaN;
  if (typeof value === "number") return value;
  const s = String(value).replace(/[^0-9.\-]+/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}

async function getRequestOrigin() {
  try {
    const h = await headers();
    const forwardedHost = h.get("x-forwarded-host");
    const host = forwardedHost || h.get("host");
    const forwardedProto = h.get("x-forwarded-proto");
    const protocol = forwardedProto || (host?.includes("localhost") ? "http" : "https");
    if (host) return `${protocol}://${host}`;
  } catch {
    // fallback below
  }
  return siteUrl;
}

function toAbsoluteMediaUrl(src: string, origin: string) {
  if (!src) return src;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  try {
    return new URL(src, `${origin.replace(/\/$/, "")}/`).toString();
  } catch {
    return src;
  }
}

async function fetchVehiclePayload(slug: string): Promise<any | null> {
  try {
    for (const candidate of getVehicleLookupCandidates(slug)) {
      const targets = [
        candidate.slug ? apiUrl(`/vehicle?slug=${encodeURIComponent(candidate.slug)}`) : "",
        candidate.reg ? apiUrl(`/vehicle?reg=${encodeURIComponent(candidate.reg)}`) : "",
      ].filter(Boolean);

      for (const target of targets) {
        const res = await fetch(target, { cache: "no-store" });
        if (!res.ok) continue;
        const data = await res.json();
        if (!data) continue;
        if (data.vehicle) return data;
        return { vehicle: data };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function renderVehicleDetailPage({
  slug,
  currentBasePath,
}: {
  slug: string;
  currentBasePath: VehicleDetailBasePath;
}) {
  const payload = await fetchVehiclePayload(slug);
  const normalizedVehicle = payload ? normalizeVehiclePayload(payload) : null;
  const vehicle = normalizedVehicle;
  const images = vehicle?.images ? vehicle.images : [];
  const registration = vehicle?.registration || undefined;

  let ld: Record<string, any> | null = null;
  if (vehicle) {
    const origin = await getRequestOrigin();
    const canonicalPath = buildVehiclePermalink({ slug, reg: registration, vehicle_type: 'car' }, `${currentBasePath}/${slug}`);
    const vehicleUrl = `${origin.replace(/\/$/, "")}${canonicalPath}`;
    const imageUrls = images.map((src: string) => toAbsoluteMediaUrl(src, origin));
    const mileageValue = normalizeNumber(vehicle?.mileage);
    const additionalProperty = Array.isArray(vehicle?.features)
      ? vehicle.features.filter(Boolean).map((feature: any) => ({
        "@type": "PropertyValue",
        name: "feature",
        value: String(feature),
      }))
      : undefined;

    ld = {
      "@context": "https://schema.org",
      "@type": "Vehicle",
      name: `${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.make || ""} ${vehicle.model || ""}`.trim(),
      url: vehicleUrl,
      description: vehicle.description || "",
      image: imageUrls.length ? imageUrls : undefined,
      brand: vehicle.make ? { "@type": "Brand", name: vehicle.make } : undefined,
      model: vehicle.model || undefined,
      vehicleModelDate: vehicle.year ? String(vehicle.year) : undefined,
      fuelType: vehicle.fuelType || undefined,
      vehicleTransmission: vehicle.transmission || undefined,
      mileageFromOdometer: Number.isFinite(mileageValue)
        ? {
          "@type": "QuantitativeValue",
          value: String(mileageValue),
          unitCode: "SMI",
          unitText: "miles",
        }
        : undefined,
      vehicleIdentificationNumber: vehicle.registration || undefined,
      additionalProperty: additionalProperty && additionalProperty.length ? additionalProperty : undefined,
      offers: vehicle.price != null
        ? {
          "@type": "Offer",
          price: String(vehicle.price),
          priceCurrency: "GBP",
          url: vehicleUrl,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/UsedCondition",
          seller: {
            "@type": "AutoDealer",
            name: companyProfile.legalName,
            url: absoluteUrl("/"),
          },
        }
        : undefined,
    };
  }

  const breadcrumbs = [
    { name: "Home", url: absoluteUrl("/") },
    { name: "Used Cars", url: absoluteUrl(currentBasePath) },
    {
      name: vehicle ? (`${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.make || ""} ${vehicle.model || ""}`.trim() || slug) : slug,
      url: absoluteUrl(buildVehiclePermalink({ slug, reg: registration, vehicle_type: 'car' }, `${currentBasePath}/${slug}`)),
    },
  ];

  const vehicleNode = payload?.vehicle ?? payload ?? null;
  const serializedVehicle = vehicleNode ? JSON.stringify(vehicleNode).replace(/</g, "\\u003c") : "";

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <VehicleDetailsView vehicleSlug={slug} initialVehicle={vehicle} />
      {ld ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /> : null}
      {serializedVehicle ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__VEHICLE=${serializedVehicle};`,
          }}
        />
      ) : null}
    </>
  );
}

export async function buildVehicleDetailMetadata({
  slug,
  currentBasePath,
}: {
  slug: string;
  currentBasePath: VehicleDetailBasePath;
}) {
  const payload = await fetchVehiclePayload(slug);
  const vehicle = payload ? normalizeVehiclePayload(payload) : null;

  if (!vehicle) {
    return {
      title: "Vehicle not found",
      description: "The requested vehicle could not be found.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const images: string[] = vehicle.images && vehicle.images.length ? vehicle.images : [];
  const origin = await getRequestOrigin();
  const canonicalPath = buildVehiclePermalink({ slug, reg: vehicle.registration, vehicle_type: 'car' }, `${currentBasePath}/${slug}`);
  const vehicleUrl = `${origin.replace(/\/$/, "")}${canonicalPath}`;
  const title = `${vehicle.year ? `${vehicle.year} ` : ""}${vehicle.make || ""} ${vehicle.model || ""}`.trim();

  const mileageValue = normalizeNumber(vehicle.mileage);
  const priceValue = normalizeNumber(vehicle.price);
  const fallbackParts: string[] = [];
  if (Number.isFinite(priceValue)) fallbackParts.push(`GBP ${priceValue.toLocaleString()}`);
  if (vehicle.fuelType) fallbackParts.push(`${vehicle.fuelType}`);
  if (vehicle.transmission) fallbackParts.push(`${vehicle.transmission}`);
  if (Number.isFinite(mileageValue)) fallbackParts.push(`${mileageValue.toLocaleString()} miles`);

  const vehicleSummary = vehicle.description || vehicle.derivative || "";
  const fallbackSummary = fallbackParts.length
    ? `${fallbackParts.join(" | ")}. Available at ${companyProfile.name} in ${companyProfile.location.address.city}.`
    : `Available at ${companyProfile.name} in ${companyProfile.location.address.city}, ${companyProfile.location.address.county}.`;
  const description = (vehicleSummary || fallbackSummary).slice(0, 160);

  const keywords = Array.from(
    new Set(
      [
        ...defaultKeywords,
        vehicle.make,
        vehicle.model,
        vehicle.derivative,
        vehicle.year ? String(vehicle.year) : undefined,
        vehicle.fuelType,
        vehicle.transmission,
        "used cars",
        "car for sale",
        siteConfig.address.addressLocality,
        siteConfig.address.addressRegion,
      ].filter(Boolean) as string[],
    ),
  );

  return {
    title,
    description,
    keywords,
    alternates: { canonical: vehicleUrl },
    openGraph: {
      title,
      description,
      url: vehicleUrl,
      siteName: companyProfile.name,
      type: "article",
      locale: "en_GB",
      images: images.length ? images.map((src: string) => toAbsoluteMediaUrl(src, origin)) : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length ? [toAbsoluteMediaUrl(images[0], origin)] : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
