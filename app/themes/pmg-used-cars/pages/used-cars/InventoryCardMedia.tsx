"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Camera, ChevronLeft, ChevronRight, Play } from "lucide-react";

/** Slides shown per card. Detail page carries the full set. */
const MAX_SLIDES = 8;

type Props = {
  images: string[];
  title: string;
  href: string;
  reserved: boolean;
  sold: boolean;
  hasVideo: boolean;
  priority?: boolean;
  /** Wishlist / compare overlay from the parent card. */
  actions?: ReactNode;
};

export function InventoryCardMedia({ images, title, href, reserved, sold, hasVideo, priority = false, actions }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const slides = images.slice(0, MAX_SLIDES);
  const count = slides.length;

  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex((prev) => (prev === next ? prev : next));
  }, []);

  const goTo = useCallback(
    (target: number, event?: React.MouseEvent) => {
      event?.preventDefault();
      event?.stopPropagation();
      const el = trackRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(count - 1, target));
      el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    },
    [count],
  );

  return (
    <div className="pmg-inv-card-media">
      {count === 0 ? (
        <a className="pmg-inv-card-media-link" href={href} aria-label={title}>
          <span className="pmg-inv-card-noimg" aria-hidden="true">
            <Camera size={26} strokeWidth={1.5} />
            Photo coming soon
          </span>
        </a>
      ) : (
        <div className="pmg-inv-card-slider" ref={trackRef} onScroll={handleScroll}>
          {slides.map((src, i) => (
            <a
              className="pmg-inv-slide"
              href={href}
              key={`${src}-${i}`}
              tabIndex={i === 0 ? undefined : -1}
              aria-hidden={i === 0 ? undefined : true}
              aria-label={i === 0 ? `${title} — view details` : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={i === 0 ? title : ""}
                loading={priority && i === 0 ? "eager" : "lazy"}
                fetchPriority={priority && i === 0 ? "high" : "auto"}
                decoding="async"
                draggable={false}
              />
            </a>
          ))}
        </div>
      )}

      {count > 1 ? (
        <>
          <button
            type="button"
            className="pmg-inv-slide-nav is-prev"
            aria-label="Previous image"
            onClick={(event) => goTo(index - 1, event)}
            disabled={index === 0}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="pmg-inv-slide-nav is-next"
            aria-label="Next image"
            onClick={(event) => goTo(index + 1, event)}
            disabled={index === count - 1}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          <div className="pmg-inv-slide-dots" role="tablist" aria-label="Vehicle images">
            {slides.map((_, i) => (
              <button
                type="button"
                key={i}
                className={i === index ? "pmg-inv-slide-dot is-active" : "pmg-inv-slide-dot"}
                aria-label={`Go to image ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                onClick={(event) => goTo(i, event)}
              />
            ))}
          </div>
        </>
      ) : null}

      <div className="pmg-inv-card-badges">
        {sold ? (
          <span className="pmg-inv-badge is-sold">Sold</span>
        ) : reserved ? (
          <span className="pmg-inv-badge is-reserved">Reserved</span>
        ) : null}
        {hasVideo ? (
          <span className="pmg-inv-badge is-video">
            <Play size={11} fill="currentColor" aria-hidden="true" />
            Video
          </span>
        ) : null}
      </div>

      {actions}

      {/* Hover affordance — visual only (pointer-events:none). Navigation happens
          via the slide anchors beneath, so swipe + arrows stay unaffected. */}
      <div className="pmg-inv-card-hover" aria-hidden="true">
        <span className="pmg-inv-card-view">
          View details
          <ArrowRight size={15} />
        </span>
      </div>
    </div>
  );
}
