/**
 * DOM Utilities Module
 * Handles all DOM querying and element manipulation
 */

export const DOMUtils = {
  // Cache for frequently accessed elements
  cache: {},

  /**
   * Get element by ID with caching
   */
  getElement(id) {
    const cached = this.cache[id];
    // If we cached a node that has since been replaced/removed (e.g. via cloneNode),
    // refresh the reference so callers always get a live element.
    if (cached && document.documentElement && document.documentElement.contains(cached)) {
      return cached;
    }
    const el = document.getElementById(id);
    this.cache[id] = el;
    return el;
  },

  /**
   * Query selector with optional parent
   */
  querySelector(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * Query all matching elements
   */
  querySelectorAll(selector, parent = document) {
    return parent.querySelectorAll(selector);
  },

  /**
   * Create and configure an element
   */
  createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value;
      } else if (key === 'style') {
        Object.assign(element.style, value);
      } else if (key.startsWith('data-')) {
        element.dataset[key.slice(5)] = value;
      } else {
        element.setAttribute(key, value);
      }
    });
    
    if (content) {
      element.innerHTML = content;
    }
    
    return element;
  },

  /**
   * Add event listener with optional once flag
   */
  addEventListener(element, event, handler, once = false) {
    if (!element) return;
    element.addEventListener(event, handler, { once });
  },

  /**
   * Add multiple event listeners
   */
  addEventListeners(element, events = {}) {
    if (!element) return;
    Object.entries(events).forEach(([event, handler]) => {
      this.addEventListener(element, event, handler);
    });
  },

  /**
   * Remove event listener
   */
  removeEventListener(element, event, handler) {
    if (!element) return;
    element.removeEventListener(event, handler);
  },

  /**
   * Show element
   */
  show(element, display = 'block') {
    if (!element) return;
    element.style.display = display;
  },

  /**
   * Hide element
   */
  hide(element) {
    if (!element) return;
    element.style.display = 'none';
  },

  /**
   * Toggle element visibility
   */
  toggle(element, show = null) {
    if (!element) return;
    if (show === null) {
      element.style.display = element.style.display === 'none' ? 'block' : 'none';
    } else {
      element.style.display = show ? 'block' : 'none';
    }
  },

  /**
   * Add CSS class
   */
  addClass(element, className) {
    if (!element) return;
    element.classList.add(className);
  },

  /**
   * Remove CSS class
   */
  removeClass(element, className) {
    if (!element) return;
    element.classList.remove(className);
  },

  /**
   * Toggle CSS class
   */
  toggleClass(element, className, force = null) {
    if (!element) return;
    element.classList.toggle(className, force);
  },

  /**
   * Check if element has class
   */
  hasClass(element, className) {
    return element?.classList.contains(className) || false;
  },

  /**
   * Set multiple attributes
   */
  setAttributes(element, attributes) {
    if (!element) return;
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'class') {
        element.className = value;
      } else if (key === 'style') {
        Object.assign(element.style, value);
      } else {
        element.setAttribute(key, value);
      }
    });
  },

  /**
   * Get attribute
   */
  getAttribute(element, attribute) {
    return element?.getAttribute(attribute) || null;
  },

  /**
   * Scroll element into view
   */
  scrollIntoView(element, options = { behavior: 'smooth', block: 'nearest' }) {
    if (!element) return;
    element.scrollIntoView(options);
  },

  /**
   * Focus element
   */
  focus(element) {
    if (!element) return;
    element.focus();
  },

  /**
   * Clear child elements
   */
  clear(element) {
    if (!element) return;
    element.innerHTML = '';
  },

  /**
   * Clone element
   */
  clone(element, deep = true) {
    return element?.cloneNode(deep) || null;
  },

  /**
   * Get parent element
   */
  getParent(element) {
    return element?.parentElement || null;
  },

  /**
   * Insert HTML
   */
  insertHTML(element, html, position = 'beforeend') {
    if (!element) return;
    element.insertAdjacentHTML(position, html);
  },

  /**
   * Remove element from DOM
   */
  remove(element) {
    if (element) {
      element.remove();
    }
  },

  /**
   * Clear cache (useful for re-initialization)
   */
  clearCache() {
    this.cache = {};
  }
};

export default DOMUtils;
