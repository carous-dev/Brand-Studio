"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Car, Fuel, Gauge } from "lucide-react";
import {
  clearSaved,
  readSaved,
  removeSaved,
  subscribeSaved,
  type SavedKind,
  type SavedVehicle,
} from "./saved-vehicles";
import { GarageAlerts } from "./GarageAlerts";

type Props = {
  mode: SavedKind;
  /** Where the "Browse used cars" / breadcrumb link points. Default /used-cars. */
  usedCarsHref?: string;
  /** Breadcrumb label for the inventory listing. Default "Used Cars". */
  usedCarsLabel?: string;
  /**
   * Show the "get alerts" email-capture banner on the wishlist (default true).
   * Set false to keep the wishlist purely local (no lead capture).
   */
  alerts?: boolean;
  /** Dealer name used in the alert consent copy. */
  brandName?: string;
  /** Override the leads endpoint / api resolver for the alert form. */
  alertEndpoint?: string;
  resolveApiUrl?: (path: string) => string;
  /** Explicit dealer id for the alert lead when NEXT_PUBLIC_CLIENT_ID is unavailable. */
  leadOwner?: string;
};

const COPY: Record<SavedKind, { title: string; blurb: string; empty: string }> = {
  wishlist: {
    title: "Your Wishlist",
    blurb: "Vehicles you've saved for later. They live on this device.",
    empty: "You haven't saved any vehicles yet. Tap the heart on a car to add it here.",
  },
  compare: {
    title: "Compare Vehicles",
    blurb: "A side-by-side look at the cars you've shortlisted (up to 3).",
    empty: "You haven't added any vehicles to compare yet. Tap the compare icon on a car to add it.",
  },
};

const COMPARE_ROWS: Array<{ label: string; get: (v: SavedVehicle) => string }> = [
  { label: "Price", get: (v) => v.price },
  { label: "Year", get: (v) => v.year || "—" },
  { label: "Mileage", get: (v) => v.mileage || "—" },
  { label: "Gearbox", get: (v) => v.transmission || "—" },
  { label: "Fuel", get: (v) => v.fuel || "—" },
];

export function SavedVehiclesView({
  mode,
  usedCarsHref = "/used-cars",
  usedCarsLabel = "Used Cars",
  alerts = true,
  brandName,
  alertEndpoint,
  resolveApiUrl,
  leadOwner,
}: Props) {
  const copy = COPY[mode];
  const [items, setItems] = useState<SavedVehicle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sync = () => setItems(readSaved(mode));
    sync();
    setMounted(true);
    return subscribeSaved(mode, sync);
  }, [mode]);

  return (
    <>
      <div className="cg-topbar">
        <nav className="cg-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={usedCarsHref}>{usedCarsLabel}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{mode === "wishlist" ? "Wishlist" : "Compare"}</span>
        </nav>
        <div className="cg-saved-tabs" role="tablist" aria-label="Saved lists">
          <Link href="/wishlist" role="tab" aria-selected={mode === "wishlist"} className={mode === "wishlist" ? "is-active" : undefined}>
            Wishlist
          </Link>
          <Link href="/compare" role="tab" aria-selected={mode === "compare"} className={mode === "compare" ? "is-active" : undefined}>
            Compare
          </Link>
        </div>
      </div>

      <header className="cg-saved-head">
        <div>
          <h1 className="cg-saved-title">{copy.title}</h1>
          <p className="cg-saved-blurb">{copy.blurb}</p>
        </div>
        {(mode === "wishlist" && alerts) || (mounted && items.length > 0) ? (
          <div className="cg-saved-actions">
            {mode === "wishlist" && alerts ? (
              <GarageAlerts
                vehicles={items}
                brandName={brandName}
                endpoint={alertEndpoint}
                resolveApiUrl={resolveApiUrl}
                leadOwner={leadOwner}
              />
            ) : null}
            {mounted && items.length > 0 ? (
              <button type="button" className="cg-saved-clear" onClick={() => clearSaved(mode)}>
                Clear all
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      {!mounted ? null : items.length === 0 ? (
        <div className="cg-empty" role="status">
          <h3>Nothing here yet</h3>
          <p>{copy.empty}</p>
          <Link href={usedCarsHref} className="cg-empty-cta">Browse used cars</Link>
        </div>
      ) : (
        <>
          <div className="cg-saved-grid">
            {items.map((vehicle) => (
              <article className="cg-saved-card" key={vehicle.slug}>
                <Link href={vehicle.href} className="cg-saved-media" aria-label={vehicle.title}>
                  {vehicle.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={vehicle.image} alt={vehicle.title} loading="lazy" />
                  ) : (
                    <span className="cg-saved-media-fallback" aria-hidden="true">No image</span>
                  )}
                </Link>
                <div className="cg-saved-body">
                  <div className="cg-saved-card-head">
                    <h2 className="cg-saved-card-title">
                      <Link href={vehicle.href}>{vehicle.title}</Link>
                    </h2>
                    <p className="cg-saved-card-price">{vehicle.price}</p>
                  </div>
                  <div className="cg-saved-card-specs">
                    {vehicle.year ? (
                      <span className="cg-spec"><Calendar size={15} className="cg-spec-icon" aria-hidden="true" />{vehicle.year}</span>
                    ) : null}
                    {vehicle.mileage ? (
                      <span className="cg-spec"><Gauge size={15} className="cg-spec-icon" aria-hidden="true" />{vehicle.mileage}</span>
                    ) : null}
                    {vehicle.transmission ? (
                      <span className="cg-spec"><Car size={15} className="cg-spec-icon" aria-hidden="true" />{vehicle.transmission}</span>
                    ) : null}
                    {vehicle.fuel ? (
                      <span className="cg-spec"><Fuel size={15} className="cg-spec-icon" aria-hidden="true" />{vehicle.fuel}</span>
                    ) : null}
                  </div>
                  <div className="cg-saved-card-actions">
                    <Link href={vehicle.href} className="cg-saved-view">View details</Link>
                    <button type="button" className="cg-saved-remove" onClick={() => removeSaved(mode, vehicle.slug)}>
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {mode === "compare" ? (
            items.length > 1 ? (
              <div className="cg-compare-wrap">
                <table className="cg-compare-table">
                  <thead>
                    <tr>
                      <th scope="col">Spec</th>
                      {items.map((vehicle) => (
                        <th scope="col" key={vehicle.slug}>
                          <Link href={vehicle.href}>{vehicle.title}</Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        {items.map((vehicle) => (
                          <td key={`${row.label}-${vehicle.slug}`}>{row.get(vehicle)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="cg-compare-hint">Add at least one more vehicle to see them side by side.</p>
            )
          ) : null}
        </>
      )}
    </>
  );
}
