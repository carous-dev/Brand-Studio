import Link from "next/link";
import type { BrandConfig } from "@/brands/types";
import { resolveText } from "../../lib/brand-text";

export function Promos({ brand }: { brand: BrandConfig }) {
  return (
    <section className="section promos">
      <div className="pmg-shell">
        <div className="promo finance" id="finance">
          <div className="pmedia" />
          <div className="pinner">
            <span className="eyebrow">{resolveText(brand, "promosFinanceEyebrow")}</span>
            <h3>{resolveText(brand, "promosFinanceTitleLead")}<br />{resolveText(brand, "promosFinanceTitleRest")}</h3>
            <p>{resolveText(brand, "promosFinanceBody")}</p>
            <Link href="/contact" className="pmg-btn pmg-btn-dark">{resolveText(brand, "promosFinanceBtn")}</Link>
          </div>
        </div>
        <div className="promo trade" id="trade">
          <div className="pmedia" />
          <div className="pinner">
            <span className="eyebrow">{resolveText(brand, "promosTradeEyebrow")}</span>
            <h3>{resolveText(brand, "promosTradeTitleLead")}<br />{resolveText(brand, "promosTradeTitleRest")}</h3>
            <p>{resolveText(brand, "promosTradeBody")}</p>
            <Link href="/sell-my-car" className="pmg-btn pmg-btn-primary">{resolveText(brand, "promosTradeBtn")}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
