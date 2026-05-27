'use client';

import { Search } from 'lucide-react';
import VehicleCard from './VehicleCard';
import SkeletonCard from './SkeletonCard';

interface UsedCarsGridProps {
  vehicles: any[];
  loading: boolean;
  refreshing?: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function UsedCarsGrid({
  vehicles,
  loading,
  refreshing = false,
  error,
  onRetry,
}: UsedCarsGridProps) {
  if (loading && vehicles.length === 0) {
    return (
      <div className="cars-grid" id="cars-grid">
        {Array.from({ length: 12 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="cars-grid" id="cars-grid">
        <div className="error-state">
          <p>Error loading vehicles: {error}</p>
          <button onClick={() => onRetry?.()} className="retry-btn" type="button">Retry</button>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-content">
          <div className="empty-state-icon">
            <Search size={24} />
          </div>
          <h3>No vehicles found</h3>
          <p>We couldn't find any vehicles matching your current filters.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {(refreshing || error) && vehicles.length > 0 ? (
        <div
          className={`inventory-grid-status${error ? ' is-error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {error ? error : 'Refreshing available vehicles...'}
        </div>
      ) : null}
      <div className="cars-grid" id="cars-grid">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.reg}
            vehicle={vehicle}
          />
        ))}
      </div>
    </>
  );
}
