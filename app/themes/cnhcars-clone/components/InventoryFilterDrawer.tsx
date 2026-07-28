'use client';

import { useEffect } from 'react';
import { ChevronDown, Filter, RotateCcw, X } from 'lucide-react';
import type { InventoryFilters } from '../lib/inventory';

const YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() - 2007 },
  (_, i) => String(new Date().getFullYear() - i),
);

const PRICE_OPTIONS = [
  { value: '0-5000', label: 'Up to £5,000' },
  { value: '5000-10000', label: '£5,000 - £10,000' },
  { value: '10000-15000', label: '£10,000 - £15,000' },
  { value: '15000-25000', label: '£15,000 - £25,000' },
  { value: '25000-50000', label: '£25,000 - £50,000' },
  { value: '50000-', label: '£50,000+' },
];

interface InventoryFilterDrawerProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  filters: InventoryFilters;
  onFilterChange: (field: keyof InventoryFilters, value: string) => void;
  onReset: () => void;
  availableMakes: string[];
  resultsCount: number;
  activeFilterCount: number;
}

export default function InventoryFilterDrawer({
  open,
  onOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  availableMakes,
  resultsCount,
  activeFilterCount,
}: InventoryFilterDrawerProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        className="inventory-filter-fab"
        aria-label="Open filters"
        aria-expanded={open}
        onClick={onOpen}
      >
        <Filter size={17} aria-hidden="true" />
        <span>Filters</span>
        {activeFilterCount > 0 ? <strong>{activeFilterCount}</strong> : null}
      </button>

      <div
        className={`inventory-filter-backdrop${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`inventory-filter-drawer${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter vehicles"
        aria-hidden={!open}
      >
        <div className="inventory-filter-head">
          <h2>Filters</h2>
          <button type="button" className="inventory-filter-close" aria-label="Close filters" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="inventory-filter-body">
          <div className="inventory-filter-field">
            <label htmlFor="flt-make">Make</label>
            <div className="inventory-filter-control">
              <select
                id="flt-make"
                value={filters.make}
                onChange={(e) => onFilterChange('make', e.target.value)}
              >
                <option value="">All makes</option>
                {availableMakes.map((make) => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
              <ChevronDown className="inventory-filter-chevron" aria-hidden="true" />
            </div>
          </div>

          <div className="inventory-filter-field">
            <label htmlFor="flt-model">Model</label>
            <div className="inventory-filter-control">
              <input
                id="flt-model"
                type="text"
                placeholder="Any model"
                value={filters.model}
                onChange={(e) => onFilterChange('model', e.target.value)}
              />
            </div>
          </div>

          <div className="inventory-filter-field">
            <label htmlFor="flt-year">Year</label>
            <div className="inventory-filter-control">
              <select
                id="flt-year"
                value={filters.year}
                onChange={(e) => onFilterChange('year', e.target.value)}
              >
                <option value="">All years</option>
                {YEAR_OPTIONS.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <ChevronDown className="inventory-filter-chevron" aria-hidden="true" />
            </div>
          </div>

          <div className="inventory-filter-field">
            <label htmlFor="flt-price">Price</label>
            <div className="inventory-filter-control">
              <select
                id="flt-price"
                value={filters.price}
                onChange={(e) => onFilterChange('price', e.target.value)}
              >
                <option value="">All prices</option>
                {PRICE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="inventory-filter-chevron" aria-hidden="true" />
            </div>
          </div>

          <div className="inventory-filter-field">
            <label htmlFor="flt-gearbox">Gearbox</label>
            <div className="inventory-filter-control">
              <select
                id="flt-gearbox"
                value={filters.transmission}
                onChange={(e) => onFilterChange('transmission', e.target.value)}
              >
                <option value="">All gearboxes</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
              <ChevronDown className="inventory-filter-chevron" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="inventory-filter-foot">
          <button type="button" className="inventory-filter-clear" onClick={onReset}>
            <RotateCcw size={15} aria-hidden="true" /> Clear
          </button>
          <button type="button" className="inventory-filter-apply" onClick={onClose}>
            Show {resultsCount} {resultsCount === 1 ? 'result' : 'results'}
          </button>
        </div>
      </aside>
    </>
  );
}
