import Link from "next/link";
import { Users, CalendarClock, Video, Radar, LifeBuoy, BadgeCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BrandConfig } from "@/brands/types";
import { dealer } from "../../data/site-config";
import { resolveText } from "../../lib/brand-text";

const phoneHref = `tel:${(dealer.contact.phoneE164 ?? dealer.contact.phoneDisplay ?? "").replace(/\s+/g, "")}`;

const REASONS: Array<{ n: string; Icon: LucideIcon; title: string; body: string }> = [
  { n: "01", Icon: Users, title: "Family-run, not corporate", body: "You'll deal with the same faces every visit — not a call centre reading from a script." },
  { n: "02", Icon: CalendarClock, title: "Rapid appointment scheduling", body: "Flexible, fast booking with convenient times, so viewing a car fits your week." },
  { n: "03", Icon: Video, title: "Live video viewing", body: "Can't get to Dewsbury? We'll walk you round any car in detail over a call before you commit." },
  { n: "04", Icon: Radar, title: "We'll source the car for you", body: "Can't see the right one listed? Our procurement team will track it down and secure it." },
  { n: "05", Icon: LifeBuoy, title: "After-sales beyond the warranty", body: "Ongoing support through trusted local garages, long after the paperwork's done." },
  { n: "06", Icon: BadgeCheck, title: "Rated Excellent on Feefo", body: "Independently verified reviews from real customers — nothing curated, nothing hidden." },
];

export function WhyBuy({ brand }: { brand: BrandConfig }) {
  return (
    <section className="section whybuy" id="why-buy">
      <div className="pmg-shell">
        <div className="wb-head">
          <span className="eyebrow center">{resolveText(brand, "whyEyebrow")}</span>
          <h2>{resolveText(brand, "whyTitleLead")}<em>{resolveText(brand, "whyTitleEm")}</em>{resolveText(brand, "whyTitleTail")}</h2>
          <p>{resolveText(brand, "whyIntro")}</p>
        </div>

        <div className="wb-grid">
          {REASONS.map(({ n, Icon, title, body }) => (
            <article className="wb-card" key={n}>
              <span className="wb-idx">{n}</span>
              <div className="wb-ico"><Icon strokeWidth={1.75} aria-hidden /></div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>

        <div className="whybuy-cta">
          <Link href="/used-cars" className="pmg-btn pmg-btn-primary pmg-btn-lg">{resolveText(brand, "whyBrowseBtn")}</Link>
          <a href={phoneHref} className="pmg-btn pmg-btn-outline-light pmg-btn-lg">{resolveText(brand, "whySpeakBtn")}</a>
        </div>
      </div>
    </section>
  );
}
