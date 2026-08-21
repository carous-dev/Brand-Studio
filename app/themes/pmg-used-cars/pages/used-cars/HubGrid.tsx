"use client";

/**
 * Lightweight, server-seeded grid for the SEO hub pages (/make/<slug>,
 * /used-cars-in/<town>). Unlike InventoryClient it has no filters, no refetch
 * and no URL-sync — the server already fetched the right slice of stock and
 * passes it in, keeping the clean hub URL pristine. It reuses the exact
 * InventoryCard + garage (wishlist/compare) wiring so cards look and behave
 * identically to the main listing.
 */
import { useEffect, useMemo, useState } from "react";
import {
  countSaved,
  isSaved,
  MAX_COMPARE,
  subscribeSaved,
  toggleSaved,
  type SavedVehicle,
} from "@/app/themes/pmg-used-cars/lib/vendor/garage";
import { InventoryCard } from "./InventoryCard";
import { buildVehiclePermalink } from "../../lib/vehicle-links";
import type { InventoryVehicle } from "./_lib/types";

function toText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "object" && value !== null && "name" in value) {
    const n = (value as { name?: unknown }).name;
    return typeof n === "string" ? n.trim() : "";
  }
  return "";
}

function vehicleSlug(vehicle: InventoryVehicle): string {
  return String(vehicle.slug || vehicle.advert_id || vehicle.id || vehicle.reg || "");
}

function firstImage(vehicle: InventoryVehicle): string {
  if (Array.isArray(vehicle.gallery) && vehicle.gallery.length) {
    const g = vehicle.gallery[0];
    if (typeof g === "string") return g;
    if (g && typeof g === "object") return String(g.url || g.href || g.src || g.file || g.path || g.image || "");
  }
  if (Array.isArray(vehicle.images) && vehicle.images.length) return String(vehicle.images[0]);
  if (vehicle.image) return String(vehicle.image);
  return "";
}

function formatPrice(value: InventoryVehicle["price"]): string {
  if (value == null) return "POA";
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "POA";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

function formatMileage(value: InventoryVehicle["mileage"]): string {
  if (value == null) return "";
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "";
  return `${new Intl.NumberFormat("en-GB").format(n)} miles`;
}

function toSavedSnapshot(vehicle: InventoryVehicle, href: string): SavedVehicle {
  const trim = toText(vehicle.derivative) || toText(vehicle.variant) || toText(vehicle.trim);
  const title = [toText(vehicle.make), toText(vehicle.model), trim].filter(Boolean).join(" ").trim();
  return {
    slug: vehicleSlug(vehicle),
    href,
    title: title || "Vehicle",
    price: formatPrice(vehicle.price),
    image: firstImage(vehicle),
    year: toText(vehicle.year),
    mileage: formatMileage(vehicle.mileage),
    transmission: toText(vehicle.transmission) || toText(vehicle.trans),
    fuel: toText(vehicle.fuel),
  };
}

export function HubGrid({ items }: { items: InventoryVehicle[] }) {
  const [savedTick, setSavedTick] = useState(0);
  const [compareCount, setCompareCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      setCompareCount(countSaved("compare"));
      setSavedTick((t) => t + 1);
    };
    sync();
    const offWish = subscribeSaved("wishlist", sync);
    const offComp = subscribeSaved("compare", sync);
    return () => {
      offWish();
      offComp();
    };
  }, []);

  const { wishSet, compSet } = useMemo(() => {
    const wish = new Set<string>();
    const comp = new Set<string>();
    for (const vehicle of items) {
      const slug = vehicleSlug(vehicle);
      if (!slug) continue;
      if (isSaved("wishlist", slug)) wish.add(slug);
      if (isSaved("compare", slug)) comp.add(slug);
    }
    return { wishSet: wish, compSet: comp };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, savedTick]);

  const toggleWishlist = (event: React.MouseEvent<HTMLButtonElement>, vehicle: InventoryVehicle) => {
    event.preventDefault();
    event.stopPropagation();
    const href = buildVehiclePermalink(vehicle, "/used-cars");
    toggleSaved("wishlist", toSavedSnapshot(vehicle, href));
  };

  const toggleCompare = (event: React.MouseEvent<HTMLButtonElement>, vehicle: InventoryVehicle) => {
    event.preventDefault();
    event.stopPropagation();
    const href = buildVehiclePermalink(vehicle, "/used-cars");
    toggleSaved("compare", toSavedSnapshot(vehicle, href));
  };

  if (!items.length) return null;

  return (
    <div className="pmg-inv-grid">
      {items.map((vehicle, index) => {
        const slug = vehicleSlug(vehicle);
        const href = buildVehiclePermalink(vehicle, "/used-cars");
        const compared = compSet.has(slug);
        return (
          <InventoryCard
            key={slug || index}
            vehicle={vehicle}
            href={href}
            wishlisted={wishSet.has(slug)}
            compared={compared}
            compareDisabled={!compared && compareCount >= MAX_COMPARE}
            onToggleWishlist={toggleWishlist}
            onToggleCompare={toggleCompare}
            priority={index < 3}
          />
        );
      })}
    </div>
  );
}
