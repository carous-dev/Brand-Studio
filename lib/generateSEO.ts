/**
 * SEO Content Generator
 * 
 * Generates localized, SEO-optimized page content from brand configuration.
 * Automatically creates location-based keywords, descriptions, and page titles.
 */

import type { BrandConfig } from '@/brands/types';

export interface LocalizedSEO {
  title: string;
  description: string;
  keywords: string[];
  heading: string;
  subheading: string;
}

/**
 * Generate localized home page SEO
 */
export function generateHomePageSEO(brand: BrandConfig): LocalizedSEO {
  const { name, location, seo } = brand;
  const { city, county } = location.address;

  return {
    title: `${name} - Quality Used Cars in ${city}, ${county}`,
    description: `Discover quality used cars at ${name}, a family-run dealership in ${city}, ${county}. Finance options, home delivery, part exchange, and exceptional service.`,
    keywords: [
      `used cars ${city}`,
      `car dealership ${county}`,
      `quality used vehicles ${city}`,
      `car finance ${city}`,
      `second-hand cars ${city}`,
      `vehicle sales ${county}`,
      `part exchange ${city}`,
      `home delivery cars ${city}`,
    ],
    heading: `Quality Used Cars in ${city}, ${county}`,
    subheading: `${name} - Your trusted local car dealership`,
  };
}

/**
 * Generate localized about page SEO
 */
export function generateAboutPageSEO(brand: BrandConfig): LocalizedSEO {
  const { name, location, aboutUs } = brand;
  const { city, county } = location.address;

  return {
    title: `About ${name} - Used Car Dealer in ${city}`,
    description: `Learn about ${name}, a trusted used car dealership in ${city}, ${county}. Expert service, quality vehicles, and customer-first approach.`,
    keywords: [
      `about ${name}`,
      `car dealer ${city}`,
      `used car specialist ${county}`,
      `family-run dealership`,
      `professional car sales`,
      `customer reviews ${city}`,
    ],
    heading: aboutUs?.headline || `About ${name}`,
    subheading: `Your local ${city} car dealership specialist`,
  };
}

/**
 * Generate localized services page SEO
 */
export function generateServicesPageSEO(brand: BrandConfig): LocalizedSEO {
  const { name, location, services } = brand;
  const { city } = location.address;

  // Support both legacy and new structure
  let businessCategories: string[] = [];
  if (services && (services as any).categories && Array.isArray((services as any).categories.business)) {
    businessCategories = (services as any).categories.business;
  } else if (services && Array.isArray(services.items)) {
    businessCategories = services.items.map((item: any) => item.title).filter(Boolean);
  }

  return {
    title: `Services - ${name} | ${city}`,
    description: businessCategories.length > 0
      ? `${name} offers ${businessCategories.join(', ')}. Comprehensive vehicle services in ${city} with professional care.`
      : `${name} offers a range of automotive services in ${city} with professional care.`,
    keywords: [
      `car services ${city}`,
      ...businessCategories.map((s) => `${s} ${city}`),
      `vehicle preparation`,
      `professional inspection`,
    ],
    heading: `Our Services in ${city}`,
    subheading: `Professional automotive solutions`,
  };
}

/**
 * Generate localized contact page SEO
 */
export function generateContactPageSEO(brand: BrandConfig): LocalizedSEO {
  const { name, location } = brand;
  const { city, county } = location.address;

  return {
    title: `Contact ${name} - ${city}, ${county}`,
    description: `Get in touch with ${name}. Visit us in ${city} or call ${location.phone}. We're here to help with your car needs.`,
    keywords: [
      `contact ${name}`,
      `${name} phone`,
      `${name} address`,
      `car dealer ${city}`,
      `reach us ${city}`,
    ],
    heading: `Get in Touch`,
    subheading: `Contact ${name} in ${city}`,
  };
}

/**
 * Generate localized sell car page SEO
 */
export function generateSellCarPageSEO(brand: BrandConfig): LocalizedSEO {
  const { name, location } = brand;
  const { city } = location.address;

  return {
    title: `Sell Your Car to ${name} | ${city}`,
    description: `Sell your car to ${name} in ${city}. Easy process, fair prices, and instant payment. We buy all makes and models.`,
    keywords: [
      `sell car ${city}`,
      `sell your vehicle ${city}`,
      `car buying service`,
      `instant car valuation`,
      `sell used car`,
      `trade in ${city}`,
    ],
    heading: `Sell Your Car to ${name}`,
    subheading: `Quick, easy, and fair`,
  };
}

/**
 * Generate localized inventory page SEO
 */
export function generateInventoryPageSEO(brand: BrandConfig): LocalizedSEO {
  const { name, location } = brand;
  const { city, county } = location.address;

  return {
    title: `Used Cars for Sale | ${name} | ${city}, ${county}`,
    description: `Browse our full selection of quality used cars in ${city}, ${county}. All vehicles inspected and ready to drive.`,
    keywords: [
      `used cars ${city}`,
      `cars for sale ${county}`,
      `quality vehicles ${city}`,
      `second-hand cars ${city}`,
      `buy used car online`,
      `vehicle selection`,
    ],
    heading: `Used Cars in ${city}`,
    subheading: `Quality vehicles, competitive prices`,
  };
}

/**
 * Generate all page SEO content for a brand
 */
export const pagesSEO = {
  home: generateHomePageSEO,
  about: generateAboutPageSEO,
  services: generateServicesPageSEO,
  contact: generateContactPageSEO,
  sellCar: generateSellCarPageSEO,
  inventory: generateInventoryPageSEO,
} as const;

export default pagesSEO;
