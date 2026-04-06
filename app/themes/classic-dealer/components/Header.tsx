"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Menu, X, Home, Car, Truck, Coins, Info, Phone, Mail, Facebook, Instagram, Linkedin, Youtube, Heart, Twitter, CheckCircle } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useBrand } from '../context/BrandClientWrapper'

type NavLink = { href: string; label: string }

const LINKS: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/used-cars/', label: 'Used Cars' },
    { href: '/recently-sold', label: 'Recently Sold' },
    { href: '/services/', label: 'Services' },
    { href: '/sell-your-car/', label: 'Sell Your Car' },
    { href: '/about', label: 'About Us' },
]

const ICONS: Record<string, React.ElementType> = {
    '/': Home,
    '/used-cars/': Car,
    '/recently-sold': CheckCircle,
    '/services/': Truck,
    '/sell-your-car/': Coins,
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
        facebook: 'https://facebook.com', 
        instagram: 'https://instagram.com',
        twitter: 'https://twitter.com', 
        linkedin: 'https://linkedin.com', 
        youtube: 'https://youtube.com' 
    }
    const phone = brand?.location?.phone ?? ''
    const email = brand?.location?.email ?? ''
    const telHref = `tel:${phone.replace(/[^0-9]/g, '')}`
    const [logoTimestamp, setLogoTimestamp] = useState<string>('')
    const logoSrc = brand?.logo ? `${brand?.logo}?t=${logoTimestamp}` : '/images/logo.png'
    const brandName = brand?.name || 'Dealership'
    const phoneCta = 'Book Appointment'
    const phoneCtaShort = 'Book Appointment'

    // Update logo timestamp when brand data changes
    useEffect(() => {
        if (brand?.logo) {
            setLogoTimestamp(Date.now().toString())
        }
    }, [brand?.logo])

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

    const [open, setOpen] = useState(false)
    const [wishlistCount, setWishlistCount] = useState(0)
    const menuRef = useRef<HTMLDivElement | null>(null)
    const firstLinkRef = useRef<HTMLAnchorElement | null>(null)
    const hamburgerRef = useRef<HTMLButtonElement | null>(null)
    const prevOpenRef = useRef<boolean>(false)

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && open) setOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('keydown', onKey)
        }
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

            try {
                menuRef.current?.setAttribute('aria-hidden', 'false')
            } catch (e) { }
            setTimeout(() => firstLinkRef.current?.focus(), 50)
        } else {
            document.body.style.paddingRight = ''
            try {
                menuRef.current?.setAttribute('aria-hidden', 'true')
            } catch (e) { }
            if (prevOpenRef.current) {
                hamburgerRef.current?.focus()
            }
        }
        prevOpenRef.current = open
    }, [open])

    return (
        <>
            <header className="modern-header">
                {/* Top Contact Bar */}
                <div className="contact-bar">
                    <div className="contact-inner">
                        <div className="contact-left">
                            <a href={telHref} className="contact-item" aria-label={phoneCta}>
                                <Phone size={16} strokeWidth={1.5} />
                                <span>{phoneCta}</span>
                            </a>
                            <a href={`mailto:${email}`} className="contact-item">
                                <Mail size={16} strokeWidth={1.5} />
                                <span>{email}</span>
                            </a>
                        </div>
                        <div className="contact-right">
                            <span className="hours">Mon-Sat: 09:00-18:00, Sunday: Closed</span>
                            <div className="social-links">
                                {typeof socialLinks.facebook === 'string' && socialLinks.facebook.trim() ? (
                                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                                        <Facebook size={14} strokeWidth={1.5} />
                                    </a>
                                ) : (
                                    <div className="social-link" aria-label="Facebook">
                                        <Facebook size={14} strokeWidth={1.5} />
                                    </div>
                                )}
                                {typeof socialLinks.instagram === 'string' && socialLinks.instagram.trim() ? (
                                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                                        <Instagram size={14} strokeWidth={1.5} />
                                    </a>
                                ) : (
                                    <div className="social-link" aria-label="Instagram">
                                        <Instagram size={14} strokeWidth={1.5} />
                                    </div>
                                )}
                                {typeof socialLinks.twitter === 'string' && socialLinks.twitter.trim() ? (
                                    <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="X (Twitter)">
                                        <Twitter size={14} strokeWidth={1.5} />
                                    </a>
                                ) : (
                                    <div className="social-link" aria-label="X (Twitter)">
                                        <Twitter size={14} strokeWidth={1.5} />
                                    </div>
                                )}
                                {typeof socialLinks.linkedin === 'string' && socialLinks.linkedin.trim() ? (
                                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn">
                                        <Linkedin size={14} strokeWidth={1.5} />
                                    </a>
                                ) : (
                                    <div className="social-link" aria-label="LinkedIn">
                                        <Linkedin size={14} strokeWidth={1.5} />
                                    </div>
                                )}
                                {typeof socialLinks.youtube === 'string' && socialLinks.youtube.trim() ? (
                                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="social-link" aria-label="YouTube">
                                        <Youtube size={14} strokeWidth={1.5} />
                                    </a>
                                ) : (
                                    <div className="social-link" aria-label="YouTube">
                                        <Youtube size={14} strokeWidth={1.5} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Navigation */}
                <div className="main-nav">
                    <div className="nav-inner">
                        <div className="brand">
                            <a href="/" className="logo-link">
                                <img src={logoSrc} alt={brandName} className="logo-img" />
                            </a>
                        </div>

                        <nav className="nav-links" role="navigation" aria-label="Main navigation">
                            {LINKS.map((l) => (
                                <div key={l.href} className="nav-item-wrapper">
                                    <a
                                        href={l.href}
                                        className={`${isActive(l.href) ? 'active' : ''}`}
                                    >
                                        {l.label}
                                    </a>
                                </div>
                            ))}
                        </nav>

                        <div className="nav-actions">
                            <Link className="wishlist-btn" aria-label="Wishlist" title="Wishlist" href="/wishlist">
                                <Heart size={18} strokeWidth={1.6} aria-hidden="true" />
                                {wishlistCount > 0 ? (
                                    <span className="wishlist-count" aria-label={`${wishlistCount} saved vehicles`}>{wishlistCount}</span>
                                ) : null}
                            </Link>
                            <a href={telHref} className="btn-call-us" aria-label={phoneCtaShort}>
                                <Phone size={18} strokeWidth={2} />
                                <span>{phoneCtaShort}</span>
                            </a>
                            <button
                                ref={hamburgerRef}
                                className="mobile-toggle"
                                aria-label={open ? 'Close menu' : 'Open menu'}
                                aria-expanded={open}
                                onClick={() => setOpen((v) => !v)}
                            >
                                <Menu size={20} strokeWidth={1.6} aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className={`mobile-overlay ${open ? 'open' : ''}`} onClick={() => setOpen(false)} aria-hidden={!open} />

            <div
                ref={menuRef}
                className={`mobile-menu ${open ? 'open' : ''}`}
                role="dialog"
                aria-label="Mobile menu"
                aria-hidden={!open}
            >
                <div className="mobile-menu-header">
                    <div className="mobile-brand">
                        <img src={logoSrc} alt={brandName} className="mobile-logo" />
                    </div>
                    <button className="mobile-close" aria-label="Close menu" onClick={() => setOpen(false)}>
                        <X size={20} strokeWidth={1.6} aria-hidden="true" />
                    </button>
                </div>

                <nav className="mobile-menu-nav" role="navigation" aria-label="Mobile navigation">
                    {LINKS.map((l, i) => (
                        <a
                            key={l.href}
                            href={l.href}
                            ref={i === 0 ? firstLinkRef : undefined as any}
                            className={`menu-item ${isActive(l.href) ? 'active' : ''}`}
                            onClick={() => setOpen(false)}
                        >
                            {(() => {
                                const Icon = ICONS[l.href]
                                return Icon ? <Icon className="menu-icon" size={18} strokeWidth={1.6} aria-hidden /> : null
                            })()}
                            {l.label}
                        </a>
                    ))}
                </nav>

                <div className="mobile-menu-footer">
                    <a href={telHref} className="mobile-contact-item" aria-label={phoneCtaShort}>
                        <Phone size={16} strokeWidth={1.5} />
                        <span>{phoneCtaShort}</span>
                    </a>
                    <a href={`mailto:${email}`} className="mobile-contact-item">
                        <Mail size={16} strokeWidth={1.5} />
                        <span>{email}</span>
                    </a>
                    <a href={telHref} className="mobile-cta-btn" aria-label={phoneCtaShort}>
                        <Phone size={18} strokeWidth={2} />
                        <span>{phoneCtaShort}</span>
                    </a>
                </div>
            </div>
        </>
    )
}

export default Header
