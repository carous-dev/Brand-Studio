'use client';

import { useState } from 'react';
import FilterBar from '../../components/FilterBar';
import UsedCarsGrid from '../../components/UsedCarsGrid';
import Pagination from '../../components/Pagination';
import { useInventory } from '../../hooks/useInventory';
import {
  DEFAULT_INVENTORY_FILTERS,
  DEFAULT_INVENTORY_PAGINATION,
  type InventoryData,
  type InventoryFilters,
  type InventoryPagination,
} from '../../lib/inventory';
import HeroSmall from '../../components/HeroSmall';
import '../../styles/hero-filter.css';
import '../../styles/cars-filter.css';
import '../../styles/inventory.css';
import '../../styles/inventory-bg.css';
import '../../styles/vehicle-card.css';
import '../../styles/pagination.css';
import '../../styles/used-cars-typography.css';

type UsedCarsPageClientProps = {
  initialInventoryData?: InventoryData | null;
};

export default function UsedCarsPageClient({ initialInventoryData = null }: UsedCarsPageClientProps) {
  const [filters, setFilters] = useState<InventoryFilters>(DEFAULT_INVENTORY_FILTERS);

  const [pagination, setPagination] = useState<InventoryPagination>(DEFAULT_INVENTORY_PAGINATION);

  const {
    vehicles,
    loading,
    refreshing,
    error,
    refetch,
    totalCount,
    currentPage,
    totalPages,
    perPage,
    availableMakes,
    availableBodyTypes,
  } = useInventory(filters, pagination, { initialData: initialInventoryData });

  const busy = loading || refreshing;

  const handleFilterChange = (newFilters: InventoryFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  return (
    <main className="inventory-page">
      <HeroSmall />
      <section className="inventory-container">
        <div className="inventory-content container">
          <FilterBar 
            onFilterChange={handleFilterChange} 
            resultsCount={totalCount}
            availableMakes={availableMakes}
            availableBodyTypes={availableBodyTypes}
            loading={busy}
          />
          <UsedCarsGrid 
            vehicles={vehicles}
            loading={loading}
            refreshing={refreshing}
            error={error}
            onRetry={refetch}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            perPage={perPage}
            onPageChange={handlePageChange}
            loading={busy}
          />
        </div>
      </section>
    </main>
  );
}
