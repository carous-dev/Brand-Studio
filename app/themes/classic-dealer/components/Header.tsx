"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Menu, X, Home, Car, Truck, Coins, CheckCircle, Info, Phone, Mail, Facebook, Instagram, Linkedin, Youtube, Heart, Twitter } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'

type NavLink = { href: string; label: string }

const LINKS: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/used-cars/', label: 'Used Cars' },
    { href: '/recently-sold', label: 'Recently Sold' },
    { href: '/services/', label: 'Services' },
    { href: '/sell-my-car/', label: 'Sell My Car' },
]

const ICONS: Record<string, React.ElementType> = {
    '/': Home,
    '/used-cars/': Car,
    '/recently-sold': CheckCircle,
    '/services/': Truck,
    '/sell-my-car/': Coins,
    '/about': Info,
}

const WISHLIST_STORAGE_PREFIX = 'vp-vehicle-wishlist:'

function normalizeSavedVehiclePath(path: string): string {
    const withoutQuery = String(path || '').split('?')[0].split('#')[0].trim()
    if (!withoutQuery) return ''
    const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`
    if (withLeadingSlash === '/') return '/'
    return withLeadingSlash.replace(/\/+$/, '')
}

function getWishlistCountFromStorage(): number {
    try {
        const savedPaths = new Set<string>()
        const keys = Object.keys(window.localStorage)

        for (const key of keys) {
            if (!key.startsWith(WISHLIST_STORAGE_PREFIX)) continue
            if (window.localStorage.getItem(key) !== '1') continue

            const normalizedPath = normalizeSavedVehiclePath(key.slice(WISHLIST_STORAGE_PREFIX.length))
            if (!normalizedPath.startsWith('/used-cars/')) continue
            savedPaths.add(normalizedPath)
        }

        return savedPaths.size
    } catch {
        return 0
    }
}

export const Header: React.FC = () => {
    const brand = useBrand()
    const pathname = usePathname?.() || '/'
    const router = useRouter()

    const socialLinks = brand?.socialLinks ?? {
        facebook: '',
        instagram: '',
        twitter: '',
        linkedin: '',
        youtube: '',
    }
    const phone = brand?.location?.phone ?? ''
    const email = brand?.location?.email ?? ''
    const telHref = phone ? `tel:${phone.replace(/[^0-9+]/g, '')}` : ''
    const brandName = brand?.name || 'Dealership'
    const brandLogo = brand?.logo || ''
    const phoneCta = 'Book Appointment'

    const [logoError, setLogoError] = useState(false)
    const [open, setOpen] = useState(false)
    const [wishlistCount, setWishlistCount] = useState(0)

    const menuRef = useRef<HTMLDivElement | null>(null)
    const firstLinkRef = useRef<HTMLAnchorElement | null>(null)
    const hamburgerRef = useRef<HTMLButtonElement | null>(null)
    const prevOpenRef = useRef<boolean>(false)

    /* Reset image-error state when the brand logo URL changes so a fresh
       brand record can re-attempt loading instead of being stuck on wordmark. */
    useEffect(() => {
        setLogoError(false)
    }, [brandLogo])

    const normalizePath = (p: string | undefined) => {
        if (!p) return '/'
        let s = p.trim()
        if (s === '/') return '/'
        s = s.replace(/\/+$/, '')
        return s || '/'
    }
    const normalizedPath = normalizePath(pathname)

    const isActive = (href: string) => {
        const nh = normalizePath(href)
        if (nh === '/') return normalizedPath === '/'
        return normalizedPath === nh || normalizedPath.startsWith(nh + '/')
    }

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && open) setOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open])

    useEffect(() => {
        const syncWishlistCount = () => {
            setWishlistCount(getWishlistCountFromStorage())
        }

        const handleStorage = (event: StorageEvent) => {
            if (!event.key || event.key.startsWith(WISHLIST_STORAGE_PREFIX)) {
                syncWishlistCount()
            }
        }

        syncWishlistCount()

        window.addEventListener('storage', handleStorage)
        window.addEventListener('vp:wishlist-updated', syncWishlistCount as EventListener)

        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener('vp:wishlist-updated', syncWishlistCount as EventListener)
        }
    }, [])

    useEffect(() => {
        if (open) {
            const hasVScroll = document.documentElement.clientWidth < window.innerWidth
            if (hasVScroll) {
                const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
                document.body.style.paddingRight = scrollBarWidth + 'px'
            }

            try { menuRef.current?.setAttribute('aria-hidden', 'false') } catch { }
            setTimeout(() => firstLinkRef.current?.focus(), 50)
        } else {
            document.body.style.paddingRight = ''
            try { menuRef.current?.setAttribute('aria-hidden', 'true') } catch { }
            if (prevOpenRef.current) hamburgerRef.current?.focus()
        }
        prevOpenRef.current = open
    }, [open])

    const renderLogo = (mobileVariant?: boolean) => {
        if (brandLogo && !logoError) {
            return (
                <img
                    src={brandLogo}
                    alt={brandName}
                    className={mobileVariant ? 'mobile-logo' : 'logo-img'}
                    onError={() => setLogoError(true)}
                />
            )
        }
        return <span className="logo-wordmark">{brandName}</span>
    }

    const socialItems = [
        { key: 'facebook', label: 'Facebook', href: socialLinks.facebook, Icon: Facebook },
        { key: 'instagram', label: 'Instagram', href: socialLinks.instagram, Icon: Instagram },
        { key: 'twitter', label: 'X (Twitter)', href: (socialLinks as any).twitter || '', Icon: Twitter },
        { key: 'linkedin', label: 'LinkedIn', href: socialLinks.linkedin, Icon: Linkedin },
        { key: 'youtube', label: 'YouTube', href: socialLinks.youtube, Icon: Youtube },
    ]

    return (
        <>
            <header className="modern-header">
                {/* Top utility strip */}
                <div className="contact-bar">
                    <div className="contact-inner">
                        <div className="contact-left">
                            {phone ? (
                                <a href={telHref} className="contact-item" aria-label={`Call ${brandName}`}>
                                    <Phone size={14} aria-hidden="true" />
                                    <span>{phone}</span>
                                </a>
                            ) : null}
                            {email ? (
                                <a href={`mailto:${email}`} className="contact-item" aria-label={`Email ${brandName}`}>
                                    <Mail size={14} aria-hidden="true" />
                                    <span>{email}</span>
                                </a>
                            ) : null}
                        </div>
                        <div className="contact-right">
                            <span className="hours">Mon-Sat: 09:00 - 18:00 · Sunday: Closed</span>
                            <div className="social-links" aria-label="Social media">
                                {socialItems.map(({ key, label, href, Icon }) => {
                                    const safeHref = typeof href === 'string' && href.trim() ? href.trim() : ''
                                    if (!safeHref) {
                                        return (
                                            <span key={key} className="social-link" aria-label={label}>
                                                <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
                                            </span>
                                        )
                                    }
                                    return (
                                        <a
                                            key={key}
                                            href={safeHref}
                                            className="social-link"
                                            aria-label={label}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Icon size={13} strokeWidth={1.8} aria-hidden="true" />
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main nav */}
                <div className="main-nav">
                    <div className="nav-inner">
                        <div className="brand">
                            <Link href="/" className="logo-link" aria-label={`${brandName} home`}>
                                {renderLogo()}
                            </Link>
                        </div>

                        <nav className="nav-links" role="navigation" aria-label="Primary navigation">
                            {LINKS.map((link) => {
                                const active = isActive(link.href)
                                return (
                                    <div key={link.href} className="nav-item-wrapper">
                                        <Link
                                            href={link.href}
                                            className={active ? 'active' : ''}
                                            aria-current={active ? 'page' : undefined}
                                        >
                                            {link.label}
                                        </Link>
                                    </div>
                                )
                            })}
                        </nav>

                        <div className="nav-actions">
                            <Link
                                className="wishlist-btn"
                                aria-label={wishlistCount > 0 ? `Wishlist · ${wishlistCount} saved` : 'Wishlist'}
                                title="Wishlist"
                                href="/wishlist"
                            >
                                <Heart size={18} strokeWidth={1.7} aria-hidden="true" />
                                {wishlistCount > 0 ? (
                                    <span className="wishlist-count" aria-hidden="true">{wishlistCount}</span>
                                ) : null}
                            </Link>
                            {telHref ? (
                                <a href={telHref} className="btn-call-us" aria-label={phoneCta}>
                                    <Phone size={17} strokeWidth={2} aria-hidden="true" />
                                    <span>{phoneCta}</span>
                                </a>
                            ) : null}
                            <button
                                ref={hamburgerRef}
                                className="mobile-toggle"
                                aria-label={open ? 'Close menu' : 'Open menu'}
                                aria-expanded={open}
                                onClick={() => setOpen((v) => !v)}
                            >
                                <Menu size={20} strokeWidth={1.7} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div
                className={`mobile-overlay ${open ? 'open' : ''}`}
                onClick={() => setOpen(false)}
                aria-hidden={!open}
            />

            <aside
                ref={menuRef}
                className={`mobile-menu ${open ? 'open' : ''}`}
                role="dialog"
                aria-label="Mobile menu"
                aria-hidden={!open}
            >
                <div className="mobile-menu-header">
                    <Link href="/" className="mobile-brand" onClick={() => setOpen(false)} aria-label={`${brandName} home`}>
                        {renderLogo(true)}
                    </Link>
                    <button className="mobile-close" aria-label="Close menu" onClick={() => setOpen(false)}>
                        <X size={20} strokeWidth={1.7} aria-hidden="true" />
                    </button>
                </div>

                <nav className="mobile-menu-nav" role="navigation" aria-label="Mobile navigation">
                    {LINKS.map((link, index) => {
                        const Icon = ICONS[link.href]
                        const active = isActive(link.href)
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                ref={index === 0 ? firstLinkRef : undefined as any}
                                className={`menu-item ${active ? 'active' : ''}`}
                                aria-current={active ? 'page' : undefined}
                                onClick={() => setOpen(false)}
                            >
                                {Icon ? <Icon className="menu-icon" size={18} strokeWidth={1.8} aria-hidden="true" /> : null}
                                {link.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mobile-menu-footer">
                    {phone ? (
                        <a href={telHref} className="mobile-contact-item">
                            <Phone size={16} strokeWidth={1.7} aria-hidden="true" />
                            <span>{phone}</span>
                        </a>
                    ) : null}
                    {email ? (
                        <a href={`mailto:${email}`} className="mobile-contact-item">
                            <Mail size={16} strokeWidth={1.7} aria-hidden="true" />
                            <span>{email}</span>
                        </a>
                    ) : null}
                    {telHref ? (
                        <a href={telHref} className="mobile-cta-btn" aria-label={phoneCta}>
                            <Phone size={18} strokeWidth={2} aria-hidden="true" />
                            <span>{phoneCta}</span>
                        </a>
                    ) : null}
                </div>
            </aside>
        </>
    )
}

export default Header
