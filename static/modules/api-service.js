/**
 * API Service Module
 * Handles all HTTP requests and API communication
 */

export const ApiService = {
  baseUrl: '/api',
  timeout: 30000,

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw {
          status: response.status,
          message: errorData.error || `HTTP ${response.status}`,
          details: errorData.details
        };
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw {
          status: 0,
          message: 'Request timeout',
          details: null
        };
      }
      
      throw error;
    }
  },

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  /**
   * POST request
   */
  async post(endpoint, body = null) {
    const options = { method: 'POST' };
    
    if (body instanceof FormData) {
      options.body = body;
    } else if (body) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }
    
    return this.request(endpoint, options);
  },

  /**
   * PUT request
   */
  async put(endpoint, body = null) {
    const options = { method: 'PUT' };
    
    if (body instanceof FormData) {
      options.body = body;
    } else if (body) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }
    
    return this.request(endpoint, options);
  },

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  /**
   * PATCH request
   */
  async patch(endpoint, body = null) {
    const options = { method: 'PATCH' };
    
    if (body instanceof FormData) {
      options.body = body;
    } else if (body) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = JSON.stringify(body);
    }
    
    return this.request(endpoint, options);
  },

  // ===== Brand API Methods =====

  /**
   * Fetch all brands
   */
  async getBrands(params = null) {
    if (params && typeof params === 'object') {
      const search = new URLSearchParams();
      if (params.page) search.set('page', String(params.page));
      if (params.per_page) search.set('per_page', String(params.per_page));
       if (params.q) search.set('q', String(params.q));
       if (params.search) search.set('q', String(params.search));
      const qs = search.toString();
      return this.get(qs ? `/brands?${qs}` : '/brands');
    }
    return this.get('/brands');
  },

  /**
   * Fetch specific brand
   */
  async getBrand(slug) {
    return this.get(`/brands/${slug}`);
  },

  /**
   * Create new brand
   */
  async createBrand(formData) {
    return this.post('/brands', formData);
  },

  /**
   * Update existing brand
   */
  async updateBrand(slug, formData) {
    return this.put(`/brands/${slug}`, formData);
  },

  /**
   * Delete brand
   */
  async deleteBrand(slug) {
    return this.delete(`/brands/${slug}`);
  },

  /**
   * Upload inventory for a brand
   */
  async uploadInventory(slug, formData) {
    return this.post(`/inventory/${slug}`, formData);
  },

  /**
   * Set error callback for UI notifications
   */
  setErrorHandler(callback) {
    this.errorHandler = callback;
  },

  /**
   * Handle and propagate errors
   */
  handleError(error) {
    if (this.errorHandler) {
      this.errorHandler(error);
    }
    throw error;
  }
};

export default ApiService;
