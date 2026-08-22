import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dealer } from "../../../data/site-config";
import { HubGrid } from "../../used-cars/HubGrid";
import { fetchFilterMeta, fetchInventory } from "../../used-cars/_lib/inventory";
import { EMPTY_FILTERS } from "../../used-cars/_lib/types";
import { popularMakes } from "../../../lib/areas";
import { buildMakePath, resolveMakeFromSlug, slugifyPart } from "../../../lib/seo-links";
import { resolveText } from "../../../lib/brand-text";
import "../../used-cars/inventory.css";
import "../../used-cars/hub.css";

const TOWN = dealer.address.town;
const COUNTY = dealer.address.county ?? "";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return popularMakes.map((make) => ({ slug: slugifyPart(make) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = await fetchFilterMeta();
  const availableMakes = Object.keys(meta.makesToModels);
  const known = availableMakes.some((m) => slugifyPart(m) === slug) || popularMakes.some((m) => slugifyPart(m) === slug);
  if (!known) return {};

  const make = resolveMakeFromSlug(slug, availableMakes.length ? availableMakes : popularMakes);
  const path = buildMakePath(make);
  const title = `Used ${make} Cars for Sale`;
  const description =
    `Browse used ${make} cars for sale at ${dealer.brandName} in ${TOWN}${COUNTY ? `, ${COUNTY}` : ""}. Every ${make} prepared to a high standard with in-house warranty options — reserve online or arrange a viewing.`.slice(
      0,
      160,
    );

  return {
    title,
    description,
    alternates: { canonical: path },
    keywords: [
      `used ${make.toLowerCase()}`,
      `${make.toLowerCase()} for sale ${TOWN.toLowerCase()}`,
      `used ${make.toLowerCase()} cars ${COUNTY.toLowerCase()}`,
      `${make.toLowerCase()} dealer ${TOWN.toLowerCase()}`,
    ],
    openGraph: {
      title: `${title} | ${dealer.brandName}`,
      description: `Used ${make} cars for sale at ${dealer.brandName}, ${TOWN}.`,
      url: path,
      type: "website",
    },
  };
}

export default async function MakeHubPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = await fetchFilterMeta();
  const availableMakes = Object.keys(meta.makesToModels);

  const isInStock = availableMakes.some((m) => slugifyPart(m) === slug);
  const isCurated = popularMakes.some((m) => slugifyPart(m) === slug);
  if (!isInStock && !isCurated) notFound();

  const make = resolveMakeFromSlug(slug, availableMakes.length ? availableMakes : popularMakes);
  const { items, total } = await fetchInventory({ ...EMPTY_FILTERS, make });

  const path = buildMakePath(make);
  const otherMakes = availableMakes.filter((m) => slugifyPart(m) !== slug).sort((a, b) => a.localeCompare(b)).slice(0, 12);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${dealer.siteUrl}/` },
      { "@type": "ListItem", position: 2, name: "Used Cars", item: `${dealer.siteUrl}/used-cars` },
      { "@type": "ListItem", position: 3, name: `Used ${make}`, item: `${dealer.siteUrl}${path}` },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Used ${make} Cars for Sale | ${dealer.brandName}`,
    url: `${dealer.siteUrl}${path}`,
    inLanguage: "en-GB",
    description: `Used ${make} cars for sale at ${dealer.brandName} in ${TOWN}${COUNTY ? `, ${COUNTY}` : ""}.`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

      <main className="pmg-hub">
        <section className="pmg-hub-hero">
          <div className="pmg-shell pmg-hub-hero-inner">
            <nav className="pmg-hub-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/used-cars">{resolveText(null, "makeHubCrumbUsedCars")}</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{make}</span>
            </nav>
            <p className="pmg-hub-eyebrow">{resolveText(null, "makeHubEyebrow")}</p>
            <h1 className="pmg-hub-title">
              Used <em>{make}</em> cars for sale
            </h1>
            <p className="pmg-hub-lead">
              {total > 0
                ? `${total} used ${make} ${total === 1 ? "car" : "cars"} in stock at ${dealer.brandName}, ${TOWN} — each health-checked, valeted and prepared to a high standard.`
                : `We don't have a ${make} in stock right now, but we source cars to order — tell us what you're after and we'll find it.`}
            </p>
          </div>
        </section>

        <div className="pmg-shell pmg-hub-body">
          {items.length > 0 ? (
            <>
              <HubGrid items={items} />
              {total > items.length ? (
                <div className="pmg-hub-more">
                  <Link className="pmg-btn pmg-btn-primary pmg-btn-lg" href={`/used-cars?make=${encodeURIComponent(make)}`}>
                    View all {total} {make} in stock
                  </Link>
                </div>
              ) : null}
            </>
          ) : (
            <div className="pmg-hub-empty">
              <p>No {make} available today. New stock lands weekly.</p>
              <div className="pmg-hub-empty-actions">
                <Link className="pmg-btn pmg-btn-primary" href="/car-sourcing">Source a {make}</Link>
                <Link className="pmg-btn pmg-btn-outline-dark" href="/used-cars">{resolveText(null, "makeHubBrowseAllStock")}</Link>
              </div>
            </div>
          )}

          {otherMakes.length > 0 ? (
            <nav className="pmg-hub-rail" aria-label={resolveText(null, "makeHubOtherMakesLabel")}>
              <h2 className="pmg-hub-rail-title">{resolveText(null, "makeHubOtherMakesTitle")}</h2>
              <ul className="pmg-hub-rail-list">
                {otherMakes.map((m) => (
                  <li key={m}>
                    <Link href={buildMakePath(m)}>{m}</Link>
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
