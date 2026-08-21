"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readRecent, subscribeRecent } from "./recently-viewed";
import type { SavedVehicle } from "./saved-vehicles";

/**
 * "Recently viewed" strip — a horizontal rail of the buyer's last-opened
 * vehicles, read from localStorage. Hidden until mounted with at least one
 * item (so no SSR/hydration mismatch and no empty shell). `excludeSlug` drops
 * the vehicle currently being viewed.
 */
export function RecentlyViewed({ excludeSlug, heading = "Recently viewed" }: { excludeSlug?: string; heading?: string }) {
  const [items, setItems] = useState<SavedVehicle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const sync = () => setItems(readRecent());
    sync();
    setMounted(true);
    return subscribeRecent(sync);
  }, []);

  const visible = items.filter((v) => v.slug !== excludeSlug);
  if (!mounted || visible.length === 0) return null;

  return (
    <section className="cg-recent" aria-label={heading}>
      <h2 className="cg-recent-title">{heading}</h2>
      <div className="cg-recent-rail">
        {visible.map((vehicle) => (
          <Link key={vehicle.slug} href={vehicle.href} className="cg-recent-card">
            <span className="cg-recent-media">
              {vehicle.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={vehicle.image} alt={vehicle.title} loading="lazy" />
              ) : (
                <span className="cg-recent-media-fallback" aria-hidden="true">No image</span>
              )}
            </span>
            <span className="cg-recent-body">
              <span className="cg-recent-name">{vehicle.title}</span>
              <span className="cg-recent-price">{vehicle.price}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
