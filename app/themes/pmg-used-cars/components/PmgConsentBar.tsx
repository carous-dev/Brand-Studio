"use client";

import { useEffect, useState } from "react";
import { useCookieConsent } from "@/app/themes/pmg-used-cars/lib/vendor/hooks/useCookieConsent";
import { resolveText } from "../lib/brand-text";

// Time for the exit animation to play before the banner unmounts.
const EXIT_MS = 450;

const IconCookie = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z" />
    <circle cx="8.5" cy="10.5" r=".8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="15.5" r=".8" fill="currentColor" stroke="none" />
    <circle cx="15.5" cy="11.5" r=".8" fill="currentColor" stroke="none" />
  </svg>
);
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export function PmgConsentBar() {
  const { visible, acceptAll, declineAll } = useCookieConsent({ storageKey: "pmg_cookie_prefs" });
  const [show, setShow] = useState(false);

  // Play the entry transition on the frame after the banner mounts.
  useEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, [visible]);

  if (!visible) return null;

  // Animate out, then persist the choice (which unmounts the banner).
  const choose = (persist: () => void) => {
    setShow(false);
    window.setTimeout(persist, EXIT_MS);
  };

  return (
    <div
      className={`pmg-cookie${show ? " show" : ""}`}
      role="dialog"
      aria-live="polite"
      aria-label={resolveText(null, "consentRegionLabel")}
    >
      <button className="cb-close" aria-label="Dismiss — necessary cookies only" /* text-static-ok */ onClick={() => choose(declineAll)}>
        <IconClose />
      </button>
      <div className="cb-top">
        <div className="cb-ico"><IconCookie /></div>
        <div>
          <h4>{resolveText(null, "consentTitle")}</h4>
          <p>
            To run the site and understand how it&apos;s used. Read our{" "}
            <a href="/cookie-policy">{resolveText(null, "consentPolicyLink")}</a>.
          </p>
        </div>
      </div>
      <div className="cb-actions">
        <button className="pmg-btn pmg-btn-outline-light" onClick={() => choose(declineAll)}>
          Necessary only
        </button>
        <button className="pmg-btn pmg-btn-primary" onClick={() => choose(acceptAll)}>
          Accept all
        </button>
      </div>
    </div>
  );
}

export default PmgConsentBar;
