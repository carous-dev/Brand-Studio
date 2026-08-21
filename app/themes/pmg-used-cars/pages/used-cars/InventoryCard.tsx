"use client";

import { Calendar, Cog, Fuel, Gauge, GitCompareArrows, Heart, Palette, Zap } from "lucide-react";
import { InventoryCardMedia } from "./InventoryCardMedia";
import type { InventoryVehicle } from "./_lib/types";

/* ── formatting helpers (self-contained; card renders from raw API items) ── */

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

/** AutoTrader media, width-capped to 800px. A WIDTH-ONLY token (`w800`, not
 *  `w800h600`) is deliberate: dealer originals vary in ratio (heights run
 *  1237–1687 at 2048 wide), and a fixed w×h token pads the off-ratio ones with
 *  white bars to hit the exact box — which then show as unfilled edges under
 *  `object-fit: cover`. `w800` preserves each image's native ratio (no padding),
 *  so cover fills the 4:3 media box by cropping, never letterboxing. Also swaps
 *  the ~340 KB 2048px originals for ~70 KB — the card only paints a ~380 px slot. */
const AT_MEDIA_SIZE = "w800";
function sizeAtImage(raw: string): string {
  // `{resize}` template hrefs (from `media`) → fixed token.
  if (raw.includes("{resize}")) return raw.replace("{resize}", AT_MEDIA_SIZE);
  // Bare atcdn originals (`/a/media/<hash>.jpg`, no size segment) → inject the token.
  // The 16+ hex-char hash never matches an existing `w{n}h{n}` token (non-hex `w`),
  // so already-sized URLs pass through untouched.
  return raw.replace(
    /(\/a\/media\/)([0-9a-f]{16,}\.[a-z0-9]+)(?=$|\?)/i,
    `$1${AT_MEDIA_SIZE}/$2`,
  );
}

/** All display images, resolved + deduped. Prefers the clean `images` / `gallery`
 *  arrays; only falls back to `media` (whose hrefs carry a `{resize}` template)
 *  when those are empty. All hrefs are normalised to a uniform render size. */
function collectImages(vehicle: InventoryVehicle): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (value: unknown) => {
    if (!value) return;
    const src = sizeAtImage(String(value));
    if (!src || seen.has(src)) return;
    seen.add(src);
    out.push(src);
  };

  if (Array.isArray(vehicle.images)) vehicle.images.forEach(push);
  if (!out.length && Array.isArray(vehicle.gallery)) {
    for (const item of vehicle.gallery) {
      if (typeof item === "string") push(item);
      else if (item && typeof item === "object") push(item.url || item.href || item.src || item.file || item.path || item.image);
    }
  }
  if (!out.length && Array.isArray(vehicle.media)) {
    for (const m of vehicle.media) {
      if (m && String(m.type || "image").toLowerCase().startsWith("image")) push(m.href || m.url);
    }
  }
  if (!out.length && vehicle.image) push(vehicle.image);
  return out;
}

/** True when the vehicle carries a video (media entry or a video URL field). */
function hasVehicleVideo(vehicle: InventoryVehicle): boolean {
  if (Array.isArray(vehicle.media) && vehicle.media.some((m) => m && String(m.type || "").toLowerCase().includes("video"))) {
    return true;
  }
  const v = vehicle as Record<string, unknown>;
  return Boolean(v.video || v.video_url || v.videoUrl || v.youtube_url || v.youtubeUrl || v.video_embed);
}

function buildTitle(vehicle: InventoryVehicle): string {
  const trim = toText(vehicle.derivative) || toText(vehicle.variant) || toText(vehicle.trim);
  return [toText(vehicle.make), toText(vehicle.model), trim].filter(Boolean).join(" ").trim();
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

function formatEngine(vehicle: InventoryVehicle): string {
  const raw = vehicle.engine_size ?? vehicle.engineSize ?? vehicle.engine;
  if (raw == null) return "";
  const n = typeof raw === "number" ? raw : Number(String(raw).replace(/[^0-9.-]+/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "";
  return n >= 100 ? `${(n / 1000).toFixed(1)}L` : `${n.toFixed(1)}L`;
}

function isReserved(vehicle: InventoryVehicle): boolean {
  if (vehicle.reserved === true) return true;
  return String(vehicle.stock_status || vehicle.status || "").toLowerCase() === "reserved";
}

function isSold(vehicle: InventoryVehicle): boolean {
  return String(vehicle.stock_status || vehicle.status || "").toLowerCase() === "sold";
}

/* Year → UK plate identifier, e.g. 2019 → "19 plate" (Mar-onward approximation). */
function plateFromYear(year: string): string {
  const n = Number(year);
  if (!Number.isFinite(n) || n < 2001) return "";
  return `${String(n).slice(-2)} plate`;
}

/** Representative monthly finance estimate (~2.1%/mo of price — matches the PMG
 *  homepage card convention). Returns "" when there's no usable price; the full
 *  representative example lives on the finance / detail pages. */
function estimateMonthly(value: InventoryVehicle["price"]): string {
  if (value == null) return "";
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
  if (!Number.isFinite(n) || n < 1000) return "";
  return `£${new Intl.NumberFormat("en-GB").format(Math.round(n * 0.021))}/mo`;
}

type Props = {
  vehicle: InventoryVehicle;
  href: string;
  wishlisted: boolean;
  compared: boolean;
  compareDisabled: boolean;
  onToggleWishlist: (event: React.MouseEvent<HTMLButtonElement>, vehicle: InventoryVehicle) => void;
  onToggleCompare: (event: React.MouseEvent<HTMLButtonElement>, vehicle: InventoryVehicle) => void;
  /** List view renders a one-line description under the title. */
  showDescription?: boolean;
  /** Prioritise the first row of images for LCP. */
  priority?: boolean;
};

export function InventoryCard({
  vehicle,
  href,
  wishlisted,
  compared,
  compareDisabled,
  onToggleWishlist,
  onToggleCompare,
  showDescription = false,
  priority = false,
}: Props) {
  const title = buildTitle(vehicle) || "Vehicle";
  const images = collectImages(vehicle);
  const hasVideo = hasVehicleVideo(vehicle);
  const price = formatPrice(vehicle.price);
  const reserved = isReserved(vehicle);
  const sold = isSold(vehicle);

  const year = toText(vehicle.year);
  const plate = plateFromYear(year);
  const mileage = formatMileage(vehicle.mileage);
  const transmission = toText(vehicle.transmission) || toText(vehicle.trans);
  const fuel = toText(vehicle.fuel);
  const engine = formatEngine(vehicle);
  const colour = toText(vehicle.colour) || toText(vehicle.color);
  const description = toText(vehicle.description).replace(/\s+/g, " ");
  const monthly = estimateMonthly(vehicle.price);

  return (
    <article className={`pmg-inv-card${sold ? " is-sold" : reserved ? " is-reserved" : ""}`}>
      <InventoryCardMedia
        images={images}
        title={title}
        href={href}
        reserved={reserved}
        sold={sold}
        hasVideo={hasVideo}
        priority={priority}
        actions={
          <div className="pmg-inv-card-actions">
            <button
              type="button"
              className={`pmg-inv-action${wishlisted ? " is-active" : ""}`}
              aria-pressed={wishlisted}
              aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
              title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
              onClick={(event) => onToggleWishlist(event, vehicle)}
            >
              <Heart size={17} fill={wishlisted ? "currentColor" : "none"} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={`pmg-inv-action is-compare${compared ? " is-active" : ""}`}
              aria-pressed={compared}
              aria-label={compared ? "Remove from compare" : "Add to compare"}
              title={compareDisabled ? "Compare list is full (max 3)" : compared ? "Remove from compare" : "Add to compare"}
              disabled={compareDisabled}
              onClick={(event) => onToggleCompare(event, vehicle)}
            >
              <GitCompareArrows size={16} aria-hidden="true" />
            </button>
          </div>
        }
      />

      <div className="pmg-inv-card-body">
        <a className="pmg-inv-card-title-link" href={href}>
          <h3 className="pmg-inv-card-title">{title}</h3>
        </a>

        {showDescription && description ? <p className="pmg-inv-card-desc">{description}</p> : null}

        <div className="pmg-inv-card-specs">
          {year ? (
            <span className="pmg-inv-spec">
              <Calendar size={14} aria-hidden="true" />
              {year}
            </span>
          ) : null}
          {mileage ? (
            <span className="pmg-inv-spec">
              <Gauge size={14} aria-hidden="true" />
              {mileage}
            </span>
          ) : null}
          {transmission ? (
            <span className="pmg-inv-spec">
              <Cog size={14} aria-hidden="true" />
              {transmission}
            </span>
          ) : null}
          {fuel ? (
            <span className="pmg-inv-spec">
              <Fuel size={14} aria-hidden="true" />
              {fuel}
            </span>
          ) : null}
          {engine ? (
            <span className="pmg-inv-spec">
              <Zap size={14} aria-hidden="true" />
              {engine}
            </span>
          ) : null}
          {colour ? (
            <span className="pmg-inv-spec">
              <Palette size={14} aria-hidden="true" />
              {colour}
            </span>
          ) : null}
        </div>

        <div className="pmg-inv-card-foot">
          <div className="pmg-inv-card-price">
            {price}
            {plate ? <small>{year ? `${year} · ${plate}` : plate}</small> : null}
          </div>
          {monthly ? (
            <div className="pmg-inv-card-finance">
              <span>Finance from</span>
              <strong>{monthly}</strong>
            </div>
          ) : (
            <div className="pmg-inv-card-finance is-generic">Finance available</div>
          )}
        </div>
      </div>
    </article>
  );
}
