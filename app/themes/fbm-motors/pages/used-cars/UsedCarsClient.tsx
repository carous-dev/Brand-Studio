'use client'

import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react'
import { cars, carToVehicle } from '../../lib/cars'
import type { InventoryVehicle, InventoryMeta } from '../../lib/inventory'
import InventoryCard from '../../components/InventoryCard'

type ViewMode = 'grid' | 'list'
type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'mileage-asc'

const VIEW_MODE_STORAGE_KEY = 'vp-inventory-view-mode'
const PER_PAGE = 12

const sorts: Record<SortKey, (a: InventoryVehicle, b: InventoryVehicle) => number> = {
  newest: (a, b) => b.year - a.year,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'mileage-asc': (a, b) => a.mileage - b.mileage,
}

const SORT_LABELS: Array<{ value: SortKey; label: string }> = [
  { value: 'newest', label: 'Latest arrivals' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'mileage-asc', label: 'Lowest mileage' },
]

const GEARBOXES = ['Manual', 'Automatic']
const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric']
const PRICE_BANDS = [5000, 10000, 15000, 20000, 30000, 50000]
const MILEAGE_BANDS = [25000, 50000, 75000, 100000, 150000]

const uniqueValues = (items: InventoryVehicle[], key: keyof InventoryVehicle): string[] =>
  Array.from(
    new Set(items.map((item) => String(item[key] ?? '').trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b))

/** Map a normalised InventoryVehicle onto the shape InventoryCard expects. */
function toCardVehicle(v: InventoryVehicle) {
  return {
    reg: v.reg || v.slug || v.id,
    slug: v.slug,
    make: v.make,
    model: v.model,
    derivative: v.derivative,
    year: v.year || undefined,
    price: v.price || undefined,
    mileage: v.mileage || undefined,
    image: v.image,
    images: v.image ? [v.image] : undefined,
    fuel: v.fuel,
    transmission: v.transmission,
    body_type: v.body,
    colour: v.color,
  }
}

export type UsedCarsClientProps = {
  initialVehicles?: InventoryVehicle[]
  initialMeta?: InventoryMeta | null
}

export default function UsedCarsClient({ initialVehicles }: UsedCarsClientProps) {
  // Real inventory takes precedence; fall back to the seed list so the page
  // still demonstrates the layout for preview brands with no live feed.
  const allVehicles: InventoryVehicle[] = useMemo(() => {
    if (initialVehicles && initialVehicles.length > 0) return initialVehicles
    return cars.map(carToVehicle)
  }, [initialVehicles])

  const makeOptions = useMemo(() => uniqueValues(allVehicles, 'make'), [allVehicles])
  const bodyOptions = useMemo(() => uniqueValues(allVehicles, 'body'), [allVehicles])
  const fuelOptions = useMemo(() => {
    const found = uniqueValues(allVehicles, 'fuel')
    return found.length > 0 ? found : FUELS
  }, [allVehicles])

  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [body, setBody] = useState('')
  const [fuel, setFuel] = useState('')
  const [gearbox, setGearbox] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [maxMileage, setMaxMileage] = useState('')
  const [sort, setSort] = useState<SortKey>('newest')
  const [view, setView] = useState<ViewMode>('grid')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  // Model options depend on the selected make.
  const modelOptions = useMemo(
    () => uniqueValues(make ? allVehicles.filter((v) => v.make === make) : allVehicles, 'model'),
    [allVehicles, make],
  )

  // Restore the saved view preference (matches carous-platform behaviour).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY)
      if (stored === 'list' || stored === 'grid') setView(stored)
    } catch {
      /* storage blocked — keep default */
    }
  }, [])

  function changeView(next: ViewMode) {
    setView(next)
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }

  const results = useMemo(() => {
    const priceCap = Number(maxPrice) || 0
    const mileageCap = Number(maxMileage) || 0
    return allVehicles
      .filter(
        (v) =>
          (!make || v.make === make) &&
          (!model || v.model === model) &&
          (!body || v.body === body) &&
          (!fuel || v.fuel === fuel) &&
          (!gearbox || v.transmission === gearbox) &&
          (!priceCap || v.price <= priceCap) &&
          (!mileageCap || v.mileage <= mileageCap),
      )
      .slice()
      .sort(sorts[sort])
  }, [allVehicles, make, model, body, fuel, gearbox, maxPrice, maxMileage, sort])

  const activeFilterCount =
    [make, model, body, fuel, gearbox, maxPrice, maxMileage].filter(Boolean).length

  const totalPages = Math.max(1, Math.ceil(results.length / PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = results.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  // Reset to page one whenever the result set changes.
  useEffect(() => {
    setPage(1)
  }, [make, model, body, fuel, gearbox, maxPrice, maxMileage, sort])

  function goToPage(next: number) {
    const clamped = Math.min(Math.max(1, next), totalPages)
    setPage(clamped)
    if (typeof document !== 'undefined') {
      document.getElementById('inventoryResultsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function resetFilters() {
    setMake('')
    setModel('')
    setBody('')
    setFuel('')
    setGearbox('')
    setMaxPrice('')
    setMaxMileage('')
  }

  const pageNumbers = useMemo(() => getPaginationItems(currentPage, totalPages), [currentPage, totalPages])

  return (
    <div className="used-page">
      <section className="inventory-modern container">
        <div className="inventory-shell-modern no-filters">
          <div className={`inventory-results-panel inventory-content${view === 'list' ? ' is-list-view' : ''}`}>
            {/* Toolbar */}
            <div className="inventory-results-toolbar">
              <div className="inventory-toolbar-lead">
                <button
                  type="button"
                  className={`inventory-filters-toggle${filtersOpen ? ' is-open' : ''}`}
                  aria-expanded={filtersOpen}
                  aria-controls="inventoryFilterDrawer"
                  onClick={() => setFiltersOpen((open) => !open)}
                >
                  <SlidersHorizontal size={16} aria-hidden="true" />
                  Filters
                  {activeFilterCount > 0 && <strong>{activeFilterCount}</strong>}
                </button>
                <p className="inventory-results-count" aria-live="polite">
                  Showing <strong>{results.length}</strong> of <strong>{allVehicles.length}</strong> vehicles
                </p>
              </div>

              <div className="inventory-toolbar-controls">
                <div className="inventory-view-toggle" role="group" aria-label="Inventory view mode">
                  <button
                    type="button"
                    className={`inventory-view-btn${view === 'grid' ? ' is-active' : ''}`}
                    aria-pressed={view === 'grid'}
                    onClick={() => changeView('grid')}
                  >
                    <LayoutGrid size={14} aria-hidden="true" /> Grid
                  </button>
                  <button
                    type="button"
                    className={`inventory-view-btn${view === 'list' ? ' is-active' : ''}`}
                    aria-pressed={view === 'list'}
                    onClick={() => changeView('list')}
                  >
                    <List size={14} aria-hidden="true" /> List
                  </button>
                </div>

                <div className="inventory-sort-block">
                  <label htmlFor="inventory-sort">Sort by</label>
                  <select
                    id="inventory-sort"
                    className="inventory-sort-select"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                  >
                    {SORT_LABELS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Collapsible filter drawer */}
            <div
              id="inventoryFilterDrawer"
              className={`inventory-filter-drawer${filtersOpen ? ' is-open' : ''}`}
              hidden={!filtersOpen}
            >
              <div className="inventory-filter-drawer-grid">
                <FilterField id="d-make" label="Make">
                  <select id="d-make" value={make} onChange={(e) => { setMake(e.target.value); setModel('') }}>
                    <option value="">All makes</option>
                    {makeOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </FilterField>
                <FilterField id="d-model" label="Model">
                  <select id="d-model" value={model} onChange={(e) => setModel(e.target.value)}>
                    <option value="">All models</option>
                    {modelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </FilterField>
                <FilterField id="d-body" label="Body">
                  <select id="d-body" value={body} onChange={(e) => setBody(e.target.value)}>
                    <option value="">Any body</option>
                    {bodyOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </FilterField>
                <FilterField id="d-fuel" label="Fuel">
                  <select id="d-fuel" value={fuel} onChange={(e) => setFuel(e.target.value)}>
                    <option value="">Any fuel</option>
                    {fuelOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </FilterField>
                <FilterField id="d-gearbox" label="Gearbox">
                  <select id="d-gearbox" value={gearbox} onChange={(e) => setGearbox(e.target.value)}>
                    <option value="">Any gearbox</option>
                    {GEARBOXES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </FilterField>
                <FilterField id="d-price" label="Max price">
                  <select id="d-price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
                    <option value="">No limit</option>
                    {PRICE_BANDS.map((p) => <option key={p} value={p}>Up to £{p.toLocaleString('en-GB')}</option>)}
                  </select>
                </FilterField>
                <FilterField id="d-mileage" label="Max mileage">
                  <select id="d-mileage" value={maxMileage} onChange={(e) => setMaxMileage(e.target.value)}>
                    <option value="">No limit</option>
                    {MILEAGE_BANDS.map((m) => <option key={m} value={m}>Up to {m.toLocaleString('en-GB')} mi</option>)}
                  </select>
                </FilterField>
              </div>
              <div className="inventory-filter-drawer-foot">
                <button type="button" className="inventory-filter-clear-btn" onClick={resetFilters} disabled={activeFilterCount === 0}>
                  <X size={15} aria-hidden="true" /> Clear filters
                </button>
              </div>
            </div>

            {/* Results */}
            {pageItems.length > 0 ? (
              <div
                id="inventoryResultsGrid"
                className={`inventory-results-grid${view === 'list' ? ' is-list-view' : ''}`}
              >
                {pageItems.map((vehicle) => (
                  <InventoryCard key={vehicle.id} vehicle={toCardVehicle(vehicle)} viewMode={view} />
                ))}
              </div>
            ) : (
              <div className="inventory-empty-wrapper">
                <div className="inventory-empty" role="status" aria-live="polite">
                  <p className="inventory-empty-message">No cars match those filters</p>
                  <p className="inventory-empty-sub">
                    Try removing a filter, or tell us what you&apos;re after and we&apos;ll source it.
                  </p>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="inventory-pagination-wrap">
                <p className="inventory-pagination-summary">Page {currentPage} of {totalPages}</p>
                <nav className="inventory-pagination" aria-label="Inventory pagination">
                  <button
                    type="button"
                    className="inventory-page-btn inventory-page-nav"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </button>
                  {pageNumbers.map((item, index) =>
                    item === '…' ? (
                      <span key={`gap-${index}`} className="inventory-page-ellipsis" aria-hidden="true">…</span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={`inventory-page-btn${item === currentPage ? ' is-active' : ''}`}
                        aria-current={item === currentPage ? 'page' : undefined}
                        onClick={() => goToPage(item as number)}
                      >
                        {item}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    className="inventory-page-btn inventory-page-nav"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function FilterField({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="inventory-filter-field">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  )
}

/** First/last/current±1 with collapsed gaps, matching the carous-platform pattern. */
function getPaginationItems(current: number, total: number): Array<number | '…'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = Array.from(pages).filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: Array<number | '…'> = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) out.push('…')
    out.push(p)
    prev = p
  }
  return out
}
