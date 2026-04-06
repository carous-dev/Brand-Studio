/**
 * Profile.txt Parser
 * 
 * Converts profile.txt format into brand configuration.
 * 
 * Expected profile.txt format:
 * Company Name
 * 
 * Address
 * Line 1
 * City
 * County
 * Postcode
 * 
 * Phone number
 * (123) 456-7890
 * 
 * Email
 * info@company.com
 * 
 * Opening hours
 * Monday
 * HH:MM - HH:MM
 * ...
 * 
 * About us
 * Company description text...
 * 
 * Logo
 * /path/to/logo.png
 * 
 * Social Links
 * Facebook: https://...
 * Twitter: https://...
 * Instagram: https://...
 */

export interface ParsedProfile {
  companyName: string;
  address: {
    fullAddress: any;
    line1: string;
    city: string;
    county: string;
    postcode: string;
  };
  phone: string;
  email: string;
  openingHours: Record<string, string>;
  aboutDescription: string;
  logoPath: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
  };
}

/**
 * Parse profile.txt content into structured data
 * @param content - Raw content of profile.txt
 * @returns Parsed profile data
 */
export function parseProfile(content: string): ParsedProfile {
  const lines = content.split('\n').map((l) => l.trim()).filter((l) => l);
  const result: ParsedProfile = {
    companyName: '',
    address: {
        line1: '', city: '', county: '', postcode: '',
        fullAddress: undefined
    },
    phone: '',
    email: '',
    openingHours: {},
    aboutDescription: '',
    logoPath: '',
    socialLinks: {},
  };

  let i = 0;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Company name (first line)
  if (i < lines.length) {
    result.companyName = lines[i++];
  }

  // Parse sections
  while (i < lines.length) {
    const line = lines[i];

    if (line === 'Address' && i + 4 < lines.length) {
      result.address.line1 = lines[++i];
      result.address.city = lines[++i];
      result.address.county = lines[++i];
      result.address.postcode = lines[++i];
      i++;
    } else if (line === 'Phone number' && i + 1 < lines.length) {
      result.phone = lines[++i];
      i++;
    } else if (line === 'Email' && i + 1 < lines.length) {
      result.email = lines[++i];
      i++;
    } else if (line === 'Opening hours') {
      i++;
      while (i < lines.length && days.includes(lines[i])) {
        const day = lines[i++];
        const hours = lines[i++];
        if (hours) result.openingHours[day] = hours;
      }
    } else if (line === 'About us') {
      i++;
      const aboutLines = [];
      while (i < lines.length && !['Services', 'Logo', 'Social', 'Features'].includes(lines[i])) {
        if (lines[i] && !lines[i].startsWith('Logo')) {
          aboutLines.push(lines[i]);
        }
        i++;
      }
      result.aboutDescription = aboutLines.join(' ').trim();
    } else if (line === 'Logo' && i + 1 < lines.length) {
      result.logoPath = lines[++i];
      i++;
    } else if (line.startsWith('Facebook:')) {
      result.socialLinks.facebook = line.replace('Facebook:', '').trim();
      i++;
    } else if (line.startsWith('Twitter:')) {
      result.socialLinks.twitter = line.replace('Twitter:', '').trim();
      i++;
    } else if (line.startsWith('Instagram:')) {
      result.socialLinks.instagram = line.replace('Instagram:', '').trim();
      i++;
    } else if (line.startsWith('YouTube:')) {
      result.socialLinks.youtube = line.replace('YouTube:', '').trim();
      i++;
    } else if (line.startsWith('LinkedIn:')) {
      result.socialLinks.linkedin = line.replace('LinkedIn:', '').trim();
      i++;
    } else {
      i++;
    }
  }

  return result;
}

/**
 * Convert parsed profile to brand config template
 */
export function profileToBrandTemplate(parsed: ParsedProfile, brandSlug: string): string {
  const openingHoursStr = Object.entries(parsed.openingHours)
    .map(([day, hours]) => `    ${day}: '${hours}',`)
    .join('\n');

  const socialLinksStr = Object.entries(parsed.socialLinks)
    .filter(([, url]) => url)
    .map(([platform, url]) => `    ${platform}: '${url}',`)
    .join('\n');

  return `/**
 * ${parsed.companyName} - Brand Configuration
 * Generated from profile.txt
 */

import type { BrandConfig } from './types';

export const ${brandSlug}Config: BrandConfig = {
  name: '${parsed.companyName}',
  tagline: 'Your local dealership with exceptional service',
  domain: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  logo: '${parsed.logoPath}',
  favicon: '/favicon.svg',

  location: {
    address: {
      line1: '${parsed.address.line1}',
      line2: '',
      city: '${parsed.address.city}',
      county: '${parsed.address.county}',
      postcode: '${parsed.address.postcode}',
    },
    phone: '${parsed.phone}',
    email: '${parsed.email}',
    fullAddress: '${parsed.address.line1}, ${parsed.address.city}, ${parsed.address.county} ${parsed.address.postcode}',
  },

  socialLinks: {
${socialLinksStr}
  },

  openingHours: {
${openingHoursStr}
  },

  aboutUs: {
    title: 'About Us',
    headline: 'Welcome to ${parsed.companyName}',
    description: '${parsed.aboutDescription}',
  },

  whyChooseUs: {
    title: 'Why Choose Us?',
    features: [
      {
        id: 'quality',
        title: 'QUALITY VEHICLES',
        description: 'All vehicles are carefully inspected and prepared',
      },
      {
        id: 'service',
        title: 'EXCELLENT SERVICE',
        description: 'We prioritize customer satisfaction above all',
      },
      {
        id: 'transparency',
        title: 'TRANSPARENCY',
        description: 'No hidden fees, honest and upfront pricing',
      },
    ],
  },

  services: {
    title: 'Our Services',
    categories: {
      business: ['Vehicle sales', 'Part exchange', 'Finance arrangements'],
      automotive: ['Vehicle inspection', 'Professional preparation', 'Test drives'],
    },
  },

  testimonials: [
    {
      name: 'Satisfied Customer',
      date: 'Recently',
      rating: 5,
      platform: 'Google Reviews',
      review: 'Great experience! Highly recommended.',
    },
  ],

  faq: [
    {
      question: 'Where are you located?',
      answer: 'We are located at ${parsed.address.fullAddress}',
    },
  ],

  seo: {
    title: '${parsed.companyName}',
    description: '${parsed.aboutDescription.substring(0, 160)}',
    keywords: [
      'used cars ${parsed.address.city}',
      'car dealership ${parsed.address.county}',
      'quality vehicles',
    ],
    twitterHandle: '@${brandSlug}',
    country: 'GB',
  },

  theme: {
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f8f9fa',
      bgTertiary: '#f1f3f5',
      bgElevated: '#ffffff',
      bgGlass: 'rgba(255, 255, 255, 0.95)',

      textPrimary: '#1a1f36',
      textSecondary: '#475569',
      textMuted: '#64748b',
      textInverse: '#ffffff',

      accentPrimary: '#0066cc',
      accentPrimaryRgb: '0, 102, 204',
      accentHover: '#0052a3',
      accentActive: '#003d7a',
      accentSoft: '#cce5ff',
      accentChrome: '#0066cc',
      accentIvory: '#e6f0ff',
      accentLine: 'rgba(0, 102, 204, 0.2)',

      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',

      borderSubtle: 'rgba(0, 0, 0, 0.05)',
      borderDefault: 'rgba(0, 0, 0, 0.1)',
      borderStrong: 'rgba(0, 0, 0, 0.2)',
      borderAccent: '#0066cc',

      fieldBg: '#ffffff',
      fieldBorder: 'rgba(0, 0, 0, 0.1)',
      fieldText: '#1a1f36',
    },
  },
};

export default ${brandSlug}Config;
`;
}
