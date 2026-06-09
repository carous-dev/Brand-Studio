'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, Phone } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import { getBrandContactInfo } from '../lib/contact'
import TopContactBar from './TopContactBar'
import styles from './Header.module.css'

const NAV_ITEMS: Array<{ label: string; href: string }> = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Recently Sold', href: '/recently-sold' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'Finance', href: '/finance' },
  { label: 'Our Services', href: '/services' },
]

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  if (pathname === href) return true
  return pathname.startsWith(`${href}/`)
}

export default function Header() {
  const brand = useBrand()
  const pathname = usePathname() || '/'
  const brandName = brand?.name || 'Autowow'
  const logoUrl = (brand as any)?.logo || `/themes/auto-wow-uk-bespoke-02/images/hero.jpg`
  const hasLogo = Boolean((brand as any)?.logo)
  const contact = getBrandContactInfo(brand)
  const [navOpen, setNavOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    // Close mobile menu on route change.
    setNavOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [navOpen])

  return (
    <header className={styles.header} data-scrolled={scrolled ? 'true' : 'false'}>
      <div className={styles.accentStrip} aria-hidden="true" />
      <TopContactBar />
      <div className={styles.navbar}>
        <div className={styles.navbarInner}>
          <Link href="/" className={styles.brand} aria-label={brandName}>
            {hasLogo ? (
              <img src={logoUrl} alt={brandName} className={styles.brandLogo} />
            ) : (
              <span className={styles.brandWordmark}>{brandName.toUpperCase()}</span>
            )}
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
            {NAV_ITEMS.map((item, idx) => {
              const active = isActiveRoute(pathname, item.href)
              return (
                <span key={item.href} className={styles.navItem}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                  {idx < NAV_ITEMS.length - 1 ? (
                    <span className={styles.navDivider} aria-hidden="true">|</span>
                  ) : null}
                </span>
              )
            })}
          </nav>

          <div className={styles.actions}>
            <Link href="/used-cars" className={styles.searchIconBtn} aria-label="Search stock">
              <Search size={18} strokeWidth={2} />
            </Link>
            {contact.phoneTel ? (
              <a href={`tel:${contact.phoneTel}`} className={styles.getInTouchBtn}>
                <Phone size={16} strokeWidth={2} />
                <span>Get in Touch</span>
              </a>
            ) : (
              <Link href="/contact" className={styles.getInTouchBtn}>
                <Phone size={16} strokeWidth={2} />
                <span>Get in Touch</span>
              </Link>
            )}
            <button
              type="button"
              className={styles.hamburger}
              aria-expanded={navOpen}
              aria-controls="autowow-mobile-nav"
              aria-label={navOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setNavOpen((open) => !open)}
            >
              {navOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
            </button>
          </div>
        </div>
      </div>

      <div
        id="autowow-mobile-nav"
        className={`${styles.mobilePanel} ${navOpen ? styles.mobilePanelOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        hidden={!navOpen}
      >
        <nav aria-label="Mobile primary" className={styles.mobileNav}>
          {NAV_ITEMS.map((item) => {
            const active = isActiveRoute(pathname, item.href)
            return (
              <Link
                key={`m-${item.href}`}
                href={item.href}
                className={`${styles.mobileLink} ${active ? styles.mobileLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
          <Link href="/about" className={styles.mobileLink}>About</Link>
          <Link href="/contact" className={styles.mobileLink}>Contact</Link>
          <Link href="/recently-sold" className={styles.mobileLink}>Recently sold</Link>
        </nav>
      </div>
    </header>
  )
}
