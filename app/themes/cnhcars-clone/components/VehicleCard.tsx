'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import { ChevronLeft, ChevronRight, Cog, Fuel, Gauge, Heart, Palette } from 'lucide-react';
import { getWishlistVehicleId, useWishlist } from '../context/WishlistContext';
import { buildVehiclePermalink } from '../lib/vehicle-links';
import { optimizeImageUrl } from '@/app/lib/imageOptimize';

interface VehicleCardProps {
  vehicle: {
    reg: string;
    make: string;
    model: string;
    derivative?: string;
    year?: number | string;
    price?: number | string;
    mileage?: number | string;
    trans?: string;
    fuel?: string;
    colour?: string;
    body_type?: string;
    image?: string;
    images?: string[];
    gallery?: Array<{
      url?: string;
      href?: string;
    }>;
    media?: Array<{
      type?: string;
      href?: string;
      url?: string;
    }>;
    description?: string;
    slug?: string;
    stock_status?: string;
  };
  className?: string;
}

interface StockBadge {
  label: string;
  variant: 'reserved' | 'sold';
}

const MAX_VISIBLE_SLIDER_INDICATORS = 5;

function cleanText(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildOrderedGalleryImages(vehicle: VehicleCardProps['vehicle']): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  const push = (value: unknown) => {
    const text = cleanText(value);
    if (!text || seen.has(text)) return;
    seen.add(text);
    ordered.push(text);
  };

  if (Array.isArray(vehicle.gallery)) {
    vehicle.gallery.forEach((item) => push(item?.url || item?.href));
  }
  if (Array.isArray(vehicle.media)) {
    vehicle.media.forEach((item) => push(item?.href || item?.url));
  }
  if (Array.isArray(vehicle.images)) {
    vehicle.images.forEach(push);
  }
  push(vehicle.image);

  return ordered;
}

function toNumericValue(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function formatPounds(value: number): string {
  return `£${value.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`;
}

function formatMileage(value: number | null): string {
  if (value === null) return 'Mileage on request';
  return `${value.toLocaleString('en-GB')} miles`;
}

function getCardBadge(status: string | undefined): StockBadge | null {
  const normalized = cleanText(status).toLowerCase();
  if (!normalized) return null;
  if (normalized.includes('reserved') || normalized.includes('pending')) {
    return { label: 'Reserved', variant: 'reserved' };
  }
  if (normalized.includes('sold')) {
    return { label: 'Sold', variant: 'sold' };
  }
  return null;
}

function getVisibleIndicatorIndices(totalImages: number, currentIndex: number): number[] {
  if (totalImages <= 0) return [];
  if (totalImages <= MAX_VISIBLE_SLIDER_INDICATORS) {
    return Array.from({ length: totalImages }, (_, offset) => offset);
  }

  const half = Math.floor(MAX_VISIBLE_SLIDER_INDICATORS / 2);
  let start = Math.max(0, currentIndex - half);
  let end = start + MAX_VISIBLE_SLIDER_INDICATORS - 1;

  if (end >= totalImages) {
    end = totalImages - 1;
    start = end - MAX_VISIBLE_SLIDER_INDICATORS + 1;
  }

  return Array.from({ length: MAX_VISIBLE_SLIDER_INDICATORS }, (_, offset) => start + offset);
}

export default function VehicleCard({ vehicle, className = '' }: VehicleCardProps) {
  const galleryImages = useMemo(
    () => buildOrderedGalleryImages(vehicle),
    [vehicle.gallery, vehicle.media, vehicle.images, vehicle.image]
  );

  const [imageIndex, setImageIndex] = useState(0);
  const [failedImageSrcs, setFailedImageSrcs] = useState<string[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const { isInWishlist, toggleItem } = useWishlist();
  const failedImageSet = useMemo(() => new Set(failedImageSrcs), [failedImageSrcs]);
  const currentImageSrc = galleryImages[Math.min(imageIndex, galleryImages.length - 1)] ?? '';
  const hasMultipleImages = galleryImages.length > 1;
  const priceValue = toNumericValue(vehicle.price);
  const mileageValue = toNumericValue(vehicle.mileage);
  const yearValue = toNumericValue(vehicle.year);
  const badge = getCardBadge(vehicle.stock_status);
  const title = [
    vehicle.year,
    vehicle.make,
    vehicle.model,
    vehicle.derivative
  ]
    .map((part) => cleanText(part))
    .filter(Boolean)
    .join(' ')
    || cleanText(vehicle.reg)
    || 'Vehicle';

  const displayPrice = priceValue !== null ? formatPounds(priceValue) : 'Enquire';
  const monthlyEstimate = priceValue !== null ? `From ${formatPounds(Math.round(priceValue / 60))}/mo` : 'Finance available';

  const wishlistId = getWishlistVehicleId({
    slug: vehicle.slug,
    reg: vehicle.reg
  });
  const isFavorited = wishlistId ? isInWishlist(wishlistId) : false;

  useEffect(() => {
    setImageIndex(0);
    setFailedImageSrcs([]);
  }, [vehicle.reg, vehicle.slug, vehicle.gallery, vehicle.media, vehicle.images, vehicle.image]);

  useEffect(() => {
    if (imageIndex >= galleryImages.length) {
      setImageIndex(0);
    }
  }, [galleryImages.length, imageIndex]);

  useEffect(() => {
    if (!currentImageSrc) {
      setIsImageLoading(false);
      setIsImageLoaded(false);
      setIsImageError(true);
      return;
    }
    setIsImageLoading(true);
    setIsImageLoaded(false);
    setIsImageError(false);
  }, [currentImageSrc]);

  useEffect(() => {
    const imageElement = imageElementRef.current;
    if (!imageElement || !currentImageSrc || isImageError) return;

    if (imageElement.complete && imageElement.naturalWidth > 0) {
      setIsImageLoading(false);
      setIsImageLoaded(true);
    }
  }, [currentImageSrc, isImageError]);

  const toggleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem({
      id: wishlistId || undefined,
      reg: vehicle.reg,
      slug: vehicle.slug,
      make: vehicle.make,
      model: vehicle.model,
      derivative: vehicle.derivative,
      year: yearValue !== null ? Math.trunc(yearValue) : undefined,
      price: vehicle.price,
      mileage: mileageValue ?? undefined,
      trans: vehicle.trans,
      fuel: vehicle.fuel,
      image: galleryImages[0]
    });
  };

  const handleImageError = () => {
    if (!currentImageSrc) {
      setIsImageError(true);
      setIsImageLoading(false);
      return;
    }

    const nextFailed = new Set(failedImageSrcs);
    nextFailed.add(currentImageSrc);
    setFailedImageSrcs(Array.from(nextFailed));

    for (let step = 1; step <= galleryImages.length; step += 1) {
      const nextIndex = (imageIndex + step) % galleryImages.length;
      const nextImage = galleryImages[nextIndex];

      if (nextImage && !nextFailed.has(nextImage)) {
        setImageIndex(nextIndex);
        return;
      }
    }

    setIsImageError(true);
    setIsImageLoading(false);
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
    setIsImageLoaded(true);
  };

  const getNextNavigableIndex = (startIndex: number, direction: 1 | -1) => {
    if (!galleryImages.length) return 0;

    for (let step = 1; step <= galleryImages.length; step += 1) {
      const nextIndex = (startIndex + (direction * step) + galleryImages.length) % galleryImages.length;
      const nextImage = galleryImages[nextIndex];
      if (nextImage && !failedImageSet.has(nextImage)) {
        return nextIndex;
      }
    }

    return startIndex;
  };

  const showPrevImage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasMultipleImages) return;

    setImageIndex((prev) => getNextNavigableIndex(prev, -1));
  };

  const showNextImage = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasMultipleImages) return;

    setImageIndex((prev) => getNextNavigableIndex(prev, 1));
  };

  const goToImage = (event: MouseEvent<HTMLButtonElement>, nextIndex: number) => {
    event.preventDefault();
    event.stopPropagation();
    if (!hasMultipleImages) return;

    const targetImage = galleryImages[nextIndex];
    if (!targetImage || failedImageSet.has(targetImage)) return;
    setImageIndex(nextIndex);
  };

  const visibleIndicatorIndices = useMemo(
    () => getVisibleIndicatorIndices(galleryImages.length, imageIndex),
    [galleryImages.length, imageIndex]
  );

  const getVehicleUrl = () => {
    return buildVehiclePermalink(
      { slug: vehicle.slug, reg: vehicle.reg },
      '/used-cars',
    );
  };

  return (
    <article className={[
      'vehicle-card',
      'inventory-card-modern',
      badge?.variant === 'reserved' ? 'is-reserved' : '',
      className
    ].filter(Boolean).join(' ')}>
      <div className="inventory-card-actions" aria-label="Vehicle actions">
        <button
          type="button"
          className={`inventory-card-action ${isFavorited ? 'is-active' : ''}`.trim()}
          onClick={toggleFavorite}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isFavorited}
          title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`heart-icon ${isFavorited ? 'filled' : ''}`} />
        </button>
      </div>

      <div className="inventory-card-link">
        <div className="inventory-card-media">
          <a href={getVehicleUrl()} className="inventory-card-media-link" aria-label={`View details for ${title}`}>
            {isImageLoading && (
              <div className="card-image-skeleton">
                <div className="skeleton-shimmer"></div>
              </div>
            )}

            {isImageError || !currentImageSrc ? (
              <div className="card-image-error">
                <div className="error-icon">🚗</div>
                <span>Gallery image unavailable</span>
              </div>
            ) : (
              <img
                key={currentImageSrc}
                ref={imageElementRef}
                src={optimizeImageUrl(currentImageSrc, { width: 640 })}
                alt={title}
                width={640}
                height={480}
                className={`card-image ${isImageLoaded ? 'loaded' : ''}`}
                onError={handleImageError}
                onLoad={handleImageLoad}
                loading="lazy"
                decoding="async"
              />
            )}
          </a>

          {hasMultipleImages ? (
            <>
              <div className="inventory-card-slider-controls" aria-label="Image gallery controls">
                <button
                  type="button"
                  className="inventory-card-slider-btn"
                  aria-label="View previous image"
                  onClick={showPrevImage}
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="inventory-card-slider-btn"
                  aria-label="View next image"
                  onClick={showNextImage}
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>

              <span className="inventory-card-slider-count" aria-hidden="true">
                {imageIndex + 1}/{galleryImages.length}
              </span>

              <div className="inventory-card-slider-indicators">
                {visibleIndicatorIndices.map((indicatorIndex) => (
                  <button
                    key={`indicator-${indicatorIndex}`}
                    type="button"
                    className={indicatorIndex === imageIndex ? 'inventory-card-slider-indicator is-active' : 'inventory-card-slider-indicator'}
                    aria-label={`View image ${indicatorIndex + 1}`}
                    onClick={(event) => goToImage(event, indicatorIndex)}
                  />
                ))}
              </div>
            </>
          ) : null}

          {badge ? (
            <span className={[
              'inventory-card-badge',
              badge.variant === 'reserved' ? 'is-reserved' : '',
              badge.variant === 'sold' ? 'is-sold' : ''
            ].filter(Boolean).join(' ')}>
              {badge.label}
            </span>
          ) : null}
        </div>

        <a href={getVehicleUrl()} className="inventory-card-content-link" aria-label={`View details for ${title}`}>
          <div className="inventory-card-body">
            <h3>{title}</h3>
            <ul className="inventory-specs">
              <li>
                <Gauge size={14} aria-hidden="true" /> {formatMileage(mileageValue)}
              </li>
              <li>
                <Fuel size={14} aria-hidden="true" /> {cleanText(vehicle.fuel) || 'Fuel on request'}
              </li>
              <li>
                <Cog size={14} aria-hidden="true" /> {cleanText(vehicle.trans) || 'Trans. TBC'}
              </li>
              {cleanText(vehicle.colour) || cleanText(vehicle.body_type) ? (
                <li>
                  <Palette size={14} aria-hidden="true" /> {cleanText(vehicle.colour) || cleanText(vehicle.body_type)}
                </li>
              ) : null}
            </ul>
            <p className="inventory-price">
              <span>{monthlyEstimate}</span> {displayPrice}
            </p>
          </div>
        </a>
      </div>
    </article>
  );
}
