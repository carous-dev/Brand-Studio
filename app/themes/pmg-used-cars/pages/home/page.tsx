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

export default async function HomePage() {
  const { items } = await fetchInventory({ ...EMPTY_FILTERS, sort: "newest" });
  const featuredCars = toFeaturedCars(items);

  return (
    <div className="pmg-home">
      <Hero />
      <MakesStrip />
      <ServicesSection />
      <FeaturedStock cars={featuredCars} />
      <TrustBar />
      <WhyBuy />
      <Promos />
      <Reviews />
      <SourcingBand />
    </div>
  );
}
