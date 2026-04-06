/**
 * Form Handler Module
 * Handles form validation, submission, and field management
 */

export const FormHandler = {
  /**
   * Convert HEX to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  },

  /**
   * Convert HEX to RGBA
   */
  hexToRgba(hex, alpha) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;
  },

  /**
   * Normalize mixed checkbox/string values to boolean
   */
  parseBooleanFlag(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return ['1', 'true', 'yes', 'on'].includes(normalized);
    }
    return false;
  },

  /**
   * Validate required fields in a form step
   */
  validateStep(stepElement) {
    const requiredFields = stepElement.querySelectorAll('[required]');
    let isValid = true;
    const missingFields = [];

    requiredFields.forEach(field => {
      // For file inputs, check if a file is selected
      if (field.type === 'file') {
        if (!field.files || field.files.length === 0) {
          isValid = false;
          field.classList.add('error');
          
          // Also add error class to parent file-upload-area
          const uploadArea = field.closest('.file-upload-area');
          if (uploadArea) {
            uploadArea.classList.add('error');
          }
          
          const label = field.closest('.form-group')?.querySelector('label')?.textContent?.replace(' *', '') || field.name;
          missingFields.push(label);
          
          field.addEventListener('change', () => {
            field.classList.remove('error');
            if (uploadArea) {
              uploadArea.classList.remove('error');
            }
          }, { once: true });
        } else {
          field.classList.remove('error');
          const uploadArea = field.closest('.file-upload-area');
          if (uploadArea) {
            uploadArea.classList.remove('error');
          }
        }
      } else if (!field.value.trim()) {
        // For text inputs
        isValid = false;
        field.classList.add('error');
        
        const label = field.closest('.form-group')?.querySelector('label')?.textContent?.replace(' *', '') || field.name;
        missingFields.push(label);
        
        field.addEventListener('input', () => {
          field.classList.remove('error');
        }, { once: true });
      } else {
        field.classList.remove('error');
      }
    });

    // Special validation for step 3 (keywords)
    const stepNumber = stepElement.dataset.step;
    if (stepNumber === '3') {
      const keywordsInput = document.getElementById('keywordsInput');
      const keywordsArray = window.brandStudio?.keywords || [];
      
      const hasKeywordsArray = keywordsArray.length > 0;
      const hasKeywordsInput = keywordsInput && keywordsInput.value.trim().length > 0;
      
      if (!hasKeywordsArray && !hasKeywordsInput) {
        isValid = false;
        missingFields.push('Keywords');
      }
    }

    return { isValid, missingFields };
  },

  /**
   * Get all form data
   */
  getFormData(form) {
    const data = {};
    const allFields = form.querySelectorAll('input, select, textarea');
    
    allFields.forEach(field => {
      if (field.name && field.type !== 'file') {
        if (field.type === 'checkbox' || field.type === 'radio') {
          data[field.name] = field.checked;
        } else {
          data[field.name] = field.value;
        }
      }
    });
    
    return data;
  },

  /**
   * Populate form fields from data object
   */
  populateForm(form, data = {}) {
    if (!form) return;
    Object.keys(data).forEach(key => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === 'file') {
          return;
        }
        
        if (field.type === 'checkbox' || field.type === 'radio') {
          field.checked = this.parseBooleanFlag(data[key]);
        } else {
          field.value = data[key];
        }
        
        if (key === 'name') {
          field.dispatchEvent(new Event('input'));
        }
      }
    });
  },

  /**
   * Reset form to initial state
   */
  resetForm(form) {
    form.reset();
    form.querySelectorAll('.error').forEach(field => {
      field.classList.remove('error');
    });
  },

  /**
   * Clear all form errors
   */
  clearErrors(form) {
    form.querySelectorAll('.error').forEach(field => {
      field.classList.remove('error');
    });
  },

  /**
   * Show field error
   */
  showFieldError(field, message) {
    field.classList.add('error');
    field.title = message;
  },

  /**
   * Create brand config object from form data
   */
  createBrandConfig(formData, slug, keywords) {
    // Ensure domain has protocol
    let domain = formData.domain || '';
    if (domain && !domain.startsWith('http://') && !domain.startsWith('https://')) {
      domain = 'http://' + domain;
    }

    const themeId =
      formData.themeId ||
      formData.theme_id ||
      formData?.theme?.id ||
      formData?.theme?.themeId ||
      'classic-dealer';
    const aaApprovedDealer = this.parseBooleanFlag(
      formData.aaApprovedDealer ?? formData.aa_approved_dealer
    );

    // Build opening hours object
    const openingHours = {
      monday: formData.mondayHours || '09:00 - 18:00',
      tuesday: formData.tuesdayHours || '09:00 - 18:00',
      wednesday: formData.wednesdayHours || '09:00 - 18:00',
      thursday: formData.thursdayHours || '09:00 - 18:00',
      friday: formData.fridayHours || '09:00 - 18:00',
      saturday: formData.saturdayHours || '10:00 - 16:00',
      sunday: formData.sundayHours || 'Closed'
    };

    // Build why choose us features from form data (handle old field names)
    const whyChooseUsFeatures = [];
    // Check for new array structure first
    if (formData.whyChooseUsFeatures && Array.isArray(formData.whyChooseUsFeatures)) {
      formData.whyChooseUsFeatures.forEach((feature, index) => {
        if (feature.title && feature.description) {
          whyChooseUsFeatures.push({
            id: `feature-${index + 1}`,
            title: feature.title,
            description: feature.description
          });
        }
      });
    } else {
      // Fallback to old field names (feature0Title, feature0Description, etc.)
      for (let i = 0; i < 10; i++) {
        const title = formData[`feature${i}Title`];
        const description = formData[`feature${i}Description`];
        if (title && description) {
          whyChooseUsFeatures.push({
            id: `feature-${i + 1}`,
            title: title,
            description: description
          });
        }
      }
    }

    // Build services from form data (handle old field names)
    const services = {
      title: formData.servicesTitle || 'Our Services',
      items: []
    };
    
    // Check for new array structure first
    if (formData.services && Array.isArray(formData.services)) {
      formData.services.forEach(service => {
        if (service.title && service.description) {
          services.items.push({
            title: service.title,
            description: service.description
          });
        }
      });
    } else {
      // Fallback to old field names (service0Title, service0Description, etc.)
      for (let i = 0; i < 10; i++) {
        const title = formData[`service${i}Title`];
        const description = formData[`service${i}Description`];
        if (title && description) {
          services.items.push({
            title: title,
            description: description
          });
        }
      }
    }

    if (services.items.length === 0) {
      services.items = [
        {
          title: 'Finance Options',
          description: 'Flexible finance plans to suit your needs.'
        },
        {
          title: 'Car Sales',
          description: 'Buy quality used cars from our dealership.'
        },
        {
          title: 'Part Exchange',
          description: 'Trade in your old car for a great deal.'
        }
      ];
    }

    // Build testimonials from form data (handle old field names)
    const testimonials = [];
    // Check for new array structure first
    if (formData.testimonials && Array.isArray(formData.testimonials)) {
      formData.testimonials.forEach(testimonial => {
        if (testimonial.customer && testimonial.text) {
          testimonials.push({
            name: testimonial.customer,
            date: new Date().toISOString().split('T')[0],
            rating: parseInt(testimonial.rating) || 5,
            platform: 'Google',
            review: testimonial.text
          });
        }
      });
    } else {
      // Fallback to old field names (testimonial0Customer, testimon0Text, etc.)
      for (let i = 0; i < 10; i++) {
        const customer = formData[`testimonial${i}Customer`];
        const text = formData[`testimonial${i}Text`];
        const rating = formData[`testimonial${i}Rating`];
        if (customer && text) {
          testimonials.push({
            name: customer,
            date: new Date().toISOString().split('T')[0],
            rating: parseInt(rating) || 5,
            platform: 'Google',
            review: text
          });
        }
      }
    }

    // Build FAQ from form data (handle old field names)
    const faq = [];
    // Check for new array structure first
    if (formData.faqs && Array.isArray(formData.faqs)) {
      formData.faqs.forEach(item => {
        if (item.question && item.answer) {
          faq.push({
            question: item.question,
            answer: item.answer
          });
        }
      });
    } else {
      // Fallback to old field names (faq0Question, faq0Answer, etc.)
      for (let i = 0; i < 10; i++) {
        const question = formData[`faq${i}Question`];
        const answer = formData[`faq${i}Answer`];
        if (question && answer) {
          faq.push({
            question: question,
            answer: answer
          });
        }
      }
    }

    return {
      // ====== Identity ======
      slug: slug,
      name: formData.name,
      tagline: formData.tagline,
      domain: domain,
      themeId: themeId,
      aaApprovedDealer: aaApprovedDealer,
      heroImage: formData.heroImageFile ? `/images/${slug}-hero-bg.png` : '/images/hero-bg.png',
      
      // ====== Contact & Location ======
      location: {
        address: {
          line1: formData.address1,
          city: formData.city,
          county: formData.county || '',
          postcode: formData.postcode
        },
        phone: formData.phone,
        email: formData.email,
        fullAddress: `${formData.address1}, ${formData.city}, ${formData.postcode}`
      },
      
      // ====== Social Links ======
      socialLinks: {
        facebook: formData.facebook || '',
        instagram: formData.instagram || '',
        youtube: formData.youtube || '',
        linkedin: formData.linkedin || ''
      },
      
      // ====== Opening Hours ======
      openingHours: openingHours,
      
      // ====== About & Description ======
      aboutUs: {
        title: formData.aboutTitle || `About ${formData.name}`,
        headline: formData.aboutHeadline || `Your trusted car dealership in ${formData.city || 'your area'}`,
        description: formData.aboutDescription || ''
      },
      
      // ====== Why Choose Us ======
      whyChooseUs: {
        title: formData.whyChooseUsTitle || `Why Choose ${formData.name}?`,
        features: whyChooseUsFeatures
      },
      
      // ====== Services ======
      services: services,
      
      // ====== Testimonials ======
      testimonials: testimonials,
      
      // ====== FAQ ======
      faq: faq,
      
      // ====== SEO ======
      seo: {
        title: formData.seoTitle || `${formData.name} - Used Cars in ${formData.city}`,
        description: formData.seoDesc || `${formData.name} - ${formData.tagline}`,
        keywords: keywords || [],
        twitterHandle: formData.twitter || `@${slug}`,
        country: formData.country || 'UK'
      },
      
      // ====== Email ======
      email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpSecure: false,
        smtpUser: formData.email,
        smtpPass: '',
        smtpFrom: formData.email,
        smtpFromName: formData.name
      },
      
      // ====== API ======
      api: {
        inventorySyncApiKey: 'api-key-123'
      },
      
      // ====== Theme Colors (5-Color System + Legacy Compatibility) ======
      theme: {
        id: themeId,
        themeId: themeId,
        colors: {
          // Core 5 Colors (from Dashboard) - NEW SYSTEM
          primaryColor: document.getElementById('primaryHex')?.textContent || formData.primaryColor || '#c41e3a',
          secondaryColor: document.getElementById('secondaryHex')?.textContent || formData.secondaryColor || '#2c3e50',
          accentColor: document.getElementById('accentHex')?.textContent || formData.accentColor || '#e74c3c',
          backgroundColor: document.getElementById('backgroundHex')?.textContent || formData.backgroundColor || '#ffffff',
          textColor: document.getElementById('textHex')?.textContent || formData.textColor || '#1f2933',

          // Background System - LEGACY (derived from 5-color system)
          bgPrimary: '#ffffff',
          bgSecondary: '#f8f9fa',
          bgTertiary: '#e9ecef',
          bgElevated: '#ffffff',
          bgGlass: 'rgba(255, 255, 255, 0.8)',

          // Typography - LEGACY (derived from 5-color system)
          textPrimary: '#212529',
          textSecondary: '#6c757d',
          textMuted: '#adb5bd',
          textInverse: '#ffffff',

          // Brand Accents - LEGACY (derived from 5-color system)
          accentPrimary: document.getElementById('primaryHex')?.textContent || formData.primaryColor || '#c41e3a',
          accentPrimaryRgb: this.hexToRgb(document.getElementById('primaryHex')?.textContent || formData.primaryColor || '#c41e3a'),
          accentHover: document.getElementById('secondaryHex')?.textContent || formData.secondaryColor || '#2c3e50',
          accentActive: document.getElementById('accentHex')?.textContent || formData.accentColor || '#e74c3c',
          accentSoft: '#f8d7da',
          accentChrome: '#e9ecef',
          accentIvory: '#fafafa',
          accentLine: '#dee2e6',

          // Status - LEGACY
          success: '#28a745',
          warning: '#ffc107',
          danger: '#dc3545',
          info: '#17a2b8',

          // Borders - LEGACY (derived from 5-color system)
          borderSubtle: '#e9ecef',
          borderDefault: '#dee2e6',
          borderStrong: '#ced4da',
          borderAccent: document.getElementById('primaryHex')?.textContent || formData.primaryColor || '#c41e3a',

          // Forms - LEGACY (derived from 5-color system)
          fieldBg: '#ffffff',
          fieldBorder: '#ced4da',
          fieldText: '#495057'
        },
        fonts: {
          ui: 'Inter, system-ui, sans-serif',
          brand: 'Lora, serif',
          mono: 'JetBrains Mono, Consolas, monospace'
        }
      },
      
      // ====== Pages ======
      pages: {
        home: {
          hero: {
            title: `Welcome to ${formData.name}`,
            description: formData.tagline || 'Quality used cars in your area',
            cta: 'View Our Cars'
          },
          ctaBanner: {
            title: 'Find Your Perfect Car',
            description: 'Browse our selection of quality used cars'
          },
          testimonials: {
            eyebrow: 'Customer Reviews',
            heading: 'What Our Customers Say',
            description: 'Real reviews from satisfied customers'
          },
          featured: {
            title: 'Featured Vehicles',
            description: 'Check out our latest arrivals'
          }
        },
        about: {
          hero: {
            title: `About ${formData.name}`,
            description: `Your trusted car dealership in ${formData.city || 'your area'}`
          },
          story: {
            title: 'Our Story',
            paragraphs: [
              `${formData.name} has been serving the ${formData.city || 'local'} community since 2015.`,
              'We pride ourselves on offering quality vehicles and exceptional customer service.'
            ]
          },
          values: {
            title: 'Our Values',
            items: [
              { label: 'Quality', description: 'Only the best vehicles make it to our showroom' },
              { label: 'Integrity', description: 'Honest pricing and transparent service' },
              { label: 'Customer Service', description: 'Your satisfaction is our priority' }
            ]
          },
          cta: {
            title: 'Visit Our Showroom',
            description: 'Come see our selection of quality used cars',
            buttonText: 'Get Directions'
          }
        },
        services: {
          hero: {
            title: services.title || 'Our Services',
            description: 'Comprehensive car dealership services'
          },
          services: services.items || [],
          faqs: faq
        },
        contact: {
          hero: {
            title: 'Contact Us',
            subtitle: 'Get in touch with our team'
          },
          info: {
            phone: formData.phone || '',
            email: formData.email || '',
            address: `${formData.address1}, ${formData.city}, ${formData.postcode}`,
            hours: 'Mon-Fri: 9am-6pm, Sat: 10am-4pm, Sun: Closed'
          }
        }
      },
      
      // ====== Assets ======
      favicon: `/images/${slug}-favicon.png`,
      logo: `/images/${slug}-logo.png`
    };
  },

  /**
   * Build FormData for submission
   */
  buildSubmissionFormData(slug, config, logoFile = null, faviconFile = null, heroImageFile = null) {
    const submissionData = new FormData();
    submissionData.append('slug', slug);
    submissionData.append('config', JSON.stringify(config));

    if (logoFile && logoFile.size > 0) {
      submissionData.append('logoFile', logoFile);
    }

    if (faviconFile && faviconFile.size > 0) {
      submissionData.append('faviconFile', faviconFile);
    }

    if (heroImageFile && heroImageFile.size > 0) {
      submissionData.append('heroImageFile', heroImageFile);
    }

    return submissionData;
  },

  /**
   * Validate file
   */
  validateFile(file, fieldName, maxSize = 16 * 1024 * 1024) {
    const validTypes = {
      logoFile: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'],
      faviconFile: ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon'],
      heroImageFile: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp']
    };

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      };
    }

    if (validTypes[fieldName] && !validTypes[fieldName].includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type for ${fieldName}`
      };
    }

    return { valid: true };
  },

  /**
   * Generate slug from text
   */
  generateSlug(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w]/g, '');
  },
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  }
};

export default FormHandler;
