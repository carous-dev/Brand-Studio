import Link from "next/link";
import type { BrandConfig } from "@/brands/types";
import { dealer } from "../../data/site-config";
import { resolveText } from "../../lib/brand-text";

const phoneHref = `tel:${(dealer.contact.phoneE164 ?? dealer.contact.phoneDisplay ?? "").replace(/\s+/g, "")}`;

export function SourcingBand({ brand }: { brand: BrandConfig }) {
  return (
    <section className="sourcing" id="sourcing">
      <div className="pmg-shell">
        <div className="stext">
          <h2>{resolveText(brand, "sourcingTitle")}</h2>
          <p>
            Tell us what you&apos;re after and our vehicle procurement service will track down the
            right car at the right price — saving you the time, effort and stress.
          </p>
        </div>
        <div className="sbtns">
          <Link href="/car-sourcing" className="pmg-btn pmg-btn-dark pmg-btn-lg">{resolveText(brand, "sourcingRequestBtn")}</Link>
          <a href={phoneHref} className="pmg-btn pmg-btn-ghost pmg-btn-lg">{resolveText(brand, "sourcingCallBtn")}</a>
        </div>
      </div>
    </section>
  );
}
