"use client";

import { useEffect, useState } from "react";
import { GitCompareArrows, Heart } from "lucide-react";
import { isSaved, subscribeSaved, toggleSaved, type SavedVehicle } from "./saved-vehicles";

/**
 * Wishlist + compare toggles overlaid on an inventory card. Render as a sibling
 * of the card's <Link> (not a child) so taps here never trigger card
 * navigation, inside a positioned wrapper. State hydrates in a mount effect to
 * stay SSR-safe, and stays in sync with the header counters via the shared
 * store events.
 */
export function VehicleSaveButtons({ vehicle }: { vehicle: SavedVehicle }) {
  const [wished, setWished] = useState(false);
  const [compared, setCompared] = useState(false);
  const [limitHint, setLimitHint] = useState(false);

  useEffect(() => {
    const sync = () => {
      setWished(isSaved("wishlist", vehicle.slug));
      setCompared(isSaved("compare", vehicle.slug));
    };
    sync();
    const unWishlist = subscribeSaved("wishlist", sync);
    const unCompare = subscribeSaved("compare", sync);
    return () => {
      unWishlist();
      unCompare();
    };
  }, [vehicle.slug]);

  return (
    <div className="cg-card-save">
      <button
        type="button"
        className={`cg-card-save-btn${wished ? " is-active" : ""}`}
        aria-pressed={wished}
        aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
        title={wished ? "Remove from wishlist" : "Save to wishlist"}
        onClick={() => setWished(toggleSaved("wishlist", vehicle).saved)}
      >
        <Heart size={16} aria-hidden="true" fill={wished ? "currentColor" : "none"} />
      </button>
      <button
        type="button"
        className={`cg-card-save-btn${compared ? " is-active" : ""}${limitHint ? " is-limited" : ""}`}
        aria-pressed={compared}
        aria-label={compared ? "Remove from compare" : "Add to compare"}
        title={limitHint ? "You can compare up to 3 vehicles" : compared ? "Remove from compare" : "Add to compare"}
        onClick={() => {
          const result = toggleSaved("compare", vehicle);
          if (result.limited) {
            setLimitHint(true);
            window.setTimeout(() => setLimitHint(false), 1600);
            return;
          }
          setCompared(result.saved);
        }}
      >
        <GitCompareArrows size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
