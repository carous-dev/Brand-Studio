'use client';

import Link from 'next/link';
import { Filter, Heart } from 'lucide-react';

export const SORT_OPTIONS = [
  { label: 'Latest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Lowest Mileage', value: 'mileage-asc' },
];

interface InventoryToolbarProps {
  shownCount: number;
  totalResults: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  sort: string;
  onSortChange: (sort: string) => void;
  activeFilterCount: number;
  onToggleFilters: () => void;
  filtersOpen: boolean;
  wishlistCount: number;
}

export default function InventoryToolbar({
  shownCount,
  totalResults,
  viewMode,
  onViewModeChange,
  sort,
  onSortChange,
  activeFilterCount,
  onToggleFilters,
  filtersOpen,
  wishlistCount,
}: InventoryToolbarProps) {
  return (
    <div className="inventory-results-toolbar">
      <div className="inventory-toolbar-lead">
        <button
          type="button"
          className={filtersOpen ? 'inventory-filters-toggle is-open' : 'inventory-filters-toggle'}
          aria-expanded={filtersOpen}
          onClick={onToggleFilters}
        >
          <Filter size={15} aria-hidden="true" />
          <span>Filters</span>
          {activeFilterCount > 0 ? <strong>{activeFilterCount}</strong> : null}
        </button>
        <p className="inventory-results-count">
          Showing <strong>{shownCount}</strong> of <strong>{totalResults}</strong> used cars
        </p>
      </div>

      <div className="inventory-toolbar-controls">
        <div className="inventory-view-toggle" role="group" aria-label="Inventory view mode">
          <button
            type="button"
            className={viewMode === 'grid' ? 'inventory-view-btn is-active' : 'inventory-view-btn'}
            aria-pressed={viewMode === 'grid'}
            onClick={() => onViewModeChange('grid')}
          >
            Grid
          </button>
          <button
            type="button"
            className={viewMode === 'list' ? 'inventory-view-btn is-active' : 'inventory-view-btn'}
            aria-pressed={viewMode === 'list'}
            onClick={() => onViewModeChange('list')}
          >
            List
          </button>
        </div>

        <div className="inventory-toolbar-counters" aria-label="Wishlist counter">
          <Link
            href="/wishlist"
            className="inventory-toolbar-counter"
            aria-label={`Wishlist (${wishlistCount})`}
            title={`Wishlist: ${wishlistCount}`}
          >
            <Heart size={15} aria-hidden="true" />
            <strong>{wishlistCount}</strong>
          </Link>
        </div>

        <div className="inventory-sort-block">
          <label htmlFor="inventory-sort-select">Sort by</label>
          <select
            id="inventory-sort-select"
            className="inventory-sort-select"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
