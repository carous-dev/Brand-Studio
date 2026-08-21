"use client";

import { useEffect } from "react";
import { recordRecent } from "./recently-viewed";
import type { SavedVehicle } from "./saved-vehicles";

/**
 * Records a vehicle into the "recently viewed" list on mount. Render on the
 * vehicle detail page with a server-built snapshot so no client fetch is
 * needed. Renders nothing.
 */
export function RecordRecentlyViewed({ vehicle }: { vehicle: SavedVehicle }) {
  useEffect(() => {
    recordRecent(vehicle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle.slug]);
  return null;
}
