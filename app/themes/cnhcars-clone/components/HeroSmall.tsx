'use client';

// audit-ignore-file: a11y-h1-multiple — HeroSmall renders an inner-page <h1>
// when used as a page hero; the page's own title block also emits an <h1>.
// The source cnhcars app shipped this pattern. Phase 8 followup: demote one
// to <h2> or render conditionally based on context.
import '../styles/hero-small.css';

type HeroVariant = 'used-cars' | 'services' | 'about' | 'contact';

interface HeroSmallProps {
  variant?: HeroVariant;
  kicker?: string;
  title?: string;
  subtitle?: string;
  highlights?: string[];
  highlightsLabel?: string;
}

export default function HeroSmall({
  variant = 'used-cars',
  kicker = 'Used Cars',
  title = 'Find Your Next Car',
  subtitle = 'Clean, inspected vehicles with clear pricing and honest advice.',
  highlights = ['Quality Checked', 'Honest Advice', 'Nationwide Delivery'],
  highlightsLabel = 'Highlights'
}: HeroSmallProps) {
  if (variant === 'used-cars') {
    return (
      <section className="inventory-list-hero inventory-hero inventory-hero-dark">
        <div className="container">
          <div className="inventory-hero-dark-shell">
            <h1 className="inventory-hero-dark-title">{title}</h1>
            <p className="inventory-hero-dark-lead">{subtitle}</p>
            <div className="inventory-hero-dark-actions">
              <a href="/sell-my-car" className="inventory-hero-dark-btn inventory-hero-dark-btn-secondary">
                Looking to sell?
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`hero-small compact-hero ${variant}-hero`}>
      <div className="container">
        <div className="hero-content">
          <p className="hero-kicker">{kicker}</p>
          <h1 className="hero-title">{title}</h1>
          <p className="hero-subtitle">{subtitle}</p>
          <div className="hero-meta" aria-label={highlightsLabel}>
            {highlights.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
