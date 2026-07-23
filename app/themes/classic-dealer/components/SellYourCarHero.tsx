"use client";

import type { CSSProperties } from "react";
import { useBrand } from "../context/BrandClientWrapper";

/**
 * Sell-your-car page hero — dark photo band matching the theme's inner-page
 * hero language (see .scs-hero in styles/sell-your-car.css). Extracted from
 * SellCarForm when the page body moved to the hosted CDN widget.
 */
export default function SellYourCarHero() {
  const brand = useBrand();
  const sellContent = (brand.pages?.sellYourCar ?? {}) as Record<string, unknown>;
  const heroContent = (sellContent.hero ?? {}) as Record<string, unknown>;

  const companyName = brand.name || "our dealership";
  const locationCity = brand.location?.address?.city || "your area";

  const heroTitle =
    typeof heroContent.title === "string" && heroContent.title.trim().length > 0
      ? heroContent.title
      : "Sell Your Car";
  const heroDescription =
    typeof heroContent.description === "string" && heroContent.description.trim().length > 0
      ? heroContent.description
      : `Request a fast dealer valuation from ${companyName} in ${locationCity}. We will confirm the next steps once your vehicle is matched.`;
  const heroImage =
    typeof heroContent.image === "string" && heroContent.image.trim().length > 0
      ? heroContent.image
      : brand.heroImage || "/images/IMG_3829.png";

  const heroStyle = heroImage
    ? ({ "--sell-hero-image": `url('${heroImage}')` } as CSSProperties)
    : undefined;
  const phone = brand.location?.phone ? String(brand.location.phone).trim() : "";

  return (
    <section className="scs-hero" style={heroStyle} aria-label={heroTitle}>
      <div className="sell-shell scs-hero-inner">
        <p className="scs-hero-eyebrow">Dealer-backed valuation in {locationCity}</p>
        <h1 className="scs-hero-title">{heroTitle}</h1>
        <p className="scs-hero-lead">{heroDescription}</p>
        <div className="scs-hero-actions">
          <a className="scs-hero-btn primary" href="#sell-form">
            Start valuation
          </a>
          {phone ? (
            <a className="scs-hero-btn ghost" href={`tel:${phone}`}>
              Call {phone}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
