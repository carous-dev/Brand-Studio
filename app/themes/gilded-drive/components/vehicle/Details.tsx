"use client"
import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export default function Details(props: any) {
    const { vehicle, features = [], specs, descClamped, showDescToggle, toggleDesc } = props
    const [featuresExpanded, setFeaturesExpanded] = useState(false)
    const [visibleCount, setVisibleCount] = useState<number | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        // compute how many items fit per row by measuring first card width
        function updateVisible() {
            const container = containerRef.current
            if (!container) return
            const card = container.querySelector('.feature-card') as HTMLElement | null
            const containerWidth = container.clientWidth || 0
            const cardWidth = card ? (card.offsetWidth + parseFloat(getComputedStyle(card).marginRight || '0')) : 160
            const itemsPerRow = Math.max(1, Math.floor(containerWidth / Math.max(1, cardWidth)))
            const rows = 2
            setVisibleCount(itemsPerRow * rows)
        }
        updateVisible()
        window.addEventListener('resize', updateVisible)
        return () => window.removeEventListener('resize', updateVisible)
    }, [features])

    const needsClamp = visibleCount != null && features.length > visibleCount && !featuresExpanded
    // Prepare spec categories robustly: look for specs array in multiple shapes,
    // accept flat objects, and fallback to building from the raw vehicle row.
    let specCategories: any[] = []

    function findSpecs(obj: any, depth = 3): any | null {
        if (!obj || depth < 0) return null
        if (Array.isArray(obj.specs) && obj.specs.length) return obj.specs
        for (const k of Object.keys(obj)) {
            try {
                const v = obj[k]
                if (Array.isArray(v) && k.toLowerCase().includes('spec')) return v
                if (v && typeof v === 'object') {
                    const found = findSpecs(v, depth - 1)
                    if (found) return found
                }
            } catch { /**/ }
        }
        return null
    }

    const candidateSpecs = findSpecs({ vehicle, specs, root: props }) || specs || vehicle?.specs || vehicle?.vehicle?.specs

    if (Array.isArray(candidateSpecs) && candidateSpecs.length) {
        // already in desired categorical shape
        specCategories = candidateSpecs
    } else if (candidateSpecs && typeof candidateSpecs === 'object' && Object.keys(candidateSpecs).length) {
        // candidateSpecs may be a flat object of key/value pairs
        const isFlat = Object.values(candidateSpecs).every(v => (v == null) || typeof v !== 'object')
        if (isFlat) {
            const perfMap: Array<[string, string[]]> = [
                ['Cylinders', ['cylinders', 'cylinder_count', 'engine_cylinders']],
                ['Engine power', ['engine_power_bhp', 'engine_power', 'power', 'bhp']],
                ['Miles per gallon', ['mpg', 'miles_per_gallon', 'fuel_consumption_combined', 'fuel_economy_nedc_combined_mpg']],
                ['CO2', ['co2_emission_gpkm', 'co2']]
            ]
            const sizeMap: Array<[string, string[]]> = [
                ['Height', ['height_mm', 'height']],
                ['Length', ['length_mm', 'length']],
                ['Width', ['width_mm', 'width']],
                ['Seats', ['seats', 'number_of_seats']]
            ]

            const pickVal = (keys: string[]) => {
                for (const k of keys) {
                    if (candidateSpecs[k] != null) return candidateSpecs[k]
                    if (specs && specs[k] != null) return specs[k]
                    if (vehicle && vehicle[k] != null) return vehicle[k]
                    if (vehicle?.vehicle && vehicle.vehicle[k] != null) return vehicle.vehicle[k]
                }
                return null
            }

            const perfItems: any[] = []
            for (const [label, keys] of perfMap) {
                const v = pickVal(keys)
                if (v != null && v !== '') perfItems.push({ name: label, value: String(v) })
            }

            const sizeItems: any[] = []
            for (const [label, keys] of sizeMap) {
                const v = pickVal(keys)
                if (v != null && v !== '') sizeItems.push({ name: label, value: String(v) })
            }

            specCategories = [
                { category: 'Performance', items: perfItems },
                { category: 'Size and dimensions', items: sizeItems }
            ]
        } else {
            // convert object with nested categories into array
            specCategories = Object.entries(candidateSpecs).map(([k, v]) => ({ category: k, items: Array.isArray(v) ? v : [{ name: k, value: v }] }))
        }
    }

    // final fallback: build from vehicle row if we still have no items
    const hasItems = specCategories.some((c: any) => Array.isArray(c.items) && c.items.length > 0)
    if (!hasItems) {
        const row = vehicle?.vehicle ?? vehicle ?? {}
        const perfMap2: Array<[string, string[]]> = [
            ['Cylinders', ['cylinders', 'cylinder_count', 'engine_cylinders']],
            ['Engine power', ['engine_power_bhp', 'engine_power', 'power', 'bhp']],
            ['Miles per gallon', ['mpg', 'miles_per_gallon', 'fuel_consumption_combined', 'fuel_economy_nedc_combined_mpg']],
            ['CO2', ['co2_emission_gpkm', 'co2']]
        ]
        const sizeMap2: Array<[string, string[]]> = [
            ['Height', ['height_mm', 'height']],
            ['Length', ['length_mm', 'length']],
            ['Width', ['width_mm', 'width']],
            ['Seats', ['seats', 'number_of_seats']]
        ]

        const pickFromRow = (keys: string[]) => {
            for (const k of keys) {
                if (candidateSpecs && candidateSpecs[k] != null) return candidateSpecs[k]
                if (specs && specs[k] != null) return specs[k]
                if (row && row[k] != null) return row[k]
            }
            return null
        }

        const perfItems2: any[] = []
        for (const [label, keys] of perfMap2) {
            const v = pickFromRow(keys)
            if (v != null && v !== '') perfItems2.push({ name: label, value: String(v) })
        }

        const sizeItems2: any[] = []
        for (const [label, keys] of sizeMap2) {
            const v = pickFromRow(keys)
            if (v != null && v !== '') sizeItems2.push({ name: label, value: String(v) })
        }

        if (perfItems2.length || sizeItems2.length) {
            specCategories = [
                { category: 'Performance', items: perfItems2 },
                { category: 'Size and dimensions', items: sizeItems2 }
            ]
        } else {
            // keep safe defaults
            specCategories = [
                { category: 'Performance', items: [] },
                { category: 'Size and dimensions', items: [] }
            ]
        }
    }

    return (
        <section className="vehicle-details" id="vehicleDetails">
            <div className="details-inner">
                <h3 className="section-title">Description</h3>
                <div id="vehicleFullDesc" className="vehicle-full-desc">{vehicle?.description || 'No description available.'} </div>
                {showDescToggle ? (
                    <button id="descToggle" type="button" className="vehicle-full-desc-toggle" onClick={toggleDesc}>{descClamped ? 'Read more' : 'Show less'}</button>
                ) : null}
                <div className="section-divider" aria-hidden="true"></div>

                <h3 className="section-subtitle">Features</h3>
                <p className="section-note">Grouped feature categories for a quick overview of what this vehicle offers.</p>
                {features.length ? (
                    <>
                        <div id="featureCardsTop" className="feature-cards-top" aria-label="Features" ref={containerRef}>
                            {(needsClamp ? features.slice(0, visibleCount as number) : features).map((f: any, idx: number) => (
                                <div key={idx} className="feature-card">
                                    <div className="feature-icon" aria-hidden="true"><Check size={18} /></div>
                                    <div className="feature-title">{f}</div>
                                </div>
                            ))}
                        </div>
                        {needsClamp ? (
                            <div className="feature-clamp-bar">
                                <button
                                    type="button"
                                    className="btn ghost full-width"
                                    onClick={() => setFeaturesExpanded(true)}
                                    aria-expanded={featuresExpanded}
                                >
                                    <span>Show {features.length - (visibleCount as number)} more features</span>
                                    <ChevronDown size={16} aria-hidden="true" />
                                </button>
                            </div>
                        ) : null}</>
                ) : <div>No features listed.</div>}

                <div className="section-divider" aria-hidden="true"></div>

                <h3 className="section-subtitle">Specs</h3>
                <p className="section-note">Technical specifications including performance, dimensions and capacities.</p>
                <div id="featureCategories" className="feature-categories">
                    {specCategories.length ? specCategories.map((cat: any, idx: number) => (
                        <details key={idx} className="feature-category">
                            <summary>{(cat.category || 'Specs') + (Array.isArray(cat.items) ? ` (${cat.items.length})` : '')}</summary>
                            <div className="feature-cards">
                                {Array.isArray(cat.items) && cat.items.length ? cat.items.map((it: any, i: number) => (
                                    <article key={i} className="feature-card"><div className="f-body"><strong>{it.name || it.label || it.key || ''}</strong><p>{it.value || it.display || ''}</p></div></article>
                                )) : <div className="feature-cards empty">No items</div>}
                            </div>
                        </details>
                    )) : <div>No specs available.</div>}
                </div>
                <div className="section-divider" aria-hidden="true"></div>
            </div>
        </section >
    )
}
