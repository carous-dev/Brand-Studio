"use client";

import { SellYourCarWidget } from "@/app/themes/pmg-used-cars/lib/vendor/sell-your-car";
import "@/app/themes/pmg-used-cars/lib/vendor/sell-your-car/styles.css";
import { dealer } from "../data/site-config";

const PHONE_TEL = (dealer.contact.phoneE164 ?? dealer.contact.phoneDisplay ?? "").replace(/\s+/g, "");
const WA_DIGITS = (dealer.contact.whatsappNumber ?? dealer.contact.phoneE164 ?? "").replace(/[^\d]/g, "");

/**
 * Mounts the fleet-standard Carous Sell-Your-Car wizard on /sell-your-car.
 * Lead owner is PMG's Carous client ID, so valuation requests land in the
 * same pipeline as vehicle-enquiry + WhatsApp captures. The wizard is themed
 * to PMG red on a light panel via `.pmg-syc .sycw-root` in sell-your-car.css.
 */
export function SellYourCarMount() {
  return (
    <div id="sell-form" className="syc-mount" aria-label="Car valuation form">
      <SellYourCarWidget
        leadOwner={dealer.dealerClientId}
        brandName={dealer.brandName}
        contact={{
          phoneTel: PHONE_TEL || undefined,
          phoneDisplay: dealer.contact.phoneDisplay,
          whatsappUrl: WA_DIGITS ? `https://wa.me/${WA_DIGITS}` : undefined,
          email: dealer.contact.email,
        }}
        copy={{
          cardTitle: "Get your free valuation",
          cardSubtitle: `Three quick steps. A confirmed offer back from the ${dealer.brandName} team, usually within 24 hours.`,
          successHeading: "Thanks — your valuation request is in",
          successBody: `A member of the ${dealer.brandName} team will be in touch shortly to confirm your offer.`,
          trustHeading: "Why sell to us",
        }}
      />
    </div>
  );
}
