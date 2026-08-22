import { Hero } from "../../components/home/Hero";
import { MakesStrip } from "../../components/home/MakesStrip";
import { ServicesSection } from "../../components/home/ServicesSection";
import { FeaturedStock } from "../../components/home/FeaturedStock";
import { toFeaturedCars } from "../../components/home/featured-data";
import { TrustBar } from "../../components/home/TrustBar";
import { WhyBuy } from "../../components/home/WhyBuy";
import { Promos } from "../../components/home/Promos";
import { Reviews } from "../../components/home/Reviews";
import { SourcingBand } from "../../components/home/SourcingBand";
import { fetchInventory } from "../used-cars/_lib/inventory";
import { EMPTY_FILTERS } from "../used-cars/_lib/types";
import type { ThemePageProps } from "../../../types";

export default async function HomePage({ brand }: ThemePageProps) {
  const { items } = await fetchInventory({ ...EMPTY_FILTERS, sort: "newest" });
  const featuredCars = toFeaturedCars(items);

  return (
    <div className="pmg-home">
      <Hero brand={brand} />
      <MakesStrip />
      <ServicesSection brand={brand} />
      <FeaturedStock cars={featuredCars} brand={brand} />
      <TrustBar />
      <WhyBuy brand={brand} />
      <Promos brand={brand} />
      <Reviews brand={brand} />
      <SourcingBand brand={brand} />
    </div>
  );
}
