/**
 * Index Module
 * Central export point for all modular components
 */

// Import all modules
export { DOMUtils, default as DOMUtilsDefault } from './dom-utils.js';
export { ApiService, default as ApiServiceDefault } from './api-service.js';
export { StorageService, default as StorageServiceDefault } from './storage-service.js';
export { FormHandler, default as FormHandlerDefault } from './form-handler.js';
export { BrandService, default as BrandServiceDefault } from './brand-service.js';
export { UIComponents, default as UIComponentsDefault } from './ui-components.js';
export { ColorUtils, default as ColorUtilsDefault } from './color-utils.js';
export { BrandStudio, default as BrandStudioDefault } from './app.js';

// Convenience re-exports
export {
  DOMUtils,
  ApiService,
  StorageService,
  FormHandler,
  BrandService,
  UIComponents,
  ColorUtils
};

// Main app class
export { BrandStudio };

/**
 * Initialize the application
 */
export async function initializeApp() {
  const { BrandStudio } = await import('./app.js');
  
  document.addEventListener('DOMContentLoaded', () => {
    const brandStudio = new BrandStudio();
    window.brandStudio = brandStudio;
    
    // Initialize sidebar
    initializeSidebar();
  });
}

/**
 * Initialize sidebar functionality
 */
function initializeSidebar() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    
    document.addEventListener('click', (e) => {
      if (window.innerWidth < 1024 && 
          sidebar.classList.contains('open') && 
          !sidebar.contains(e.target) && 
          !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
  
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      sidebar?.classList.remove('open');
    }
  });
}

/**
 * Utility function for clearing file uploads
 */
export function clearFile(fieldName) {
  const input = document.getElementById(fieldName);
  const previewId = fieldName.replace('File', 'Preview');
  const previewContainer = document.getElementById(previewId);
  const uploadArea = document.querySelector(`[data-field="${fieldName}"]`);
  const uploadContent = uploadArea?.querySelector('.file-upload-content');
  
  if (input) input.value = '';
  if (previewContainer) {
    previewContainer.style.display = 'none';
    const previewImage = previewContainer.querySelector('.preview-image');
    if (previewImage) previewImage.src = '';
  }
  if (uploadContent) uploadContent.style.display = 'flex';
}

export default {
  initializeApp,
  clearFile
};
