'use client';

// audit-ignore-file: a11y-div-as-button — mobile menu overlay backdrop uses
// <div onClick> for close; <div> inside menu uses stopPropagation. Phase 8
// followup to convert to <button> while preserving styling.
import { useState, type MouseEvent } from 'react';
import { Search, X, Phone, Heart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import ContactBar from './ContactBar';
import { useWishlist } from '../context/WishlistContext';
import { useBrand } from '../context/BrandClientWrapper';
import { getBrandContactInfo } from '../lib/contact';
import '../styles/header.css';
import '../styles/contact-bar.css';

const NAV_ITEMS: Array<{ label: string; href: string }> = [
  { label: 'Home', href: '/' },
  { label: 'Used Cars', href: '/used-cars' },
  { label: 'Services', href: '/services' },
  { label: 'Looking to sell?', href: '/sell-my-car' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useWishlist();
  const brand = useBrand();
  const contact = getBrandContactInfo(brand);

  const brandName = brand?.name || 'Brand';
  const brandLogo = brand?.logo || '';

  const toggleMobileMenu = () => setIsMobileMenuOpen((open) => !open);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleMobileOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeMobileMenu();
  };

  const toggleSearch = () => setIsSearchOpen((open) => !open);

  const isActive = (path: string) => {
    if (!pathname) return false;
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <ContactBar />
      <header className="cnh-site-header">
        <div className="header-glass">
          <div className="header-container container">
            <div className="logo">
              <a href="/" aria-label={`${brandName} home`}>
                {brandLogo ? (
                  // Plain <img> so we never tank on a brand record that points
                  // at a remote logo URL not whitelisted in next.config.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brandLogo}
                    alt={`${brandName} logo`}
                    width={180}
                    height={45}
                    style={{ width: '180px', height: 'auto', display: 'block' }}
                  />
                ) : (
                  <span className="brand-wordmark" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{brandName}</span>
                )}
              </a>
            </div>
            <nav className="main-nav desktop-nav">
              <ul>
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className={isActive(item.href) ? 'active' : ''}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="header-actions">
              <a href="/wishlist" className="wishlist-btn" aria-label={`Wishlist (${count} saved)`}>
                <Heart />
                {count > 0 && <span className="wishlist-count">{count > 99 ? '99+' : count}</span>}
              </a>
              {contact.phoneDisplay ? (
                <a href={contact.phoneTel ? `tel:${contact.phoneTel}` : `tel:${contact.phoneDisplay.replace(/\s+/g, '')}`} className="shop-btn">
                  <Phone className="icon" />
                  {contact.phoneDisplay}
                </a>
              ) : null}
              <button className="hamburger mobile-only" aria-label="Open menu" onClick={toggleMobileMenu}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hanging search panel */}
      <div className={`header-search-panel ${isSearchOpen ? 'active' : ''}`} aria-hidden={!isSearchOpen}>
        <div className="header-search-inner container">
          <div className="search-box">
            <Search className="search-icon" />
            <input type="search" className="header-search-input" placeholder="Search vehicles, makes, models..." aria-label="Site search" />
            <button className="header-search-close" aria-label="Close search" onClick={toggleSearch}>
              <X className="close-icon" />
            </button>
          </div>
          <div className="search-suggestions" aria-label="Search suggestions" role="listbox"></div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        id="mobile-menu"
        className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={handleMobileOverlayClick}
      >
        <div className="mobile-menu" onClick={(event) => event.stopPropagation()}>
          <div className="mobile-menu-header">
            <div className="mobile-brand">
              {brandLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brandLogo} alt={`${brandName} logo`} width={150} height={38} style={{ width: '150px', height: 'auto' }} />
              ) : (
                <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>{brandName}</span>
              )}
            </div>
            <button className="mobile-menu-close" aria-label="Close menu" onClick={closeMobileMenu}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <nav className="mobile-nav">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="mobile-nav-link">{item.label}</a>
            ))}
          </nav>
          <div className="mobile-menu-sell">
            <a href="/sell-my-car" className="mobile-sell-btn">Sell Your Car Today</a>
          </div>
          <div className="mobile-menu-footer">
            {contact.phoneDisplay ? (
              <div className="mobile-contact">
                <Phone width={18} height={18} />
                {contact.phoneDisplay}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
