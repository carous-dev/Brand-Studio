/**
 * Ported from F:\projects\firstbuy-motors\lib\cars.ts.
 *
 * Seed inventory + makes + testimonials used by the theme's home / used-cars
 * pages when no real inventory is wired through the brandstudio API. Real
 * brand records can override these via `brand.testimonials`, `brand.faq`, and
 * the live `/api/inventory` feed; the seed only ships sample data so the
 * theme renders out-of-the-box for preview generation.
 */

export type Car = {
  id: string;
  name: string;
  price: number;
  year: number;
  mileage: string;
  gearbox: "Manual" | "Automatic";
  colour: string;
  fuel: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  make: string;
  reserved?: boolean;
  image: string;
};

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const heroImage = u("photo-1503376780353-7e6692767b70", 2000);
export const showroomImage = u("photo-1567818735868-e71b99932e29", 1600);
export const aboutImage = u("photo-1560958089-b8a1929cea89", 1200);
export const sellImage = u("photo-1502877338535-766e1452684a", 1200);
export const contactImage = u("photo-1486006920555-c77dcf18193c", 1200);

export const cars: Car[] = [
  { id: "megane", name: "Renault Megane 1.6 VVT Extreme 5dr", price: 850, year: 2007, mileage: "94,000 mi", gearbox: "Manual", colour: "Black", fuel: "Petrol", make: "Renault", image: u("photo-1583121274602-3e2820c69888") },
  { id: "polo", name: "Volkswagen Polo 1.4 Twist 5dr", price: 1550, year: 2004, mileage: "61,000 mi", gearbox: "Manual", colour: "Blue", fuel: "Petrol", make: "Volkswagen", image: u("photo-1552519507-da3b142c6e3d") },
  { id: "cla", name: "Mercedes-Benz CLA 2.1 CLA220d AMG", price: 8995, year: 2014, mileage: "92,000 mi", gearbox: "Automatic", colour: "White", fuel: "Diesel", make: "Mercedes-Benz", reserved: true, image: u("photo-1617814076367-b759c7d7e738") },
  { id: "a7", name: "Audi A7 2.0 TFSI 45 Black Edition", price: 18995, year: 2020, mileage: "96,250 mi", gearbox: "Automatic", colour: "Grey", fuel: "Petrol", make: "Audi", image: u("photo-1606664515524-ed2f786a0bd6") },
  { id: "qashqai", name: "Nissan Qashqai 1.5 dCi n-tec+", price: 3145, year: 2012, mileage: "86,000 mi", gearbox: "Manual", colour: "Grey", fuel: "Diesel", make: "Nissan", image: u("photo-1494976388531-d1058494cdd8") },
  { id: "fiesta", name: "Ford Fiesta 1.0 EcoBoost Titanium", price: 6495, year: 2017, mileage: "48,300 mi", gearbox: "Manual", colour: "Red", fuel: "Petrol", make: "Ford", image: u("photo-1542362567-b07e54358753") },
  { id: "x3", name: "BMW X3 2.0d xDrive M Sport", price: 14250, year: 2018, mileage: "71,400 mi", gearbox: "Automatic", colour: "Black", fuel: "Diesel", make: "BMW", image: u("photo-1555215695-3004980ad54e") },
  { id: "corsa", name: "Vauxhall Corsa 1.2 SE Premium", price: 9750, year: 2021, mileage: "22,900 mi", gearbox: "Manual", colour: "Silver", fuel: "Petrol", make: "Vauxhall", image: u("photo-1549317661-bd32c8ce0db2") },
  { id: "yaris", name: "Toyota Yaris 1.5 Hybrid Icon", price: 12450, year: 2020, mileage: "31,200 mi", gearbox: "Automatic", colour: "White", fuel: "Hybrid", make: "Toyota", image: u("photo-1605559424843-9e4c228bf1c2") },
];

export const makes = [
  { name: "BMW", count: 18 },
  { name: "Audi", count: 14 },
  { name: "Mercedes-Benz", count: 12 },
  { name: "Volkswagen", count: 11 },
  { name: "Ford", count: 9 },
  { name: "Vauxhall", count: 8 },
  { name: "Nissan", count: 7 },
  { name: "Toyota", count: 6 },
  { name: "Land Rover", count: 5 },
  { name: "Hyundai", count: 5 },
  { name: "Kia", count: 4 },
  { name: "Honda", count: 4 },
];

export const seedTestimonials = [
  {
    quote:
      "Sorry for the late review, the team were really helpful, really easy to talk to and deal with. Took my part exchange happily and were very honest and thorough. Would definitely recommend.",
    name: "James B.",
    title: "Great Guys & Great Deal",
  },
  {
    quote:
      "I had a very nice and relaxed car-buying experience. The team was helpful and provided answers to all the questions I had — they were even kind enough to pick me up from the station.",
    name: "Kevin M.",
    title: "Relaxed Car Buying Experience",
  },
  {
    quote:
      "An excellent car-buying experience. The team was knowledgeable, helpful, and transparent throughout. They helped me purchase my Nissan Qashqai within my budget with fair negotiation.",
    name: "Nolan F.",
    title: "Excellent Purchase Experience",
  },
];

/**
 * Surface brand.testimonials (operator-controlled via dashboard) when present,
 * otherwise fall back to the generic seed. Generic seed names contain no
 * dealer-identifying strings per the global "no hardcoded dealer strings"
 * feedback memory.
 */
export type Testimonial = { quote: string; name: string; title: string };

export function resolveTestimonials(brand: any): Testimonial[] {
  const raw = brand?.testimonials;
  if (!Array.isArray(raw) || raw.length === 0) return seedTestimonials;
  return raw.map((t: any) => ({
    quote: String(t?.review ?? t?.quote ?? '').trim(),
    name: String(t?.name ?? '').trim() || 'Customer',
    title: String(t?.title ?? t?.platform ?? 'Verified review').trim(),
  })).filter((t: Testimonial) => t.quote);
}
