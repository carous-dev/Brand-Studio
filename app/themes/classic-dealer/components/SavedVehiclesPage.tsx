"use client";

import AppIcon from "./AppIcon";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBrand } from "../context/BrandClientWrapper";
import LoaderSpinner from "./LoaderSpinner";
import {
  buildVehicleTitle,
  formatVehicleMileage,
  formatVehiclePrice,
  normalizeVehiclePayload,
  type VehicleDetailsData,
} from "./vehicle-data";
import "../styles/saved-vehicles.css";

type SavedMode = "wishlist" | "compare";

type SavedVehiclesPageProps = {
  mode: SavedMode;
};

type SavedStorageEntry = {
  storageKey: string;
  path: string;
  slug: string;
};

type SavedVehicleCard = SavedStorageEntry & {
  href: string;
  image: string;
  title: string;
  price: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  year: string;
  bodyType: string;
  engine: string;
};

type CompareRow = {
  label: string;
  value: (card: SavedVehicleCard) => string;
};

const INLINE_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400' viewBox='0 0 640 400'%3E%3Crect width='640' height='400' fill='%23eef2f7'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23899bb0' font-family='Arial%2Csans-serif' font-size='24'%3EVehicle%20Image%3C/text%3E%3C/svg%3E";
const COMPARE_STORAGE_PREFIX = "vp-vehicle-compare:";
const MAX_COMPARE_VEHICLES = 3;

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeStoredPath(pathValue: string): string {
  const normalized = String(pathValue ?? "").trim();
  if (!normalized) return "";

  const pathOnly = normalized.split("?")[0].split("#")[0];
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return withLeadingSlash.replace(/^\/vision-prestige(?=\/|$)/, "");
}

function extractVehicleSlug(path: string): string {
  const segments = path.split("/").filter(Boolean);
  if (!segments.length) return "";
  if (segments[0] === "inventory" && segments[1]) return segments[1];
  if (segments[0] === "vehicle-details") return "";
  return segments[segments.length - 1] || "";
}

function formatEngine(vehicle: VehicleDetailsData): string {
  const capacityCc = vehicle.engineCapacityCc;
  const bhp = vehicle.enginePowerBhp;
  const capacityText = capacityCc && Number.isFinite(capacityCc) ? `${(capacityCc / 1000).toFixed(1)}L` : "";
  const bhpText = bhp && Number.isFinite(bhp) ? `${Math.round(bhp)} BHP` : "";
  return [capacityText, bhpText].filter(Boolean).join(" · ") || "On request";
}

function normalizeImageUrl(url?: string): string {
  if (!url) return "";
  try {
    return String(url)
      .replace(/%7Bresize%7D/gi, "{resize}")
      .replace(/\/(?:\d+x\d+|\{resize\})\//g, "/")
      .trim();
  } catch {
    return String(url).trim();
  }
}

function getPayloadImageCandidates(payload: unknown): string[] {
  const root = asRecord(payload);
  const vehicleNode = asRecord(root.vehicle);
  const nestedVehicle = asRecord(vehicleNode.vehicle);

  const candidates: unknown[] = [];
  if (Array.isArray(vehicleNode.images)) {
    candidates.push(...vehicleNode.images);
  }
  if (Array.isArray(nestedVehicle.images)) {
    candidates.push(...nestedVehicle.images);
  }
  candidates.push(vehicleNode.image, nestedVehicle.image);

  const normalized = candidates
    .map((item) => normalizeImageUrl(typeof item === "string" ? item : ""))
    .filter(Boolean);

  return Array.from(new Set(normalized));
}

function resolveCardImage(vehicle: VehicleDetailsData, payload: unknown, fallbackImage: string): string {
  const candidates = [
    ...(Array.isArray(vehicle.images) ? vehicle.images : []),
    ...getPayloadImageCandidates(payload),
  ]
    .map((item) => normalizeImageUrl(item))
    .filter(Boolean);

  return candidates[0] || fallbackImage;
}

async function requestVehiclePayload(slug: string, brandSlug: string): Promise<unknown> {
  const trimmedSlug = String(slug || "").trim();
  if (!trimmedSlug) {
    throw new Error("Vehicle identifier is missing.");
  }

  const queryParams = new URLSearchParams({ slug: trimmedSlug });
  if (brandSlug) {
    queryParams.set("brand", brandSlug);
  }

  const byQueryPath = `/api/vehicle?${queryParams.toString()}`;
  const bySlugPath = `/api/vehicle/${encodeURIComponent(trimmedSlug)}${brandSlug ? `?brand=${encodeURIComponent(brandSlug)}` : ""}`;

  const queryResponse = await fetch(byQueryPath, {
    method: "GET",
    cache: "no-store",
  });
  if (queryResponse.ok) {
    return queryResponse.json();
  }

  const slugResponse = await fetch(bySlugPath, {
    method: "GET",
    cache: "no-store",
  });
  if (slugResponse.ok) {
    return slugResponse.json();
  }

  const batchResponse = await fetch("/api/vehicles/batch", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      ids: [trimmedSlug],
      brand: brandSlug || undefined,
    }),
  });

  if (batchResponse.ok) {
    const batchPayload = await batchResponse.json();
    const firstItem = Array.isArray(batchPayload?.items) ? batchPayload.items[0] : null;
    if (firstItem) {
      return { vehicle: firstItem };
    }
  }

  throw new Error("Vehicle details could not be loaded.");
}

function readSavedEntries(storagePrefix: string): SavedStorageEntry[] {
  const entries: SavedStorageEntry[] = [];
  const seenSlugs = new Set<string>();

  Object.keys(window.localStorage).forEach((key) => {
    if (!key.startsWith(storagePrefix)) return;
    if (window.localStorage.getItem(key) !== "1") return;

    const rawPath = key.slice(storagePrefix.length);
    const path = normalizeStoredPath(rawPath);
    const slug = extractVehicleSlug(path);
    if (!slug || seenSlugs.has(slug)) return;

    seenSlugs.add(slug);
    entries.push({ storageKey: key, path, slug });
  });

  return entries;
}

function getStoredFlagCount(prefix: string): number {
  try {
    return Object.keys(window.localStorage).reduce((total, key) => {
      if (!key.startsWith(prefix)) {
        return total;
      }

      return window.localStorage.getItem(key) === "1" ? total + 1 : total;
    }, 0);
  } catch {
    return 0;
  }
}

function isOnRequestValue(value: string): boolean {
  return String(value ?? "").toLowerCase().includes("on request");
}

function parsePriceAmount(value: string): number | null {
  const numeric = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function formatPounds(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SavedVehiclesPage({ mode }: SavedVehiclesPageProps) {
  const brand = useBrand();
  const fallbackCardImage = useMemo(() => {
    const brandHero = normalizeImageUrl(asString(brand.heroImage));
    const brandLogo = normalizeImageUrl(asString(brand.logo));
    return brandHero || brandLogo || INLINE_FALLBACK_IMAGE;
  }, [brand.heroImage, brand.logo]);

  const modeConfig = useMemo(() => {
    const pages = asRecord(brand.pages);
    const wishlistPage = asRecord(pages.wishlist);
    const comparePage = asRecord(pages.compare);

    const wishlist = {
      storagePrefix: "vp-vehicle-wishlist:",
      updateEvent: "vp:wishlist-updated",
      title: asString(wishlistPage.title) || "Wishlist",
      description:
        asString(wishlistPage.description) ||
        `Review your saved vehicles from ${brand.name} and jump back into details when ready.`,
      emptyMessage: asString(wishlistPage.emptyMessage) || "You have no saved vehicles in your wishlist yet.",
    };

    const compare = {
      storagePrefix: "vp-vehicle-compare:",
      updateEvent: "vp:compare-updated",
      title: asString(comparePage.title) || "Compare",
      description: asString(comparePage.description) || "Compare key specs across your selected vehicles.",
      emptyMessage: asString(comparePage.emptyMessage) || "You have not selected any vehicles to compare yet.",
    };

    return { wishlist, compare } as const;
  }, [brand.name, brand.pages]);

  const config = modeConfig[mode];
  const [cards, setCards] = useState<SavedVehicleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [compareLimitNotice, setCompareLimitNotice] = useState("");
  const compareNoticeTimerRef = useRef<number | null>(null);

  const compareRows = useMemo<CompareRow[]>(
    () => [
      { label: "Price", value: (card: SavedVehicleCard) => card.price },
      { label: "Year", value: (card: SavedVehicleCard) => card.year },
      { label: "Mileage", value: (card: SavedVehicleCard) => card.mileage },
      { label: "Fuel", value: (card: SavedVehicleCard) => card.fuelType },
      { label: "Transmission", value: (card: SavedVehicleCard) => card.transmission },
      { label: "Body Type", value: (card: SavedVehicleCard) => card.bodyType },
      { label: "Engine", value: (card: SavedVehicleCard) => card.engine },
    ],
    [],
  );

  const filteredCompareRows = useMemo(() => {
    if (mode !== "compare") return compareRows;

    return compareRows.filter((row) => {
      const rowValues = cards.map((card) => row.value(card));
      return !rowValues.every((value) => isOnRequestValue(value));
    });
  }, [cards, compareRows, mode]);

  const priceInsights = useMemo(() => {
    if (mode !== "compare") {
      return null;
    }

    const pricedCards = cards
      .map((card) => {
        const amount = parsePriceAmount(card.price);
        if (amount === null) return null;
        return { ...card, amount };
      })
      .filter((card): card is SavedVehicleCard & { amount: number } => Boolean(card));

    if (!pricedCards.length) {
      return {
        pricedCards,
        lowest: null,
        highest: null,
        average: null,
        spread: null,
      };
    }

    const sortedByPrice = [...pricedCards].sort((a, b) => a.amount - b.amount);
    const total = sortedByPrice.reduce((sum, card) => sum + card.amount, 0);
    const lowest = sortedByPrice[0];
    const highest = sortedByPrice[sortedByPrice.length - 1];

    return {
      pricedCards: sortedByPrice,
      lowest,
      highest,
      average: total / sortedByPrice.length,
      spread: highest.amount - lowest.amount,
    };
  }, [cards, mode]);

  useEffect(() => {
    let cancelled = false;

    const loadSavedVehicles = async () => {
      if (typeof window === "undefined") return;

      setLoading(true);
      setError("");

      const savedEntries = readSavedEntries(config.storagePrefix);
      if (!savedEntries.length) {
        if (!cancelled) {
          setCards([]);
          setLoading(false);
        }
        return;
      }

      const results = await Promise.all(
        savedEntries.map(async (entry) => {
          try {
            const payload = await requestVehiclePayload(entry.slug, brand.slug);
            const vehicle = normalizeVehiclePayload(payload);
            if (!vehicle) return null;

            const resolvedSlug = vehicle.slug || entry.slug;

            return {
              ...entry,
              slug: resolvedSlug,
              href: `/used-cars/${encodeURIComponent(resolvedSlug)}`,
              image: resolveCardImage(vehicle, payload, fallbackCardImage),
              title: buildVehicleTitle(vehicle, "Vehicle"),
              price: formatVehiclePrice(vehicle.price, "Enquire"),
              mileage: formatVehicleMileage(vehicle.mileage, "Mileage on request"),
              fuelType: vehicle.fuelType || "On request",
              transmission: vehicle.transmission || "On request",
              year: vehicle.year ? String(vehicle.year) : "On request",
              bodyType: vehicle.bodyType || "On request",
              engine: formatEngine(vehicle),
            } satisfies SavedVehicleCard;
          } catch {
            return null;
          }
        }),
      );

      if (cancelled) return;

      const normalizedCards = results.filter((item): item is SavedVehicleCard => Boolean(item));
      setCards(normalizedCards);
      if (!normalizedCards.length) {
        setError("Saved vehicles could not be loaded right now.");
      }
      setLoading(false);
    };

    loadSavedVehicles();

    return () => {
      cancelled = true;
    };
  }, [brand.slug, config.storagePrefix, fallbackCardImage, refreshVersion]);

  useEffect(() => {
    const triggerRefresh = () => {
      setRefreshVersion((current) => current + 1);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key && !event.key.startsWith(config.storagePrefix)) {
        return;
      }

      triggerRefresh();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(config.updateEvent, triggerRefresh);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(config.updateEvent, triggerRefresh);
    };
  }, [config.storagePrefix, config.updateEvent]);

  useEffect(() => {
    return () => {
      if (compareNoticeTimerRef.current) {
        window.clearTimeout(compareNoticeTimerRef.current);
      }
    };
  }, []);

  const removeVehicle = useCallback(
    (card: SavedVehicleCard) => {
      try {
        window.localStorage.removeItem(card.storageKey);
      } catch {
        return;
      }

      window.dispatchEvent(new CustomEvent(config.updateEvent));
      setCards((current) => current.filter((item) => item.storageKey !== card.storageKey));
    },
    [config.updateEvent],
  );

  const clearAll = useCallback(() => {
    try {
      cards.forEach((card) => {
        window.localStorage.removeItem(card.storageKey);
      });
    } catch {
      return;
    }

    window.dispatchEvent(new CustomEvent(config.updateEvent));
    setCards([]);
  }, [cards, config.updateEvent]);

  const addToCompare = useCallback((card: SavedVehicleCard) => {
    const compareKey = `${COMPARE_STORAGE_PREFIX}${card.path.startsWith("/") ? card.path : `/${card.path}`}`;

    try {
      const isAlreadyCompared = window.localStorage.getItem(compareKey) === "1";
      const currentCompareCount = getStoredFlagCount(COMPARE_STORAGE_PREFIX);

      if (!isAlreadyCompared && currentCompareCount >= MAX_COMPARE_VEHICLES) {
        setCompareLimitNotice("You can compare up to 3 vehicles.");
        if (compareNoticeTimerRef.current) {
          window.clearTimeout(compareNoticeTimerRef.current);
        }
        compareNoticeTimerRef.current = window.setTimeout(() => {
          setCompareLimitNotice("");
        }, 1800);
        return;
      }

      window.localStorage.setItem(compareKey, "1");
      window.dispatchEvent(new CustomEvent("vp:compare-updated"));
      setCompareLimitNotice("");
    } catch {
      // Ignore storage errors and keep page responsive.
    }
  }, []);

  return (
    <section className="saved-vehicles-section">
      <div className="saved-vehicles-shell">
        <header className="saved-vehicles-head">
          <h1>{config.title}</h1>
          <p>{config.description}</p>
          <div className="saved-vehicles-tabs" role="tablist" aria-label="Saved pages">
            <Link href="/wishlist" className={mode === "wishlist" ? "is-active" : undefined}>
              <span>Wishlist</span>
            </Link>
            <Link href="/compare" className={mode === "compare" ? "is-active" : undefined}>
              <span>Compare</span>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="saved-vehicles-loading" aria-live="polite">
            <LoaderSpinner label={`Loading ${config.title.toLowerCase()}`} />
          </div>
        ) : cards.length === 0 ? (
          <div className="saved-vehicles-empty">
            <h2>No vehicles yet</h2>
            <p>{error || config.emptyMessage}</p>
            <Link href="/used-cars">
              Browse Used Cars
            </Link>
          </div>
        ) : (
          <>
            <div className="saved-vehicles-toolbar">
              <p>
                <AppIcon
                  name={mode === "wishlist" ? "heart" : "scale-balanced"}
                  className="saved-vehicles-toolbar-icon"
                />
                {cards.length} vehicle{cards.length === 1 ? "" : "s"} saved
              </p>
              <button type="button" onClick={clearAll}>
                Clear All
              </button>
            </div>

            <div className="saved-wishlist-list">
              {cards.map((card) => (
                <article className="saved-wishlist-row" key={card.storageKey}>
                  <Link className="saved-wishlist-media" href={card.href} aria-label={`View details for ${card.title}`}>
                    <img
                      src={card.image}
                      alt={card.title}
                      onError={(event) => {
                        const imageElement = event.currentTarget;
                        if (imageElement.src === fallbackCardImage) return;
                        imageElement.src = fallbackCardImage;
                      }}
                    />
                  </Link>
                  <div className="saved-wishlist-main">
                    <h2>
                      <Link href={card.href}>{card.title}</Link>
                    </h2>
                    <p className="saved-wishlist-specs">
                      <span>
                        <AppIcon name="road" className="saved-wishlist-spec-icon" />
                        {card.mileage}
                      </span>
                      <span>
                        <AppIcon name="cog" className="saved-wishlist-spec-icon" />
                        {card.transmission}
                      </span>
                      <span>
                        <AppIcon name="gas-pump" className="saved-wishlist-spec-icon" />
                        {card.fuelType}
                      </span>
                      <span>
                        <AppIcon name="calendar-check" className="saved-wishlist-spec-icon" />
                        {card.year}
                      </span>
                    </p>
                  </div>
                  <div className="saved-wishlist-side">
                    <p className="saved-wishlist-price">
                      <AppIcon name="pound-sign" className="saved-wishlist-price-icon" />
                      {card.price}
                    </p>
                    <div className="saved-wishlist-actions">
                      {mode === "wishlist" ? (
                        <button type="button" onClick={() => addToCompare(card)}>
                          Add to Compare
                        </button>
                      ) : null}
                      <Link href={card.href}>
                        Details
                      </Link>
                      <button type="button" className="is-danger" onClick={() => removeVehicle(card)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {mode === "compare" ? (
              cards.length > 1 ? (
                <>
                  <section className="saved-compare-insights" aria-label="Smart price comparison">
                    <h2>Smart Price Comparison</h2>
                    {priceInsights && priceInsights.pricedCards.length ? (
                      <>
                        <p>
                          {priceInsights.pricedCards.length} of {cards.length} vehicles have listed prices.
                        </p>
                        <div className="saved-compare-insight-grid">
                          <div className="saved-compare-insight-item">
                            <span>Lowest Price</span>
                            <strong>{priceInsights.lowest ? formatPounds(priceInsights.lowest.amount) : "N/A"}</strong>
                          </div>
                          <div className="saved-compare-insight-item">
                            <span>Highest Price</span>
                            <strong>{priceInsights.highest ? formatPounds(priceInsights.highest.amount) : "N/A"}</strong>
                          </div>
                          <div className="saved-compare-insight-item">
                            <span>Average Price</span>
                            <strong>{priceInsights.average !== null ? formatPounds(priceInsights.average) : "N/A"}</strong>
                          </div>
                          <div className="saved-compare-insight-item">
                            <span>Price Spread</span>
                            <strong>{priceInsights.spread !== null ? formatPounds(priceInsights.spread) : "N/A"}</strong>
                          </div>
                        </div>
                        <ul className="saved-compare-price-list">
                          {priceInsights.pricedCards.map((priceCard) => {
                            const gapFromLowest =
                              priceInsights.lowest ? Math.max(0, priceCard.amount - priceInsights.lowest.amount) : 0;
                            const gapLabel =
                              gapFromLowest === 0 ? "Lowest priced" : `${formatPounds(gapFromLowest)} above lowest`;

                            return (
                              <li key={`price-${priceCard.storageKey}`}>
                                <span>{priceCard.title}</span>
                                <span>
                                  <strong>{formatPounds(priceCard.amount)}</strong> · {gapLabel}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    ) : (
                      <p>No listed prices are available yet for smart comparison.</p>
                    )}
                  </section>

                  {filteredCompareRows.length ? (
                    <div className="saved-compare-wrap">
                      <table className="saved-compare-table">
                        <thead>
                          <tr>
                            <th>Specification</th>
                            {cards.map((card) => (
                              <th key={`head-${card.storageKey}`}>{card.title}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCompareRows.map((row) => (
                            <tr key={row.label}>
                              <th>{row.label}</th>
                              {cards.map((card) => (
                                <td key={`${row.label}-${card.storageKey}`}>{row.value(card)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="saved-compare-hint">No comparable specification rows are available yet.</p>
                  )}
                </>
              ) : (
                <p className="saved-compare-hint">Add at least one more vehicle to view side-by-side comparison.</p>
              )
            ) : null}
          </>
        )}
      </div>
      {mode === "wishlist" && compareLimitNotice ? (
        <div className="saved-vehicles-snackbar" role="status" aria-live="polite">
          {compareLimitNotice}
        </div>
      ) : null}
    </section>
  );
}
