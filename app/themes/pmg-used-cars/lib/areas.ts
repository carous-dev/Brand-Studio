/**
 * Towns PMG Used Car Sales covers and delivers to, ordered by approx road miles
 * from the Dewsbury (WF13) forecourt. Editable starting list — add/remove towns
 * as delivery coverage changes.
 *
 * Surfaced in the footer "Areas we cover" band as location-keyword internal links
 * feeding the /used-cars stock page, so every page carries local SEO signals.
 */
export type DealerArea = { town: string; miles: number };

export const areasServed: DealerArea[] = [
  { town: "Dewsbury", miles: 0 },
  { town: "Batley", miles: 2 },
  { town: "Heckmondwike", miles: 2 },
  { town: "Mirfield", miles: 3 },
  { town: "Ossett", miles: 4 },
  { town: "Cleckheaton", miles: 4 },
  { town: "Wakefield", miles: 6 },
  { town: "Huddersfield", miles: 7 },
  { town: "Morley", miles: 5 },
  { town: "Leeds", miles: 9 },
  { town: "Bradford", miles: 8 },
];

/**
 * Curated make labels for the footer "Browse by make" band. Static (not live
 * stock) so the footer stays render-only on every page — mirrors the fleet
 * convention. Links resolve to /used-cars?make=<label> like the on-page MakesBand.
 */
export const popularMakes: string[] = [
  "Audi",
  "BMW",
  "Ford",
  "Mercedes-Benz",
  "Nissan",
  "Vauxhall",
  "Toyota",
  "Volkswagen",
  "Kia",
  "Land Rover",
];
