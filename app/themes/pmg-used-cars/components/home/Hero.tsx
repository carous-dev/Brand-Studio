import Link from "next/link";

const Check = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const Chevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);
const Search = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const Car = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17H3v-5l2-5h14l2 5v5h-2" />
    <path d="M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0M5 17h10" />
    <path d="M4 12h16" />
  </svg>
);
const Tag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.6 3H7a2 2 0 0 0-2 2v5.6a2 2 0 0 0 .6 1.4l7.4 7.4a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.8L14 3.6A2 2 0 0 0 12.6 3Z" />
    <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

// Each select maps to the query param the /used-cars inventory page hydrates on
// load (make / model / body / max_price). Option `value`s must match the feed:
// blank for the "Any …" default, exact make/model/body_type strings otherwise,
// and a bare number for max_price. Plain GET form → works without JS.
const SELECTS: Array<{ name: string; label: string; options: Array<{ label: string; value: string }> }> = [
  {
    name: "make",
    label: "Make",
    options: [
      { label: "Any make", value: "" },
      ...["Audi", "BMW", "Ford", "Nissan", "Vauxhall", "Volkswagen"].map((v) => ({ label: v, value: v })),
    ],
  },
  {
    name: "model",
    label: "Model",
    options: [
      { label: "Any model", value: "" },
      ...["A1", "Fiesta", "Qashqai", "3 Series", "Golf"].map((v) => ({ label: v, value: v })),
    ],
  },
  {
    name: "body",
    label: "Body style",
    options: [
      { label: "Any body style", value: "" },
      ...["Hatchback", "SUV", "Saloon", "Estate", "Coupe"].map((v) => ({ label: v, value: v })),
    ],
  },
  {
    name: "max_price",
    label: "Max price",
    options: [
      { label: "Any price", value: "" },
      { label: "£5,000", value: "5000" },
      { label: "£7,500", value: "7500" },
      { label: "£10,000", value: "10000" },
      { label: "£15,000", value: "15000" },
    ],
  },
];

export function Hero() {
  return (
    <section className="hero">
      <div className="hero-media" />
      <div className="pmg-shell">
        <div className="hero-inner">
          <span className="eyebrow">Quality used cars · Zero pressure</span>
          <h1>
            Drive away <span className="tw-accent">with confidence.</span>
          </h1>
          <p className="sub">
            A privately owned dealership in Dewsbury. Every car is hand-picked, health-checked and
            valeted before it reaches you — with warranty, finance and nationwide delivery.
          </p>
          <div className="hero-btns">
            <Link href="/used-cars" className="pmg-btn pmg-btn-primary pmg-btn-lg"><Car /> Browse our stock</Link>
            <Link href="/sell-my-car" className="pmg-btn pmg-btn-outline-light pmg-btn-lg"><Tag /> Value your car</Link>
          </div>
          <div className="trust-line">
            <span><Check /> Health-checked &amp; valeted</span>
            <span><Check /> Warranty included</span>
            <span><Check /> Free delivery up to 30 miles</span>
          </div>
        </div>

        <div className="searchcard">
          <form className="box search-grid" method="get" action="/used-cars">
            {SELECTS.map((s) => (
              <div className="select" key={s.name}>
                <select name={s.name} aria-label={s.label} defaultValue="">
                  {s.options.map((o) => (
                    <option key={o.label} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <Chevron />
              </div>
            ))}
            <button type="submit" className="pmg-btn pmg-btn-primary">
              <Search /> Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
