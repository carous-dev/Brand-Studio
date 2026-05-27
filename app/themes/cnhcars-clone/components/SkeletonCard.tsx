'use client';

interface SkeletonCardProps {
  className?: string;
}

export default function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <article className={`vehicle-card inventory-card-modern skeleton-card ${className}`}>
      <div className="inventory-card-link">
        <div className="inventory-card-media">
          <div className="skeleton-image"></div>
          <div className="skeleton-favorite-button"></div>
          <div className="skeleton-stock-status"></div>
        </div>

        <div className="inventory-card-body">
          <div className="skeleton-title"></div>

          <div className="skeleton-spec-grid">
            <div className="skeleton-spec"></div>
            <div className="skeleton-spec"></div>
            <div className="skeleton-spec"></div>
            <div className="skeleton-spec"></div>
          </div>

          <div className="skeleton-price-row">
            <div className="skeleton-monthly"></div>
            <div className="skeleton-price"></div>
          </div>
        </div>
      </div>
    </article>
  );
}
