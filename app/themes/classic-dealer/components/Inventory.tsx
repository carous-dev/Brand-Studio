"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock, Filter, X, Heart, GitCompareArrows } from 'lucide-react'
import Link from 'next/link'
import InventoryCard from './InventoryCard'
import InventorySkeleton from './InventorySkeleton'
import Loader from './Loader'
import '../styles/inventory-skeleton.css'

type Vehicle = {
    reg: string
    registration?: string
    make: string
    model: string
    derivative?: string
    year?: number
    price?: number
    mileage?: number
    image?: string
    subTitle?: string
    features?: string[]
    images?: string[]
    fuel?: string
    fuel_type?: string
    trans?: string
    transmission?: string
    slug?: string
    description?: string
    stock_status?: string
    body_type?: string
    bodyType?: string
    body?: string
    colour?: string
    color?: string
    first_reg_date?: string
    first_registration_date?: string
}

type Option = { label: string; value: string }
type PaginationItem = number | 'ellipsis'
type InventoryViewMode = 'grid' | 'list'

const MAX_PRICE_OPTIONS: Option[] = [
    { label: 'No Limit', value: '' },
    { label: '\u00A35,000', value: '5000' },
    { label: '\u00A310,000', value: '10000' },
    { label: '\u00A315,000', value: '15000' },
    { label: '\u00A320,000', value: '20000' },
    { label: '\u00A330,000', value: '30000' },
    { label: '\u00A350,000', value: '50000' },
]

const MAX_MILEAGE_OPTIONS: Option[] = [
    { label: 'No Limit', value: '' },
    { label: '25,000 miles', value: '25000' },
    { label: '50,000 miles', value: '50000' },
    { label: '75,000 miles', value: '75000' },
    { label: '100,000 miles', value: '100000' },
    { label: '150,000 miles', value: '150000' },
]

const SORT_OPTIONS: Option[] = [
    { label: 'Latest Arrivals', value: 'newest' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Lowest Mileage', value: 'mileage' },
]

const WISHLIST_STORAGE_PREFIX = 'vp-vehicle-wishlist:'
const COMPARE_STORAGE_PREFIX = 'vp-vehicle-compare:'
const INVENTORY_VIEW_MODE_STORAGE_KEY = 'vp-inventory-view-mode'
const INVENTORY_VIEW_MODE_COOKIE_KEY = 'vp_inventory_view_mode'
const INVENTORY_VIEW_MODE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function normalizeViewMode(value: unknown): InventoryViewMode {
    return String(value ?? '').trim().toLowerCase() === 'list' ? 'list' : 'grid'
}

function mapSortToApi(val: string) {
    switch (val) {
        case 'price-asc': return 'price_asc'
        case 'price-desc': return 'price_desc'
        case 'mileage': return 'mileage_asc'
        case 'newest': return 'newest'
        default: return 'newest'
    }
}

function mapSortFromApi(val: string) {
    switch (val) {
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
            return 'newest'
    }
}

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pageSet = new Set<number>([
        1,
        totalPages,
        currentPage - 1,
        currentPage,
        currentPage + 1,
    ])

    if (currentPage <= 3) {
        pageSet.add(2)
        pageSet.add(3)
        pageSet.add(4)
    }

    if (currentPage >= totalPages - 2) {
        pageSet.add(totalPages - 1)
        pageSet.add(totalPages - 2)
        pageSet.add(totalPages - 3)
    }

    const pages = Array.from(pageSet)
        .filter((p) => p >= 1 && p <= totalPages)
        .sort((a, b) => a - b)

    const items: PaginationItem[] = []
    let prev: number | null = null

    for (const p of pages) {
        if (prev !== null) {
            const gap = p - prev
            if (gap === 2) {
                items.push(prev + 1)
            } else if (gap > 2) {
                items.push('ellipsis')
            }
        }
        items.push(p)
        prev = p
    }

    return items
}

function getStoredFlagCount(prefix: string): number {
    try {
        const savedPaths = new Set<string>()
        const keys = Object.keys(window.localStorage)

        for (const key of keys) {
            if (!key.startsWith(prefix)) continue
            if (window.localStorage.getItem(key) !== '1') continue

            const normalizedPath = normalizeSavedVehiclePath(key.slice(prefix.length))
            if (!normalizedPath.startsWith('/used-cars/')) continue
            savedPaths.add(normalizedPath)
        }

        return savedPaths.size
    } catch {
        return 0
    }
}

function normalizeSavedVehiclePath(path: string): string {
    const withoutQuery = String(path || '').split('?')[0].split('#')[0].trim()
    if (!withoutQuery) return ''

    const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
    if (withLeadingSlash === '/') return '/'

    return withLeadingSlash.replace(/\/+$/, '')
}

export default function Inventory({
    items,
    noResultsMessage,
    initialViewMode,
}: {
    items?: Vehicle[]
    noResultsMessage?: string
    initialViewMode?: InventoryViewMode
}) {
    const [vehicles, setVehicles] = useState<Vehicle[]>(items || [])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [perPage] = useState<number>(12)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [totalResults, setTotalResults] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [fetchedOnce, setFetchedOnce] = useState<boolean>(false)

    const [sort, setSort] = useState<string>('newest')

    // Applied filters (used by API requests)
    const [make, setMake] = useState<string>('')
    const [model, setModel] = useState<string>('')
    const [fuel, setFuel] = useState<string>('')
    const [maxPrice, setMaxPrice] = useState<string>('')
    const [maxMileage, setMaxMileage] = useState<string>('')

    // Draft filters (edited in sidebar, applied on button click)
    const [draftMake, setDraftMake] = useState<string>('')
    const [draftModel, setDraftModel] = useState<string>('')
    const [draftFuel, setDraftFuel] = useState<string>('')
    const [draftMaxPrice, setDraftMaxPrice] = useState<string>('')
    const [draftMaxMileage, setDraftMaxMileage] = useState<string>('')

    const [availableMakes, setAvailableMakes] = useState<string[]>([])
    const [availableFuels, setAvailableFuels] = useState<string[]>([])
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
    const [wishlistCount, setWishlistCount] = useState<number>(0)
    const [compareCount, setCompareCount] = useState<number>(0)
    const [viewMode, setViewMode] = useState<InventoryViewMode>(normalizeViewMode(initialViewMode))
    const [isCompactViewport, setIsCompactViewport] = useState(false)

    const modelOptions = useMemo(() => {
        const values = new Set<string>()
        for (const v of vehicles) {
            if (v?.model) values.add(String(v.model))
        }
        return Array.from(values).sort((a, b) => a.localeCompare(b))
    }, [vehicles])

    useEffect(() => {
        let aborted = false
        const controller = new AbortController()

        async function load() {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                params.set('page', String(currentPage))
                params.set('per_page', String(perPage))
                params.set('sort', mapSortToApi(sort))

                if (make) params.set('make', make)
                if (model) params.set('model', model)
                if (fuel) params.set('fuel', fuel)
                if (maxPrice) params.set('max_price', maxPrice)
                if (maxMileage) params.set('max_mileage', maxMileage)

                const res = await fetch(`/api/inventory?${params.toString()}`, { signal: controller.signal, cache: 'no-store' })
                if (!res.ok) throw new Error('Failed to fetch inventory')

                const payload = await res.json()
                if (aborted) return

                const nextItems: Vehicle[] = Array.isArray(payload.items) ? payload.items : []
                setVehicles(nextItems)
                setTotalResults(payload.meta?.total ?? nextItems.length ?? 0)
                setTotalPages(payload.meta?.totalPages ?? 1)

                const makeValues = Array.isArray(payload.meta?.available?.makes) ? payload.meta.available.makes.filter(Boolean) : []
                setAvailableMakes(makeValues)

                const fuelValuesFromApi = Array.isArray(payload.meta?.available?.fuel_types)
                    ? payload.meta.available.fuel_types.filter(Boolean)
                    : []

                if (fuelValuesFromApi.length) {
                    setAvailableFuels(fuelValuesFromApi)
                } else {
                    const fallbackFuelValues: string[] = Array.from(
                        new Set<string>(
                            nextItems
                                .map((it) => (it?.fuel ? String(it.fuel).trim() : ''))
                                .filter((value) => value.length > 0)
                        )
                    ).sort((a, b) => a.localeCompare(b))
                    setAvailableFuels(fallbackFuelValues)
                }
            } catch {
                if (!aborted) {
                    setVehicles([])
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
    }, [currentPage, perPage, sort, make, model, fuel, maxPrice, maxMileage])

    useEffect(() => {
        if (typeof window === 'undefined') return
        try {
            window.localStorage.setItem(INVENTORY_VIEW_MODE_STORAGE_KEY, viewMode)
        } catch {
            // ignore storage failures
        }

        document.cookie = `${INVENTORY_VIEW_MODE_COOKIE_KEY}=${viewMode}; Max-Age=${INVENTORY_VIEW_MODE_COOKIE_MAX_AGE}; Path=/; SameSite=Lax`
    }, [viewMode])

    useEffect(() => {
        if (typeof window === 'undefined') return

        const query = window.matchMedia('(max-width: 900px)')
        const sync = () => {
            setIsCompactViewport(query.matches)
        }

        sync()
        if (typeof query.addEventListener === 'function') {
            query.addEventListener('change', sync)
            return () => query.removeEventListener('change', sync)
        }

        query.addListener(sync)
        return () => query.removeListener(sync)
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return

        const syncCounts = () => {
            setWishlistCount(getStoredFlagCount(WISHLIST_STORAGE_PREFIX))
            setCompareCount(getStoredFlagCount(COMPARE_STORAGE_PREFIX))
        }

        const handleStorage = (event: StorageEvent) => {
            if (
                !event.key ||
                event.key.startsWith(WISHLIST_STORAGE_PREFIX) ||
                event.key.startsWith(COMPARE_STORAGE_PREFIX)
            ) {
                syncCounts()
            }
        }

        syncCounts()
        window.addEventListener('storage', handleStorage)
        window.addEventListener('vp:wishlist-updated', syncCounts)
        window.addEventListener('vp:compare-updated', syncCounts)

        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('vp:wishlist-updated', syncCounts)
            window.removeEventListener('vp:compare-updated', syncCounts)
        }
    }, [])

    useEffect(() => {
        if (!isMobileFilterOpen) return
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [isMobileFilterOpen])

    useEffect(() => {
        if (!isMobileFilterOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMobileFilterOpen(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isMobileFilterOpen])

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) {
                setIsMobileFilterOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    useEffect(() => {
        try {
            if (typeof window === 'undefined') return
            const params = new URLSearchParams(window.location.search)
            const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1)
            const nextSort = mapSortFromApi(params.get('sort') || 'newest')

            const nextMake = params.get('make') || ''
            const nextModel = params.get('model') || ''
            const nextFuel = params.get('fuel') || ''
            const nextMaxPrice = params.get('max_price') || ''
            const nextMaxMileage = params.get('max_mileage') || ''

            setCurrentPage(page)
            setSort(nextSort)

            setMake(nextMake)
            setModel(nextModel)
            setFuel(nextFuel)
            setMaxPrice(nextMaxPrice)
            setMaxMileage(nextMaxMileage)

            setDraftMake(nextMake)
            setDraftModel(nextModel)
            setDraftFuel(nextFuel)
            setDraftMaxPrice(nextMaxPrice)
            setDraftMaxMileage(nextMaxMileage)
        } catch {
            // ignore URL parsing errors
        }
    }, [])

    useEffect(() => {
        try {
            if (typeof window === 'undefined') return
            const params = new URLSearchParams()

            params.set('per_page', String(perPage))
            params.set('sort', mapSortToApi(sort))
            if (make) params.set('make', make.trim())
            if (model) params.set('model', model.trim())
            if (fuel) params.set('fuel', fuel.trim())
            if (maxPrice) params.set('max_price', maxPrice)
            if (maxMileage) params.set('max_mileage', maxMileage)
            if (currentPage > 1) params.set('page', String(currentPage))

            const base = window.location.pathname.replace(/\/?$/, '')
            const nextUrl = `${base}?${params.toString()}`
            window.history.replaceState(null, '', nextUrl)
        } catch {
            // ignore history API errors
        }
    }, [sort, make, model, fuel, maxPrice, maxMileage, currentPage, perPage])

    function applyFilters(closeMobileModal = false) {
        setMake(draftMake)
        setModel(draftModel)
        setFuel(draftFuel)
        setMaxPrice(draftMaxPrice)
        setMaxMileage(draftMaxMileage)
        setCurrentPage(1)
        if (closeMobileModal) {
            setIsMobileFilterOpen(false)
        }
    }

    function clearFilters(closeMobileModal = false) {
        setDraftMake('')
        setDraftModel('')
        setDraftFuel('')
        setDraftMaxPrice('')
        setDraftMaxMileage('')
        setMake('')
        setModel('')
        setFuel('')
        setMaxPrice('')
        setMaxMileage('')
        setCurrentPage(1)
        if (closeMobileModal) {
            setIsMobileFilterOpen(false)
        }
    }

    function goToPage(pageNumber: number) {
        const nextPage = Math.max(1, Math.min(totalPages, pageNumber))
        setCurrentPage(nextPage)
        try {
            const el = document.getElementById('inventoryResultsGrid')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } catch {
            // ignore scroll errors
        }
    }

    const paginationItems = getPaginationItems(currentPage, totalPages)

    const showEmpty = fetchedOnce && !loading && vehicles.length === 0
    const showPagination = totalPages > 1 && !showEmpty
    const shownCount = Math.min(totalResults, ((currentPage - 1) * perPage) + vehicles.length)
    const activeFilterCount = [make, model, fuel, maxPrice, maxMileage].filter(Boolean).length
    const effectiveViewMode: InventoryViewMode = isCompactViewport ? 'grid' : viewMode

    const renderFilterFields = (idPrefix: string) => (
        <>
            <div className="inventory-filter-field">
                <label htmlFor={`${idPrefix}-filter-make`}>Make</label>
                <select id={`${idPrefix}-filter-make`} value={draftMake} onChange={(e) => setDraftMake(e.target.value)}>
                    <option value="">Any Make</option>
                    {availableMakes.map((item) => (
                        <option key={`${idPrefix}-make-${item}`} value={item}>{item}</option>
                    ))}
                </select>
            </div>

            <div className="inventory-filter-field">
                <label htmlFor={`${idPrefix}-filter-model`}>Model</label>
                <select id={`${idPrefix}-filter-model`} value={draftModel} onChange={(e) => setDraftModel(e.target.value)}>
                    <option value="">Any Model</option>
                    {modelOptions.map((item) => (
                        <option key={`${idPrefix}-model-${item}`} value={item}>{item}</option>
                    ))}
                </select>
            </div>

            <div className="inventory-filter-field">
                <label htmlFor={`${idPrefix}-filter-max-price`}>Max Price</label>
                <select id={`${idPrefix}-filter-max-price`} value={draftMaxPrice} onChange={(e) => setDraftMaxPrice(e.target.value)}>
                    {MAX_PRICE_OPTIONS.map((option) => (
                        <option key={`${idPrefix}-price-${option.label}`} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>

            <div className="inventory-filter-field">
                <label htmlFor={`${idPrefix}-filter-max-mileage`}>Max Mileage</label>
                <select id={`${idPrefix}-filter-max-mileage`} value={draftMaxMileage} onChange={(e) => setDraftMaxMileage(e.target.value)}>
                    {MAX_MILEAGE_OPTIONS.map((option) => (
                        <option key={`${idPrefix}-mileage-${option.label}`} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </div>

            <div className="inventory-filter-field">
                <label htmlFor={`${idPrefix}-filter-fuel`}>Fuel Type</label>
                <select id={`${idPrefix}-filter-fuel`} value={draftFuel} onChange={(e) => setDraftFuel(e.target.value)}>
                    <option value="">Any Fuel</option>
                    {availableFuels.map((item) => (
                        <option key={`${idPrefix}-fuel-${item}`} value={item}>{item}</option>
                    ))}
                </select>
            </div>
        </>
    )

    return (
        <section className="inventory-modern container" aria-label="Inventory">
            <div className="inventory-shell-modern">
                <aside className="inventory-filter-panel" aria-label="Refine your search">
                    <h2 className="inventory-filter-title">Refine Your Search</h2>
                    {renderFilterFields('desktop')}
                    <div className="inventory-filter-actions">
                        <button type="button" className="inventory-filter-clear-btn" onClick={() => clearFilters()}>
                            Clear
                        </button>
                        <button type="button" className="inventory-filter-apply-btn" onClick={() => applyFilters()}>
                            Apply Filters
                        </button>
                    </div>
                </aside>

                <div className={effectiveViewMode === 'list' ? 'inventory-results-panel inventory-content is-list-view' : 'inventory-results-panel inventory-content'}>
                    <div className="inventory-results-toolbar">
                        <p className="inventory-results-count">
                            Showing <strong>{shownCount}</strong> of <strong>{totalResults}</strong> quality used cars
                        </p>

                        <div className="inventory-toolbar-controls">
                            {!isCompactViewport ? (
                                <div className="inventory-view-toggle" role="group" aria-label="Inventory view mode">
                                    <button
                                        type="button"
                                        className={effectiveViewMode === 'grid' ? 'inventory-view-btn is-active' : 'inventory-view-btn'}
                                        aria-pressed={effectiveViewMode === 'grid'}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        Grid
                                    </button>
                                    <button
                                        type="button"
                                        className={effectiveViewMode === 'list' ? 'inventory-view-btn is-active' : 'inventory-view-btn'}
                                        aria-pressed={effectiveViewMode === 'list'}
                                        onClick={() => setViewMode('list')}
                                    >
                                        List
                                    </button>
                                </div>
                            ) : null}

                            <div className="inventory-toolbar-counters" aria-label="Wishlist and compare counters">
                                <Link
                                    href="/wishlist"
                                    className="inventory-toolbar-counter has-count"
                                    aria-label={`Wishlist (${wishlistCount})`}
                                    title={`Wishlist: ${wishlistCount}`}
                                >
                                    <Heart size={15} aria-hidden="true" />
                                    <strong>{wishlistCount}</strong>
                                </Link>
                                <Link
                                    href="/compare"
                                    className="inventory-toolbar-counter compare has-count"
                                    aria-label={`Compare (${compareCount})`}
                                    title={`Compare: ${compareCount}`}
                                >
                                    <GitCompareArrows size={15} aria-hidden="true" />
                                    <strong>{compareCount}</strong>
                                </Link>
                            </div>

                            <div className="inventory-sort-block">
                                <label htmlFor="inventory-sort-select">Sort by</label>
                                <select
                                    id="inventory-sort-select"
                                    className="inventory-sort-select"
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option key={option.label} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading && vehicles.length === 0 ? (
                        <div className={effectiveViewMode === 'list' ? 'inventory-results-grid is-list-view' : 'inventory-results-grid'}>
                            <InventorySkeleton count={perPage} />
                        </div>
                    ) : !showEmpty ? (
                        <div id="inventoryResultsGrid" className={effectiveViewMode === 'list' ? 'inventory-results-grid is-list-view' : 'inventory-results-grid'}>
                            {loading ? (
                                <InventorySkeleton count={perPage} />
                            ) : (
                                vehicles.map((vehicle, index) => (
                                    <InventoryCard
                                        key={`${vehicle.reg || 'vehicle'}-${index}`}
                                        vehicle={vehicle}
                                        viewMode={effectiveViewMode}
                                    />
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="inventory-empty-wrapper">
                            <div className="inventory-empty" role="status" aria-live="polite">
                                <Clock className="inventory-empty-icon" size={64} strokeWidth={1.5} aria-hidden="true" />
                                <p className="inventory-empty-message">{noResultsMessage || "Nothing's available right now - we're refreshing our stock."}</p>
                                <p className="inventory-empty-sub">New vehicles arrive frequently. Please check back shortly or contact us for availability.</p>
                            </div>
                        </div>
                    )}

                    {showPagination && (
                        <div className="inventory-pagination-wrap">
                            <p className="inventory-pagination-summary">
                                Page {currentPage} of {totalPages}
                            </p>
                            <nav className="inventory-pagination" aria-label="Inventory pagination">
                                <button
                                    type="button"
                                    className="inventory-page-btn inventory-page-nav"
                                    disabled={currentPage === 1}
                                    aria-disabled={currentPage === 1}
                                    onClick={() => goToPage(currentPage - 1)}
                                >
                                    <ChevronLeft size={14} aria-hidden="true" />
                                    <span>Previous</span>
                                </button>

                                {paginationItems.map((item, index) => {
                                    if (item === 'ellipsis') {
                                        return <span key={`ellipsis-${index}`} className="inventory-page-ellipsis" aria-hidden="true">...</span>
                                    }

                                    return (
                                        <button
                                            key={item}
                                            type="button"
                                            className={item === currentPage ? 'inventory-page-btn is-active' : 'inventory-page-btn'}
                                            aria-current={item === currentPage ? 'page' : undefined}
                                            onClick={() => goToPage(item)}
                                        >
                                            {item}
                                        </button>
                                    )
                                })}

                                <button
                                    type="button"
                                    className="inventory-page-btn inventory-page-nav"
                                    disabled={currentPage === totalPages}
                                    aria-disabled={currentPage === totalPages}
                                    onClick={() => goToPage(currentPage + 1)}
                                >
                                    <span>Next</span>
                                    <ChevronRight size={14} aria-hidden="true" />
                                </button>
                            </nav>
                        </div>
                    )}
                </div>
            </div>

            <button
                type="button"
                className="inventory-mobile-filter-fab"
                aria-controls="inventoryMobileFilterModal"
                aria-expanded={isMobileFilterOpen}
                onClick={() => setIsMobileFilterOpen(true)}
            >
                <Filter size={16} />
                <span>Filters</span>
                {activeFilterCount > 0 ? <strong>{activeFilterCount}</strong> : null}
            </button>

            {isMobileFilterOpen ? (
                <div
                    id="inventoryMobileFilterModal"
                    className="inventory-mobile-filter-modal is-open"
                    aria-hidden="false"
                >
                    <button
                        type="button"
                        className="inventory-mobile-filter-backdrop"
                        aria-label="Close filters"
                        onClick={() => setIsMobileFilterOpen(false)}
                    />
                    <div className="inventory-mobile-filter-sheet" role="dialog" aria-modal="true" aria-labelledby="inventoryMobileFilterTitle">
                        <header className="inventory-mobile-filter-head">
                            <h2 id="inventoryMobileFilterTitle">Refine Your Search</h2>
                            <button
                                type="button"
                                className="inventory-mobile-filter-close"
                                aria-label="Close filters"
                                onClick={() => setIsMobileFilterOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <div className="inventory-mobile-filter-body">
                            {renderFilterFields('mobile')}
                        </div>

                        <div className="inventory-mobile-filter-actions">
                            <button type="button" className="inventory-filter-clear-btn" onClick={() => clearFilters(true)}>
                                Clear
                            </button>
                            <button type="button" className="inventory-filter-apply-btn" onClick={() => applyFilters(true)}>
                                Show Results
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {loading && vehicles.length > 0 && (
                <div className="loader-fullwidth-wrapper">
                    <Loader overlay={false} aria-hidden={false} />
                </div>
            )}
        </section>
    )
}
