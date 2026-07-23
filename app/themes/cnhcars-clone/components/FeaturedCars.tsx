'use client';

// audit-ignore-file: data-useeffect-fetch — client-side fetch sourced from
// useBrand context (brand slug only available client-side); legitimate per
// SKILL.md Pitfall row 14. Mode B clone; Phase 8 may refactor to server-
// component pre-fetch.
import { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Gauge, Settings, Fuel, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getWishlistVehicleId, useWishlist } from '../context/WishlistContext';
import { useBrand } from '../context/BrandClientWrapper';
import { buildVehiclePermalink } from '../lib/vehicle-links';

interface CarData {
  reg: string;
  source_page?: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  trans: string;
  fuel: string;
  image: string;
  images: string[];
  slug?: string;
}

interface FeaturedVehiclePayload {
  reg?: string;
  registration?: string;
  vin?: string;
  source_page?: string;
  make?: string;
  model?: string;
  year?: number;
  year_of_manufacture?: number;
  price?: number;
  forecourt_price_gbp?: number;
  mileage?: number;
  odometer_reading_miles?: number;
  trans?: string;
  transmission_type?: string;
  fuel?: string;
  fuel_type?: string;
  image?: string;
  images?: string[];
  derivative_slug?: string;
  slug?: string;
}

const formatMileage = (mileage: number) => new Intl.NumberFormat('en-GB').format(mileage);

const formatPrice = (price: number) =>
  price > 0
    ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(price)
    : 'POA';

export default function FeaturedCars() {
  const brand = useBrand();
  const brandSlug = (brand as any)?.slug || '';

  const [featuredCars, setFeaturedCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isInWishlist, toggleItem } = useWishlist();

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadFeaturedCars = async () => {
      try {
        const url = brandSlug
          ? `/api/featured-vehicles?brand=${encodeURIComponent(brandSlug)}&limit=10`
          : '/api/featured-vehicles?limit=10';
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error('Failed to load featured vehicles');
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error('Unexpected featured vehicle payload');
        }
        const normalized: CarData[] = data.map((item: FeaturedVehiclePayload) => ({
          reg: item.reg || item.registration || item.vin || 'unknown',
          source_page: item.source_page || undefined,
          make: item.make || 'Unknown',
          model: item.model || 'Vehicle',
          year: item.year || item.year_of_manufacture || new Date().getFullYear(),
          price: item.price ?? item.forecourt_price_gbp ?? 0,
          mileage: item.mileage ?? item.odometer_reading_miles ?? 0,
          trans: item.trans || item.transmission_type || 'Unknown',
          fuel: item.fuel || item.fuel_type || 'Unknown',
          image: (item.images && item.images.length ? item.images[0] : item.image) || '/images/placeholder.png',
          images: Array.isArray(item.images) && item.images.length ? item.images : (item.image ? [item.image] : []),
          slug: item.derivative_slug || item.slug || undefined,
        }));
        setFeaturedCars(normalized);
      } catch (error) {
        console.error('Error loading featured cars:', error);
        setError((error as Error).message || 'Failed to load featured cars');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedCars();
  }, [brandSlug]);

  const syncScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft < maxScroll - 4);
    setProgress(maxScroll > 0 ? track.scrollLeft / maxScroll : 0);
  }, []);

  useEffect(() => {
    if (featuredCars.length === 0) return;
    syncScrollState();
    window.addEventListener('resize', syncScrollState);
    return () => window.removeEventListener('resize', syncScrollState);
  }, [featuredCars, syncScrollState]);

  const scrollByCards = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.cnh-feat-card');
    const gap = 20;
    const step = card ? (card.offsetWidth + gap) * direction : track.clientWidth * 0.9 * direction;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: step, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  if (loading || error || featuredCars.length === 0) {
    return null;
  }

  return (
    <section className="featured-cars-section cnh-feat" data-aos="fade-up">
      <div className="cnh-feat-inner">
        <header className="cnh-feat-head">
          <div className="cnh-feat-heading">
            <p className="cnh-feat-eyebrow">Latest arrivals</p>
            <h2 className="cnh-feat-title">Featured Vehicles</h2>
          </div>
          <div className="cnh-feat-controls">
            <Link href="/used-cars" className="cnh-feat-viewall">
              View all cars
              <ArrowRight className="cnh-feat-viewall-icon" aria-hidden="true" />
            </Link>
            <button
              type="button"
              className="cnh-feat-arrow"
              aria-label="Previous vehicles"
              disabled={!canPrev}
              onClick={() => scrollByCards(-1)}
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className="cnh-feat-arrow"
              aria-label="Next vehicles"
              disabled={!canNext}
              onClick={() => scrollByCards(1)}
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </header>

        <div
          className="cnh-feat-track"
          ref={trackRef}
          onScroll={syncScrollState}
          aria-label="Featured vehicles"
        >
          {featuredCars.map((car, index) => {
            const wishlistId = getWishlistVehicleId({
              id: car.reg?.toLowerCase() === 'unknown' ? `featured:${car.make}-${car.model}-${car.year}` : undefined,
              reg: car.reg
            });
            const isFavorited = wishlistId ? isInWishlist(wishlistId) : false;
            const vehicleHref = buildVehiclePermalink(
              { slug: car.slug, reg: car.reg },
              '/used-cars',
            );

            return (
              <article key={car.slug || car.reg || `featured-${index}`} className="cnh-feat-card">
                <div className="cnh-feat-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={car.image}
                    alt={`${car.make} ${car.model}`}
                    className="cnh-feat-img"
                    loading="lazy"
                    onError={(e) => {
                      // Avoid re-triggering onError if fallback ever fails.
                      if (e.currentTarget.src.endsWith('/images/placeholder.png')) {
                        return;
                      }
                      e.currentTarget.src = '/images/placeholder.png';
                    }}
                  />
                  <button
                    type="button"
                    className={`cnh-feat-fav ${isFavorited ? 'is-active' : ''}`}
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    aria-pressed={isFavorited}
                    onClick={() =>
                      toggleItem({
                        id: wishlistId || undefined,
                        reg: car.reg,
                        make: car.make,
                        model: car.model,
                        year: car.year,
                        price: car.price,
                        mileage: car.mileage,
                        trans: car.trans,
                        fuel: car.fuel,
                        image: car.image
                      })
                    }
                  >
                    <Heart className="cnh-feat-fav-icon" aria-hidden="true" />
                  </button>
                </div>

                <div className="cnh-feat-body">
                  <h3 className="cnh-feat-cardtitle">
                    <Link href={vehicleHref} className="cnh-feat-cardlink">
                      {car.year} {car.make} {car.model}
                    </Link>
                  </h3>

                  <div className="cnh-feat-specs">
                    <span className="cnh-feat-chip">
                      <Gauge className="cnh-feat-chip-icon" aria-hidden="true" />
                      {formatMileage(car.mileage)} mi
                    </span>
                    <span className="cnh-feat-chip">
                      <Settings className="cnh-feat-chip-icon" aria-hidden="true" />
                      {car.trans}
                    </span>
                    <span className="cnh-feat-chip">
                      <Fuel className="cnh-feat-chip-icon" aria-hidden="true" />
                      {car.fuel}
                    </span>
                  </div>

                  <div className="cnh-feat-foot">
                    <span className="cnh-feat-price">{formatPrice(car.price)}</span>
                    <span className="cnh-feat-cta" aria-hidden="true">
                      View details
                      <ArrowRight className="cnh-feat-cta-icon" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="cnh-feat-progress" aria-hidden="true">
          <span className="cnh-feat-progress-bar" style={{ transform: `scaleX(${Math.max(progress, 0.08)})` }} />
        </div>
      </div>
    </section>
  );
}
