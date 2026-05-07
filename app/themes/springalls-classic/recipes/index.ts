import type { ThemeRecipeRegistry } from '../../types'

export const themeRecipes: ThemeRecipeRegistry = {
  homeHero: {
    section: 'hero',
    description: 'Springalls homepage hero with overlay, headline, lead and inline search bar.',
    defaults: {
      align: 'center',
      overlay: 'soft-dark',
      searchVariant: 'pill',
    },
  },
  trustSignals: {
    section: 'trustSignals',
    description: 'Reassurance row directly below the hero (review platform badges, AA approved, etc).',
    defaults: {
      itemCount: 4,
    },
  },
  latestArrivals: {
    section: 'inventory',
    description: 'Carousel of newest stock pulled from /api/inventory.',
    defaults: {
      title: 'Latest arrivals',
      limit: 8,
      ctaLabel: 'View all stock',
      ctaHref: '/used-cars',
    },
  },
  serviceHighlights: {
    section: 'services',
    description: 'Grid of headline services (finance, part-exchange, warranty, delivery).',
    defaults: {
      itemCount: 4,
    },
  },
  servicesSection: {
    section: 'services',
    description: 'Card list of detailed services with descriptions.',
    defaults: {
      itemCount: 6,
    },
  },
  reviewsSection: {
    section: 'reviews',
    description: 'Customer review highlights with star rating.',
    defaults: {
      starRating: 5,
      itemCount: 3,
    },
  },
  ctaSection: {
    section: 'cta',
    description: 'Mid-page call-to-action banner driving valuations and contact.',
    defaults: {
      primaryLabel: 'Sell your car',
      primaryHref: '/sell-your-car',
      secondaryLabel: 'Contact us',
      secondaryHref: '/contact',
    },
  },
  directorySection: {
    section: 'directory',
    description: 'A-Z chip directory of available makes for SEO and discovery.',
    defaults: {
      ctaHref: '/used-cars',
    },
  },
  vehicleDetailPage: {
    section: 'vehicleDetail',
    description: 'Vehicle details page with gallery, summary, similar vehicles.',
    defaults: {
      summaryStickyTop: '20px',
      similarLimit: 3,
    },
  },
  contactPage: {
    section: 'contact',
    description: 'Contact page with showroom location, phone, email and lead form.',
    defaults: {
      submitLabel: 'Send enquiry',
    },
  },
}
