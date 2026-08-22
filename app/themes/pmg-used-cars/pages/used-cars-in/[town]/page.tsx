import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dealer } from "../../../data/site-config";
import { HubGrid } from "../../used-cars/HubGrid";
import { fetchInventory } from "../../used-cars/_lib/inventory";
import { EMPTY_FILTERS } from "../../used-cars/_lib/types";
import { areasServed } from "../../../lib/areas";
import { buildLocationPath, resolveAreaFromSlug, slugifyPart } from "../../../lib/seo-links";
import { resolveText } from "../../../lib/brand-text";
import "../../used-cars/inventory.css";
import "../../used-cars/hub.css";

const DEALER_TOWN = dealer.address.town;
const COUNTY = dealer.address.county ?? "";

type PageProps = { params: Promise<{ town: string }> };

// Only towns we actually cover resolve — unknown slugs 404 rather than
// generating thin duplicate pages.
export const dynamicParams = false;

export function generateStaticParams() {
  return areasServed.map((area) => ({ town: slugifyPart(area.town) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { town } = await params;
  const area = resolveAreaFromSlug(town, areasServed);
  if (!area) return {};

  const path = buildLocationPath(area.town);
  const distance = area.miles ? ` Just ${area.miles} miles from our ${DEALER_TOWN} forecourt.` : "";
  const title = `Used Cars in ${area.town}`;
  const description =
    `Looking for used cars in ${area.town}? Browse quality, prepared stock from ${dealer.brandName}, with finance, part-exchange and delivery across ${COUNTY}.${distance}`.slice(
      0,
      160,
    );

  return {
    title,
    description,
    alternates: { canonical: path },
    keywords: [
      `used cars ${area.town.toLowerCase()}`,
      `used cars for sale ${area.town.toLowerCase()}`,
      `car dealer ${area.town.toLowerCase()}`,
      `used cars near ${area.town.toLowerCase()}`,
    ],
    openGraph: {
      title: `${title} | ${dealer.brandName}`,
      description: `Quality used cars for buyers in ${area.town} from ${dealer.brandName}, ${DEALER_TOWN}.`,
      url: path,
      type: "website",
    },
  };
}

export default async function LocationHubPage({ params }: PageProps) {
  const { town } = await params;
  const area = resolveAreaFromSlug(town, areasServed);
  if (!area) notFound();

  const { items, total } = await fetchInventory({ ...EMPTY_FILTERS });
  const path = buildLocationPath(area.town);
  const nearby = areasServed.filter((a) => slugifyPart(a.town) !== town).slice(0, 8);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${dealer.siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Used Cars", item: `${dealer.siteUrl}/used-cars` },
      { "@type": "ListItem", position: 3, name: `Used cars in ${area.town}`, item: `${dealer.siteUrl}${path}` },
    ],
  };

  const areaJsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "@id": `${dealer.siteUrl}${path}#business`,
    name: `${dealer.brandName} — used cars in ${area.town}`,
    url: `${dealer.siteUrl}${path}`,
    telephone: dealer.contact.phoneE164 || dealer.contact.phoneDisplay || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: dealer.address.line1 || undefined,
      addressLocality: DEALER_TOWN,
      addressRegion: COUNTY,
      postalCode: dealer.address.postcode,
      addressCountry: "GB",
    },
    areaServed: { "@type": "City", name: area.town },
  };

  const distanceLead = area.miles
    ? `${dealer.brandName} is just ${area.miles} miles from ${area.town} — browse our latest used cars and drive away or arrange local delivery.`
    : `Browse our latest used cars, available to buyers in ${area.town} and across ${COUNTY}.`;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(areaJsonLd) }} />

      <main className="pmg-hub">
        <section className="pmg-hub-hero">
          <div className="pmg-shell pmg-hub-hero-inner">
            <nav className="pmg-hub-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/used-cars">{resolveText(null, "townHubCrumbUsedCars")}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{area.town}</span>
            </nav>
            <p className="pmg-hub-eyebrow">{resolveText(null, "townHubEyebrow")}</p>
            <h1 className="pmg-hub-title">
              Used cars in <em>{area.town}</em>
            </h1>
            <p className="pmg-hub-lead">{distanceLead}</p>
          </div>
        </section>

        <div className="pmg-shell pmg-hub-body">
          <section className="pmg-hub-copy" aria-label={`About used cars in ${area.town}`}>
            <p>
              {dealer.brandName} serves used-car buyers in {area.town} and the surrounding {COUNTY} area. Every car is
              health-checked and priced to sell, with part-exchange, finance and warranty available. Reserve online or
              visit our {DEALER_TOWN} forecourt{area.miles ? `, ${area.miles} miles away` : ""}.
            </p>
          </section>

          {items.length > 0 ? (
            <>
              <HubGrid items={items} />
              <div className="pmg-hub-more">
                <Link className="pmg-btn pmg-btn-primary pmg-btn-lg" href="/used-cars">
                  View all {total} cars in stock
                </Link>
              </div>
            </>
          ) : (
            <div className="pmg-hub-empty">
              <p>{resolveText(null, "townHubEmptyBody")}</p>
              <div className="pmg-hub-empty-actions">
                <Link className="pmg-btn pmg-btn-primary" href="/used-cars">{resolveText(null, "townHubBrowseAllStock")}</Link>
                <Link className="pmg-btn pmg-btn-outline-dark" href="/car-sourcing">{resolveText(null, "townHubSourceCar")}</Link>
              </div>
            </div>
          )}

          {nearby.length > 0 ? (
            <nav className="pmg-hub-rail" aria-label={resolveText(null, "townHubNearbyLabel")}>
              <h2 className="pmg-hub-rail-title">Used cars near {area.town}</h2>
              <ul className="pmg-hub-rail-list">
                {nearby.map((a) => (
                  <li key={a.town}>
                    <Link href={buildLocationPath(a.town)}>Used cars in {a.town}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>
      </main>
    </>
  );
}
