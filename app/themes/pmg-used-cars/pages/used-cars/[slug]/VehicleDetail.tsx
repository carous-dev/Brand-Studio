"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Car,
  Check,
  ChevronDown,
  Clock,
  Cog,
  DoorOpen,
  Fuel,
  Gauge,
  GitCompareArrows,
  Heart,
  Info,
  Leaf,
  Mail,
  MapPin,
  Palette,
  Phone,
  Printer,
  Receipt,
  ShieldCheck,
  Share2,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";
import {
  openExternalReservation,
  openExternalVehicleEnquiry,
  useExternalVehicleGallery,
  useExternalWhatsAppEnquiryScope,
  type ExternalVehicleEnquirySummary,
  type ExternalWhatsAppEnquirySubject,
  type NormalizedVehicle,
  type DealerConfig,
  type DealerTheme,
} from "@/app/themes/pmg-used-cars/lib/vendor/dealer-shell";
import { isSaved, subscribeSaved, toggleSaved, type SavedVehicle } from "@/app/themes/pmg-used-cars/lib/vendor/garage";
import { LoanCalculatorWidget } from "@/app/themes/pmg-used-cars/lib/vendor/loan-calculator";
import WhatsAppIcon from "../../../components/WhatsAppIcon";
import { useBrand } from "../../../context/BrandClientWrapper";
import { resolveText } from "../../../lib/brand-text";
import { HubGrid } from "../HubGrid";
import type { InventoryVehicle } from "../_lib/types";
import "../inventory.css";
import "@/app/themes/pmg-used-cars/lib/vendor/loan-calculator/styles.css";
import "./vehicle-detail.css";

type QuickSpec = { icon: React.ReactNode; k: string; v: string };

type Props = {
  vehicle: NormalizedVehicle;
  dealer: DealerConfig;
  theme?: DealerTheme;
  pageUrl: string;
  similar: InventoryVehicle[];
};

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 });

const DAY_NAMES: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

function formatPrice(value: number | null): string {
  return value !== null && value > 0 ? GBP.format(value) : "POA";
}

function formatMileage(value: number | null): string {
  return value !== null && value > 0 ? `${NUM.format(value)} miles` : "";
}

function buildTitle(v: NormalizedVehicle): string {
  const parts = [v.year, v.make, v.model].map((p) => (p == null ? "" : String(p).trim())).filter(Boolean);
  return parts.join(" ") || "Vehicle";
}

function engineText(v: NormalizedVehicle): string {
  const bits: string[] = [];
  if (v.engineCapacityCc && v.engineCapacityCc > 0) {
    bits.push(v.engineCapacityCc >= 100 ? `${(v.engineCapacityCc / 1000).toFixed(1)}L` : `${v.engineCapacityCc}cc`);
  }
  if (v.enginePowerBhp && v.enginePowerBhp > 0) bits.push(`${NUM.format(v.enginePowerBhp)} bhp`);
  return bits.join(" · ");
}

/** ~2.1%/mo of price — matches the PMG inventory-card finance-from convention. */
function estimateMonthly(value: number | null): string {
  if (value == null || value < 1000) return "";
  return `£${NUM.format(Math.round(value * 0.021))}`;
}

function priceIndicator(rating: string | null): { label: string; cls: string } | null {
  const r = (rating ?? "").toUpperCase();
  if (r === "GREAT") return { label: "Great price", cls: "price-great" };
  if (r === "GOOD") return { label: "Good price", cls: "price-good" };
  if (r === "FAIR") return { label: "Fair price", cls: "price-fair" };
  return null;
}

function stockChip(status: string | null): { label: string; cls: string } | null {
  const s = (status ?? "").toLowerCase();
  if (s.includes("reserv")) return { label: "Reserved", cls: "reserved" };
  if (s.includes("sold")) return { label: "Sold", cls: "sold" };
  return null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function VehicleDetail({ vehicle, dealer, theme, pageUrl, similar }: Props) {
  const brand = useBrand() as any;
  const title = useMemo(() => buildTitle(vehicle), [vehicle]);
  const priceText = formatPrice(vehicle.price);
  const monthly = estimateMonthly(vehicle.price);
  const indicator = priceIndicator(vehicle.priceIndicatorRating);
  const stock = stockChip(vehicle.stockStatus);
  const isSold = (vehicle.stockStatus ?? "").toLowerCase().includes("sold");
  const derivative = vehicle.derivative ?? vehicle.trim ?? "";
  const stockRef = vehicle.registration ?? vehicle.vin ?? vehicle.slug;

  // ── Gallery + WhatsApp subject wiring ───────────────────────────────────
  useExternalVehicleGallery("#vehicle-gallery-mount", {
    images: vehicle.images,
    vehicleTitle: title,
    videoUrl: vehicle.videoUrl ?? undefined,
    template: theme?.galleryTemplate ?? "grid",
    loading: vehicle.images.length === 0,
  });

  const whatsappSubject = useMemo<ExternalWhatsAppEnquirySubject>(
    () => ({
      dealerName: dealer.brandName,
      phoneNumber: dealer.contact.phoneE164 ?? dealer.contact.phoneDisplay ?? null,
      whatsappNumber: dealer.contact.whatsappNumber ?? null,
      pageTitle: title,
      pageUrl,
      vehicle: {
        label: title,
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        derivative: vehicle.derivative,
        registration: vehicle.registration,
        vin: vehicle.vin,
        slug: vehicle.slug,
        price: vehicle.price,
        mileage: vehicle.mileage,
        fuel: vehicle.fuelType,
        transmission: vehicle.transmission,
        bodyType: vehicle.bodyType,
        colour: vehicle.colour,
      },
    }),
    [dealer, pageUrl, title, vehicle],
  );
  useExternalWhatsAppEnquiryScope(whatsappSubject);

  const enquirySummary = useMemo<ExternalVehicleEnquirySummary>(
    () => ({
      title,
      registration: vehicle.registration ?? undefined,
      make: vehicle.make ?? undefined,
      model: vehicle.model ?? undefined,
      derivative: vehicle.derivative ?? undefined,
      year: vehicle.year ?? undefined,
      price: vehicle.price ?? undefined,
      mileage: vehicle.mileage ?? undefined,
      transmission: vehicle.transmission ?? undefined,
      fuel: vehicle.fuelType ?? undefined,
      engineSize: engineText(vehicle) || undefined,
      image: vehicle.images[0],
      url: pageUrl,
    }),
    [title, vehicle, pageUrl],
  );

  const onEnquire = () => openExternalVehicleEnquiry(enquirySummary);
  const onReserve = () => openExternalReservation(enquirySummary);
  const reservationsEnabled = Boolean(dealer.reservations?.enabled) && !isSold;

  // ── Wishlist / compare (garage store) ───────────────────────────────────
  const savedPayload = useMemo<SavedVehicle>(
    () => ({
      slug: vehicle.slug,
      href: pageUrl,
      title,
      price: priceText,
      image: vehicle.images[0] ?? "",
      year: vehicle.year ? String(vehicle.year) : "",
      mileage: formatMileage(vehicle.mileage),
      transmission: vehicle.transmission ?? "",
      fuel: vehicle.fuelType ?? "",
    }),
    [vehicle, pageUrl, title, priceText],
  );
  const [wished, setWished] = useState(false);
  const [compared, setCompared] = useState(false);
  useEffect(() => {
    const sync = () => {
      setWished(isSaved("wishlist", vehicle.slug));
      setCompared(isSaved("compare", vehicle.slug));
    };
    sync();
    const unWish = subscribeSaved("wishlist", sync);
    const unCompare = subscribeSaved("compare", sync);
    return () => {
      unWish();
      unCompare();
    };
  }, [vehicle.slug]);

  // ── Share / print ───────────────────────────────────────────────────────
  const [shareLabel, setShareLabel] = useState("Share");
  const onShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: pageUrl });
        return;
      } catch {
        /* cancelled — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(pageUrl);
      setShareLabel("Link copied");
      window.setTimeout(() => setShareLabel("Share"), 1800);
    } catch {
      /* no-op */
    }
  };
  const onPrint = () => window.print();

  // ── Description read-more ────────────────────────────────────────────────
  const [descOpen, setDescOpen] = useState(false);
  const description = (vehicle.description ?? "").trim();
  const longDesc = description.length > 320;

  // ── Feature groups ───────────────────────────────────────────────────────
  const featureGroups = useMemo(() => {
    const map = new Map<string, string[]>();
    const source = vehicle.featureDetails.length
      ? vehicle.featureDetails
      : vehicle.features.map((name) => ({ name, category: null, type: null }));
    for (const f of source) {
      const key = f.category?.trim() || "Standard equipment";
      if (!map.has(key)) map.set(key, []);
      const list = map.get(key)!;
      if (!list.includes(f.name)) list.push(f.name);
    }
    return Array.from(map.entries()).map(([category, items]) => ({ category, items }));
  }, [vehicle.featureDetails, vehicle.features]);
  const totalFeatures = featureGroups.reduce((sum, g) => sum + g.items.length, 0);
  const [featOpen, setFeatOpen] = useState(false);

  // ── Spec rows ────────────────────────────────────────────────────────────
  const coreSpecs: Array<[string, string]> = [
    ["Registration", vehicle.registration ?? ""],
    ["Year", vehicle.year ? String(vehicle.year) : ""],
    ["Mileage", formatMileage(vehicle.mileage)],
    ["Body type", vehicle.bodyType ?? ""],
    ["Fuel", vehicle.fuelType ?? ""],
    ["Transmission", vehicle.transmission ?? ""],
    ["Drivetrain", vehicle.drivetrain ?? ""],
    ["Engine size", vehicle.engineCapacityCc ? (vehicle.engineCapacityCc >= 100 ? `${(vehicle.engineCapacityCc / 1000).toFixed(1)}L` : `${vehicle.engineCapacityCc}cc`) : ""],
    ["Power", vehicle.enginePowerBhp ? `${NUM.format(vehicle.enginePowerBhp)} bhp` : ""],
    ["Cylinders", vehicle.cylinders ? String(vehicle.cylinders) : ""],
    ["Doors", vehicle.doors ? String(vehicle.doors) : ""],
    ["Seats", vehicle.seats ? String(vehicle.seats) : ""],
    ["Colour", vehicle.colour ?? ""],
    ["Emission class", vehicle.emissionClass ?? ""],
    ["First registered", formatDate(vehicle.firstRegistrationDate)],
    ["VIN", vehicle.vin ?? ""],
  ];
  const dimSpecs: Array<[string, string]> = [
    ["Length", vehicle.lengthMm ? `${NUM.format(vehicle.lengthMm)} mm` : ""],
    ["Width", vehicle.widthMm ? `${NUM.format(vehicle.widthMm)} mm` : ""],
    ["Height", vehicle.heightMm ? `${NUM.format(vehicle.heightMm)} mm` : ""],
    ["Boot (seats up)", vehicle.bootSpaceSeatsUpLitres ? `${NUM.format(vehicle.bootSpaceSeatsUpLitres)} L` : ""],
    ["Boot (seats down)", vehicle.bootSpaceSeatsDownLitres ? `${NUM.format(vehicle.bootSpaceSeatsDownLitres)} L` : ""],
  ];
  const hasCoreSpecs = coreSpecs.some(([, v]) => v);
  const hasDims = dimSpecs.some(([, v]) => v);

  // ── Economy tiles ────────────────────────────────────────────────────────
  const econ: Array<{ icon: React.ReactNode; val: string; lbl: string }> = [];
  if (vehicle.fuelEconomyCombinedMpg) econ.push({ icon: <Fuel />, val: `${NUM.format(vehicle.fuelEconomyCombinedMpg)}`, lbl: "Combined MPG" });
  if (vehicle.co2EmissionGpkm) econ.push({ icon: <Leaf />, val: `${NUM.format(vehicle.co2EmissionGpkm)}`, lbl: "CO₂ g/km" });
  if (vehicle.vehicleExciseDutyGbp != null) econ.push({ icon: <Receipt />, val: GBP.format(vehicle.vehicleExciseDutyGbp), lbl: "Road tax / yr" });

  // ── History / provenance checks ──────────────────────────────────────────
  const h = vehicle.history;
  type CheckItem = { key: string; value: string; tone: "pass" | "warn" | "info"; icon: React.ReactNode };
  const checks: CheckItem[] = [];
  if (h?.previousOwnersCount != null) checks.push({ key: "Previous owners", value: String(h.previousOwnersCount), tone: "info", icon: <Users /> });
  if (vehicle.firstRegistrationDate) checks.push({ key: "First registered", value: formatDate(vehicle.firstRegistrationDate), tone: "info", icon: <Calendar /> });
  if (vehicle.twelveMonthsMot) checks.push({ key: "MOT", value: "12 months", tone: "pass", icon: <ShieldCheck /> });
  if (vehicle.manufacturerApproved) checks.push({ key: "Manufacturer approved", value: "Yes", tone: "pass", icon: <BadgeCheck /> });
  if (h?.imported != null) checks.push({ key: "Imported", value: h.imported ? "Yes" : "No", tone: h.imported ? "warn" : "pass", icon: h.imported ? <Info /> : <Check /> });
  if (h?.stolen != null) checks.push({ key: "Stolen marker", value: h.stolen ? "Flagged" : "None", tone: h.stolen ? "warn" : "pass", icon: h.stolen ? <X /> : <Check /> });
  if (h?.scrapped != null) checks.push({ key: "Scrapped marker", value: h.scrapped ? "Flagged" : "None", tone: h.scrapped ? "warn" : "pass", icon: h.scrapped ? <X /> : <Check /> });
  if (h?.exported != null) checks.push({ key: "Exported", value: h.exported ? "Yes" : "No", tone: h.exported ? "warn" : "pass", icon: h.exported ? <Info /> : <Check /> });
  const hasHistory = checks.length > 0;

  // ── Dealer location ──────────────────────────────────────────────────────
  const addressLines = [dealer.address.line1, dealer.address.line2, dealer.address.town, dealer.address.county, dealer.address.postcode]
    .filter(Boolean)
    .join(", ");
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(`${dealer.brandName}, ${addressLines}`)}&output=embed`;
  // Client-only so the "today" highlight can't cause an SSR/client tz mismatch.
  const [todayIso, setTodayIso] = useState(0);
  useEffect(() => setTodayIso(((new Date().getDay() + 6) % 7) + 1), []); // JS 0=Sun → ISO 1..7
  const hoursEntries = dealer.openingHours
    ? ([1, 2, 3, 4, 5, 6, 7] as const).map((d) => ({ day: DAY_NAMES[d], hours: dealer.openingHours?.[d] ?? null, isToday: d === todayIso }))
    : [];

  // ── Quick spec strip ─────────────────────────────────────────────────────
  const quickSpecs: Array<QuickSpec | null> = [
    vehicle.mileage ? { icon: <Gauge />, k: "Mileage", v: formatMileage(vehicle.mileage) } : null,
    vehicle.fuelType ? { icon: <Fuel />, k: "Fuel", v: vehicle.fuelType } : null,
    vehicle.transmission ? { icon: <Cog />, k: "Gearbox", v: vehicle.transmission } : null,
    vehicle.bodyType ? { icon: <Car />, k: "Body", v: vehicle.bodyType } : null,
    vehicle.seats ? { icon: <Users />, k: "Seats", v: String(vehicle.seats) } : null,
    vehicle.doors ? { icon: <DoorOpen />, k: "Doors", v: String(vehicle.doors) } : null,
    engineText(vehicle) ? { icon: <Zap />, k: "Engine", v: engineText(vehicle) } : null,
    vehicle.colour ? { icon: <Palette />, k: "Colour", v: vehicle.colour } : null,
  ];

  // Compact key facts shown inline on the right of the (full-width) head bar.
  const headStats = [
    vehicle.mileage ? { k: "Mileage", v: formatMileage(vehicle.mileage) } : null,
    vehicle.fuelType ? { k: "Fuel", v: vehicle.fuelType } : null,
    vehicle.transmission ? { k: "Gearbox", v: vehicle.transmission } : null,
    vehicle.bodyType ? { k: "Body", v: vehicle.bodyType } : null,
  ].filter((x): x is { k: string; v: string } => Boolean(x));

  // ── Sub-nav: stuck state + scroll-spy active section ─────────────────────
  const navRef = useRef<HTMLElement>(null);
  const [navStuck, setNavStuck] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Section anchors present given the data we actually have.
  const sections: Array<{ id: string; label: string }> = [
    ...(description ? [{ id: "overview", label: "Overview" }] : []),
    ...(hasCoreSpecs ? [{ id: "spec", label: "Specification" }] : []),
    ...(totalFeatures ? [{ id: "features", label: "Features" }] : []),
    ...(hasHistory ? [{ id: "history", label: "History" }] : []),
    ...(vehicle.price ? [{ id: "finance", label: "Finance" }] : []),
    { id: "location", label: "Location" },
  ];
  const sectionKey = sections.map((s) => s.id).join(",");

  useEffect(() => {
    // Toggle the "stuck" bar styling once the sub-nav pins under the header.
    // Observe the sticky nav itself with a top rootMargin equal to its sticky
    // offset: while it sits below the line its ratio is 1; the moment it pins to
    // the line it clips to <1 → stuck. IntersectionObserver-based so it works
    // even under Lenis smooth-scroll (which can swallow native scroll events).
    const nav = navRef.current;
    const stuckObserver = nav
      ? new IntersectionObserver(([entry]) => setNavStuck(entry.intersectionRatio < 1), { /* text-static-ok */
          rootMargin: "-89px 0px 0px 0px",
          threshold: [1],
        })
      : null;
    if (nav && stuckObserver) stuckObserver.observe(nav);

    // Scroll-spy: highlight whichever section is crossing the mid-viewport band.
    const ids = sectionKey ? sectionKey.split(",") : [];
    const spyObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection((visible[0].target as HTMLElement).id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) spyObserver.observe(el);
    }

    return () => {
      stuckObserver?.disconnect();
      spyObserver.disconnect();
    };
  }, [sectionKey]);

  return (
    <div className="pmg-vd">
      {/* Top bar */}
      <div className="pmg-vd-topbar pmg-shell">
        <nav className="pmg-vd-crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span className="sep">/</span>
          <a href="/used-cars">{resolveText(brand, "vdBreadcrumb")}</a>
          <span className="sep">/</span>
          <span className="current">{title}</span>
        </nav>
        <div className="pmg-vd-topactions">
          <button
            type="button"
            className={`pmg-vd-iconbtn${wished ? " is-active" : ""}`}
            aria-pressed={wished}
            onClick={() => setWished(toggleSaved("wishlist", savedPayload).saved)}
          >
            <Heart aria-hidden="true" fill={wished ? "currentColor" : "none"} />
            <span className="label">{wished ? "Saved" : "Save"}</span>
          </button>
          <button
            type="button"
            className={`pmg-vd-iconbtn${compared ? " is-active" : ""}`}
            aria-pressed={compared}
            onClick={() => {
              const result = toggleSaved("compare", savedPayload);
              if (!result.limited) setCompared(result.saved);
            }}
          >
            <GitCompareArrows aria-hidden="true" />
            <span className="label">{compared ? "Comparing" : "Compare"}</span>
          </button>
          <button type="button" className="pmg-vd-iconbtn" onClick={onShare}>
            <Share2 aria-hidden="true" />
            <span className="label">{shareLabel}</span>
          </button>
          <button type="button" className="pmg-vd-iconbtn" onClick={onPrint}>
            <Printer aria-hidden="true" />
            <span className="label">Print</span>
          </button>
        </div>
      </div>

      <div className="pmg-vd-layout pmg-shell">
        {/* Head */}
        <header className="pmg-vd-head">
          <div className="pmg-vd-head-main">
            <div className="pmg-vd-badges">
              {stock ? <span className={`pmg-vd-chip ${stock.cls}`}>{stock.label}</span> : null}
              {indicator ? <span className={`pmg-vd-chip ${indicator.cls}`}><Sparkles aria-hidden="true" />{indicator.label}</span> : null}
              {vehicle.manufacturerApproved ? <span className="pmg-vd-chip approved"><BadgeCheck aria-hidden="true" />Approved</span> : null}
            </div>
            <h1 className="pmg-vd-title">{title}</h1>
            {derivative ? <p className="pmg-vd-derivative">{derivative}</p> : null}
            {vehicle.attentionGrabber ? <p className="pmg-vd-grab">{vehicle.attentionGrabber}</p> : null}
          </div>
          {headStats.length ? (
            <dl className="pmg-vd-headstats">
              {headStats.map((s) => (
                <div key={s.k}>
                  <dt>{s.k}</dt>
                  <dd>{s.v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </header>

        {/* Gallery */}
        <div className="pmg-vd-gallery">
          <div id="vehicle-gallery-mount" />
        </div>

        {/* Purchase rail */}
        <aside className="pmg-vd-rail">
          <div className="pmg-vd-railcard">
            <div className="pmg-vd-railprice">
              <div className="plabel">{isSold ? "Sold — similar available" : "Our price"}</div>
              <div className="pval">{priceText}</div>
              {monthly && !isSold ? (
                <div className="pfin">
                  Finance from <b>{monthly}/mo</b> · <a href="#finance">calculate</a>
                </div>
              ) : null}
            </div>
            <div className="pmg-vd-railbody">
              <button type="button" className="pmg-vd-cta primary" onClick={onEnquire}>
                <Mail aria-hidden="true" /> Enquire about this car
              </button>
              {reservationsEnabled ? (
                <button type="button" className="pmg-vd-cta dark" onClick={onReserve}>
                  <ShieldCheck aria-hidden="true" /> {dealer.reservations?.ctaLabel?.trim() || "Reserve for 24h"}
                </button>
              ) : null}
              <div className="pmg-vd-ctarow">
                {dealer.contact.phoneE164 || dealer.contact.phoneDisplay ? (
                  <a className="pmg-vd-cta outline" href={`tel:${dealer.contact.phoneE164 ?? dealer.contact.phoneDisplay}`}>
                    <Phone aria-hidden="true" /> Call
                  </a>
                ) : null}
                {dealer.contact.whatsappNumber ? (
                  <a
                    className="pmg-vd-cta wa"
                    href={`https://wa.me/${(dealer.contact.whatsappNumber ?? "").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hi, I'm interested in the ${title} (${pageUrl})`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon aria-hidden={true} /> WhatsApp
                  </a>
                ) : null}
              </div>
              <div className="pmg-vd-stockref">
                <span>{resolveText(brand, "vdStockRef")}</span>
                <b>{stockRef}</b>
              </div>
            </div>
          </div>

          <ul className="pmg-vd-railtrust">
            <li><ShieldCheck aria-hidden="true" /> {resolveText(brand, "vdTrustHpi")}</li>
            <li><BadgeCheck aria-hidden="true" /> {resolveText(brand, "vdTrustWarranty")}</li>
            <li><Car aria-hidden="true" /> {resolveText(brand, "vdTrustPartEx")}</li>
          </ul>
        </aside>

        {/* Detail column */}
        <div className="pmg-vd-main">
          {/* Quick spec strip */}
          <ul className="pmg-vd-quickspecs">
            {quickSpecs
              .filter((x): x is QuickSpec => Boolean(x))
              .map((item) => (
                <li key={item.k}>
                  <span className="pmg-vd-qs-ico">{item.icon}</span>
                  <span className="pmg-vd-qs-text">
                    <span className="k">{item.k}</span>
                    <span className="v">{item.v}</span>
                  </span>
                </li>
              ))}
          </ul>

          {/* Sub-nav */}
          {sections.length > 1 ? (
            <nav ref={navRef} className={`pmg-vd-subnav${navStuck ? " is-stuck" : ""}`} aria-label={resolveText(brand, "vdSectionsLabel")}>
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className={activeSection === s.id ? "is-active" : undefined}>
                  {s.label}
                </a>
              ))}
            </nav>
          ) : null}

          {/* Overview */}
          {description ? (
            <section id="overview" className="pmg-vd-section">
              <span className="pmg-vd-kicker">Overview</span>
              <h2 className="pmg-vd-h2">About this {vehicle.make ?? "vehicle"}</h2>
              <div className={`pmg-vd-desc${longDesc && !descOpen ? " is-clamped" : ""}`}>{description}</div>
              {longDesc ? (
                <button type="button" className="pmg-vd-readmore" data-open={descOpen} onClick={() => setDescOpen((o) => !o)}>
                  {descOpen ? "Show less" : "Read full description"} <ChevronDown aria-hidden="true" />
                </button>
              ) : null}
              {econ.length ? (
                <div className="pmg-vd-econ">
                  {econ.map((e) => (
                    <div className="pmg-vd-econ-tile" key={e.lbl}>
                      {e.icon}
                      <span className="val">{e.val}</span>
                      <span className="lbl">{e.lbl}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Specification */}
          {hasCoreSpecs ? (
            <section id="spec" className="pmg-vd-section">
              <span className="pmg-vd-kicker">Specification</span>
              <h2 className="pmg-vd-h2">{resolveText(brand, "vdSpecTitle")}</h2>
              <div className="pmg-vd-specgrid">
                {coreSpecs
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div className="pmg-vd-specrow" key={k}>
                      <span className="k">{k}</span>
                      <span className="v">{v}</span>
                    </div>
                  ))}
              </div>

              {hasDims ? (
                <>
                  <p className="pmg-vd-subhead">{resolveText(brand, "vdDimsSubhead")}</p>
                  <div className="pmg-vd-specgrid">
                    {dimSpecs
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div className="pmg-vd-specrow" key={k}>
                          <span className="k">{k}</span>
                          <span className="v">{v}</span>
                        </div>
                      ))}
                  </div>
                </>
              ) : null}

              {vehicle.specGroups.length ? (
                <div style={{ marginTop: hasDims ? 20 : 20 }}>
                  {vehicle.specGroups.map((group, gi) => (
                    <details className="pmg-vd-specgroup" key={group.category ?? gi} open={gi === 0}>
                      <summary>
                        <span>{group.category ?? "Specification"}</span>
                        <ChevronDown className="chev" aria-hidden="true" />
                      </summary>
                      {group.items.map((item) => (
                        <div className="pmg-vd-specrow" key={item.name}>
                          <span className="k">{item.name}</span>
                          <span className="v">{item.value}</span>
                        </div>
                      ))}
                    </details>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Features */}
          {totalFeatures ? (
            <section id="features" className="pmg-vd-section">
              <span className="pmg-vd-kicker">Equipment</span>
              <h2 className="pmg-vd-h2">{resolveText(brand, "vdFeaturesTitle")}</h2>
              <div className={`pmg-vd-featwrap${totalFeatures > 18 && !featOpen ? " is-collapsed" : ""}`}>
                {featureGroups.map((group) => (
                  <div className="pmg-vd-featgroup" key={group.category}>
                    {featureGroups.length > 1 ? <p className="pmg-vd-subhead">{group.category}</p> : null}
                    <ul className="pmg-vd-featlist">
                      {group.items.map((name) => (
                        <li key={name}>
                          <Check aria-hidden="true" />
                          {name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {totalFeatures > 18 ? (
                <button type="button" className="pmg-btn pmg-btn-outline-dark pmg-vd-showall" onClick={() => setFeatOpen((o) => !o)}>
                  {featOpen ? "Show fewer" : `Show all ${totalFeatures} features`}
                </button>
              ) : null}
            </section>
          ) : null}
        </div>

        {/* Detail sections that fall below the purchase rail on mobile. On
            desktop this is the same left column, continuing under the sticky rail. */}
        <div className="pmg-vd-main-b">
          {/* History / provenance */}
          {hasHistory ? (
            <section id="history" className="pmg-vd-section">
              <span className="pmg-vd-kicker">Provenance</span>
              <h2 className="pmg-vd-h2">{resolveText(brand, "vdHistoryTitle")}</h2>
              <div className="pmg-vd-checkgrid">
                {checks.map((c) => (
                  <div className={`pmg-vd-check ${c.tone}`} key={c.key}>
                    <span className="pmg-vd-check-ico">{c.icon}</span>
                    <span className="pmg-vd-check-text">
                      <span className="k">{c.key}</span>
                      <span className="v">{c.value}</span>
                    </span>
                  </div>
                ))}
              </div>
              <ul className="pmg-vd-prep">
                <li><ShieldCheck aria-hidden="true" /> {resolveText(brand, "vdHistHpi")}</li>
                <li><Sparkles aria-hidden="true" /> {resolveText(brand, "vdHistPrep")}</li>
                <li><BadgeCheck aria-hidden="true" /> {resolveText(brand, "vdHistWarranty")}</li>
              </ul>
            </section>
          ) : null}

          {/* Finance */}
          {vehicle.price ? (
            <section id="finance" className="pmg-vd-section pmg-vd-finance">
              <span className="pmg-vd-kicker">Finance</span>
              <h2 className="pmg-vd-h2">{resolveText(brand, "vdFinanceTitle")}</h2>
              <LoanCalculatorWidget
                initialPrice={vehicle.price}
                initialDownPayment={Math.round(vehicle.price * 0.1)}
                initialRate={9.9}
                initialTermMonths={60}
                copy={{ title: "Finance calculator", subtitle: "Adjust deposit, term and APR — the figures update live." }}
                lead={{
                  leadOwner: dealer.dealerClientId,
                  brandName: dealer.brandName,
                  copy: {
                    heading: "Want this in writing?",
                    subheading: `We'll email your illustration and the ${dealer.brandName} team will follow up with real finance options for the ${title}.`,
                  },
                }}
              />
              <p className="pmg-vd-finance-note">
                Representative example only — not a quote or offer of finance. {dealer.brandName} is a credit broker, not a lender.
                Finance is subject to status, affordability and lender approval. Ask our team for a tailored quote.
              </p>
            </section>
          ) : null}

          {/* Location */}
          <section id="location" className="pmg-vd-section">
            <span className="pmg-vd-kicker">{resolveText(brand, "vdLocationKicker")}</span>
            <h2 className="pmg-vd-h2">{resolveText(brand, "vdLocationTitle")}</h2>
            <div className="pmg-vd-dealer">
              <div className="pmg-vd-dealer-info">
                <h3>{dealer.brandName}</h3>
                <ul className="pmg-vd-dealer-lines">
                  {addressLines ? (
                    <li>
                      <MapPin aria-hidden="true" />
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dealer.brandName}, ${addressLines}`)}`} target="_blank" rel="noopener noreferrer">
                        {addressLines}
                      </a>
                    </li>
                  ) : null}
                  {dealer.contact.phoneDisplay ? (
                    <li>
                      <Phone aria-hidden="true" />
                      <a href={`tel:${dealer.contact.phoneE164 ?? dealer.contact.phoneDisplay}`}>{dealer.contact.phoneDisplay}</a>
                    </li>
                  ) : null}
                  {dealer.contact.email ? (
                    <li>
                      <Mail aria-hidden="true" />
                      <a href={`mailto:${dealer.contact.email}`}>{dealer.contact.email}</a>
                    </li>
                  ) : null}
                </ul>
                {hoursEntries.length ? (
                  <ul className="pmg-vd-hours">
                    {hoursEntries.map((e) => (
                      <li key={e.day} className={e.isToday ? "today" : undefined}>
                        <span>
                          <Clock aria-hidden="true" style={{ width: 13, height: 13, verticalAlign: "-2px", marginRight: 6 }} />
                          {e.day}
                        </span>
                        <b>{e.hours ? e.hours.replace("-", " – ") : "Closed"}</b>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <iframe className="pmg-vd-map" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Map to ${dealer.brandName}`} />
            </div>
          </section>
        </div>
      </div>

      {/* Similar vehicles */}
      {similar.length ? (
        <section className="pmg-vd-related pmg-shell" aria-label={resolveText(brand, "vdSimilarLabel")}>
          <div className="pmg-vd-related-head">
            <h2>{resolveText(brand, "vdSimilarTitle")}</h2>
            <a href="/used-cars">
              View all stock <ArrowRight aria-hidden="true" />
            </a>
          </div>
          <HubGrid items={similar} />
        </section>
      ) : null}

      {/* Mobile sticky action bar */}
      <div className="pmg-vd-mobilebar">
        <div className="mb-price">
          <small>{isSold ? "Sold" : "Our price"}</small>
          <b>{priceText}</b>
        </div>
        <div className="mb-cta">
          {dealer.contact.phoneE164 || dealer.contact.phoneDisplay ? (
            <a className="pmg-vd-cta outline icononly" href={`tel:${dealer.contact.phoneE164 ?? dealer.contact.phoneDisplay}`} aria-label="Call">
              <Phone aria-hidden="true" />
            </a>
          ) : null}
          <button type="button" className="pmg-vd-cta primary" onClick={onEnquire}>
            <Mail aria-hidden="true" /> Enquire
          </button>
        </div>
      </div>
    </div>
  );
}
