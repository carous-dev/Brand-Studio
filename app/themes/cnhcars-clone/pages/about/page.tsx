import { Metadata } from 'next';
import { Clock3, MapPin, Car, Truck, ShieldCheck, MessageCircle, CheckCircle, Star } from 'lucide-react';
import HeroSmall from '../../components/HeroSmall';
import { absoluteUrl, buildPageMetadata, siteConfig } from '../../lib/seo';
import '../../styles/about-page.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'About Our Welwyn Dealership',
  description:
    'Learn about CNH Cars Ltd, a Welwyn-based used car dealership focused on clear communication, practical advice, and handpicked vehicles.',
  path: '/about',
  keywords: ['about cnh cars', 'welwyn used car dealer', 'hertfordshire car dealership', 'trusted local dealership'],
});

export default function About() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About',
        item: absoluteUrl('/about'),
      },
    ],
  };

  const aboutPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: `About ${siteConfig.name}`,
    url: absoluteUrl('/about'),
    description:
      'Background and service approach of CNH Cars Ltd in Welwyn, Hertfordshire.',
  };

  const reviewHighlights = [
    {
      author: 'Mohammed R',
      quote:
        'Very professional and trustworthy dealer. A team that follows through on what they promise.',
    },
    {
      author: 'Anonymous Buyer',
      quote:
        'Vehicle was exactly as described and collection from the station was straightforward and helpful.',
    },
    {
      author: 'Derek H',
      quote:
        'Second car purchased over the years. Easy transaction and great service throughout.',
    },
  ];

  return (
    <main className="about-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, aboutPageJsonLd]) }}
      />
      <HeroSmall
        variant="about"
        kicker="About CNH Cars"
        title="Local Team, Honest Service"
        subtitle="We are a Welwyn-based dealership focused on quality used cars, clear advice, and dependable customer care."
        highlights={['Trusted in Welwyn', 'Quality Checked Vehicles', 'Nationwide Delivery']}
        highlightsLabel="About highlights"
      />
      <section className="about-intro-section">
        <div className="container">
          <div className="about-intro-layout">
            <div className="about-intro-copy">
              <p className="about-eyebrow">Who we are</p>
              <h2>A straightforward dealership built around trust</h2>
              <p>
                CNH Cars Ltd is an active private limited company, incorporated on 18 November 2024 and based in
                Welwyn, Hertfordshire. We specialise in used cars and light motor vehicles, with practical support
                across valuations and buying advice.
              </p>
              <p>
                Our approach is simple: present vehicles clearly, communicate honestly, and help customers make
                informed decisions without pressure.
              </p>
              <div className="about-location-callout">
                <MapPin className="about-location-icon" />
                <div>
                  <p className="about-location-title">Visit our showroom</p>
                  <p className="about-location-text">
                    113-115 Codicote Road, Welwyn, Hertfordshire, AL6 9TY
                  </p>
                </div>
              </div>
            </div>

            <aside className="about-glance-panel" aria-label="Company overview">
              <h3>At a glance</h3>
              <div className="about-glance-grid">
                <article className="about-glance-card">
                  <span className="about-glance-icon">
                    <Clock3 />
                  </span>
                  <p className="about-glance-label">Established</p>
                  <p className="about-glance-value">November 2024</p>
                </article>
                <article className="about-glance-card">
                  <span className="about-glance-icon">
                    <MapPin />
                  </span>
                  <p className="about-glance-label">Location</p>
                  <p className="about-glance-value">Welwyn, Hertfordshire</p>
                </article>
                <article className="about-glance-card">
                  <span className="about-glance-icon">
                    <Car />
                  </span>
                  <p className="about-glance-label">Core Focus</p>
                  <p className="about-glance-value">Used Car Sales</p>
                </article>
                <article className="about-glance-card">
                  <span className="about-glance-icon">
                    <Truck />
                  </span>
                  <p className="about-glance-label">Support</p>
                  <p className="about-glance-value">Valuations and Delivery Help</p>
                </article>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="about-principles-section">
        <div className="container">
          <div className="about-section-head">
            <p className="about-eyebrow">How we work</p>
            <h2>Clear standards on every enquiry</h2>
          </div>
          <div className="about-principles-grid">
            <article className="about-principle-card">
              <ShieldCheck className="about-principle-icon" />
              <h3>Quality First</h3>
              <p>Every vehicle is reviewed and prepared to the same practical standard before handover.</p>
            </article>
            <article className="about-principle-card">
              <MessageCircle className="about-principle-icon" />
              <h3>Straight Communication</h3>
              <p>We keep conversations clear, direct, and transparent from first call to final collection.</p>
            </article>
            <article className="about-principle-card">
              <CheckCircle className="about-principle-icon" />
              <h3>After-Sale Support</h3>
              <p>Our team remains available after purchase to help with follow-up questions and guidance.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-process-section">
        <div className="container">
          <div className="about-section-head">
            <p className="about-eyebrow">What to expect</p>
            <h2>A simple process from enquiry to handover</h2>
          </div>
          <ol className="about-process-list">
            <li className="about-process-item">
              <span className="about-step-index">01</span>
              <div>
                <h3>Initial enquiry</h3>
                <p>Share what you need and we will quickly guide you to suitable options.</p>
              </div>
            </li>
            <li className="about-process-item">
              <span className="about-step-index">02</span>
              <div>
                <h3>Vehicle details</h3>
                <p>You receive clear vehicle information to help with confident decision making.</p>
              </div>
            </li>
            <li className="about-process-item">
              <span className="about-step-index">03</span>
              <div>
                <h3>Agreement and prep</h3>
                <p>Once agreed, we prepare the vehicle and organise handover or delivery support.</p>
              </div>
            </li>
            <li className="about-process-item">
              <span className="about-step-index">04</span>
              <div>
                <h3>Collection or delivery</h3>
                <p>Final checks and handover are completed with full clarity on next steps.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="about-reviews-section">
        <div className="container">
          <div className="about-section-head">
            <p className="about-eyebrow">Customer voice</p>
            <h2>What buyers say about CNH Cars</h2>
          </div>
          <div className="about-review-grid">
            {reviewHighlights.map((review) => (
              <article key={review.author} className="about-review-card">
                <Star className="about-review-star" />
                <p className="about-review-quote">"{review.quote}"</p>
                <p className="about-review-author">{review.author}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta-section">
        <div className="container">
          <div className="about-cta-box">
            <h2>Ready to browse our latest vehicles?</h2>
            <p>Explore the current stock or contact our team for direct help.</p>
            <div className="about-cta-actions">
              <a href="/used-cars/" className="about-btn about-btn-primary">Browse Used Cars</a>
              <a href="/contact/" className="about-btn about-btn-secondary">Contact Us</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
