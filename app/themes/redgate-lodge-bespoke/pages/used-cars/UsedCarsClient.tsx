"use client"

import { useMemo, useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowUpDown,
  CarFront,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Scale,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react'
import styles from './page.module.css'
import { useGarage } from '../../context/GarageContext'
import { useBrand } from '../../context/BrandClientWrapper'
import { resolveText } from '../../lib/brand-text'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem, type InventoryMeta, type InventoryVehicle } from '../../lib/inventory'
import VehicleCard from '../../components/VehicleCard'
import CanvasFX from '@/app/widgets/CanvasFX/CanvasFX'

type Vehicle = InventoryVehicle

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value)

const uniqueValues = (items: Vehicle[], key: keyof Vehicle) =>
  Array.from(
    new Set(
      items
        .map((item) => String(item[key] ?? '').trim())
        .filter(Boolean)
    )
  ).sort()

const getBounds = (items: Vehicle[], key: keyof Vehicle) => {
  if (!items.length) return null
  const values = items.map((item) => Number(item[key])).filter((value) => Number.isFinite(value))
  if (!values.length) return null
  return {
    min: Math.min(...values),
    max: Math.max(...values)
  }
}

const ITEMS_PER_PAGE = 12

function mapSortToApi(value: string) {
  switch (value) {
    case 'price-asc':
      return 'price_asc'
    case 'price-desc':
      return 'price_desc'
    case 'mileage':
      return 'mileage_asc'
    case 'newest':
      return 'newest'
    default:
      return 'price_desc'
  }
}

function mapSortFromApi(value: string) {
  switch (value) {
    case 'price_asc':
    case 'price-asc':
      return 'price-asc'
    case 'price_desc':
    case 'price-desc':
      return 'price-desc'
    case 'mileage_asc':
    case 'mileage':
      return 'mileage'
    case 'newest':
      return 'newest'
    default:
      return 'price-desc'
  }
}

/**
 * Overlaid-select chip (build-rules §10 / spec AC7): a chip showing an icon +
 * the current value + a chevron, with an invisible native `<select>` stretched
 * across it so it stays a real, accessible, keyboard-operable control while
 * carrying the theme's chip styling. Used for make / body / sort in row 2.
 */
function SelectChip({
  id,
  icon,
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: {
  id: string
  icon: ReactNode
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  ariaLabel: string
  className?: string
}) {
  const current = options.find((option) => option.value === value)
  return (
    <div className={`${styles.selectChip} ${className || ''}`.trim()}>
      <span className={styles.selectChipIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.selectChipValue}>{current?.label ?? options[0]?.label ?? ''}</span>
      <ChevronDown className={styles.selectChipChevron} size={15} strokeWidth={2} aria-hidden="true" />
      <select
        id={id}
        className={styles.selectChipNative}
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={`${id}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function UsedCarsClient({
  initialVehicles,
  initialMeta
}: {
  initialVehicles: Vehicle[]
  initialMeta?: InventoryMeta | null
}) {
  const { wishlistCount, compareCount } = useGarage()
  const brand = useBrand()
  const brandSlug = (brand?.slug || '').trim()
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
  const [priceBounds, setPriceBounds] = useState(
    initialPriceBounds ?? { min: 0, max: 0 }
  )
  const [yearBounds, setYearBounds] = useState(
    initialYearBounds ?? { min: 0, max: 0 }
  )

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
    if (typeof initialMeta?.totalPages === 'number') {
      return Math.max(1, initialMeta.totalPages)
    }
    return Math.max(1, Math.ceil(initialVehicles.length / initialPerPage))
  })
  const [totalResults, setTotalResults] = useState(
    typeof initialMeta?.total === 'number'
      ? initialMeta.total
      : initialVehicles.length
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
  const sortOptions = useMemo(() => ['newest', 'price-asc', 'price-desc'], [])

  const priceRangeOptions = useMemo(() => {
    const min = priceBounds.min
    const max = priceBounds.max
    if (max < min) return []

    const configuredMin = 1000
    const configuredMax = 50000
    const step = 5000

    const options = [{ value: 'all', label: 'All prices', min, max }]

    if (min < configuredMin) {
      options.push({
        value: `${min}-${configuredMin - 1}`,
        label: `Under ${formatPrice(configuredMin)}`,
        min,
        max: configuredMin - 1
      })
    }

    for (let lower = configuredMin; lower < configuredMax;) {
      const upper = lower === configuredMin
        ? configuredMin + (step - 1000)
        : Math.min(configuredMax, lower + step)
      options.push({
        value: `${lower}-${upper}`,
        label: `${formatPrice(lower)}-${formatPrice(upper)}`,
        min: lower,
        max: upper
      })
      lower = upper
    }

    if (max > configuredMax) {
      options.push({
        value: `${configuredMax + 1}-${max}`,
        label: `Over ${formatPrice(configuredMax)}`,
        min: configuredMax + 1,
        max
      })
    }

    return options.filter((option) => option.max >= min && option.min <= max)
  }, [priceBounds])

  const selectedPriceRangeValue = useMemo(() => {
    if (minPrice <= priceBounds.min && maxPrice >= priceBounds.max) return 'all'
    const matched = priceRangeOptions.find((option) => option.min === minPrice && option.max === maxPrice)
    if (matched) return matched.value
    return `custom-${minPrice}-${maxPrice}`
  }, [minPrice, maxPrice, priceBounds, priceRangeOptions])

  const priceRangeSelectOptions = useMemo(() => {
    if (!selectedPriceRangeValue.startsWith('custom-')) return priceRangeOptions
    return [
      ...priceRangeOptions,
      {
        value: selectedPriceRangeValue,
        label: `${formatPrice(minPrice)}-${formatPrice(maxPrice)}`,
        min: minPrice,
        max: maxPrice
      }
    ]
  }, [selectedPriceRangeValue, minPrice, maxPrice, priceRangeOptions])

  const yearRangeOptions = useMemo(() => {
    const min = yearBounds.max >= 2000 ? 2000 : yearBounds.min
    const max = yearBounds.max
    if (max < min) return []

    const options = [{ value: 'all', label: 'All years', min, max }]
    const rangeSize = 5

    for (let upper = max; upper >= min; upper -= rangeSize) {
      const lower = Math.max(min, upper - (rangeSize - 1))
      const label = lower === upper ? `${upper}` : `${lower}-${upper}`
      options.push({
        value: `${lower}-${upper}`,
        label,
        min: lower,
        max: upper
      })
    }

    return options
  }, [yearBounds])

  const selectedYearRangeValue = useMemo(() => {
    if (minYear <= yearBounds.min && maxYear >= yearBounds.max) return 'all'
    const matched = yearRangeOptions.find((option) => option.min === minYear && option.max === maxYear)
    if (matched) return matched.value
    return `custom-${minYear}-${maxYear}`
  }, [minYear, maxYear, yearBounds, yearRangeOptions])

  const yearRangeSelectOptions = useMemo(() => {
    if (!selectedYearRangeValue.startsWith('custom-')) return yearRangeOptions
    return [
      ...yearRangeOptions,
      {
        value: selectedYearRangeValue,
        label: `${minYear}-${maxYear}`,
        min: minYear,
        max: maxYear
      }
    ]
  }, [selectedYearRangeValue, minYear, maxYear, yearRangeOptions])

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
      const nextPerPage = ITEMS_PER_PAGE

      skipPageResetRef.current.initialUrlParams = new Set(Array.from(params.keys()))

      setSearch((prev) => (prev === nextSearch ? prev : nextSearch))
      setMake((prev) => (prev === nextMake ? prev : nextMake))
      setBody((prev) => (prev === nextBody ? prev : nextBody))
      setFuel((prev) => (prev === nextFuel ? prev : nextFuel))
      if (nextTransmission) {
        setTransmission((prev) => (prev === nextTransmission ? prev : nextTransmission))
      }
      if (nextMinPrice) {
        const nextMinPriceValue = Number(nextMinPrice)
        if (Number.isFinite(nextMinPriceValue)) {
          setMinPrice(nextMinPriceValue)
        }
      }
      if (nextMaxPrice) {
        const nextMaxPriceValue = Number(nextMaxPrice)
        if (Number.isFinite(nextMaxPriceValue)) {
          setMaxPrice(nextMaxPriceValue)
        }
      }
      if (nextMinYear) {
        const nextMinYearValue = Number(nextMinYear)
        if (Number.isFinite(nextMinYearValue)) {
          setMinYear(nextMinYearValue)
        }
      }
      if (nextMaxYear) {
        const nextMaxYearValue = Number(nextMaxYear)
        if (Number.isFinite(nextMaxYearValue)) {
          setMaxYear(nextMaxYearValue)
        }
      }
      setMaxMileage((prev) => (prev === nextMaxMileage ? prev : nextMaxMileage))
      setSort((prev) => (prev === nextSort || !sortOptions.includes(nextSort) ? prev : nextSort))
      setPage((prev) => (prev === nextPage ? prev : nextPage))
      setPerPage((prev) => (prev === nextPerPage ? prev : nextPerPage))
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
        const res = await fetch(apiUrl(`/inventory?${query}`), {
          signal: controller.signal,
          cache: 'no-store'
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
        setTotalPages(
          typeof payload?.meta?.totalPages === 'number' ? Math.max(1, payload.meta.totalPages) : 1
        )

        const metaMakes = Array.isArray(payload?.meta?.available?.makes)
          ? payload.meta.available.makes.filter(Boolean)
          : []
        const metaBodies = Array.isArray(payload?.meta?.available?.body_types)
          ? payload.meta.available.body_types.filter(Boolean)
          : []
        const metaFuels = Array.isArray(payload?.meta?.available?.fuel_types)
          ? payload.meta.available.fuel_types.filter(Boolean)
          : []

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
  }, [
    hasInitializedFilters,
    page,
    search,
    make,
    body,
    fuel,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxMileage,
    sort,
    priceBounds,
    yearBounds,
    perPage,
    brandSlug
  ])

  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !hasInitializedFilters) return
      const params = new URLSearchParams()
      const defaultSort = 'price-desc'
      const defaultPerPage = ITEMS_PER_PAGE

      if (sort !== defaultSort || skipPageResetRef.current.initialUrlParams.has('sort')) {
        params.set('sort', mapSortToApi(sort))
      }
      if (perPage !== defaultPerPage || skipPageResetRef.current.initialUrlParams.has('per_page')) {
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
      // ignore history errors
    }
  }, [
    hasInitializedFilters,
    page,
    perPage,
    sort,
    search,
    make,
    body,
    fuel,
    transmission,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxMileage,
    priceBounds,
    yearBounds,
  ])

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
    const minPriceValue = minPrice
    const maxPriceValue = maxPrice
    const minYearValue = minYear
    const maxYearValue = maxYear
    const maxMileageValue = maxMileage ? Number(maxMileage) : null

    const list = vehicles.filter((vehicle) => {
      if (normalizedSearch && !vehicle.title.toLowerCase().includes(normalizedSearch)) return false
      if (make !== 'All' && vehicle.make !== make) return false
      if (body !== 'All' && vehicle.body !== body) return false
      if (fuel !== 'All' && vehicle.fuel !== fuel) return false
      if (transmission !== 'All' && vehicle.transmission !== transmission) return false
      if (vehicle.price < minPriceValue) return false
      if (vehicle.price > maxPriceValue) return false
      if (vehicle.year < minYearValue) return false
      if (vehicle.year > maxYearValue) return false
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
  }, [
    search,
    make,
    body,
    fuel,
    transmission,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxMileage,
    sort,
    vehicles
  ])

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

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
  }

  const visibleVehicles = filteredVehicles
  const showSkeleton = loading && vehicles.length === 0
  const showEmpty = !showSkeleton && fetchedOnce && visibleVehicles.length === 0
  const resultsCount = typeof inventoryMeta?.total === 'number' ? inventoryMeta.total : totalResults

  // ---- Resolved copy (build-rules §12: every string via resolveText) --------
  const heroEyebrow = resolveText(brand, 'ribbon.used_cars_eyebrow')
  const heroTitle = resolveText(brand, 'ribbon.used_cars_title')
  const countLabel = resolveText(brand, 'inventory.count_label')
  const filtersLabel = resolveText(brand, 'inventory.filters')
  const resetLabel = resolveText(brand, 'inventory.reset')
  const searchPlaceholder = resolveText(brand, 'inventory.search_placeholder')
  const sortLabel = resolveText(brand, 'inventory.sort_label')
  const emptyMessage = resolveText(brand, 'inventory.empty')
  const clearLabel = resolveText(brand, 'inventory.clear')

  const sortSelectOptions = useMemo(
    () => [
      { value: 'newest', label: resolveText(brand, 'inventory.sort_newest') },
      { value: 'price-asc', label: resolveText(brand, 'inventory.sort_price_low') },
      { value: 'price-desc', label: resolveText(brand, 'inventory.sort_price_high') },
    ],
    [brand],
  )

  const makeSelectOptions = useMemo(
    () => makes.map((item) => ({ value: item, label: item === 'All' ? 'All makes' : item })),
    [makes],
  )
  const bodySelectOptions = useMemo(
    () => bodies.map((item) => ({ value: item, label: item === 'All' ? 'All body types' : item })),
    [bodies],
  )

  // ---- Filter sheet: Escape to close + focus the close button on open -------
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const closeSheet = useCallback(() => setFiltersOpen(false), [])

  useEffect(() => {
    if (!filtersOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSheet()
    }
    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusTarget = sheetRef.current?.querySelector<HTMLElement>('[data-sheet-close]')
    focusTarget?.focus()
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [filtersOpen, closeSheet])

  const wishlistChip = (className?: string) => (
    <Link href="/wishlist" className={`${styles.chip} ${className || ''}`.trim()}>
      <Heart className={styles.chipIcon} size={16} strokeWidth={2} aria-hidden="true" />
      <span>Wishlist</span>
      <span className={styles.chipCount} aria-hidden="true">
        {wishlistCount}
      </span>
      <span className={styles.srOnly}>{`, ${wishlistCount} saved`}</span>
    </Link>
  )

  const compareChip = (className?: string) => (
    <Link href="/compare" className={`${styles.chip} ${className || ''}`.trim()}>
      <Scale className={styles.chipIcon} size={16} strokeWidth={2} aria-hidden="true" />
      <span>Compare</span>
      <span className={styles.chipCount} aria-hidden="true">
        {compareCount}
      </span>
      <span className={styles.srOnly}>{`, ${compareCount} selected`}</span>
    </Link>
  )

  const emptyState = (
    <div className={styles.emptyState}>
      <span className={styles.emptyGlyph} aria-hidden="true">
        <CarFront size={40} strokeWidth={1.5} />
      </span>
      <p className={styles.emptyText}>{emptyMessage}</p>
      <button type="button" className={styles.clearButton} onClick={resetFilters}>
        {clearLabel}
      </button>
    </div>
  )

  return (
    <>
      <section className={styles.hero} aria-label={heroTitle || countLabel}>
        {/* Furnishing (luxury→refined): the same soft brand-light aurora the home
            hero + arrival card got, behind this framed matted inventory band.
            Self-guards — static token wash under reduced-motion / ≤640px, pauses
            off-screen. Decorative + aria-hidden. */}
        <CanvasFX variant="aurora-light" density={0.6} className={styles.aurora} />
        <div className={styles.heroInner}>
          <div className={styles.heroFrame}>
            <div className={styles.heroHeading}>
              {heroEyebrow ? (
                <p className={styles.heroEyebrow} data-aos="fade-up">
                  {heroEyebrow}
                </p>
              ) : null}
              {heroTitle ? (
                <h1 className={styles.heroTitle} data-aos="fade-up" data-aos-delay="60">
                  {heroTitle}
                </h1>
              ) : null}
              <p className={styles.heroFigure} aria-live="polite" data-aos="fade-up" data-aos-delay="120">
                <span className={styles.heroFigureNumeral}>
                  {showSkeleton ? '–' : resultsCount.toLocaleString('en-GB')}
                </span>
                <span className={styles.heroFigureLabel}>{countLabel}</span>
              </p>
            </div>
            <div className={styles.heroSearchZone}>
              <div className={styles.search}>
                <span className={styles.searchIcon} aria-hidden="true">
                  <Search size={18} strokeWidth={2} />
                </span>
                <input
                  className={styles.searchField}
                  type="search"
                  placeholder={searchPlaceholder}
                  value={search}
                  aria-label={searchPlaceholder}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <SelectChip
                id="inventory-make"
                icon={<CarFront size={15} strokeWidth={2} />}
                value={make}
                options={makeSelectOptions}
                onChange={setMake}
                ariaLabel="Make"
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-label={countLabel}>
        <div className={styles.wideInner}>
          {/* ---- Toolbar: 2-row ledger (build-rules §10 / spec unique move) ---- */}
          <div className={styles.toolbar}>
            {/* Row 1 — the ledger line: small "In stock N" caption → hairline → chips */}
            <div className={styles.ledgerRow}>
              <p className={styles.resultsCaption} aria-live="polite">
                {countLabel} <strong>{showSkeleton ? '–' : resultsCount.toLocaleString('en-GB')}</strong>
              </p>
              <span className={styles.rule} aria-hidden="true" />
              <div className={styles.cluster}>
                <button
                  type="button"
                  className={`${styles.chip} ${filtersOpen ? styles.chipActive : ''}`.trim()}
                  onClick={() => setFiltersOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={filtersOpen}
                >
                  <SlidersHorizontal className={styles.chipIcon} size={16} strokeWidth={2} aria-hidden="true" />
                  <span>{filtersLabel}</span>
                </button>
                {wishlistChip(styles.clusterChip)}
                {compareChip(styles.clusterChip)}
              </div>
            </div>

            {/* Row 2 — control rail (scroll-snap on mobile); search + Make now in hero */}
            <div className={styles.controlsRow}>
              <div className={styles.fieldRail}>
                <SelectChip
                  id="inventory-body"
                  className={styles.railSelect}
                  icon={<SlidersHorizontal size={15} strokeWidth={2} />}
                  value={body}
                  options={bodySelectOptions}
                  onChange={setBody}
                  ariaLabel="Body type"
                />
                <SelectChip
                  id="inventory-sort"
                  icon={<ArrowUpDown size={15} strokeWidth={2} />}
                  value={sort}
                  options={sortSelectOptions}
                  onChange={setSort}
                  ariaLabel={sortLabel}
                />
                {wishlistChip(styles.railChip)}
                {compareChip(styles.railChip)}
              </div>
            </div>
          </div>

          {/* ---- Grid / states ---------------------------------------------- */}
          {showSkeleton ? (
            <div className={styles.grid} aria-hidden="true">
              {Array.from({ length: 8 }).map((_, index) => (
                <VehicleCard key={`skeleton-${index}`} loading />
              ))}
            </div>
          ) : showEmpty ? (
            emptyState
          ) : (
            <div className={styles.grid}>
              {visibleVehicles.map((vehicle, index) => (
                // Gentle staggered reveal per card — delay capped at 4 steps so a
                // full page doesn't drag (0 / 80 / 160 / 240ms). The wrapper is a
                // grid-stretch cell so the shared VehicleCard still fills its slot;
                // VehicleCard is furnished separately and is not edited here.
                <div
                  key={vehicle.id}
                  className={styles.cardReveal}
                  data-aos="fade-up"
                  data-aos-delay={String(Math.min(index, 3) * 80)}
                >
                  <VehicleCard vehicle={vehicle} />
                </div>
              ))}
            </div>
          )}

          {/* ---- Pagination -------------------------------------------------- */}
          {!showSkeleton && !showEmpty && totalPages > 1 ? (
            <nav className={styles.pagination} aria-label="Pagination">
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} strokeWidth={2} />
              </button>
              {paginationItems.map((item, index) =>
                item === '...' ? (
                  <span key={`ellipsis-${index}`} className={styles.pageEllipsis} aria-hidden="true">
                    …
                  </span>
                ) : (
                  <button
                    key={`page-${item}`}
                    type="button"
                    className={`${styles.pageButton} ${item === page ? styles.pageButtonActive : ''}`.trim()}
                    onClick={() => handlePageChange(item)}
                    aria-current={item === page ? 'page' : undefined}
                  >
                    {item}
                  </button>
                ),
              )}
              <button
                type="button"
                className={styles.pageButton}
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={16} strokeWidth={2} />
              </button>
            </nav>
          ) : null}
        </div>
      </section>

      {/* ---- Filter sheet (floating chrome — full-screen on mobile) --------- */}
      <div
        className={styles.sheet}
        hidden={!filtersOpen}
        role="dialog"
        aria-modal="true"
        aria-label={filtersLabel}
        ref={sheetRef}
      >
        <button
          type="button"
          className={styles.sheetScrim}
          aria-label="Close filters"
          tabIndex={-1}
          onClick={closeSheet}
        />
        <div className={styles.sheetPanel}>
          <div className={styles.sheetHeader}>
            <h2 className={styles.sheetTitle}>{filtersLabel}</h2>
            <button type="button" className={styles.sheetReset} onClick={resetFilters}>
              {resetLabel}
            </button>
            <button
              type="button"
              className={styles.sheetClose}
              onClick={closeSheet}
              aria-label="Close filters"
              data-sheet-close
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <div className={styles.sheetBody}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Make</span>
              <select className={styles.fieldSelect} value={make} onChange={(event) => setMake(event.target.value)}>
                {makeSelectOptions.map((option) => (
                  <option key={`sheet-make-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Body type</span>
              <select className={styles.fieldSelect} value={body} onChange={(event) => setBody(event.target.value)}>
                {bodySelectOptions.map((option) => (
                  <option key={`sheet-body-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Fuel</span>
              <select className={styles.fieldSelect} value={fuel} onChange={(event) => setFuel(event.target.value)}>
                {fuels.map((item) => (
                  <option key={`sheet-fuel-${item}`} value={item}>
                    {item === 'All' ? 'All fuel types' : item}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Transmission</span>
              <select
                className={styles.fieldSelect}
                value={transmission}
                onChange={(event) => setTransmission(event.target.value)}
              >
                {transmissions.map((item) => (
                  <option key={`sheet-trans-${item}`} value={item}>
                    {item === 'All' ? 'All gearboxes' : item}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Price</span>
              <select
                className={styles.fieldSelect}
                value={selectedPriceRangeValue}
                onChange={(event) => {
                  const selected = priceRangeSelectOptions.find((option) => option.value === event.target.value)
                  if (!selected) return
                  setMinPrice(selected.min)
                  setMaxPrice(selected.max)
                }}
              >
                {priceRangeSelectOptions.map((option) => (
                  <option key={`sheet-price-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>Year</span>
              <select
                className={styles.fieldSelect}
                value={selectedYearRangeValue}
                onChange={(event) => {
                  const selected = yearRangeSelectOptions.find((option) => option.value === event.target.value)
                  if (!selected) return
                  setMinYear(selected.min)
                  setMaxYear(selected.max)
                }}
              >
                {yearRangeSelectOptions.map((option) => (
                  <option key={`sheet-year-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className={styles.sheetFooter}>
            <button type="button" className={styles.sheetApply} onClick={closeSheet}>
              {showSkeleton ? filtersLabel : `Show ${resultsCount.toLocaleString('en-GB')}`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
