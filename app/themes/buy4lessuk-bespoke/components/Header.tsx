'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Phone, Mail, MessageCircle } from 'lucide-react'
import { useBrand } from '../context/BrandClientWrapper'
import BrandLogo from './BrandLogo'
import styles from './Header.module.css'

const NAV_ITEMS = [
  { label: 'Showroom', href: '/used-cars' },
  { label: 'Finance', href: '/finance' },
  { label: 'Sell Your Car', href: '/sell-my-car' },
  { label: 'Vehicle Sourcing', href: '/services' },
  { label: 'Reviews', href: '/about' },
]

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Header() {
  const brand = useBrand()
  const phone = String((brand as any)?.location?.phone || '').trim()
  const phoneTel = phone.replace(/[^\d+]/g, '')
  const email = String((brand as any)?.location?.email || '').trim()
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brandLink} aria-label={brand?.name || 'Home'}>
            <BrandLogo variant="header" />
          </Link>

          <nav aria-label="Primary" className={styles.nav}>
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className={styles.actions}>
            <Link href="/contact" className={styles.ctaContact}>
              Contact Us
            </Link>
            <button
              type="button"
              className={styles.hamburger}
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="b4l-mobile-nav"
              onClick={() => setOpen(true)}
            >
              <Menu size={22} strokeWidth={2.2} aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <button
        type="button"
        id="b4l-mobile-nav-scrim"
        className={`${styles.drawerScrim} ${open ? styles.drawerOpen : ''}`}
        onClick={() => setOpen(false)}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        hidden={!open}
      />
      <aside
        id="b4l-mobile-nav"
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        hidden={!open}
      >
        <div className={styles.drawerHead}>
          <Link href="/" onClick={() => setOpen(false)} className={styles.drawerBrand}>
            <BrandLogo variant="mobile" />
          </Link>
          <button
            type="button"
            className={styles.drawerClose}
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={22} strokeWidth={2.2} aria-hidden />
          </button>
        </div>

        <nav aria-label="Mobile" className={styles.drawerNav}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`${styles.drawerLink} ${active ? styles.drawerLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            )
          })}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className={`${styles.drawerLink} ${styles.drawerLinkCta}`}
          >
            Contact Us
          </Link>
        </nav>

        <div className={styles.drawerFooter}>
          {phone ? (
            <a href={`tel:${phoneTel}`} className={styles.drawerContact}>
              <Phone size={16} strokeWidth={2.4} aria-hidden />
              <span>{phone}</span>
            </a>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className={styles.drawerContact}>
              <Mail size={16} strokeWidth={2.4} aria-hidden />
              <span>{email}</span>
            </a>
          ) : null}
          {phoneTel ? (
            <a
              href={`https://wa.me/${phoneTel.replace(/^\+/, '').replace(/^0/, '44')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.drawerContact}
            >
              <MessageCircle size={16} strokeWidth={2.4} aria-hidden />
              <span>Chat on WhatsApp</span>
            </a>
          ) : null}
        </div>
      </aside>
    </>
  )
}
