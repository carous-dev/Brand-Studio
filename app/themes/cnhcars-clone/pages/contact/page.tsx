'use client';

// audit-ignore-file: tp-use-client-on-page — Mode B clone consumes useBrand
// for brand-driven contact details. Collision-risk window is the file path
// `pages/contact/page.tsx`; this is the only theme rendering a client page
// at that exact route.
import { Phone, Mail, MapPin, Clock3, Navigation, MessageSquare, ShieldCheck, Car } from 'lucide-react';
import HeroSmall from '../../components/HeroSmall';
import ContactPageForm from '../../components/ContactPageForm';
import { useBrand } from '../../context/BrandClientWrapper';
import { getBrandContactInfo } from '../../lib/contact';
import '../../styles/contact-page.css';

type OpeningHoursEntry = { day?: string; hours?: string; opens?: string; closes?: string };

function describeHours(entry: OpeningHoursEntry | string | [string, string]): { day: string; hours: string } | null {
  if (Array.isArray(entry)) {
    const [day, value] = entry;
    if (!day) return null;
    return { day: String(day).trim(), hours: String(value || 'Closed').trim() };
  }
  if (typeof entry === 'string') {
    const [day, ...rest] = entry.split(':');
    if (!day) return null;
    return { day: day.trim(), hours: rest.join(':').trim() || 'Closed' };
  }
  const day = entry.day || '';
  const hours = entry.hours || (entry.opens && entry.closes ? `${entry.opens} - ${entry.closes}` : 'Closed');
  if (!day) return null;
  return { day, hours };
}

// brand.openingHours can be Record<string, string>, Array<OpeningHoursEntry>,
// Array<string>, or null. Normalise to a flat array of [day, value] pairs
// before mapping so the call site can't crash on the wrong shape.
function normaliseOpeningHours(raw: unknown): Array<{ day: string; hours: string }> {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(describeHours).filter(Boolean) as Array<{ day: string; hours: string }>;
  }
  if (typeof raw === 'object') {
    return Object.entries(raw as Record<string, unknown>)
      .map(([day, value]) => describeHours([day, typeof value === 'string' ? value : String(value ?? '')]))
      .filter(Boolean) as Array<{ day: string; hours: string }>;
  }
  return [];
}

export default function ContactPage() {
  const brand = useBrand();
  const contact = getBrandContactInfo(brand);
  const brandName = brand?.name || 'Our team';
  const normalisedHours = normaliseOpeningHours((brand as any)?.openingHours);
  const directionsHref = contact.showroomAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(contact.showroomAddress)}`
    : '#';
  const mapSrc = contact.showroomAddress
    ? `https://www.google.com/maps?q=${encodeURIComponent(contact.showroomAddress)}&output=embed`
    : '';

  return (
    <main className="contact-page">
      <HeroSmall />
      <section className="contact-main">
        <div className="container">
          <div className="contact-header">
            <h2>Choose the Fastest Way to Reach Us</h2>
            <p>
              Whether you are buying, selling, or valuing a car, our team can help with clear answers and quick
              follow-up.
            </p>
          </div>

          <div className="contact-quick-actions" aria-label="Primary contact actions">
            {contact.phoneDisplay ? (
              <a className="contact-action-card" href={contact.phoneTel ? `tel:${contact.phoneTel}` : `tel:${contact.phoneDisplay.replace(/\s+/g, '')}`}>
                <div className="contact-action-icon"><Phone /></div>
                <div className="contact-action-content">
                  <p className="contact-action-label">Call Us</p>
                  <p className="contact-action-value">{contact.phoneDisplay}</p>
                </div>
              </a>
            ) : null}
            {contact.email ? (
              <a className="contact-action-card" href={`mailto:${contact.email}`}>
                <div className="contact-action-icon"><Mail /></div>
                <div className="contact-action-content">
                  <p className="contact-action-label">Email</p>
                  <p className="contact-action-value">{contact.email}</p>
                </div>
              </a>
            ) : null}
            {contact.showroomAddress ? (
              <a className="contact-action-card" href={directionsHref} target="_blank" rel="noopener noreferrer">
                <div className="contact-action-icon"><Navigation /></div>
                <div className="contact-action-content">
                  <p className="contact-action-label">Directions</p>
                  <p className="contact-action-value">{contact.showroomAddress}</p>
                </div>
              </a>
            ) : null}
          </div>

          <div className="contact-layout">
            <aside className="contact-panel contact-info-panel" aria-labelledby="showroom-info-title">
              <h3 id="showroom-info-title">Showroom Information</h3>
              <div className="contact-info-list">
                {contact.showroomAddress ? (
                  <div className="contact-info-row">
                    <span className="contact-info-icon"><MapPin /></span>
                    <div>
                      <p className="contact-info-title">Address</p>
                      <p className="contact-info-text">{contact.showroomAddress}</p>
                    </div>
                  </div>
                ) : null}
                {normalisedHours.length > 0 ? (
                  <div className="contact-info-row">
                    <span className="contact-info-icon"><Clock3 /></span>
                    <div>
                      <p className="contact-info-title">Opening Hours</p>
                      <div className="hours-list">
                        {normalisedHours.map((entry) => (
                          <p key={entry.day}><strong>{entry.day}:</strong> {entry.hours}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="contact-feature-grid" aria-label="Why contact us">
                <div className="contact-feature">
                  <ShieldCheck className="contact-feature-icon" />
                  <div>
                    <p className="contact-feature-title">Straight Advice</p>
                    <p className="contact-feature-copy">No sales pressure, just practical help.</p>
                  </div>
                </div>
                <div className="contact-feature">
                  <Car className="contact-feature-icon" />
                  <div>
                    <p className="contact-feature-title">Vehicle Guidance</p>
                    <p className="contact-feature-copy">Support for buying, selling, and valuations.</p>
                  </div>
                </div>
              </div>
            </aside>

            <section className="contact-panel contact-form-panel">
              <ContactPageForm />
            </section>
          </div>

          {mapSrc ? (
            <section className="contact-map-wrap" aria-label="Map to showroom">
              <div className="contact-map-head">
                <MessageSquare className="contact-map-icon" />
                <div>
                  <h3>Visit {brandName}</h3>
                  <p>Planning a visit? Use the map for route guidance to our showroom.</p>
                </div>
              </div>
              <div className="contact-map-frame">
                <iframe
                  src={mapSrc}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${brandName} location`}
                />
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
