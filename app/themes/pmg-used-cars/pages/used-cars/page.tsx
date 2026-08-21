import type { Metadata } from "next";
import { dealer } from "../../data/site-config";
import { InventoryClient } from "./InventoryClient";
import { MakesBand } from "./MakesBand";
import { fetchFilterMeta, fetchInventory } from "./_lib/inventory";
import { buildVehiclePermalink } from "../../lib/vehicle-links";
import { readFilters, type RawSearchParams } from "./_lib/types";
import "./inventory.css";

const TOWN = dealer.address.town;
const COUNTY = dealer.address.county ?? "";

export const metadata: Metadata = {
  title: `Used Cars in ${TOWN}`,
  description: `Browse quality used cars for sale at ${dealer.brandName} in ${TOWN}${COUNTY ? `, ${COUNTY}` : ""}. Every car prepared to a high standard with in-house warranty options — filter, compare and reserve online.`,
  alternates: { canonical: "/used-cars" },
  keywords: [
    `used cars ${TOWN.toLowerCase()}`,
    `used cars for sale ${TOWN.toLowerCase()}`,
    `used cars ${COUNTY.toLowerCase()}`,
    "quality used cars west yorkshire",
    "cheap used cars dewsbury",
    `${dealer.brandName.toLowerCase()} stock`,
  ],
  openGraph: {
    title: `Used Cars in ${TOWN} | ${dealer.brandName}`,
    description: `Quality used cars for sale at ${dealer.brandName}, ${TOWN}. Filter, compare and reserve online.`,
    url: "/used-cars",
    type: "website",
  },
};

type PageProps = {
  searchParams?: Promise<RawSearchParams>;
};

export default async function UsedCarsPage({ searchParams }: PageProps) {
  const resolved = searchParams ? await searchParams : {};
  const filters = readFilters(resolved);

  const [{ items, total }, meta] = await Promise.all([fetchInventory(filters), fetchFilterMeta()]);

  const makeLinks = Object.keys(meta.makesToModels)
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 18);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${dealer.siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Used Cars", item: `${dealer.siteUrl}/used-cars` },
    ],
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Used Cars for Sale | ${dealer.brandName}`,
    url: `${dealer.siteUrl}/used-cars`,
    inLanguage: "en-GB",
    description: `Used cars for sale at ${dealer.brandName} in ${TOWN}${COUNTY ? `, ${COUNTY}` : ""}.`,
  };

  const itemListElements = items
    .slice(0, 12)
    .map((vehicle, index) => {
      const path = buildVehiclePermalink(vehicle, "/used-cars");
      if (path === "/used-cars") return null;
      const title = [vehicle.year, typeof vehicle.make === "string" ? vehicle.make : vehicle.make?.name, typeof vehicle.model === "string" ? vehicle.model : vehicle.model?.name]
        .filter(Boolean)
        .join(" ");
      return {
        "@type": "ListItem",
        position: index + 1,
        url: `${dealer.siteUrl}${path}`,
        name: title || "Used car",
      };
    })
    .filter(Boolean);

  const itemListJsonLd = itemListElements.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `Used cars at ${dealer.brandName}`,
        numberOfItems: itemListElements.length,
        itemListOrder: "https://schema.org/ItemListUnordered",
        itemListElement: itemListElements,
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }} />
      {itemListJsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      ) : null}

      <main className="pmg-inv-page">
        <section className="pmg-inv-hero">
          <div className="pmg-shell pmg-inv-hero-inner">
            <p className="pmg-inv-hero-eyebrow">Current stock · {TOWN}</p>
            <h1 className="pmg-inv-hero-title">
              Quality used cars. <em>Zero pressure.</em>
            </h1>
            <p className="pmg-inv-hero-lead">
              Every car health-checked, valeted and prepared to a high standard — honest advice, no
              pressure. View it, drive it, sleep on it.
            </p>
            <div className="pmg-inv-hero-stats" aria-label="Dealership at a glance">
              <span className="pmg-inv-hero-stat">
                <strong>{total}</strong> in stock
              </span>
              <span className="pmg-inv-hero-divider" aria-hidden="true" />
              <span className="pmg-inv-hero-stat">
                <strong>4.5</strong>
                <small>/5</small> Feefo
              </span>
              <span className="pmg-inv-hero-divider" aria-hidden="true" />
              <span className="pmg-inv-hero-stat">
                <strong>30mi</strong> free delivery
              </span>
            </div>
          </div>
        </section>

        <div className="pmg-shell">
          <InventoryClient initialItems={items} initialTotal={total} meta={meta} />

          <MakesBand makes={makeLinks} town={TOWN} />
        </div>
      </main>
    </>
  );
}
