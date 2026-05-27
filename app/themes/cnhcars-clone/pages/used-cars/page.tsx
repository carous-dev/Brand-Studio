import UsedCarsPageClient from './UsedCarsPageClient';
import { DEFAULT_INVENTORY_PAGINATION, fetchInventoryData } from '../../lib/inventory';
import { getBrandSlugFromRequest } from '../../lib/brand-slug.server';
import { absoluteUrl, siteConfig, siteUrl } from '../../lib/seo';
import { buildVehiclePermalink } from '../../lib/vehicle-links';

// Page-level metadata removed — brandstudio's runtime owns metadata via
// generateThemePageMetadata; the per-theme buildPageMetadata used hardcoded
// `siteConfig` (cnhcars copy), which leaks through to other brands.

export default async function UsedCarsPage() {
  const brandSlug = await getBrandSlugFromRequest();
  const initialInventoryData = await fetchInventoryData({
    pagination: DEFAULT_INVENTORY_PAGINATION,
    cache: 'no-store',
    brandSlug,
  }).catch(() => null);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Used Cars',
        item: absoluteUrl('/used-cars'),
      },
    ],
  };

  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Used Cars for Sale | ${siteConfig.name}`,
    url: absoluteUrl('/used-cars'),
    isPartOf: { '@id': `${siteUrl}/#website` },
    inLanguage: 'en-GB',
    description: `Used cars for sale at ${siteConfig.name} in ${siteConfig.address.addressLocality}, ${siteConfig.address.addressRegion}.`,
  };

  const items = Array.isArray(initialInventoryData?.items) ? initialInventoryData!.items : [];
  const itemListEntries = items
    .slice(0, 12)
    .map((item: any, index: number) => {
      const slug = item?.slug ?? item?.derivative_slug ?? '';
      const reg = item?.reg ?? item?.registration ?? '';
      const permalink = buildVehiclePermalink({ slug, reg }, '/used-cars');
      if (!permalink || permalink === '/used-cars') return null;
      const title = [item?.year, item?.make, item?.model, item?.derivative]
        .filter(Boolean)
        .join(' ') || item?.title || `${item?.make ?? ''} ${item?.model ?? ''}`.trim();
      if (!title) return null;
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(permalink),
        name: title,
      };
    })
    .filter(Boolean);

  const itemListJsonLd = itemListEntries.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Used cars at ${siteConfig.name}`,
        description: `Live used-car inventory at ${siteConfig.name} in ${siteConfig.address.addressLocality}.`,
        itemListOrder: 'https://schema.org/ItemListUnordered',
        numberOfItems: itemListEntries.length,
        itemListElement: itemListEntries,
      }
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, collectionPageJsonLd]) }}
      />
      {itemListJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
      ) : null}
      <UsedCarsPageClient initialInventoryData={initialInventoryData} />
    </>
  );
}
