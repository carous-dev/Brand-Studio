"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { PhoneCall } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'

const FALLBACK_HERO_BG_IMAGES = [
    'https://images.pexels.com/photos/5992513/pexels-photo-5992513.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.pexels.com/photos/14463441/pexels-photo-14463441.jpeg?auto=compress&cs=tinysrgb&w=1920',
    'https://images.unsplash.com/photo-1633830216801-479d759f9953?auto=format&fit=crop&w=1920&q=80',
]

function asRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
    return value as Record<string, unknown>
}

function pickString(...candidates: unknown[]): string | null {
    for (const candidate of candidates) {
        if (typeof candidate !== 'string') continue
        const value = candidate.trim()
        if (value.length > 0) return value
    }
    return null
}

function appendImageCandidates(target: string[], value: unknown): void {
    if (!value) return

    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed) target.push(trimmed)
        return
    }

    if (Array.isArray(value)) {
        for (const item of value) appendImageCandidates(target, item)
        return
    }

    const record = asRecord(value)
    appendImageCandidates(
        target,
        record.image ?? record.url ?? record.src ?? record.backgroundImage ?? record.background ?? record.media
    )
}

function normalizePhoneForTel(phone: string): string {
    return phone.replace(/[^\d+]/g, '')
}

function escapeCssUrl(url: string): string {
    return String(url).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n|\r/g, '')
}

export default function InventoryHero() {
    const brand = useBrand()
    const pages = asRecord(brand.pages)
    const usedCarsPage = asRecord(
        pages.usedCars ??
        pages.usedcars ??
        pages.used_cars ??
        pages.inventory ??
        pages.inventoryPage ??
        pages.stock
    )
    const heroContent = asRecord(usedCarsPage.hero)
    const heroSettings = Object.keys(heroContent).length > 0 ? heroContent : usedCarsPage

    const city = pickString(
        heroSettings.city,
        asRecord(brand.location).address && asRecord(asRecord(brand.location).address).city
    ) || 'your area'

    const brandName = pickString(brand.name) || 'Our Dealership'
    const phoneDisplay = pickString(
        heroSettings.phone,
        heroSettings.phoneNumber,
        asRecord(brand.location).phone,
        (brand as Record<string, unknown>).phone
    ) || ''
    const phoneHrefValue = normalizePhoneForTel(phoneDisplay)
    const fallbackPhoneHref = phoneHrefValue ? `tel:${phoneHrefValue}` : '/contact'

    const eyebrow = pickString(
        heroSettings.eyebrow,
        heroSettings.badge,
        heroSettings.subtitle,
        `Quality used cars in ${city}`
    ) || `Quality used cars in ${city}`

    const title = pickString(
        heroSettings.title,
        heroSettings.heading,
        `${brandName} Used Cars`
    ) || `${brandName} Used Cars`

    const description = pickString(
        heroSettings.description,
        heroSettings.lead,
        `Browse inspected stock from our ${city} dealership.`
    ) || `Browse inspected stock from our ${city} dealership.`

    const browseCtaLabel = pickString(
        heroSettings.primaryCtaLabel,
        heroSettings.primaryButtonText,
        heroSettings.ctaLabel,
        heroSettings.cta,
        'Browse Stock'
    ) || 'Browse Stock'

    const browseCtaHref = pickString(
        heroSettings.primaryCtaHref,
        heroSettings.primaryButtonHref,
        heroSettings.ctaHref,
        '#inventoryResultsGrid'
    ) || '#inventoryResultsGrid'

    const phoneCtaLabel = pickString(
        heroSettings.secondaryCtaLabel,
        heroSettings.secondaryButtonText,
        phoneDisplay,
        'Contact Us'
    ) || 'Contact Us'

    const phoneCtaHref = pickString(
        heroSettings.secondaryCtaHref,
        heroSettings.secondaryButtonHref,
        fallbackPhoneHref
    ) || fallbackPhoneHref

    const heroBackgroundImages = useMemo(() => {
        const candidates: string[] = []

        appendImageCandidates(candidates, heroSettings.images)
        appendImageCandidates(candidates, heroSettings.backgroundImages)
        appendImageCandidates(candidates, heroSettings.slides)
        appendImageCandidates(candidates, heroSettings.image)
        appendImageCandidates(candidates, heroSettings.backgroundImage)
        appendImageCandidates(candidates, brand.heroImage)
        appendImageCandidates(candidates, FALLBACK_HERO_BG_IMAGES)

        const deduped: string[] = []
        const seen = new Set<string>()

        for (const src of candidates) {
            if (seen.has(src)) continue
            seen.add(src)
            deduped.push(src)
        }

        return deduped
    }, [brand.heroImage, heroSettings])

    const [activeBgIndex, setActiveBgIndex] = useState(0)
    const activeBackground = heroBackgroundImages[activeBgIndex] || ''
    const heroStyle = activeBackground
        ? ({
            '--inventory-hero-bg-image': `url("${escapeCssUrl(activeBackground)}")`,
        } as React.CSSProperties)
        : undefined

    useEffect(() => {
        if (activeBgIndex >= heroBackgroundImages.length) {
            setActiveBgIndex(0)
        }
    }, [activeBgIndex, heroBackgroundImages.length])

    useEffect(() => {
        if (heroBackgroundImages.length <= 1) return

        const timer = window.setInterval(() => {
            setActiveBgIndex((prev) => (prev + 1) % heroBackgroundImages.length)
        }, 7000)

        return () => {
            window.clearInterval(timer)
        }
    }, [heroBackgroundImages.length])

    return (
        <section
            className="inventory-hero inventory-hero-dark"
            aria-label={`${title} hero`}
            style={heroStyle}
        >
            <div className="container">
                <div className="inventory-hero-dark-shell">
                    <p className="inventory-hero-dark-eyebrow">{eyebrow}</p>
                    <h1 className="inventory-hero-dark-title">{title}</h1>
                    <p className="inventory-hero-dark-lead">
                        {description}
                    </p>

                    <div className="inventory-hero-dark-actions">
                        <a href={browseCtaHref} className="inventory-hero-dark-btn inventory-hero-dark-btn-primary">
                            {browseCtaLabel}
                        </a>
                        <a href={phoneCtaHref} className="inventory-hero-dark-btn inventory-hero-dark-btn-secondary">
                            <PhoneCall size={16} aria-hidden="true" />
                            {phoneCtaLabel}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
