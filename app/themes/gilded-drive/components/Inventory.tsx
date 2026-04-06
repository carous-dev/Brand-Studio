"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Grid, Menu, Clock } from 'lucide-react'
import InventoryCard from './InventoryCard'
import InventorySkeleton from './InventorySkeleton'
import Loader from './Loader'
import '../styles/inventory-skeleton.css'

type Vehicle = {
    reg: string
    make: string
    model: string
    year?: number
    price?: number
    mileage?: number
    image?: string
    subTitle?: string
    features?: string[]
    images?: string[]
}

export default function Inventory({ items, noResultsMessage }: { items?: Vehicle[], noResultsMessage?: string }) {
    const [vehicles, setVehicles] = useState<Vehicle[]>(items || [])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [perPage] = useState<number>(12)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [totalResults, setTotalResults] = useState<number>(0)
    const [loading, setLoading] = useState<boolean>(false)
    const [fetchedOnce, setFetchedOnce] = useState<boolean>(false)
    const [overallMinPrice, setOverallMinPrice] = useState<number | null>(null)
    const [overallAvgMileage, setOverallAvgMileage] = useState<number | null>(null)

    // View state (grid | list) persisted to localStorage and applied as root class
    const [view, setView] = useState<'grid' | 'list'>('grid')

    // Load saved view preference from localStorage on client-side only
    useEffect(() => {
        try {
            const saved = localStorage.getItem('inventoryView')
            if (saved === 'list') {
                setView('list')
            }
        } catch (e) {
            // Ignore localStorage errors
        }
    }, [])

    // Save view preference to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('inventoryView', view)
        } catch (e) {
            // Ignore localStorage errors
        }
    }, [view])

    // filters
    const [q, setQ] = useState<string>('')
    const [make, setMake] = useState<string>('')
    const [body, setBody] = useState<string>('')
    const [model, setModel] = useState<string>('')
    const [sort, setSort] = useState<string>('price-asc')
    const [availableMakes, setAvailableMakes] = useState<string[]>([])
    const [availableBodies, setAvailableBodies] = useState<string[]>([])

    // Build model options from fetched entries (unique, sorted)
    // defined early so effects that reference it don't run into TDZ
    const modelOptions = useMemo(() => {
        try {
            const s = new Set<string>()
            for (const v of vehicles) {
                if (v && v.model) s.add(String(v.model))
            }
            return Array.from(s).sort((a, b) => a.localeCompare(b))
        } catch (e) { return [] }
    }, [vehicles])

    // Map UI sort values to API sort values
    function mapSortToApi(val: string) {
        switch (val) {
            case 'price-asc': return 'price_asc'
            case 'price-desc': return 'price_desc'
            case 'mileage': return 'mileage_asc'
            case 'newest': return 'newest'
            default: return val
        }
    }

    // Map API sort values (or URL values) back to UI values
    function mapSortFromApi(val: string) {
        switch (val) {
            case 'price_asc': return 'price-asc'
            case 'price_desc': return 'price-desc'
            case 'mileage_asc': return 'mileage'
            case 'newest': return 'newest'
            case 'price-asc': return 'price-asc'
            case 'price-desc': return 'price-desc'
            case 'mileage': return 'mileage'
            default: return val || 'newest'
        }
    }

    // Human-friendly label for UI display
    function getSortLabel(val: string) {
        switch (val) {
            case 'price-asc': return 'Price: low → high'
            case 'price-desc': return 'Price: high → low'
            case 'mileage': return 'Lowest mileage'
            case 'newest': return 'Newest'
            default: return val
        }
    }

    // Fetch page from API whenever paging or filters change
    useEffect(() => {
        let aborted = false
        const controller = new AbortController()

        async function load() {
            setLoading(true)
            try {
                const params = new URLSearchParams()
                params.set('page', String(currentPage))
                params.set('per_page', String(perPage))
                if (q) params.set('q', q)
                if (make) params.set('make', make)
                    if (model) params.set('model', model)
                    if (body) params.set('body', body)
                if (sort) params.set('sort', mapSortToApi(sort))

                const res = await fetch(`/api/inventory?${params.toString()}`, { signal: controller.signal, cache: 'no-store' })
                if (!res.ok) throw new Error('Failed to fetch')
                const payload = await res.json()
                if (aborted) return
                setVehicles(Array.isArray(payload.items) ? payload.items : [])
                // populate available filter lists if provided by API
                setAvailableMakes(Array.isArray(payload.meta?.available?.makes) ? payload.meta.available.makes : [])
                setAvailableBodies(Array.isArray(payload.meta?.available?.body_types) ? payload.meta.available.body_types : [])
                setTotalResults(payload.meta?.total ?? (Array.isArray(payload.items) ? payload.items.length : 0))
                setTotalPages(payload.meta?.totalPages ?? 1)
                // prefer API-provided stats (overall for filtered set)
                if (payload.meta?.stats) {
                    setOverallMinPrice(payload.meta.stats.min_price ?? null)
                    setOverallAvgMileage(payload.meta.stats.avg_mileage ?? null)
                } else {
                    // fallback: compute from returned items (best effort)
                    const prices = (payload.items || []).map((it: any) => Number(it.price)).filter(Number.isFinite)
                    setOverallMinPrice(prices.length ? Math.min(...prices) : null)
                    const mileages = (payload.items || []).map((it: any) => Number(it.mileage)).filter(Number.isFinite)
                    setOverallAvgMileage(mileages.length ? Math.round(mileages.reduce((a: number, b: number) => a + b, 0) / mileages.length) : null)
                }
            } catch (e) {
                if (!aborted) {
                    // keep empty vehicles on error
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
    }, [currentPage, perPage, q, make, body, model, sort])

    // When filters change, reset to first page
    useEffect(() => {
        setCurrentPage(1)
    }, [q, make, model, body, sort])

    // Initialize filter state from the URL on mount so values persist in address bar.
    // Store raw URL filters and reconcile casing with available options after fetch.
    const [initialUrlFilters, setInitialUrlFilters] = useState<any>(null)
    useEffect(() => {
        try {
            if (typeof window === 'undefined') return
            const params = new URLSearchParams(window.location.search)
            const page = params.get('page')
            if (page) setCurrentPage(Math.max(1, parseInt(page, 10) || 1))
            const qq = params.get('q') || ''
            const mk = params.get('make') || ''
            const md = params.get('model') || ''
            const bd = params.get('body') || ''
            const s = params.get('sort') || ''
            setQ(qq)
            // store raw values; we will try to match them to proper-cased options later
            setInitialUrlFilters({ make: mk, model: md, body: bd, sort: s })
            if (s) setSort(mapSortFromApi(s))
        } catch (e) { }
    }, [])

    // Keep URL in sync with filters (replaceState, keep clean URLs by omitting empties).
    // Persist lowercase param values for consistent server-side handling.
    useEffect(() => {
        try {
            if (typeof window === 'undefined') return
            const params = new URLSearchParams()
            if (q) params.set('q', q.toLowerCase().trim())
            if (make) params.set('make', String(make).toLowerCase().trim())
            if (model) params.set('model', String(model).toLowerCase().trim())
            if (body) params.set('body', String(body).toLowerCase().trim())
            if (sort) params.set('sort', mapSortToApi(sort))
            if (currentPage && currentPage > 1) params.set('page', String(currentPage))
            // always keep per_page in URL for consistency when paginating
            params.set('per_page', String(perPage))
            const base = window.location.pathname.replace(/\/?$/, '')
            const newUrl = params.toString() ? `${base}?${params.toString()}` : base
            window.history.replaceState(null, '', newUrl)
        } catch (e) { }
    }, [q, make, model, body, sort, currentPage])

    // After available options are fetched, reconcile initial URL filter casing so selects display correctly.
    useEffect(() => {
        if (!initialUrlFilters) return
        // reconcile make
        if (initialUrlFilters.make && availableMakes.length) {
            const matched = availableMakes.find((m) => m.toLowerCase() === String(initialUrlFilters.make).toLowerCase())
            if (matched) setMake(matched)
        }
        // reconcile body
        if (initialUrlFilters.body && availableBodies.length) {
            const matched = availableBodies.find((b) => (b || '').toLowerCase() === String(initialUrlFilters.body).toLowerCase())
            if (matched) setBody(matched)
        }
        // reconcile model once modelOptions are available
        if (initialUrlFilters.model && modelOptions.length) {
            const matched = modelOptions.find((m) => m.toLowerCase() === String(initialUrlFilters.model).toLowerCase())
            if (matched) setModel(matched)
        }
        // no need to clear initialUrlFilters; keep it for potential future reconciles
    }, [initialUrlFilters, availableMakes, availableBodies, modelOptions])

    // Build model options from fetched entries (unique, sorted)
    // (moved earlier to avoid using before initialization)

    // Apply view class to document root and persist selection
    useEffect(() => {
        try {
            if (typeof document !== 'undefined') {
                document.documentElement.classList.toggle('list-view', view === 'list')
                document.documentElement.classList.toggle('grid-view', view === 'grid')
            }
            if (typeof window !== 'undefined') localStorage.setItem('inventoryView', view)
        } catch (e) { }
    }, [view])

    // Sticky header behavior removed: header will not toggle `stuck` class anymore.

    const MAX_PAGE_BUTTONS = 9
    let startPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2))
    let endPage = Math.min(totalPages, startPage + MAX_PAGE_BUTTONS - 1)
    if (endPage - startPage + 1 < MAX_PAGE_BUTTONS) {
        startPage = Math.max(1, endPage - MAX_PAGE_BUTTONS + 1)
    }
    const pageNumbers: number[] = []
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i)

    function goToPage(n: number) {
        const p = Math.max(1, Math.min(totalPages, n))
        setCurrentPage(p)
        try {
            const el = document.getElementById('inventoryGrid')
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } catch (e) { }
    }

    // Compute small stats from current page
    const minPrice = vehicles.reduce((acc, v) => {
        const p = Number((v as any).price)
        if (!Number.isFinite(p)) return acc
        return acc === null ? p : Math.min(acc, p)
    }, null as number | null)

    const avgMileage = vehicles.reduce((acc, v) => {
        const m = Number((v as any).mileage)
        if (!Number.isFinite(m)) return acc
        return acc + m
    }, 0)

    const avgMileageDisplay = vehicles.length ? Math.round(avgMileage / vehicles.length).toLocaleString() : '—'
    // showHeader: only display header when we have results to show.
    // Do not show header or pagination if there are no results.
    const showHeader = vehicles.length > 0
    // showEmpty: only show empty state after we've attempted the first fetch and it's not loading
    const showEmpty = fetchedOnce && !loading && vehicles.length === 0

    return (
        <section className="inventory container" aria-label="Inventory">
                        {showHeader && (
                            <>
                                <div className="inventory-header-sentinel" aria-hidden="true" />
                                <div className="inventory-header" role="region" aria-label="Inventory overview and filters">
                <div className="header-left">
                    <h2 className="inventory-title">Inventory Overview</h2>
                    {/* Active filters summary shown when any filter is applied */}
                    {/* active-filters removed */}
                    <div className="stats">
                        <div className="stat-item"><strong id="resultCount">{totalResults}</strong> vehicles</div>
                        <div className="stat-item">From <strong id="minPrice">{overallMinPrice ? `£${overallMinPrice}` : '—'}</strong></div>
                        <div className="stat-item">Avg mileage <strong id="avgMileage">{overallAvgMileage ? overallAvgMileage.toLocaleString() : '—'}</strong> mi</div>
                    </div>
                </div>

                <div className="filters-inline">
                    <select id="inline-make" className="inline-select" aria-label="Filter by make" value={make} onChange={(e) => setMake(e.target.value)}>
                        <option value="">All makes</option>
                        {availableMakes.length ? (
                            availableMakes.map((m) => <option key={m} value={m}>{m}</option>)
                        ) : (
                            <option value="" disabled>No makes available</option>
                        )}
                    </select>

                    <select id="inline-model" className="inline-select" aria-label="Filter by model" value={model} onChange={(e) => setModel(e.target.value)}>
                        <option value="">All models</option>
                        {modelOptions.length ? (
                            modelOptions.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))
                        ) : (
                            <option value="" disabled>No models available</option>
                        )}
                    </select>

                    <select id="inline-body" className="inline-select" aria-label="Filter by body type" value={body} onChange={(e) => setBody(e.target.value)}>
                        <option value="">All body types</option>
                        {availableBodies.length ? (
                            availableBodies.map((b) => <option key={b} value={b}>{b}</option>)
                        ) : (
                            <option value="" disabled>No body types available</option>
                        )}
                    </select>

                    <select id="inline-sort" className="inline-select" aria-label="Sort inventory" value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="newest">Newest</option>
                        <option value="price-asc">Price: low → high</option>
                        <option value="price-desc">Price: high → low</option>
                        <option value="mileage">Lowest mileage</option>
                    </select>

                                    <div className="view-toggle" role="group" aria-label="View options">
                                        <button className={`icon-btn ${view === 'grid' ? 'active' : ''}`} aria-pressed={view === 'grid'} title="Grid view" onClick={() => setView('grid')}>
                                            <Grid size={20} strokeWidth={1.6} aria-hidden="true" />
                                        </button>
                                        <button className={`icon-btn ${view === 'list' ? 'active' : ''}`} aria-pressed={view === 'list'} title="List view" onClick={() => setView('list')}>
                                            <Menu size={20} strokeWidth={1.6} aria-hidden="true" />
                                        </button>
                                    </div>
                </div>
                            </div>
                            </>
                        )}

                        {/* Inventory grid shown only when loading or vehicles available */}
                        {loading && vehicles.length === 0 ? (
                            // Initial load: show loader full-width and centered outside the grid
                            <div className="loader-fullwidth-wrapper">
                                <Loader overlay={false} aria-hidden={false} />
                            </div>
                        ) : !showEmpty ? (
                            <div id="inventoryGrid" className="grid">
                                {loading ? (
                                    <InventorySkeleton count={perPage} />
                                ) : (
                                    vehicles.map((v) => (
                                        <InventoryCard key={v.reg} vehicle={v} />
                                    ))
                                )}
                            </div>
                        ) : (
                            /* Empty state rendered outside of the grid */
                            <div className="inventory-empty-wrapper">
                                <div className="inventory-empty" role="status" aria-live="polite">
                                    <Clock className="inventory-empty-icon" size={64} strokeWidth={1.5} aria-hidden="true" />
                                    <p className="inventory-empty-message">{noResultsMessage || "Nothing's available right now — we're refreshing our stock."}</p>
                                    <p className="inventory-empty-sub">New vehicles arrive frequently. Please check back shortly or contact us for availability.</p>
                                </div>
                            </div>
                        )}

                        {showHeader && (
                            <nav id="inventoryPagination" className="inventory-pagination" aria-label="Inventory pagination">
                <button type="button" className="first-btn" disabled={currentPage === 1} onClick={() => goToPage(1)}>« First</button>
                <button type="button" className="prev-btn" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>‹ Prev</button>

                {pageNumbers.map((p) => (
                    <button key={p} type="button" className={`page-btn ${p === currentPage ? 'active' : ''}`} onClick={() => goToPage(p)}>{p}</button>
                ))}

                <button type="button" className="next-btn" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>Next ›</button>
                <button type="button" className="last-btn" disabled={currentPage === totalPages} onClick={() => goToPage(totalPages)}>Last »</button>
              </nav>
            )}
        </section>
    )
}
