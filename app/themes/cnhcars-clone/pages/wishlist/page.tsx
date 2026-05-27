import type { Metadata } from 'next';
import WishlistPageClient from './WishlistPageClient';
import { buildPageMetadata } from '../../lib/seo';

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Saved Vehicles',
    description:
      'View your saved vehicles and return to your shortlisted options at CNH Cars Ltd.',
    path: '/wishlist',
    keywords: ['wishlist cars', 'saved vehicles', 'shortlist used cars'],
  }),
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
