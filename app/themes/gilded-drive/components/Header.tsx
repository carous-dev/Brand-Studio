"use client"

import React, { useEffect, useRef, useState } from 'react'
import { Search, Menu, X, Home, Car, Truck, Coins, Info, MapPin } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useBrand } from '../context/BrandClientWrapper'

type NavLink = { href: string; label: string }

const LINKS: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/used-cars/', label: 'Buy Used Cars' },
    { href: '/sell-your-car/', label: 'Sell Your Car' },
    { href: '/services/', label: 'Our Services' },
    { href: '/about/', label: 'About Us' },
    { href: '/contact/', label: 'Contact Us' },
]

const ICONS: Record<string, React.ElementType> = {
    '/': Home,
    '/used-cars/': Car,
    '/services/': Truck,
    '/sell-your-car/': Coins,
    '/about/': Info,
    '/contact/': MapPin,
}

function normalizeImageUrl(url?: string) {
    if (!url) return ''
    try {
        return String(url)
            .replace(/%7Bresize%7D/gi, '{resize}')
            .replace(/\/(?:\d+x\d+|\{resize\})\//g, '/')
            .trim()
    } catch {
        return String(url).trim()
    }
}

function withCacheBuster(url: string, token?: string) {
    if (!token || !url || url.startsWith('data:')) return url
    const [base, hash] = url.split('#')
    const joiner = base.includes('?') ? '&' : '?'
    const next = `${base}${joiner}t=${token}`
    return hash ? `${next}#${hash}` : next
}

export const Header: React.FC = () => {
    const brand = useBrand()
    const pathname = usePathname?.() || '/' // fallback for non-Next contexts
    // Normalize path helper: remove trailing slashes (except root) for reliable comparisons
    const normalizePath = (p: string | undefined) => {
        if (!p) return '/'
        let s = p.trim()
        if (s === '/') return '/'
        // remove trailing slashes
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
    const menuRef = useRef<HTMLDivElement | null>(null)
    const firstLinkRef = useRef<HTMLAnchorElement | null>(null)
    const hamburgerRef = useRef<HTMLButtonElement | null>(null)
    const prevOpenRef = useRef<boolean>(false)
    const [logoTimestamp, setLogoTimestamp] = useState<string>('')

    const brandName = brand?.name || 'Dealership'
    const rawLogo = normalizeImageUrl(brand?.logo)
    const logoSrc = rawLogo ? withCacheBuster(rawLogo, logoTimestamp) : '/images/logo-min.png'

    useEffect(() => {
        if (brand?.logo) {
            setLogoTimestamp(Date.now().toString())
        }
    }, [brand?.logo])

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape' && open) setOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [open])

    useEffect(() => {
        if (open) {
            // Keep scrollbar visible (don't set overflow:hidden or position:fixed)
            // Compensate only if a scrollbar would be removed elsewhere by other code
            const hasVScroll = document.documentElement.clientWidth < window.innerWidth
            if (hasVScroll) {
                const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth
                document.body.style.paddingRight = scrollBarWidth + 'px'
            }

            // set aria and focus
            try {
                menuRef.current?.setAttribute('aria-hidden', 'false')
            } catch (e) {}
            setTimeout(() => firstLinkRef.current?.focus(), 50)
        } else {
            // remove any padding compensation
            document.body.style.paddingRight = ''
            try {
                menuRef.current?.setAttribute('aria-hidden', 'true')
            } catch (e) {}
            // restore focus to hamburger only if the menu was previously open
            if (prevOpenRef.current) {
                hamburgerRef.current?.focus()
            }
        }
        // remember previous open state for next effect run
        prevOpenRef.current = open
    }, [open])

    // Ensure the mobile menu element is rendered into body via portal
    // and close the menu when route changes (optional)

    return (
        <>
        <header className="site-header">
            <a className="sr-only" href="#content">Skip to content</a>
            <div className="topbar no-sticky">
                <div className="topbar-inner">
                    <div className="brand">
                        <div className="logo">
                            <img src={logoSrc} alt={`${brandName} logo`} className="logo-img" />
                        </div>
                        <div className="brand-text">{brandName}</div>
                    </div>

                    <nav className="nav-links" role="navigation" aria-label="Main navigation">
                        {LINKS.map((l) => (
                            <a key={l.href} href={l.href} className={isActive(l.href) ? 'active' : undefined}>
                                {l.label}
                            </a>
                        ))}
                    </nav>

                    <div className="nav-actions">
                        <button className="icon-btn" aria-label="Search">
                            <Search size={18} strokeWidth={1.6} aria-hidden="true" />
                        </button>

                        <button
                            id="hamburger"
                            ref={hamburgerRef}
                            className="hamburger"
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
                    id="mobileMenu"
                    ref={menuRef}
                    className={`mobile-menu ${open ? 'open' : ''}`}
                    role="dialog"
                    aria-label="Mobile menu"
                    aria-hidden={!open}
                >
                    <div className="mobile-menu-header">
                        <div className="mobile-brand">
                            <img src={logoSrc} alt={brandName} className="mobile-logo" />
                            <div className="mobile-brand-text">{brandName}</div>
                        </div>
                <button className="mobile-close" aria-label="Close menu" onClick={() => setOpen(false)}>
                    <X size={20} strokeWidth={1.6} aria-hidden="true" />
                </button>
            </div>

            <nav className="mobile-menu-nav" role="navigation" aria-label="Mobile navigation">
                {LINKS.map((l, i) => (
                    <React.Fragment key={l.href}>
                        <a
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
                        {i < LINKS.length - 1 && <hr className="mobile-divider" style={{ border: 'none', borderTop: '1px solid #333', margin: '8px 0' }} />}
                    </React.Fragment>
                ))}
            </nav>

            <div className="mobile-menu-footer">
                <a className="btn primary" href="/used-cars/">Browse Vehicles</a>
            </div>
        </div>
        </>
    )
}

export default Header
