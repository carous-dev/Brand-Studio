"use client";

import { useState } from "react";
import Link from "next/link";
import { makeMonogram, resolveLogoSlug, simpleIconsLogoUrl } from "./_lib/make-logos";
import { buildMakePath } from "../../lib/seo-links";
import { resolveText } from "../../lib/brand-text";

type MakesBandProps = {
  makes: string[];
  town: string;
};

function MakeTile({ make, town }: { make: string; town: string }) {
  const slug = resolveLogoSlug(make);
  const [failed, setFailed] = useState(false);
  const showLogo = slug && !failed;

  return (
    <Link
      className="pmg-make-card"
      href={buildMakePath(make)}
      aria-label={`${make} for sale in ${town}`}
    >
      <span className="pmg-make-card__mark" aria-hidden="true">
        {showLogo ? (
          <img
            className="pmg-make-card__logo"
            src={simpleIconsLogoUrl(slug!)}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="pmg-make-card__monogram">{makeMonogram(make)}</span>
        )}
      </span>
      <span className="pmg-make-card__body">
        <span className="pmg-make-card__name">{make}</span>
        <span className="pmg-make-card__sub">
          for sale in {town}
          <svg
            className="pmg-make-card__arrow"
            viewBox="0 0 16 16"
            width="12"
            height="12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 12L12 4M12 4H5.5M12 4V10.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
    </Link>
  );
}

export function MakesBand({ makes, town }: MakesBandProps) {
  if (!makes.length) return null;

  return (
    <nav className="pmg-inv-makes" aria-label={resolveText(null, "invMakesNavLabel")}>
      <div className="pmg-inv-makes-head">
        <span className="pmg-inv-makes-eyebrow">{resolveText(null, "invMakesEyebrow")}</span>
        <h2 className="pmg-inv-makes-title">{resolveText(null, "invMakesTitle")}</h2>
      </div>
      <div className="pmg-inv-makes-grid">
        {makes.map((make) => (
          <MakeTile key={make} make={make} town={town} />
        ))}
      </div>
    </nav>
  );
}
