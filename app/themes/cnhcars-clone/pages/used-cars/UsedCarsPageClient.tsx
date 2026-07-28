'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import HeroSmall from '../../components/HeroSmall';
import VehicleCard from '../../components/VehicleCard';
import SkeletonCard from '../../components/SkeletonCard';
import InventoryToolbar from '../../components/InventoryToolbar';
import InventoryFilterDrawer from '../../components/InventoryFilterDrawer';
import { useInventory } from '../../hooks/useInventory';
import { useWishlist } from '../../context/WishlistContext';
import {
  DEFAULT_INVENTORY_PAGINATION,
  type InventoryData,
  type InventoryFilters,
  type InventoryPagination,
} from '../../lib/inventory';
import '../../styles/inventory.css';
import '../../styles/inventory-bg.css';
import '../../styles/inventory-modern.css';
import '../../styles/vehicle-card.css';
import '../../styles/used-cars-typography.css';

type UsedCarsPageClientProps = {
  initialInventoryData?: InventoryData | null;
};

const INITIAL_FILTERS: InventoryFilters = {
  make: '',
  model: '',
  year: '',
  price: '',
  transmission: '',
  sort: 'newest',
};

type ViewMode = 'grid' | 'list';
type PaginationItem = number | 'ellipsis';

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pageSet = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  if (currentPage <= 3) [2, 3, 4].forEach((p) => pageSet.add(p));
  if (currentPage >= totalPages - 2) [totalPages - 1, totalPages - 2, totalPages - 3].forEach((p) => pageSet.add(p));

  const pages = Array.from(pageSet)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  const items: PaginationItem[] = [];
  let prev: number | null = null;
  for (const p of pages) {
    if (prev !== null) {
      const gap = p - prev;
      if (gap === 2) items.push(prev + 1);
      else if (gap > 2) items.push('ellipsis');
    }
    items.push(p);
    prev = p;
  }
  return items;
}

export default function UsedCarsPageClient({ initialInventoryData = null }: UsedCarsPageClientProps) {
  const [filters, setFilters] = useState<InventoryFilters>(INITIAL_FILTERS);
  const [pagination, setPagination] = useState<InventoryPagination>(DEFAULT_INVENTORY_PAGINATION);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { count: wishlistCount } = useWishlist();

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
  } = useInventory(filters, pagination, { initialData: initialInventoryData });

  const busy = loading || refreshing;

  useEffect(() => {
    const query = window.matchMedia('(max-width: 900px)');
    const sync = () => setIsCompactViewport(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const effectiveViewMode: ViewMode = isCompactViewport ? 'grid' : viewMode;

  const activeFilterCount = useMemo(
    () => [filters.make, filters.model, filters.year, filters.price, filters.transmission].filter(Boolean).length,
    [filters.make, filters.model, filters.year, filters.price, filters.transmission],
  );

  const shownCount = Math.min(totalCount, (currentPage - 1) * perPage + vehicles.length);
  const showEmpty = !loading && vehicles.length === 0 && !error;
  const showPagination = totalPages > 1 && !showEmpty;
  const paginationItems = getPaginationItems(currentPage, totalPages);

  const handleFilterChange = (field: keyof InventoryFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setFilters((prev) => ({ ...INITIAL_FILTERS, sort: prev.sort }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (sort: string) => {
    setFilters((prev) => ({ ...prev, sort }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const goToPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(totalPages, page));
    if (nextPage === currentPage || busy) return;
    setPagination((prev) => ({ ...prev, page: nextPage }));
    const el = document.getElementById('inventoryResultsGrid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="inventory-page">
      <HeroSmall />
      <section className="inventory-modern" aria-label="Inventory">
        <div className="inventory-shell-modern">
          <div className={`inventory-results-panel${effectiveViewMode === 'list' ? ' is-list-view' : ''}`}>
            <InventoryToolbar
              shownCount={shownCount}
              totalResults={totalCount}
              viewMode={effectiveViewMode}
              onViewModeChange={setViewMode}
              sort={filters.sort || 'newest'}
              onSortChange={handleSortChange}
              activeFilterCount={activeFilterCount}
              onToggleFilters={() => setIsFilterOpen((open) => !open)}
              filtersOpen={isFilterOpen}
              wishlistCount={wishlistCount}
            />

            {refreshing && vehicles.length > 0 ? (
              <div className="inventory-grid-status" role="status" aria-live="polite">
                Refreshing available vehicles...
              </div>
            ) : null}

            {loading && vehicles.length === 0 ? (
              <div className={`inventory-results-grid${effectiveViewMode === 'list' ? ' is-list-view' : ''}`}>
                {Array.from({ length: perPage }, (_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : error && vehicles.length === 0 ? (
              <div className="inventory-error" role="alert">
                <p>We couldn&apos;t load the vehicles right now.</p>
                <button type="button" className="inventory-error-retry" onClick={() => refetch()}>
                  Try again
                </button>
              </div>
            ) : showEmpty ? (
              <div className="inventory-empty-wrapper">
                <div className="inventory-empty" role="status" aria-live="polite">
                  <Clock className="inventory-empty-icon" size={56} strokeWidth={1.5} aria-hidden="true" />
                  <p className="inventory-empty-message">No vehicles match your current filters.</p>
                  <p className="inventory-empty-sub">Try widening your search, or clear the filters to see the full range.</p>
                </div>
              </div>
            ) : (
              <div
                id="inventoryResultsGrid"
                className={`inventory-results-grid${effectiveViewMode === 'list' ? ' is-list-view' : ''}`}
              >
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.reg} vehicle={vehicle} viewMode={effectiveViewMode} />
                ))}
              </div>
            )}

            {showPagination ? (
              <div className="inventory-pagination-wrap">
                <p className="inventory-pagination-summary">
                  Page {currentPage} of {totalPages}
                </p>
                <nav className="inventory-pagination" aria-label="Inventory pagination">
                  <button
                    type="button"
                    className="inventory-page-btn"
                    disabled={currentPage === 1 || busy}
                    aria-disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    <ChevronLeft size={14} aria-hidden="true" />
                    <span>Previous</span>
                  </button>

                  {paginationItems.map((item, index) =>
                    item === 'ellipsis' ? (
                      <span key={`ellipsis-${index}`} className="inventory-page-ellipsis" aria-hidden="true">…</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={item === currentPage ? 'inventory-page-btn is-active' : 'inventory-page-btn'}
                        aria-current={item === currentPage ? 'page' : undefined}
                        disabled={busy}
                        onClick={() => goToPage(item)}
                      >
                        {item}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    className="inventory-page-btn"
                    disabled={currentPage === totalPages || busy}
                    aria-disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    <span>Next</span>
                    <ChevronRight size={14} aria-hidden="true" />
                  </button>
                </nav>
              </div>
            ) : null}
          </div>
        </div>

        <InventoryFilterDrawer
          open={isFilterOpen}
          onOpen={() => setIsFilterOpen(true)}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          availableMakes={availableMakes}
          resultsCount={totalCount}
          activeFilterCount={activeFilterCount}
        />
      </section>
    </main>
  );
}
