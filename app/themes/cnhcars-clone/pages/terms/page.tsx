import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  Shield,
  Truck,
} from 'lucide-react';
import { buildPageMetadata } from '../../lib/seo';
import {
  termsDocumentLinks,
  termsSections,
  type TermsContentBlock,
} from '../../data/vehiclePurchaseTerms';
import '../../styles/legal-pages.css';
import '../../styles/terms-page.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'Vehicle Purchase Terms & Conditions',
  description:
    'Read the CNH Cars vehicle purchase terms and conditions covering orders, deposits, payment, delivery, cancellation rights, returns, and complaints.',
  path: '/terms',
  keywords: [
    'cnh cars terms and conditions',
    'vehicle purchase terms',
    'car deposit policy uk',
    'used car cancellation rights',
  ],
});

function renderBlock(block: TermsContentBlock, index: number) {
  if (block.type === 'paragraph') {
    return <p key={index}>{block.text}</p>;
  }

  if (block.type === 'list') {
    return (
      <ul key={index}>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (block.type === 'note') {
    return (
      <div key={index} className="terms-note">
        <strong>{block.label}</strong>
        <p>{block.text}</p>
      </div>
    );
  }

  return (
    <div key={index} className="terms-contact-list">
      {block.items.map((item) => (
        <div key={item.label} className="terms-contact-row">
          <span className="terms-contact-label">{item.label}</span>
          {item.href ? (
            <a href={item.href}>{item.value}</a>
          ) : (
            <span>{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function TermsPage() {
  return (
    <main className="legal-page terms-page">
      <section className="hero hero-small hero-pattern">
        <div className="container">
          <div className="hero-content">
            <div className="hero-title">
              <span className="glow">Vehicle Purchase</span> <span className="accent">Terms</span>
            </div>
            <p className="hero-subtitle">
              The terms and conditions that apply when you place an order for a vehicle with CNH Cars.
            </p>
            <div className="hero-features">
              <div className="feature-item">
                <FileText className="icon" />
                <span>Order and contract terms</span>
              </div>
              <div className="feature-item">
                <RotateCcw className="icon" />
                <span>14-day cancellation window</span>
              </div>
              <div className="feature-item">
                <Truck className="icon" />
                <span>Delivery, ID and handover rules</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="legal-content">
        <div className="container">
          <div className="legal-grid">
            <div className="legal-main">
              {termsSections.map((section) => (
                <section key={section.id} id={section.id} className="terms-section" aria-labelledby={`${section.id}-title`}>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  {section.content.map((block, index) => renderBlock(block, index))}
                </section>
              ))}
            </div>

            <aside className="legal-sidebar">
              <div className="legal-nav">
                <h3>On this page</h3>
                <ul>
                  {termsSections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`}>{section.title}</a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="legal-nav">
                <h3>Legal Documents</h3>
                <ul>
                  {termsDocumentLinks.map((document) => (
                    <li key={document.href} className={document.href === '/terms/' ? 'active' : undefined}>
                      <Link href={document.href}>{document.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="legal-contact">
                <h3>Need help?</h3>
                <p>Contact CNH Cars if you need clarification before placing an order.</p>
                <div className="terms-support-list" aria-label="CNH Cars contact details">
                  <a href="tel:07537164889" className="terms-support-item">
                    <Phone className="terms-support-icon" />
                    <span>(07537) 164889</span>
                  </a>
                  <a href="mailto:chcars24@yahoo.com" className="terms-support-item">
                    <Mail className="terms-support-icon" />
                    <span>chcars24@yahoo.com</span>
                  </a>
                  <div className="terms-support-item terms-support-static">
                    <MapPin className="terms-support-icon" />
                    <span>113-115 Codicote Road, Welwyn, Hertfordshire, AL6 9TY</span>
                  </div>
                </div>
                <a href="/contact/" className="legal-contact-btn">
                  <MessageCircle className="legal-contact-btn-icon" />
                  Contact Us
                </a>
              </div>

              <div className="terms-side-note">
                <Shield className="terms-side-note-icon" />
                <p>
                  These terms sit alongside your order details. If there is any conflict, inconsistency, or ambiguity,
                  the order takes precedence.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
