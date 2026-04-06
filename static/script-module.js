/**
 * Brand Studio Dashboard - Entry Point
 * Loads modularized components for better performance and maintainability
 */

// Import main app module
import { BrandStudio } from './modules/app.js';

/**
 * Initialize application when DOM is ready
 */
let brandStudio;
document.addEventListener('DOMContentLoaded', () => {
  // Create BrandStudio instance
  brandStudio = new BrandStudio();
  
  // Expose to window for inline event handlers
  window.brandStudio = brandStudio;
  
  // Initialize sidebar
  initializeSidebar();
});

/**
 * Sidebar functionality
 */
function initializeSidebar() {
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth < 1024 && 
          sidebar.classList.contains('open') && 
          !sidebar.contains(e.target) && 
          !sidebarToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      sidebar?.classList.remove('open');
    } else {
      sidebar?.classList.remove('open');
    }
  });
}

/**
 * Global function for clearing file uploads
 * Can be called from inline event handlers
 */
function clearFile(fieldName) {
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

// Expose to window for global access
window.clearFile = clearFile;

// Import and expose ColorUtils functions
import { ColorUtils } from './modules/color-utils.js';

// Expose updatePaletteColor globally for inline event handlers
window.updatePaletteColor = ColorUtils.updatePaletteColor.bind(ColorUtils);
window.updateLivePreview = ColorUtils.updateLivePreview.bind(ColorUtils);

// Initialize color picker values on page load
function initializeColorPickers() {
  const colorTypes = ['primary', 'secondary', 'accent', 'background', 'text'];
  
  colorTypes.forEach(colorType => {
    const pickerElement = document.getElementById(colorType + 'ColorPicker');
    const hexElement = document.getElementById(colorType + 'Hex');
    
    if (pickerElement && hexElement) {
      // Get the current color from the hex element text content
      const currentHex = hexElement.textContent.trim();
      
      // Set the color picker value to match the card color
      if (currentHex && currentHex.startsWith('#')) {
        pickerElement.value = currentHex;
      }
    }
  });
}

// Make color cards clickable to open color picker
function setupColorCardClickHandlers() {
  const colorTypes = ['primary', 'secondary', 'accent', 'background', 'text'];
  
  colorTypes.forEach(colorType => {
    const cardElement = document.querySelector(`.${colorType}-card`);
    const pickerElement = document.getElementById(colorType + 'ColorPicker');
    
    if (cardElement && pickerElement) {
      // Add click handler to the entire card
      cardElement.addEventListener('click', function(e) {
        // Don't trigger if clicking on the copy button or other interactive elements
        if (e.target.closest('.color-copy-btn') || 
            e.target.closest('input') || 
            e.target.closest('button')) {
          return;
        }
        
        // Open the color picker
        pickerElement.click();
      });
    }
  });
}

// Also initialize when quick start colors are clicked
function setupQuickStartListeners() {
  const presetColors = document.querySelectorAll('.preset-color');
  presetColors.forEach(button => {
    button.addEventListener('click', function() {
      // Wait a moment for the palette to update, then sync pickers
      setTimeout(initializeColorPickers, 50);
    });
  });
}

// Initialize color pickers when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initializeColorPickers();
  setupColorCardClickHandlers();
  setupQuickStartListeners();
});

export { brandStudio, clearFile };
