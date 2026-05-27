import { Metadata } from 'next';
import { Car, Search, MessageCircle, Truck, ShieldCheck, Clock3, PhoneCall, ChevronRight } from 'lucide-react';
import HeroSmall from '../../components/HeroSmall';
import { absoluteUrl, buildPageMetadata } from '../../lib/seo';
import '../../styles/services-page.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'Used Car Services in Welwyn',
  description:
    'Explore vehicle services at CNH Cars Ltd in Welwyn, Hertfordshire, including used car sales, valuations, buying advice, and delivery support.',
  path: '/services',
  keywords: ['car services welwyn', 'vehicle valuation hertfordshire', 'used car buying advice', 'delivery support uk'],
});

export default function ServicesPage() {
  const faqs = [
    {
      question: 'Do you provide vehicle valuations?',
      answer:
        'Yes. We offer practical valuation guidance to help with selling decisions and part-exchange planning.',
    },
    {
      question: 'Can I get buying advice before deciding?',
      answer:
        'Yes. We can discuss model suitability, budget fit, and likely running considerations before you commit.',
    },
    {
      question: 'Do you support nationwide delivery?',
      answer:
        'Yes. Delivery support can be arranged across the UK, or you can collect directly from our Welwyn site.',
    },
    {
      question: 'How quickly do you respond to enquiries?',
      answer:
        'We aim to respond quickly during opening hours and keep communication clear as the process moves forward.',
    },
  ];

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
        name: 'Services',
        item: absoluteUrl('/services'),
      },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const services = [
    {
      icon: Car,
      title: 'Used Car Sales',
      description:
        'Handpicked used cars and light motor vehicles, presented with clear details and practical support at each step.',
      points: ['Carefully selected stock', 'Clear vehicle descriptions', 'In-person and remote support'],
    },
    {
      icon: Search,
      title: 'Vehicle Valuations',
      description:
        'Straightforward valuations designed to help you understand your vehicle position before buying or selling.',
      points: ['Market-aware guidance', 'Transparent conversation', 'No pressure approach'],
    },
    {
      icon: MessageCircle,
      title: 'Buying Advice',
      description:
        'Practical recommendations based on usage, budget, and ownership goals so you can choose confidently.',
      points: ['Model suitability guidance', 'Practical ownership tips', 'Clear next-step planning'],
    },
    {
      icon: Truck,
      title: 'Delivery Support',
      description:
        'Nationwide delivery options can be arranged to make handover smoother when collection is not convenient.',
      points: ['UK-wide coverage support', 'Coordinated handover', 'Flexible collection options'],
    },
  ];

  return (
    <main className="services-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, faqJsonLd]) }}
      />
      <HeroSmall
        variant="services"
        kicker="CNH Cars Services"
        title="Practical Services, One Team"
        subtitle="Used car sales, valuations, and buying support delivered with clear communication and reliable follow-through."
        highlights={['Used Car Sales', 'Vehicle Valuations', 'Delivery Support']}
        highlightsLabel="Service highlights"
      />

      <section className="services-intro-section">
        <div className="container">
          <div className="services-intro-layout">
            <div className="services-intro-copy">
              <p className="services-eyebrow">Service approach</p>
              <h2>Built for clear decisions, not pressure</h2>
              <p>
                Our team supports customers across sales, valuations, and purchasing decisions with practical guidance
                from start to handover.
              </p>
              <p>
                Based in Welwyn, we focus on useful details, transparent communication, and outcomes that make sense
                for your requirements.
              </p>
            </div>
            <aside className="services-intro-panel" aria-label="Quick service notes">
              <article className="services-note-card">
                <Clock3 className="services-note-icon" />
                <div>
                  <h3>Fast Responses</h3>
                  <p>Quick follow-up on calls and enquiries during business hours.</p>
                </div>
              </article>
              <article className="services-note-card">
                <ShieldCheck className="services-note-icon" />
                <div>
                  <h3>Transparent Process</h3>
                  <p>Clear service steps with straightforward communication throughout.</p>
                </div>
              </article>
            </aside>
          </div>
        </div>
      </section>

      <section className="services-catalog-section">
        <div className="container">
          <div className="services-section-head">
            <p className="services-eyebrow">What we offer</p>
            <h2>Core services at CNH Cars</h2>
          </div>
          <div className="services-cards-grid">
            {services.map((service) => (
              <article key={service.title} className="service-modern-card">
                <div className="service-modern-head">
                  <span className="service-modern-icon">
                    <service.icon />
                  </span>
                  <h3>{service.title}</h3>
                </div>
                <p>{service.description}</p>
                <ul className="service-modern-points">
                  {service.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="services-process-section">
        <div className="container">
          <div className="services-section-head">
            <p className="services-eyebrow">How it works</p>
            <h2>Simple from first contact to completion</h2>
          </div>
          <ol className="services-process-list">
            <li className="services-process-item">
              <span className="services-step-index">01</span>
              <div>
                <h3>Discuss your requirement</h3>
                <p>Tell us what you need and we will quickly guide you to the right service path.</p>
              </div>
            </li>
            <li className="services-process-item">
              <span className="services-step-index">02</span>
              <div>
                <h3>Review your options</h3>
                <p>We provide practical details so you can compare choices with confidence.</p>
              </div>
            </li>
            <li className="services-process-item">
              <span className="services-step-index">03</span>
              <div>
                <h3>Confirm next steps</h3>
                <p>Once agreed, we align paperwork, preparation, and handover timing clearly.</p>
              </div>
            </li>
            <li className="services-process-item">
              <span className="services-step-index">04</span>
              <div>
                <h3>Complete with support</h3>
                <p>Collection or delivery support is coordinated with practical follow-through.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="services-faq-section">
        <div className="container">
          <div className="services-section-head">
            <p className="services-eyebrow">Common questions</p>
            <h2>Services FAQ</h2>
          </div>
          <div className="services-faq-list">
            <details className="services-faq-item" open>
              <summary>Do you provide vehicle valuations?</summary>
              <p>{faqs[0].answer}</p>
            </details>
            <details className="services-faq-item">
              <summary>Can I get buying advice before deciding?</summary>
              <p>{faqs[1].answer}</p>
            </details>
            <details className="services-faq-item">
              <summary>Do you support nationwide delivery?</summary>
              <p>{faqs[2].answer}</p>
            </details>
            <details className="services-faq-item">
              <summary>How quickly do you respond to enquiries?</summary>
              <p>{faqs[3].answer}</p>
            </details>
          </div>
        </div>
      </section>

      <section className="services-cta-section">
        <div className="container">
          <div className="services-cta-box">
            <h2>Need help with a vehicle today?</h2>
            <p>Speak to our team and we will point you to the most practical next step.</p>
            <div className="services-cta-actions">
              <a href="/used-cars/" className="services-btn services-btn-primary">
                Browse Used Cars
                <ChevronRight className="services-btn-icon" />
              </a>
              <a href="/contact/" className="services-btn services-btn-secondary">
                <PhoneCall className="services-btn-icon" />
                Contact Team
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
