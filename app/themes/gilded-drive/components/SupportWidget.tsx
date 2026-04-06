"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useBrand } from "../context/BrandClientWrapper";
import "../styles/support.css";

type SupportWidgetConfig = {
  phone: string;
  message: string;
  chipText: string;
  panelTitle: string;
  ctaText: string;
  ctaSubText: string;
};

declare global {
  interface Window {
    VP_WHATSAPP_WIDGET?: Partial<SupportWidgetConfig>;
    BRANDSTUDIO_WHATSAPP_WIDGET?: Partial<SupportWidgetConfig>;
  }
}

const DEFAULT_OPEN_MEDIA_QUERY = "(min-width: 1024px)";

function buildMessageLink(phone: string, message: string): string {
  const digitsOnly = String(phone || "").replace(/\D/g, "");
  if (!digitsOnly) return "";

  const encodedMessage = encodeURIComponent(message || "");
  if (!encodedMessage) return `https://wa.me/${digitsOnly}`;

  return `https://wa.me/${digitsOnly}?text=${encodedMessage}`;
}

export default function SupportWidget() {
  const brand = useBrand();
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const defaultConfig = useMemo<SupportWidgetConfig>(() => {
    const phonePrimary = String(brand?.location?.phone || "").replace(/\D/g, "");
    const phoneSecondary = String((brand?.location as any)?.phoneSecondary || (brand?.location as any)?.phone2 || "").replace(/\D/g, "");
    const fallbackPhone = "441473970215";

    return {
      phone: phonePrimary || phoneSecondary || fallbackPhone,
      message: `Hi ${brand.name}, I would like help with a vehicle enquiry.`,
      chipText: "Need help?",
      panelTitle: "Need help finding the right car?",
      ctaText: "Chat on WhatsApp",
      ctaSubText: "Typically replies in minutes",
    };
  }, [brand]);

  const [config, setConfig] = useState<SupportWidgetConfig>(defaultConfig);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setConfig(defaultConfig);
  }, [defaultConfig]);

  useEffect(() => {
    const userConfig = window.BRANDSTUDIO_WHATSAPP_WIDGET ?? window.VP_WHATSAPP_WIDGET ?? {};
    setConfig((previous) => ({
      ...previous,
      ...userConfig,
    }));

    if (window.matchMedia(DEFAULT_OPEN_MEDIA_QUERY).matches) {
      setIsOpen(true);
    }

    const animationFrame = window.requestAnimationFrame(() => {
      setIsReady(true);
    });

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!isOpen || !rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const widgetClassName = useMemo(() => {
    const states = ["vp-wa-widget"];
    if (isReady) states.push("is-ready");
    if (isOpen) states.push("is-open");
    return states.join(" ");
  }, [isOpen, isReady]);

  const waHref = useMemo(() => buildMessageLink(config.phone, config.message), [config.message, config.phone]);
  const hasValidLink = waHref.length > 0;
  const isOnline = hasValidLink;

  return (
    <div id="vp-whatsapp-widget" ref={rootRef} className={widgetClassName}>
      <section className="vp-wa-panel" aria-hidden={!isOpen}>
        <button type="button" className="vp-wa-close" aria-label="Close WhatsApp panel" onClick={() => setIsOpen(false)}>
          ×
        </button>
        <p className="vp-wa-kicker">Support</p>
        <div className={`vp-wa-status ${isOnline ? "is-online" : "is-offline"}`}>
          <span className="vp-wa-status-dot" aria-hidden="true"></span>
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
        <p className="vp-wa-title">{config.panelTitle}</p>
        <a
          className={`vp-wa-link${hasValidLink ? "" : " is-disabled"}`}
          href={waHref || undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open WhatsApp support chat"
          aria-disabled={!hasValidLink}
          onClick={(event) => {
            if (!hasValidLink) event.preventDefault();
          }}
        >
          <span>{config.ctaText}</span>
        </a>
        <p className="vp-wa-kicker vp-wa-subtext">{config.ctaSubText}</p>
      </section>

      <div className="vp-wa-trigger-wrap">
        <button type="button" className="vp-wa-chip" aria-label="Open WhatsApp support panel" onClick={() => setIsOpen(true)}>
          {config.chipText}
        </button>

        <button
          type="button"
          className="vp-wa-toggle"
          aria-label="Open WhatsApp support"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((previous) => !previous)}
        >
          <span className="vp-wa-ring" aria-hidden="true"></span>
          <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M16.02 3.2c-6.98 0-12.64 5.63-12.64 12.58 0 2.21.58 4.37 1.68 6.27L3.2 28.8l6.95-1.81a12.72 12.72 0 0 0 5.87 1.49h.01c6.97 0 12.63-5.63 12.63-12.58 0-6.95-5.66-12.7-12.64-12.7zm7.36 17.82c-.31.87-1.82 1.66-2.51 1.76-.67.1-1.52.14-2.46-.16-.57-.18-1.31-.43-2.26-.84-3.98-1.71-6.56-5.72-6.76-5.99-.2-.27-1.62-2.14-1.62-4.09 0-1.95 1.03-2.91 1.39-3.3.37-.38.8-.48 1.06-.48.27 0 .53.01.77.02.25.01.58-.09.9.67.34.8 1.15 2.77 1.25 2.97.1.2.17.43.03.69-.14.27-.21.43-.42.66-.21.23-.44.51-.63.69-.21.2-.43.42-.19.82.24.4 1.05 1.72 2.26 2.78 1.55 1.36 2.85 1.79 3.25 1.99.41.2.65.17.9-.1.24-.27 1.03-1.18 1.31-1.58.27-.4.55-.33.92-.2.37.13 2.34 1.1 2.74 1.3.4.2.67.3.77.47.1.17.1 1-.2 1.87z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
