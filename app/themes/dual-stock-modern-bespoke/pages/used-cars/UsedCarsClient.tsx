'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useGarage } from '../../context/GarageContext'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem, type InventoryMeta, type InventoryVehicle, type VehicleClass } from '../../lib/inventory'
import VehicleCard from '../../components/cards/VehicleCard'
import styles from './page.module.css'

type TypeFilter = 'all' | VehicleClass

const ITEMS_PER_PAGE = 12
const ALLOWED_SORTS = new Set(['newest', 'price-asc', 'price-desc', 'mileage'])

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean))).sort()

function mapSortToApi(sort: string) {
  if (sort === 'price-asc') return 'price_asc'
  if (sort === 'price-desc') return 'price_desc'
  if (sort === 'mileage') return 'mileage_asc'
  if (sort === 'newest') return 'newest'
  return 'price_desc'
}

function mapSortFromApi(value: string) {
  if (value === 'price_asc') return 'price-asc'
  if (value === 'price_desc') return 'price-desc'
  if (value === 'mileage_asc' || value === 'mileage') return 'mileage'
  if (value === 'newest') return 'newest'
  return 'price-desc'
}

export default function UsedCarsClient({
  initialVehicles,
  initialMeta,
}: {
  initialVehicles: InventoryVehicle[]
  initialMeta?: InventoryMeta | null
}) {
  const brand = useBrand()
  const garage = useGarage()
  const brandSlug = brand?.slug || ''
  const skipInitialFetchRef = useRef(Boolean(initialMeta || initialVehicles.length))
  const lastQueryRef = useRef<string | null>(null)

  const [vehicles, setVehicles] = useState<InventoryVehicle[]>(initialVehicles)
  const [meta, setMeta] = useState<InventoryMeta | null>(initialMeta ?? null)
  const [loading, setLoading] = useState(false)
  const [fetchedOnce, setFetchedOnce] = useState(Boolean(initialMeta || initialVehicles.length))
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false)

  // Filter state
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [search, setSearch] = useState('')
  const [make, setMake] = useState('All')
  const [body, setBody] = useState('All')
  const [fuel, setFuel] = useState('All')
  const [transmission, setTransmission] = useState('All')
  const [maxPrice, setMaxPrice] = useState('')
  const [minYear, setMinYear] = useState('')
  const [maxMileage, setMaxMileage] = useState('')
  const [sort, setSort] = useState('price-desc')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Init from URL
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const t = (params.get('type') || 'all').toLowerCase()
    if (t === 'car' || t === 'bike' || t === 'all') setTypeFilter(t as TypeFilter)
    setSearch(params.get('q') || '')
    setMake(params.get('make') || 'All')
    setBody(params.get('body') || 'All')
    setFuel(params.get('fuel') || 'All')
    setTransmission(params.get('transmission') || 'All')
    setMaxPrice(params.get('maxPrice') || params.get('max_price') || '')
    setMinYear(params.get('minYear') || params.get('min_year') || '')
    setMaxMileage(params.get('maxMileage') || params.get('max_mileage') || '')
    const s = mapSortFromApi(params.get('sort') || '')
    if (ALLOWED_SORTS.has(s)) setSort(s)
    const p = parseInt(params.get('page') || '1', 10)
    if (Number.isFinite(p) && p > 0) setPage(p)
    setHasInitializedFilters(true)
  }, [])

  // Fetch on filter change
  useEffect(() => {
    if (!hasInitializedFilters) return
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false
      setFetchedOnce(true)
      return
    }
    const controller = new AbortController()
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('per_page', String(ITEMS_PER_PAGE))
        params.set('light', '1')
        params.set('sort', mapSortToApi(sort))
        params.set('stock_status', 'in_stock')
        if (brandSlug) params.set('brand', brandSlug)
        if (search.trim()) params.set('q', search.trim())
        if (make !== 'All') params.set('make', make)
        if (body !== 'All') params.set('body', body)
        if (fuel !== 'All') params.set('fuel', fuel)
        if (transmission !== 'All') params.set('transmission', transmission)
        if (maxPrice) params.set('max_price', maxPrice)
        if (minYear) params.set('min_year', minYear)
        if (maxMileage) params.set('max_mileage', maxMileage)

        const query = params.toString()
        if (lastQueryRef.current === query) {
          setLoading(false)
          return
        }
        lastQueryRef.current = query

        const res = await fetch(apiUrl(`/inventory?${query}`), { signal: controller.signal, cache: 'no-store' })
        if (!res.ok) throw new Error('inventory-failed')
        const payload = await res.json()
        if (cancelled) return
        const raw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload?.vehicles) ? payload.vehicles : Array.isArray(payload) ? payload : []
        const normalised = raw.map((it: any) => normalizeInventoryItem(it)).filter(Boolean) as InventoryVehicle[]
        setVehicles(normalised)
        setMeta(payload?.meta ?? null)
      } catch {
        if (!cancelled) {
          setVehicles([])
          setMeta(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setFetchedOnce(true)
        }
      }
    }
    load()
    return () => { cancelled = true; controller.abort() }
  }, [hasInitializedFilters, brandSlug, page, sort, search, make, body, fuel, transmission, maxPrice, minYear, maxMileage])

  // Reflect filters to URL
  useEffect(() => {
    if (!hasInitializedFilters || typeof window === 'undefined') return
    const params = new URLSearchParams()
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (search.trim()) params.set('q', search.trim())
    if (make !== 'All') params.set('make', make)
    if (body !== 'All') params.set('body', body)
    if (fuel !== 'All') params.set('fuel', fuel)
    if (transmission !== 'All') params.set('transmission', transmission)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (minYear) params.set('minYear', minYear)
    if (maxMileage) params.set('maxMileage', maxMileage)
    if (sort !== 'price-desc') params.set('sort', mapSortToApi(sort))
    if (page > 1) params.set('page', String(page))
    const query = params.toString()
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname
    window.history.replaceState(null, '', nextUrl)
  }, [hasInitializedFilters, typeFilter, search, make, body, fuel, transmission, maxPrice, minYear, maxMileage, sort, page])

  // Drawer side-effects: lock body scroll + close on Escape while open
  useEffect(() => {
    if (!filtersOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFiltersOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [filtersOpen])

  // Client-side type filter (we fetch all stock — vehicleClass is normaliser-derived)
  const visibleVehicles = useMemo(() => {
    if (typeFilter === 'all') return vehicles
    return vehicles.filter((v) => v.vehicleClass === typeFilter)
  }, [vehicles, typeFilter])

  const availableMakes = useMemo(() => uniq(vehicles.map((v) => v.make)), [vehicles])
  const availableBodies = useMemo(() => uniq(vehicles.filter((v) => typeFilter === 'all' || v.vehicleClass === typeFilter).map((v) => v.body)), [vehicles, typeFilter])
  const availableFuels = useMemo(() => uniq(vehicles.map((v) => v.fuel)), [vehicles])
  const availableTrans = useMemo(() => uniq(vehicles.filter((v) => v.vehicleClass === 'car').map((v) => v.transmission)), [vehicles])

  const carCount = useMemo(() => vehicles.filter((v) => v.vehicleClass === 'car').length, [vehicles])
  const bikeCount = useMemo(() => vehicles.filter((v) => v.vehicleClass === 'bike').length, [vehicles])
  const totalResults = visibleVehicles.length

  const activeChips: string[] = []
  if (make !== 'All') activeChips.push(make)
  if (body !== 'All') activeChips.push(body)
  if (fuel !== 'All') activeChips.push(fuel)
  if (transmission !== 'All') activeChips.push(transmission)
  if (maxPrice) activeChips.push(`Under ${formatPrice(Number(maxPrice))}`)
  if (minYear) activeChips.push(`From ${minYear}`)
  if (maxMileage) activeChips.push(`Under ${Number(maxMileage).toLocaleString('en-GB')} mi`)
  if (search.trim()) activeChips.push(`"${search.trim()}"`)

  const resetFilters = () => {
    setMake('All'); setBody('All'); setFuel('All'); setTransmission('All')
    setMaxPrice(''); setMinYear(''); setMaxMileage('')
    setSearch(''); setSort('price-desc'); setPage(1)
  }

  return (
    <main className={styles.page}>
      <section className={`dual-page-hero dual-page-hero--used-cars ${styles.hero}`}>
        <div className="dual-page-hero__inner">
          <nav className="dual-page-hero__breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Browse stock</span>
          </nav>
          <h1 className="dual-page-hero__title">All stock</h1>
          <p className="dual-page-hero__lead">
            Browse our full inventory of cars and motorcycles — filter by type, make, body or budget.
          </p>
        </div>
      </section>

      <section className={styles.body}>
        <div className={styles.bodyInner}>
          <div className={styles.tabsBar} role="tablist" aria-label="Filter by vehicle type">
            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === 'all'}
              className={`${styles.tab} ${typeFilter === 'all' ? styles.tabActive : ''}`}
              onClick={() => { setTypeFilter('all'); setPage(1) }}
            >
              <span className={styles.tabLabel}>All stock</span>
              <span className={styles.tabCount}>{vehicles.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === 'car'}
              className={`${styles.tab} ${typeFilter === 'car' ? styles.tabActive : ''}`}
              onClick={() => { setTypeFilter('car'); setPage(1); setBody('All') }}
            >
              <span className={styles.tabLabel}>Cars</span>
              <span className={styles.tabCount}>{carCount}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={typeFilter === 'bike'}
              className={`${styles.tab} ${typeFilter === 'bike' ? styles.tabActive : ''}`}
              onClick={() => { setTypeFilter('bike'); setPage(1); setBody('All') }}
            >
              <span className={styles.tabLabel}>Bikes</span>
              <span className={styles.tabCount}>{bikeCount}</span>
            </button>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchRow}>
              <span className={styles.searchIcon} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder='Make, model, "BMW 320d" or "Yamaha R1"...'
                className={styles.searchInput}
                aria-label="Keyword search"
              />
            </div>
            <div className={styles.toolbarRight}>
              <label className={styles.sortChip}>
                <span>Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort by"
                >
                  <option value="price-desc">Price ↓</option>
                  <option value="price-asc">Price ↑</option>
                  <option value="mileage">Mileage ↑</option>
                  <option value="newest">Newest first</option>
                </select>
              </label>
              <button
                type="button"
                className={styles.filterToggle}
                onClick={() => setFiltersOpen((o) => !o)}
                aria-expanded={filtersOpen}
                aria-controls="dual-filters"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
                  <circle cx="8" cy="6" r="2" fill="currentColor"/><circle cx="16" cy="12" r="2" fill="currentColor"/><circle cx="10" cy="18" r="2" fill="currentColor"/>
                </svg>
                Filters{activeChips.length > 0 && <span className={styles.filterDot}>{activeChips.length}</span>}
              </button>
              <Link href="/compare" className={styles.compareCount}>
                Compare ({garage.compareCount})
              </Link>
              <Link href="/wishlist" className={styles.wishlistCount}>
                Wishlist ({garage.wishlistCount})
              </Link>
            </div>
          </div>

          {filtersOpen && (
            <button
              type="button"
              className={styles.filtersBackdrop}
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
            />
          )}

          <div className={styles.layout}>
            <aside
              id="dual-filters"
              className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ''}`}
              aria-label="Inventory filters"
              aria-hidden={!filtersOpen}
            >
              <div className={styles.filtersHead}>
                <h2>Filters</h2>
                <div className={styles.filtersHeadActions}>
                  <button type="button" onClick={resetFilters} className={styles.resetBtn}>Reset</button>
                  <button
                    type="button"
                    onClick={() => setFiltersOpen(false)}
                    className={styles.filtersClose}
                    aria-label="Close filters"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className={styles.filtersBody}>
              <Field label="Make">
                <select value={make} onChange={(e) => { setMake(e.target.value); setPage(1) }} className="dual-select">
                  <option value="All">Any make</option>
                  {availableMakes.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>

              <Field label={typeFilter === 'bike' ? 'Bike body' : typeFilter === 'car' ? 'Body type' : 'Body / type'}>
                <select value={body} onChange={(e) => { setBody(e.target.value); setPage(1) }} className="dual-select">
                  <option value="All">Any</option>
                  {availableBodies.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>

              <Field label="Fuel">
                <select value={fuel} onChange={(e) => { setFuel(e.target.value); setPage(1) }} className="dual-select">
                  <option value="All">Any fuel</option>
                  {availableFuels.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </Field>

              {typeFilter !== 'bike' && (
                <Field label="Transmission">
                  <select value={transmission} onChange={(e) => { setTransmission(e.target.value); setPage(1) }} className="dual-select">
                    <option value="All">Any</option>
                    {availableTrans.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              )}

              <Field label="Max price">
                <select value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1) }} className="dual-select">
                  <option value="">Any price</option>
                  <option value="3000">Under £3,000</option>
                  <option value="6000">Under £6,000</option>
                  <option value="10000">Under £10,000</option>
                  <option value="20000">Under £20,000</option>
                  <option value="40000">Under £40,000</option>
                </select>
              </Field>

              <Field label="Min year">
                <select value={minYear} onChange={(e) => { setMinYear(e.target.value); setPage(1) }} className="dual-select">
                  <option value="">Any year</option>
                  <option value="2024">2024+</option>
                  <option value="2020">2020+</option>
                  <option value="2015">2015+</option>
                  <option value="2010">2010+</option>
                </select>
              </Field>

              <Field label="Max mileage">
                <input
                  type="number"
                  inputMode="numeric"
                  value={maxMileage}
                  onChange={(e) => { setMaxMileage(e.target.value); setPage(1) }}
                  placeholder="e.g. 40000"
                  className="dual-input"
                />
              </Field>
              </div>

              <div className={styles.filtersFoot}>
                <button
                  type="button"
                  className="dual-btn dual-btn--primary"
                  onClick={() => setFiltersOpen(false)}
                >
                  Show {totalResults} {totalResults === 1 ? 'result' : 'results'}
                </button>
              </div>
            </aside>

            <div className={styles.results}>
              <div className={styles.resultsHead}>
                <span className={styles.count}>
                  {fetchedOnce ? `${totalResults} ${typeFilter === 'bike' ? 'bikes' : typeFilter === 'car' ? 'cars' : 'vehicles'} found` : 'Loading stock…'}
                </span>
                {activeChips.length > 0 && (
                  <ul className={styles.chipList} aria-label="Active filters">
                    {activeChips.map((c) => <li key={c}>{c}</li>)}
                  </ul>
                )}
              </div>

              {loading && vehicles.length === 0 ? (
                <div className={styles.grid}>
                  {Array.from({ length: 6 }).map((_, i) => <div key={i} className={styles.skel} aria-hidden="true" />)}
                </div>
              ) : visibleVehicles.length === 0 ? (
                <div className={styles.empty}>
                  <h3>No {typeFilter === 'bike' ? 'bikes' : typeFilter === 'car' ? 'cars' : 'vehicles'} match your filters.</h3>
                  <p>Try resetting filters or <Link href="/contact">tell us what you're after</Link> — we'll source it.</p>
                  <button type="button" className="dual-btn dual-btn--primary" onClick={resetFilters}>Reset filters</button>
                </div>
              ) : (
                <div className={styles.grid}>
                  {visibleVehicles.map((v, idx) => (
                    <div key={v.id} data-aos="fade-up" data-aos-delay={Math.min(idx * 60, 360)}>
                      <VehicleCard vehicle={v} />
                    </div>
                  ))}
                </div>
              )}

              <Pagination
                page={page}
                totalPages={meta?.totalPages || 1}
                onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  )
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null
  const items: Array<number | '…'> = []
  const left = Math.max(2, page - 1)
  const right = Math.min(totalPages - 1, page + 1)
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) items.push(i)
  } else {
    items.push(1)
    if (left > 2) items.push('…')
    for (let i = left; i <= right; i++) items.push(i)
    if (right < totalPages - 1) items.push('…')
    items.push(totalPages)
  }
  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
      >
        ←
      </button>
      {items.map((it, i) => it === '…' ? (
        <span key={`e-${i}`} className={styles.pageEllipsis}>…</span>
      ) : (
        <button
          key={it}
          type="button"
          onClick={() => onChange(it)}
          aria-current={it === page ? 'page' : undefined}
          className={it === page ? styles.pageActive : ''}
        >
          {it}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  )
}
