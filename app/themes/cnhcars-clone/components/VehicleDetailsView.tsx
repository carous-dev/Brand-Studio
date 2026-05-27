"use client";

import { useEffect, useState } from "react";
import "../styles/vehicle-details.css";
import "../styles/youtube-player.css";
import "../styles/vehicle-details-loader.css";
import LoaderSpinner from "./LoaderSpinner";
import VehicleDetailsContent from "./VehicleDetailsContent";
import VehicleDetailsHero from "./VehicleDetailsHero";
import YouTubePlayer, { hasSupportedVideoSource } from "./YouTubePlayer";
import { normalizeVehiclePayload, type VehicleDetailsData } from "./vehicle-data";
import { apiUrl } from "../lib/api";
import { getVehicleLookupCandidates } from "../lib/vehicle-links";

type VehicleDetailsViewProps = {
  vehicleSlug?: string;
  initialVehicle?: VehicleDetailsData | null;
};

function pickVehicleSlug(value: unknown): string {
  const slug = String(value ?? "").trim();
  return slug;
}

async function resolveInitialSlug(explicitSlug?: string): Promise<string> {
  const direct = pickVehicleSlug(explicitSlug);
  if (direct) return direct;

  try {
    const response = await fetch(apiUrl("/featured-vehicles?limit=1"), {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => [])) as unknown;
    if (!response.ok || !Array.isArray(payload) || payload.length === 0) {
      return "";
    }

    const first = payload[0] as Record<string, unknown>;
    return (
      pickVehicleSlug(first.derivative_slug) ||
      pickVehicleSlug(first.slug) ||
      pickVehicleSlug(first.registration) ||
      pickVehicleSlug(first.reg)
    );
  } catch {
    return "";
  }
}

async function requestVehiclePayload(slug: string): Promise<unknown> {
  for (const candidate of getVehicleLookupCandidates(slug)) {
    const targets = [
      candidate.slug ? apiUrl(`/vehicle?slug=${encodeURIComponent(candidate.slug)}`) : "",
      candidate.reg ? apiUrl(`/vehicle?reg=${encodeURIComponent(candidate.reg)}`) : "",
    ].filter(Boolean);

    for (const target of targets) {
      const response = await fetch(target, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) continue;

      return response.json();
    }
  }

  throw new Error("Vehicle details could not be loaded.");
}

export default function VehicleDetailsView({ vehicleSlug, initialVehicle = null }: VehicleDetailsViewProps) {
  const [vehicle, setVehicle] = useState<VehicleDetailsData | null>(initialVehicle);
  const [loading, setLoading] = useState(!initialVehicle);
  const [error, setError] = useState("");
  const hasVideoInGallery = hasSupportedVideoSource(vehicle?.videoUrl);

  useEffect(() => {
    if (initialVehicle) {
      setVehicle(initialVehicle);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;

    const loadVehicle = async () => {
      setLoading(true);
      setError("");

      try {
        const slug = await resolveInitialSlug(vehicleSlug);
        if (!slug) {
          throw new Error("No vehicle selected.");
        }

        const payload = await requestVehiclePayload(slug);
        const normalized = normalizeVehiclePayload(payload);

        if (!normalized) {
          throw new Error("Vehicle details were returned in an unsupported format.");
        }

        if (!cancelled) {
          setVehicle(normalized);
        }
      } catch (requestError) {
        if (!cancelled) {
          setVehicle(null);
          setError(requestError instanceof Error ? requestError.message : "Unable to load vehicle details.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadVehicle();

    return () => {
      cancelled = true;
    };
  }, [vehicleSlug, initialVehicle]);

  if (loading && !vehicle && !error) {
    return (
      <div className="vehicle-details-root">
        <VehicleDetailsHero vehicle={vehicle} loading={loading} />
        <section className="vehicle-details-main">
          <div className="vehicle-details-shell">
            <div className="vehicle-details-loading-state" data-aos="fade-up">
              <LoaderSpinner label="Loading vehicle details" size="lg" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="vehicle-details-root">
      <VehicleDetailsHero vehicle={vehicle} loading={loading} />
      <VehicleDetailsContent vehicle={vehicle} loading={loading} error={error} />
      {hasVideoInGallery ? <YouTubePlayer videoUrl={vehicle?.videoUrl} initialMinimized /> : null}
    </div>
  );
}
