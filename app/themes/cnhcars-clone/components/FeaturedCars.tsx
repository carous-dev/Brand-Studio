'use client';

// audit-ignore-file: data-useeffect-fetch — client-side fetch sourced from
// useBrand context (brand slug only available client-side); legitimate per
// SKILL.md Pitfall row 14. Mode B clone; Phase 8 may refactor to server-
// component pre-fetch.
import { useState, useEffect } from 'react';
import { Heart, ExternalLink, Gauge, Settings, Fuel } from 'lucide-react';
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

export default function FeaturedCars() {
  const brand = useBrand();
  const brandSlug = (brand as any)?.slug || '';
  const sectionTitle = 'Featured Vehicles';
  const sectionDescription =
    'A rotating selection of recently added vehicles. Browse the latest arrivals or view the full inventory.';

  const [featuredCars, setFeaturedCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isInWishlist, toggleItem } = useWishlist();

  useEffect(() => {
    const loadFeaturedCars = async () => {
      try {
        const url = brandSlug
          ? `/api/featured-vehicles?brand=${encodeURIComponent(brandSlug)}&limit=8`
          : '/api/featured-vehicles?limit=8';
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

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('en-GB').format(mileage);
  };

  if (loading || error || featuredCars.length === 0) {
    return null;
  }

  return (
    <section className="featured-cars-section">
      <div className="container">
        <div className="section-header">
          <h2>{sectionTitle}</h2>
          <p>{sectionDescription}</p>
        </div>
        <div className="featured-cars-grid">
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
              <div key={car.slug || car.reg || `featured-${index}`} className="featured-car-card">
                <div className="car-image-container">
                  <img
                    src={car.image}
                    alt={`${car.make} ${car.model}`}
                    className="car-image"
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
                    className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
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
                    <Heart className={`heart-icon ${isFavorited ? 'filled' : ''}`} />
                  </button>
                </div>

                <div className="car-info">
                  <div className="car-header">
                    <h3 className="car-title">
                      <Link href={vehicleHref}>{car.make} {car.model}</Link>
                    </h3>
                    <div className="car-year">{car.year}</div>
                  </div>

                  <div className="car-specs">
                    <div className="spec-chip">
                      <Gauge className="spec-icon" size={16} />
                      <span className="spec-value">{formatMileage(car.mileage)}</span>
                    </div>
                    <div className="spec-chip">
                      <Settings className="spec-icon" size={16} />
                      <span className="spec-value">{car.trans}</span>
                    </div>
                    <div className="spec-chip">
                      <Fuel className="spec-icon" size={16} />
                      <span className="spec-value">{car.fuel}</span>
                    </div>
                  </div>
                </div>

                <div className="car-overlay">
                  <Link href={vehicleHref} className="view-details-btn">
                    <ExternalLink className="btn-icon" />
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
