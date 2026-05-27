'use client';

import { useState, useEffect } from 'react';
import { RotateCcw, Filter } from 'lucide-react';

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

export default function FilterBar({ onFilterChange, resultsCount, availableMakes = [], availableBodyTypes = [], loading = false }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    make: '',
    model: '',
    year: '',
    price: '',
    transmission: ''
  });

  const [showFilters, setShowFilters] = useState(true);

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      make: '',
      model: '',
      year: '',
      price: '',
      transmission: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="cars-filter-bar">
      <div className="filter-header">
        <h2>Find your perfect car</h2>
        <div className="filter-header-right">
          <div className="filter-results-count">
            <span id="results-count">{resultsCount}</span> cars found
          </div>
          <button className="filter-btn filter-reset" onClick={resetFilters}>
            <RotateCcw className="btn-icon" /> Reset
          </button>
        </div>
        <button 
          className="filter-toggle-mobile" 
          aria-label="Toggle filters"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="btn-icon" />
        </button>
      </div>
      <div className={`filter-grid ${showFilters ? 'active' : ''}`}>
        <div className="filter-group">
          <label htmlFor="filter-make">Make</label>
          <select 
            id="filter-make" 
            className="filter-input"
            value={filters.make}
            onChange={(e) => handleFilterChange('make', e.target.value)}
            disabled={loading}
          >
            <option value="">All Makes</option>
            {availableMakes.map((make) => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-model">Model</label>
          <select 
            id="filter-model" 
            className="filter-input"
            value={filters.model}
            onChange={(e) => handleFilterChange('model', e.target.value)}
          >
            <option value="">All Models</option>
            <option value="3 Series">3 Series</option>
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="Q5">Q5</option>
            <option value="C-Class">C-Class</option>
            <option value="E-Class">E-Class</option>
            <option value="Model 3">Model 3</option>
            <option value="Model Y">Model Y</option>
            <option value="Mustang">Mustang</option>
            <option value="F-150">F-150</option>
            <option value="Camry">Camry</option>
            <option value="Corolla">Corolla</option>
            <option value="Golf">Golf</option>
            <option value="Passat">Passat</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-year">Year</label>
          <select 
            id="filter-year" 
            className="filter-input"
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="2019">2019</option>
            <option value="2018">2018</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-price">Price Range</label>
          <select 
            id="filter-price" 
            className="filter-input"
            value={filters.price}
            onChange={(e) => handleFilterChange('price', e.target.value)}
          >
            <option value="">All Prices</option>
            <option value="5000-15000">£5,000 - £15,000</option>
            <option value="15000-25000">£15,000 - £25,000</option>
            <option value="25000-35000">£25,000 - £35,000</option>
            <option value="35000-50000">£35,000 - £50,000</option>
            <option value="50000-100000">£50,000+</option>
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="filter-transmission">Transmission</label>
          <select 
            id="filter-transmission" 
            className="filter-input"
            value={filters.transmission}
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
      </div>
    </div>
  );
}
