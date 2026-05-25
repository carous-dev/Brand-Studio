"use client"

import { useMemo, useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CarFront,
  Filter,
  Fuel,
  Gauge,
  GitCompare,
  Heart,
  LayoutGrid,
  MapPin,
  Palette,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react'
import styles from './page.module.css'
import { useGarage, type SavedVehicle } from '../../context/GarageContext'
import { useBrand } from '../../context/BrandClientWrapper'
import { apiUrl } from '../../lib/api'
import { normalizeInventoryItem, type InventoryMeta, type InventoryVehicle } from '../../lib/inventory'
import { buildVehiclePermalink } from '../../lib/vehicle-links'
import { HeroBackdrop } from '../../components/HeroBackdrop'

type Vehicle = InventoryVehicle

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

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
  image: vehicle.image
})

export default function UsedCarsClient({
  initialVehicles,
  initialMeta
}: {
  initialVehicles: Vehicle[]
  initialMeta?: InventoryMeta | null
}) {
  const { toggleWishlist, toggleCompare, isWishlisted, isCompared } = useGarage()
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
  const sortOptions = useMemo(() => ['newest', 'price-asc', 'price-desc', 'mileage'], [])

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

  const activeFilters = useMemo(() => {
    const chips = [] as string[]
    if (make !== 'All') chips.push(make)
    if (body !== 'All') chips.push(body)
    if (fuel !== 'All') chips.push(fuel)
    if (transmission !== 'All') chips.push(transmission)
    if (minPrice > priceBounds.min || (priceBounds.max > 0 && maxPrice < priceBounds.max)) {
      chips.push(`Price ${formatPrice(minPrice)}-${formatPrice(maxPrice)}`)
    }
    if (minYear > yearBounds.min || (yearBounds.max > 0 && maxYear < yearBounds.max)) {
      chips.push(`Year ${minYear}-${maxYear}`)
    }
    if (maxMileage) chips.push(`Under ${Number(maxMileage).toLocaleString()} mi`)
    if (search.trim()) chips.push(`Search “${search.trim()}”`)
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

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage)
  }

  const visibleVehicles = filteredVehicles
  const noInventory = fetchedOnce && !loading && vehicles.length === 0
  const showSkeleton = loading && vehicles.length === 0
  const showFilterEmpty = !noInventory && !showSkeleton && fetchedOnce && !loading && visibleVehicles.length === 0
  const resultsCount = typeof inventoryMeta?.total === 'number' ? inventoryMeta.total : totalResults
  const brandName = brand?.name || 'this dealership'
  const address = (brand as any)?.location?.address || {}
  const area = [address.city, address.county].filter(Boolean).join(', ')

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <HeroBackdrop />
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>{'> '}stock.log</p>
            <h1 className={styles.heroTitle}>{area ? `Stock — ${area}` : 'Stock'}</h1>
            <p className={styles.heroLead}>
              The full floor at {brandName}. Prepped, inspected, ready to drive.
              Finance, part-exchange and nationwide delivery built in.
            </p>
          </div>
          <div className={styles.heroHighlights}>
            <div className={styles.heroHighlight}>
              <BadgeCheck size={18} strokeWidth={2} />
              Privately sourced stock
            </div>
            <div className={styles.heroHighlight}>
              <MapPin size={18} strokeWidth={2} />
              {area || 'Contact the showroom'}
            </div>
            <div className={styles.heroHighlight}>
              <Gauge size={18} strokeWidth={2} />
              Fully inspected & prepared
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionInner}>
          {noInventory ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon} aria-hidden="true">
                <CarFront size={48} strokeWidth={1.6} />
                <span className={styles.emptyStateIconBadge}>
                  <X size={18} strokeWidth={2} />
                </span>
              </div>
              <h3>No vehicles available right now.</h3>
              <p>Please check back soon or contact us for upcoming stock.</p>
            </div>
          ) : (
            <>
              <div className={styles.toolbar}>
                {showSkeleton ? (
                  <>
                    <div className={`${styles.skeleton} ${styles.skeletonSearch}`} />
                    <div className={styles.toolbarActions}>
                      <div className={styles.topbarControls}>
                        <div className={`${styles.skeleton} ${styles.skeletonSelect}`} />
                        <div className={`${styles.skeleton} ${styles.skeletonSelect}`} />
                        <div className={`${styles.skeleton} ${styles.skeletonSelect}`} />
                      </div>
                      <div className={`${styles.skeleton} ${styles.skeletonButton}`} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.searchInput}>
                      <Search size={18} strokeWidth={2} />
                      <input
                        type="search"
                        placeholder="Search by make, model, or keyword"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                    </div>
                    <div className={styles.toolbarActions}>
                      <div className={styles.topbarControls}>
                        <div className={styles.sortSelect}>
                          <label htmlFor="sort">Sort by</label>
                          <select id="sort" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort by">
                            <option value="newest">Newest</option>
                            <option value="price-asc">Price: Low to high</option>
                            <option value="price-desc">Price: High to low</option>
                            <option value="mileage">Lowest mileage</option>
                          </select>
                        </div>
                        <div className={styles.priceRangeSelect}>
                          <label htmlFor="price-range-topbar">Price</label>
                          <select
                            id="price-range-topbar"
                            value={selectedPriceRangeValue}
                            aria-label="Price"
                            onChange={(event) => {
                              const selected = priceRangeSelectOptions.find((option) => option.value === event.target.value)
                              if (!selected) return
                              setMinPrice(selected.min)
                              setMaxPrice(selected.max)
                            }}
                          >
                            {priceRangeSelectOptions.map((option) => (
                              <option key={`price-range-${option.value}`} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.yearRangeSelect}>
                          <label htmlFor="year-range-topbar">Year</label>
                          <select
                            id="year-range-topbar"
                            value={selectedYearRangeValue}
                            aria-label="Year"
                            onChange={(event) => {
                              const selected = yearRangeSelectOptions.find((option) => option.value === event.target.value)
                              if (!selected) return
                              setMinYear(selected.min)
                              setMaxYear(selected.max)
                            }}
                          >
                            {yearRangeSelectOptions.map((option) => (
                              <option key={`year-range-${option.value}`} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.filterToggle}
                        onClick={() => setFiltersOpen((open) => !open)}
                        aria-expanded={filtersOpen}
                      >
                        <Filter size={18} strokeWidth={2} />
                        Filters
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.contentGrid}>
                <aside className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ''}`}>
                  {showSkeleton ? (
                    <>
                      <div className={styles.skeletonFilterHeader}>
                        <div className={`${styles.skeleton} ${styles.skeletonLineWide}`} />
                        <div className={`${styles.skeleton} ${styles.skeletonButtonSmall}`} />
                      </div>
                      <div className={styles.skeletonFilterControls}>
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div key={`filter-skeleton-${index}`} className={styles.skeletonFilterBlock}>
                            <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                            <div className={`${styles.skeleton} ${styles.skeletonSelect}`} />
                          </div>
                        ))}
                        <div className={styles.skeletonFilterBlock}>
                          <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                          <div className={`${styles.skeleton} ${styles.skeletonInput}`} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.filtersHeader}>
                        <div className={styles.filtersTitle}>
                          <LayoutGrid size={18} strokeWidth={2} />
                          <div>
                            <h2>Filters</h2>
                          </div>
                        </div>
                        <div className={styles.filtersMeta}>
                          <span className={styles.filtersCount}>{resultsCount} vehicles available</span>
                          <button type="button" className={styles.clearButton} onClick={resetFilters}>
                            <RefreshCcw size={16} strokeWidth={2} />
                            Reset
                          </button>
                        </div>
                      </div>

                      <div className={styles.filterControls}>
                        <div className={styles.filterGroup}>
                          <label>Make</label>
                          <select value={make} onChange={(event) => setMake(event.target.value)}>
                            {makes.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.filterGroup}>
                          <label>Body type</label>
                          <select value={body} onChange={(event) => setBody(event.target.value)}>
                            {bodies.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.filterGroup}>
                          <label>Fuel</label>
                          <select value={fuel} onChange={(event) => setFuel(event.target.value)}>
                            {fuels.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.filterGroup}>
                          <label>Transmission</label>
                          <select value={transmission} onChange={(event) => setTransmission(event.target.value)}>
                            {transmissions.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className={styles.filterGroup}>
                          <label>Max mileage</label>
                          <input
                            type="number"
                            value={maxMileage}
                            onChange={(event) => setMaxMileage(event.target.value)}
                            placeholder="e.g. 40000"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </aside>

                <div className={styles.results}>
                  <div className={styles.resultsHeader}>
                    {showSkeleton ? (
                      <div className={styles.skeletonResultsHeader}>
                        <div>
                          <div className={`${styles.skeleton} ${styles.skeletonLineWide}`} />
                          <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                        </div>
                        <div className={styles.skeletonPills}>
                          {Array.from({ length: 3 }).map((_, index) => (
                            <span key={`pill-${index}`} className={`${styles.skeleton} ${styles.skeletonPill}`} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h2>The log</h2>
                        </div>
                        {activeFilters.length > 0 ? (
                          <div className={styles.activeFilters}>
                            {activeFilters.map((filter) => (
                              <span key={filter} className={styles.activeFilterPill}>
                                {filter}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>

                  <div className={styles.cardGrid}>
                    {showFilterEmpty ? (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyStateIcon} aria-hidden="true">
                          <CarFront size={48} strokeWidth={1.6} />
                          <span className={styles.emptyStateIconBadge}>
                            <X size={18} strokeWidth={2} />
                          </span>
                        </div>
                        <h3>No vehicles match those filters.</h3>
                        <p>Try clearing a filter or broadening your search.</p>
                      </div>
                    ) : null}
                    {showSkeleton
                      ? Array.from({ length: perPage }).map((_, index) => (
                        <article key={`skeleton-${index}`} className={styles.skeletonCard}>
                          <div className={`${styles.skeleton} ${styles.skeletonMedia}`} />
                          <div className={styles.skeletonBody}>
                            <div className={`${styles.skeleton} ${styles.skeletonLineWide}`} />
                            <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                            <div className={styles.skeletonSpecRow}>
                              <span className={`${styles.skeleton} ${styles.skeletonChip}`} />
                              <span className={`${styles.skeleton} ${styles.skeletonChip}`} />
                              <span className={`${styles.skeleton} ${styles.skeletonChip}`} />
                            </div>
                            <div className={styles.skeletonSpecRow}>
                              <span className={`${styles.skeleton} ${styles.skeletonChip}`} />
                              <span className={`${styles.skeleton} ${styles.skeletonChip}`} />
                              <span className={`${styles.skeleton} ${styles.skeletonChip}`} />
                            </div>
                          </div>
                        </article>
                      ))
                      : visibleVehicles.map((vehicle) => {
                      const savedVehicle = toSavedVehicle(vehicle)
                      const wishlisted = isWishlisted(vehicle.id)
                      const compared = isCompared(vehicle.id)
                      return (
                        <article key={vehicle.id} className={styles.card}>
                          <div
                            className={styles.cardImage}
                            style={{ backgroundImage: `url(${vehicle.image})` }}
                            role="img"
                            aria-label={vehicle.title}
                          >
                            {vehicle.featured ? <span className={styles.featured}>Featured</span> : null}
                          </div>
                          <div className={styles.cardBody}>
                            <div className={styles.cardTitleRow}>
                              <h3 title={vehicle.title}>{vehicle.title}</h3>
                            </div>
                            <p className={styles.cardMeta}>
                              <span>{vehicle.make} · {vehicle.body} · {vehicle.color}</span>
                              <span className={styles.cardPrice}>{formatPrice(vehicle.price)}</span>
                            </p>
                            <div className={styles.cardSpecs}>
                              <span>
                                <Fuel size={16} strokeWidth={1.8} />
                                {vehicle.fuel}
                              </span>
                              <span>
                                <SlidersHorizontal size={16} strokeWidth={1.8} />
                                {vehicle.transmission}
                              </span>
                              <span>
                                <Gauge size={16} strokeWidth={1.8} />
                                {vehicle.mileage.toLocaleString()} mi
                              </span>
                              <span>
                                <Palette size={16} strokeWidth={1.8} />
                                {vehicle.color}
                              </span>
                            </div>
                            <div className={styles.cardFooter} />
                          </div>
                          <div className={styles.cardOverlay}>
                            <div className={styles.cardQuickActions}>
                              <button
                                type="button"
                                className={styles.iconButton}
                                data-active={compared}
                                aria-pressed={compared}
                                aria-label={compared ? "Remove from compare" : "Add to compare"}
                                onClick={() => toggleCompare(savedVehicle)}
                              >
                                <GitCompare size={16} strokeWidth={1.8} />
                              </button>
                              <button
                                type="button"
                                className={styles.iconButton}
                                data-active={wishlisted}
                                aria-pressed={wishlisted}
                                aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                                onClick={() => toggleWishlist(savedVehicle)}
                              >
                                <Heart size={16} strokeWidth={1.8} fill={wishlisted ? "currentColor" : "none"} />
                              </button>
                            </div>
                            <Link
                              href={buildVehiclePermalink({ slug: vehicle.slug || toSlug(vehicle.title), reg: vehicle.reg }, '/used-cars')}
                              className={styles.overlayButton}
                            >
                              View details
                              <ArrowUpRight size={16} strokeWidth={2} />
                            </Link>
                          </div>
                        </article>
                      )
                    })}
                  </div>

                  <div className={styles.pagination}>
                    <div className={styles.paginationMeta}>
                      Page {page} of {totalPages}
                    </div>
                    <div className={styles.paginationControls}>
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
                          <span key={`ellipsis-${index}`} className={styles.pageEllipsis}>
                            …
                          </span>
                        ) : (
                          <button
                            key={`page-${item}`}
                            type="button"
                            className={`${styles.pageButton} ${item === page ? styles.pageButtonActive : ''}`}
                            onClick={() => handlePageChange(item)}
                            aria-current={item === page ? 'page' : undefined}
                          >
                            {item}
                          </button>
                        )
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
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  )
}
