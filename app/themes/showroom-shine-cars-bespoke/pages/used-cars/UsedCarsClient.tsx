"use client"

import { useMemo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, X, RefreshCcw, MapPin, BadgeCheck, Gauge, ChevronLeft, ChevronRight, CarFront, Heart, GitCompare, ArrowUpDown } from 'lucide-react'
import styles from './page.module.css'
import VehicleCard from '../../components/VehicleCard'
import { useBrand } from '../../context/BrandClientWrapper'
import { useGarage } from '../../context/GarageContext'
import { getBrandContactInfo } from '../../lib/contact'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem, type InventoryMeta, type InventoryVehicle } from '../../lib/inventory'

type Vehicle = InventoryVehicle

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

const uniqueValues = (items: Vehicle[], key: keyof Vehicle) =>
  Array.from(
    new Set(items.map((item) => String(item[key] ?? '').trim()).filter(Boolean))
  ).sort()

const getBounds = (items: Vehicle[], key: keyof Vehicle) => {
  if (!items.length) return null
  const values = items.map((item) => Number(item[key])).filter((value) => Number.isFinite(value))
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
    case 'price_asc': case 'price-asc': return 'price-asc'
    case 'price_desc': case 'price-desc': return 'price-desc'
    case 'mileage_asc': case 'mileage': return 'mileage'
    case 'newest': return 'newest'
    default: return 'price-desc'
  }
}

export default function UsedCarsClient({
  initialVehicles,
  initialMeta
}: {
  initialVehicles: Vehicle[]
  initialMeta?: InventoryMeta | null
}) {
  const brand = useBrand()
  const brandSlug = (brand?.slug || '').trim()
  const { wishlistCount, compareCount } = useGarage()
  const contact = getBrandContactInfo(brand)
  const locationChip = (() => {
    const addr = (brand as any)?.location?.address || {}
    const parts = [addr.city, addr.county].filter((p: any) => typeof p === 'string' && p.trim())
    if (parts.length === 0 && contact.showroomAddress) return contact.showroomAddress.split(',').slice(-2).join(',').trim()
    return parts.join(', ')
  })()
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable) return
      e.preventDefault()
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
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
    const metaMakes = Array.isArray(initialMeta?.available?.makes)
      ? initialMeta.available.makes.filter(Boolean)
      : []
    return metaMakes.length ? metaMakes : uniqueValues(initialVehicles, 'make')
  }, [initialMeta, initialVehicles])

  const initialAvailableBodies = useMemo(() => {
    const metaBodies = Array.isArray(initialMeta?.available?.body_types)
      ? initialMeta.available.body_types.filter(Boolean)
      : []
    return metaBodies.length ? metaBodies : uniqueValues(initialVehicles, 'body')
  }, [initialMeta, initialVehicles])

  const initialAvailableFuels = useMemo(() => {
    const metaFuels = Array.isArray(initialMeta?.available?.fuel_types)
      ? initialMeta.available.fuel_types.filter(Boolean)
      : []
    return metaFuels.length ? metaFuels : uniqueValues(initialVehicles, 'fuel')
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
    typeof initialMeta?.total === 'number' ? initialMeta.total : initialVehicles.length
  )

  useEffect(() => {
    if (!vehicles.length) return
    const nextPriceBounds = getBounds(vehicles, 'price')
    const nextYearBounds = getBounds(vehicles, 'year')
    if (nextPriceBounds) {
      const hasPriceFilter = minPrice !== priceBounds.min || maxPrice !== priceBounds.max
      const mergedMin = priceBounds.min === 0 ? nextPriceBounds.min : Math.min(priceBounds.min, nextPriceBounds.min)
      const mergedMax = Math.max(priceBounds.max, nextPriceBounds.max)
      if (mergedMin !== priceBounds.min || mergedMax !== priceBounds.max) {
        skipPageResetRef.current.suppressNext = true
        setPriceBounds({ min: mergedMin, max: mergedMax })
        if (!hasPriceFilter) {
          setMinPrice(mergedMin)
          setMaxPrice(mergedMax)
        }
      }
    }
    if (nextYearBounds) {
      const hasYearFilter = minYear !== yearBounds.min || maxYear !== yearBounds.max
      const mergedMin = yearBounds.min === 0 ? nextYearBounds.min : Math.min(yearBounds.min, nextYearBounds.min)
      const mergedMax = Math.max(yearBounds.max, nextYearBounds.max)
      if (mergedMin !== yearBounds.min || mergedMax !== yearBounds.max) {
        skipPageResetRef.current.suppressNext = true
        setYearBounds({ min: mergedMin, max: mergedMax })
        if (!hasYearFilter) {
          setMinYear(mergedMin)
          setMaxYear(mergedMax)
        }
      }
    }
  }, [vehicles, minPrice, maxPrice, minYear, maxYear, priceBounds, yearBounds])

  const makes = useMemo(() => ['All', ...availableMakes], [availableMakes])
  const bodies = useMemo(() => ['All', ...availableBodies], [availableBodies])
  const fuels = useMemo(() => ['All', ...availableFuels], [availableFuels])
  const transmissions = useMemo(() => ['All', ...uniqueValues(vehicles.length ? vehicles : initialVehicles, 'transmission')], [vehicles, initialVehicles])

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const params = new URLSearchParams(window.location.search)
      const nextSearch = params.get('q') || ''
      const nextMake = params.get('make') || 'All'
      const nextBody = params.get('body') || 'All'
      const nextFuel = params.get('fuel') || 'All'
      const nextTransmission = params.get('transmission')
      const nextMinPrice = params.get('min_price') || ''
      const nextMaxPrice = params.get('max_price') || ''
      const nextMinYear = params.get('min_year') || ''
      const nextMaxYear = params.get('max_year') || ''
      const nextMaxMileage = params.get('max_mileage') || ''
      const nextSort = mapSortFromApi(params.get('sort') || '')
      const nextPage = Math.max(1, parseInt(params.get('page') || '1', 10) || 1)

      skipPageResetRef.current.initialUrlParams = new Set(Array.from(params.keys()))

      setSearch(nextSearch)
      setMake(nextMake)
      setBody(nextBody)
      setFuel(nextFuel)
      if (nextTransmission) setTransmission(nextTransmission)
      if (nextMinPrice && Number.isFinite(Number(nextMinPrice))) setMinPrice(Number(nextMinPrice))
      if (nextMaxPrice && Number.isFinite(Number(nextMaxPrice))) setMaxPrice(Number(nextMaxPrice))
      if (nextMinYear && Number.isFinite(Number(nextMinYear))) setMinYear(Number(nextMinYear))
      if (nextMaxYear && Number.isFinite(Number(nextMaxYear))) setMaxYear(Number(nextMaxYear))
      setMaxMileage(nextMaxMileage)
      const sortOptions = ['newest', 'price-asc', 'price-desc', 'mileage']
      if (sortOptions.includes(nextSort)) setSort(nextSort)
      setPage(nextPage)
      setHasInitializedFilters(true)
    } catch {
      setHasInitializedFilters(true)
    }
  }, [])

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
        const res = await fetch(apiUrl(`/inventory?${query}`), { signal: controller.signal, cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch inventory')
        const payload = await res.json()
        if (aborted) return

        const nextItems = Array.isArray(payload?.items) ? payload.items
          : Array.isArray(payload?.vehicles) ? payload.vehicles
          : Array.isArray(payload?.data) ? payload.data
          : Array.isArray(payload) ? payload
          : []
        const normalized = nextItems.map((item: any) => normalizeInventoryItem(item)).filter(Boolean) as Vehicle[]

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
    return () => { aborted = true; controller.abort() }
  }, [hasInitializedFilters, page, search, make, body, fuel, minPrice, maxPrice, minYear, maxYear, maxMileage, sort, priceBounds, yearBounds, perPage, brandSlug])

  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !hasInitializedFilters) return
      const params = new URLSearchParams()
      const defaultSort = 'price-desc'
      const defaultPerPage = ITEMS_PER_PAGE
      if (sort !== defaultSort || skipPageResetRef.current.initialUrlParams.has('sort')) params.set('sort', mapSortToApi(sort))
      if (perPage !== defaultPerPage || skipPageResetRef.current.initialUrlParams.has('per_page')) params.set('per_page', String(perPage))
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
    } catch {}
  }, [hasInitializedFilters, page, perPage, sort, search, make, body, fuel, transmission, minPrice, maxPrice, minYear, maxYear, maxMileage, priceBounds, yearBounds])

  useEffect(() => {
    if (!hasInitializedFilters) return
    if (skipPageResetRef.current.skip) { skipPageResetRef.current.skip = false; return }
    if (skipPageResetRef.current.suppressNext) { skipPageResetRef.current.suppressNext = false; return }
    setPage(1)
  }, [search, make, body, fuel, transmission, minPrice, maxPrice, minYear, maxYear, maxMileage, sort, hasInitializedFilters])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    const maxMileageValue = maxMileage ? Number(maxMileage) : null
    const list = vehicles.filter((vehicle) => {
      if (normalizedSearch && !vehicle.title.toLowerCase().includes(normalizedSearch)) return false
      if (make !== 'All' && vehicle.make !== make) return false
      if (body !== 'All' && vehicle.body !== body) return false
      if (fuel !== 'All' && vehicle.fuel !== fuel) return false
      if (transmission !== 'All' && vehicle.transmission !== transmission) return false
      if (vehicle.price < minPrice) return false
      if (vehicle.price > maxPrice) return false
      if (vehicle.year < minYear) return false
      if (vehicle.year > maxYear) return false
      if (maxMileageValue !== null && vehicle.mileage > maxMileageValue) return false
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
    const chips = [] as string[]
    if (make !== 'All') chips.push(make)
    if (body !== 'All') chips.push(body)
    if (fuel !== 'All') chips.push(fuel)
    if (transmission !== 'All') chips.push(transmission)
    if (minPrice > priceBounds.min || (priceBounds.max > 0 && maxPrice < priceBounds.max)) {
      chips.push(`${formatPrice(minPrice)}–${formatPrice(maxPrice)}`)
    }
    if (minYear > yearBounds.min || (yearBounds.max > 0 && maxYear < yearBounds.max)) {
      chips.push(`${minYear}–${maxYear}`)
    }
    if (maxMileage) chips.push(`Under ${Number(maxMileage).toLocaleString()} mi`)
    if (search.trim()) chips.push(`“${search.trim()}”`)
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

  const noInventory = fetchedOnce && !loading && vehicles.length === 0
  const showSkeleton = loading && vehicles.length === 0
  const showFilterEmpty = !noInventory && !showSkeleton && fetchedOnce && !loading && filteredVehicles.length === 0
  const resultsCount = typeof inventoryMeta?.total === 'number' ? inventoryMeta.total : totalResults

  return (
    <article>
      <section className={styles.inventoryHero}>
        <div className={styles.inventoryHeroBg} aria-hidden />
        <div className={styles.inventoryHeroOverlay} aria-hidden />
        <div className={`shr-grid-pattern ${styles.heroPattern}`} aria-hidden />
        <div className={styles.wideInner}>
          <div className={styles.inventoryHeroInner} data-aos="fade-up">
            <span className="shr-eyebrow">Used Cars</span>
            <h1 className={styles.inventoryHeroTitle}>Browse our stock</h1>
            <p className={styles.inventoryHeroLead}>
              Browse current vehicles, compare the details, and shortlist the right
              option for your driveway.
            </p>
            <div className={styles.heroChips}>
              <span className={`shr-chip shr-chip--dark ${styles.chipDesktop}`}>
                <BadgeCheck size={14} strokeWidth={2.2} aria-hidden />
                HPI &amp; finance checks
              </span>
              <span className={`shr-chip shr-chip--dark ${styles.chipDesktop}`}>
                <Gauge size={14} strokeWidth={2.2} aria-hidden />
                Inspected &amp; prepared
              </span>
              {locationChip ? (
                <span className={`shr-chip shr-chip--dark`}>
                  <MapPin size={14} strokeWidth={2.2} aria-hidden />
                  {locationChip}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className={`shr-section ${styles.toolbarSection}`}>
        <div className={styles.wideInner}>
          <div className={styles.toolbar}>
            <div className={`${styles.searchWrap} ${search ? styles.searchWrapHasValue : ''}`}>
              <span className={styles.searchIconShell} aria-hidden>
                <Search size={16} strokeWidth={2.6} />
              </span>
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Make, model, body type, reg…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search stock"
                className={styles.searchInput}
              />
              {search ? (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X size={14} strokeWidth={2.6} />
                </button>
              ) : (
                <span className={styles.searchHint} aria-hidden>
                  <kbd>/</kbd>
                </span>
              )}
            </div>

            <div className={styles.actionRail} role="toolbar" aria-label="Stock actions">
              <button
                type="button"
                className={`${styles.action} ${styles.actionFilters}`}
                onClick={() => setFiltersOpen((o) => !o)}
                aria-expanded={filtersOpen}
              >
                <SlidersHorizontal size={16} strokeWidth={2.2} aria-hidden />
                <span className={styles.actionLabel}>Filters</span>
                {activeFilters.length > 0 ? <span className={styles.actionBadge}>{activeFilters.length}</span> : null}
              </button>

              <label className={`${styles.action} ${styles.actionSort}`}>
                <ArrowUpDown size={16} strokeWidth={2.2} aria-hidden className={styles.actionSortIcon} />
                <span className={styles.actionSortLabel}>
                  {sort === 'newest' && 'Newest'}
                  {sort === 'price-asc' && 'Price ↑'}
                  {sort === 'price-desc' && 'Price ↓'}
                  {sort === 'mileage' && 'Mileage ↑'}
                </span>
                <svg className={styles.actionSortChevron} width="10" height="6" viewBox="0 0 10 6" aria-hidden>
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  aria-label="Sort by"
                  className={styles.actionSortNative}
                >
                  <option value="newest">Newest</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="mileage">Lowest mileage</option>
                </select>
              </label>

              <Link
                href="/wishlist"
                className={`${styles.action} ${styles.actionGarage} ${wishlistCount > 0 ? styles.actionActive : ''}`}
                aria-label={`Wishlist (${wishlistCount})`}
              >
                <Heart size={16} strokeWidth={2.2} fill={wishlistCount > 0 ? 'currentColor' : 'none'} aria-hidden />
                <span className={styles.actionLabel}>Wishlist</span>
                <span className={styles.actionCount}>{wishlistCount}</span>
              </Link>

              <Link
                href="/compare"
                className={`${styles.action} ${styles.actionGarage} ${compareCount > 0 ? styles.actionActive : ''}`}
                aria-label={`Compare (${compareCount})`}
              >
                <GitCompare size={16} strokeWidth={2.2} aria-hidden />
                <span className={styles.actionLabel}>Compare</span>
                <span className={styles.actionCount}>{compareCount}</span>
              </Link>
            </div>
          </div>

          {activeFilters.length > 0 ? (
            <div className={styles.activeChips}>
              <span className={styles.activeChipsLabel}>Active:</span>
              <div className={styles.activeChipsScroll}>
                {activeFilters.map((f) => (
                  <span key={f} className={styles.activeChip}>{f}</span>
                ))}
              </div>
              <button type="button" className={styles.activeChipsReset} onClick={resetFilters}>
                <RefreshCcw size={12} strokeWidth={2.4} aria-hidden />
                Reset
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section className={`shr-section ${styles.resultsSection}`}>
        <div className={styles.wideInner}>
          <div className={styles.layout}>
            <aside className={`${styles.filterPanel} ${filtersOpen ? styles.filterPanelOpen : ''}`} aria-label="Filters">
              <div className={styles.filterHeader}>
                <h2 className={styles.filterHeaderTitle}>Refine</h2>
                <span className={styles.filterCount}>{resultsCount} vehicles</span>
                <button type="button" className={styles.filterClose} onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                  <X size={16} strokeWidth={2.2} />
                </button>
              </div>

              <div className={styles.filterGroup}>
                <label>Make</label>
                <select value={make} onChange={(e) => setMake(e.target.value)}>
                  {makes.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Body type</label>
                <select value={body} onChange={(e) => setBody(e.target.value)}>
                  {bodies.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Fuel</label>
                <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
                  {fuels.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Transmission</label>
                <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                  {transmissions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>Max mileage</label>
                <input
                  type="number"
                  value={maxMileage}
                  onChange={(e) => setMaxMileage(e.target.value)}
                  placeholder="e.g. 60000"
                />
              </div>
              <button type="button" className={styles.filterReset} onClick={resetFilters}>
                <RefreshCcw size={14} strokeWidth={2.2} aria-hidden />
                Reset all filters
              </button>
            </aside>

            <div className={styles.results}>
              <div className={styles.resultsHead}>
                <h2 className={styles.resultsCount}>
                  {showSkeleton ? 'Loading stock…' : `${resultsCount} vehicles available`}
                </h2>
                <p className={styles.resultsHint}>
                  Updated daily. Call the showroom for stock arriving this week.
                </p>
              </div>

              {noInventory ? (
                <div className={styles.empty}>
                  <CarFront size={48} strokeWidth={1.6} aria-hidden />
                  <h3>No vehicles available right now.</h3>
                  <p>Check back soon or call the showroom about upcoming arrivals.</p>
                  <Link href="/contact" className="shr-btn-primary">Contact us</Link>
                </div>
              ) : showFilterEmpty ? (
                <div className={styles.empty}>
                  <CarFront size={48} strokeWidth={1.6} aria-hidden />
                  <h3>No vehicles match those filters.</h3>
                  <p>Try clearing a filter or broadening your search.</p>
                  <button type="button" className="shr-btn-primary" onClick={resetFilters}>Reset filters</button>
                </div>
              ) : showSkeleton ? (
                <div className={styles.cardGrid}>
                  {Array.from({ length: perPage }).map((_, idx) => (
                    <div key={idx} className={styles.skeletonCard} aria-hidden />
                  ))}
                </div>
              ) : (
                <>
                  <div className={styles.cardGrid}>
                    {filteredVehicles.map((vehicle) => (
                      <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                  </div>

                  {totalPages > 1 ? (
                    <nav className={styles.pagination} aria-label="Pagination">
                      <div className={styles.paginationMeta}>
                        Page {page} of {totalPages}
                      </div>
                      <div className={styles.paginationControls}>
                        <button
                          type="button"
                          className={styles.pageButton}
                          onClick={() => setPage(Math.max(1, page - 1))}
                          disabled={page === 1}
                          aria-label="Previous page"
                        >
                          <ChevronLeft size={16} strokeWidth={2.2} aria-hidden />
                        </button>
                        {paginationItems.map((item, idx) =>
                          item === '...' ? (
                            <span key={`gap-${idx}`} className={styles.pageEllipsis}>…</span>
                          ) : (
                            <button
                              key={`p-${item}`}
                              type="button"
                              className={`${styles.pageButton} ${item === page ? styles.pageButtonActive : ''}`}
                              onClick={() => setPage(item)}
                              aria-current={item === page ? 'page' : undefined}
                            >
                              {item}
                            </button>
                          )
                        )}
                        <button
                          type="button"
                          className={styles.pageButton}
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          aria-label="Next page"
                        >
                          <ChevronRight size={16} strokeWidth={2.2} aria-hidden />
                        </button>
                      </div>
                    </nav>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </article>
  )
}
