"use client"

import React from 'react'
import { Share2, Heart, Calendar, Gauge, Droplet, Sliders } from 'lucide-react'
import LazyImage from './LazyImage'

type Vehicle = {
    reg: string
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
    trans?: string,
    slug?: string
    description?: string
    stock_status?: 'in_stock' | 'sold' | 'reserved' | 'pending' | 'withdrawn'
    advert_id?: string
}

function normalizeImageUrl(url?: string) {
    if (!url) return ''
    try {
        // Remove size segments like '/1200x800/' or the placeholder '/{resize}/' from CDN URLs
        return String(url).replace(/\/(?:\d+x\d+|\{resize\})\//g, '/')
    } catch {
        return String(url)
    }
}

export default function InventoryCard({ vehicle }: { vehicle: Vehicle }) {
    const img = vehicle.image || (vehicle.images && vehicle.images[0]) || ''
    const imageUrl = normalizeImageUrl(img)
    

    function slugify(...parts: Array<string | number | undefined>) {
        const joined = parts.filter(Boolean).join(' ')
        return String(joined)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }
    // Use the `slug` provided by the API. If it's missing, fall back to registration.
    const permalink = vehicle.slug ? `/used-cars/${vehicle.slug}` : `/used-cars/${vehicle.reg || ''}`

    return (
        <article className="car-card" data-make={vehicle.make} data-model={vehicle.model} data-price={vehicle.price} data-mileage={vehicle.mileage} data-trans={vehicle.trans} data-fuel={vehicle.fuel} data-reg={vehicle.reg}>
            {vehicle.stock_status && vehicle.stock_status !== 'in_stock' && (
                <div className={`stock-badge stock-${vehicle.stock_status}`}>
                    {vehicle.stock_status === 'sold' && 'Sold'}
                    {vehicle.stock_status === 'reserved' && 'Reserved'}
                    {vehicle.stock_status === 'pending' && 'Pending'}
                    {vehicle.stock_status === 'withdrawn' && 'Withdrawn'}
                </div>
            )}
            <a href={permalink} aria-label={`${vehicle.year ? vehicle.year + ' ' : ''}${vehicle.make} ${vehicle.model}`}>
                <div className="media">
                    <LazyImage alt={`${vehicle.year ? vehicle.year + ' ' : ''}${vehicle.make} ${vehicle.model}`} src={imageUrl} loading="lazy" decoding="async" fetchPriority="low" />

                    <div className="media-overlay">
                        <button type="button" className="icon-btn share-btn" title="Share">
                            <Share2 size={16} />
                        </button>

                        <button type="button" className="icon-btn fav-btn" title="Save">
                            <Heart size={16} />
                        </button>
                    </div>

                    
                </div>

                <div className="card-body">
                    <div className="title-row">
                        <h3 className="car-title">
                            {vehicle.year ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : `${vehicle.make} ${vehicle.model}`}
                        </h3>
                        <div className="price">{vehicle.price ? `£${vehicle.price.toLocaleString()}` : ''}</div>
                    </div>

                    {/* meta removed per request */}

                    <div className="short-desc">{vehicle.description ? (vehicle.description.length > 120 ? vehicle.description.slice(0, 117).trim() + '…' : vehicle.description) : ''}</div>

                    <div className="car-meta">
                        <span className="year">
                            <Calendar size={14} aria-hidden="true" />
                            {vehicle.year ?? '—'}
                        </span>
                        <span className="mileage">
                            <Gauge size={14} aria-hidden="true" />
                            {vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : '—'}
                        </span>
                        <span className="fuel">
                            <Droplet size={14} aria-hidden="true" />
                            {vehicle.fuel ?? '—'}
                        </span>
                        <span className="trans">
                            <Sliders size={14} aria-hidden="true" />
                            {vehicle.trans ?? '—'}
                        </span>
                    </div>
                </div>
            </a>
        </article>

    )
}
