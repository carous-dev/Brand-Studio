import type { ThemeRecipeRegistry } from '../../types'

export const themeRecipes: ThemeRecipeRegistry = {
  homeHero: {
    section: 'hero',
    description: 'Classic dealer homepage hero composition.',
    defaults: {
      align: 'left',
      overlay: 'dark',
    },
  },
  usedCarsHero: {
    section: 'hero',
    description: 'Used-cars page hero content and call-to-action defaults.',
    defaults: {
      title: 'Used Cars',
      description: 'Browse inspected stock with flexible finance and part exchange options.',
      primaryCtaLabel: 'Browse Stock',
      primaryCtaHref: '#inventoryResultsGrid',
      secondaryCtaLabel: 'Contact Us',
      secondaryCtaHref: '/contact',
      overlay: 'dark',
    },
  },
  aboutPage: {
    section: 'about',
    description: 'About page layout recipe with hero, story, values, timeline, and call-to-action sections.',
    defaults: {
      hero: {
        title: 'About Us',
        subtitle: 'Trusted used car specialists with a customer-first approach.',
        badges: 3,
      },
      values: {
        itemCount: 4,
      },
      timeline: {
        itemCount: 3,
      },
      cta: {
        primaryLabel: 'View Used Cars',
        primaryHref: '/used-cars',
        secondaryLabel: 'Contact Us',
        secondaryHref: '/contact',
      },
    },
  },
  contactPage: {
    section: 'contact',
    description: 'Contact page recipe with hero badges, contact cards, map and enquiry form defaults.',
    defaults: {
      hero: {
        title: 'Contact Us',
        subtitle: 'Speak with our team about stock, finance, part exchange or selling your car.',
        badges: 3,
      },
      info: {
        cardCount: 4,
      },
      form: {
        title: 'Send A Message',
        submitLabel: 'Send Enquiry',
      },
    },
  },
  vehicleDetailPage: {
    section: 'vehicleDetail',
    description: 'Vehicle details page recipe with gallery, overview, specification blocks, side summary and related stock.',
    defaults: {
      overview: {
        title: 'Vehicle Overview',
        previewLimit: 320,
      },
      summary: {
        kicker: 'Vehicle Snapshot',
      },
      related: {
        title: 'Similar Vehicles',
        viewAllLabel: 'View All Stock',
        limit: 3,
      },
      history: {
        itemCount: 4,
      },
    },
  },
}
