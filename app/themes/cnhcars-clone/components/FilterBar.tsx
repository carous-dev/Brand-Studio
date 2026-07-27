'use client';

import { useState } from 'react';
import { RotateCcw, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface FilterState {
  make: string;
  model: string;
  year: string;
  price: string;
  transmission: string;
}

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
  resultsCount: number;
  availableMakes?: string[];
  availableBodyTypes?: string[];
  loading?: boolean;
}

const EMPTY_FILTERS: FilterState = {
  make: '',
  model: '',
  year: '',
  price: '',
  transmission: ''
};

// Real year range instead of a hardcoded handful.
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

export default function FilterBar({ onFilterChange, resultsCount, availableMakes = [], loading = false }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  // Collapsed by default on mobile (the toggle only exists <768px; desktop
  // always shows the controls regardless of this state).
  const [showFilters, setShowFilters] = useState(false);

  const activeCount = Object.values(filters).filter(Boolean).length;

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    onFilterChange(EMPTY_FILTERS);
  };

  return (
    <div className="cnh-flt">
      <span className="cnh-flt-count" role="status">
        <span id="results-count">{resultsCount}</span>
        {resultsCount === 1 ? 'car' : 'cars'}
      </span>

      <button
        type="button"
        className="cnh-flt-toggle"
        aria-expanded={showFilters}
        aria-controls="cnh-flt-grid"
        onClick={() => setShowFilters((open) => !open)}
      >
        <SlidersHorizontal aria-hidden="true" />
        Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        <ChevronDown className={`cnh-flt-toggle-chev ${showFilters ? 'is-open' : ''}`} aria-hidden="true" />
      </button>

      <div id="cnh-flt-grid" className={`cnh-flt-grid ${showFilters ? 'is-open' : ''}`}>
        <div className="cnh-flt-control">
          <select
            aria-label="Make"
            value={filters.make}
            onChange={(e) => handleFilterChange('make', e.target.value)}
            disabled={loading}
          >
            <option value="">All makes</option>
            {availableMakes.map((make) => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
          <ChevronDown className="cnh-flt-chev" aria-hidden="true" />
        </div>

        <div className="cnh-flt-control">
          <input
            aria-label="Model"
            type="text"
            placeholder="Model"
            value={filters.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}
          />
        </div>

        <div className="cnh-flt-control">
          <select
            aria-label="Year"
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          >
            <option value="">All years</option>
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <ChevronDown className="cnh-flt-chev" aria-hidden="true" />
        </div>

        <div className="cnh-flt-control">
          <select
            aria-label="Price"
            value={filters.price}
            onChange={(e) => handleFilterChange('price', e.target.value)}
          >
            <option value="">All prices</option>
            {PRICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronDown className="cnh-flt-chev" aria-hidden="true" />
        </div>

        <div className="cnh-flt-control">
          <select
            aria-label="Gearbox"
            value={filters.transmission}
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
          >
            <option value="">All gearboxes</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
          <ChevronDown className="cnh-flt-chev" aria-hidden="true" />
        </div>
      </div>

      {activeCount > 0 ? (
        <button type="button" className="cnh-flt-reset" onClick={resetFilters}>
          <RotateCcw aria-hidden="true" /> Reset
        </button>
      ) : null}
    </div>
  );
}
