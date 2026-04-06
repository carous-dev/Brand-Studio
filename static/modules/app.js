/**
 * Main App Module
 * Orchestrates all functionality using modular components
 */

import { DOMUtils } from './dom-utils.js';
import { ApiService } from './api-service.js';
import { StorageService } from './storage-service.js';
import { FormHandler } from './form-handler.js';
import { BrandService } from './brand-service.js';
import { UIComponents } from './ui-components.js';
import { ColorUtils } from './color-utils.js';

// Global flag to prevent multiple instances
let isAppInitialized = false;

export class BrandStudio {
  constructor() {
    // Prevent multiple instances
    if (isAppInitialized) {
      console.warn('⚠️ BrandStudio already initialized, skipping duplicate initialization');
      return;
    }
    
    console.log('🚀 BrandStudio constructor called - initializing...');
    isAppInitialized = true;
    window.brandStudio = this;
    this.initializeElements();
    this.setupState();
    this.init();
    
    // Hide form loader after a short delay
    this.hideFormLoader();
    
    // Initialize repeaters after form loader is hidden
    setTimeout(() => {
      this.initRepeaters();
    }, 100);
  }

  initializeElements() {
    this.form = DOMUtils.getElement('brandForm');
    this.alertContainer = DOMUtils.getElement('alertContainer');
    this.outputContainer = DOMUtils.getElement('outputContainer');
    this.outputActions = DOMUtils.getElement('outputActions');
    this.copyBtn = DOMUtils.getElement('copyBtn');
    this.downloadBtn = DOMUtils.getElement('downloadBtn');
    this.copyBtn2 = DOMUtils.getElement('copyBtn2');
    this.downloadBtn2 = DOMUtils.getElement('downloadBtn2');
    this.brandPreview = DOMUtils.getElement('brandPreview');
    this.previewStatus = DOMUtils.getElement('previewStatus');
    this.brandCount = DOMUtils.getElement('brandCount');
    this.headerBrandCount = DOMUtils.getElement('headerBrandCount');
    this.brandsList = DOMUtils.getElement('brandsList');
    this.prevBtn = DOMUtils.getElement('prevBtn2');
    this.nextBtn = DOMUtils.getElement('nextBtn2');
    this.submitBtn = DOMUtils.getElement('submitBtn2');
    this.resetBtn = DOMUtils.getElement('resetBtn2');
    this.progressFill = DOMUtils.querySelector('.progress-fill');
    this.reviewContent = DOMUtils.getElement('reviewContent');
    this.searchInput = DOMUtils.getElement('brandSearchInput');
  }

  setupState() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.currentBrandData = null;
    this.currentBrandCode = '';
    this.brandCountValue = 0;
    this.brands = [];
    this.keywords = [];
    this.generatedPalette = null;
    this.isLoadingBrands = false; // Prevent duplicate API calls
    this.shouldReloadBrands = false;
    this.isEditMode = this.detectEditMode();
    this.editBrandSlug = this.extractSlugFromPath();
    this.searchTerm = '';
    this.searchDebounceTimer = null;
  }

  detectEditMode() {
    return /^\/update\/[^/]+/.test(window.location.pathname);
  }

  extractSlugFromPath() {
    const match = window.location.pathname.match(/\/update\/([^/]+)/);
    return match ? match[1] : null;
  }

  async init() {
    // Initialize services
    await StorageService.initIndexedDB();
    
    // Check if we're on a page with the form
    const isFormPage = !!this.form;
    
    // Auto-switch to create section if on /create or /update path (form pages only)
    if (isFormPage && (window.location.pathname === '/create' || this.isEditMode)) {
      this.switchSection('create');
    }

    // Setup event listeners (only on form pages)
    if (isFormPage) {
      this.setupEventListeners();
      // Restore uploaded files for persistence (only create flow)
      if (!this.isEditMode) {
        await this.restoreUploadedFiles();
      }
    }

    // Load initial data (load brands on all pages)
    await this.loadInitialData();
    this.setupDashboardSearch();

    // If in edit mode, load brand data
    if (this.isEditMode && this.editBrandSlug && isFormPage) {
      await this.loadBrandForEditing(this.editBrandSlug);
    }

    // Display initial state (only on form pages)
    if (isFormPage) {
      this.updateStepDisplay();
      this.renderKeywordChips();
    }

    // Make brandStudio globally available for onclick handlers
    window.brandStudio = this;
  }

  /**
   * Restore uploaded files from storage for persistence
   */
  async restoreUploadedFiles() {
    const fileFields = ['logoFile', 'faviconFile', 'heroImageFile', 'inventoryFile'];
    
    for (const fieldName of fileFields) {
      try {
        const storedFile = await StorageService.restoreFile(fieldName);
        if (storedFile) {
          // Create a File object from stored data
          const file = new File([storedFile.data], storedFile.name, {
            type: storedFile.type,
            lastModified: storedFile.lastModified
          });
          
          // Update the file input
          const input = DOMUtils.getElement(fieldName);
          if (input) {
            // Create a DataTransfer to simulate file selection
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            input.files = dataTransfer.files;
            
            // Trigger the file select handler to update UI
            this.handleFileSelect(input, fieldName);
            
            console.log(`✅ Restored ${fieldName} from storage`);
          }
        }
      } catch (error) {
        // If it's an index error, try to recreate the database
        if (error.name === 'NotFoundError' && error.message.includes('index')) {
          console.warn(`Index not found for ${fieldName}, attempting to recreate database...`);
          try {
            await StorageService.clearAndRecreateDB();
            // Retry the restore after database recreation
            const retryFile = await StorageService.restoreFile(fieldName);
            if (retryFile) {
              const file = new File([retryFile.data], retryFile.name, {
                type: retryFile.type,
                lastModified: retryFile.lastModified
              });
              
              const input = DOMUtils.getElement(fieldName);
              if (input) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                input.files = dataTransfer.files;
                this.handleFileSelect(input, fieldName);
                console.log(`✅ Restored ${fieldName} after database recreation`);
              }
            }
          } catch (recreateError) {
            console.warn(`Failed to recreate database for ${fieldName}:`, recreateError);
          }
        } else {
          console.warn(`Failed to restore ${fieldName}:`, error);
        }
      }
    }
  }

  setupEventListeners() {
    // Keywords input
    const keywordsInput = DOMUtils.getElement('keywordsInput');
    if (keywordsInput) {
      DOMUtils.addEventListener(keywordsInput, 'keydown', (e) => this.handleKeywordInput(e));
      DOMUtils.addEventListener(keywordsInput, 'keypress', (e) => e.key === 'Enter' && e.preventDefault());
    }

    // Form events
    if (this.form) {
      DOMUtils.addEventListener(this.form, 'submit', (e) => this.handleSubmit(e));
      DOMUtils.addEventListener(this.form, 'input', (e) => this.saveFormData(e.target));
      DOMUtils.addEventListener(this.form, 'change', (e) => this.saveFormData(e.target));
    }

    // Copy/Download buttons
    if (this.copyBtn) DOMUtils.addEventListener(this.copyBtn, 'click', () => this.copyToClipboard());
    if (this.copyBtn2) DOMUtils.addEventListener(this.copyBtn2, 'click', () => this.copyToClipboard());
    if (this.downloadBtn) DOMUtils.addEventListener(this.downloadBtn, 'click', () => this.downloadConfig());
    if (this.downloadBtn2) DOMUtils.addEventListener(this.downloadBtn2, 'click', () => this.downloadConfig());

    // Multi-step navigation
    if (this.prevBtn && this.nextBtn && this.submitBtn) {
      DOMUtils.addEventListener(this.prevBtn, 'click', () => this.previousStep());
      DOMUtils.addEventListener(this.nextBtn, 'click', () => this.nextStep());
      DOMUtils.addEventListener(this.submitBtn, 'click', (e) => this.handleSubmit(e));
    }

    // File uploads
    this.initializeFileUpload();

    // Inventory file upload
    this.initializeInventoryFileUpload();

    // Initialize color pickers
    this.initializeColorPickers();
    
    // Initialize preset colors
    this.setupPresetColors();

    // Slug generation
    this.initializeSlugGeneration();
  }

  async loadInitialData() {
    this.loadBrandCount();
    await this.loadBrands();
    this.initializeKeywordsFromInput();
    if (!this.isEditMode) {
      await this.loadSavedFormData();
    }
  }

  setupDashboardSearch() {
    if (window.location.pathname !== '/dashboard') return;

    const searchInput = this.searchInput || DOMUtils.getElement('brandSearchInput');
    if (!searchInput) return;

    const debounceMs = 350;
    const triggerSearch = (value, { immediate = false } = {}) => {
      this.searchTerm = (value || '').trim();

      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = null;
      }

      if (immediate) {
        this.setDashboardSearch(this.searchTerm);
        return;
      }

      this.searchDebounceTimer = setTimeout(() => {
        this.setDashboardSearch(this.searchTerm);
        this.searchDebounceTimer = null;
      }, debounceMs);
    };

    DOMUtils.addEventListener(searchInput, 'input', (e) => triggerSearch(e.target.value));
    DOMUtils.addEventListener(searchInput, 'search', (e) => triggerSearch(e.target.value, { immediate: true }));
    DOMUtils.addEventListener(searchInput, 'keydown', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        triggerSearch('', { immediate: true });
      }
      if (e.key === 'Enter') {
        triggerSearch(searchInput.value, { immediate: true });
      }
    });

    // Initialize value from URL if present
    const { search } = this.getDashboardPagingFromUrl();
    if (search) {
      this.searchTerm = search;
      searchInput.value = search;
    }
  }

  setDashboardSearch(term) {
    const url = new URL(window.location.href);
    if (term) {
      url.searchParams.set('q', term);
      url.searchParams.set('page', '1'); // reset to first page
    } else {
      url.searchParams.delete('q');
      url.searchParams.set('page', '1');
    }
    window.history.pushState({}, '', url);
    this.loadBrands();
  }

  switchSection(sectionName) {
    DOMUtils.querySelectorAll('.content-section').forEach(section => {
      DOMUtils.removeClass(section, 'active');
    });
    
    const targetSection = DOMUtils.getElement(`${sectionName}-section`);
    if (targetSection) {
      DOMUtils.addClass(targetSection, 'active');
    }
  }

  handleKeywordInput(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.addKeywordChip(e.target.value.trim());
      e.target.value = '';
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    DOMUtils.clear(this.alertContainer);

    // Show loading overlay
    this.showLoadingOverlay('Creating brand...');

    // Don't regenerate palette - use user's individual selections
    // Color inputs already reflect the updated palette values

    const formData = FormHandler.getFormData(this.form);
    
    // Debug: Log the actual color values being submitted
    console.log('🎨 Form submission colors:', {
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      accentColor: formData.accentColor,
      backgroundColor: formData.backgroundColor,
      textColor: formData.textColor
    });
    
    const slug = formData.slug || '';

    if (!slug) {
      this.hideLoadingOverlay();
      this.showAlert('❌ Brand slug is required', 'error');
      return;
    }

    try {
      // Debug: Log form data before submission
      console.log('Submitting form data:', formData);
      console.log('Keywords array:', this.keywords);
      
      const config = FormHandler.createBrandConfig(formData, slug, this.keywords);
      const logoFile = this.form.querySelector('[name="logoFile"]')?.files[0];
      const faviconFile = this.form.querySelector('[name="faviconFile"]')?.files[0];
      const heroImageFile = this.form.querySelector('[name="heroImageFile"]')?.files[0];
      const inventoryFile = this.form.querySelector('[name="inventoryFile"]')?.files[0];

      // Debug: Log files
      console.log('Logo file:', logoFile);
      console.log('Favicon file:', faviconFile);
      console.log('Hero image file:', heroImageFile);
      console.log('Inventory file:', inventoryFile);

      // Validate all three files are required
      if (!logoFile) {
        this.hideLoadingOverlay();
        this.showAlert('❌ Logo file is required', 'error');
        return;
      }
      if (!faviconFile) {
        this.hideLoadingOverlay();
        this.showAlert('❌ Favicon file is required', 'error');
        return;
      }
      if (!inventoryFile) {
        this.hideLoadingOverlay();
        this.showAlert('❌ Inventory file (JSON) is required', 'error');
        return;
      }

      // Validate inventory file is JSON
      if (!inventoryFile.name.endsWith('.json')) {
        this.hideLoadingOverlay();
        this.showAlert('❌ Inventory file must be a JSON file (.json extension)', 'error');
        return;
      }

      const validMimeTypes = ['application/json', 'text/plain'];
      if (inventoryFile.type && !validMimeTypes.includes(inventoryFile.type)) {
        this.hideLoadingOverlay();
        this.showAlert(`❌ Invalid inventory file type. Expected JSON, got "${inventoryFile.type}"`, 'error');
        return;
      }

      let result;
      // Always create new brand - never update existing ones
      this.updateLoadingText('Creating brand...');
      result = await BrandService.createBrand(slug, config, logoFile, faviconFile, heroImageFile);
      const createdBrand = result.brand || {};
      this.showAlert(`✅ Brand "${createdBrand.name || slug}" created successfully!`, 'success');
      this.incrementBrandCount();

      // Upload inventory (now required, so always present)
      try {
        this.updateLoadingText('Uploading inventory...');
        console.log(`Uploading inventory for brand: ${slug}`);
        await BrandService.uploadInventory(slug, inventoryFile);
        this.showAlert(`✅ Inventory uploaded successfully for "${createdBrand.name || slug}"!`, 'success');
      } catch (invError) {
        console.error('Inventory upload error:', invError);
        this.showAlert(`❌ Brand created, but inventory upload failed: ${invError.message}`, 'error');
      }

      this.currentBrandData = createdBrand;
      this.currentBrandCode = result.config;
      
      await this.loadBrands();
      this.displayOutput();
      this.displayPreview();
    } catch (error) {
      console.error('Submit error details:', error);
      console.error('Error details:', error.details);
      console.error('Error keys:', Object.keys(error));
      
      // Show detailed validation errors if available
      if (error.details && Array.isArray(error.details)) {
        const errorList = error.details.join('\n• ');
        console.error('Error list:', errorList);
        this.showAlert(`❌ Validation failed:\n• ${errorList}`, 'error');
      } else if (error.response && error.response.data && error.response.data.details) {
        const errorList = error.response.data.details.join('\n• ');
        console.error('Response error list:', errorList);
        this.showAlert(`❌ Validation failed:\n• ${errorList}`, 'error');
      } else {
        console.error('No detailed errors found');
        this.showAlert(`❌ ${error.message}`, 'error');
      }
    } finally {
      // Hide loading overlay
      this.hideLoadingOverlay();
    }
  }

  async loadBrands() {
    // Prevent duplicate calls
    if (this.isLoadingBrands) {
      console.log('🔄 loadBrands() called but already loading, scheduling reload...');
      this.shouldReloadBrands = true;
      return;
    }
    
    console.log('🔄 loadBrands() starting...');
    
    try {
      this.isLoadingBrands = true;
      const isDashboard = window.location.pathname === '/dashboard';
      if (isDashboard) {
        console.log('📊 Loading dashboard brands...');
        this.renderDashboardTableLoading();

        const { page, perPage, search } = this.getDashboardPagingFromUrl();
        this.searchTerm = search;
        if (this.searchInput) {
          this.searchInput.value = search;
        }
        console.log(`📊 Fetching brands: page=${page}, perPage=${perPage}, search="${search}"`);
        const result = await BrandService.loadBrandsPaginated(page, perPage, search);
        this.brands = result.brands;
        this.dashboardPagination = result.pagination;

        // Keep URL in sync if backend clamps the page
        if (this.dashboardPagination?.page && this.dashboardPagination.page !== page) {
          const url = new URL(window.location.href);
          url.searchParams.set('page', String(this.dashboardPagination.page));
          window.history.replaceState({}, '', url);
        }

        this.renderBrandsTable();
        return;
      }

      this.brands = await BrandService.loadBrands();
      const stats = BrandService.calculateStats(this.brands);
      UIComponents.updateDashboardStats(stats);
      this.renderBrandsTable();
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      this.isLoadingBrands = false;
      if (this.shouldReloadBrands) {
        this.shouldReloadBrands = false;
        this.loadBrands();
      }
      console.log('✅ loadBrands() completed');
    }
  }

  renderDashboardTableLoading() {
    const tbody = DOMUtils.getElement('brandsList');
    if (!tbody) return;

    const rows = Array.from({ length: 6 })
      .map(
        () => `
          <tr class="table-skeleton-row" aria-hidden="true">
            <td><div class="skeleton-line w-70"></div></td>
            <td><div class="skeleton-line w-50"></div></td>
            <td><div class="skeleton-line w-60"></div></td>
            <td><div class="skeleton-line w-55"></div></td>
            <td><div class="skeleton-line w-40"></div></td>
            <td><div class="skeleton-line w-35"></div></td>
            <td><div class="skeleton-line w-45"></div></td>
          </tr>
        `
      )
      .join('');

    tbody.classList.add('table-loading');
    tbody.innerHTML = `${rows}<tr class="table-loading-row" aria-hidden="true"><td colspan="7"><div class="table-loading-hint">Loading previews…</div></td></tr>`;

    const pager = DOMUtils.getElement('dashboardPagination');
    if (pager) {
      pager.innerHTML = '';
      pager.style.display = 'none';
    }
  }

  getDashboardPagingFromUrl() {
    const perPage = 6;
    const url = new URL(window.location.href);
    const rawPage = parseInt(url.searchParams.get('page') || '1', 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const search = (url.searchParams.get('q') || '').trim();
    return { page, perPage, search };
  }

  async loadBrandForEditing(slug) {
    try {
      this.brands = await BrandService.loadBrands();
      const brand = await BrandService.loadBrand(slug);
      
      if (!brand) {
        throw new Error(`Brand ${slug} not found`);
      }

      // Update submit button text to "Update Brand"
      if (this.submitBtn) {
        this.submitBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
            <path d="M14 5H12V3c0-.6-.4-1-1-1H7c-.6 0-1 .4-1 1v2H3c-.6 0-1 .4-1 1v8c0 .6.4 1 1 1h11c.6 0 1-.4 1-1V6c0-.6-.4-1-1-1zM7 3h4v2H7V3zm7 11H3V6h11v8z"/>
          </svg>
          Update Brand
        `;
      }

      // Clear any persisted create-only data so edit form renders from backend
      ['brandFormData', 'servicesItems', 'testimonialsItems', 'faqItems'].forEach(key => StorageService.removeLocal(key));

      // Populate form fields with brand data
      this.populateBrandForm(brand);
      
      // Show edit mode alert
      this.showAlert(`📝 Editing brand: ${brand.name}`, 'info');
    } catch (error) {
      this.showAlert(`❌ Failed to load brand for editing: ${error.message}`, 'error');
    }
  }

  populateBrandForm(brand) {
    if (!brand) {
      return;
    }

    const formValues = this.buildFormFieldsFromBrand(brand);
    FormHandler.populateForm(this.form, formValues);

    this.keywords = brand.seo?.keywords || [];
    this.updateKeywordsInput();
    this.renderKeywordChips();

    this.populateRepeaterDataFromBrand(brand);
    this.populateFeaturesFromBrand(brand.whyChooseUs?.features || []);
    this.updateColorPickersFromBrand(brand);
  }

  buildFormFieldsFromBrand(brand) {
    const address = (brand.location && brand.location.address) || {};
    const hours = brand.openingHours || {};
    const social = brand.socialLinks || {};
    const seo = brand.seo || {};
    const colors = brand.theme?.colors || {};

    const getClean = (value) => (value || '');

    return {
      name: getClean(brand.name),
      slug: getClean(brand.slug),
      slugDisplay: getClean(brand.slug),
      tagline: getClean(brand.tagline),
      domain: getClean(brand.domain),
      address1: getClean(address.line1),
      address2: getClean(address.line2),
      city: getClean(address.city || brand.location?.city),
      county: getClean(address.county),
      postcode: getClean(address.postcode || brand.location?.postcode),
      phone: getClean(address.phone || brand.location?.phone),
      email: getClean(address.email || brand.location?.email),
      facebook: getClean(social.facebook),
      instagram: getClean(social.instagram),
      youtube: getClean(social.youtube),
      linkedin: getClean(social.linkedin),
      mondayHours: getClean(hours.monday),
      tuesdayHours: getClean(hours.tuesday),
      wednesdayHours: getClean(hours.wednesday),
      thursdayHours: getClean(hours.thursday),
      fridayHours: getClean(hours.friday),
      saturdayHours: getClean(hours.saturday),
      sundayHours: getClean(hours.sunday),
      aboutTitle: getClean(brand.aboutUs?.title),
      aboutHeadline: getClean(brand.aboutUs?.headline),
      aboutDescription: getClean(brand.aboutUs?.description),
      whyChooseUsTitle: getClean(brand.whyChooseUs?.title),
      servicesTitle: getClean(brand.services?.title),
      seoTitle: getClean(seo.title),
      seoDesc: getClean(seo.description),
      twitter: getClean(seo.twitterHandle),
      country: getClean(seo.country),
      primaryColor: getClean(colors.primaryColor),
      secondaryColor: getClean(colors.secondaryColor),
      accentColor: getClean(colors.accentColor),
      backgroundColor: getClean(colors.backgroundColor),
      textColor: getClean(colors.textColor)
    };
  }

  populateRepeaterDataFromBrand(brand) {
    const services = brand.services?.items || [];
    const testimonials = brand.testimonials || [];
    const faqs = brand.faq || [];

    localStorage.setItem('servicesItems', JSON.stringify(services));
    this.loadPersistedServices();

    localStorage.setItem('testimonialsItems', JSON.stringify(testimonials));
    this.loadPersistedTestimonials();

    localStorage.setItem('faqItems', JSON.stringify(faqs));
    this.loadPersistedFaqs();
  }

  populateFeaturesFromBrand(features = []) {
    const featuresList = document.getElementById('featuresList');
    if (!featuresList) {
      return;
    }

    if (typeof window.addFeature === 'function') {
      if (typeof this.resetFeatureRepeater === 'function') {
        this.resetFeatureRepeater();
      } else {
        featuresList.innerHTML = '';
        this.featureIdx = 0;
      }
      features.forEach(feature => {
        window.addFeature(feature.title || '', feature.description || '');
      });
    }
  }

  updateColorPickersFromBrand(brand) {
    const colors = brand.theme?.colors || {};
    const colorMappings = {
      primaryColor: colors.primaryColor || brand.primary_color || '#c41e3a',
      secondaryColor: colors.secondaryColor || brand.secondary_color || '#e64153',
      accentColor: colors.accentColor || brand.accent_color || '#c41e3a',
      backgroundColor: colors.backgroundColor || brand.background_color || '#0f172a',
      textColor: colors.textColor || brand.text_color || '#f8fafc'
    };

    Object.entries(colorMappings).forEach(([colorKey, colorValue]) => {
      if (!colorValue) {
        return;
      }

      const colorType = colorKey.replace('Color', '');
      const hiddenInput = this.form.querySelector(`[name="${colorKey}"]`);
      if (hiddenInput) {
        hiddenInput.value = colorValue;
      }

      if (window.ColorUtils) {
        window.ColorUtils.updatePaletteColor(colorType, colorValue);
      }
    });
  }

  editBrand(slug) {
    /**
     * Navigate to the update page for the brand
     */
    if (!slug) {
      this.showAlert('❌ Invalid brand slug', 'error');
      return;
    }
    
    window.location.href = `/update/${slug}`;
  }

  confirmDeleteBrand(slug) {
    /**
     * Show a confirmation dialog before deleting
     * This is called from the table actions
     */
    if (!slug) {
      this.showAlert('❌ Invalid brand slug', 'error');
      return;
    }

    // Find brand name for the confirmation message
    const brand = this.brands.find(b => b.slug === slug);
    const brandName = brand ? brand.name : slug;

    // Create confirmation modal
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h2>Delete Brand</h2>
          <button class="modal-close" data-close>&times;</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>${UIComponents.escapeHtml(brandName)}</strong>?</p>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
            This action will:
          </p>
          <ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: var(--text-secondary); font-size: 0.9rem;">
            <li>Remove the preview configuration from the database</li>
            <li>Delete uploaded logo/favicon images (if present)</li>
            <li>Delete the brand inventory file (if present)</li>
          </ul>
          <p style="color: #d32f2f; font-weight: 500; margin-top: 1rem;">
            ⚠️ This action cannot be undone.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" data-cancel>Cancel</button>
          <button class="btn-danger" data-confirm>Delete Brand</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle close button
    const closeBtn = modal.querySelector('[data-close]');
    const cancelBtn = modal.querySelector('[data-cancel]');
    const confirmBtn = modal.querySelector('[data-confirm]');
    const backdrop = modal.querySelector('.modal-backdrop');

    const closeModal = () => {
      modal.remove();
    };

    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    confirmBtn.addEventListener('click', async () => {
      closeModal();
      await this.deleteBrand(slug);
    });
  }

  async deleteBrand(slug) {
    // Show loading overlay
    this.showLoadingOverlay('Deleting brand...');

    try {
      await BrandService.deleteBrand(slug);
      this.showAlert('🗑️ Brand deleted successfully!', 'success');
      
      this.brandCountValue = Math.max(0, this.brandCountValue - 1);
      UIComponents.updateBrandCount(this.brandCountValue);
      StorageService.setLocal('brandCount', this.brandCountValue);
      
      await this.loadBrands();
      
      if (this.currentBrandData?.slug === slug) {
        this.resetForm();
      }
    } catch (error) {
      this.showAlert(`❌ Failed to delete brand: ${error.message}`, 'error');
    } finally {
      // Hide loading overlay
      this.hideLoadingOverlay();
    }
  }

  nextStep() {
    const validation = FormHandler.validateStep(
      DOMUtils.querySelector(`.form-step[data-step="${this.currentStep}"]`)
    );
    
    if (validation.isValid) {
      if (this.currentStep < this.totalSteps) {
        // Handle the 3.5 step transition
        if (this.currentStep === 3) {
          this.currentStep = 3.5;
        } else if (this.currentStep === 3.5) {
          this.currentStep = 4;
        } else {
          this.currentStep++;
        }
        this.updateStepDisplay();
        this.updateReviewSummary();
      }
    } else {
      const message = validation.missingFields.length === 1
        ? `❌ Please fill in: ${validation.missingFields[0]}`
        : `❌ Please fill in: ${validation.missingFields.join(', ')}`;
      this.showAlert(message, 'error');
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      // Handle the 3.5 step transition
      if (this.currentStep === 4) {
        this.currentStep = 3.5;
      } else if (this.currentStep === 3.5) {
        this.currentStep = 3;
      } else {
        this.currentStep--;
      }
      this.updateStepDisplay();
    }
  }

  updateStepDisplay() {
    DOMUtils.querySelectorAll('.form-step').forEach(step => {
      DOMUtils.removeClass(step, 'active');
    });
    DOMUtils.addClass(
      DOMUtils.querySelector(`.form-step[data-step="${this.currentStep}"]`),
      'active'
    );

    DOMUtils.querySelectorAll('.progress-step').forEach(step => {
      const stepNum = parseFloat(step.dataset.step);
      DOMUtils.removeClass(step, 'active');
      DOMUtils.removeClass(step, 'previous');
      
      if (stepNum <= this.currentStep) {
        DOMUtils.addClass(step, 'active');
        if (stepNum < this.currentStep) {
          DOMUtils.addClass(step, 'previous');
        }
      }
    });

    if (this.progressFill) {
      // Calculate progress based on actual step positions (1, 2, 3, 3.5, 4)
      let progressPercentage;
      if (this.currentStep === 1) progressPercentage = 0;
      else if (this.currentStep === 2) progressPercentage = 25;
      else if (this.currentStep === 3) progressPercentage = 50;
      else if (this.currentStep === 3.5) progressPercentage = 75;
      else if (this.currentStep === 4) progressPercentage = 100;
      else progressPercentage = 0;
      
      this.progressFill.style.width = `${progressPercentage}%`;
    }

    if (this.prevBtn) DOMUtils.toggle(this.prevBtn, this.currentStep > 1);
    if (this.nextBtn) DOMUtils.toggle(this.nextBtn, this.currentStep < this.totalSteps);
    if (this.submitBtn) DOMUtils.toggle(this.submitBtn, this.currentStep === this.totalSteps);

    DOMUtils.scrollIntoView(this.form, { behavior: 'smooth', block: 'start' });
  }

  updateReviewSummary() {
    if (!this.reviewContent) return;

    const formData = FormHandler.getFormData(this.form);
    const accentColor = formData.accentColor || '#c41e3a';
    
    const reviewHTML = `
      <div class="review-grid">
        <div class="review-item">
          <strong>Brand Name:</strong> ${formData.name || 'Not provided'}
        </div>
        <div class="review-item">
          <strong>Tagline:</strong> ${formData.tagline || 'Not provided'}
        </div>
        <div class="review-item">
          <strong>Domain:</strong> ${formData.domain || 'Not provided'}
        </div>
        <div class="review-item">
          <strong>Location:</strong> ${formData.city || 'Not provided'}, ${formData.postcode || 'Not provided'}
        </div>
        <div class="review-item">
          <strong>Keywords:</strong> ${this.keywords.length > 0 ? this.keywords.join(', ') : 'Not provided'}
        </div>
        <div class="review-item">
          <strong>Brand Color:</strong> 
          <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
            <div style="width: 20px; height: 20px; border-radius: 4px; background: ${accentColor}; border: 1px solid #ddd;"></div>
            ${accentColor}
          </span>
        </div>
      </div>
    `;
    
    this.reviewContent.innerHTML = reviewHTML;
  }

  displayOutput() {
    if (this.outputContainer) {
      this.outputContainer.textContent = this.currentBrandCode;
      DOMUtils.removeClass(this.outputContainer, 'placeholder-text');
    }
    if (this.outputActions) DOMUtils.show(this.outputActions, 'flex');
    if (this.copyBtn) DOMUtils.show(this.copyBtn, 'flex');
    if (this.downloadBtn) DOMUtils.show(this.downloadBtn, 'flex');

    DOMUtils.scrollIntoView(this.outputContainer, { behavior: 'smooth', block: 'nearest' });
  }

  displayPreview() {
    if (!this.currentBrandData) return;
    
    const accentColor = this.form.querySelector('#accentColor')?.value || '#c41e3a';
    UIComponents.renderBrandPreview(this.currentBrandData, accentColor, this.brandPreview);
    
    if (this.previewStatus) {
      this.previewStatus.innerHTML = '<span class="status-dot active"></span><span>Brand configured</span>';
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.currentBrandCode).then(() => {
      const btn = this.copyBtn2 || this.copyBtn;
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      }
    }).catch(() => {
      this.showAlert('❌ Failed to copy to clipboard', 'error');
    });
  }

  downloadConfig() {
    const slug = this.currentBrandData.slug;
    const filename = `${slug}.ts`;
    const blob = new Blob([this.currentBrandCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showAlert(`⬇️ Downloaded ${filename}`, 'success');
  }

  addKeywordChip(keyword) {
    if (keyword && !this.keywords.includes(keyword)) {
      this.keywords.push(keyword);
      this.renderKeywordChips();
      this.updateKeywordsInput();
      this.saveFormData();
    }
  }

  removeKeywordChip(keyword) {
    this.keywords = this.keywords.filter(k => k !== keyword);
    this.renderKeywordChips();
    this.updateKeywordsInput();
    this.saveFormData();
  }

  renderKeywordChips() {
    const container = DOMUtils.getElement('keywordsChipsContainer');
    if (container) {
      UIComponents.renderKeywordChips(this.keywords, container);
    }
  }

  updateKeywordsInput() {
    const keywordsInput = DOMUtils.getElement('keywords');
    if (keywordsInput) {
      keywordsInput.value = this.keywords.join('\n');
    }
  }

  initializeKeywordsFromInput() {
    const keywordsInput = DOMUtils.getElement('keywords');
    if (keywordsInput && keywordsInput.value) {
      this.keywords = keywordsInput.value
        .split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0);
      this.renderKeywordChips();
      keywordsInput.value = '';
    }
  }

  initializeFileUpload() {
    const fileUploadAreas = DOMUtils.querySelectorAll('.file-upload-area');
    
    fileUploadAreas.forEach(area => {
      const fieldName = area.dataset.field;
      const input = DOMUtils.getElement(fieldName);

      DOMUtils.addEventListener(area, 'click', () => {
        console.log('File upload area clicked:', fieldName);
        if (input) {
          input.click();
        } else {
          console.error('File input not found for field:', fieldName);
        }
      });
      DOMUtils.addEventListener(input, 'change', (e) => this.handleFileSelect(e.target, fieldName));

      ['dragover', 'dragleave', 'drop'].forEach(event => {
        DOMUtils.addEventListener(area, event, (e) => this.handleFileDragDrop(e, area, input, fieldName));
      });
    });
  }

  handleFileSelect(input, fieldName) {
    const file = input.files[0];
    if (!file) return;

    const validation = FormHandler.validateFile(file, fieldName);
    if (!validation.valid) {
      this.showAlert(validation.error, 'error');
      input.value = '';
      return;
    }

    // Store file with system path for persistence
    const filePath = this.getSystemFilePath(file, fieldName);
    
    const previewContainer = DOMUtils.getElement(fieldName.replace('File', 'Preview'));
    const uploadArea = DOMUtils.querySelector(`[data-field="${fieldName}"]`);
    UIComponents.renderFilePreview(file, previewContainer, uploadArea);
    
    // Store file with enhanced metadata for persistence
    StorageService.storeFile(file, fieldName, {
      systemPath: filePath,
      originalName: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      uploadTime: new Date().toISOString()
    });
  }

  /**
   * Generate system file path for persistence
   */
  getSystemFilePath(file, fieldName) {
    const timestamp = new Date().getTime();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = safeFileName.split('.').pop();
    const baseName = safeFileName.split('.').slice(0, -1).join('.');
    
    // Create a structured path based on field type
    let directory;
    switch(fieldName) {
      case 'logoFile':
        directory = 'logos';
        break;
      case 'faviconFile':
        directory = 'favicons';
        break;
      case 'heroImageFile':
        directory = 'hero-images';
        break;
      case 'inventoryFile':
        directory = 'inventory';
        break;
      default:
        directory = 'uploads';
    }
    
    return `/static/media/${directory}/${baseName}_${timestamp}.${extension}`;
  }

  handleFileDragDrop(e, area, input, fieldName) {
    e.preventDefault();
    
    if (e.type === 'dragover') {
      DOMUtils.addClass(area, 'dragover');
    } else if (e.type === 'dragleave') {
      DOMUtils.removeClass(area, 'dragover');
    } else if (e.type === 'drop') {
      DOMUtils.removeClass(area, 'dragover');
      if (e.dataTransfer.files.length > 0) {
        input.files = e.dataTransfer.files;
        this.handleFileSelect(input, fieldName);
      }
    }
  }

  initializeInventoryFileUpload() {
    const inventoryFileInput = DOMUtils.getElement('inventoryFile');
    if (!inventoryFileInput) return;

    DOMUtils.addEventListener(inventoryFileInput, 'change', (e) => {
      this.handleInventoryFileSelect(e.target);
    });
  }

  handleInventoryFileSelect(input) {
    const file = input.files[0];
    if (!file) return;

    // Strictly validate it's a JSON file - check extension and MIME type
    if (!file.name.endsWith('.json')) {
      this.showAlert('❌ Only JSON files are allowed. File must have .json extension', 'error');
      input.value = '';
      return;
    }

    // Check MIME type
    const validMimeTypes = ['application/json', 'text/plain'];
    if (file.type && !validMimeTypes.includes(file.type)) {
      this.showAlert(`❌ Invalid file type. Expected JSON file, got "${file.type}"`, 'error');
      input.value = '';
      return;
    }

    // Show file info
    const infoBox = DOMUtils.getElement('inventoryInfo') || DOMUtils.querySelector('.inventory-info');
    const fileNameDiv = DOMUtils.getElement('inventoryFileName');
    
    if (infoBox && fileNameDiv) {
      fileNameDiv.textContent = `${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
      infoBox.style.display = 'block';
    }

    // Validate JSON format
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!Array.isArray(data)) {
          throw new Error('Inventory must be a JSON array');
        }
        console.log(`✓ Valid inventory file with ${data.length} vehicles`);
      } catch (err) {
        this.showAlert(`❌ Invalid JSON format: ${err.message}. Please check your JSON file syntax`, 'error');
        input.value = '';
        if (infoBox) infoBox.style.display = 'none';
      }
    };
    reader.readAsText(file);
  }

  initializeColorPickers() {
    const primaryColorInput = DOMUtils.getElement('primaryColor');
    const primaryColorHexInput = DOMUtils.getElement('primaryColorHex');
    const primaryColorPreview = DOMUtils.getElement('primaryColorPreview');

    if (primaryColorInput) {
      // Update hex text input and preview when color picker changes
      DOMUtils.addEventListener(primaryColorInput, 'input', (e) => {
        const hexValue = e.target.value;
        if (primaryColorHexInput) primaryColorHexInput.value = hexValue;
        if (primaryColorPreview) primaryColorPreview.style.backgroundColor = hexValue;
        this.updateGeneratedPalette(hexValue);
      });
    }

    if (primaryColorHexInput) {
      // Update color picker when hex text input changes
      DOMUtils.addEventListener(primaryColorHexInput, 'input', (e) => {
        let hexValue = e.target.value;
        // Add # if missing
        if (hexValue && !hexValue.startsWith('#')) {
          hexValue = '#' + hexValue;
        }
        // Validate hex format
        if (/^#[0-9A-F]{6}$/i.test(hexValue)) {
          if (primaryColorInput) primaryColorInput.value = hexValue;
          if (primaryColorPreview) primaryColorPreview.style.backgroundColor = hexValue;
          this.updateGeneratedPalette(hexValue);
        }
      });
    }

    // Generate initial palette
    this.updateGeneratedPalette('#c41e3a');
    
    // Sync color pickers on page load
    setTimeout(() => {
      if (this.generatedPalette) {
        this.syncColorPickers(this.generatedPalette);
      }
    }, 100);
  }

  updateGeneratedPalette(primaryHex) {
    console.log('Updating palette with color:', primaryHex); // Debug log
    
    // Generate brand-safe palette from primary color
    const palette = ColorUtils.generateBrandPalette(primaryHex);
    if (!palette) {
      console.error('Failed to generate palette'); // Debug log
      return;
    }
    
    console.log('Generated palette:', palette); // Debug log

    // Update new modern palette display
    this.updateModernPaletteDisplay(palette);
    
    // Update live preview
    this.updateLivePreview(palette);

    // Store for form submission
    this.generatedPalette = palette;

    // Update hidden form inputs for submission
    DOMUtils.getElement('secondaryColor').value = palette.secondary;
    DOMUtils.getElement('accentColor').value = palette.accent;
    DOMUtils.getElement('backgroundColor').value = palette.background;
    DOMUtils.getElement('textColor').value = palette.text;

    // Sync color pickers with new palette colors
    this.syncColorPickers(palette);
  }

  syncColorPickers(palette) {
    // Update each color picker to match the palette
    const colorTypes = ['primary', 'secondary', 'accent', 'background', 'text'];
    
    colorTypes.forEach(colorType => {
      const pickerElement = DOMUtils.getElement(colorType + 'ColorPicker');
      if (pickerElement && palette[colorType]) {
        pickerElement.value = palette[colorType];
      }
    });
  }

  updateModernPaletteDisplay(palette) {
    // Update primary color
    const primaryDisplay = DOMUtils.getElement('primaryDisplay');
    const primaryHex = DOMUtils.getElement('primaryHex');
    if (primaryDisplay) primaryDisplay.style.backgroundColor = palette.primary;
    if (primaryHex) primaryHex.textContent = palette.primary;

    // Update secondary color
    const secondaryDisplay = DOMUtils.getElement('secondaryDisplay');
    const secondaryHex = DOMUtils.getElement('secondaryHex');
    if (secondaryDisplay) secondaryDisplay.style.backgroundColor = palette.secondary;
    if (secondaryHex) secondaryHex.textContent = palette.secondary;

    // Update accent color
    const accentDisplay = DOMUtils.getElement('accentDisplay');
    const accentHex = DOMUtils.getElement('accentHex');
    if (accentDisplay) accentDisplay.style.backgroundColor = palette.accent;
    if (accentHex) accentHex.textContent = palette.accent;

    // Update background color
    const backgroundDisplay = DOMUtils.getElement('backgroundDisplay');
    const backgroundHex = DOMUtils.getElement('backgroundHex');
    if (backgroundDisplay) backgroundDisplay.style.backgroundColor = palette.background;
    if (backgroundHex) backgroundHex.textContent = palette.background;

    // Update text color
    const textDisplay = DOMUtils.getElement('textDisplay');
    const textHex = DOMUtils.getElement('textHex');
    if (textDisplay) textDisplay.style.backgroundColor = palette.text;
    if (textHex) textHex.textContent = palette.text;

    // Update legacy palette display for backward compatibility
    const primarySwatch = DOMUtils.querySelector('.primary-swatch');
    const secondarySwatch = DOMUtils.querySelector('.secondary-swatch');
    const accentSwatch = DOMUtils.querySelector('.accent-swatch');
    const backgroundSwatch = DOMUtils.querySelector('.background-swatch');
    const textSwatch = DOMUtils.querySelector('.text-swatch');

    if (primarySwatch) {
      primarySwatch.style.backgroundColor = palette.primary;
      const primaryHexElement = DOMUtils.querySelector('.primary-swatch .color-hex');
      if (primaryHexElement) primaryHexElement.textContent = palette.primary;
    }
    if (secondarySwatch) {
      secondarySwatch.style.backgroundColor = palette.secondary;
      const secondaryHexElement = DOMUtils.querySelector('.secondary-swatch .color-hex');
      if (secondaryHexElement) secondaryHexElement.textContent = palette.secondary;
    }
    if (accentSwatch) {
      accentSwatch.style.backgroundColor = palette.accent;
      const accentHexElement = DOMUtils.querySelector('.accent-swatch .color-hex');
      if (accentHexElement) accentHexElement.textContent = palette.accent;
    }
    if (backgroundSwatch) {
      backgroundSwatch.style.backgroundColor = palette.background;
      const backgroundHexElement = DOMUtils.querySelector('.background-swatch .color-hex');
      if (backgroundHexElement) backgroundHexElement.textContent = palette.background;
    }
    if (textSwatch) {
      textSwatch.style.backgroundColor = palette.text;
      const textHexElement = DOMUtils.querySelector('.text-swatch .color-hex');
      if (textHexElement) textHexElement.textContent = palette.text;
    }
  }

  updateLivePreview(palette) {
    // Update CSS custom properties for live preview
    const root = document.documentElement;
    root.style.setProperty('--preview-primary', palette.primary);
    root.style.setProperty('--preview-secondary', palette.secondary);
    root.style.setProperty('--preview-accent', palette.accent);
    root.style.setProperty('--preview-background', palette.background);
    root.style.setProperty('--preview-text', palette.text);

    // Update preview components
    const previewPrimaryBtn = DOMUtils.getElement('previewPrimaryBtn');
    const previewSecondaryBtn = DOMUtils.getElement('previewSecondaryBtn');
    const previewBadge = DOMUtils.getElement('previewBadge');
    const previewLink = DOMUtils.getElement('previewLink');

    if (previewPrimaryBtn) {
      previewPrimaryBtn.style.backgroundColor = palette.primary;
    }
    if (previewSecondaryBtn) {
      previewSecondaryBtn.style.color = palette.primary;
      previewSecondaryBtn.style.borderColor = palette.primary;
    }
    if (previewBadge) {
      previewBadge.style.backgroundColor = palette.accent;
    }
    if (previewLink) {
      previewLink.style.color = palette.accent;
    }
  }

  setupPresetColors() {
    const presetColors = DOMUtils.querySelectorAll('.preset-color');
    console.log('Found preset colors:', presetColors.length); // Debug log
    
    presetColors.forEach(preset => {
      DOMUtils.addEventListener(preset, 'click', (e) => {
        e.preventDefault();
        const color = preset.getAttribute('data-color');
        console.log('Preset clicked:', color); // Debug log
        
        if (color) {
          const primaryColorInput = DOMUtils.getElement('primaryColor');
          const primaryColorHexInput = DOMUtils.getElement('primaryColorHex');
          const primaryColorPreview = DOMUtils.getElement('primaryColorPreview');
          
          if (primaryColorInput) primaryColorInput.value = color;
          if (primaryColorHexInput) primaryColorHexInput.value = color;
          if (primaryColorPreview) primaryColorPreview.style.backgroundColor = color;
          
          this.updateGeneratedPalette(color);
          
          // Add visual feedback
          this.showPresetSelected(preset);
        }
      });
    });
  }

  showPresetSelected(selectedPreset) {
    // Remove previous selection
    DOMUtils.querySelectorAll('.preset-color').forEach(preset => {
      preset.style.borderColor = 'transparent';
      preset.style.transform = 'scale(1)';
    });
    
    // Highlight selected preset
    selectedPreset.style.borderColor = 'var(--primary)';
    selectedPreset.style.transform = 'scale(1.15)';
    
    // Reset after a moment
    setTimeout(() => {
      selectedPreset.style.transform = 'scale(1.1)';
    }, 200);
  }

  initializeSlugGeneration() {
    const nameInput = DOMUtils.getElement('name');
    const slugInput = DOMUtils.getElement('slug');
    const slugDisplay = DOMUtils.getElement('slugDisplay');
    const domainInput = DOMUtils.getElement('domain');

    if (nameInput && slugInput) {
      DOMUtils.addEventListener(nameInput, 'input', (e) => {
        const slug = FormHandler.generateSlug(e.target.value);
        slugInput.value = slug;
        if (slugDisplay) slugDisplay.value = slug;
        
        // Auto-generate domain based on slug and environment
        if (domainInput && slug) {
          const domain = this.generateDomainFromSlug(slug);
          domainInput.value = domain;
        }
      });
    }
  }

  generateDomainFromSlug(slug) {
    // Detect environment based on current hostname
    const isProduction = window.location.hostname === 'carous.co.uk' || 
                        window.location.hostname.endsWith('.carous.co.uk');
    
    if (isProduction) {
      return `https://${slug}.carous.co.uk`;
    } else {
      // Local development - use .local:3000
      return `https://${slug}.local:3000`;
    }
  }

  /**
   * Validate inventory file format
   */
  validateInventoryFile(file) {
    if (!file.name.endsWith('.json')) {
      return {
        valid: false,
        error: 'Only JSON files are allowed. File must have .json extension'
      };
    }

    // Check MIME type
    const validMimeTypes = ['application/json', 'text/plain'];
    if (file.type && !validMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Expected JSON file, got "${file.type}"`
      };
    }

    return { valid: true };
  }

  saveFormData(field) {
    if (!field || !field.name) return;

    if (this.isEditMode) {
      return;
    }

    if (field.type === 'file' && field.files?.[0]) {
      StorageService.storeFile(field.files[0], field.name, {
        systemPath: this.getSystemFilePath(field.files[0], field.name),
        originalName: field.files[0].name,
        size: field.files[0].size,
        type: field.files[0].type,
        lastModified: field.files[0].lastModified,
        uploadTime: new Date().toISOString()
      });
    } else {
      const data = FormHandler.getFormData(this.form);
      data.keywords = this.keywords;
      data.currentStep = this.currentStep;
      data.savedAt = new Date().toISOString();
      
      // Also save repeater field data from localStorage
      data.servicesItems = StorageService.getLocal('servicesItems', []);
      data.testimonialsItems = StorageService.getLocal('testimonialsItems', []);
      data.faqItems = StorageService.getLocal('faqItems', []);
      
      // Debug logging for repeater fields
      const featureFields = Object.keys(data).filter(key => key.startsWith('feature'));
      const serviceFields = Object.keys(data).filter(key => key.startsWith('service'));
      const testimonialFields = Object.keys(data).filter(key => key.startsWith('testimonial'));
      const faqFields = Object.keys(data).filter(key => key.startsWith('faq'));
      
      console.log('Saving form data with all repeater fields:');
      console.log('Features:', featureFields);
      console.log('Services:', serviceFields);
      console.log('Testimonials:', testimonialFields);
      console.log('FAQs:', faqFields);
      console.log('Services Items from localStorage:', data.servicesItems);
      console.log('Testimonials Items from localStorage:', data.testimonialsItems);
      console.log('FAQ Items from localStorage:', data.faqItems);
      
      StorageService.setLocal('brandFormData', data);
    }
  }

  async loadSavedFormData() {
    if (this.isEditMode || !this.form) {
      return;
    }
    const data = StorageService.getLocal('brandFormData');
    if (!data) return;

    if (data.currentStep && data.currentStep > 1) {
      this.currentStep = data.currentStep;
      this.updateStepDisplay();
    }

    // Restore uploaded files first
    await this.restoreUploadedFiles();

    FormHandler.populateForm(this.form, data);

    if (data.keywords && Array.isArray(data.keywords)) {
      this.keywords = data.keywords;
      this.renderKeywordChips();
      this.updateKeywordsInput();
    }

    // Restore repeater fields for Why Choose Us
    this.restoreRepeaterFields(data);

    const timeAgo = FormHandler.getTimeAgo(new Date(data.savedAt));
    this.showAlert(`📝 Form data restored from ${timeAgo}`, 'info');
  }

  /**
   * Restore repeater fields from saved form data
   */
  restoreRepeaterFields(savedData) {
    // Find all feature fields in saved data
    const featureFields = Object.keys(savedData).filter(key => 
      key.startsWith('feature') && key.endsWith('Title')
    );
    
    console.log('Found saved feature fields:', featureFields); // Debug log
    console.log('All saved data keys:', Object.keys(savedData)); // Debug log
    
    if (featureFields.length > 0) {
      // Clear existing repeater items except the first one
      const featuresList = document.getElementById('featuresList');
      if (featuresList) {
        // Keep only the first item, remove others
        const items = featuresList.querySelectorAll('.repeater-item');
        console.log('Existing repeater items:', items.length); // Debug log
        items.forEach((item, index) => {
          if (index > 0) {
            item.remove();
          }
        });
        
        // Restore data to existing first item and add new ones as needed
        featureFields.forEach((fieldName, index) => {
          const featureIndex = fieldName.replace('feature', '').replace('Title', '');
          const title = savedData[fieldName];
          const description = savedData[`feature${featureIndex}Description`];
          
          console.log(`Restoring feature ${featureIndex}: title="${title}", description="${description}"`); // Debug log
          
          if (index === 0) {
            // Update the first item
            const firstTitleInput = document.querySelector('[name="feature0Title"]');
            const firstDescInput = document.querySelector('[name="feature0Description"]');
            if (firstTitleInput) {
              firstTitleInput.value = title || '';
              console.log('Updated first title input to:', firstTitleInput.value);
            }
            if (firstDescInput) {
              firstDescInput.value = description || '';
              console.log('Updated first description input to:', firstDescInput.value);
            }
          } else {
            // Add new items for additional features
            console.log(`Adding new repeater item for feature ${featureIndex}`);
            this.addRepeaterItem(featureIndex, title, description);
          }
        });
      }
    } else {
      console.log('No saved feature fields found'); // Debug log
    }
  }

  /**
   * Add a repeater item with specific data
   */
  addRepeaterItem(index, title = '', description = '') {
    const featuresList = document.getElementById('featuresList');
    const featureItem = document.createElement('div');
    featureItem.className = 'repeater-item feature-item';
    featureItem.dataset.index = index;
    featureItem.innerHTML = `
      <div class="repeater-content">
        <input type="text" name="feature${index}Title" placeholder="Feature title" class="feature-title" value="${title}">
        <textarea name="feature${index}Description" rows="2" placeholder="Feature description" class="feature-description">${description}</textarea>
      </div>
      <button type="button" class="btn btn-danger btn-sm repeater-remove" onclick="removeFeature(${index})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    featuresList.appendChild(featureItem);
    
    // Add event listeners for form data saving
    const inputs = featureItem.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        if (window.brandStudio) {
          window.brandStudio.saveFormData(e.target);
        }
      });
    });
  }

  renderBrandsTable() {
    const container = DOMUtils.getElement('brandsList');
    if (container) {
      container.classList.remove('table-loading');
      UIComponents.renderBrandsTable(this.brands, container);

      if (window.location.pathname === '/dashboard' && this.dashboardPagination) {
        this.renderDashboardPagination({
          page: this.dashboardPagination.page,
          pageSize: this.dashboardPagination.perPage,
          total: this.dashboardPagination.total,
          totalPages: this.dashboardPagination.totalPages,
        });
      }
    }
  }

  renderDashboardPagination({ page, pageSize, total, totalPages }) {
    const wrapper = DOMUtils.getElement('dashboardPagination');
    if (!wrapper) return;

    if (total <= pageSize) {
      wrapper.innerHTML = '';
      wrapper.style.display = 'none';
      return;
    }

    wrapper.style.display = 'flex';

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);

    const pages = this.buildPaginationPages(page, totalPages);

    wrapper.innerHTML = `
      <div class="pagination-info">Showing ${start}–${end} of ${total}</div>
      <div class="pagination-controls">
        <button type="button" class="btn-secondary btn-sm page-btn" data-page="${page - 1}" ${page <= 1 ? 'disabled' : ''}>Prev</button>
        ${pages
          .map((p) => {
            if (p === '...') return `<span class="ellipsis">…</span>`;
            const isActive = p === page;
            return `<button type="button" class="${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm page-btn" data-page="${p}">${p}</button>`;
          })
          .join('')}
        <button type="button" class="btn-secondary btn-sm page-btn" data-page="${page + 1}" ${page >= totalPages ? 'disabled' : ''}>Next</button>
      </div>
    `;

    if (wrapper.dataset.paginationBound !== 'true') {
      wrapper.dataset.paginationBound = 'true';

      wrapper.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-page]');
        if (!btn) return;
        if (btn.disabled) return;

        const next = parseInt(btn.dataset.page, 10);
        if (!Number.isFinite(next)) return;
        this.setDashboardPage(next);
      });

      window.addEventListener('popstate', () => {
        // Re-fetch based on URL (page/search) when navigating history
        this.loadBrands();
      });
    }
  }

  setDashboardPage(nextPage) {
    const perPage = 6;
    const totalPages = this.dashboardPagination?.totalPages || 1;
    const page = Math.min(Math.max(nextPage, 1), totalPages);
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page));
    if (this.searchTerm) {
      url.searchParams.set('q', this.searchTerm);
    } else {
      url.searchParams.delete('q');
    }
    window.history.pushState({}, '', url);

    this.loadBrands();
  }

  buildPaginationPages(current, totalPages) {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set([1, totalPages, current - 1, current, current + 1, 2, totalPages - 1]);
    const normalized = Array.from(pages)
      .filter((p) => Number.isInteger(p) && p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);

    const out = [];
    for (let i = 0; i < normalized.length; i++) {
      const p = normalized[i];
      const prev = normalized[i - 1];
      if (i > 0 && p - prev > 1) {
        out.push('...');
      }
      out.push(p);
    }
    return out;
  }

  incrementBrandCount() {
    this.brandCountValue++;
    UIComponents.updateBrandCount(this.brandCountValue);
    StorageService.setLocal('brandCount', this.brandCountValue);
  }

  loadBrandCount() {
    this.brandCountValue = StorageService.getLocal('brandCount', 0);
    UIComponents.updateBrandCount(this.brandCountValue);
  }

  resetForm() {
    this.currentStep = 1;
    this.keywords = [];
    
    DOMUtils.getElement('slug').value = '';
    DOMUtils.getElement('slugDisplay').value = '';
    
    if (this.submitBtn) {
      this.submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
          <path d="M14 5H12V3c0-.6-.4-1-1-1H7c-.6 0-1 .4-1 1v2H3c-.6 0-1 .4-1 1v8c0 .6.4 1 1 1h11c.6 0 1-.4 1-1V6c0-.6-.4-1-1-1zM7 3h4v2H7V3zm7 11H3V6h11v8z"/>
        </svg>
        Generate Preview Config
      `;
    }

    FormHandler.resetForm(this.form);
    this.renderKeywordChips();
    this.updateStepDisplay();
    StorageService.removeLocal('brandFormData');
  }

  showAlert(message, type = 'info') {
    UIComponents.showAlert(message, type, this.alertContainer);
  }

  // Repeater functionality
  initRepeaters() {
    this.initServicesRepeater();
    this.initTestimonialsRepeater();
    this.initFaqRepeater();
    this.initFeaturesRepeater();
  }

  initServicesRepeater() {
    const servicesList = document.getElementById('servicesList');
    const addServiceBtn = document.getElementById('addServiceFeatureBtn');
    let serviceIdx = 0;

    const addService = (title = '', description = '') => {
      const item = document.createElement('div');
      item.className = 'repeater-item service-item';
      item.innerHTML = `
        <div class="repeater-content">
          <input type="text" name="service${serviceIdx}Title" placeholder="Service title" class="service-title" value="${title.replace(/"/g, '&quot;')}">
          <textarea name="service${serviceIdx}Description" rows="2" placeholder="Service description" class="service-description">${description}</textarea>
        </div>
        <button type="button" class="btn btn-danger btn-sm repeater-remove">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      
      const removeBtn = item.querySelector('.repeater-remove');
      removeBtn.addEventListener('click', () => {
        item.remove();
        this.persistServices();
      });
      
      servicesList.appendChild(item);
      serviceIdx++;
      this.persistServices();
    };

    if (addServiceBtn) {
      addServiceBtn.addEventListener('click', () => addService());
    }

    this.loadPersistedServices();
  }

  initTestimonialsRepeater() {
    const testimonialsList = document.getElementById('testimonialsList');
    const addTestimonialBtn = document.getElementById('addTestimonialBtn');
    let testimonialIdx = 0;

    const addTestimonial = (customer = '', text = '', rating = '') => {
      const item = document.createElement('div');
      item.className = 'repeater-item testimonial-item';
      item.innerHTML = `
        <div class="repeater-content">
          <input type="text" name="testimonial${testimonialIdx}Customer" placeholder="Customer name" class="testimonial-customer" value="${customer.replace(/"/g, '&quot;')}">
          <textarea name="testimonial${testimonialIdx}Text" rows="2" placeholder="Customer testimonial text" class="testimonial-text">${text}</textarea>
          <input type="text" name="testimonial${testimonialIdx}Rating" placeholder="Rating (1-5)" class="testimonial-rating" value="${rating.replace(/"/g, '&quot;')}">
        </div>
        <button type="button" class="btn btn-danger btn-sm repeater-remove">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      
      const removeBtn = item.querySelector('.repeater-remove');
      removeBtn.addEventListener('click', () => {
        item.remove();
        this.persistTestimonials();
      });
      
      testimonialsList.appendChild(item);
      testimonialIdx++;
      this.persistTestimonials();
    };

    if (addTestimonialBtn) {
      addTestimonialBtn.addEventListener('click', () => addTestimonial());
    }

    this.loadPersistedTestimonials();
  }

  initFaqRepeater() {
    const faqList = document.getElementById('faqList');
    const addFaqBtn = document.getElementById('addFaqBtn');
    let faqIdx = 0;

    const addFaq = (question = '', answer = '') => {
      const item = document.createElement('div');
      item.className = 'repeater-item faq-item';
      item.innerHTML = `
        <div class="repeater-content">
          <input type="text" name="faq${faqIdx}Question" placeholder="Question" class="faq-question" value="${question.replace(/"/g, '&quot;')}">
          <textarea name="faq${faqIdx}Answer" rows="2" placeholder="Answer" class="faq-answer">${answer}</textarea>
        </div>
        <button type="button" class="btn btn-danger btn-sm repeater-remove">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      
      const removeBtn = item.querySelector('.repeater-remove');
      removeBtn.addEventListener('click', () => {
        item.remove();
        this.persistFaqs();
      });
      
      faqList.appendChild(item);
      faqIdx++;
      this.persistFaqs();
    };

    if (addFaqBtn) {
      addFaqBtn.addEventListener('click', () => addFaq());
    }

    this.loadPersistedFaqs();
  }

  initFeaturesRepeater() {
    const featuresList = document.getElementById('featuresList');
    this.featureIdx = 0;

    const addFeature = (title = '', description = '') => {
      const currentIdx = this.featureIdx++;
      const item = document.createElement('div');
      item.className = 'repeater-item feature-item';
      item.innerHTML = `
        <div class="repeater-content">
          <input type="text" name="feature${currentIdx}Title" placeholder="Feature title" class="feature-title" value="${title.replace(/"/g, '&quot;')}">
          <textarea name="feature${currentIdx}Description" rows="2" placeholder="Feature description" class="feature-description">${description}</textarea>
        </div>
        <button type="button" class="btn btn-danger btn-sm repeater-remove">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      
      const removeBtn = item.querySelector('.repeater-remove');
      removeBtn.addEventListener('click', () => {
        item.remove();
      });
      
      featuresList.appendChild(item);
    };

    window.addFeature = addFeature;
    this.resetFeatureRepeater = () => {
      this.featureIdx = 0;
      if (featuresList) {
        featuresList.innerHTML = '';
      }
    };
  }

  // Persistence methods
  persistServices() {
    const items = Array.from(document.querySelectorAll('#servicesList .service-item')).map(item => ({
      title: item.querySelector('.service-title')?.value || '',
      description: item.querySelector('.service-description')?.value || ''
    }));
    localStorage.setItem('servicesItems', JSON.stringify(items));
  }

  loadPersistedServices() {
    try {
      const persisted = JSON.parse(localStorage.getItem('servicesItems') || '[]');
      if (persisted.length) {
        const servicesList = document.getElementById('servicesList');
        if (!servicesList) return;
        servicesList.innerHTML = '';
        persisted.forEach((service) => {
          const idx = servicesList.querySelectorAll('.service-item').length;
          const item = document.createElement('div');
          item.className = 'repeater-item service-item';
          item.dataset.index = idx;
          item.innerHTML = `
        <div class="repeater-content">
          <input type="text" name="service${idx}Title" placeholder="Service title" class="service-title" value="${(service.title || '').replace(/"/g, '&quot;')}">
          <textarea name="service${idx}Description" rows="2" placeholder="Service description" class="service-description">${service.description || ''}</textarea>
        </div>
        <button type="button" class="btn btn-danger btn-sm repeater-remove">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
          item.querySelector('.repeater-remove')?.addEventListener('click', () => {
            item.remove();
            this.persistServices();
          });
          servicesList.appendChild(item);
          window.serviceIndex = idx + 1;
        });
        this.persistServices();
      }
    } catch (e) {
      console.error('Error loading persisted services:', e);
    }
  }

  persistTestimonials() {
    const items = Array.from(document.querySelectorAll('#testimonialsList .testimonial-item')).map(item => ({
      customer: item.querySelector('.testimonial-customer')?.value || '',
      text: item.querySelector('.testimonial-text')?.value || '',
      rating: item.querySelector('.testimonial-rating')?.value || ''
    }));
    localStorage.setItem('testimonialsItems', JSON.stringify(items));
  }

  loadPersistedTestimonials() {
    try {
      const persisted = JSON.parse(localStorage.getItem('testimonialsItems') || '[]');
      if (persisted.length) {
        const testimonialsList = document.getElementById('testimonialsList');
        if (!testimonialsList) return;
        testimonialsList.innerHTML = '';
        persisted.forEach((testimonial) => {
          const idx = testimonialsList.querySelectorAll('.testimonial-item').length;
          const item = document.createElement('div');
          item.className = 'repeater-item testimonial-item';
          item.dataset.index = idx;
          item.innerHTML = `
        <div class="repeater-content">
          <input type="text" name="testimonial${idx}Name" placeholder="Customer name" class="testimonial-customer" value="${(testimonial.name || testimonial.customer || '').replace(/"/g, '&quot;')}">
          <input type="text" name="testimonial${idx}Rating" placeholder="Rating (1-5)" class="testimonial-rating" value="${testimonial.rating ?? ''}">
          <textarea name="testimonial${idx}Review" rows="2" placeholder="Review text" class="testimonial-text">${testimonial.review || testimonial.text || ''}</textarea>
        </div>
        <button type="button" class="btn btn-danger btn-sm repeater-remove">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
          item.querySelector('.repeater-remove')?.addEventListener('click', () => {
            item.remove();
            this.persistTestimonials();
          });
          testimonialsList.appendChild(item);
          window.testimonialIndex = idx + 1;
        });
        this.persistTestimonials();
      }
    } catch (e) {
      console.error('Error loading persisted testimonials:', e);
    }
  }

  persistFaqs() {
    const items = Array.from(document.querySelectorAll('#faqList .faq-item')).map(item => ({
      question: item.querySelector('.faq-question')?.value || '',
      answer: item.querySelector('.faq-answer')?.value || ''
    }));
    localStorage.setItem('faqItems', JSON.stringify(items));
  }

  loadPersistedFaqs() {
    try {
      const persisted = JSON.parse(localStorage.getItem('faqItems') || '[]');
      if (persisted.length) {
        const faqList = document.getElementById('faqList');
        if (!faqList) return;
        faqList.innerHTML = '';
        persisted.forEach((faq) => {
          const idx = faqList.querySelectorAll('.faq-item').length;
          const item = document.createElement('div');
          item.className = 'repeater-item faq-item';
          item.dataset.index = idx;
          item.innerHTML = `
        <div class="repeater-content">
          <input type="text" name="faq${idx}Question" placeholder="Question" class="faq-question" value="${(faq.question || '').replace(/"/g, '&quot;')}">
          <textarea name="faq${idx}Answer" rows="2" placeholder="Answer" class="faq-answer">${faq.answer || ''}</textarea>
        </div>
        <button type="button" class="btn btn-danger btn-sm repeater-remove">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
          item.querySelector('.repeater-remove')?.addEventListener('click', () => {
            item.remove();
            this.persistFaqs();
          });
          faqList.appendChild(item);
          window.faqIndex = idx + 1;
        });
        this.persistFaqs();
      }
    } catch (e) {
      console.error('Error loading persisted FAQs:', e);
    }
  }

  // Form loader management
  hideFormLoader() {
    setTimeout(() => {
      const formLoaderOverlay = document.getElementById('formLoaderOverlay');
      if (formLoaderOverlay) {
        formLoaderOverlay.style.display = 'none';
        console.log('Form loader hidden');
      }
    }, 1200);
  }

  // Loading overlay methods
  showLoadingOverlay(text = 'Processing...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = overlay?.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = text;
    }
    if (overlay) {
      overlay.style.display = 'flex';
    }
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  updateLoadingText(text) {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = text;
    }
  }
}

// Global functions for HTML onclick handlers
window.copyHexToClipboard = function(elementId) {
  console.log('Copy hex called for:', elementId); // Debug log
  const element = document.getElementById(elementId);
  if (element) {
    const value = element.value || element.textContent;
    console.log('Copying value:', value); // Debug log
    navigator.clipboard.writeText(value).then(() => {
      // Show success feedback
      element.style.background = '#10b981';
      element.style.color = 'white';
      setTimeout(() => {
        element.style.background = '';
        element.style.color = '';
      }, 1000);
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
};

window.copyColorToClipboard = function(elementId, event) {
  // Prevent form submission
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  
  console.log('Copy color called for:', elementId); // Debug log
  const element = document.getElementById(elementId);
  if (element) {
    const colorValue = element.textContent;
    console.log('Copying color:', colorValue); // Debug log
    
    // Use modern clipboard API with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(colorValue).then(() => {
        // Show success feedback
        showCopyFeedback(element, true);
      }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback method
        fallbackCopyToClipboard(colorValue);
        showCopyFeedback(element, true);
      });
    } else {
      // Fallback for older browsers
      fallbackCopyToClipboard(colorValue);
      showCopyFeedback(element, true);
    }
  }
};

// Helper function for fallback copy method
function fallbackCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    console.log('Fallback copy successful');
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  
  document.body.removeChild(textArea);
}

// Helper function to show visual feedback
function showCopyFeedback(element, success) {
  if (success) {
    // Show success feedback
    const originalBg = element.style.background;
    const originalColor = element.style.color;
    
    element.style.background = '#10b981';
    element.style.color = 'white';
    element.style.transform = 'scale(1.05)';
    element.style.transition = 'all 0.2s ease';
    
    setTimeout(() => {
      element.style.background = originalBg;
      element.style.color = originalColor;
      element.style.transform = 'scale(1)';
    }, 1000);
  }
}

window.regeneratePalette = function() {
  console.log('Regenerate palette called'); // Debug log
  // Get current primary color and regenerate with slight variation
  const primaryColorInput = document.getElementById('primaryColor');
  if (primaryColorInput && window.brandStudio) {
    const currentColor = primaryColorInput.value;
    // Add slight variation to hue
    const hsl = ColorUtils.hexToHsl(currentColor);
    if (hsl) {
      const newHue = (hsl.h + 15) % 360;
      const newColor = ColorUtils.hslToHex(newHue, hsl.s, hsl.l);
      console.log('Regenerated color:', newColor); // Debug log
      primaryColorInput.value = newColor;
      document.getElementById('primaryColorHex').value = newColor;
      document.getElementById('primaryColorPreview').style.backgroundColor = newColor;
      window.brandStudio.updateGeneratedPalette(newColor);
    }
  }
};

window.exportPalette = function() {
  if (window.brandStudio && window.brandStudio.generatedPalette) {
    const palette = window.brandStudio.generatedPalette;
    const exportData = {
      name: 'Brand Color Palette',
      colors: {
        primary: palette.primary,
        secondary: palette.secondary,
        accent: palette.accent,
        background: palette.background,
        text: palette.text
      },
      formats: {
        hex: palette,
        css: {
          '--primary-color': palette.primary,
          '--secondary-color': palette.secondary,
          '--accent-color': palette.accent,
          '--background-color': palette.background,
          '--text-color': palette.text
        }
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brand-palette.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export default BrandStudio;

// Repeater field functions for Why Choose Us section
let featureIndex = 1;

window.addFeature = function() {
  const featuresList = document.getElementById('featuresList');
  const newIndex = featureIndex++;
  
  const featureItem = document.createElement('div');
  featureItem.className = 'repeater-item feature-item';
  featureItem.dataset.index = newIndex;
  featureItem.innerHTML = `
    <div class="repeater-content">
      <input type="text" name="feature${newIndex}Title" placeholder="Feature title" class="feature-title">
      <textarea name="feature${newIndex}Description" rows="2" placeholder="Feature description" class="feature-description"></textarea>
    </div>
    <button type="button" class="btn btn-danger btn-sm repeater-remove" onclick="removeFeature(${newIndex})">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;
  
  featuresList.appendChild(featureItem);
  
  // Add event listeners for form data saving
  const inputs = featureItem.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      if (window.brandStudio) {
        window.brandStudio.saveFormData(e.target);
      }
    });
  });
};

window.removeFeature = function(index) {
  const featureItem = document.querySelector(`[data-index="${index}"]`);
  if (featureItem) {
    featureItem.classList.add('removing');
    setTimeout(() => {
      featureItem.remove();
      // Update form data after removal
      if (window.brandStudio) {
        window.brandStudio.saveFormData();
      }
    }, 300);
  }
};
