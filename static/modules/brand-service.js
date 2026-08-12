/**
 * Brand Service Module
 * Handles brand CRUD operations
 */

import { ApiService } from './api-service.js';

const appendRepeaterEntries = (formData, entries = [], generatorFn = () => {}) => {
  entries.forEach((entry, index) => {
    generatorFn(entry, index);
  });
};

const appendServiceSection = (formData, services = {}) => {
  if (!services) return;

  if (services.title) {
    formData.append('servicesTitle', services.title);
  }

  const items = Array.isArray(services.items) ? services.items : [];
  if (items.length) {
    items.forEach((service, index) => {
      if (service?.title) {
        formData.append(`service${index}Title`, service.title);
      }
      if (service?.description) {
        formData.append(`service${index}Description`, service.description);
      }
    });
    formData.append('services', JSON.stringify(items));
  }

  const appendCategoryList = (fieldName, list = []) => {
    if (Array.isArray(list) && list.length) {
      formData.append(fieldName, list.join('\n'));
    }
  };

  appendCategoryList('businessServices', services.categories?.business);
  appendCategoryList('automotiveServices', services.categories?.automotive);
};

export const BrandService = {
  /**
   * Load all brands
   */
  async loadBrands() {
    try {
      const response = await ApiService.getBrands();
      return response.previews || response.brands || [];
    } catch (error) {
      console.error('Failed to load brands:', error);
      throw error;
    }
  },

  /**
   * Load brands with backend pagination
   */
  async loadBrandsPaginated(page = 1, perPage = 12, search = '') {
    try {
      const response = await ApiService.getBrands({
        page,
        per_page: perPage,
        q: search || undefined,
      });
      const brands = response.previews || response.brands || [];
      return {
        brands,
        pagination: {
          page: response.page || page,
          perPage: response.per_page || perPage,
          total: response.total ?? brands.length,
          totalPages: response.total_pages || 1,
        },
      };
    } catch (error) {
      console.error('Failed to load brands (paginated):', error);
      throw error;
    }
  },

  /**
   * Load single brand
   */
  async loadBrand(slug) {
    try {
      const response = await ApiService.getBrand(slug);
      return response?.preview || response?.brand || null;
    } catch (error) {
      console.error(`Failed to load brand ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Create new brand
   */
  async createBrand(slug, config, logoFile = null, faviconFile = null, heroImageFile = null) {
    try {
      // Debug: Log what we're sending to backend
      console.log('=== Creating Brand ===');
      console.log('Slug:', slug);
      console.log('Config:', JSON.stringify(config, null, 2));
      console.log('Logo file:', logoFile ? logoFile.name : 'none');
      console.log('Favicon file:', faviconFile ? faviconFile.name : 'none');
      console.log('Hero image file:', heroImageFile ? heroImageFile.name : 'none');
      
      const formData = new FormData();
      
      // Basic info
      formData.append('slug', slug);
      formData.append('name', config.name || '');
      formData.append('tagline', config.tagline || '');
      formData.append('domain', config.domain || '');
      
      // Location
      if (config.location?.address?.line1) formData.append('address1', config.location.address.line1);
      if (config.location?.address?.city) formData.append('city', config.location.address.city);
      if (config.location?.address?.postcode) formData.append('postcode', config.location.address.postcode);
      
      // Contact
      if (config.location?.phone) formData.append('phone', config.location.phone);
      if (config.location?.email) formData.append('email', config.location.email);
      
      // Social Links
      if (config.socialLinks?.facebook) formData.append('facebook', config.socialLinks.facebook);
      if (config.socialLinks?.instagram) formData.append('instagram', config.socialLinks.instagram);
      if (config.socialLinks?.youtube) formData.append('youtube', config.socialLinks.youtube);
      if (config.socialLinks?.linkedin) formData.append('linkedin', config.socialLinks.linkedin);
      
      // Opening Hours
      if (config.openingHours) {
        Object.entries(config.openingHours).forEach(([day, hours]) => {
          formData.append(`${day.toLowerCase()}Hours`, hours);
        });
      }
      
      // About
      if (config.aboutUs?.title) formData.append('aboutTitle', config.aboutUs.title);
      if (config.aboutUs?.headline) formData.append('aboutHeadline', config.aboutUs.headline);
      if (config.aboutUs?.description) formData.append('aboutDescription', config.aboutUs.description);
      
      // Why Choose Us
      if (config.whyChooseUs?.title) formData.append('whyChooseUsTitle', config.whyChooseUs.title);
      appendRepeaterEntries(formData, config.whyChooseUs?.features || [], (feature, index) => {
        formData.append(`feature${index + 1}Title`, feature.title);
        formData.append(`feature${index + 1}Description`, feature.description);
      });
      
      // Services
      appendServiceSection(formData, config.services);
      
      // Testimonials
      appendRepeaterEntries(formData, config.testimonials || [], (testimonial, index) => {
        formData.append(`testimonial${index + 1}Customer`, testimonial.customer);
        formData.append(`testimonial${index + 1}Text`, testimonial.text);
        formData.append(`testimonial${index + 1}Rating`, testimonial.rating.toString());
      });
      
      // FAQ
      appendRepeaterEntries(formData, config.faq || [], (item, index) => {
        formData.append(`faq${index + 1}Question`, item.question);
        formData.append(`faq${index + 1}Answer`, item.answer);
      });
      
      // SEO
      if (config.seo?.title) formData.append('seoTitle', config.seo.title);
      if (config.seo?.description) formData.append('seoDesc', config.seo.description);
      if (config.seo?.keywords && Array.isArray(config.seo.keywords)) {
        formData.append('keywords', config.seo.keywords.join('\n'));
      }
      if (config.seo?.twitterHandle) formData.append('twitter', config.seo.twitterHandle);
      if (config.seo?.country) formData.append('country', config.seo.country);
      
      // Theme Colors - Submit individually
      if (config.theme?.colors) {
        formData.append('primaryColor', config.theme.colors.primaryColor || '#c41e3a');
        formData.append('secondaryColor', config.theme.colors.secondaryColor || '#666666');
        formData.append('accentColor', config.theme.colors.accentColor || '#c41e3a');
        if (config.theme.colors.backgroundColor) formData.append('backgroundColor', config.theme.colors.backgroundColor);
        if (config.theme.colors.textColor) formData.append('textColor', config.theme.colors.textColor);
      }

      if (logoFile) formData.append('logoFile', logoFile);
      if (faviconFile) formData.append('faviconFile', faviconFile);
      if (heroImageFile) formData.append('heroImageFile', heroImageFile);

      const response = await ApiService.createBrand(formData);
      
      // Debug: Log response
      console.log('Backend response:', response);
      
      const preview = response.preview || response.brand || null;
      return {
        brand: preview,
        config: response.config || null,
        message: response.message,
        success: response.success !== false
      };
    } catch (error) {
      console.error('Failed to create brand:', error);
      throw error;
    }
  },

  /**
   * Update existing brand
   */
  async updateBrand(slug, config, logoFile = null, faviconFile = null, heroImageFile = null) {
    try {
      const formData = new FormData();
      
      // Basic info
      formData.append('slug', slug);
      formData.append('name', config.name || '');
      formData.append('tagline', config.tagline || '');
      formData.append('domain', config.domain || '');
      
      // Location
      if (config.location?.address?.line1) formData.append('address1', config.location.address.line1);
      if (config.location?.address?.city) formData.append('city', config.location.address.city);
      if (config.location?.address?.postcode) formData.append('postcode', config.location.address.postcode);
      
      // Contact
      if (config.location?.phone) formData.append('phone', config.location.phone);
      if (config.location?.email) formData.append('email', config.location.email);
      
      // Social Links
      if (config.socialLinks?.facebook) formData.append('facebook', config.socialLinks.facebook);
      if (config.socialLinks?.instagram) formData.append('instagram', config.socialLinks.instagram);
      if (config.socialLinks?.youtube) formData.append('youtube', config.socialLinks.youtube);
      if (config.socialLinks?.linkedin) formData.append('linkedin', config.socialLinks.linkedin);
      
      // Opening Hours
      if (config.openingHours) {
        Object.entries(config.openingHours).forEach(([day, hours]) => {
          formData.append(`${day.toLowerCase()}Hours`, hours);
        });
      }
      
      // About
      if (config.aboutUs?.title) formData.append('aboutTitle', config.aboutUs.title);
      if (config.aboutUs?.headline) formData.append('aboutHeadline', config.aboutUs.headline);
      if (config.aboutUs?.description) formData.append('aboutDescription', config.aboutUs.description);
      
      // Why Choose Us
      if (config.whyChooseUs?.title) formData.append('whyChooseUsTitle', config.whyChooseUs.title);
      appendRepeaterEntries(formData, config.whyChooseUs?.features || [], (feature, index) => {
        formData.append(`feature${index + 1}Title`, feature.title);
        formData.append(`feature${index + 1}Description`, feature.description);
      });
      
      // Services
      appendServiceSection(formData, config.services);
      
      // Testimonials
      appendRepeaterEntries(formData, config.testimonials || [], (testimonial, index) => {
        formData.append(`testimonial${index + 1}Customer`, testimonial.customer);
        formData.append(`testimonial${index + 1}Text`, testimonial.text);
        formData.append(`testimonial${index + 1}Rating`, testimonial.rating.toString());
      });
      
      // FAQ
      appendRepeaterEntries(formData, config.faq || [], (item, index) => {
        formData.append(`faq${index + 1}Question`, item.question);
        formData.append(`faq${index + 1}Answer`, item.answer);
      });
      
      // SEO
      if (config.seo?.title) formData.append('seoTitle', config.seo.title);
      if (config.seo?.description) formData.append('seoDesc', config.seo.description);
      if (config.seo?.keywords && Array.isArray(config.seo.keywords)) {
        formData.append('keywords', config.seo.keywords.join('\n'));
      }
      if (config.seo?.twitterHandle) formData.append('twitter', config.seo.twitterHandle);
      if (config.seo?.country) formData.append('country', config.seo.country);
      
      // Theme Colors - Submit individually
      if (config.theme?.colors) {
        formData.append('primaryColor', config.theme.colors.primaryColor || '#c41e3a');
        formData.append('secondaryColor', config.theme.colors.secondaryColor || '#666666');
        formData.append('accentColor', config.theme.colors.accentColor || '#c41e3a');
        if (config.theme.colors.backgroundColor) formData.append('backgroundColor', config.theme.colors.backgroundColor);
        if (config.theme.colors.textColor) formData.append('textColor', config.theme.colors.textColor);
      }

      if (logoFile) formData.append('logoFile', logoFile);
      if (faviconFile) formData.append('faviconFile', faviconFile);
      if (heroImageFile) formData.append('heroImageFile', heroImageFile);

      const response = await ApiService.updateBrand(slug, formData);
      
      // Debug: Log response
      console.log('Backend response:', response);
      
      const preview = response.preview || response.brand || null;
      return {
        brand: preview,
        config: response.config || null,
        message: response.message,
        success: response.success !== false
      };
    } catch (error) {
      console.error('Failed to update brand:', error);
      throw error;
    }
  },

  /**
   * Delete brand
   */
  async deleteBrand(slug) {
    try {
      return await ApiService.deleteBrand(slug);
    } catch (error) {
      console.error('Failed to delete brand:', error);
      throw error;
    }
  },

  /**
   * Upload inventory for a brand
   */
  async uploadInventory(slug, inventoryFile) {
    try {
      if (!slug || !inventoryFile) {
        throw new Error('Brand slug and inventory file are required');
      }

      console.log(`Uploading inventory for brand: ${slug}, file: ${inventoryFile.name}`);

      const formData = new FormData();
      formData.append('inventory', inventoryFile);

      const response = await ApiService.uploadInventory(slug, formData);
      console.log('Inventory upload response:', response);
      return response;
    } catch (error) {
      console.error(`Failed to upload inventory for brand ${slug}:`, error);
      throw error;
    }
  },

  /**
   * Calculate dashboard statistics from brands
   */
  calculateStats(brands) {
    const stats = {
      total: brands.length,
      active: brands.filter(b => b.is_active !== false).length,
      withDomain: brands.filter(b => {
        const domain = b.domain || '';
        return domain.trim() !== '';
      }).length
    };

    return stats;
  },

  /**
   * Search brands by name or slug
   */
  searchBrands(brands, query) {
    const lowerQuery = query.toLowerCase();
    return brands.filter(brand => 
      brand.name?.toLowerCase().includes(lowerQuery) ||
      brand.slug?.toLowerCase().includes(lowerQuery) ||
      brand.tagline?.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Sort brands
   */
  sortBrands(brands, sortBy = 'name', order = 'asc') {
    const sorted = [...brands].sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      // Handle nested properties
      if (sortBy.includes('.')) {
        valueA = this.getNestedValue(a, sortBy);
        valueB = this.getNestedValue(b, sortBy);
      }

      if (valueA === valueB) return 0;
      if (order === 'asc') {
        return valueA < valueB ? -1 : 1;
      } else {
        return valueA > valueB ? -1 : 1;
      }
    });

    return sorted;
  },

  /**
   * Get nested object value
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  },

  /**
   * Filter brands by criteria
   */
  filterBrands(brands, filters = {}) {
    return brands.filter(brand => {
      // Filter by active status
      if (filters.active !== undefined && brand.is_active !== filters.active) {
        return false;
      }

      // Filter by domain existence
      if (filters.hasDomain !== undefined) {
        const hasDomain = !!(brand.domain && brand.domain.trim());
        if (hasDomain !== filters.hasDomain) {
          return false;
        }
      }

      // Filter by color
      if (filters.color && brand.theme?.colors?.accentPrimary !== filters.color) {
        return false;
      }

      return true;
    });
  },

  /**
   * Get brand statistics by field
   */
  getStatsByField(brands, field) {
    const stats = {};
    brands.forEach(brand => {
      const value = this.getNestedValue(brand, field);
      stats[value] = (stats[value] || 0) + 1;
    });
    return stats;
  },

  /**
   * Format brand data for display
   */
  formatBrandForDisplay(brand) {
    return {
      ...brand,
      displayName: brand.name || 'Unnamed Brand',
      displayLocation: `${brand.location?.city || 'Unknown'}${brand.location?.county ? ', ' + brand.location.county : ''}`,
      displayDomain: brand.domain?.replace('http://', '').replace('https://', '') || 'Not set',
      primaryColor: brand.theme?.colors?.accentPrimary || brand.primary_color || '#c41e3a',
      isActive: brand.is_active !== false
    };
  }
};

export default BrandService;
