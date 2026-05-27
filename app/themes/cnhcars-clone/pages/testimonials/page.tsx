import type { Metadata } from 'next';
import Link from 'next/link';
import { absoluteUrl, buildPageMetadata } from '../../lib/seo';
import { loadReviewsFromProfile, type ParsedReview } from '../../lib/reviews';
import '../../styles/testimonials-page.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'Customer Testimonials',
  description:
    'Read customer testimonials for CNH Cars Ltd in Welwyn, Hertfordshire, based on genuine buyer feedback.',
  path: '/testimonials',
  keywords: ['cnh cars reviews', 'customer testimonials', 'welwyn used car reviews', 'hertfordshire dealership feedback'],
});

const fallbackReviews: ParsedReview[] = [
  {
    id: 1,
    name: 'Customer',
    text: 'Great service and straightforward communication from first enquiry to handover.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Customer',
    text: 'Vehicle matched the advert and the team made the process simple.',
    rating: 5,
  },
];

export default async function TestimonialsPage() {
  const reviews = await loadReviewsFromProfile(12).catch((): ParsedReview[] => []);
  const list = reviews.length > 0 ? reviews : fallbackReviews;
  const ratedReviews = list.filter((review) => typeof review.rating === 'number' && review.rating > 0);
  const averageRating = ratedReviews.length
    ? Number((ratedReviews.reduce((sum, review) => sum + review.rating, 0) / ratedReviews.length).toFixed(1))
    : null;

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
        name: 'Testimonials',
        item: absoluteUrl('/testimonials'),
      },
    ],
  };

  const reviewJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: 'CNH Cars Ltd',
    url: absoluteUrl('/'),
    review: list.slice(0, 8).map((review) => ({
      '@type': 'Review',
      reviewBody: review.text,
      author: {
        '@type': 'Person',
        name: review.name,
      },
      ...(review.rating
        ? {
            reviewRating: {
              '@type': 'Rating',
              ratingValue: review.rating,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
    })),
    ...(averageRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: averageRating,
            reviewCount: ratedReviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <main className="testimonials-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, reviewJsonLd]) }}
      />

      <section className="testimonials-page-hero">
        <div className="container">
          <p className="testimonials-page-kicker">Customer Feedback</p>
          <h1>Real Reviews from Recent Buyers</h1>
          <p className="testimonials-page-lead">
            These testimonials are based on genuine customer feedback and reflect the service experience at CNH Cars
            Ltd in Welwyn, Hertfordshire.
          </p>
          <div className="testimonials-page-stats">
            {averageRating ? (
              <span className="testimonials-page-stat">Average rating: {averageRating}/5</span>
            ) : null}
            <span className="testimonials-page-stat">{list.length} reviews shown</span>
            <span className="testimonials-page-stat">Location: Welwyn, Hertfordshire</span>
          </div>
        </div>
      </section>

      <section className="testimonials-page-content">
        <div className="container">
          <div className="testimonials-page-grid">
            {list.map((review) => (
              <article key={`${review.id}-${review.name}`} className="testimonials-page-card">
                <p className="testimonials-page-rating">
                  {review.rating ? `${review.rating}/5` : 'No rating provided'}
                </p>
                <blockquote>"{review.text}"</blockquote>
                <p className="testimonials-page-author">
                  {review.name}
                  {review.dateLabel ? <span className="testimonials-page-date"> - {review.dateLabel}</span> : null}
                </p>
              </article>
            ))}
          </div>
          <div className="testimonials-page-footer">
            <p>Looking for a specific model? Browse our current stock and enquire directly.</p>
            <Link href="/used-cars" className="testimonials-page-link">
              Browse Used Cars
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
