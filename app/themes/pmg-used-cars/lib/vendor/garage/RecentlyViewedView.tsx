"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Car, Fuel, Gauge } from "lucide-react";
import { clearRecent, readRecent, subscribeRecent } from "./recently-viewed";
import type { SavedVehicle } from "./saved-vehicles";

type Props = {
  usedCarsHref?: string;
  usedCarsLabel?: string;
};

/**
 * Full-page list of the buyer's recently viewed vehicles, read from
 * localStorage. Reuses the saved-pages card styles for visual consistency.
 */
export function RecentlyViewedView({ usedCarsHref = "/used-cars", usedCarsLabel = "Used Cars" }: Props) {
  const [items, setItems] = useState<SavedVehicle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sync = () => setItems(readRecent());
    sync();
    setMounted(true);
    return subscribeRecent(sync);
  }, []);

  return (
    <>
      <div className="cg-topbar">
        <nav className="cg-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href={usedCarsHref}>{usedCarsLabel}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Recently Viewed</span>
        </nav>
      </div>

      <header className="cg-saved-head">
        <div>
          <h1 className="cg-saved-title">Recently viewed</h1>
          <p className="cg-saved-blurb">The cars you&apos;ve looked at, ready to pick back up where you left off.</p>
        </div>
        {mounted && items.length > 0 ? (
          <button type="button" className="cg-saved-clear" onClick={() => clearRecent()}>
            Clear history
          </button>
        ) : null}
      </header>

      {!mounted ? null : items.length === 0 ? (
        <div className="cg-empty" role="status">
          <h3>Nothing here yet</h3>
          <p>Vehicles you open will show up here so you can find them again easily.</p>
          <Link href={usedCarsHref} className="cg-empty-cta">Browse used cars</Link>
        </div>
      ) : (
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
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
