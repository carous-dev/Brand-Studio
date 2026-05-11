"use client"

import { useMemo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Car,
  ChevronLeft,
  ChevronRight,
  Filter,
  Fuel,
  Gauge,
  GitCompare,
  Heart,
  MapPin,
  Palette,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import styles from './page.module.css'
import { useGarage, type SavedVehicle } from '../../context/GarageContext'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem, type InventoryMeta, type InventoryVehicle } from '../../lib/inventory'
import { buildVehiclePermalink } from '../../lib/vehicle-links'

type Vehicle = InventoryVehicle

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

const uniqueValues = (items: Vehicle[], key: keyof Vehicle) =>
  Array.from(new Set(items.map((item) => String(item[key] ?? '').trim()).filter(Boolean))).sort()

const getBounds = (items: Vehicle[], key: keyof Vehicle) => {
  if (!items.length) return null
  const values = items.map((item) => Number(item[key])).filter((v) => Number.isFinite(v))
  if (!values.length) return null
  return { min: Math.min(...values), max: Math.max(...values) }
}

const ITEMS_PER_PAGE = 12

function mapSortToApi(value: string) {
  switch (value) {
    case 'price-asc': return 'price_asc'
    case 'price-desc': return 'price_desc'
    case 'mileage': return 'mileage_asc'
    case 'newest': return 'newest'
    default: return 'price_desc'
  }
}

function mapSortFromApi(value: string) {
  switch (value) {
    case 'price_asc':
    case 'price-asc': return 'price-asc'
    case 'price_desc':
    case 'price-desc': return 'price-desc'
    case 'mileage_asc':
    case 'mileage': return 'mileage'
    case 'newest': return 'newest'
    default: return 'price-desc'
  }
}

const toSavedVehicle = (vehicle: Vehicle): SavedVehicle => ({
  id: vehicle.id,
  title: vehicle.title,
  slug: vehicle.slug,
  reg: vehicle.reg,
  year: vehicle.year,
  price: vehicle.price,
  mileage: vehicle.mileage,
  fuel: vehicle.fuel,
  transmission: vehicle.transmission,
  body: vehicle.body,
  make: vehicle.make,
  color: vehicle.color,
  doors: vehicle.doors,
  location: vehicle.location,
  image: vehicle.image,
})

export default function UsedCarsClient({
  initialVehicles,
  initialMeta,
}: {
  initialVehicles: Vehicle[]
  initialMeta?: InventoryMeta | null
}) {
  const { toggleWishlist, toggleCompare, isWishlisted, isCompared } = useGarage()
  const brand = useBrand()
  const brandSlug = (brand?.slug || '').trim()
  const town =
    (brand?.location?.address as any)?.city ||
    (brand?.location?.address as any)?.town ||
    'Chesterfield'

  const skipInitialFetchRef = useRef(Boolean(initialMeta || initialVehicles.length))
  const skipPageResetRef = useRef({ skip: true, suppressNext: false, initialUrlParams: new Set<string>() })
  const lastQueryRef = useRef<string | null>(null)

  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles)
  const [inventoryMeta, setInventoryMeta] = useState<InventoryMeta | null>(initialMeta ?? null)
  const [loading, setLoading] = useState(false)
  const [fetchedOnce, setFetchedOnce] = useState(Boolean(initialMeta || initialVehicles.length))
  const initialPerPage = ITEMS_PER_PAGE
  const [perPage, setPerPage] = useState(initialPerPage)

  const initialAvailableMakes = useMemo(() => {
    const m = Array.isArray(initialMeta?.available?.makes) ? initialMeta.available.makes.filter(Boolean) : []
    return m.length ? m : uniqueValues(initialVehicles, 'make')
  }, [initialMeta, initialVehicles])
  const initialAvailableBodies = useMemo(() => {
    const m = Array.isArray(initialMeta?.available?.body_types) ? initialMeta.available.body_types.filter(Boolean) : []
    return m.length ? m : uniqueValues(initialVehicles, 'body')
  }, [initialMeta, initialVehicles])
  const initialAvailableFuels = useMemo(() => {
    const m = Array.isArray(initialMeta?.available?.fuel_types) ? initialMeta.available.fuel_types.filter(Boolean) : []
    return m.length ? m : uniqueValues(initialVehicles, 'fuel')
  }, [initialMeta, initialVehicles])

  const [availableMakes, setAvailableMakes] = useState<string[]>(initialAvailableMakes)
  const [availableBodies, setAvailableBodies] = useState<string[]>(initialAvailableBodies)
  const [availableFuels, setAvailableFuels] = useState<string[]>(initialAvailableFuels)

  const initialPriceBounds = useMemo(() => getBounds(initialVehicles, 'price'), [initialVehicles])
  const initialYearBounds = useMemo(() => getBounds(initialVehicles, 'year'), [initialVehicles])
  const [priceBounds, setPriceBounds] = useState(initialPriceBounds ?? { min: 0, max: 0 })
  const [yearBounds, setYearBounds] = useState(initialYearBounds ?? { min: 0, max: 0 })

  useEffect(() => {
    if (!vehicles.length) return
    if (priceBounds.min === 0 && priceBounds.max === 0) {
      const next = getBounds(vehicles, 'price')
      if (next) setPriceBounds(next)
    }
    if (yearBounds.min === 0 && yearBounds.max === 0) {
      const next = getBounds(vehicles, 'year')
      if (next) setYearBounds(next)
    }
  }, [vehicles, priceBounds, yearBounds])

  const initialSort = initialMeta?.sort ? mapSortFromApi(initialMeta.sort) : 'price-desc'
  const [search, setSearch] = useState('')
  const [make, setMake] = useState('All')
  const [body, setBody] = useState('All')
  const [fuel, setFuel] = useState('All')
  const [transmission, setTransmission] = useState('All')
  const [minPrice, setMinPrice] = useState(priceBounds.min)
  const [maxPrice, setMaxPrice] = useState(priceBounds.max)
  const [minYear, setMinYear] = useState(yearBounds.min)
  const [maxYear, setMaxYear] = useState(yearBounds.max)
  const [maxMileage, setMaxMileage] = useState('')
  const [sort, setSort] = useState(initialSort)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(() => {
    if (typeof initialMeta?.totalPages === 'number') return Math.max(1, initialMeta.totalPages)
    return Math.max(1, Math.ceil(initialVehicles.length / initialPerPage))
  })
  const [totalResults, setTotalResults] = useState(
    typeof initialMeta?.total === 'number' ? initialMeta.total : initialVehicles.length,
  )

  useEffect(() => {
    if (!vehicles.length) return
    const nextPriceBounds = getBounds(vehicles, 'price')
    const nextYearBounds = getBounds(vehicles, 'year')
    if (nextPriceBounds) {
      const hasFilter = minPrice !== priceBounds.min || maxPrice !== priceBounds.max
      const mergedMin = priceBounds.min === 0 ? nextPriceBounds.min : Math.min(priceBounds.min, nextPriceBounds.min)
      const mergedMax = Math.max(priceBounds.max, nextPriceBounds.max)
      if (mergedMin !== priceBounds.min || mergedMax !== priceBounds.max) {
        skipPageResetRef.current.suppressNext = true
        setPriceBounds({ min: mergedMin, max: mergedMax })
        if (!hasFilter) { setMinPrice(mergedMin); setMaxPrice(mergedMax) }
      }
    }
    if (nextYearBounds) {
      const hasFilter = minYear !== yearBounds.min || maxYear !== yearBounds.max
      const mergedMin = yearBounds.min === 0 ? nextYearBounds.min : Math.min(yearBounds.min, nextYearBounds.min)
      const mergedMax = Math.max(yearBounds.max, nextYearBounds.max)
      if (mergedMin !== yearBounds.min || mergedMax !== yearBounds.max) {
        skipPageResetRef.current.suppressNext = true
        setYearBounds({ min: mergedMin, max: mergedMax })
        if (!hasFilter) { setMinYear(mergedMin); setMaxYear(mergedMax) }
      }
    }
  }, [vehicles, minPrice, maxPrice, minYear, maxYear, priceBounds, yearBounds])

  const makes = useMemo(() => ['All', ...availableMakes], [availableMakes])
  const bodies = useMemo(() => ['All', ...availableBodies], [availableBodies])
  const fuels = useMemo(() => ['All', ...availableFuels], [availableFuels])
  const transmissions = useMemo(
    () => ['All', ...uniqueValues(vehicles.length ? vehicles : initialVehicles, 'transmission')],
    [vehicles, initialVehicles],
  )
  const sortOptions = useMemo(() => ['newest', 'price-asc', 'price-desc', 'mileage'], [])

  // URL hydration
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const params = new URLSearchParams(window.location.search)
      const nextSearch = params.get('q') || ''
      const nextMake = params.get('make') || 'All'
      const nextBody = params.get('body') || 'All'
      const nextFuel = params.get('fuel') || 'All'
      const nextTrans = params.get('transmission')
      const nextMaxMileage = params.get('max_mileage') || ''
      const nextSort = mapSortFromApi(params.get('sort') || '')
      const nextPage = Math.max(1, parseInt(params.get('page') || '1', 10) || 1)

      skipPageResetRef.current.initialUrlParams = new Set(Array.from(params.keys()))

      setSearch((prev) => (prev === nextSearch ? prev : nextSearch))
      setMake((prev) => (prev === nextMake ? prev : nextMake))
      setBody((prev) => (prev === nextBody ? prev : nextBody))
      setFuel((prev) => (prev === nextFuel ? prev : nextFuel))
      if (nextTrans) setTransmission((prev) => (prev === nextTrans ? prev : nextTrans))
      if (params.get('min_price')) {
        const v = Number(params.get('min_price'))
        if (Number.isFinite(v)) setMinPrice(v)
      }
      if (params.get('max_price')) {
        const v = Number(params.get('max_price'))
        if (Number.isFinite(v)) setMaxPrice(v)
      }
      if (params.get('min_year')) {
        const v = Number(params.get('min_year'))
        if (Number.isFinite(v)) setMinYear(v)
      }
      if (params.get('max_year')) {
        const v = Number(params.get('max_year'))
        if (Number.isFinite(v)) setMaxYear(v)
      }
      setMaxMileage((prev) => (prev === nextMaxMileage ? prev : nextMaxMileage))
      setSort((prev) => (prev === nextSort || !sortOptions.includes(nextSort) ? prev : nextSort))
      setPage((prev) => (prev === nextPage ? prev : nextPage))
      setHasInitializedFilters(true)
    } catch {
      setHasInitializedFilters(true)
    }
  }, [])

  // Brand-scoped fetch
  useEffect(() => {
    if (!hasInitializedFilters) return
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false
      setFetchedOnce(true)
      return
    }

    let aborted = false
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('per_page', String(perPage))
        params.set('light', '1')
        params.set('sort', mapSortToApi(sort))
        if (search.trim()) params.set('q', search.trim())
        if (make !== 'All') params.set('make', make)
        if (body !== 'All') params.set('body', body)
        if (fuel !== 'All') params.set('fuel', fuel)
        if (transmission !== 'All') params.set('transmission', transmission)
        if (minPrice > priceBounds.min) params.set('min_price', String(minPrice))
        if (priceBounds.max > 0 && maxPrice < priceBounds.max) params.set('max_price', String(maxPrice))
        if (minYear > yearBounds.min) params.set('min_year', String(minYear))
        if (yearBounds.max > 0 && maxYear < yearBounds.max) params.set('max_year', String(maxYear))
        if (maxMileage) params.set('max_mileage', maxMileage)
        params.set('vehicle_type', 'car')
        params.set('stock_status', 'in_stock')
        if (brandSlug) params.set('brand', brandSlug)

        const query = params.toString()
        if (lastQueryRef.current === query) {
          setLoading(false)
          return
        }
        lastQueryRef.current = query

        const res = await fetch(apiUrl(`/inventory?${query}`), {
          signal: controller.signal,
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('Failed to fetch inventory')
        const payload = await res.json()
        if (aborted) return

        const nextItems = Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.vehicles)
            ? payload.vehicles
            : Array.isArray(payload?.data)
              ? payload.data
              : Array.isArray(payload)
                ? payload
                : []
        const normalized = nextItems
          .map((item: any) => normalizeInventoryItem(item))
          .filter(Boolean) as Vehicle[]

        setVehicles(normalized)
        setInventoryMeta(payload?.meta ?? null)
        setTotalResults(typeof payload?.meta?.total === 'number' ? payload.meta.total : normalized.length)
        setTotalPages(typeof payload?.meta?.totalPages === 'number' ? Math.max(1, payload.meta.totalPages) : 1)

        const metaMakes = Array.isArray(payload?.meta?.available?.makes) ? payload.meta.available.makes.filter(Boolean) : []
        const metaBodies = Array.isArray(payload?.meta?.available?.body_types) ? payload.meta.available.body_types.filter(Boolean) : []
        const metaFuels = Array.isArray(payload?.meta?.available?.fuel_types) ? payload.meta.available.fuel_types.filter(Boolean) : []

        setAvailableMakes(metaMakes.length ? metaMakes : uniqueValues(normalized, 'make'))
        setAvailableBodies(metaBodies.length ? metaBodies : uniqueValues(normalized, 'body'))
        setAvailableFuels(metaFuels.length ? metaFuels : uniqueValues(normalized, 'fuel'))
      } catch {
        if (!aborted) {
          setVehicles([])
          setInventoryMeta(null)
          setTotalResults(0)
          setTotalPages(1)
        }
      } finally {
        if (!aborted) {
          setLoading(false)
          setFetchedOnce(true)
        }
      }
    }
    load()

    return () => {
      aborted = true
      controller.abort()
    }
  }, [hasInitializedFilters, page, search, make, body, fuel, transmission,
      minPrice, maxPrice, minYear, maxYear, maxMileage, sort, priceBounds,
      yearBounds, perPage, brandSlug])

  // URL sync
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !hasInitializedFilters) return
      const params = new URLSearchParams()
      const defaultSort = 'price-desc'
      if (sort !== defaultSort || skipPageResetRef.current.initialUrlParams.has('sort')) {
        params.set('sort', mapSortToApi(sort))
      }
      if (perPage !== ITEMS_PER_PAGE || skipPageResetRef.current.initialUrlParams.has('per_page')) {
        params.set('per_page', String(perPage))
      }
      if (search.trim()) params.set('q', search.trim())
      if (make !== 'All') params.set('make', make)
      if (body !== 'All') params.set('body', body)
      if (fuel !== 'All') params.set('fuel', fuel)
      if (transmission !== 'All') params.set('transmission', transmission)
      if (minPrice > priceBounds.min) params.set('min_price', String(minPrice))
      if (priceBounds.max > 0 && maxPrice < priceBounds.max) params.set('max_price', String(maxPrice))
      if (minYear > yearBounds.min) params.set('min_year', String(minYear))
      if (yearBounds.max > 0 && maxYear < yearBounds.max) params.set('max_year', String(maxYear))
      if (maxMileage) params.set('max_mileage', maxMileage)
      if (page > 1) params.set('page', String(page))
      const query = params.toString()
      if (!query && skipPageResetRef.current.initialUrlParams.size === 0) return
      const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname
      window.history.replaceState(null, '', nextUrl)
    } catch {
      /* ignore */
    }
  }, [hasInitializedFilters, page, perPage, sort, search, make, body, fuel,
      transmission, minPrice, maxPrice, minYear, maxYear, maxMileage,
      priceBounds, yearBounds])

  // Reset page on filter change
  useEffect(() => {
    if (!hasInitializedFilters) return
    if (skipPageResetRef.current.skip) {
      skipPageResetRef.current.skip = false
      return
    }
    if (skipPageResetRef.current.suppressNext) {
      skipPageResetRef.current.suppressNext = false
      return
    }
    setPage(1)
  }, [search, make, body, fuel, transmission, minPrice, maxPrice, minYear, maxYear, maxMileage, sort, hasInitializedFilters])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const maxMileageValue = maxMileage ? Number(maxMileage) : null
    const list = vehicles.filter((v) => {
      if (normalizedSearch && !v.title.toLowerCase().includes(normalizedSearch)) return false
      if (make !== 'All' && v.make !== make) return false
      if (body !== 'All' && v.body !== body) return false
      if (fuel !== 'All' && v.fuel !== fuel) return false
      if (transmission !== 'All' && v.transmission !== transmission) return false
      if (v.price < minPrice || v.price > maxPrice) return false
      if (v.year < minYear || v.year > maxYear) return false
      if (maxMileageValue !== null && v.mileage > maxMileageValue) return false
      return true
    })
    return list.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'mileage') return a.mileage - b.mileage
      if (sort === 'newest') return b.year - a.year
      return 0
    })
  }, [search, make, body, fuel, transmission, minPrice, maxPrice, minYear, maxYear, maxMileage, sort, vehicles])

  const paginationItems = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const items: Array<number | '...'> = []
    const left = Math.max(2, page - 1)
    const right = Math.min(totalPages - 1, page + 1)
    items.push(1)
    if (left > 2) items.push('...')
    for (let i = left; i <= right; i += 1) items.push(i)
    if (right < totalPages - 1) items.push('...')
    items.push(totalPages)
    return items
  }, [page, totalPages])

  const activeFilters = useMemo(() => {
    const chips: Array<{ label: string; clear: () => void }> = []
    if (make !== 'All') chips.push({ label: `Make: ${make}`, clear: () => setMake('All') })
    if (body !== 'All') chips.push({ label: `Body: ${body}`, clear: () => setBody('All') })
    if (fuel !== 'All') chips.push({ label: `Fuel: ${fuel}`, clear: () => setFuel('All') })
    if (transmission !== 'All') chips.push({ label: `Trans: ${transmission}`, clear: () => setTransmission('All') })
    if (minPrice > priceBounds.min || (priceBounds.max > 0 && maxPrice < priceBounds.max)) {
      chips.push({
        label: `${formatPrice(minPrice)}–${formatPrice(maxPrice)}`,
        clear: () => { setMinPrice(priceBounds.min); setMaxPrice(priceBounds.max) },
      })
    }
    if (minYear > yearBounds.min || (yearBounds.max > 0 && maxYear < yearBounds.max)) {
      chips.push({
        label: `${minYear}–${maxYear}`,
        clear: () => { setMinYear(yearBounds.min); setMaxYear(yearBounds.max) },
      })
    }
    if (maxMileage) chips.push({ label: `< ${Number(maxMileage).toLocaleString()} mi`, clear: () => setMaxMileage('') })
    if (search.trim()) chips.push({ label: `“${search.trim()}”`, clear: () => setSearch('') })
    return chips
  }, [make, body, fuel, transmission, minPrice, maxPrice, minYear, maxYear, maxMileage, search, priceBounds, yearBounds])

  const resetFilters = () => {
    setSearch('')
    setMake('All')
    setBody('All')
    setFuel('All')
    setTransmission('All')
    setMinPrice(priceBounds.min)
    setMaxPrice(priceBounds.max)
    setMinYear(yearBounds.min)
    setMaxYear(yearBounds.max)
    setMaxMileage('')
    setSort('price-desc')
    setPage(1)
  }

  const visibleVehicles = filteredVehicles
  const noInventory = fetchedOnce && !loading && vehicles.length === 0
  const showSkeleton = loading && vehicles.length === 0
  const showFilterEmpty = !noInventory && !showSkeleton && fetchedOnce && !loading && visibleVehicles.length === 0
  const resultsCount = typeof inventoryMeta?.total === 'number' ? inventoryMeta.total : totalResults

  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero} aria-label="Used cars heading">
        <div className={styles.heroBg} style={{ backgroundImage: 'var(--brand-image-hero)' }} aria-hidden="true" />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroBracket} data-pos="tl" aria-hidden="true" />
        <div className={styles.heroBracket} data-pos="br" aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>
            <span className={`${styles.dot} mfx-pulse-dot`} aria-hidden="true" />
            Live stock · {town}, Derbyshire
          </p>
          <h1 className={styles.heroTitle}>The forecourt</h1>
          <p className={styles.heroLead}>
            Browse {resultsCount > 0 ? `${resultsCount} fully prepared` : 'fully prepared'} used cars from
            {' '}{brand?.name || 'Chesterfield Motor Empire'}. Each vehicle inspected, HPI-checked, and
            ready for the road.
          </p>
        </div>
      </section>

      {/* Sticky toolbar */}
      <section className={styles.toolbar} aria-label="Search and filter">
        <div className={styles.toolbarInner}>
          <div className={styles.searchBox}>
            <Search size={16} strokeWidth={2.4} aria-hidden="true" />
            <label htmlFor="stock-search" className={styles.srOnly}>Search stock</label>
            <input
              id="stock-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by make, model, or keyword"
              className={styles.searchInput}
            />
            {search ? (
              <button type="button" className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">
                <X size={14} strokeWidth={2.4} />
              </button>
            ) : null}
          </div>

          <div className={styles.toolbarControls}>
            <label className={styles.controlSelect}>
              <span className={styles.srOnly}>Sort by</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: low → high</option>
                <option value="price-desc">Price: high → low</option>
                <option value="mileage">Lowest mileage</option>
              </select>
            </label>
            <button
              type="button"
              className={styles.filterBtn}
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              aria-controls="filter-panel"
            >
              <Filter size={14} strokeWidth={2.4} aria-hidden="true" />
              All filters
            </button>
          </div>
        </div>

        {/* Body-type chip row */}
        {bodies.length > 1 ? (
          <div className={styles.chipRail} role="tablist" aria-label="Filter by body type">
            {bodies.map((b) => {
              const active = body === b
              return (
                <button
                  key={`body-${b}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                  onClick={() => setBody(b)}
                >
                  {b === 'All' ? 'All bodies' : b}
                </button>
              )
            })}
          </div>
        ) : null}

        {activeFilters.length > 0 ? (
          <div className={styles.activeChips}>
            {activeFilters.map((chip, i) => (
              <button
                key={`active-${i}`}
                type="button"
                className={styles.activeChip}
                onClick={chip.clear}
                aria-label={`Clear filter: ${chip.label}`}
              >
                {chip.label}
                <X size={12} strokeWidth={2.4} aria-hidden="true" />
              </button>
            ))}
            <button type="button" className={styles.resetBtn} onClick={resetFilters}>
              <RefreshCcw size={12} strokeWidth={2.4} aria-hidden="true" />
              Reset
            </button>
          </div>
        ) : null}
      </section>

      {/* Filter drawer + results grid */}
      <section className={styles.body}>
        <div className={styles.bodyInner}>
          <aside
            id="filter-panel"
            className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ''}`}
            aria-hidden={!filtersOpen}
          >
            <div className={styles.filtersHeader}>
              <h2 className={styles.filtersTitle}>Filters</h2>
              <button type="button" className={styles.filtersClose} onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X size={16} strokeWidth={2.4} />
              </button>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="filter-make" className={styles.filterLabel}>Make</label>
              <select id="filter-make" value={make} onChange={(e) => setMake(e.target.value)} className={styles.filterSelect}>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="filter-fuel" className={styles.filterLabel}>Fuel</label>
              <select id="filter-fuel" value={fuel} onChange={(e) => setFuel(e.target.value)} className={styles.filterSelect}>
                {fuels.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="filter-trans" className={styles.filterLabel}>Transmission</label>
              <select id="filter-trans" value={transmission} onChange={(e) => setTransmission(e.target.value)} className={styles.filterSelect}>
                {transmissions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Price (£)</label>
              <div className={styles.rangeRow}>
                <label className={styles.rangeField}>
                  <span className={styles.srOnly}>Minimum price</span>
                  <input
                    type="number"
                    value={minPrice || ''}
                    onChange={(e) => setMinPrice(Number(e.target.value) || priceBounds.min)}
                    placeholder="Min"
                    className={styles.filterInput}
                  />
                </label>
                <span className={styles.rangeDivider}>–</span>
                <label className={styles.rangeField}>
                  <span className={styles.srOnly}>Maximum price</span>
                  <input
                    type="number"
                    value={maxPrice || ''}
                    onChange={(e) => setMaxPrice(Number(e.target.value) || priceBounds.max)}
                    placeholder="Max"
                    className={styles.filterInput}
                  />
                </label>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Year</label>
              <div className={styles.rangeRow}>
                <label className={styles.rangeField}>
                  <span className={styles.srOnly}>Earliest year</span>
                  <input
                    type="number"
                    value={minYear || ''}
                    onChange={(e) => setMinYear(Number(e.target.value) || yearBounds.min)}
                    placeholder="From"
                    className={styles.filterInput}
                  />
                </label>
                <span className={styles.rangeDivider}>–</span>
                <label className={styles.rangeField}>
                  <span className={styles.srOnly}>Latest year</span>
                  <input
                    type="number"
                    value={maxYear || ''}
                    onChange={(e) => setMaxYear(Number(e.target.value) || yearBounds.max)}
                    placeholder="To"
                    className={styles.filterInput}
                  />
                </label>
              </div>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="filter-mileage" className={styles.filterLabel}>Max mileage</label>
              <input
                id="filter-mileage"
                type="number"
                value={maxMileage}
                onChange={(e) => setMaxMileage(e.target.value)}
                placeholder="e.g. 60000"
                className={styles.filterInput}
              />
            </div>

            <button type="button" className={styles.filterReset} onClick={resetFilters}>
              <RefreshCcw size={14} strokeWidth={2.4} aria-hidden="true" />
              Reset all
            </button>
          </aside>

          {filtersOpen ? (
            // audit-ignore: a11y-div-as-button — backdrop overlay; the drawer has its own close button + toolbar toggle for keyboard users
            <div
              className={styles.filtersBackdrop}
              onClick={() => setFiltersOpen(false)}
              aria-hidden="true"
            />
          ) : null}

          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <p className={styles.resultsCount}>
                {showSkeleton ? 'Loading stock…' : `${resultsCount} ${resultsCount === 1 ? 'vehicle' : 'vehicles'}`}
              </p>
            </div>

            {noInventory ? (
              <div className={styles.emptyBlock}>
                <span className={styles.emptyIcon} aria-hidden="true"><Car size={40} strokeWidth={1.6} /></span>
                <h2 className={styles.emptyTitle}>No vehicles in stock right now</h2>
                <p className={styles.emptyBody}>Drop in or call us — we&rsquo;ll talk you through what&rsquo;s arriving this week.</p>
                <Link href="/contact" className={styles.emptyCta}>
                  Talk to the team <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                </Link>
              </div>
            ) : null}

            {showFilterEmpty ? (
              <div className={styles.emptyBlock}>
                <span className={styles.emptyIcon} aria-hidden="true"><Search size={36} strokeWidth={1.6} /></span>
                <h2 className={styles.emptyTitle}>No vehicles match those filters</h2>
                <p className={styles.emptyBody}>Try clearing a filter or broadening your search.</p>
                <button type="button" className={styles.emptyCta} onClick={resetFilters}>
                  Reset filters <RefreshCcw size={14} strokeWidth={2.4} aria-hidden="true" />
                </button>
              </div>
            ) : null}

            <ul className={styles.cardGrid}>
              {showSkeleton
                ? Array.from({ length: perPage }).map((_, i) => (
                    <li key={`skel-${i}`} className={styles.skelCard}>
                      <span className={styles.skelMedia} />
                      <div className={styles.skelBody}>
                        <span className={`${styles.skelLine} ${styles.skelLineShort}`} />
                        <span className={styles.skelLine} />
                        <span className={styles.skelLine} />
                      </div>
                    </li>
                  ))
                : visibleVehicles.map((v) => {
                  const saved = toSavedVehicle(v)
                  const wishlisted = isWishlisted(v.id)
                  const compared = isCompared(v.id)
                  return (
                    <li key={v.id} className={styles.card}>
                      <Link
                        href={buildVehiclePermalink({ slug: v.slug || toSlug(v.title), reg: v.reg })}
                        className={styles.cardMedia}
                        style={{ backgroundImage: `url(${v.image})` }}
                        aria-label={v.title}
                      >
                        <span className={`${styles.cardStock} mfx-pulse-dot`}>
                          <span className={styles.cardStockDot} aria-hidden="true" />
                          In stock
                        </span>
                        {v.featured ? <span className={styles.cardFeatured}>Featured</span> : null}
                      </Link>
                      <div className={styles.cardBody}>
                        <div className={styles.cardHead}>
                          <p className={styles.cardYear}>{v.year}</p>
                          <p className={styles.cardPrice}>{formatPrice(v.price)}</p>
                        </div>
                        <Link
                          href={buildVehiclePermalink({ slug: v.slug || toSlug(v.title), reg: v.reg })}
                          className={styles.cardTitle}
                        >
                          {v.title}
                        </Link>
                        <p className={styles.cardSubtitle}>{v.make} · {v.body} · {v.color}</p>
                        <ul className={styles.cardSpecs}>
                          <li><Gauge size={13} strokeWidth={1.8} aria-hidden="true" /> {v.mileage.toLocaleString()} mi</li>
                          <li><Fuel size={13} strokeWidth={1.8} aria-hidden="true" /> {v.fuel}</li>
                          <li><SlidersHorizontal size={13} strokeWidth={1.8} aria-hidden="true" /> {v.transmission}</li>
                          <li><Palette size={13} strokeWidth={1.8} aria-hidden="true" /> {v.color}</li>
                        </ul>
                        <div className={styles.cardFooter}>
                          <Link
                            href={buildVehiclePermalink({ slug: v.slug || toSlug(v.title), reg: v.reg })}
                            className={styles.cardView}
                          >
                            View vehicle
                            <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
                          </Link>
                          <div className={styles.cardActions}>
                            <button
                              type="button"
                              className={`${styles.cardIconBtn} ${compared ? styles.cardIconBtnActive : ''}`}
                              data-active={compared}
                              aria-pressed={compared}
                              aria-label={compared ? 'Remove from compare' : 'Add to compare'}
                              onClick={(e) => { e.preventDefault(); toggleCompare(saved) }}
                            >
                              <GitCompare size={14} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              className={`${styles.cardIconBtn} ${wishlisted ? styles.cardIconBtnActive : ''}`}
                              aria-pressed={wishlisted}
                              aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                              onClick={(e) => { e.preventDefault(); toggleWishlist(saved) }}
                            >
                              <Heart size={14} strokeWidth={2} fill={wishlisted ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
            </ul>

            {totalPages > 1 ? (
              <nav className={styles.pagination} aria-label="Pagination">
                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} strokeWidth={2.4} />
                </button>
                {paginationItems.map((item, i) =>
                  item === '...' ? (
                    <span key={`pe-${i}`} className={styles.pageEllipsis}>…</span>
                  ) : (
                    <button
                      key={`p-${item}`}
                      type="button"
                      className={`${styles.pageBtn} ${item === page ? styles.pageBtnActive : ''}`}
                      onClick={() => setPage(item)}
                      aria-current={item === page ? 'page' : undefined}
                    >
                      {item}
                    </button>
                  ),
                )}
                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} strokeWidth={2.4} />
                </button>
              </nav>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  )
}
