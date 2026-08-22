"use client";

import { useState } from "react";
import Link from "next/link";

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

import type { BrandConfig } from "@/brands/types";
import { HubGrid } from "../../pages/used-cars/HubGrid";
import "../../pages/used-cars/inventory.css";
import { BODY_ORDER, type FeaturedCar } from "./featured-data";
import { resolveText } from "../../lib/brand-text";

type Tab = { key: string; label: string };

/** Build the tab set from the body types actually present in the featured cars. */
function buildTabs(cars: FeaturedCar[]): Tab[] {
  const present = new Set(cars.map((c) => c.bodyKey));
  const tabs: Tab[] = [{ key: "all", label: "All cars" }];
  for (const key of BODY_ORDER) {
    if (!present.has(key)) continue;
    const car = cars.find((c) => c.bodyKey === key);
    if (car) tabs.push({ key, label: car.bodyLabel });
  }
  // Only worth showing category tabs when there's more than one to choose from.
  return tabs.length > 2 ? tabs : [];
}

export function FeaturedStock({ cars, brand }: { cars: FeaturedCar[]; brand: BrandConfig }) {
  const [filter, setFilter] = useState("all");

  if (!cars.length) return null;

  const tabs = buildTabs(cars);
  const shown = cars.filter((c) => filter === "all" || c.bodyKey === filter);

  return (
    <section className="section" id="stock">
      <div className="pmg-shell">
        <div className="section-head">
          <span className="eyebrow center">{resolveText(brand, "featuredEyebrow")}</span>
          <h2>{resolveText(brand, "featuredTitle")}</h2>
          <p>
            A hand-picked selection from our forecourt. Every car is prepared to a high standard and
            ready to drive away.
          </p>
        </div>

        {tabs.length ? (
          <div className="tabs">
            {tabs.map((t) => (
              <button key={t.key} className={filter === t.key ? "on" : undefined} onClick={() => setFilter(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        ) : null}

        <HubGrid items={shown.map((c) => c.vehicle)} />

        <div className="stock-foot">
          <Link href="/used-cars" className="pmg-btn pmg-btn-outline-dark pmg-btn-lg">
            Browse all cars <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
