// Page-level metadata removed — brandstudio's runtime owns metadata via
// generateThemePageMetadata. JSON-LD also dropped because it depended on
// hardcoded `siteConfig` (cnhcars dealer info) that wouldn't apply to any
// other brand record rendering this theme. Re-derive from `brand` prop /
// useBrand if needed for SEO later.
import SellYourCarMount from '../../components/SellYourCarMount';

export default function SellYourCarPage() {
  return (
    <main>
      <SellYourCarMount />
    </main>
  );
}
