import type { DealerConfig, DealerTheme } from '../lib/vendor/dealer-shell'

/**
 * Dealer identity for the PMG Used Car Sales theme.
 *
 * Ported verbatim from the source app's `site.config.ts`. In brandstudio the
 * *colors* + *images* + *inventory* flow from the brand record (BrandStyles +
 * /api/inventory?brand=<slug>); this static config supplies the dealer's
 * identity text (name / phone / address / opening hours) so every `dealer.*`
 * read in the ported components keeps working without threading `useBrand()`
 * through every server component. Same approach as cnhcars-clone/data/profile.
 */
export const dealer: DealerConfig = {
  dealerClientId: process.env.DEALER_CLIENT_ID || process.env.NEXT_PUBLIC_CLIENT_ID || '',
  brandName: 'PMG Used Car Sales',
  legalName: 'Pak Motor Group',
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, ''),
  logoPath: '/themes/pmg-used-cars/images/logo-transparent.png',
  contact: {
    phoneE164: '+447457401033',
    phoneDisplay: '07457 401033',
    whatsappNumber: '+447457401033',
    email: 'sales@pakmotorgroup.co.uk',
  },
  address: {
    line1: 'Caldervale Mills, Huddersfield Road',
    town: 'Dewsbury',
    county: 'West Yorkshire',
    postcode: 'WF13 3JL',
    country: 'GB',
  },
  openingHours: {
    1: '10:00-17:00',
    2: '10:00-17:00',
    3: '10:00-17:00',
    4: '10:00-17:00',
    5: '10:00-17:00',
    6: '10:00-16:30',
    7: '11:00-15:00',
  },
  reservations: {
    enabled: true,
    holdHours: 24,
  },
}

/**
 * Theme contract used by the vehicle-detail external widgets (reserve / enquiry
 * gallery template). PMG brand: jet-black surfaces, PMG red accent.
 */
export const theme: DealerTheme = {
  id: 'pmg',
  galleryTemplate: 'grid',
  tokens: {
    brandPrimary: '#DE010D',
    brandOnPrimary: '#ffffff',
    brandAccent: '#FF3B45',
    bgSurface: '#ffffff',
    fgPrimary: '#1B1B1F',
    fgMuted: '#5D5D66',
    borderSubtle: '#E3E3E7',
    radiusSm: '10px',
    radiusMd: '16px',
    fontDisplay: 'var(--font-display)',
    fontSans: 'var(--font-body)',
  },
}
